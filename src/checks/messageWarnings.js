// src/checks/messageWarnings.js
// Simple word rules for the message that asked for money.
// The AI scam search is smarter, but these rules always work, even if the AI
// is not loaded. That way the safety check never depends on the AI alone.

const warningRules = [
  {
    id: 'new_number_impersonation',
    serious: true,
    reason: 'Claims to be someone you know, using a new number.',
    words: [/new (number|line|phone)/i, /my other number/i, /lost my phone/i, /phone (broke|is broken)/i]
  },
  {
    id: 'secrecy',
    serious: true,
    reason: 'Asks you to keep the request confidential.',
    words: [/don'?t tell/i, /do not tell/i, /keep (this|it) (a )?secret/i, /between us/i]
  },
  {
    id: 'urgency',
    serious: false,
    reason: 'Pressures you to send money urgently.',
    words: [/urgent/i, /right now/i, /immediately/i, /asap/i, /hurry/i, /\btoday\b/i, /quickly/i]
  },
  {
    id: 'pay_to_receive',
    serious: true,
    reason: 'Requests an advance fee for a prize, parcel, job or loan.',
    words: [
      /(won|winner|prize|congratulations).*(fee|pay)/i,
      /(fee|pay).*(prize|claim|parcel|release)/i,
      /(job|loan).*(fee|pay).*first/i
    ]
  },
  {
    id: 'money_mule',
    serious: true,
    reason: 'Asks you to receive funds and forward them to someone else.',
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
