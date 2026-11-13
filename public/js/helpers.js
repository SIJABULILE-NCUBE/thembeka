// public/js/helpers.js
// Small helpers the screens share: calling the API, showing money,
// and drawing the result cards.

import { copy } from './copy.js';

// Calls our own API and returns the JSON. If the server sends an error,
// I throw it with the server's friendly message so the screen can show it.
export async function callApi(path, body) {
  const options = { method: 'GET', headers: {} };

  if (body !== undefined) {
    options.method = 'POST';
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`/api${path}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong. Please try again.');
  }
  return data;
}

// I use a dot for cents (R1,500.00) so rand and dollar amounts look the same.
export function formatRand(cents) {
  const rands = cents / 100;
  return 'R' + rands.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Whole rands only, for tight spaces like the comparison table.
export function formatRandShort(cents) {
  return 'R' + Math.round(cents / 100).toLocaleString('en-US');
}

export function formatUsd(cents) {
  return '$' + (cents / 100).toFixed(2);
}

export function formatDate(isoText) {
  return new Date(isoText).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' });
}

// Stops anything typed by the user being read as HTML.
export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = String(text ?? '');
  return div.innerHTML;
}

const icons = {
  pass: '<svg class="result-icon" viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="17" fill="var(--green-dark)"/><path d="M10 18.5l5.5 5.5L26 13" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  review: '<svg class="result-icon" viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="17" fill="var(--review)"/><path d="M18 9v11" stroke="#0e1513" stroke-width="3.5" stroke-linecap="round"/><circle cx="18" cy="26" r="2.2" fill="#0e1513"/></svg>',
  stop: '<svg class="result-icon" viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="17" fill="var(--stop)"/><path d="M11 11l14 14M25 11L11 25" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/></svg>'
};

// Every result shows colour + icon + word + who did the check,
// so the meaning never depends on colour alone.
export function resultCard({ result, checkedBy, explanation, reasons = [], extraHtml = '' }) {
  const reasonItems = reasons.map((reason) => `<li>${escapeHtml(reason)}</li>`).join('');

  return `
    <section class="result result-${result}" aria-label="${copy.resultWords[result]}">
      <div class="result-header">
        ${icons[result]}
        <div>
          <div class="result-by">${escapeHtml(checkedBy)}</div>
          <div class="result-word">${copy.resultWords[result]}</div>
        </div>
      </div>
      <p>${escapeHtml(explanation)}</p>
      ${reasonItems ? `<ul>${reasonItems}</ul>` : ''}
      ${extraHtml}
    </section>
  `;
}

// Puts a spinner in a button while it waits, and gives the old text back after.
export async function withLoading(button, loadingText, task) {
  const originalHtml = button.innerHTML;
  button.disabled = true;
  button.innerHTML = `<span class="spinner" aria-hidden="true"></span> ${loadingText}`;

  try {
    return await task();
  } finally {
    button.disabled = false;
    button.innerHTML = originalHtml;
  }
}

export function stepsBar(currentStep) {
  const labels = ['Identity', 'Amount', 'Safety', 'Approval'];
  const bars = labels.map((label, index) => {
    const done = index < currentStep ? 'is-done' : '';
    return `<li class="${done}" aria-hidden="true"></li>`;
  });

  return `
    <div class="step-label">Step ${currentStep} of 4: ${labels[currentStep - 1]}</div>
    <ol class="steps">${bars.join('')}</ol>
  `;
}
