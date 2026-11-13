// src/money/wallet.js
// The USDT wallet, using Tether's Wallet Development Kit (WDK).
//
// Two modes, set in .env:
//   simulated  no real money moves. Safe for practice, and a backup for the demo.
//   testnet    test USDT on a test network (Phase 6 of the implementation plan).
//
// The AI never touches this file. Only the approve route can call sendUsdt().

const walletMode = process.env.WALLET_MODE || 'simulated';

// Simulated balance for practice: 1,000.00 USDT, kept in US cents. Enough for many practice runs.
let simulatedBalanceUsdCents = 100000;

export function getWalletMode() {
  return walletMode;
}

export async function getBalance() {
  if (walletMode === 'simulated') {
    return { balanceUsdCents: simulatedBalanceUsdCents, simulated: true };
  }
  return getTestnetBalance();
}

// Preparing only works out the network fee. Nothing is sent here.
export async function prepareUsdtTransfer(recipientAddress, amountUsdCents) {
  if (walletMode === 'simulated') {
    return { networkFeeUsdCents: 5, simulated: true };
  }
  return prepareTestnetTransfer(recipientAddress, amountUsdCents);
}

export async function sendUsdt(recipientAddress, amountUsdCents) {
  if (walletMode === 'simulated') {
    if (amountUsdCents > simulatedBalanceUsdCents) {
      throw new Error('Not enough USDT in the wallet for this send.');
    }
    simulatedBalanceUsdCents = simulatedBalanceUsdCents - amountUsdCents;
    const reference = 'SIM-' + Math.random().toString(36).slice(2, 10).toUpperCase();
    return { reference, simulated: true };
  }
  return sendTestnetTransfer(recipientAddress, amountUsdCents);
}

// ---------------- Testnet mode (Phase 6) ----------------
// These calls follow the WDK docs. The wallet set-up below is from the docs:
// https://docs.wdk.tether.io/sdk/core-module/usage/getting-started
// The balance, quote and transfer calls must be confirmed from the
// @tetherto/wdk-wallet-evm README before they are filled in.

let testnetAccount = null;

async function getTestnetAccount() {
  if (testnetAccount) {
    return testnetAccount;
  }

  // I import the WDK only in testnet mode, so simulated mode works without it.
  const { default: WalletManagerEvm } = await import('@tetherto/wdk-wallet-evm');

  const wallet = new WalletManagerEvm(process.env.SEED_PHRASE, {
    provider: process.env.RPC_URL
  });

  testnetAccount = await wallet.getAccount(0);
  const address = await testnetAccount.getAddress();
  console.log(`Testnet wallet ready, address ending ${address.slice(-4)}`);
  return testnetAccount;
}

async function getTestnetBalance() {
  await getTestnetAccount();
  throw new Error('Testnet balance not set up yet. See IMPLEMENTATION_PLAN.md, Phase 6.');
}

async function prepareTestnetTransfer() {
  await getTestnetAccount();
  throw new Error('Testnet transfer quote not set up yet. See IMPLEMENTATION_PLAN.md, Phase 6.');
}

async function sendTestnetTransfer() {
  await getTestnetAccount();
  throw new Error('Testnet send not set up yet. See IMPLEMENTATION_PLAN.md, Phase 6.');
}
