// public/js/screens/history.js
// Every send, newest first, with whether the recipient confirmed it.

import { callApi, formatUsd, formatRand, formatDate, escapeHtml } from '../helpers.js';
import { copy } from '../copy.js';
import { goTo } from '../app.js';

export async function show(screenArea) {
  const sends = await callApi('/history');

  let listHtml = '<p class="muted">No sends yet.</p>';
  if (sends.length > 0) {
    listHtml = sends.map((send) => {
      const status = send.confirmed ? 'Received' : 'Waiting';
      return `
        <div class="history-item">
          <div>
            <strong>${escapeHtml(send.recipientName)}</strong><br />
            <span class="muted">${formatDate(send.date)}</span><br />
            <span class="muted">Safety check: ${copy.resultWords[send.safetyResult]}</span>
          </div>
          <div style="text-align:right">
            <span class="amount-small">${formatUsd(send.amountUsdCents)}</span><br />
            <span class="muted">${formatRand(send.amountRandCents)}</span><br />
            <span class="muted"><span class="status-dot ${send.confirmed ? 'is-confirmed' : ''}"></span>${status}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  screenArea.innerHTML = `
    <h1>History</h1>
    <section class="card">${listHtml}</section>
    <button class="btn btn-secondary" id="back">Back home</button>
  `;

  screenArea.querySelector('#back').addEventListener('click', () => goTo('home'));
}
