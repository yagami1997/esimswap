<div align="center">

# 📱 eSIM Configuration Parser

![eSIM Parser](https://img.shields.io/badge/eSIM-Parser-6b46c1?style=flat-square&logo=mobile&logoColor=white)
![Multi Device](https://img.shields.io/badge/Multi--Device-Adaptive-8b5cf6?style=flat-square&logo=devices&logoColor=white)
![CloudFlare Pages](https://img.shields.io/badge/CloudFlare-Pages-f38020?style=flat-square&logo=cloudflare&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-f7df1e?style=flat-square&logo=javascript&logoColor=black)
![PWA](https://img.shields.io/badge/PWA-Ready-9333ea?style=flat-square&logo=pwa&logoColor=white)
![License](https://img.shields.io/badge/License-GPL--3.0-blue?style=flat-square)

**Multi-device adaptive eSIM QR code generator with intelligent parsing and cross-platform optimization**

[🚀 Live Demo](https://esim.kyowarp.com)

</div>

---

## 📋 Update Log

### Beta 1.1.0 - Multi-Device Adaptive Interface (August 31, 2025 23:38 PST)
- 🖥️ **Intelligent Device Detection**: Automatic recognition of desktop, tablet (9-13 inch), and mobile devices
- 📱 **Three-Tier Responsive Design**: Dynamic UI adaptation based on screen size and device capabilities
- 🎮 **Tablet-Specific Enhancements**: Touch gestures (pinch-to-zoom, swipe navigation), floating action buttons, Apple Pencil support
- 🔤 **Cross-Platform Font Optimization**: Improved text rendering for Windows, macOS, Linux, iOS, and Android
- 📳 **High-DPI Android Support**: Special optimizations for 2K+ screens (tested on X200U 3168×1440)
- ⌨️ **Keyboard Shortcuts**: Tablet external keyboard support (Ctrl+G, Ctrl+S, Ctrl+Shift+C)
- 💾 **PWA Enhancement**: Progressive Web App manifest for app-like installation experience
- 🎨 **UI Layout Improvements**: Better alignment and spacing for parsing results display
- 🌐 **English Interface**: Complete internationalization with English-only UI for global accessibility

### Beta 1.0.0 - Initial Release (August 30, 2025 22:58 PST)
- 🎨 **Design & Creation**: Built with Japanese elegant design philosophy, featuring a refined purple color scheme and minimalist interface
- 🔄 **Bidirectional Processing**: Implemented intelligent eSIM QR code generation and parsing capabilities
- 🛠️ **Smart Error Handling**: Added automatic detection and repair of non-standard carrier formats
- 📱 **Cross-Device Compatibility**: Ensured full compatibility with iPhone, Android, and other eSIM-capable devices
- ☁️ **CloudFlare Deployment**: Launched on CloudFlare Pages for global accessibility and optimal performance

---

## 📚 eSIM Technology Overview

### What is eSIM?

**eSIM (Embedded SIM)** is a digital SIM technology that allows devices to connect to cellular networks without requiring a physical SIM card. Unlike traditional SIM cards, eSIM profiles are downloaded and installed digitally onto a secure chip embedded in your device.

### GSMA Standards & Configuration Profiles

The **GSMA (Global System for Mobile Communications Association)** has established the **SGP.22 specification** as the global standard for eSIM remote provisioning. This ensures compatibility across all major device manufacturers and carriers worldwide.

**eSIM Configuration Profiles typically contain:**
- 📡 **SM-DP+ Server Address**: The secure server that manages profile downloads
- 🔑 **Activation Code**: Unique identifier for your specific eSIM profile  
- 🔐 **Confirmation Code**: Optional security parameter for enhanced authentication
- 📋 **Carrier Information**: Network settings, APN configurations, and service parameters

### QR Code Structure

Standard eSIM QR codes follow the **LPA (Local Profile Assistant)** format:
```
LPA:1$<SM-DP+ Address>$<Activation Code>$<Confirmation Code>
```

### Industry Compliance

Major device manufacturers including **Apple**, **Samsung**, **Google**, and all implement GSMA SGP.22 standards in their devices. This ensures that properly formatted eSIM profiles work seamlessly across:
- 📱 **iPhone** (iOS 12.1+)
- 🤖 **Android devices** with eSIM support
- ⌚ **Smartwatches** and IoT devices
- 💻 **Laptops** with cellular connectivity

---

## 🎯 Why This Application?

### The Problem

eSIM technology has revolutionized mobile connectivity, but users frequently encounter frustrating installation failures due to **non-standard QR code formats** provided by carriers. Common issues include:

- 📱 **iPhone Recognition Failures**: iOS devices reject QR codes missing proper LPA prefixes
- 🔧 **Format Inconsistencies**: Carriers use proprietary formats that don't comply with GSMA standards
- ❌ **Installation Errors**: Missing version information or incorrect SM-DP+ address formatting
- 🔄 **Manual Conversion Hassles**: Users struggle to manually convert between different eSIM formats

### Real-World Impact

When carriers provide eSIM QR codes in formats like:
```
1$t-mobile.idemia.io$ABC12-DEF34-GHI56-JKL78
```

Instead of the standard LPA format:
```
LPA:1$t-mobile.idemia.io$ABC12-DEF34-GHI56-JKL78
```

Your iPhone simply **refuses to recognize it** as a valid eSIM profile, leaving users stranded.

### Real-World Inspiration

This project was born from frustration with carrier format incompatibilities encountered in real-world usage. Many eSIM QR codes provided by carriers fail to work properly across different devices and platforms due to non-standard formatting.

We drew inspiration from open-source eSIM adapter solutions that implement SGP.22-compliant error correction mechanisms. By studying these approaches, we developed this comprehensive tool to make standardized eSIM format correction accessible to everyone facing similar compatibility issues.
om m
---

## ✨ Our Solution

The **eSIM Configuration Intelligent Parser** is a comprehensive web application that bridges the gap between carrier-provided eSIM data and device compatibility requirements.

### 🔄 Bidirectional Processing

| **Generate QR Codes** | **Parse QR Codes** |
|----------------------|-------------------|
| Convert SM-DP+ addresses to QR codes | Extract information from carrier QR codes |
| Support multiple input formats | Intelligent format detection |
| Standards-compliant output | Error correction and repair |
| iPhone-compatible results | Detailed analysis and feedback |

### 🧠 Intelligent Features

- **🔍 Smart Detection**: Automatically identifies non-standard formats
- **🛠️ Auto-Repair**: Converts irregular formats to standards-compliant versions
- **📊 Detailed Analysis**: Shows separated SM-DP+ address, activation code, and password
- **🎯 Multi-Format Support**: Handles various carrier-specific formats
- **📱 Device Compatibility**: Ensures QR codes work across all eSIM-capable devices
- **🖥️ Adaptive Interface**: Intelligent device detection with optimized layouts for desktop, tablet, and mobile
- **👆 Touch Gestures**: Pinch-to-zoom, swipe navigation, and floating actions for tablet devices
- **🔤 Font Optimization**: Enhanced text rendering across Windows, macOS, Linux, iOS, and Android
- **📳 High-DPI Support**: Special optimizations for 2K+ resolution displays

---

## 🔬 Technical Principles

### eSIM QR Code Structure

Standard eSIM QR codes follow the **GSMA SGP.22** specification:

```
LPA:1$<SM-DP+ Address>$<Activation Code>$<Confirmation Code (Optional)>
```

### Our Processing Pipeline

1. **📥 Input Analysis**: Detect format type and extract components
2. **🔧 Format Correction**: Add missing LPA prefix and version information
3. **✅ Validation**: Verify SM-DP+ address format and activation code structure
4. **📱 QR Generation**: Create standards-compliant QR codes using multiple fallback libraries
5. **🎨 User Interface**: Present results in an intuitive, mobile-friendly interface

### Supported Input Formats

| Format Type | Example | Status |
|-------------|---------|---------|
| **Standard LPA** | `LPA:1$carrier.com$CODE123` | ✅ Direct processing |
| **Missing LPA Prefix** | `1$carrier.com$CODE123` | 🔧 Auto-repair |
| **Carrier Proprietary** | `carrier.com$CODE123` | 🛠️ Intelligent extraction |
| **Separated Components** | SM-DP+: `carrier.com`<br>Code: `CODE123` | 🔄 Component assembly |

---

## 🎨 User Interface

### Japanese Elegant Design Style

Our application features a **refined Japanese aesthetic** with an elegant and minimalist design approach:

- **🟣 Primary Purple**: `#6b46c1` - Representing technology and innovation
- **🎴 Card-Based Layout**: Clean, organized information presentation
- **📱 Responsive Design**: Optimized for both desktop and mobile devices
- **🌸 Subtle Animations**: Smooth transitions and hover effects

### Key Components

- **📝 Input Methods**: Combined input and separated component entry
- **🔍 QR Code Parser**: Drag-and-drop or file selection
- **📊 Results Display**: Tabbed interface showing LPA address and separated information
- **💬 Smart Dialogs**: Context-aware error handling and user guidance

---

## 🚀 Live Application

**🌐 Access the application at: [esim.kyowarp.com](https://esim.kyowarp.com)**

### Quick Start Guide

1. **📱 Generate QR Code**:
   - Enter your SM-DP+ address and activation code
   - Click "Generate QR Code"
   - Scan with your device or download the image

2. **🔍 Parse Existing QR Code**:
   - Drag and drop a QR code image
   - Or click "Select File" to browse
   - View extracted information and corrected format

3. **🛠️ Handle Errors**:
   - Application automatically detects format issues
   - Follow guided repair process
   - Get standards-compliant results

---

## 🛠️ Deployment

### CloudFlare Pages Deployment

This application is deployed using **CloudFlare Pages** for optimal global performance and reliability.

#### Prerequisites

- GitHub repository with your code
- CloudFlare account
- Custom domain (optional)

#### Deployment Steps

1. **📂 Repository Setup**:
   
   If you want to follow our design and code exactly:
   ```bash
   git clone https://github.com/yagami1997/esimswap.git
   cd esimswap
   ```
   
   If you plan to use your own code and features, please use your forked repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   cd YOUR_REPO_NAME
   ```

2. **☁️ CloudFlare Pages Configuration**:
   - Connect your GitHub repository to CloudFlare Pages
   - Set build command: `# No build required - static files`
   - Set output directory: `/` (root directory)
   - Deploy from `main` branch

3. **🌐 Custom Domain** (Optional):
   - Add your custom domain in CloudFlare Pages settings
   - Configure DNS records to point to CloudFlare
   - Enable SSL/TLS encryption

4. **🔄 Automatic Deployments**:
   - Every push to `main` branch triggers automatic deployment
   - Changes are live within minutes
   - Global CDN distribution for fast loading

#### File Structure

```
esimswap/
├── index.html          # Multi-device responsive main page
├── style.css           # Adaptive styling with device optimization
├── app.js              # Core logic with device detection & tablet enhancements
├── manifest.json       # PWA configuration for app installation
├── .gitignore          # Git ignore rules
├── package.json        # Project metadata
└── README.md           # This comprehensive documentation
```

#### Performance Features

- **⚡ Global CDN**: CloudFlare's edge network
- **🔒 SSL/TLS**: Automatic HTTPS encryption
- **📱 Multi-Device Optimized**: Adaptive layouts for desktop, tablet, and mobile
- **🚀 Fast Loading**: Optimized static assets with device-specific loading
- **🛡️ DDoS Protection**: Built-in security
- **💾 PWA Support**: Installable as native app with offline capabilities
- **🎯 Smart Caching**: Intelligent resource management
- **📳 High-DPI Ready**: Optimized for retina and 2K+ displays

---

## 🔧 Technical Stack

### Frontend Technologies

- **📄 HTML5**: Semantic markup and modern web standards
- **🎨 CSS3**: Custom properties, flexbox, and grid layouts
- **⚡ Vanilla JavaScript**: ES6+ features, no framework dependencies
- **📱 Responsive Design**: Mobile-first approach

### External Libraries

- **📊 QRious.js**: QR code generation with multiple CDN fallbacks
- **🔍 jsQR**: QR code parsing and image analysis
- **🎯 Fallback Systems**: Internal implementations for reliability

### Browser Compatibility

- ✅ **Chrome/Edge**: Full support
- ✅ **Firefox**: Full support  
- ✅ **Safari**: Full support
- ✅ **Mobile Browsers**: Optimized experience

---

## 📈 Features & Benefits

### For End Users

- **🎯 One-Click Solutions**: Convert any eSIM format instantly
- **📱 Device Compatibility**: Works with iPhone, Android, and other eSIM devices
- **🔧 Error Recovery**: Intelligent repair of malformed QR codes
- **📊 Detailed Information**: Clear breakdown of eSIM components

### For Developers

- **🔓 Open Source**: GPL-3.0 license for community contributions
- **📚 Well Documented**: Comprehensive code comments and documentation
- **🧪 Tested**: Robust error handling and edge case coverage
- **🔄 Maintainable**: Clean, modular code structure

### For Businesses

- **💰 Cost Effective**: Free solution for eSIM format conversion
- **🌐 Global Access**: CloudFlare CDN for worldwide availability
- **🔒 Secure**: Client-side processing, no data transmission
- **📈 Scalable**: Handles high traffic loads efficiently

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

1. **🍴 Fork** the repository
2. **🌿 Create** a feature branch
3. **💻 Make** your changes
4. **✅ Test** thoroughly
5. **📤 Submit** a pull request

### Development Setup

```bash
# Clone the repository
git clone https://github.com/yagami1997/esimswap.git

# Navigate to project directory
cd esimswap

# Open in your preferred editor
code .

# Serve locally (optional)
python -m http.server 8000
```

---

## 📄 License

This project is licensed under the **GPL-3.0 License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **GSMA** for eSIM standards and specifications
- **CloudFlare** for reliable hosting and CDN services
- **Open Source Community** for the excellent libraries used in this project
- **Contributors** who help improve this application

---

<div align="center">

**Made with ❤️ for the eSIM community**

© 2025 eSIM Configuration Intelligent Parser | Licensed under **GPLv3**

[⭐ Star this project](https://github.com/yagami1997/esimswap) | [🐛 Report Issues](https://github.com/yagami1997/esimswap/issues) | [💡 Request Features](https://github.com/yagami1997/esimswap/issues/new)

**This project is free and open source software under the GNU General Public License v3.0**

</div>