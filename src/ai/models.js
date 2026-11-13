// src/ai/models.js
// Loads the three local AI models once when the server starts, and frees
// them when it stops. Everything here runs on the device: after the first
// download, no internet is needed.
//
//   Qwen3 0.6B       writes plain-language explanations      (about 380 MB)
//   EmbeddingGemma   finds messages that mean the same thing  (about 330 MB)
//   Laya             gives pass / review / stop probabilities (about 350 MB)

import {
  loadModel,
  unloadModel,
  close,
  QWEN3_600M_INST_Q4,
  EMBEDDINGGEMMA_300M_Q8_0,
  LAYA_MULTILINGUAL_322M_Q8_0
} from '@qvac/sdk';

// I keep the ids here so every request reuses the same loaded models.
const loadedModels = {
  explainer: null,
  embedder: null,
  decider: null
};

export async function loadAllModels() {
  console.log('Loading local AI models (the first time downloads them)...');

  loadedModels.explainer = await loadOneModel('Qwen3 explainer', {
    modelSrc: QWEN3_600M_INST_Q4,
    modelConfig: { ctx_size: 2048 }
  });

  loadedModels.embedder = await loadOneModel('EmbeddingGemma scam search', {
    modelSrc: EMBEDDINGGEMMA_300M_Q8_0
  });

  loadedModels.decider = await loadOneModel('Laya decision model', {
    modelSrc: LAYA_MULTILINGUAL_322M_Q8_0,
    modelType: 'llamacpp-decision',
    modelConfig: { device: 'cpu' }
  });

  console.log('Models ready:', getModelStatus());
}

// If one model fails to load, I log it and carry on. That feature then
// falls back to the code rules, so the app still works.
async function loadOneModel(label, options) {
  try {
    const modelId = await loadModel({
      ...options,
      onProgress: (progress) => {
        const percent = Math.round(progress.percentage ?? 0);
        process.stdout.write(`\r  ${label}: ${percent}%   `);
      }
    });
    process.stdout.write(`\r  ${label}: ready         \n`);
    return modelId;
  } catch (error) {
    console.log(`\n  ${label}: could not load (${error.message}). Using code rules instead.`);
    return null;
  }
}

export function getModelIds() {
  return loadedModels;
}

export function getModelStatus() {
  return {
    explainer: loadedModels.explainer !== null,
    embedder: loadedModels.embedder !== null,
    decider: loadedModels.decider !== null
  };
}

export async function unloadAllModels() {
  for (const modelId of Object.values(loadedModels)) {
    if (modelId) {
      await unloadModel({ modelId, clearStorage: false });
    }
  }
  await close();
}
