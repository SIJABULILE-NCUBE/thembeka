// src/ai/explain.js
// Uses the small Qwen3 model to explain a result in one or two plain sentences.
// The code has already decided the result. The AI only explains it, and if it
// fails or writes something unusable, I use a code-written explanation instead.

import { completion } from '@qvac/sdk';
import { getModelIds } from './models.js';
import { withTimeout } from './withTimeout.js';

const config = {
  timeoutMs: 15000,
  maxLength: 300
};

export async function explainResult(kind, facts, fallbackText) {
  const { explainer } = getModelIds();
  if (!explainer) {
    return { explanation: fallbackText, aiUsed: false };
  }

  try {
    const prompt = buildPrompt(kind, facts);
    const answerText = await withTimeout(askModel(explainer, prompt), config.timeoutMs, 'Explanation');
    const explanation = readExplanation(answerText);

    if (!explanation) {
      return { explanation: fallbackText, aiUsed: false };
    }
    return { explanation, aiUsed: true };
  } catch (error) {
    console.log(`Explanation skipped: ${error.message}`);
    return { explanation: fallbackText, aiUsed: false };
  }
}

function buildPrompt(kind, facts) {
  return [
    'You help people send money home safely. Explain the result below to the user.',
    'Use one or two clear, professional sentences in plain English. No jargon.',
    'Do not change the result. Tell them the one thing to do next.',
    'Reply with JSON only, like this: {"explanation": "..."}',
    '',
    `Check: ${kind}`,
    `Result: ${facts.result}`,
    `Reasons: ${facts.reasons.length > 0 ? facts.reasons.join(' ') : 'No warning signs found.'}`
  ].join('\n');
}

async function askModel(modelId, prompt) {
  const run = completion({
    modelId,
    history: [{ role: 'user', content: prompt }],
    stream: true,
    captureThinking: true,
    generationParams: { reasoning_budget: 0 }
  });

  let text = '';
  for await (const event of run.events) {
    if (event.type === 'contentDelta') {
      text = text + event.text;
    }
  }
  await run.final;
  return text;
}

// Small models sometimes add extra words around the JSON, so I look for the
// first {...} block and read the explanation from it.
function readExplanation(answerText) {
  const start = answerText.indexOf('{');
  const end = answerText.lastIndexOf('}');
  if (start === -1 || end === -1) {
    return null;
  }

  try {
    const parsed = JSON.parse(answerText.slice(start, end + 1));
    const explanation = String(parsed.explanation || '').trim();
    if (explanation === '' || explanation.length > config.maxLength) {
      return null;
    }
    return explanation;
  } catch {
    return null;
  }
}
