// public/js/screens/sent.js
// After sending: shows the receipt and waits for the recipient to confirm.
// No more "did it arrive?" phone calls.

import { callApi, formatUsd, formatDate, escapeHtml } from '../helpers.js';
import { copy } from '../copy.js';
import { goTo } from '../app.js';

let checkTimer = null;

export async function show(screenArea, state) {
  clearInterval(checkTimer);

  if (!state.lastSend) {
    goTo('home');
    return;
  }

  draw(screenArea, state.lastSend);

  // I check every 3 seconds whether the recipient has tapped "Received".
  checkTimer = setInterval(async () => {
    if (window.location.hash !== '#sent') {
      clearInterval(checkTimer);
      return;
    }

    const sends = await callApi('/history');
    const latest = sends.find((item) => item.reference === state.lastSend.reference);
    if (latest && latest.confirmed) {
      state.lastSend = latest;
      clearInterval(checkTimer);
      draw(screenArea, latest);
    }
  }, 3000);
}

function draw(screenArea, send) {
  const name = escapeHtml(send.recipientName);
  const statusHtml = send.confirmed
    ? `<div class="card card-highlight"><strong>${name} confirmed</strong>: the money arrived.</div>`
    : `<div class="card"><span class="status-dot"></span>Waiting for ${name} to confirm...</div>`;

  const simulatedHtml = send.simulated ? `<p class="muted">${copy.simulatedNote}</p>` : '';

  screenArea.innerHTML = `
    <img class="big-tick" src="img/logo.svg" alt="" />
    <h1 class="center">Sent to ${name}</h1>
    <p class="recipient-amount">${formatUsd(send.amountUsdCents)}</p>
    ${statusHtml}

    <section class="card">
      <dl class="summary">
        <div class="summary-row"><dt>Reference</dt><dd>${escapeHtml(send.reference)}</dd></div>
        <div class="summary-row"><dt>Date</dt><dd>${formatDate(send.date)}</dd></div>
      </dl>
      ${simulatedHtml}
    </section>

    <button class="btn btn-primary" id="done">Done</button>
  `;

  screenArea.querySelector('#done').addEventListener('click', () => goTo('home'));
}
