/**
 * Premium Login & Signup Page
 * World-class design with glassmorphism and micro-animations
 */
import { api } from '../api.js';
import { toast } from '../components/toast.js';

export function renderLogin(container) {
  container.innerHTML = `
    <div class="login-wrapper" style="display: flex; min-height: 100vh; font-family: 'Inter', sans-serif; background: #fff; overflow: hidden;">
      
      <!-- LEFT: Premium Visual Section -->
      <div class="visual-section" style="flex: 1.1; background: linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%); position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden;">
        <!-- Animated Background Elements -->
        <div style="position: absolute; top: -10%; left: -10%; width: 40%; height: 40%; background: rgba(255,255,255,0.1); border-radius: 50%; filter: blur(80px); animation: float 15s infinite alternate;"></div>
        <div style="position: absolute; bottom: -10%; right: -10%; width: 50%; height: 50%; background: rgba(99,102,241,0.4); border-radius: 50%; filter: blur(100px); animation: float 12s infinite alternate-reverse;"></div>
        
        <div class="visual-content" style="position: relative; z-index: 10; padding: 60px; color: white; max-width: 600px;">
          <div style="margin-bottom: 40px; display: flex; align-items: center; gap: 12px; font-weight: 800; font-size: 24px;">
            <div style="width: 44px; height: 44px; background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.3);">
              <i data-lucide="graduation-cap" style="width: 24px; color: white;"></i>
            </div> SkillBridge
          </div>
          
          <h1 style="font-size: 48px; font-weight: 900; line-height: 1.1; margin-bottom: 24px; letter-spacing: -0.03em;">Launch Your Career with the <span style="color: #e0e7ff;">Right Internship</span></h1>
          <p style="font-size: 18px; line-height: 1.6; opacity: 0.9; margin-bottom: 48px;">Connect with world-class companies, showcase your unique talent, and track your professional trajectory — all in one premium hub.</p>
          
          <!-- Glassmorphism Preview Card -->
          <div class="glass-card animate-float" style="background: rgba(255,255,255,0.1); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.2); border-radius: 28px; padding: 32px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);">
             <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
                <div style="display: flex; gap: 16px; align-items: center;">
                  <div style="width: 56px; height: 56px; background: white; border-radius: 16px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 16px rgba(0,0,0,0.1);">
                    <i data-lucide="layout" style="width: 28px; color: #4f46e5;"></i>
                  </div>
                  <div>
                    <h3 style="margin: 0; font-size: 18px; font-weight: 800;">Frontend Developer</h3>
                    <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.8;">Google — Remote Opportunity</p>
                  </div>
                </div>
                <span style="background: rgba(255,255,255,0.2); padding: 6px 14px; border-radius: 30px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Premium Posting</span>
             </div>
             
             <div style="display: flex; gap: 10px; margin-bottom: 32px;">
                <span class="skill-tag">React</span>
                <span class="skill-tag">TypeScript</span>
                <span class="skill-tag">High Growth</span>
             </div>
             
             <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 24px;">
                <div><p style="margin: 0; font-size: 11px; opacity: 0.6; font-weight: 700; text-transform: uppercase;">MONTHLY STIPEND</p><p style="margin: 4px 0 0 0; font-size: 20px; font-weight: 900;">₹45,000<span style="font-size: 14px; font-weight: 500; opacity: 0.8;">/mo</span></p></div>
                <button style="background: white; color: #4f46e5; border: none; padding: 12px 24px; border-radius: 14px; font-weight: 800; font-size: 13px; cursor: pointer; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">Apply Now</button>
             </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: Interaction Section -->
      <div class="interaction-section" style="flex: 0.9; display: flex; align-items: center; justify-content: center; background: white; padding: 40px;">
        <div style="width: 100%; max-width: 440px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h2 id="formTitle" style="font-size: 32px; font-weight: 900; color: #0f172a; margin: 0 0 12px 0; letter-spacing: -0.02em;">Welcome back</h2>
            <p id="formSubtitle" style="font-size: 15px; color: #64748b; font-weight: 500;">Sign in to manage your professional journey</p>
          </div>

          <!-- Interaction Tabs -->
          <div style="background: #f1f5f9; padding: 6px; border-radius: 16px; display: flex; margin-bottom: 32px;">
            <button class="tab-btn active" data-tab="login">Sign In</button>
            <button class="tab-btn" data-tab="signup">Sign Up</button>
          </div>

          <form id="loginForm" style="display: flex; flex-direction: column; gap: 24px;">
            <div id="signupFields" style="display: none; flex-direction: column; gap: 24px;">
              <div class="input-group">
                <label style="display: block; font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 10px; margin-left: 4px;">FULL NAME</label>
                <div style="position: relative;">
                  <i data-lucide="user" class="input-icon"></i>
                  <input type="text" id="fullName" placeholder="Ex: Aryan Malhotra" class="premium-input" />
                </div>
              </div>
              <div class="input-group">
                <label style="display: block; font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 10px; margin-left: 4px;">ACCOUNT TYPE</label>
                <div style="position: relative;">
                  <i data-lucide="users" class="input-icon"></i>
                  <select id="userRole" class="premium-input" style="appearance: none;">
                    <option value="student">Student Account</option>
                    <option value="company">Company / Hiring Manager</option>
                  </select>
                  <i data-lucide="chevron-down" style="position: absolute; right: 16px; top: 50%; transform: translateY(-50%); width: 16px; color: #94a3b8; pointer-events: none;"></i>
                </div>
              </div>
            </div>

            <div class="input-group">
              <label style="display: block; font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 10px; margin-left: 4px;">EMAIL ADDRESS</label>
              <div style="position: relative;">
                <i data-lucide="mail" class="input-icon"></i>
                <input type="email" id="email" placeholder="name@company.com" class="premium-input" required />
              </div>
            </div>

            <div class="input-group">
              <label style="display: block; font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 10px; margin-left: 4px;">PASSWORD</label>
              <div style="position: relative;">
                <i data-lucide="lock" class="input-icon"></i>
                <input type="password" id="password" placeholder="••••••••••••" class="premium-input" required />
                <button type="button" class="pass-toggle" data-target="password"><i data-lucide="eye" style="width: 18px;"></i></button>
              </div>
            </div>

            <div id="confirmPasswordField" style="display: none;">
              <div class="input-group">
                <label style="display: block; font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 10px; margin-left: 4px;">CONFIRM PASSWORD</label>
                <div style="position: relative;">
                  <i data-lucide="shield-check" class="input-icon"></i>
                  <input type="password" id="confirmPassword" placeholder="••••••••••••" class="premium-input" />
                  <button type="button" class="pass-toggle" data-target="confirmPassword"><i data-lucide="eye" style="width: 18px;"></i></button>
                </div>
              </div>
            </div>

            <div id="loginAddons" style="display: flex; justify-content: space-between; align-items: center;">
              <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: #64748b; font-weight: 600; cursor: pointer;">
                <input type="checkbox" style="width: 18px; height: 18px; accent-color: #4f46e5; border-radius: 4px;" /> Remember me
              </label>
              <a href="#" style="font-size: 13px; color: #4f46e5; font-weight: 700; text-decoration: none;">Forgot password?</a>
            </div>

            <button type="submit" id="submitBtn" class="premium-btn">
              <span>Sign In</span>
              <i data-lucide="arrow-right" style="width: 18px;"></i>
            </button>
          </form>

          <div style="margin-top: 40px; text-align: center; font-size: 14px; color: #64748b; font-weight: 500;">
            <span id="footerText">Don't have an account?</span> <a href="#" id="switchLink" style="color: #4f46e5; font-weight: 800; text-decoration: none;">Create one</a>
          </div>
        </div>
      </div>
    </div>

    <style>
      @keyframes float { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(20px, 40px) scale(1.1); } }
      @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      .animate-float { animation: cardFloat 6s ease-in-out infinite; }
      @keyframes cardFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
      
      .tab-btn { flex: 1; border: none; padding: 12px; font-size: 13px; font-weight: 700; border-radius: 12px; cursor: pointer; transition: 0.3s; background: transparent; color: #64748b; }
      .tab-btn.active { background: white; color: #0f172a; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
      
      .premium-input { width: 100%; height: 54px; background: #f8fafc; border: 1.5px solid #f1f5f9; border-radius: 14px; padding: 0 16px 0 52px; font-size: 14px; color: #1e293b; font-weight: 600; transition: 0.2s; outline: none; }
      .premium-input:focus { border-color: #6366f1; background: white; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
      .premium-input::placeholder { color: #94a3b8; font-weight: 500; }
      
      .input-icon { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); width: 20px; color: #94a3b8; transition: 0.2s; }
      .premium-input:focus + .input-icon, .premium-input:focus ~ .input-icon { color: #6366f1; }
      
      .pass-toggle { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #94a3b8; display: flex; padding: 4px; }
      .pass-toggle:hover { color: #6366f1; }
      
      .premium-btn { height: 56px; background: #4f46e5; color: white; border: none; border-radius: 16px; font-size: 16px; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 12px; cursor: pointer; transition: 0.3s; box-shadow: 0 10px 20px -5px rgba(79, 70, 229, 0.3); }
      .premium-btn:hover { background: #4338ca; transform: translateY(-2px); box-shadow: 0 15px 30px -5px rgba(79, 70, 229, 0.4); }
      .premium-btn:disabled { opacity: 0.7; cursor: not-allowed; }
      
      .skill-tag { background: rgba(255,255,255,0.15); padding: 5px 12px; border-radius: 30px; font-size: 11px; font-weight: 700; letter-spacing: 0.3px; }
    </style>
  `;

  if (window.lucide) window.lucide.createIcons();

  const tabs = container.querySelectorAll('.tab-btn');
  const signupFields = container.querySelector('#signupFields');
  const confirmField = container.querySelector('#confirmPasswordField');
  const loginAddons = container.querySelector('#loginAddons');
  const formTitle = container.querySelector('#formTitle');
  const formSubtitle = container.querySelector('#formSubtitle');
  const submitBtn = container.querySelector('#submitBtn');
  const footerText = container.querySelector('#footerText');
  const switchLink = container.querySelector('#switchLink');

  function updateFormState(mode) {
    const isSignup = mode === 'signup';
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === mode));
    
    signupFields.style.display = isSignup ? 'flex' : 'none';
    confirmField.style.display = isSignup ? 'block' : 'none';
    loginAddons.style.display = isSignup ? 'none' : 'flex';
    
    formTitle.textContent = isSignup ? 'Create Account' : 'Welcome back';
    formSubtitle.textContent = isSignup ? 'Join the elite network of students and companies' : 'Sign in to manage your professional journey';
    submitBtn.querySelector('span').textContent = isSignup ? 'Create Account' : 'Sign In';
    submitBtn.querySelector('i').setAttribute('data-lucide', isSignup ? 'user-plus' : 'arrow-right');
    
    footerText.textContent = isSignup ? 'Already have an account?' : "Don't have an account?";
    switchLink.textContent = isSignup ? 'Sign in' : 'Create one';
    
    if (window.lucide) window.lucide.createIcons();
  }

  tabs.forEach(tab => tab.onclick = () => updateFormState(tab.dataset.tab));
  switchLink.onclick = (e) => { e.preventDefault(); updateFormState(switchLink.textContent.includes('Sign') ? 'login' : 'signup'); };

  // Password toggles
  container.querySelectorAll('.pass-toggle').forEach(btn => {
    btn.onclick = () => {
      const input = container.querySelector(`#${btn.dataset.target}`);
      const isPass = input.type === 'password';
      input.type = isPass ? 'text' : 'password';
      btn.querySelector('i').setAttribute('data-lucide', isPass ? 'eye-off' : 'eye');
      if (window.lucide) window.lucide.createIcons();
    };
  });

  const form = container.querySelector('#loginForm');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const mode = container.querySelector('.tab-btn.active').dataset.tab;
    const email = container.querySelector('#email').value;
    const password = container.querySelector('#password').value;

    try {
      submitBtn.disabled = true;
      submitBtn.querySelector('span').textContent = 'Processing...';
      
      if (mode === 'signup') {
        const name = container.querySelector('#fullName').value;
        const role = container.querySelector('#userRole').value;
        if (password !== container.querySelector('#confirmPassword').value) throw new Error('Passwords mismatch');
        
        const res = await api.post('/auth/register', { name, email, password, role });
        api.token = res.token;
        api.user = res.user;
        toast.success('Account created!');
        window.location.hash = role === 'company' ? '/company' : '/dashboard';
      } else {
        const res = await api.post('/auth/login', { email, password });
        api.token = res.token;
        api.user = res.user;
        toast.success('Welcome back!');
        const route = res.user.role === 'admin' ? '/admin' : (res.user.role === 'company' ? '/company' : '/dashboard');
        window.location.hash = route;
      }
    } catch (err) {
      toast.error(err.message || 'Auth failed');
      submitBtn.disabled = false;
      updateFormState(mode);
    }
  };
}
