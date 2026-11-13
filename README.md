# Thembeka

**Send money home safely.** Thembeka (isiZulu: "be trustworthy") is a trusted, legal and private way for Africans to send money home in USDT. A local AI on the device checks your ID details and screens every request for scams, **offline**, and nothing is sent until you approve it.

Built for the **GAIC x Tether Advanced AI Foundations Bootcamp** (November 2026) with Tether's **QVAC SDK** for local AI and the **Wallet Development Kit (WDK)** for USDT.

---

## The problem

Millions of African migrants send money home through informal carriers (*omalayitsha* in Zimbabwe, *onyamula katundu* in Malawi). The fee changes every month, the money passes through many hands, and sometimes it never arrives, with no receipt and no recourse. Scam messages pretending to be family make it worse.

## What Thembeka does

| Step | What happens | Where |
|---|---|---|
| 1. ID pre-check | Checks your passport or ID details are complete and valid before you submit them | On your device, offline |
| 2. True cost | Shows what the recipient actually gets with each option, with a fixed fee upfront | On your device |
| 3. Safety check | Checks the message that asked for money for scam and money mule warning signs | On your device, offline |
| 4. You approve | Nothing is sent until you tap **Approve and send** | You decide |
| 5. Recipient confirms | The recipient taps **Received**, so you know it arrived | Both devices |

**Who does what:** Thembeka does the **pre-checks** on the device. The **licensed provider** does the **official** ID verification and ongoing monitoring. **You** always make the final decision.

## How the safety check works

The code rules decide what must be exact. The local AI reads language and explains results. The AI can only make a result **stricter**, never safer.

| Layer | Done by |
|---|---|
| Transfer rules: new recipient, unusual amount, many sends | Code |
| Warning words: new number, secrecy, urgency, pay-to-receive, money mule | Code |
| Closest known scam, matched by meaning (not exact words) | EmbeddingGemma + a scam library (QVAC `embed`) |
| Looks safe / needs checking / looks like a scam, as probabilities | Laya decision model (QVAC `decide`) |
| Plain-language explanation | Qwen3 0.6B (QVAC `completion`) |

If any model is missing or slow, that step falls back to the code rules, so the app always works.

---

## Requirements

- **Node.js 22.21.x** (22.17 or newer) and **npm 10.9** or newer
- **8 GB RAM** minimum (16 GB recommended)
- About **1.2 GB** free disk space for the three models
- Internet for the **first run only** (to install packages and download the models)

Check your versions:

```
node --version
npm --version
```

## Install and run

```
git clone https://github.com/Sijabulile-Ncube/thembeka.git
cd thembeka
npm install
copy .env.example .env
npm start
```

On macOS or Linux, use `cp .env.example .env` instead of `copy`.

Open **http://localhost:3000** in your browser. The first start downloads the models; the badge at the top changes to **Offline checks ready** when they're loaded.

> `npm install` may report "vulnerabilities". Don't run `npm audit fix --force`: it can change the pinned QVAC SDK version.

### Other commands

| Command | What it does |
|---|---|
| `npm start` | Starts the app with the local AI models |
| `npm run start:no-ai` | Starts quickly without AI (code rules only), for testing screens |
| `npm test` | Runs the rule tests (KYC, safety check, cost maths) |
| `npm run check-models` | Loads all models and runs each on the demo messages, with timings |

## Test it offline

1. Run `npm start` once with Wi-Fi on, and wait for **Offline checks ready**.
2. Turn Wi-Fi **off**.
3. Run the ID pre-check, the true-cost comparison and the safety check. They all work with no internet.
4. Turn Wi-Fi back on for the final send (in testnet mode).

## Demo walkthrough

1. **Send money home**, then **Check my details**: the demo passport expires in 2 months, so the result is **Check first**.
2. **Submit** to the Demo Licensed Provider, then **Continue**.
3. **Compare the true cost** for R1,500: Grandma Moyo gets the most with Thembeka.
4. Tap **Brother on a new number**, then **Check this message**: the result is **Stop**.
5. Cancel, start again, and tap **Grandma Moyo's real request**: the result is **Looks safe**.
6. **Approve and send**.
7. Open **Grandma Moyo's view** in a second tab and tap **Received**. The first tab shows **Grandma Moyo confirmed**.

## Wallet modes

Set `WALLET_MODE` in `.env`:

| Mode | What it does |
|---|---|
| `simulated` (default) | No real money moves. A demo wallet with 1,000 test dollars. Sends get a `SIM-` reference. |
| `testnet` | Uses the WDK (`@tetherto/wdk-wallet-evm`) with test USDT on a test network. Needs `SEED_PHRASE`, `RPC_URL` and `USDT_TOKEN_ADDRESS` in `.env`. |

Never commit `.env`: it's listed in `.gitignore`.

---

## Project structure

```
server.js              starts the app, loads the models once
src/
  ai/                  QVAC: models, scam search, decision model, explanations
  checks/              code rules: KYC, transfer flags, warning words, combined result
  money/               cost comparison, wallet, send records
  routes/api.js        the API the screens call
  data.js              loads the demo data
data/                  fictional profiles, demo messages, scam library, demo rates
public/                the web app (plain HTML, CSS and JavaScript, mobile first)
scripts/checkModels.js model check with timings
tests/                 rule tests (Node's built-in test runner)
```

## What works and what's next

**Working and tested**
- ID pre-check with clear Pass / Check first / Stop results (8 tests)
- Safety check: all 3 demo messages give the expected result using the code rules alone (14 tests)
- True-cost comparison maths (4 tests)
- Full send flow in simulated mode, tested in a browser at phone and laptop sizes
- Approve button stays locked until warning confirmations are ticked
- Local AI models load and run through the QVAC SDK 0.22.0

**Known issues and next steps**
- Testnet sends need the WDK balance and transfer calls completed (`src/money/wallet.js`)
- Exchange rates are fixed demo rates
- Passport details are typed, not scanned
- Next: African languages (Ndebele, Shona, Chichewa, Swahili, isiZulu) and voice input

## Privacy

ID details and messages are processed on the device. Only what the licensed provider needs is shared, and only after the user approves. All people, documents and wallets in this repo are fictional.

## Tech stack

Node.js, Express, plain HTML/CSS/JavaScript, QVAC SDK 0.22.0 (Qwen3 0.6B, EmbeddingGemma 300M, Laya 322M), Tether WDK.

## Author

**Sijabulile "Jabu" Ncube**: credit risk specialist with over a decade in South African financial services, building in software development and AI.

- GitHub: [@Sijabulile-Ncube](https://github.com/Sijabulile-Ncube)
- LinkedIn: [linkedin.com/in/sijabulilemn](https://linkedin.com/in/sijabulilemn)

## Licence

MIT
