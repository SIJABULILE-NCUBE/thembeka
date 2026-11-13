// public/js/screens/approve.js
// Step 4: the human approval step. Nothing is sent until the person taps
// "Approve and send". For "Check first" and "Stop" results, they must also
// confirm they have checked with the person.

import { callApi, formatRand, formatUsd, withLoading, stepsBar, escapeHtml } from '../helpers.js';
import { copy } from '../copy.js';
import { goTo } from '../app.js';

export async function show(screenArea, state) {
  if (!state.scamCheck) {
    goTo('scam');
    return;
  }

  screenArea.innerHTML = `${stepsBar(4)}<h1>${copy.approveTitle}</h1><p class="muted">Preparing your transfer…</p>`;

  try {
    state.preparedSend = await callApi('/send/prepare', {
      recipientId: state.recipientId,
      amountCents: state.amountCents,
      message: state.message,
      scamResult: state.scamCheck.result,
      kycStatus: state.kycVerified ? 'verified' : 'not verified'
    });
  } catch (error) {
    screenArea.innerHTML += `<p class="error" role="alert">${escapeHtml(error.message)}</p>`;
    return;
  }

  const send = state.preparedSend;
  const safetyWord = copy.resultWords[send.safetyResult];
  const kycText = send.kycStatus === 'verified' ? copy.kycVerified : 'Not yet verified';

  // Extra confirmation boxes appear only when the safety check found warning signs.
  let confirmHtml = '';
  if (send.safetyResult !== 'pass') {
    confirmHtml += `
      <label class="check-row"><input type="checkbox" id="confirm-called" />
        <span>${copy.confirmCalled}</span></label>
    `;
  }
  if (send.safetyResult === 'stop') {
    confirmHtml += `
      <label class="check-row"><input type="checkbox" id="confirm-still" />
        <span>${copy.confirmStillSend}</span></label>
    `;
  }

  screenArea.innerHTML = `
    ${stepsBar(4)}
    <h1>${copy.approveTitle}</h1>

    <section class="card">
      <dl class="summary">
        <div class="summary-row"><dt>Recipient</dt><dd>${escapeHtml(send.recipientName)}</dd></div>
        <div class="summary-row"><dt>Amount paid</dt><dd>${formatRand(send.amountRandCents)}</dd></div>
        <div class="summary-row"><dt>Thembeka fee (fixed)</dt><dd>${formatRand(send.feeRandCents)}</dd></div>
        <div class="summary-row"><dt>Amount received</dt><dd class="amount-small">${formatUsd(send.amountUsdCents)} USDT</dd></div>
        <div class="summary-row"><dt>Safety check</dt><dd>${safetyWord}</dd></div>
        <div class="summary-row"><dt>Identity verification</dt><dd>${kycText}</dd></div>
      </dl>
    </section>

    ${confirmHtml}
    <p class="muted">${copy.approveWarning}</p>

    <button class="btn ${send.safetyResult === 'stop' ? 'btn-danger' : 'btn-primary'}" id="approve-button">Approve and send</button>
    <button class="btn btn-link" id="cancel">Cancel</button>
    <div id="approve-error" class="error" role="alert"></div>
  `;

  const approveButton = screenArea.querySelector('#approve-button');
  const boxes = [...screenArea.querySelectorAll('.check-row input')];

  // The button stays off until every confirmation box is ticked.
  function updateButton() {
    approveButton.disabled = !boxes.every((box) => box.checked);
  }
  boxes.forEach((box) => box.addEventListener('change', updateButton));
  updateButton();

  approveButton.addEventListener('click', async () => {
    try {
      await withLoading(approveButton, 'Sending…', async () => {
        state.lastSend = await callApi('/send/approve', {
          preparedId: send.preparedId,
          confirmedByUser: boxes.length > 0
        });
      });
      state.scamCheck = null;
      state.message = '';
      goTo('sent');
    } catch (error) {
      screenArea.querySelector('#approve-error').textContent = error.message;
    }
  });

  screenArea.querySelector('#cancel').addEventListener('click', () => goTo('home'));
}
