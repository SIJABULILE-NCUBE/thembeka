// src/data.js
// Loads the demo data files from the data folder.
// All people, documents and wallets in these files are fictional.

import { readFileSync } from 'node:fs';

function readJson(fileName) {
  const text = readFileSync(new URL(`../data/${fileName}`, import.meta.url), 'utf8');
  return JSON.parse(text);
}

// I set Tendai's passport to expire 2 months from today, so the demo always
// shows the "Check first" result, no matter which day it runs.
function dateInMonths(months) {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toISOString().slice(0, 10);
}

export function loadProfiles() {
  const profiles = readJson('profiles.json');
  const tendaiKyc = profiles.tendai.kycDetails;

  if (tendaiKyc.expiryDate === 'AUTO_2_MONTHS') {
    tendaiKyc.expiryDate = dateInMonths(2);
  }

  return profiles;
}

export function loadMessages() {
  return readJson('messages.json');
}

export function loadScamLibraryFile() {
  return readJson('scamLibrary.json');
}

export function loadDemoRates() {
  return readJson('demoRates.json');
}
