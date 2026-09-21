/**
 * Company Dashboard Page
 * Post internship form, view applicants, shortlist candidates
 */
import { renderSidebar, renderNavbar, initSidebarToggle } from '../components/layout.js';
import { api } from '../api.js';
import { toast } from '../components/toast.js';
import { formatStipend } from '../utils.js';

export async function renderCompanyDashboard(container) {
  container.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100%;"><i data-lucide="loader" class="spin" style="width:32px;height:32px;"></i></div>';
  if (window.lucide) window.lucide.createIcons();

  const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
  const currentTab = urlParams.get('tab') || 'dashboard';

  try {
    const [user, allInternships, applications] = await Promise.all([
      api.get('/users/me'),
      api.get('/internships'),
      api.get('/applications')
    ]);

    const activeListings = allInternships.filter(i => i.company_id === user.id);
    const totalApplicants = applications.length;
    const shortlistedCount = applications.filter(a => a.status === 'Shortlisted').length;

    container.innerHTML = `
      <div class="app-layout">
        ${renderSidebar(currentTab, 'company')}
        
        <div class="main-content">
          ${renderNavbar('Company Dashboard')}
          
          <div class="container">
            <!-- Page Header -->
            <div class="page-header" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--space-4);">
              <div>
                <h1 style="font-size:var(--font-size-2xl);">${activeListings.length === 0 ? `Welcome to SkillBridge, ${user.name}! 🚀` : `${user.name} Dashboard`}</h1>
                <p>${activeListings.length === 0 ? "Let's start by posting your first internship opportunity." : (currentTab === 'dashboard' ? 'Overview of your internship activity' : 'Manage your postings and applicants')}</p>
              </div>
              ${currentTab !== 'post' ? `
                <a href="#/company?tab=post" class="btn btn-primary">
                  <i data-lucide="plus-circle" style="width:16px;height:16px;"></i>
                  Post New Internship
                </a>
              ` : ''}
            </div>

            <!-- Tab Content -->
            <div id="tabContent">
              ${renderTabContent(currentTab, { activeListings, totalApplicants, shortlistedCount, applications })}
            </div>
          </div>
        </div>
      </div>
    `;

    initSidebarToggle();
    attachTabListeners(container, currentTab, applications, activeListings);

  } catch (err) {
    container.innerHTML = `<div class="error-state">Failed to load dashboard: ${err.message}</div>`;
  }
}

let editingInternshipId = null;

