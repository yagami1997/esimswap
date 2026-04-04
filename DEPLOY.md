# Deployment & Local Development Guide

**Version:** v2.0.0 · **Last updated:** April 4, 2026 · 01:03 PDT

> Complete guide for cloning, running locally, testing, and deploying eSIM Configuration Parser.

---

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Node.js | 18 or later | Build script + unit tests |
| npm | 9 or later | Package management |
| Git | any | Clone and version control |

Verify your environment:

```bash
node --version   # should print v18.x or higher
npm --version    # should print 9.x or higher
```

---

## 1. Clone the Repository

```bash
git clone https://github.com/yagami1997/esimswap.git
cd esimswap
```

---

## 2. Install Build Dependency

The only dependency is `esbuild` (used to bundle source modules into a single `dist/app.js`).

```bash
npm install
```

This installs esbuild into `node_modules/`. Takes about 5 seconds.

---

## 3. Run Unit Tests

Tests run entirely in Node — no browser required.

```bash
npm test
```

Expected output:

```
ℹ tests 37
ℹ pass 37
ℹ fail 0
```

All 37 tests cover the parser, carrier database, history, and deep-link modules.

---

## 4. Build for Production

```bash
npm run build
```

This bundles `src/app.js` and all its imports into a single minified `dist/app.js`, then copies static assets into `dist/`.

Expected output:

```
Build complete.
Static assets copied.
```

`dist/` will contain:

```
dist/
├── app.js        ← minified bundle (~23KB)
├── index.html
├── style.css
├── manifest.json
└── _headers      ← Cloudflare security headers
```

---

## 5. Preview Locally

```bash
npm run preview
```

Opens a local HTTP server at **http://localhost:3000** serving the `dist/` folder.

> **Note:** Camera scanning requires HTTPS in production. On `localhost` all browsers allow camera access without HTTPS, so local testing works normally.

Test the following manually:

- [ ] Enter an LPA string and generate a QR code
- [ ] Upload a QR code image and verify parsing
- [ ] Switch to Camera tab and scan a QR code
- [ ] Paste a non-standard string (e.g. `1$carrier.com$CODE`) — auto-repair dialog should appear
- [ ] Click Share Link — URL with `?lpa=` should be copied to clipboard
- [ ] Open the copied URL — app should auto-generate QR on load
- [ ] Generate a QR, refresh page — check History section shows the entry

---

## 6. Development Mode (Watch)

For active development with live rebuilds:

```bash
npm run dev
```

This starts esbuild in watch mode with inline source maps (no minification). Edit any file in `src/`, and the bundle rebuilds instantly. Refresh the browser to see changes.

---

## 7. Project Structure

```
esimswap/
├── src/                        ← Source modules (ES2022)
│   ├── app.js                  ← Entry point: init, event binding
│   ├── core/
│   │   ├── parser.js           ← LPA parse / validate / repair / generate
│   │   ├── qr-generator.js     ← QR image generation (QRious)
│   │   └── qr-scanner.js       ← File + camera scanning (jsQR)
│   ├── ui/
│   │   ├── dialog.js           ← XSS-safe modal dialog system
│   │   ├── notification.js     ← Top notification bar
│   │   └── device.js           ← Device detection, layout adaptation
│   └── features/
│       ├── carrier-db.js       ← SM-DP+ domain → carrier name lookup
│       ├── history.js          ← localStorage history (max 20 entries)
│       └── deep-link.js        ← ?lpa= URL sharing
├── tests/                      ← Unit tests (Node built-in runner)
│   ├── parser.test.js
│   ├── carrier-db.test.js
│   ├── history.test.js
│   └── deep-link.test.js
├── dist/                       ← Built output (committed, CF Pages serves this)
├── index.html                  ← Source HTML
├── style.css                   ← Source CSS
├── manifest.json               ← PWA manifest
├── build.js                    ← esbuild pipeline script
├── package.json
├── README.md
└── DEPLOY.md                   ← This file
```

---

## 8. Deploy to Cloudflare Pages

### 8.1 Fork and Connect

1. Fork this repository to your GitHub account
2. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
3. Go to **Workers & Pages → Create → Pages → Connect to Git**
4. Select your forked repository

### 8.2 Build Settings

| Setting | Value |
|---|---|
| Framework preset | None |
| Build command | *(leave empty)* |
| Build output directory | `dist` |
| Root directory | `/` |

> The `dist/` folder is committed to the repository, so Cloudflare Pages does **not** need to run a build command — it serves `dist/` directly.

### 8.3 Deploy

Click **Save and Deploy**. Cloudflare will deploy in under 30 seconds.

Every subsequent push to the `main` branch triggers an automatic redeployment.

### 8.4 Custom Domain (Optional)

1. In your Pages project, go to **Custom Domains**
2. Add your domain and follow the DNS instructions
3. SSL/TLS is provisioned automatically

---

## 9. Making Changes and Redeploying

The workflow after any code change:

```bash
# 1. Edit source files in src/, index.html, or style.css

# 2. Rebuild dist/
npm run build

# 3. Run tests (optional but recommended)
npm test

# 4. Commit everything — source + built output
git add src/ dist/ index.html style.css   # add whichever files you changed
git commit -m "your change description"

# 5. Push — Cloudflare Pages redeploys automatically
git push origin main
```

> Always run `npm run build` before committing. The `dist/` folder must match the source at every commit.

---

## 10. Self-Hosting Alternatives

The `dist/` folder is plain static HTML/CSS/JS with no server-side requirements. You can host it on any static file server:

**GitHub Pages**
```bash
# Serve the dist/ folder from gh-pages branch
git subtree push --prefix dist origin gh-pages
```

**Netlify**
- Build command: *(leave empty)*
- Publish directory: `dist`

**Vercel**
- Framework: Other
- Output directory: `dist`

**Nginx / Apache**
Copy the contents of `dist/` to your web root. No configuration needed.

---

## 11. Troubleshooting


**`Cannot find package 'esbuild'`**
→ Run `npm install` first.

**`node: command not found`**
→ Install Node.js 18+ from [nodejs.org](https://nodejs.org).

**Camera not working locally**
→ Make sure you're accessing via `http://localhost` (not a file:// URL). Camera requires either localhost or HTTPS.

**QR generation fails**
→ The app loads QRious from CDN. Check your internet connection, or open browser DevTools to see if the script loaded.

**Changes not appearing on Cloudflare Pages**
→ Make sure you ran `npm run build` and committed the updated `dist/` folder before pushing.

---

<div align="center">

DEPLOY.md · v2.0.0 · April 4, 2026 · 01:03 PDT · [Back to README](README.md)

</div>
