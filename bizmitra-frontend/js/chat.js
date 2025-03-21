// js/chat.js
import { api } from './api.js';
import { auth } from './auth.js';

class ChatService {
  constructor() {
    this.socket = null;
    this.messageListeners = [];
    this.statusListeners = [];
    this.typingListeners = [];
    this.reconnectTimer = null;
    this.currentUser = auth.getCurrentUser();
    this.pendingMessages = [];
  }

  init() {
    if (!auth.isAuthenticated()) return false;
    
    this.connect();
    
    // Listen for auth state changes
    auth.onAuthStateChanged((isAuthenticated) => {
      if (isAuthenticated) {
        this.currentUser = auth.getCurrentUser();
        this.connect();
      } else {
        this.disconnect();
      }
    });
    
    return true;
  }

  connect() {
    // Clear any existing reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    // Close existing socket if any
    if (this.socket) {
      this.socket.close();
    }
    
    // Create new WebSocket connection
    this.socket = api.createWebSocket();
    
    this.socket.onopen = () => {
      console.log('Chat WebSocket connected');
      this.notifyStatusChange('connected');
      
      // Send any pending messages
      if (this.pendingMessages.length > 0) {
        this.pendingMessages.forEach(msg => this.socket.send(JSON.stringify(msg)));
        this.pendingMessages = [];
      }
    };
    
    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'message':
            this.notifyNewMessage(data);
            break;
          case 'typing':
            this.notifyTypingStatus(data.userId, data.isTyping);
            break;
          case 'status':
            this.notifyUserStatus(data.userId, data.status);
            break;
          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    this.socket.onclose = (event) => {
      console.log('Chat WebSocket disconnected:', event.code, event.reason);
      this.notifyStatusChange('disconnected');
      
      // Attempt to reconnect if closed unexpectedly and user is still authenticated
      if (event.code !== 1000 && auth.isAuthenticated()) {
        this.reconnectTimer = setTimeout(() => {
          console.log('Attempting to reconnect WebSocket...');
          this.connect();
        }, 5000);
      }
    };
    
    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.notifyStatusChange('error');
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  sendMessage(recipientId, content, attachments = []) {
    const message = {
      type: 'message',
      recipientId,
      content,
      attachments,
      timestamp: new Date().toISOString()
    };
    
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
      return true;
    } else {
      // Store message to send when connection is restored
      this.pendingMessages.push(message);
      
      // Try to reconnect
      this.connect();
      return false;
    }
  }

  sendTypingStatus(recipientId, isTyping) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'typing',
        recipientId,
        isTyping
      }));
    }
  }

  async getConversations() {
    return api.get('/chat/conversations', true);
  }

  async getMessages(conversationId, page = 1, limit = 30) {
    return api.get(`/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`, true);
  }

  async markMessagesRead(conversationId) {
    return api.put(`/chat/conversations/${conversationId}/read`, {}, true);
  }

  async uploadAttachment(file, progressCallback) {
    return api.uploadFile('/chat/upload', file, progressCallback, true);
  }

  onNewMessage(callback) {
    this.messageListeners.push(callback);
  }

  onStatusChange(callback) {
    this.statusListeners.push(callback);
  }

  onTypingStatus(callback) {
    this.typingListeners.push(callback);
  }

  notifyNewMessage(message) {
    this.messageListeners.forEach(listener => listener(message));
  }

  notifyStatusChange(status) {
    this.statusListeners.forEach(listener => listener(status));
  }

  notifyTypingStatus(userId, isTyping) {
    this.typingListeners.forEach(listener => listener(userId, isTyping));
  }

  notifyUserStatus(userId, status) {
    // Implement if needed
  }

  async deleteConversation(conversationId) {
    return api.delete(`/chat/conversations/${conversationId}`, true);
  }

  async archiveConversation(conversationId) {
    return api.put(`/chat/conversations/${conversationId}/archive`, {}, true);
  }

  renderChatMessages(messages, container, currentUserId) {
    container.innerHTML = '';
    
    let currentDate = null;
    
    messages.forEach(message => {
      const messageDate = new Date(message.timestamp).toLocaleDateString();
      
      // Add date separator if needed
      if (messageDate !== currentDate) {
        currentDate = messageDate;
        const dateDivider = document.createElement('div');
        dateDivider.className = 'chat-date-divider';
        dateDivider.innerHTML = `<span class="date-text">${messageDate}</span>`;
        container.appendChild(dateDivider);
      }
      
      const isOutgoing = message.senderId === currentUserId;
      const messageGroup = document.createElement('div');
      messageGroup.className = `message-group ${isOutgoing ? 'outgoing' : 'incoming'}`;
      
      let bubbleContent = `<div class="bubble-content">${message.content}</div>`;
      
      // Add attachments if any
      if (message.attachments && message.attachments.length > 0) {
        bubbleContent += this.renderAttachments(message.attachments);
      }
      
      // Add message status for outgoing messages
      if (isOutgoing) {
        bubbleContent += `
          <div class="bubble-status">
            <span class="status-${message.status || 'sent'}">
              ${message.status === 'read' ? 
                '<i class="fas fa-check-double"></i>' : 
                '<i class="fas fa-check"></i>'}
            </span>
          </div>
        `;
      }
      
      messageGroup.innerHTML = `
        <div class="chat-bubble ${isOutgoing ? 'outgoing' : 'incoming'}">
          ${bubbleContent}
        </div>
        <div class="chat-time">${new Date(message.timestamp).toLocaleTimeString()}</div>
      `;
      
      container.appendChild(messageGroup);
    });
    
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
  }

  renderAttachments(attachments) {
    let html = '';
    
    attachments.forEach(attachment => {
      if (attachment.type.startsWith('image/')) {
        html += `
          <div class="bubble-media">
            <img src="${attachment.url}" alt="Attachment">
          </div>
        `;
      } else if (attachment.type.startsWith('audio/')) {
        html += `
          <div class="voice-message">
            <div class="voice-play">
              <i class="fas fa-play"></i>
            </div>
            <div class="voice-wave"></div>
            <div class="voice-duration">${attachment.duration || '0:00'}</div>
          </div>
        `;
      } else {
        html += `
          <div class="file-attachment">
            <div class="file-icon">
              <i class="fas fa-file"></i>
            </div>
            <div class="file-info">
              <div class="file-name">${attachment.filename}</div>
              <div class="file-size">${this.formatFileSize(attachment.size)}</div>
            </div>
            <a href="${attachment.url}" download class="file-download">
              <i class="fas fa-download"></i>
            </a>
          </div>
        `;
      }
    });
    
    return html;
  }

  formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  }
}

export const chat = new ChatService();
