// js/utils/dateTime.js

class DateTimeService {
    constructor() {
      this.locale = navigator.language || 'en-US';
    }
  
    setLocale(locale) {
      this.locale = locale;
    }
  
    formatDate(date, options = {}) {
      if (!date) return '';
      
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      
      const mergedOptions = { ...defaultOptions, ...options };
      
      return dateObj.toLocaleDateString(this.locale, mergedOptions);
    }
  
    formatTime(date, options = {}) {
      if (!date) return '';
      
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      const defaultOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      };
      
      const mergedOptions = { ...defaultOptions, ...options };
      
      return dateObj.toLocaleTimeString(this.locale, mergedOptions);
    }
  
    formatDateTime(date, options = {}) {
      if (!date) return '';
      
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      };
      
      const mergedOptions = { ...defaultOptions, ...options };
      
      return dateObj.toLocaleString(this.locale, mergedOptions);
    }
  
    formatTimeAgo(date) {
      if (!date) return '';
      
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      const now = new Date();
      
      const seconds = Math.floor((now - dateObj) / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      const months = Math.floor(days / 30);
      const years = Math.floor(months / 12);
      
      if (seconds < 60) {
        return 'just now';
      } else if (minutes === 1) {
        return '1 minute ago';
      } else if (minutes < 60) {
        return `${minutes} minutes ago`;
      } else if (hours === 1) {
        return '1 hour ago';
      } else if (hours < 24) {
        return `${hours} hours ago`;
      } else if (days === 1) {
        return 'yesterday';
      } else if (days < 30) {
        return `${days} days ago`;
      } else if (months === 1) {
        return '1 month ago';
      } else if (months < 12) {
        return `${months} months ago`;
      } else if (years === 1) {
        return '1 year ago';
      } else {
        return `${years} years ago`;
      }
    }
  
    formatCalendar(date) {
      if (!date) return '';
      
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      
      if (this.isSameDay(dateObj, now)) {
        return `Today at ${this.formatTime(dateObj)}`;
      } else if (this.isSameDay(dateObj, yesterday)) {
        return `Yesterday at ${this.formatTime(dateObj)}`;
      } else if (this.isSameDay(dateObj, tomorrow)) {
        return `Tomorrow at ${this.formatTime(dateObj)}`;
      } else {
        return this.formatDateTime(dateObj);
      }
    }
  
    isSameDay(date1, date2) {
      return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
      );
    }
  
    getDayOfWeek(date, options = { short: false }) {
      if (!date) return '';
      
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      const format = {
        weekday: options.short ? 'short' : 'long'
      };
      
      return dateObj.toLocaleDateString(this.locale, format);
    }
  
    getMonthName(date, options = { short: false }) {
      if (!date) return '';
      
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      const format = {
        month: options.short ? 'short' : 'long'
      };
      
      return dateObj.toLocaleDateString(this.locale, format);
    }
  
    getDaysInMonth(year, month) {
      return new Date(year, month + 1, 0).getDate();
    }
  
    addDays(date, days) {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    }
  
    addMonths(date, months) {
      const result = new Date(date);
      result.setMonth(result.getMonth() + months);
      return result;
    }
  
    addYears(date, years) {
      const result = new Date(date);
      result.setFullYear(result.getFullYear() + years);
      return result;
    }
  
    isFuture(date) {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj > new Date();
    }
  
    isPast(date) {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj < new Date();
    }
  
    isToday(date) {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return this.isSameDay(dateObj, new Date());
    }
  
    formatDuration(durationInSeconds) {
      if (durationInSeconds < 60) {
        return `${durationInSeconds} sec${durationInSeconds !== 1 ? 's' : ''}`;
      }
      
      const minutes = Math.floor(durationInSeconds / 60);
      const seconds = durationInSeconds % 60;
      
      if (minutes < 60) {
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
      
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      
      return `${hours}:${remainingMinutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  
    parseTimeString(timeString) {
      const [hours, minutes] = timeString.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
    }
  
    formatTimeSlot(startTime, endTime) {
      const start = typeof startTime === 'string' ? this.parseTimeString(startTime) : startTime;
      const end = typeof endTime === 'string' ? this.parseTimeString(endTime) : endTime;
      
      return `${this.formatTime(start)} - ${this.formatTime(end)}`;
    }
  
    getDateRangeText(startDate, endDate) {
      const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
      const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
      
      if (this.isSameDay(start, end)) {
        return `${this.formatDate(start)}, ${this.formatTime(start)} - ${this.formatTime(end)}`;
      } else {
        return `${this.formatDate(start)} - ${this.formatDate(end)}`;
      }
    }
  
    // Returns an array of dates for a week containing the given date
    getWeekDates(date) {
      const result = [];
      const current = new Date(date);
      
      // Get the day of the week (0 = Sunday, 1 = Monday, etc.)
      const day = current.getDay();
      
      // Calculate the date of Sunday (start of the week)
      const diff = current.getDate() - day;
      const firstDay = new Date(current.setDate(diff));
      
      // Generate array of dates for the week
      for (let i = 0; i < 7; i++) {
        result.push(new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate() + i));
      }
      
      return result;
    }
  }
  
  export const dateTime = new DateTimeService();
  