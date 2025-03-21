// js/main.js
import { api } from './api.js';
import { auth } from './auth.js';
import { chat } from './chat.js';
import { dashboard } from './dashboard.js';
import { mentorship } from './mentorship.js';
import { forums } from './forums.js';
import { stories } from './stories.js';
import { events } from './events.js';

class App {
  constructor() {
    this.isLoading = false;
    this.notifications = [];
  }

  async init() {
    try {
      // Initialize core components
      this.setupGlobalListeners();
      this.setupUIComponents();
      
      // Initialize modules based on current page
      await this.initCurrentPage();
      
      // Initialize chat if authenticated
      if (auth.isAuthenticated()) {
        chat.init();
      }
      
      // Update UI based on auth state
      this.updateAuthUI(auth.isAuthenticated(), auth.getCurrentUser());
      
      // Register auth state listener
      auth.onAuthStateChanged((isAuthenticated, user) => {
        this.updateAuthUI(isAuthenticated, user);
      });
    } catch (error) {
      console.error('Application initialization error:', error);
      this.showNotification('An error occurred during initialization', 'error');
    }
  }

  setupGlobalListeners() {
    // Global event listeners for the entire app
    document.addEventListener('click', this.handleGlobalClick.bind(this));
    
    // Show/hide mobile menu
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileToggle && mobileMenu) {
      mobileToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
      });
    }
    
    // Back to top button
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
          backToTop.classList.add('visible');
        } else {
          backToTop.classList.remove('visible');
        }
      });
      
      backToTop.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  handleGlobalClick(e) {
    // Handle user dropdown toggle
    const userDropdownToggle = e.target.closest('.user-dropdown-toggle');
    if (userDropdownToggle) {
      e.preventDefault();
      userDropdownToggle.parentElement.classList.toggle('active');
      return;
    }
    
    // Close dropdowns when clicking outside
    if (!e.target.closest('.user-dropdown')) {
      document.querySelectorAll('.user-dropdown.active').forEach(dropdown => {
        dropdown.classList.remove('active');
      });
    }
    
    // Handle logout buttons
    if (e.target.closest('#logout-btn, #mobile-logout-btn')) {
      e.preventDefault();
      this.handleLogout();
      return;
    }
    
    // Handle chat toggle
    if (e.target.closest('#chat-toggle')) {
      e.preventDefault();
      const chatContainer = document.getElementById('chatbot-container');
      if (chatContainer) {
        chatContainer.classList.toggle('active');
      }
      return;
    }
    
    // Handle chat close
    if (e.target.closest('#chat-close')) {
      e.preventDefault();
      const chatContainer = document.getElementById('chatbot-container');
      if (chatContainer) {
        chatContainer.classList.remove('active');
      }
      return;
    }
  }

  setupUIComponents() {
    // Initialize animations
    this.initAnimations();
    
    // Initialize testimonial slider if present
    this.initTestimonialSlider();
    
    // Initialize video modal if present
    this.initVideoModal();
    
    // Initialize form validations
    this.initForms();
  }

  initAnimations() {
    // Use Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    // Observe elements with animation classes
    document.querySelectorAll('.animate-fadeIn, .animate-slideUp, .animate-pulse').forEach(el => {
      observer.observe(el);
    });
  }

  initTestimonialSlider() {
    const slider = document.getElementById('testimonials-slider');
    if (!slider) return;
    
    const slides = slider.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('#testimonial-dots .dot');
    const prevBtn = document.getElementById('prev-testimonial');
    const nextBtn = document.getElementById('next-testimonial');
    
    if (!slides.length) return;
    
    let currentSlide = 0;
    
    const showSlide = (index) => {
      slides.forEach(slide => slide.style.display = 'none');
      dots.forEach(dot => dot.classList.remove('active'));
      
      slides[index].style.display = 'block';
      if (dots[index]) dots[index].classList.add('active');
      currentSlide = index;
    };
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
      });
    }
    
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        showSlide(index);
      });
    });
    
    // Show first slide initially
    showSlide(0);
    
    // Auto advance slides
    setInterval(() => {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    }, 5000);
  }

  initVideoModal() {
    const watchVideoBtn = document.getElementById('watch-video-btn');
    const videoModal = document.getElementById('video-modal');
    const closeVideoBtn = document.getElementById('close-video-modal');
    
    if (watchVideoBtn && videoModal) {
      watchVideoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        videoModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
      
      if (closeVideoBtn) {
        closeVideoBtn.addEventListener('click', () => {
          videoModal.classList.remove('active');
          document.body.style.overflow = '';
        });
      }
      
      videoModal.addEventListener('click', (e) => {
        if (e.target === videoModal) {
          videoModal.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    }
  }

  initForms() {
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', (e) => {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
          if (!field.value.trim()) {
            isValid = false;
            field.classList.add('is-invalid');
            
            const errorMessage = field.dataset.errorMessage || 'This field is required';
            let feedback = field.nextElementSibling;
            
            if (!feedback || !feedback.classList.contains('invalid-feedback')) {
              feedback = document.createElement('div');
              feedback.className = 'invalid-feedback';
              field.parentNode.insertBefore(feedback, field.nextElementSibling);
            }
            
            feedback.textContent = errorMessage;
          } else {
            field.classList.remove('is-invalid');
          }
        });
        
        if (!isValid) {
          e.preventDefault();
        }
      });
    });
  }

  async initCurrentPage() {
    const path = window.location.pathname;
    
    if (path === '/' || path.endsWith('index.html')) {
      this.initHomePage();
    } else if (path.includes('/dashboard/')) {
      this.initDashboardPage();
    } else if (path.includes('/mentorship/')) {
      this.initMentorshipPage();
    } else if (path.includes('/forums/')) {
      this.initForumsPage();
    } else if (path.includes('/stories/')) {
      this.initStoriesPage();
    } else if (path.includes('/events/')) {
      this.initEventsPage();
    }
  }

  async initHomePage() {
    try {
      // Fetch featured mentors
      const featuredMentorsContainer = document.querySelector('.mentors-grid');
      if (featuredMentorsContainer) {
        this.showLoading(featuredMentorsContainer);
        const featuredMentors = await api.get('/mentors/featured');
        this.hideLoading();
        
        if (featuredMentors.length) {
          featuredMentorsContainer.innerHTML = '';
          featuredMentors.forEach(mentor => {
            mentorship.renderMentorCard(mentor, featuredMentorsContainer);
          });
        }
      }
      
      // Fetch upcoming events
      const eventsContainer = document.querySelector('.events-grid');
      if (eventsContainer) {
        this.showLoading(eventsContainer);
        const upcomingEvents = await events.getUpcomingEvents();
        this.hideLoading();
        
        if (upcomingEvents.data?.length) {
          events.renderEventsGrid(upcomingEvents.data, eventsContainer);
        }
      }
    } catch (error) {
      console.error('Error initializing home page:', error);
      this.hideLoading();
    }
  }

  async initDashboardPage() {
    if (!auth.isAuthenticated()) {
      window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }
    
    try {
      const statsContainer = document.querySelector('.stats-grid');
      const activityContainer = document.querySelector('.activity-list');
      
      if (statsContainer) {
        this.showLoading(statsContainer);
        const stats = await dashboard.getStats();
        this.hideLoading();
        dashboard.renderDashboardStats(statsContainer, stats);
      }
      
      if (activityContainer) {
        this.showLoading(activityContainer);
        const activity = await dashboard.getRecentActivity();
        this.hideLoading();
        dashboard.renderActivity(activityContainer, activity);
      }
    } catch (error) {
      console.error('Error initializing dashboard:', error);
      this.hideLoading();
      this.showNotification('Failed to load dashboard data', 'error');
    }
  }

  async initMentorshipPage() {
    const mentorsListContainer = document.querySelector('.mentors-list');
    const mentorProfileContainer = document.querySelector('.mentor-profile');
    const connectionForm = document.getElementById('connection-form');
    
    // Initialize mentor search page
    if (mentorsListContainer) {
      try {
        const searchForm = document.getElementById('mentor-search-form');
        
        if (searchForm) {
          searchForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(searchForm);
            const filters = {
              expertise: formData.get('expertise'),
              language: formData.get('language'),
              industry: formData.get('industry'),
              rating: formData.get('rating')
            };
            
            this.showLoading(mentorsListContainer);
            const mentors = await mentorship.searchMentors(filters);
            this.hideLoading();
            
            mentorsListContainer.innerHTML = '';
            if (mentors.length) {
              mentors.forEach(mentor => {
                mentorship.renderMentorCard(mentor, mentorsListContainer);
              });
            } else {
              mentorsListContainer.innerHTML = '<div class="no-results">No mentors found matching your criteria</div>';
            }
          });
        }
        
        // Load initial mentors
        this.showLoading(mentorsListContainer);
        const mentors = await mentorship.searchMentors();
        this.hideLoading();
        
        mentorsListContainer.innerHTML = '';
        mentors.forEach(mentor => {
          mentorship.renderMentorCard(mentor, mentorsListContainer);
        });
      } catch (error) {
        console.error('Error initializing mentor search:', error);
        this.hideLoading();
        this.showNotification('Failed to load mentors', 'error');
      }
    }
    
    // Initialize mentor profile page
    if (mentorProfileContainer) {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const mentorId = urlParams.get('id');
        
        if (mentorId) {
          this.showLoading(mentorProfileContainer);
          const mentor = await mentorship.getMentorProfile(mentorId);
          this.hideLoading();
          
          // Update UI with mentor details (implementation depends on HTML structure)
          document.querySelector('.mentor-name').textContent = mentor.name;
          document.querySelector('.mentor-title').textContent = mentor.title;
          document.querySelector('.mentor-avatar img').src = mentor.avatar || 'assets/images/avatars/default.png';
          // ... other fields
        }
      } catch (error) {
        console.error('Error loading mentor profile:', error);
        this.hideLoading();
        this.showNotification('Failed to load mentor profile', 'error');
      }
    }
    
    // Initialize connection request form
    if (connectionForm) {
      connectionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!auth.isAuthenticated()) {
          window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname);
          return;
        }
        
        const urlParams = new URLSearchParams(window.location.search);
        const mentorId = urlParams.get('id');
        const message = document.getElementById('connection-message').value;
        
        try {
          this.showLoading(connectionForm);
          await mentorship.sendConnectionRequest(mentorId, message);
          this.hideLoading();
          
          this.showNotification('Connection request sent successfully', 'success');
          connectionForm.reset();
        } catch (error) {
          console.error('Error sending connection request:', error);
          this.hideLoading();
          this.showNotification('Failed to send connection request: ' + error.message, 'error');
        }
      });
    }
  }

  async initForumsPage() {
    const forumPostsContainer = document.querySelector('.forum-posts');
    const postDetailContainer = document.querySelector('.post-detail');
    const createPostForm = document.getElementById('create-post-form');
    
    // Initialize forum categories and posts
    if (forumPostsContainer) {
      try {
        const categoriesContainer = document.querySelector('.forum-categories');
        
        if (categoriesContainer) {
          this.showLoading(categoriesContainer);
          const categories = await forums.getCategories();
          this.hideLoading();
          
          categoriesContainer.innerHTML = categories.map(category => `
            <a href="/forums/forum-list.html?category=${category.id}" class="category-item ${category.id === activeCategory ? 'active' : ''}">
              <i class="fas fa-${category.icon}"></i>
              <span>${category.name}</span>
              <span class="post-count">${category.postCount}</span>
            </a>
          `).join('');
        }
        
        // Get selected category
        const urlParams = new URLSearchParams(window.location.search);
        const activeCategory = urlParams.get('category') || 'all';
        
        // Load posts for the selected category
        this.showLoading(forumPostsContainer);
        const posts = await forums.getForumPosts(activeCategory);
        this.hideLoading();
        
        forums.renderPostsList(posts.data, forumPostsContainer);
        
        // Setup event listeners for forum actions
        forums.setupForumEventListeners();
      } catch (error) {
        console.error('Error initializing forums:', error);
        this.hideLoading();
        this.showNotification('Failed to load forum data', 'error');
      }
    }
    
    // Initialize post detail page
    if (postDetailContainer) {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('id');
        
        if (postId) {
          this.showLoading(postDetailContainer);
          const [post, comments] = await Promise.all([
            forums.getPost(postId),
            forums.getComments(postId)
          ]);
          this.hideLoading();
          
          // Render post details (implementation depends on HTML structure)
          document.querySelector('.post-title').textContent = post.title;
          document.querySelector('.post-content').innerHTML = post.content;
          // ... other post fields
          
          // Render comments
          const commentsContainer = document.querySelector('.comments-list');
          if (commentsContainer && comments.length) {
            commentsContainer.innerHTML = comments.map(comment => `
              <div class="comment">
                <div class="comment-avatar">
                  <img src="${comment.author.avatar || 'assets/images/avatars/default.png'}" alt="${comment.author.name}">
                </div>
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="comment-author">${comment.author.name}</span>
                    <span class="comment-date">${new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p class="comment-text">${comment.content}</p>
                </div>
              </div>
            `).join('');
          }
        }
      } catch (error) {
        console.error('Error loading post details:', error);
        this.hideLoading();
        this.showNotification('Failed to load post details', 'error');
      }
    }
    
    // Initialize create post form
    if (createPostForm) {
      createPostForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!auth.isAuthenticated()) {
          window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname);
          return;
        }
        
        const formData = new FormData(createPostForm);
        const postData = {
          title: formData.get('title'),
          content: formData.get('content'),
          category: formData.get('category'),
          tags: formData.get('tags').split(',').map(tag => tag.trim())
        };
        
        try {
          this.showLoading(createPostForm);
          const newPost = await forums.createPost(postData);
          this.hideLoading();
          
          window.location.href = `/forums/post-detail.html?id=${newPost.id}`;
        } catch (error) {
          console.error('Error creating post:', error);
          this.hideLoading();
          this.showNotification('Failed to create post: ' + error.message, 'error');
        }
      });
    }
  }

  async initStoriesPage() {
    const storiesGridContainer = document.querySelector('.stories-grid');
    const storyDetailContainer = document.querySelector('.story-detail-container');
    const createStoryForm = document.getElementById('create-story-form');
    
    // Initialize stories list
    if (storiesGridContainer) {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category') || '';
        
        this.showLoading(storiesGridContainer);
        const storiesData = await stories.getStories(1, { category });
        this.hideLoading();
        
        stories.renderStoriesGrid(storiesData.data, storiesGridContainer);
        
        // Initialize category filters if present
        const categoryFilters = document.querySelector('.category-filters');
        if (categoryFilters) {
          const categories = await stories.getStoryCategories();
          
          categoryFilters.innerHTML = `
            <a href="/stories/stories-list.html" class="category-filter ${!category ? 'active' : ''}">All</a>
            ${categories.map(cat => `
              <a href="/stories/stories-list.html?category=${cat.id}" 
                 class="category-filter ${category === cat.id ? 'active' : ''}">
                ${cat.name}
              </a>
            `).join('')}
          `;
        }
      } catch (error) {
        console.error('Error initializing stories list:', error);
        this.hideLoading();
        this.showNotification('Failed to load stories', 'error');
      }
    }
    
    // Initialize story detail page
    if (storyDetailContainer) {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const storyId = urlParams.get('id');
        
        if (storyId) {
          this.showLoading(storyDetailContainer);
          const [story, comments] = await Promise.all([
            stories.getStoryById(storyId),
            stories.getComments(storyId)
          ]);
          this.hideLoading();
          
          // Render story details (implementation depends on HTML structure)
          document.querySelector('.story-detail-title').textContent = story.title;
          document.querySelector('.story-content-main').innerHTML = story.content;
          // ... other story fields
          
          // Render comments
          const commentsContainer = document.querySelector('.comments-list');
          if (commentsContainer && comments.data?.length) {
            commentsContainer.innerHTML = comments.data.map(comment => `
              <div class="comment">
                <div class="comment-avatar">
                  <img src="${comment.author.avatar || 'assets/images/avatars/default.png'}" alt="${comment.author.name}">
                </div>
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="comment-author">${comment.author.name}</span>
                    <span class="comment-date">${new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p class="comment-text">${comment.content}</p>
                </div>
              </div>
            `).join('');
          }
        }
      } catch (error) {
        console.error('Error loading story details:', error);
        this.hideLoading();
        this.showNotification('Failed to load story details', 'error');
      }
    }
    
    // Initialize create story form
    if (createStoryForm) {
      // Initialize story editor
      const editor = stories.initStoryEditor('#story-editor');
      
      createStoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!auth.isAuthenticated()) {
          window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname);
          return;
        }
        
        const formData = new FormData(createStoryForm);
        const storyData = {
          title: formData.get('title'),
          excerpt: formData.get('excerpt'),
          content: editor.getContent(),
          category: formData.get('category'),
          tags: formData.get('tags').split(',').map(tag => tag.trim()),
          coverImage: document.getElementById('cover-image-preview').src
        };
        
        try {
          this.showLoading(createStoryForm);
          const newStory = await stories.createStory(storyData);
          this.hideLoading();
          
          window.location.href = `/stories/story-detail.html?id=${newStory.id}`;
        } catch (error) {
          console.error('Error creating story:', error);
          this.hideLoading();
          this.showNotification('Failed to create story: ' + error.message, 'error');
        }
      });
      
      // Handle cover image upload
      const coverImageInput = document.getElementById('cover-image');
      const coverImagePreview = document.getElementById('cover-image-preview');
      
      if (coverImageInput && coverImagePreview) {
        coverImageInput.addEventListener('change', async (e) => {
          if (e.target.files && e.target.files[0]) {
            try {
              this.showLoading(coverImagePreview.parentElement);
              const result = await stories.uploadStoryImage(e.target.files[0], (progress) => {
                console.log(`Upload progress: ${progress}%`);
              });
              this.hideLoading();
              
              coverImagePreview.src = result.url;
              coverImagePreview.style.display = 'block';
            } catch (error) {
              console.error('Error uploading cover image:', error);
              this.hideLoading();
              this.showNotification('Failed to upload cover image', 'error');
            }
          }
        });
      }
    }
  }

  async initEventsPage() {
    const eventsGridContainer = document.querySelector('.events-grid');
    const eventDetailContainer = document.querySelector('.event-detail-container');
    const createEventForm = document.getElementById('create-event-form');
    
    // Initialize events list
    if (eventsGridContainer) {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const filter = {
          type: urlParams.get('type') || '',
          location: urlParams.get('location') || '',
          category: urlParams.get('category') || ''
        };
        
        this.showLoading(eventsGridContainer);
        const eventsData = await events.getUpcomingEvents(1, filter);
        this.hideLoading();
        
        events.renderEventsGrid(eventsData.data, eventsGridContainer);
        
        // Initialize filter form if present
        const filterForm = document.getElementById('events-filter-form');
        
        if (filterForm) {
          filterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(filterForm);
            const newFilter = {
              type: formData.get('type'),
              location: formData.get('location'),
              category: formData.get('category')
            };
            
            this.showLoading(eventsGridContainer);
            const filteredEvents = await events.getUpcomingEvents(1, newFilter);
            this.hideLoading();
            
            events.renderEventsGrid(filteredEvents.data, eventsGridContainer);
          });
        }
      } catch (error) {
        console.error('Error initializing events list:', error);
        this.hideLoading();
        this.showNotification('Failed to load events', 'error');
      }
    }
    
    // Initialize event detail page
    if (eventDetailContainer) {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const eventId = urlParams.get('id');
        
        if (eventId) {
          this.showLoading(eventDetailContainer);
          const event = await events.getEventById(eventId);
          this.hideLoading();
          
          // Render event details (implementation depends on HTML structure)
          document.querySelector('.event-detail-title').textContent = event.title;
          document.querySelector('.event-detail-info .meta-value:nth-child(1)').textContent = 
            new Date(event.startDate).toLocaleDateString();
          // ... other event fields
          
          // Initialize registration button
          events.initEventRegistration(eventId, '.registration-btn');
        }
      } catch (error) {
        console.error('Error loading event details:', error);
        this.hideLoading();
        this.showNotification('Failed to load event details', 'error');
      }
    }
    
    // Initialize create event form
    if (createEventForm) {
      createEventForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!auth.isAuthenticated()) {
          window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname);
          return;
        }
        
        const formData = new FormData(createEventForm);
        const eventData = {
          title: formData.get('title'),
          description: formData.get('description'),
          startDate: formData.get('start-date') + 'T' + formData.get('start-time'),
          endDate: formData.get('end-date') + 'T' + formData.get('end-time'),
          eventType: formData.get('event-type'),
          category: formData.get('category'),
          location: formData.get('location'),
          isFree: formData.get('is-free') === 'yes',
          price: formData.get('price') || 0,
          maxParticipants: parseInt(formData.get('max-participants')),
          coverImage: document.getElementById('event-image-preview').src
        };
        
        try {
          this.showLoading(createEventForm);
          const newEvent = await events.createEvent(eventData);
          this.hideLoading();
          
          window.location.href = `/events/event-detail.html?id=${newEvent.id}`;
        } catch (error) {
          console.error('Error creating event:', error);
          this.hideLoading();
          this.showNotification('Failed to create event: ' + error.message, 'error');
        }
      });
      
      // Handle event image upload
      const eventImageInput = document.getElementById('event-image');
      const eventImagePreview = document.getElementById('event-image-preview');
      
      if (eventImageInput && eventImagePreview) {
        eventImageInput.addEventListener('change', async (e) => {
          if (e.target.files && e.target.files[0]) {
            try {
              const file = e.target.files[0];
              const reader = new FileReader();
              
              reader.onload = function(e) {
                eventImagePreview.src = e.target.result;
                eventImagePreview.style.display = 'block';
              };
              
              reader.readAsDataURL(file);
            } catch (error) {
              console.error('Error handling event image:', error);
            }
          }
        });
      }
    }
  }

  showLoading(container = document.body) {
    this.isLoading = true;
    
    const loader = document.createElement('div');
    loader.className = 'loading-spinner';
    loader.innerHTML = '<div class="spinner"></div>';
    
    container.appendChild(loader);
  }

  hideLoading() {
    this.isLoading = false;
    document.querySelectorAll('.loading-spinner').forEach(spinner => {
      spinner.remove();
    });
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-${this.getNotificationIcon(type)}"></i>
        <span>${message}</span>
      </div>
      <button class="notification-close">×</button>
    `;
    
    document.body.appendChild(notification);
    
    // Add to notifications array
    const notificationId = Date.now();
    this.notifications.push({ id: notificationId, element: notification });
    
    // Set timeout to remove notification
    setTimeout(() => {
      this.removeNotification(notificationId);
    }, 5000);
    
    // Add close button handler
    notification.querySelector('.notification-close').addEventListener('click', () => {
      this.removeNotification(notificationId);
    });
    
    // Animate in
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
  }

  removeNotification(id) {
    const index = this.notifications.findIndex(n => n.id === id);
    
    if (index !== -1) {
      const { element } = this.notifications[index];
      element.classList.remove('show');
      
      setTimeout(() => {
        element.remove();
        this.notifications.splice(index, 1);
      }, 300);
    }
  }

  getNotificationIcon(type) {
    switch (type) {
      case 'success': return 'check-circle';
      case 'error': return 'exclamation-circle';
      case 'warning': return 'exclamation-triangle';
      default: return 'info-circle';
    }
  }

  updateAuthUI(isAuthenticated, user) {
    const authButtons = document.getElementById('auth-buttons');
    const userDropdown = document.getElementById('user-dropdown');
    const mobileAuthButtons = document.querySelector('.mobile-auth-buttons');
    const mobileUserMenu = document.querySelector('.mobile-user-menu');
    
    if (isAuthenticated && user) {
      // Update user information
      document.querySelectorAll('.user-name').forEach(el => {
        el.textContent = user.name;
      });
      
      document.querySelectorAll('.user-avatar').forEach(el => {
        el.src = user.avatar || 'assets/images/avatars/default.png';
      });
      
      // Show user menu, hide auth buttons
      if (authButtons) authButtons.style.display = 'none';
      if (userDropdown) userDropdown.style.display = 'block';
      if (mobileAuthButtons) mobileAuthButtons.style.display = 'none';
      if (mobileUserMenu) mobileUserMenu.style.display = 'block';
      
      // Show/hide elements based on user role
      if (user.roles) {
        document.querySelectorAll('[data-role]').forEach(el => {
          const requiredRole = el.dataset.role;
          if (user.roles.includes(requiredRole)) {
            el.style.display = 'block';
          } else {
            el.style.display = 'none';
          }
        });
      }
    } else {
      // Hide user menu, show auth buttons
      if (authButtons) authButtons.style.display = 'flex';
      if (userDropdown) userDropdown.style.display = 'none';
      if (mobileAuthButtons) mobileAuthButtons.style.display = 'block';
      if (mobileUserMenu) mobileUserMenu.style.display = 'none';
      
      // Hide all role-specific elements
      document.querySelectorAll('[data-role]').forEach(el => {
        el.style.display = 'none';
      });
    }
  }

  async handleLogout() {
    try {
      this.showLoading();
      await auth.logout();
      this.hideLoading();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      this.hideLoading();
      this.showNotification('Logout failed. Please try again.', 'error');
    }
  }
}

// Initialize app on DOM load
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
