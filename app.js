/**
 * eSIM 配置解析器 - 纯前端版本
 * 京都风格设计 - 无需后端服务
 */

class EsimSwapApp {
  constructor() {
    this.currentMode = 'combined';
    this.currentQRData = null;
    this.init();
  }

  init() {
    this.bindEvents();
    this.setupDragAndDrop();
    this.loadExternalLibraries();
    
    // 设置全局引用以便对话框调用
    window.esimApp = this;
  }

  /**
   * 加载外部库
   */
  async loadExternalLibraries() {
    console.log('开始加载外部库...');
    
    try {
      // 简单直接的加载方式
      await this.loadQRious();
      await this.loadJsQR();
      
      if (window.QRious && window.jsQR) {
        console.log('所有库加载成功');
        this.showNotification('应用已就绪！', 'success');
      } else {
        console.log('部分库加载失败，使用内置功能');
        this.showNotification('使用内置功能', 'warning');
      }
      
    } catch (error) {
      console.error('库加载过程出错:', error);
      this.showNotification('使用内置功能', 'warning');
    }
  }

  /**
   * 加载 QRious 库
   */
  async loadQRious() {
    if (window.QRious) {
      console.log('QRious 已存在');
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/qrious@4.0.2/dist/qrious.min.js';
      script.onload = () => {
        console.log('QRious 加载成功');
        resolve();
      };
      script.onerror = () => {
        console.log('QRious 加载失败');
        resolve(); // 不要 reject，继续执行
      };
      document.head.appendChild(script);
    });
  }

  /**
   * 加载 jsQR 库
   */
  async loadJsQR() {
    if (window.jsQR) {
      console.log('jsQR 已存在');
      return;
    }

    // 尝试多个 CDN 源
    const cdnUrls = [
      'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js',
      'https://unpkg.com/jsqr@1.4.0/dist/jsQR.js',
      'https://cdnjs.cloudflare.com/ajax/libs/jsQR/1.4.0/jsQR.js'
    ];

    for (const url of cdnUrls) {
      try {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = url;
          script.onload = () => {
            console.log(`jsQR 从 ${url} 加载成功`);
            resolve();
          };
          script.onerror = () => {
            console.log(`jsQR 从 ${url} 加载失败`);
            reject();
          };
          document.head.appendChild(script);
        });
        
        // 如果成功加载，跳出循环
        if (window.jsQR) {
          break;
        }
      } catch (error) {image.pngimage.pngimage.pngimage.png
        console.log(`尝试下一个 CDN...`);
        continue;
      }
    }

    if (!window.jsQR) {
      console.warn('所有 jsQR CDN 源都加载失败，二维码解析功能将不可用');
    }
  }

  /**
   * 动态加载脚本
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
   * 带备选方案的脚本加载
   */
  async loadScriptWithFallback(urls) {
    for (let i = 0; i < urls.length; i++) {
      try {
        await this.loadScript(urls[i]);
        console.log(`成功加载: ${urls[i]}`);
        return;
      } catch (error) {
        console.warn(`加载失败: ${urls[i]}, 尝试下一个...`);
        if (i === urls.length - 1) {
          throw new Error(`所有 CDN 都加载失败: ${urls.join(', ')}`);
        }
      }
    }
  }

  /**
   * 绑定事件监听器
   */
  bindEvents() {
    // 输入模式切换
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchMode(e.target.dataset.mode));
    });

    // 显示模式切换
    document.querySelectorAll('.display-tab').forEach(tab => {
      tab.addEventListener('click', (e) => this.switchDisplayMode(e.target.dataset.mode));
    });

    // 复制按钮
    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.copyToClipboard(e.target.dataset.copy));
    });

    // 生成二维码
    document.getElementById('generateBtn').addEventListener('click', () => this.generateQR());

    // 文件上传
    document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileUpload(e));
    document.getElementById('uploadArea').addEventListener('click', () => {
      document.getElementById('fileInput').click();
    });

    // 操作按钮
    document.getElementById('downloadBtn')?.addEventListener('click', () => this.downloadQR());
    document.getElementById('copyBtn')?.addEventListener('click', () => this.copyLPA());
    document.getElementById('clearBtn')?.addEventListener('click', () => this.clearResults());
  }

  /**
   * 设置拖拽上传
   */
  setupDragAndDrop() {
    const uploadArea = document.getElementById('uploadArea');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      uploadArea.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      uploadArea.addEventListener(eventName, () => {
        uploadArea.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      uploadArea.addEventListener(eventName, () => {
        uploadArea.classList.remove('dragover');
      });
    });

    uploadArea.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.processFile(files[0]);
      }
    });
  }

  /**
   * 切换输入模式
   */
  switchMode(mode) {
    this.currentMode = mode;
    
    // 更新按钮状态
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // 切换输入区域
    document.getElementById('combinedInput').style.display = mode === 'combined' ? 'block' : 'none';
    document.getElementById('separatedInput').style.display = mode === 'separated' ? 'block' : 'none';
  }

  /**
   * 切换显示模式
   */
  switchDisplayMode(mode) {
    // 更新标签状态
    document.querySelectorAll('.display-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    document.querySelector(`.display-tab[data-mode="${mode}"]`).classList.add('active');

    // 切换显示内容
    document.querySelectorAll('.display-content').forEach(content => {
      content.classList.remove('active');
    });
    
    const targetId = mode === 'lpa' ? 'displayLPA' : 'displaySeparated';
    document.getElementById(targetId).classList.add('active');
  }

  /**
   * 复制到剪贴板
   */
  async copyToClipboard(type) {
    let text = '';
    
    switch(type) {
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
      this.showNotification('没有可复制的内容', 'warning');
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      this.showNotification('已复制到剪贴板', 'success');
    } catch (error) {
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.showNotification('已复制到剪贴板', 'success');
    }
  }

  /**
   * 生成二维码
   */
  async generateQR() {
    try {
      this.showLoading('generateBtn');
      
      // 获取输入
      const input = document.getElementById('combinedText').value.trim();
      if (!input) {
        this.showNotification('请输入 eSIM 配置信息', 'warning');
        return;
      }
      
      // 简单解析
      const parts = input.split('$');
      let smdpAddress, activationCode, password = '';
      
      if (parts[0] === '1' && parts.length >= 3) {
        smdpAddress = parts[1];
        activationCode = parts[2];
        password = parts[3] || '';
      } else if (parts.length >= 2) {
        smdpAddress = parts[0];
        activationCode = parts[1];
        password = parts[2] || '';
      } else {
        // 显示格式错误对话框
        this.showFormatErrorDialog(input);
        return;
      }
      
      // 生成 LPA 字符串
      let lpaString = `LPA:1$${smdpAddress}$${activationCode}`;
      if (password) {
        lpaString += `$${password}`;
      }
      
      // 生成二维码
      let qrCanvas;
      if (window.QRious) {
        const qr = new QRious({
          element: document.createElement('canvas'),
          value: lpaString,
          size: 256,
          level: 'M'
        });
        qrCanvas = qr.canvas;
      } else {
        qrCanvas = this.generateSimpleQR(lpaString);
      }

      // 显示二维码
      const qrDisplay = document.getElementById('qrDisplay');
      const qrContainer = document.getElementById('qrContainer');
      
      if (qrContainer) {
        qrContainer.innerHTML = '';
        qrContainer.appendChild(qrCanvas);
      }
      
      if (qrDisplay) {
        qrDisplay.style.display = 'block';
        qrDisplay.scrollIntoView({ behavior: 'smooth' });
      }
      
      // 更新显示内容
      const lpaAddressDisplay = document.getElementById('lpaAddressDisplay');
      const smdpDisplay = document.getElementById('smdpDisplay');
      const activationDisplay = document.getElementById('activationDisplay');
      const passwordDisplay = document.getElementById('passwordDisplay');
      const passwordDisplayItem = document.getElementById('passwordDisplayItem');
      
      if (lpaAddressDisplay) {
        lpaAddressDisplay.textContent = lpaString;
      }
      
      if (smdpDisplay) {
        smdpDisplay.textContent = smdpAddress;
      }
      
      if (activationDisplay) {
        activationDisplay.textContent = activationCode;
      }
      
      if (passwordDisplay && passwordDisplayItem) {
        if (password) {
          passwordDisplay.textContent = password;
          passwordDisplayItem.style.display = 'block';
        } else {
          passwordDisplayItem.style.display = 'none';
        }
      }
      
      // 存储数据
      this.currentLPA = lpaString;
      this.currentParsed = { smdpAddress, activationCode, activationPassword: password };
      this.currentQRData = { qrCode: { canvas: qrCanvas } };
      
      this.showNotification('二维码生成成功！', 'success');

    } catch (error) {
      console.error('生成失败:', error);
      this.showNotification('生成失败，请检查输入格式', 'error');
    } finally {
      this.hideLoading('generateBtn');
    }
  }

  /**
   * 解析 eSIM 输入
   */
  parseEsimInput(input) {
    try {
      // 清理输入
      const cleanInput = input.trim().replace(/\s+/g, '').replace(/[\r\n\t]/g, '');
      console.log('解析输入:', input, '清理后:', cleanInput);
      
      if (!cleanInput) {
        return { success: false, error: '输入不能为空' };
      }

      let smdpAddress, activationCode, password = '';

      // 检查是否已包含 LPA 前缀
      if (cleanInput.startsWith('LPA:1$')) {
        const content = cleanInput.substring(6);
        const parts = content.split('$');
        
        if (parts.length < 2) {
          return { success: false, error: 'LPA 格式错误：缺少必要信息' };
        }
        
        smdpAddress = parts[0];
        activationCode = parts[1];
        password = parts[2] || '';
      }
      // 检查分隔符格式
      else if (cleanInput.includes('$')) {
        const parts = cleanInput.split('$');
        
        if (parts.length < 2) {
          return { success: false, error: '格式错误：至少需要 SM-DP+ 地址和激活码' };
        }
        
        if (parts[0] === '1' && parts.length >= 3) {
          // 格式：1$smdp$activation$password
          smdpAddress = parts[1];
          activationCode = parts[2];
          password = parts[3] || '';
          console.log('解析为格式1:', { smdpAddress, activationCode, password });
        } else {
          // 格式：smdp$activation$password
          smdpAddress = parts[0];
          activationCode = parts[1];
          password = parts[2] || '';
          console.log('解析为格式2:', { smdpAddress, activationCode, password });
        }
      }
      // 尝试其他分隔符
      else {
        const separators = ['|', ';', ':', ',', ' '];
        let found = false;
        
        for (const sep of separators) {
          if (cleanInput.includes(sep)) {
            const parts = cleanInput.split(sep).filter(part => part.trim());
            if (parts.length >= 2) {
              smdpAddress = parts[0].trim();
              activationCode = parts[1].trim();
              password = parts[2]?.trim() || '';
              found = true;
              break;
            }
          }
        }
        
        if (!found) {
          return { success: false, error: '无法识别输入格式，请使用标准格式' };
        }
      }

      // 验证结果
      console.log('验证前的数据:', { smdpAddress, activationCode, password });
      
      if (!this.isValidSmdpAddress(smdpAddress)) {
        console.log('SM-DP+ 地址验证失败:', smdpAddress);
        return { success: false, error: 'SM-DP+ 地址格式无效' };
      }
      
      if (!this.isValidActivationCode(activationCode)) {
        console.log('激活码验证失败:', activationCode);
        return { success: false, error: '激活码格式无效' };
      }
      
      console.log('验证通过，返回数据:', { smdpAddress, activationCode, password });

      return {
        success: true,
        data: { smdpAddress, activationCode, password }
      };

    } catch (error) {
      return { success: false, error: '解析过程中发生错误' };
    }
  }

  /**
   * 生成 LPA 字符串
   */
  generateLpaString(data) {
    let lpaString = `LPA:1$${data.smdpAddress}$${data.activationCode}`;
    if (data.password) {
      lpaString += `$${data.password}`;
    }
    return lpaString;
  }

  /**
   * 验证 SM-DP+ 地址
   */
  isValidSmdpAddress(address) {
    if (!address || typeof address !== 'string') return false;
    
    const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return domainPattern.test(address) && address.includes('.');
  }

  /**
   * 验证激活码
   */
  isValidActivationCode(code) {
    if (!code || typeof code !== 'string') return false;
    
    const codePattern = /^[A-Z0-9-]+$/i;
    return codePattern.test(code) && code.length >= 5 && code.length <= 50;
  }

  /**
   * 显示二维码
   */
  displayQRCode(data) {
    const qrDisplay = document.getElementById('qrDisplay');
    const qrContainer = document.getElementById('qrContainer');

    console.log('显示二维码，元素检查:', {
      qrDisplay: !!qrDisplay,
      qrContainer: !!qrContainer
    });

    if (!qrDisplay || !qrContainer) {
      console.error('找不到必要的显示元素');
      this.showNotification('页面元素加载异常，请刷新页面', 'error');
      return;
    }

    // 清空容器
    qrContainer.innerHTML = '';
    
    // 添加二维码到主容器
    qrContainer.appendChild(data.qrCode.canvas);
    
    // 更新两种显示方式的内容
    this.updateDisplayModes(data);
    
    // 存储数据供下载和复制使用
    this.currentQRData = data;
    this.currentLPA = data.esimData.lpaString;
    this.currentParsed = data.esimData;
    
    qrDisplay.style.display = 'block';
    qrDisplay.scrollIntoView({ behavior: 'smooth' });
  }

  /**
   * 更新显示模式内容
   */
  updateDisplayModes(data) {
    console.log('更新显示模式，数据:', data);

    // 更新 LPA 地址显示
    const lpaAddressDisplay = document.getElementById('lpaAddressDisplay');
    if (lpaAddressDisplay) {
      lpaAddressDisplay.textContent = data.esimData.lpaString;
      console.log('LPA地址已更新:', data.esimData.lpaString);
    } else {
      console.error('找不到 lpaAddressDisplay 元素');
    }

    // 更新分离信息显示
    const smdpDisplay = document.getElementById('smdpDisplay');
    const activationDisplay = document.getElementById('activationDisplay');
    const passwordDisplay = document.getElementById('passwordDisplay');
    const passwordDisplayItem = document.getElementById('passwordDisplayItem');

    console.log('eSIM数据:', data.esimData);
    console.log('找到的元素:', {
      smdpDisplay: !!smdpDisplay,
      activationDisplay: !!activationDisplay,
      passwordDisplay: !!passwordDisplay,
      passwordDisplayItem: !!passwordDisplayItem
    });
    
    if (smdpDisplay) {
      smdpDisplay.textContent = data.esimData.smdpAddress || '-';
      console.log('SM-DP+地址已更新:', data.esimData.smdpAddress);
    }
    
    if (activationDisplay) {
      activationDisplay.textContent = data.esimData.activationCode || '-';
      console.log('激活码已更新:', data.esimData.activationCode);
    }
    
    if (passwordDisplay && passwordDisplayItem) {
      if (data.esimData.activationPassword || data.esimData.password) {
        passwordDisplay.textContent = data.esimData.activationPassword || data.esimData.password;
        passwordDisplayItem.style.display = 'block';
        console.log('密码已更新:', data.esimData.activationPassword || data.esimData.password);
      } else {
        passwordDisplayItem.style.display = 'none';
        console.log('无密码，隐藏密码项');
      }
    }
  }

  /**
   * 检测是否可能是 eSIM 数据
   */
  isPotentialESIMData(data) {
    const cleanData = data.trim();
    
    // 检查是否包含 eSIM 相关的关键信息
    return (
      cleanData.includes('$') ||  // 包含分隔符
      cleanData.includes('.') ||  // 包含域名
      /[A-Z0-9-]{10,}/.test(cleanData) ||  // 包含长的字母数字串（可能是激活码）
      cleanData.toLowerCase().includes('lpa') ||  // 包含 LPA 关键字
      cleanData.toLowerCase().includes('esim')    // 包含 eSIM 关键字
    );
  }

  /**
   * 显示提取确认对话框
   */
  showExtractionDialog(qrData) {
    // 创建对话框
    const dialog = document.createElement('div');
    dialog.className = 'extraction-dialog';
    dialog.innerHTML = `
      <div class="dialog-overlay"></div>
      <div class="dialog-content">
        <div class="dialog-header">
          <h3>⚠️ LPA信息不完整或错误</h3>
        </div>
        <div class="dialog-body">
          <p><strong>检测到的二维码内容：</strong></p>
          <div class="detected-content">${qrData}</div>
          <div class="problem-explanation">
            <p><strong>⚠️ 问题：</strong>此二维码格式不符合标准，iPhone无法直接识别。</p>
            <p><strong>💡 常见原因：</strong></p>
            <ul style="margin: 0.5rem 0; padding-left: 1.5rem; font-size: 0.9rem;">
              <li>缺少 "LPA:" 前缀</li>
              <li>缺少版本号信息</li>
              <li>运营商使用了非标准格式</li>
            </ul>
          </div>
          <p><strong>🔧 解决方案：</strong>是否要提取原始信息并重新生成标准格式的二维码？</p>
        </div>
        <div class="dialog-actions">
          <button class="btn btn-secondary" onclick="this.closest('.extraction-dialog').remove()">
            <span>❌</span> 取消
          </button>
          <button class="btn btn-primary" onclick="window.esimApp.confirmExtraction('${qrData.replace(/'/g, "\\'")}'); this.closest('.extraction-dialog').remove();">
            <span>✅</span> 是，提取并修复
          </button>
        </div>
      </div>
    `;
    
    // 添加样式
    dialog.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    // 添加内部样式
    const overlay = dialog.querySelector('.dialog-overlay');
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
    `;
    
    const content = dialog.querySelector('.dialog-content');
    content.style.cssText = `
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      max-width: 500px;
      width: 90%;
      position: relative;
      z-index: 1001;
    `;
    
    const header = dialog.querySelector('.dialog-header');
    header.style.cssText = `
      padding: 1.5rem 1.5rem 0;
      color: var(--text-primary);
    `;
    
    const body = dialog.querySelector('.dialog-body');
    body.style.cssText = `
      padding: 1rem 1.5rem;
      color: var(--text-secondary);
    `;
    
    const detectedContent = dialog.querySelector('.detected-content');
    detectedContent.style.cssText = `
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 0.75rem;
      margin: 0.5rem 0;
      font-family: monospace;
      font-size: 0.9rem;
      word-break: break-all;
      color: var(--text-primary);
    `;
    
    const actions = dialog.querySelector('.dialog-actions');
    actions.style.cssText = `
      padding: 0 1.5rem 1.5rem;
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    `;
    
    document.body.appendChild(dialog);
    
    // 点击遮罩关闭
    overlay.addEventListener('click', () => {
      dialog.remove();
    });
  }

  /**
   * 确认提取信息
   */
  confirmExtraction(qrData) {
    // 显示第二个确认对话框
    this.showExtractionConfirmDialog(qrData);
  }

  /**
   * 显示提取确认对话框
   */
  showExtractionConfirmDialog(qrData) {
    const dialog = document.createElement('div');
    dialog.className = 'extraction-confirm-dialog';
    dialog.innerHTML = `
      <div class="dialog-overlay"></div>
      <div class="dialog-content">
        <div class="dialog-header">
          <h3>🔧 准备提取信息</h3>
        </div>
        <div class="dialog-body">
          <p><strong>即将执行：</strong></p>
          <ul style="margin: 1rem 0; padding-left: 1.5rem;">
            <li>将原始信息填充到左侧输入框</li>
            <li>您可以手动编辑和修正信息</li>
            <li>点击"生成二维码"创建正确的二维码</li>
          </ul>
          <p><strong>原始信息：</strong></p>
          <div class="detected-content">${qrData}</div>
        </div>
        <div class="dialog-actions">
          <button class="btn btn-secondary" onclick="this.closest('.extraction-confirm-dialog').remove()">
            <span>⬅️</span> 返回
          </button>
          <button class="btn btn-primary" onclick="window.esimApp.executeExtraction('${qrData.replace(/'/g, "\\'")}'); this.closest('.extraction-confirm-dialog').remove();">
            <span>🚀</span> 确认提取
          </button>
        </div>
      </div>
    `;
    
    // 添加样式（复用之前的样式）
    dialog.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1002;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    // 添加内部样式
    const overlay = dialog.querySelector('.dialog-overlay');
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
    `;
    
    const content = dialog.querySelector('.dialog-content');
    content.style.cssText = `
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      max-width: 500px;
      width: 90%;
      position: relative;
      z-index: 1003;
    `;
    
    const header = dialog.querySelector('.dialog-header');
    header.style.cssText = `
      padding: 1.5rem 1.5rem 0;
      color: var(--text-primary);
    `;
    
    const body = dialog.querySelector('.dialog-body');
    body.style.cssText = `
      padding: 1rem 1.5rem;
      color: var(--text-secondary);
    `;
    
    const detectedContent = dialog.querySelector('.detected-content');
    detectedContent.style.cssText = `
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 0.75rem;
      margin: 0.5rem 0;
      font-family: monospace;
      font-size: 0.9rem;
      word-break: break-all;
      color: var(--text-primary);
    `;
    
    const actions = dialog.querySelector('.dialog-actions');
    actions.style.cssText = `
      padding: 0 1.5rem 1.5rem;
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    `;
    
    document.body.appendChild(dialog);
    
    // 点击遮罩关闭
    overlay.addEventListener('click', () => {
      dialog.remove();
    });
  }

  /**
   * 执行提取操作
   */
  executeExtraction(qrData) {
    // 填充到输入框
    const combinedInput = document.getElementById('combinedText');
    if (combinedInput) {
      combinedInput.value = qrData;
      
      // 高亮显示输入框
      combinedInput.style.borderColor = '#8b45ff';
      combinedInput.style.boxShadow = '0 0 0 3px rgba(139, 69, 255, 0.1)';
      
      // 滚动到输入区域
      combinedInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // 聚焦输入框
      setTimeout(() => {
        combinedInput.focus();
      }, 500);
      
      // 3秒后恢复样式
      setTimeout(() => {
        combinedInput.style.borderColor = '';
        combinedInput.style.boxShadow = '';
      }, 3000);
    }
    
    // 显示成功提示
    this.showNotification('✅ 提取成功！您可以手动编辑信息，然后点击"生成二维码"', 'success');
  }

  /**
   * 尝试修复二维码
   */
  tryFixQRCode(qrData) {
    console.log('尝试修复二维码:', qrData);
    
    // 清理数据
    const cleanData = qrData.trim();
    
    // 检查各种常见问题
    
    // 1. 缺少 LPA: 前缀
    if (!cleanData.startsWith('LPA:')) {
      if (cleanData.includes('$') && cleanData.split('$').length >= 2) {
        const fixedLPA = `LPA:${cleanData.startsWith('1$') ? '' : '1$'}${cleanData}`;
        const parseResult = this.parseLpaString(fixedLPA);
        if (parseResult.success) {
          return {
            success: true,
            problem: '缺少 LPA: 前缀',
            fixedLPA: fixedLPA,
            data: parseResult.data
          };
        }
      }
    }
    
    // 2. 缺少版本号 "1$"
    if (cleanData.startsWith('LPA:') && !cleanData.startsWith('LPA:1$')) {
      const content = cleanData.substring(4); // 移除 "LPA:"
      if (content.includes('$')) {
        const fixedLPA = `LPA:1$${content}`;
        const parseResult = this.parseLpaString(fixedLPA);
        if (parseResult.success) {
          return {
            success: true,
            problem: '缺少版本号 "1$"',
            fixedLPA: fixedLPA,
            data: parseResult.data
          };
        }
      }
    }
    
    // 3. 格式错误但包含有效信息
    if (cleanData.includes('$')) {
      const parts = cleanData.split('$');
      if (parts.length >= 2) {
        // 尝试重新组织
        let smdpAddress = '';
        let activationCode = '';
        
        // 查找看起来像域名的部分
        for (const part of parts) {
          if (part.includes('.') && part.length > 5) {
            smdpAddress = part;
          } else if (part.length > 10 && /^[A-Z0-9-]+$/i.test(part)) {
            activationCode = part;
          }
        }
        
        if (smdpAddress && activationCode) {
          const fixedLPA = `LPA:1$${smdpAddress}$${activationCode}`;
          const parseResult = this.parseLpaString(fixedLPA);
          if (parseResult.success) {
            return {
              success: true,
              problem: '格式混乱，已重新组织',
              fixedLPA: fixedLPA,
              data: parseResult.data
            };
          }
        }
      }
    }
    
    // 4. 检查是否是纯文本但格式正确
    if (!cleanData.includes('$') && cleanData.length > 20) {
      return {
        success: false,
        problem: '不是有效的 eSIM LPA 格式，请手动输入正确的 LPA 字符串'
      };
    }
    
    // 5. 其他格式问题
    return {
      success: false,
      problem: '无法识别的二维码格式，可能不是 eSIM 配置信息'
    };
  }

  /**
   * 显示修复前后对比
   */
  showFixComparison(originalData, fixedLPA, problem) {
    // 创建对比显示
    const notification = document.createElement('div');
    notification.className = 'fix-comparison';
    notification.innerHTML = `
      <div class="fix-comparison-content">
        <h3>🔧 二维码修复报告</h3>
        <div class="problem">
          <strong>发现问题：</strong>${problem}
        </div>
        <div class="comparison">
          <div class="before">
            <strong>修复前：</strong>
            <code>${originalData}</code>
          </div>
          <div class="after">
            <strong>修复后：</strong>
            <code>${fixedLPA}</code>
          </div>
        </div>
        <div class="tip">
          💡 建议联系运营商更新二维码格式以符合标准
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="close-btn">关闭</button>
      </div>
    `;
    
    // 添加样式
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border: 2px solid var(--primary-purple);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      z-index: 1001;
      max-width: 500px;
      width: 90%;
    `;
    
    const content = notification.querySelector('.fix-comparison-content');
    content.style.cssText = `
      padding: 1.5rem;
      color: var(--text-primary);
    `;
    
    document.body.appendChild(notification);
    
    // 3秒后自动关闭
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 8000);
  }

  /**
   * 显示备用输入提示
   */
  showFallbackInput(detectedText = '') {
    // 如果有检测到的文本，显示提取对话框
    if (detectedText) {
      this.showExtractionDialog(detectedText);
    } else {
      // 如果没有检测到文本，显示手动输入提示对话框
      this.showManualInputDialog();
    }
  }

  /**
   * 显示手动输入提示对话框
   */
  showManualInputDialog() {
    const dialog = document.createElement('div');
    dialog.className = 'manual-input-dialog';
    dialog.innerHTML = `
      <div class="dialog-overlay"></div>
      <div class="dialog-content">
        <div class="dialog-header">
          <h3>📝 需要手动输入</h3>
        </div>
        <div class="dialog-body">
          <p><strong>❌ 无法识别二维码内容</strong></p>
          <p>可能的原因：</p>
          <ul style="margin: 0.5rem 0; padding-left: 1.5rem; font-size: 0.9rem;">
            <li>图片不够清晰</li>
            <li>不是 eSIM 二维码</li>
            <li>二维码损坏</li>
          </ul>
          <p><strong>💡 建议：</strong>请在上方输入框中手动输入 LPA 字符串</p>
          <div style="background: #f0f0f0; padding: 0.75rem; border-radius: 6px; margin: 0.5rem 0; font-size: 0.9rem;">
            <strong>格式示例：</strong><br>
            LPA:1$t-mobile.idemia.io$1BCH0-T6TKQ-PWCXS-FM6OD<br>
            或：1$t-mobile.idemia.io$1BCH0-T6TKQ-PWCXS-FM6OD
          </div>
        </div>
        <div class="dialog-actions">
          <button class="btn btn-primary" onclick="this.closest('.manual-input-dialog').remove(); window.esimApp.focusInputArea();">
            <span>✏️</span> 去输入框填写
          </button>
        </div>
      </div>
    `;
    
    // 添加样式
    dialog.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    // 添加内部样式
    const overlay = dialog.querySelector('.dialog-overlay');
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
    `;
    
    const content = dialog.querySelector('.dialog-content');
    content.style.cssText = `
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      max-width: 500px;
      width: 90%;
      position: relative;
      z-index: 1001;
    `;
    
    const header = dialog.querySelector('.dialog-header');
    header.style.cssText = `
      padding: 1.5rem 1.5rem 0;
      color: var(--text-primary);
    `;
    
    const body = dialog.querySelector('.dialog-body');
    body.style.cssText = `
      padding: 1rem 1.5rem;
      color: var(--text-secondary);
    `;
    
    const actions = dialog.querySelector('.dialog-actions');
    actions.style.cssText = `
      padding: 0 1.5rem 1.5rem;
      display: flex;
      gap: 1rem;
      justify-content: center;
    `;
    
    document.body.appendChild(dialog);
    
    // 点击遮罩关闭
    overlay.addEventListener('click', () => {
      dialog.remove();
    });
  }

  /**
   * 显示格式错误对话框
   */
  showFormatErrorDialog(input) {
    const dialog = document.createElement('div');
    dialog.className = 'format-error-dialog';
    dialog.innerHTML = `
      <div class="dialog-overlay"></div>
      <div class="dialog-content">
        <div class="dialog-header">
          <h3>❌ 输入格式错误</h3>
        </div>
        <div class="dialog-body">
          <p><strong>您输入的内容：</strong></p>
          <div class="detected-content">${input}</div>
          <p><strong>⚠️ 问题：</strong>格式不正确，无法解析为有效的 eSIM 配置。</p>
          <p><strong>💡 正确格式：</strong></p>
          <div style="background: #f0f8ff; padding: 0.75rem; border-radius: 6px; margin: 0.5rem 0; border-left: 4px solid #4CAF50;">
            <div style="font-size: 0.9rem; line-height: 1.4;">
              <strong>标准格式：</strong><br>
              <code>LPA:1$t-mobile.idemia.io$1BCH0-T6TKQ-PWCXS-FM6OD</code><br><br>
              <strong>简化格式：</strong><br>
              <code>1$t-mobile.idemia.io$1BCH0-T6TKQ-PWCXS-FM6OD</code><br><br>
              <strong>基本格式：</strong><br>
              <code>t-mobile.idemia.io$1BCH0-T6TKQ-PWCXS-FM6OD</code>
            </div>
          </div>
          <p><strong>🔧 建议：</strong>请检查并修正输入格式，确保包含 SM-DP+ 地址和激活码。</p>
        </div>
        <div class="dialog-actions">
          <button class="btn btn-primary" onclick="this.closest('.format-error-dialog').remove(); window.esimApp.focusInputArea();">
            <span>✏️</span> 修正输入
          </button>
        </div>
      </div>
    `;
    
    // 添加样式
    dialog.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    // 添加内部样式
    const overlay = dialog.querySelector('.dialog-overlay');
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
    `;
    
    const content = dialog.querySelector('.dialog-content');
    content.style.cssText = `
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      max-width: 600px;
      width: 90%;
      position: relative;
      z-index: 1001;
    `;
    
    const header = dialog.querySelector('.dialog-header');
    header.style.cssText = `
      padding: 1.5rem 1.5rem 0;
      color: var(--text-primary);
    `;
    
    const body = dialog.querySelector('.dialog-body');
    body.style.cssText = `
      padding: 1rem 1.5rem;
      color: var(--text-secondary);
    `;
    
    const detectedContent = dialog.querySelector('.detected-content');
    detectedContent.style.cssText = `
      background: #ffebee;
      border: 1px solid #f44336;
      border-radius: 6px;
      padding: 0.75rem;
      margin: 0.5rem 0;
      font-family: monospace;
      font-size: 0.9rem;
      word-break: break-all;
      color: #d32f2f;
    `;
    
    const actions = dialog.querySelector('.dialog-actions');
    actions.style.cssText = `
      padding: 0 1.5rem 1.5rem;
      display: flex;
      gap: 1rem;
      justify-content: center;
    `;
    
    document.body.appendChild(dialog);
    
    // 点击遮罩关闭
    overlay.addEventListener('click', () => {
      dialog.remove();
    });
  }

  /**
   * 聚焦到输入区域
   */
  focusInputArea() {
    const combinedInput = document.getElementById('combinedText');
    if (combinedInput) {
      // 滚动到输入区域
      combinedInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // 聚焦输入框
      setTimeout(() => {
        combinedInput.focus();
        // 高亮显示输入框
        combinedInput.style.borderColor = '#8b45ff';
        combinedInput.style.boxShadow = '0 0 0 3px rgba(139, 69, 255, 0.1)';
        
        // 3秒后恢复样式
        setTimeout(() => {
          combinedInput.style.borderColor = '';
          combinedInput.style.boxShadow = '';
        }, 3000);
      }, 500);
    }
  }

  /**
   * 处理文件上传
   */
  async handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
      await this.processFile(file);
    }
  }

  /**
   * 处理文件
   */
  async processFile(file) {
    try {
      this.showLoading('uploadArea');
      
      // 验证文件
      if (!file.type.startsWith('image/')) {
        this.showNotification('请上传图片文件', 'warning');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        this.showNotification('文件大小不能超过 5MB', 'warning');
        return;
      }

      // 检查 jsQR 是否可用
      if (typeof jsQR === 'undefined') {
        this.showNotification('二维码解析库未加载，请手动输入 LPA 字符串', 'warning');
        this.showFallbackInput();
        return;
      }

      // 读取图片
      const imageData = await this.loadImageData(file);
      
      // 解析二维码
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (!code) {
        this.showNotification('未在图片中检测到二维码，请尝试更清晰的图片或手动输入', 'warning');
        this.showFallbackInput();
        return;
      }

      // 解析 LPA 内容
      const parseResult = this.parseLpaString(code.data);
      if (!parseResult.success) {
        // 无论什么情况都显示对话框，让用户选择
        this.showExtractionDialog(code.data);
        return;
      }

      this.displayParseResult(parseResult.data, code.data);
      this.showNotification('二维码解析成功！', 'success');

    } catch (error) {
      console.error('解析二维码失败:', error);
      this.showNotification('解析二维码失败，请确保图片清晰', 'error');
    } finally {
      this.hideLoading('uploadArea');
    }
  }

  /**
   * 加载图片数据
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
   * 解析 LPA 字符串
   */
  parseLpaString(lpaString) {
    if (!lpaString.startsWith('LPA:1$')) {
      return { success: false, error: '不是有效的 eSIM LPA 格式' };
    }
    
    const content = lpaString.substring(6);
    const parts = content.split('$');
    
    if (parts.length < 2) {
      return { success: false, error: 'LPA 格式错误' };
    }
    
    return {
      success: true,
      data: {
        smdpAddress: parts[0],
        activationCode: parts[1],
        password: parts[2] || null,
        rawData: lpaString
      }
    };
  }

  /**
   * 显示解析结果
   */
  displayParseResult(data, rawData) {
    const parseResult = document.getElementById('parseResult');
    
    document.getElementById('parsedSmdp').textContent = data.smdpAddress || '-';
    document.getElementById('parsedActivation').textContent = data.activationCode || '-';
    document.getElementById('parsedPassword').textContent = data.password || '无';
    document.getElementById('parsedRaw').textContent = rawData || '-';
    
    parseResult.style.display = 'block';
  }

  /**
   * 下载二维码
   */
  downloadQR() {
    if (!this.currentQRData) {
      this.showNotification('没有可下载的二维码', 'warning');
      return;
    }

    const canvas = this.currentQRData.qrCode.canvas;
    const dataURL = canvas.toDataURL('image/png');
    
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = `esim-qr-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    this.showNotification('二维码下载成功！', 'success');
  }

  /**
   * 复制 LPA 字符串
   */
  async copyLPA() {
    if (!this.currentQRData) {
      this.showNotification('没有可复制的 LPA 字符串', 'warning');
      return;
    }

    try {
      await navigator.clipboard.writeText(this.currentQRData.esimData.lpaString);
      this.showNotification('LPA 字符串已复制到剪贴板！', 'success');
    } catch (error) {
      // 备用方法
      const textArea = document.createElement('textarea');
      textArea.value = this.currentQRData.esimData.lpaString;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.showNotification('LPA 字符串已复制到剪贴板！', 'success');
    }
  }

  /**
   * 清除结果
   */
  clearResults() {
    document.getElementById('qrDisplay').style.display = 'none';
    document.getElementById('parseResult').style.display = 'none';
    this.currentQRData = null;
    
    // 清空输入
    document.getElementById('combinedText').value = '';
    document.getElementById('smdpAddress').value = '';
    document.getElementById('activationCode').value = '';
    document.getElementById('activationPassword').value = '';
    document.getElementById('fileInput').value = '';
    
    this.showNotification('已清除所有结果', 'success');
  }

  /**
   * 显示加载状态
   */
  showLoading(elementId) {
    const element = document.getElementById(elementId);
    const originalText = element.textContent;
    element.dataset.originalText = originalText;
    element.innerHTML = '<span class="loading"><span class="spinner"></span>处理中...</span>';
    element.disabled = true;
  }

  /**
   * 隐藏加载状态
   */
  hideLoading(elementId) {
    const element = document.getElementById(elementId);
    const originalText = element.dataset.originalText || element.textContent;
    element.innerHTML = originalText;
    element.disabled = false;
  }

  /**
   * 生成简化二维码（备用方案）
   */
  generateSimpleQR(text) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = 256;
    canvas.width = size;
    canvas.height = size;
    
    // 简单的网格二维码（仅用于演示）
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);
    
    ctx.fillStyle = '#000000';
    const gridSize = 16;
    const cellSize = size / gridSize;
    
    // 根据文本内容生成简单的图案
    for (let i = 0; i < text.length && i < gridSize * gridSize; i++) {
      const charCode = text.charCodeAt(i);
      const x = (i % gridSize) * cellSize;
      const y = Math.floor(i / gridSize) * cellSize;
      
      if (charCode % 2 === 1) {
        ctx.fillRect(x, y, cellSize, cellSize);
      }
    }
    
    // 添加边框
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, size, size);
    
    return canvas;
  }

  /**
   * 显示通知
   */
  showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    notificationText.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
  new EsimSwapApp();
});
