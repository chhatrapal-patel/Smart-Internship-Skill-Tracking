/**
 * Renders the sidebar navigation component
 * @param {string} activeLink - The currently active link identifier
 * @param {string} role - 'student' | 'company' | 'admin'
 * @param {object} counts - Optional counts for badges { apps: 0 }
 */
export function renderSidebar(activeLink = 'dashboard', role = 'student', counts = { apps: 0 }) {
  const studentLinks = [
    { section: 'MAIN MENU', links: [
      { id: 'dashboard', icon: 'layout-dashboard', label: 'Overview', href: '#/dashboard?tab=overview' },
      { id: 'internships', icon: 'search', label: 'Browse Internships', href: '#/internships' },
      { id: 'applications', icon: 'file-text', label: 'My Applications', href: '#/dashboard?tab=applications', badge: counts.apps || '' },
    ]},
    { section: 'ACCOUNT', links: [
      { id: 'profile', icon: 'user', label: 'My Profile', href: '#/profile?tab=info' },
      { id: 'settings', icon: 'settings', label: 'Account Settings', href: '#/profile?tab=settings' },
    ]}
  ];

  const companyLinks = [
    { section: 'RECRUITMENT', links: [
      { id: 'dashboard', icon: 'layout-dashboard', label: 'Dashboard', href: '#/company?tab=dashboard' },
      { id: 'post', icon: 'plus-circle', label: 'Post Internship', href: '#/company?tab=post' },
      { id: 'applicants', icon: 'users', label: 'Manage Applicants', href: '#/company?tab=applicants' },
    ]},
    { section: 'MANAGEMENT', links: [
      { id: 'listings', icon: 'list', label: 'My Listings', href: '#/company?tab=listings' },
      { id: 'analytics', icon: 'bar-chart-3', label: 'Hiring Analytics', href: '#/company?tab=analytics' },
    ]}
  ];

  const adminLinks = [
    { section: 'SYSTEM OVERVIEW', links: [
      { id: 'dashboard', icon: 'layout-dashboard', label: 'Admin Control', href: '#/admin?tab=dashboard' },
      { id: 'analytics', icon: 'activity', label: 'System Health', href: '#/admin?tab=analytics' },
    ]},
    { section: 'USER MANAGEMENT', links: [
      { id: 'users', icon: 'users', label: 'All Users', href: '#/admin?tab=users' },
      { id: 'companies', icon: 'building-2', label: 'Companies', href: '#/admin?tab=companies' },
    ]},
    { section: 'CONFIGURATION', links: [
      { id: 'settings', icon: 'settings', label: 'Global Settings', href: '#/admin?tab=settings' },
    ]}
  ];

  const linkSets = { student: studentLinks, company: companyLinks, admin: adminLinks };
  const sections = linkSets[role] || studentLinks;

  const user = JSON.parse(localStorage.getItem('user')) || {};
  const userName = user.name || 'User';
  const userRoleText = role.charAt(0).toUpperCase() + role.slice(1);
  const avatarInitial = (user.avatar && user.avatar.length > 0) ? user.avatar : userName.charAt(0).toUpperCase();
  const avatarColor = user.color || 'var(--color-primary-500)';

  return `
    <div class="sidebar-overlay" id="sidebarOverlay"></div>
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-brand">
        <div class="sidebar-brand-icon">
          <i data-lucide="zap"></i>
        </div>
        <div class="sidebar-brand-text">
          SkillBridge
          <small>v1.0.0 Stable</small>
        </div>
      </div>

      <nav class="sidebar-nav">
        ${sections.map(section => `
          <div class="sidebar-section-label">${section.section}</div>
          ${section.links.map(link => `
            <a href="${link.href}" class="sidebar-link ${link.id === activeLink ? 'active' : ''}" data-nav="${link.id}">
              <i data-lucide="${link.icon}"></i>
              ${link.label}
              ${link.badge ? `<span class="link-badge">${link.badge}</span>` : ''}
            </a>
          `).join('')}
        `).join('')}
        
        <div class="sidebar-section-label" style="margin-top: var(--space-4)">Quick Links</div>
        ${role === 'student' ? `
        <a href="#/internships" class="sidebar-link ${activeLink === 'browse' ? 'active' : ''}" data-nav="browse">
          <i data-lucide="search"></i>
          Browse Internships
        </a>
        ` : ''}
        <a href="#/help" class="sidebar-link" data-nav="help">
          <i data-lucide="help-circle"></i>
          Help Center
        </a>
      </nav>

      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="avatar" style="background: ${avatarColor};">${avatarInitial}</div>
          <div class="sidebar-user-info">
            <div class="name">${userName}</div>
            <div class="role">${userRoleText}</div>
          </div>
          <button class="logout-btn" onclick="localStorage.clear(); window.location.hash='/login';" title="Sign Out" style="width: auto; padding: 0 var(--space-3); gap: 8px;">
            <i data-lucide="log-out" style="width:16px;height:16px;"></i>
            <span style="font-size: 12px; font-weight: 600;">Logout</span>
          </button>
        </div>
      </div>
    </aside>
    <style>
      .logout-btn {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.6);
        width: 36px;
        height: 36px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .logout-btn:hover {
        background: var(--color-danger-500);
        color: white;
        border-color: var(--color-danger-600);
        transform: translateY(-2px);
      }
    </style>
  `;
}

/**
 * Renders the top navbar
 * @param {string} title - Page title to display
 */
