// js/auth.js
import { api } from './api.js';

class AuthService {
  constructor() {
    this.currentUser = JSON.parse(localStorage.getItem('user_data'));
    this.authStateListeners = [];
    
    // Setup event listener for authentication issues
    window.addEventListener('auth:required', () => this.handleAuthRequired());
  }

  async login(email, password) {
    try {
      const data = await api.post('/auth/login', { email, password });
      this.handleAuthSuccess(data);
      return data.user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async register(userData) {
    try {
      const data = await api.post('/auth/register', userData);
      this.handleAuthSuccess(data);
      return data.user;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  async verifyEmail(token) {
    return api.post('/auth/verify-email', { token });
  }

  async forgotPassword(email) {
    return api.post('/auth/forgot-password', { email });
  }

  async resetPassword(token, newPassword) {
    return api.post('/auth/reset-password', { token, newPassword });
  }

  async logout() {
    try {
      // Notify backend about logout if needed
      if (this.isAuthenticated()) {
        await api.post('/auth/logout', {}, true);
      }
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      this.clearSession();
    }
  }

  handleAuthSuccess(data) {
    api.setAuthToken(data.token);
    localStorage.setItem('user_data', JSON.stringify(data.user));
    this.currentUser = data.user;
    this.notifyAuthStateChanged(true);
  }

  clearSession() {
    api.clearAuthToken();
    localStorage.removeItem('user_data');
    this.currentUser = null;
    this.notifyAuthStateChanged(false);
  }

  handleAuthRequired() {
    this.clearSession();
    window.location.href = '/login?expired=true';
  }

  isAuthenticated() {
    return !!localStorage.getItem('auth_token');
  }

  getCurrentUser() {
    return this.currentUser;
  }

  hasRole(role) {
    return this.currentUser && this.currentUser.roles.includes(role);
  }

  onAuthStateChanged(callback) {
    this.authStateListeners.push(callback);
    // Immediately call with current state
    callback(this.isAuthenticated(), this.currentUser);
  }

  notifyAuthStateChanged(isAuthenticated) {
    this.authStateListeners.forEach(callback => 
      callback(isAuthenticated, this.currentUser)
    );
  }

  async updateProfile(userData) {
    try {
      const updatedUser = await api.put('/users/profile', userData, true);
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      this.currentUser = updatedUser;
      this.notifyAuthStateChanged(true);
      return updatedUser;
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  }
}

export const auth = new AuthService();
