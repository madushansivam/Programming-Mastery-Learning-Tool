/**
 * Utility functions for the Programming Mastery Learning Tool
 */

// Format date to readable string
function formatDate(date) {
    if (!date) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
}

// Generate a unique ID
function generateID() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

// Show a message with type (success or error)
function showMessage(elementId, message, type = 'success') {
    const messageElement = document.getElementById(elementId);
    if (!messageElement) return;
    
    messageElement.textContent = message;
    messageElement.className = 'message ' + type;
    
    // Clear the message after 4 seconds
    setTimeout(() => {
        messageElement.textContent = '';
        messageElement.className = 'message';
    }, 4000);
}

// Update progress circle based on percentage
function updateProgressCircle(elementId, percentage) {
    const circle = document.getElementById(elementId);
    if (!circle) return;
    
    circle.style.background = `conic-gradient(var(--primary) ${percentage}%, var(--gray-light) ${percentage}%)`;
}

// Get query parameters from URL
function getQueryParams() {
    const params = {};
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    
    urlParams.forEach((value, key) => {
        params[key] = value;
    });
    
    return params;
}

// Save data to localStorage with error handling
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}

// Get data from localStorage with error handling
function getFromLocalStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return defaultValue;
    }
}

// Calculate percentage
function calculatePercentage(part, total) {
    if (total === 0) return 0;
    return Math.round((part / total) * 100);
}

// Track user activity for streak calculation
function trackUserActivity() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;
    
    const users = getFromLocalStorage('users', []);
    const userIndex = users.findIndex(user => user.id === currentUser);
    
    if (userIndex === -1) return;
    
    const today = new Date().setHours(0, 0, 0, 0);
    const lastLogin = new Date(users[userIndex].lastLogin).setHours(0, 0, 0, 0);
    const daysSinceLastLogin = Math.round((today - lastLogin) / (1000 * 60 * 60 * 24));
    
    // Update streak
    if (daysSinceLastLogin === 1) {
        users[userIndex].streak += 1;
    } else if (daysSinceLastLogin > 1) {
        users[userIndex].streak = 1;
    }
    
    users[userIndex].lastLogin = Date.now();
    
    // Save updated user data
    saveToLocalStorage('users', users);
}

// Initialize common page elements
function initCommonElements() {
    // Add font awesome if needed
    if (!document.querySelector('link[href*="fontawesome"]') && !document.querySelector('script[src*="fontawesome"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
        document.head.appendChild(link);
    }
    
    // Track user activity
    trackUserActivity();
}