// public/js/screens/scam.js
// Step 3: the safety check. The person pastes the message that asked for money,
// and Thembeka checks it on the phone for scam and money mule warning signs.

import { callApi, resultCard, withLoading, stepsBar, escapeHtml } from '../helpers.js';
import { copy, patternNames } from '../copy.js';
import { goTo } from '../app.js';

export async function show(screenArea, state) {
  // Demo buttons fill in the Demo Day messages, so I don't have to type them live.
  const demoButtons = state.demo.messages.map((message) => {
    return `<button type="button" class="chip" data-message-id="${message.id}">${escapeHtml(message.label)}</button>`;
  });

  screenArea.innerHTML = `
    ${stepsBar(3)}
    <h1>${copy.scamTitle}</h1>
    <p class="muted">${copy.scamIntro}</p>

    <form id="scam-form" class="card" novalidate>
      <div class="field">
        <label class="label" for="message">The message that asked for money</label>
        <textarea class="textarea" id="message" placeholder="Paste the WhatsApp or SMS here">${escapeHtml(state.message)}</textarea>
        <div class="hint">Try a demo message:</div>
      </div>
      <div class="chip-row">${demoButtons.join('')}</div>
      <button class="btn btn-primary" type="submit" id="check-button">Check this message</button>
      <div id="scam-error" class="error" role="alert"></div>
    </form>

    <div id="scam-result"></div>
  `;

  for (const button of screenArea.querySelectorAll('[data-message-id]')) {
    button.addEventListener('click', () => fillDemoMessage(screenArea, state, button.dataset.messageId));
  }

  const form = screenArea.querySelector('#scam-form');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    state.message = screenArea.querySelector('#message').value.trim();

    const errorArea = screenArea.querySelector('#scam-error');
    errorArea.textContent = '';

    try {
      const button = screenArea.querySelector('#check-button');
      await withLoading(button, 'Checking on your phone...', async () => {
        state.scamCheck = await callApi('/scam/check', {
          recipientId: state.recipientId,
          amountCents: state.amountCents,
          message: state.message
        });
      });
      showResult(screenArea, state);
    } catch (error) {
      errorArea.textContent = error.message;
    }
  });

  if (state.scamCheck) {
    showResult(screenArea, state);
  }
}

// The demo messages also set the matching recipient and amount, like real life:
// the scammer is always a "new contact".
function fillDemoMessage(screenArea, state, messageId) {
  const message = state.demo.messages.find((item) => item.id === messageId);
  state.message = message.text;
  state.recipientId = message.recipientId;
  state.amountCents = message.amountCents;
  state.costComparison = null;
  screenArea.querySelector('#message').value = message.text;
}

function showResult(screenArea, state) {
  const check = state.scamCheck;
  let extraHtml = '';

  // If the scam library search found a close match, I show which known scam
  // it looks like and how close it is.
  if (check.closestScam) {
    const patternName = patternNames[check.closestScam.pattern] || check.closestScam.pattern;
    const percent = Math.round(check.closestScam.score * 100);
    extraHtml += `
      <div class="detail-box">
        <strong>Closest known scam:</strong> ${escapeHtml(patternName)} (${percent}% similar)
      </div>
    `;
  }

  if (check.decision) {
    const pass = Math.round(check.decision.pass * 100);
    const review = Math.round(check.decision.review * 100);
    const stop = Math.round(check.decision.stop * 100);
    extraHtml += `
      <div class="detail-box">
        <strong>Decision model:</strong> ${pass}% safe, ${review}% check, ${stop}% scam
        <div class="meter" aria-hidden="true">
          <span class="meter-pass" style="width:${pass}%"></span>
          <span class="meter-review" style="width:${review}%"></span>
          <span class="meter-stop" style="width:${stop}%"></span>
        </div>
      </div>
    `;
  }

  extraHtml += `<p class="muted" style="margin-top:12px">${copy.scamYouDecide}</p>`;

  const buttonText = check.result === 'pass' ? 'Continue' : 'Continue anyway';
  const buttonStyle = check.result === 'stop' ? 'btn-secondary' : 'btn-primary';

  screenArea.querySelector('#scam-result').innerHTML =
    resultCard({
      result: check.result,
      checkedBy: copy.scamCheckedBy,
      explanation: check.explanation,
      reasons: check.reasons,
      extraHtml
    }) +
    `<button class="btn ${buttonStyle}" id="continue">${buttonText}</button>
     <button class="btn btn-link" id="cancel">Cancel this send</button>`;

  screenArea.querySelector('#continue').addEventListener('click', () => goTo('approve'));
  screenArea.querySelector('#cancel').addEventListener('click', () => {
    state.scamCheck = null;
    state.message = '';
    goTo('home');
  });

  screenArea.querySelector('#scam-result').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
