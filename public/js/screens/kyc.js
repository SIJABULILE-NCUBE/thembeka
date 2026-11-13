// public/js/screens/kyc.js
// Step 1: the KYC pre-check. Thembeka checks the details on the phone first.
// Only after the person taps Submit are they sent to the licensed provider.

import { callApi, resultCard, withLoading, stepsBar, escapeHtml } from '../helpers.js';
import { copy } from '../copy.js';
import { goTo } from '../app.js';

const fields = [
  { name: 'fullName', label: 'Full name (as on your document)', type: 'text' },
  { name: 'issuingCountry', label: 'Issuing country', type: 'text', hint: 'Any African country' },
  { name: 'documentNumber', label: 'Document number', type: 'text' },
  { name: 'dateOfBirth', label: 'Date of birth', type: 'date' },
  { name: 'expiryDate', label: 'Expiry date', type: 'date' },
  { name: 'nationality', label: 'Nationality', type: 'text' }
];

export async function show(screenArea, state) {
  const details = state.kycDetails;

  const inputsHtml = fields.map((field) => {
    const hint = field.hint ? `<div class="hint">${field.hint}</div>` : '';
    return `
      <div class="field">
        <label class="label" for="${field.name}">${field.label}</label>
        <input class="input" id="${field.name}" name="${field.name}" type="${field.type}"
          value="${escapeHtml(details[field.name])}" />
        ${hint}
      </div>
    `;
  });

  screenArea.innerHTML = `
    ${stepsBar(1)}
    <h1>${copy.kycTitle}</h1>
    <p class="muted">${copy.kycIntro}</p>

    <form id="kyc-form" class="card" novalidate>
      <div class="field">
        <label class="label" for="documentType">Document type</label>
        <select class="select" id="documentType" name="documentType">
          <option value="passport" ${details.documentType === 'passport' ? 'selected' : ''}>Passport</option>
          <option value="national_id" ${details.documentType === 'national_id' ? 'selected' : ''}>National ID</option>
        </select>
      </div>
      ${inputsHtml.join('')}
      <button class="btn btn-primary" type="submit" id="check-button">Check my details</button>
    </form>

    <div id="kyc-result"></div>
  `;

  const form = screenArea.querySelector('#kyc-form');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    state.kycDetails = Object.fromEntries(new FormData(form));
    state.kycVerified = false;

    const button = screenArea.querySelector('#check-button');
    await withLoading(button, 'Checking on your phone...', async () => {
      state.kycResult = await callApi('/kyc/check', { details: state.kycDetails });
    });

    showResult(screenArea, state);
  });

  if (state.kycResult) {
    showResult(screenArea, state);
  }
}

function showResult(screenArea, state) {
  const check = state.kycResult;
  const resultArea = screenArea.querySelector('#kyc-result');

  let actionsHtml = '';
  if (state.kycVerified) {
    actionsHtml = `
      <div class="card card-highlight">
        <strong>${copy.kycVerified}</strong> <span class="badge-demo">Demo</span>
      </div>
      <button class="btn btn-primary" id="continue">Continue</button>
    `;
  } else if (check.result !== 'stop') {
    actionsHtml = `
      <p class="muted">Your details only leave your phone when you tap Submit.</p>
      <button class="btn btn-primary" id="submit">Submit to ${state.demo.providerName}</button>
    `;
  }

  resultArea.innerHTML = resultCard({
    result: check.result,
    checkedBy: copy.kycCheckedBy,
    explanation: check.explanation,
    reasons: check.reasons
  }) + actionsHtml + '<div id="kyc-error" class="error" role="alert"></div>';

  const submitButton = resultArea.querySelector('#submit');
  if (submitButton) {
    submitButton.addEventListener('click', async () => {
      try {
        await withLoading(submitButton, copy.kycSubmitted + '...', async () => {
          await callApi('/kyc/submit', { details: state.kycDetails });
        });
        state.kycVerified = true;
        showResult(screenArea, state);
      } catch (error) {
        resultArea.querySelector('#kyc-error').textContent = error.message;
      }
    });
  }

  const continueButton = resultArea.querySelector('#continue');
  if (continueButton) {
    continueButton.addEventListener('click', () => goTo('cost'));
  }

  resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
