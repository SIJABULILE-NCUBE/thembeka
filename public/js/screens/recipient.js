// public/js/screens/recipient.js
// Grandma Moyo's view: very large text and one big button.
// In the demo I open this in a second tab or on my phone.

import { callApi, formatUsd, escapeHtml } from '../helpers.js';
import { goTo } from '../app.js';

export async function show(screenArea) {
  const sends = await callApi('/history');
  const waiting = sends.find((send) => send.recipientId === 'grandma-moyo' && !send.confirmed);

  if (!waiting) {
    screenArea.innerHTML = `
      <h1 class="center">Hello, Grandma Moyo</h1>
      <p class="center muted">No new money waiting right now.</p>
      <button class="btn btn-secondary" id="back">Back</button>
    `;
    screenArea.querySelector('#back').addEventListener('click', () => goTo('home'));
    return;
  }

  screenArea.innerHTML = `
    <h1 class="center">Hello, Grandma Moyo</h1>
    <p class="center">Tendai sent you</p>
    <p class="recipient-amount">${formatUsd(waiting.amountUsdCents)}</p>
    <p class="center muted">Reference ${escapeHtml(waiting.reference)}</p>
    <button class="btn btn-primary" id="received">Received</button>
    <div id="recipient-error" class="error" role="alert"></div>
  `;

  screenArea.querySelector('#received').addEventListener('click', async () => {
    try {
      await callApi('/send/confirm', { reference: waiting.reference });
      screenArea.innerHTML = `
        <img class="big-tick" src="img/logo.svg" alt="" />
        <h1 class="center">Thank you!</h1>
        <p class="center">Tendai can see that the money arrived.</p>
      `;
    } catch (error) {
      screenArea.querySelector('#recipient-error').textContent = error.message;
    }
  });
}
