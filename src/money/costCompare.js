// src/money/costCompare.js
// Works out what the recipient actually gets with each way of sending money.
// All money is in cents (whole numbers), so there are no rounding surprises.
// This is always done in code, never by the AI.

export function compareCosts(amountCents, rates) {
  const options = [];

  for (const option of rates.options) {
    if (option.id === 'informal') {
      options.push(informalOption(amountCents, option, rates.randPerUsd));
    } else {
      options.push(fixedFeeOption(amountCents, option, rates.randPerUsd));
    }
  }

  // Best deal for the recipient first. For the informal carrier I use its best case,
  // so the comparison is fair to it.
  options.sort((optionA, optionB) => receivedBestCase(optionB) - receivedBestCase(optionA));

  return {
    label: rates.label,
    amountCents,
    options,
    best: options[0]
  };
}

function fixedFeeOption(amountCents, option, randPerUsd) {
  const receivedUsdCents = convert(amountCents - option.feeCents, option.rateMarkupPercent, randPerUsd);

  return {
    id: option.id,
    name: option.name,
    feeCents: option.feeCents,
    rateMarkupPercent: option.rateMarkupPercent,
    receivedUsdCents,
    arrives: option.arrives,
    receipt: option.receipt,
    feeIsFixed: true
  };
}

// The informal carrier's fee changes every month, so I show a range, not one number.
function informalOption(amountCents, option, randPerUsd) {
  const lowestFeeCents = Math.round((amountCents * option.feePercentMin) / 100);
  const highestFeeCents = Math.round((amountCents * option.feePercentMax) / 100);

  const receivedBestCase = convert(amountCents - lowestFeeCents, option.rateMarkupPercent, randPerUsd);
  const receivedWorstCase = convert(amountCents - highestFeeCents, option.rateMarkupPercent, randPerUsd);

  return {
    id: option.id,
    name: option.name,
    feeMinCents: lowestFeeCents,
    feeMaxCents: highestFeeCents,
    rateMarkupPercent: option.rateMarkupPercent,
    receivedUsdCentsMin: receivedWorstCase,
    receivedUsdCentsMax: receivedBestCase,
    arrives: option.arrives,
    receipt: option.receipt,
    feeIsFixed: false,
    warning: option.warning
  };
}

// Rand cents to US dollar cents, after the exchange-rate markup.
function convert(randCents, markupPercent, randPerUsd) {
  if (randCents <= 0) {
    return 0;
  }
  const afterMarkup = randCents * (1 - markupPercent / 100);
  return Math.round(afterMarkup / randPerUsd);
}

function receivedBestCase(option) {
  if (option.feeIsFixed) {
    return option.receivedUsdCents;
  }
  return option.receivedUsdCentsMax;
}
