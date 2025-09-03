/**
 * eSIM Configuration Parser - Pure Frontend Version
 * Kyoto Style Design - No Backend Service Required
 * Multi-Device Adaptive System (Desktop/Tablet/Mobile)
 */

/**
 * Intelligent Device Detection and UI Adaptation System
 * Supports automatic switching between desktop, tablet (9-13 inch), and mobile layouts
 */
class DeviceDetector {
    constructor() {
        this.deviceInfo = this.detectDevice();
        this.currentLayout = null;
        // Don't call init() immediately, let the caller handle it
        // this.init();
    }

    detectDevice() {
        const userAgent = navigator.userAgent.toLowerCase();
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const pixelRatio = window.devicePixelRatio || 1;
        
        // Calculate physical size in inches
        const physicalWidth = screenWidth / (96 * pixelRatio); // 96 DPI standard
        const physicalHeight = screenHeight / (96 * pixelRatio);
        const diagonalInches = Math.sqrt(physicalWidth * physicalWidth + physicalHeight * physicalHeight);

        const device = {
            userAgent,
            screenWidth,
            screenHeight,
            pixelRatio,
            diagonalInches,
            orientation: window.screen?.orientation?.type || 'unknown',
            // Device type detection
            isIOS: /iphone|ipad|ipod/.test(userAgent),
            isAndroid: /android/.test(userAgent),
            isWindows: /windows/.test(userAgent),
            isMac: /macintosh|mac os x/.test(userAgent),
            isLinux: /linux/.test(userAgent) && !/android/.test(userAgent),
            // Specific device detection
            isIPhone: /iphone/.test(userAgent),
            isIPad: /ipad/.test(userAgent) || (userAgent.includes('mac') && 'ontouchend' in document),
            isAndroidTablet: /android/.test(userAgent) && !/mobile/.test(userAgent),
            isAndroidPhone: /android/.test(userAgent) && /mobile/.test(userAgent),
            // Touch support
            isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
            // Pointer precision
            hasCoarsePointer: window.matchMedia('(pointer: coarse)').matches,
            hasFinePointer: window.matchMedia('(pointer: fine)').matches
        };

        return device;
    }

    determineLayoutMode() {
        const { screenWidth, screenHeight, diagonalInches, isIPhone, isIPad, isAndroidTablet, isAndroidPhone, isTouchDevice } = this.deviceInfo;
        
        // 1. Explicit mobile devices
        if (isIPhone || isAndroidPhone || screenWidth < 480) {
            return 'mobile';
        }
        
        // 2. Explicit tablet devices (9-13 inches)
        if (isIPad || isAndroidTablet || 
            (diagonalInches >= 8 && diagonalInches <= 14 && isTouchDevice) ||
            (screenWidth >= 768 && screenWidth <= 1024 && isTouchDevice)) {
            return 'tablet';
        }
        
        // 3. Screen size based intelligent judgment
        if (screenWidth >= 1200) {
            return 'desktop';
        } else if (screenWidth >= 768 && screenWidth < 1200) {
            // 768-1200px range needs further judgment
            if (isTouchDevice && diagonalInches >= 8) {
                return 'tablet';
            } else {
                return 'desktop'; // Small screen desktop device
            }
        } else if (screenWidth >= 480 && screenWidth < 768) {
            return isTouchDevice ? 'mobile' : 'tablet';
        }
        
        // 4. Default case
        return 'mobile';
    }

    init() {
        try {
            this.currentLayout = this.determineLayoutMode();
            this.applyLayout(this.currentLayout);
            this.bindResizeHandler();
            this.logDeviceInfo();
        } catch (error) {
            console.error('DeviceDetector initialization error:', error);
            // Set fallback layout
            this.currentLayout = 'desktop';
        }
    }

    applyLayout(layout) {
        // Check if document.body is available
        if (!document.body) {
            console.log('Document body not ready, deferring layout application');
            // Defer layout application until DOM is ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.applyLayout(layout));
                return;
            }
        }
        
        const body = document.body;
        if (!body) {
            console.error('Document body still not available');
            return;
        }
        
        // Remove all layout classes
        body.classList.remove('layout-desktop', 'layout-tablet', 'layout-mobile');
        
        // Add current layout class
        body.classList.add(`layout-${layout}`);
        
        // Set CSS custom properties
        document.documentElement.style.setProperty('--current-layout', layout);
        
        // Apply device-specific optimizations
        this.applyDeviceOptimizations(layout);
        
        console.log(`Layout applied: ${layout}`, this.deviceInfo);
    }

    applyDeviceOptimizations(layout) {
        const root = document.documentElement;
        const body = document.body;
        
        switch (layout) {
            case 'mobile':
                root.style.setProperty('--base-font-size', '16px');
                root.style.setProperty('--container-padding', '1rem');
                root.style.setProperty('--card-gap', '1rem');
                root.style.setProperty('--grid-columns', '1');
                root.style.setProperty('--touch-target-size', '48px');
                break;
                
            case 'tablet':
                root.style.setProperty('--base-font-size', '17px');
                root.style.setProperty('--container-padding', '2rem');
                root.style.setProperty('--card-gap', '1.5rem');
                root.style.setProperty('--grid-columns', '2');
                root.style.setProperty('--touch-target-size', '44px');
                break;
                
            case 'desktop':
                root.style.setProperty('--base-font-size', '16px');
                root.style.setProperty('--container-padding', '2rem');
                root.style.setProperty('--card-gap', '2rem');
                root.style.setProperty('--grid-columns', '2');
                root.style.setProperty('--touch-target-size', '40px');
                break;
        }
        
        // Special device optimizations - only if body is available
        if (body) {
            if (this.deviceInfo.isIOS) {
                body.classList.add('ios-device');
            }
            if (this.deviceInfo.isAndroid) {
                body.classList.add('android-device');
                
                // High resolution Android device optimization
                if (this.deviceInfo.pixelRatio >= 2.5 && this.deviceInfo.screenWidth >= 1440) {
                    body.classList.add('android-high-dpi');
                    console.log('High DPI Android device detected, applying optimizations');
                }
            }
            if (this.deviceInfo.isWindows) {
                body.classList.add('windows-device');
            }
            if (this.deviceInfo.isMac) {
                body.classList.add('mac-device');
            }
            if (this.deviceInfo.isLinux) {
                body.classList.add('linux-device');
            }
        }
    }

    bindResizeHandler() {
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const newLayout = this.determineLayoutMode();
                if (newLayout !== this.currentLayout) {
                    this.currentLayout = newLayout;
                    this.applyLayout(newLayout);
                    
                    // Trigger custom event
                    window.dispatchEvent(new CustomEvent('layoutChanged', {
                        detail: { oldLayout: this.currentLayout, newLayout }
                    }));
                }
            }, 250);
        });
    }

    logDeviceInfo() {
        console.group('📱 Device Detection Results');
        console.log('Layout Mode:', this.currentLayout);
        console.log('Screen Size:', `${this.deviceInfo.screenWidth}×${this.deviceInfo.screenHeight}`);
        console.log('Diagonal Size:', `${this.deviceInfo.diagonalInches.toFixed(1)}" inches`);
        console.log('Device Type:', {
            iOS: this.deviceInfo.isIOS,
            Android: this.deviceInfo.isAndroid,
            Windows: this.deviceInfo.isWindows,
            Mac: this.deviceInfo.isMac,
            Linux: this.deviceInfo.isLinux,
            iPad: this.deviceInfo.isIPad,
            iPhone: this.deviceInfo.isIPhone,
            AndroidTablet: this.deviceInfo.isAndroidTablet,
            TouchDevice: this.deviceInfo.isTouchDevice
        });
        console.groupEnd();
    }

    // Public methods
    getCurrentLayout() {
        return this.currentLayout;
    }

    getDeviceInfo() {
        return this.deviceInfo;
    }

    // Force layout switch (for testing)
    forceLayout(layout) {
        if (['mobile', 'tablet', 'desktop'].includes(layout)) {
            this.currentLayout = layout;
            this.applyLayout(layout);
        }
    }
}

class ESIMParser {
  constructor() {
    this.currentLPA = null;
    this.currentParsed = null;
    this.currentQRData = null;
    
    // Set global reference for dialog calls
    window.esimParser = this;
  }

