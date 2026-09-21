/**
 * Internship Detail Page
 * Full details with apply button, required skills, company info
 */
import { renderSidebar, renderNavbar, initSidebarToggle } from '../components/layout.js';
import { api } from '../api.js';
import { formatStipend } from '../utils.js';

export async function renderInternshipDetail(container) {
  container.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100%;"><i data-lucide="loader" class="spin" style="width:32px;height:32px;"></i></div>';
  if (window.lucide) window.lucide.createIcons();

  const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
  const id = urlParams.get('id') || 1;

  try {
    const [internship, applications, user] = await Promise.all([
      api.get(`/internships/${id}`),
      api.get('/applications'),
      api.get('/users/me')
    ]);

    const hasApplied = applications.some(a => a.internship_id === internship.id);

    const lastSeenCount = parseInt(localStorage.getItem('lastSeenCount') || '0');
    const unreadApps = Math.max(0, applications.length - lastSeenCount);

    container.innerHTML = `
      <div class="app-layout">
        ${renderSidebar('internships', user.role, { apps: unreadApps })}
        
        <div class="main-content">
          ${renderNavbar('Internship Details')}
          
          <div class="container">
            <!-- Back Button -->
            <div style="margin-bottom:var(--space-5);">
              <a href="#/internships" class="btn btn-ghost btn-sm" style="color:var(--color-gray-500);">
                <i data-lucide="arrow-left" style="width:16px;height:16px;"></i>
                Back to Internships
              </a>
            </div>

            <!-- Hero Section -->
            <div class="detail-hero animate-fade-in-up">
              <div style="display:flex;align-items:flex-start;gap:var(--space-6);position:relative;z-index:1;">
                <div class="company-logo" style="background:rgba(255,255,255,0.2);backdrop-filter:blur(8px);width:72px;height:72px;font-size:var(--font-size-2xl);border:2px solid rgba(255,255,255,0.2);">${internship.initial}</div>
                <div style="flex:1;">
                  <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-2);flex-wrap:wrap;">
                    <h1 style="font-size:var(--font-size-2xl);">${internship.title}</h1>
                    <span class="badge" style="background:rgba(34,197,94,0.2);color:#4ADE80;">Actively Hiring</span>
                  </div>
                  <div class="company-name" style="font-size:var(--font-size-lg);opacity:0.9;margin-bottom:var(--space-5);">${internship.company_name}</div>
                  <div class="detail-meta">
                    <span><i data-lucide="map-pin"></i> ${internship.location}</span>
                    <span><i data-lucide="briefcase"></i> ${internship.work_mode || 'In-Office'} (${internship.type || 'Full-time'})</span>
                    <span><i data-lucide="clock"></i> ${internship.timing || 'Flexible'}</span>
                    <span><i data-lucide="calendar"></i> Apply by: ${internship.deadline ? new Date(internship.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'ASAP'}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Content Grid -->
            <div class="detail-content">
              <!-- Left: Details -->
              <div class="animate-fade-in-up" style="animation-delay:100ms;">
                
                <!-- About -->
                <div class="detail-section">
                  <h3>About the Internship</h3>
                  <p>${internship.description || 'No description provided.'}</p>
                </div>

                <!-- Required Skills -->
                <div class="detail-section">
                  <h3>Required Skills</h3>
                  <div style="display:flex;flex-wrap:wrap;gap:var(--space-2);margin-top:var(--space-3);">
                    ${(internship.skills || []).map(skill => `
                      <span class="skill-tag" style="cursor:default;">
                        <i data-lucide="check-circle" style="width:14px;height:14px;color:var(--color-success-500);"></i>
                        ${skill}
                      </span>
                    `).join('')}
                  </div>
                </div>

                <!-- Perks -->
                <div class="detail-section">
                  <h3>Perks & Benefits</h3>
                  <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:var(--space-4);margin-top:var(--space-3);">
                    ${[
                      { icon: 'banknote', label: 'Competitive Stipend', desc: internship.stipend },
                      { icon: 'award', label: 'Certificate', desc: 'On completion' },
                      { icon: 'file-check', label: 'Letter of Recommendation', desc: 'Based on performance' },
                      { icon: 'monitor', label: 'Work Mode', desc: internship.work_mode || 'In-Office' },
                    ].map(perk => `
                      <div style="display:flex;align-items:flex-start;gap:var(--space-3);padding:var(--space-3);background:var(--color-gray-50);border-radius:var(--radius-md);">
                        <div style="width:36px;height:36px;border-radius:var(--radius-md);background:var(--color-primary-50);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                          <i data-lucide="${perk.icon}" style="width:18px;height:18px;color:var(--color-primary-500);"></i>
                        </div>
                        <div>
                          <div style="font-size:var(--font-size-sm);font-weight:var(--font-weight-semibold);color:var(--color-gray-800);">${perk.label}</div>
                          <div style="font-size:var(--font-size-xs);color:var(--color-gray-500);">${perk.desc}</div>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>

              <!-- Right: Sidebar -->
              <div class="detail-sidebar animate-fade-in-up" style="animation-delay:200ms;">
                <div class="card" style="display:flex;flex-direction:column;gap:var(--space-5);">
                  <!-- Stipend -->
                  <div style="text-align:center;padding:var(--space-5);background:var(--gradient-primary-soft);border-radius:var(--radius-lg);">
                    <div style="font-size:var(--font-size-xs);text-transform:uppercase;letter-spacing:0.05em;color:var(--color-gray-500);margin-bottom:var(--space-2);">Monthly Stipend</div>
                    <div style="font-size:var(--font-size-2xl); font-weight:var(--font-weight-bold); color:var(--color-primary-600);">${formatStipend(internship.stipend)}</div>
                  </div>

                  <!-- Apply Button -->
                  ${user.role === 'student' ? `
                    ${hasApplied ? `
                      <div style="display:flex;flex-direction:column;gap:var(--space-3);">
                        <div style="padding:var(--space-3);background:var(--color-success-50);border:1px solid var(--color-success-200);border-radius:var(--radius-md);color:var(--color-success-700);font-size:12px;text-align:center;">
                          <i data-lucide="check-circle" style="width:14px;height:14px;margin-bottom:2px;"></i>
                          <div>You have applied for this position</div>
                        </div>
                        <button class="btn btn-ghost btn-sm" id="withdrawBtn" style="color:var(--color-danger-500);width:100%;">
                          <i data-lucide="x-circle" style="width:14px;height:14px;"></i>
                          Withdraw Application
                        </button>
                      </div>
                    ` : `
                      <button class="btn btn-primary btn-lg" style="width:100%;" id="applyBtn">
                        <i data-lucide="send" style="width:18px;height:18px;"></i>
                        Apply for this Internship
                      </button>
                    `}
                  ` : `
                    <div style="padding:var(--space-4); background:var(--color-gray-50); border-radius:var(--radius-md); text-align:center; color:var(--color-gray-500); font-size:var(--font-size-sm);">
                      <i data-lucide="info" style="width:16px;height:16px;margin-bottom:4px;"></i>
                      <p>Only students can apply for internships.</p>
                    </div>
                  `}

                  <hr style="border:none;border-top:1px solid var(--color-gray-100);">

                  <!-- Company Info -->
                  <div>
                    <h4 style="font-size:var(--font-size-base);font-weight:var(--font-weight-semibold);margin-bottom:var(--space-4);">About ${internship.company_name}</h4>
                    <div style="display:flex;flex-direction:column;gap:var(--space-3);">
                      <div style="display:flex;align-items:center;gap:var(--space-3);">
                        <i data-lucide="building-2" style="width:16px;height:16px;color:var(--color-gray-400);flex-shrink:0;"></i>
                        <span style="font-size:var(--font-size-sm);color:var(--color-gray-600);">Technology / Internet</span>
                      </div>
                      <div style="display:flex;align-items:center;gap:var(--space-3);">
                        <i data-lucide="map-pin" style="width:16px;height:16px;color:var(--color-gray-400);flex-shrink:0;"></i>
                        <span style="font-size:var(--font-size-sm);color:var(--color-gray-600);">${internship.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    initSidebarToggle();
    if (window.lucide) window.lucide.createIcons();

    // Apply button logic
    const applyBtn = container.querySelector('#applyBtn');
    if (applyBtn) {
      applyBtn.addEventListener('click', async () => {
        try {
          applyBtn.innerHTML = '<i data-lucide="loader" class="spin" style="width:18px;height:18px;"></i> Submitting...';
          applyBtn.disabled = true;
          if (window.lucide) window.lucide.createIcons();

          await api.post('/applications', { internship_id: internship.id });
          renderInternshipDetail(container);
        } catch (err) {
          alert(err.message || 'Failed to apply');
          applyBtn.innerHTML = '<i data-lucide="send" style="width:18px;height:18px;"></i> Apply for this Internship';
          applyBtn.disabled = false;
          if (window.lucide) window.lucide.createIcons();
        }
      });
    }

    const withdrawBtn = container.querySelector('#withdrawBtn');
    if (withdrawBtn) {
      withdrawBtn.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to withdraw your application?')) return;
        const app = applications.find(a => a.internship_id === internship.id);
        if (!app) return;
        try {
          withdrawBtn.innerHTML = '<i data-lucide="loader" class="spin" style="width:14px;height:14px;"></i> Withdrawing...';
          withdrawBtn.disabled = true;
          if (window.lucide) window.lucide.createIcons();
          await api.delete(`/applications/${app.id}`);
          renderInternshipDetail(container);
        } catch (err) {
          alert(err.message || 'Failed to withdraw');
          withdrawBtn.disabled = false;
        }
      });
    }
  } catch (err) {
    container.innerHTML = `<div class="error-state">Failed to load internship: ${err.message}</div>`;
  }
}
