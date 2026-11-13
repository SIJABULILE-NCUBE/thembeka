// src/routes/api.js
// All the API routes the screens call. Each route checks its input, runs the
// code rules and local AI, and returns simple JSON.
// Only POST /send/approve can move money, and only for a prepared send.

import express from 'express';
import { checkKyc } from '../checks/kycCheck.js';
import { checkTransfer } from '../checks/transferFlags.js';
import { checkMessageWords } from '../checks/messageWarnings.js';
import { combineResult } from '../checks/combineResult.js';
import { compareCosts } from '../money/costCompare.js';
import { getBalance, prepareUsdtTransfer, sendUsdt, getWalletMode } from '../money/wallet.js';
import { savePreparedSend, takePreparedSend, readHistory, addToHistory, markAsReceived } from '../money/sendStore.js';
import { findClosestScams } from '../ai/scamSearch.js';
import { classifyMessage } from '../ai/decision.js';
import { explainResult } from '../ai/explain.js';
import { getModelStatus } from '../ai/models.js';
import { loadProfiles, loadMessages, loadDemoRates } from '../data.js';

const router = express.Router();
const profiles = loadProfiles();
const demoRates = loadDemoRates();
const providerName = 'Demo Licensed Provider';

// ---------- Status and demo data ----------

router.get('/status', (request, response) => {
  const models = getModelStatus();
  const modelsReady = models.explainer || models.embedder || models.decider;
  response.json({ ok: true, modelsReady, models, walletMode: getWalletMode(), providerName });
});

router.get('/demo', (request, response) => {
  response.json({
    sender: profiles.tendai,
    recipients: [profiles['grandma-moyo'], profiles['unknown-sender']],
    messages: loadMessages(),
    providerName
  });
});

// ---------- KYC pre-check (on the device) ----------

router.post('/kyc/check', async (request, response) => {
  const details = request.body.details || {};
  const check = checkKyc(details, profiles.tendai.accountName);

  const fallbackText = kycFallbackText(check.result);
  const explained = await explainResult('KYC pre-check of ID details', check, fallbackText);

  response.json({ ...check, ...explained, checkedBy: 'Thembeka' });
});

// Sending to the provider is the only KYC step that needs the internet.
// In the demo the provider's answer is simulated, and the app says so.
router.post('/kyc/submit', (request, response) => {
  const details = request.body.details || {};
  const check = checkKyc(details, profiles.tendai.accountName);

  if (check.result === 'stop') {
    response.status(400).json({ error: 'Please correct your details before submitting.' });
    return;
  }

  response.json({ status: 'verified', provider: providerName, simulated: true });
});

// ---------- True-cost comparison (code only) ----------

router.post('/cost', (request, response) => {
  const amountCents = Number(request.body.amountCents);
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    response.status(400).json({ error: 'Please enter a valid amount.' });
    return;
  }

  const comparison = compareCosts(amountCents, demoRates);
  response.json({ ...comparison, summary: costSummary(comparison) });
});

// ---------- Scam and money mule check (on the device) ----------

router.post('/scam/check', async (request, response) => {
  const { recipientId, amountCents, message } = request.body;
  const transfer = { recipientId, amountCents: Number(amountCents) };

  // 1. Code rules: always run, even with no AI.
  const transferCheck = checkTransfer(transfer, profiles.tendai, readHistory());
  const messageCheck = checkMessageWords(message);
  const flags = [...transferCheck.flags, ...messageCheck.flags];

  // 2. Scam library search (embeddings) and 3. decision model.
  const closestScams = await findClosestScams(message);
  const closestScam = closestScams ? closestScams[0] : null;
  const decision = await classifyMessage(message);

  // 4. Combine everything. The AI can only make the result stricter.
  const result = combineResult({ flags, scamMatch: closestScam, decision });
  const reasons = flags.map((flag) => flag.reason);

  // 5. Plain-language explanation.
  const explained = await explainResult(
    'safety check of a request for money',
    { result, reasons },
    scamFallbackText(result)
  );

  response.json({
    result,
    reasons,
    closestScam,
    decision,
    explanation: explained.explanation,
    aiUsed: Boolean(closestScam || decision || explained.aiUsed),
    checkedBy: 'Thembeka'
  });
});

// ---------- Wallet ----------

router.get('/wallet/balance', async (request, response) => {
  try {
    response.json(await getBalance());
  } catch (error) {
    response.status(503).json({ error: error.message });
  }
});

// ---------- Send: prepare, approve, confirm ----------

