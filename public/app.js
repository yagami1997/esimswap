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
  }

  /**
   * 加载外部库
   */
  async loadExternalLibraries() {
    try {
      // 加载 QRious 库用于生成二维码
      await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js');
      
      // 加载 jsQR 库用于解析二维码
      await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jsQR/1.4.0/jsQR.js');
      
      console.log('外部库加载完成');
    } catch (error) {
      console.error('加载外部库失败:', error);
      this.showNotification('库文件加载失败，部分功能可能不可用', 'warning');
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
   * 绑定事件监听器
   */
  bindEvents() {
    // 模式切换
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchMode(e.target.dataset.mode));
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
   * 生成二维码
   */
  async generateQR() {
    try {
      this.showLoading('generateBtn');
      
      let esimData;

      if (this.currentMode === 'combined') {
        const input = document.getElementById('combinedText').value.trim();
        if (!input) {
          this.showNotification('请输入 eSIM 配置信息', 'warning');
          return;
        }
        
        // 解析组合输入
        esimData = this.parseEsimInput(input);
        if (!esimData.success) {
          this.showNotification(esimData.error, 'error');
          return;
        }
      } else {
        const smdpAddress = document.getElementById('smdpAddress').value.trim();
        const activationCode = document.getElementById('activationCode').value.trim();
        const activationPassword = document.getElementById('activationPassword').value.trim();
        
        if (!smdpAddress || !activationCode) {
          this.showNotification('请填写 SM-DP+ 地址和激活码', 'warning');
          return;
        }
        
        esimData = {
          success: true,
          data: { smdpAddress, activationCode, password: activationPassword }
        };
      }

      // 生成 LPA 字符串
      const lpaString = this.generateLpaString(esimData.data);
      
      // 生成二维码
      if (typeof QRious === 'undefined') {
        this.showNotification('二维码库未加载，请刷新页面重试', 'error');
        return;
      }

      const qr = new QRious({
        element: document.createElement('canvas'),
        value: lpaString,
        size: 256,
        level: 'M'
      });

      // 显示结果
      this.displayQRCode({
        qrCode: {
          canvas: qr.canvas,
          dataURL: qr.toDataURL()
        },
        esimData: {
          ...esimData.data,
          lpaString: lpaString
        }
      });

      this.showNotification('二维码生成成功！', 'success');

    } catch (error) {
      console.error('生成二维码失败:', error);
      this.showNotification('生成二维码失败，请检查输入格式', 'error');
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
        } else {
          // 格式：smdp$activation$password
          smdpAddress = parts[0];
          activationCode = parts[1];
          password = parts[2] || '';
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
      if (!this.isValidSmdpAddress(smdpAddress)) {
        return { success: false, error: 'SM-DP+ 地址格式无效' };
      }
      
      if (!this.isValidActivationCode(activationCode)) {
        return { success: false, error: '激活码格式无效' };
      }

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
    const lpaString = document.getElementById('lpaString');

    // 清空容器
    qrContainer.innerHTML = '';
    
    // 添加二维码
    qrContainer.appendChild(data.qrCode.canvas);
    
    // 显示 LPA 字符串
    lpaString.textContent = data.esimData.lpaString;
    
    // 存储数据供下载使用
    this.currentQRData = data;
    
    qrDisplay.style.display = 'block';
    qrDisplay.scrollIntoView({ behavior: 'smooth' });
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
        this.showNotification('二维码解析库未加载，请刷新页面重试', 'error');
        return;
      }

      // 读取图片
      const imageData = await this.loadImageData(file);
      
      // 解析二维码
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (!code) {
        this.showNotification('未在图片中检测到二维码', 'warning');
        return;
      }

      // 解析 LPA 内容
      const parseResult = this.parseLpaString(code.data);
      if (!parseResult.success) {
        this.showNotification(parseResult.error, 'error');
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
