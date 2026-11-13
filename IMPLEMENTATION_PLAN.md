# Thembeka: Implementation Plan

**Builds:** the Thembeka MVP described in `PRD.md`
**Deadline:** Demo Day, Saturday 14 November 2026, 13:00 SAST
**Machine:** Windows 11, Node.js 22.21.0, npm 10.9.4, VS Code, PowerShell

---

## 0. Start here (instructions for the coding agent)

Read `PRD.md` first. It is the source of truth for what to build. This file says **how** and **in what order**.

**Rules**

1. **Work one phase at a time.** Finish a phase, run its checks, then stop and report what was done and what the checks showed. Do not start the next phase until told to.
2. **Keep the code easy to read.** Follow PRD section 18 (Code standards): plain JavaScript ES modules, small files, one idea per line, `async`/`await`, no nested ternaries, descriptive names, early returns, and short first-person comments that explain *why*. Someone who has done a beginner JavaScript course must be able to follow every file. If there is a simpler way to write something, use it.
3. **No extra tools.** No TypeScript, no frontend framework, no bundler, no CSS framework, no database. Ask before adding any npm package not listed in this plan.
4. **Pin the QVAC SDK at `@qvac/sdk@0.22.0`.** Do not upgrade it unless told to (see Phase 4).
5. **Never commit secrets.** Seed phrases, keys and RPC URLs go in `.env` only. `.env` must be in `.gitignore` before the first commit.
6. **Every AI call needs a fallback.** Timeout plus `try/catch`; on failure return the code-only result with `aiUsed: false`.
7. **Money in cents.** Store and calculate amounts as whole numbers of cents.
8. **Nothing is sent without approval.** The only code path that sends money is `POST /api/send/approve` with a valid prepared send id.
9. **Use Windows-friendly commands.** The terminal is PowerShell.
10. **If something in the plan is unclear or does not work, stop and ask.** Do not guess at QVAC or WDK function names: look them up in `node_modules` or the official docs first.

**Known working QVAC calls** (from the bootcamp starter, SDK 0.22.0)

```js
import { loadModel, completion, unloadModel, close, QWEN3_600M_INST_Q4 } from '@qvac/sdk';

const modelId = await loadModel({
  modelSrc: QWEN3_600M_INST_Q4,
  modelConfig: { ctx_size: 2048 },
  onProgress: (p) => console.log(Math.round(p.percentage ?? 0) + '%')
});

const run = completion({
  modelId,
  history: [{ role: 'user', content: 'Hello' }],
  stream: true,
  captureThinking: true,
  generationParams: { reasoning_budget: 0 }
});

let text = '';
for await (const event of run.events) {
  if (event.type === 'contentDelta') text += event.text;
}
const { stats } = await run.final;

await unloadModel({ modelId, clearStorage: false });
await close();
```

---

## Phase overview

| Phase | What | Done when |
|---|---|---|
| 0 | Project setup | `npm start` serves a page on http://localhost:3000 |
| 1 | Sample data | All 4 JSON files load without errors |
| 2 | Design system and screens (with fake data) | All 8 screens look right at 360 px and 1024 px |
| 3 | Rules engine (code only) | `npm test` passes |
| 4 | Local AI (QVAC) | `npm run check-models` shows all models working offline |
| 5 | API and screens connected | Full flow works end to end in simulated send mode |
| 6 | Wallet (WDK) | Test USDT send works on the test network |
| 7 | History, confirm and polish | Demo checklist in PRD section 19 passes |
| 8 | README and demo prep | A stranger can run the repo from the README |

Suggested timing: Phases 0 to 3 on Thursday night, Phases 4 to 7 on Friday, Phase 8 on Friday evening.

---

## Phase 0: Project setup

**Steps**

1. Create the folder structure from PRD section 15 (empty files are fine for now).
2. Create `package.json`:

```json
{
  "name": "thembeka",
  "version": "1.0.0",
  "description": "Send money home safely: offline KYC and scam checks with a human approval step.",
  "type": "module",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "test": "node --test tests/",
    "check-models": "node scripts/checkModels.js"
  },
  "license": "MIT"
}
```

3. Install the packages:

```powershell
npm install @qvac/sdk@0.22.0 express dotenv
```

4. Create `.gitignore`:

```
node_modules/
.env
data/history.json
```

5. Create `.env.example`:

```
PORT=3000
WALLET_MODE=simulated
SEED_PHRASE=
RPC_URL=
USDT_TOKEN_ADDRESS=
```

