// public/js/app.js
// Starts the app and switches between screens. Each screen lives in its own
// file in js/screens and has a show() function. I keep everything the screens
// share in one "state" object, so the send flow remembers each step.

import { callApi } from './helpers.js';
import { copy } from './copy.js';
import * as home from './screens/home.js';
import * as kyc from './screens/kyc.js';
import * as cost from './screens/cost.js';
import * as scam from './screens/scam.js';
import * as approve from './screens/approve.js';
import * as sent from './screens/sent.js';
import * as recipient from './screens/recipient.js';
import * as history from './screens/history.js';

const screens = { home, kyc, cost, scam, approve, sent, recipient, history };

export const state = {
  demo: null,
  status: null,
  kycDetails: null,
  kycResult: null,
  kycVerified: false,
  recipientId: 'grandma-moyo',
  amountCents: 150000,
  costComparison: null,
  message: '',
  scamCheck: null,
  preparedSend: null,
  lastSend: null
};

const screenArea = document.getElementById('screen');

// I use the address bar hash (#home, #kyc...) so the browser Back button works.
export function goTo(screenName) {
  window.location.hash = screenName;
}

async function showCurrentScreen() {
  const screenName = window.location.hash.replace('#', '') || 'home';
  const screen = screens[screenName] || screens.home;

  window.scrollTo(0, 0);
  await screen.show(screenArea, state);

  // Move keyboard and screen-reader focus to the new screen's heading.
  const heading = screenArea.querySelector('h1');
  if (heading) {
    heading.setAttribute('tabindex', '-1');
    heading.focus();
  }
}

async function updateOfflineBadge() {
  const badge = document.getElementById('offline-badge');

  try {
    state.status = await callApi('/status');
  } catch {
    badge.textContent = 'Server not running';
    return;
  }

  if (state.status.modelsReady) {
    badge.textContent = copy.offlineReady;
    badge.classList.remove('is-loading');
  } else {
    badge.textContent = copy.codeOnly;
    badge.classList.add('is-loading');
  }
}

async function start() {
  state.demo = await callApi('/demo');
  state.kycDetails = { ...state.demo.sender.kycDetails };

  window.addEventListener('hashchange', showCurrentScreen);
  await showCurrentScreen();

  // The models can take a while to load, so I check every few seconds.
  await updateOfflineBadge();
  setInterval(updateOfflineBadge, 5000);
}

start();
