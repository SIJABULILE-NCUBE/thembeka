// tests/costCompare.test.js
// Checks the true-cost comparison maths. Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compareCosts } from '../src/money/costCompare.js';
import { loadDemoRates } from '../src/data.js';

const rates = loadDemoRates();

test('Thembeka is the best deal for R1,500 at demo rates', () => {
  const comparison = compareCosts(150000, rates);
  assert.equal(comparison.best.id, 'thembeka');
});

test('Thembeka amount is worked out correctly', () => {
  // (R1,500 - R15 fee) x 99.5% / R18 per dollar = $82.09
  const comparison = compareCosts(150000, rates);
  const thembeka = comparison.options.find((option) => option.id === 'thembeka');
  assert.equal(thembeka.receivedUsdCents, 8209);
});

test('informal carrier shows a range, not one number', () => {
  const comparison = compareCosts(150000, rates);
  const informal = comparison.options.find((option) => option.id === 'informal');
  assert.equal(informal.feeIsFixed, false);
  assert.ok(informal.receivedUsdCentsMin < informal.receivedUsdCentsMax);
});

test('a tiny amount never goes below zero', () => {
  const comparison = compareCosts(500, rates);
  for (const option of comparison.options) {
    const lowest = option.feeIsFixed ? option.receivedUsdCents : option.receivedUsdCentsMin;
    assert.ok(lowest >= 0);
  }
});