6. Create `server.js` that:
   - loads `.env` with `dotenv`
   - serves the `public/` folder with Express
   - mounts `src/routes/api.js` at `/api`
   - has `GET /api/status` returning `{ ok: true, modelsReady: false }` for now
   - prints `Thembeka running on http://localhost:3000`
7. Create `public/index.html` with the page title "Thembeka" and a placeholder heading.
8. Add the MIT `LICENSE` file with the owner's name: Sijabulile Ncube.

**Checks**

- [ ] `npm start` runs without errors
- [ ] http://localhost:3000 shows the placeholder page
- [ ] http://localhost:3000/api/status returns JSON
- [ ] `git status` does not list `.env` or `node_modules`

---

## Phase 1: Sample data

All data is fictional. Use the details in PRD section 17.

**Files**

1. `data/profiles.json`
   - `tendai`: sender. Name "Tendai Moyo", Zimbabwean passport, number in a realistic format, date of birth 1995, expiry date **2 months from today** (so the demo shows Review), usual send 150000 cents (R1,500), known recipients: `grandma-moyo`.
   - `grandma-moyo`: recipient. Name "Grandma Moyo", test wallet address placeholder.
   - `steve`: Malawian trader, used for history examples.
2. `data/messages.json`: the 1 genuine and 2 scam messages from PRD section 17, each with an `id` and the expected result (`pass` or `stop`).
3. `data/scamLibrary.json`: 15 to 20 short fictional scam messages. Each item: `id`, `pattern`, `text`. Patterns:
   - `new_number_impersonation` (at least 4)
   - `urgency_pressure` (at least 3)
   - `prize_or_fee` (at least 3)
   - `fake_job` (at least 2)
   - `loan_fee` (at least 2)
   - `money_mule` (at least 3: "receive money into your account and send it on")
4. `data/demoRates.json`: one fixed rand to USD rate and the fees for 4 options:
   - `thembeka`: small fixed fee, no rate markup
   - `transfer_service`: fixed fee plus a rate markup
   - `bank`: higher fixed fee plus a rate markup
   - `informal`: a **fee range** (min and max percent) plus a poor street rate, with a note "changes every month"
   - a top-level `"label": "Demo rates"`

**Checks**

- [ ] A small script or test loads each file with `JSON.parse` without errors
- [ ] No real people, real ID numbers or real wallet keys anywhere

---

## Phase 2: Design system and screens (fake data)

Build the look first with fake data, so it can be checked visually before any logic exists.

**Steps**

1. `public/css/styles.css`
   - All colour tokens from PRD section 13 as CSS variables on `:root`, plus the dark mode values under `@media (prefers-color-scheme: dark)`.
   - Inter from Google Fonts, base font size 18 px, line height 1.5.
   - Mobile-first layout: single column; at 768 px and up, the app sits in a centred column up to 480 px wide.
   - Components: `.card`, `.btn-primary`, `.btn-secondary`, `.input`, `.label`, `.hint`, `.error`, `.badge-offline`, `.result-pass`, `.result-review`, `.result-stop`, `.amount`, `.table-compare`.
   - Buttons at least 48 px tall, full width on phones.
2. `public/index.html`: app shell with a header (Thembeka logo text in `--green` and the Offline badge), a `<main id="screen">` area, and script tags.
3. `public/js/app.js`: very simple screen switching, e.g. `showScreen('home')`, by swapping the contents of `<main>`. No router library.
4. `public/js/screens/`: one file per screen from PRD section 7 (home, kyc, cost, scam, approve, sent, recipient, history). Each exports a `render(data)` function that returns HTML, plus small event handlers.
5. Use **fake data** in each screen for now (a hard-coded result object), clearly marked with `// TODO Phase 5: replace with API call`.
6. Result cards always show colour + icon + word (Looks safe / Check first / Stop).
7. Every check shows **who did it**, using the exact wording in PRD section 8 ("Who does what"): "Pre-check by Thembeka", "Safety check by Thembeka", "Sent to Demo Licensed Provider for official verification", "Verified by Demo Licensed Provider". Keep these strings in one file, `public/js/copy.js`, so they are easy to find and change.

**Checks**

