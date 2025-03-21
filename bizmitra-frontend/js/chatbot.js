// js/chatbot.js
import { api } from './api.js';
import { auth } from './auth.js';
import { translation } from './translation.js';

class ChatbotService {
  constructor() {
    this.isInitialized = false;
    this.chatHistory = [];
    this.sessionId = null;
    this.typingTimeout = null;
    this.container = null;
    this.conversationEndpoint = '/chatbot/conversation';
  }

  init(containerId = 'chatbot-container') {
    this.container = document.getElementById(containerId);
    if (!this.container) return false;

    // Initialize chat UI elements
    this.initChatUI();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Start chatbot session
    this.startSession();
    
    this.isInitialized = true;
    return true;
  }

  async startSession() {
    try {
      const user = auth.getCurrentUser();
      const sessionData = {
        language: translation.currentLanguage,
        timestamp: new Date().toISOString(),
        userInfo: user ? {
          id: user.id,
          name: user.name
        } : null
      };

      const response = await api.post('/chatbot/session', sessionData);
      this.sessionId = response.sessionId;
      
      // Send welcome message if not in history
      if (this.chatHistory.length === 0) {
        this.addBotMessage(response.welcomeMessage || 'Hi! How can I help you today?');
        
        // Add quick replies if available
        if (response.quickReplies && response.quickReplies.length > 0) {
          this.showQuickReplies(response.quickReplies);
        }
      }
    } catch (error) {
      console.error('Failed to start chatbot session:', error);
      this.addBotMessage('Sorry, I\'m having trouble connecting. Please try again later.');
    }
  }

  initChatUI() {
    // Reset container
    this.container.innerHTML = `
      <div class="chat-header">
        <div class="bot-info">
          <div class="bot-avatar">
            <img src="assets/images/logo.png" alt="BizMitra Bot">
          </div>
          <div>
            <div class="bot-name">BizMitra Assistant</div>
            <div class="bot-status">Online</div>
          </div>
        </div>
        <button class="chat-close" id="chat-close"><i class="fas fa-times"></i></button>
      </div>
      <div class="chat-body" id="chat-body"></div>
      <div class="chat-footer">
        <div class="chat-input-container">
          <input type="text" id="chat-input" class="chat-input" placeholder="Type your message...">
          <button class="chat-send" id="chat-send"><i class="fas fa-paper-plane"></i></button>
        </div>
      </div>
    `;
    
    // Get references to elements
    this.chatBody = document.getElementById('chat-body');
    this.chatInput = document.getElementById('chat-input');
    this.chatSend = document.getElementById('chat-send');
    this.chatClose = document.getElementById('chat-close');
  }

  setupEventListeners() {
    // Send message on button click
    this.chatSend.addEventListener('click', () => {
      this.sendMessage();
    });
    
    // Send message on Enter key
    this.chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });
    
    // Typing indicator
    this.chatInput.addEventListener('input', () => {
      clearTimeout(this.typingTimeout);
      this.typingTimeout = setTimeout(() => {
        // Typing stopped
      }, 1000);
    });
    
    // Close chatbot
    this.chatClose.addEventListener('click', () => {
      this.container.classList.remove('active');
    });
    
    // Handle clicks on quick replies
    this.chatBody.addEventListener('click', (e) => {
      const quickReply = e.target.closest('.quick-reply');
      if (quickReply) {
        const message = quickReply.textContent;
        this.handleUserMessage(message);
      }
    });
  }

  sendMessage() {
    const message = this.chatInput.value.trim();
    if (!message) return;
    
    // Clear input
    this.chatInput.value = '';
    
    // Handle message
    this.handleUserMessage(message);
  }

  async handleUserMessage(message) {
    // Add user message to UI
    this.addUserMessage(message);
    
    // Remove quick replies if present
    const quickReplies = this.chatBody.querySelector('.quick-replies');
    if (quickReplies) {
      quickReplies.remove();
    }
    
    // Add to chat history
    this.chatHistory.push({
      role: 'user',
      content: message
    });
    
    // Show typing indicator
    this.showTypingIndicator();
    
    try {
      // Send message to backend
      const response = await api.post(this.conversationEndpoint, {
        sessionId: this.sessionId,
        message,
        history: this.chatHistory
      });
      
      // Hide typing indicator
      this.hideTypingIndicator();
      
      // Process response
      this.processResponse(response);
    } catch (error) {
      console.error('Chatbot error:', error);
      this.hideTypingIndicator();
      this.addBotMessage('Sorry, I encountered an error. Please try again.');
    }
  }

  processResponse(response) {
    // Add bot message
    this.addBotMessage(response.message);
    
    // Add to chat history
    this.chatHistory.push({
      role: 'assistant',
      content: response.message
    });
    
    // Show quick replies if available
    if (response.quickReplies && response.quickReplies.length > 0) {
      this.showQuickReplies(response.quickReplies);
    }
    
    // Handle actions if any
    if (response.action) {
      this.handleAction(response.action);
    }
  }

  handleAction(action) {
    switch (action.type) {
      case 'redirect':
        setTimeout(() => {
          window.location.href = action.url;
        }, 1000);
        break;
      case 'open_modal':
        // Implementation depends on your modal system
        break;
      case 'show_notification':
        // Show notification using the app's notification system
        break;
    }
  }

  addUserMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message user-message';
    
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageElement.innerHTML = `
      <div>${message}</div>
      <span class="message-time">${timeStr}</span>
    `;
    
    this.chatBody.appendChild(messageElement);
    this.scrollToBottom();
  }

  addBotMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message bot-message';
    
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageElement.innerHTML = `
      <div>${message}</div>
      <span class="message-time">${timeStr}</span>
    `;
    
    this.chatBody.appendChild(messageElement);
    this.scrollToBottom();
  }

  showQuickReplies(replies) {
    const quickRepliesElement = document.createElement('div');
    quickRepliesElement.className = 'quick-replies';
    
    replies.forEach(reply => {
      const button = document.createElement('button');
      button.className = 'quick-reply';
      button.textContent = reply;
      quickRepliesElement.appendChild(button);
    });
    
    this.chatBody.appendChild(quickRepliesElement);
    this.scrollToBottom();
  }

  showTypingIndicator() {
    const typingElement = document.createElement('div');
    typingElement.className = 'bot-typing';
    typingElement.innerHTML = `
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    `;
    
    this.chatBody.appendChild(typingElement);
    this.scrollToBottom();
  }

  hideTypingIndicator() {
    const typingElement = this.chatBody.querySelector('.bot-typing');
    if (typingElement) {
      typingElement.remove();
    }
  }

  scrollToBottom() {
    this.chatBody.scrollTop = this.chatBody.scrollHeight;
  }

  toggle() {
    this.container.classList.toggle('active');
    
    if (this.container.classList.contains('active') && !this.sessionId) {
      this.startSession();
    }
  }

  clearChat() {
    this.chatBody.innerHTML = '';
    this.chatHistory = [];
    this.startSession();
  }
}

export const chatbot = new ChatbotService();
