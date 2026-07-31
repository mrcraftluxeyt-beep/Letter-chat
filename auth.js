// auth.js - Логика авторизации

import { login, register, checkConnection } from './api.js';

document.addEventListener('DOMContentLoaded', function() {
    // ============================================
    // ЭЛЕМЕНТЫ
    // ============================================
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const messageEl = document.getElementById('auth-message');
    const loginPhone = document.getElementById('login-phone');
    const loginPassword = document.getElementById('login-password');
    const registerPhone = document.getElementById('register-phone');
    const registerUsername = document.getElementById('register-username');
    const registerPassword = document.getElementById('register-password');
    const registerPasswordConfirm = document.getElementById('register-password-confirm');

    // ============================================
    // ПРОВЕРКА ПОДКЛЮЧЕНИЯ
    // ============================================
    async function checkAPI() {
        const result = await checkConnection();
        if (result.status !== 'ok') {
            showMessage('❌ Сервер не отвечает. Запустите app.py', 'error');
            return false;
        }
        return true;
    }

    // ============================================
    // СООБЩЕНИЯ
    // ============================================
    function showMessage(text, type = 'error') {
        messageEl.textContent = text;
        messageEl.className = `auth-message ${type}`;
        messageEl.style.display = 'block';
        
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 5000);
    }

    // ============================================
    // ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
    // ============================================
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
            
            this.classList.add('active');
            const panelId = `panel-${this.dataset.tab}`;
            document.getElementById(panelId).classList.add('active');
            
            messageEl.style.display = 'none';
        });
    });

    // ============================================
    // ПОКАЗ/СКРЫТИЕ ПАРОЛЯ
    // ============================================
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', function() {
            const target = document.getElementById(this.dataset.target);
            if (target.type === 'password') {
                target.type = 'text';
                this.textContent = '🙈';
            } else {
                target.type = 'password';
                this.textContent = '👁️';
            }
        });
    });

    // ============================================
    // ЛОГИН
    // ============================================
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const phone = loginPhone.value.trim();
        const password = loginPassword.value;
        
        if (!phone || !password) {
            showMessage('Заполните все поля', 'error');
            return;
        }

        loginBtn.disabled = true;
        loginBtn.textContent = '⏳ Вход...';
        
        const result = await login(phone, password);
        
        loginBtn.disabled = false;
        loginBtn.textContent = 'Войти';
        
        if (result.success) {
            showMessage('✅ Вход выполнен!', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 500);
        } else {
            showMessage(result.error || 'Ошибка входа', 'error');
        }
    });

    // ============================================
    // РЕГИСТРАЦИЯ
    // ============================================
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const phone = registerPhone.value.trim();
        const username = registerUsername.value.trim() || phone;
        const password = registerPassword.value;
        const confirm = registerPasswordConfirm.value;
        
        if (!phone || !password) {
            showMessage('Заполните все поля', 'error');
            return;
        }
        
        if (password.length < 6) {
            showMessage('Пароль должен быть минимум 6 символов', 'error');
            return;
        }
        
        if (password !== confirm) {
            showMessage('Пароли не совпадают', 'error');
            return;
        }

        registerBtn.disabled = true;
        registerBtn.textContent = '⏳ Создание...';
        
        const result = await register(phone, password, username);
        
        registerBtn.disabled = false;
        registerBtn.textContent = 'Создать аккаунт';
        
        if (result.success) {
            showMessage('✅ Аккаунт создан! Войдите в систему', 'success');
            document.querySelector('[data-tab="login"]').click();
            loginPhone.value = phone;
            loginPassword.value = '';
        } else {
            showMessage(result.error || 'Ошибка регистрации', 'error');
        }
    });

    // ============================================
    // ПРОВЕРКА ТОКЕНА
    // ============================================
    const token = localStorage.getItem('letter_token');
    if (token) {
        window.location.href = 'dashboard.html';
    }

    // Проверка API
    checkAPI();

    // ============================================
    // ENTER ДЛЯ ФОРМ
    // ============================================
    loginPhone.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') loginForm.dispatchEvent(new Event('submit'));
    });
    
    loginPassword.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') loginForm.dispatchEvent(new Event('submit'));
    });

    registerPhone.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') registerForm.dispatchEvent(new Event('submit'));
    });
});