router.post('/send/prepare', async (request, response) => {
  const { recipientId, amountCents, message, scamResult, kycStatus } = request.body;
  const recipient = profiles[recipientId];

  if (!recipient) {
    response.status(400).json({ error: 'Please select a recipient.' });
    return;
  }

  // I run the code rules again here, so the screen can't skip the safety check.
  const flags = [
    ...checkTransfer({ recipientId, amountCents: Number(amountCents) }, profiles.tendai, readHistory()).flags,
    ...checkMessageWords(message).flags
  ];
  const codeResult = combineResult({ flags });
  const safetyResult = stricter(codeResult, scamResult || 'pass');

  const comparison = compareCosts(Number(amountCents), demoRates);
  const thembeka = comparison.options.find((option) => option.id === 'thembeka');

  try {
    const quote = await prepareUsdtTransfer(recipient.walletAddress, thembeka.receivedUsdCents);

    const preparedId = savePreparedSend({
      recipientId,
      recipientName: recipient.accountName,
      recipientAddress: recipient.walletAddress,
      amountRandCents: Number(amountCents),
      amountUsdCents: thembeka.receivedUsdCents,
      feeRandCents: thembeka.feeCents,
      networkFeeUsdCents: quote.networkFeeUsdCents,
      safetyResult,
      kycStatus: kycStatus || 'not checked'
    });

    response.json({
      preparedId,
      recipientName: recipient.accountName,
      amountRandCents: Number(amountCents),
      amountUsdCents: thembeka.receivedUsdCents,
      feeRandCents: thembeka.feeCents,
      networkFeeUsdCents: quote.networkFeeUsdCents,
      safetyResult,
      kycStatus: kycStatus || 'not checked',
      needsConfirmation: safetyResult !== 'pass',
      simulated: Boolean(quote.simulated)
    });
  } catch (error) {
    response.status(503).json({ error: error.message });
  }
});

// The only route that moves money. It needs a prepared send, and for a
// "check first" or "stop" result, the person's own confirmation.
router.post('/send/approve', async (request, response) => {
  const { preparedId, confirmedByUser } = request.body;
  const preparedSend = takePreparedSend(preparedId);

  if (!preparedSend) {
    response.status(400).json({ error: 'This transfer has expired. Please start again.' });
    return;
  }

  if (preparedSend.safetyResult !== 'pass' && confirmedByUser !== true) {
    response.status(400).json({ error: 'Please confirm that you have verified the request with the person.' });
    return;
  }

  try {
    const sent = await sendUsdt(preparedSend.recipientAddress, preparedSend.amountUsdCents);
    const record = {
      reference: sent.reference,
      date: new Date().toISOString(),
      recipientId: preparedSend.recipientId,
      recipientName: preparedSend.recipientName,
      amountRandCents: preparedSend.amountRandCents,
      amountUsdCents: preparedSend.amountUsdCents,
      safetyResult: preparedSend.safetyResult,
      confirmed: false,
      simulated: Boolean(sent.simulated)
    };
    addToHistory(record);
    response.json(record);
  } catch (error) {
    response.status(503).json({ error: `${error.message} No funds have been sent.` });
  }
});

router.post('/send/confirm', (request, response) => {
  const send = markAsReceived(request.body.reference);
  if (!send) {
    response.status(404).json({ error: 'This transfer could not be found.' });
    return;
  }
  response.json(send);
});

router.get('/history', (request, response) => {
  response.json(readHistory());
});

// ---------- Plain-language text written by code (used when the AI is off) ----------

function kycFallbackText(result) {
  if (result === 'pass') {
    return `Your details are complete and valid. You may submit them to ${providerName} for official verification.`;
  }
  if (result === 'review') {
    return 'Your details may be submitted, but please review the points below first.';
  }
  return 'Please correct the points below before submitting your details.';
}

function scamFallbackText(result) {
  if (result === 'pass') {
    return 'No warning signs were found. If anything seems unusual, contact the person before sending.';
  }
  if (result === 'review') {
    return 'Warning signs were found. Please contact the person on a number you already know before sending.';
  }
  return 'This request matches a known scam pattern. Do not send money until you have spoken to the person on a number you already know.';
}

function costSummary(comparison) {
  const best = comparison.best;
  const second = comparison.options[1];
  const differenceCents = best.receivedUsdCents - receivedFor(second);
  return `With ${best.name}, the recipient gets ${formatUsd(best.receivedUsdCents)}. This is ${formatUsd(differenceCents)} more than the next best option (${second.name}). The fee is fixed and disclosed before you send.`;
}

function receivedFor(option) {
  if (option.feeIsFixed) {
    return option.receivedUsdCents;
  }
  return option.receivedUsdCentsMax;
}

function formatUsd(cents) {
  return '$' + (cents / 100).toFixed(2);
}

function stricter(resultOne, resultTwo) {
  const order = ['pass', 'review', 'stop'];
  if (order.indexOf(resultTwo) > order.indexOf(resultOne)) {
    return resultTwo;
  }
  return resultOne;
}

export default router;
