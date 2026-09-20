// Store - Component Vault Reactive State & Persistence Layer

class ComponentStore {
  constructor() {
    this.userId = localStorage.getItem('CV_CURRENT_SESSION_V1') || 'user-owner';
    this.components = [];
    this.activityLog = [];
    this.subscribers = [];
    this.syncChannel = null;
    this.syncStatus = 'synced'; // 'synced' | 'syncing' | 'error' | 'offline'
    this.syncError = null;
    this.onSyncStatusChange = null;
    this.firestoreUnsubscribe = null;
    this._lastSavedAt = null;
    this._visibilityListenerAttached = false;
    this._onlineListenerAttached = false;
    this._cloudPollInterval = null;
    this.setupCrossTabSync();
    this.init();
    this.setupFirestoreSync();
    this.startPeriodicCloudSync();

    // Whenever Firebase Auth session is confirmed/restored, auto-pull latest data and re-sync
    if (typeof window !== 'undefined') {
      window.addEventListener('cv_auth_ready', () => {
        this.pullActiveVaultFromCloud(true);
        this.setupFirestoreSync();
      });
    }
  }

  startPeriodicCloudSync() {
    if (this._cloudPollInterval) clearInterval(this._cloudPollInterval);
    // Periodically verify Cloud Firestore for remote updates every 8 seconds while online
    this._cloudPollInterval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible' && navigator.onLine) {
        this.pullActiveVaultFromCloud(false);
      }
    }, 8000);
  }

  setupFirestoreSync() {
    if (this.firestoreUnsubscribe) {
      try { this.firestoreUnsubscribe(); } catch (e) {}
      this.firestoreUnsubscribe = null;
    }

    if (!window.cloudDb || typeof window.cloudDb.subscribeToFirestore !== 'function') {
      return;
    }

    // Only attach real-time Firestore sync if Firebase Auth has an active signed-in user
    const hasAuthUser = window.cloudDb.auth && window.cloudDb.auth.currentUser;
    if (!hasAuthUser) {
      this.setSyncStatus('offline', 'Operating in local offline storage.');
      return;
    }

    const vaultId = this.getActiveVaultId();
    const firestoreDocId = `${this.userId}_${vaultId}`;

    this.firestoreUnsubscribe = window.cloudDb.subscribeToFirestore(
      firestoreDocId,
      (remoteData) => {
        this.handleRemoteUpdate(remoteData);
      },
      (err) => {
        if (err && err.code === 'permission-denied') {
          this.setSyncStatus('error', 'Cloud sync permissions denied. Please sign in with an authorized Google account.');
        } else {
          this.setSyncStatus('error', err.message || 'Cloud sync error');
        }
      }
    );
  }

  handleRemoteUpdate(remote) {
    if (!remote || !Array.isArray(remote.components)) return;

    const localTime = this._lastSavedAt ? new Date(this._lastSavedAt).getTime() : 0;
    const remoteTime = remote.savedAt ? new Date(remote.savedAt).getTime() : 0;

    // 1. Echo prevention: if this remote snapshot matches our last local save, skip re-applying
    if (this._lastSavedAt && remote.savedAt === this._lastSavedAt) {
      this.setSyncStatus('synced');
      return;
    }

    // 2. If local has a newer save that hasn't landed in remote yet, DO NOT overwrite local components!
    if (localTime > remoteTime) {
      console.log('[Store] Local state is newer than incoming cloud snapshot. Preserving local additions.');
      this.syncToCloudNow();
      return;
    }

    // 3. Remote is newer or equal: safely merge any local components not present in remote
    const merged = this.mergeComponentsWithRemote(this.components, remote.components);
    const localJson = JSON.stringify(this.components);
    const remoteJson = JSON.stringify(merged);
    const localLogJson = JSON.stringify(this.activityLog);
    const remoteLogJson = JSON.stringify(remote.activityLog || []);

    if (localJson !== remoteJson || localLogJson !== remoteLogJson) {
      console.log('[Store] Applying real-time cloud update from Firestore...');
      this.components = merged;
      this.activityLog = remote.activityLog || [];
      this._lastSavedAt = remote.savedAt || new Date().toISOString();
      localStorage.setItem(this.getStorageKey(), JSON.stringify({
        components: this.components,
        activityLog: this.activityLog,
        savedAt: this._lastSavedAt
      }));
      this.setSyncStatus('synced');
      this.notify();
    } else {
      this.setSyncStatus('synced');
    }
  }

  mergeComponentsWithRemote(localComponents, remoteComponents) {
    if (!Array.isArray(localComponents) || localComponents.length === 0) {
      return remoteComponents || [];
    }
    if (!Array.isArray(remoteComponents) || remoteComponents.length === 0) {
      return localComponents;
    }

    const map = new Map();
    // 1. Add all remote components
    remoteComponents.forEach(c => map.set(c.id, c));

    // 2. Preserve any local components not in remote (e.g. newly created locally)
    localComponents.forEach(localComp => {
      // Check if explicitly deleted locally
      if (this.deletedComponentIds && this.deletedComponentIds.has(localComp.id)) {
        return;
      }
      const remoteComp = map.get(localComp.id);
      if (!remoteComp) {
        // Component exists in local but not remote: preserve it!
        map.set(localComp.id, localComp);
      } else {
        // Both have the component: keep whichever was updated more recently
        const localT = new Date(localComp.updatedAt || localComp.createdAt || 0).getTime();
        const remoteT = new Date(remoteComp.updatedAt || remoteComp.createdAt || 0).getTime();
        if (localT > remoteT) {
          map.set(localComp.id, localComp);
        }
      }
    });

    return Array.from(map.values());
  }

  setupCrossTabSync() {
    // 1. BroadcastChannel API for instant zero-latency cross-tab communication
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        this.syncChannel = new BroadcastChannel('cv_vault_cross_tab_sync');
        this.syncChannel.onmessage = (event) => {
          this.handleSyncMessage(event.data);
        };
      }
    } catch (err) {
      console.warn('BroadcastChannel initialization error:', err);
    }

    // 2. Storage event listener (standard browser mechanism for cross-tab sync)
    window.addEventListener('storage', (e) => {
      if (!e.key) return;
      if (e.key === this.getStorageKey() || (e.key.startsWith('CV_VAULT_DATA_') && e.key === `CV_VAULT_DATA_${this.userId}`)) {
        this.init();
        this.notify();
      } else if (e.key === 'CV_CURRENT_SESSION_V1') {
        const newUserId = e.newValue;
        if (newUserId && newUserId !== this.userId) {
          this.setVaultUser(newUserId);
        }
      }
    });
  }

  handleSyncMessage(data) {
    if (!data || !data.type) return;
    if (data.type === 'VAULT_UPDATED') {
      // If the update applies to this vault or is global
      if (!data.userId || data.userId === this.userId) {
        this.init();
        this.notify();
      }
    } else if (data.type === 'AUTH_SESSION_CHANGED') {
      if (data.userId && data.userId !== this.userId) {
        this.setVaultUser(data.userId);
      }
    }
  }

  broadcastUpdate() {
    if (this.syncChannel) {
      try {
        this.syncChannel.postMessage({
          type: 'VAULT_UPDATED',
          userId: this.userId,
          timestamp: Date.now()
        });
      } catch (err) {
        console.warn('Cross-tab broadcast error:', err);
      }
    }
  }

  // --- Multi-Vault Management (Per Authenticated User) ---
  getUserVaultsKey() {
    return `CV_USER_VAULTS_${this.userId}`;
  }

  getActiveVaultKey() {
    return `CV_ACTIVE_VAULT_${this.userId}`;
  }

  getUserVaults() {
    try {
      const raw = localStorage.getItem(this.getUserVaultsKey());
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading user vaults:', e);
    }

    // Default starter vault
    const defaultVault = [
      {
        id: 'vault-default',
        name: 'Main Hardware Lab',
        tagline: 'Primary Storage & Custody Ledger',
        createdAt: new Date().toISOString()
      }
    ];
    this.saveUserVaults(defaultVault);
    return defaultVault;
  }

  saveUserVaults(vaults) {
    try {
      localStorage.setItem(this.getUserVaultsKey(), JSON.stringify(vaults));
      // Asynchronously mirror registry to Cloud Firestore
      if (window.cloudDb && typeof window.cloudDb.saveToFirestore === 'function') {
        window.cloudDb.saveToFirestore(`${this.userId}_registry`, {
          vaults,
          updatedAt: new Date().toISOString()
        }).catch(() => {});
      }
    } catch (e) {
      console.error('Failed to save user vaults:', e);
    }
  }

  getActiveVaultId() {
    const active = localStorage.getItem(this.getActiveVaultKey());
    const vaults = this.getUserVaults();
    if (active && vaults.some(v => v.id === active)) {
      return active;
    }
    return vaults[0] ? vaults[0].id : 'vault-default';
  }

  getActiveVault() {
    const vaults = this.getUserVaults();
    const activeId = this.getActiveVaultId();
    return vaults.find(v => v.id === activeId) || vaults[0] || { id: 'vault-default', name: 'Main Hardware Lab' };
  }

  getStorageKey() {
    const vaultId = this.getActiveVaultId();
    return `CV_VAULT_DATA_${this.userId}_${vaultId}`;
  }

  async switchVault(vaultId) {
    if (!vaultId) return;
    const vaults = this.getUserVaults();
    if (!vaults.some(v => v.id === vaultId)) return;

    localStorage.setItem(this.getActiveVaultKey(), vaultId);
    this.init();
    this.notify();
    this.broadcastUpdate();

    // Pull cloud data for this switched vault and attach real-time listener
    await this.pullActiveVaultFromCloud();
    this.setupFirestoreSync();
  }

  async createVault({ name, tagline = '', includeStarter = true }) {
    const cleanName = (name || '').trim();
    if (!cleanName) throw new Error('Vault name is required.');

    const vaults = this.getUserVaults();
    const vaultId = 'vault-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const newVault = {
      id: vaultId,
      name: cleanName,
      tagline: (tagline || '').trim(),
      createdAt: new Date().toISOString()
    };

    vaults.push(newVault);
    this.saveUserVaults(vaults);
    localStorage.setItem(this.getActiveVaultKey(), vaultId);

    // Initial payload for the new vault
    const initialComponents = includeStarter && typeof DEFAULT_COMPONENTS !== 'undefined'
      ? JSON.parse(JSON.stringify(DEFAULT_COMPONENTS))
      : [];
    const initialActivity = [
      {
        id: 'act-' + Date.now(),
        type: 'created',
        componentName: `${cleanName} Initialized`,
        timestamp: new Date().toISOString()
      }
    ];

    this.components = initialComponents;
    this.activityLog = initialActivity;
    this.save();
    this.setupFirestoreSync();

    return newVault;
  }

  updateVault(vaultId, { name, tagline = '' }) {
    const cleanName = (name || '').trim();
    if (!cleanName) throw new Error('Vault name is required.');

    const vaults = this.getUserVaults();
    const vault = vaults.find(v => v.id === vaultId);
    if (!vault) throw new Error('Vault not found.');

    vault.name = cleanName;
    vault.tagline = (tagline || '').trim();
    vault.updatedAt = new Date().toISOString();

    this.saveUserVaults(vaults);
    this.broadcastUpdate();
    this.notify();
    return vault;
  }

  deleteVault(vaultId) {
    const vaults = this.getUserVaults();
    if (vaults.length <= 1) {
      throw new Error('Cannot delete the only vault in your account.');
    }

    const filtered = vaults.filter(v => v.id !== vaultId);
    this.saveUserVaults(filtered);
    localStorage.removeItem(`CV_VAULT_DATA_${this.userId}_${vaultId}`);

    // Asynchronously delete the Firestore document for this deleted vault
    if (window.cloudDb && window.cloudDb.firestore) {
      try {
        const cleanDocId = `${this.userId}_${vaultId}`.replace(/[^a-zA-Z0-9_-]/g, '_');
        window.cloudDb.firestore.collection('component_vaults').doc(cleanDocId).delete().catch(() => {});
      } catch (e) {}
    }

    if (this.getActiveVaultId() === vaultId) {
      localStorage.setItem(this.getActiveVaultKey(), filtered[0].id);
      this.init();
      this.notify();
      this.setupFirestoreSync();
    }
    this.broadcastUpdate();
    return true;
  }

  async setVaultUser(userId) {
    if (!userId) return;
    const prevUserId = this.userId;
    this.userId = userId;

    // If new user vault has no stored data yet, migrate from previous user (e.g. local user-owner)
    const currentKey = this.getStorageKey();
    if (!localStorage.getItem(currentKey) && prevUserId && prevUserId !== userId) {
      const prevKey = `CV_VAULT_DATA_${prevUserId}_${this.getActiveVaultId()}`;
      const fallbackPrevKey = `CV_VAULT_DATA_${prevUserId}`;
      const prevData = localStorage.getItem(prevKey) || localStorage.getItem(fallbackPrevKey);
      if (prevData) {
        try {
          const parsed = JSON.parse(prevData);
          if (parsed && Array.isArray(parsed.components) && parsed.components.length > 0) {
            localStorage.setItem(currentKey, prevData);
          }
        } catch (e) {}
      }
    }

    // Asynchronously sync remote vault registry
    if (window.cloudDb && typeof window.cloudDb.loadFromFirestore === 'function') {
      try {
        const remoteReg = await window.cloudDb.loadFromFirestore(`${this.userId}_registry`);
        if (remoteReg && Array.isArray(remoteReg.vaults) && remoteReg.vaults.length > 0) {
          const localVaults = this.getUserVaults();
          const merged = [...localVaults];
          remoteReg.vaults.forEach(rv => {
            if (!merged.some(lv => lv.id === rv.id)) {
              merged.push(rv);
            }
          });
          this.saveUserVaults(merged);
        }
      } catch (err) {
        console.warn('Cloud registry pull skipped:', err);
      }
    }

    this.init();

    // Check if user-owner has local workstation components not yet in this user vault
    if (this.userId !== 'user-owner') {
      try {
        const ownerKey = `CV_VAULT_DATA_user-owner_vault-default`;
        const fallbackOwnerKey = `CV_VAULT_DATA_user-owner`;
        const ownerRaw = localStorage.getItem(ownerKey) || localStorage.getItem(fallbackOwnerKey);
        if (ownerRaw) {
          const ownerData = JSON.parse(ownerRaw);
          if (ownerData && Array.isArray(ownerData.components) && ownerData.components.length > 0) {
            const merged = this.mergeComponentsWithRemote(this.components, ownerData.components);
            if (merged.length !== this.components.length) {
              console.log('[Store] Auto-merged local workstation components into user account:', merged.length);
              this.components = merged;
              this._lastSavedAt = new Date().toISOString();
              localStorage.setItem(this.getStorageKey(), JSON.stringify({
                components: this.components,
                activityLog: this.activityLog,
                savedAt: this._lastSavedAt
              }));
            }
          }
        }
      } catch (e) {
        console.warn('Error merging local workstation components:', e);
      }
    }

    this.notify();
    await this.pullActiveVaultFromCloud(false);
    this.setupFirestoreSync();

    // Push local components to Cloud Firestore immediately after logging in
    if (Array.isArray(this.components) && this.components.length > 0) {
      await this.syncToCloudNow();
    }
  }

  async syncToCloudNow() {
    if (!window.cloudDb || typeof window.cloudDb.saveToFirestore !== 'function') {
      this.setSyncStatus('error', 'Cloud database service not available.');
      return false;
    }

    const hasAuthUser = window.cloudDb.auth && window.cloudDb.auth.currentUser;
    if (!hasAuthUser) {
      this.setSyncStatus('offline', 'Operating locally. Sign in with Google to sync to cloud.');
      return false;
    }

    try {
      const vaultId = this.getActiveVaultId();
      const firestoreDocId = `${this.userId}_${vaultId}`;
      const payload = {
        components: this.components,
        activityLog: this.activityLog,
        savedAt: this._lastSavedAt || new Date().toISOString()
      };
      this.setSyncStatus('syncing');
      const ok = await window.cloudDb.saveToFirestore(firestoreDocId, payload);
      if (ok) {
        this.setSyncStatus('synced');
        return true;
      } else {
        this.setSyncStatus('error', 'Cloud sync failed. Check Firebase Firestore permissions.');
        return false;
      }
    } catch (err) {
      console.warn('syncToCloudNow error:', err);
      this.setSyncStatus('error', err.message || 'Sync error');
      return false;
    }
  }

  async pullActiveVaultFromCloud(force = false) {
    if (!window.cloudDb || typeof window.cloudDb.loadFromFirestore !== 'function') {
      return false;
    }
    // Only pull from Firestore if Firebase Auth has an active signed-in user
    const hasAuthUser = window.cloudDb.auth && window.cloudDb.auth.currentUser;
    if (!hasAuthUser) {
      return false;
    }

    try {
      const vaultId = this.getActiveVaultId();
      const firestoreDocId = `${this.userId}_${vaultId}`;
      this.setSyncStatus('syncing');
      const remote = await window.cloudDb.loadFromFirestore(firestoreDocId);
      if (remote && Array.isArray(remote.components)) {
        const localTime = this._lastSavedAt ? new Date(this._lastSavedAt).getTime() : 0;
        const remoteTime = remote.savedAt ? new Date(remote.savedAt).getTime() : 0;

        // If local has newer unsaved changes and not forced, do not overwrite local components
        if (!force && localTime > remoteTime) {
          console.log('[Store] Local state is newer than remote during pull. Preserving local.');
          this.syncToCloudNow();
          return true;
        }

        // Always merge to ensure locally added components not in remote are preserved
        const merged = this.mergeComponentsWithRemote(this.components, remote.components);
        const localJson = JSON.stringify(this.components);
        const remoteJson = JSON.stringify(merged);
        const localLogJson = JSON.stringify(this.activityLog);
        const remoteLogJson = JSON.stringify(remote.activityLog || []);

        if (force || localJson !== remoteJson || localLogJson !== remoteLogJson) {
          console.log('[Store] Cloud vault has updates, updating local state...');
          this.components = merged;
          this.activityLog = remote.activityLog || [];
          this._lastSavedAt = remote.savedAt || new Date().toISOString();
          localStorage.setItem(this.getStorageKey(), JSON.stringify({
            components: this.components,
            activityLog: this.activityLog,
            savedAt: this._lastSavedAt
          }));
          this.notify();
        }
        this.setSyncStatus('synced');
        return true;
      } else {
        this.setSyncStatus('synced');
        return false;
      }
    } catch (err) {
      console.warn('Cloud pull error:', err);
      this.setSyncStatus('error', err.message);
      return false;
    }
  }

  init() {
    try {
      const key = this.getStorageKey();
      let raw = localStorage.getItem(key);

      // Automatic Migration Check 1: If vault-default has no data, check legacy unsegmented user key
      if (!raw && this.getActiveVaultId() === 'vault-default') {
        raw = localStorage.getItem(`CV_VAULT_DATA_${this.userId}`);
        if (raw) {
          // Copy migrated data into the partitioned default vault
          localStorage.setItem(key, raw);
        }
      }

      // Automatic Migration Check 2: Unpartitioned legacy root key for owner
      if (!raw && this.userId === 'user-owner') {
        raw = localStorage.getItem('COMPONENT_VAULT_DATA_V1');
        if (raw) {
          localStorage.setItem(key, raw);
        }
      }

      if (raw) {
        const parsed = JSON.parse(raw);
        this.components = parsed.components || [];
        this.activityLog = parsed.activityLog || [];
        this._lastSavedAt = parsed.savedAt || null;
      } else {
        this.resetToDefaults(false);
      }

      // Auto-sync retry when coming back online
      if (typeof window !== 'undefined' && !this._onlineListenerAttached) {
        this._onlineListenerAttached = true;
        window.addEventListener('online', () => {
          console.log('[Store] Internet connection restored, syncing with Firestore...');
          this.syncToCloudNow();
          this.pullActiveVaultFromCloud();
        });
      }

      // Auto-refresh from cloud when tab becomes visible or focused
      if (typeof window !== 'undefined' && !this._visibilityListenerAttached) {
        this._visibilityListenerAttached = true;
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            this.pullActiveVaultFromCloud();
          }
        });
        window.addEventListener('focus', () => {
          this.pullActiveVaultFromCloud();
        });
      }
    } catch (e) {
      console.warn('Failed to load from localStorage, using default data:', e);
      this.resetToDefaults(false);
    }
  }

  setSyncStatus(status, errorMsg = '') {
    this.syncStatus = status;
    this.syncError = errorMsg;
    if (typeof this.onSyncStatusChange === 'function') {
      try {
        this.onSyncStatusChange(status, errorMsg);
      } catch (err) {
        console.error('Error in sync status listener:', err);
      }
    }
  }

  async syncToCloudNow() {
    this.setSyncStatus('syncing');
    try {
      const vaultId = this.getActiveVaultId();
      const firestoreDocId = `${this.userId}_${vaultId}`;
      const payload = {
        components: this.components,
        activityLog: this.activityLog,
        savedAt: new Date().toISOString()
      };
      this._lastSavedAt = payload.savedAt;
      if (window.cloudDb && typeof window.cloudDb.saveToFirestore === 'function') {
        const ok = await window.cloudDb.saveToFirestore(firestoreDocId, payload);
        if (ok) {
          this.setSyncStatus('synced');
          return true;
        } else {
          this.setSyncStatus('error', 'Cloud sync failed. Verify you are signed in with an authorized Google account.');
          return false;
        }
      } else {
        this.setSyncStatus('offline', 'Cloud database service not configured.');
        return false;
      }
    } catch (err) {
      this.setSyncStatus('error', err.message);
      return false;
    }
  }

  save() {
    try {
      const payload = {
        components: this.components,
        activityLog: this.activityLog,
        savedAt: new Date().toISOString()
      };
      this._lastSavedAt = payload.savedAt;
      localStorage.setItem(this.getStorageKey(), JSON.stringify(payload));

      // Asynchronously mirror this vault to Cloud Firestore if connected and authenticated
      const vaultId = this.getActiveVaultId();
      const firestoreDocId = `${this.userId}_${vaultId}`;
      const isCloudAuth = window.cloudDb && window.cloudDb.auth && window.cloudDb.auth.currentUser;

      if (isCloudAuth && typeof window.cloudDb.saveToFirestore === 'function') {
        this.setSyncStatus('syncing');
        window.cloudDb.saveToFirestore(firestoreDocId, payload).then(ok => {
          if (ok) {
            this.setSyncStatus('synced');
          } else {
            this.setSyncStatus('error', 'Cloud sync failed. Verify permissions or document size.');
          }
        }).catch(err => {
          console.warn('Cloud sync background warning:', err);
          this.setSyncStatus('error', err.message);
        });
      } else {
        this.setSyncStatus('offline', 'Saved to local browser storage.');
      }
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
    this.broadcastUpdate();
    this.notify();
  }

  resetToDefaults(notify = true) {
    this.components = JSON.parse(JSON.stringify(DEFAULT_COMPONENTS));
    this.activityLog = JSON.parse(JSON.stringify(DEFAULT_ACTIVITY));
    if (notify) {
      this.save();
    }
  }

  subscribe(listener) {
    this.subscribers.push(listener);
    return () => {
      this.subscribers = this.subscribers.filter(l => l !== listener);
    };
  }

  notify() {
    this.subscribers.forEach(cb => {
      try {
        cb();
      } catch (err) {
        console.error('Error in store subscriber:', err);
      }
    });
  }

  // Helper to compute active loan metrics for an item
  computeItemMetrics(item) {
    const today = new Date().toISOString().split('T')[0];
    const activeLoans = (item.loans || []).filter(l => l.status === 'active');
    const lentQty = activeLoans.reduce((sum, l) => sum + (Number(l.quantity) || 1), 0);
    const totalQty = Math.max(0, Number(item.totalQty) || 0);
    const deadQty = Math.max(0, Math.min(Number(item.deadQty) || 0, totalQty));
    const availableQty = Math.max(0, totalQty - lentQty - deadQty);
    const hasOverdue = activeLoans.some(l => l.returnDueDate && l.returnDueDate < today);

    let stockStatus = 'available'; // all units available
    if (availableQty === 0 && totalQty > 0) {
      stockStatus = 'depleted'; // 0 available
    } else if (lentQty > 0 || deadQty > 0) {
      stockStatus = 'partial'; // partially lent or damaged
    }

    return {
      ...item,
      activeLoans,
      lentQty,
      deadQty,
      availableQty,
      stockStatus,
      hasOverdue
    };
  }

  getComponents() {
    return this.components.map(item => this.computeItemMetrics(item));
  }

  getComponentById(id) {
    const item = this.components.find(c => c.id === id);
    return item ? this.computeItemMetrics(item) : null;
  }

  addComponent(data) {
    const id = 'comp-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const totalQty = Math.max(1, parseInt(data.totalQty, 10) || 1);
    const deadQty = Math.max(0, Math.min(totalQty, parseInt(data.deadQty, 10) || 0));

    const newComponent = {
      id,
      name: data.name.trim(),
      sku: (data.sku || '').trim() || ('SKU-' + Math.floor(1000 + Math.random() * 9000)),
      category: data.category || 'General',
      locationBin: (data.locationBin || 'UNASSIGNED').trim().toUpperCase(),
      totalQty,
      deadQty,
      specs: (data.specs || '').trim(),
      tags: Array.isArray(data.tags) ? data.tags : (data.tags || '').split(',').map(t => t.trim()).filter(Boolean),
      image: data.image || '',
      createdAt: new Date().toISOString(),
      loans: []
    };

    this.components.unshift(newComponent);
    this.logActivity({
      type: 'created',
      componentName: newComponent.name,
      recipientName: null,
      quantity: newComponent.totalQty,
      project: 'Added to inventory'
    });

    this.save();
    return this.computeItemMetrics(newComponent);
  }

  updateComponent(id, data) {
    const idx = this.components.findIndex(c => c.id === id);
    if (idx === -1) return null;

    const existing = this.components[idx];
    const updatedTotalQty = data.totalQty !== undefined ? Math.max(1, parseInt(data.totalQty, 10) || 1) : existing.totalQty;
    const updatedDeadQty = data.deadQty !== undefined 
      ? Math.max(0, Math.min(updatedTotalQty, parseInt(data.deadQty, 10) || 0)) 
      : Math.min(updatedTotalQty, existing.deadQty || 0);

    this.components[idx] = {
      ...existing,
      name: data.name !== undefined ? data.name.trim() : existing.name,
      sku: data.sku !== undefined ? data.sku.trim() : existing.sku,
      category: data.category !== undefined ? data.category : existing.category,
      locationBin: data.locationBin !== undefined ? data.locationBin.trim().toUpperCase() : existing.locationBin,
      totalQty: updatedTotalQty,
      deadQty: updatedDeadQty,
      specs: data.specs !== undefined ? data.specs.trim() : existing.specs,
      tags: data.tags !== undefined ? (Array.isArray(data.tags) ? data.tags : data.tags.split(',').map(t => t.trim()).filter(Boolean)) : existing.tags,
      image: data.image !== undefined ? data.image : existing.image,
      updatedAt: new Date().toISOString()
    };

    this.save();
    return this.components[idx];
  }

  deleteComponent(id) {
    const item = this.components.find(c => c.id === id);
    if (!item) return false;

    if (!this.deletedComponentIds) {
      this.deletedComponentIds = new Set();
    }
    this.deletedComponentIds.add(id);

    this.components = this.components.filter(c => c.id !== id);
    this.logActivity({
      type: 'deleted',
      componentName: item.name,
      recipientName: null,
      quantity: item.totalQty,
      project: 'Removed from inventory'
    });

    this.save();
    return true;
  }

  lendComponent(componentId, loanData) {
    const item = this.components.find(c => c.id === componentId);
    if (!item) throw new Error('Component not found');

    const metrics = this.computeItemMetrics(item);
    const lendQty = Math.max(1, parseInt(loanData.quantity, 10) || 1);

    if (lendQty > metrics.availableQty) {
      throw new Error(`Cannot lend ${lendQty} units. Only ${metrics.availableQty} available in stock.`);
    }

    // Borrower name is optional: defaults to "Self (In-house)" if omitted
    const recipient = (loanData.recipientName || '').trim() || 'Self (In-house)';

    const loanId = 'loan-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const newLoan = {
      id: loanId,
      recipientName: recipient,
      recipientContact: (loanData.recipientContact || '').trim(),
      quantity: lendQty,
      dateGiven: loanData.dateGiven || new Date().toISOString().split('T')[0],
      returnDueDate: (loanData.returnDueDate || '').trim(), // Optional: empty means ongoing/permanent
      project: (loanData.project || '').trim() || 'General Usage',
      notes: (loanData.notes || '').trim(),
      status: 'active'
    };

    if (!item.loans) item.loans = [];
    item.loans.push(newLoan);

    this.logActivity({
      type: 'loan',
      componentName: item.name,
      recipientName: newLoan.recipientName,
      quantity: lendQty,
      project: newLoan.project
    });

    this.save();
    return newLoan;
  }

  returnLoan(componentId, loanId) {
    const item = this.components.find(c => c.id === componentId);
    if (!item || !item.loans) return false;

    const loan = item.loans.find(l => l.id === loanId);
    if (!loan) return false;

    loan.status = 'returned';
    loan.returnedAt = new Date().toISOString();

    this.logActivity({
      type: 'return',
      componentName: item.name,
      recipientName: loan.recipientName,
      quantity: loan.quantity,
      project: loan.project
    });

    this.save();
    return true;
  }

  logActivity(entry) {
    const newEntry = {
      id: 'act-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      ...entry
    };
    this.activityLog.unshift(newEntry);
    if (this.activityLog.length > 100) {
      this.activityLog = this.activityLog.slice(0, 100);
    }
  }

  // Get all active loans across all components
  getAllActiveLoans() {
    const results = [];
    const today = new Date().toISOString().split('T')[0];

    this.components.forEach(item => {
      if (!item.loans) return;
      item.loans.forEach(loan => {
        if (loan.status === 'active') {
          const isOverdue = !!(loan.returnDueDate && loan.returnDueDate < today);
          results.push({
            ...loan,
            isOverdue,
            componentId: item.id,
            componentName: item.name,
            componentSku: item.sku,
            componentImage: item.image,
            locationBin: item.locationBin
          });
        }
      });
    });

    return results;
  }

  // Group active loans by borrower
  getBorrowersLedger() {
    const loans = this.getAllActiveLoans();
    const map = new Map();

    loans.forEach(loan => {
      const key = loan.recipientName.toLowerCase().trim();
      if (!map.has(key)) {
        map.set(key, {
          name: loan.recipientName,
          contact: loan.recipientContact || 'No contact provided',
          items: [],
          totalBorrowedQty: 0,
          hasOverdue: false
        });
      }
      const record = map.get(key);
      record.items.push(loan);
      record.totalBorrowedQty += loan.quantity;
      if (loan.isOverdue) {
        record.hasOverdue = true;
      }
      if (!record.contact && loan.recipientContact) {
        record.contact = loan.recipientContact;
      }
    });

    return Array.from(map.values()).sort((a, b) => b.totalBorrowedQty - a.totalBorrowedQty);
  }

  // Group active loans by project
  getProjectsLedger() {
    const loans = this.getAllActiveLoans();
    const map = new Map();

    loans.forEach(loan => {
      const projectName = (loan.project || 'General Usage').trim();
      const key = projectName.toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          name: projectName,
          borrowers: new Set(),
          items: [],
          totalAllocatedUnits: 0,
          hasOverdue: false
        });
      }
      const record = map.get(key);
      record.borrowers.add(loan.recipientName);
      record.items.push(loan);
      record.totalAllocatedUnits += loan.quantity;
      if (loan.isOverdue) {
        record.hasOverdue = true;
      }
    });

    return Array.from(map.values()).map(p => ({
      ...p,
      borrowersList: Array.from(p.borrowers).sort()
    })).sort((a, b) => b.totalAllocatedUnits - a.totalAllocatedUnits);
  }

  getProjectsList() {
    const set = new Set();
    this.components.forEach(c => {
      (c.loans || []).forEach(l => {
        if (l.project && l.project.trim()) {
          set.add(l.project.trim());
        }
      });
    });
    return Array.from(set).sort();
  }

  getOverallStats() {
    const components = this.getComponents();
    let totalItems = components.length;
    let totalUnits = 0;
    let availableUnits = 0;
    let lentUnits = 0;
    let deadUnits = 0;
    let overdueCount = 0;

    components.forEach(c => {
      totalUnits += c.totalQty;
      availableUnits += c.availableQty;
      lentUnits += c.lentQty;
      deadUnits += (c.deadQty || 0);
      if (c.hasOverdue) overdueCount++;
    });

    const activeBorrowersCount = this.getBorrowersLedger().length;

    return {
      totalItems,
      totalUnits,
      availableUnits,
      lentUnits,
      deadUnits,
      activeBorrowersCount,
      overdueCount
    };
  }

  getCategories() {
    const set = new Set();
    this.components.forEach(c => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set).sort();
  }

  exportData() {
    return JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      components: this.components,
      activityLog: this.activityLog
    }, null, 2);
  }

  sanitizeComponent(c, index = 0) {
    if (!c || typeof c !== 'object') return null;
    const cleanId = typeof c.id === 'string' && /^[a-zA-Z0-9_-]{1,64}$/.test(c.id) 
      ? c.id 
      : 'comp-' + Date.now().toString(36) + index;
    const cleanName = typeof c.name === 'string' ? c.name.trim().slice(0, 120) : '';
    if (!cleanName) return null;

    const cleanSku = typeof c.sku === 'string' ? c.sku.trim().slice(0, 60) : '';
    const cleanCategory = typeof c.category === 'string' ? c.category.trim().slice(0, 60) : 'General';
    const cleanBin = typeof c.locationBin === 'string' ? c.locationBin.trim().toUpperCase().slice(0, 40) : 'UNASSIGNED';
    const cleanTotalQty = Math.max(1, Math.min(1000000, parseInt(c.totalQty, 10) || 1));
    const cleanDeadQty = Math.max(0, Math.min(cleanTotalQty, parseInt(c.deadQty, 10) || 0));
    const cleanSpecs = typeof c.specs === 'string' ? c.specs.trim().slice(0, 1000) : '';
    
    let cleanImage = '';
    if (typeof c.image === 'string') {
      const trimmed = c.image.trim();
      if (/^https?:\/\//i.test(trimmed) || 
          /^data:image\/(png|jpeg|jpg|webp|gif);base64,/i.test(trimmed) || 
          (trimmed.startsWith('data:image/svg+xml') && !trimmed.toLowerCase().includes('<script') && !trimmed.toLowerCase().includes('javascript:') && !trimmed.toLowerCase().includes('onload'))) {
        cleanImage = trimmed.slice(0, 500000); // 500KB cap per image
      }
    }

    const cleanLoans = [];
    if (Array.isArray(c.loans)) {
      c.loans.forEach((l, lIdx) => {
        if (!l || typeof l !== 'object') return;
        cleanLoans.push({
          id: typeof l.id === 'string' ? l.id.slice(0, 64) : 'loan-' + Date.now().toString(36) + lIdx,
          recipientName: typeof l.recipientName === 'string' ? l.recipientName.trim().slice(0, 80) : 'Self',
          recipientContact: typeof l.recipientContact === 'string' ? l.recipientContact.trim().slice(0, 80) : '',
          quantity: Math.max(1, Math.min(cleanTotalQty, parseInt(l.quantity, 10) || 1)),
          dateGiven: typeof l.dateGiven === 'string' ? l.dateGiven.slice(0, 20) : new Date().toISOString().split('T')[0],
          returnDueDate: typeof l.returnDueDate === 'string' ? l.returnDueDate.slice(0, 20) : '',
          project: typeof l.project === 'string' ? l.project.trim().slice(0, 80) : 'General',
          notes: typeof l.notes === 'string' ? l.notes.trim().slice(0, 500) : '',
          status: l.status === 'returned' ? 'returned' : 'active'
        });
      });
    }

    return {
      id: cleanId,
      name: cleanName,
      sku: cleanSku,
      category: cleanCategory,
      locationBin: cleanBin,
      totalQty: cleanTotalQty,
      deadQty: cleanDeadQty,
      specs: cleanSpecs,
      image: cleanImage,
      loans: cleanLoans,
      createdAt: typeof c.createdAt === 'string' ? c.createdAt.slice(0, 30) : new Date().toISOString(),
      updatedAt: typeof c.updatedAt === 'string' ? c.updatedAt.slice(0, 30) : new Date().toISOString()
    };
  }

  importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (!Array.isArray(data.components)) {
        throw new Error('Invalid backup file: "components" list missing.');
      }
      const sanitized = data.components
        .map((c, i) => this.sanitizeComponent(c, i))
        .filter(Boolean);
      if (sanitized.length === 0 && data.components.length > 0) {
        throw new Error('No valid component entries found in backup file.');
      }
      this.components = sanitized;
      this.activityLog = Array.isArray(data.activityLog) 
        ? data.activityLog.slice(0, 200).filter(e => e && typeof e === 'object') 
        : [];
      this.save();
      return true;
    } catch (err) {
      throw new Error('Failed to import backup: ' + err.message);
    }
  }
}

window.componentStore = new ComponentStore();
