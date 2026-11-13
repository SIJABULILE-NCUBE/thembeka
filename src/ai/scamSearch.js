// src/ai/scamSearch.js
// Finds the known scam that a message is most similar to, by meaning rather
// than exact words. "Mama it's me on a new line" still matches "Hi mum, this
// is my new number" even though the words are different.
//
// How it works: the embedding model turns each message into a list of numbers
// (an embedding). Messages with similar meaning get similar numbers, and
// cosine similarity measures how close two lists are (1.0 = the same meaning).

import { embed } from '@qvac/sdk';
import { getModelIds } from './models.js';
import { withTimeout } from './withTimeout.js';
import { loadScamLibraryFile } from '../data.js';

const config = {
  timeoutMs: 10000,
  numberOfMatches: 2
};

// I embed the scam library once at start-up and keep it in memory,
// so each check only needs to embed the one new message.
let libraryWithEmbeddings = [];

export async function loadScamLibrary() {
  const { embedder } = getModelIds();
  if (!embedder) {
    return;
  }

  const library = loadScamLibraryFile();
  const texts = library.map((scam) => scam.text);

  try {
    // Using the same model for the library and for every message is important:
    // embeddings from different models can't be compared.
    const { embedding } = await embed({ modelId: embedder, text: texts });

    libraryWithEmbeddings = library.map((scam, index) => {
      return { ...scam, embedding: embedding[index] };
    });
    console.log(`  Scam library ready: ${libraryWithEmbeddings.length} examples`);
  } catch (error) {
    console.log(`  Scam library could not be prepared (${error.message}).`);
  }
}

export async function findClosestScams(messageText) {
  const { embedder } = getModelIds();
  if (!embedder || libraryWithEmbeddings.length === 0 || !messageText) {
    return null;
  }

  try {
    const { embedding } = await withTimeout(
      embed({ modelId: embedder, text: messageText }),
      config.timeoutMs,
      'Scam search'
    );

    const scored = libraryWithEmbeddings.map((scam) => {
      return {
        pattern: scam.pattern,
        text: scam.text,
        score: roundTo2(cosineSimilarity(embedding, scam.embedding))
      };
    });

    scored.sort((scamA, scamB) => scamB.score - scamA.score);
    return scored.slice(0, config.numberOfMatches);
  } catch (error) {
    console.log(`Scam search skipped: ${error.message}`);
    return null;
  }
}

function cosineSimilarity(vectorA, vectorB) {
  let dotProduct = 0;
  let lengthA = 0;
  let lengthB = 0;

  for (let index = 0; index < vectorA.length; index++) {
    dotProduct = dotProduct + vectorA[index] * vectorB[index];
    lengthA = lengthA + vectorA[index] * vectorA[index];
    lengthB = lengthB + vectorB[index] * vectorB[index];
  }

  if (lengthA === 0 || lengthB === 0) {
    return 0;
  }
  return dotProduct / (Math.sqrt(lengthA) * Math.sqrt(lengthB));
}

function roundTo2(number) {
  return Math.round(number * 100) / 100;
}
