/**
 * Deep link generation and parsing for eSIM configuration sharing.
 * URL format: <your-deployment-url>/?lpa=<url-encoded-lpa-string>
 */

const BASE_URL = typeof window !== 'undefined' ? window.location.origin : '';

/**
 * Extract the LPA string from a URL search string.
 * @param {string} search - e.g. window.location.search or '?lpa=...'
 * @returns {string | null}
 */
export function parseDeepLink(search = '') {
  if (!search) return null;
  try {
    return new URLSearchParams(search).get('lpa');
  } catch {
    return null;
  }
}

/**
 * Generate a shareable URL containing the LPA string.
 * @param {string} lpaString
 * @param {string} [baseUrl]
 * @returns {string}
 */
export function generateDeepLink(lpaString, baseUrl = BASE_URL) {
  return `${baseUrl}/?lpa=${encodeURIComponent(lpaString)}`;
}

/**
 * Copy the deep link URL to the clipboard.
 * @param {string} lpaString
 * @returns {Promise<string>} the generated URL
 */
export async function copyDeepLink(lpaString) {
  const url = generateDeepLink(lpaString);
  try {
    await navigator.clipboard.writeText(url);
  } catch {
    // Fallback for older browsers
    const ta = document.createElement('textarea');
    ta.value = url;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
  return url;
}
