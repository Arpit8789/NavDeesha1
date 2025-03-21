// js/utils/ui.js
import { dateTime } from './dateTime.js';

class UIService {
  constructor() {
    this.animationObserver = null;
    this.toastContainer = null;
  }

  // Initialize UI service
  init() {
    this.setupAnimationObserver();
    this.createToastContainer();
    this.setupGlobalListeners();
  }

  // Set up IntersectionObserver for scroll animations
  setupAnimationObserver() {
    this.animationObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          this.animationObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.animate-fadeIn, .animate-slideUp, .animate-slideLeft, .animate-slideRight')
      .forEach(el => this.animationObserver.observe(el));
  }

  // Create toast notification container
  createToastContainer() {
    if (document.getElementById('toast-container')) return;
    
    this.toastContainer = document.createElement('div');
    this.toastContainer.id = 'toast-container';
    this.toastContainer.className = 'toast-container';
    document.body.appendChild(this.toastContainer);
  }

  // Set up global UI event listeners
  setupGlobalListeners() {
    // Collapse handlers
    document.addEventListener('click', (e) => {
      // Handle collapsible elements
      const collapseTrigger = e.target.closest('[data-toggle="collapse"]');
      if (collapseTrigger) {
        const targetId = collapseTrigger.getAttribute('data-target');
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          e.preventDefault();
          this.toggleCollapse(targetElement);
          
          // Update aria-expanded attribute
          const isExpanded = targetElement.classList.contains('show');
          collapseTrigger.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
        }
      }
      
      // Handle dropdown toggling
      const dropdownToggle = e.target.closest('.dropdown-toggle');
      if (dropdownToggle) {
        e.preventDefault();
        const dropdown = dropdownToggle.closest('.dropdown');
        dropdown.classList.toggle('show');
      }
      
      // Close dropdowns when clicking outside
      if (!e.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown.show').forEach(dropdown => {
          dropdown.classList.remove('show');
        });
      }
      
