// Application Controller - Streamline Moderne Edition

(function () {
  'use strict';

  // --- State ---
  const state = {
    currentTab: 'inventory', // 'inventory' | 'borrowers' | 'activity'
    subviewMode: 'projects', // 'projects' | 'borrowers' (in Borrowers & Projects tab)
    viewMode: localStorage.getItem('CV_VIEW_MODE') || 'grid', // 'grid' | 'table'
    searchQuery: '',
    statusFilter: 'all', // 'all' | 'available' | 'lent' | 'depleted' | 'overdue'
    categoryFilter: 'all',
    projectFilter: 'all',
    sortBy: 'name_asc',
    theme: localStorage.getItem('CV_THEME') || 'dark',
    editingComponentId: null,
    pendingImageBase64: ''
  };

  // --- DOM Elements ---
  const el = {
    html: document.documentElement,
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    themeIconDark: document.getElementById('themeIconDark'),
    themeIconLight: document.getElementById('themeIconLight'),

    // Tabs
    tabInventory: document.getElementById('tabInventory'),
    tabBorrowers: document.getElementById('tabBorrowers'),
    tabActivity: document.getElementById('tabActivity'),
    tabCountComponents: document.getElementById('tabCountComponents'),
    tabCountLoans: document.getElementById('tabCountLoans'),

    // Views
    inventoryViewWrapper: document.getElementById('inventoryViewWrapper'),
    borrowersViewWrapper: document.getElementById('borrowersViewWrapper'),
    activityViewWrapper: document.getElementById('activityViewWrapper'),
    inventoryToolbar: document.getElementById('inventoryToolbar'),

    // Subview buttons for Projects vs Borrowers
    subviewProjectsBtn: document.getElementById('subviewProjectsBtn'),
    subviewBorrowersBtn: document.getElementById('subviewBorrowersBtn'),
    projectsGrid: document.getElementById('projectsGrid'),
    borrowersGrid: document.getElementById('borrowersGrid'),
    borrowersEmptyState: document.getElementById('borrowersEmptyState'),

    inventoryGrid: document.getElementById('inventoryGrid'),
    tableViewContainer: document.getElementById('tableViewContainer'),
    inventoryTableBody: document.getElementById('inventoryTableBody'),
    inventoryEmptyState: document.getElementById('inventoryEmptyState'),
    activityTimeline: document.getElementById('activityTimeline'),

    // Metrics
    statTotalItems: document.getElementById('statTotalItems'),
    statTotalUnits: document.getElementById('statTotalUnits'),
    statAvailableUnits: document.getElementById('statAvailableUnits'),
    statLentUnits: document.getElementById('statLentUnits'),
    statActiveBorrowers: document.getElementById('statActiveBorrowers'),
    statOverdueCount: document.getElementById('statOverdueCount'),

    // Filters
    searchInput: document.getElementById('searchInput'),
    searchClearBtn: document.getElementById('searchClearBtn'),
    filterToggleBtn: document.getElementById('filterToggleBtn'),
    filterPopover: document.getElementById('filterPopover'),
    filterActiveBadge: document.getElementById('filterActiveBadge'),
    filterResetInlineBtn: document.getElementById('filterResetInlineBtn'),
    filterApplyBtn: document.getElementById('filterApplyBtn'),
    filterStatus: document.getElementById('filterStatus'),
    filterCategory: document.getElementById('filterCategory'),
    filterProject: document.getElementById('filterProject'),
    sortSelect: document.getElementById('sortSelect'),
    viewGridBtn: document.getElementById('viewGridBtn'),
    viewTableBtn: document.getElementById('viewTableBtn'),
    resetFiltersBtn: document.getElementById('resetFiltersBtn'),

    // Modals
    openNewComponentBtn: document.getElementById('openNewComponentBtn'),
    componentModal: document.getElementById('componentModal'),
    compModalTitle: document.getElementById('compModalTitle'),
    componentForm: document.getElementById('componentForm'),
    editComponentId: document.getElementById('editComponentId'),
    compName: document.getElementById('compName'),
    compSku: document.getElementById('compSku'),
    compCategory: document.getElementById('compCategory'),
    compBin: document.getElementById('compBin'),
    compTotalQty: document.getElementById('compTotalQty'),
    compDeadQty: document.getElementById('compDeadQty'),
    compTags: document.getElementById('compTags'),
    compSpecs: document.getElementById('compSpecs'),
    categorySuggestions: document.getElementById('categorySuggestions'),
    editCustodySection: document.getElementById('editCustodySection'),
    editCustodySummaryList: document.getElementById('editCustodySummaryList'),
    modalLendDirectBtn: document.getElementById('modalLendDirectBtn'),

    // Image upload in form
    imageDropArea: document.getElementById('imageDropArea'),
    imageFileInput: document.getElementById('imageFileInput'),
    imageUrlInput: document.getElementById('imageUrlInput'),
    imagePlaceholder: document.getElementById('imagePlaceholder'),
    imagePreview: document.getElementById('imagePreview'),
    clearImageBtn: document.getElementById('clearImageBtn'),
    pasteImageBtn: document.getElementById('pasteImageBtn'),

    // Lend Modal
    lendModal: document.getElementById('lendModal'),
    lendForm: document.getElementById('lendForm'),
    lendComponentId: document.getElementById('lendComponentId'),
    lendTargetName: document.getElementById('lendTargetName'),
    lendTargetSku: document.getElementById('lendTargetSku'),
    lendTargetAvailableBadge: document.getElementById('lendTargetAvailableBadge'),
    lendRecipientName: document.getElementById('lendRecipientName'),
    lendRecipientContact: document.getElementById('lendRecipientContact'),
    lendQuantity: document.getElementById('lendQuantity'),
    lendDateGiven: document.getElementById('lendDateGiven'),
    lendReturnDueDate: document.getElementById('lendReturnDueDate'),
    lendProject: document.getElementById('lendProject'),
    projectDatalist: document.getElementById('projectDatalist'),
    lendNotes: document.getElementById('lendNotes'),

    // Lightbox
    lightboxModal: document.getElementById('lightboxModal'),
    lightboxImage: document.getElementById('lightboxImage'),
    lightboxCaption: document.getElementById('lightboxCaption'),

    // User Profile & Dropdown
    userProfileWrapper: document.getElementById('userProfileWrapper'),
    userProfileBtn: document.getElementById('userProfileBtn'),
    headerUserAvatar: document.getElementById('headerUserAvatar'),
    headerUserName: document.getElementById('headerUserName'),
    headerActiveVaultBadge: document.getElementById('headerActiveVaultBadge'),
    headerCloudSyncBadge: document.getElementById('headerCloudSyncBadge'),
    headerSyncDot: document.getElementById('headerSyncDot'),
    headerSyncText: document.getElementById('headerSyncText'),
    swUpdateBanner: document.getElementById('swUpdateBanner'),
    swUpdateReloadBtn: document.getElementById('swUpdateReloadBtn'),
    swUpdateDismissBtn: document.getElementById('swUpdateDismissBtn'),
    userDropdownMenu: document.getElementById('userDropdownMenu'),
    userMenuDisplayName: document.getElementById('userMenuDisplayName'),
    userMenuUsername: document.getElementById('userMenuUsername'),
    userVaultsList: document.getElementById('userVaultsList'),
    openNewVaultBtn: document.getElementById('openNewVaultBtn'),
    headerOpenCloudConfigBtn: document.getElementById('headerOpenCloudConfigBtn'),
    signOutBtn: document.getElementById('signOutBtn'),
    setSelfAssigneeBtn: document.getElementById('setSelfAssigneeBtn'),

    // Create New Vault Modal
    createVaultModal: document.getElementById('createVaultModal'),
    createVaultForm: document.getElementById('createVaultForm'),
    vaultNameInput: document.getElementById('vaultNameInput'),
    vaultTaglineInput: document.getElementById('vaultTaglineInput'),
    vaultIncludeStarter: document.getElementById('vaultIncludeStarter'),
    createVaultNotice: document.getElementById('createVaultNotice'),

    // Edit Vault Modal
    editVaultModal: document.getElementById('editVaultModal'),
    editVaultForm: document.getElementById('editVaultForm'),
    editVaultIdInput: document.getElementById('editVaultIdInput'),
    editVaultNameInput: document.getElementById('editVaultNameInput'),
    editVaultTaglineInput: document.getElementById('editVaultTaglineInput'),
    editVaultNotice: document.getElementById('editVaultNotice'),
    submitEditVaultBtn: document.getElementById('submitEditVaultBtn'),

    // App Shell & Strict Login Portal
    appShell: document.getElementById('appShell'),
    loginPortal: document.getElementById('loginPortal'),
    portalGoogleSignInBtn: document.getElementById('portalGoogleSignInBtn'),
    portalNoticeBanner: document.getElementById('portalNoticeBanner'),
    portalCloudStatus: document.getElementById('portalCloudStatus'),
    portalCloudStatusText: document.getElementById('portalCloudStatusText'),
    portalCloudDot: document.getElementById('portalCloudDot'),
    openCloudConfigBtn: document.getElementById('openCloudConfigBtn'),
    cloudConfigModal: document.getElementById('cloudConfigModal'),
    cloudConfigForm: document.getElementById('cloudConfigForm'),
    firebaseApiKey: document.getElementById('firebaseApiKey'),
    firebaseAuthDomain: document.getElementById('firebaseAuthDomain'),
    firebaseProjectId: document.getElementById('firebaseProjectId'),
    firebaseStorageBucket: document.getElementById('firebaseStorageBucket'),
    firebaseAppId: document.getElementById('firebaseAppId'),
    authorizedEmailsInput: document.getElementById('authorizedEmailsInput'),
    cloudConfigAlert: document.getElementById('cloudConfigAlert'),
    clearCloudConfigBtn: document.getElementById('clearCloudConfigBtn'),

    // Backup & Export
    openBackupBtn: document.getElementById('openBackupBtn'),
    backupModal: document.getElementById('backupModal'),
    downloadPdfExportBtn: document.getElementById('downloadPdfExportBtn'),
    printPdfReportBtn: document.getElementById('printPdfReportBtn'),
    downloadExportBtn: document.getElementById('downloadExportBtn'),
    triggerImportBtn: document.getElementById('triggerImportBtn'),
    importFileInput: document.getElementById('importFileInput'),
    resetDemoDataBtn: document.getElementById('resetDemoDataBtn'),

    // Top Search & Adjacent Add Component (Mobile & Top Bar)
    topSearchInput: document.getElementById('topSearchInput'),
    topSearchClearBtn: document.getElementById('topSearchClearBtn'),
    topAddCompBtn: document.getElementById('topAddCompBtn'),

    // Mobile Quick Menu (Account, Theme, Backup, Cloud)
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    mobileUserAvatar: document.getElementById('mobileUserAvatar'),
    mobileVaultMenu: document.getElementById('mobileVaultMenu'),
    mobileMenuBackdrop: document.getElementById('mobileMenuBackdrop'),
    mobileMenuCloseBtn: document.getElementById('mobileMenuCloseBtn'),
    mobileMenuAvatar: document.getElementById('mobileMenuAvatar'),
    mobileMenuDisplayName: document.getElementById('mobileMenuDisplayName'),
    mobileMenuUsername: document.getElementById('mobileMenuUsername'),
    mobileActiveVaultBadge: document.getElementById('mobileActiveVaultBadge'),
    mobileUserVaultsList: document.getElementById('mobileUserVaultsList'),
    mobileSwitchVaultBtn: document.getElementById('mobileSwitchVaultBtn'),
    mobileNewVaultBtn: document.getElementById('mobileNewVaultBtn'),
    mobileSignOutBtn: document.getElementById('mobileSignOutBtn'),
    mobileThemeToggleBtn: document.getElementById('mobileThemeToggleBtn'),
    mobileThemeIconDark: document.getElementById('mobileThemeIconDark'),
    mobileThemeIconLight: document.getElementById('mobileThemeIconLight'),
    mobileThemeCurrentMode: document.getElementById('mobileThemeCurrentMode'),
    mobileBackupBtn: document.getElementById('mobileBackupBtn'),
    mobileCloudConfigBtn: document.getElementById('mobileCloudConfigBtn'),
    mobileMenuCloudText: document.getElementById('mobileMenuCloudText'),
    mobileMenuCloudDot: document.getElementById('mobileMenuCloudDot')
  };

  // --- Theme Management ---
  function applyTheme(theme) {
    state.theme = theme;
    el.html.setAttribute('data-theme', theme);
    localStorage.setItem('CV_THEME', theme);
    const isLight = theme === 'light';
    const dynamicFavicon = document.getElementById('dynamicFavicon');
    if (dynamicFavicon) {
      dynamicFavicon.href = isLight ? 'assets/black-icon.svg' : 'assets/white-icon.svg';
    }
    if (el.themeIconDark && el.themeIconLight) {
      el.themeIconDark.style.display = isLight ? 'none' : 'block';
      el.themeIconLight.style.display = isLight ? 'block' : 'none';
    }
    if (el.mobileThemeIconDark && el.mobileThemeIconLight) {
      el.mobileThemeIconDark.style.display = isLight ? 'none' : 'block';
      el.mobileThemeIconLight.style.display = isLight ? 'block' : 'none';
    }
    if (el.mobileThemeCurrentMode) {
      el.mobileThemeCurrentMode.textContent = isLight ? 'Day Streamline Ivory' : 'Midnight Moderne Noir';
    }
  }

  function toggleTheme() {
    applyTheme(state.theme === 'dark' ? 'light' : 'dark');
  }

  // --- Accessibility, Focus Management & History Navigation ---
  let lastFocusedElement = null;

  function modalIdToHash(modalId) {
    const map = {
      componentModal: 'add-component',
      lendModal: 'lend-component',
      lightboxModal: 'lightbox',
      backupModal: 'backup',
      createVaultModal: 'create-vault',
      editVaultModal: 'edit-vault',
      cloudConfigModal: 'cloud-db',
      iosInstallModal: 'pwa-install',
      labFaqModal: 'faq'
    };
    return map[modalId] || modalId;
  }

  function tabToHash(tab) {
    const map = {
      inventory: 'inventory',
      borrowers: 'projects',
      activity: 'activity'
    };
    return map[tab] || tab;
  }

  function trapFocus(modal) {
    const focusable = modal.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    modal.onkeydown = function(e) {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    setTimeout(() => {
      const initialInput = modal.querySelector('input:not([type="hidden"]), select, textarea, button.btn-primary');
      if (initialInput && typeof initialInput.focus === 'function') {
        initialInput.focus();
      } else if (first && typeof first.focus === 'function') {
        first.focus();
      }
    }, 60);
  }

  // --- Modal Helpers with History Navigation ---
  function openModal(modal, pushHistory = true) {
    if (!modal) return;
    lastFocusedElement = document.activeElement;
    modal.classList.add('open');
    modal.style.display = 'flex';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    trapFocus(modal);

    if (pushHistory) {
      const hash = '#' + modalIdToHash(modal.id);
      if (history.state && history.state.type === 'menu') {
        history.replaceState({ type: 'modal', id: modal.id }, '', hash);
      } else {
        history.pushState({ type: 'modal', id: modal.id }, '', hash);
      }
    }
  }

  function closeModal(modal, shouldPopHistory = true) {
    if (!modal) return;
    const wasOpen = modal.classList.contains('open') || modal.style.display === 'flex';
    modal.classList.remove('open');
    modal.style.display = 'none';
    modal.onkeydown = null;

    if (!document.querySelector('.modal-backdrop.open') && (!el.mobileVaultMenu || el.mobileVaultMenu.style.display !== 'flex')) {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }

    if (modal === el.componentModal) {
      state.editingComponentId = null;
      if (el.editComponentId) el.editComponentId.value = '';
      if (el.saveComponentBtn) {
        el.saveComponentBtn.disabled = false;
        el.saveComponentBtn.textContent = 'Save Component';
      }
      if (el.imageDropArea) {
        el.imageDropArea.classList.remove('loading');
      }
    }

    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      try { lastFocusedElement.focus(); } catch (err) {}
      lastFocusedElement = null;
    }

    if (shouldPopHistory && wasOpen && history.state && history.state.type === 'modal' && history.state.id === modal.id) {
      history.back();
    }
  }

  function openMobileMenu(pushHistory = true) {
    if (!el.mobileVaultMenu) return;
    lastFocusedElement = document.activeElement;
    renderVaultDropdown();
    el.mobileVaultMenu.style.display = 'flex';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    if (pushHistory) {
      history.pushState({ type: 'menu' }, '', '#vault-menu');
    }
  }

  function closeMobileMenu(shouldPopHistory = true) {
    if (!el.mobileVaultMenu) return;
    const wasOpen = el.mobileVaultMenu.style.display === 'flex';
    el.mobileVaultMenu.style.display = 'none';

    if (!document.querySelector('.modal-backdrop.open')) {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }

    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      try { lastFocusedElement.focus(); } catch (err) {}
      lastFocusedElement = null;
    }

    if (shouldPopHistory && wasOpen && history.state && history.state.type === 'menu') {
      history.back();
    }
  }

  // --- Toast Notification System ---
  function showToast(message, type = 'info', duration = 3200) {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      container.setAttribute('role', 'region');
      container.setAttribute('aria-label', 'Notifications');
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');

    let iconSvg = '';
    if (type === 'error' || message.includes('⚠️') || message.includes('Error') || message.includes('Failed')) {
      iconSvg = `<svg class="toast-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    } else {
      iconSvg = `<svg class="toast-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    }

    toast.innerHTML = `
      ${iconSvg}
      <span class="toast-message">${escapeHTML(message)}</span>
      <button type="button" class="toast-close" aria-label="Dismiss notification">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    `;

    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) closeBtn.addEventListener('click', () => removeToast(toast));

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    const timer = setTimeout(() => {
      removeToast(toast);
    }, duration);

    function removeToast(targetEl) {
      clearTimeout(timer);
      targetEl.classList.remove('show');
      targetEl.classList.add('hide');
      setTimeout(() => {
        if (targetEl.parentNode) targetEl.parentNode.removeChild(targetEl);
      }, 300);
    }
  }

  function highlightComponent(id) {
    setTimeout(() => {
      const target = document.querySelector(`[data-component-id="${id}"]`);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.classList.add('highlight-pulse');
        setTimeout(() => target.classList.remove('highlight-pulse'), 2500);
      }
    }, 150);
  }

  function setupModalDismiss() {
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', e => {
        if (e.target === modal) closeModal(modal, true);
      });
    });

    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-close-modal');
        const modal = document.getElementById(targetId);
        if (modal) closeModal(modal, true);
      });
    });

    // Escape Key: Universally closes any active modal, mobile menu, user dropdown, or filter popover
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        // 1. Close any open modals
        const openModals = document.querySelectorAll('.modal-backdrop.open');
        if (openModals.length > 0) {
          e.preventDefault();
          openModals.forEach(m => closeModal(m, true));
          return;
        }

        // 2. Close mobile menu drawer
        if (el.mobileVaultMenu && el.mobileVaultMenu.style.display === 'flex') {
          e.preventDefault();
          closeMobileMenu(true);
          return;
        }

        // 3. Close user dropdown menu
        if (el.userDropdownMenu && el.userDropdownMenu.style.display === 'block') {
          e.preventDefault();
          closeUserMenu();
          return;
        }

        // 4. Close filter popover
        if (el.filterPopover && el.filterPopover.classList.contains('open')) {
          e.preventDefault();
          toggleFilterPopover(false);
          return;
        }

        // 5. Search input clear / blur
        if (document.activeElement === el.topSearchInput || document.activeElement === el.searchInput) {
          if (document.activeElement.value) {
            document.activeElement.value = '';
            state.searchQuery = '';
            renderCurrentView();
          } else {
            document.activeElement.blur();
          }
        }
      }
    });

    // Browser Back/Forward, Trackpad 2-finger Swipe & Mobile Back Navigation
    window.addEventListener('popstate', e => {
      // 1. If any modal is currently open, close it (prevents navigating away from the app!)
      const openModals = document.querySelectorAll('.modal-backdrop.open');
      if (openModals.length > 0) {
        openModals.forEach(m => closeModal(m, false));
        return;
      }

      // 2. If mobile menu drawer is open, close it
      if (el.mobileVaultMenu && el.mobileVaultMenu.style.display === 'flex') {
        closeMobileMenu(false);
        return;
      }

      // 3. If user dropdown menu is open, close it
      if (el.userDropdownMenu && el.userDropdownMenu.style.display === 'block') {
        closeUserMenu();
        return;
      }

      // 4. Handle forward modal navigation
      if (e.state && e.state.type === 'modal' && e.state.id) {
        const targetModal = document.getElementById(e.state.id);
        if (targetModal) {
          openModal(targetModal, false);
          return;
        }
      }

      // 5. Handle forward mobile menu navigation
      if (e.state && e.state.type === 'menu') {
        openMobileMenu(false);
        return;
      }

      // 6. Handle tab navigation (backward or forward)
      if (e.state && e.state.type === 'tab' && e.state.tab) {
        setTab(e.state.tab, false);
        return;
      }

      // 7. Fallback to hash
      const hash = window.location.hash.replace('#', '');
      if (hash === 'projects' || hash === 'borrowers') {
        setTab('borrowers', false);
      } else if (hash === 'activity' || hash === 'log') {
        setTab('activity', false);
      } else if (hash === 'inventory' || !hash) {
        setTab('inventory', false);
      }
    });
  }

  // --- View Mode & Navigation ---
  function setTab(tab, pushHistory = true) {
    state.currentTab = tab;
    el.tabInventory.classList.toggle('active', tab === 'inventory');
    el.tabBorrowers.classList.toggle('active', tab === 'borrowers');
    el.tabActivity.classList.toggle('active', tab === 'activity');

    el.tabInventory.setAttribute('aria-selected', tab === 'inventory');
    el.tabBorrowers.setAttribute('aria-selected', tab === 'borrowers');
    el.tabActivity.setAttribute('aria-selected', tab === 'activity');

    el.inventoryViewWrapper.style.display = tab === 'inventory' ? 'block' : 'none';
    el.inventoryToolbar.style.display = tab === 'inventory' ? 'flex' : 'none';
    el.borrowersViewWrapper.style.display = tab === 'borrowers' ? 'block' : 'none';
    el.activityViewWrapper.style.display = tab === 'activity' ? 'block' : 'none';

    renderCurrentView();

    if (pushHistory) {
      const hash = '#' + tabToHash(tab);
      if (window.location.hash !== hash) {
        history.pushState({ type: 'tab', tab: tab }, '', hash);
      }
    }
  }

  function setSubviewMode(mode) {
    state.subviewMode = mode;
    el.subviewProjectsBtn.classList.toggle('active', mode === 'projects');
    el.subviewBorrowersBtn.classList.toggle('active', mode === 'borrowers');

    if (mode === 'projects') {
      el.projectsGrid.style.display = 'grid';
      el.borrowersGrid.style.display = 'none';
    } else {
      el.projectsGrid.style.display = 'none';
      el.borrowersGrid.style.display = 'grid';
    }

    renderBorrowersAndProjects();
  }

  function setViewMode(mode) {
    state.viewMode = mode;
    localStorage.setItem('CV_VIEW_MODE', mode);
    el.viewGridBtn.classList.toggle('active', mode === 'grid');
    el.viewTableBtn.classList.toggle('active', mode === 'table');
    el.viewGridBtn.setAttribute('aria-checked', mode === 'grid');
    el.viewTableBtn.setAttribute('aria-checked', mode === 'table');

    if (mode === 'grid') {
      el.inventoryGrid.style.display = 'grid';
      el.tableViewContainer.style.display = 'none';
    } else {
      el.inventoryGrid.style.display = 'none';
      el.tableViewContainer.style.display = 'block';
    }

    renderInventory();
  }

  // --- Rendering Pipeline ---
  function renderAll() {
    renderMetrics();
    updateCategoryAndProjectFilters();
    renderCurrentView();
  }

  function renderMetrics() {
    const stats = window.componentStore.getOverallStats();
    const projects = window.componentStore.getProjectsLedger();
    
    el.statTotalItems.textContent = stats.totalItems;
    el.statTotalUnits.textContent = `${stats.totalUnits} units`;
    el.statAvailableUnits.textContent = stats.availableUnits;
    el.statLentUnits.textContent = stats.lentUnits;
    el.statActiveBorrowers.textContent = `across ${projects.length} project${projects.length === 1 ? '' : 's'}`;
    el.statOverdueCount.textContent = stats.overdueCount;

    el.tabCountComponents.textContent = stats.totalItems;
    el.tabCountLoans.textContent = projects.length;

    const overdueCard = document.getElementById('metricCardOverdue');
    if (overdueCard) {
      if (stats.overdueCount > 0) {
        overdueCard.style.borderColor = 'var(--accent-red-border)';
      } else {
        overdueCard.style.borderColor = 'var(--border-default)';
      }
    }
  }

  function updateCategoryAndProjectFilters() {
    const categories = window.componentStore.getCategories();
    const projects = window.componentStore.getProjectsList();

    // Category dropdown
    const currentCat = el.filterCategory.value;
    el.filterCategory.innerHTML = '<option value="all">All Categories</option>';
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      if (cat === currentCat) opt.selected = true;
      el.filterCategory.appendChild(opt);
    });

    // Category suggestions in modal
    el.categorySuggestions.innerHTML = '';
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      el.categorySuggestions.appendChild(opt);
    });

    // Project dropdown in toolbar
    const currentProj = el.filterProject.value;
    el.filterProject.innerHTML = '<option value="all">All Projects</option>';
    projects.forEach(proj => {
      const opt = document.createElement('option');
      opt.value = proj;
      opt.textContent = proj;
      if (proj === currentProj) opt.selected = true;
      el.filterProject.appendChild(opt);
    });

    // Project datalist in lend modal
    if (el.projectDatalist) {
      el.projectDatalist.innerHTML = '';
      projects.forEach(proj => {
        const opt = document.createElement('option');
        opt.value = proj;
        el.projectDatalist.appendChild(opt);
      });
    }
  }

  function renderCurrentView() {
    if (state.currentTab === 'inventory') {
      renderInventory();
    } else if (state.currentTab === 'borrowers') {
      renderBorrowersAndProjects();
    } else if (state.currentTab === 'activity') {
      renderActivityTimeline();
    }
  }

  // --- Filter & Sort Components ---
  function getFilteredComponents() {
    let items = window.componentStore.getComponents();
    const query = state.searchQuery.trim().toLowerCase();

    if (query) {
      items = items.filter(item => {
        const inName = item.name.toLowerCase().includes(query);
        const inSku = (item.sku || '').toLowerCase().includes(query);
        const inBin = (item.locationBin || '').toLowerCase().includes(query);
        const inCat = (item.category || '').toLowerCase().includes(query);
        const inSpecs = (item.specs || '').toLowerCase().includes(query);
        const tagsArr = Array.isArray(item.tags) ? item.tags : (typeof item.tags === 'string' ? item.tags.split(',').map(t => t.trim()).filter(Boolean) : []);
        const inTags = tagsArr.some(t => t.toLowerCase().includes(query));
        const inBorrowerOrProject = (item.activeLoans || []).some(l => 
          l.recipientName.toLowerCase().includes(query) || 
          (l.project && l.project.toLowerCase().includes(query))
        );
        return inName || inSku || inBin || inCat || inSpecs || inTags || inBorrowerOrProject;
      });
    }

    if (state.categoryFilter !== 'all') {
      items = items.filter(item => item.category === state.categoryFilter);
    }

    if (state.projectFilter !== 'all') {
      items = items.filter(item => 
        (item.activeLoans || []).some(l => l.project && l.project.trim() === state.projectFilter)
      );
    }

    if (state.statusFilter !== 'all') {
      if (state.statusFilter === 'available') {
        items = items.filter(item => item.availableQty > 0);
      } else if (state.statusFilter === 'lent') {
        items = items.filter(item => item.lentQty > 0);
      } else if (state.statusFilter === 'depleted') {
        items = items.filter(item => item.availableQty === 0);
      } else if (state.statusFilter === 'dead') {
        items = items.filter(item => (item.deadQty || 0) > 0);
      } else if (state.statusFilter === 'overdue') {
        items = items.filter(item => item.hasOverdue);
      }
    }

    // Sorting
    items.sort((a, b) => {
      if (state.sortBy === 'name_asc') return a.name.localeCompare(b.name);
      if (state.sortBy === 'qty_desc') return b.availableQty - a.availableQty;
      if (state.sortBy === 'qty_asc') return a.availableQty - b.availableQty;
      if (state.sortBy === 'lent_desc') return b.lentQty - a.lentQty;
      if (state.sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      return 0;
    });

    return items;
  }

  // --- Render Inventory Grid & Table ---
  function renderInventory() {
    const items = getFilteredComponents();

    if (items.length === 0) {
      el.inventoryGrid.innerHTML = '';
      el.inventoryTableBody.innerHTML = '';
      el.inventoryEmptyState.style.display = 'flex';
      el.inventoryGrid.style.display = 'none';
      el.tableViewContainer.style.display = 'none';
      return;
    }

    el.inventoryEmptyState.style.display = 'none';
    if (state.viewMode === 'grid') {
      el.inventoryGrid.style.display = 'grid';
      el.tableViewContainer.style.display = 'none';
      // Render ONLY Grid Cards - keeps DOM lean and fast on mobile
      el.inventoryGrid.innerHTML = items.map(item => createComponentCardHTML(item)).join('');
      el.inventoryTableBody.innerHTML = '';
    } else {
      el.inventoryGrid.style.display = 'none';
      el.tableViewContainer.style.display = 'block';
      // Render ONLY Table Rows
      el.inventoryTableBody.innerHTML = items.map(item => createComponentTableRowHTML(item)).join('');
      el.inventoryGrid.innerHTML = '';
    }
  }

  function getStockStatusBadge(item) {
    if (item.availableQty === 0) {
      const deadText = item.deadQty > 0 ? ` (${item.deadQty} Dead)` : '';
      return `<span class="badge badge-red" title="Depleted: 0 units available${deadText}"><span class="badge-dot"></span><span class="badge-desktop-label">Depleted (0 Stock${deadText})</span><span class="badge-mobile-label">0 Stock${deadText}</span></span>`;
    }
    if (item.lentQty > 0 || (item.deadQty && item.deadQty > 0)) {
      const details = [];
      if (item.lentQty > 0) details.push(`${item.lentQty} in Projects`);
      if (item.deadQty > 0) details.push(`${item.deadQty} Dead`);
      const detailsStr = details.length > 0 ? ` (${details.join(', ')})` : '';
      return `<span class="badge badge-brass" title="${item.availableQty} available${detailsStr}"><span class="badge-dot"></span><span class="badge-desktop-label">${item.availableQty} Available${detailsStr}</span><span class="badge-mobile-label">${item.availableQty} Avail</span></span>`;
    }
    return `<span class="badge badge-teal" title="${item.availableQty} units available (full stock)"><span class="badge-dot"></span><span class="badge-desktop-label">${item.availableQty} Available (Full)</span><span class="badge-mobile-label">${item.availableQty} Avail</span></span>`;
  }

  function createComponentCardHTML(item) {
    const availablePct = item.totalQty > 0 ? (item.availableQty / item.totalQty) * 100 : 0;
    const lentPct = item.totalQty > 0 ? (item.lentQty / item.totalQty) * 100 : 0;
    const deadPct = item.totalQty > 0 ? ((item.deadQty || 0) / item.totalQty) * 100 : 0;

    let borrowerChipsHTML = '';
    if (item.activeLoans && item.activeLoans.length > 0) {
      borrowerChipsHTML = item.activeLoans.map(loan => {
        const isOverdue = loan.returnDueDate && loan.returnDueDate < new Date().toISOString().split('T')[0];
        const chipClass = isOverdue ? 'borrower-chip badge-red with-project' : 'borrower-chip with-project';
        return `
          <span class="${chipClass}" title="Project: ${escapeHTML(loan.project || 'General')} | Given: ${loan.dateGiven}${loan.returnDueDate ? ' | Due: ' + loan.returnDueDate : ''}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <strong>${escapeHTML(loan.recipientName)}</strong>
            <span class="borrower-chip-qty">${loan.quantity}</span>
            <span class="borrower-chip-project">• ${escapeHTML(loan.project || 'General')}</span>
          </span>
        `;
      }).join('');
    } else {
      borrowerChipsHTML = '<span class="no-loans-hint">None • 100% in stock</span>';
    }

    const imgSource = sanitizeImageUrl(item.image);
    const safeImgAttr = escapeHTML(imgSource);

    return `
      <article class="component-card" data-component-id="${item.id}">
        <!-- Photo thumbnail -->
        <div class="card-media" data-action="lightbox" data-image="${encodeURI(imgSource)}" data-name="${escapeHTML(item.name)}" data-sku="${escapeHTML(item.sku || '')}">
          <img src="${safeImgAttr}" alt="${escapeHTML(item.name)}" loading="lazy" decoding="async" width="320" height="240">
          <div class="card-media-overlay">
            <span class="card-category-tag">${escapeHTML(item.category || 'General')}</span>
            <span class="card-bin-tag">${escapeHTML(item.locationBin || 'UNASSIGNED')}</span>
          </div>
        </div>

        <div class="card-body">
          <div class="card-header-row">
            <div>
              <h3 class="card-title">${escapeHTML(item.name)}</h3>
              <div class="card-sku">${escapeHTML(item.sku || 'NO-SKU')}</div>
            </div>
            ${item.hasOverdue ? '<span class="badge badge-red" title="An assigned unit is past due date!">OVERDUE</span>' : ''}
          </div>

          ${item.specs ? `<p class="card-desc">${escapeHTML(item.specs)}</p>` : ''}

          <!-- Stock Meter -->
          <div class="stock-meter-container">
            <div class="stock-meter-header">
              <span class="stock-count-label">Stock Availability</span>
              <span class="stock-ratio">${item.availableQty} / ${item.totalQty} Units In Stock${item.deadQty > 0 ? `<span class="stock-dead-pill" title="${item.deadQty} dead / defective units">${item.deadQty} Dead</span>` : ''}</span>
            </div>
            <div class="stock-bar-track">
              <div class="stock-bar-fill-available" style="width: ${availablePct}%" title="${item.availableQty} available"></div>
              <div class="stock-bar-fill-lent" style="width: ${lentPct}%" title="${item.lentQty} in projects"></div>
              <div class="stock-bar-fill-dead" style="width: ${deadPct}%" title="${item.deadQty || 0} dead / defective"></div>
            </div>
          </div>

          <!-- Active Projects & Borrowers -->
          <div class="card-loans-section">
            <span class="loans-section-title">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              Assigned to Projects &amp; People:
            </span>
            <div class="borrower-chips-list">
              ${borrowerChipsHTML}
            </div>
          </div>

          <!-- Actions Footer -->
          <div class="card-actions">
            <button class="btn btn-primary btn-sm" data-action="lend" data-id="${item.id}" ${item.availableQty === 0 ? 'disabled' : ''}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
              Assign to Project
            </button>

            <div class="card-action-group">
              <button class="btn btn-outline btn-sm btn-icon" data-action="edit" data-id="${item.id}" title="Edit Component" aria-label="Edit ${escapeHTML(item.name)}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button class="btn btn-outline btn-sm btn-icon" data-action="delete" data-id="${item.id}" title="Delete Component" aria-label="Delete ${escapeHTML(item.name)}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>

        </div>
      </article>
    `;
  }

  function createComponentTableRowHTML(item) {
    const imgSource = sanitizeImageUrl(item.image);
    const safeImgAttr = escapeHTML(imgSource);
    
    let projectsSummary = '';
    if (item.activeLoans && item.activeLoans.length > 0) {
      projectsSummary = item.activeLoans.map(l => 
        `<strong>${escapeHTML(l.project || 'General')}</strong> (${escapeHTML(l.recipientName)} × ${l.quantity})`
      ).join(', ');
    } else {
      projectsSummary = '<span style="color: var(--text-muted); font-style: italic;">None (In Stock)</span>';
    }

    return `
      <tr data-component-id="${item.id}">
        <td class="col-photo">
          <div class="table-thumb" data-action="lightbox" data-image="${encodeURI(imgSource)}" data-name="${escapeHTML(item.name)}" data-sku="${escapeHTML(item.sku || '')}">
            <img src="${safeImgAttr}" alt="${escapeHTML(item.name)}" loading="lazy" decoding="async" width="48" height="48">
          </div>
        </td>
        <td class="col-name">
          <div class="table-name-title">${escapeHTML(item.name)}</div>
          <div class="table-name-sku">
            <span>${escapeHTML(item.sku || 'NO-SKU')}</span>
            <span class="table-mobile-cat-tag">${escapeHTML(item.category || 'General')}</span>
          </div>
        </td>
        <td class="col-category"><span class="badge badge-subtle">${escapeHTML(item.category || 'General')}</span></td>
        <td class="col-bin"><span class="badge badge-brass">${escapeHTML(item.locationBin || 'UNASSIGNED')}</span></td>
        <td class="col-total"><span style="font-family: var(--font-mono); font-weight: 600;">${item.totalQty}</span></td>
        <td class="col-available">${getStockStatusBadge(item)}</td>
        <td class="col-projects"><div class="table-projects-wrap" title="${escapeHTML(projectsSummary.replace(/<[^>]*>/g, ''))}">${projectsSummary}</div></td>
        <td class="col-actions" style="text-align: right;">
          <div class="table-actions-group">
            <button class="btn btn-primary btn-sm btn-action-assign" data-action="lend" data-id="${item.id}" ${item.availableQty === 0 ? 'disabled' : ''} title="Assign component" aria-label="Assign">
              <span class="btn-text-full">Assign</span>
              <span class="btn-text-short">Lend</span>
            </button>
            <button class="btn btn-outline btn-sm btn-icon" data-action="edit" data-id="${item.id}" title="Edit" aria-label="Edit ${escapeHTML(item.name)}">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="btn btn-outline btn-sm btn-icon" data-action="delete" data-id="${item.id}" title="Delete" aria-label="Delete ${escapeHTML(item.name)}">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  // Delegated event listener for inventory actions (replaces 200+ per-element listeners)
  function setupDelegatedInventoryListeners() {
    if (!el.inventoryViewWrapper) return;
    el.inventoryViewWrapper.addEventListener('click', (e) => {
      // 1. Lightbox trigger
      const lightboxTrigger = e.target.closest('[data-action="lightbox"]');
      if (lightboxTrigger) {
        const src = decodeURI(lightboxTrigger.getAttribute('data-image'));
        const name = lightboxTrigger.getAttribute('data-name');
        const sku = lightboxTrigger.getAttribute('data-sku');
        openLightbox(src, `${name} (${sku})`);
        return;
      }

      // 2. Lend trigger
      const lendBtn = e.target.closest('[data-action="lend"]');
      if (lendBtn) {
        e.stopPropagation();
        const id = lendBtn.getAttribute('data-id');
        openLendModal(id);
        return;
      }

      // 3. Edit trigger
      const editBtn = e.target.closest('[data-action="edit"]');
      if (editBtn) {
        e.stopPropagation();
        const id = editBtn.getAttribute('data-id');
        openEditComponentModal(id);
        return;
      }

      // 4. Delete trigger
      const deleteBtn = e.target.closest('[data-action="delete"]');
      if (deleteBtn) {
        e.stopPropagation();
        const id = deleteBtn.getAttribute('data-id');
        const item = window.componentStore.getComponentById(id);
        if (!item) return;

        let warning = `Are you sure you want to delete "${item.name}"?`;
        if (item.lentQty > 0) {
          warning += `\n\nWARNING: ${item.lentQty} unit(s) are currently assigned to active projects!`;
        }

        if (confirm(warning)) {
          window.componentStore.deleteComponent(id);
          renderAll();
          showToast(`Deleted "${item.name}" from inventory.`);
        }
        return;
      }
    });
  }

  // --- Render Borrowers & Projects Section ---
  function renderBorrowersAndProjects() {
    const projects = window.componentStore.getProjectsLedger();
    const borrowers = window.componentStore.getBorrowersLedger();

    if (projects.length === 0 && borrowers.length === 0) {
      el.projectsGrid.innerHTML = '';
      el.borrowersGrid.innerHTML = '';
      el.borrowersEmptyState.style.display = 'flex';
      return;
    }

    el.borrowersEmptyState.style.display = 'none';

    // 1. Render Projects Grid
    el.projectsGrid.innerHTML = projects.map(proj => {
      const itemsListHTML = proj.items.map(loan => {
        const isOverdue = loan.isOverdue;
        const dueTag = loan.returnDueDate ? 
          `<span class="${isOverdue ? 'badge badge-red' : 'badge badge-subtle'}">Due: ${loan.returnDueDate}${isOverdue ? ' (OVERDUE)' : ''}</span>` : 
          `<span class="badge badge-teal">Ongoing Project (In-use)</span>`;
        const safeThumb = escapeHTML(sanitizeImageUrl(loan.componentImage));

        return `
          <div class="project-component-row">
            <div class="project-comp-info">
              <div class="project-comp-thumb">
                <img src="${safeThumb}" alt="${escapeHTML(loan.componentName)}">
              </div>
              <div style="min-width: 0;">
                <div class="project-comp-title">${escapeHTML(loan.componentName)}</div>
                <div class="project-comp-meta">
                  <span style="font-family: var(--font-mono); font-weight: 700; color: var(--accent-brass);">${loan.quantity} Unit${loan.quantity > 1 ? 's' : ''}</span>
                  <span>•</span>
                  <span>With <strong>${escapeHTML(loan.recipientName)}</strong></span>
                </div>
                <div style="margin-top: 0.35rem;">${dueTag}</div>
              </div>
            </div>

            <div>
              <button class="btn btn-success btn-sm" data-action="return-loan" data-comp-id="${loan.componentId}" data-loan-id="${loan.id}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Return Item
              </button>
            </div>
          </div>
        `;
      }).join('');

      return `
        <article class="project-card">
          <div class="project-card-header">
            <div style="display: flex; gap: 0.85rem; align-items: flex-start;">
              <div class="project-badge-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              </div>
              <div class="project-title-area">
                <h3 class="project-name">${escapeHTML(proj.name)}</h3>
                <div class="project-team">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
                  Assigned Team: <strong>${escapeHTML(proj.borrowersList.join(', '))}</strong>
                </div>
              </div>
            </div>
            <div>
              <span class="badge ${proj.hasOverdue ? 'badge-red' : 'badge-brass'}">
                ${proj.totalAllocatedUnits} Unit${proj.totalAllocatedUnits > 1 ? 's' : ''} Used
              </span>
            </div>
          </div>

          <div class="project-components-list">
            ${itemsListHTML}
          </div>
        </article>
      `;
    }).join('');

    // 2. Render Borrowers Grid
    el.borrowersGrid.innerHTML = borrowers.map(b => {
      const initials = b.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

      const itemsListHTML = b.items.map(loan => {
        const isOverdue = loan.isOverdue;
        const dueTag = loan.returnDueDate ? 
          `<span class="${isOverdue ? 'badge badge-red' : 'badge badge-subtle'}">Due: ${loan.returnDueDate}${isOverdue ? ' (OVERDUE)' : ''}</span>` : 
          `<span class="badge badge-teal">Ongoing (In-use)</span>`;
        const safeThumb = escapeHTML(sanitizeImageUrl(loan.componentImage));

        return `
          <div class="borrowed-item-row">
            <div class="borrowed-item-main">
              <div class="borrowed-item-thumb">
                <img src="${safeThumb}" alt="${escapeHTML(loan.componentName)}">
              </div>
              <div class="borrowed-item-details">
                <div class="borrowed-item-name">${escapeHTML(loan.componentName)}</div>
                <div class="borrowed-item-meta">
                  <span style="font-family: var(--font-mono); font-weight: 700; color: var(--accent-brass);">${loan.quantity} Unit${loan.quantity > 1 ? 's' : ''}</span>
                  <span>•</span>
                  <span>Project: <strong>${escapeHTML(loan.project || 'General')}</strong></span>
                </div>
                <div style="margin-top: 0.35rem;">${dueTag}</div>
              </div>
            </div>

            <div>
              <button class="btn btn-success btn-sm" data-action="return-loan" data-comp-id="${loan.componentId}" data-loan-id="${loan.id}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Return
              </button>
            </div>
          </div>
        `;
      }).join('');

      return `
        <article class="borrower-card">
          <div class="borrower-card-header">
            <div class="borrower-info">
              <div class="borrower-avatar">${initials}</div>
              <div>
                <div class="borrower-name">${escapeHTML(b.name)}</div>
                <div class="borrower-handle">${escapeHTML(b.contact)}</div>
              </div>
            </div>
            <div>
              <span class="badge ${b.hasOverdue ? 'badge-red' : 'badge-teal'}">
                ${b.totalBorrowedQty} Unit${b.totalBorrowedQty > 1 ? 's' : ''} Held
              </span>
            </div>
          </div>

          <div class="borrowed-items-list">
            ${itemsListHTML}
          </div>
        </article>
      `;
    }).join('');

    // Attach return buttons
    document.querySelectorAll('[data-action="return-loan"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const compId = btn.getAttribute('data-comp-id');
        const loanId = btn.getAttribute('data-loan-id');
        window.componentStore.returnLoan(compId, loanId);
      });
    });
  }

  // --- Render Activity Log Timeline ---
  function renderActivityTimeline() {
    const logs = window.componentStore.activityLog || [];

    if (logs.length === 0) {
      el.activityTimeline.innerHTML = `
        <div class="empty-state">
          <p class="empty-state-desc">No recorded activity yet.</p>
        </div>
      `;
      return;
    }

    el.activityTimeline.innerHTML = logs.map(entry => {
      let icon = '';
      let bg = '';
      let actionText = '';

      if (entry.type === 'loan') {
        icon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>`;
        bg = 'var(--accent-brass-bg); color: var(--accent-brass); border: 1px solid var(--accent-brass-border)';
        actionText = `Assigned <strong>${entry.quantity} unit(s)</strong> of <em>${escapeHTML(entry.componentName)}</em> to project <strong>${escapeHTML(entry.project || 'General')}</strong> (${escapeHTML(entry.recipientName)})`;
      } else if (entry.type === 'return') {
        icon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        bg = 'var(--accent-teal-bg); color: var(--accent-teal); border: 1px solid var(--accent-teal-border)';
        actionText = `Returned <strong>${entry.quantity} unit(s)</strong> of <em>${escapeHTML(entry.componentName)}</em> from <strong>${escapeHTML(entry.recipientName)}</strong> back to stock`;
      } else if (entry.type === 'created') {
        icon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
        bg = 'var(--accent-teal-bg); color: var(--accent-teal); border: 1px solid var(--accent-teal-border)';
        const qtySuffix = entry.quantity != null ? ` (${entry.quantity} units)` : '';
        actionText = `Added new component <em>${escapeHTML(entry.componentName)}</em>${qtySuffix}`;
      } else {
        icon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
        bg = 'var(--accent-red-bg); color: var(--accent-red); border: 1px solid var(--accent-red-border)';
        actionText = `Deleted component <em>${escapeHTML(entry.componentName)}</em> from inventory`;
      }

      const timeStr = formatTimestamp(entry.timestamp);

      return `
        <div class="timeline-entry">
          <div class="timeline-entry-left">
            <div class="timeline-icon-box" style="background: ${bg};">
              ${icon}
            </div>
            <div class="timeline-entry-title">${actionText}</div>
          </div>
          <div class="timeline-entry-time">${timeStr}</div>
        </div>
      `;
    }).join('');
  }

  // --- Add / Edit Component Handlers ---
  function openNewComponentModal() {
    state.editingComponentId = null;
    state.pendingImageBase64 = '';
    el.compModalTitle.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      Add New Component
    `;
    el.componentForm.reset();
    el.editComponentId.value = '';
    if (el.imageFileInput) el.imageFileInput.value = '';
    if (el.imageUrlInput) el.imageUrlInput.value = '';
    if (el.compDeadQty) el.compDeadQty.value = 0;
    setImagePreviewState('');
    if (el.editCustodySection) el.editCustodySection.style.display = 'none';
    if (el.saveComponentBtn) {
      el.saveComponentBtn.disabled = false;
      el.saveComponentBtn.textContent = 'Save Component';
    }
    if (el.imageDropArea) {
      el.imageDropArea.classList.remove('loading');
    }
    openModal(el.componentModal);
    setTimeout(() => el.compName.focus(), 50);
  }

  function openEditComponentModal(id) {
    const item = window.componentStore.getComponentById(id);
    if (!item) return;

    state.editingComponentId = id;
    el.compModalTitle.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
      Edit Component Details
    `;
    el.editComponentId.value = item.id;
    el.compName.value = item.name;
    el.compSku.value = item.sku || '';
    el.compCategory.value = item.category || '';
    el.compBin.value = item.locationBin || '';
    el.compTotalQty.value = item.totalQty;
    if (el.compDeadQty) el.compDeadQty.value = item.deadQty || 0;
    const tagsArr = Array.isArray(item.tags) ? item.tags : (typeof item.tags === 'string' ? item.tags.split(',').map(t => t.trim()).filter(Boolean) : []);
    el.compTags.value = tagsArr.join(', ');
    el.compSpecs.value = item.specs || '';

    setImagePreviewState(item.image || '');

    // Display project custody section with direct Lend / Assign action
    if (el.editCustodySection) {
      el.editCustodySection.style.display = 'block';
      renderEditCustodySummary(item);
    }

    openModal(el.componentModal);
  }

  function renderEditCustodySummary(item) {
    if (!el.editCustodySummaryList) return;
    const loans = item.activeLoans || [];

    if (el.modalLendDirectBtn) {
      el.modalLendDirectBtn.disabled = item.availableQty === 0;
      el.modalLendDirectBtn.title = item.availableQty === 0 
        ? 'No stock available to assign' 
        : `Assign units of ${item.name} (${item.availableQty} available)`;
      el.modalLendDirectBtn.onclick = (e) => {
        e.preventDefault();
        closeModal(el.componentModal);
        setTimeout(() => {
          openLendModal(item.id);
        }, 150);
      };
    }

    if (loans.length === 0) {
      el.editCustodySummaryList.innerHTML = `
        <div style="font-size: 0.8rem; color: var(--text-muted); font-style: italic; padding: 0.4rem 0.2rem;">
          No active project allocations. All ${item.totalQty} unit${item.totalQty === 1 ? '' : 's'} available in stock (${escapeHTML(item.locationBin || 'Unassigned')}).
        </div>
      `;
      return;
    }

    el.editCustodySummaryList.innerHTML = loans.map(loan => {
      const isOverdue = loan.returnDueDate && new Date(loan.returnDueDate) < new Date();
      return `
        <div class="custody-item-row" data-loan-id="${loan.id}">
          <div class="custody-item-info">
            <div class="custody-item-proj">
              ${escapeHTML(loan.project || 'General Project')}
              ${isOverdue ? '<span class="badge badge-red" style="font-size: 0.62rem; margin-left: 4px; padding: 1px 4px;">OVERDUE</span>' : ''}
            </div>
            <div class="custody-item-borrower">
              Assignee: <strong>${escapeHTML(loan.recipientName || 'Self / Bench')}</strong> • ${loan.quantity} unit${loan.quantity === 1 ? '' : 's'}
              ${loan.returnDueDate ? ` • Due: ${escapeHTML(loan.returnDueDate)}` : ''}
            </div>
          </div>
          <div class="custody-item-meta">
            <button type="button" class="btn btn-secondary btn-sm edit-custody-return-btn" data-loan-id="${loan.id}" data-component-id="${item.id}" style="font-size: 0.72rem; padding: 0.25rem 0.6rem;">
              Return
            </button>
          </div>
        </div>
      `;
    }).join('');

    el.editCustodySummaryList.querySelectorAll('.edit-custody-return-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const compId = btn.getAttribute('data-component-id');
        const loanId = btn.getAttribute('data-loan-id');
        handleReturnInEditModal(compId, loanId);
      });
    });
  }

  function handleReturnInEditModal(componentId, loanId) {
    if (!confirm('Return this hardware allocation back to available vault stock?')) return;
    try {
      window.componentStore.returnLoan(componentId, loanId);
      showToast('Hardware returned to stock.');
      const updated = window.componentStore.getComponentById(componentId);
      if (updated) {
        renderEditCustodySummary(updated);
        renderAll();
      }
    } catch (err) {
      showToast('Error returning hardware: ' + err.message);
    }
  }

  function setImagePreviewState(imgSrc) {
    state.pendingImageBase64 = imgSrc;
    if (imgSrc) {
      el.imagePreview.src = imgSrc;
      el.imagePreview.style.display = 'block';
      el.imagePlaceholder.style.display = 'none';
      el.clearImageBtn.style.display = 'inline-flex';
      el.imageUrlInput.value = imgSrc.startsWith('http') ? imgSrc : '';
    } else {
      el.imagePreview.src = '';
      el.imagePreview.style.display = 'none';
      el.imagePlaceholder.style.display = 'flex';
      el.clearImageBtn.style.display = 'none';
      el.imageUrlInput.value = '';
    }
  }

  function setupImageUpload() {
    el.imageDropArea.addEventListener('click', (e) => {
      // Avoid re-triggering if clicked on inner buttons
      if (e.target.closest('#pasteImageBtn') || e.target.closest('#clearImageBtn') || e.target.closest('#imageUrlInput')) return;
      if (el.imageFileInput) {
        el.imageFileInput.value = '';
        el.imageFileInput.click();
      }
    });

    el.imageFileInput.addEventListener('change', e => {
      const file = e.target.files && e.target.files[0];
      if (file) handleImageFile(file);
    });

    el.imageDropArea.addEventListener('dragover', e => {
      e.preventDefault();
      el.imageDropArea.classList.add('dragover');
    });

    el.imageDropArea.addEventListener('dragleave', () => {
      el.imageDropArea.classList.remove('dragover');
    });

    el.imageDropArea.addEventListener('drop', e => {
      e.preventDefault();
      el.imageDropArea.classList.remove('dragover');
      const file = e.dataTransfer.files && e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        handleImageFile(file);
      }
    });

    const handleUrlInput = () => {
      const url = el.imageUrlInput ? el.imageUrlInput.value.trim() : '';
      if (url) {
        setImagePreviewState(url);
      } else if (state.pendingImageBase64 && state.pendingImageBase64.startsWith('http')) {
        setImagePreviewState('');
      }
    };
    if (el.imageUrlInput) {
      el.imageUrlInput.addEventListener('input', handleUrlInput);
      el.imageUrlInput.addEventListener('change', handleUrlInput);
      el.imageUrlInput.addEventListener('blur', handleUrlInput);
    }

    el.clearImageBtn.addEventListener('click', e => {
      e.stopPropagation();
      setImagePreviewState('');
      if (el.imageFileInput) el.imageFileInput.value = '';
      if (el.imageUrlInput) el.imageUrlInput.value = '';
    });

    // Paste from Clipboard Button handler
    if (el.pasteImageBtn) {
      el.pasteImageBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
          if (navigator.clipboard && navigator.clipboard.read) {
            const clipboardItems = await navigator.clipboard.read();
            for (const item of clipboardItems) {
              const imageType = item.types.find(type => type.startsWith('image/'));
              if (imageType) {
                const blob = await item.getType(imageType);
                handleImageFile(blob);
                flashDropAreaSuccess();
                return;
              }
            }
          }
          // If no image file, check clipboard text for image URL
          if (navigator.clipboard && navigator.clipboard.readText) {
            const text = (await navigator.clipboard.readText()).trim();
            if (text.match(/\.(jpeg|jpg|gif|png|svg|webp)($|\?)/i) || text.startsWith('http://') || text.startsWith('https://') || text.startsWith('data:image/')) {
              setImagePreviewState(text);
              flashDropAreaSuccess();
              return;
            }
          }
          alert('No image found in clipboard. Please copy an image or image URL, then click Paste or press Ctrl+V!');
        } catch (err) {
          alert('Clipboard access prompt closed or unsupported. Press Ctrl+V directly to paste your copied image!');
        }
      });
    }

    // Global Paste Event Listener (Active when Component Modal is open)
    document.addEventListener('paste', e => {
      if (!el.componentModal || !el.componentModal.classList.contains('open')) return;

      const clipboardData = e.clipboardData || window.clipboardData;
      if (!clipboardData) return;

      // 1. Check for image files in clipboard
      const items = clipboardData.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type && items[i].type.startsWith('image/')) {
            const file = items[i].getAsFile();
            if (file) {
              e.preventDefault();
              handleImageFile(file);
              flashDropAreaSuccess();
              return;
            }
          }
        }
      }

      // 2. Check for image URL text if user pastes outside text fields or into imageUrlInput
      const activeEl = document.activeElement;
      const isTextInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA') && activeEl !== el.imageUrlInput;
      
      if (!isTextInput) {
        const text = clipboardData.getData('text').trim();
        if (text && (text.match(/\.(jpeg|jpg|gif|png|svg|webp)($|\?)/i) || text.startsWith('http://') || text.startsWith('https://') || text.startsWith('data:image/'))) {
          e.preventDefault();
          setImagePreviewState(text);
          flashDropAreaSuccess();
        }
      }
    });
  }

  function flashDropAreaSuccess() {
    if (!el.imageDropArea) return;
    el.imageDropArea.style.borderColor = 'var(--accent-teal)';
    el.imageDropArea.style.boxShadow = '0 0 20px var(--accent-teal-border)';
    setTimeout(() => {
      el.imageDropArea.style.borderColor = '';
      el.imageDropArea.style.boxShadow = '';
    }, 1200);
  }


  // Client-side image compression utility using HTML5 Canvas (keeps payloads < 15KB per image for Firestore)
  function compressImage(imgSource, maxWidth = 320, maxHeight = 320, quality = 0.65) {
    return new Promise((resolve) => {
      if (!imgSource || typeof imgSource !== 'string') return resolve('');
      if (imgSource.startsWith('http') || imgSource.startsWith('data:image/svg')) {
        return resolve(imgSource);
      }
      const timeout = setTimeout(() => {
        console.warn('Image compression timed out; using source image fallback');
        resolve(imgSource);
      }, 4000);

      try {
        const img = new Image();
        img.onload = () => {
          clearTimeout(timeout);
          try {
            let width = img.naturalWidth || img.width || 640;
            let height = img.naturalHeight || img.height || 640;

            if (width > maxWidth || height > maxHeight) {
              if (width > height) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
              } else {
                width = Math.round((width * maxHeight) / height);
                height = maxHeight;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, width);
            canvas.height = Math.max(1, height);
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              return resolve(imgSource);
            }
            ctx.drawImage(img, 0, 0, width, height);

            let compressed = '';
            try {
              compressed = canvas.toDataURL('image/webp', quality);
            } catch (e) {
              compressed = '';
            }
            if (!compressed || !compressed.startsWith('data:image/webp')) {
              try {
                compressed = canvas.toDataURL('image/jpeg', quality);
              } catch (e) {
                compressed = '';
              }
            }
            resolve(compressed && compressed.length < imgSource.length ? compressed : imgSource);
          } catch (err) {
            console.warn('Canvas compression error, falling back to original:', err);
            resolve(imgSource);
          }
        };

        img.onerror = (err) => {
          clearTimeout(timeout);
          console.warn('Image load error during compression:', err);
          resolve(imgSource);
        };

        img.src = imgSource;
      } catch (err) {
        clearTimeout(timeout);
        console.warn('compressImage exception:', err);
        resolve(imgSource);
      }
    });
  }

  function handleImageFile(file) {
    if (!file) return;
    if (el.imageDropArea) el.imageDropArea.classList.add('loading');
    if (el.saveComponentBtn) {
      el.saveComponentBtn.disabled = true;
      el.saveComponentBtn.setAttribute('data-original-text', el.saveComponentBtn.textContent);
      el.saveComponentBtn.textContent = 'Processing Image...';
    }

    const reader = new FileReader();
    reader.onload = async ev => {
      try {
        const raw = ev.target.result;
        const compressed = await compressImage(raw, 320, 320, 0.65);
        setImagePreviewState(compressed);
        flashDropAreaSuccess();
      } catch (err) {
        console.error('Error processing image:', err);
        showToast('Error processing image file');
      } finally {
        if (el.imageDropArea) el.imageDropArea.classList.remove('loading');
        if (el.saveComponentBtn) {
          el.saveComponentBtn.disabled = false;
          el.saveComponentBtn.textContent = el.saveComponentBtn.getAttribute('data-original-text') || 'Save Component';
        }
        if (el.imageFileInput) el.imageFileInput.value = '';
      }
    };
    reader.onerror = () => {
      if (el.imageDropArea) el.imageDropArea.classList.remove('loading');
      if (el.saveComponentBtn) {
        el.saveComponentBtn.disabled = false;
        el.saveComponentBtn.textContent = el.saveComponentBtn.getAttribute('data-original-text') || 'Save Component';
      }
      if (el.imageFileInput) el.imageFileInput.value = '';
      showToast('Failed to read image file');
    };
    reader.readAsDataURL(file);
  }

  // --- Lend Modal Handlers ---
  function openLendModal(componentId) {
    const item = window.componentStore.getComponentById(componentId);
    if (!item) return;

    if (item.availableQty <= 0) {
      alert(`Cannot assign "${item.name}". Zero units currently available in stock.`);
      return;
    }

    el.lendComponentId.value = item.id;
    el.lendTargetName.textContent = item.name;
    el.lendTargetSku.textContent = `${item.sku || 'NO-SKU'} • ${item.locationBin || 'BIN'}`;
    el.lendTargetAvailableBadge.textContent = `${item.availableQty} Available in stock`;

    el.lendQuantity.max = item.availableQty;
    el.lendQuantity.value = 1;
    el.lendRecipientName.value = '';
    el.lendRecipientContact.value = '';
    el.lendProject.value = '';
    el.lendNotes.value = '';

    const today = new Date().toISOString().split('T')[0];
    el.lendDateGiven.value = today;

    // Expected return date is optional (blank means ongoing/permanent project usage)
    el.lendReturnDueDate.value = '';

    // Refresh datalist
    updateCategoryAndProjectFilters();

    openModal(el.lendModal);
    setTimeout(() => el.lendProject.focus(), 50);
  }

  // --- Lightbox ---
  function openLightbox(src, caption) {
    el.lightboxImage.src = src;
    el.lightboxCaption.textContent = caption || '';
    openModal(el.lightboxModal);
  }

  // --- Backup & Restore Handlers ---
  function setupBackupHandlers() {
    if (el.openBackupBtn) {
      el.openBackupBtn.addEventListener('click', () => {
        openModal(el.backupModal);
      });
    }

    // PDF Download Ledger Report
    if (el.downloadPdfExportBtn) {
      el.downloadPdfExportBtn.addEventListener('click', async () => {
        await generateInventoryPdf('download');
      });
    }

    // Print / Save as PDF
    if (el.printPdfReportBtn) {
      el.printPdfReportBtn.addEventListener('click', async () => {
        await generateInventoryPdf('print');
      });
    }

    // JSON Export
    if (el.downloadExportBtn) {
      el.downloadExportBtn.addEventListener('click', () => {
        const jsonStr = window.componentStore.exportData();
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `component_vault_moderne_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    }

    if (el.triggerImportBtn) {
      el.triggerImportBtn.addEventListener('click', () => {
        el.importFileInput.click();
      });
    }

    if (el.importFileInput) {
      el.importFileInput.addEventListener('change', e => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = ev => {
          try {
            window.componentStore.importData(ev.target.result);
            closeModal(el.backupModal);
            alert('Backup restored successfully!');
          } catch (err) {
            alert('Error restoring backup: ' + err.message);
          }
        };
        reader.readAsText(file);
      });
    }

    if (el.resetDemoDataBtn) {
      el.resetDemoDataBtn.addEventListener('click', () => {
        if (confirm('Restore the demo Streamline catalog and sample project loans?')) {
          window.componentStore.resetToDefaults(true);
          closeModal(el.backupModal);
        }
      });
    }
  }

  // --- PDF Component Image Rasterizer ---
  function prepareImageForPdf(imgSource, size = 64, timeoutMs = 1500) {
    if (!imgSource || typeof imgSource !== 'string') return Promise.resolve(null);
    return new Promise((resolve) => {
      let resolved = false;
      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(null);
        }
      }, timeoutMs);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timer);
        try {
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(null);

          // Clean white background for crisp table contrast
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, size, size);

          // Calculate aspect fit dimensions
          const w = img.naturalWidth || img.width || size;
          const h = img.naturalHeight || img.height || size;
          const scale = Math.min((size - 4) / w, (size - 4) / h);
          const drawW = w * scale;
          const drawH = h * scale;
          const drawX = (size - drawW) / 2;
          const drawY = (size - drawH) / 2;

          ctx.drawImage(img, drawX, drawY, drawW, drawH);
          resolve(canvas.toDataURL('image/png'));
        } catch (err) {
          resolve(null);
        }
      };
      img.onerror = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          resolve(null);
        }
      };
      img.src = imgSource;
    });
  }

  function loadScriptAsync(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) return resolve();
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => resolve();
      s.onerror = (e) => reject(e);
      document.body.appendChild(s);
    });
  }

  // --- PDF Inventory Ledger & Audit Generation ---
  async function generateInventoryPdf(action = 'download') {
    try {
      const vault = window.componentStore.getActiveVault() || { name: 'Main Hardware Lab', tagline: '' };
      const components = window.componentStore.getComponents() || [];
      const user = (window.firebaseAuth && window.firebaseAuth.currentUser) || null;
      const custodianName = user ? (user.displayName || user.email || 'Lab Custodian') : 'Lab Custodian';

      // Summary KPIs
      const totalModels = components.length;
      let totalUnits = 0;
      let availableUnits = 0;
      let lentUnits = 0;
      let deadUnits = 0;

      components.forEach(c => {
        totalUnits += (parseInt(c.totalQty, 10) || 0);
        availableUnits += (parseInt(c.availableQty, 10) || 0);
        lentUnits += (parseInt(c.lentQty, 10) || 0);
        deadUnits += (parseInt(c.deadQty, 10) || 0);
      });

      // Dynamically load PDF engine on-demand (saves 403 KB on initial boot)
      if (!window.jspdf || !window.jspdf.jsPDF) {
        showToast('Preparing PDF engine...', 'info');
        try {
          await loadScriptAsync('js/jspdf.umd.min.js?v=5.1');
          await loadScriptAsync('js/jspdf.plugin.autotable.min.js?v=5.1');
        } catch (err) {
          console.warn('[PDF] Dynamic load error:', err);
        }
      }

      const { jsPDF } = window.jspdf || {};
      if (!jsPDF) {
        console.warn('[PDF] jsPDF not loaded, falling back to printable HTML view.');
        printInventoryReportFallback(action, { vault, components, custodianName, totalModels, totalUnits, availableUnits, lentUnits, deadUnits });
        return;
      }

      // Landscape A4: 841.89 x 595.28 pt
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Top Header Banner (Midnight Obsidian #070a0e)
      doc.setFillColor(7, 10, 14);
      doc.rect(0, 0, pageWidth, 62, 'F');

      // Streamline Noir Metallic Accent Bar (#18181b)
      doc.setFillColor(24, 24, 27);
      doc.rect(0, 62, pageWidth, 2.5, 'F');

      // Title & Branding
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('COMPONENT VAULT  |  HARDWARE LAB CUSTODY LEDGER', 36, 28);

      // Subtitle / Vault Name
      doc.setTextColor(24, 24, 27);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      const vaultTitle = `${(vault.name || 'Hardware Lab').toUpperCase()}${vault.tagline ? ' — ' + vault.tagline : ''}`;
      doc.text(vaultTitle, 36, 46);

      // Metadata (Right aligned)
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      doc.setTextColor(203, 213, 225);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text(`Generated: ${dateStr}`, pageWidth - 36, 28, { align: 'right' });
      doc.text(`Lab Custodian: ${custodianName}`, pageWidth - 36, 44, { align: 'right' });

      // KPI Summary Banner Box (Y = 74 to 112)
      doc.setFillColor(18, 24, 36); // #121824
      doc.roundedRect(36, 74, pageWidth - 72, 38, 4, 4, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.5);
      doc.roundedRect(36, 74, pageWidth - 72, 38, 4, 4, 'S');

      // KPI Item Columns
      const kpiItems = [
        { label: 'COMPONENT MODELS', value: String(totalModels), color: [255, 255, 255] },
        { label: 'TOTAL PHYSICAL UNITS', value: String(totalUnits), color: [255, 255, 255] },
        { label: 'AVAILABLE IN STOCK', value: String(availableUnits), color: [0, 180, 216] },
        { label: 'IN ACTIVE PROJECTS', value: String(lentUnits), color: [242, 159, 90] },
        { label: 'DEAD / DEFECTIVE', value: String(deadUnits), color: deadUnits > 0 ? [255, 82, 82] : [142, 155, 174] }
      ];

      const kpiColWidth = (pageWidth - 72) / kpiItems.length;
      kpiItems.forEach((kpi, idx) => {
        const xPos = 36 + (idx * kpiColWidth) + (kpiColWidth / 2);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
        doc.text(kpi.value, xPos, 91, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(142, 155, 174);
        doc.text(kpi.label, xPos, 103, { align: 'center' });

        if (idx < kpiItems.length - 1) {
          doc.setDrawColor(50, 65, 85);
          doc.line(36 + (idx + 1) * kpiColWidth, 79, 36 + (idx + 1) * kpiColWidth, 107);
        }
      });

      // Prepare Table Rows
      const sortedComponents = [...components].sort((a, b) => {
        const catCompare = (a.category || '').localeCompare(b.category || '');
        if (catCompare !== 0) return catCompare;
        return (a.name || '').localeCompare(b.name || '');
      });

      // Preload & rasterize all component images to clean PNG data URLs
      const preparedImages = await Promise.all(
        sortedComponents.map(c => prepareImageForPdf(c.image, 64))
      );

      const tableRows = sortedComponents.map(c => {
        const status = c.availableQty === 0 ? 'DEPLETED' : (c.availableQty <= 2 ? 'LOW STOCK' : 'IN STOCK');
        return [
          '', // Column 0: Photo thumbnail (drawn via didDrawCell)
          c.sku || '—',
          c.name || 'Unnamed',
          c.category || 'General',
          c.locationBin || 'UNASSIGNED',
          String(c.availableQty),
          String(c.lentQty),
          String(c.deadQty || 0),
          String(c.totalQty),
          status
        ];
      });

      // AutoTable
      doc.autoTable({
        startY: 122,
        margin: { left: 36, right: 36, bottom: 40 },
        head: [['PHOTO', 'SKU / CODE', 'COMPONENT NAME', 'CATEGORY', 'BIN LOCATION', 'AVAIL', 'LENT', 'DEAD', 'TOTAL', 'STATUS']],
        body: tableRows,
        theme: 'grid',
        styles: {
          font: 'helvetica',
          fontSize: 8,
          cellPadding: 4,
          overflow: 'linebreak',
          lineColor: [226, 232, 240],
          lineWidth: 0.5,
          minCellHeight: 26,
          valign: 'middle'
        },
        headStyles: {
          fillColor: [18, 24, 36], // #121824
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8,
          halign: 'left',
          valign: 'middle',
          minCellHeight: 20
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        columnStyles: {
          0: { cellWidth: 38, halign: 'center', minCellHeight: 26 },
          1: { cellWidth: 70, fontStyle: 'bold', textColor: [51, 65, 85] },
          2: { cellWidth: 178, fontStyle: 'bold', textColor: [15, 23, 42] },
          3: { cellWidth: 92 },
          4: { cellWidth: 76 },
          5: { cellWidth: 44, halign: 'center' },
          6: { cellWidth: 44, halign: 'center' },
          7: { cellWidth: 44, halign: 'center' },
          8: { cellWidth: 50, halign: 'center', fontStyle: 'bold' },
          9: { cellWidth: 76, halign: 'center' }
        },
        didParseCell: function(data) {
          if (data.section === 'body') {
            // Dead units (column 7)
            if (data.column.index === 7) {
              const val = parseInt(data.cell.raw, 10) || 0;
              if (val > 0) {
                data.cell.styles.textColor = [217, 83, 79];
                data.cell.styles.fontStyle = 'bold';
              }
            }
            // Status column (column 9)
            if (data.column.index === 9) {
              const val = data.cell.raw;
              if (val === 'DEPLETED') {
                data.cell.styles.textColor = [217, 83, 79];
                data.cell.styles.fontStyle = 'bold';
              } else if (val === 'LOW STOCK') {
                data.cell.styles.textColor = [217, 138, 40];
                data.cell.styles.fontStyle = 'bold';
              } else if (val === 'IN STOCK') {
                data.cell.styles.textColor = [24, 24, 27];
                data.cell.styles.fontStyle = 'bold';
              }
            }
          }
        },
        didDrawCell: function(data) {
          if (data.column.index === 0 && data.section === 'body') {
            const compImage = preparedImages[data.row.index];
            if (compImage) {
              try {
                const imgSize = 20; // 20 pt square thumbnail
                const x = data.cell.x + (data.cell.width - imgSize) / 2;
                const y = data.cell.y + (data.cell.height - imgSize) / 2;
                doc.addImage(compImage, 'PNG', x, y, imgSize, imgSize);
              } catch (e) {
                console.warn('[PDF Table Image Draw]', e);
              }
            } else {
              doc.setFontSize(8);
              doc.setTextColor(180, 190, 205);
              doc.text('—', data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 3, { align: 'center' });
            }
          }
        },
        didDrawPage: function(data) {
          // Footer
          const totalPages = doc.internal.getNumberOfPages();
          const currentPage = data.pageNumber;

          doc.setDrawColor(203, 213, 225);
          doc.setLineWidth(0.5);
          doc.line(36, pageHeight - 26, pageWidth - 36, pageHeight - 26);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(142, 155, 174);
          doc.text('Component Vault  •  Hardware Lab Custody System  •  Confidential Lab Audit Record', 36, pageHeight - 14);
          doc.text(`Page ${currentPage} of ${totalPages}`, pageWidth - 36, pageHeight - 14, { align: 'right' });
        }
      });

      // Output action
      const cleanVaultName = (vault.name || 'Hardware_Lab').replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `Component_Vault_Audit_Report_${cleanVaultName}_${now.toISOString().split('T')[0]}.pdf`;

      if (action === 'download') {
        doc.save(filename);
      } else if (action === 'print') {
        doc.autoPrint();
        const blobUrl = doc.output('bloburl');
        window.open(blobUrl, '_blank');
      }
    } catch (err) {
      console.error('[PDF Generation Error]', err);
      alert('Could not generate PDF directly: ' + err.message + '\nSwitching to printable document view.');
      printInventoryReportFallback(action);
    }
  }

  // --- Fallback Printable View ---
  function printInventoryReportFallback(action, data) {
    const vault = (data && data.vault) || window.componentStore.getActiveVault() || { name: 'Main Hardware Lab' };
    const components = (data && data.components) || window.componentStore.getComponents() || [];
    const custodian = (data && data.custodianName) || 'Lab Custodian';
    const totalModels = components.length;
    let totalUnits = 0, availUnits = 0, lentUnits = 0, deadUnits = 0;
    components.forEach(c => {
      totalUnits += (parseInt(c.totalQty, 10) || 0);
      availUnits += (parseInt(c.availableQty, 10) || 0);
      lentUnits += (parseInt(c.lentQty, 10) || 0);
      deadUnits += (parseInt(c.deadQty, 10) || 0);
    });

    const printWin = window.open('', '_blank', 'width=900,height=700');
    if (!printWin) {
      alert('Popup was blocked. Please allow popups to view or print the inventory audit report.');
      return;
    }

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Component Vault Audit Report - ${vault.name}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 24px; color: #0f172a; }
    .header { background: #070a0e; color: #fff; padding: 18px 24px; border-radius: 8px; margin-bottom: 20px; border-bottom: 3px solid #18181b; }
    .header h1 { margin: 0 0 6px 0; font-size: 1.25rem; letter-spacing: 0.08em; text-transform: uppercase; }
    .header .meta { font-size: 0.82rem; color: #94a3b8; display: flex; justify-content: space-between; }
    .kpis { display: flex; gap: 12px; margin-bottom: 20px; }
    .kpi-card { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; text-align: center; }
    .kpi-val { font-size: 1.3rem; font-weight: bold; color: #0f172a; }
    .kpi-lbl { font-size: 0.7rem; color: #64748b; text-transform: uppercase; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
    th { background: #121824; color: #fff; text-align: left; padding: 8px 10px; font-weight: 600; }
    td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }
    tr:nth-child(even) td { background: #f8fafc; }
    .text-center { text-align: center; }
    .dead-val { color: #dc2626; font-weight: bold; }
    .status-in { color: #18181b; font-weight: 600; }
    .status-low { color: #d97706; font-weight: 600; }
    .status-dep { color: #dc2626; font-weight: 600; }
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 16px; display: flex; gap: 8px;">
    <button onclick="window.print()" style="padding: 8px 16px; background: #18181b; color: #ffffff; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">Print / Save as PDF</button>
    <button onclick="window.close()" style="padding: 8px 16px; background: #e2e8f0; border: none; border-radius: 4px; cursor: pointer;">Close</button>
  </div>
  <div class="header">
    <h1>Component Vault &bull; Hardware Lab Custody Ledger</h1>
    <div class="meta">
      <span>Vault: <strong>${vault.name}</strong> ${vault.tagline ? '— ' + vault.tagline : ''}</span>
      <span>Generated: ${new Date().toLocaleString()} &bull; Custodian: ${custodian}</span>
    </div>
  </div>
  <div class="kpis">
    <div class="kpi-card"><div class="kpi-val">${totalModels}</div><div class="kpi-lbl">Component Models</div></div>
    <div class="kpi-card"><div class="kpi-val">${totalUnits}</div><div class="kpi-lbl">Total Physical Units</div></div>
    <div class="kpi-card"><div class="kpi-val" style="color: #18181b;">${availUnits}</div><div class="kpi-lbl">Available Stock</div></div>
    <div class="kpi-card"><div class="kpi-val" style="color: #d97706;">${lentUnits}</div><div class="kpi-lbl">In Active Projects</div></div>
    <div class="kpi-card"><div class="kpi-val" style="color: #dc2626;">${deadUnits}</div><div class="kpi-lbl">Dead / Defective</div></div>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width: 44px; text-align: center;">Photo</th>
        <th>SKU</th>
        <th>Component Name</th>
        <th>Category</th>
        <th>Bin Location</th>
        <th class="text-center">Available</th>
        <th class="text-center">Lent</th>
        <th class="text-center">Dead</th>
        <th class="text-center">Total</th>
        <th class="text-center">Status</th>
      </tr>
    </thead>
    <tbody>
      ${components.map(c => {
        const s = c.availableQty === 0 ? 'DEPLETED' : (c.availableQty <= 2 ? 'LOW STOCK' : 'IN STOCK');
        const sClass = c.availableQty === 0 ? 'status-dep' : (c.availableQty <= 2 ? 'status-low' : 'status-in');
        const imgHtml = c.image 
          ? `<img src="${c.image}" alt="" style="width: 28px; height: 28px; object-fit: contain; border-radius: 4px; border: 1px solid #cbd5e1; background: #ffffff; display: block; margin: 0 auto;">` 
          : `<span style="color: #94a3b8; font-size: 0.8rem;">—</span>`;
        return `<tr>
          <td style="text-align: center; vertical-align: middle; padding: 3px;">${imgHtml}</td>
          <td><strong>${c.sku || '—'}</strong></td>
          <td>${c.name}</td>
          <td>${c.category || 'General'}</td>
          <td>${c.locationBin || 'UNASSIGNED'}</td>
          <td class="text-center">${c.availableQty}</td>
          <td class="text-center">${c.lentQty}</td>
          <td class="text-center ${c.deadQty > 0 ? 'dead-val' : ''}">${c.deadQty || 0}</td>
          <td class="text-center"><strong>${c.totalQty}</strong></td>
          <td class="text-center ${sClass}">${s}</td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>
  <div style="margin-top: 24px; font-size: 0.75rem; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px;">
    Component Vault &bull; Streamline Moderne Lab Custody System &bull; Confidential
  </div>
  <script>
    if (${action === 'print'}) {
      window.onload = function() { window.print(); };
    }
  </script>
</body>
</html>`;

    printWin.document.open();
    printWin.document.write(html);
    printWin.document.close();
  }

  // --- Event Bindings ---
  function initEventBindings() {
    // Theme toggle
    el.themeToggleBtn.addEventListener('click', toggleTheme);

    // Tabs
    el.tabInventory.addEventListener('click', () => setTab('inventory'));
    el.tabBorrowers.addEventListener('click', () => setTab('borrowers'));
    el.tabActivity.addEventListener('click', () => setTab('activity'));

    // Subview pills in Borrowers & Projects
    el.subviewProjectsBtn.addEventListener('click', () => setSubviewMode('projects'));
    el.subviewBorrowersBtn.addEventListener('click', () => setSubviewMode('borrowers'));

    // View mode (Grid / Table)
    el.viewGridBtn.addEventListener('click', () => setViewMode('grid'));
    el.viewTableBtn.addEventListener('click', () => setViewMode('table'));

    // Debounce utility to prevent layout thrashing on rapid keystrokes
    function debounce(fn, delay = 200) {
      let timer;
      return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
      };
    }

    const debouncedRender = debounce(() => {
      renderCurrentView();
    }, 200);

    // Top Search input (Mobile-first & Top Bar)
    if (el.topSearchInput) {
      el.topSearchInput.addEventListener('input', () => {
        state.searchQuery = el.topSearchInput.value;
        if (el.searchInput) el.searchInput.value = state.searchQuery;
        if (el.topSearchClearBtn) el.topSearchClearBtn.style.display = state.searchQuery.length > 0 ? 'flex' : 'none';
        if (el.searchClearBtn) el.searchClearBtn.classList.toggle('visible', state.searchQuery.length > 0);
        debouncedRender();
      });
    }

    if (el.topSearchClearBtn) {
      el.topSearchClearBtn.addEventListener('click', () => {
        if (el.topSearchInput) el.topSearchInput.value = '';
        if (el.searchInput) el.searchInput.value = '';
        state.searchQuery = '';
        el.topSearchClearBtn.style.display = 'none';
        if (el.searchClearBtn) el.searchClearBtn.classList.remove('visible');
        renderCurrentView();
        if (el.topSearchInput) el.topSearchInput.focus();
      });
    }

    // Top Add Component button (Mobile)
    if (el.topAddCompBtn) {
      el.topAddCompBtn.addEventListener('click', openNewComponentModal);
    }

    // Toolbar Add Component button (Desktop - near filter option)
    const toolbarAddCompBtn = document.getElementById('toolbarAddCompBtn');
    if (toolbarAddCompBtn) {
      toolbarAddCompBtn.addEventListener('click', openNewComponentModal);
    }

    // Mobile Vault Menu Controls
    if (el.mobileMenuBtn) el.mobileMenuBtn.addEventListener('click', openMobileMenu);
    if (el.mobileMenuCloseBtn) el.mobileMenuCloseBtn.addEventListener('click', closeMobileMenu);
    if (el.mobileMenuBackdrop) el.mobileMenuBackdrop.addEventListener('click', closeMobileMenu);

    if (el.mobileThemeToggleBtn) {
      el.mobileThemeToggleBtn.addEventListener('click', () => {
        toggleTheme();
      });
    }

    if (el.mobileBackupBtn) {
      el.mobileBackupBtn.addEventListener('click', () => {
        closeMobileMenu(false);
        openModal(el.backupModal);
      });
    }

    // Search input (Toolbar)
    el.searchInput.addEventListener('input', () => {
      state.searchQuery = el.searchInput.value;
      if (el.topSearchInput) el.topSearchInput.value = state.searchQuery;
      if (el.topSearchClearBtn) el.topSearchClearBtn.style.display = state.searchQuery.length > 0 ? 'flex' : 'none';
      el.searchClearBtn.classList.toggle('visible', state.searchQuery.length > 0);
      debouncedRender();
    });

    el.searchClearBtn.addEventListener('click', () => {
      el.searchInput.value = '';
      if (el.topSearchInput) el.topSearchInput.value = '';
      state.searchQuery = '';
      el.searchClearBtn.classList.remove('visible');
      if (el.topSearchClearBtn) el.topSearchClearBtn.style.display = 'none';
      renderCurrentView();
      el.searchInput.focus();
    });

    // Filter Popover Toggle (By default closed)
    function toggleFilterPopover(forceState) {
      if (!el.filterPopover) return;
      const isCurrentlyOpen = el.filterPopover.style.display !== 'none';
      const shouldOpen = forceState !== undefined ? forceState : !isCurrentlyOpen;

      if (shouldOpen) {
        el.filterPopover.style.display = 'flex';
        el.filterPopover.setAttribute('aria-hidden', 'false');
        if (el.filterToggleBtn) {
          el.filterToggleBtn.setAttribute('aria-expanded', 'true');
          el.filterToggleBtn.classList.add('active');
        }
      } else {
        el.filterPopover.style.display = 'none';
        el.filterPopover.setAttribute('aria-hidden', 'true');
        if (el.filterToggleBtn) {
          el.filterToggleBtn.setAttribute('aria-expanded', 'false');
          el.filterToggleBtn.classList.remove('active');
        }
      }
    }

    function updateFilterActiveBadge() {
      let activeCount = 0;
      if (el.filterStatus && el.filterStatus.value !== 'all') activeCount++;
      if (el.filterCategory && el.filterCategory.value !== 'all') activeCount++;
      if (el.filterProject && el.filterProject.value !== 'all') activeCount++;
      if (el.sortSelect && el.sortSelect.value !== 'name_asc') activeCount++;

      if (el.filterActiveBadge) {
        if (activeCount > 0) {
          el.filterActiveBadge.textContent = activeCount;
          el.filterActiveBadge.style.display = 'inline-flex';
          if (el.filterToggleBtn) el.filterToggleBtn.classList.add('has-active-filters');
        } else {
          el.filterActiveBadge.style.display = 'none';
          if (el.filterToggleBtn) el.filterToggleBtn.classList.remove('has-active-filters');
        }
      }
    }

    if (el.filterToggleBtn) {
      el.filterToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFilterPopover();
      });
    }

    if (el.filterApplyBtn) {
      el.filterApplyBtn.addEventListener('click', () => {
        toggleFilterPopover(false);
      });
    }

    // Close filter popover on outside click
    document.addEventListener('click', (e) => {
      if (!el.filterPopover || el.filterPopover.style.display === 'none') return;
      if (!el.filterPopover.contains(e.target) && !el.filterToggleBtn.contains(e.target)) {
        toggleFilterPopover(false);
      }
    });

    // Close filter popover on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && el.filterPopover && el.filterPopover.style.display !== 'none') {
        toggleFilterPopover(false);
      }
    });

    function resetAllFiltersAction() {
      if (el.searchInput) el.searchInput.value = '';
      if (el.topSearchInput) el.topSearchInput.value = '';
      state.searchQuery = '';
      if (el.searchClearBtn) el.searchClearBtn.classList.remove('visible');
      if (el.topSearchClearBtn) el.topSearchClearBtn.style.display = 'none';

      if (el.filterStatus) el.filterStatus.value = 'all';
      state.statusFilter = 'all';
      if (el.filterCategory) el.filterCategory.value = 'all';
      state.categoryFilter = 'all';
      if (el.filterProject) el.filterProject.value = 'all';
      state.projectFilter = 'all';
      if (el.sortSelect) el.sortSelect.value = 'name_asc';
      state.sortBy = 'name_asc';

      updateFilterActiveBadge();
      renderCurrentView();
    }

    if (el.filterResetInlineBtn) {
      el.filterResetInlineBtn.addEventListener('click', resetAllFiltersAction);
    }

    // Filters change listeners
    el.filterStatus.addEventListener('change', () => {
      state.statusFilter = el.filterStatus.value;
      updateFilterActiveBadge();
      renderCurrentView();
    });

    el.filterCategory.addEventListener('change', () => {
      state.categoryFilter = el.filterCategory.value;
      updateFilterActiveBadge();
      renderCurrentView();
    });

    el.filterProject.addEventListener('change', () => {
      state.projectFilter = el.filterProject.value;
      updateFilterActiveBadge();
      renderCurrentView();
    });

    el.sortSelect.addEventListener('change', () => {
      state.sortBy = el.sortSelect.value;
      updateFilterActiveBadge();
      renderCurrentView();
    });

    el.resetFiltersBtn.addEventListener('click', resetAllFiltersAction);

    // New Component Modal Trigger
    el.openNewComponentBtn.addEventListener('click', openNewComponentModal);

    // Prevent accidental form submission when pressing Enter in single-line inputs
    // Moves focus to the next field instead, while allowing Ctrl+Enter / Cmd+Enter to submit
    function preventAccidentalSubmitOnEnter(form) {
      if (!form) return;
      form.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          // Allow default multiline behavior in textareas
          if (e.target.tagName === 'TEXTAREA') return;

          // Allow Ctrl+Enter or Cmd+Enter to explicitly submit the form
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (typeof form.requestSubmit === 'function') {
              form.requestSubmit();
            } else {
              form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            }
            return;
          }

          // If focus is currently on a button (like submit or cancel), let it perform its action
          if (e.target.tagName === 'BUTTON') return;

          // Prevent premature form submit on input fields
          e.preventDefault();

          // Advance focus to the next visible focusable input in the form
          const focusable = Array.from(form.querySelectorAll('input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button.btn-primary:not([disabled])'))
            .filter(elem => elem.offsetParent !== null);

          const currentIndex = focusable.indexOf(e.target);
          if (currentIndex > -1 && currentIndex < focusable.length - 1) {
            focusable[currentIndex + 1].focus();
          }
        }
      });
    }

    preventAccidentalSubmitOnEnter(el.componentForm);
    preventAccidentalSubmitOnEnter(el.lendForm);
    preventAccidentalSubmitOnEnter(el.createVaultForm);
    preventAccidentalSubmitOnEnter(el.editVaultForm);
    preventAccidentalSubmitOnEnter(el.cloudConfigForm);

    // Save Component Form
    el.componentForm.addEventListener('submit', async e => {
      e.preventDefault();

      try {
        // Prevent submitting while image is still compressing
        if (el.imageDropArea && el.imageDropArea.classList.contains('loading')) {
          showToast('Please wait for image processing to complete...');
          return;
        }

        let finalImage = state.pendingImageBase64;
        const inputUrl = el.imageUrlInput ? el.imageUrlInput.value.trim() : '';
        if (inputUrl && (!finalImage || inputUrl !== finalImage)) {
          finalImage = inputUrl;
        }

        // Compact any data URI image to ensure it stays < 15KB for Firestore
        if (finalImage && finalImage.startsWith('data:image') && finalImage.length > 8000) {
          finalImage = await compressImage(finalImage, 320, 320, 0.65);
        }

        const totalQtyVal = Math.max(1, parseInt(el.compTotalQty.value, 10) || 1);
        const deadQtyVal = el.compDeadQty ? Math.max(0, parseInt(el.compDeadQty.value, 10) || 0) : 0;

        if (deadQtyVal > totalQtyVal) {
          alert('Dead / defective units cannot exceed the total inventory count.');
          return;
        }

        const editId = state.editingComponentId || (el.editComponentId && el.editComponentId.value ? el.editComponentId.value.trim() : null);

        if (editId) {
          const existing = window.componentStore.getComponentById(editId);
          if (existing && deadQtyVal + (existing.lentQty || 0) > totalQtyVal) {
            alert(`Cannot set ${deadQtyVal} dead units: ${existing.lentQty} units are currently assigned to active projects (total count: ${totalQtyVal}). Return or adjust project loans first.`);
            return;
          }
        }

        const payload = {
          name: el.compName.value.trim(),
          sku: el.compSku.value.trim(),
          category: el.compCategory.value.trim() || 'General',
          locationBin: el.compBin.value.trim() || 'UNASSIGNED',
          totalQty: totalQtyVal,
          deadQty: deadQtyVal,
          specs: el.compSpecs.value.trim(),
          tags: el.compTags.value.trim(),
          image: finalImage
        };

        if (editId) {
          const updated = window.componentStore.updateComponent(editId, payload);
          if (!updated) {
            console.warn('Component not found for edit ID:', editId, 'Creating as new component...');
            const newComp = window.componentStore.addComponent(payload);
            highlightComponent(newComp.id);
          } else {
            highlightComponent(editId);
          }
          showToast(`Updated "${payload.name}" successfully!`);
        } else {
          const newComp = window.componentStore.addComponent(payload);
          showToast(`Added "${payload.name}" to inventory!`);

          // Ensure newly added component is visible:
          if (state.currentTab !== 'inventory') {
            setTab('inventory', false);
          }
          // If status filter would hide the new component, reset to 'all'
          if (state.statusFilter !== 'all') {
            const wouldBeVisible = (
              (state.statusFilter === 'available' && newComp.availableQty > 0) ||
              (state.statusFilter === 'lent' && newComp.lentQty > 0) ||
              (state.statusFilter === 'depleted' && newComp.availableQty === 0) ||
              (state.statusFilter === 'dead' && (newComp.deadQty || 0) > 0) ||
              (state.statusFilter === 'overdue' && newComp.hasOverdue)
            );
            if (!wouldBeVisible) {
              state.statusFilter = 'all';
              if (el.filterStatus) el.filterStatus.value = 'all';
              updateFilterActiveBadge();
            }
          }
          // If category filter would hide the new component, reset to 'all'
          if (state.categoryFilter !== 'all' && state.categoryFilter !== newComp.category) {
            state.categoryFilter = 'all';
            if (el.filterCategory) el.filterCategory.value = 'all';
            updateFilterActiveBadge();
          }
          // If project filter is active, reset to 'all'
          if (state.projectFilter !== 'all') {
            state.projectFilter = 'all';
            if (el.filterProject) el.filterProject.value = 'all';
            updateFilterActiveBadge();
          }
          // If search query would hide the new component, clear search
          if (state.searchQuery) {
            const q = state.searchQuery.toLowerCase();
            const inName = newComp.name.toLowerCase().includes(q);
            const inSku = (newComp.sku || '').toLowerCase().includes(q);
            const inCat = (newComp.category || '').toLowerCase().includes(q);
            const inBin = (newComp.locationBin || '').toLowerCase().includes(q);
            if (!inName && !inSku && !inCat && !inBin) {
              state.searchQuery = '';
              if (el.searchInput) el.searchInput.value = '';
              if (el.topSearchInput) el.topSearchInput.value = '';
              if (el.searchClearBtn) el.searchClearBtn.classList.remove('visible');
              if (el.topSearchClearBtn) el.topSearchClearBtn.style.display = 'none';
            }
          }
          highlightComponent(newComp.id);
        }

        state.editingComponentId = null;
        state.pendingImageBase64 = '';
        if (el.editComponentId) el.editComponentId.value = '';
        el.componentForm.reset();
        renderAll();
        closeModal(el.componentModal);
      } catch (err) {
        console.error('Error saving component:', err);
        alert('Could not save component: ' + (err.message || err));
      } finally {
        if (el.saveComponentBtn) {
          el.saveComponentBtn.disabled = false;
          el.saveComponentBtn.textContent = 'Save Component';
        }
        if (el.imageDropArea) {
          el.imageDropArea.classList.remove('loading');
        }
      }
    });

    // Lend Form Submit
    el.lendForm.addEventListener('submit', e => {
      e.preventDefault();
      const compId = el.lendComponentId.value;
      const currentUser = window.authService ? window.authService.getCurrentUser() : null;
      const defaultAssignee = currentUser ? `${currentUser.displayName} (Self)` : 'Self (In-house)';
      const recipient = el.lendRecipientName.value.trim() || defaultAssignee;

      const loanData = {
        recipientName: recipient,
        recipientContact: el.lendRecipientContact.value.trim(),
        quantity: parseInt(el.lendQuantity.value, 10) || 1,
        dateGiven: el.lendDateGiven.value || new Date().toISOString().split('T')[0],
        returnDueDate: el.lendReturnDueDate.value.trim(),
        project: el.lendProject.value.trim() || 'General Usage',
        notes: el.lendNotes.value.trim()
      };

      try {
        window.componentStore.lendComponent(compId, loanData);
        renderAll();
        showToast('Component assigned to project successfully!');
        closeModal(el.lendModal);
      } catch (err) {
        alert(err.message);
      }
    });

    // Global Keyboard Shortcuts
    window.addEventListener('keydown', e => {
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      const isInputActive = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';

      // Press '/' to focus search
      if (e.key === '/' && !isInputActive) {
        e.preventDefault();
        setTab('inventory');
        el.searchInput.focus();
        el.searchInput.select();
      }

      // Press 'N' or 'n' to open new component modal
      if ((e.key === 'n' || e.key === 'N') && !isInputActive && !document.querySelector('.modal-backdrop.open')) {
        e.preventDefault();
        openNewComponentModal();
      }
    });

    setupImageUpload();
    setupModalDismiss();
    setupBackupHandlers();
    setupAuthHandlers();

    // Subscribe to store updates
    window.componentStore.subscribe(() => {
      renderAll();
    });

    // Cloud Sync Status Listener & Manual Sync Trigger
    if (window.componentStore) {
      window.componentStore.onSyncStatusChange = (status, msg) => {
        updateSyncBadgeUI(status, msg);
      };
      updateSyncBadgeUI(window.componentStore.syncStatus, window.componentStore.syncError);
    }

    if (el.headerCloudSyncBadge) {
      el.headerCloudSyncBadge.addEventListener('click', async () => {
        showToast('Initiating cloud sync...');
        const ok = await window.componentStore.syncToCloudNow();
        if (ok) {
          showToast('☁️ Vault successfully synced to Cloud Firestore!');
        } else {
          showToast('⚠️ Sync issue: ' + (window.componentStore.syncError || 'Check Firebase Auth or permissions'));
        }
      });
    }
  }

  // --- User Profile & Authentication Handlers ---
  // --- User Profile & Multi-Vault Handlers ---
  function updateUserProfileUI(user) {
    if (!user) return;
    state.currentUser = user;
    const initials = (user.displayName || user.username || 'VO')
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    if (el.headerUserAvatar) el.headerUserAvatar.textContent = initials;
    if (el.headerUserName) el.headerUserName.textContent = user.displayName;
    if (el.userMenuDisplayName) el.userMenuDisplayName.textContent = user.displayName;
    if (el.userMenuUsername) el.userMenuUsername.textContent = user.email || `@${user.username}`;

    // Sync mobile menu header and card
    if (el.mobileUserAvatar) el.mobileUserAvatar.textContent = initials;
    if (el.mobileMenuAvatar) el.mobileMenuAvatar.textContent = initials;
    if (el.mobileMenuDisplayName) el.mobileMenuDisplayName.textContent = user.displayName;
    if (el.mobileMenuUsername) el.mobileMenuUsername.textContent = user.email || `@${user.username}`;

    // Active Vault Badges
    const activeVault = window.componentStore ? window.componentStore.getActiveVault() : null;
    const vaultName = activeVault ? activeVault.name : 'Main Lab';
    if (el.headerActiveVaultBadge) el.headerActiveVaultBadge.textContent = vaultName;
    if (el.mobileActiveVaultBadge) el.mobileActiveVaultBadge.textContent = vaultName;

    renderVaultDropdown();
  }

  // --- Create & Edit Hardware Vault Modal Handlers ---
  function openCreateVault() {
    if (el.userDropdownMenu) el.userDropdownMenu.style.display = 'none';
    if (el.userProfileWrapper) el.userProfileWrapper.classList.remove('active');
    closeMobileMenu(false);
    if (el.createVaultNotice) el.createVaultNotice.style.display = 'none';
    if (el.createVaultForm) el.createVaultForm.reset();
    openModal(el.createVaultModal);
    setTimeout(() => el.vaultNameInput && el.vaultNameInput.focus(), 80);
  }

  function openEditVaultModal(vaultId) {
    if (!window.componentStore) return;
    const vaults = window.componentStore.getUserVaults();
    const vault = vaults.find(v => v.id === vaultId);
    if (!vault) return;

    if (el.userDropdownMenu) el.userDropdownMenu.style.display = 'none';
    if (el.userProfileWrapper) el.userProfileWrapper.classList.remove('active');
    closeMobileMenu(false);

    if (el.editVaultNotice) el.editVaultNotice.style.display = 'none';
    if (el.editVaultIdInput) el.editVaultIdInput.value = vault.id;
    if (el.editVaultNameInput) el.editVaultNameInput.value = vault.name;
    if (el.editVaultTaglineInput) el.editVaultTaglineInput.value = vault.tagline || '';

    openModal(el.editVaultModal);
    setTimeout(() => el.editVaultNameInput && el.editVaultNameInput.focus(), 80);
  }

  function renderVaultDropdown() {
    if (!window.componentStore) return;
    const vaults = window.componentStore.getUserVaults();
    const activeId = window.componentStore.getActiveVaultId();

    const html = vaults.map(v => {
      const isActive = v.id === activeId;
      return `
        <div class="user-vault-item ${isActive ? 'active' : ''}">
          <div class="user-vault-item-info" data-switch-vault-id="${v.id}" role="button" tabindex="0" title="Switch to ${escapeHTML(v.name)}">
            <div class="user-vault-item-name">${escapeHTML(v.name)}</div>
            ${v.tagline ? `<div class="user-vault-item-tag">${escapeHTML(v.tagline)}</div>` : ''}
          </div>
          <div class="user-vault-item-actions">
            ${isActive ? `
              <svg class="user-vault-item-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            ` : ''}
            <button type="button" class="user-vault-action-btn edit" data-edit-vault-id="${v.id}" title="Edit Vault Name & Tagline" aria-label="Edit ${escapeHTML(v.name)}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            ${vaults.length > 1 ? `
              <button type="button" class="user-vault-action-btn delete" data-delete-vault-id="${v.id}" title="Delete Vault" aria-label="Delete ${escapeHTML(v.name)}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    if (el.userVaultsList) el.userVaultsList.innerHTML = html;
    if (el.mobileUserVaultsList) el.mobileUserVaultsList.innerHTML = html;

    // Switch vault click handler (clicking the item info)
    document.querySelectorAll('[data-switch-vault-id]').forEach(elem => {
      elem.addEventListener('click', async (e) => {
        if (e.target.closest('.user-vault-item-actions') || e.target.closest('[data-edit-vault-id]') || e.target.closest('[data-delete-vault-id]')) {
          return;
        }
        const targetId = elem.getAttribute('data-switch-vault-id');
        if (targetId && window.componentStore) {
          await window.componentStore.switchVault(targetId);
          const active = window.componentStore.getActiveVault();
          const user = window.authService ? window.authService.getCurrentUser() : null;
          if (user) updateUserProfileUI(user);
          renderAll();
          showToast(`Switched to vault: ${active.name}`);
          if (el.userDropdownMenu) el.userDropdownMenu.style.display = 'none';
          if (el.userProfileWrapper) el.userProfileWrapper.classList.remove('active');
          closeMobileMenu();
        }
      });
    });

    // Edit vault click handler
    document.querySelectorAll('[data-edit-vault-id]').forEach(btn => {
      const handleEdit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        const vaultId = btn.getAttribute('data-edit-vault-id');
        if (vaultId) openEditVaultModal(vaultId);
      };
      btn.addEventListener('click', handleEdit);
      btn.addEventListener('pointerdown', (e) => e.stopPropagation());
    });

    // Delete vault click handler
    document.querySelectorAll('[data-delete-vault-id]').forEach(btn => {
      const handleDelete = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        const vaultId = btn.getAttribute('data-delete-vault-id');
        if (!vaultId || !window.componentStore) return;
        const vaults = window.componentStore.getUserVaults();
        const target = vaults.find(v => v.id === vaultId);
        const name = target ? target.name : 'this vault';

        if (confirm(`Are you sure you want to delete hardware vault "${name}"?\n\nAll components and custody logs in this vault will be permanently deleted.`)) {
          try {
            window.componentStore.deleteVault(vaultId);
            const user = window.authService ? window.authService.getCurrentUser() : null;
            if (user) updateUserProfileUI(user);
            renderAll();
            showToast(`Hardware Vault "${name}" deleted.`);
          } catch (err) {
            alert(err.message);
          }
        }
      };
      btn.addEventListener('click', handleDelete);
      btn.addEventListener('pointerdown', (e) => e.stopPropagation());
    });
  }

  function setupAuthHandlers() {
    // Toggle user profile dropdown
    if (el.userProfileBtn) {
      el.userProfileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = el.userDropdownMenu.style.display !== 'none';
        el.userDropdownMenu.style.display = isOpen ? 'none' : 'block';
        el.userProfileWrapper.classList.toggle('active', !isOpen);
      });
    }

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      if (el.userProfileWrapper && !el.userProfileWrapper.contains(e.target)) {
        if (el.userDropdownMenu) el.userDropdownMenu.style.display = 'none';
        if (el.userProfileWrapper) el.userProfileWrapper.classList.remove('active');
      }
    });

    if (el.openNewVaultBtn) el.openNewVaultBtn.addEventListener('click', openCreateVault);
    if (el.mobileNewVaultBtn) el.mobileNewVaultBtn.addEventListener('click', openCreateVault);

    // Create New Vault Form Submission
    if (el.createVaultForm) {
      el.createVaultForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          const name = el.vaultNameInput.value.trim();
          const tagline = el.vaultTaglineInput.value.trim();
          const includeStarter = el.vaultIncludeStarter ? el.vaultIncludeStarter.checked : true;
          if (!name) throw new Error('Vault name is required.');

          const newVault = await window.componentStore.createVault({ name, tagline, includeStarter });
          closeModal(el.createVaultModal);
          el.createVaultForm.reset();
          const user = window.authService ? window.authService.getCurrentUser() : null;
          if (user) updateUserProfileUI(user);
          renderAll();
          showToast(`Hardware Vault "${newVault.name}" created and loaded!`);
        } catch (err) {
          if (el.createVaultNotice) {
            el.createVaultNotice.textContent = err.message;
            el.createVaultNotice.className = 'auth-notice-banner error';
            el.createVaultNotice.style.display = 'block';
          }
        }
      });
    }

    // Edit Vault Form Submission
    if (el.editVaultForm) {
      el.editVaultForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          const vaultId = el.editVaultIdInput.value;
          const name = el.editVaultNameInput.value.trim();
          const tagline = el.editVaultTaglineInput.value.trim();
          if (!name) throw new Error('Vault name is required.');

          const updated = window.componentStore.updateVault(vaultId, { name, tagline });
          closeModal(el.editVaultModal);
          const user = window.authService ? window.authService.getCurrentUser() : null;
          if (user) updateUserProfileUI(user);
          renderAll();
          showToast(`Hardware Vault "${updated.name}" updated!`);
        } catch (err) {
          if (el.editVaultNotice) {
            el.editVaultNotice.textContent = err.message;
            el.editVaultNotice.className = 'auth-notice-banner error';
            el.editVaultNotice.style.display = 'block';
          }
        }
      });
    }

    // Sign out buttons
    const handleSignOut = () => {
      if (el.userDropdownMenu) el.userDropdownMenu.style.display = 'none';
      if (el.userProfileWrapper) el.userProfileWrapper.classList.remove('active');
      closeMobileMenu();
      if (window.authService) window.authService.logout();
    };

    if (el.signOutBtn) el.signOutBtn.addEventListener('click', handleSignOut);
    if (el.mobileSignOutBtn) el.mobileSignOutBtn.addEventListener('click', handleSignOut);

    // Shortcut: Used by Me (Self) in Lend Modal
    if (el.setSelfAssigneeBtn) {
      el.setSelfAssigneeBtn.addEventListener('click', () => {
        const u = window.authService ? window.authService.getCurrentUser() : null;
        const myName = u ? u.displayName : 'Self';
        el.lendRecipientName.value = el.lendRecipientName.value === myName ? '' : myName;
      });
    }

    // ================= STRICT GOOGLE LOGIN PORTAL HANDLERS =================
    // Portal Google Sign-In Button
    if (el.portalGoogleSignInBtn) {
      el.portalGoogleSignInBtn.addEventListener('click', async () => {
        try {
          showPortalNotice('Connecting to Google Identity Service...', false);
          await window.authService.loginWithGoogle();
        } catch (err) {
          showPortalNotice(err.message || 'Google Sign-In failed. Check Firebase config.', true);
          if (window.cloudDb && !window.cloudDb.isConfigured && el.cloudConfigModal) {
            setTimeout(() => {
              openCloudDbModal();
            }, 800);
          }
        }
      });
    }

    // ================= CLOUD DATABASE CONFIGURATION MODAL =================
    const openCloudDbModal = () => {
      const isAuth = !!(window.authService && window.authService.getCurrentUser());
      if (window.cloudDb && window.cloudDb.config && isAuth) {
        const cfg = window.cloudDb.config;
        if (el.firebaseApiKey) el.firebaseApiKey.value = cfg.apiKey || '';
        if (el.firebaseAuthDomain) el.firebaseAuthDomain.value = cfg.authDomain || '';
        if (el.firebaseProjectId) el.firebaseProjectId.value = cfg.projectId || '';
        if (el.firebaseStorageBucket) el.firebaseStorageBucket.value = cfg.storageBucket || '';
        if (el.firebaseAppId) el.firebaseAppId.value = cfg.appId || '';
      } else if (!isAuth) {
        // Strict Security: Never populate secret credentials for unauthenticated visitors
        if (el.firebaseApiKey) el.firebaseApiKey.value = '';
        if (el.firebaseAuthDomain) el.firebaseAuthDomain.value = '';
        if (el.firebaseProjectId) el.firebaseProjectId.value = '';
        if (el.firebaseStorageBucket) el.firebaseStorageBucket.value = '';
        if (el.firebaseAppId) el.firebaseAppId.value = '';
      }
      if (el.authorizedEmailsInput && window.authService && isAuth) {
        el.authorizedEmailsInput.value = window.authService.getAuthorizedEmails().join(', ');
      } else if (el.authorizedEmailsInput) {
        el.authorizedEmailsInput.value = '';
      }

      // Always reset sensitive inputs to masked password type when opening
      if (el.firebaseApiKey) el.firebaseApiKey.type = 'password';
      if (el.firebaseAppId) el.firebaseAppId.type = 'password';
      document.querySelectorAll('.password-toggle-btn').forEach(btn => {
        const eyeShow = btn.querySelector('.eye-show');
        const eyeHide = btn.querySelector('.eye-hide');
        if (eyeShow) eyeShow.style.display = 'block';
        if (eyeHide) eyeHide.style.display = 'none';
      });

      if (el.cloudConfigAlert) el.cloudConfigAlert.style.display = 'none';
      if (el.userDropdownMenu) el.userDropdownMenu.style.display = 'none';
      if (el.userProfileWrapper) el.userProfileWrapper.classList.remove('active');
      closeMobileMenu();
      openModal(el.cloudConfigModal);
    };

    if (el.openCloudConfigBtn) el.openCloudConfigBtn.addEventListener('click', openCloudDbModal);
    if (el.headerOpenCloudConfigBtn) el.headerOpenCloudConfigBtn.addEventListener('click', openCloudDbModal);
    if (el.mobileCloudConfigBtn) el.mobileCloudConfigBtn.addEventListener('click', openCloudDbModal);

    // Cloud Config Form Submit
    if (el.cloudConfigForm) {
      el.cloudConfigForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          const newCfg = {
            apiKey: el.firebaseApiKey.value.trim(),
            authDomain: el.firebaseAuthDomain.value.trim(),
            projectId: el.firebaseProjectId.value.trim(),
            storageBucket: el.firebaseStorageBucket.value.trim(),
            appId: el.firebaseAppId.value.trim()
          };
          if (el.authorizedEmailsInput && window.authService) {
            const raw = el.authorizedEmailsInput.value.split(',').map(e => e.trim()).filter(Boolean);
            window.authService.setAuthorizedEmails(raw);
          }
          if (!window.cloudDb) throw new Error('Cloud DB service not available.');
          const ok = await window.cloudDb.saveConfig(newCfg);
          if (ok) {
            updateCloudStatusUI();
            closeModal(el.cloudConfigModal);
            showPortalNotice('Firebase Cloud Database connected successfully!', false);
            showToast('Firebase Cloud Database connected!');
          } else {
            showCloudConfigNotice('Could not initialize Firebase with these keys. Ensure keys are valid.', true);
          }
        } catch (err) {
          showCloudConfigNotice(err.message, true);
        }
      });
    }

    // Clear Cloud Config Button (Switch back to Local)
    if (el.clearCloudConfigBtn) {
      el.clearCloudConfigBtn.addEventListener('click', async () => {
        if (window.cloudDb) await window.cloudDb.saveConfig(null);
        if (el.cloudConfigForm) el.cloudConfigForm.reset();
        updateCloudStatusUI();
        closeModal(el.cloudConfigModal);
        showPortalNotice('Operating in local offline storage mode.', false);
        showToast('Operating in local storage mode.');
      });
    }
  }

  function showPortalNotice(message, isError = true) {
    if (!el.portalNoticeBanner) return;
    el.portalNoticeBanner.textContent = message;
    el.portalNoticeBanner.className = 'auth-notice-banner ' + (isError ? 'error' : 'success');
    el.portalNoticeBanner.style.display = 'block';
  }

  function showCloudConfigNotice(message, isError = true) {
    if (!el.cloudConfigAlert) return;
    el.cloudConfigAlert.textContent = message;
    el.cloudConfigAlert.className = 'auth-notice-banner ' + (isError ? 'error' : 'success');
    el.cloudConfigAlert.style.display = 'block';
  }

  function updateCloudStatusUI() {
    const isCloud = window.cloudDb && window.cloudDb.isConfigured;
    if (el.portalCloudStatusText) {
      el.portalCloudStatusText.textContent = isCloud 
        ? 'Cloud Database: Connected (Firebase)' 
        : 'Local Database Active (Cloud sync ready)';
    }
    if (el.mobileMenuCloudText) {
      el.mobileMenuCloudText.textContent = isCloud 
        ? 'Cloud Connected (Firebase)' 
        : 'Local Offline Vault';
    }
    if (el.portalCloudDot) {
      el.portalCloudDot.style.background = isCloud ? 'var(--accent-teal)' : 'var(--accent-brass)';
      el.portalCloudDot.style.boxShadow = isCloud ? '0 0 6px var(--accent-teal)' : '0 0 6px var(--accent-brass)';
    }
    if (el.mobileMenuCloudDot) {
      el.mobileMenuCloudDot.style.background = isCloud ? 'var(--accent-teal)' : 'var(--accent-brass)';
      el.mobileMenuCloudDot.style.boxShadow = isCloud ? '0 0 6px var(--accent-teal)' : '0 0 6px var(--accent-brass)';
    }
    if (el.openCloudConfigBtn) {
      el.openCloudConfigBtn.style.display = isCloud ? 'none' : 'inline-flex';
    }
  }

  function updateAuthGate(user) {
    if (user) {
      // Authenticated: reveal main app, hide login portal
      if (el.loginPortal) el.loginPortal.style.display = 'none';
      if (el.appShell) el.appShell.style.display = 'block';
      updateUserProfileUI(user);
    } else {
      // Unauthenticated: hide main app completely, display login portal
      if (el.appShell) el.appShell.style.display = 'none';
      if (el.loginPortal) el.loginPortal.style.display = 'flex';
      updateCloudStatusUI();
    }
  }

  // --- Utility Functions ---
  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function sanitizeImageUrl(url) {
    if (!url || typeof url !== 'string') return getDefaultPlaceholderImg();
    const trimmed = url.trim();
    // Allow http, https, and blob URLs
    if (/^https?:\/\//i.test(trimmed) || /^blob:/i.test(trimmed)) {
      return trimmed;
    }
    // Allow relative asset paths (e.g. assets/ds18b20.png, ./assets/icon.svg)
    if (/^(\.\/|\/)?assets\/[\w\-\.\/]+\.(png|jpe?g|webp|svg|gif|ico)$/i.test(trimmed)) {
      return trimmed;
    }
    // Clean internal whitespace and newlines from data URIs
    const cleanData = trimmed.replace(/\s+/g, '');
    // Allow raster base64 images (PNG, JPEG, WEBP, GIF, AVIF, BMP)
    if (/^data:image\/(png|jpeg|jpg|webp|gif|avif|bmp);base64,[A-Za-z0-9+/=]+$/i.test(cleanData)) {
      return cleanData;
    }
    // Only allow safe static default placeholder SVG (no scripts, no on* event handlers, no foreignObject)
    if (cleanData.startsWith('data:image/svg+xml') && 
        !cleanData.toLowerCase().includes('<script') && 
        !cleanData.toLowerCase().includes('javascript:') &&
        !cleanData.toLowerCase().includes('onload') &&
        !cleanData.toLowerCase().includes('onerror') &&
        !cleanData.toLowerCase().includes('foreignobject')) {
      return cleanData;
    }
    return getDefaultPlaceholderImg();
  }

  function getDefaultPlaceholderImg() {
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(`
      <svg viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg">
        <rect width="240" height="180" fill="#0b0e13"/>
        <rect x="70" y="40" width="100" height="100" rx="14" fill="#1c222c" stroke="#3d7b8a" stroke-width="2"/>
        <circle cx="120" cy="90" r="22" fill="#232a36" stroke="#c8cdd0" stroke-width="1.5"/>
        <path d="M120 78 v24 M108 90 h24" stroke="#cfb36b" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `);
  }

  // --- Bootstrapping ---
  async function init() {
    applyTheme(state.theme);
    setupDelegatedInventoryListeners();
    setViewMode(state.viewMode);

    // Initialize History state for root page load
    if (!history.state) {
      const initialHash = window.location.hash.replace('#', '');
      let initialTab = 'inventory';
      if (initialHash === 'projects' || initialHash === 'borrowers') initialTab = 'borrowers';
      else if (initialHash === 'activity' || initialHash === 'log') initialTab = 'activity';
      history.replaceState({ type: 'tab', tab: initialTab }, '', '#' + tabToHash(initialTab));
    }

    // Initialize Cloud DB before checking authentication
    if (window.cloudDb && typeof window.cloudDb.whenReady === 'function') {
      try {
        await window.cloudDb.whenReady();
      } catch (e) {
        console.warn('CloudDb initialization wait:', e);
      }
    }

    // Initialize Authentication & Strict Login Gate
    if (window.authService) {
      await window.authService.init();
      const user = window.authService.getCurrentUser();
      
      updateAuthGate(user);
      if (user && window.componentStore) {
        await window.componentStore.setVaultUser(user.id);
      }

      window.authService.onAuthChange(async (event, u) => {
        if (event === 'login' || event === 'switch') {
          updateAuthGate(u);
          if (u && window.componentStore) {
            await window.componentStore.setVaultUser(u.id);
          }
          closeModal(el.authModal);
          renderAll();
        } else if (event === 'logout') {
          updateAuthGate(null);
          renderAll();
        }
      });

      // Check if returning from a mobile Google Sign-In redirect
      if (window.cloudDb && typeof window.cloudDb.checkRedirectResult === 'function') {
        window.cloudDb.checkRedirectResult().then(async googleUser => {
          if (googleUser && window.authService) {
            await window.authService.loginWithGoogle(googleUser);
          }
        }).catch(err => {
          console.warn('Redirect login check:', err);
        });
      }
    } else {
      updateAuthGate(null);
    }

    // Connect reactive Cloud Sync badge in header
    if (window.componentStore) {
      window.componentStore.onSyncStatusChange = (status, msg) => {
        updateSyncBadgeUI(status, msg);
      };
      updateSyncBadgeUI(window.componentStore.syncStatus, window.componentStore.syncError);
    }
    window.addEventListener('cv_sync_status', (e) => {
      if (e.detail) {
        updateSyncBadgeUI(e.detail.status, e.detail.error);
      }
    });

    initEventBindings();
    renderAll();

    setupServiceWorker();
    setupPwaInstall();
    initUiUxEssentials();
  }

  // --- Progressive Web App (PWA) & Mobile Installation ---
  function setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      // Auto-reload immediately when new service worker activates and claims control
      let isRefreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!isRefreshing) {
          isRefreshing = true;
          window.location.reload();
        }
      });

      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then(reg => {
            console.log('[PWA] Service Worker active with scope:', reg.scope);
            // Proactively check for updates periodically (every 45s)
            setInterval(() => {
              reg.update().catch(() => {});
            }, 45000);
            // Check immediately when user returns to this tab
            document.addEventListener('visibilitychange', () => {
              if (document.visibilityState === 'visible') {
                reg.update().catch(() => {});
              }
            });
            window.addEventListener('focus', () => {
              reg.update().catch(() => {});
            });
          })
          .catch(err => {
            console.warn('[PWA] Service Worker registration failed:', err);
          });
      });
    }
  }

  let deferredInstallPrompt = null;

  function setupPwaInstall() {
    const installBanner = document.getElementById('pwaInstallBanner');
    const installBannerBtn = document.getElementById('pwaInstallBannerBtn');
    const dismissBannerBtn = document.getElementById('pwaDismissBannerBtn');
    const mobileInstallBtn = document.getElementById('mobileInstallAppBtn');
    const iosInstallModal = document.getElementById('iosInstallModal');
    const closeIosInstallBtn = document.getElementById('closeIosInstallBtn');
    const confirmIosInstallBtn = document.getElementById('confirmIosInstallBtn');
    const iosInstallBackdrop = document.getElementById('iosInstallBackdrop');

    const isIos = () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

    if (isStandalone()) {
      if (mobileInstallBtn) {
        const subtitle = document.getElementById('mobileInstallSubtitle');
        const badge = document.getElementById('mobileInstallBadge');
        if (subtitle) subtitle.textContent = 'App Installed & Active';
        if (badge) {
          badge.textContent = 'INSTALLED';
          badge.className = 'badge badge-success';
        }
      }
      return;
    }

    // Capture browser install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      
      // On mobile viewports, show bottom install banner if not dismissed during this session
      if (!sessionStorage.getItem('pwa_banner_dismissed') && window.innerWidth <= 900) {
        setTimeout(() => {
          if (installBanner) installBanner.style.display = 'flex';
        }, 2500);
      }
    });

    const triggerInstallFlow = async () => {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        if (choice && choice.outcome === 'accepted') {
          console.log('[PWA] User accepted installation prompt');
        }
        deferredInstallPrompt = null;
        if (installBanner) installBanner.style.display = 'none';
        closeMobileMenu();
      } else if (isIos()) {
        closeMobileMenu(false);
        if (iosInstallModal) openModal(iosInstallModal);
      } else {
        alert('To install Component Vault on your phone:\n\n1. Open your browser menu (⋮ or ⋯)\n2. Tap "Install App" or "Add to Home screen"');
        closeMobileMenu();
      }
    };

    if (installBannerBtn) {
      installBannerBtn.addEventListener('click', triggerInstallFlow);
    }

    if (mobileInstallBtn) {
      mobileInstallBtn.addEventListener('click', triggerInstallFlow);
    }

    if (dismissBannerBtn && installBanner) {
      dismissBannerBtn.addEventListener('click', () => {
        installBanner.style.display = 'none';
        sessionStorage.setItem('pwa_banner_dismissed', 'true');
      });
    }

    if (confirmIosInstallBtn && iosInstallModal) {
      confirmIosInstallBtn.addEventListener('click', () => {
        closeModal(iosInstallModal);
      });
    }

    window.addEventListener('appinstalled', () => {
      console.log('[PWA] Application successfully installed');
      if (installBanner) installBanner.style.display = 'none';
      deferredInstallPrompt = null;
    });
  }

  // --- UI/UX Essentials: Scroll Progress, Back to Top, Password Toggles, Shortcuts, FAQ & Compliance ---
  function initUiUxEssentials() {
    const scrollProgressBar = document.getElementById('scrollProgressBar');
    const backToTopBtn = document.getElementById('backToTopBtn');

    // 1. Scroll Progress Bar & Floating Back-to-Top (Throttled with requestAnimationFrame)
    let isScrollTicking = false;
    const onScroll = () => {
      if (!isScrollTicking) {
        window.requestAnimationFrame(() => {
          const scrollTop = window.scrollY || document.documentElement.scrollTop;
          const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
          if (scrollProgressBar && scrollHeight > 0) {
            const progress = Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100));
            scrollProgressBar.style.width = `${progress}%`;
            scrollProgressBar.setAttribute('aria-valuenow', Math.round(progress));
          }

          if (backToTopBtn) {
            if (scrollTop > 240) {
              backToTopBtn.classList.add('visible');
            } else {
              backToTopBtn.classList.remove('visible');
            }
          }
          isScrollTicking = false;
        });
        isScrollTicking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // 2. Password Visibility Toggles
    document.querySelectorAll('.password-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-toggle-target');
        const input = document.getElementById(targetId);
        if (!input) return;

        const eyeShow = btn.querySelector('.eye-show');
        const eyeHide = btn.querySelector('.eye-hide');

        if (input.type === 'password') {
          input.type = 'text';
          if (eyeShow) eyeShow.style.display = 'none';
          if (eyeHide) eyeHide.style.display = 'block';
          btn.setAttribute('aria-label', 'Hide password');
        } else {
          input.type = 'password';
          if (eyeShow) eyeShow.style.display = 'block';
          if (eyeHide) eyeHide.style.display = 'none';
          btn.setAttribute('aria-label', 'Show password');
        }
      });
    });

    // 3. Global Keyboard Shortcuts: Ctrl+K or / to search, ? for FAQ Guide, Esc to close
    window.addEventListener('keydown', e => {
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      const isInput = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = (window.innerWidth <= 900) 
          ? document.getElementById('topSearchInput') 
          : document.getElementById('searchInput');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      } else if (e.key === '/' && !isInput) {
        e.preventDefault();
        const searchInput = (window.innerWidth <= 900) 
          ? document.getElementById('topSearchInput') 
          : document.getElementById('searchInput');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      } else if (e.key === '?' && !isInput) {
        e.preventDefault();
        const labFaqModal = document.getElementById('labFaqModal');
        if (labFaqModal) openModal(labFaqModal);
      }
    });

    // 4. Quick FAQ Modal Trigger & Accordion Behavior
    const openLabFaqBtn = document.getElementById('openLabFaqBtn');
    const labFaqModal = document.getElementById('labFaqModal');
    if (openLabFaqBtn && labFaqModal) {
      openLabFaqBtn.addEventListener('click', () => {
        openModal(labFaqModal);
      });
    }

    document.querySelectorAll('.faq-question-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        if (!item) return;
        const isOpen = item.classList.contains('open');

        // Close siblings for clean accordion experience
        document.querySelectorAll('.faq-item').forEach(other => {
          if (other !== item) {
            other.classList.remove('open');
            const otherBtn = other.querySelector('.faq-question-btn');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          }
        });

        if (isOpen) {
          item.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });

    // 5. Compliance & Lab Storage Notice Banner
    const complianceBanner = document.getElementById('complianceBanner');
    const dismissComplianceBtn = document.getElementById('dismissComplianceBtn');
    if (complianceBanner) {
      const acknowledged = localStorage.getItem('vault_storage_notice_ack');
      if (!acknowledged) {
        setTimeout(() => {
          complianceBanner.style.display = 'block';
        }, 1200);
      }
      if (dismissComplianceBtn) {
        dismissComplianceBtn.addEventListener('click', () => {
          complianceBanner.style.display = 'none';
          localStorage.setItem('vault_storage_notice_ack', 'true');
        });
      }
    }

    // 6. Service Worker Update Notification
    setupServiceWorkerUpdates();
  }

  function updateSyncBadgeUI(status, msg) {
    if (!el.headerSyncDot || !el.headerSyncText) return;
    el.headerSyncDot.className = 'sync-indicator-dot ' + (status || 'synced');
    if (status === 'syncing') {
      el.headerSyncText.textContent = 'Syncing...';
      if (el.headerCloudSyncBadge) el.headerCloudSyncBadge.title = 'Syncing changes to Cloud Firestore...';
    } else if (status === 'error') {
      el.headerSyncText.textContent = 'Sync Error';
      if (el.headerCloudSyncBadge) el.headerCloudSyncBadge.title = `Cloud sync issue: ${msg || 'Check Firebase Auth'}. Click to retry.`;
    } else if (status === 'offline') {
      el.headerSyncText.textContent = 'Local Only';
      if (el.headerCloudSyncBadge) el.headerCloudSyncBadge.title = 'Running locally. Configure Cloud DB in settings to sync.';
    } else {
      el.headerSyncText.textContent = 'Synced';
      if (el.headerCloudSyncBadge) el.headerCloudSyncBadge.title = 'Cloud Database: All components safely synced. Click to force sync.';
    }
  }

  function setupServiceWorkerUpdates() {
    if (el.swUpdateReloadBtn) {
      el.swUpdateReloadBtn.addEventListener('click', () => {
        window.location.reload();
      });
    }

    if (el.swUpdateDismissBtn) {
      el.swUpdateDismissBtn.addEventListener('click', () => {
        if (el.swUpdateBanner) el.swUpdateBanner.style.display = 'none';
      });
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        reg.addEventListener('updatefound', () => {
          const installingWorker = reg.installing;
          if (installingWorker) {
            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                if (el.swUpdateBanner) {
                  el.swUpdateBanner.style.display = 'flex';
                }
              }
            });
          }
        });
      }).catch(() => {});
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
