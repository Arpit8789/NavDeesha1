// js/mentorship.js
import { api } from './api.js';

class MentorshipService {
  async searchMentors(filters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    return api.get(`/mentors/search?${queryParams.toString()}`);
  }

  async getMentorProfile(mentorId) {
    return api.get(`/mentors/${mentorId}`);
  }

  async getMyMentorProfile() {
    return api.get('/mentors/me', true);
  }

  async updateMentorProfile(profileData) {
    return api.put('/mentors/me', profileData, true);
  }

  async getAvailableTimeSlots(mentorId, date) {
    const formattedDate = date.toISOString().split('T')[0];
    return api.get(`/mentors/${mentorId}/availability?date=${formattedDate}`);
  }

  async updateAvailability(availabilityData) {
    return api.put('/mentors/me/availability', availabilityData, true);
  }

  async sendConnectionRequest(mentorId, message) {
    return api.post('/connections/request', {
      mentorId,
      message
    }, true);
  }

  async getMyConnections(status = 'all', page = 1) {
    return api.get(`/connections?status=${status}&page=${page}`, true);
  }

  async getPendingRequests() {
    return api.get('/connections/pending', true);
  }

  async respondToConnectionRequest(connectionId, accept) {
    return api.put(`/connections/${connectionId}/respond`, {
      accept
    }, true);
  }

  async scheduleSession(connectionId, sessionData) {
    return api.post(`/connections/${connectionId}/sessions`, sessionData, true);
  }

  async getUpcomingSessions() {
    return api.get('/sessions/upcoming', true);
  }

  async getPastSessions() {
    return api.get('/sessions/past', true);
  }

  async getSessionDetails(sessionId) {
    return api.get(`/sessions/${sessionId}`, true);
  }

  async updateSessionStatus(sessionId, status) {
    return api.put(`/sessions/${sessionId}/status`, { status }, true);
  }

  async provideFeedback(sessionId, feedback) {
    return api.post(`/sessions/${sessionId}/feedback`, feedback, true);
  }

  async addSessionNotes(sessionId, notes) {
    return api.post(`/sessions/${sessionId}/notes`, { notes }, true);
  }

  renderMentorCard(mentor, container) {
    const mentorCard = document.createElement('div');
    mentorCard.className = 'mentor-card';
    
    mentorCard.innerHTML = `
      <div class="mentor-avatar">
        <img src="${mentor.avatar || 'assets/images/avatars/default.png'}" alt="${mentor.name}">
      </div>
      <h3>${mentor.name}</h3>
      <p class="mentor-title">${mentor.title}</p>
      <div class="mentor-rating">
        ${this.generateStarRating(mentor.rating)}
        <span>(${mentor.reviewCount})</span>
      </div>
      <p class="mentor-bio">${mentor.bio.substring(0, 120)}${mentor.bio.length > 120 ? '...' : ''}</p>
      <div class="mentor-expertise">
        ${mentor.expertise.map(skill => `<span class="expertise-tag">${skill}</span>`).join('')}
      </div>
      <a href="/mentorship/mentor-profile.html?id=${mentor.id}" class="btn btn-primary">View Profile</a>
    `;
    
    container.appendChild(mentorCard);
  }

  generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return `
      ${Array(fullStars).fill('<i class="fas fa-star"></i>').join('')}
      ${halfStar ? '<i class="fas fa-star-half-alt"></i>' : ''}
      ${Array(emptyStars).fill('<i class="far fa-star"></i>').join('')}
    `;
  }
}

export const mentorship = new MentorshipService();
