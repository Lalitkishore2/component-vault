// Authentication & Multi-User Vault Service - Streamline Moderne Edition
// Works 100% client-side for GitHub Pages, Vercel, Netlify, and self-hosted environments.

(function () {
  'use strict';

  class AuthService {
    constructor() {
      this.USERS_KEY = 'CV_USERS_V1';
      this.SESSION_KEY = 'CV_CURRENT_SESSION_V1';
      this.LEGACY_DATA_KEY = 'COMPONENT_VAULT_DATA_V1';
      this.AUTHORIZED_EMAILS_KEY = 'CV_AUTHORIZED_EMAILS';
      this.DEFAULT_AUTHORIZED_EMAILS = ['svlalitk2k@gmail.com'];
      this.subscribers = [];
      this.currentUser = null;
      this.syncChannel = null;
      this._setupCrossTabSync();
    }

    getAuthorizedEmails() {
      try {
        const raw = localStorage.getItem(this.AUTHORIZED_EMAILS_KEY);
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list) && list.length > 0) return list;
        }
      } catch (e) {}
      return [...this.DEFAULT_AUTHORIZED_EMAILS];
    }

    setAuthorizedEmails(emailsArray) {
      const normalized = (emailsArray || [])
        .map(e => (e || '').toLowerCase().trim())
        .filter(e => e.includes('@'));
      if (normalized.length === 0) {
        normalized.push(...this.DEFAULT_AUTHORIZED_EMAILS);
      }
      localStorage.setItem(this.AUTHORIZED_EMAILS_KEY, JSON.stringify(normalized));
      return normalized;
    }

    isEmailAuthorized(email) {
      if (!email) return false;
      const clean = email.toLowerCase().trim();
      const authorized = this.getAuthorizedEmails().map(e => e.toLowerCase().trim());
      return authorized.includes(clean);
    }

    _setupCrossTabSync() {
      try {
        if (typeof BroadcastChannel !== 'undefined') {
          this.syncChannel = new BroadcastChannel('cv_vault_cross_tab_sync');
          this.syncChannel.onmessage = (event) => {
            const data = event.data;
            if (data && data.type === 'AUTH_SESSION_CHANGED') {
              this._handleCrossTabSessionChange(data.userId);
            }
          };
        }
      } catch (e) {
        console.warn('Auth BroadcastChannel setup error:', e);
      }

      window.addEventListener('storage', (e) => {
        if (e.key === this.SESSION_KEY) {
          this._handleCrossTabSessionChange(e.newValue);
        }
      });
    }

    _handleCrossTabSessionChange(userId) {
      const users = this._getUsers();
      if (!userId) {
        this.currentUser = null;
        this._notify('logout', null);
      } else {
        const found = users.find(u => u.id === userId);
        if (found && (!this.currentUser || this.currentUser.id !== userId)) {
          this.currentUser = found;
          this._notify('login', found);
        }
      }
    }

    _broadcastAuthChange(userId) {
      if (this.syncChannel) {
        try {
          this.syncChannel.postMessage({
            type: 'AUTH_SESSION_CHANGED',
            userId: userId || null,
            timestamp: Date.now()
          });
        } catch (e) {}
      }
    }

    async init() {
      // 1. Ensure users database exists
      let users = this._getUsers();

      // 2. Migration: If no users exist, create default "Lab Owner" profile
      // and migrate existing unpartitioned components so zero data is lost.
      if (users.length === 0) {
        const defaultPasswordHash = await this.hashPassword('admin123');
        const defaultUser = {
          id: 'user-owner',
          username: 'owner',
          displayName: 'Lab Owner',
          tagline: 'Primary Hardware Lab',
          passwordHash: defaultPasswordHash,
          createdAt: new Date().toISOString()
        };

        users = [defaultUser];
        this._saveUsers(users);

        // Migrate legacy data if present
        const legacyData = localStorage.getItem(this.LEGACY_DATA_KEY);
        if (legacyData) {
          localStorage.setItem('CV_VAULT_DATA_user-owner', legacyData);
        }
      }

      // Restore existing session if one exists
      const sessionUserId = localStorage.getItem(this.SESSION_KEY);
      if (sessionUserId) {
        this.currentUser = users.find(u => u.id === sessionUserId) || null;
      } else {
        // Strict Login Gate: No auto-login without valid credentials
        this.currentUser = null;
      }

      // Wait for cloudDb to finish initializing before attaching Firebase listeners
      if (window.cloudDb && typeof window.cloudDb.whenReady === 'function') {
        try {
          await window.cloudDb.whenReady();
        } catch (e) {
          console.warn('CloudDb ready check warning:', e);
        }
      }

      // Attach Firebase Auth listener for seamless Google Sign-In session recovery
      if (window.cloudDb && window.cloudDb.auth) {
        window.cloudDb.auth.onAuthStateChanged(async (fbUser) => {
          if (fbUser) {
            if (!this.isEmailAuthorized(fbUser.email)) {
              console.warn('Unauthorized Google account session detected, terminating:', fbUser.email);
              try {
                await window.cloudDb.auth.signOut();
              } catch (e) {}
              this.logout();
              return;
            }
            const formatted = window.cloudDb._formatGoogleUser(fbUser);
            if (formatted) {
              if (!this.currentUser || this.currentUser.id !== formatted.id) {
                await this.loginWithGoogle(formatted);
              } else if (window.componentStore) {
                await window.componentStore.setVaultUser(formatted.id);
              }
            }
          }
        });
      }

      return this.currentUser;
    }

    // Hash passwords using standard Web Crypto API SHA-256
    async hashPassword(password) {
      const msgBuffer = new TextEncoder().encode(password || '');
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Register a new user and vault
    async signUp({ username, displayName, password, includeStarter = true }) {
      const cleanUsername = (username || '').trim().toLowerCase();
      const cleanDisplayName = (displayName || '').trim() || cleanUsername;
      const cleanPassword = (password || '').trim();

      if (!cleanUsername || cleanUsername.length < 2) {
        throw new Error('Username must be at least 2 characters.');
      }
      if (!cleanPassword || cleanPassword.length < 4) {
        throw new Error('Password must be at least 4 characters.');
      }

      const users = this._getUsers();
      if (users.some(u => u.username === cleanUsername)) {
        throw new Error(`Username "${cleanUsername}" is already taken.`);
      }

      const passwordHash = await this.hashPassword(cleanPassword);
      const userId = 'user-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);

      const newUser = {
        id: userId,
        username: cleanUsername,
        displayName: cleanDisplayName,
        tagline: 'Custom Hardware Vault',
        passwordHash,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      this._saveUsers(users);

      // Initialize new user vault storage
      const vaultKey = `CV_VAULT_DATA_${userId}`;
      if (includeStarter && typeof DEFAULT_COMPONENTS !== 'undefined') {
        const starterData = {
          components: JSON.parse(JSON.stringify(DEFAULT_COMPONENTS)),
          activityLog: [
            {
              id: 'act-init-' + Date.now(),
              type: 'created',
              componentName: 'Starter Catalog Initialized',
              timestamp: new Date().toISOString()
            }
          ],
          savedAt: new Date().toISOString()
        };
        localStorage.setItem(vaultKey, JSON.stringify(starterData));
      } else {
        const blankData = {
          components: [],
          activityLog: [],
          savedAt: new Date().toISOString()
        };
        localStorage.setItem(vaultKey, JSON.stringify(blankData));
      }

      this._setSession(newUser);
      this.currentUser = newUser;
      this._notify('login', newUser);
      return newUser;
    }

    // Authenticate an existing user
    async login(username, password) {
      const cleanUsername = (username || '').trim().toLowerCase();
      const cleanPassword = (password || '').trim();

      const users = this._getUsers();
      const user = users.find(u => u.username === cleanUsername);
      if (!user) {
        throw new Error('User not found. Check username or sign up for a new vault.');
      }

      const hash = await this.hashPassword(cleanPassword);
      if (user.passwordHash !== hash) {
        throw new Error('Incorrect password. Please try again.');
      }

      this._setSession(user);
      this.currentUser = user;
      this._notify('login', user);
      return user;
    }

    // Authenticate with Google Sign-In via Firebase (supports popup & redirect)
    async loginWithGoogle(providedGoogleUser = null) {
      if (!window.cloudDb) {
        throw new Error('Cloud database service not initialized.');
      }
      const googleUser = providedGoogleUser || (await window.cloudDb.signInWithGoogle());
      if (!googleUser) return null; // Redirect flow initiated or pending

      // Strictly verify if Google email is on the authorized allowlist
      if (!this.isEmailAuthorized(googleUser.email)) {
        console.warn('Unauthorized Google sign-in attempt rejected:', googleUser.email);
        if (window.cloudDb && window.cloudDb.auth) {
          try {
            await window.cloudDb.auth.signOut();
          } catch (e) {}
        }
        throw new Error(`Access Denied: Google account (${googleUser.email}) is not authorized for this private hardware vault.`);
      }

      const users = this._getUsers();
      let existing = users.find(u => u.id === googleUser.id || (u.email && u.email === googleUser.email));

      if (!existing) {
        existing = {
          id: googleUser.id,
          username: googleUser.username,
          displayName: googleUser.displayName,
          email: googleUser.email,
          photoURL: googleUser.photoURL,
          tagline: 'Google Authenticated Lab',
          createdAt: new Date().toISOString()
        };
        users.push(existing);
        this._saveUsers(users);

        // Seed or migrate catalog for new Google user
        const vaultKey = `CV_VAULT_DATA_${existing.id}_vault-default`;
        const legacyVaultKey = `CV_VAULT_DATA_${existing.id}`;
        
        let initialData = null;
        // Check if there are local workstation components in user-owner to migrate
        try {
          const ownerKey = 'CV_VAULT_DATA_user-owner_vault-default';
          const fallbackOwnerKey = 'CV_VAULT_DATA_user-owner';
          const raw = localStorage.getItem(ownerKey) || localStorage.getItem(fallbackOwnerKey);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && Array.isArray(parsed.components) && parsed.components.length > 0) {
              initialData = parsed;
            }
          }
        } catch (e) {}

        if (!localStorage.getItem(vaultKey) && !localStorage.getItem(legacyVaultKey)) {
          const starterData = initialData || (typeof DEFAULT_COMPONENTS !== 'undefined' ? {
            components: JSON.parse(JSON.stringify(DEFAULT_COMPONENTS)),
            activityLog: [
              {
                id: 'act-google-' + Date.now(),
                type: 'created',
                componentName: 'Google Vault Initialized',
                timestamp: new Date().toISOString()
              }
            ],
            savedAt: new Date().toISOString()
          } : null);
          if (starterData) {
            localStorage.setItem(vaultKey, JSON.stringify(starterData));
            localStorage.setItem(legacyVaultKey, JSON.stringify(starterData));
          }
        }
      } else {
        // Update photo and display name if changed
        existing.displayName = googleUser.displayName || existing.displayName;
        existing.photoURL = googleUser.photoURL || existing.photoURL;
        this._saveUsers(users);
      }

      this._setSession(existing);
      this.currentUser = existing;
      this._notify('login', existing);
      return existing;
    }

    // Switch active account (for local workstation multi-vault use)
    switchUser(userId) {
      const users = this._getUsers();
      const user = users.find(u => u.id === userId);
      if (!user) throw new Error('User account not found.');

      this._setSession(user);
      this.currentUser = user;
      this._notify('switch', user);
      return user;
    }

    logout() {
      localStorage.removeItem(this.SESSION_KEY);
      this.currentUser = null;
      if (window.cloudDb && window.cloudDb.auth) {
        try {
          window.cloudDb.auth.signOut();
        } catch (e) {}
      }
      this._broadcastAuthChange(null);
      this._notify('logout', null);
    }

    getCurrentUser() {
      return this.currentUser;
    }

    getUsersList() {
      return this._getUsers().map(u => ({
        id: u.id,
        username: u.username,
        displayName: u.displayName,
        tagline: u.tagline || 'Hardware Vault'
      }));
    }

    onAuthChange(callback) {
      this.subscribers.push(callback);
      return () => {
        this.subscribers = this.subscribers.filter(cb => cb !== callback);
      };
    }

    _notify(event, user) {
      this.subscribers.forEach(cb => {
        try {
          cb(event, user);
        } catch (err) {
          console.error('Auth notification error:', err);
        }
      });
    }

    _getUsers() {
      try {
        const raw = localStorage.getItem(this.USERS_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    }

    _saveUsers(users) {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }

    _setSession(user) {
      if (user && user.id) {
        localStorage.setItem(this.SESSION_KEY, user.id);
        this._broadcastAuthChange(user.id);
      }
    }
  }

  window.authService = new AuthService();
})();