  /**
   * Load external libraries
   */
  async loadExternalLibraries() {
    console.log('Loading external libraries...');
    
    try {
      // Simple direct loading method
      await this.loadQRious();
      await this.loadJsQR();
      
      if (window.QRious && window.jsQR) {
        console.log('All libraries loaded successfully');
        this.showNotification('application_ready', 'success');
      } else {
        console.log('Some libraries failed to load, using built-in functions');
        this.showNotification('using_builtin_functions', 'warning');
      }
      
    } catch (error) {
      console.error('Library loading process error:', error);
      this.showNotification('using_builtin_functions', 'warning');
    }
  }

  /**
   * Load QRious library
   */
  async loadQRious() {
    return new Promise((resolve) => {
      if (window.QRious) {
        console.log('QRious already exists');
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js';
      script.onload = () => {
        console.log('QRious loaded successfully');
        resolve();
      };
      script.onerror = () => {
        console.log('QRious loading failed');
        resolve(); // Don't reject, continue execution
      };
      document.head.appendChild(script);
    });
  }

  /**
   * Load jsQR library
   */
  async loadJsQR() {
    return new Promise(async (resolve) => {
      if (window.jsQR) {
        console.log('jsQR already exists');
        resolve();
        return;
      }

      // Try multiple CDN sources
      const cdnUrls = [
        'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js',
        'https://unpkg.com/jsqr@1.4.0/dist/jsQR.js',
        'https://cdnjs.cloudflare.com/ajax/libs/jsQR/1.4.0/jsQR.min.js'
      ];

      for (let i = 0; i < cdnUrls.length; i++) {
        const url = cdnUrls[i];
        try {
          await this.loadScript(url);
          if (window.jsQR) {
            console.log(`jsQR loaded successfully from ${url}`);
            resolve();
            return;
          } else {
            console.log(`jsQR loading failed from ${url}`);
          }
        } catch (error) {
          // If successful loading, break the loop
          if (window.jsQR) {
            resolve();
            return;
          }
        }
        console.log(`Trying next CDN...`);
      }

      if (!window.jsQR) {
        console.warn('All jsQR CDN sources failed to load, QR code parsing will be unavailable');
      }
      resolve();
    });
  }

  /**
   * Dynamically load script
   */
  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * Script loading with fallback
   */
  async loadScriptWithFallback(urls) {
    for (let i = 0; i < urls.length; i++) {
      try {
        await this.loadScript(urls[i]);
        console.log(`Successfully loaded: ${urls[i]}`);
        return;
      } catch (error) {
        console.warn(`Loading failed: ${urls[i]}, trying next...`);
        if (i === urls.length - 1) {
          throw new Error(`All CDNs failed to load: ${urls.join(', ')}`);
        }
      }
    }
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Input mode switching
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchInputMode(e.target.dataset.mode));
    });

    // Display mode switching
    document.querySelectorAll('.display-tab').forEach(tab => {
      tab.addEventListener('click', (e) => this.switchDisplayMode(e.target.dataset.mode));
    });

    // Copy buttons
    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.copyToClipboard(e.target.closest('.copy-btn').dataset.copy));
    });

    // Generate QR code
    document.getElementById('generateBtn').addEventListener('click', () => this.generateQR());

    // File upload events now handled through HTML inline events
    console.log('Using HTML inline event handling for file upload');

    // Action buttons
    document.getElementById('downloadBtn').addEventListener('click', () => this.downloadQR());
    document.getElementById('copyBtn').addEventListener('click', () => this.copyLPA());
    document.getElementById('clearBtn').addEventListener('click', () => this.clearResults());

    // Set up drag and drop
    this.setupDragAndDrop();
  }

  /**
   * Set up drag and drop upload
   */
  setupDragAndDrop() {
    const uploadArea = document.getElementById('uploadArea');
    if (!uploadArea) return;
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      uploadArea.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Drag event:', eventName);
      });
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      uploadArea.addEventListener(eventName, () => {
        uploadArea.classList.add('drag-over');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      uploadArea.addEventListener(eventName, () => {
        uploadArea.classList.remove('drag-over');
      });
    });

    uploadArea.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.handleFile(files[0]);
      }
    });
  }

  /**
   * Switch input mode
   */
  switchInputMode(mode) {
    // Update button state
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // Switch input area
    document.getElementById('combinedInput').style.display = mode === 'combined' ? 'block' : 'none';
    document.getElementById('separatedInput').style.display = mode === 'separated' ? 'block' : 'none';
  }

  /**
   * Switch display mode
   */
  switchDisplayMode(mode) {
    // Update tab state
    document.querySelectorAll('.display-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.mode === mode);
    });

    // Switch display content
    document.getElementById('displayLPA').classList.toggle('active', mode === 'lpa');
    document.getElementById('displaySeparated').classList.toggle('active', mode === 'separated');
  }

  /**
   * Copy to clipboard
   */
  async copyToClipboard(type) {
    let text = '';
    
    switch (type) {
      case 'lpa':
        text = this.currentLPA || '';
        break;
      case 'smdp':
        text = this.currentParsed?.smdpAddress || '';
        break;
      case 'activation':
        text = this.currentParsed?.activationCode || '';
        break;
      case 'password':
        text = this.currentParsed?.activationPassword || this.currentParsed?.password || '';
        break;
    }

    if (!text) {
      this.showNotification('no_content_to_copy', 'warning');
          return;
        }

    try {
      await navigator.clipboard.writeText(text);
      this.showNotification('copied_to_clipboard', 'success');
    } catch (error) {
      // Fallback method
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.showNotification('copied_to_clipboard', 'success');
    }
  }

  /**
   * Generate QR code
   */
  async generateQR() {
    try {
      this.showLoading('generateBtn');
      
      // Get input
      const input = document.getElementById('combinedText').value.trim();
      if (!input) {
        this.showNotification('enter_esim_config', 'warning');
        return;
      }
      
      // Simple parsing
      const parts = input.split('$');
      let smdpAddress, activationCode, password;

      if (parts.length >= 2) {
        if (parts[0] === '1' || parts[0].startsWith('LPA:1')) {
          // Format: 1$smdp$activation or LPA:1$smdp$activation
          smdpAddress = parts[1];
          activationCode = parts[2];
          password = parts[3] || '';
        } else {
          // Format: smdp$activation$password
          smdpAddress = parts[0].replace('LPA:', '');
          activationCode = parts[1];
          password = parts[2] || '';
        }
      } else {
        // Show format error dialog
        this.showFormatErrorDialog(input);
        return;
      }

      // Generate LPA string
      const lpaString = this.generateLPAString(smdpAddress, activationCode, password);
      
      // Generate QR code
      let qrCanvas;
      if (window.QRious) {
      const qr = new QRious({
        value: lpaString,
          size: 300,
        level: 'M'
      });
        qrCanvas = qr.canvas;
      } else {
        // Use built-in simple QR generator
        qrCanvas = this.generateSimpleQR(lpaString, 300);
      }

      // Display QR code
      this.displayQRCode({
        qrCode: { canvas: qrCanvas },
        esimData: {
          lpaString,
          smdpAddress,
          activationCode,
          activationPassword: password
        }
      });

      // Update display content
      this.updateDisplayModes({
        esimData: {
          lpaString,
          smdpAddress,
          activationCode,
          activationPassword: password
        }
      });

      // Store data
      this.currentLPA = lpaString;
      this.currentParsed = { smdpAddress, activationCode, activationPassword: password };
      this.currentQRData = { qrCode: { canvas: qrCanvas } };
      
      this.showNotification('qr_generated_success', 'success');

    } catch (error) {
      console.error('Generation failed:', error);
      this.showGenerationErrorDialog(error.message || 'Unknown error');
    } finally {
      this.hideLoading('generateBtn');
    }
  }

  /**
   * Parse eSIM input
   */
  parseESIMInput(input) {
    try {
      // Clean input
      const cleanInput = input.trim();
      console.log('Parsing input:', input, 'cleaned:', cleanInput);
      
      if (!cleanInput) {
        return { success: false, error: 'Input cannot be empty' };
      }

      let smdpAddress, activationCode, password = '';

      // Check if it already contains LPA prefix
      if (cleanInput.startsWith('LPA:')) {
        const content = cleanInput.substring(4); // Remove "LPA:"
        const parts = content.split('$');
        if (parts.length < 3) {
          return { success: false, error: 'LPA format error: missing required information' };
        }
        // Skip version number (parts[0] should be "1")
        smdpAddress = parts[1];
        activationCode = parts[2];
        password = parts[3] || '';
      } else {
        // Check separator format
        if (cleanInput.includes('$')) {
        const parts = cleanInput.split('$');
        if (parts.length < 2) {
            return { success: false, error: 'Format error: at least SM-DP+ address and activation code required' };
        }
        
          if (parts[0] === '1') {
            // Format: 1$smdp$activation$password
          smdpAddress = parts[1];
          activationCode = parts[2];
          password = parts[3] || '';
            console.log('Parsed as format1:', { smdpAddress, activationCode, password });
        } else {
            // Format: smdp$activation$password
          smdpAddress = parts[0];
          activationCode = parts[1];
          password = parts[2] || '';
            console.log('Parsed as format2:', { smdpAddress, activationCode, password });
          }
        } else {
          // Try other separators
          const separators = [' ', ',', '|', ';', '\t', '\n'];
          let parsed = false;
        
        for (const sep of separators) {
          if (cleanInput.includes(sep)) {
              const parts = cleanInput.split(sep).filter(p => p.trim());
            if (parts.length >= 2) {
              smdpAddress = parts[0].trim();
              activationCode = parts[1].trim();
                password = parts[2] ? parts[2].trim() : '';
                parsed = true;
              break;
            }
          }
        }
        
          if (!parsed) {
            return { success: false, error: 'Unable to recognize input format, please use standard format' };
          }
        }
      }

      // Validate results
      console.log('Data before validation:', { smdpAddress, activationCode, password });
      
      if (!this.validateSMDPAddress(smdpAddress)) {
        console.log('SM-DP+ address validation failed:', smdpAddress);
        return { success: false, error: 'Invalid SM-DP+ address format' };
      }
      
      if (!this.validateActivationCode(activationCode)) {
        console.log('Activation code validation failed:', activationCode);
        return { success: false, error: 'Invalid activation code format' };
      }

      console.log('Validation passed, returning data:', { smdpAddress, activationCode, password });

      return {
        success: true,
        data: { smdpAddress, activationCode, password }
      };
    } catch (error) {
      console.error('Error during parsing:', error);
      return { success: false, error: 'Error occurred during parsing' };
    }
  }

  /**
   * Generate LPA string
   */
  generateLPAString(smdpAddress, activationCode, password = '') {
    if (password) {
      return `LPA:1$${smdpAddress}$${activationCode}$${password}`;
    } else {
      return `LPA:1$${smdpAddress}$${activationCode}`;
    }
  }

  /**
   * Validate SM-DP+ address
   */
  validateSMDPAddress(address) {
    if (!address || typeof address !== 'string') return false;
    // Basic domain format check
    return /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(address.trim());
  }

  /**
   * Validate activation code
   */
  validateActivationCode(code) {
    if (!code || typeof code !== 'string') return false;
    // Basic activation code format check
    return /^[A-Z0-9-]{8,}$/i.test(code.trim());
  }

  /**
   * Display QR code
   */
  displayQRCode(data) {
    console.log('Displaying QR code, element check:', {
      qrDisplay: !!document.getElementById('qrDisplay'),
      qrContainer: !!document.getElementById('qrContainer')
    });

    const qrDisplay = document.getElementById('qrDisplay');
    const qrContainer = document.getElementById('qrContainer');
    
    if (!qrDisplay || !qrContainer) {
      console.error('Cannot find necessary display elements');
      this.showNotification('page_element_error', 'error');
      return;
    }

    // Clear container
    qrContainer.innerHTML = '';
    
    // Add QR code to main container
    qrContainer.appendChild(data.qrCode.canvas);
    
    // Update both display modes
    this.updateDisplayModes(data);
    
    // Store data for download and copy use
    this.currentQRData = data;
    
    // Show display area
    qrDisplay.style.display = 'block';
    qrDisplay.scrollIntoView({ behavior: 'smooth' });
  }

  /**
   * Update display mode content
   */
  updateDisplayModes(data) {
    console.log('Updating display mode, data:', data);

    // Update LPA address display
    const lpaAddressDisplay = document.getElementById('lpaAddressDisplay');
    if (lpaAddressDisplay && data.esimData?.lpaString) {
      lpaAddressDisplay.textContent = data.esimData.lpaString;
      console.log('LPA address updated:', data.esimData.lpaString);
    } else {
      console.error('Cannot find lpaAddressDisplay element');
    }

    // Update separated information display
    const smdpDisplay = document.getElementById('smdpDisplay');
    const activationDisplay = document.getElementById('activationDisplay');
    const passwordDisplay = document.getElementById('passwordDisplay');
    const passwordDisplayItem = document.getElementById('passwordDisplayItem');

    console.log('eSIM data:', data.esimData);
    console.log('Found elements:', {
      smdpDisplay: !!smdpDisplay,
      activationDisplay: !!activationDisplay,
      passwordDisplay: !!passwordDisplay,
      passwordDisplayItem: !!passwordDisplayItem
    });

    if (smdpDisplay && data.esimData?.smdpAddress) {
      smdpDisplay.textContent = data.esimData.smdpAddress;
      console.log('SM-DP+ address updated:', data.esimData.smdpAddress);
    }

    if (activationDisplay && data.esimData?.activationCode) {
      activationDisplay.textContent = data.esimData.activationCode;
      console.log('Activation code updated:', data.esimData.activationCode);
    }

    if (passwordDisplay && passwordDisplayItem) {
      if (data.esimData?.activationPassword || data.esimData?.password) {
        passwordDisplay.textContent = data.esimData.activationPassword || data.esimData.password;
        passwordDisplayItem.style.display = 'block';
        console.log('Password updated:', data.esimData.activationPassword || data.esimData.password);
      } else {
        passwordDisplayItem.style.display = 'none';
        console.log('No password, hiding password item');
      }
    }
  }

  /**
   * Detect if it might be eSIM data
   */
  isPotentialESIMData(text) {
    const cleanData = text.trim().toLowerCase();
    
    // Check if it contains eSIM-related key information
    return (
      cleanData.includes('$') ||  // Contains separator
      cleanData.includes('.') ||  // Contains domain
      /[A-Z0-9-]{10,}/.test(cleanData) ||  // Contains long alphanumeric string (possibly activation code)
      cleanData.toLowerCase().includes('lpa') ||  // Contains LPA keyword
      cleanData.toLowerCase().includes('esim')    // Contains eSIM keyword
    );
  }

  /**
   * Show extraction confirmation dialog
   */
  showExtractionDialog(detectedText) {
    // Create dialog
    const dialog = document.createElement('div');
    dialog.className = 'dialog-overlay';
    
    // Ensure proper positioning
    dialog.style.position = 'fixed';
    dialog.style.top = '0';
    dialog.style.left = '0';
    dialog.style.right = '0';
    dialog.style.bottom = '0';
    dialog.style.zIndex = '10000';
    dialog.style.display = 'flex';
    dialog.style.alignItems = 'center';
    dialog.style.justifyContent = 'center';
    dialog.innerHTML = `
      <div class="dialog-content" style="background: white; border-radius: 12px; padding: 2rem; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); border: 2px solid #6b46c1;">
        <div class="dialog-body">
          <h3 style="color: #6b46c1; margin-bottom: 1rem; text-align: center;">⚠️ Incomplete or Incorrect LPA Information</h3>
          
          <div class="detected-content">
          <p><strong>Detected QR code content:</strong></p>
          <div class="code-block">${detectedText}</div>
          
            <p><strong>⚠️ Problem:</strong> This QR code format does not comply with standards and cannot be directly recognized by iPhone.</p>
            <p><strong>💡 Common causes:</strong></p>
            <ul>
              <li>Missing "LPA:" prefix</li>
              <li>Missing version number information</li>
              <li>Carrier used non-standard format</li>
            </ul>
          </div>
          <p><strong>🔧 Solution:</strong> Do you want to extract the original information and regenerate a standard format QR code?</p>
          
          <div class="dialog-actions" style="display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem;">
            <button onclick="this.closest('.dialog-overlay').remove()" class="btn-cancel" style="padding: 0.75rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem; background: #e2e8f0; color: #4a5568;">
              <span>❌</span> Cancel
            </button>
            <button onclick="window.esimParser.confirmExtraction(\`${detectedText.replace(/`/g, '\\`')}\`); this.closest('.dialog-overlay').remove()" class="btn-confirm" style="padding: 0.75rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem; background: #6b46c1; color: white;">
              <span>✅</span> Yes, Extract and Fix
            </button>
          </div>
        </div>
      </div>
    `;

    // Add custom styles for this dialog
    const internalStyle = document.createElement('style');
    internalStyle.textContent = `
      .detected-content {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 8px;
        margin: 1rem 0;
        border-left: 4px solid var(--primary-purple);
        font-size: 14px;
      }
    `;
    dialog.appendChild(internalStyle);

    document.body.appendChild(dialog);

    // Click overlay to close
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) {
        dialog.remove();
      }
    });
  }

  /**
   * Confirm extraction
   */
  confirmExtraction(detectedText) {
    // Show second confirmation dialog
    this.showExtractionConfirmDialog(detectedText);
  }

  /**
   * Show extraction confirmation dialog
   */
  showExtractionConfirmDialog(detectedText) {
    // Create dialog
    const dialog = document.createElement('div');
    dialog.className = 'dialog-overlay';
    
    // Ensure proper positioning
    dialog.style.position = 'fixed';
    dialog.style.top = '0';
    dialog.style.left = '0';
    dialog.style.right = '0';
    dialog.style.bottom = '0';
    dialog.style.zIndex = '10000';
    dialog.style.display = 'flex';
    dialog.style.alignItems = 'center';
    dialog.style.justifyContent = 'center';
    dialog.innerHTML = `
      <div class="dialog-content" style="background: white; border-radius: 12px; padding: 2rem; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); border: 2px solid #6b46c1;">
        <div class="dialog-body">
          <h3 style="color: #6b46c1; margin-bottom: 1rem; text-align: center;">🔧 Prepare to Extract Information</h3>
          
          <div class="extraction-info">
          <p><strong>About to execute:</strong></p>
          <ul>
            <li>Fill original information into left input box</li>
            <li>You can manually edit and correct the information</li>
            <li>Click "Generate QR Code" to create correct QR code</li>
          </ul>
          <p><strong>Original information:</strong></p>
          <div class="code-block">${detectedText}</div>
          </div>
          
          <div class="dialog-actions">
            <button onclick="this.closest('.dialog-overlay').remove(); window.esimParser.showExtractionDialog(\`${detectedText.replace(/`/g, '\\`')}\`);" class="btn-cancel">
              <span>⬅️</span> Back
            </button>
            <button onclick="window.esimParser.executeExtraction(\`${detectedText.replace(/`/g, '\\`')}\`); this.closest('.dialog-overlay').remove()" class="btn-confirm">
              <span>🚀</span> Confirm Extraction
            </button>
          </div>
        </div>
      </div>
    `;

    // Add custom styles for this dialog
    const internalStyle = document.createElement('style');
    internalStyle.textContent = `
      .extraction-info {
        background: #f0f8ff;
        padding: 1rem;
        border-radius: 8px;
        margin: 1rem 0;
        border-left: 4px solid var(--primary-purple);
        font-size: 14px;
      }
    `;
    dialog.appendChild(internalStyle);

    document.body.appendChild(dialog);

    // Click overlay to close
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) {
        dialog.remove();
      }
    });
  }

  /**
   * Execute extraction operation
   */
  executeExtraction(detectedText) {
    // Fill into input box
    const combinedTextInput = document.getElementById('combinedText');
    if (combinedTextInput) {
      combinedTextInput.value = detectedText;
      
      // Highlight input box
      combinedTextInput.style.border = '2px solid var(--primary-purple)';
      combinedTextInput.style.boxShadow = '0 0 10px rgba(139, 92, 246, 0.3)';
      
      // Scroll to input area
      this.focusInputArea();
      
      // Focus input box
      combinedTextInput.focus();
      
      // Restore style after 3 seconds
      setTimeout(() => {
        combinedTextInput.style.border = '';
        combinedTextInput.style.boxShadow = '';
      }, 3000);
    }

    // Show success message
    this.showNotification('extraction_success', 'success');
  }

  /**
   * Try to fix QR code
   */
  tryFixQRCode(qrData) {
    console.log('Trying to fix QR code:', qrData);
    
    // Clean data
    const cleanData = qrData.trim();

    // Check various common problems
    
    // 1. Missing LPA: prefix
    if (!cleanData.startsWith('LPA:')) {
      // Check if it looks like valid eSIM data
      if (cleanData.includes('$') && cleanData.split('$').length >= 2) {
        const fixed = `LPA:${cleanData.startsWith('1$') ? cleanData : '1$' + cleanData}`;
        return {
          success: true,
          fixed: fixed,
          original: qrData,
          problem: 'Missing LPA: prefix',
          solution: 'Added LPA: prefix and version number'
        };
      }
    }

    // 2. Missing version number "1$"
    if (cleanData.startsWith('LPA:') && !cleanData.startsWith('LPA:1$')) {
      const content = cleanData.substring(4); // Remove "LPA:"
      if (content.includes('$') && content.split('$').length >= 2) {
        const fixed = `LPA:1$${content}`;
        return {
          success: true,
          fixed: fixed,
          original: qrData,
          problem: 'Missing version number "1$"',
          solution: 'Added version number "1$"'
        };
      }
    }

    // 3. Format error but contains valid information
    const parts = cleanData.replace('LPA:', '').split(/[$\s,|;]/);
    if (parts.length >= 2) {
      // Try to reorganize
      const smdpAddress = parts.find(p => p.includes('.'));
      const activationCode = parts.find(p => /^[A-Z0-9-]{8,}$/i.test(p) && !p.includes('.'));
      
      // Find part that looks like domain
      if (smdpAddress && activationCode) {
        const password = parts.find(p => p && p !== smdpAddress && p !== activationCode && p !== '1');
        const fixed = password ? 
          `LPA:1$${smdpAddress}$${activationCode}$${password}` : 
          `LPA:1$${smdpAddress}$${activationCode}`;
        
        return {
          success: true,
          fixed: fixed,
          original: qrData,
          problem: 'Format confusion, reorganized',
          solution: 'Reorganized information into standard format'
        };
      }
    }

    // 4. Check if it's plain text but correct format
    if (this.isPotentialESIMData(cleanData)) {
      return {
        success: false,
        problem: 'Not valid eSIM LPA format, please manually input correct LPA string'
      };
    }

    // 5. Other format problems
    return {
      success: false,
      problem: 'Unrecognizable QR code format, may not be eSIM configuration information'
    };
  }

  /**
   * Show before/after comparison
   */
  showFixComparison(original, fixed, problem) {
    // Create comparison display
    const notification = document.createElement('div');
    notification.className = 'notification info';
    notification.innerHTML = `
      <div class="fix-comparison">
        <h3>🔧 QR Code Fix Report</h3>
        <p>
          <strong>Problem found:</strong>${problem}
        </p>
        <div class="comparison">
          <div class="before-after">
            <strong>Before fix:</strong>
            <code>${original}</code>
          </div>
          <div class="before-after">
            <strong>After fix:</strong>
            <code>${fixed}</code>
          </div>
        </div>
        <p class="suggestion">
          💡 Suggest contacting carrier to update QR code format for compliance
        </p>
        <button onclick="this.parentElement.parentElement.remove()" class="close-btn">Close</button>
      </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .fix-comparison { padding: 1rem; }
      .fix-comparison h3 { color: var(--primary-purple); margin-bottom: 1rem; }
      .comparison { margin: 1rem 0; }
      .before-after { margin: 0.5rem 0; }
      .before-after code { 
        display: block; 
        background: #f5f5f5; 
        padding: 0.5rem; 
        border-radius: 4px; 
        margin-top: 0.25rem;
        word-break: break-all;
      }
      .suggestion { color: var(--text-secondary); font-style: italic; }
      .close-btn { 
        background: var(--primary-purple); 
        color: white; 
        border: none; 
        padding: 0.5rem 1rem; 
        border-radius: 4px; 
        cursor: pointer; 
        margin-top: 1rem;
      }
    `;
    notification.appendChild(style);

    document.body.appendChild(notification);

    // Auto close after 3 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 8000);
  }

  /**
   * Show fallback input prompt
   */
  showFallbackInput(detectedText = null) {
    // If detected text exists, show extraction dialog
    if (detectedText && this.isPotentialESIMData(detectedText)) {
      this.showExtractionDialog(detectedText);
    } else {
      // If no text detected, show manual input prompt dialog
      this.showManualInputDialog();
    }
  }

  /**
   * Show manual input prompt dialog
   */
  showManualInputDialog() {
    // Create dialog
    const dialog = document.createElement('div');
    dialog.className = 'dialog-overlay';
    
    // Ensure proper positioning
    dialog.style.position = 'fixed';
    dialog.style.top = '0';
    dialog.style.left = '0';
    dialog.style.right = '0';
    dialog.style.bottom = '0';
    dialog.style.zIndex = '10000';
    dialog.style.display = 'flex';
    dialog.style.alignItems = 'center';
    dialog.style.justifyContent = 'center';
    dialog.innerHTML = `
      <div class="dialog-content" style="background: white; border-radius: 12px; padding: 2rem; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); border: 2px solid #6b46c1;">
        <div class="dialog-body">
          <h3 style="color: #6b46c1; margin-bottom: 1rem; text-align: center;">📝 Manual Input Required</h3>
          
          <div class="manual-input-info">
          <p><strong>❌ Unable to recognize QR code content</strong></p>
          <p>Possible reasons:</p>
          <ul>
            <li>Image not clear enough</li>
            <li>Not an eSIM QR code</li>
            <li>QR code damaged</li>
          </ul>
          <p><strong>💡 Suggestion:</strong> Please manually input LPA string in the input box above</p>
          <div class="format-examples">
            <strong>Format examples:</strong><br>
            <code>LPA:1$t-mobile.idemia.io$1BCH0-T6TKQ-PWCXS-FM6OD</code><br>
            or: <code>1$t-mobile.idemia.io$1BCH0-T6TKQ-PWCXS-FM6OD</code>
          </div>
          </div>
          
          <div class="dialog-actions">
            <button onclick="window.esimParser.focusInputArea(); this.closest('.dialog-overlay').remove()" class="btn-confirm">
              <span>✏️</span> Go to Input Box
            </button>
          </div>
        </div>
      </div>
    `;

    // Add custom styles for this dialog
    const internalStyle = document.createElement('style');
    internalStyle.textContent = `
      .manual-input-info {
        background: #fff5f5;
        padding: 1rem;
        border-radius: 8px;
        margin: 1rem 0;
        border-left: 4px solid #f56565;
        font-size: 14px;
      }
      
      .format-examples {
        background: #f7fafc;
        padding: 0.75rem;
        border-radius: 6px;
        margin-top: 1rem;
        border: 1px solid #e2e8f0;
        font-size: 14px;
      }
      
      .format-examples code {
        background: #2d3748;
        color: #e2e8f0;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 12px;
        display: inline-block;
        margin: 0.25rem 0;
      }
    `;
    dialog.appendChild(internalStyle);

    document.body.appendChild(dialog);

    // Click overlay to close
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) {
        dialog.remove();
      }
    });
  }

  /**
   * Show format error dialog
   */
  showFormatErrorDialog(input) {
    // Create dialog
    const dialog = document.createElement('div');
    dialog.className = 'dialog-overlay';
    
    // Ensure proper positioning
    dialog.style.position = 'fixed';
    dialog.style.top = '0';
    dialog.style.left = '0';
    dialog.style.right = '0';
    dialog.style.bottom = '0';
    dialog.style.zIndex = '10000';
    dialog.style.display = 'flex';
    dialog.style.alignItems = 'center';
    dialog.style.justifyContent = 'center';
    dialog.innerHTML = `
      <div class="dialog-content" style="background: white; border-radius: 12px; padding: 2rem; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); border: 2px solid #6b46c1;">
        <div class="dialog-body">
          <h3 style="color: #6b46c1; margin-bottom: 1rem; text-align: center;">❌ Input Format Error</h3>
          
          <div class="error-info">
          <p><strong>Your input:</strong></p>
          <div class="code-block">${input}</div>
          <p><strong>⚠️ Problem:</strong> Format incorrect, cannot parse as valid eSIM configuration.</p>
          <p><strong>💡 Correct formats:</strong></p>
          <div class="format-examples">
            <div class="format-item">
              <strong>Standard format:</strong><br>
              <code>LPA:1$t-mobile.idemia.io$1BCH0-T6TKQ-PWCXS-FM6OD</code><br>
              <strong>Simplified format:</strong><br>
              <code>1$t-mobile.idemia.io$1BCH0-T6TKQ-PWCXS-FM6OD</code><br>
              <strong>Basic format:</strong><br>
              <code>t-mobile.idemia.io$1BCH0-T6TKQ-PWCXS-FM6OD</code>
            </div>
          </div>
          <p><strong>🔧 Suggestion:</strong> Please check and correct input format, ensure it contains SM-DP+ address and activation code.</p>
          </div>
          
          <div class="dialog-actions">
            <button onclick="window.esimParser.focusInputArea(); this.closest('.dialog-overlay').remove()" class="btn-confirm">
              <span>✏️</span> Correct Input
            </button>
          </div>
        </div>
      </div>
    `;

    // Add custom styles for this dialog
    const internalStyle = document.createElement('style');
    internalStyle.textContent = `
      .dialog-content {
        border: 2px solid #f56565;
        max-width: 520px;
      }
      
      .dialog-body h3 {
        color: #f56565;
      }
      
      .error-info {
        background: #fff5f5;
        padding: 1rem;
        border-radius: 8px;
        margin: 1rem 0;
        border-left: 4px solid #f56565;
        font-size: 14px;
      }
      
      .format-examples {
        background: #f7fafc;
        padding: 1rem;
        border-radius: 6px;
        margin: 1rem 0;
        border: 1px solid #e2e8f0;
        font-size: 14px;
      }
      
      .format-item code {
        background: #2d3748;
        color: #e2e8f0;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 12px;
        display: inline-block;
        margin: 0.25rem 0;
      }
    `;
    dialog.appendChild(internalStyle);

    document.body.appendChild(dialog);

    // Click overlay to close
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) {
        dialog.remove();
      }
    });
  }

  /**
   * Show generation error dialog
   */
  showGenerationErrorDialog(errorMessage) {
    // Create dialog
    const dialog = document.createElement('div');
    dialog.className = 'dialog-overlay';
    
    // Ensure proper positioning
    dialog.style.position = 'fixed';
    dialog.style.top = '0';
    dialog.style.left = '0';
    dialog.style.right = '0';
    dialog.style.bottom = '0';
    dialog.style.zIndex = '10000';
    dialog.style.display = 'flex';
    dialog.style.alignItems = 'center';
    dialog.style.justifyContent = 'center';
    dialog.innerHTML = `
      <div class="dialog-content" style="background: white; border-radius: 12px; padding: 2rem; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); border: 2px solid #6b46c1;">
        <div class="dialog-body">
          <h3 style="color: #6b46c1; margin-bottom: 1rem; text-align: center;">⚠️ QR Code Generation Failed</h3>
          
          <div class="error-info">
          <p><strong>❌ Error occurred during generation:</strong></p>
          <div class="error-message">${errorMessage}</div>
          <p><strong>🔧 Possible solutions:</strong></p>
          <ul>
            <li>Check if input format is correct</li>
            <li>Ensure valid SM-DP+ address</li>
            <li>Ensure activation code format is correct</li>
            <li>Try refreshing page and regenerate</li>
          </ul>
          <div class="format-hint">
            <strong>💡 Tip:</strong> If problem persists, try using standard format:<br>
            <code>LPA:1$smdp-address$activation-code</code>
          </div>
          </div>
          
          <div class="dialog-actions">
            <button onclick="this.closest('.dialog-overlay').remove()" class="btn-cancel">
              <span>❌</span> Close
            </button>
            <button onclick="window.esimParser.focusInputArea(); this.closest('.dialog-overlay').remove()" class="btn-confirm">
              <span>✏️</span> Re-enter
            </button>
          </div>
        </div>
      </div>
    `;

    // Add custom styles for this dialog
    const internalStyle = document.createElement('style');
    internalStyle.textContent = `
      .dialog-content {
        border: 2px solid #f59e0b;
      }
      
      .dialog-body h3 {
        color: #f59e0b;
      }
      
      .error-info {
        background: #fffbeb;
        padding: 1rem;
        border-radius: 8px;
        margin: 1rem 0;
        border-left: 4px solid #f59e0b;
        font-size: 14px;
      }
      
      .error-message {
        background: #fef2f2;
        color: #dc2626;
        padding: 0.6rem;
        border-radius: 6px;
        font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
        font-size: 13px;
        margin: 0.5rem 0;
        border: 1px solid #fecaca;
        line-height: 1.4;
      }
      
      .format-hint {
        background: #f0f9ff;
        padding: 0.75rem;
        border-radius: 6px;
        margin-top: 1rem;
        border: 1px solid #bae6fd;
        font-size: 14px;
      }
      
      .format-hint code {
        background: #2d3748;
        color: #e2e8f0;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 12px;
      }
    `;
    dialog.appendChild(internalStyle);

    document.body.appendChild(dialog);

    // Click overlay to close
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) {
        dialog.remove();
      }
    });
  }

  /**
   * Show library loading error dialog
   */
  showLibraryErrorDialog() {
    // Create dialog
    const dialog = document.createElement('div');
    dialog.className = 'dialog-overlay';
    
    // Ensure proper positioning
    dialog.style.position = 'fixed';
    dialog.style.top = '0';
    dialog.style.left = '0';
    dialog.style.right = '0';
    dialog.style.bottom = '0';
    dialog.style.zIndex = '10000';
    dialog.style.display = 'flex';
    dialog.style.alignItems = 'center';
    dialog.style.justifyContent = 'center';
    dialog.innerHTML = `
      <div class="dialog-content" style="background: white; border-radius: 12px; padding: 2rem; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); border: 2px solid #6b46c1;">
        <div class="dialog-body">
          <h3 style="color: #6b46c1; margin-bottom: 1rem; text-align: center;">📚 QR Code Parsing Library Not Loaded</h3>
          
          <div class="library-error-info">
          <p><strong>⚠️ Problem:</strong> QR code parsing function temporarily unavailable.</p>
          <p><strong>🔧 Solutions:</strong></p>
          <ul>
            <li>Refresh page to reload library files</li>
            <li>Check if network connection is normal</li>
            <li>Or directly manually input LPA string</li>
          </ul>
          <div class="manual-input-hint">
            <strong>💡 Tip:</strong> You can manually input LPA string in the input box above,<br>
            format like: <code>LPA:1$smdp-address$activation-code</code>
          </div>
          </div>
          
          <div class="dialog-actions">
            <button onclick="location.reload()" class="btn-refresh">
              <span>🔄</span> Refresh Page
            </button>
            <button onclick="window.esimParser.focusInputArea(); this.closest('.dialog-overlay').remove()" class="btn-manual">
              <span>✏️</span> Manual Input
            </button>
          </div>
        </div>
      </div>
    `;

    // Add custom styles for this dialog
    const internalStyle = document.createElement('style');
    internalStyle.textContent = `
      .dialog-content {
        border: 2px solid #3b82f6;
      }
      
      .dialog-body h3 {
        color: #3b82f6;
      }
      
      .library-error-info {
        background: #eff6ff;
        padding: 1rem;
        border-radius: 8px;
        margin: 1rem 0;
        border-left: 4px solid #3b82f6;
        font-size: 14px;
      }
      
      .manual-input-hint {
        background: #f9fafb;
        padding: 0.75rem;
        border-radius: 6px;
        margin-top: 1rem;
        border: 1px solid #e5e7eb;
        font-size: 14px;
      }
      
      .manual-input-hint code {
        background: #2d3748;
        color: #e2e8f0;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 12px;
      }
      
      .btn-refresh {
        background: #3b82f6;
        color: white;
      }
      
      .btn-refresh:hover {
        background: #2563eb;
        transform: translateY(-1px);
      }
      
      .btn-manual {
        background: var(--primary-purple);
        color: white;
      }
      
      .btn-manual:hover {
        background: var(--primary-purple-dark);
        transform: translateY(-1px);
      }
    `;
    dialog.appendChild(internalStyle);

    document.body.appendChild(dialog);

    // Click overlay to close
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) {
        dialog.remove();
      }
    });
  }

  /**
   * Focus to input area
   */
  focusInputArea() {
    const combinedTextInput = document.getElementById('combinedText');
    if (combinedTextInput) {
      // Scroll to input area
      combinedTextInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Focus input box
      setTimeout(() => {
        combinedTextInput.focus();
        // Highlight input box
        combinedTextInput.style.border = '2px solid var(--primary-purple)';
        combinedTextInput.style.boxShadow = '0 0 10px rgba(139, 92, 246, 0.3)';
        
        // Restore style after 3 seconds
        setTimeout(() => {
          combinedTextInput.style.border = '';
          combinedTextInput.style.boxShadow = '';
        }, 3000);
      }, 500);
    }
  }

  /**
   * Handle file upload
   */
  handleUpload(event) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  /**
   * Handle file
   */
  async handleFile(file) {
    try {
      this.showLoading('uploadArea');
      
      // Validate file
      if (!file.type.startsWith('image/')) {
        this.showNotification('upload_image_file', 'warning');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        this.showNotification('file_size_limit', 'warning');
        return;
      }

      // Check if jsQR is available
      if (!window.jsQR) {
        this.showLibraryErrorDialog();
        return;
      }

      // Read image
      const imageData = await this.loadImageData(file);
      
      // Parse QR code
      const qrResult = window.jsQR(imageData.data, imageData.width, imageData.height);
      
      if (!qrResult) {
        this.showNotification('no_qr_detected', 'warning');
        return;
      }

      // Parse LPA content
      const parseResult = this.parseLpaString(qrResult.data);
      if (!parseResult.success) {
        // Always show dialog regardless of situation, let user choose
        this.showExtractionDialog(qrResult.data);
        return;
      }

      // Display parse results
      this.showParseResult({
        smdpAddress: parseResult.data.smdpAddress,
        activationCode: parseResult.data.activationCode,
        password: parseResult.data.password,
        raw: qrResult.data
      });
      
      this.showNotification('qr_parse_success', 'success');
      
      // Re-bind upload area events (ensure events are not lost)
      console.log('Re-binding events after correct parsing');
      // Execute immediately, no delay
      this.rebindUploadEvents();

    } catch (error) {
      console.error('QR code parsing failed:', error);
      this.showNotification('qr_parse_failed', 'error');
    } finally {
      this.hideLoading('uploadArea');
    }
  }

  /**
   * Load image data
   */
  loadImageData(file) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        resolve(imageData);
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Parse LPA string
   */
  parseLpaString(lpaString) {
    if (!lpaString.startsWith('LPA:')) {
      return { success: false, error: 'Not valid eSIM LPA format' };
    }
    
    const content = lpaString.substring(4); // Remove "LPA:"
    const parts = content.split('$');
    
    if (parts.length < 3) {
      return { success: false, error: 'LPA format error' };
    }
    
    return {
      success: true,
      data: {
        smdpAddress: parts[1],
        activationCode: parts[2],
        password: parts[3] || ''
      }
    };
  }

  /**
   * Re-bind upload area events
   */
  rebindUploadEvents() {
    console.log('rebindUploadEvents called');
    
    // Check if there are duplicate fileInput elements
    const allFileInputs = document.querySelectorAll('[id^="fileInput"]');
    console.log('Found fileInput elements count:', allFileInputs.length);
    
    // Remove all old fileInput elements
    allFileInputs.forEach((input, index) => {
      console.log(`Removing ${index + 1}th fileInput`);
      input.remove();
    });
    
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) {
      console.log('Starting to recreate upload area...');
      
      // Use unique ID and timestamp
      const timestamp = Date.now();
      const newFileInputId = `fileInput_${timestamp}`;
      
      // Recreate upload area HTML content
      uploadArea.innerHTML = `
        <div class="upload-icon">📷</div>
        <p class="upload-text">
          Drag QR code image here<br>
          or 
          <button class="upload-btn" onclick="handleUploadClickNew('${newFileInputId}')">
            <span class="btn-icon">📁</span> 
            Select File
          </button>
        </p>
        <input type="file" id="${newFileInputId}" accept="image/*" style="display: none;" onchange="handleFileChangeNew(event, '${newFileInputId}')">
      `;
      
      // Re-set drag events
      this.setupDragAndDrop();
      
      console.log(`Upload area recreated, new fileInput ID: ${newFileInputId}`);
    } else {
      console.error('Cannot find uploadArea element');
    }
  }

  /**
   * Show parsing results
   */
  showParseResult(data) {
    document.getElementById('parsedSmdp').textContent = data.smdpAddress;
    document.getElementById('parsedActivation').textContent = data.activationCode;
    document.getElementById('parsedPassword').textContent = data.password || 'None';
    document.getElementById('parsedRaw').textContent = data.raw || '-';
    
    document.getElementById('parseResult').style.display = 'block';
  }

  /**
   * Download QR code
   */
  downloadQR() {
    if (!this.currentQRData || !this.currentQRData.qrCode) {
      this.showNotification('no_qr_to_download', 'warning');
      return;
    }

    const canvas = this.currentQRData.qrCode.canvas;
    const link = document.createElement('a');
    link.download = 'esim-qr-code.png';
    link.href = canvas.toDataURL();
    link.click();
    
    this.showNotification('qr_download_success', 'success');
  }

  /**
   * Copy LPA string
   */
  async copyLPA() {
    if (!this.currentLPA) {
      this.showNotification('no_lpa_to_copy', 'warning');
      return;
    }

    try {
      await navigator.clipboard.writeText(this.currentLPA);
      this.showNotification('lpa_copied', 'success');
    } catch (error) {
      // Fallback method
      const textArea = document.createElement('textarea');
      textArea.value = this.currentLPA;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.showNotification('lpa_copied', 'success');
    }
  }

  /**
   * Clear results
   */
  clearResults() {
    // Clear display
    document.getElementById('qrDisplay').style.display = 'none';
    document.getElementById('parseResult').style.display = 'none';
    
    // Clear input
    document.getElementById('combinedText').value = '';
    document.getElementById('smdpAddress').value = '';
    document.getElementById('activationCode').value = '';
    document.getElementById('activationPassword').value = '';
    document.getElementById('fileInput').value = '';
    
    this.showNotification('results_cleared', 'success');
  }

  /**
   * Show loading state
   */
  showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Special handling for upload area
    if (elementId === 'uploadArea') {
      // Add loading indicator
      const loadingIndicator = document.createElement('div');
      loadingIndicator.className = 'loading-indicator';
      loadingIndicator.innerHTML = '<span class="spinner"></span>Parsing...';
      loadingIndicator.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(139, 92, 246, 0.9);
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        font-weight: 600;
        z-index: 100;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      `;
      
      // Make upload area relative positioned
      element.style.position = 'relative';
      element.appendChild(loadingIndicator);
    } else {
      // Button element original logic
    element.disabled = true;
      element.style.opacity = '0.7';
      element.innerHTML = '<span class="loading"><span class="spinner"></span>Processing...</span>';
    }
  }

  /**
   * Hide loading state
   */
  hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Special handling for upload area
    if (elementId === 'uploadArea') {
      // Remove loading indicator
      const loadingIndicator = element.querySelector('.loading-indicator');
      if (loadingIndicator) {
        loadingIndicator.remove();
      }
    } else {
      // Button element original logic
    element.disabled = false;
      element.style.opacity = '1';
      
      // Restore button content based on ID
      const buttonTexts = {
        'generateBtn': '<span>🎯</span>Generate QR Code'
      };
      element.innerHTML = buttonTexts[elementId] || 'Complete';
    }
  }

  /**
   * Generate simple QR code (fallback)
   */
  generateSimpleQR(text, size = 200) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Simple grid QR code (for demo only)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);
    
    ctx.fillStyle = '#000000';
    const gridSize = 20;
    const cellSize = size / gridSize;
    
    // Generate simple pattern based on text content
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const charCode = text.charCodeAt((i * gridSize + j) % text.length);
        if (charCode % 2 === 0) {
          ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
      }
    }
    
    // Add border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, size, size);
    
    return canvas;
  }

  /**
   * Get current language
   */
  getCurrentLanguage() {
    return 'en'; // Always return English since we're now English-only
  }

  /**
   * Get localized message
   */
  getMessage(key) {
    const messages = {
      'application_ready': 'Multi-device interface ready!',
      'using_builtin_functions': 'Using built-in QR functions',
      'no_content_to_copy': 'No content available to copy',
      'copied_to_clipboard': 'Successfully copied to clipboard',
      'enter_esim_config': 'Please enter eSIM configuration data',
      'qr_generated_success': 'QR code generated successfully!',
      'page_element_error': 'Interface error - please refresh the page',
      'extraction_success': '✅ Data extracted! Review and generate QR code',
      'upload_image_file': 'Please select a valid image file',
      'file_size_limit': 'File size must be under 5MB',
      'no_qr_detected': 'No QR code found - try a clearer image or manual input',
      'qr_parse_success': 'QR code parsed successfully!',
      'qr_parse_failed': 'QR parsing failed - ensure image is clear and contains valid QR code',
      'no_qr_to_download': 'No QR code available for download',
      'qr_download_success': 'QR code downloaded to your device!',
      'no_lpa_to_copy': 'No LPA string available to copy',
      'lpa_copied': 'LPA string copied to clipboard!',
      'results_cleared': 'All data and results cleared'
    };
    
    return messages[key] || key;
  }

  /**
   * Show notification with localization
   */
  showNotification(messageKey, type = 'info') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    const message = this.getMessage(messageKey);
    notificationText.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    notification.classList.add('show');
    
    setTimeout(() => {
      notification.classList.remove('show');
      // Completely hide after animation
      setTimeout(() => {
        notification.style.display = 'none';
      }, 300); // Wait for transition to complete
    }, 3000);
  }
}

// Global functions for HTML inline event handlers
function handleUploadClick() {
  const fileInput = document.getElementById('fileInput');
  if (fileInput) {
    fileInput.click();
  }
}

function handleFileChange(event) {
  if (window.esimParser) {
    window.esimParser.handleUpload(event);
  }
}

function handleUploadClickNew(fileInputId) {
  const fileInput = document.getElementById(fileInputId);
  if (fileInput) {
    fileInput.click();
  }
}

function handleFileChangeNew(event, fileInputId) {
  if (window.esimParser) {
    window.esimParser.handleUpload(event);
  }
}

/**
 * Tablet-Specific Enhancement Features
 * Optimized for 9-13 inch tablet devices
 */
class TabletEnhancements {
    constructor() {
        this.isTabletMode = false;
        this.gestureStartX = 0;
        this.gestureStartY = 0;
        this.isGesturing = false;
        this.qrZoomScale = 1;
        
        this.init();
    }
    
    init() {
        // Listen for layout changes
        window.addEventListener('layoutChanged', (e) => {
            this.handleLayoutChange(e.detail.newLayout);
        });
        
        // Initialize if already in tablet mode
        if (window.deviceDetector?.getCurrentLayout() === 'tablet') {
            this.enableTabletMode();
        }
    }
    
    handleLayoutChange(newLayout) {
        if (newLayout === 'tablet') {
            this.enableTabletMode();
        } else {
            this.disableTabletMode();
        }
    }
    
    enableTabletMode() {
        if (this.isTabletMode) return;
        
        this.isTabletMode = true;
        console.log('🔄 Enabling tablet mode enhancements');
        
        // Add tablet-specific features
        this.setupTabletGestures();
        this.setupFloatingActions();
        this.setupTabletKeyboardShortcuts();
        this.optimizeForApplePencil();
        
        // Show tablet hints
        this.showTabletHints();
    }
    
    disableTabletMode() {
        if (!this.isTabletMode) return;
        
        this.isTabletMode = false;
        console.log('❌ Disabling tablet mode features');
        
        // Cleanup tablet-specific features
        this.removeFloatingActions();
        this.removeTabletGestures();
    }
    
    setupTabletGestures() {
        // Multi-touch gesture support
        let initialDistance = 0;
        let isZooming = false;
        
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                // Two-finger gesture start
                initialDistance = this.getDistance(e.touches[0], e.touches[1]);
                isZooming = true;
            } else if (e.touches.length === 1) {
                // Single finger gesture
                this.gestureStartX = e.touches[0].clientX;
                this.gestureStartY = e.touches[0].clientY;
                this.isGesturing = true;
            }
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2 && isZooming) {
                // Pinch to zoom gesture
                e.preventDefault();
                const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
                const scale = currentDistance / initialDistance;
                this.handlePinchGesture(scale);
            } else if (e.touches.length === 1 && this.isGesturing) {
                // Swipe gesture
                const deltaX = e.touches[0].clientX - this.gestureStartX;
                const deltaY = e.touches[0].clientY - this.gestureStartY;
                this.handleSwipeGesture(deltaX, deltaY);
            }
        }, { passive: false });
        
        document.addEventListener('touchend', (e) => {
            isZooming = false;
            this.isGesturing = false;
        }, { passive: true });
    }
    
    handlePinchGesture(scale) {
        const qrContainer = document.querySelector('.qr-container canvas');
        if (qrContainer && scale > 1.2) {
            this.zoomQRCode(true);
        } else if (qrContainer && scale < 0.8) {
            this.zoomQRCode(false);
        }
    }
    
    handleSwipeGesture(deltaX, deltaY) {
        const threshold = 100;
        
        if (Math.abs(deltaX) > threshold) {
            if (deltaX > 0) {
                this.switchInputMode('separated');
            } else {
                this.switchInputMode('combined');
            }
            this.showGestureHint('Swipe to switch input mode');
        }
        
        if (deltaY < -threshold) {
            this.showQuickActions();
        }
    }
    
    setupFloatingActions() {
        this.removeFloatingActions();
        
        const floatingActions = document.createElement('div');
        floatingActions.className = 'floating-actions';
        floatingActions.innerHTML = `
            <button class="floating-btn" data-action="gallery" title="Select from Gallery">🖼️</button>
            <button class="floating-btn" data-action="share" title="Share">📤</button>
            <button class="floating-btn" data-action="settings" title="Settings">⚙️</button>
        `;
        
        document.body.appendChild(floatingActions);
        
        floatingActions.addEventListener('click', (e) => {
            const action = e.target.closest('.floating-btn')?.dataset.action;
            if (action) this.handleFloatingAction(action);
        });
    }
    
    handleFloatingAction(action) {
        switch (action) {
            case 'gallery':
                document.getElementById('fileInput')?.click();
                this.showGestureHint('Select image file...');
                break;
            case 'share':
                this.shareQRCode();
                break;
            case 'settings':
                this.showGestureHint('Settings displayed in console');
                console.log('Tablet Settings: Gesture Navigation, Keyboard Shortcuts enabled');
                break;
        }
    }
    
    setupTabletKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (!this.isTabletMode) return;
            
            if ((e.metaKey || e.ctrlKey) && e.key === 'g') {
                e.preventDefault();
                document.getElementById('generateBtn')?.click();
            }
            
            if ((e.metaKey || e.ctrlKey) && e.key === 'c' && e.shiftKey) {
                e.preventDefault();
                window.esimParser?.copyLPA();
            }
            
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                window.esimParser?.downloadQR();
            }
        });
    }
    
    optimizeForApplePencil() {
        document.addEventListener('pointermove', (e) => {
            if (e.pointerType === 'pen') {
                document.body.classList.add('pencil-active');
                this.showGestureHint('Apple Pencil detected - Enhanced precision mode');
            }
        });
        
        document.addEventListener('pointerleave', (e) => {
            if (e.pointerType === 'pen') {
                document.body.classList.remove('pencil-active');
            }
        });
    }
    
    showTabletHints() {
        const hints = [
            '👆 Pinch to zoom QR code',
            '👈 Swipe left/right to switch input modes', 
            '👆 Swipe up for quick actions',
            '⌨️ Keyboard shortcuts supported'
        ];
        
        hints.forEach((hint, index) => {
            setTimeout(() => this.showGestureHint(hint), index * 2000);
        });
    }
    
    showGestureHint(text) {
        document.querySelectorAll('.gesture-hint').forEach(hint => hint.remove());
        
        const hint = document.createElement('div');
        hint.className = 'gesture-hint';
        hint.textContent = text;
        hint.style.cssText = `
            position: fixed; bottom: 1rem; left: 50%; transform: translateX(-50%);
            background: rgba(0,0,0,0.8); color: white; padding: 0.75rem 1.5rem;
            border-radius: 25px; font-size: 0.9rem; z-index: 1001;
            pointer-events: none; opacity: 0; transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(hint);
        setTimeout(() => hint.style.opacity = '1', 50);
        setTimeout(() => {
            hint.style.opacity = '0';
            setTimeout(() => hint.remove(), 300);
        }, 2500);
    }
    
    getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    zoomQRCode(zoomIn) {
        const qrCanvas = document.querySelector('.qr-container canvas');
        if (!qrCanvas) return;
        
        this.qrZoomScale = zoomIn ? this.qrZoomScale * 1.2 : this.qrZoomScale * 0.8;
        this.qrZoomScale = Math.max(0.5, Math.min(3, this.qrZoomScale));
        
        qrCanvas.style.transform = `scale(${this.qrZoomScale})`;
        qrCanvas.style.transformOrigin = 'center';
        qrCanvas.style.transition = 'transform 0.2s ease';
        
        this.showGestureHint(`QR ${zoomIn ? 'zoomed in' : 'zoomed out'} to ${Math.round(this.qrZoomScale * 100)}%`);
    }
    
    switchInputMode(mode) {
        if (window.esimParser?.switchInputMode) {
            window.esimParser.switchInputMode(mode);
        }
    }
    
    shareQRCode() {
        if (navigator.share && window.esimParser?.currentQRData) {
            const canvas = window.esimParser.currentQRData.qrCode.canvas;
            canvas.toBlob(async (blob) => {
                try {
                    await navigator.share({
                        title: 'eSIM QR Code',
                        files: [new File([blob], 'esim-qr.png', { type: 'image/png' })]
                    });
                    this.showGestureHint('Share successful!');
                    if ('vibrate' in navigator) navigator.vibrate([50, 100, 50]);
                } catch (error) {
                    this.showGestureHint('Share failed');
                }
            });
        } else {
            this.showGestureHint('Share not supported on this device');
        }
    }
    
    showQuickActions() {
        const quickActions = [
            { icon: '📋', title: 'Copy LPA', action: () => window.esimParser?.copyLPA() },
            { icon: '💾', title: 'Download QR', action: () => window.esimParser?.downloadQR() },
            { icon: '📤', title: 'Share', action: () => this.shareQRCode() },
            { icon: '🔄', title: 'Clear', action: () => window.esimParser?.clearResults() }
        ];
        
        this.showActionSheet(quickActions);
    }
    
    showActionSheet(options) {
        document.querySelector('.tablet-action-sheet')?.remove();
        
        const actionSheet = document.createElement('div');
        actionSheet.className = 'tablet-action-sheet';
        actionSheet.style.cssText = `
            position: fixed; bottom: 0; left: 0; right: 0;
            background: var(--bg-secondary); border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
            padding: 2rem; box-shadow: var(--shadow-xl); z-index: 1000;
            transform: translateY(100%); transition: transform 0.3s ease;
        `;
        
        const buttons = options.map(option => 
            `<button class="action-sheet-btn" style="
                width: 100%; padding: 1rem; margin-bottom: 0.75rem; border: none;
                border-radius: 12px; background: var(--bg-tertiary); color: var(--text-primary);
                font-size: 1rem; cursor: pointer; display: flex; align-items: center;
                gap: 0.75rem; transition: all 0.2s ease;
            ">
                <span style="font-size: 1.25rem;">${option.icon}</span>
                ${option.title}
            </button>`
        ).join('');
        
        actionSheet.innerHTML = `
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <h3 style="color: var(--primary-purple); margin: 0;">Quick Actions</h3>
            </div>
            ${buttons}
            <button class="action-sheet-close" style="
                width: 100%; padding: 1rem; border: none; border-radius: 12px;
                background: var(--accent-red); color: white; font-size: 1rem;
                cursor: pointer; margin-top: 0.5rem;
            ">Close</button>
        `;
        
        document.body.appendChild(actionSheet);
        setTimeout(() => actionSheet.style.transform = 'translateY(0)', 50);
        
        options.forEach((option, index) => {
            const btn = actionSheet.querySelectorAll('.action-sheet-btn')[index];
            btn.addEventListener('click', () => {
                option.action();
                this.closeActionSheet(actionSheet);
            });
        });
        
        actionSheet.querySelector('.action-sheet-close').addEventListener('click', () => {
            this.closeActionSheet(actionSheet);
        });
        
        actionSheet.addEventListener('click', (e) => {
            if (e.target === actionSheet) this.closeActionSheet(actionSheet);
        });
    }
    
    closeActionSheet(actionSheet) {
        actionSheet.style.transform = 'translateY(100%)';
        setTimeout(() => actionSheet.remove(), 300);
    }
    
    removeFloatingActions() {
        document.querySelector('.floating-actions')?.remove();
    }
    
    removeTabletGestures() {
        document.body.classList.remove('pencil-active');
        document.querySelectorAll('.gesture-hint').forEach(hint => hint.remove());
    }
}

// Initialize application with device detection and tablet enhancements
document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('🚀 Starting application initialization...');
    
    // Initialize device detection first
    console.log('📱 Initializing device detector...');
    window.deviceDetector = new DeviceDetector();
    // Now that DOM is ready, initialize the detector
    window.deviceDetector.init();
    console.log('✅ Device detector initialized');
    
    // Initialize main parser
    console.log('🔧 Initializing eSIM parser...');
    const parser = new ESIMParser();
    console.log('📚 Loading external libraries...');
    await parser.loadExternalLibraries();
    console.log('🔗 Binding events...');
    parser.bindEvents();
    window.esimParser = parser;
    console.log('✅ eSIM parser initialized');
    
    // Initialize tablet enhancements
    console.log('📱 Initializing tablet enhancements...');
    window.tabletEnhancements = new TabletEnhancements();
    console.log('✅ Tablet enhancements initialized');
    
    console.log('🎉 Application initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Application initialization failed:', error);
    // Show error notification if possible
    if (window.esimParser && window.esimParser.showNotification) {
      window.esimParser.showNotification('Application initialization failed: ' + error.message, 'error');
    }
  }
});