// src/checks/messageWarnings.js
// Simple word rules for the message that asked for money.
// The AI scam search is smarter, but these rules always work, even if the AI
// is not loaded. That way the safety check never depends on the AI alone.

const warningRules = [
  {
    id: 'new_number_impersonation',
    serious: true,
    reason: 'Says it is someone you know on a new number.',
    words: [/new (number|line|phone)/i, /my other number/i, /lost my phone/i, /phone (broke|is broken)/i]
  },
  {
    id: 'secrecy',
    serious: true,
    reason: 'Asks you to keep it a secret.',
    words: [/don'?t tell/i, /do not tell/i, /keep (this|it) (a )?secret/i, /between us/i]
  },
  {
    id: 'urgency',
    serious: false,
    reason: 'Pushes you to send money quickly.',
    words: [/urgent/i, /right now/i, /immediately/i, /asap/i, /hurry/i, /\btoday\b/i, /quickly/i]
  },
  {
    id: 'pay_to_receive',
    serious: true,
    reason: 'Asks you to pay a fee to receive a prize, parcel, job or loan.',
    words: [
      /(won|winner|prize|congratulations).*(fee|pay)/i,
      /(fee|pay).*(prize|claim|parcel|release)/i,
      /(job|loan).*(fee|pay).*first/i
    ]
  },
  {
    id: 'money_mule',
    serious: true,
    reason: 'Asks you to receive money and pass it on to someone else.',
    words: [/send the rest/i, /forward it/i, /pass (it|them) on/i, /receive (a )?(payment|money|funds) for me/i]
  }
];

export function checkMessageWords(messageText = '') {
  const flags = [];

  for (const rule of warningRules) {
    const matched = rule.words.some((pattern) => pattern.test(messageText));
    if (matched) {
      flags.push({ id: rule.id, reason: rule.reason, serious: rule.serious });
    }
  }

  return { flags };
}
