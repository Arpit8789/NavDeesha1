// js/api.js
const API_BASE_URL = 'https://api.bizmitra.com/v1';
const WS_URL = 'wss://api.bizmitra.com/ws';

class ApiService {
  constructor() {
    this.authToken = localStorage.getItem('auth_token');
  }

  setAuthToken(token) {
    this.authToken = token;
    localStorage.setItem('auth_token', token);
  }

  clearAuthToken() {
    this.authToken = null;
    localStorage.removeItem('auth_token');
  }

  getHeaders(requiresAuth = false) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    if (requiresAuth && this.authToken) {
      headers.append('Authorization', `Bearer ${this.authToken}`);
    }

    return headers;
  }

  async request(method, endpoint, data = null, requiresAuth = false) {
    try {
      const config = {
        method,
        headers: this.getHeaders(requiresAuth),
        body: data ? JSON.stringify(data) : null
      };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      // Check if unauthorized (token expired)
      if (response.status === 401 && requiresAuth) {
        // Try to refresh token or redirect to login
        window.dispatchEvent(new CustomEvent('auth:required'));
        throw new Error('Authentication required');
      }

      return this.handleResponse(response);
    } catch (error) {
      console.error(`API Error: ${method} ${endpoint}`, error);
      throw error;
    }
  }

  async handleResponse(response) {
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const error = isJson && data.message ? data.message : 'An error occurred';
      throw new Error(error);
    }

    return data;
  }

  // HTTP methods
  async get(endpoint, requiresAuth = false) {
    return this.request('GET', endpoint, null, requiresAuth);
  }

  async post(endpoint, data, requiresAuth = false) {
    return this.request('POST', endpoint, data, requiresAuth);
  }

  async put(endpoint, data, requiresAuth = true) {
    return this.request('PUT', endpoint, data, requiresAuth);
  }

  async delete(endpoint, requiresAuth = true) {
    return this.request('DELETE', endpoint, null, requiresAuth);
  }

  // File upload
  async uploadFile(endpoint, file, progressCallback, requiresAuth = true) {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    
    return new Promise((resolve, reject) => {
      xhr.open('POST', `${API_BASE_URL}${endpoint}`);
      
      if (requiresAuth && this.authToken) {
        xhr.setRequestHeader('Authorization', `Bearer ${this.authToken}`);
      }
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && progressCallback) {
          const percentComplete = (event.loaded / event.total) * 100;
          progressCallback(percentComplete);
        }
      });
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(xhr.statusText));
        }
      };
      
      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send(formData);
    });
  }

  // WebSocket connection
  createWebSocket() {
    let wsUrl = WS_URL;
    if (this.authToken) {
      wsUrl += `?token=${this.authToken}`;
    }
    return new WebSocket(wsUrl);
  }
}

export const api = new ApiService();
