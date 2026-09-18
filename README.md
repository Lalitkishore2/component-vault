# ⚡ Component Vault & Custody Tracker (Streamline Moderne Edition)

> **Aerodynamic Hardware Inventory, Project Bill-of-Materials Allocation & Custody Tracker** inspired by 1930s Streamline Moderne industrial design and Midnight Moderne Noir.

Built with **vanilla semantic HTML5, CSS3 design tokens, and reactive JavaScript**. Requires **zero external dependencies, zero API keys, and zero databases**.

---

## 🌟 Key Highlights

- **Universal Multi-User Login & Isolated Vaults**:
  - Anyone can clone this repository or host it publicly.
  - Individuals create personal accounts/vaults (`username`, `displayName`, `password`).
  - Passwords are securely hashed using native **Web Crypto API (SHA-256)**.
  - Each user has a completely isolated component catalog, project allocations, and activity history.
  - Quick **1-Click Workstation Switcher** to toggle between accounts on shared hardware benches.

- **Flexible Project Allocation ("Used by Me" & Ongoing Projects)**:
  - **Borrower Name is completely optional**: Components can be assigned directly to your personal projects ("Used by Me / Self").
  - **Return Due Date is completely optional**: Leave empty for ongoing or permanent project installations without false overdue alarms.
  - 1-Click **"Return Item"** restores allocated units back to active inventory with full stock bar recalculations.

- **Fast Component Image Ingestion**:
  - **Clipboard Image Paste**: Press `Ctrl+V` (or `Cmd+V` on Mac) anywhere in the modal with a copied screenshot or web image.
  - **"Paste Image" Button**: Reads clipboard images with 1-click via the modern Clipboard API.
  - Drag-and-drop file upload + direct image URL preview + aerodynamic teal glow confirmation.

- **Streamline Moderne & Midnight Moderne Noir Aesthetics**:
  - Porthole emblems, brushed chrome accents, brass badges, 3-tier metallic speed lines (`.speed-lines`), and bullnose aerodynamic curves (`border-radius: 20px`).
  - Streamline typography (`Josefin Sans`, `Raleway`, `Tenor Sans`, `JetBrains Mono`).
  - 1-Click toggle between **Streamline Day** (Ivory & Burnished Brass) and **Midnight Moderne Noir** (Dark Obsidian & Aero-Teal).

- **Mobile & Multi-Ratio Responsive**:
  - Fully tested on mobile phones (`375x667`, `390x844`, `412x915`), tablets (`768x1024`), and wide desktop screens.
  - Swipeable touch tabs with zero overflow.
  - Compact 2x2 metric cards and 2x2 filter dropdown grid.
  - Horizontal touch momentum scrolling on data tables.

- **Mobile App & PWA (iOS & Android)**:
  - **Instant 1-Tap PWA**: Installable directly to mobile home screens from Safari or Chrome without app store fees or developer accounts.
  - Fullscreen standalone mode, custom splash screen, and offline Service Worker cache (`sw.js`).
  - **Android APK Build**: Pre-configured with **Capacitor** (`capacitor.config.json` + `package.json`) to build native Android `.apk` packages via Android Studio for free.
  - Dedicated **Install Mobile App** menu option and iOS Safari installation guide.

- **Data Ownership & Portability**:
  - 1-Click JSON Backup & Restore for easy migration across workstations or browsers.

---

## 📖 Complete Setup Guides

