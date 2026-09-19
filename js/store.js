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
    this.setupCrossTabSync();
    this.init();
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

    // Pull cloud data for this switched vault
    await this.pullActiveVaultFromCloud();
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

    return newVault;
  }

  deleteVault(vaultId) {
    const vaults = this.getUserVaults();
    if (vaults.length <= 1) {
      throw new Error('Cannot delete the only vault in your account.');
    }

    const filtered = vaults.filter(v => v.id !== vaultId);
    this.saveUserVaults(filtered);
    localStorage.removeItem(`CV_VAULT_DATA_${this.userId}_${vaultId}`);

    if (this.getActiveVaultId() === vaultId) {
      localStorage.setItem(this.getActiveVaultKey(), filtered[0].id);
      this.init();
      this.notify();
    }
    this.broadcastUpdate();
    return true;
  }

  async setVaultUser(userId) {
    if (!userId) return;
    this.userId = userId;

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
    this.notify();
    await this.pullActiveVaultFromCloud(true);
  }

  async pullActiveVaultFromCloud(force = false) {
    if (window.cloudDb && typeof window.cloudDb.loadFromFirestore === 'function') {
      try {
        const vaultId = this.getActiveVaultId();
        const firestoreDocId = `${this.userId}_${vaultId}`;
        this.setSyncStatus('syncing');
        const remote = await window.cloudDb.loadFromFirestore(firestoreDocId);
        if (remote && Array.isArray(remote.components) && remote.components.length > 0) {
          const localRaw = localStorage.getItem(this.getStorageKey());
          let shouldUpdate = force || !localRaw;

          if (localRaw && !shouldUpdate) {
            try {
              const localParsed = JSON.parse(localRaw);
              const localComps = localParsed.components || [];
              const localSavedAt = localParsed.savedAt || '';
              const remoteSavedAt = remote.savedAt || '';
              const starterIds = ['comp-rpi5-8gb', 'comp-esp32-wroom', 'comp-uno-r3', 'comp-hcsr04'];
              const isLocalStarter = localComps.length <= 4 && localComps.every(c => starterIds.includes(c.id));

              if (isLocalStarter || localComps.length === 0 || remoteSavedAt >= localSavedAt || remote.components.length > localComps.length) {
                shouldUpdate = true;
              }
            } catch (e) {
              shouldUpdate = true;
            }
          }

          if (shouldUpdate) {
            this.components = remote.components;
            this.activityLog = remote.activityLog || [];
            localStorage.setItem(this.getStorageKey(), JSON.stringify({
              components: this.components,
              activityLog: this.activityLog,
              savedAt: remote.savedAt || new Date().toISOString()
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
    return false;
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
      } else {
        this.resetToDefaults(false);
      }

      // Auto-sync retry when coming back online
      if (typeof window !== 'undefined' && !this._onlineListenerAttached) {
        this._onlineListenerAttached = true;
        window.addEventListener('online', () => {
          console.log('[Store] Internet connection restored, syncing with Firestore...');
          this.syncToCloudNow();
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
      localStorage.setItem(this.getStorageKey(), JSON.stringify(payload));

      // Asynchronously mirror this vault to Cloud Firestore if connected
      const vaultId = this.getActiveVaultId();
      const firestoreDocId = `${this.userId}_${vaultId}`;
      if (window.cloudDb && typeof window.cloudDb.saveToFirestore === 'function') {
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
    const availableQty = Math.max(0, totalQty - lentQty);
    const hasOverdue = activeLoans.some(l => l.returnDueDate && l.returnDueDate < today);

    let stockStatus = 'available'; // all units available
    if (availableQty === 0 && totalQty > 0) {
      stockStatus = 'depleted'; // 0 available
    } else if (lentQty > 0) {
      stockStatus = 'partial'; // partially lent
    }

    return {
      ...item,
      activeLoans,
      lentQty,
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
    const newComponent = {
      id,
      name: data.name.trim(),
      sku: (data.sku || '').trim() || ('SKU-' + Math.floor(1000 + Math.random() * 9000)),
      category: data.category || 'General',
      locationBin: (data.locationBin || 'UNASSIGNED').trim().toUpperCase(),
      totalQty: Math.max(1, parseInt(data.totalQty, 10) || 1),
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
    return newComponent;
  }

  updateComponent(id, data) {
    const idx = this.components.findIndex(c => c.id === id);
    if (idx === -1) return null;

    const existing = this.components[idx];
    this.components[idx] = {
      ...existing,
      name: data.name !== undefined ? data.name.trim() : existing.name,
      sku: data.sku !== undefined ? data.sku.trim() : existing.sku,
      category: data.category !== undefined ? data.category : existing.category,
      locationBin: data.locationBin !== undefined ? data.locationBin.trim().toUpperCase() : existing.locationBin,
      totalQty: data.totalQty !== undefined ? Math.max(1, parseInt(data.totalQty, 10) || 1) : existing.totalQty,
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
    let overdueCount = 0;

    components.forEach(c => {
      totalUnits += c.totalQty;
      availableUnits += c.availableQty;
      lentUnits += c.lentQty;
      if (c.hasOverdue) overdueCount++;
    });

    const activeBorrowersCount = this.getBorrowersLedger().length;

    return {
      totalItems,
      totalUnits,
      availableUnits,
      lentUnits,
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

  importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (!Array.isArray(data.components)) {
        throw new Error('Invalid backup file: "components" list missing.');
      }
      this.components = data.components;
      this.activityLog = Array.isArray(data.activityLog) ? data.activityLog : [];
      this.save();
      return true;
    } catch (err) {
      throw new Error('Failed to import backup: ' + err.message);
    }
  }
}

window.componentStore = new ComponentStore();
