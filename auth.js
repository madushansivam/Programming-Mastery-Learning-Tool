// Modified auth.js to handle extended user registration fields

/**
 * Authentication module for the Programming Mastery Learning Tool
 * Handles user registration, login, and session management
 */

// Check if user is logged in
function isLoggedIn() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return false;
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    return users.some(user => user.id === currentUser);
}

// Get current user data
function getCurrentUser() {
    const currentUserId = localStorage.getItem('currentUser');
    if (!currentUserId) return null;
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    return users.find(user => user.id === currentUserId) || null;
}

// Register new user with extended fields
function registerUser(userData) {
    // Get existing users
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Check if username already exists
    if (users.some(user => user.username.toLowerCase() === userData.username.toLowerCase())) {
        return { success: false, message: 'Username already exists! Please choose another.' };
    }
    
    // Create new user object with extended fields
    const newUser = {
        id: generateID(),
        fullName: userData.fullName || userData.name,
        nameWithInitials: userData.nameWithInitials || '',
        indexNumber: userData.indexNumber || '',
        batch: userData.batch || '',
        classYear: userData.classYear,
        name: userData.fullName || userData.name, // For compatibility
        username: userData.username,
        password: userData.password, // In a real app, this would be hashed
        progress: {},
        notes: [],
        streak: 0,
        lastLogin: Date.now(),
        feedbacks: [],
        completedTutorials: [],
        savedCode: []
    };
    
    // Add to users array and save
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Set as current user
    localStorage.setItem('currentUser', newUser.id);
    
    return { success: true, message: 'Registration successful!' };
}

// Login user
function loginUser(username, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Find user by username and password
    const user = users.find(user => 
        user.username.toLowerCase() === username.toLowerCase() && 
        user.password === password
    );
    
    if (!user) {
        return { success: false, message: 'Invalid username or password!' };
    }
    
    // Update last login and streak
    const today = new Date().setHours(0, 0, 0, 0);
    const lastLogin = new Date(user.lastLogin).setHours(0, 0, 0, 0);
    const daysSinceLastLogin = Math.round((today - lastLogin) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastLogin === 1) {
        user.streak += 1;
    } else if (daysSinceLastLogin > 1) {
        user.streak = 1;
    }
    
    user.lastLogin = Date.now();
    
    // Update user data
    const userIndex = users.findIndex(u => u.id === user.id);
    users[userIndex] = user;
    localStorage.setItem('users', JSON.stringify(users));
    
    // Set current user
    localStorage.setItem('currentUser', user.id);
    
    return { success: true, message: 'Login successful!' };
}

// Logout user
function logoutUser() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Initialize common auth elements on pages
function initializeAuthElements() {
    if (!isLoggedIn() && window.location.pathname !== '/index.html' && !window.location.pathname.endsWith('index.html')) {
        // Redirect to login page if not logged in
        window.location.href = 'index.html';
        return;
    }
    
    // Set up logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutUser);
    }
    
    // Display username in header
    const usernameDisplay = document.getElementById('username-display');
    if (usernameDisplay) {
        const user = getCurrentUser();
        if (user) {
            usernameDisplay.textContent = user.username;
        }
    }
}

// Setup login/register form handling
function setupAuthForms() {
    // If already logged in, redirect to dashboard
    if (isLoggedIn()) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Get form elements
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    // Tab switching
    if (loginTab && registerTab) {
        loginTab.addEventListener('click', () => {
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
        });
        
        registerTab.addEventListener('click', () => {
            registerTab.classList.add('active');
            loginTab.classList.remove('active');
            registerForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
        });
    }
    
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            
            const result = loginUser(username, password);
            
            if (result.success) {
                showMessage('login-message', result.message, 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                showMessage('login-message', result.message, 'error');
            }
        });
    }
    
    // Register form submission (simple version - extended in index.html)
    if (registerForm && !document.getElementById('register-fullname')) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('register-name').value;
            const username = document.getElementById('register-username').value;
            const classYear = document.getElementById('register-class').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            
            // Validate passwords match
            if (password !== confirmPassword) {
                showMessage('register-message', 'Passwords do not match!', 'error');
                return;
            }
            
            const result = registerUser({
                name: name,
                username: username,
                classYear: classYear,
                password: password
            });
            
            if (result.success) {
                showMessage('register-message', result.message, 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                showMessage('register-message', result.message, 'error');
            }
        });
    }
}

// Initialize auth based on current page
document.addEventListener('DOMContentLoaded', () => {
    const isIndexPage = window.location.pathname.includes('index.html') || 
                     window.location.pathname === '/' || 
                     window.location.pathname === '';
    
    if (isIndexPage) {
        setupAuthForms();
    } else {
        initializeAuthElements();
    }
});