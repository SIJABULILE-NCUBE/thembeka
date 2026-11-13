// server.js
// This starts Thembeka. It serves the web app, loads the local AI models once,
// and connects the API routes. Run it with: npm start

import 'dotenv/config';
import express from 'express';
import apiRoutes from './src/routes/api.js';
import { loadAllModels, unloadAllModels } from './src/ai/models.js';
import { loadScamLibrary } from './src/ai/scamSearch.js';

const port = process.env.PORT || 3000;

// I allow starting without AI (npm run start:no-ai) so the screens can be
// tested quickly. Every check still works, using the code rules only.
const startWithoutAi = process.argv.includes('--no-ai');

const app = express();
app.use(express.json());
app.use(express.static('public'));
app.use('/api', apiRoutes);

app.listen(port, () => {
  console.log(`Thembeka running on http://localhost:${port}`);
});

if (startWithoutAi) {
  console.log('Starting without AI: checks will use the code rules only.');
} else {
  // I load the models after the server starts so the page opens straight away.
  // The Home screen shows "Offline checks ready" once loading is done.
  await loadAllModels();
  await loadScamLibrary();
}

// When I press Ctrl + C, I free the memory the models are using.
process.on('SIGINT', async () => {
  console.log('\nStopping Thembeka...');
  await unloadAllModels();
  process.exit(0);
});
