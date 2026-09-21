/**
 * Internship Listing Page
 * Grid-based cards with filters and search
 */
import { renderSidebar, renderNavbar, initSidebarToggle } from '../components/layout.js';
import { api } from '../api.js';
import { formatStipend } from '../utils.js';

export async function renderInternshipListing(container) {
  container.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100%;"><i data-lucide="loader" class="spin" style="width:32px;height:32px;"></i></div>';
  if (window.lucide) window.lucide.createIcons();

  try {
    const [user, internships, applications] = await Promise.all([
      api.get('/users/me'),
      api.get('/internships'),
      api.get('/applications')
    ]);

    const lastSeenCount = parseInt(localStorage.getItem('lastSeenCount') || '0');
    const unreadApps = Math.max(0, applications.length - lastSeenCount);

    container.innerHTML = `
      <div class="app-layout">
        ${renderSidebar('internships', user.role, { apps: unreadApps })}
        
        <div class="main-content">
          ${renderNavbar('Internships')}
          
          <div class="container">
            <!-- Page Header -->
            <div class="page-header" style="display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:var(--space-4);">
              <div>
                <h1 style="font-size:var(--font-size-2xl);">Browse Internships</h1>
                <p>Discover <strong>${internships.length}</strong> active internship opportunities from top companies</p>
              </div>
              <div style="display:flex;gap:var(--space-3);">
                <button class="btn btn-secondary btn-sm" id="gridViewBtn" style="color:var(--color-primary-500);">
                  <i data-lucide="layout-grid" style="width:16px;height:16px;"></i>
                </button>
                <button class="btn btn-ghost btn-sm" id="listViewBtn">
                  <i data-lucide="list" style="width:16px;height:16px;"></i>
                </button>
              </div>
            </div>

            <!-- Search & Filters -->
            <div class="filters-section animate-fade-in-up">
              <div class="filters-row">
                <div class="search-bar" style="flex:1;max-width:100%;">
                  <i data-lucide="search"></i>
                  <input type="text" placeholder="Search by role, company, or skill..." id="searchInput" />
                </div>
                <div class="filter-group">
                  <label>Location</label>
                  <select id="filterLocation">
                    <option value="">All Locations</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Remote">Remote</option>
                    <option value="Noida">Noida</option>
                    <option value="Mumbai">Mumbai</option>
                  </select>
                </div>
                <div class="filter-group">
                  <label>Duration</label>
                  <select id="filterDuration">
                    <option value="">Any Duration</option>
                    <option value="3 months">3 Months</option>
                    <option value="4 months">4 Months</option>
                    <option value="6 months">6 Months</option>
                  </select>
                </div>
                <div class="filter-group">
                  <label>Type</label>
                  <select id="filterType">
                    <option value="">All Types</option>
                    <option value="Remote">Remote</option>
                    <option value="On-site">On-site</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <button class="btn btn-primary btn-sm" style="align-self:flex-end;" id="applyFilters">
                  <i data-lucide="filter" style="width:14px;height:14px;"></i>
                  Filter
                </button>
              </div>
              <!-- Active Filters -->
              <div id="activeFilters" style="display:flex;gap:var(--space-2);margin-top:var(--space-3);flex-wrap:wrap;"></div>
            </div>

            <!-- Results Count -->
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-5);">
              <p style="font-size:var(--font-size-sm);color:var(--color-gray-500);">
                Showing <strong id="resultCount">${internships.length}</strong> internships
              </p>
              <div style="display:flex;align-items:center;gap:var(--space-2);">
                <span style="font-size:var(--font-size-sm);color:var(--color-gray-500);">Sort by:</span>
                <select style="padding:var(--space-2) var(--space-3);border:1.5px solid var(--color-gray-200);border-radius:var(--radius-md);font-size:var(--font-size-sm);background:white;">
                  <option>Most Recent</option>
                  <option>Stipend: High to Low</option>
                  <option>Stipend: Low to High</option>
                  <option>Most Applicants</option>
                </select>
              </div>
            </div>

            <!-- Internship Grid -->
            <div class="grid grid-3 stagger-children" id="internshipGrid">
              ${internships.map(i => renderInternshipCard(i, user.role)).join('')}
            </div>

            <!-- Pagination -->
            <div class="pagination" id="pagination">
              <div class="pagination-btn disabled" id="prevPage"><i data-lucide="chevron-left" style="width:18px;height:18px;"></i></div>
              <div class="pagination-btn active">1</div>
              ${internships.length > 9 ? `
              <div class="pagination-btn">2</div>
              <div class="pagination-btn">3</div>
              <div style="color:var(--color-gray-400);padding:0 var(--space-2);">...</div>
              <div class="pagination-btn">${Math.ceil(internships.length / 9)}</div>
              ` : ''}
              <div class="pagination-btn ${internships.length <= 9 ? 'disabled' : ''}" id="nextPage"><i data-lucide="chevron-right" style="width:18px;height:18px;"></i></div>
            </div>
          </div>
        </div>
      </div>
    `;

    initSidebarToggle();

    // Search functionality
    const searchInput = container.querySelector('#searchInput');
    const grid = container.querySelector('#internshipGrid');
    const resultCount = container.querySelector('#resultCount');

    const filterGrid = (query) => {
      const q = query.toLowerCase();
      const filtered = internships.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.company_name.toLowerCase().includes(q) ||
        (i.skills && i.skills.some(s => s.toLowerCase().includes(q)))
      );
      grid.innerHTML = filtered.length
        ? filtered.map(i => renderInternshipCard(i, user.role)).join('')
        : '<div class="empty-state" style="grid-column:1/-1;"><i data-lucide="search-x" style="width:64px;height:64px;color:var(--color-gray-300);margin:0 auto var(--space-4);display:block;"></i><h3>No internships found</h3><p>Try adjusting your search terms</p></div>';
      resultCount.textContent = filtered.length;
      if (window.lucide) window.lucide.createIcons();
    };

    searchInput.addEventListener('input', (e) => filterGrid(e.target.value));

    // Handle global search param
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const initQuery = urlParams.get('q');
    if (initQuery) {
      searchInput.value = initQuery;
      filterGrid(initQuery);
    }

    // Filter functionality
    const applyBtn = container.querySelector('#applyFilters');
    applyBtn.addEventListener('click', () => {
      const location = container.querySelector('#filterLocation').value;
      const duration = container.querySelector('#filterDuration').value;
      const type = container.querySelector('#filterType').value;

      let filtered = [...internships];
      if (location) filtered = filtered.filter(i => i.location === location);
      if (duration) filtered = filtered.filter(i => i.duration === duration);
      if (type) filtered = filtered.filter(i => i.type === type);

      grid.innerHTML = filtered.length
        ? filtered.map(i => renderInternshipCard(i, user.role)).join('')
        : '<div class="empty-state" style="grid-column:1/-1;"><i data-lucide="search-x" style="width:64px;height:64px;color:var(--color-gray-300);margin:0 auto var(--space-4);display:block;"></i><h3>No internships found</h3><p>Try adjusting your filters</p></div>';
      resultCount.textContent = filtered.length;

      // Show active filters
      const activeFilters = container.querySelector('#activeFilters');
      const tags = [];
      if (location) tags.push(location);
      if (duration) tags.push(duration);
      if (type) tags.push(type);
      activeFilters.innerHTML = tags.map(t => `<span class="badge badge-primary" style="cursor:pointer;">${t} ×</span>`).join('');

      if (window.lucide) window.lucide.createIcons();
    });

    // Pagination clicks
    container.querySelectorAll('.pagination-btn:not(.disabled)').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.pagination-btn').forEach(b => b.classList.remove('active'));
        if (!btn.querySelector('i')) btn.classList.add('active');
      });
    });

  } catch (err) {
    container.innerHTML = `<div class="error-state">Failed to load internships: ${err.message}</div>`;
  }
}

