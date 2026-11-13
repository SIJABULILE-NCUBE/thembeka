// public/js/screens/cost.js
// Step 2: who to send to, how much, and what they will actually receive with
// each way of sending. All the maths is done by the server, in code.

import { callApi, formatRandShort, formatUsd, withLoading, stepsBar, escapeHtml } from '../helpers.js';
import { copy } from '../copy.js';
import { goTo } from '../app.js';

export async function show(screenArea, state) {
  const recipientOptions = state.demo.recipients.map((person) => {
    const selected = person.id === state.recipientId ? 'selected' : '';
    return `<option value="${person.id}" ${selected}>${escapeHtml(person.accountName)}</option>`;
  });

  screenArea.innerHTML = `
    ${stepsBar(2)}
    <h1>How much are you sending?</h1>

    <form id="cost-form" class="card" novalidate>
      <div class="field">
        <label class="label" for="recipient">Send to</label>
        <select class="select" id="recipient">${recipientOptions.join('')}</select>
      </div>
      <div class="field">
        <label class="label" for="amount">Amount in rand</label>
        <input class="input" id="amount" type="number" inputmode="decimal" min="1" step="1"
          value="${state.amountCents / 100}" />
      </div>
      <button class="btn btn-primary" type="submit" id="compare-button">Compare the true cost</button>
      <div id="cost-error" class="error" role="alert"></div>
    </form>

    <div id="cost-result"></div>
  `;

  const form = screenArea.querySelector('#cost-form');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    state.recipientId = screenArea.querySelector('#recipient').value;
    state.amountCents = Math.round(Number(screenArea.querySelector('#amount').value) * 100);

    const errorArea = screenArea.querySelector('#cost-error');
    errorArea.textContent = '';

    try {
      const button = screenArea.querySelector('#compare-button');
      await withLoading(button, 'Working it out...', async () => {
        state.costComparison = await callApi('/cost', { amountCents: state.amountCents });
      });
      showComparison(screenArea, state);
    } catch (error) {
      errorArea.textContent = error.message;
    }
  });

  if (state.costComparison) {
    showComparison(screenArea, state);
  }
}

function showComparison(screenArea, state) {
  const comparison = state.costComparison;

  const rows = comparison.options.map((option) => {
    const isBest = option.id === comparison.best.id;
    let feeText = formatRandShort(option.feeCents ?? 0);
    let receivedText = formatUsd(option.receivedUsdCents ?? 0);
    let warning = '';

    // Ranges go on two lines so the table fits on a small phone.
    if (!option.feeIsFixed) {
      feeText = `${formatRandShort(option.feeMinCents)}<br />to ${formatRandShort(option.feeMaxCents)}`;
      receivedText = `${formatUsd(option.receivedUsdCentsMin)}<br />to ${formatUsd(option.receivedUsdCentsMax)}`;
      warning = `<span class="warning">${escapeHtml(option.warning)}</span>`;
    }

    const noReceipt = option.receipt ? '' : '<span class="warning">No receipt</span>';

    return `
      <tr class="${isBest ? 'is-best' : ''}">
        <td><strong>${escapeHtml(option.name)}</strong><br /><span class="muted">${escapeHtml(option.arrives)}</span>${warning}${noReceipt}</td>
        <td class="number">${feeText}</td>
        <td class="number">${receivedText}</td>
      </tr>
    `;
  });

  screenArea.querySelector('#cost-result').innerHTML = `
    <section class="card">
      <h2>What they receive</h2>
      <p>${escapeHtml(comparison.summary)}</p>
      <table class="compare">
        <thead>
          <tr><th scope="col">Option</th><th scope="col">Fee</th><th scope="col">They get</th></tr>
        </thead>
        <tbody>${rows.join('')}</tbody>
      </table>
      <p class="muted">${copy.demoRatesNote}</p>
    </section>
    <button class="btn btn-primary" id="continue">Continue to safety check</button>
  `;

  screenArea.querySelector('#continue').addEventListener('click', () => goTo('scam'));
}
