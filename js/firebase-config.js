// Firebase Config & Cloud Database Service - Component Vault
// Supports Google Sign-In and Cloud Firestore real-time storage.

(function () {
  'use strict';

  const STORAGE_KEY_CONFIG = 'CV_FIREBASE_CONFIG';

  const DEFAULT_FIREBASE_CONFIG = {
    apiKey: "",
    authDomain: "component-vault-e061e.firebaseapp.com",
    projectId: "component-vault-e061e",
    storageBucket: "component-vault-e061e.firebasestorage.app",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
  };

  class CloudDbService {
    constructor() {
      this.app = null;
      this.auth = null;
      this.firestore = null;
      this.analytics = null;
      this.googleProvider = null;
      this.isConfigured = false;
      this.config = this.loadStoredConfig() || DEFAULT_FIREBASE_CONFIG;
      this._readyPromise = this.init();
    }

    whenReady() {
      return this._readyPromise || Promise.resolve(false);
    }

    loadStoredConfig() {
      // Priority 1: Untracked local developer config (if present)
      if (typeof window !== 'undefined' && window.__LOCAL_FIREBASE_CONFIG__ && window.__LOCAL_FIREBASE_CONFIG__.apiKey) {
        return window.__LOCAL_FIREBASE_CONFIG__;
      }

      // Priority 2: Browser localStorage (configured via Cloud DB Settings in UI)
      try {
        const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.apiKey) return parsed;
        }
      } catch (e) {
        console.warn('Failed to parse stored Firebase config:', e);
      }
      return null;
    }

    async saveConfig(cfg) {
      if (!cfg) {
        localStorage.removeItem(STORAGE_KEY_CONFIG);
        this.config = this.loadStoredConfig() || DEFAULT_FIREBASE_CONFIG;
      } else {
        localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(cfg));
        this.config = cfg;
      }

      if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length) {
        try {
          await Promise.all(firebase.apps.map(a => a.delete().catch(() => {})));
        } catch (e) {
          console.warn('App deletion warning:', e);
        }
      }
      this._readyPromise = this.init();
      return this._readyPromise;
    }

    async _waitForFirebaseSDK() {
      if (typeof window === 'undefined') return false;
      const startTime = Date.now();
      while (Date.now() - startTime < 10000) {
        if (typeof firebase !== 'undefined' && 
            typeof firebase.initializeApp === 'function' && 
            typeof firebase.auth === 'function' && 
            typeof firebase.firestore === 'function') {
          return true;
        }
        await new Promise(r => setTimeout(r, 50));
      }
      return (typeof firebase !== 'undefined' && typeof firebase.firestore === 'function');
    }

    async init() {
      // If config doesn't have an API key, check Firebase Hosting auto-init endpoint (/__/firebase/init.json)
      if (!this.config || !this.config.apiKey) {
        try {
          const res = await fetch('/__/firebase/init.json');
          if (res.ok) {
            const hostingConfig = await res.json();
            if (hostingConfig && hostingConfig.apiKey) {
              this.config = hostingConfig;
            }
          }
        } catch (e) {
          // Local server or offline fallback
        }
      }

      if (!this.config || !this.config.apiKey || !this.config.projectId) {
        this.isConfigured = false;
        return false;
      }

      try {
        await this._waitForFirebaseSDK();

        if (typeof firebase !== 'undefined' && typeof firebase.initializeApp === 'function') {
          // Check if already initialized
          if (!firebase.apps.length) {
            this.app = firebase.initializeApp(this.config);
          } else {
            this.app = firebase.app();
          }

          this.auth = firebase.auth();
          this.firestore = firebase.firestore();
          if (this.config.measurementId && typeof firebase.analytics === 'function') {
            try {
              this.analytics = firebase.analytics();
            } catch (aErr) {
              console.warn('Analytics initialization skipped:', aErr);
            }
          }
          this.googleProvider = new firebase.auth.GoogleAuthProvider();
          this.isConfigured = true;
          return true;
        } else {
          console.info('Firebase CDN SDK not yet loaded in DOM.');
          this.isConfigured = false;
          return false;
        }
      } catch (err) {
        console.error('Firebase initialization error:', err);
        this.isConfigured = false;
        return false;
      }
    }

    waitForAuth() {
      if (this._authInitPromise) return this._authInitPromise;
      this._authInitPromise = new Promise(async (resolve) => {
        await this.whenReady();
        if (!this.auth) {
          return resolve(null);
        }
        if (this.auth.currentUser) {
          return resolve(this.auth.currentUser);
        }
        const unsubscribe = this.auth.onAuthStateChanged((user) => {
          unsubscribe();
          resolve(user);
        }, () => {
          resolve(null);
        });
      });
      return this._authInitPromise;
    }

    _formatGoogleUser(user) {
      if (!user) return null;
      return {
        id: 'google-' + user.uid,
        username: (user.email || '').split('@')[0] || 'google-user',
        displayName: user.displayName || 'Google User',
        email: user.email,
        photoURL: user.photoURL,
        tagline: 'Google Authenticated Vault',
        provider: 'google',
        firebaseUid: user.uid
      };
    }

    async checkRedirectResult() {
      if (!this.isConfigured || !this.auth) return null;
      try {
        const result = await this.auth.getRedirectResult();
        if (result && result.user) {
          return this._formatGoogleUser(result.user);
        }
      } catch (err) {
        console.warn('Redirect result check error:', err);
      }
      return null;
    }

    async signInWithGoogle() {
      if (!this.isConfigured || !this.auth || !this.googleProvider) {
        throw new Error('Google Sign-In requires Firebase configuration. Click "Cloud DB Settings" to set your Firebase project keys.');
      }
      try {
        const result = await this.auth.signInWithPopup(this.googleProvider);
        return this._formatGoogleUser(result.user);
      } catch (err) {
        if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user' || err.code === 'auth/internal-error') {
          console.info('Popup sign-in encounter (' + err.code + '). Falling back to redirect sign-in...');
          await this.auth.signInWithRedirect(this.googleProvider);
          return null;
        } else if (err.code === 'auth/unauthorized-domain') {
          const domain = window.location.hostname || 'this domain';
          throw new Error(`Domain "${domain}" is not authorized in Firebase. In Firebase Console > Authentication > Settings > Authorized Domains, click "Add Domain" and enter "${domain}".`);
        }
        console.error('Google Sign-In Error:', err);
        throw err;
      }
    }

    async saveToFirestore(userId, data) {
      await this.whenReady();
      if (!this.isConfigured || !this.firestore || !userId) return false;
      try {
        await this.waitForAuth();
        const cleanUserId = String(userId).replace(/[^a-zA-Z0-9_-]/g, '_');
        await this.firestore.collection('component_vaults').doc(cleanUserId).set({
          ...data,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        return true;
      } catch (err) {
        console.warn('Firestore write error:', err);
        if (err && err.code === 'invalid-argument') {
          console.error('[CloudDb] Document exceeds Firestore limit (1MB max per document). Ensure images are compressed.');
        } else if (err && err.code === 'permission-denied') {
          console.error('[CloudDb] Permission denied. Verify you are signed in with an authorized Google account.');
        }
        return false;
      }
    }

    async loadFromFirestore(userId) {
      await this.whenReady();
      if (!this.isConfigured || !this.firestore || !userId) return null;
      try {
        await this.waitForAuth();
        const cleanUserId = String(userId).replace(/[^a-zA-Z0-9_-]/g, '_');
        let doc;
        try {
          // Force server read to bypass any stale local SDK cache
          doc = await this.firestore.collection('component_vaults').doc(cleanUserId).get({ source: 'server' });
        } catch (serverErr) {
          doc = await this.firestore.collection('component_vaults').doc(cleanUserId).get();
        }
        if (doc && doc.exists) {
          return doc.data();
        }
      } catch (err) {
        console.warn('Firestore read error:', err);
      }
      return null;
    }

    subscribeToFirestore(userId, onData, onError) {
      if (!userId) return () => {};
      const cleanUserId = String(userId).replace(/[^a-zA-Z0-9_-]/g, '_');

      let isUnsubscribed = false;
      let unsubscribeFirestore = null;

      this.whenReady().then((ready) => {
        if (isUnsubscribed || !ready || !this.firestore) return;
        return this.waitForAuth().then(() => {
          if (isUnsubscribed) return;
          try {
            unsubscribeFirestore = this.firestore.collection('component_vaults').doc(cleanUserId)
              .onSnapshot({ includeMetadataChanges: true }, (doc) => {
                if (doc.exists && typeof onData === 'function') {
                  onData(doc.data());
                }
              }, (err) => {
                console.warn('Firestore snapshot subscription warning:', err);
                if (typeof onError === 'function') onError(err);
              });
          } catch (subErr) {
            console.warn('Failed to attach Firestore snapshot listener:', subErr);
            if (typeof onError === 'function') onError(subErr);
          }
        });
      });

      return () => {
        isUnsubscribed = true;
        if (typeof unsubscribeFirestore === 'function') {
          try {
            unsubscribeFirestore();
          } catch (e) {}
        }
      };
    }
  }

  window.cloudDb = new CloudDbService();
})();
