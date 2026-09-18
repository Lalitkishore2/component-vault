# Implementation Plan: Component Vault Hosting, Backend & Google Sign-In

## Overview
This plan establishes a production-grade, secure, and permanent zero-cost hosting and backend architecture for the Component Vault application. It natively integrates Google Sign-In (OAuth 2.0), an isolated multi-tenant cloud database (Cloud Firestore), and global edge CDN hosting (Firebase Hosting / Vercel) with continuous automated deployments.

---

## Architectural Decisions & Tradeoffs

### Decision 1: Backend Architecture — Serverless Firebase Cloud Platform (Recommended)
- **Choice:** Google Cloud Platform / Firebase (Authentication + Cloud Firestore + Firebase Hosting).
- **Rationale:** 
  - The application already features modular Firebase integration in [`js/firebase-config.js`](file:///C:/Users/LALITKO/Desktop/projects/component-inventory/js/firebase-config.js).
  - Google Sign-In is native to Firebase Auth with zero server-side token exchange infrastructure required.
  - Generous permanent free tier (Spark plan: 50,000 document reads/day, 20,000 writes/day, 1 GB storage, 10 GB/month hosting transfer, custom domain with automated SSL).
  - True serverless architecture: zero server maintenance, zero Docker daemon memory overhead, zero cold starts.
- **Alternative (Custom Node.js / Express Backend):** 
  - An Express.js backend with SQLite/Postgres and Passport.js Google OAuth. 
  - Tradeoff: Requires a running VM or container instance (e.g., Render, Railway, Fly.io) which incurs either monthly costs or idle spin-down sleep latency (50s cold start).

### Decision 2: Multi-Tenant Data Isolation Strategy
- **Choice:** Path-based user collection isolation in Cloud Firestore:
  ```
  databases/{database}/documents/vaults/{userId}/components/{componentId}
  databases/{database}/documents/vaults/{userId}/loans/{loanId}
  databases/{database}/documents/vaults/{userId}/activity/{logId}
  ```
- **Rationale:** Enforces strict cryptographic tenant isolation via Firestore Security Rules:
  `allow read, write: if request.auth != null && request.auth.uid == userId;`
  No user can query or modify another user's hardware catalog.

### Decision 3: Hosting Platform
- **Primary:** Firebase Hosting (tied directly to the Firebase Project for one-command deployment: `firebase deploy`).
- **Secondary (Mirror):** GitHub Pages / Vercel (for automatic preview deployments from Git commits).

---

## Dependency Graph

```
Google Cloud Project & OAuth 2.0 Client
            │
            ├── Firebase Authentication (Google Sign-In + Email/Password)
            │           │
            │           └── Client-Side Auth Gate (index.html & js/auth.js)
            │
            ├── Cloud Firestore Database & Security Rules
            │           │
            │           └── Real-time Store Sync (js/store.js & js/firebase-config.js)
            │
            └── Hosting Infrastructure (firebase.json / vercel.json)
                        │
                        └── CI/CD Automation (GitHub Actions / Firebase Deploy)
```

---

## Task List

### Phase 1: Authentication & Google Sign-In Integration

#### Task 1: Google OAuth 2.0 & Firebase Project Initialization
**Description:** Initialize Google Cloud / Firebase project credentials and configure Google Sign-In provider with authorized origins and redirect URIs.
**Acceptance criteria:**
- [ ] Firebase project created or configured with Authentication enabled.
- [ ] Google Sign-In provider activated in Firebase Console.
- [ ] Authorized domains configured for `localhost`, `127.0.0.1`, and production hosting URL.
- [ ] `firebase.json` and `.firebaserc` project configuration files generated in repository.
**Verification:**
- [ ] Run `firebase projects:list` to verify active project binding.
**Dependencies:** None
**Files likely touched:**
- `firebase.json`
- `.firebaserc`
- `js/firebase-config.js`
**Estimated scope:** Small (1-3 files)

#### Task 2: Google Sign-In Flow & Client Auth Session Integration
**Description:** Connect the UI `#portalGoogleSignInBtn` and `#loginPortal` to the real-time Firebase Auth state, supporting both popup and mobile redirect fallback.
**Acceptance criteria:**
- [ ] Clicking "Continue with Google" launches Google OAuth popup.
- [ ] Mobile browsers smoothly fall back to `signInWithRedirect` if popup is blocked.
- [ ] User avatar, display name, and email populate into header profile chip (`#headerUserName`, `#headerUserAvatar`).
- [ ] Session is persisted across page reloads and synchronized across browser tabs via `BroadcastChannel`.
**Verification:**
- [ ] Test Google authentication flow in browser; verify user session token in `sessionStorage`/`localStorage`.
**Dependencies:** Task 1
**Files likely touched:**
- `js/auth.js`
- `js/firebase-config.js`
- `index.html`
**Estimated scope:** Medium (2-3 files)

---

### Checkpoint 1: Authentication Verified
- [ ] User can authenticate via Google Sign-In and local credentials.
- [ ] Strict login gate hides application shell until authenticated.

---

### Phase 2: Cloud Database Backend & Security Hardening

#### Task 3: Cloud Firestore Database Structure & Multi-Tenant Sync
**Description:** Implement real-time synchronization between local storage (`store.js`) and remote Cloud Firestore under the user's isolated vault collection.
**Acceptance criteria:**
- [ ] Component creations, edits, and deletions sync to Firestore in real time.
- [ ] Loan transactions and returns record to cloud with server timestamps.
- [ ] Offline resilience: operations performed without network queue locally and sync upon reconnection.
**Verification:**
- [ ] Perform a component add; verify document appears in Firebase Console Firestore tab.
**Dependencies:** Task 2
**Files likely touched:**
- `js/store.js`
- `js/firebase-config.js`
**Estimated scope:** Medium (2-3 files)

#### Task 4: Firestore Production Security Rules
**Description:** Deploy strict declarative security rules to the database to ensure zero cross-tenant data leakage.
**Acceptance criteria:**
- [ ] Firestore security rules file created (`firestore.rules`).
- [ ] Rules restrict access exclusively to authenticated user's own `userId` path.
- [ ] Rules deployed to Firebase Cloud.
**Verification:**
- [ ] Run simulated Firestore rules test with unauthenticated and mismatched UID payloads.
**Dependencies:** Task 3
**Files likely touched:**
- `firestore.rules`
**Estimated scope:** XS (1 file)

---

### Checkpoint 2: Backend Cloud Sync Verified
- [ ] Cloud sync indicator in app displays green ("Cloud Connected").
- [ ] Data persists in Cloud Firestore under isolated user document.

---

### Phase 3: Hosting Infrastructure & CI/CD Pipeline

#### Task 5: Firebase Hosting & Production Headers Configuration
**Description:** Configure Firebase Hosting with caching headers, Content Security Policy, clean URLs, and PWA Service Worker bypass.
**Acceptance criteria:**
- [ ] `firebase.json` configured with caching rules (`sw.js` no-cache, static assets 1-year cache).
- [ ] PWA manifest and web app icon headers configured.
- [ ] `404.html` fallback configured for clean routing.
**Verification:**
- [ ] Run `firebase serve` or local test server to verify header behavior.
**Dependencies:** Task 1
**Files likely touched:**
- `firebase.json`
- `404.html`
**Estimated scope:** Small (2 files)

#### Task 6: GitHub Actions Automated Deployment Workflow
**Description:** Set up continuous deployment via GitHub Actions so pushing to `main` automatically tests, builds, and deploys to Firebase Hosting.
**Acceptance criteria:**
- [ ] `.github/workflows/deploy.yml` workflow created.
- [ ] Configured with Firebase Service Account secret deployment token.
- [ ] Pull requests generate ephemeral preview channel URLs.
**Verification:**
- [ ] Verify GitHub Actions workflow syntax with action linter.
**Dependencies:** Task 5
**Files likely touched:**
- `.github/workflows/deploy.yml`
**Estimated scope:** Small (1 file)

---

### Phase 4: Alternative / Self-Hosted Node.js Server Plan

#### Task 7: Express.js REST API & Docker Containerization (Alternative Option)
**Description:** Provide a standalone Express.js backend with SQLite/PostgreSQL, JSON REST endpoints (`/api/components`, `/api/loans`), and Dockerfile for users preferring VPS or container hosting (Render, Railway, Fly.io).
**Acceptance criteria:**
- [ ] `server.js` extended with Express REST API routes.
- [ ] Dockerfile and `docker-compose.yml` created.
- [ ] Environment variable configuration (`.env.example`) documented.
**Verification:**
- [ ] Run `node server.js` and verify API endpoints respond with JSON.
**Dependencies:** None (Parallelizable)
**Files likely touched:**
- `server.js`
- `Dockerfile`
- `docker-compose.yml`
- `.env.example`
**Estimated scope:** Medium (3-4 files)

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Domain not authorized for Google OAuth | High (Auth fails with `auth/unauthorized-domain`) | Include automated check in `auth.js` displaying direct instructions to add hosting domain to Firebase Authorized Domains list. |
| Firebase quota exhaustion | Low (Exceeding 50k reads/day) | Implement aggressive local caching in `localStorage`/IndexedDB; only fetch deltas based on `updatedAt` timestamps. |
| Popup blocker on iOS Safari | Medium (Google sign-in popup fails) | Implement automatic redirect fallback (`signInWithRedirect`) if `signInWithPopup` is blocked. |
| Cross-tenant data overwrite | Critical (Privacy violation) | Strict Firestore security rules matching `request.auth.uid == userId` at the root document level. |
