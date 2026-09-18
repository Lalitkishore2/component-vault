# Task Checklist: Hosting, Backend & Google Sign-In

## Phase 1: Authentication & Google Sign-In Integration
- [x] **Task 1: Google OAuth 2.0 & Firebase Project Initialization**
  - [x] Initialize Firebase project credentials (`firebaseConfig` in `js/firebase-config.js`)
  - [x] Configure `firebase.json` and `.firebaserc`
  - [x] Document authorized local & production domains in Google Cloud Console
- [x] **Task 2: Google Sign-In Flow & Client Auth Integration**
  - [x] Connect `#portalGoogleSignInBtn` to `cloudDb.signInWithGoogle()` & `window.authService.loginWithGoogle()`
  - [x] Support automatic popup and redirect fallback (`signInWithRedirect`)
  - [x] Map Google profile picture, display name, and email to vault header
  - [x] Wire cross-tab session sync with `BroadcastChannel`
- [x] **Checkpoint 1: Authentication Flow Verification**
  - [x] Verify Google Sign-In button event listener & fallback configuration modal
  - [x] Verify session persistence across reloads and multi-user switching

## Phase 2: Cloud Database Backend & Security Rules
- [x] **Task 3: Cloud Firestore Database Structure & Multi-Tenant Sync**
  - [x] Create `component_vaults/{userId}` collection schema
  - [x] Wire real-time write listener and cloud sync debouncing
  - [x] Implement cloud pull on initial vault load with offline local fallback
- [x] **Task 4: Firestore Production Security Rules**
  - [x] Create `firestore.rules` enforcing `request.auth.uid == userId`
  - [x] Enforce multi-tenant data isolation and deny unauthenticated writes
- [x] **Checkpoint 2: Backend Cloud Sync Verification**
  - [x] Cloud connection status indicator hooked to database state
  - [x] Real-time cross-device data persistence schema prepared

## Phase 3: Hosting Infrastructure & CI/CD Pipeline
- [x] **Task 5: Firebase Hosting & Production Headers Configuration**
  - [x] Configure `firebase.json` hosting target with clean URLs
  - [x] Set cache-control headers (`sw.js` no-cache, assets 1-year cache, immutable static assets)
  - [x] Create custom Streamline Moderne `404.html` fallback page
- [x] **Task 6: GitHub Actions Automated Deployment Workflow**
  - [x] Create `.github/workflows/deploy.yml`
  - [x] Configure Firebase Extended Action with secret token binding
- [x] **Checkpoint 3: Hosting Deployment Verification**
  - [x] Verified `404.html` routing and assets integrity
  - [x] Static server and PWA manifest verified locally on port 3000

## Phase 4: Alternative / Self-Hosted Node.js Backend Option
- [x] **Task 7: Standalone Express.js REST API & Docker Container**
  - [x] Create multi-stage Alpine Node.js `Dockerfile` with healthcheck
  - [x] Create `docker-compose.yml` for containerized deployment
  - [x] Create `.env.example` with environment variable schema
