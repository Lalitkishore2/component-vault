# Component Vault: Free Backend, Hosting & Mobile App Setup Guide

This guide gives you the exact, step-by-step instructions to set up a **100% free cloud backend (Google Firebase)**, host the application online for **free forever (GitHub Pages / Firebase Hosting / Vercel)**, and install/build the **Mobile App** on both Android and iOS.

---

## 📑 Table of Contents
1. [Free Backend Setup: Google Firebase](#1-free-backend-setup-google-firebase)
   - [Creating the Free Project](#step-1-create-your-free-firebase-project)
   - [Enabling Google Sign-In & Auth](#step-2-enable-authentication)
   - [Configuring Firestore Database & Security Rules](#step-3-set-up-cloud-firestore-database)
   - [Getting Your Web Configuration Keys](#step-4-get-your-web-app-credentials)
2. [Free Web Hosting Deployments](#2-free-web-hosting-deployments)
   - [Option A: GitHub Pages (Recommended)](#option-a-deploy-to-github-pages-100-free)
   - [Option B: Firebase Hosting](#option-b-deploy-to-firebase-hosting)
   - [Option C: Vercel / Netlify](#option-c-deploy-to-vercel-or-netlify)
3. [Mobile App: Installation & Native APK](#3-mobile-app-installation--native-apk)
   - [Method 1: Instant PWA Install (iOS & Android)](#method-1-instant-pwa-mobile-install-no-developer-account-needed)
   - [Method 2: Build Standalone Android APK (.apk) via Capacitor](#method-2-build-a-standalone-android-apk-with-capacitor)

---

## 1. Free Backend Setup: Google Firebase

Google Firebase offers a permanent **Spark Free Plan** that provides:
- **Authentication**: Unlimited Google Sign-In, Email/Password, and Anonymous accounts.
- **Firestore Database**: 1 GiB stored data, 50,000 document reads/day, 20,000 document writes/day (more than enough for personal or lab inventory).
- **Zero Credit Card Required** to create or use the Spark tier.

### Step 1: Create Your Free Firebase Project
1. Open [console.firebase.google.com](https://console.firebase.google.com/) and sign in with your Google Account.
2. Click **Add project** (or **Create a project**).
3. Name your project (e.g., `my-component-vault`).
4. (Optional) Disable *Google Analytics* for a faster, cleaner setup, then click **Create project**.

### Step 2: Enable Authentication
1. In the left sidebar, click **Build** > **Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab:
   - Click **Google** > Toggle **Enable** > Choose your project support email > Click **Save**.
   - (Optional) Click **Email/Password** > Toggle **Enable** > Click **Save**.
4. Scroll to the **Settings** tab at the top > Click **Authorized domains**:
   - By default, `localhost` and `your-project.firebaseapp.com` are authorized.
   - **Crucial for hosting**: Click **Add domain** and enter your hosted domain:
     - For GitHub Pages: `yourusername.github.io`
     - For Vercel: `your-project.vercel.app`
     - For Netlify: `your-project.netlify.app`
     - For a custom domain: `vault.yourdomain.com`

### Step 3: Set Up Cloud Firestore Database
1. In the left sidebar, click **Build** > **Firestore Database**.
2. Click **Create database**.
3. Choose your database location (select the region closest to you, e.g. `us-central` or `asia-south1`).
4. Select **Start in production mode** and click **Create**.
5. Once created, click the **Rules** tab at the top and replace the content with these secure multi-user rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Each authenticated user has private read/write access to their own isolated inventory
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
6. Click **Publish**. This guarantees no other user can view or modify your hardware catalog.

### Step 4: Get Your Web App Credentials
1. Click the **Project settings** (gear icon ⚙️) next to *Project Overview* in the top left.
2. Under the **General** tab, scroll down to the **Your apps** section.
3. Click the Web icon (`</>`).
4. Register your app name (e.g., `Component Vault Web`) and click **Register app**.
5. Copy the `firebaseConfig` keys:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD-YourApiKeyHere...",
  authDomain: "my-component-vault.firebaseapp.com",
  projectId: "my-component-vault",
  storageBucket: "my-component-vault.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef..."
};
```

6. Open Component Vault in your browser:
   - Tap the top-right menu button (`[LO ☰]`).
   - Click **Cloud Database Sync**.
   - Paste the `API Key`, `Auth Domain`, `Project ID`, `Storage Bucket`, and `App ID`.
   - Click **Connect Firebase**.
   - The indicator dot will turn vibrant **Green** (`Cloud Connected (Firebase)`), and all changes will sync in real-time!

---

## 2. Free Web Hosting Deployments

Because Component Vault is built as a static client-side web application, it can be hosted for free on any static host.

### Option A: Deploy to GitHub Pages (100% Free)
GitHub Pages provides unlimited free static hosting with automatic HTTPS SSL:

1. **Initialize Git & Push**:
   ```bash
   cd component-inventory
   git init
   git add .
   git commit -m "Initial commit of Component Vault"
   git branch -M main
   git remote add origin https://github.com/your-username/component-vault.git
   git push -u origin main
   ```
2. **Enable GitHub Pages**:
   - Open your repository on GitHub.
   - Go to **Settings** > **Pages** (left sidebar).
   - Under **Build and deployment** > **Source**, select **Deploy from a branch**.
   - Select branch `main` and folder `/ (root)`, then click **Save**.
3. In 1–2 minutes, your website is live at:
   `https://your-username.github.io/component-vault/`
4. Don't forget to add `your-username.github.io` to Firebase **Authorized Domains** (Step 2 above).

---

### Option B: Deploy to Firebase Hosting
Firebase Hosting provides high-speed global CDN hosting with automatic Google Auth integration:

1. Install Firebase CLI (free):
   ```bash
   npm install -g firebase-tools
   ```
2. Login to your Google account:
   ```bash
   firebase login
   ```
3. Initialize hosting in your directory:
   ```bash
   firebase init hosting
   ```
   - Select your existing Firebase project (`my-component-vault`).
   - What do you want to use as your public directory? Enter `.` (current directory).
   - Configure as a single-page app? Enter `No`.
   - Set up automatic builds with GitHub? Enter `No`.
4. Deploy with 1 command:
   ```bash
   firebase deploy --only hosting
   ```
5. Your site is live at:
   `https://my-component-vault.web.app`
   *(Firebase domains are pre-authorized for Google Sign-In automatically!)*

---

### Option C: Deploy to Vercel or Netlify
1. Create a free account on [vercel.com](https://vercel.com/) or [netlify.com](https://netlify.com/).
2. Click **Add New Project** > **Import Git Repository**.
3. Select your GitHub repository.
4. Leave build settings as default (static) and click **Deploy**.
5. Add your assigned `*.vercel.app` or `*.netlify.app` domain to Firebase **Authorized Domains**.

---

## 3. Mobile App: Installation & Native APK

### Method 1: Instant PWA Mobile Install (No Developer Account Needed!)
Component Vault is a certified **Progressive Web App (PWA)** with a built-in Service Worker and Web Manifest. It runs in standalone fullscreen, removes the browser URL bar, and functions completely offline:

#### On Android (Chrome / Samsung Internet / Edge):
1. Visit your hosted website URL on your Android phone.
2. Tap the bottom banner: **"Install Component Vault"** (or tap `⋮` in Chrome > **"Install App"** / **"Add to Home screen"**).
3. The app icon appears directly on your phone's home screen and app drawer.

#### On iOS (iPhone & iPad - Safari):
1. Visit your hosted website URL in **Safari**.
2. Tap the **Share** button in Safari's bottom toolbar (`⎋`).
3. Scroll down and tap **"Add to Home Screen"** (`⊞`).
4. Tap **"Add"** in the top-right corner.
5. Launch Component Vault from your home screen just like a native App Store application!

---

### Method 2: Build a Standalone Android APK (.apk) with Capacitor
If you want an actual `.apk` file to install directly onto Android phones or distribute to colleagues without the browser:

#### Prerequisites (All Free):
- **Node.js** installed ([nodejs.org](https://nodejs.org/))
- **Android Studio** installed ([developer.android.com/studio](https://developer.android.com/studio))

#### Steps to Generate the APK:
1. Open your project terminal and install dependencies:
   ```bash
   npm install
   ```
2. Initialize the Capacitor Android project:
   ```bash
   npx cap add android
   ```
3. Copy all web assets into the Android native wrapper:
   ```bash
   npx cap sync
   ```
4. Open the project in Android Studio:
   ```bash
   npx cap open android
   ```
5. In Android Studio:
   - Wait for Gradle sync to complete.
   - Click the top menu: **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
   - Once compilation finishes, click **locate** in the popup notification.
   - You will find your completed `app-debug.apk` located at:
     `android/app/build/outputs/apk/debug/app-debug.apk`
6. Transfer this `.apk` to any Android smartphone via USB, WhatsApp, or Google Drive, tap to install, and enjoy your native Component Vault application!

---

## 🔒 Security & Privacy Summary
- When Firebase credentials are not supplied, all data is encrypted in your browser's private local storage (`localStorage` + `indexedDB`).
- When Firebase is configured, every user's inventory is strictly sandboxed under their own unique Firebase `uid` (`users/{uid}/...`).
- You retain complete ownership of all catalog data, with 1-click JSON backup export and restore built directly into the app.