export function renderNavbar(title = 'Dashboard', notifications = []) {
  const hasNotifications = notifications.length > 0;
  return `
    <nav class="navbar" id="navbar">
      <div class="navbar-left">
        <button class="menu-toggle" id="menuToggle" aria-label="Toggle sidebar">
          <i data-lucide="menu"></i>
        </button>
        <h4 style="font-size: var(--font-size-lg); font-weight: var(--font-weight-semibold);">${title}</h4>
      </div>
      <div class="navbar-right">
        <div class="navbar-search">
          <i data-lucide="search"></i>
          <input type="text" placeholder="Search anything..." id="globalSearch" />
        </div>
        <div class="navbar-notifications" id="notificationsBtn" aria-label="Notifications" data-has-notifs="${hasNotifications}">
          <i data-lucide="bell"></i>
          ${hasNotifications ? '<span class="notification-dot"></span>' : ''}
        </div>
        <div class="avatar" style="background: ${localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).color : 'var(--gradient-card-1)'}; cursor:pointer; width:36px; height:36px; font-size: 0.8rem;">
          ${localStorage.getItem('user') ? (JSON.parse(localStorage.getItem('user')).avatar || JSON.parse(localStorage.getItem('user')).name.charAt(0).toUpperCase()) : 'U'}
        </div>
      </div>
    </nav>
    <script>
      window.currentNotifications = ${JSON.stringify(notifications)};
    </script>
  `;
}

/**
 * Sets up sidebar toggle for mobile
 */
export function initSidebarToggle() {
  // Logout functionality
  const logoutLinks = document.querySelectorAll('a[href="#/login"]');
  logoutLinks.forEach(link => {
    link.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      api.token = null;
      api.user = null;
    });
  });

  // Sidebar toggle
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');

  if (menuToggle && sidebar && overlay) {
    const toggle = () => {
      sidebar.classList.toggle('active');
      overlay.classList.toggle('active');
    };
    menuToggle.addEventListener('click', toggle);
    overlay.addEventListener('click', toggle);
    
    // Close sidebar on link click (mobile)
    sidebar.querySelectorAll('.sidebar-link').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 1024) toggle();
      });
    });
  }

  // Global Search
  const globalSearch = document.getElementById('globalSearch');
  if (globalSearch) {
    globalSearch.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && e.target.value.trim()) {
        window.location.hash = `/internships?q=${encodeURIComponent(e.target.value.trim())}`;
      }
    });
  }

  // Notifications
  const notifBtn = document.getElementById('notificationsBtn');
  if (notifBtn) {
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const existing = document.getElementById('notifDropdown');
      if (existing) {
        existing.remove();
        return;
      }

      const notifications = window.currentNotifications || [];
      const dropdown = document.createElement('div');
      dropdown.id = 'notifDropdown';
      dropdown.className = 'card animate-fade-in-up';
      dropdown.style.cssText = `
        position: absolute; top: 60px; right: 20px; width: 340px; z-index: 1000;
        padding: var(--space-4); box-shadow: var(--shadow-xl); background: white; border: 1px solid var(--color-gray-100);
      `;
      
      dropdown.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-4);">
          <h4 style="margin:0; font-size: 15px; font-weight: 800;">Notifications</h4>
          <span id="markAllRead" style="font-size: 11px; color: var(--color-primary-500); cursor: pointer; font-weight: 700;">Mark all as read</span>
        </div>
        <div id="notifList" style="display:flex;flex-direction:column;gap:var(--space-3);">
          ${notifications.length > 0 ? notifications.map(n => `
            <div style="padding:var(--space-3); background: var(--color-gray-50); border-radius: 12px; border-left: 3px solid ${n.type === 'success' ? '#10b981' : '#6366f1'};">
              <div style="font-weight:700; font-size: 13px; color: #1e293b; margin-bottom: 2px;">${n.title}</div>
              <div style="color: var(--color-gray-500); font-size: 12px; line-height: 1.4;">${n.message}</div>
              <div style="font-size: 10px; color: var(--color-gray-400); margin-top: 6px; font-weight: 600;">${n.time || 'Just now'}</div>
            </div>
          `).join('') : `
            <div style="text-align:center; padding: 32px 0; color: var(--color-gray-400);">
              <i data-lucide="check-circle-2" style="width:32px; height:32px; margin-bottom: 8px; opacity: 0.5;"></i>
              <p style="margin:0; font-size: 13px; font-weight: 600;">All caught up!</p>
            </div>
          `}
        </div>
      `;
      
      notifBtn.parentElement.appendChild(dropdown);
      if (window.lucide) window.lucide.createIcons();

      dropdown.querySelector('#markAllRead')?.addEventListener('click', () => {
        window.currentNotifications = [];
        const dot = notifBtn.querySelector('.notification-dot');
        if (dot) dot.remove();
        const list = dropdown.querySelector('#notifList');
        list.innerHTML = `
          <div style="text-align:center; padding: 32px 0; color: var(--color-gray-400);">
            <i data-lucide="check-circle-2" style="width:32px; height:32px; margin-bottom: 8px; opacity: 0.5;"></i>
            <p style="margin:0; font-size: 13px; font-weight: 600;">All caught up!</p>
          </div>
        `;
        if (window.lucide) window.lucide.createIcons();
        toast.success('Notifications cleared');
      });
      
      const closeDropdown = (event) => {
        if (!dropdown.contains(event.target) && event.target !== notifBtn) {
          dropdown.remove();
          document.removeEventListener('click', closeDropdown);
        }
      };
      document.addEventListener('click', closeDropdown);
    });
  }
}
