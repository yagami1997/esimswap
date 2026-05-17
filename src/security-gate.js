const DEFAULT_SECURITY_ENTRY_CONFIG = {
  enabled: false,
  entryPath: '',
};

const SECURITY_ENTRY_CONFIG = typeof __SECURITY_ENTRY_CONFIG__ !== 'undefined'
  ? __SECURITY_ENTRY_CONFIG__
  : DEFAULT_SECURITY_ENTRY_CONFIG;

const REDIRECT_URL = 'https://www.cloudflare.com/';

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
  redirect.setAttribute('aria-label', 'Continue');

  const link = document.createElement('a');
  link.id = 'continueLink';
  link.className = 'btn btn-primary error-gate-button';
  link.href = REDIRECT_URL;
  link.rel = 'nofollow noopener';
  link.textContent = 'Continue';

  redirect.append(link);

  const footer = document.createElement('footer');
  footer.className = 'error-gate-footer';
  footer.textContent = 'Public errors are intentionally brief.';

  panel.append(brand, kicker, code, title, message, redirect, footer);
  main.appendChild(panel);
  document.body.appendChild(main);
}
