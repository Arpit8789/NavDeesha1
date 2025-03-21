// js/forums.js
import { api } from './api.js';

class ForumsService {
  async getCategories() {
    return api.get('/forums/categories');
  }

  async getForumPosts(categoryId, page = 1, limit = 10) {
    return api.get(`/forums/categories/${categoryId}/posts?page=${page}&limit=${limit}`);
  }

  async getPost(postId) {
    return api.get(`/forums/posts/${postId}`);
  }

  async createPost(postData) {
    return api.post('/forums/posts', postData, true);
  }

  async updatePost(postId, postData) {
    return api.put(`/forums/posts/${postId}`, postData, true);
  }

  async deletePost(postId) {
    return api.delete(`/forums/posts/${postId}`, true);
  }

  async getComments(postId, page = 1, limit = 20) {
    return api.get(`/forums/posts/${postId}/comments?page=${page}&limit=${limit}`);
  }

  async addComment(postId, content) {
    return api.post(`/forums/posts/${postId}/comments`, { content }, true);
  }

  async updateComment(commentId, content) {
    return api.put(`/forums/comments/${commentId}`, { content }, true);
  }

  async deleteComment(commentId) {
    return api.delete(`/forums/comments/${commentId}`, true);
  }

  async likePost(postId) {
    return api.post(`/forums/posts/${postId}/like`, {}, true);
  }

  async unlikePost(postId) {
    return api.delete(`/forums/posts/${postId}/like`, true);
  }

  async searchPosts(query, page = 1, limit = 10) {
    return api.get(`/forums/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  }

  async getPopularTags() {
    return api.get('/forums/tags/popular');
  }

  async getMyPosts(page = 1, limit = 10) {
    return api.get(`/forums/my-posts?page=${page}&limit=${limit}`, true);
  }

  sanitizeHTML(html) {
    const temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
  }

  renderPostsList(posts, container) {
    container.innerHTML = '';
    
    posts.forEach(post => {
      const postElement = document.createElement('div');
      postElement.className = 'forum-post';
      
      postElement.innerHTML = `
        <div class="post-votes">
          <button class="vote-up" data-post-id="${post.id}">
            <i class="fas fa-arrow-up"></i>
          </button>
          <span class="vote-count">${post.votes}</span>
          <button class="vote-down" data-post-id="${post.id}">
            <i class="fas fa-arrow-down"></i>
          </button>
        </div>
        <div class="post-content">
          <h3 class="post-title">
            <a href="/forums/post.html?id=${post.id}">${this.sanitizeHTML(post.title)}</a>
          </h3>
          <div class="post-meta">
            <span class="post-author">
              <img src="${post.author.avatar || 'assets/images/avatars/default.png'}" alt="${post.author.name}">
              <span>${post.author.name}</span>
            </span>
            <span class="post-date">${new Date(post.createdAt).toLocaleDateString()}</span>
            <span class="post-comments">
              <i class="fas fa-comment"></i> ${post.commentCount}
            </span>
          </div>
          <div class="post-tags">
            ${post.tags.map(tag => `<span class="post-tag">${tag}</span>`).join('')}
          </div>
        </div>
      `;
      
      container.appendChild(postElement);
    });
  }

  setupForumEventListeners() {
    document.addEventListener('click', (e) => {
      // Like post
      if (e.target.closest('.vote-up')) {
        const postId = e.target.closest('.vote-up').dataset.postId;
        this.likePost(postId)
          .then(response => {
            const voteCount = e.target.closest('.post-votes').querySelector('.vote-count');
            voteCount.textContent = response.votes;
          })
          .catch(error => console.error('Error liking post:', error));
      }
      
      // Unlike post
      if (e.target.closest('.vote-down')) {
        const postId = e.target.closest('.vote-down').dataset.postId;
        this.unlikePost(postId)
          .then(response => {
            const voteCount = e.target.closest('.post-votes').querySelector('.vote-count');
            voteCount.textContent = response.votes;
          })
          .catch(error => console.error('Error unliking post:', error));
      }
    });
  }
}

export const forums = new ForumsService();
