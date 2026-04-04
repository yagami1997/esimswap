/**
 * Top-of-screen notification bar.
 * Accepts message strings directly — no key-based lookup.
 */

let hideTimer = null;

/**
 * Show a notification.
 * @param {string} message
 * @param {'success'|'warning'|'error'|'info'} type
 * @param {number} [duration=3000] ms
 */
export function show(message, type = 'info', duration = 3000) {
  const el = document.getElementById('notification');
  const textEl = document.getElementById('notificationText');
  if (!el || !textEl) return;

  if (hideTimer) clearTimeout(hideTimer);

  textEl.textContent = message; // safe: textContent
  el.className = `notification ${type}`;
  el.style.display = 'block';
  el.classList.add('show');

  hideTimer = setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => { el.style.display = 'none'; }, 300);
  }, duration);
}

export const Notification = { show };
