// scripts/checkModels.js
// Loads all three models, runs each one on the demo messages, and prints the
// results and timings. Run it once with Wi-Fi on (to download the models),
// then again with Wi-Fi off to prove everything works offline.
//
// Run with: npm run check-models

import { loadAllModels, unloadAllModels, getModelStatus } from '../src/ai/models.js';
import { loadScamLibrary, findClosestScams } from '../src/ai/scamSearch.js';
import { classifyMessage } from '../src/ai/decision.js';
import { explainResult } from '../src/ai/explain.js';
import { loadMessages } from '../src/data.js';

await loadAllModels();
await loadScamLibrary();
console.log('\nModel status:', getModelStatus());

for (const message of loadMessages()) {
  console.log(`\n--- ${message.label} (expected: ${message.expected}) ---`);
  console.log(`"${message.text}"`);

  let startTime = Date.now();
  const matches = await findClosestScams(message.text);
  console.log(`Closest scams (${Date.now() - startTime} ms):`, matches);

  startTime = Date.now();
  const decision = await classifyMessage(message.text);
  console.log(`Decision (${Date.now() - startTime} ms):`, decision);

  startTime = Date.now();
  const explained = await explainResult(
    'safety check of a request for money',
    { result: message.expected, reasons: ['Demo check.'] },
    '(code fallback used)'
  );
  console.log(`Explanation (${Date.now() - startTime} ms):`, explained);
}

await unloadAllModels();
console.log('\nDone.');
