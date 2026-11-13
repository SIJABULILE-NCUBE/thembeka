// public/js/screens/home.js
// Home: balance, the last send and the main button to start sending.

import { callApi, formatUsd, formatRand, escapeHtml } from '../helpers.js';
import { copy } from '../copy.js';
import { goTo } from '../app.js';

export async function show(screenArea, state) {
  let balanceHtml = '<p class="muted">Balance not available right now.</p>';
  let lastSendHtml = '<p class="muted">No sends yet.</p>';

  try {
    const balance = await callApi('/wallet/balance');
    const demoLabel = balance.simulated ? '<span class="badge-demo">Demo wallet</span>' : '';
    balanceHtml = `<p class="amount">${formatUsd(balance.balanceUsdCents)} <span class="muted">USDT</span></p>${demoLabel}`;
  } catch {
    // I keep the friendly "not available" text if the wallet can't be reached.
  }

  const sends = await callApi('/history');
  if (sends.length > 0) {
    const last = sends[0];
    const status = last.confirmed ? 'Received' : 'Waiting for confirmation';
    lastSendHtml = `
      <p><strong>${escapeHtml(last.recipientName)}</strong>: ${formatUsd(last.amountUsdCents)}
      <span class="muted">(${formatRand(last.amountRandCents)})</span></p>
      <p class="muted"><span class="status-dot ${last.confirmed ? 'is-confirmed' : ''}"></span>${status}</p>
    `;
  }

  screenArea.innerHTML = `
    <h1>${copy.greeting}</h1>
    <p class="muted">Send money home safely. Every send is checked on your phone first.</p>

    <section class="card card-highlight">
      <h2>Your balance</h2>
      ${balanceHtml}
    </section>

    <section class="card">
      <h2>Last send</h2>
      ${lastSendHtml}
    </section>

    <button class="btn btn-primary" id="start-send">Send money home</button>
    <button class="btn btn-secondary" id="open-history">View history</button>
    <button class="btn btn-link" id="open-recipient">Open Grandma Moyo's view (demo)</button>
  `;

  screenArea.querySelector('#start-send').addEventListener('click', () => {
    // A new send starts fresh, but I keep a verified KYC.
    state.scamCheck = null;
    state.preparedSend = null;
    goTo(state.kycVerified ? 'cost' : 'kyc');
  });
  screenArea.querySelector('#open-history').addEventListener('click', () => goTo('history'));
  screenArea.querySelector('#open-recipient').addEventListener('click', () => goTo('recipient'));
}