- [ ] All 8 screens can be reached by clicking through
- [ ] Looks right at 360 px, 768 px and 1024 px (use the browser's device toolbar)
- [ ] Text is readable and buttons are easy to tap
- [ ] Dark mode looks right
- [ ] No horizontal scrolling on a 360 px phone

---

## Phase 3: Rules engine (code only, no AI)

These files must work with no AI at all. They are also the fallback when AI fails.

**Files and behaviour**

1. `src/checks/kycCheck.js` exports `checkKyc(details, accountName, today)`:
   - Missing required field: **stop**, reason names the field.
   - Expiry date before today: **stop**, "This document has expired."
   - Age under 18: **stop**.
   - Expiry within 3 months: **review**, shows the expiry date.
   - Name does not match the account name (ignore case and word order): **review**.
   - Otherwise: **pass**.
   - Returns `{ result, reasons: [] }`.
   - Limits (3 months, age 18) live in a `config` object at the top.
2. `src/checks/transferFlags.js` exports `checkTransfer(transfer, profile, history)`:
   - New recipient (not in the profile's known recipients): flag `new_recipient`.
   - Amount more than 2 x the usual send: flag `unusual_amount`.
   - 3 or more sends in the last 24 hours: flag `many_sends`.
   - Returns `{ flags: [] }`.
3. `src/money/costCompare.js` exports `compareCosts(amountCents, rates)`:
   - Returns the 4 options, each with fee in cents, rate markup, and what the recipient gets in US cents.
   - The informal option returns a **min and max** for what the recipient gets.
   - Sorted with the best deal for the recipient first.
4. `src/checks/combineResult.js` exports `combineResult({ flags, scamMatch, decision })`:
   - Starts from the code flags; any AI signal can only make the result **stricter**, never safer.
   - Rules, in a `config` object:
     - scam match score of 0.80 or more: **stop**
     - decision `stop` probability of 0.60 or more: **stop**
     - scam match score of 0.65 or more, or decision `review` the highest: **review**
     - 2 or more code flags: **review**
     - otherwise **pass**
   - Works when `scamMatch` or `decision` is `null` (AI not available).
5. `tests/`: tests using Node's built-in `node:test` and `node:assert` (no test library), covering every rule above, including the demo cases in PRD section 8.

**Checks**

- [ ] `npm test` passes
- [ ] Expired passport is **stop**; passport expiring in 2 months is **review**
- [ ] `combineResult` with no AI signals still returns a sensible result

---

## Phase 4: Local AI (QVAC)

Load each model **once** when the server starts and reuse it for every request.

**Step 4.1: Find the right model constants and functions**

1. Search the installed SDK for the available model constants and functions:

```powershell
Select-String -Path node_modules\@qvac\sdk\dist\**\*.d.ts -Pattern "EMBED|LIA|DECISION|embed|rag" | Select-Object -First 40
```

2. Also check the QVAC docs at https://docs.qvac.tether.io/sdk/js-ts-sdk/ for the embeddings and decision model examples.
3. **Report back** which of these exist in 0.22.0:
   - an embedding model constant and an embedding function
   - the Lia decision model constant and how to call it
4. If either is missing in 0.22.0, **stop and ask** before upgrading. The plan is: upgrade only this project to `@qvac/sdk@0.23.x`, run `npm test` and `npm run check-models`, and keep 0.22.0 if anything breaks.

**Step 4.2: Build the AI files**

1. `src/ai/models.js`
   - `loadAllModels()`: loads Qwen3 0.6B Q4 first, then the embedding model, then Lia. Logs progress. If one fails to load, logs it and carries on (that feature falls back to code only).
   - `getModelIds()`: returns the loaded ids (or `null` for any that failed).
   - `unloadAllModels()`: unloads all and calls `close()`. Called on `SIGINT`.
2. `src/ai/explain.js` exports `explainResult(kind, facts)`:
   - Builds a short prompt asking Qwen3 for **JSON only**: `{ "explanation": "..." }`, one or two plain sentences, no jargon.
   - Parses the JSON. If invalid, tries once to pull out the first `{...}` block. If still invalid, returns a code-written explanation.
   - 15 second timeout.
3. `src/ai/scamSearch.js`
   - On start, embeds every message in `data/scamLibrary.json` once and keeps the vectors in memory.
   - `findClosestScams(message)`: embeds the message with **the same model**, compares with cosine similarity, returns the top 2 `{ pattern, text, score }`.
   - If the SDK has a built-in RAG search that does the same job offline, use it instead and note it in a comment.
4. `src/ai/decision.js` exports `classifyMessage(message)`:
   - Calls Lia with the labels `pass`, `review`, `stop` and returns `{ pass, review, stop }` probabilities.
   - 10 second timeout; returns `null` on failure.
5. `scripts/checkModels.js`: loads all models, runs one example through each, prints the results and how long each took, then unloads.

**Checks**

- [ ] `npm run check-models` prints results for all 3 models (or clearly says which one is unavailable)
- [ ] Run it again with **Wi-Fi off**: it still works
- [ ] Scam 1 from `messages.json` has its closest match in `new_number_impersonation`
- [ ] Explanations are short, plain English and valid JSON

---

## Phase 5: API and screens connected

**Steps**

1. `src/routes/api.js`: the endpoints in PRD section 16. Each route does input checks, calls the functions from Phases 3 and 4, and returns the JSON shapes in PRD section 16.
2. `POST /api/scam/check` order:
   1. `checkTransfer` (code flags)
   2. `findClosestScams` (embeddings)
   3. `classifyMessage` (Lia)
   4. `combineResult`
   5. `explainResult`
   - returns `aiUsed: true` only if steps 2 to 5 used AI successfully.
3. `POST /api/send/prepare`: stores the prepared send in memory with a random id and an `expiresAt` 10 minutes ahead. Does **not** send.
4. `POST /api/send/approve`: only works with a valid, unexpired prepared id, and only if a Review result has `confirmedByUser: true`. In `WALLET_MODE=simulated`, returns a fake transaction reference starting with `SIM-` and a clear `simulated: true` flag.
5. `GET /api/status`: `modelsReady` per model, `walletMode`, and whether the device is online.
6. Replace every `// TODO Phase 5` fake data in the screens with `fetch` calls. Show a loading state while waiting and a friendly error if a call fails.
7. Home shows the **Offline checks ready** badge when models are loaded.

**Checks**

- [ ] Full flow works in simulated mode: KYC, cost, scam check, approve, sent, recipient confirm
- [ ] Scam 1 and Scam 2 return **Stop**; the genuine message returns **Pass**
- [ ] Approve button stays disabled for Review until the tick box is ticked
- [ ] Wi-Fi off: KYC, cost and scam checks all work
- [ ] No way to send without the approve step (try calling `/api/send/approve` without a prepared id: it must refuse)

---

## Phase 6: Wallet (WDK)

Do this phase after confirming the test network and test USDT steps at office hours.

**Steps**

1. Install:

```powershell
npm install @tetherto/wdk @tetherto/wdk-wallet-evm
```

2. `src/money/wallet.js`
   - Reads `WALLET_MODE`, `SEED_PHRASE`, `RPC_URL`, `USDT_TOKEN_ADDRESS` from `.env`.
   - `WALLET_MODE=simulated`: every function returns realistic fake values (keeps the demo safe if the network fails).
   - `WALLET_MODE=testnet`:
     - creates the wallet with `new WalletManagerEvm(seedPhrase, { provider: RPC_URL })`
     - `getAccount(0)`, `getAddress()`
     - balance, quote and transfer using the calls documented for `@tetherto/wdk-wallet-evm`. **Look these up in the package's README or type files before writing them.**
   - `prepareTransfer` only quotes; `sendTransfer` is called **only** from the approve route.
3. Never log the seed phrase. Log only the last 4 characters of addresses.
4. Generate the demo wallets once with a small script, save the seed phrases in `.env` only, and fund the sender with test USDT.

**Checks**

- [ ] Home shows the real test USDT balance
- [ ] Approve sends a real test transaction and shows its reference
- [ ] Switching `WALLET_MODE` back to `simulated` still works
- [ ] `git status` shows no `.env` changes staged

---

## Phase 7: History, confirm and polish

**Steps**

1. Save each completed send to `data/history.json` (gitignored): date, recipient, amount, result, reference, confirmed.
2. Recipient view (`/recipient` screen): shows the latest send to Grandma Moyo with a large **Received** button that calls `/api/send/confirm`.
3. Sender's Sent screen checks every 3 seconds and changes to "Grandma Moyo confirmed".
4. History screen lists sends, newest first.
5. Polish pass:
   - All text in plain English, no crypto jargon on screen.
   - Check every screen at 360 px, 768 px and 1024 px.
   - Check keyboard focus and labels.
   - Add the "Demo rates" label on the cost screen.
6. Run the full testing checklist in PRD section 19.

**Checks**

- [ ] Every item in PRD section 19 is ticked

---

## Phase 8: README and demo prep

**Steps**

1. `README.md` with:
   - one-line description and the problem in 3 sentences
   - screenshots (from `docs/screenshots/`)
   - requirements (Node 22.21.x, RAM, disk space for models)
   - install and run steps for Windows and macOS
   - how to run with Wi-Fi off
   - what works, what was tested, and known issues
   - simulated vs testnet wallet modes
   - tech stack, licence, author
2. Fresh-clone test: clone the repo into a new folder and follow the README exactly.
3. Record the demo video following the script in PRD section 6.
4. Record a backup screen recording of the full flow.

**Checks**

- [ ] Fresh clone works by following only the README
- [ ] Demo video under the time limit
- [ ] Repo is public, with no secrets in any commit (`git log --all -- .env` returns nothing)
