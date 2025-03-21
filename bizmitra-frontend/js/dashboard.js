// js/dashboard.js
import { api } from './api.js';

class DashboardService {
  async getStats() {
    return api.get('/dashboard/stats', true);
  }

  async getRecentActivity() {
    return api.get('/dashboard/activity', true);
  }

  async getUpcomingMentorships() {
    return api.get('/dashboard/mentorships/upcoming', true);
  }

  async getUpcomingEvents() {
    return api.get('/dashboard/events/upcoming', true);
  }

  async getUserGoals() {
    return api.get('/dashboard/goals', true);
  }

  async updateGoal(goalId, updates) {
    return api.put(`/dashboard/goals/${goalId}`, updates, true);
  }

  async createGoal(goalData) {
    return api.post('/dashboard/goals', goalData, true);
  }

  async getNotifications(page = 1, limit = 10) {
    return api.get(`/notifications?page=${page}&limit=${limit}`, true);
  }

  async markNotificationRead(notificationId) {
    return api.put(`/notifications/${notificationId}/read`, {}, true);
  }

  async markAllNotificationsRead() {
    return api.put('/notifications/read-all', {}, true);
  }

  async getTasksAndReminders() {
    return api.get('/dashboard/tasks', true);
  }

  async completeTask(taskId) {
    return api.put(`/dashboard/tasks/${taskId}/complete`, {}, true);
  }

  async createTask(taskData) {
    return api.post('/dashboard/tasks', taskData, true);
  }

  renderDashboardStats(selector, stats) {
    const container = document.querySelector(selector);
    if (!container) return;

    container.innerHTML = `
      <div class="stat-card">
        <i class="fas fa-users stat-icon"></i>
        <div class="stat-content">
          <h3>${stats.totalConnections}</h3>
          <p>Total Connections</p>
        </div>
      </div>
      <div class="stat-card">
        <i class="fas fa-calendar-check stat-icon"></i>
        <div class="stat-content">
          <h3>${stats.upcomingSessions}</h3>
          <p>Upcoming Sessions</p>
        </div>
      </div>
      <div class="stat-card">
        <i class="fas fa-comments stat-icon"></i>
        <div class="stat-content">
          <h3>${stats.totalMessages}</h3>
          <p>Messages</p>
        </div>
      </div>
      <div class="stat-card">
        <i class="fas fa-star stat-icon"></i>
        <div class="stat-content">
          <h3>${stats.averageRating}</h3>
          <p>Average Rating</p>
        </div>
      </div>
    `;
  }

  renderActivity(selector, activities) {
    const container = document.querySelector(selector);
    if (!container) return;

    container.innerHTML = activities.map(activity => `
      <div class="activity-item">
        <div class="activity-icon ${activity.type}">
          <i class="fas fa-${this.getActivityIcon(activity.type)}"></i>
        </div>
        <div class="activity-content">
          <p>${activity.message}</p>
          <span class="activity-time">${this.formatTimeAgo(activity.timestamp)}</span>
        </div>
      </div>
    `).join('');
  }

  getActivityIcon(type) {
    const icons = {
      'connection': 'user-plus',
      'message': 'comment',
      'session': 'video',
      'event': 'calendar',
      'achievement': 'trophy'
    };
    return icons[type] || 'bell';
  }

  formatTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000);
    
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  }
}

export const dashboard = new DashboardService();
