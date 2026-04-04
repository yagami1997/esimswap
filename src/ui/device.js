/**
 * Device detection and layout adaptation.
 * Applies CSS classes and custom properties to document root based on device type.
 */

export class DeviceDetector {
  constructor() {
    this.deviceInfo = this._detect();
    this.currentLayout = null;
  }

  _detect() {
    const ua = navigator.userAgent.toLowerCase();
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    const pw = w / (96 * dpr);
    const ph = h / (96 * dpr);
    const diag = Math.sqrt(pw * pw + ph * ph);

    return {
      ua, screenWidth: w, screenHeight: h, pixelRatio: dpr, diagonalInches: diag,
      isIOS: /iphone|ipad|ipod/.test(ua),
      isAndroid: /android/.test(ua),
      isWindows: /windows/.test(ua),
      isMac: /macintosh|mac os x/.test(ua),
      isLinux: /linux/.test(ua) && !/android/.test(ua),
      isIPhone: /iphone/.test(ua),
      isIPad: /ipad/.test(ua) || (ua.includes('mac') && 'ontouchend' in document),
      isAndroidTablet: /android/.test(ua) && !/mobile/.test(ua),
      isAndroidPhone: /android/.test(ua) && /mobile/.test(ua),
      isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    };
  }

  _determineLayout() {
    const { screenWidth, diagonalInches, isIPhone, isIPad, isAndroidTablet, isAndroidPhone, isTouchDevice } = this.deviceInfo;
    if (isIPhone || isAndroidPhone || screenWidth < 480) return 'mobile';
    if (isIPad || isAndroidTablet || (diagonalInches >= 8 && diagonalInches <= 14 && isTouchDevice) || (screenWidth >= 768 && screenWidth <= 1024 && isTouchDevice)) return 'tablet';
    if (screenWidth >= 1200) return 'desktop';
    if (screenWidth >= 768) return isTouchDevice && diagonalInches >= 8 ? 'tablet' : 'desktop';
    return isTouchDevice ? 'mobile' : 'tablet';
  }

  init() {
    try {
      this.currentLayout = this._determineLayout();
      this._applyLayout(this.currentLayout);
      this._bindResize();
    } catch (err) {
      console.error('DeviceDetector init error:', err);
      this.currentLayout = 'desktop';
    }
  }

  _applyLayout(layout) {
    const body = document.body;
    if (!body) return;
    body.classList.remove('layout-desktop', 'layout-tablet', 'layout-mobile');
    body.classList.add(`layout-${layout}`);
    document.documentElement.style.setProperty('--current-layout', layout);
    this._applyDeviceClasses(layout);
  }

  _applyDeviceClasses(layout) {
    const root = document.documentElement;
    const body = document.body;
    const configs = {
      mobile:  { fontSize: '16px', padding: '1rem',  gap: '1rem',  columns: '1', touch: '48px' },
      tablet:  { fontSize: '17px', padding: '2rem',  gap: '1.5rem', columns: '2', touch: '44px' },
      desktop: { fontSize: '16px', padding: '2rem',  gap: '2rem',  columns: '2', touch: '40px' },
    };
    const c = configs[layout] || configs.desktop;
    root.style.setProperty('--base-font-size', c.fontSize);
    root.style.setProperty('--container-padding', c.padding);
    root.style.setProperty('--card-gap', c.gap);
    root.style.setProperty('--grid-columns', c.columns);
    root.style.setProperty('--touch-target-size', c.touch);

    const d = this.deviceInfo;
    if (d.isIOS) body.classList.add('ios-device');
    if (d.isAndroid) body.classList.add('android-device');
    if (d.isWindows) body.classList.add('windows-device');
    if (d.isMac) body.classList.add('mac-device');
    if (d.isLinux) body.classList.add('linux-device');
  }

  _bindResize() {
    let timer;
    window.addEventListener('resize', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const next = this._determineLayout();
        if (next !== this.currentLayout) {
          const prev = this.currentLayout;
          this.currentLayout = next;
          this._applyLayout(next);
          window.dispatchEvent(new CustomEvent('layoutChanged', { detail: { oldLayout: prev, newLayout: next } }));
        }
      }, 250);
    });
  }

  getCurrentLayout() { return this.currentLayout; }
  getDeviceInfo() { return this.deviceInfo; }
}
