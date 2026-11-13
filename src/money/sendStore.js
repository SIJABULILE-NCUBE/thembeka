// src/money/sendStore.js
// Keeps track of sends: ones that are prepared and waiting for approval,
// and the history of completed sends (saved to data/history.json).

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

const historyFile = new URL('../../data/history.json', import.meta.url);
const preparedSendMinutes = 10;

// Prepared sends live in memory only, and expire after 10 minutes,
// so an old summary can't be approved by accident later.
const preparedSends = new Map();

export function savePreparedSend(details) {
  const id = randomUUID();
  const expiresAt = Date.now() + preparedSendMinutes * 60 * 1000;
  preparedSends.set(id, { ...details, id, expiresAt });
  return id;
}

export function takePreparedSend(id) {
  const send = preparedSends.get(id);
  if (!send) {
    return null;
  }

  // Each prepared send can only be approved once.
  preparedSends.delete(id);

  if (Date.now() > send.expiresAt) {
    return null;
  }
  return send;
}

export function readHistory() {
  if (!existsSync(historyFile)) {
    return [];
  }
  return JSON.parse(readFileSync(historyFile, 'utf8'));
}

export function addToHistory(send) {
  const history = readHistory();
  history.unshift(send);
  writeFileSync(historyFile, JSON.stringify(history, null, 2));
}

export function markAsReceived(reference) {
  const history = readHistory();
  const send = history.find((item) => item.reference === reference);
  if (!send) {
    return null;
  }

  send.confirmed = true;
  send.confirmedAt = new Date().toISOString();
  writeFileSync(historyFile, JSON.stringify(history, null, 2));
  return send;
}
