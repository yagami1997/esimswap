/**
 * Unified dialog system. XSS-safe — all content set via textContent or DOM API.
 * Replaces the 6 duplicated dialog methods in the original app.js.
 */

let currentDialog = null;

/**
 * @typedef {{ label: string, variant: 'primary' | 'cancel', onClick: () => void }} DialogAction
 * @typedef {{ title: string, body: string | HTMLElement, type?: 'info'|'warning'|'error'|'success', actions?: DialogAction[] }} DialogConfig
 */

/**
 * Show a modal dialog.
 * @param {DialogConfig} config
 */
export function show({ title, body, type = 'info', actions = [] }) {
  close(); // dismiss any existing dialog

  const overlay = document.createElement('div');
  overlay.className = 'dialog-overlay';

  const box = document.createElement('div');
  box.className = `dialog-box dialog-${type}`;

  const heading = document.createElement('h3');
  heading.className = 'dialog-title';
  heading.textContent = title; // safe: textContent only

  const bodyEl = document.createElement('div');
  bodyEl.className = 'dialog-body';
  if (typeof body === 'string') {
    bodyEl.textContent = body; // safe: textContent only
  } else {
    bodyEl.appendChild(body); // safe: caller must build DOM safely
  }

  const actionsEl = document.createElement('div');
  actionsEl.className = 'dialog-actions';

  for (const action of actions) {
    const btn = document.createElement('button');
    btn.className = `dialog-btn dialog-btn-${action.variant}`;
    btn.textContent = action.label; // safe: textContent only
    btn.addEventListener('click', () => {
      close();
      action.onClick();
    });
    actionsEl.appendChild(btn);
  }

  box.appendChild(heading);
  box.appendChild(bodyEl);
  if (actions.length > 0) box.appendChild(actionsEl);

  overlay.appendChild(box);
  document.body.appendChild(overlay);
  currentDialog = overlay;

  // Click outside to close
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  // Trap focus in dialog
  box.setAttribute('tabindex', '-1');
  box.focus();
}

/** Close the current dialog if one is open. */
export function close() {
  if (currentDialog) {
    currentDialog.remove();
    currentDialog = null;
  }
}

/**
 * Build a safe DOM element displaying eSIM data fields.
 * Used when the dialog body needs to show structured data.
 * @param {{ label: string, value: string }[]} fields
 * @returns {HTMLElement}
 */
export function buildDataDisplay(fields) {
  const container = document.createElement('div');
  container.className = 'dialog-data-display';
  for (const { label, value } of fields) {
    const row = document.createElement('div');
    row.className = 'dialog-data-row';
    const labelEl = document.createElement('strong');
    labelEl.textContent = label;
    const valueEl = document.createElement('code');
    valueEl.className = 'dialog-data-value';
    valueEl.textContent = value; // safe: textContent
    row.appendChild(labelEl);
    row.appendChild(valueEl);
    container.appendChild(row);
  }
  return container;
}

export const Dialog = { show, close, buildDataDisplay };
