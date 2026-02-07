// Global state
let selectedUser = null;
let users = [];
let messages = {};
let currentFilter = 'all';

// DOM Elements
const usersList = document.getElementById('users-list');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const messagesContainer = document.getElementById('messages-container');
const chatUserName = document.getElementById('chat-user-name');
const chatUserStatus = document.getElementById('chat-user-status');
const searchInput = document.getElementById('search-input');
const tabButtons = document.querySelectorAll('.tab-btn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadUsers();
  setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
  sendBtn.addEventListener('click', sendMessage);
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      sendMessage();
    }
  });

  searchInput.addEventListener('input', filterUsers);

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderUsers();
    });
  });
}

// Load users from main process
async function loadUsers() {
  try {
    users = await window.api.getUsers();
    renderUsers();
  } catch (error) {
    console.error('Error loading users:', error);
    usersList.innerHTML = '<div class="loading">Lỗi tải người dùng</div>';
  }
}

// Render users list
function renderUsers() {
  const filteredUsers = users.filter(
    (user) =>
      currentFilter === 'all' ||
      (currentFilter === 'online' && user.status === 'online') ||
      (currentFilter === 'offline' && user.status === 'offline')
  );

  const searchTerm = searchInput.value.toLowerCase();
  const searchedUsers = filteredUsers.filter((user) =>
    user.name.toLowerCase().includes(searchTerm)
  );

  usersList.innerHTML = searchedUsers
    .map(
      (user) => `
    <div class="user-item ${selectedUser?.id === user.id ? 'selected' : ''}" data-user-id="${user.id}">
      <div class="user-avatar">
        ${user.avatar}
        <div class="status-indicator ${user.status}"></div>
      </div>
      <div class="user-info">
        <div class="user-name">${user.name}</div>
        <div class="user-status-text">${user.status === 'online' ? 'Trực tuyến' : 'Ngoại tuyến'}</div>
      </div>
    </div>
  `
    )
    .join('');

  // Add click listeners
  document.querySelectorAll('.user-item').forEach((item) => {
    item.addEventListener('click', () => selectUser(item));
  });

  // Re-initialize Lucide icons for new elements
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Select user
async function selectUser(userElement) {
  const userId = parseInt(userElement.dataset.userId);
  selectedUser = users.find((u) => u.id === userId);

  if (!selectedUser) return;

  // Update UI
  document.querySelectorAll('.user-item').forEach((item) => {
    item.classList.remove('selected');
  });
  userElement.classList.add('selected');

  chatUserName.textContent = selectedUser.name;
  chatUserStatus.textContent =
    selectedUser.status === 'online' ? 'Trực tuyến' : 'Ngoại tuyến';
  chatUserStatus.className =
    'user-status ' + selectedUser.status;

  messageInput.disabled = false;
  sendBtn.disabled = false;

  // Load messages
  await loadMessages(userId);
}

// Load messages
async function loadMessages(userId) {
  try {
    const userMessages = await window.api.getMessages(userId);
    messages[userId] = userMessages;
    renderMessages(userId);
  } catch (error) {
    console.error('Error loading messages:', error);
  }
}

// Render messages
function renderMessages(userId) {
  const userMessages = messages[userId] || [];

  messagesContainer.innerHTML = userMessages
    .map(
      (msg) => `
    <div class="message ${msg.sender === 'Bạn' ? 'sent' : 'received'}">
      ${msg.sender !== 'Bạn' ? `<div class="message-avatar">${selectedUser.avatar}</div>` : ''}
      <div>
        <div class="message-bubble">${escapeHtml(msg.text)}</div>
        <div class="message-time">${formatTime(msg.timestamp)}</div>
      </div>
    </div>
  `
    )
    .join('');

  // Scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Send message
async function sendMessage() {
  const text = messageInput.value.trim();

  if (!text || !selectedUser) return;

  try {
    const result = await window.api.sendMessage(selectedUser.id, text);

    if (result.success) {
      // Add message to local messages array
      if (!messages[selectedUser.id]) {
        messages[selectedUser.id] = [];
      }

      messages[selectedUser.id].push({
        id: result.messageId,
        sender: 'Bạn',
        text: text,
        timestamp: new Date(),
      });

      renderMessages(selectedUser.id);
      messageInput.value = '';
      messageInput.focus();
    }
  } catch (error) {
    console.error('Error sending message:', error);
    alert('Lỗi gửi tin nhắn');
  }
}

// Filter users
function filterUsers() {
  renderUsers();
}

// Utility functions
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function formatTime(date) {
  const now = new Date();
  const messageDate = new Date(date);
  const diffMs = now - messageDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins}p`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;

  return messageDate.toLocaleDateString('vi-VN');
}
