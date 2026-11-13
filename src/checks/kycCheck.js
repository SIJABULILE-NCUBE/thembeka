// src/checks/kycCheck.js
// The KYC pre-check. It runs on the device with no internet and checks that
// ID details are complete and valid before they are sent to the licensed provider.
// This is a pre-check only: the licensed provider does the official verification.

const config = {
  minimumAge: 18,
  expiryWarningMonths: 3,
  requiredFields: [
    'fullName',
    'documentType',
    'issuingCountry',
    'documentNumber',
    'dateOfBirth',
    'expiryDate',
    'nationality'
  ],
  fieldNames: {
    fullName: 'Full name',
    documentType: 'Document type',
    issuingCountry: 'Issuing country',
    documentNumber: 'Document number',
    dateOfBirth: 'Date of birth',
    expiryDate: 'Expiry date',
    nationality: 'Nationality'
  },
  // Passports are usually 6 to 9 letters and numbers. National IDs vary more.
  documentNumberPatterns: {
    passport: /^[A-Z0-9]{6,9}$/,
    national_id: /^[A-Z0-9-]{6,15}$/
  }
};

export function checkKyc(details, accountName, today = new Date()) {
  const stopReasons = [];
  const reviewReasons = [];

  // 1. I check for missing fields first, because nothing else matters if a field is empty.
  for (const field of config.requiredFields) {
    const value = details[field];
    if (!value || String(value).trim() === '') {
      stopReasons.push(`${config.fieldNames[field]} is missing.`);
    }
  }

  if (stopReasons.length > 0) {
    return { result: 'stop', reasons: stopReasons };
  }

  // 2. An expired document is an instant stop.
  const expiryDate = new Date(details.expiryDate);
  if (expiryDate < today) {
    stopReasons.push('This document has expired.');
  }

  // 3. The account holder must be an adult.
  const age = getAgeInYears(new Date(details.dateOfBirth), today);
  if (age < config.minimumAge) {
    stopReasons.push(`The account holder must be ${config.minimumAge} or older.`);
  }

  // 4. The document number must look like a real number for that document type.
  const pattern = config.documentNumberPatterns[details.documentType];
  const cleanNumber = String(details.documentNumber).toUpperCase().replace(/\s/g, '');
  if (pattern && !pattern.test(cleanNumber)) {
    stopReasons.push('The document number is not in a valid format for this document type.');
  }

  if (stopReasons.length > 0) {
    return { result: 'stop', reasons: stopReasons };
  }

  // 5. Soft risks: these don't block, but the person should check them.
  const monthsLeft = getMonthsBetween(today, expiryDate);
  if (monthsLeft < config.expiryWarningMonths) {
    reviewReasons.push(
      `This document expires on ${details.expiryDate}. Please renew it soon, as the provider may not accept it.`
    );
  }

  if (!namesMatch(details.fullName, accountName)) {
    reviewReasons.push('The name on the document does not match the name on your account.');
  }

  if (reviewReasons.length > 0) {
    return { result: 'review', reasons: reviewReasons };
  }

  return { result: 'pass', reasons: ['All details are complete and valid.'] };
}

function getAgeInYears(dateOfBirth, today) {
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const birthdayNotYetThisYear =
    today.getMonth() < dateOfBirth.getMonth() ||
    (today.getMonth() === dateOfBirth.getMonth() && today.getDate() < dateOfBirth.getDate());

  if (birthdayNotYetThisYear) {
    age = age - 1;
  }
  return age;
}

function getMonthsBetween(startDate, endDate) {
  const years = endDate.getFullYear() - startDate.getFullYear();
  const months = endDate.getMonth() - startDate.getMonth();
  return years * 12 + months;
}

// I compare names without caring about capital letters or word order,
// so "Moyo Tendai" and "tendai moyo" still match.
function namesMatch(nameOne, nameTwo) {
  const wordsOne = toSortedWords(nameOne);
  const wordsTwo = toSortedWords(nameTwo);
  return wordsOne === wordsTwo;
}

function toSortedWords(name) {
  return String(name).toLowerCase().trim().split(/\s+/).sort().join(' ');
}
