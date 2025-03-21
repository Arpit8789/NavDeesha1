// js/events.js
import { api } from './api.js';

class EventsService {
  async getUpcomingEvents(page = 1, filter = {}) {
    const queryParams = new URLSearchParams({ page });
    
    Object.entries(filter).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    
    return api.get(`/events/upcoming?${queryParams.toString()}`);
  }

  async getPastEvents(page = 1) {
    return api.get(`/events/past?page=${page}`);
  }

  async getEventById(eventId) {
    return api.get(`/events/${eventId}`);
  }

  async registerForEvent(eventId) {
    return api.post(`/events/${eventId}/register`, {}, true);
  }

  async cancelRegistration(eventId) {
    return api.delete(`/events/${eventId}/register`, true);
  }

  async getRegisteredEvents(page = 1) {
    return api.get(`/events/registered?page=${page}`, true);
  }

  async getEventCategories() {
    return api.get('/events/categories');
  }

  async createEvent(eventData) {
    return api.post('/events', eventData, true);
  }

  async updateEvent(eventId, eventData) {
    return api.put(`/events/${eventId}`, eventData, true);
  }

  async deleteEvent(eventId) {
    return api.delete(`/events/${eventId}`, true);
  }

  async getEventParticipants(eventId, page = 1) {
    return api.get(`/events/${eventId}/participants?page=${page}`, true);
  }

  async addEventToCalendar(eventId) {
    return api.post(`/events/${eventId}/calendar`, {}, true);
  }

  async searchEvents(query, page = 1) {
    return api.get(`/events/search?q=${encodeURIComponent(query)}&page=${page}`);
  }

  renderEventsGrid(events, container) {
    container.innerHTML = '';
    
    events.forEach(event => {
      const eventCard = document.createElement('div');
      eventCard.className = 'event-card';
      
      const eventDate = new Date(event.startDate);
      const day = eventDate.getDate();
      const month = eventDate.toLocaleString('default', { month: 'short' });
      
      eventCard.innerHTML = `
        <div class="event-image">
          <img src="${event.coverImage || 'assets/images/events/default-cover.jpg'}" alt="${event.title}">
          <div class="event-date-badge">
            <div class="event-date-day">${day}</div>
            <div class="event-date-month">${month}</div>
          </div>
          <div class="event-type ${event.eventType}">${event.eventType}</div>
        </div>
        <div class="event-content">
          <h3 class="event-title">
            <a href="/events/event-detail.html?id=${event.id}">${event.title}</a>
          </h3>
          <div class="event-meta">
            <div class="event-meta-item">
              <i class="far fa-clock"></i>
              ${this.formatEventTime(event.startDate, event.endDate)}
            </div>
            <div class="event-meta-item">
              ${event.eventType === 'online' ? 
                `<i class="fas fa-video"></i> Online` : 
                `<i class="fas fa-map-marker-alt"></i> ${event.location}`
              }
            </div>
          </div>
          <p class="event-description">${event.description.substring(0, 120)}${event.description.length > 120 ? '...' : ''}</p>
          <div class="event-footer">
            <div class="event-price ${event.isFree ? 'free' : ''}">
              ${event.isFree ? 'Free' : `₹${event.price}`}
            </div>
            <a href="/events/event-detail.html?id=${event.id}" class="event-action">View Details</a>
          </div>
        </div>
      `;
      
      container.appendChild(eventCard);
    });
  }

  formatEventTime(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startTime = start.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    const endTime = end.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    return `${startTime} - ${endTime}`;
  }

  async initEventRegistration(eventId, buttonSelector) {
    const button = document.querySelector(buttonSelector);
    if (!button) return;
    
    try {
      const event = await this.getEventById(eventId);
      
      if (event.isRegistered) {
        button.textContent = 'Cancel Registration';
        button.classList.add('registered');
        
        button.addEventListener('click', async (e) => {
          e.preventDefault();
          try {
            await this.cancelRegistration(eventId);
            button.textContent = 'Register Now';
            button.classList.remove('registered');
            alert('Registration cancelled successfully');
          } catch (error) {
            console.error('Error cancelling registration:', error);
            alert('Failed to cancel registration: ' + error.message);
          }
        });
      } else {
        button.addEventListener('click', async (e) => {
          e.preventDefault();
          try {
            await this.registerForEvent(eventId);
            button.textContent = 'Cancel Registration';
            button.classList.add('registered');
            alert('Registered successfully');
          } catch (error) {
            console.error('Error registering for event:', error);
            alert('Failed to register: ' + error.message);
          }
        });
      }
    } catch (error) {
      console.error('Error initializing event registration:', error);
    }
  }
}

export const events = new EventsService();
