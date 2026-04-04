/**
 * QR code scanning from image files and live camera feed.
 * Requires window.jsQR to be loaded before calling scan methods.
 */

let cameraStream = null;
let animFrameId = null;

/**
 * Decode a QR code from an image File.
 * @param {File} file
 * @returns {Promise<string>} raw QR content
 * @throws {Error} if no QR code detected or library missing
 */
export async function scanFile(file) {
  if (!window.jsQR) throw new Error('QR scanner library not loaded. Please refresh.');
  if (!file.type.startsWith('image/')) throw new Error('File must be an image.');
  if (file.size > 10 * 1024 * 1024) throw new Error('File too large. Maximum 10MB.');

  const imageData = await loadImageData(file);
  const result = window.jsQR(imageData.data, imageData.width, imageData.height);
  if (!result) throw new Error('No QR code detected. Try a clearer image or use manual input.');
  return result.data;
}

/**
 * Load image file into an ImageData object via canvas.
 * @param {File} file
 * @returns {Promise<ImageData>}
 */
function loadImageData(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext('2d').drawImage(img, 0, 0);
      resolve(canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image.')); };
    img.src = url;
  });
}

/**
 * Check if the device has a usable camera.
 * @returns {Promise<boolean>}
 */
export async function isCameraAvailable() {
  if (!navigator.mediaDevices?.getUserMedia) return false;
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.some(d => d.kind === 'videoinput');
  } catch {
    return false;
  }
}

/**
 * Start live camera scanning.
 * Continuously captures frames and calls onDetect when a QR code is found.
 * Automatically stops after detection.
 * @param {HTMLVideoElement} videoEl
 * @param {(data: string) => void} onDetect
 * @returns {Promise<void>}
 * @throws {Error} if camera access denied or unavailable
 */
export async function startCamera(videoEl, onDetect) {
  if (!window.jsQR) throw new Error('QR scanner library not loaded. Please refresh.');
  stopCamera();

  cameraStream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
  });

  videoEl.srcObject = cameraStream;
  await videoEl.play();

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  function tick() {
    if (!cameraStream || videoEl.readyState !== videoEl.HAVE_ENOUGH_DATA) {
      animFrameId = requestAnimationFrame(tick);
      return;
    }
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const result = window.jsQR(imageData.data, imageData.width, imageData.height);
    if (result) {
      stopCamera();
      onDetect(result.data);
      return;
    }
    animFrameId = requestAnimationFrame(tick);
  }

  animFrameId = requestAnimationFrame(tick);
}

/** Stop the camera stream and cancel the scan loop. */
export function stopCamera() {
  if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
  if (cameraStream) {
    cameraStream.getTracks().forEach(t => t.stop());
    cameraStream = null;
  }
}
