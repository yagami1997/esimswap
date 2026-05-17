(() => {
  const target = 'https://www.cloudflare.com/';

  function startCloudflareCountdown({ seconds = 5 } = {}) {
    if (window.__cloudflareCountdownStarted) return;
    window.__cloudflareCountdownStarted = true;

    const button = document.getElementById('cloudflareRedirect');
    if (button) button.href = target;

    const deadline = Date.now() + seconds * 1000;

    function tick() {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      const value = document.getElementById('redirectCountdown');
      if (value) value.textContent = String(remaining);

      if (remaining <= 0) {
        window.location.replace(target);
        return;
      }

      window.setTimeout(tick, 250);
    }

    tick();
  }

  function startIfPresent() {
    const value = document.getElementById('redirectCountdown');
    if (value) startCloudflareCountdown();
  }

  window.startCloudflareCountdown = startCloudflareCountdown;

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', startIfPresent);
  } else {
    startIfPresent();
  }
})();
