// tests/safetyCheck.test.js
// Checks the scam and money mule rules, using the same demo messages as Demo Day.
// Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkTransfer } from '../src/checks/transferFlags.js';
import { checkMessageWords } from '../src/checks/messageWarnings.js';
import { combineResult } from '../src/checks/combineResult.js';
import { loadProfiles, loadMessages } from '../src/data.js';

const profiles = loadProfiles();
const messages = loadMessages();

// This is the same code-only path the app uses when the AI is not available.
function codeOnlyResult(message) {
  const transfer = { recipientId: message.recipientId, amountCents: message.amountCents };
  const transferCheck = checkTransfer(transfer, profiles.tendai, []);
  const messageCheck = checkMessageWords(message.text);
  const allFlags = [...transferCheck.flags, ...messageCheck.flags];
  return combineResult({ flags: allFlags });
}

for (const message of messages) {
  test(`demo message "${message.label}" gives ${message.expected} with code rules only`, () => {
    assert.equal(codeOnlyResult(message), message.expected);
  });
}

test('new recipient is flagged', () => {
  const check = checkTransfer({ recipientId: 'someone-new', amountCents: 10000 }, profiles.tendai);
  assert.ok(check.flags.some((flag) => flag.id === 'new_recipient'));
});

test('much bigger amount than usual is flagged', () => {
  const check = checkTransfer({ recipientId: 'grandma-moyo', amountCents: 900000 }, profiles.tendai);
  assert.ok(check.flags.some((flag) => flag.id === 'unusual_amount'));
});

test('many sends in a day are flagged', () => {
  const now = new Date().toISOString();
  const history = [{ date: now }, { date: now }, { date: now }];
  const check = checkTransfer({ recipientId: 'grandma-moyo', amountCents: 10000 }, profiles.tendai, history);
  assert.ok(check.flags.some((flag) => flag.id === 'many_sends'));
});

test('money mule wording is caught', () => {
  const check = checkMessageWords('I will pay into your account, keep R200 and send the rest to my friend.');
  assert.ok(check.flags.some((flag) => flag.id === 'money_mule'));
});

test('a strong scam match makes the result a stop', () => {
  const result = combineResult({ flags: [], scamMatch: { score: 0.85 } });
  assert.equal(result, 'stop');
});

test('AI can make a result stricter but never safer', () => {
  const flags = [
    { id: 'secrecy', serious: true },
    { id: 'urgency', serious: false }
  ];
  const result = combineResult({ flags, decision: { pass: 0.9, review: 0.05, stop: 0.05 } });
  assert.equal(result, 'stop');
});

test('works when the AI gives nothing back', () => {
  const result = combineResult({ flags: [], scamMatch: null, decision: null });
  assert.equal(result, 'pass');
});
