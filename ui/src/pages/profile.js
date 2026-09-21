/**
 * Profile & Skill Management Page
 * Editable profile, skill tags, resume upload
 */
import { renderSidebar, renderNavbar, initSidebarToggle } from '../components/layout.js';
import { api } from '../api.js';

export async function renderProfile(container) {
  container.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100%;"><i data-lucide="loader" class="spin" style="width:32px;height:32px;"></i></div>';
  if (window.lucide) window.lucide.createIcons();

  try {
    const [user, applications] = await Promise.all([
      api.get('/users/me'),
      api.get('/applications')
    ]);
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const currentTab = urlParams.get('tab') || 'info';
    const skills = user.skills || [];

    const lastSeenCount = parseInt(localStorage.getItem('lastSeenCount') || '0');
    const unreadApps = Math.max(0, applications.length - lastSeenCount);

    container.innerHTML = `
      <div class="app-layout">
        ${renderSidebar(currentTab === 'settings' ? 'settings' : 'profile', user.role, { apps: unreadApps })}
        
        <div class="main-content">
          ${renderNavbar('Profile & Skills')}
          
          <div class="container">
            <!-- Profile Header -->
            <div class="profile-header animate-fade-in-up">
              <div class="profile-avatar-wrapper">
                <div class="profile-avatar" style="background:${user.color || '#3B82F6'}">${user.avatar || '?'}</div>
                <div class="profile-avatar-edit" id="avatarEdit" title="Change photo">
                  <i data-lucide="camera"></i>
                </div>
              </div>
              <div class="profile-info" style="position:relative;z-index:1;">
                <h1>${user.name}</h1>
                <p style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-1);">
                  <i data-lucide="mail" style="width:14px;height:14px;"></i>
                  ${user.email}
                </p>
                <p style="display:flex;align-items:center;gap:var(--space-2);">
                  <i data-lucide="map-pin" style="width:14px;height:14px;"></i>
                  ${user.location || 'Add location'}
                </p>
                <div class="container">
            <!-- Tabs -->
            <div class="login-tabs" style="margin-bottom:var(--space-6); justify-content:flex-start; border-bottom:1px solid var(--color-gray-100);">
              <a href="#/profile?tab=info" class="login-tab ${currentTab === 'info' ? 'active' : ''}" style="text-decoration:none;">Personal Info</a>
              <a href="#/profile?tab=settings" class="login-tab ${currentTab === 'settings' ? 'active' : ''}" style="text-decoration:none;">Account Settings</a>
            </div>

            ${currentTab === 'info' ? `
              <div class="page-header">
                <h1 style="font-size:var(--font-size-2xl);">Profile & Skills</h1>
                <p>Manage your professional identity and skill bridge.</p>
              </div>

              <div style="display:grid; grid-template-columns:1fr 2.5fr; gap:var(--space-8);">
                <!-- Left Column -->
                <div style="display:flex; flex-direction:column; gap:var(--space-6);">
                  <div class="card animate-fade-in-up" style="animation-delay:100ms;">
                    <h3 style="font-size:var(--font-size-lg); font-weight:var(--font-weight-semibold); margin-bottom:var(--space-6);">Personal Information</h3>
                    <form id="profileForm">
                      <div class="form-grid">
                        <div class="form-group full-width">
                          <label class="form-label">Full Name</label>
                          <input type="text" id="profName" class="form-input" value="${user.name}" required />
                        </div>
                        <div class="form-group">
                          <label class="form-label">Phone</label>
                          <input type="tel" id="profPhone" class="form-input" value="${user.phone || ''}" placeholder="+91 98765 43210" />
                        </div>
                        <div class="form-group">
                          <label class="form-label">Location</label>
                          <input type="text" id="profLocation" class="form-input" value="${user.location || ''}" placeholder="Mumbai, India" />
                        </div>
                        <div class="form-group full-width">
                          <label class="form-label">University / Company</label>
                          <input type="text" id="profUni" class="form-input" value="${user.university || ''}" placeholder="IIT Bombay" />
                        </div>
                        <div class="form-group full-width">
                          <label class="form-label">Bio</label>
                          <textarea id="profBio" class="form-input" rows="3" placeholder="Tell us about yourself...">${user.bio || ''}</textarea>
                        </div>
                      </div>
                      <div style="display:flex;gap:var(--space-3);justify-content:flex-end;margin-top:var(--space-4);">
                        <button type="submit" class="btn btn-primary" id="saveProfileBtn">Save Changes</button>
                      </div>
                    </form>
                  </div>
                </div>

                <!-- Right Column -->
                <div style="display:flex; flex-direction:column; gap:var(--space-6);">
                  <div class="card animate-fade-in-up" style="animation-delay:150ms;">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-6);">
                      <h3 style="font-size:var(--font-size-lg); font-weight:var(--font-weight-semibold);">Skills</h3>
                      <span class="badge badge-primary" id="skillCountBadge">${skills.length} skills</span>
                    </div>
                    <div id="skillsContainer" style="display:flex;flex-wrap:wrap;gap:var(--space-2);margin-bottom:var(--space-4);">
                      ${skills.map(skill => `<span class="skill-tag" data-skill="${skill}">${skill}<span class="remove-tag">×</span></span>`).join('')}
                    </div>
                    <div style="display:flex;gap:var(--space-2);">
                      <input type="text" class="form-input" id="newSkillInput" placeholder="Add a new skill..." style="flex:1;" />
                      <button class="btn btn-primary" id="addSkillBtn">Add</button>
                    </div>
                  </div>
                  <div class="card animate-fade-in-up" style="animation-delay:200ms;">
                    <h3 style="font-size:var(--font-size-lg); font-weight:var(--font-weight-semibold); margin-bottom:var(--space-6);">Resume</h3>
                    <div class="upload-dropzone" id="resumeDropzone">
                      <i data-lucide="upload-cloud" style="width:40px;height:40px;margin-bottom:12px;color:var(--color-gray-400);"></i>
                      <p>Click to upload or drag and drop</p>
                    </div>
                  </div>
                </div>
              </div>
            ` : `
              <div class="page-header">
                <h1 style="font-size:var(--font-size-2xl);">Account Settings</h1>
                <p>Manage your security, notifications, and privacy.</p>
              </div>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-8);">
                <div class="card animate-fade-in-up">
                  <h3 style="margin-bottom:var(--space-6);">Security Settings</h3>
                  <div class="form-group full-width">
                    <label class="form-label">Email Address</label>
                    <input type="email" class="form-input" value="${user.email}" readonly style="background:var(--color-gray-50); color: var(--color-gray-500);" />
                  </div>
                  <div class="form-group full-width" style="margin-top:var(--space-4);">
                    <label class="form-label">Current Password</label>
                    <input type="password" class="form-input" placeholder="••••••••" />
                  </div>
                  <div class="form-group full-width" style="margin-top:var(--space-4);">
                    <label class="form-label">New Password</label>
                    <input type="password" class="form-input" placeholder="Min. 8 characters" />
                  </div>
                  <button class="btn btn-primary" style="margin-top:var(--space-6); width:100%;">Update Password</button>
                </div>

                <div style="display:flex; flex-direction:column; gap:var(--space-6);">
                  <div class="card animate-fade-in-up">
                    <h3 style="margin-bottom:var(--space-6);">Notification Preferences</h3>
                    <div style="display:flex; flex-direction:column; gap:var(--space-4);">
                      <div style="display:flex; justify-content:space-between; align-items:center; padding: var(--space-2) 0; border-bottom: 1px solid var(--color-gray-50);">
                        <div>
                          <div style="font-weight:600; font-size:14px;">Email Notifications</div>
                          <div style="font-size:12px; color:var(--color-gray-500);">Receive updates via email</div>
                        </div>
                        <input type="checkbox" checked />
                      </div>
                      <div style="display:flex; justify-content:space-between; align-items:center; padding: var(--space-2) 0; border-bottom: 1px solid var(--color-gray-50);">
                        <div>
                          <div style="font-weight:600; font-size:14px;">Application Updates</div>
                          <div style="font-size:12px; color:var(--color-gray-500);">Notify when status changes</div>
                        </div>
                        <input type="checkbox" checked />
                      </div>
                    </div>
                  </div>

                  <div class="card animate-fade-in-up" style="border-color:var(--color-danger-100); background:var(--color-danger-50);">
                    <h3 style="color:var(--color-danger-600); font-size: 16px; margin-bottom: var(--space-2);">Danger Zone</h3>
                    <p style="font-size:12px; color:var(--color-danger-500); margin-bottom:var(--space-4);">Once you delete your account, there is no going back. Please be certain.</p>
                    <button class="btn btn-outline" style="border-color:var(--color-danger-500); color:var(--color-danger-600); background:white; font-size: 13px;">Deactivate My Account</button>
                  </div>
                </div>
              </div>
            `}
          </div>
        </div>
      </div>
    `;

    initSidebarToggle();

    // Fetch and show matched internships
    setTimeout(async () => {
      try {
        const internships = await api.get('/internships');
        const matchList = container.querySelector('#skillMatchList');
        const matched = internships.filter(i => 
          i.skills && i.skills.some(s => skills.some(us => us.toLowerCase() === s.toLowerCase()))
        ).slice(0, 3);

        if (matched.length > 0) {
          matchList.innerHTML = matched.map(m => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-3);background:var(--color-gray-50);border-radius:var(--radius-md);">
              <div style="display:flex;align-items:center;gap:var(--space-3);">
                <div style="width:32px;height:32px;border-radius:4px;background:${m.color};display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:12px;">${m.initial}</div>
                <div>
                  <div style="font-weight:600;font-size:13px;">${m.title}</div>
                  <div style="font-size:11px;color:var(--color-gray-500);">${m.company_name}</div>
                </div>
              </div>
              <a href="#/internship-detail?id=${m.id}" class="btn btn-ghost btn-sm" style="padding:4px;"><i data-lucide="arrow-right" style="width:16px;height:16px;"></i></a>
            </div>
          `).join('');
        } else {
          matchList.innerHTML = '<p style="text-align:center;font-size:12px;color:var(--color-gray-400);">No direct skill matches found yet.</p>';
        }
        if (window.lucide) window.lucide.createIcons();
      } catch (e) {}
    }, 500);

    // Profile submit
    const profileForm = container.querySelector('#profileForm');
    if (profileForm) {
      profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = container.querySelector('#saveProfileBtn');
        
        try {
          btn.innerHTML = '<i data-lucide="loader" class="spin" style="width:16px;height:16px;"></i> Saving...';
          btn.disabled = true;
          if (window.lucide) window.lucide.createIcons();

          const updatedData = {
            name: container.querySelector('#profName').value,
            phone: container.querySelector('#profPhone').value,
            location: container.querySelector('#profLocation').value,
            university: container.querySelector('#profUni').value,
            bio: container.querySelector('#profBio').value
          };

          await api.put('/users/me', updatedData);

          // Update local storage
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
          localStorage.setItem('user', JSON.stringify({ ...storedUser, ...updatedData }));

          btn.innerHTML = '<i data-lucide="check" style="width:16px;height:16px;"></i> Saved!';
          btn.style.background = 'var(--color-success-500)';
          if (window.lucide) window.lucide.createIcons();
          setTimeout(() => {
            btn.innerHTML = 'Save Changes';
            btn.style.background = '';
            btn.disabled = false;
            if (window.lucide) window.lucide.createIcons();
          }, 2000);
        } catch (err) {
          alert(err.message);
          btn.innerHTML = 'Save Changes';
          btn.disabled = false;
        }
      });
    }

    // Skill tag interactions
    const skillsContainer = container.querySelector('#skillsContainer');
    const newSkillInput = container.querySelector('#newSkillInput');
    const addSkillBtn = container.querySelector('#addSkillBtn');
    const skillCountBadge = container.querySelector('#skillCountBadge');

    if (skillsContainer && newSkillInput && addSkillBtn) {
      let currentSkills = [...skills];

      // Remove skill
      skillsContainer.addEventListener('click', async (e) => {
        if (e.target.classList.contains('remove-tag')) {
          const tag = e.target.closest('.skill-tag');
          const skill = tag.dataset.skill;
          try {
            await api.delete(`/users/skills/${encodeURIComponent(skill)}`);
            tag.style.transform = 'scale(0)';
            tag.style.opacity = '0';
            setTimeout(() => {
              tag.remove();
              currentSkills = currentSkills.filter(s => s !== skill);
              if (skillCountBadge) skillCountBadge.textContent = `${currentSkills.length} skills`;
            }, 200);
          } catch (err) {
            alert('Failed to remove skill: ' + err.message);
          }
        }
      });

    // Add skill
    async function addSkill() {
      const value = newSkillInput.value.trim();
      if (value && !currentSkills.includes(value)) {
        try {
          addSkillBtn.disabled = true;
          await api.post('/users/skills', { skill: value });
          
          currentSkills.push(value);
          const tag = document.createElement('span');
          tag.className = 'skill-tag';
          tag.setAttribute('data-skill', value);
          tag.innerHTML = `${value}<span class="remove-tag" title="Remove skill">×</span>`;
          tag.style.animation = 'scaleIn 200ms ease-out';
          skillsContainer.appendChild(tag);
          
          newSkillInput.value = '';
          skillCountBadge.textContent = `${currentSkills.length} skills`;
        } catch (err) {
          alert('Failed to add skill: ' + err.message);
        } finally {
          addSkillBtn.disabled = false;
        }
      }
    }

    addSkillBtn.addEventListener('click', addSkill);
    newSkillInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); addSkill(); }
    });
    }

    // Profile Picture Upload
    const avatarEdit = container.querySelector('#avatarEdit');
    const avatarImg = container.querySelector('.profile-avatar');
    if (avatarEdit) {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      
      avatarEdit.onclick = () => fileInput.click();
      
      fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = async (event) => {
            const base64 = event.target.result;
            avatarImg.style.background = `url(${base64}) center/cover`;
            avatarImg.textContent = '';
            try {
              await api.put('/users/me', { avatar: base64 });
              
              // Update local storage
              const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
              localStorage.setItem('user', JSON.stringify({ ...storedUser, avatar: base64 }));
              
              toast.success('Profile picture updated!');
            } catch (err) {
              toast.error('Failed to save avatar');
            }
          };
          reader.readAsDataURL(file);
        }
      };
    }

    // Resume Upload (Simulated with actual file selection)
    const resumeDropzone = container.querySelector('#resumeDropzone');
    if (resumeDropzone) {
      const resumeInput = document.createElement('input');
      resumeInput.type = 'file';
      resumeInput.accept = '.pdf,.doc,.docx';
      
      resumeDropzone.onclick = () => resumeInput.click();
      
      resumeInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          resumeDropzone.innerHTML = `
            <div style="width:100%; text-align:center;">
              <i data-lucide="loader" class="spin" style="width:32px;height:32px;margin:0 auto 12px;display:block;color:var(--color-primary-500);"></i>
              <p style="font-weight:600;color:var(--color-primary-600);">Uploading ${file.name}...</p>
              <div style="width:100%;height:4px;background:#eee;border-radius:2px;margin-top:12px;overflow:hidden;">
                <div id="uploadProgress" style="width:0%;height:100%;background:var(--color-primary-500);transition:width 0.3s;"></div>
              </div>
            </div>
          `;
          if (window.lucide) window.lucide.createIcons();
          
          let progress = 0;
          const interval = setInterval(() => {
            progress += 10;
            const bar = container.querySelector('#uploadProgress');
            if (bar) bar.style.width = progress + '%';
            if (progress >= 100) {
              clearInterval(interval);
              resumeDropzone.innerHTML = `
                <div style="display:flex;align-items:center;gap:12px;width:100%;padding:10px;background:#f0f9ff;border-radius:12px;border:1px solid #bae6fd;">
                  <div style="width:40px;height:40px;background:white;border-radius:8px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 4px rgba(0,0,0,0.05);"><i data-lucide="file-text" style="color:#0284c7;"></i></div>
                  <div style="flex:1;text-align:left;">
                    <div style="font-size:14px;font-weight:700;color:#0369a1;">${file.name}</div>
                    <div style="font-size:11px;color:#0ea5e9;">Uploaded successfully</div>
                  </div>
                  <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation(); window.location.reload();" style="color:#ef4444;">Remove</button>
                </div>
              `;
              if (window.lucide) window.lucide.createIcons();
              toast.success('Resume uploaded successfully!');
            }
          }, 200);
        }
      };

      resumeDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        resumeDropzone.style.borderColor = 'var(--color-primary-500)';
        resumeDropzone.style.background = 'var(--color-primary-50)';
      });
      resumeDropzone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        resumeDropzone.style.borderColor = '';
        resumeDropzone.style.background = '';
      });
      resumeDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        resumeDropzone.style.borderColor = '';
        resumeDropzone.style.background = '';
        const file = e.dataTransfer.files[0];
        if (file) {
          resumeInput.files = e.dataTransfer.files;
          resumeInput.onchange({ target: { files: e.dataTransfer.files } });
        }
      });
    }

  } catch (err) {
    container.innerHTML = `<div class="error-state">Failed to load profile: ${err.message}</div>`;
  }
}
