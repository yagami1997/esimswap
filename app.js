/**
 * eSIM Configuration Parser - Pure Frontend Version
 * Kyoto Style Design - No Backend Service Required
 */

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
    dialog.innerHTML = `
      <div class="dialog-content">
        <div class="dialog-body">
          <h3>⚠️ Incomplete or Incorrect LPA Information</h3>
          
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
          
          <div class="dialog-actions">
            <button onclick="document.body.classList.remove('dialog-open'); this.closest('.dialog-overlay').remove()" class="btn-cancel">
              <span>❌</span> Cancel
            </button>
            <button onclick="window.esimParser.confirmExtraction(\`${detectedText.replace(/`/g, '\\`')}\`); this.closest('.dialog-overlay').remove()" class="btn-confirm">
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

    // Add body class to prevent scrolling
    document.body.classList.add('dialog-open');
    
    document.body.appendChild(dialog);

    // Click overlay to close
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) {
        document.body.classList.remove('dialog-open');
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
    dialog.innerHTML = `
      <div class="dialog-content">
        <div class="dialog-body">
          <h3>🔧 Prepare to Extract Information</h3>
          
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
            <button onclick="window.esimParser.executeExtraction(\`${detectedText.replace(/`/g, '\\`')}\`); document.body.classList.remove('dialog-open'); this.closest('.dialog-overlay').remove()" class="btn-confirm">
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
        document.body.classList.remove('dialog-open');
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
    dialog.innerHTML = `
      <div class="dialog-content">
        <div class="dialog-body">
          <h3>📝 Manual Input Required</h3>
          
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
    dialog.innerHTML = `
      <div class="dialog-content">
        <div class="dialog-body">
          <h3>❌ Input Format Error</h3>
          
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
    dialog.innerHTML = `
      <div class="dialog-content">
        <div class="dialog-body">
          <h3>⚠️ QR Code Generation Failed</h3>
          
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
    dialog.innerHTML = `
      <div class="dialog-content">
        <div class="dialog-body">
          <h3>📚 QR Code Parsing Library Not Loaded</h3>
          
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
      'application_ready': 'Application ready!',
      'using_builtin_functions': 'Using built-in functions',
      'no_content_to_copy': 'No content to copy',
      'copied_to_clipboard': 'Copied to clipboard',
      'enter_esim_config': 'Please enter eSIM configuration information',
      'qr_generated_success': 'QR code generated successfully!',
      'page_element_error': 'Page element loading error, please refresh',
      'extraction_success': '✅ Extraction successful! You can manually edit and generate QR code',
      'upload_image_file': 'Please upload image file',
      'file_size_limit': 'File size cannot exceed 5MB',
      'no_qr_detected': 'No QR code detected in image, try clearer image or manual input',
      'qr_parse_success': 'QR code parsed successfully!',
      'qr_parse_failed': 'QR code parsing failed, ensure image is clear',
      'no_qr_to_download': 'No QR code to download',
      'qr_download_success': 'QR code downloaded successfully!',
      'no_lpa_to_copy': 'No LPA string to copy',
      'lpa_copied': 'LPA string copied to clipboard!',
      'results_cleared': 'All results cleared'
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
    notification.classList.add('show');
    
    setTimeout(() => {
      notification.classList.remove('show');
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

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
  const parser = new ESIMParser();
  await parser.loadExternalLibraries();
  parser.bindEvents();
});