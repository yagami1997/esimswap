import { parse, parseSeparated, generateLPA, repair } from './core/parser.js';
import { generate as generateQR, downloadCanvas } from './core/qr-generator.js';
import { scanFile, startCamera, stopCamera, isCameraAvailable } from './core/qr-scanner.js';
import { Dialog, buildDataDisplay } from './ui/dialog.js';
import { Notification } from './ui/notification.js';
import { DeviceDetector } from './ui/device.js';
import { lookup as lookupCarrier } from './features/carrier-db.js';
import { History } from './features/history.js';
import { parseDeepLink, copyDeepLink } from './features/deep-link.js';

// ─── State ──────────────────────────────────────────────────────────────────
let currentLPA = null;
let currentData = null;
let currentCanvas = null;
let currentQROptions = { size: 300, level: 'M' };

// ─── Library Loading ─────────────────────────────────────────────────────────
async function loadLibraries() {
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js');
  await loadScriptWithFallback([
    'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js',
    'https://unpkg.com/jsqr@1.4.0/dist/jsQR.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jsQR/1.4.0/jsQR.min.js',
  ]);
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function loadScriptWithFallback(urls) {
  for (const url of urls) {
    try { await loadScript(url); return; } catch { /* try next */ }
  }
}

// ─── QR Code Actions ─────────────────────────────────────────────────────────
async function handleGenerate() {
  const btn = document.getElementById('generateBtn');
  btn.disabled = true;

  try {
    const mode = document.querySelector('.mode-btn.active')?.dataset.mode;
    let result;

    if (mode === 'separated') {
      result = parseSeparated({
        smdpAddress: document.getElementById('smdpAddress').value.trim(),
        activationCode: document.getElementById('activationCode').value.trim(),
        confirmationCode: document.getElementById('activationPassword').value.trim(),
      });
    } else {
      const input = document.getElementById('combinedText').value.trim();
      if (!input) { Notification.show('Please enter eSIM configuration data', 'warning'); return; }
      result = parse(input);
    }

    if (!result.success) {
      Dialog.show({
        title: 'Invalid Input Format',
        body: buildDataDisplay([
          { label: 'Problem:', value: result.error },
          { label: 'Expected:', value: 'LPA:1$<smdp-address>$<activation-code>' },
        ]),
        type: 'error',
        actions: [{ label: 'OK', variant: 'primary', onClick: () => {} }],
      });
      return;
    }

    renderQR(result.data);
    History.add({ action: 'generate', ...result.data, carrierName: lookupCarrier(result.data.smdpAddress)?.name || '' });
    renderHistory();
    Notification.show('QR code generated successfully!', 'success');
  } catch (err) {
    Dialog.show({
      title: 'Generation Failed',
      body: err.message,
      type: 'error',
      actions: [{ label: 'OK', variant: 'primary', onClick: () => {} }],
    });
  } finally {
    btn.disabled = false;
  }
}

function renderQR(data) {
  const canvas = generateQR(data.lpaString, currentQROptions);
  currentLPA = data.lpaString;
  currentData = data;
  currentCanvas = canvas;

  const container = document.getElementById('qrContainer');
  container.innerHTML = '';
  container.appendChild(canvas);

  // Carrier info
  const carrier = lookupCarrier(data.smdpAddress);
  const carrierEl = document.getElementById('carrierInfo');
  if (carrierEl) {
    carrierEl.textContent = carrier ? `${carrier.name} · ${carrier.region}` : 'Unknown carrier';
  }

  // Text fields
  document.getElementById('lpaAddressDisplay').textContent = data.lpaString;
  document.getElementById('smdpDisplay').textContent = data.smdpAddress;
  document.getElementById('activationDisplay').textContent = data.activationCode;
  const pwItem = document.getElementById('passwordDisplayItem');
  if (pwItem) {
    pwItem.style.display = data.confirmationCode ? 'block' : 'none';
    if (data.confirmationCode) document.getElementById('passwordDisplay').textContent = data.confirmationCode;
  }

  document.getElementById('qrDisplay').style.display = 'block';
  document.getElementById('qrDisplay').scrollIntoView({ behavior: 'smooth' });
}

// ─── File Upload ─────────────────────────────────────────────────────────────
async function handleFileUpload(file) {
  const uploadArea = document.getElementById('uploadArea');
  uploadArea.classList.add('loading');

  try {
    const rawData = await scanFile(file);
    handleScannedData(rawData);
  } catch (err) {
    Notification.show(err.message, 'warning');
  } finally {
    uploadArea.classList.remove('loading');
    // Reset file input so the same file can be re-selected
    const fi = document.getElementById('fileInput');
    if (fi) fi.value = '';
  }
}

function handleScannedData(rawData) {
  // Try direct parse first
  const result = parse(rawData);
  if (result.success) {
    showParseResult(result.data, rawData);
    History.add({ action: 'scan', ...result.data, carrierName: lookupCarrier(result.data.smdpAddress)?.name || '' });
    renderHistory();
    Notification.show('QR code parsed successfully!', 'success');
    return;
  }

  // Try repair
  const repaired = repair(rawData);
  if (repaired.success) {
    const repairResult = parse(repaired.fixed);
    if (repairResult.success) {
      showScanRepairDialog(rawData, repaired.fixed, repaired.problem, repairResult.data);
      return;
    }
  }

  // Show raw content for manual handling
  showUnrecognizedScanDialog(rawData);
}

function showParseResult(data, raw) {
  document.getElementById('parsedSmdp').textContent = data.smdpAddress;
  document.getElementById('parsedActivation').textContent = data.activationCode;
  document.getElementById('parsedPassword').textContent = data.confirmationCode || 'None';
  document.getElementById('parsedRaw').textContent = raw || data.lpaString;
  document.getElementById('parseResult').style.display = 'block';
}

function showScanRepairDialog(original, fixed, problem, repairedData) {
  const body = buildDataDisplay([
    { label: 'Issue detected:', value: problem },
    { label: 'Original:', value: original },
    { label: 'Fixed LPA:', value: fixed },
  ]);
  Dialog.show({
    title: 'Non-Standard QR Code Detected',
    body,
    type: 'warning',
    actions: [
      { label: 'Cancel', variant: 'cancel', onClick: () => {} },
      { label: 'Fix & Generate Standard QR', variant: 'primary', onClick: () => {
        renderQR(repairedData);
        History.add({ action: 'scan', ...repairedData, carrierName: lookupCarrier(repairedData.smdpAddress)?.name || '' });
        renderHistory();
        Notification.show('Fixed and generated standard QR code!', 'success');
      }},
    ],
  });
}

function showUnrecognizedScanDialog(rawData) {
  const body = buildDataDisplay([
    { label: 'Scanned content:', value: rawData },
    { label: 'Tip:', value: 'Paste the LPA string into the input box on the left and generate manually.' },
  ]);
  Dialog.show({
    title: 'Cannot Parse QR Code',
    body,
    type: 'error',
    actions: [
      { label: 'Copy Content', variant: 'cancel', onClick: async () => {
        try { await navigator.clipboard.writeText(rawData); Notification.show('Content copied!', 'success'); } catch {}
      }},
      { label: 'OK', variant: 'primary', onClick: () => {} },
    ],
  });
}

// ─── Camera ───────────────────────────────────────────────────────────────────
async function initCamera() {
  const available = await isCameraAvailable();
  const cameraTab = document.querySelector('[data-scan-tab="camera"]');
  if (!available && cameraTab) {
    cameraTab.style.display = 'none';
    return;
  }
}

async function handleStartCamera() {
  const videoEl = document.getElementById('cameraVideo');
  const startBtn = document.getElementById('startCameraBtn');
  const stopBtn = document.getElementById('stopCameraBtn');

  startBtn.style.display = 'none';
  stopBtn.style.display = 'inline-flex';
  videoEl.style.display = 'block';

  try {
    await startCamera(videoEl, (data) => {
      videoEl.style.display = 'none';
      stopBtn.style.display = 'none';
      startBtn.style.display = 'inline-flex';
      handleScannedData(data);
    });
  } catch (err) {
    stopBtn.style.display = 'none';
    startBtn.style.display = 'inline-flex';
    Notification.show(err.message.includes('denied') ? 'Camera access denied. Please allow camera permission and try again.' : err.message, 'warning');
  }
}

function handleStopCamera() {
  stopCamera();
  document.getElementById('cameraVideo').style.display = 'none';
  document.getElementById('startCameraBtn').style.display = 'inline-flex';
  document.getElementById('stopCameraBtn').style.display = 'none';
}

// ─── History ──────────────────────────────────────────────────────────────────
function renderHistory() {
  const entries = History.getAll();
  const container = document.getElementById('historyList');
  const emptyEl = document.getElementById('historyEmpty');
  if (!container) return;

  container.innerHTML = '';

  if (entries.length === 0) {
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';

  for (const entry of entries) {
    const item = document.createElement('div');
    item.className = 'history-item';

    const info = document.createElement('div');
    info.className = 'history-info';
    const carrier = document.createElement('span');
    carrier.className = 'history-carrier';
    carrier.textContent = entry.carrierName || 'Unknown carrier';
    const smdp = document.createElement('span');
    smdp.className = 'history-smdp';
    smdp.textContent = entry.smdpAddress;
    const date = document.createElement('span');
    date.className = 'history-date';
    date.textContent = new Date(entry.timestamp).toLocaleString();
    info.append(carrier, smdp, date);

    const actions = document.createElement('div');
    actions.className = 'history-actions';

    const loadBtn = document.createElement('button');
    loadBtn.className = 'btn btn-sm btn-secondary';
    loadBtn.textContent = 'Load';
    loadBtn.addEventListener('click', () => {
      document.getElementById('combinedText').value = entry.lpaString;
      switchInputMode('combined');
      document.getElementById('combinedText').scrollIntoView({ behavior: 'smooth' });
      Notification.show('Loaded from history', 'info');
    });

    const delBtn = document.createElement('button');
    delBtn.className = 'btn btn-sm btn-danger';
    delBtn.textContent = 'Delete';
    delBtn.addEventListener('click', () => {
      History.remove(entry.id);
      renderHistory();
    });

    actions.append(loadBtn, delBtn);
    item.append(info, actions);
    container.appendChild(item);
  }
}

// ─── Clipboard / Download ─────────────────────────────────────────────────────
async function copyText(text) {
  if (!text) { Notification.show('Nothing to copy', 'warning'); return; }
  try {
    await navigator.clipboard.writeText(text);
    Notification.show('Copied to clipboard!', 'success');
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    Notification.show('Copied to clipboard!', 'success');
  }
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────
function switchInputMode(mode) {
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
  document.getElementById('combinedInput').style.display = mode === 'combined' ? 'block' : 'none';
  document.getElementById('separatedInput').style.display = mode === 'separated' ? 'block' : 'none';
}

function switchScanTab(tab) {
  document.querySelectorAll('[data-scan-tab]').forEach(b => b.classList.toggle('active', b.dataset.scanTab === tab));
  document.getElementById('uploadPanel').style.display = tab === 'upload' ? 'block' : 'none';
  document.getElementById('cameraPanel').style.display = tab === 'camera' ? 'block' : 'none';
  if (tab !== 'camera') { stopCamera(); document.getElementById('cameraVideo').style.display = 'none'; }
}

function switchDisplayMode(mode) {
  document.querySelectorAll('.display-tab').forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
  document.getElementById('displayLPA').classList.toggle('active', mode === 'lpa');
  document.getElementById('displaySeparated').classList.toggle('active', mode === 'separated');
}

function clearResults() {
  currentLPA = null; currentData = null; currentCanvas = null;
  document.getElementById('qrDisplay').style.display = 'none';
  document.getElementById('parseResult').style.display = 'none';
  document.getElementById('combinedText').value = '';
  document.getElementById('smdpAddress').value = '';
  document.getElementById('activationCode').value = '';
  document.getElementById('activationPassword').value = '';
  const fi = document.getElementById('fileInput');
  if (fi) fi.value = '';
  stopCamera();
  Notification.show('Cleared', 'success');
}

// ─── Drag & Drop ──────────────────────────────────────────────────────────────
function setupDragDrop() {
  const area = document.getElementById('uploadArea');
  if (!area) return;
  area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('drag-over'); });
  area.addEventListener('dragleave', () => area.classList.remove('drag-over'));
  area.addEventListener('drop', e => {
    e.preventDefault();
    area.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  });
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Device detection
  const detector = new DeviceDetector();
  detector.init();
  window.deviceDetector = detector;

  // Load QR libraries
  try {
    await loadLibraries();
    Notification.show('Ready', 'success', 1500);
  } catch {
    Notification.show('Some features may be limited — check your connection', 'warning');
  }

  // Check for deep link
  const deepLinkLPA = parseDeepLink(window.location.search);
  if (deepLinkLPA) {
    document.getElementById('combinedText').value = deepLinkLPA;
    // Auto-generate after a short delay to let UI settle
    setTimeout(() => handleGenerate(), 300);
  }

  // Camera availability
  await initCamera();

  // Render history on load
  renderHistory();

  // ── Event bindings ──
  // Input mode
  document.querySelectorAll('.mode-btn').forEach(btn =>
    btn.addEventListener('click', () => switchInputMode(btn.dataset.mode))
  );

  // Scan tabs
  document.querySelectorAll('[data-scan-tab]').forEach(btn =>
    btn.addEventListener('click', () => switchScanTab(btn.dataset.scanTab))
  );

  // Display mode
  document.querySelectorAll('.display-tab').forEach(tab =>
    tab.addEventListener('click', () => switchDisplayMode(tab.dataset.mode))
  );

  // Copy buttons
  document.querySelectorAll('.copy-btn').forEach(btn =>
    btn.addEventListener('click', () => {
      const type = btn.dataset.copy;
      const map = { lpa: currentLPA, smdp: currentData?.smdpAddress, activation: currentData?.activationCode, password: currentData?.confirmationCode };
      copyText(map[type] || '');
    })
  );

  // Generate
  document.getElementById('generateBtn').addEventListener('click', handleGenerate);

  // File input
  document.getElementById('fileInput').addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) handleFileUpload(file);
  });

  // Upload click
  document.getElementById('uploadArea').addEventListener('click', e => {
    if (e.target.closest('.upload-btn') || e.target === document.getElementById('uploadArea')) {
      document.getElementById('fileInput').click();
    }
  });

  // Camera buttons
  document.getElementById('startCameraBtn')?.addEventListener('click', handleStartCamera);
  document.getElementById('stopCameraBtn')?.addEventListener('click', handleStopCamera);

  // Action buttons
  document.getElementById('downloadBtn').addEventListener('click', () => {
    if (!currentCanvas) { Notification.show('Generate a QR code first', 'warning'); return; }
    downloadCanvas(currentCanvas);
    Notification.show('QR code downloaded!', 'success');
  });

  document.getElementById('copyBtn').addEventListener('click', () => copyText(currentLPA));

  document.getElementById('shareLinkBtn')?.addEventListener('click', async () => {
    if (!currentLPA) { Notification.show('Generate a QR code first', 'warning'); return; }
    try {
      await copyDeepLink(currentLPA);
      Notification.show('Share link copied to clipboard!', 'success');
    } catch {
      Notification.show('Failed to copy link', 'error');
    }
  });

  document.getElementById('clearBtn').addEventListener('click', clearResults);

  // History clear
  document.getElementById('clearHistoryBtn')?.addEventListener('click', () => {
    History.clear();
    renderHistory();
    Notification.show('History cleared', 'success');
  });

  // Advanced options (QR size/level)
  document.querySelectorAll('[data-qr-size]').forEach(btn =>
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-qr-size]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentQROptions.size = parseInt(btn.dataset.qrSize);
      if (currentLPA) renderQR(currentData); // re-render with new size
    })
  );

  document.querySelectorAll('[data-qr-level]').forEach(btn =>
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-qr-level]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentQROptions.level = btn.dataset.qrLevel;
      if (currentLPA) renderQR(currentData); // re-render with new level
    })
  );

  // Drag & drop
  setupDragDrop();
});
