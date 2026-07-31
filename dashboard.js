// dashboard.js - Список чатов

import { getChats, createChat, searchUsers, getMyProfile, logout } from './api.js';

document.addEventListener('DOMContentLoaded', function() {
    // ============================================
    // ПРОВЕРКА ТОКЕНА
    // ============================================
    const token = localStorage.getItem('letter_token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // ============================================
    // ЭЛЕМЕНТЫ
    // ============================================
    const chatsList = document.getElementById('chats-list');
    const searchInput = document.getElementById('search-input');
    const searchClear = document.getElementById('search-clear');
    const userDisplayName = document.getElementById('user-display-name');
    const userAvatar = document.getElementById('user-avatar');
    const newChatBtn = document.getElementById('new-chat-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const modal = document.getElementById('new-chat-modal');
    const modalOverlay = document.querySelector('.modal-overlay');
    const modalClose = document.querySelector('.modal-close');
    const newChatPhone = document.getElementById('new-chat-phone');
    const createChatBtn = document.getElementById('create-new-chat');
    const cancelChatBtn = document.getElementById('cancel-new-chat');
    const searchResults = document.getElementById('search-results');
    const emptyNewChatBtn = document.getElementById('empty-new-chat-btn');

    let currentChats = [];
    let allChats = [];

    // ============================================
    // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
    // ============================================
    function getUserId() {
        const token = localStorage.getItem('letter_token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                return payload.user_id;
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ============================================
    // ЗАГРУЗКА ПРОФИЛЯ
    // ============================================
    async function loadProfile() {
        const result = await getMyProfile();
        if (result.success) {
            const user = result.data;
            userDisplayName.textContent = user.displayName || user.username || user.phone;
            userAvatar.innerHTML = (user.displayName || user.username || '?')[0];
        }
    }

    // ============================================
    // ЗАГРУЗКА ЧАТОВ
    // ============================================
    async function loadChats() {
        chatsList.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Загрузка чатов...</p>
            </div>
        `;
        
        const result = await getChats();
        
        if (!result.success) {
            chatsList.innerHTML = `
                <div class="error-state">
                    <p>❌ ${result.error || 'Ошибка загрузки'}</p>
                    <button onclick="location.reload()">Обновить</button>
                </div>
            `;
            return;
        }
        
        allChats = result.data || [];
        currentChats = [...allChats];
        renderChats(currentChats);
    }

    // ============================================
    // ОТОБРАЖЕНИЕ ЧАТОВ
    // ============================================
    function renderChats(chats) {
        if (!chats || chats.length === 0) {
            chatsList.innerHTML = `
                <div class="empty-chats">
                    <div class="empty-icon">💬</div>
                    <p>Нет чатов</p>
                    <p class="empty-hint">Начните общение с друзьями</p>
                    <button class="btn btn-primary" id="empty-new-chat-btn" style="margin-top: 16px;">
                        Создать чат
                    </button>
                </div>
            `;
            
            document.getElementById('empty-new-chat-btn')?.addEventListener('click', openModal);
            return;
        }
        
        const userId = getUserId();
        
        chatsList.innerHTML = chats.map(chat => {
            const participants = chat.participants || [];
            const otherUser = participants.find(p => p.id !== userId);
            const chatName = chat.name || otherUser?.displayName || otherUser?.username || 'Чат';
            const lastMsg = chat.lastMessage;
            const time = lastMsg?.created_at ? new Date(lastMsg.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '';
            
            return `
                <div class="chat-item" data-chat-id="${chat.id}">
                    <div class="chat-avatar">
                        ${chatName[0] || '👤'}
                        ${chat.unreadCount > 0 ? `<span class="unread-badge">${chat.unreadCount}</span>` : ''}
                    </div>
                    <div class="chat-info">
                        <div class="chat-name">${escapeHtml(chatName)}</div>
                        <div class="chat-last-msg">${escapeHtml(lastMsg?.text || 'Нет сообщений')}</div>
                    </div>
                    <div class="chat-time">${time}</div>
                </div>
            `;
        }).join('');
        
        // Клик по чату
        document.querySelectorAll('.chat-item').forEach(el => {
            el.addEventListener('click', function() {
                const chatId = this.dataset.chatId;
                localStorage.setItem('current_chat_id', chatId);
                window.location.href = `chat.html?chatId=${chatId}`;
            });
        });
    }

    // ============================================
    // ПОИСК
    // ============================================
    searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        
        if (query) {
            searchClear.classList.add('visible');
        } else {
            searchClear.classList.remove('visible');
        }
        
        if (!query) {
            currentChats = [...allChats];
            renderChats(currentChats);
            return;
        }
        
        const filtered = allChats.filter(chat => {
            const participants = chat.participants || [];
            const otherUser = participants.find(p => p.id !== getUserId());
            const chatName = chat.name || otherUser?.displayName || otherUser?.username || '';
            return chatName.toLowerCase().includes(query.toLowerCase());
        });
        
        currentChats = filtered;
        renderChats(currentChats);
    });

    searchClear.addEventListener('click', function() {
        searchInput.value = '';
        this.classList.remove('visible');
        currentChats = [...allChats];
        renderChats(currentChats);
        searchInput.focus();
    });

    // ============================================
    // ФИЛЬТРЫ
    // ============================================
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.dataset.filter;
            
            if (filter === 'all') {
                currentChats = [...allChats];
            } else if (filter === 'unread') {
                currentChats = allChats.filter(c => c.unreadCount > 0);
            } else if (filter === 'groups') {
                currentChats = allChats.filter(c => c.type === 'group');
            } else if (filter === 'personal') {
                currentChats = allChats.filter(c => c.type === 'personal');
            }
            
            renderChats(currentChats);
        });
    });

    // ============================================
    // МОДАЛЬНОЕ ОКНО (НОВЫЙ ЧАТ)
    // ============================================
    function openModal() {
        modal.classList.add('active');
        newChatPhone.value = '';
        searchResults.innerHTML = '';
        createChatBtn.disabled = true;
        setTimeout(() => newChatPhone.focus(), 300);
    }

    function closeModal() {
        modal.classList.remove('active');
    }

    newChatBtn.addEventListener('click', openModal);
    emptyNewChatBtn?.addEventListener('click', openModal);
    modalOverlay?.addEventListener('click', closeModal);
    modalClose?.addEventListener('click', closeModal);
    cancelChatBtn?.addEventListener('click', closeModal);

    // ============================================
    // ПОИСК ПОЛЬЗОВАТЕЛЕЙ ДЛЯ НОВОГО ЧАТА
    // ============================================
    newChatPhone.addEventListener('input', async function() {
        const query = this.value.trim();
        
        if (query.length < 3) {
            searchResults.innerHTML = '';
            createChatBtn.disabled = true;
            return;
        }
        
        const result = await searchUsers(query);
        
        if (result.success && result.data.length > 0) {
            searchResults.innerHTML = result.data.map(user => `
                <div class="search-result-item" data-user-id="${user.id}">
                    <div class="result-avatar">${(user.displayName || user.username || '?')[0]}</div>
                    <div>
                        <div class="result-name">${escapeHtml(user.displayName || user.username)}</div>
                        <div class="result-phone">${escapeHtml(user.phone)}</div>
                    </div>
                </div>
            `).join('');
            
            document.querySelectorAll('.search-result-item').forEach(el => {
                el.addEventListener('click', function() {
                    document.querySelectorAll('.search-result-item').forEach(e => e.classList.remove('selected'));
                    this.classList.add('selected');
                    createChatBtn.disabled = false;
                    createChatBtn.dataset.userId = this.dataset.userId;
                });
            });
        } else {
            searchResults.innerHTML = '<div class="no-results">👤 Пользователи не найдены</div>';
            createChatBtn.disabled = true;
        }
    });

    // ============================================
    // СОЗДАНИЕ ЧАТА
    // ============================================
    createChatBtn.addEventListener('click', async function() {
        const userId = this.dataset.userId;
        if (!userId) return;
        
        this.disabled = true;
        this.textContent = '⏳ Создание...';
        
        const result = await createChat([userId], 'personal');
        
        this.disabled = false;
        this.textContent = 'Создать';
        
        if (result.success) {
            closeModal();
            loadChats();
        } else {
            alert(result.error || 'Ошибка создания чата');
        }
    });

    // ENTER в поиске пользователей
    newChatPhone.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const selected = document.querySelector('.search-result-item.selected');
            if (selected) {
                createChatBtn.click();
            }
        }
    });

    // ============================================
    // ВЫХОД
    // ============================================
    logoutBtn.addEventListener('click', async function() {
        if (confirm('Выйти из аккаунта?')) {
            await logout();
            window.location.href = 'index.html';
        }
    });

    // ============================================
    // ИНИЦИАЛИЗАЦИЯ
    // ============================================
    await loadProfile();
    await loadChats();
    
    // Автообновление каждые 5 секунд
    setInterval(loadChats, 5000);
});