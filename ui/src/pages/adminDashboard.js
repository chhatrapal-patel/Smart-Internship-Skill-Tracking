import { api } from '../api.js';
import { toast } from '../components/toast.js';

export function renderAdminDashboard(container) {
  let stats = { totalUsers: 6, companies: 3, internships: 3, applications: 2 };
  let users = [];
  let internships = [];
  let allApplications = [];
  let currentSection = 'Dashboard';

  const loadData = async () => {
    try {
      const [statsData, usersData, internshipsData] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/internships')
      ]);
      stats = { ...statsData, trend: { users: '+20%', companies: '+15%', internships: '+25%', apps: '+10%' } };
      users = usersData;
      internships = (internshipsData || []).map(int => ({
        ...int,
        stipend: int.stipend.toString().startsWith('₹') ? int.stipend : `₹${int.stipend}${int.stipend.includes('/') ? '' : '/mo'}`,
        location: int.location.charAt(0).toUpperCase() + int.location.slice(1)
      }));
      allApplications = [
        { id: 1, student: 'Aryan Sharma', company: 'Google Cloud', role: 'Frontend Engineer', status: 'Shortlisted', date: 'Apr 27, 2026' },
        { id: 2, student: 'Priya Verma', company: 'Meta Labs', role: 'UI/UX Intern', status: 'Under Review', date: 'Apr 27, 2026' },
        { id: 3, student: 'Google Cloud', company: 'Internal', role: 'Corporate Verification', status: 'Approved', date: 'Apr 27, 2026' }
      ];
      render();
    } catch (err) {
      toast.error('Sync failed');
    }
  };

  const showSideDrawer = (user) => {
    let activeTab = 'Overview';
    const isCompany = user.role === 'company';
    const isAdmin = user.role === 'admin';
    const drawerOverlay = document.createElement('div');
    drawerOverlay.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.3); backdrop-filter: blur(4px); z-index: 3000; display: flex; justify-content: flex-end;';
    
    const renderDrawer = () => {
      drawerOverlay.innerHTML = `
        <div class="side-drawer animate-slide-in-right" style="width: 520px; height: 100%; background: white; box-shadow: -10px 0 50px rgba(0,0,0,0.15); display: flex; flex-direction: column;">
          <div style="padding: 32px; display: flex; align-items: flex-start; justify-content: space-between;">
             <div style="display: flex; align-items: center; gap: 20px;">
                <div style="width: 72px; height: 72px; border-radius: 16px; background: ${isAdmin ? '#f5f3ff' : isCompany ? '#eef2ff' : '#dcfce7'}; color: ${isAdmin ? '#8b5cf6' : isCompany ? '#6366f1' : '#16a34a'}; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; border: 4px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                  ${user.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 style="margin: 0; font-size: 22px; color: #0f172a; display: flex; align-items: center; gap: 8px;">
                    ${user.name} <i data-lucide="check-circle-2" style="width: 18px; color: #3b82f6;"></i>
                  </h3>
                  <p style="margin: 4px 0 0 0; font-size: 14px; color: #6366f1; font-weight: 700; text-transform: uppercase;">${user.role} ACCOUNT</p>
                  <p style="margin: 2px 0 0 0; font-size: 13px; color: #94a3b8;">${user.email}</p>
                </div>
             </div>
             <button class="close-drawer" style="background: #f8fafc; border: none; cursor: pointer; color: #94a3b8; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center;"><i data-lucide="x" style="width: 18px;"></i></button>
          </div>

          <div style="display: flex; padding: 0 32px; border-bottom: 1px solid #f1f5f9; gap: 32px;">
            ${['Overview', 'Profile', 'Applications', 'Activity'].map(tab => `
              <div class="drawer-tab" data-tab="${tab}" style="padding: 16px 0; color: ${activeTab === tab ? '#6366f1' : '#94a3b8'}; border-bottom: 2px solid ${activeTab === tab ? '#6366f1' : 'transparent'}; font-size: 14px; font-weight: 800; cursor: pointer;">${tab}</div>
            `).join('')}
          </div>

          <div style="flex: 1; overflow-y: auto; padding: 32px;">
            ${activeTab === 'Overview' ? `
              <div class="animate-fade-in">
                <section style="margin-bottom: 32px;">
                   <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                     <h4 style="margin: 0; font-size: 15px; color: #0f172a; font-weight: 800;">Basic Information</h4>
                     <button style="font-size: 12px; color: #6366f1; background: #f5f3ff; border: 1px solid #e0e7ff; padding: 4px 12px; border-radius: 6px; font-weight: 700;">Edit</button>
                   </div>
                   <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                     <div><p style="font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">FULL NAME</p><p style="font-size: 14px; font-weight: 600; color: #1e293b;">${user.name}</p></div>
                     <div><p style="font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">EMAIL ADDRESS</p><p style="font-size: 14px; font-weight: 600; color: #1e293b;">${user.email}</p></div>
                     <div><p style="font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">ROLE</p><p style="font-size: 14px; font-weight: 600;">${user.role.toUpperCase()}</p></div>
                     <div><p style="font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">LOCATION</p><p style="font-size: 14px; font-weight: 600;">${user.location || 'N/A'}</p></div>
                   </div>
                </section>
                <section style="margin-bottom: 32px;">
                   <h4 style="margin: 0 0 20px 0; font-size: 15px; color: #0f172a; font-weight: 800;">Verification Status</h4>
                   <div style="background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 16px; padding: 20px;">
                     <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
                       <span style="font-size: 14px; color: #64748b;">Email Verified</span>
                       <span style="font-size: 14px; color: #10b981; font-weight: 700;"><i data-lucide="check" style="width: 14px; vertical-align: middle;"></i> Verified</span>
                     </div>
                     <div style="display: flex; justify-content: space-between;">
                       <span style="font-size: 14px; color: #64748b;">Account Status</span>
                       <span style="font-size: 14px; color: #10b981; font-weight: 700;">Active</span>
                     </div>
                   </div>
                </section>
                <section>
                   <h4 style="margin: 0 0 20px 0; font-size: 15px; color: #0f172a; font-weight: 800;">Activity Summary</h4>
                   <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                      <div style="background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #f1f5f9;">
                         <div style="font-size: 20px; font-weight: 800; color: #0f172a;">${isAdmin ? '1.2k' : isCompany ? '42' : '15'}</div>
                         <div style="font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; margin-top: 4px;">${isAdmin ? 'Log Actions' : isCompany ? 'Postings' : 'Apps'}</div>
                      </div>
                      <div style="background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #f1f5f9;">
                         <div style="font-size: 20px; font-weight: 800; color: #0f172a;">${isAdmin ? '0' : '2'}</div>
                         <div style="font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; margin-top: 4px;">Alerts</div>
                      </div>
                   </div>
                </section>
              </div>
            ` : activeTab === 'Profile' ? `
              <div class="animate-fade-in">
                <h4 style="margin: 0 0 20px 0; font-size: 15px; color: #0f172a; font-weight: 800;">Identity Credentials</h4>
                <div style="background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 20px; padding: 28px;">
                  ${isAdmin ? `
                    <div style="margin-bottom: 24px;"><p style="font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">ADMIN KEY</p><p style="font-size: 14px; font-weight: 800; color: #1e293b; font-family: monospace;">SB-SUPER-ADMIN-01</p></div>
                    <div style="margin-bottom: 24px;"><p style="font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">SECURITY ACCESS</p><div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px;"><span style="font-size: 10px; background: white; padding: 4px 8px; border-radius: 4px; border: 1px solid #e2e8f0; font-weight: 700;">USER_MGMT</span><span style="font-size: 10px; background: white; padding: 4px 8px; border-radius: 4px; border: 1px solid #e2e8f0; font-weight: 700;">DB_READ</span></div></div>
                  ` : isCompany ? `
                    <div style="margin-bottom: 24px;"><p style="font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">CIN NUMBER</p><p style="font-size: 16px; font-weight: 800; color: #1e293b;">L17110MH1973PLC019786</p></div>
                    <div style="margin-bottom: 24px;"><p style="font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">GSTIN</p><p style="font-size: 16px; font-weight: 800; color: #1e293b;">22AAAAA0000A1Z5</p></div>
                  ` : `
                    <div style="margin-bottom: 24px;"><p style="font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">UNIVERSITY</p><p style="font-size: 16px; font-weight: 800; color: #1e293b;">${user.university || 'IIT Bombay'}</p></div>
                    <div style="margin-bottom: 24px;"><p style="font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">CGPA SCORE</p><p style="font-size: 20px; font-weight: 900; color: #6366f1;">9.4 / 10.0</p></div>
                  `}
                </div>
                <div style="margin-top: 24px; padding: 20px; border: 2px dashed #e2e8f0; border-radius: 16px; display: flex; align-items: center; gap: 16px; cursor: pointer; transition: 0.2s;" onmouseover="this.style.borderColor='#6366f1'; this.style.background='#f5f3ff'" onmouseout="this.style.borderColor='#e2e8f0'; this.style.background='transparent'">
                   <div style="width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.05);"><i data-lucide="file-text" style="width: 24px; color: #6366f1;"></i></div>
                   <div><p style="margin:0; font-size: 14px; font-weight: 800; color: #0f172a;">${isAdmin ? 'Access Logs' : isCompany ? 'Tax Documents' : 'Full Resume.pdf'}</p><p style="margin:2px 0 0 0; font-size: 12px; color: #94a3b8;">Click to view</p></div>
                </div>
              </div>
            ` : activeTab === 'Applications' ? `
              <div class="animate-fade-in">
                <h4 style="margin: 0 0 20px 0; font-size: 15px; color: #0f172a; font-weight: 800;">Recent History</h4>
                <div style="display: flex; flex-direction: column; gap: 16px;">
                   ${[1, 2, 3].map(i => `
                     <div style="padding: 20px; border: 1px solid #f1f5f9; border-radius: 16px; background: white;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                          <h5 style="margin:0; font-size: 14px; font-weight: 800;">${isAdmin ? 'System Audit' : isCompany ? 'Job Post' : 'Applied to Google'}</h5>
                          <span style="font-size: 10px; font-weight: 900; color: #16a34a;">SUCCESS</span>
                        </div>
                        <p style="margin:0; font-size: 12px; color: #94a3b8;">${i} day${i > 1 ? 's' : ''} ago</p>
                     </div>
                   `).join('')}
                </div>
              </div>
            ` : `
              <div class="animate-fade-in">
                <h4 style="margin: 0 0 20px 0; font-size: 15px; color: #0f172a; font-weight: 800;">Activity Feed</h4>
                <div style="display: flex; flex-direction: column; gap: 20px;">
                   ${[1, 2, 3, 4].map(i => `
                     <div style="display: flex; gap: 16px; align-items: flex-start;">
                        <div style="width: 10px; height: 10px; border-radius: 50%; background: #6366f1; margin-top: 5px; box-shadow: 0 0 8px rgba(99, 102, 241, 0.4);"></div>
                        <div><p style="margin:0; font-size: 13px; font-weight: 700; color: #1e293b;">${isAdmin ? 'Security Protocol Update' : 'New Internship Match'}</p><p style="margin:2px 0 0 0; font-size: 11px; color: #94a3b8;">Today at 10:45 AM</p></div>
                     </div>
                   `).join('')}
                </div>
              </div>
            `}
          </div>

          <div style="padding: 24px 32px; border-top: 1px solid #f1f5f9; display: flex; gap: 16px; background: #f8fafc;">
            <button id="drawerBlockBtn" style="flex: 1; height: 50px; background: #fff1f2; border: 1.5px solid #fee2e2; color: #ef4444; border-radius: 12px; font-size: 14px; font-weight: 800; cursor: pointer;" ${isAdmin ? 'disabled style="opacity: 0.5;"' : ''}>BLOCK USER</button>
            <button class="close-drawer" style="flex: 1; height: 50px; background: white; border: 1.5px solid #e2e8f0; color: #1e293b; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer;">CLOSE</button>
          </div>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      drawerOverlay.querySelector('.close-drawer').onclick = () => drawerOverlay.remove();
      drawerOverlay.querySelectorAll('.drawer-tab').forEach(btn => btn.onclick = () => { activeTab = btn.dataset.tab; renderDrawer(); });
    };
    renderDrawer();
    document.body.appendChild(drawerOverlay);
    drawerOverlay.onclick = (e) => { if (e.target === drawerOverlay) drawerOverlay.remove(); };
  };

  const render = () => {
    container.innerHTML = `
      <div style="display: flex; height: 100vh; background: #f4f7fe; font-family: 'Inter', sans-serif; overflow: hidden;">
        <!-- SIDEBAR -->
        <aside style="width: 280px; background: #111827; color: #9ca3af; display: flex; flex-direction: column; padding: 32px 24px; height: 100vh; z-index: 500; border-right: 1px solid rgba(255,255,255,0.05);">
          <div style="display: flex; align-items: center; gap: 14px; color: white; font-size: 22px; font-weight: 900; margin-bottom: 48px; padding-left: 12px;">
            <div style="width: 36px; height: 36px; background: #6366f1; border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 16px rgba(99, 102, 241, 0.3);"><i data-lucide="graduation-cap" style="width: 20px; color: white;"></i></div> SkillBridge
          </div>
          <nav style="flex: 1; overflow-y: auto;">
            <div class="nav-group-title">Main Navigation</div>
            <div style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 32px;">
              ${renderNavItem('Dashboard', 'layout-dashboard')}
              ${renderNavItem('Users', 'users')}
              ${renderNavItem('Companies', 'building-2')}
              ${renderNavItem('Internships', 'briefcase')}
              ${renderNavItem('Applications', 'file-text')}
              ${renderNavItem('Reports', 'bar-chart-3')}
              ${renderNavItem('Settings', 'settings')}
            </div>
            <div class="nav-group-title">Security & Access</div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              ${renderNavItem('Roles & Permissions', 'shield-check')}
              ${renderNavItem('Audit Logs', 'terminal')}
              ${renderNavItem('Security Settings', 'lock')}
            </div>
          </nav>
          <div style="margin-top: auto; padding-top: 24px;">
            <div style="background: rgba(255,255,255,0.05); padding: 18px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 20px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                <span style="font-size: 12px; color: white; font-weight: 700;">System Status</span>
                <div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 8px #10b981;"></div>
              </div>
              <div style="height: 4px; background: #374151; border-radius: 2px; overflow: hidden; margin-bottom: 8px;"><div style="width: 99.9%; height: 100%; background: #10b981;"></div></div>
              <div style="display: flex; justify-content: space-between; font-size: 10px;"><span>Uptime: 99.9%</span><span style="color:white;">Active</span></div>
            </div>
            <div style="font-size: 11px; color: #4b5563; text-align: center;">© 2024 SkillBridge v2.0</div>
          </div>
        </aside>

        <!-- MAIN -->
        <main style="flex: 1; display: flex; flex-direction: column; height: 100vh; overflow-y: auto;">
          <header style="height: 80px; background: white; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; padding: 0 40px; position: sticky; top: 0; z-index: 100;">
            <div style="display: flex; align-items: center; gap: 32px;">
               <div style="width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; background: #f8fafc;"><i data-lucide="menu" style="width: 22px; color: #64748b;"></i></div>
               <div style="display: flex; align-items: center; gap: 14px; font-weight: 800; color: #0f172a; font-size: 18px;">
                 <div style="width: 36px; height: 36px; background: #eef2ff; color: #6366f1; border-radius: 10px; display: flex; align-items: center; justify-content: center;"><i data-lucide="shield" style="width: 20px;"></i></div> Admin Control Center
               </div>
            </div>
            <div style="display: flex; align-items: center; gap: 24px;">
               <div style="position: relative;">
                  <i data-lucide="search" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 16px; color: #94a3b8;"></i>
                  <input type="text" placeholder="Search everything..." style="height: 40px; width: 380px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 0 16px 0 44px; font-size: 13px;" />
                  <span style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: white; border: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; padding: 2px 6px; border-radius: 4px; font-weight: 800;">⌘ K</span>
               </div>
               <div style="display: flex; gap: 12px; padding: 0 24px; border-right: 1.5px solid #f1f5f9;">
                  <div class="header-icon-btn"><i data-lucide="bell" style="width: 20px;"></i><span style="position: absolute; top: 6px; right: 6px; width: 8px; height: 8px; background: #ef4444; border-radius: 50%; border: 2px solid white;"></span></div>
                  <div class="header-icon-btn"><i data-lucide="moon" style="width: 20px;"></i></div>
               </div>
               <div style="display: flex; align-items: center; gap: 14px;">
                  <div style="text-align: right;"><div style="font-size: 14px; font-weight: 800;">Super Admin</div><div style="font-size: 11px; color: #94a3b8; font-weight: 700;">Administrator</div></div>
                  <div style="width: 44px; height: 44px; background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);">SA</div>
               </div>
            </div>
          </header>

          <div style="padding: 40px; max-width: 1600px; width: 100%; margin: 0 auto;">
            ${renderSectionContent()}
          </div>
        </main>
      </div>

      <style>
        .nav-group-title { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 800; margin-bottom: 12px; color: #4b5563; padding-left: 12px; }
        .nav-item:hover { background: rgba(255,255,255,0.05); color: white; }
        .nav-item.active { background: linear-gradient(90deg, rgba(99, 102, 241, 0.1), transparent); color: #6366f1; border-left: 3px solid #6366f1; border-radius: 0 8px 8px 0; }
        .header-icon-btn { position: relative; width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #64748b; background: #f8fafc; transition: 0.2s; }
        .header-icon-btn:hover { background: #eef2ff; color: #6366f1; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        .page-btn { width: 32px; height: 32px; border: 1px solid #e2e8f0; background: white; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #64748b; }
        .page-btn.active { background: #6366f1; color: white; border-color: #6366f1; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
      </style>
    `;

    if (window.lucide) window.lucide.createIcons();
    attachEvents();
  };

  function renderNavItem(label, icon) {
    const isActive = currentSection === label;
    return `<div class="nav-item ${isActive ? 'active' : ''}" data-section="${label}" style="display: flex; align-items: center; gap: 14px; padding: 12px 18px; border-radius: 12px; cursor: pointer; transition: 0.2s;"><i data-lucide="${icon}" style="width: 18px;"></i> <span style="font-size: 14px; font-weight: ${isActive ? '700' : '600'};">${label}</span></div>`;
  }

  function renderSectionContent() {
    if (currentSection === 'Dashboard') {
      return `
        <div class="animate-fade-in">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
            <div><h2 style="font-size: 26px; font-weight: 900; color: #0f172a; margin: 0;">Overview</h2><p style="color: #64748b; font-size: 14px; margin: 4px 0 0 0;">Real-time overview of platform activity and key metrics</p></div>
            <button id="refreshBtn" style="background: #6366f1; color: white; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 700; font-size: 13px; display: flex; align-items: center; gap: 8px; cursor: pointer; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);"><i data-lucide="refresh-cw" style="width: 16px;"></i> Refresh Data</button>
          </div>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-bottom: 48px;">
            ${renderStatCard('Total Users', '6', 'users', '#6366f1', '#eef2ff', '20%')}
            ${renderStatCard('Verified Companies', '3', 'building', '#10b981', '#f0fdf4', '15%')}
            ${renderStatCard('Live Internships', '3', 'rocket', '#3b82f6', '#eff6ff', '25%')}
            ${renderStatCard('Total Applications', '2', 'file-text', '#f59e0b', '#fffbeb', '10%')}
          </div>
          ${renderFullUserTable(users, 'User Management & Security')}
        </div>
      `;
    }

    if (currentSection === 'Users') return `<div class="animate-fade-in">${renderFullUserTable(users, 'Identity Directory')}</div>`;
    if (currentSection === 'Companies') return `<div class="animate-fade-in">${renderFullUserTable(users.filter(u => u.role === 'company'), 'Corporate Partners')}</div>`;

    if (currentSection === 'Internships') {
      return `
        <div class="animate-fade-in">
          <h2 style="font-size: 24px; font-weight: 900; color: #0f172a; margin-bottom: 32px;">Internship Lifecycle</h2>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
            ${internships.map(int => `
              <div style="background: white; padding: 24px; border-radius: 24px; border: 1px solid #f1f5f9; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
                  <div style="width: 48px; height: 48px; background: #f8fafc; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #6366f1; border: 1.5px solid #e2e8f0;">${int.company_name.substring(0,1)}</div>
                  <span style="font-size: 11px; font-weight: 800; background: #eef2ff; color: #6366f1; padding: 6px 12px; border-radius: 8px; text-transform: uppercase;">${int.type}</span>
                </div>
                <h4 style="margin: 0; font-size: 17px; color: #1e293b; font-weight: 800;">${int.title}</h4>
                <p style="margin: 4px 0 0 0; font-size: 14px; color: #64748b; font-weight: 500;">${int.company_name} • ${int.location}</p>
                <div style="margin-top: 24px; padding-top: 20px; border-top: 1.5px solid #f8fafc; display: flex; justify-content: space-between; align-items: center;">
                   <span style="font-weight: 900; color: #0f172a; font-size: 15px;">${int.stipend}</span>
                   <button style="color: #6366f1; background: #f5f3ff; border: none; padding: 8px 16px; border-radius: 10px; font-weight: 700; font-size: 13px; cursor: pointer;">Manage</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (currentSection === 'Applications') {
      return `
        <div class="animate-fade-in">
          <h2 style="font-size: 24px; font-weight: 900; color: #0f172a; margin-bottom: 32px;">Master Application Log</h2>
          <div style="background: white; border-radius: 28px; border: 1px solid #f1f5f9; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.02);">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f8fafc;">
                  <th style="padding: 20px 24px; text-align: left; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">Student Identity</th>
                  <th style="padding: 20px 24px; text-align: left; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">Employer</th>
                  <th style="padding: 20px 24px; text-align: left; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">Target Role</th>
                  <th style="padding: 20px 24px; text-align: left; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">Status</th>
                  <th style="padding: 20px 24px; text-align: right; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">Timeline</th>
                </tr>
              </thead>
              <tbody>
                ${allApplications.map(app => `
                  <tr style="border-top: 1px solid #f8fafc;">
                    <td style="padding: 24px 24px; font-weight: 800; color: #1e293b; font-size: 14px;">${app.student}</td>
                    <td style="padding: 24px 24px; font-weight: 700; color: #64748b; font-size: 14px;">${app.company}</td>
                    <td style="padding: 24px 24px; color: #64748b; font-size: 14px; font-weight: 500;">${app.role}</td>
                    <td style="padding: 24px 24px;"><span style="font-size: 11px; font-weight: 900; color: #16a34a; background: #dcfce7; padding: 6px 12px; border-radius: 8px;">${app.status.toUpperCase()}</span></td>
                    <td style="padding: 24px 24px; text-align: right; color: #94a3b8; font-size: 13px; font-weight: 600;">${app.date}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    if (currentSection === 'Reports') {
      return `
        <div class="animate-fade-in">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px;">
            <div><h2 style="font-size: 26px; font-weight: 900; color: #0f172a; margin: 0;">Reporting & Analytics</h2><p style="color: #64748b; font-size: 14px; margin: 4px 0 0 0;">In-depth performance metrics and platform growth insights</p></div>
          </div>
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 32px; margin-bottom: 32px;">
             <div style="background: white; border-radius: 24px; border: 1px solid #f1f5f9; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.02);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
                   <h3 style="margin: 0; font-size: 18px; font-weight: 800;">User Engagement Over Time</h3>
                   <select style="border: none; background: #f8fafc; font-size: 12px; font-weight: 800; padding: 6px 12px; border-radius: 8px;"><option>Last 30 Days</option></select>
                </div>
                <div style="height: 300px; width: 100%; position: relative;">
                   <svg viewBox="0 0 1000 300" preserveAspectRatio="none" style="width: 100%; height: 100%;">
                      <defs><linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#6366f1;stop-opacity:0.2" /><stop offset="100%" style="stop-color:#6366f1;stop-opacity:0" /></linearGradient></defs>
                      <path d="M0,250 L100,220 L200,260 L300,180 L400,210 L500,130 L600,150 L700,90 L800,110 L900,50 L1000,70 L1000,300 L0,300 Z" fill="url(#grad)" />
                      <path d="M0,250 L100,220 L200,260 L300,180 L400,210 L500,130 L600,150 L700,90 L800,110 L900,50 L1000,70" fill="none" stroke="#6366f1" stroke-width="4" stroke-linecap="round" />
                   </svg>
                </div>
             </div>
             <div style="background: white; border-radius: 24px; border: 1px solid #f1f5f9; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.02);">
                <h3 style="margin: 0 0 32px 0; font-size: 18px; font-weight: 800;">Top Categories</h3>
                <div style="display: flex; flex-direction: column; gap: 24px;">
                   ${[
                     { name: 'Cloud Computing', val: 45, color: '#6366f1' },
                     { name: 'Frontend Development', val: 30, color: '#10b981' },
                     { name: 'Data Science', val: 15, color: '#f59e0b' }
                   ].map(c => `
                     <div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;"><span style="font-size: 13px; font-weight: 700;">${c.name}</span><span style="font-size: 13px; font-weight: 800; color: #64748b;">${c.val}%</span></div>
                        <div style="height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden;"><div style="width: ${c.val}%; height: 100%; background: ${c.color};"></div></div>
                     </div>
                   `).join('')}
                </div>
             </div>
          </div>
        </div>
      `;
    }

    if (currentSection === 'Settings') {
      return `
        <div class="animate-fade-in">
          <h2 style="font-size: 26px; font-weight: 900; color: #0f172a; margin-bottom: 40px;">System Settings</h2>
          <div style="background: white; border-radius: 24px; border: 1px solid #f1f5f9; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.02);">
            <div style="display: flex; flex-direction: column; gap: 32px;">
               <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #f8fafc; padding-bottom: 24px;">
                  <div><h4 style="margin:0; font-size: 16px; font-weight: 800;">Automated Verification</h4><p style="margin:4px 0 0 0; font-size: 13px; color: #94a3b8;">Instantly verify student accounts using university credentials.</p></div>
                  <div style="width: 48px; height: 26px; background: #6366f1; border-radius: 13px; position: relative;"><div style="position: absolute; right: 4px; top: 4px; width: 18px; height: 18px; background: white; border-radius: 50%;"></div></div>
               </div>
               <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div><h4 style="margin:0; font-size: 16px; font-weight: 800;">Enterprise Security</h4><p style="margin:4px 0 0 0; font-size: 13px; color: #94a3b8;">Enforce two-factor authentication for all company accounts.</p></div>
                  <div style="width: 48px; height: 26px; background: #e2e8f0; border-radius: 13px; position: relative;"><div style="position: absolute; left: 4px; top: 4px; width: 18px; height: 18px; background: white; border-radius: 50%;"></div></div>
               </div>
            </div>
          </div>
        </div>
      `;
    }

    return `<div class="animate-fade-in" style="padding: 100px; text-align: center; background: white; border-radius: 28px; border: 1.5px dashed #e2e8f0; color: #94a3b8;"><i data-lucide="construction" style="width: 48px; height: 48px; margin-bottom: 16px;"></i><h3 style="margin: 0;">Section "${currentSection}" Under Development</h3><p>We are finalizing the security protocols for this view.</p></div>`;
  }

  function renderFullUserTable(data, title) {
    return `
      <div style="margin-bottom: 32px;">
        <h2 style="font-size: 22px; font-weight: 900; color: #0f172a; margin: 0;">${title}</h2>
        <p style="color: #64748b; font-size: 14px; margin: 4px 0 0 0;">Manage platform users and their access</p>
      </div>

      <div style="background: white; border-radius: 24px; border: 1px solid #f1f5f9; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.02);">
        <div style="display: flex; justify-content: space-between; margin-bottom: 32px; gap: 24px;">
           <div style="position: relative; flex: 1;">
              <i data-lucide="search" style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); width: 16px; color: #94a3b8;"></i>
              <input type="text" placeholder="Search by name, email, or institution..." style="height: 48px; width: 100%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 0 16px 0 48px; font-size: 14px;" />
           </div>
           <div style="display: flex; gap: 12px;">
              <select style="height: 48px; padding: 0 20px; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc; font-size: 14px; font-weight: 600; color: #1e293b; width: 160px;"><option>All Roles</option><option>Student</option><option>Company</option></select>
              <button style="height: 48px; width: 48px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; display: flex; align-items: center; justify-content: center;"><i data-lucide="filter" style="width: 18px; color: #64748b;"></i></button>
           </div>
        </div>
        <table style="width: 100%; border-collapse: separate; border-spacing: 0;">
          <thead>
            <tr>
              <th style="width: 40px; padding: 16px; border-bottom: 2px solid #f8fafc;"><input type="checkbox" style="width: 18px; height: 18px;"></th>
              <th style="padding: 16px; border-bottom: 2px solid #f8fafc; text-align: left; font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 800;">User Details</th>
              <th style="padding: 16px; border-bottom: 2px solid #f8fafc; text-align: left; font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 800;">Role</th>
              <th style="padding: 16px; border-bottom: 2px solid #f8fafc; text-align: left; font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 800;">Institution / Location</th>
              <th style="padding: 16px; border-bottom: 2px solid #f8fafc; text-align: left; font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 800;">Status</th>
              <th style="padding: 16px; border-bottom: 2px solid #f8fafc; text-align: left; font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 800;">Joined</th>
              <th style="padding: 16px; border-bottom: 2px solid #f8fafc; text-align: right; font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 800;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(user => `
              <tr>
                <td style="padding: 20px 16px; border-bottom: 1px solid #f8fafc;"><input type="checkbox" style="width: 18px; height: 18px;"></td>
                <td style="padding: 20px 16px; border-bottom: 1px solid #f8fafc;">
                  <div style="display: flex; align-items: center; gap: 14px;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: #eef2ff; color: #6366f1; display: flex; align-items: center; justify-content: center; font-weight: 800;">${user.name.substring(0, 2).toUpperCase()}</div>
                    <div><div style="font-weight: 800; font-size: 14px; color: #1e293b;">${user.name}</div><div style="font-size: 12px; color: #94a3b8;">${user.email}</div></div>
                  </div>
                </td>
                <td style="padding: 20px 16px; border-bottom: 1px solid #f8fafc;"><span style="font-size: 10px; font-weight: 900; background: #eef2ff; color: #6366f1; padding: 4px 10px; border-radius: 6px; text-transform: uppercase;">${user.role}</span></td>
                <td style="padding: 20px 16px; border-bottom: 1px solid #f8fafc;"><div style="font-size: 13px; font-weight: 700; color: #1e293b;">${user.university || user.location || 'N/A'}</div><div style="font-size: 11px; color: #94a3b8;">${user.location || ''}</div></td>
                <td style="padding: 20px 16px; border-bottom: 1px solid #f8fafc;"><div style="display: flex; align-items: center; gap: 6px;"><div style="width: 6px; height: 6px; border-radius: 50%; background: ${user.status === 'Active' ? '#10b981' : '#ef4444'};"></div><span style="font-size: 12px; color: ${user.status === 'Active' ? '#10b981' : '#ef4444'}; font-weight: 800;">Active</span></div></td>
                <td style="padding: 20px 16px; border-bottom: 1px solid #f8fafc; font-size: 13px; font-weight: 600; color: #64748b;">Apr 27, 2026</td>
                <td style="padding: 20px 16px; border-bottom: 1px solid #f8fafc; text-align: right;">
                  <div style="display: flex; justify-content: flex-end; gap: 8px;">
                     <button class="view-detail-btn" data-id="${user.id}" style="padding: 6px 16px; background: white; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 12px; font-weight: 800; cursor: pointer;">View</button>
                     <button style="width: 32px; height: 32px; background: white; border: 1.5px solid #e2e8f0; border-radius: 8px; color: #94a3b8;"><i data-lucide="more-vertical" style="width: 16px;"></i></button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #f8fafc;">
           <div style="font-size: 13px; color: #94a3b8; font-weight: 600;">Showing 1 to ${data.length} of ${data.length} results</div>
           <div style="display: flex; align-items: center; gap: 12px;">
              <div style="display: flex; gap: 4px;"><button class="page-btn"><i data-lucide="chevron-left" style="width: 14px;"></i></button><button class="page-btn active">1</button><button class="page-btn"><i data-lucide="chevron-right" style="width: 14px;"></i></button></div>
              <select style="height: 36px; padding: 0 12px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 12px; font-weight: 700;">
                <option>10 per page</option>
              </select>
           </div>
        </div>
      </div>
    `;
  }

  function renderStatCard(label, value, icon, color, bgColor, trend) {
    return `
      <div style="background: white; padding: 24px; border-radius: 20px; border: 1px solid #f1f5f9; box-shadow: 0 4px 12px rgba(0,0,0,0.02); position: relative; overflow: hidden;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div style="width: 44px; height: 44px; background: ${bgColor}; color: ${color}; border-radius: 12px; display: flex; align-items: center; justify-content: center;"><i data-lucide="${icon}" style="width: 22px;"></i></div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 11px; color: #94a3b8; font-weight: 800; text-transform: uppercase;">${label}</p>
            <div style="font-size: 28px; font-weight: 900; color: #1e293b;">${value}</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px;">
          <span style="font-size: 12px; color: #10b981; font-weight: 800;"><i data-lucide="arrow-up" style="width: 12px; vertical-align: middle;"></i> ${trend}</span>
          <span style="font-size: 11px; color: #94a3b8; font-weight: 600;">from last month</span>
        </div>
        <div style="height: 40px; width: 100%; margin-top: 10px;">
          <svg viewBox="0 0 100 20" preserveAspectRatio="none" style="width: 100%; height: 100%; stroke: ${color}; fill: none; stroke-width: 2;">
            <path d="M0 15 Q 10 5, 20 15 T 40 10 T 60 18 T 80 8 T 100 14" opacity="0.4"/>
            <path d="M0 18 Q 15 10, 30 18 T 60 12 T 90 18 T 100 10" />
          </svg>
        </div>
      </div>
    `;
  }

  const attachEvents = () => {
    container.querySelectorAll('.nav-item').forEach(item => item.onclick = () => { currentSection = item.dataset.section; render(); });
    container.querySelectorAll('.view-detail-btn').forEach(btn => btn.onclick = () => { const user = users.find(u => u.id == btn.dataset.id); showSideDrawer(user); });
    const refreshBtn = container.querySelector('#refreshBtn'); if (refreshBtn) refreshBtn.onclick = loadData;
  };

  loadData();
}
