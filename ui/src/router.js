import { api } from './api.js';

/**
 * Lightweight hash-based router
 */
export class Router {
  constructor(routes) {
    this.routes = routes;
    this.currentRoute = null;

    window.addEventListener('hashchange', () => this.resolve());
    window.addEventListener('load', () => this.resolve());
  }


  resolve() {
    const rawHash = window.location.hash.slice(1) || '/login';
    const basePath = rawHash.split('?')[0];
    let route = this.routes[basePath] || this.routes['/login'];
    
    // Clear token if explicitly navigating to login (logout)
    if (basePath === '/login') {
      api.token = null;
      api.user = null;
    }
    
    // Auth Guard
    if (basePath !== '/login' && !api.token) {
      window.location.hash = '/login';
      return;
    }

    if (this.currentRoute !== rawHash) {
      this.currentRoute = rawHash;
      const app = document.getElementById('app');
      app.innerHTML = '';
      route(app);

      // Re-initialize Lucide icons after render
      if (window.lucide) {
        window.lucide.createIcons();
      }

      // Scroll to top on navigation
      window.scrollTo(0, 0);
    }
  }

  static navigate(path) {
    window.location.hash = path;
  }
}
