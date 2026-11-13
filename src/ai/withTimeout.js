// src/ai/withTimeout.js
// A small helper: if an AI step takes too long, I give up on it and the app
// carries on with the code-only result instead of keeping the user waiting.

export async function withTimeout(promise, milliseconds, stepName) {
  let timer;

  const timeout = new Promise((resolve, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`${stepName} took longer than ${milliseconds / 1000} seconds`));
    }, milliseconds);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
}
