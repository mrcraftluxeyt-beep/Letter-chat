// chat.js - Окно чата

import { getMessages, sendMessage, deleteMessage, markAsRead, getMyProfile } from './api.js';

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
    // ПОЛУЧЕНИЕ ID ЧАТА
    // ============================================
    const urlParams = new URLSearchParams(window.location.search);
    const chatId = urlParams.get('chatId') || localStorage.getItem('current_chat_id');

    if (!chatId) {
        window.location.href = 'dashboard.html';
        return;
    }

    // ============================================
    // ЭЛЕМЕНТЫ
    // ============================================
    const messagesContainer = document.getElementById('messages');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const backBtn = document.getElementById('back-btn');
    const chatUserName = document.getElementById('chat-user-name');
    const chatUserStatus = document.getElementById('chat-user-status');
    const chatAvatar = document.getElementById('chat-avatar');

    let currentMessages = [];
    let editingMessageId = null;
    let replyToMessageId = null;
    let myId = null;

    // ============================================
    // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
    // ============================================
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

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

    function formatTime(dateStr) {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Сегодня';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Вчера';
        } else {
            return date.toLocaleDateString('ru-RU', {day:'numeric', month:'long', year:'numeric'});
        }
    }

    // ============================================
    // ЗАГРУЗКА ПРОФИЛЯ
    // ============================================
    async function loadMyProfile() {
        const result = await getMyProfile();
        if (result.success) {
            myId = result.data.id;
        }
    }

    // ============================================
    // ЗАГРУЗКА СООБЩЕНИЙ
    // ============================================
    async function loadMessages() {
        const result = await getMessages(chatId);
        
        if (!result.success) {
            messagesContainer.innerHTML = `
                <div class="error-state">
                    <p>❌ ${result.error || 'Ошибка загрузки'}</p>
                    <button onclick="location.reload()">Обновить</button>
                </div>
            `;
            return;
        }
        
        currentMessages = result.data || [];
        renderMessages(currentMessages);
        
        // Отметить как прочитанные
        const unreadIds = currentMessages
            .filter(m => m.sender_id !== getUserId())
            .map(m => m.id);
        
        if (unreadIds.length > 0) {
            await markAsRead(chatId, unreadIds);
        }
    }

    // ============================================
    // ОТОБРАЖЕНИЕ СООБЩЕНИЙ
    // ============================================
    function renderMessages(messages) {
        if (!messages || messages.length === 0) {
            messagesContainer.innerHTML = `
                <div class="empty-messages">
                    <div class="empty-icon">💬</div>
                    <p>Нет сообщений</p>
                    <p class="empty-hint">Начните общение</p>
                </div>
            `;
            return;
        }
        
        // Группировка по дате
        let html = '';
        let lastDate = '';
        const userId = getUserId();
        
        // Переворачиваем, чтобы отображать в правильном порядке
        const sortedMessages = [...messages].reverse();
        
        sortedMessages.forEach(msg => {
            const msgDate = formatDate(msg.created_at);
            const isMine = msg.sender_id === userId;
            const senderName = msg.sender_name || 'Пользователь';
            
            if (msgDate !== lastDate) {
                lastDate = msgDate;
                html += `<div class="date-divider">${msgDate}</div>`;
            }
            
            html += `
                <div class="message ${isMine ? 'mine' : 'theirs'}" data-message-id="${msg.id}">
                    ${!isMine ? `<div class="message-avatar">${senderName[0] || '👤'}</div>` : ''}
                    <div class="message-content">
                        ${!isMine ? `<div class="message-sender">${escapeHtml(senderName)}</div>` : ''}
                        <div class="message-text">${escapeHtml(msg.text) || '📎 Вложение'}</div>
                        <div class="message-time">${formatTime(msg.created_at)}</div>
                    </div>
                </div>
            `;
        });
        
        messagesContainer.innerHTML = html;
        
        // Прокрутка вниз
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
    }

    // ============================================
    // ОТПРАВКА СООБЩЕНИЯ
    // ============================================
    async function handleSend() {
        const text = messageInput.value.trim();
        
        if (!text) return;
        
        sendBtn.disabled = true;
        sendBtn.textContent = '⏳';
        
        const result = await sendMessage(chatId, text, replyToMessageId);
        
        sendBtn.disabled = false;
        sendBtn.textContent = '➤';
        
        if (result.success) {
            messageInput.value = '';
            replyToMessageId = null;
            editingMessageId = null;
            await loadMessages();
        } else {
            alert(result.error || 'Ошибка отправки');
        }
    }

    // ============================================
    // ОБРАБОТЧИКИ СОБЫТИЙ
    // ============================================
    
    // Отправка
    sendBtn.addEventListener('click', handleSend);
    
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });

    // Назад
    backBtn.addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });

    // ============================================
    // ИНИЦИАЛИЗАЦИЯ
    // ============================================
    
    // Загружаем свой ID
    await loadMyProfile();
    
    // Загружаем сообщения
    await loadMessages();
    
    // Автообновление каждые 3 секунды
    setInterval(loadMessages, 3000);
});