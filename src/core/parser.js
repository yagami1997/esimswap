/**
 * eSIM LPA string parser, validator, and repair utility.
 * Handles GSMA SGP.22 compliant LPA strings and common non-standard formats.
 */

/**
 * @typedef {{ smdpAddress: string, activationCode: string, confirmationCode: string, lpaString: string }} ESIMData
 * @typedef {{ success: true, data: ESIMData } | { success: false, error: string }} ParseResult
 */

/**
 * Parse any supported eSIM input format into structured data.
 * @param {string} input
 * @returns {ParseResult}
 */
export function parse(input) {
  if (!input || typeof input !== 'string') {
    return { success: false, error: 'Input must be a non-empty string' };
  }
  const clean = input.trim();
  if (!clean) return { success: false, error: 'Input cannot be empty' };

  let smdpAddress, activationCode, confirmationCode = '';

  if (clean.toUpperCase().startsWith('LPA:')) {
    const content = clean.substring(4);
    const parts = content.split('$');
    // parts[0] = version number (must be "1"), parts[1] = smdp, parts[2] = activation, parts[3] = confirmation
    if (parts.length < 3) {
      return { success: false, error: 'LPA format requires: LPA:1$<smdp-address>$<activation-code>' };
    }
    smdpAddress = parts[1];
    activationCode = parts[2];
    confirmationCode = parts[3] || '';
  } else if (clean.includes('$')) {
    const parts = clean.split('$');
    if (parts[0] === '1') {
      if (parts.length < 3) {
        return { success: false, error: 'Format 1$<smdp>$<activation> requires at least 3 parts' };
      }
      smdpAddress = parts[1];
      activationCode = parts[2];
      confirmationCode = parts[3] || '';
    } else {
      smdpAddress = parts[0];
      activationCode = parts[1];
      confirmationCode = parts[2] || '';
    }
  } else {
    return { success: false, error: 'Unrecognized format. Use: LPA:1$<smdp>$<code>, 1$<smdp>$<code>, or <smdp>$<code>' };
  }

  smdpAddress = smdpAddress.trim();
  activationCode = activationCode.trim();
  confirmationCode = confirmationCode.trim();

  if (!validateSMDP(smdpAddress)) {
    return { success: false, error: `Invalid SM-DP+ address: "${smdpAddress}"` };
  }
  if (!validateActivationCode(activationCode)) {
    return { success: false, error: `Invalid activation code: "${activationCode}"` };
  }

  const data = { smdpAddress, activationCode, confirmationCode };
  return { success: true, data: { ...data, lpaString: generateLPA(data) } };
}

/**
 * Parse from separate form fields.
 * @param {{ smdpAddress: string, activationCode: string, confirmationCode?: string }} fields
 * @returns {ParseResult}
 */
export function parseSeparated({ smdpAddress = '', activationCode = '', confirmationCode = '' }) {
  const input = confirmationCode
    ? `${smdpAddress}$${activationCode}$${confirmationCode}`
    : `${smdpAddress}$${activationCode}`;
  return parse(input);
}

/**
 * Generate a GSMA-compliant LPA string.
 * @param {{ smdpAddress: string, activationCode: string, confirmationCode?: string }} data
 * @returns {string}
 */
export function generateLPA({ smdpAddress, activationCode, confirmationCode = '' }) {
  return confirmationCode
    ? `LPA:1$${smdpAddress}$${activationCode}$${confirmationCode}`
    : `LPA:1$${smdpAddress}$${activationCode}`;
}

/**
 * Validate a SM-DP+ server address (domain name).
 * @param {string} address
 * @returns {boolean}
 */
export function validateSMDP(address) {
  if (!address || typeof address !== 'string') return false;
  return /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/.test(address.trim());
}

/**
 * Validate an eSIM activation code.
 * @param {string} code
 * @returns {boolean}
 */
export function validateActivationCode(code) {
  if (!code || typeof code !== 'string') return false;
  return /^[A-Z0-9][A-Z0-9\-]{6,}[A-Z0-9]$/i.test(code.trim());
}

/**
 * Attempt to repair a non-standard or malformed LPA string.
 * @param {string} raw
 * @returns {{ success: boolean, fixed?: string, problem: string | null }}
 */
export function repair(raw) {
  if (!raw || typeof raw !== 'string') {
    return { success: false, problem: 'Input is empty or not a string' };
  }
  const clean = raw.trim();

  // Already valid — no repair needed
  const check = parse(clean);
  if (check.success) return { success: true, fixed: check.data.lpaString, problem: null };

  // Case 1: Has $ separator, missing LPA: prefix
  if (!clean.toUpperCase().startsWith('LPA:') && clean.includes('$')) {
    const parts = clean.split('$');
    const candidate = parts[0] === '1' ? `LPA:${clean}` : `LPA:1$${clean}`;
    const result = parse(candidate);
    if (result.success) {
      return {
        success: true,
        fixed: result.data.lpaString,
        problem: parts[0] === '1' ? 'Missing LPA: prefix' : 'Missing LPA: prefix and version number'
      };
    }
  }

  // Case 2: Has LPA: but missing version number 1$
  if (clean.toUpperCase().startsWith('LPA:') && !clean.startsWith('LPA:1$')) {
    const content = clean.substring(4);
    const candidate = `LPA:1$${content}`;
    const result = parse(candidate);
    if (result.success) {
      return { success: true, fixed: result.data.lpaString, problem: 'Missing version number "1$"' };
    }
  }

  // Case 3: Messy format — try to extract domain and activation code tokens
  const stripped = clean.replace(/^LPA:/i, '').replace(/^1\$/, '');
  const tokens = stripped.split(/[$\s,|;]+/).filter(Boolean);
  const domain = tokens.find(t => /^[a-zA-Z0-9]([a-zA-Z0-9.-]{0,61})\.[a-zA-Z]{2,}$/.test(t));
  const activation = tokens.find(t => /^[A-Z0-9][A-Z0-9\-]{6,}[A-Z0-9]$/i.test(t) && !t.includes('.'));
  if (domain && activation) {
    const confirmation = tokens.find(t => t !== domain && t !== activation && t !== '1');
    const candidate = confirmation
      ? `LPA:1$${domain}$${activation}$${confirmation}`
      : `LPA:1$${domain}$${activation}`;
    return { success: true, fixed: candidate, problem: 'Reorganized malformed format' };
  }

  return { success: false, problem: 'Cannot extract valid eSIM data from this content' };
}
