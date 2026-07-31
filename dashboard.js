<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>Letter — Чаты</title>
    <link rel="stylesheet" href="style.css" />
</head>
<body>
    <div class="app" id="app">
        <!-- ============================================ -->
        <!-- БОКОВАЯ ПАНЕЛЬ -->
        <!-- ============================================ -->
        <aside class="sidebar" id="sidebar">
            <!-- Шапка -->
            <div class="sidebar-header">
                <div class="sidebar-user" id="sidebar-user">
                    <div class="user-avatar" id="user-avatar">
                        <span id="avatar-letter">👤</span>
                        <span class="online-dot" id="online-dot"></span>
                    </div>
                    <div class="user-info">
                        <span class="user-name" id="user-display-name">Загрузка...</span>
                        <span class="user-status" id="user-status">онлайн</span>
                    </div>
                </div>
                <div class="sidebar-actions">
                    <button class="btn-icon" id="new-chat-btn" title="Новый чат">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 5v14M5 12h14"/>
                        </svg>
                    </button>
                    <button class="btn-icon" id="logout-btn" title="Выйти">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                            <polyline points="16 17 21 12 16 7"/>
                            <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Поиск -->
            <div class="search-container">
                <div class="search-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="M21 21l-4.35-4.35"/>
                    </svg>
                    <input type="text" id="search-input" placeholder="Поиск..." autocomplete="off" />
                    <button class="search-clear" id="search-clear" style="display:none;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Фильтры -->
            <div class="chat-filters">
                <button class="filter-btn active" data-filter="all">Все</button>
                <button class="filter-btn" data-filter="unread">Непрочитанные</button>
                <button class="filter-btn" data-filter="personal">Личные</button>
            </div>

            <!-- Список чатов -->
            <div class="chats-list" id="chats-list">
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>Загрузка чатов...</p>
                </div>
            </div>
        </aside>

        <!-- ============================================ -->
        <!-- ОСНОВНАЯ ОБЛАСТЬ -->
        <!-- ============================================ -->
        <main class="main-content" id="main-content">
            <div class="empty-state" id="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    <path d="M8 10h.01M12 10h.01M16 10h.01"/>
                </svg>
                <h2>Выберите чат</h2>
                <p>Начните общение с друзьями</p>
                <button class="btn btn-primary" id="empty-new-chat-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 5v14M5 12h14"/>
                    </svg>
                    Создать чат
                </button>
            </div>
        </main>
    </div>

    <!-- ============================================ -->
    <!-- МОДАЛЬНОЕ ОКНО -->
    <!-- ============================================ -->
    <div class="modal" id="new-chat-modal">
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>Новый чат</h3>
                <button class="modal-close" id="modal-close">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Введите номер телефона</label>
                    <div class="phone-input">
                        <span class="phone-prefix">+7</span>
                        <input type="tel" id="new-chat-phone" placeholder="999 999-99-99" maxlength="10" />
                    </div>
                </div>
                <div class="search-results" id="search-results"></div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="cancel-new-chat">Отмена</button>
                <button class="btn btn-primary" id="create-new-chat" disabled>Создать</button>
            </div>
        </div>
    </div>

    <script src="api.js"></script>
    <script>
        // ============================================
        // ПРОВЕРКА ТОКЕНА
        // ============================================
        const token = localStorage.getItem('letter_token');
        if (!token) {
            window.location.href = 'index.html';
        }

        // ============================================
        // ЭЛЕМЕНТЫ
        // ============================================
        const chatsList = document.getElementById('chats-list');
        const searchInput = document.getElementById('search-input');
        const searchClear = document.getElementById('search-clear');
        const userDisplayName = document.getElementById('user-display-name');
        const avatarLetter = document.getElementById('avatar-letter');
        const onlineDot = document.getElementById('online-dot');
        const userStatus = document.getElementById('user-status');
        const newChatBtn = document.getElementById('new-chat-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const modal = document.getElementById('new-chat-modal');
        const modalOverlay = document.querySelector('.modal-overlay');
        const modalClose = document.getElementById('modal-close');
        const newChatPhone = document.getElementById('new-chat-phone');
        const createChatBtn = document.getElementById('create-new-chat');
        const cancelNewChat = document.getElementById('cancel-new-chat');
        const searchResults = document.getElementById('search-results');
        const emptyNewChatBtn = document.getElementById('empty-new-chat-btn');

        let allChats = [];
        let currentChats = [];

        // ============================================
        // ВСПОМОГАТЕЛЬНЫЕ
        // ============================================
        function getUserId() {
            try {
                const token = localStorage.getItem('letter_token');
                if (!token) return null;
                const payload = JSON.parse(atob(token.split('.')[1]));
                return payload.user_id;
            } catch (e) {
                return null;
            }
        }

        function escapeHtml(text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function formatTime(dateStr) {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            if (date >= today) {
                return date.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
            } else {
                return date.toLocaleDateString([], {day:'2-digit', month:'2-digit'});
            }
        }

        function showError(msg) {
            chatsList.innerHTML = `
                <div class="error-state">
                    <p>❌ ${msg}</p>
                    <button onclick="location.reload()">Обновить</button>
                </div>
            `;
        }

        // ============================================
        // ЗАГРУЗКА ПРОФИЛЯ
        // ============================================
        async function loadProfile() {
            try {
                const response = await fetch('http://127.0.0.1:8080/api/users/me', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('letter_token')}`
                    }
                });
                const result = await response.json();
                
                if (result.success) {
                    const user = result.data;
                    const name = user.displayName || user.username || user.phone || 'Пользователь';
                    userDisplayName.textContent = name;
                    avatarLetter.textContent = name[0] || '👤';
                    onlineDot.className = `online-dot ${user.isOnline ? '' : 'offline'}`;
                    userStatus.textContent = user.isOnline ? 'онлайн' : 'был(а) недавно';
                }
            } catch (error) {
                console.error('Ошибка загрузки профиля:', error);
            }
        }

        // ============================================
        // ЗАГРУЗКА ЧАТОВ
        // ============================================
        async function loadChats() {
            try {
                chatsList.innerHTML = `
                    <div class="loading-spinner">
                        <div class="spinner"></div>
                        <p>Загрузка...</p>
                    </div>
                `;

                const response = await fetch('http://127.0.0.1:8080/api/chats', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('letter_token')}`
                    }
                });
                const result = await response.json();

                if (!result.success) {
                    showError(result.error || 'Ошибка загрузки');
                    return;
                }

                allChats = result.data || [];
                currentChats = [...allChats];
                renderChats(currentChats);
            } catch (error) {
                console.error('Ошибка загрузки чатов:', error);
                showError('Не удалось загрузить чаты');
            }
        }

        // ============================================
        // ОТОБРАЖЕНИЕ ЧАТОВ
        // ============================================
        function renderChats(chats) {
            if (!chats || chats.length === 0) {
                chatsList.innerHTML = `
                    <div class="empty-chats">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            <path d="M8 10h.01M12 10h.01M16 10h.01"/>
                        </svg>
                        <p>Нет чатов</p>
                        <p class="empty-hint">Начните общение с друзьями</p>
                    </div>
                `;
                return;
            }

            const userId = getUserId();
            
            chatsList.innerHTML = chats.map(chat => {
                const participants = chat.participants || [];
                const otherUser = participants.find(p => p.id !== userId);
                const chatName = chat.name || otherUser?.displayName || otherUser?.username || 'Чат';
                const lastMsg = chat.lastMessage;
                const time = formatTime(lastMsg?.created_at);
                const unread = chat.unreadCount || 0;
                
                return `
                    <div class="chat-item" data-chat-id="${chat.id}">
                        <div class="chat-avatar">
                            <span>${chatName[0] || 'Ч'}</span>
                            ${unread > 0 ? `<span class="unread-badge">${unread}</span>` : ''}
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
                searchClear.style.display = 'block';
            } else {
                searchClear.style.display = 'none';
            }
            
            if (!query) {
                currentChats = [...allChats];
                renderChats(currentChats);
                return;
            }
            
            const userId = getUserId();
            const filtered = allChats.filter(chat => {
                const participants = chat.participants || [];
                const otherUser = participants.find(p => p.id !== userId);
                const chatName = chat.name || otherUser?.displayName || otherUser?.username || '';
                return chatName.toLowerCase().includes(query.toLowerCase());
            });
            
            currentChats = filtered;
            renderChats(currentChats);
        });

        searchClear.addEventListener('click', function() {
            searchInput.value = '';
            this.style.display = 'none';
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
                } else if (filter === 'personal') {
                    currentChats = allChats.filter(c => c.type === 'personal');
                }
                
                renderChats(currentChats);
            });
        });

        // ============================================
        // МОДАЛЬНОЕ ОКНО
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
        modalOverlay.addEventListener('click', closeModal);
        modalClose.addEventListener('click', closeModal);
        cancelNewChat.addEventListener('click', closeModal);

        // ============================================
        // ПОИСК ПОЛЬЗОВАТЕЛЕЙ
        // ============================================
        newChatPhone.addEventListener('input', async function() {
            const query = this.value.trim();
            
            if (query.length < 3) {
                searchResults.innerHTML = '';
                createChatBtn.disabled = true;
                return;
            }
            
            try {
                const response = await fetch(`http://127.0.0.1:8080/api/users/search?query=${encodeURIComponent(query)}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('letter_token')}`
                    }
                });
                const result = await response.json();
                
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
            } catch (error) {
                console.error('Ошибка поиска:', error);
                searchResults.innerHTML = '<div class="no-results">❌ Ошибка поиска</div>';
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
            this.textContent = '⏳...';
            
            try {
                const response = await fetch('http://127.0.0.1:8080/api/chats', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('letter_token')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        participants: [userId],
                        type: 'personal'
                    })
                });
                const result = await response.json();
                
                if (result.success) {
                    closeModal();
                    loadChats();
                } else {
                    alert(result.error || 'Ошибка создания чата');
                }
            } catch (error) {
                alert('Ошибка соединения');
            }
            
            this.disabled = false;
            this.textContent = 'Создать';
        });

        // ENTER для создания
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
                try {
                    await fetch('http://127.0.0.1:8080/api/auth/logout', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('letter_token')}`
                        }
                    });
                } catch (e) {}
                
                localStorage.removeItem('letter_token');
                localStorage.removeItem('current_chat_id');
                window.location.href = 'index.html';
            }
        });

        // ============================================
        // ИНИЦИАЛИЗАЦИЯ
        // ============================================
        async function init() {
            await loadProfile();
            await loadChats();
            
            // Обновление каждые 5 секунд
            setInterval(loadChats, 5000);
        }

        init();
    </script>
</body>
</html>
