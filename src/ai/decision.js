// src/ai/decision.js
// Asks the small Laya decision model one question: does this message look
// safe, need checking, or look like a scam? It answers with a probability for
// each choice in a single step, which is faster and more consistent than
// asking a chat model to write an answer.

import { decide } from '@qvac/sdk';
import { getModelIds } from './models.js';
import { withTimeout } from './withTimeout.js';

const config = {
  timeoutMs: 10000,
  choices: {
    pass: 'looks safe',
    review: 'needs checking',
    stop: 'looks like a scam'
  }
};

export async function classifyMessage(messageText) {
  const { decider } = getModelIds();
  if (!decider || !messageText) {
    return null;
  }

  try {
    const response = await withTimeout(
      decide({
        modelId: decider,
        state: `A person received this message asking them to send money: "${messageText}"`,
        questions: {
          risk: {
            type: 'choice',
            instructions: 'Is this a normal request from family, or does it look like a scam or fraud?',
            criteria: [config.choices.pass, config.choices.review, config.choices.stop]
          }
        }
      }),
      config.timeoutMs,
      'Decision model'
    );

    // The answer comes back as { answers: { risk: { probabilities: {...} } } }
    const answers = response.answers ?? response.result?.answers;
    const probabilities = answers.risk.probabilities;

    return {
      pass: roundTo2(probabilities[config.choices.pass] ?? 0),
      review: roundTo2(probabilities[config.choices.review] ?? 0),
      stop: roundTo2(probabilities[config.choices.stop] ?? 0)
    };
  } catch (error) {
    console.log(`Decision model skipped: ${error.message}`);
    return null;
  }
}

function roundTo2(number) {
  return Math.round(number * 100) / 100;
}
