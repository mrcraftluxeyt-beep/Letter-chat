// api.js - Клиент для работы с API

// ============================================
// НАСТРОЙКА
// ============================================

// ВАЖНО: Если на PyDroid - используй 127.0.0.1
// Если на компьютере - используй localhost или IP
const API_BASE = 'http://127.0.0.1:8080/api';

// ============================================
// ТОКЕН
// ============================================

function getToken() {
    return localStorage.getItem('letter_token');
}

function setToken(token) {
    localStorage.setItem('letter_token', token);
}

function getHeaders() {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

// ============================================
// ПРОВЕРКА СОЕДИНЕНИЯ
// ============================================

export async function checkConnection() {
    try {
        console.log('🔍 Проверка API:', API_BASE);
        const response = await fetch(`${API_BASE}/health`);
        const data = await response.json();
        console.log('✅ API работает:', data);
        return data;
    } catch (error) {
        console.error('❌ Ошибка соединения:', error.message);
        return { status: 'error', message: error.message };
    }
}

// ============================================
// АВТОРИЗАЦИЯ
// ============================================

export async function register(phone, password, username) {
    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, password, username })
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: 'Ошибка соединения с сервером' };
    }
}

export async function login(phone, password) {
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, password })
        });
        const data = await response.json();
        if (data.success) {
            setToken(data.token);
        }
        return data;
    } catch (error) {
        return { success: false, error: 'Ошибка соединения с сервером' };
    }
}

export async function logout() {
    try {
        const response = await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            headers: getHeaders()
        });
        const data = await response.json();
        localStorage.removeItem('letter_token');
        localStorage.removeItem('current_chat_id');
        return data;
    } catch (error) {
        return { success: false, error: 'Ошибка соединения' };
    }
}

// ============================================
// ПОЛЬЗОВАТЕЛИ
// ============================================

export async function getMyProfile() {
    try {
        const response = await fetch(`${API_BASE}/users/me`, {
            headers: getHeaders()
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: 'Ошибка загрузки профиля' };
    }
}

export async function searchUsers(query) {
    try {
        const response = await fetch(`${API_BASE}/users/search?query=${encodeURIComponent(query)}`, {
            headers: getHeaders()
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: 'Ошибка поиска' };
    }
}

// ============================================
// ЧАТЫ
// ============================================

export async function getChats() {
    try {
        const response = await fetch(`${API_BASE}/chats`, {
            headers: getHeaders()
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: 'Ошибка загрузки чатов' };
    }
}

export async function createChat(participants, type = 'personal', name = null) {
    try {
        const response = await fetch(`${API_BASE}/chats`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ participants, type, name })
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: 'Ошибка создания чата' };
    }
}

// ============================================
// СООБЩЕНИЯ
// ============================================

export async function getMessages(chatId, limit = 50) {
    try {
        const response = await fetch(`${API_BASE}/chats/${chatId}/messages?limit=${limit}`, {
            headers: getHeaders()
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: 'Ошибка загрузки сообщений' };
    }
}

export async function sendMessage(chatId, text, replyTo = null) {
    try {
        const response = await fetch(`${API_BASE}/chats/${chatId}/messages`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ text, replyTo })
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: 'Ошибка отправки сообщения' };
    }
}

export async function markAsRead(chatId, messageIds = null) {
    try {
        const response = await fetch(`${API_BASE}/chats/${chatId}/read`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ messageIds })
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: 'Ошибка' };
    }
}
