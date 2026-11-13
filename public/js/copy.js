// public/js/copy.js
// All the important wording in one place, including who does each check.
// Thembeka does the pre-checks on the phone. The licensed provider does the
// official verification. The person always makes the final decision.

export const providerName = 'Demo Licensed Provider';

export const copy = {
  greeting: 'Sawubona, Tendai',
  offlineReady: 'Offline checks ready',
  offlineLoading: 'Loading checks...',
  codeOnly: 'Code checks only',

  resultWords: {
    pass: 'Looks safe',
    review: 'Check first',
    stop: 'Stop'
  },

  kycTitle: 'Check my details before submitting',
  kycIntro: `This is a pre-check on your phone. ${providerName} does the official verification.`,
  kycCheckedBy: 'Pre-check by Thembeka',
  kycSubmitted: `Sent to ${providerName} for official verification`,
  kycVerified: `Verified by ${providerName}`,

  scamTitle: 'Check the request',
  scamIntro: 'Paste the message that asked you for money. We check it on your phone, with no internet.',
  scamCheckedBy: 'Safety check by Thembeka',
  scamYouDecide: 'This check runs on your phone. It can warn you, but you decide.',

  approveTitle: 'Review and approve',
  approveWarning: `You are choosing to send this money. Thembeka and ${providerName} cannot reverse a completed send.`,
  confirmCalled: 'I have called the person on a number I already know, and they asked for this money.',
  confirmStillSend: 'I understand this looks like a scam, and I still want to send.',

  simulatedNote: 'Demo send: no real money moved.',
  demoRatesNote: 'Demo rates: fixed numbers for this demo only.'
};

// Friendly names for the scam patterns found by the scam library search.
export const patternNames = {
  new_number_impersonation: 'Someone pretending to be family on a new number',
  urgency_pressure: 'Pressure to send money quickly',
  prize_or_fee: 'Pay a fee to receive a prize or parcel',
  fake_job: 'Pay a fee to get a job',
  loan_fee: 'Pay a fee to get a loan',
  money_mule: 'Receive money and pass it on (money mule)',
  romance: 'Someone you have not met in person asking for money'
};
