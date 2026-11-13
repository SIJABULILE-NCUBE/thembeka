// public/js/copy.js
// All the important wording in one place, including who does each check.
// Thembeka does the pre-checks on the phone. The licensed provider does the
// official verification. The person always makes the final decision.

export const providerName = 'Demo Licensed Provider';

export const copy = {
  greeting: 'Welcome back, Tendai',
  offlineReady: 'Offline checks ready',
  offlineLoading: 'Loading offline checks…',
  codeOnly: 'Rule-based checks only',

  resultWords: {
    pass: 'Low risk',
    review: 'Review required',
    stop: 'High risk'
  },

  kycTitle: 'Verify your details before submission',
  kycIntro: `This is a pre-check performed on your device. ${providerName} carries out the official verification.`,
  kycCheckedBy: 'Pre-check by Thembeka',
  kycSubmitted: `Submitted to ${providerName} for official verification`,
  kycVerified: `Verified by ${providerName}`,

  scamTitle: 'Review the payment request',
  scamIntro: 'Paste the message requesting payment. Thembeka analyses it on your device, without an internet connection.',
  scamCheckedBy: 'Safety check by Thembeka',
  scamYouDecide: 'This check runs on your device. It provides a warning; the final decision remains yours.',

  approveTitle: 'Review and approve',
  approveWarning: `By approving, you authorise this transfer. Completed transfers cannot be reversed by Thembeka or ${providerName}.`,
  confirmCalled: 'I have contacted this person on a number I already know, and they confirmed the request.',
  confirmStillSend: 'I understand that this request shows signs of fraud, and I choose to proceed.',

  simulatedNote: 'Demonstration transaction: no funds were transferred.',
  demoRatesNote: 'Demonstration rates: fixed values for illustration only.'
};

// Friendly names for the scam patterns found by the scam library search.
export const patternNames = {
  new_number_impersonation: 'Family impersonation from a new number',
  urgency_pressure: 'Urgency and pressure to pay',
  prize_or_fee: 'Advance fee for a prize or parcel',
  fake_job: 'Advance fee for employment',
  loan_fee: 'Advance fee for a loan',
  money_mule: 'Money mule request (receive and forward funds)',
  romance: 'Romance scam'
};
