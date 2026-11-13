// src/checks/transferFlags.js
// Code rules that look at the transfer itself: who it goes to, how much,
// and how often. These run on the device and never need the AI.

const config = {
  unusualAmountMultiplier: 2,
  manySendsCount: 3,
  manySendsHours: 24
};

export function checkTransfer(transfer, senderProfile, history = []) {
  const flags = [];

  // A new recipient is the most common sign in "new number" scams.
  const knownRecipients = senderProfile.knownRecipients || [];
  if (!knownRecipients.includes(transfer.recipientId)) {
    flags.push({ id: 'new_recipient', reason: 'You have not sent money to this person before.' });
  }

  // Much more than usual is worth a second look.
  const usualAmount = senderProfile.usualSendCents || 0;
  if (usualAmount > 0 && transfer.amountCents > usualAmount * config.unusualAmountMultiplier) {
    flags.push({ id: 'unusual_amount', reason: 'This is much more than you usually send.' });
  }

  // Many sends in a short time can mean someone is pressuring you.
  const recentSends = countRecentSends(history, config.manySendsHours);
  if (recentSends >= config.manySendsCount) {
    flags.push({ id: 'many_sends', reason: 'You have sent money several times in the last day.' });
  }

  return { flags };
}

function countRecentSends(history, hours) {
  const cutOff = Date.now() - hours * 60 * 60 * 1000;
  let count = 0;

  for (const send of history) {
    if (new Date(send.date).getTime() > cutOff) {
      count = count + 1;
    }
  }
  return count;
}
