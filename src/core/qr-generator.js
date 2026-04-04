/**
 * QR code generation using QRious (CDN-loaded).
 * No fake/placeholder fallback — fails clearly if library unavailable.
 */

/**
 * @typedef {{ size?: number, level?: 'L'|'M'|'Q'|'H' }} QROptions
 */

/**
 * Generate a QR code canvas for the given LPA string.
 * Requires window.QRious to be loaded before calling.
 * @param {string} lpaString
 * @param {QROptions} options
 * @returns {HTMLCanvasElement}
 * @throws {Error} if QRious is not available
 */
export function generate(lpaString, { size = 300, level = 'M' } = {}) {
  if (!window.QRious) {
    throw new Error('QR library not loaded. Please refresh the page and try again.');
  }
  const qr = new window.QRious({ value: lpaString, size, level });
  return qr.canvas;
}

/**
 * Download a canvas as a PNG file.
 * @param {HTMLCanvasElement} canvas
 * @param {string} [filename]
 */
export function downloadCanvas(canvas, filename = 'esim-qr-code.png') {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
