# Thembeka: Product Requirements Document

**Version:** 1.0
**Date:** 12 November 2026
**Owner:** Sijabulile "Jabu" Ncube
**Event:** GAIC x Tether Advanced AI Foundations Bootcamp, Demo Day 14 November 2026
**Status:** Ready to build

---

## Table of contents

1. [Overview](#1-overview)
2. [The problem](#2-the-problem)
3. [Users and personas](#3-users-and-personas)
4. [Goals and success metrics](#4-goals-and-success-metrics)
5. [Scope](#5-scope)
6. [User flow](#6-user-flow)
7. [Screens (UI/UX)](#7-screens-uiux)
8. [Functional requirements](#8-functional-requirements)
9. [Local AI design (QVAC)](#9-local-ai-design-qvac)
10. [Wallet and payments (WDK)](#10-wallet-and-payments-wdk)
11. [Regulation, compliance and privacy](#11-regulation-compliance-and-privacy)
12. [Business model and growth](#12-business-model-and-growth)
13. [Design system](#13-design-system)
14. [Tech stack and architecture](#14-tech-stack-and-architecture)
15. [Project structure](#15-project-structure)
16. [API endpoints](#16-api-endpoints)
17. [Sample data](#17-sample-data)
18. [Code standards](#18-code-standards)
19. [Testing and demo checklist](#19-testing-and-demo-checklist)
20. [Build plan](#20-build-plan)
21. [Risks and open questions](#21-risks-and-open-questions)
22. [Sources](#22-sources)

---

## 1. Overview

**Thembeka** (isiZulu: "be trustworthy") is a trusted, legal and private way for Africans to send money home in USDT. A local AI on the phone checks the sender's KYC and screens every transfer for scams, offline, and nothing is sent until the person approves.

> **Pitch line:** "Thembeka replaces the informal money carrier with a trusted, legal, private way to send money home."

**What makes it different**

| | Informal carrier | Traditional transfer service | Thembeka |
|---|---|---|---|
| Fee known upfront | No, changes every month | Yes | Yes |
| Receipt and proof of delivery | No | Yes | Yes, recipient confirms |
| Scam check before sending | No | No | Yes, on the phone, offline |
| KYC checked before submitting | No | At the counter | Yes, privately on the phone |
| Personal data leaves the phone | Cash only | Yes | Only what the licensed provider needs, after approval |

---

## 2. The problem

Millions of African migrants and cross-border traders send money home through informal channels because formal ones are slow, expensive or hard to access.

When Tendai sends money to Grandma Moyo, an informal carrier takes his cash. The carrier then drives it to her home in a rural area, or hands it to someone else to deliver. Tendai pays for every trip and every pair of hands along the way. The fee is never fixed: it changes from month to month, so he never knows in advance how much it will cost or how much Grandma Moyo will actually receive.

In one documented case, an agent charged a 15% commission and the sender spent almost R1,000 on airtime checking the money had arrived ([The New Humanitarian](https://www.thenewhumanitarian.org/analysis/2013/02/27/african-migrants-pay-high-prices-send-money-home)). Every extra pair of hands is another chance for the money to go missing, with no receipt and no recourse. Recipients in Malawi describe the same problem: "some were not honest. I was not getting the whole amount" ([The Nation, Malawi](https://mwnation.com/queuing-money-sa/)).

### The problem is continent-wide

| Country / region | What informal money carriers and changers are commonly called |
|---|---|
| Zimbabwe | *Omalayitsha* (cross-border couriers), *osiphatheleni* (street money changers, Bulawayo) |
| Malawi | *Onyamula katundu* (Chichewa: transporters who carry goods and money home) |
| Mozambique, Angola | *Cambistas* (street money changers) |
| DRC | *Cambistes* (street money changers) |
| Nigeria | *Aboki* or *mallam* FX dealers (street changers) |
| Somalia, East Africa | *Hawala* (informal transfer networks) |

In the app and pitch they are called **informal money carriers and changers**.

### Why now

- Nearly 8 million South Africans already hold dollar stablecoins, mostly to protect savings from the rand ([Launch Base Africa](https://launchbaseafrica.com/2025/11/27/south-africas-stablecoin-obsession-is-a-5bn-headache-for-regulators/)).
- Stablecoins reportedly cut the cost of a $200 transfer by about 60% compared with traditional rails ([Launch Base Africa](https://launchbaseafrica.com/2025/11/27/south-africas-stablecoin-obsession-is-a-5bn-headache-for-regulators/)).
- USDT is **not legal tender** in South Africa and is not recognised as money. Regulators do not approve it for local payments ([Bitcoin.com](https://news.bitcoin.com/south-africa-rules-out-foreign-stablecoins-as-payment-tools-to-curb-dollarization/), [Pulse](https://www.pulse.bot/legal/news/bitcoin-and-stablecoins-are-not-money-in-south-africa-418501d4-6427-41d1-99ac-54cdde8d08e7/)).
- It is **not banned**: buying, holding and sending it through FSCA-licensed crypto platforms is legal, and the FSCA has approved over 200 licences ([Launch Base Africa](https://launchbaseafrica.com/2025/11/27/south-africas-stablecoin-obsession-is-a-5bn-headache-for-regulators/)).
- Most everyday use is informal and unprotected. Thembeka makes it safe, legal and simple for people who are not crypto experts.

---

## 3. Users and personas

| Persona | Who they are | What they need | What scares them today |
|---|---|---|---|
| **Tendai, the sender** (primary) | Zimbabwean, 31, works in a Johannesburg restaurant, sends money home monthly | Cheap, fast, safe transfers; a fixed fee; proof it arrived | Money lost with an informal carrier; scam messages pretending to be family |
| **Grandma Moyo, the recipient** | Tendai's grandmother, lives in a rural area, basic phone skills | To receive money and confirm it simply | Not knowing if money is coming; being cheated at the exchange |
| **Steve, the cross-border trader** (secondary) | Malawian trader buying stock in SA to sell at home | Pay suppliers and move earnings without carrying cash across the border | Theft at the border, bad street rates |
| **Licensed provider** (partner) | A licensed crypto asset service provider that holds KYC and converts to and from rand | Complete, accurate KYC applications; fewer fraud cases | Incomplete documents, money mule accounts |

---

## 4. Goals and success metrics

**Demo Day goal:** one flawless end-to-end send, with the AI running offline and a human approving every step.

**Demo Day checklist**

- [ ] A full send works live: KYC check, scam check, cost comparison, approval, USDT sent, recipient confirms
- [ ] Scam check and KYC check run with Wi-Fi off
- [ ] A scam message is caught and the payment is held
- [ ] Public repo with a README a stranger can run, plus a demo video

**After the bootcamp**

| Metric | Why it matters |
|---|---|
| Share of sends that arrive and are confirmed | Trust: money must reach home |
| Scam sends stopped before approval | Protection: the core promise |
| KYC applications accepted first time | Fewer rejected applications at the licensed provider |
| Saving per send against informal and traditional options | The reason people switch |

---

## 5. Scope

| # | Feature | Demo Day | Expertise it shows |
|---|---|---|---|
| 1 | **Trusted alternative to informal carriers**: product story and positioning | Yes (pitch + UI) | Market insight |
| 2 | **Offline KYC pre-check**: passport or ID from any African country checked on the phone before submission | Yes | KYC |
| 3 | **Scam and money mule shield**: every send screened for red flags, held until confirmed | Yes | Fraud |
| 4 | **True-cost comparison**: what the recipient actually gets per option, fee shown upfront | Yes | Finance |
| 5 | **Recipient confirms**: the recipient taps to confirm money arrived, building a send history | Yes (simple) | Trust |
| 6 | **African languages and voice**: Ndebele, Shona, Chichewa, Swahili, isiZulu; speak instead of type | Later | Inclusion |

**Out of scope for Demo Day**

- Real passport photo scanning (details are typed or loaded from sample data)
- Real rand on-ramp and off-ramp (shown as the licensed provider's step)
- Live exchange rates (fixed demo rates, clearly labelled)
- An app store build (Thembeka is a responsive web app that opens in the phone's browser)

---

## 6. User flow

```
 KYC pre-check  ->  True-cost check  ->  Paste the request  ->  Scam check
   (offline)                                                    (offline AI)
                                                                     |
                                       +-----------------------------+------------+
                                       | pass / review                             | stop
                                       v                                           v
   Saved to history  <-  Grandma confirms  <-  USDT sent  <-  APPROVE AND SEND   Payment held
                                                              (the human step)   (reason explained)
```

The two checks run on the phone with no internet; only the approved send needs a network. A Review result adds a "call to confirm" step before approval.

### 2-minute demo script

1. **The problem (20 s):** "Every month, Tendai sends money home to Grandma Moyo through an informal carrier. The fee changes every month, and sometimes the money never arrives."
2. **Wi-Fi off (10 s):** switch Wi-Fi off on screen.
3. **KYC pre-check (20 s):** Tendai enters his Zimbabwean passport details. Thembeka spots it expires in 2 months and explains what to do.
4. **Scam caught (30 s):** paste "Hi it's your brother, new number, send R2,000 urgently, don't tell mum." Result: **Stop**, with the reasons in plain language and the closest known scam it matches.
5. **Genuine send (25 s):** Grandma Moyo's real request. Result: **Pass**. Cost comparison: "Grandma Moyo gets more with Thembeka, and the fee is fixed."
6. **Wi-Fi on, approve (10 s):** Tendai taps **Approve and send**. USDT arrives; Grandma Moyo taps **Received**.
7. **Close (5 s):** "Thembeka: money you can trust to arrive."

---

## 7. Screens (UI/UX)

Mobile first: every screen is designed for a 360 px wide phone, then widens to a centred card on tablet and laptop.

| # | Screen | What the user sees | Main action |
|---|---|---|---|
| S1 | **Home** | Greeting, USDT balance, last send and its status, "Offline checks ready" badge | **Send money home** |
| S2 | **KYC check** | Form: name, document type, country, number, date of birth, expiry, nationality. Result card: Pass / Review / Stop with plain-language reasons | **Check my details**, then **Submit to provider** |
| S3 | **Amount and true cost** | Amount in rand, recipient. Comparison table of 4 options with fee, rate markup and what the recipient gets. One-line summary | **Continue** |
| S4 | **Scam check** | Box to paste the message that asked for money. Result card with risk level, reasons, closest known scam pattern | **Check this message** |
| S5 | **Review and approve** | Summary: recipient, USDT amount, fee, scam result, KYC status. Review results show a required "I have called the person" tick box | **Approve and send** |
| S6 | **Sent and confirmed** | Transaction reference, "Waiting for Grandma Moyo", then "Grandma Moyo confirmed" | **Done** |
| S7 | **Recipient view** | Large text: amount received and from whom | **Received** |
| S8 | **History** | List of sends with date, amount, status | Tap to view receipt |

**UX rules**

- One main action per screen, always at the bottom within thumb reach.
- Results always use the same three states with colour **and** an icon **and** a word, so meaning never depends on colour alone.
- Every AI result shows **why** in one or two short sentences.
- A clear "Offline" badge appears whenever the AI is working without internet.
- Every check says **who did it**: "Pre-check by Thembeka", "Safety check by Thembeka", "Verified by [provider name]" (see section 8, Who does what).
- No crypto jargon on screen: "send", "balance", "fee", not "gas", "wallet address" or "chain" (addresses appear only on the receipt).

---

## 8. Functional requirements

Every check gives a clear result (**Pass**, **Review** or **Stop**), the reasons in plain language, and a next step. Nothing moves without the person's approval.

### Who does what: KYC and fraud checks

Thembeka does a **pre-check** on the phone. The **licensed provider** does the **official** verification. The **person** always makes the final decision. The app must say this clearly on every screen where a check happens.

| Check | Who does it | Where | What it means for the user |
|---|---|---|---|
| KYC pre-check | **Thembeka** (code rules + local AI) | On the phone, offline | "We checked your details are complete and valid before you submit them." Not an official verification. |
| Official KYC verification | **The licensed provider** (an FSCA-licensed crypto asset service provider, which must verify customers under FICA) | Provider's systems, after the user approves sharing | "Your identity is officially verified by [provider name]." Only the provider can approve an account. |
| Scam and money mule check on each send | **Thembeka** (code rules, scam library search, decision model, plain-language explanation) | On the phone, offline | "We checked this request for warning signs." A warning, not a guarantee. |
| Ongoing fraud and anti-money laundering monitoring | **The licensed provider** | Provider's systems | The provider may also review or hold transactions under its own rules. |
| Final decision to send | **The user** | On the phone | Nothing is sent until the user taps **Approve and send**. |

**Required wording in the app**

- KYC screen title: **"Check my details before submitting"**, with the line *"This is a pre-check on your phone. [Provider name] does the official verification."*
- KYC result card label: **"Pre-check by Thembeka"**.
- After submitting: **"Sent to [provider name] for official verification"**, then **"Verified by [provider name]"** (simulated in the demo and labelled as such).
- Scam result card label: **"Safety check by Thembeka"**, with the line *"This check runs on your phone. It can warn you, but you decide."*
- Approve screen: *"You are choosing to send this money. Thembeka and [provider name] cannot reverse a completed send."*
- For the demo, the provider is shown as **"Demo Licensed Provider"**, clearly fictional.

### F2: Offline KYC pre-check

1. User enters passport or national ID details: full name, document type, issuing country (any African country), number, date of birth, expiry date, nationality.
2. Code checks the hard rules: no missing fields, document not expired, adult age, number format plausible for the document type, name on document matches the account name.
3. Code flags soft risks: expiry within 3 months, name mismatch (spelling or order), details already used on another profile on this device.
4. Local AI explains the result in plain language and lists what to fix.
5. User approves sending the application to the licensed provider. Until then, nothing leaves the phone.

**Acceptance criteria**
- An expired document always returns **Stop**.
- A document expiring within 3 months returns **Review** with the expiry date shown.
- All fields complete and valid returns **Pass**.
- Works with Wi-Fi off.

### F3: Scam and money mule shield

1. Before each send, the user can paste the message that asked for the money (WhatsApp, SMS).
2. Code checks transfer red flags: new recipient, amount far above this user's usual send, many sends in a short time, recipient used by many senders.
3. **Scam library search (embeddings):** the message is turned into an embedding and compared with a small library of known scam messages (impersonation, urgency, fake jobs or prizes, "receive and forward" money mule requests). The top 2 matches and their similarity scores are returned. This catches scams worded differently from any example, because it matches meaning rather than exact words.
4. **Decision model:** a small decision model (Lia) classifies the message as Pass, Review or Stop and returns the probabilities as JSON in one step.
5. **Explanation:** Qwen3 writes the result in plain language and names the scam pattern it resembles.
6. Code combines the red flags, the closest scam match and the decision model's result:
   - **Pass:** send normally.
   - **Review:** warning; user must tick "I have called the person to confirm".
   - **Stop:** payment held and explained; user can still proceed after a second confirmation.
7. The scam library is a JSON file of 15 to 20 fictional examples, stored and searched with the same embedding model.

**Acceptance criteria**
- The "new number, urgent, don't tell mum" demo message returns **Stop**.
- Grandma Moyo's genuine request returns **Pass**.
- If any AI step fails or times out, the code-only result is shown with a note.
- Works with Wi-Fi off.

### F4: True-cost comparison

1. User enters the amount in rand.
2. App shows what the recipient gets through each option: Thembeka (USDT), a traditional money transfer service, a bank transfer and an informal carrier or street changer.
3. Each option shows fee, exchange-rate markup and final amount in US dollars. Demo rates are fixed and labelled "Demo rates".
4. Local AI gives a one-line summary, e.g. "Grandma Moyo gets $8 more with Thembeka this month."

**Acceptance criteria**
- All amounts are calculated in code, never by the AI.
- The informal option shows a fee range, not a single number, because it changes every month.

### F5: Recipient confirms

1. After sending, the recipient sees the amount and taps **Received**.
2. The sender sees "Grandma Moyo confirmed" and the send is saved to history.

### Approval and send (all features)

1. Summary screen: recipient, amount in USDT, estimated rand cost, scam result, KYC status.
2. User taps **Approve and send**; the wallet signs and sends USDT.
3. A receipt is shown and saved.

**Acceptance criteria**
- No code path sends money without the approval tap.
- The approve button is disabled until a Review tick box is ticked.

---

## 9. Local AI design (QVAC)

Code makes every decision that must be exact; local AI reads language and explains results. Small models need strict rules, deterministic flows and default fallbacks, so every AI step has a code-only fallback.

| Job | Done by | Why |
|---|---|---|
| KYC rules (expiry, age, missing fields) | Code | Must be exact every time |
| Transfer red flags (amount, frequency, new recipient) | Code | Numbers and rules, not language |
| Cost comparison maths | Code | Money must be calculated, never guessed |
| Finding similar known scams | Embedding model + scam library | Matches meaning, not exact words |
| Classifying the message | Lia decision model | Fast, consistent JSON probabilities in one step |
| Plain-language explanation of every result | Qwen3 0.6B | Makes the app usable for non-experts |
| Final Pass / Review / Stop | Code combines all three, human decides | No single point of failure |

**Models (all run on the device)**

| Model | Job | Approx. size |
|---|---|---|
| Qwen3 0.6B Q4 (`QWEN3_600M_INST_Q4`) | Plain-language explanations | 380 MB |
| Embedding model, e.g. Qwen3 Embedding 0.6B | Scam library search | 700 MB |
| Lia decision model | Pass / Review / Stop probabilities | 300 MB |

Qwen3 is already downloaded and tested on a Windows 11 laptop (about 20 tokens per second, works with Wi-Fi off).

**Structured output:** every AI answer is JSON, validated in code before anything is shown.

```json
{
  "risk": "high",
  "flags": ["urgency", "new_number_impersonation"],
  "explanation": "The message says it is from your brother on a new number and asks for money today. Call his old number first."
}
```

**Model lifecycle**

- Load all three models once when the server starts, and show "Offline checks ready" on Home.
- Reuse the loaded models for every request.
- Unload models and close the SDK when the server stops.

---

## 10. Wallet and payments (WDK)

Thembeka uses Tether's Wallet Development Kit for a self-custodial USDT wallet, and every send needs the person's explicit approval.

**Packages:** `@tetherto/wdk` (core) and `@tetherto/wdk-wallet-evm` (EVM wallet module), Node.js 18 or higher ([WDK docs](https://docs.wdk.tether.io/sdk/core-module/usage/getting-started)).

**Wallet steps**

1. **Create or restore wallet:** from a seed phrase kept in `.env`.
2. **Check balance:** show the sender's USDT balance on Home.
3. **Prepare payment:** build the transfer (recipient, amount, estimated network fee) but do not send it.
4. **Show summary:** recipient, amount, fee, scam result, KYC status.
5. **Human approval:** only a tap on **Approve and send** signs and sends the transfer.
6. **Confirm:** show the transaction reference and wait for the recipient's "Received".

**Starting code from the WDK docs**

```js
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'

const wallet = new WalletManagerEvm(seedPhrase, {
  provider: process.env.RPC_URL
})

const account = await wallet.getAccount(0)
const address = await account.getAddress()
```

**Demo setup**

- Test network and test USDT only, never real funds.
- Seed phrases and keys stay in a local `.env` file that is never committed to GitHub.
- The AI never holds keys and cannot trigger a send. It can only recommend.

**To confirm at office hours:** the balance, quote and transfer calls, which test network to use, and how to get test USDT.

---

## 11. Regulation, compliance and privacy

Thembeka moves informal money into the formal system: it sends through licensed providers, does proper KYC and stays within exchange control limits. It is a prototype and not legal advice.

| Topic | Position |
|---|---|
| Stablecoins in SA | The SARB and FSCA said in June 2026 that stablecoins are not legal tender and the SARB is unlikely to approve foreign-currency stablecoins for domestic payments. Thembeka is for **sending home and saving**, not local shopping payments. |
| Licensing | Rand conversion and KYC go through a licensed crypto asset service provider (the FSCA has approved over 200). Buying, holding and sending USDT through these licensed platforms is legal. |
| Exchange control | Cross-border sends stay within SARB allowance limits; large sends are flagged. |
| KYC | Passport or national ID from any African country, pre-checked on the phone, submitted only after approval. |
| Privacy (POPIA) | ID details and messages are processed on the device. Only what the licensed provider needs is shared, with consent. |
| Demo data | All people, documents and wallets in the demo are fictional. |

---

## 12. Business model and growth

Thembeka earns from a small, transparent fee per send that stays below what senders pay informal carriers today, plus partner revenue from licensed providers.

**How it makes money**

| Revenue stream | Who pays | Why they pay |
|---|---|---|
| Send fee | Sender | Cheaper, safer and traceable compared with informal carriers, with the fee shown upfront before every send |
| Revenue share on rand conversion | Licensed provider | Thembeka brings them new, verified customers |
| KYC pre-check service | Licensed providers | Fewer rejected and fraudulent applications |
| Trader accounts | Cross-border traders like Steve | Records of every payment and supplier, plus higher limits |

Exact fees are set with the licensed partner and tested with real senders.

**How it grows**

1. **Start with one corridor:** South Africa to Zimbabwe, the largest migrant community and the clearest pain.
2. **Add nearby corridors:** Malawi and Mozambique, using the same app with local partners.
3. **Grow through trust networks:** churches, burial societies, stokvels, community WhatsApp groups and cross-border traders' associations. People switch when someone they trust has already used it.
4. **Reach people who don't read English comfortably:** Ndebele, Shona, Chichewa, Swahili and isiZulu, plus voice input and read-aloud results.
5. **Expand across Africa:** any corridor where people already rely on informal carriers and changers.

**Why this founder**

Sijabulile Ncube has over a decade in South African banking across credit risk, vehicle finance, KYC, and forensic and investigative auditing. Thembeka is built on the fraud and KYC problems she works with every day, now solved for the people banks find hardest to serve.

---

## 13. Design system

The look follows the USDT and Tether colour family: green and teal on clean white, with deep near-black text. It should feel calm, trustworthy and simple, like a bank app for people who have never used a bank app.

### Colours

| Token | Hex | Use |
|---|---|---|
| `--green` | `#26A17B` | USDT green. Brand accent, logo, icons, large headings, progress |
| `--green-dark` | `#1B7A5D` | Primary buttons and links (white text passes contrast) |
| `--green-soft` | `#E8F5F0` | Card highlights, selected states, Pass background |
| `--teal` | `#009393` | Tether teal. Secondary accent, Offline badge, illustrations |
| `--teal-dark` | `#007A7A` | Secondary buttons with white text |
| `--ink` | `#0E1513` | Main text |
| `--ink-soft` | `#4A5752` | Secondary text, labels |
| `--line` | `#D9E2DE` | Borders and dividers |
| `--surface` | `#FFFFFF` | Cards |
| `--background` | `#F5F8F7` | Page background |
| `--review` | `#F2A900` | Review state (with dark text) |
| `--review-soft` | `#FFF6DB` | Review background |
| `--stop` | `#C0392B` | Stop state (white text passes contrast) |
| `--stop-soft` | `#FCEBE9` | Stop background |

**Contrast rule:** white text only on `--green-dark`, `--teal-dark` or `--stop`. The bright `--green` and `--teal` are for accents, icons and large text, not small white text.

**Dark mode:** `--background #0B1210`, `--surface #131D1A`, `--ink #EAF2EF`, `--ink-soft #9FB0A9`, `--line #24332E`; accents stay the same.

### Result states

| State | Colour | Icon | Word |
|---|---|---|---|
| Pass | `--green-dark` on `--green-soft` | Tick | "Looks safe" |
| Review | `--ink` on `--review-soft`, `--review` border | Exclamation | "Check first" |
| Stop | `--stop` on `--stop-soft` | Hand | "Stop" |

### Typography

- Font: **Inter** (Google Fonts), falling back to the system font.
- Base size **18 px** for body text, so it is easy to read on small phones and for older users.
- Headings: 28 px (page title), 22 px (section), weight 600.
- Amounts: 36 px, weight 700, tabular numbers.
- Line height 1.5; sentences short.

### Layout and components

- Mobile first. Breakpoints: 360 px (phone), 768 px (tablet), 1024 px (laptop). On larger screens the app sits in a centred column up to 480 px wide.
- Spacing scale: 4, 8, 12, 16, 24, 32 px.
- Cards: white, 16 px corner radius, 1 px `--line` border, no heavy shadows.
- Buttons: full width on phones, at least **48 px tall**, 12 px radius, one primary button per screen.
- Inputs: 48 px tall, visible label above, helpful hint text below, clear error text in `--stop`.
- Badge: small rounded pill, e.g. teal "Offline" badge.

### Accessibility

- Text contrast at least 4.5:1.
- Tap targets at least 48 x 48 px.
- Meaning never shown by colour alone (colour + icon + word).
- Every input has a label; every button says what it does.
- Works with the phone's text size turned up.

---

## 14. Tech stack and architecture

```
+--------------------------- On the device: works offline ---------------------------+
|                                                                                     |
|   Thembeka web app (HTML, CSS, JavaScript)  --- screens, results, Approve button    |
|              |                                                                      |
|              v                                                                      |
|   Node.js + Express server                                                          |
|      |-- Rules engine (code): KYC rules, transfer red flags, cost maths             |
|      |-- Local AI (QVAC): scam library search, Lia decision, Qwen3 explanation      |
|      |-- WDK wallet: keys stay on the device, signs only after approval             |
|                                                                                     |
+-------------------------------------------------------------------------------------+
          |  (only after approval)                         |  (only after approval)
          v                                                v
   Licensed provider                                 USDT network (test)  -->  Grandma's wallet
   (receives approved KYC, rand conversion)
```

| Layer | Choice | Why |
|---|---|---|
| Runtime | Node.js 22.21.x | Tested with QVAC on Windows 11 |
| Server | Express | Small, well known, easy to read |
| Frontend | Plain HTML, CSS and JavaScript (no framework, no build step) | Simple to read, runs anywhere, fast on old phones |
| Local AI | `@qvac/sdk` 0.22.0 with Qwen3 0.6B Q4, an embedding model and the Lia decision model | Runs offline on the device |
| Wallet | `@tetherto/wdk` + `@tetherto/wdk-wallet-evm`, USDT on a test network | Tether's self-custodial wallet kit |
| Data | JSON files for sample profiles, messages, scam library and demo rates | No database needed for the demo |
| Repo | Public GitHub repo `thembeka`, MIT licence | Required for Demo Day |

---

## 15. Project structure

```
thembeka/
  README.md               how to install, run and test, plus what works and what's next
  PRD.md                  this document
  LICENSE                 MIT
  package.json            scripts: start, check-models
  .env.example            names of the secrets needed, with no real values
  .gitignore              node_modules, .env
  server.js               starts Express, loads the models once, serves the app

  src/
    ai/
      models.js           load and unload the three QVAC models
      scamSearch.js       embeddings search against the scam library
      decision.js         Lia decision model: Pass / Review / Stop probabilities
      explain.js          Qwen3 plain-language explanation as JSON
    checks/
      kycCheck.js         KYC hard rules and soft risks
      transferFlags.js    transfer red flags
      combineResult.js    turns all signals into Pass / Review / Stop
    money/
      costCompare.js      true-cost comparison maths
      wallet.js           WDK wallet: balance, prepare, send after approval
    routes/
      api.js              the API endpoints in section 16

  data/
    profiles.json         Tendai, Grandma Moyo, Steve (fictional)
    messages.json         demo messages: 1 genuine, 2 scams
    scamLibrary.json      15 to 20 fictional known scam messages
    demoRates.json        fixed, labelled demo exchange rates and fees

  public/
    index.html            the app shell
    css/styles.css        design tokens from section 13, mobile first
    js/app.js             screen navigation and API calls
    js/copy.js            all on-screen wording in one place, including who does each check
    js/screens/           one small file per screen (home, kyc, cost, scam, approve, sent, history)
    img/                  logo and icons

  scripts/
    checkModels.js        loads every model, runs one example each, prints timings

  tests/                  rules engine tests (Node's built-in test runner)

  docs/
    screenshots/          for the README
```

---

## 16. API endpoints

| Method | Path | Does | Needs internet |
|---|---|---|---|
| GET | `/api/status` | Are the models loaded? Is the device online? | No |
| POST | `/api/kyc/check` | Runs F2 rules and explanation | No |
| POST | `/api/kyc/submit` | Sends approved KYC to the provider (simulated in demo) | Yes |
| POST | `/api/cost` | Returns the 4-option comparison for an amount | No |
| POST | `/api/scam/check` | Runs F3: red flags, scam search, Lia, explanation | No |
| GET | `/api/wallet/balance` | USDT balance | Yes |
| POST | `/api/send/prepare` | Builds the transfer and summary, does not send | No |
| POST | `/api/send/approve` | Signs and sends, only with a valid prepared send id | Yes |
| POST | `/api/send/confirm` | Recipient marks the send as received | Yes |
| GET | `/api/history` | List of sends | No |

**Example response: `/api/scam/check`**

```json
{
  "result": "stop",
  "reasons": [
    "Says it is family on a new number",
    "Asks for money urgently",
    "Asks you to keep it secret"
  ],
  "closestScam": { "pattern": "new_number_impersonation", "score": 0.86 },
  "decision": { "pass": 0.04, "review": 0.11, "stop": 0.85 },
  "explanation": "This looks like a common scam. Call your brother on his old number before sending anything.",
  "aiUsed": true
}
```

---

## 17. Sample data

All demo data is fictional.

- **Tendai:** sender, Zimbabwean passport, usual send R1,500 a month.
- **Grandma Moyo:** recipient, test wallet address.
- **Steve:** Malawian trader, used for the history screen.
- **Messages:**
  - Genuine: "Tendai my child, school fees for your cousin are due on Friday. Thank you, Grandma."
  - Scam 1: "Hi it's your brother, new number, send R2,000 urgently, don't tell mum."
  - Scam 2: "Congratulations! You won a phone. Pay R350 delivery fee to claim it today."
- **Scam library:** 15 to 20 short fictional examples across impersonation, urgency, prizes, fake jobs, loan fees and money mule requests.
- **Demo rates:** one fixed rand to USD rate and fee set per option, labelled "Demo rates" in the app.

---

## 18. Code standards

The code must read like a clear, real project that a junior developer can follow on the first read.

- **Easy to read first, clever never.** Someone who has done a beginner JavaScript course should understand every file.
  - One idea per line; no long chains of methods.
  - `async` / `await`, not `.then()` chains.
  - `if` / `else` instead of nested ternaries (`a ? b : c ? d : e`).
  - Descriptive names: `daysUntilExpiry`, `scamMatch`, `approvedSend`, never `x`, `tmp` or `d`.
  - Early returns instead of deep nesting.
  - Every file starts with a 2 to 3 line comment saying what it does.
- **Plain JavaScript (ES modules).** No TypeScript, no frameworks on the frontend, no build tools.
- **Small files, one job each.** Most files under 100 lines; most functions under 30 lines.
- **Clear names over clever code.** `isExpired(expiryDate)`, not `chk(d)`. Full words, no abbreviations.
- **Short, friendly comments** in plain English, in first person, that explain *why*: `// I check expiry first because an expired passport is an instant stop.`
- **No magic numbers.** Limits such as "3 months" or "3 sends in 24 hours" live in one `config` object at the top of the file.
- **Every AI call has a fallback.** Wrap it in `try/catch`, add a timeout, and return the code-only result if it fails.
- **Money is calculated in cents** (whole numbers) to avoid rounding mistakes.
- **No secrets in the repo.** Seed phrases and RPC URLs only in `.env`; `.env.example` shows the names.
- **Consistent formatting** with Prettier defaults (2 spaces, single quotes, semicolons).
- **Helpful errors** for the user ("We couldn't reach the network. Your money has not been sent.") and detailed errors in the server log.

---

## 19. Testing and demo checklist

**Before Demo Day**

- [ ] `npm install` and `npm start` work on a clean copy of the repo
- [ ] All three models load and Home shows "Offline checks ready"
- [ ] Wi-Fi off: KYC check, cost comparison and scam check all work
- [ ] Scam 1 and Scam 2 return **Stop**; the genuine message returns **Pass**
- [ ] Expired passport returns **Stop**; passport expiring within 3 months returns **Review**
- [ ] Approve button stays disabled until the Review tick box is ticked
- [ ] Wi-Fi on: test USDT send completes and the recipient can confirm
- [ ] App looks right at 360 px, 768 px and 1024 px wide
- [ ] README tested by following it step by step
- [ ] Demo video recorded; backup screen recording saved

---

## 20. Build plan

**Thursday 12 November**

- [ ] Attend the 17:00 capstone build and dry run; note Demo Day rules and judging criteria
- [ ] Create the `thembeka` repo and project folder; install `@qvac/sdk` 0.22.0
- [ ] Sample data files
- [ ] F2 KYC pre-check: code rules working

**Friday 13 November**

- [ ] 12:00 office hours: confirm WDK calls, test network, Lia availability and judging criteria
- [ ] F3 scam shield: red flags, scam library search, Lia, Qwen3 explanation, with fallbacks
- [ ] F4 cost comparison with labelled demo rates
- [ ] WDK wallet: balance, prepare, approve, send on test network
- [ ] F5 recipient confirm and history
- [ ] Responsive UI using the design system
- [ ] README, demo video, full Wi-Fi-off rehearsal

**Saturday 14 November**

- [ ] Morning: final rehearsal and backup recording
- [ ] 13:00 Demo Day presentation

---

## 21. Risks and open questions

| Risk | Fallback |
|---|---|
| WDK integration takes longer than planned | Simulated send screen, labelled, with the real code path in the repo |
| Lia or the embedding model needs SDK 0.23 | Upgrade only the Thembeka project to 0.23 and retest; otherwise Qwen3 plus code rules |
| Small model misreads a scam message | Code red flags and the scam library still catch it; JSON fallback to code-only result |
| AI slow on the demo laptop | Pre-load all models before presenting; keep messages short |
| Judges question regulation | Section 11 ready; positioned as sending home through licensed providers |
| Live demo fails | Backup screen recording made Saturday morning |

**Open questions**

- [ ] Which WDK test network and test USDT should the demo use?
- [ ] Demo Day time limit per presenter and judging criteria?
- [ ] Is the $300 award per project, and what does the 2027 incubator include?
- [ ] Should the demo show Thembeka on a real phone as well as the laptop?

---

## 22. Sources

- [South Africa rules out foreign stablecoins as payment tools to curb dollarization](https://news.bitcoin.com/south-africa-rules-out-foreign-stablecoins-as-payment-tools-to-curb-dollarization/) (Bitcoin.com, SARB and FSCA statement of June 2026)
- [Bitcoin and stablecoins are not money in South Africa](https://www.pulse.bot/legal/news/bitcoin-and-stablecoins-are-not-money-in-south-africa-418501d4-6427-41d1-99ac-54cdde8d08e7/) (Pulse)
- [South Africa's stablecoin obsession is a $5bn headache for regulators](https://launchbaseafrica.com/2025/11/27/south-africas-stablecoin-obsession-is-a-5bn-headache-for-regulators/) (Launch Base Africa)
- [SARB flags crypto risks as users reach 7.8 million](https://www.fxstreet.com/cryptocurrencies/news/south-african-reserve-bank-flags-crypto-risks-as-users-reach-78-million-202511261025) (FXStreet)
- [African migrants pay high prices to send money home](https://www.thenewhumanitarian.org/analysis/2013/02/27/african-migrants-pay-high-prices-send-money-home) (The New Humanitarian)
- [Queuing for money from SA](https://mwnation.com/queuing-money-sa/) (The Nation, Malawi)
- [WDK documentation: getting started](https://docs.wdk.tether.io/sdk/core-module/usage/getting-started) (Tether)
- [QVAC SDK documentation](https://docs.qvac.tether.io/sdk/js-ts-sdk/) (Tether)
