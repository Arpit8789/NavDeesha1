// js/stories.js
import { api } from './api.js';

class StoriesService {
  async getStories(page = 1, filter = {}) {
    const queryParams = new URLSearchParams({ page });
    
    Object.entries(filter).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    
    return api.get(`/stories?${queryParams.toString()}`);
  }

  async getFeaturedStories() {
    return api.get('/stories/featured');
  }

  async getStoryById(storyId) {
    return api.get(`/stories/${storyId}`);
  }

  async createStory(storyData) {
    return api.post('/stories', storyData, true);
  }

  async updateStory(storyId, storyData) {
    return api.put(`/stories/${storyId}`, storyData, true);
  }

  async deleteStory(storyId) {
    return api.delete(`/stories/${storyId}`, true);
  }

  async getStoryCategories() {
    return api.get('/stories/categories');
  }

  async likeStory(storyId) {
    return api.post(`/stories/${storyId}/like`, {}, true);
  }

  async unlikeStory(storyId) {
    return api.delete(`/stories/${storyId}/like`, true);
  }

  async getComments(storyId, page = 1) {
    return api.get(`/stories/${storyId}/comments?page=${page}`);
  }

  async addComment(storyId, content) {
    return api.post(`/stories/${storyId}/comments`, { content }, true);
  }

  async uploadStoryImage(file, progressCallback) {
    return api.uploadFile('/stories/upload-image', file, progressCallback, true);
  }

  async searchStories(query, page = 1) {
    return api.get(`/stories/search?q=${encodeURIComponent(query)}&page=${page}`);
  }

  renderStoriesGrid(stories, container) {
    container.innerHTML = '';
    
    stories.forEach(story => {
      const storyCard = document.createElement('div');
      storyCard.className = 'story-card';
      
      storyCard.innerHTML = `
        <div class="story-image">
          <img src="${story.coverImage || 'assets/images/stories/default-cover.jpg'}" alt="${story.title}">
          <span class="story-category">${story.category}</span>
        </div>
        <div class="story-content">
          <h3 class="story-title">
            <a href="/stories/story-detail.html?id=${story.id}">${story.title}</a>
          </h3>
          <p class="story-excerpt">${story.excerpt}</p>
          <div class="story-meta">
            <div class="story-author">
              <div class="author-avatar">
                <img src="${story.author.avatar || 'assets/images/avatars/default.png'}" alt="${story.author.name}">
              </div>
              <div class="author-info">
                <span class="author-name">${story.author.name}</span>
              </div>
            </div>
            <div class="story-stats">
              <span class="story-stat">
                <i class="far fa-eye"></i> ${story.views}
              </span>
              <span class="story-stat">
                <i class="far fa-heart"></i> ${story.likes}
              </span>
            </div>
          </div>
        </div>
      `;
      
      container.appendChild(storyCard);
    });
  }

  initStoryEditor(selector, initialContent = '') {
    const editor = document.querySelector(selector);
    if (!editor) return null;
    
    // Simple implementation - in a real app, you might use a library like TinyMCE or Quill
    editor.innerHTML = `
      <div class="editor-toolbar">
        <button type="button" data-command="bold"><i class="fas fa-bold"></i></button>
        <button type="button" data-command="italic"><i class="fas fa-italic"></i></button>
        <button type="button" data-command="underline"><i class="fas fa-underline"></i></button>
        <button type="button" data-command="insertUnorderedList"><i class="fas fa-list-ul"></i></button>
        <button type="button" data-command="insertOrderedList"><i class="fas fa-list-ol"></i></button>
        <button type="button" data-command="createLink"><i class="fas fa-link"></i></button>
        <button type="button" data-command="insertImage"><i class="fas fa-image"></i></button>
      </div>
      <div class="editor-content" contenteditable="true">${initialContent}</div>
    `;
    
    const contentArea = editor.querySelector('.editor-content');
    
    editor.querySelectorAll('.editor-toolbar button').forEach(button => {
      button.addEventListener('click', () => {
        const command = button.dataset.command;
        
        if (command === 'createLink') {
          const url = prompt('Enter the link URL:');
          if (url) document.execCommand(command, false, url);
        } else if (command === 'insertImage') {
          const fileInput = document.createElement('input');
          fileInput.type = 'file';
          fileInput.accept = 'image/*';
          fileInput.click();
          
          fileInput.addEventListener('change', async () => {
            if (fileInput.files && fileInput.files[0]) {
              try {
                const result = await this.uploadStoryImage(fileInput.files[0], (progress) => {
                  console.log(`Upload progress: ${progress}%`);
                });
                document.execCommand('insertImage', false, result.url);
              } catch (error) {
                console.error('Image upload failed:', error);
                alert('Failed to upload image. Please try again.');
              }
            }
          });
        } else {
          document.execCommand(command, false, null);
        }
        
        contentArea.focus();
      });
    });
    
    return {
      getContent: () => contentArea.innerHTML,
      setContent: (content) => contentArea.innerHTML = content
    };
  }
}

export const stories = new StoriesService();
