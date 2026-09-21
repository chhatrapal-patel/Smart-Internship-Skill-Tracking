/**
 * Student Dashboard Page
 * Overview cards, recommendations, recent activity
 */
import { renderSidebar, renderNavbar, initSidebarToggle } from '../components/layout.js';
import { api } from '../api.js';
import { formatStipend } from '../utils.js';

export async function renderStudentDashboard(container) {
  container.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100%;"><i data-lucide="loader" class="spin" style="width:32px;height:32px;"></i></div>';
  if (window.lucide) window.lucide.createIcons();

  try {
    const [user, applications, internships] = await Promise.all([
      api.get('/users/me'),
      api.get('/applications'),
      api.get('/internships')
    ]);

    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const currentTab = urlParams.get('tab') || 'overview';
    const shortlisted = applications.filter(a => a.status === 'Shortlisted' || a.status === 'Hired').length;
    const recommendations = internships.slice(0, 4);

    const lastSeenCount = parseInt(localStorage.getItem('lastSeenCount') || '0');
    if (currentTab === 'applications') {
      localStorage.setItem('lastSeenCount', applications.length);
    }
    const unreadApps = currentTab === 'applications' ? 0 : Math.max(0, applications.length - lastSeenCount);

    container.innerHTML = `
      <div class="app-layout">
        ${renderSidebar(currentTab, user.role, { apps: unreadApps })}
        
        <div class="main-content">
          ${renderNavbar('Student Dashboard', applications.filter(a => a.status === 'Shortlisted' || a.status === 'Hired').map(a => ({
            title: 'Application Update',
            message: `Congratulations! Your application for "${a.title}" at ${a.company_name} is now ${a.status}.`,
            type: 'success',
            time: 'Recently'
          })))}
          
          <div class="container">
            <!-- Tabs -->
            <div class="login-tabs" style="margin-bottom:var(--space-6); justify-content:flex-start; border-bottom:1px solid var(--color-gray-100);">
              <a href="#/dashboard?tab=overview" class="login-tab ${currentTab === 'overview' ? 'active' : ''}" style="text-decoration:none;">Overview</a>
              <a href="#/dashboard?tab=applications" class="login-tab ${currentTab === 'applications' ? 'active' : ''}" style="text-decoration:none;">My Applications</a>
            </div>

            ${currentTab === 'overview' ? `
              <div class="page-header" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:var(--space-4);">
                <div>
                  <h1 style="font-size:var(--font-size-2xl);">${applications.length === 0 ? `Welcome to SkillBridge, ${user.name.split(' ')[0]}! 🚀` : `Welcome back, ${user.name.split(' ')[0]}! 👋`}</h1>
                  <p>${applications.length === 0 ? "Let's kickstart your professional journey today." : "Here's what's happening with your internship applications."}</p>
                </div>
                <a href="#/internships" class="btn btn-primary">
                  <i data-lucide="search" style="width:16px;height:16px;"></i>
                  Browse Internships
                </a>
              </div>

              <!-- Metric Cards -->
              <div class="grid grid-4 stagger-children" style="margin-bottom:var(--space-8);">
                <div class="metric-card" style="--card-accent: var(--gradient-card-1);">
                  <div class="metric-icon" style="background: var(--gradient-card-1);">
                    <i data-lucide="file-text"></i>
                  </div>
                  <div class="metric-info">
                    <h3>Total Applications</h3>
                    <div class="metric-value">${applications.length}</div>
                    <div class="metric-trend up">
                      <i data-lucide="trending-up" style="width:14px;height:14px;"></i>
                      +1 this week
                    </div>
                  </div>
                </div>

                <div class="metric-card" style="--card-accent: var(--gradient-card-2); cursor: pointer;" onclick="window.location.hash='#/profile'">
                  <div class="metric-icon" style="background: var(--gradient-card-2);">
                    <i data-lucide="sparkles"></i>
                  </div>
                  <div class="metric-info">
                    <h3>Skills Tracked</h3>
                    <div class="metric-value">${user.skills.length}</div>
                    <div class="metric-trend up">
                      <i data-lucide="trending-up" style="width:14px;height:14px;"></i>
                      Keep learning!
                    </div>
                  </div>
                </div>

                <div class="metric-card" style="--card-accent: var(--gradient-card-3);">
                  <div class="metric-icon" style="background: var(--gradient-card-3);">
                    <i data-lucide="check-circle"></i>
                  </div>
                  <div class="metric-info">
                    <h3>Shortlisted</h3>
                    <div class="metric-value">${shortlisted}</div>
                    <div class="metric-trend up">
                      <i data-lucide="trending-up" style="width:14px;height:14px;"></i>
                      Great job!
                    </div>
                  </div>
                </div>

                <div class="metric-card" style="--card-accent: var(--gradient-card-4);">
                  <div class="metric-icon" style="background: var(--gradient-card-4);">
                    <i data-lucide="bell"></i>
                  </div>
                  <div class="metric-info">
                    <h3>Notifications</h3>
                    <div class="metric-value">${applications.length === 0 ? '0' : '2'}</div>
                    <div class="metric-trend">
                      <span style="color:var(--color-gray-500);">${applications.length === 0 ? 'No new updates' : 'New updates'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Two Column: Recommendations + Activity -->
              <div style="display:grid; grid-template-columns:2fr 1fr; gap:var(--space-6);">
                
                <!-- Internship Recommendations -->
                <div>
                  <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:var(--space-5);">
                    <h3 style="font-size:var(--font-size-xl); font-weight:var(--font-weight-semibold);">Recommended for You</h3>
                    <a href="#/internships" class="btn btn-ghost btn-sm">View All <i data-lucide="arrow-right" style="width:14px;height:14px;"></i></a>
                  </div>
                  
                  <div class="stagger-children" style="display:flex; flex-direction:column; gap:var(--space-4);">
                    ${recommendations.map(r => generateRecommendationCard(r)).join('') || '<p>No recommendations yet.</p>'}
                  </div>
                </div>

                <!-- Right Column: Activity & Stats -->
                <div style="display:flex; flex-direction:column; gap:var(--space-6);">
                  
                  <!-- Application Status -->
                  <div class="card animate-fade-in-up">
                    <h4 style="font-size:var(--font-size-base); font-weight:var(--font-weight-semibold); margin-bottom:var(--space-5);">Application Status</h4>
                    <div style="display:flex; flex-direction:column; gap:var(--space-4);">
                      ${applications.slice(0, 5).map(a => generateStatusItem(a.company_name + ' — ' + a.title, a.status)).join('') || '<p>No applications yet.</p>'}
                    </div>
                  </div>

                  <!-- Skill Progress -->
                  <div class="card animate-fade-in-up" style="animation-delay:200ms;">
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:var(--space-5);">
                      <h4 style="font-size:var(--font-size-base); font-weight:var(--font-weight-semibold);">Top Skills</h4>
                      <a href="#/profile" class="btn btn-ghost btn-sm" style="display:flex;align-items:center;gap:4px;"><i data-lucide="pencil" style="width:14px;height:14px;"></i> Edit</a>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:var(--space-4);">
                      ${user.skills.slice(0, 4).map(s => generateSkillProgress(s, Math.floor(Math.random() * 40) + 50, '#3B82F6')).join('') || '<a href="#/profile" style="color:var(--color-primary-600);text-decoration:underline;">Click here to add skills to your profile.</a>'}
                    </div>
                  </div>
                </div>
              </div>
            ` : `
              <!-- Applications Tab Content -->
              <div class="table-container animate-fade-in-up">
                <div class="table-header">
                  <h3>My Applications</h3>
                  <div class="search-bar" style="width:240px;">
                    <i data-lucide="search"></i>
                    <input type="text" placeholder="Search applications..." id="searchApps" />
                  </div>
                </div>
                <div style="overflow-x:auto;">
                  <table>
                    <thead>
                      <tr>
                        <th>Internship</th>
                        <th>Applied On</th>
                        <th>Match Score</th>
                        <th>Current Stage</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody id="appsBody">
                      ${applications.map(a => `
                        <tr>
                          <td>
                            <div style="font-weight:600;">${a.title}</div>
                            <div style="font-size:12px;color:var(--color-gray-500);">${a.company_name}</div>
                          </td>
                          <td>${a.applied_date}</td>
                          <td style="font-weight:600; color:${a.score >= 80 ? 'var(--color-success-500)' : 'var(--color-primary-500)'};">${a.score}%</td>
                          <td style="font-weight:500; color:var(--color-primary-600);">${a.stage || 'Applied'}</td>
                          <td><span class="badge badge-${a.status === 'Offer Extended' || a.status === 'Hired' || a.status === 'Shortlisted' ? 'success' : a.status === 'Not Selected' || a.status === 'Rejected' ? 'danger' : 'primary'}">${a.status}</span></td>
                          <td>
                            <button class="btn btn-ghost btn-sm withdraw-app-btn" data-id="${a.id}" style="color:var(--color-danger-500); padding:4px;">
                              <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
                            </button>
                          </td>
                        </tr>
                      `).join('') || '<tr><td colspan="4" style="text-align:center;padding:var(--space-8);color:var(--color-gray-400);">No applications found.</td></tr>'}
                    </tbody>
                  </table>
                </div>
              </div>
            `}
          </div>
        </div>
      </div>
    `;

    initSidebarToggle();

    if (currentTab === 'applications') {
      const searchInput = container.querySelector('#searchApps');
      const appsBody = container.querySelector('#appsBody');
      if (searchInput && appsBody) {
        searchInput.addEventListener('input', () => {
          const q = searchInput.value.toLowerCase();
          const filtered = applications.filter(a => 
            a.title.toLowerCase().includes(q) || 
            a.company_name.toLowerCase().includes(q) ||
            (a.stage && a.stage.toLowerCase().includes(q)) ||
            a.status.toLowerCase().includes(q)
          );
          
          if (filtered.length === 0) {
            appsBody.innerHTML = `
              <tr>
                <td colspan="6" style="text-align:center; padding:var(--space-10);">
                  <div style="opacity:0.5; margin-bottom:var(--space-4);">
                    <i data-lucide="inbox" style="width:48px; height:48px;"></i>
                  </div>
                  <div style="font-weight:600; color:var(--color-gray-500);">No matching applications found</div>
                  <div style="font-size:13px; color:var(--color-gray-400);">Try searching for a different company or status</div>
                </td>
              </tr>
            `;
          } else {
            appsBody.innerHTML = filtered.map(a => `
              <tr>
                <td>
                  <div style="font-weight:600;">${a.title}</div>
                  <div style="font-size:12px;color:var(--color-gray-500);">${a.company_name}</div>
                </td>
                <td>${a.applied_date}</td>
                <td style="font-weight:600; color:${a.score >= 80 ? 'var(--color-success-500)' : 'var(--color-primary-500)'};">${a.score}%</td>
                <td style="font-weight:500; color:var(--color-primary-600);">${a.stage || 'Applied'}</td>
                <td><span class="badge badge-${a.status === 'Offer Extended' || a.status === 'Hired' || a.status === 'Shortlisted' ? 'success' : a.status === 'Not Selected' || a.status === 'Rejected' ? 'danger' : 'primary'}">${a.status}</span></td>
                <td>
                  <button class="btn btn-ghost btn-sm withdraw-app-btn" data-id="${a.id}" style="color:var(--color-danger-500); padding:4px;">
                    <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
                  </button>
                </td>
              </tr>
            `).join('');
          }
          if (window.lucide) window.lucide.createIcons();
        });
      }

      appsBody.addEventListener('click', async (e) => {
        const btn = e.target.closest('.withdraw-app-btn');
        if (!btn) return;
        const id = btn.dataset.id;
        if (!confirm('Are you sure you want to withdraw this application?')) return;
        try {
          await api.delete(`/applications/${id}`);
          renderStudentDashboard(container);
        } catch (err) {
          alert('Error: ' + err.message);
        }
      });
    }

    // Animate progress bars
    setTimeout(() => {
      container.querySelectorAll('.progress-fill').forEach(bar => {
        bar.style.width = bar.dataset.width;
      });
    }, 300);

  } catch (err) {
    container.innerHTML = `<div class="error-state">Failed to load dashboard: ${err.message}</div>`;
  }
}

function generateRecommendationCard(i) {
  return `
    <div class="internship-card" onclick="window.location.hash='/internship-detail?id=${i.id}'">
      <div class="internship-card-header">
        <div class="company-logo" style="background:${i.color};">${i.initial}</div>
        <div style="flex:1;">
          <div class="internship-card-title">${i.title}</div>
          <div class="internship-card-company">${i.company_name}</div>
        </div>
        <button class="btn btn-ghost btn-icon" style="flex-shrink:0;" aria-label="Bookmark" onclick="event.stopPropagation(); const i = this.querySelector('i'); i.style.fill = i.style.fill ? '' : 'currentColor';">
          <i data-lucide="bookmark" style="width:18px;height:18px;"></i>
        </button>
      </div>
      <div class="internship-card-meta">
        <span><i data-lucide="map-pin"></i>${i.location}</span>
        <span><i data-lucide="clock"></i>${i.duration}</span>
        <span><i data-lucide="calendar"></i>${i.posted}</span>
      </div>
      <div class="internship-card-skills">
        ${(i.skills || []).slice(0, 3).map(s => `<span class="badge badge-primary">${s}</span>`).join('')}
      </div>
      <div class="internship-card-footer">
        <div class="stipend">${formatStipend(i.stipend)}</div>
        <button class="btn btn-primary btn-sm">View Details</button>
      </div>
    </div>
  `;
}

function generateStatusItem(title, status) {
  const typeMap = { 'Shortlisted': 'success', 'Under Review': 'warning', 'New': 'primary', 'Rejected': 'danger' };
  const type = typeMap[status] || 'gray';
  return `
    <div style="display:flex; align-items:center; justify-content:space-between; padding:var(--space-3); border-radius:var(--radius-md); background:var(--color-gray-50); transition:background 200ms;" onmouseover="this.style.background='var(--color-gray-100)'" onmouseout="this.style.background='var(--color-gray-50)'">
      <span style="font-size:var(--font-size-sm); font-weight:var(--font-weight-medium); color:var(--color-gray-700);">${title}</span>
      <span class="badge badge-${type}">${status}</span>
    </div>
  `;
}

function generateSkillProgress(name, percent, color) {
  return `
    <div>
      <div style="display:flex;justify-content:space-between;margin-bottom:var(--space-2);">
        <span style="font-size:var(--font-size-sm);font-weight:var(--font-weight-medium);color:var(--color-gray-700);">${name}</span>
        <span style="font-size:var(--font-size-xs);font-weight:var(--font-weight-semibold);color:${color};">${percent}%</span>
      </div>
      <div style="height:6px;background:var(--color-gray-100);border-radius:var(--radius-full);overflow:hidden;">
        <div class="progress-fill" data-width="${percent}%" style="height:100%;width:0%;background:${color};border-radius:var(--radius-full);transition:width 1s cubic-bezier(0.34,1.56,0.64,1);"></div>
      </div>
    </div>
  `;
}
