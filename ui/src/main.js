import './styles/variables.css';
import './styles/base.css';
import './styles/components.css';

import { Router } from './router.js';
import { renderLogin } from './pages/login.js';
import { renderStudentDashboard } from './pages/studentDashboard.js';
import { renderProfile } from './pages/profile.js';
import { renderInternshipListing } from './pages/internshipListing.js';
import { renderInternshipDetail } from './pages/internshipDetail.js';
import { renderCompanyDashboard } from './pages/companyDashboard.js';
import { renderAdminDashboard } from './pages/adminDashboard.js';
import { toast } from './components/toast.js';

const routes = {
  '/login': renderLogin,
  '/dashboard': renderStudentDashboard,
  '/profile': renderProfile,
  '/internships': renderInternshipListing,
  '/internship-detail': renderInternshipDetail,
  '/company': renderCompanyDashboard,
  '/admin': renderAdminDashboard,
  '/help': () => toast.info('Help Center is coming soon! For urgent support, contact support@skillbridge.com')
};

new Router(routes);