function renderInternshipCard(i, role) {
  const typeColor = i.type === 'Remote' ? 'success' : i.type === 'Hybrid' ? 'warning' : 'primary';
  return `
    <div class="internship-card" onclick="window.location.hash='/internship-detail?id=${i.id}'">
      <div class="internship-card-header">
        <div class="company-logo" style="background:${i.color};">${i.initial}</div>
        <div style="flex:1;">
          <div class="internship-card-title">${i.title}</div>
          <div class="internship-card-company">${i.company_name}</div>
        </div>
      </div>
      <div class="internship-card-meta">
        <span><i data-lucide="map-pin"></i>${i.location}</span>
        <span><i data-lucide="briefcase"></i>${i.work_mode || 'In-Office'}</span>
        <span><i data-lucide="clock"></i>${i.deadline ? 'Due ' + new Date(i.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Ongoing'}</span>
      </div>
      <div class="internship-card-skills">
        ${(i.skills || []).slice(0, 4).map(s => `<span class="badge badge-gray">${s}</span>`).join('')}
      </div>
      <div class="internship-card-footer">
        <div>
          <div class="stipend" style="font-size:var(--font-size-lg); font-weight:var(--font-weight-bold); color:var(--color-primary-600);">${formatStipend(i.stipend)}</div>
          <span style="font-size:var(--font-size-xs);color:var(--color-gray-400);">${i.applicants || 0} applicants</span>
        </div>
        ${role === 'student' ? `
        <button class="btn btn-primary btn-sm">
          <i data-lucide="send" style="width:14px;height:14px;"></i>
          Apply
        </button>
        ` : ''}
      </div>
    </div>
  `;
}
