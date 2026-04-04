<div align="center">

# 📱 eSIM Configuration Parser

![Version](https://img.shields.io/badge/version-2.0.0-6b46c1?style=flat-square)
![Build](https://img.shields.io/badge/build-passing-22c55e?style=flat-square)
![Tests](https://img.shields.io/badge/tests-37%2F37-22c55e?style=flat-square)
![CloudFlare Pages](https://img.shields.io/badge/CloudFlare-Pages-f38020?style=flat-square&logo=cloudflare&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-f7df1e?style=flat-square&logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-GPL--3.0-blue?style=flat-square)

**Standards-compliant eSIM QR code parser, generator, and repair tool — multi-device, camera-capable, zero backend**

[🚀 Live App](https://esim.kyowarp.com) · [🐛 Issues](https://github.com/yagami1997/esimswap/issues) · [⭐ Star](https://github.com/yagami1997/esimswap)

</div>

---

> **Want to clone, run, or self-host this project?**
> See **[DEPLOY.md](DEPLOY.md)** for the complete guide — prerequisites, local development, testing, Cloudflare Pages setup, and troubleshooting.

---

## 📋 Changelog

### v2.0.0 — Full Modular Refactor (April 4, 2026 — 00:33 PDT)

Complete rewrite from a single 80KB monolith to a modular ES module architecture, bundled by esbuild for Cloudflare Pages deployment.

**Core:**
- **Camera Scanning**: Live QR code detection via `getUserMedia` + `requestAnimationFrame`
- **Modular Architecture**: `src/` split into `core/`, `ui/`, `features/` modules — bundled to a single 23KB minified `dist/app.js`
- **Auto-Repair Engine**: Detects and corrects non-standard carrier QR formats; offers one-click fix & re-generate
- **URL Deep Links**: Share pre-filled `?lpa=` URLs that auto-generate on open
- **Advanced QR Options**: Choose output size (300/500/800px) and error correction level (M/H)
- **XSS-Safe Dialog System**: All user and QR data rendered via `textContent` only — zero `innerHTML`
- **37/37 Unit Tests**: Node 18+ built-in test runner, no test framework dependency
- **esbuild Pipeline**: `npm run build` → minified `dist/app.js` in under 1s; `npm test` runs all tests

**Carrier Database:**
- **120+ carriers** across North America, Latin America, Europe, Asia, Middle East, Oceania, and Africa
- Recognizes major global travel eSIM providers: Airalo, Holafly, Ubigi, Nomad, Flexiroam, Saily and more
- SM-DP+ infrastructure suffix matching: IDEMIA, Thales/Gemalto, G+D, Valid, Workz, BSIM

**History:**
- Last 20 scans/generations stored in localStorage — load any entry back into the generator

**Design:**
- **Kyoto Purple-Gold** color scheme — deep Kyoto purple `#5C2D91` + antique gold `#C9A84C` accents
- Windows CSS compatibility: `@supports` gradient text fallback, Segoe UI Emoji, `::after` gold divider

**Docs:**
- `DEPLOY.md` — complete guide for clone, local dev, testing, and Cloudflare Pages deployment

### v1.1.2 — Bug Fixes (September 3, 2025 05:39 PDT)
- Fixed DOM access timing issues causing initialization failures
- Fixed QR generation incomplete functions causing syntax errors
- Fixed emoji rendering in titles on some browsers

### v1.1.0 — Multi-Device Adaptive UI (September 1, 2025 01:39 PDT)
- Device detection: desktop / tablet / mobile layout switching
- Touch gestures, floating action buttons, Apple Pencil support
- Cross-platform font optimization (Windows, macOS, Linux, iOS, Android)

### v1.0.0 — Initial Release (August 30, 2025 19:03 PDT)
- QR code generation and parsing
- Smart format repair
- Cloudflare Pages deployment

---

## 🎯 What This Solves

eSIM QR codes provided by carriers frequently fail on devices because they deviate from the GSMA SGP.22 LPA standard. Common problems:

| Carrier Output | Device Reaction |
|---|---|
| `1$carrier.com$ABCD-1234` | iPhone: "Invalid QR code" |
| `carrier.com$ABCD-1234` | Android: silent failure |
| `LPA:1$carrier.com$ABCD-1234` | ✅ All devices: works |

This tool detects the deviation, repairs it, and generates a standards-compliant QR code — in one click.

---

## ✨ Features

| Feature | Detail |
|---|---|
| **Generate QR Code** | Combined or separated field input; outputs GSMA-compliant LPA QR |
| **Parse by Upload** | Drag-drop or browse any image; extracts SM-DP+, activation code, confirmation code |
| **Parse by Camera** | Live scanning on mobile and desktop; auto-stops on detection |
| **Auto-Repair** | Adds missing `LPA:` prefix and version number; validates before offering fix |
| **Carrier ID** | ~50 carriers identified by SM-DP+ domain with region label |
| **History** | 20 most recent operations in localStorage; load any entry back into generator |
| **Share Link** | Copies `https://esim.kyowarp.com?lpa=<encoded>` to clipboard |
| **QR Options** | Size: 300 / 500 / 800px · Error correction: M (standard) / H (print/sticker) |
| **XSS-Safe** | All untrusted data displayed via `textContent` — no innerHTML anywhere |
| **No Backend** | 100% client-side; nothing leaves the browser |

---

## 📖 Usage Guide

### 1. Generate a QR Code

**Combined input** — paste a full string in any of these formats:

```
LPA:1$carrier.example.com$ABC12-DEF34-GHI56-JKL78
1$carrier.example.com$ABC12-DEF34-GHI56-JKL78
carrier.example.com$ABC12-DEF34-GHI56-JKL78
```

**Separated input** — fill each field individually:

| Field | Example | Required |
|---|---|---|
| SM-DP+ Address | `carrier.example.com` | Yes |
| Activation Code | `ABC12-DEF34-GHI56-JKL78` | Yes |
| Confirmation Code | `1234` | No |

Click **Generate QR Code**. The QR image appears below, with carrier name, download, copy, and share options.

**Advanced options** (expand ⚙️):
- **QR Size**: 300px (screen), 500px (large display), 800px (print-quality)
- **Error Correction**: M — standard; H — use for stickers or printed labels that may get damaged

---

### 2. Parse an Existing QR Code

**Upload image**
1. Switch to the **Parse QR Code** card
2. Drop an image onto the upload area, or click **Browse**
3. Supported: JPEG, PNG, WebP, any image containing a QR code
4. Results appear below showing SM-DP+ address, activation code, and confirmation code

**Camera scanning** (mobile and desktop with webcam)
1. Click the **Camera** tab
2. Click **Start Scanning**
3. Point the camera at the QR code — detection is automatic and continuous
4. The camera stops the moment a QR code is detected

---

### 3. Auto-Repair Non-Standard QR Codes

When a QR code is parsed but the format is non-standard, a dialog appears showing:

- **Issue detected**: what is wrong with the original
- **Original**: the raw content from the QR code
- **Fixed LPA**: the corrected GSMA-compliant string

Click **Fix & Generate Standard QR** to immediately produce a working replacement QR code.

---

### 4. History

Every successful scan or generation is saved to your browser's localStorage (never sent anywhere). Up to 20 entries are kept, most recent first.

- Click **Load** to paste any entry back into the generator input
- Click **Delete** to remove a single entry
- Click **Clear All** to wipe the full history

---

### 5. Share a Deep Link

After generating a QR code, click **Share Link**. This copies a URL like:

```
https://esim.kyowarp.com?lpa=LPA%3A1%24carrier.example.com%24ABC12-DEF34
```

Anyone who opens this link gets the app pre-filled and auto-generates the QR code. Useful for sharing an eSIM config with a family member or support team.

---

## 🏗️ Architecture

```
esimswap/
├── src/
│   ├── app.js                  # Entry point: init, event binding, orchestration
│   ├── core/
│   │   ├── parser.js           # LPA parse / validate / repair / generateLPA
│   │   ├── qr-generator.js     # QRious wrapper, downloadCanvas
│   │   └── qr-scanner.js       # File decode + live camera scanning (jsQR)
│   ├── ui/
│   │   ├── dialog.js           # XSS-safe modal dialog system
│   │   ├── notification.js     # Top notification bar
│   │   └── device.js           # Device detection, layout classes
│   └── features/
│       ├── carrier-db.js       # SM-DP+ domain → carrier name + region
│       ├── history.js          # localStorage history (max 20, factory pattern)
│       └── deep-link.js        # ?lpa= URL generation and parsing
├── tests/
│   ├── parser.test.js          # 21 tests
│   ├── carrier-db.test.js      # 5 tests
│   ├── history.test.js         # 7 tests
│   └── deep-link.test.js       # 4 tests
├── dist/                       # Built output — CF Pages serves this directory
│   ├── app.js                  # Bundled + minified (23KB)
│   ├── index.html
│   ├── style.css
│   ├── manifest.json
│   └── _headers                # CF security headers
├── index.html                  # Source HTML
├── style.css                   # Source CSS (color scheme locked)
├── manifest.json               # PWA manifest
├── build.js                    # esbuild pipeline
└── package.json                # v2.0.0, type:module, esbuild 0.20.2
```

**Build pipeline**: esbuild bundles `src/app.js` and all its imports into a single IIFE `dist/app.js`. Cloudflare Pages runs `npm run build` on every push to `main` and serves the `dist/` directory.

---

## 🚀 Deployment

### Cloudflare Pages (automatic)

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node.js version | 18 or later |
| Branch | `main` |

Push to `main` → Cloudflare builds → live in under 60 seconds.

### Local Development

```bash
# Clone
git clone https://github.com/yagami1997/esimswap.git
cd esimswap

# Install build dependency
npm install

# Development mode (watch + source maps, no minification)
npm run dev

# Production build
npm run build

# Run all unit tests
npm test

# Preview built output locally
npm run preview
# → http://localhost:3000
```

### Fork and Self-Host

1. Fork this repository
2. Connect your fork to Cloudflare Pages
3. Set build command: `npm run build`, output directory: `dist`
4. Push to your main branch — Cloudflare handles everything else

No environment variables, no secrets, no backend to configure.

---

## 🔬 LPA Format Reference

```
LPA:1$<SM-DP+ Address>$<Activation Code>[$<Confirmation Code>]
```

| Component | Description | Example |
|---|---|---|
| `LPA:1` | Protocol prefix + version | fixed |
| `SM-DP+ Address` | Domain of the carrier's provisioning server | `t-mobile.idemia.io` |
| `Activation Code` | Profile identifier (alphanumeric, hyphens) | `ABC12-DEF34-GHI56` |
| `Confirmation Code` | Optional auth PIN for some carriers | `1234` |

This app accepts and auto-repairs these common deviations:

| Input | Problem | Action |
|---|---|---|
| `1$carrier.com$CODE` | Missing `LPA:` | Prepend `LPA:` |
| `LPA:carrier.com$CODE` | Missing version `1` | Insert `1$` |
| `carrier.com$CODE` | Missing both | Reconstruct full LPA |
| Garbage content | No valid tokens | Fail clearly with message |

---

## 🛠️ Technical Stack

- **Runtime**: Vanilla ES2022, no frameworks
- **Build**: esbuild 0.20.2 (IIFE bundle, minified)
- **QR generation**: QRious 4.0.2 (CDN, primary)
- **QR decoding**: jsQR 1.4.0 (CDN, with 3-URL fallback)
- **Camera**: `getUserMedia` + `requestAnimationFrame`
- **Tests**: Node 18+ built-in `node:test` runner
- **Hosting**: Cloudflare Pages (auto-deploy from GitHub)

---

## 📄 License

GPL-3.0 — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Made for the eSIM community**

© 2025–2026 eSIM Configuration Parser · GPL-3.0

[⭐ Star](https://github.com/yagami1997/esimswap) · [🐛 Report Issue](https://github.com/yagami1997/esimswap/issues) · [🚀 Live App](https://esim.kyowarp.com)

</div>