* **[DEPLOYMENT_GUIDE.md](file:///C:/Users/LALITKO/.gemini/antigravity-ide/scratch/component-inventory/DEPLOYMENT_GUIDE.md)**: **100% Free Backend, Hosting & Mobile App Setup Tutorial**
  - How to set up Google Firebase Spark Free tier (Auth + Firestore + Security Rules).
  - How to host for free on GitHub Pages, Firebase Hosting, or Vercel.
  - How to install the mobile app and compile the Android APK.

---

## 🚀 Instant Hosting & Deployment

Because the application is built entirely with client-side persistence and native Web Crypto hashing, it runs **out of the box anywhere**:

### Option 1: GitHub Pages (Free Forever)
1. Fork or push this repository to GitHub.
2. Navigate to **Settings** > **Pages**.
3. Under **Branch**, select `main` and root `/`.
4. Click **Save**. Your site is instantly live at `https://<your-username>.github.io/<repo-name>/`.

### Option 2: Vercel / Netlify / Cloudflare Pages
1. Connect your Git repository.
2. Framework preset: **Other / None** (Static HTML).
3. Build command: *(leave blank)*.
4. Output directory: `./` (root).
5. Click **Deploy**.

### Option 3: Local or Self-Hosted Node Server
```bash
# Run with Node.js built-in HTTP server
node server.js
```
Open [http://127.0.0.1:3000](http://127.0.0.1:3000) in your browser.

---

## 🔑 Google Sign-In & Cloud Database (Hosted Websites)

When you deploy Component Vault to a public URL (e.g. **GitHub Pages**, **Vercel**, **Netlify**, or your own domain), you can enable **1-Click Google Sign-In** and **Cloud Firestore Database Sync** across all your devices:

### Step 1: Create a Free Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/) and click **Add Project**.
2. Give it a name (e.g. `my-component-vault`) and finish setup.
3. Click the **Web (`</>`)** icon to register a web app and copy your Firebase configuration keys:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `appId`

### Step 2: Enable Google Sign-In
1. In the Firebase Console, go to **Build > Authentication > Sign-in method**.
2. Click **Google**, toggle **Enable**, select your support email, and click **Save**.
3. Under **Build > Firestore Database**, click **Create Database** (start in Test mode or configure production rules).

### Step 3: Authorize Your Hosted Domain (Crucial!)
Google OAuth requires authorized domains for security:
1. In Firebase Console, go to **Authentication > Settings > Authorized domains**.
2. Click **Add domain**.
3. Enter your hosting domain:
   - For GitHub Pages: `<your-username>.github.io`
   - For Vercel: `<your-project>.vercel.app`
   - For Netlify: `<your-project>.netlify.app`
   - For Custom Domains: `vault.yourdomain.com`
   *(Note: `localhost` is authorized by default)*

### Step 4: Connect in the App
You have two simple options:
- **Option A (No-Code, in-app)**: Open your hosted site, click **Cloud DB Settings** on the login screen, paste your keys, and click **Connect Firebase**.
- **Option B (Pre-baked in code)**: Open `js/firebase-config.js` and paste your keys into the config object before pushing to Git.

Once configured:
- Anyone with a Google account can sign in with 1 click.
- On mobile devices, if browser popup blockers interfere, the app automatically falls back to seamless OAuth redirect.
- All hardware catalog items, project loans, and activity history sync in real-time to Cloud Firestore.

---

## 📁 Repository Structure

```
├── index.html            # Main UI, modals, layouts, and semantic markup
├── server.js             # Lightweight zero-dependency Node static server
├── README.md             # Documentation & hosting guide
├── css/
│   ├── design-tokens.css # Color variables, themes (Day & Noir), typography
│   ├── layout.css        # App shell, responsive breakpoints, header, grid
│   └── components.css    # Streamline cards, modals, buttons, auth styles
└── js/
    ├── sample-data.js    # Default Streamline catalog starter components
    ├── auth.js           # Multi-user authentication & vault isolation service
    ├── store.js          # Reactive state store, custody ledger & persistence
    └── app.js            # UI controller, event listeners, clipboard paste & filters
```

---

## 🔒 Security & Privacy Notice
- Passwords are automatically hashed in the client using `SHA-256` via `crypto.subtle`.
- All data resides securely in the user's browser storage (`localStorage`) scoped to their user ID (`CV_VAULT_DATA_<userId>`).
- To backup or migrate your inventory to another device, use the built-in **Backup > Download JSON Backup** button.

---

## 📜 License
MIT License. Free to use, adapt, and self-host for maker spaces, hardware labs, and personal workshops!
