// src/checks/combineResult.js
// Turns all the safety signals into one result: pass, review or stop.
// The code rules come first. The AI can only make the result stricter, never
// safer, so a mistake by a small model can't wave a scam through.

const config = {
  scamMatchStop: 0.8,
  scamMatchReview: 0.65,
  decisionStop: 0.6,
  flagsForReview: 2
};

const strictness = { pass: 0, review: 1, stop: 2 };

export function combineResult({ flags = [], scamMatch = null, decision = null }) {
  let result = getResultFromFlags(flags);

  // The closest known scam, from the embeddings search.
  if (scamMatch) {
    if (scamMatch.score >= config.scamMatchStop) {
      result = stricterOf(result, 'stop');
    } else if (scamMatch.score >= config.scamMatchReview) {
      result = stricterOf(result, 'review');
    }
  }

  // The decision model's probabilities.
  if (decision) {
    if (decision.stop >= config.decisionStop) {
      result = stricterOf(result, 'stop');
    } else if (decision.review > decision.pass && decision.review > decision.stop) {
      result = stricterOf(result, 'review');
    }
  }

  return result;
}

function getResultFromFlags(flags) {
  const seriousFlags = flags.filter((flag) => flag.serious);

  // A serious sign together with any other sign is a stop.
  if (seriousFlags.length >= 1 && flags.length >= 2) {
    return 'stop';
  }

  if (seriousFlags.length >= 1 || flags.length >= config.flagsForReview) {
    return 'review';
  }

  return 'pass';
}

function stricterOf(resultOne, resultTwo) {
  if (strictness[resultTwo] > strictness[resultOne]) {
    return resultTwo;
  }
  return resultOne;
}
