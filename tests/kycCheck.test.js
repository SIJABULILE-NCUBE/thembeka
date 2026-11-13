// tests/kycCheck.test.js
// Checks the KYC pre-check rules. Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkKyc } from '../src/checks/kycCheck.js';

const today = new Date('2026-11-14');

const validPassport = {
  fullName: 'Tendai Moyo',
  documentType: 'passport',
  issuingCountry: 'Zimbabwe',
  documentNumber: 'FN482913',
  dateOfBirth: '1995-03-14',
  expiryDate: '2030-01-01',
  nationality: 'Zimbabwean'
};

test('valid passport passes', () => {
  const check = checkKyc(validPassport, 'Tendai Moyo', today);
  assert.equal(check.result, 'pass');
});

test('expired passport is a stop', () => {
  const details = { ...validPassport, expiryDate: '2026-01-01' };
  const check = checkKyc(details, 'Tendai Moyo', today);
  assert.equal(check.result, 'stop');
  assert.match(check.reasons.join(' '), /expired/);
});

test('passport expiring in 2 months needs a review', () => {
  const details = { ...validPassport, expiryDate: '2027-01-14' };
  const check = checkKyc(details, 'Tendai Moyo', today);
  assert.equal(check.result, 'review');
  assert.match(check.reasons.join(' '), /2027-01-14/);
});

test('missing field is a stop and names the field', () => {
  const details = { ...validPassport, documentNumber: '' };
  const check = checkKyc(details, 'Tendai Moyo', today);
  assert.equal(check.result, 'stop');
  assert.match(check.reasons.join(' '), /Document number/);
});

test('under 18 is a stop', () => {
  const details = { ...validPassport, dateOfBirth: '2010-06-01' };
  const check = checkKyc(details, 'Tendai Moyo', today);
  assert.equal(check.result, 'stop');
});

test('name in a different order still matches', () => {
  const check = checkKyc(validPassport, 'moyo TENDAI', today);
  assert.equal(check.result, 'pass');
});

test('different name needs a review', () => {
  const check = checkKyc(validPassport, 'Thabo Dube', today);
  assert.equal(check.result, 'review');
});

test('badly formatted passport number is a stop', () => {
  const details = { ...validPassport, documentNumber: '12' };
  const check = checkKyc(details, 'Tendai Moyo', today);
  assert.equal(check.result, 'stop');
});
