const API_URL = 'http://127.0.0.1:3000/api';

class ApiService {
  constructor() {
    this.baseUrl = API_URL;
  }

  get token() {
    return localStorage.getItem('token');
  }

  set token(value) {
    if (value) localStorage.setItem('token', value);
    else localStorage.removeItem('token');
  }

  get user() {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  }

  set user(value) {
    if (value) localStorage.setItem('user', JSON.stringify(value));
    else localStorage.removeItem('user');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const token = this.token;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, { ...options, headers });
      
      if (response.status === 401) {
        this.logout();
        window.location.hash = '/login';
        throw new Error('Session expired. Please login again.');
      }

      if (response.status === 403) {
        const data = await response.json();
        if (data.error && data.error.toLowerCase().includes('blocked')) {
          this.logout();
          window.location.hash = '/login';
          toast.error(data.error);
        }
        throw new Error(data.error || 'Access Denied');
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err);
      throw err;
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.token = null;
    this.user = null;
  }

  get(endpoint) { return this.request(endpoint, { method: 'GET' }); }
  post(endpoint, body) { return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) }); }
  put(endpoint, body) { return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) }); }
  delete(endpoint) { return this.request(endpoint, { method: 'DELETE' }); }
}

export const api = new ApiService();