      // Handle modal closing via backdrop click
      if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
      }
    });
    
    // Scroll to top button
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
      window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
          backToTopBtn.classList.add('visible');
        } else {
          backToTopBtn.classList.remove('visible');
        }
      });
      
      backToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  // Toggle collapse/expand
  toggleCollapse(element) {
    if (element.classList.contains('show')) {
      this.collapse(element);
    } else {
      this.expand(element);
    }
  }

  // Expand an element
  expand(element) {
    element.classList.add('collapsing');
    element.classList.remove('collapse');
    
    element.style.height = 0;
    element.offsetHeight; // Force reflow
    element.style.height = element.scrollHeight + 'px';
    
    setTimeout(() => {
      element.classList.remove('collapsing');
      element.classList.add('collapse', 'show');
      element.style.height = '';
    }, 350);
  }

  // Collapse an element
  collapse(element) {
    element.style.height = element.scrollHeight + 'px';
    element.offsetHeight; // Force reflow
    
    element.classList.add('collapsing');
    element.classList.remove('collapse', 'show');
    
    element.style.height = 0;
    
    setTimeout(() => {
      element.classList.remove('collapsing');
      element.classList.add('collapse');
      element.style.height = '';
    }, 350);
  }

  // Show a toast notification
  showToast(message, type = 'info', duration = 5000) {
    if (!this.toastContainer) {
      this.createToastContainer();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const iconClass = {
      'success': 'fas fa-check-circle',
      'error': 'fas fa-exclamation-circle',
      'warning': 'fas fa-exclamation-triangle',
      'info': 'fas fa-info-circle'
    }[type] || 'fas fa-info-circle';
    
    toast.innerHTML = `
      <div class="toast-icon">
        <i class="${iconClass}"></i>
      </div>
      <div class="toast-content">${message}</div>
      <button class="toast-close">×</button>
    `;
    
    this.toastContainer.appendChild(toast);
    
    // Add close button handler
    toast.querySelector('.toast-close').addEventListener('click', () => {
      this.closeToast(toast);
    });
    
    // Show toast with animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Auto-close after duration
    if (duration > 0) {
      setTimeout(() => {
        this.closeToast(toast);
      }, duration);
    }
    
    return toast;
  }

  // Close a toast
  closeToast(toast) {
    toast.classList.remove('show');
    
    toast.addEventListener('transitionend', () => {
      toast.remove();
    }, { once: true });
  }

  // Show a modal
  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // Hide a modal
  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Show a loading spinner
  showLoading(container = document.body) {
    const loader = document.createElement('div');
    loader.className = 'loading-spinner';
    loader.innerHTML = '<div class="spinner"></div>';
    
    container.appendChild(loader);
    return loader;
  }

  // Hide a loading spinner
  hideLoading(loader) {
    if (loader && loader.parentNode) {
      loader.remove();
    } else {
      document.querySelectorAll('.loading-spinner').forEach(spinner => {
        spinner.remove();
      });
    }
  }

  // Format and display timestamps dynamically
  initDynamicTimestamps() {
    // Update timestamps every minute
    setInterval(() => {
      document.querySelectorAll('[data-timestamp]').forEach(el => {
        const timestamp = el.getAttribute('data-timestamp');
        el.textContent = dateTime.formatTimeAgo(timestamp);
      });
    }, 60000);
    
    // Initial format
    document.querySelectorAll('[data-timestamp]').forEach(el => {
      const timestamp = el.getAttribute('data-timestamp');
      el.textContent = dateTime.formatTimeAgo(timestamp);
    });
  }

  // Toggle password visibility
  togglePasswordVisibility(inputId, toggleId) {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById(toggleId);
    
    if (!input || !toggle) return;
    
    toggle.addEventListener('click', () => {
      const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
      input.setAttribute('type', type);
      
      // Toggle icon
      if (type === 'password') {
        toggle.innerHTML = '<i class="fas fa-eye"></i>';
      } else {
        toggle.innerHTML = '<i class="fas fa-eye-slash"></i>';
      }
    });
  }

  // Create a tab system
  initTabs(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    
    const tabs = container.querySelectorAll('[data-tab]');
    const tabContents = container.querySelectorAll('[data-tab-content]');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const tabId = tab.getAttribute('data-tab');
        
        // Deactivate all tabs and contents
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Activate selected tab and content
        tab.classList.add('active');
        const activeContent = container.querySelector(`[data-tab-content="${tabId}"]`);
        if (activeContent) {
          activeContent.classList.add('active');
        }
      });
    });
  }

  // Initialize tooltips
  initTooltips() {
    document.querySelectorAll('[data-tooltip]').forEach(element => {
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.textContent = element.getAttribute('data-tooltip');
      
      element.addEventListener('mouseenter', () => {
        document.body.appendChild(tooltip);
        const rect = element.getBoundingClientRect();
        
        tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.classList.add('visible');
      });
      
      element.addEventListener('mouseleave', () => {
        tooltip.classList.remove('visible');
        setTimeout(() => {
          if (tooltip.parentNode) {
            tooltip.parentNode.removeChild(tooltip);
          }
        }, 300);
      });
    });
  }

  // Initialize image gallery
  initGallery(gallerySelector) {
    const gallery = document.querySelector(gallerySelector);
    if (!gallery) return;
    
    const images = gallery.querySelectorAll('img');
    
    images.forEach(img => {
      img.addEventListener('click', () => {
        this.showImageModal(img.src, img.alt);
      });
    });
  }

  // Show image in modal
  showImageModal(src, alt = '') {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay image-modal';
    
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">${alt}</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <img src="${src}" alt="${alt}" class="modal-image">
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
    
    // Show modal with animation
    setTimeout(() => modal.classList.add('active'), 10);
    
    // Close button functionality
    modal.querySelector('.modal-close').addEventListener('click', () => {
      modal.classList.remove('active');
      setTimeout(() => {
        modal.remove();
        document.body.style.overflow = '';
      }, 300);
    });
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        setTimeout(() => {
          modal.remove();
          document.body.style.overflow = '';
        }, 300);
      }
    });
  }

  // Generate avatar initial placeholder
  generateAvatar(name, size = 40) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    
    const context = canvas.getContext('2d');
    
    // Background
    context.fillStyle = this.getColorFromString(name);
    context.fillRect(0, 0, size, size);
    
    // Text
    context.fillStyle = '#FFFFFF';
    context.font = `${size / 2}px Arial`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    const initials = this.getInitials(name);
    context.fillText(initials, size / 2, size / 2);
    
    return canvas.toDataURL();
  }

  // Get color from string (consistent but pseudo-random)
  getColorFromString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colors = [
      '#4361ee', '#3a0ca3', '#7209b7', '#f72585', 
      '#4cc9f0', '#4895ef', '#560bad', '#480ca8'
    ];
    
    return colors[Math.abs(hash) % colors.length];
  }

  // Get initials from name
  getInitials(name) {
    if (!name) return '?';
    
    const parts = name.split(' ').filter(part => part.length > 0);
    if (parts.length === 0) return '?';
    
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
}

export const ui = new UIService();
