const DEFAULT_SECURITY_ENTRY_CONFIG = {
  enabled: false,
  entryPath: '',
};

const SECURITY_ENTRY_CONFIG = typeof __SECURITY_ENTRY_CONFIG__ !== 'undefined'
  ? __SECURITY_ENTRY_CONFIG__
  : DEFAULT_SECURITY_ENTRY_CONFIG;

export function enforceSecurityEntry(location = window.location) {
  const config = normalizeConfig(SECURITY_ENTRY_CONFIG);
  if (!config.enabled) return true;

  const currentPath = normalizePath(location.pathname);
  if (currentPath === config.entryPath) return true;

  renderAccessDenied();
  return false;
}

function normalizeConfig(config) {
  return {
    enabled: Boolean(config?.enabled),
    entryPath: normalizePath(config?.entryPath),
  };
}

function normalizePath(pathname) {
  const path = String(pathname || '/').split('?')[0].split('#')[0];
  if (!path || path === '/') return '/';
  const withLeadingSlash = path.startsWith('/') ? path : `/${path}`;
  return withLeadingSlash.replace(/\/+$/, '') || '/';
}

function renderAccessDenied() {
  const cloudflareUrl = 'https://www.cloudflare.com/';
  let remaining = 5;

  document.title = '403 Access Denied';
  document.body.className = 'error-gate-body';
  document.body.innerHTML = '';

  const main = document.createElement('main');
  main.className = 'error-gate';

  const panel = document.createElement('section');
  panel.className = 'error-gate-panel';

  const brand = document.createElement('div');
  brand.className = 'error-gate-brand';
  brand.textContent = 'eSIM Gate';

  const kicker = document.createElement('p');
  kicker.className = 'error-gate-kicker';
  kicker.textContent = 'ERROR 403';

  const code = document.createElement('h1');
  code.className = 'error-gate-code';
  code.textContent = '403';

  const title = document.createElement('h2');
  title.textContent = 'Access Denied';

  const message = document.createElement('p');
  message.className = 'error-gate-copy';
  message.textContent = 'This request is not authorized. The address is not a valid entry point for this tool.';

  const redirect = document.createElement('section');
  redirect.className = 'error-gate-redirect';

  const spinner = document.createElement('div');
  spinner.className = 'error-gate-spinner';
  spinner.setAttribute('aria-hidden', 'true');

  const redirectTitle = document.createElement('h3');
  redirectTitle.textContent = 'Redirecting';

  const redirectMessage = document.createElement('p');
  redirectMessage.append('Automatically redirecting in ');
  const countdown = document.createElement('strong');
  countdown.id = 'redirectCountdown';
  countdown.textContent = '5';
  redirectMessage.append(countdown, ' seconds.');

  const link = document.createElement('a');
  link.className = 'btn btn-primary error-gate-button';
  link.href = cloudflareUrl;
  link.rel = 'nofollow';
  link.textContent = 'Go now';

  const footer = document.createElement('footer');
  footer.className = 'error-gate-footer';
  footer.textContent = 'Public errors are intentionally brief.';

  redirect.append(spinner, redirectTitle, redirectMessage, link);
  panel.append(brand, kicker, code, title, message, redirect, footer);
  main.appendChild(panel);
  document.body.appendChild(main);

  if (window.startCloudflareCountdown) {
    window.startCloudflareCountdown();
    return;
  }

  const script = document.createElement('script');
  script.src = '/error.js';
  script.onload = () => window.startCloudflareCountdown?.();
  script.onerror = () => {
    function tick() {
      const value = document.getElementById('redirectCountdown');
      if (value) value.textContent = String(remaining);
      if (remaining <= 0) {
        window.location.replace(cloudflareUrl);
        return;
      }
      remaining -= 1;
      window.setTimeout(tick, 1000);
    }
    tick();
  };
  document.head.appendChild(script);
}
