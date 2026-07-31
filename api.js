// api.js - Клиент для работы с API

const API_BASE = 'http://127.0.0.1:8080/api';

function getToken() {
    return localStorage.getItem('letter_token');
}

function getHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
    };
}

// ============================================
// ПРОВЕРКА
// ============================================

export async function checkConnection() {
    try {
        const response = await fetch(`${API_BASE}/health`);
        return await response.json();
    } catch (error) {
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
        return { success: false, error: 'Ошибка соединения' };
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
            localStorage.setItem('letter_token', data.token);
        }
        return data;
    } catch (error) {
        return { success: false, error: 'Ошибка соединения' };
    }
}

export async function logout() {
    try {
        await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            headers: getHeaders()
        });
    } catch (e) {}
    localStorage.removeItem('letter_token');
    localStorage.removeItem('current_chat_id');
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
        return { success: false, error: 'Ошибка' };
    }
}

export async function searchUsers(query) {
    try {
        const response = await fetch(`${API_BASE}/users/search?query=${encodeURIComponent(query)}`, {
            headers: getHeaders()
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: 'Ошибка' };
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
        return { success: false, error: 'Ошибка' };
    }
}

export async function createChat(participants, type = 'personal') {
    try {
        const response = await fetch(`${API_BASE}/chats`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ participants, type })
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: 'Ошибка' };
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
        return { success: false, error: 'Ошибка' };
    }
}

export async function sendMessage(chatId, text) {
    try {
        const response = await fetch(`${API_BASE}/chats/${chatId}/messages`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ text })
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: 'Ошибка' };
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