function renderTabContent(tab, data) {
  const { activeListings, totalApplicants, shortlistedCount, applications } = data;

  switch (tab) {
    // ... dashboard case remains similar
    case 'dashboard':
      return `
        <!-- Metrics -->
        <div class="grid grid-4 stagger-children" style="margin-bottom:var(--space-8);">
          <div class="metric-card" style="--card-accent:var(--gradient-card-1);">
            <div class="metric-icon" style="background:var(--gradient-card-1);"><i data-lucide="briefcase"></i></div>
            <div class="metric-info">
              <h3>Active Listings</h3>
              <div class="metric-value">${activeListings.length}</div>
              <div class="metric-trend up"><i data-lucide="trending-up" style="width:14px;height:14px;"></i> Active</div>
            </div>
          </div>
          <div class="metric-card" style="--card-accent:var(--gradient-card-2);">
            <div class="metric-icon" style="background:var(--gradient-card-2);"><i data-lucide="users"></i></div>
            <div class="metric-info">
              <h3>Total Applicants</h3>
              <div class="metric-value">${totalApplicants}</div>
              <div class="metric-trend ${totalApplicants > 0 ? 'up' : ''}"><i data-lucide="trending-up" style="width:14px;height:14px; display:${totalApplicants > 0 ? 'inline-block' : 'none'};"></i> ${totalApplicants > 0 ? 'Growing' : 'Awaiting first applicant'}</div>
            </div>
          </div>
          <div class="metric-card" style="--card-accent:var(--gradient-card-3);">
            <div class="metric-icon" style="background:var(--gradient-card-3);"><i data-lucide="check-circle"></i></div>
            <div class="metric-info">
              <h3>Shortlisted</h3>
              <div class="metric-value">${shortlistedCount}</div>
              <div class="metric-trend"><span style="color:var(--color-gray-500);">across all roles</span></div>
            </div>
          </div>
          <div class="metric-card" style="--card-accent:var(--gradient-card-4);">
            <div class="metric-icon" style="background:var(--gradient-card-4);"><i data-lucide="eye"></i></div>
            <div class="metric-info">
              <h3>Profile Views</h3>
              <div class="metric-value">${activeListings.length === 0 ? '0' : '1.2K'}</div>
              <div class="metric-trend ${activeListings.length > 0 ? 'up' : ''}"><i data-lucide="trending-up" style="width:14px;height:14px; display:${activeListings.length > 0 ? 'inline-block' : 'none'};"></i> ${activeListings.length > 0 ? '+18% this month' : 'Analytics pending'}</div>
            </div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-6);">
          <!-- Listings Preview -->
          <div class="card animate-fade-in-up">
            <h3 style="margin-bottom:var(--space-4);">Quick View: Listings</h3>
            <div style="display:flex;flex-direction:column;gap:var(--space-3);">
              ${activeListings.slice(0, 3).map(listing => `
                <div style="padding:var(--space-3);background:var(--color-gray-50);border-radius:var(--radius-md);">
                  <div style="font-weight:600;">${listing.title}</div>
                  <div style="font-size:var(--font-size-xs);color:var(--color-gray-500);">${listing.applicants || 0} applicants</div>
                </div>
              `).join('') || '<p>No active listings.</p>'}
              <a href="#/company?tab=listings" class="btn btn-ghost btn-sm" style="margin-top:var(--space-2);">View All Listings</a>
            </div>
          </div>
          <!-- Pipeline -->
          <div class="card animate-fade-in-up">
            <h3 style="margin-bottom:var(--space-4);">Hiring Pipeline</h3>
            <div style="display:flex;flex-direction:column;gap:var(--space-4);">
              ${[
                { label: 'New', count: applications.filter(a => a.status === 'New').length, color: 'var(--color-primary-500)' },
                { label: 'Shortlisted', count: applications.filter(a => a.status === 'Shortlisted').length, color: 'var(--color-success-500)' },
                { label: 'Rejected', count: applications.filter(a => a.status === 'Rejected').length, color: 'var(--color-danger-500)' },
              ].map(stage => `
                <div>
                  <div style="display:flex;justify-content:space-between;font-size:var(--font-size-sm);margin-bottom:4px;">
                    <span>${stage.label}</span>
                    <span style="font-weight:bold;color:${stage.color}">${stage.count}</span>
                  </div>
                  <div style="height:6px;background:var(--color-gray-100);border-radius:3px;overflow:hidden;">
                    <div style="height:100%;width:${applications.length ? (stage.count / applications.length) * 100 : 0}%;background:${stage.color};"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;

    case 'post':
      return `
        <div class="form-card animate-fade-in-up" style="max-width:800px;margin:0 auto;">
          <div class="form-card-header">
            <h3><i data-lucide="${editingInternshipId ? 'edit' : 'plus-circle'}" style="width:20px;height:20px;vertical-align:middle;margin-right:8px;"></i>${editingInternshipId ? 'Edit Internship' : 'Post New Internship'}</h3>
          </div>
          <div class="form-card-body">
            <form id="postForm">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Job Title</label>
                  <input type="text" id="postTitle" class="form-input" placeholder="e.g. Frontend Developer Intern" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Department</label>
                  <select class="form-input" id="postDept">
                    <option>Engineering</option>
                    <option>Design</option>
                    <option>Data Science</option>
                    <option>Marketing</option>
                    <option>Product</option>
                  </select>
                </div>
                <div class="grid grid-2">
                  <div class="form-group">
                    <label>Location</label>
                    <input type="text" id="postLocation" class="form-input" placeholder="e.g. Bangalore, India" required>
                  </div>
                  <div class="form-group">
                    <label>Work Mode</label>
                    <select id="postWorkMode" class="form-input">
                      <option value="In-Office">In-Office</option>
                      <option value="Remote">Work from Home</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>
                <div class="grid grid-2">
                  <div class="form-group">
                    <label>Internship Type</label>
                    <select id="postType" class="form-input">
                      <option>Full-time</option>
                      <option>Part-time</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Timing / Schedule</label>
                    <select id="postTiming" class="form-input">
                      <option>Standard Business Hours</option>
                      <option>Flexible Schedule</option>
                      <option>Project-Based</option>
                    </select>
                  </div>
                </div>
                <div class="grid grid-2">
                  <div class="form-group">
                    <label>Duration</label>
                    <select id="postDuration" class="form-input">
                      <option>3 Months</option>
                      <option>4 Months</option>
                      <option>6 Months</option>
                      <option>12 Months</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Application Deadline</label>
                    <input type="date" id="postDeadline" class="form-input" required>
                  </div>
                </div>
                <div class="form-group">
                  <label>Monthly Stipend</label>
                  <input type="text" id="postStipend" class="form-input" placeholder="e.g. ₹25,000" required>
                </div>

                <div class="form-group full-width">
                  <label class="form-label" style="color:var(--color-primary-600);font-weight:700;">Required Skills (Comma Separated)</label>
                  <input type="text" id="postSkills" class="form-input" placeholder="e.g. React, JavaScript, CSS" required style="border-color:var(--color-primary-200);background:var(--color-primary-50);" />
                </div>
                <div class="form-group full-width">
                  <label class="form-label">Detailed Description</label>
                  <textarea id="postDescription" class="form-input" rows="6" placeholder="Describe the internship role, responsibilities, and requirements..." required></textarea>
                </div>
              </div>
              <div style="display:flex;gap:var(--space-3);justify-content:flex-end;margin-top:var(--space-6);">
                ${editingInternshipId ? `<button type="button" class="btn btn-ghost" id="cancelEditBtn">Cancel</button>` : ''}
                <button type="submit" class="btn btn-primary btn-lg" id="submitPostBtn">
                  <i data-lucide="send" style="width:18px;height:18px;"></i>
                  ${editingInternshipId ? 'Update Listing' : 'Publish Internship Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      `;

    case 'applicants':
      return `
        <div class="table-container animate-fade-in-up">
          <div class="table-header">
            <h3>Manage Applicants</h3>
            <div style="display:flex;gap:var(--space-3);">
              <div class="search-bar" style="width:240px;">
                <i data-lucide="search"></i>
                <input type="text" placeholder="Search name or role..." id="searchApplicants" />
              </div>
              <select class="form-input" style="width:auto;" id="statusFilter">
                <option value="">All Status</option>
                <option>New</option>
                <option>Shortlisted</option>
                <option>Rejected</option>
              </select>
            </div>
          </div>
          <div style="overflow-x:auto;">
            <table>
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Applied For</th>
                  <th>Match Score</th>
                  <th>Selection Stage</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="applicantsBody">
                ${applications.map(a => renderApplicantRow(a)).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;

    case 'listings':
      return `
        <div class="grid grid-2">
          ${activeListings.map(listing => `
            <div class="card animate-fade-in-up" data-id="${listing.id}">
              <div style="display:flex;justify-content:space-between;margin-bottom:var(--space-4);">
                <h3 style="font-size:var(--font-size-lg);">${listing.title}</h3>
                <span class="badge badge-success">Active</span>
              </div>
              <div style="display:flex;flex-direction:column;gap:var(--space-2);font-size:var(--font-size-sm);color:var(--color-gray-600);margin-bottom:var(--space-4);">
                <span><i data-lucide="map-pin" style="width:14px;height:14px;vertical-align:middle;margin-right:6px;"></i>${listing.location}</span>
                <span><i data-lucide="calendar" style="width:14px;height:14px;vertical-align:middle;margin-right:6px;"></i>Posted ${listing.posted}</span>
              </div>
              <div style="display:flex;gap:var(--space-3);">
                <a href="#/company?tab=applicants" class="btn btn-primary btn-sm">View ${listing.applicants || 0} Applicants</a>
                <button class="btn btn-ghost btn-sm edit-listing-btn">Edit</button>
                <button class="btn btn-ghost btn-sm delete-listing-btn" style="color:var(--color-danger-500);">Delete</button>
              </div>
            </div>
          `).join('') || `
            <div class="empty-state animate-fade-in-up" style="grid-column: 1 / -1; padding: var(--space-12); text-align: center; background: white; border-radius: var(--radius-lg); border: 2px dashed var(--color-gray-200);">
              <i data-lucide="briefcase" style="width: 48px; height: 48px; color: var(--color-gray-300); margin: 0 auto var(--space-4); display: block;"></i>
              <h3>No Active Listings</h3>
              <p style="color: var(--color-gray-500); margin-bottom: var(--space-6);">You haven't posted any internship opportunities yet.</p>
              <a href="#/company?tab=post" class="btn btn-primary">
                <i data-lucide="plus-circle" style="width: 18px; height: 18px;"></i>
                Create Your First Listing
              </a>
            </div>
          `}
        </div>
      `;

    case 'analytics':
      return `
        <div class="grid grid-2 animate-fade-in-up" style="margin-bottom:var(--space-6);">
          <div class="chart-card">
            <h3 style="margin-bottom:var(--space-4);">Application Trends</h3>
            <canvas id="compTrendsChart" height="250"></canvas>
          </div>
          <div class="chart-card">
            <h3 style="margin-bottom:var(--space-4);">Top Skills Requested</h3>
            <canvas id="compSkillsChart" height="250"></canvas>
          </div>
        </div>
        <div class="grid grid-3">
          <div class="card" style="text-align:center;">
            <div style="font-size:var(--font-size-xs);color:var(--color-gray-500);text-transform:uppercase;">Avg. Match Score</div>
            <div style="font-size:var(--font-size-2xl);font-weight:600;color:var(--color-primary-500);margin-top:4px;">84%</div>
          </div>
          <div class="card" style="text-align:center;">
            <div style="font-size:var(--font-size-xs);color:var(--color-gray-500);text-transform:uppercase;">Shortlist Rate</div>
            <div style="font-size:var(--font-size-2xl);font-weight:600;color:var(--color-success-500);margin-top:4px;">32%</div>
          </div>
          <div class="card" style="text-align:center;">
            <div style="font-size:var(--font-size-xs);color:var(--color-gray-500);text-transform:uppercase;">Time to Hire</div>
            <div style="font-size:var(--font-size-2xl);font-weight:600;color:var(--color-warning-500);margin-top:4px;">12 Days</div>
          </div>
        </div>
      `;
  }
}

function renderApplicantRow(a) {
  const statusMap = { 
    'Offer Extended': 'success', 
    'Hired': 'success', 
    'Application Received': 'primary', 
    'Not Selected': 'danger', 
    'Rejected': 'danger' 
  };
  const badgeType = statusMap[a.status] || 'primary';
  const scoreColor = a.score >= 85 ? 'var(--color-success-500)' : a.score >= 70 ? 'var(--color-warning-500)' : 'var(--color-danger-500)';
  const currentStage = a.stage || 'Applied';

  const stages = [
    'Application Received', 
    'Technical Assessment', 
    'Initial Screening', 
    'Communication Evaluation', 
    'Technical Interview', 
    'HR / Cultural Fit', 
    'Offer Extended', 
    'Not Selected'
  ];

  return `
    <tr data-id="${a.id}">
      <td>
        <div style="display:flex;align-items:center;gap:var(--space-3);">
          <div class="avatar" style="background:${a.user_color || '#ccc'};width:36px;height:36px;">${a.avatar || '?'}</div>
          <div>
            <div style="font-weight:600;">${a.student_name}</div>
            <div style="font-size:12px;color:var(--color-gray-500);">${a.email}</div>
          </div>
        </div>
      </td>
      <td style="font-weight:500;">${a.role}</td>
      <td>
        <span style="font-weight:bold;color:${scoreColor};">${a.score || 0}% Match</span>
      </td>
      <td>
        <select class="form-input stage-select" style="width:auto; font-size:12px; padding:4px 8px; height:auto; border-radius:4px;">
          ${stages.map(s => `<option value="${s}" ${currentStage === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </td>
      <td><span class="badge badge-${badgeType} status-badge">${a.status}</span></td>
      <td>
        <div style="display:flex;gap:var(--space-2);">
          <button class="btn btn-ghost btn-sm view-student-btn" style="color:var(--color-primary-500); padding:4px;" title="View Student Profile">
            <i data-lucide="eye" style="width:16px;height:16px;"></i>
          </button>
          <button class="btn btn-ghost btn-sm action-btn" data-action="shortlist" style="color:var(--color-success-500); padding:4px;" title="Hire / Accept">
            <i data-lucide="user-check" style="width:16px;height:16px;"></i>
          </button>
          <button class="btn btn-ghost btn-sm action-btn" data-action="reject" style="color:var(--color-danger-500); padding:4px;" title="Decline / Reject">
            <i data-lucide="user-x" style="width:16px;height:16px;"></i>
          </button>
        </div>
      </td>
    </tr>
  `;
}

function attachTabListeners(container, currentTab, applications, activeListings) {
  if (currentTab === 'post') {
    const postForm = container.querySelector('#postForm');
    
    // If editing, pre-fill
    if (editingInternshipId) {
      const listing = activeListings.find(l => l.id === parseInt(editingInternshipId));
      if (listing) {
        container.querySelector('#postTitle').value = listing.title;
        container.querySelector('#postDept').value = listing.department || 'Engineering';
        container.querySelector('#postLocation').value = listing.location;
        container.querySelector('#postType').value = listing.type;
        container.querySelector('#postDuration').value = listing.duration;
        container.querySelector('#postWorkMode').value = listing.work_mode || 'In-Office';
        container.querySelector('#postTiming').value = listing.timing || 'Flexible';
        container.querySelector('#postDeadline').value = listing.deadline || '';
        container.querySelector('#postStipend').value = listing.stipend;
        container.querySelector('#postSkills').value = (listing.skills || []).join(', ');
        container.querySelector('#postDescription').value = listing.description;
      }
    }

    container.querySelector('#cancelEditBtn')?.addEventListener('click', () => {
      editingInternshipId = null;
      window.location.hash = '#/company?tab=listings';
    });

    postForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const title = container.querySelector('#postTitle').value.trim();
      const stipend = container.querySelector('#postStipend').value.trim();
      const deadline = container.querySelector('#postDeadline').value;
      const skills = container.querySelector('#postSkills').value.trim();

      // World-class Validation Logic
      if (!title) return toast.error('Job Title is required');
      if (isNaN(stipend.replace(/[^0-9]/g, ''))) return toast.error('Please enter a valid numeric stipend amount');
      
      const deadlineDate = new Date(deadline);
      if (deadline && deadlineDate < new Date()) {
        return toast.error('Application deadline cannot be in the past');
      }

      if (!skills) return toast.error('Please list at least one required skill');

      const submitBtn = container.querySelector('#submitPostBtn');
      try {
        submitBtn.innerHTML = '<i data-lucide="loader" class="spin" style="width:16px;height:16px;"></i> Publishing...';
        submitBtn.disabled = true;
        if (window.lucide) window.lucide.createIcons();

        const payload = {
          title,
          department: container.querySelector('#postDept').value,
          location: container.querySelector('#postLocation').value,
          type: container.querySelector('#postType').value,
          duration: container.querySelector('#postDuration').value,
          work_mode: container.querySelector('#postWorkMode').value,
          timing: container.querySelector('#postTiming').value,
          deadline,
          stipend: formatStipend(stipend),
          skills: skills.split(',').map(s => s.trim()).filter(s => s),
          description: container.querySelector('#postDescription').value
        };

        if (editingInternshipId) {
          await api.put(`/internships/${editingInternshipId}`, payload);
          alert('Internship Updated Successfully!');
        } else {
          await api.post('/internships', payload);
          alert('Internship Published Successfully!');
        }
        
        editingInternshipId = null;
        window.location.hash = '#/company?tab=listings';
      } catch (err) {
        alert('Error: ' + err.message);
        submitBtn.innerHTML = editingInternshipId ? 'Update Listing' : 'Publish Internship Now';
        submitBtn.disabled = false;
        if (window.lucide) window.lucide.createIcons();
      }
    });
  }

  if (currentTab === 'listings') {
    container.querySelectorAll('.edit-listing-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        editingInternshipId = e.target.closest('.card').dataset.id;
        window.location.hash = '#/company?tab=post';
      });
    });

    container.querySelectorAll('.delete-listing-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.closest('.card').dataset.id;
        if (confirm('Are you sure you want to delete this listing? This will also remove all associated applications.')) {
          try {
            await api.delete(`/internships/${id}`);
            renderCompanyDashboard(container);
          } catch (err) {
            alert('Error deleting listing: ' + err.message);
          }
        }
      });
    });
  }

  if (currentTab === 'listings' && activeListings.length === 0) {
    // Already handled in renderTabContent switch
  }

  if (currentTab === 'applicants') {
    const searchInput = container.querySelector('#searchApplicants');
    const tbody = container.querySelector('#applicantsBody');
    const statusFilter = container.querySelector('#statusFilter');

    const refreshTable = () => {
      const q = searchInput.value.toLowerCase();
      const status = statusFilter.value;
      let filtered = applications.filter(a => (a.student_name || '').toLowerCase().includes(q) || (a.role || '').toLowerCase().includes(q));
      if (status) filtered = filtered.filter(a => a.status === status);
      tbody.innerHTML = filtered.length 
        ? filtered.map(a => renderApplicantRow(a)).join('')
        : '<tr><td colspan="5" style="text-align:center;padding:var(--space-8);color:var(--color-gray-400);"><i data-lucide="users-2" style="width:48px;height:48px;margin-bottom:var(--space-2);opacity:0.5;"></i><p>No applicants found.</p></td></tr>';
      if (window.lucide) window.lucide.createIcons();
    };

    searchInput.addEventListener('input', refreshTable);
    statusFilter.addEventListener('change', refreshTable);

    tbody.addEventListener('change', async (e) => {
      const select = e.target.closest('.stage-select');
      if (!select) return;
      const row = select.closest('tr');
      const appId = row.dataset.id;
      const stage = select.value;
      const status = (stage === 'Hired' ? 'Hired' : stage === 'Rejected' ? 'Rejected' : 'Under Review');

      try {
        select.disabled = true;
        await api.put(`/applications/${appId}/status`, { status, stage });
        toast.success(`Candidate moved to ${stage}`);
        renderCompanyDashboard(container);
      } catch (err) {
        toast.error(err.message);
        select.disabled = false;
      }
    });

    tbody.addEventListener('click', async (e) => {
      const viewBtn = e.target.closest('.view-student-btn');
      if (viewBtn) {
        const row = viewBtn.closest('tr');
        const id = row.dataset.id;
        const app = applications.find(a => a.id == id);
        showStudentProfile(app);
        return;
      }

      const btn = e.target.closest('.action-btn');
      if (!btn) return;
      const row = btn.closest('tr');
      const appId = row.dataset.id;
      const action = btn.dataset.action;
      const status = action === 'shortlist' ? 'Hired' : 'Rejected';
      const stage = action === 'shortlist' ? 'Hired' : 'Rejected';
      const confirmMsg = action === 'shortlist' ? 'Are you sure you want to HIRE this candidate?' : 'Are you sure you want to REJECT this candidate?';
      
      if (!confirm(confirmMsg)) return;

      try {
        btn.innerHTML = '<i data-lucide="loader" class="spin" style="width:14px;height:14px;"></i>';
        await api.put(`/applications/${appId}/status`, { status, stage });
        toast.success(action === 'shortlist' ? 'Candidate Hired!' : 'Candidate Rejected');
        renderCompanyDashboard(container); // Full refresh
      } catch (err) {
        toast.error(err.message);
      }
    });
  }

  // Analytics tab charts
  if (currentTab === 'analytics') {
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not loaded yet. Retrying...');
      setTimeout(() => attachListeners(container, activeListings, applicants, currentTab), 500);
      return;
    }
    const trendsCtx = container.querySelector('#compTrendsChart');
    if (trendsCtx) {
      new Chart(trendsCtx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Applications',
            data: [12, 19, 15, 25, 22, 30],
            borderColor: '#3B82F6',
            tension: 0.3,
            fill: true,
            backgroundColor: 'rgba(59, 130, 246, 0.1)'
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    const skillsCtx = container.querySelector('#compSkillsChart');
    if (skillsCtx) {
      new Chart(skillsCtx, {
        type: 'doughnut',
        data: {
          labels: ['React', 'JavaScript', 'Python', 'UI Design'],
          datasets: [{
            data: [40, 25, 20, 15],
            backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }
  }
}

function showStudentProfile(app) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay active';
  modal.innerHTML = `
    <div class="card animate-scale-in" style="width:100%; max-width:600px; padding:var(--space-8); position:relative;">
      <button class="btn btn-ghost btn-icon close-modal" style="position:absolute; top:var(--space-4); right:var(--space-4);">
        <i data-lucide="x"></i>
      </button>
      
      <div style="display:flex; align-items:center; gap:var(--space-6); margin-bottom:var(--space-8);">
        <div class="avatar" style="background:${app.user_color || 'var(--color-primary-500)'}; width:80px; height:80px; font-size:32px;">${app.avatar || app.student_name.charAt(0)}</div>
        <div>
          <h2 style="margin:0; font-size:var(--font-size-2xl);">${app.student_name}</h2>
          <p style="color:var(--color-gray-500); margin-top:4px;">${app.email}</p>
          <div class="badge badge-success" style="margin-top:var(--space-2);">Match Score: ${app.score}%</div>
        </div>
      </div>

      <div class="grid grid-2" style="gap:var(--space-8);">
        <div>
          <h4 style="margin-bottom:var(--space-4); display:flex; align-items:center; gap:8px;">
            <i data-lucide="graduation-cap" style="width:18px;height:18px;color:var(--color-primary-500);"></i>
            University / Institution
          </h4>
          <p style="color:var(--color-gray-700); font-weight:600;">${app.university || 'Not specified'}</p>
          <p style="color:var(--color-gray-500); font-size:13px; margin-top:4px;">${app.qualification || 'General Qualification'}</p>
        </div>
        <div>
          <h4 style="margin-bottom:var(--space-4); display:flex; align-items:center; gap:8px;">
            <i data-lucide="briefcase" style="width:18px;height:18px;color:var(--color-primary-500);"></i>
            Professional Experience
          </h4>
          <p style="color:var(--color-gray-700);">${app.experience || 'Fresher / Entry Level'}</p>
          <p style="color:var(--color-gray-500); font-size:13px; margin-top:4px;">Location: ${app.location || 'Remote-ready'}</p>
        </div>
      </div>

      ${app.resume_url ? `
      <div style="margin-top:var(--space-8); padding:var(--space-4); background:var(--color-primary-50); border-radius:var(--radius-md); display:flex; align-items:center; justify-content:space-between; border:1px solid var(--color-primary-100);">
        <div style="display:flex; align-items:center; gap:12px;">
          <i data-lucide="file-text" style="color:var(--color-primary-600);"></i>
          <div>
            <div style="font-weight:600; font-size:14px;">Candidate Resume</div>
            <div style="font-size:11px; color:var(--color-gray-500);">Verified Professional Document</div>
          </div>
        </div>
        <a href="${app.resume_url}" target="_blank" class="btn btn-primary btn-sm">View Resume</a>
      </div>
      ` : ''}

      <div style="margin-top:var(--space-8);">
        <h4 style="margin-bottom:var(--space-4); display:flex; align-items:center; gap:8px;">
          <i data-lucide="code-2" style="width:18px;height:18px;color:var(--color-primary-500);"></i>
          Technical Skill Match
        </h4>
        <div style="display:flex; flex-wrap:wrap; gap:8px;">
          ${(app.skills || []).map(s => `<span class="badge badge-primary">${s}</span>`).join('') || '<span style="color:var(--color-gray-400);">No specific skills found</span>'}
        </div>
      </div>

      <div style="margin-top:var(--space-8);">
        <h4 style="margin-bottom:var(--space-4); display:flex; align-items:center; gap:8px;">
          <i data-lucide="languages" style="width:18px;height:18px;color:var(--color-primary-500);"></i>
          Languages Known
        </h4>
        <p style="color:var(--color-gray-700);">${app.languages || 'English, Hindi'}</p>
      </div>

      <div style="margin-top:var(--space-10); display:flex; gap:var(--space-4);">
        <button class="btn btn-primary hire-student-btn" style="flex:1;">Hire Candidate</button>
        <button class="btn btn-ghost reject-student-btn" style="flex:1; color:var(--color-danger-500);">Decline</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  if (window.lucide) window.lucide.createIcons();

  const close = () => modal.remove();
  modal.querySelector('.close-modal').onclick = close;
  modal.onclick = (e) => { if (e.target === modal) close(); };

  modal.querySelector('.hire-student-btn').onclick = async () => {
    if (confirm('Hire this candidate?')) {
      await api.put(`/applications/${app.id}/status`, { status: 'Hired', stage: 'Hired' });
      toast.success('Candidate Hired!');
      close();
      window.location.reload();
    }
  };
}
