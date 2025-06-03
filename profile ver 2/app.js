// PWA and Service Worker
let deferredPrompt;
let isInstalled = false;

// DOM Elements
const notificationToggle = document.getElementById('notifications');
const menuItems = document.querySelectorAll('.menu-item');
const navButtons = document.querySelectorAll('.nav-btn');
const editBtn = document.querySelector('.edit-btn');
const installBanner = document.getElementById('installBanner');
const installBtn = document.getElementById('installBtn');
const closeBanner = document.getElementById('closeBanner');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    checkInstallability();
    registerServiceWorker();
    createModalStructure();
});

function initializeApp() {
    // Add loading animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease-in-out';
        document.body.style.opacity = '1';
    }, 100);
    
    // Load saved preferences
    loadUserPreferences();
    
    console.log('Profile Settings Web App loaded successfully!');
}

// Create modal structure for tabs
function createModalStructure() {
    const modalHTML = `
        <div class="modal-overlay" id="modalOverlay" style="display: none;">
            <div class="modal-container">
                <div class="modal-header">
                    <h2 class="modal-title" id="modalTitle">Help & Support</h2>
                    <button class="modal-close" id="modalClose">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-content" id="modalContent">
                    <!-- Content will be dynamically loaded here -->
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add modal styles
    const modalStyles = `
        <style>
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(10px);
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease-out;
        }
        
        .modal-container {
            background: white;
            border-radius: 20px;
            width: 90%;
            max-width: 800px;
            max-height: 80vh;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.3s ease-out;
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 24px 32px;
            background: linear-gradient(135deg, #4a9b8e, #6bb6a8);
            color: white;
        }
        
        .modal-title {
            font-size: 24px;
            font-weight: 600;
            margin: 0;
        }
        
        .modal-close {
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            padding: 8px;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }
        
        .modal-close:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: scale(1.1);
        }
        
        .modal-content {
            padding: 32px;
            overflow-y: auto;
            max-height: calc(80vh - 100px);
        }
        
        .tab-section {
            margin-bottom: 32px;
        }
        
        .tab-section h3 {
            color: #4a9b8e;
            font-size: 20px;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .tab-section p, .tab-section li {
            color: #666;
            line-height: 1.6;
            margin-bottom: 12px;
        }
        
        .tab-section ul {
            padding-left: 20px;
        }
        
        .contact-item {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 16px;
            background: #f8f9fa;
            border-radius: 12px;
            margin-bottom: 16px;
            transition: all 0.3s ease;
        }
        
        .contact-item:hover {
            background: #e9ecef;
            transform: translateY(-2px);
        }
        
        .contact-icon {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #4a9b8e, #6bb6a8);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 20px;
        }
        
        .contact-info h4 {
            color: #333;
            margin-bottom: 4px;
        }
        
        .contact-info p {
            color: #666;
            margin: 0;
        }
        
        .policy-section {
            margin-bottom: 24px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 12px;
            border-left: 4px solid #4a9b8e;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideUp {
            from { 
                opacity: 0;
                transform: translateY(50px) scale(0.9);
            }
            to { 
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
        
        @media (max-width: 768px) {
            .modal-container {
                width: 95%;
                max-height: 90vh;
            }
            
            .modal-header {
                padding: 20px;
            }
            
            .modal-title {
                font-size: 20px;
            }
            
            .modal-content {
                padding: 20px;
            }
        }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', modalStyles);
    
    // Add event listeners
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('modalOverlay').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
}

// Modal content templates
const modalContents = {
    'help': {
        title: 'Help & Support',
        content: `
            <div class="tab-section">
                <h3><i class="fas fa-question-circle"></i> Frequently Asked Questions</h3>
                <div class="policy-section">
                    <h4>How do I change my profile information?</h4>
                    <p>Click on "Edit profile information" in the settings menu to update your name, email, and phone number.</p>
                </div>
                <div class="policy-section">
                    <h4>How do I enable/disable notifications?</h4>
                    <p>Use the toggle switch next to "Notifications" in the settings menu to turn notifications on or off.</p>
                </div>
                <div class="policy-section">
                    <h4>How do I change the app language?</h4>
                    <p>Click on "Language" in the settings menu and select your preferred language from the available options.</p>
                </div>
                <div class="policy-section">
                    <h4>How do I switch between light and dark mode?</h4>
                    <p>Click on "Theme" in the settings menu to toggle between light mode and dark mode.</p>
                </div>
            </div>
            
            <div class="tab-section">
                <h3><i class="fas fa-tools"></i> Troubleshooting</h3>
                <ul>
                    <li>If the app is running slowly, try refreshing the page</li>
                    <li>Clear your browser cache if you experience display issues</li>
                    <li>Make sure you have a stable internet connection</li>
                    <li>Update your browser to the latest version for best performance</li>
                    <li>Disable browser extensions if you encounter conflicts</li>
                </ul>
            </div>
            
            <div class="tab-section">
                <h3><i class="fas fa-keyboard"></i> Keyboard Shortcuts</h3>
                <ul>
                    <li><strong>Ctrl + 1:</strong> Navigate to Home</li>
                    <li><strong>Ctrl + 2:</strong> Navigate to Statistics</li>
                    <li><strong>Ctrl + 3:</strong> Navigate to Chat</li>
                    <li><strong>Ctrl + 4:</strong> Navigate to Profile</li>
                    <li><strong>Tab:</strong> Navigate through menu items</li>
                </ul>
            </div>
        `
    },
    'contact': {
        title: 'Contact Us',
        content: `
            <div class="tab-section">
                <h3><i class="fas fa-envelope"></i> Get in Touch</h3>
                <p>We'd love to hear from you! Choose the best way to reach us:</p>
            </div>
            
            <div class="contact-item">
                <div class="contact-icon">
                    <i class="fas fa-envelope"></i>
                </div>
                <div class="contact-info">
                    <h4>Email Support</h4>
                    <p>support@profileapp.com</p>
                    <p>Response time: 24-48 hours</p>
                </div>
            </div>
            
            <div class="contact-item">
                <div class="contact-icon">
                    <i class="fas fa-phone"></i>
                </div>
                <div class="contact-info">
                    <h4>Phone Support</h4>
                    <p>+1 (555) 123-4567</p>
                    <p>Mon-Fri, 9 AM - 6 PM EST</p>
                </div>
            </div>
            
            <div class="contact-item">
                <div class="contact-icon">
                    <i class="fas fa-comments"></i>
                </div>
                <div class="contact-info">
                    <h4>Live Chat</h4>
                    <p>Available 24/7</p>
                    <p>Click the chat icon in the bottom navigation</p>
                </div>
            </div>
            
            <div class="contact-item">
                <div class="contact-icon">
                    <i class="fab fa-twitter"></i>
                </div>
                <div class="contact-info">
                    <h4>Social Media</h4>
                    <p>@ProfileApp</p>
                    <p>Follow us for updates and tips</p>
                </div>
            </div>
            
            <div class="tab-section">
                <h3><i class="fas fa-map-marker-alt"></i> Office Location</h3>
                <div class="policy-section">
                    <p><strong>Profile App Headquarters</strong><br>
                    123 Tech Street<br>
                    San Francisco, CA 94105<br>
                    United States</p>
                </div>
            </div>
        `
    },
    'privacy': {
        title: 'Privacy Policy',
        content: `
            <div class="tab-section">
                <h3><i class="fas fa-shield-alt"></i> Privacy Policy</h3>
                <p><em>Last updated: ${new Date().toLocaleDateString()}</em></p>
            </div>
            
            <div class="policy-section">
                <h4>1. Information We Collect</h4>
                <p>We collect information you provide directly to us, such as when you create an account, update your profile, or contact us for support.</p>
                <ul>
                    <li>Personal information (name, email, phone number)</li>
                    <li>Profile preferences and settings</li>
                    <li>Usage data and analytics</li>
                    <li>Device information and browser data</li>
                </ul>
            </div>
            
            <div class="policy-section">
                <h4>2. How We Use Your Information</h4>
                <p>We use the information we collect to:</p>
                <ul>
                    <li>Provide and maintain our services</li>
                    <li>Personalize your experience</li>
                    <li>Send you notifications and updates</li>
                    <li>Improve our app and services</li>
                    <li>Respond to your support requests</li>
                </ul>
            </div>
            
            <div class="policy-section">
                <h4>3. Information Sharing</h4>
                <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>
            </div>
            
            <div class="policy-section">
                <h4>4. Data Security</h4>
                <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
            </div>
            
            <div class="policy-section">
                <h4>5. Your Rights</h4>
                <p>You have the right to:</p>
                <ul>
                    <li>Access your personal data</li>
                    <li>Correct inaccurate information</li>
                    <li>Delete your account and data</li>
                    <li>Opt-out of communications</li>
                    <li>Data portability</li>
                </ul>
            </div>
            
            <div class="policy-section">
                <h4>6. Cookies and Tracking</h4>
                <p>We use cookies and similar technologies to enhance your experience, analyze usage patterns, and provide personalized content.</p>
            </div>
            
            <div class="policy-section">
                <h4>7. Contact Information</h4>
                <p>If you have questions about this Privacy Policy, please contact us at:</p>
                <p><strong>Email:</strong> privacy@profileapp.com<br>
                <strong>Address:</strong> 123 Tech Street, San Francisco, CA 94105</p>
            </div>
        `
    }
};

// Show modal function
function showModal(type) {
    const modal = document.getElementById('modalOverlay');
    const title = document.getElementById('modalTitle');
    const content = document.getElementById('modalContent');
    
    if (modalContents[type]) {
        title.textContent = modalContents[type].title;
        content.innerHTML = modalContents[type].content;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

// Close modal function
function closeModal() {
    const modal = document.getElementById('modalOverlay');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// PWA Installation
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallBanner();
});

function showInstallBanner() {
    if (!isInstalled && deferredPrompt) {
        installBanner.style.display = 'block';
        installBanner.style.animation = 'slideDown 0.3s ease-out';
    }
}

if (installBtn) {
    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('User accepted the install prompt');
                hideInstallBanner();
                showNotification('App installed successfully!');
            } else {
                showNotification('Installation cancelled');
            }
            
            deferredPrompt = null;
        }
    });
}

if (closeBanner) {
    closeBanner.addEventListener('click', hideInstallBanner);
}

function hideInstallBanner() {
    if (installBanner) {
        installBanner.style.animation = 'slideDown 0.3s ease-out reverse';
        setTimeout(() => {
            installBanner.style.display = 'none';
        }, 300);
    }
}

function checkInstallability() {
    if (window.matchMedia('(display-mode: standalone)').matches) {
        isInstalled = true;
        hideInstallBanner();
        console.log('App is running in standalone mode');
    }
}

// Service Worker Registration
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const swCode = `
                const CACHE_NAME = 'profile-app-v1.3';
                const urlsToCache = [
                    '/',
                    '/index.html',
                    '/style.css',
                    '/app.js',
                    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
                ];

                self.addEventListener('install', event => {
                    event.waitUntil(
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                console.log('Caching app shell');
                                return cache.addAll(urlsToCache);
                            })
                    );
                });

                self.addEventListener('fetch', event => {
                    event.respondWith(
                        caches.match(event.request)
                            .then(response => {
                                if (response) {
                                    return response;
                                }
                                return fetch(event.request);
                            })
                    );
                });

                self.addEventListener('activate', event => {
                    event.waitUntil(
                        caches.keys().then(cacheNames => {
                            return Promise.all(
                                cacheNames.map(cacheName => {
                                    if (cacheName !== CACHE_NAME) {
                                        console.log('Deleting old cache:', cacheName);
                                        return caches.delete(cacheName);
                                    }
                                })
                            );
                        })
                    );
                });
            `;
            
            const blob = new Blob([swCode], { type: 'application/javascript' });
            const swUrl = URL.createObjectURL(blob);
            
            const registration = await navigator.serviceWorker.register(swUrl);
            console.log('Service Worker registered successfully:', registration);
        } catch (error) {
            console.log('Service Worker registration failed:', error);
        }
    }
}

// Notification toggle functionality
if (notificationToggle) {
    notificationToggle.addEventListener('change', function() {
        const toggleText = this.nextElementSibling.querySelector('.toggle-text');
        if (this.checked) {
            toggleText.textContent = 'ON';
            savePreference('notifications', true);
            console.log('Notifications enabled');
            showNotification('Notifications enabled');
            
            if ('Notification' in window && Notification.permission === 'default') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        showNotification('Notification permission granted');
                    }
                });
            }
        } else {
            toggleText.textContent = 'OFF';
            savePreference('notifications', false);
            console.log('Notifications disabled');
            showNotification('Notifications disabled');
        }
    });
}

// Menu item click handlers
menuItems.forEach(item => {
    item.addEventListener('click', function() {
        const menuText = this.querySelector('.menu-text').textContent;
        
        // Add click animation
        this.style.transform = 'scale(0.98)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);
        
        // Handle different menu actions
        switch(menuText) {
            case 'Edit profile information':
                handleEditProfile();
                break;
            case 'Language':
                handleLanguageChange();
                break;
            case 'Security':
                handleSecurity();
                break;
            case 'Theme':
                handleThemeChange();
                break;
            case 'Help & Support':
                showModal('help');
                break;
            case 'Contact us':
                showModal('contact');
                break;
            case 'Privacy policy':
                showModal('privacy');
                break;
            default:
                console.log(`Clicked: ${menuText}`);
        }
    });
});

// Navigation button handlers
navButtons.forEach(button => {
    button.addEventListener('click', function() {
        navButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.style.animation = '';
        });
        
        this.classList.add('active');
        this.style.animation = 'pulse 2s infinite';
        
        const page = this.getAttribute('data-page');
        navigateToPage(page);
    });
});

function navigateToPage(page) {
    savePreference('currentPage', page);
    
    switch(page) {
        case 'chat':
            console.log('Navigate to Chat');
            showNotification('💬 Chat feature coming soon!');
            break;
        case 'statistics':
            console.log('Navigate to Statistics');
            showNotification('📊 Statistics feature coming soon!');
            break;
        case 'home':
            console.log('Navigate to Home');
            showNotification('🏠 Home feature coming soon!');
            break;
        case 'profile':
            console.log('Navigate to Profile');
            showNotification('👤 You are on Profile page');
            break;
        default:
            console.log(`Navigate to ${page}`);
    }
}

// Edit profile button handler
if (editBtn) {
    editBtn.addEventListener('click', function() {
        this.style.transform = 'scale(0.9) rotate(180deg)';
        setTimeout(() => {
            this.style.transform = 'scale(1) rotate(0deg)';
        }, 200);
        
        handleEditProfile();
    });
}

// Menu action handlers
function handleEditProfile() {
    showNotification('✏️ Edit Profile functionality would open here');
    console.log('Opening edit profile modal...');
}

function handleLanguageChange() {
    const languages = ['English', 'Español', 'Français', 'Deutsch', '中文', '日本語', '한국어'];
    const currentLang = document.querySelector('.menu-item:nth-child(3) .menu-value');
    if (currentLang) {
        const currentIndex = languages.indexOf(currentLang.textContent);
        const nextIndex = (currentIndex + 1) % languages.length;
        
        currentLang.textContent = languages[nextIndex];
        savePreference('language', languages[nextIndex]);
        showNotification(`🌐 Language changed to ${languages[nextIndex]}`);
        console.log(`Language changed to: ${languages[nextIndex]}`);
    }
}

function handleSecurity() {
    showNotification('🔒 Security settings would open here');
    console.log('Opening security settings...');
}

function handleThemeChange() {
    const themeValue = document.querySelector('.menu-item:nth-child(2) .menu-value');
    if (themeValue) {
        const currentTheme = themeValue.textContent;
        
        if (currentTheme === 'Light mode') {
            themeValue.textContent = 'Dark mode';
            savePreference('theme', 'dark');
            showNotification('🌙 Switched to dark mode');
            console.log('Switched to dark mode');
            document.body.classList.add('dark-theme');
        } else {
            themeValue.textContent = 'Light mode';
            savePreference('theme', 'light');
            showNotification('☀️ Switched to light mode');
            console.log('Switched to light mode');
            document.body.classList.remove('dark-theme');
        }
    }
}

// Local Storage for preferences
function savePreference(key, value) {
    try {
        localStorage.setItem(`profileApp_${key}`, JSON.stringify(value));
        console.log(`Saved preference: ${key} = ${value}`);
    } catch (error) {
        console.error('Error saving preference:', error);
    }
}

function loadPreference(key, defaultValue = null) {
    try {
        const saved = localStorage.getItem(`profileApp_${key}`);
        return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
        console.error('Error loading preference:', error);
        return defaultValue;
    }
}

function loadUserPreferences() {
    const notificationsEnabled = loadPreference('notifications', true);
    if (notificationToggle) {
        notificationToggle.checked = notificationsEnabled;
        const toggleText = notificationToggle.nextElementSibling.querySelector('.toggle-text');
        if (toggleText) {
            toggleText.textContent = notificationsEnabled ? 'ON' : 'OFF';
        }
    }
    
    const savedLanguage = loadPreference('language', 'English');
    const languageValue = document.querySelector('.menu-item:nth-child(3) .menu-value');
    if (languageValue) languageValue.textContent = savedLanguage;
    
    const savedTheme = loadPreference('theme', 'Light mode');
    const themeValue = document.querySelector('.menu-item:nth-child(2) .menu-value');
    if (themeValue) {
        themeValue.textContent = savedTheme;
        if (savedTheme === 'Dark mode') {
            document.body.classList.add('dark-theme');
        }
    }
    
    const currentPage = loadPreference('currentPage', 'profile');
    navButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.style.animation = '';
        if (btn.getAttribute('data-page') === currentPage) {
            btn.classList.add('active');
            btn.style.animation = 'pulse 2s infinite';
        }
    });
    
    console.log('User preferences loaded successfully');
}

// Enhanced notification system
function showNotification(message) {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 3000);
}

// Handle window resize for responsive design
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        console.log('Desktop view active');
    } else {
        console.log('Mobile view active');
    }
});

// Add enhanced touch feedback for mobile devices
if ('ontouchstart' in window) {
    menuItems.forEach(item => {
        item.addEventListener('touchstart', function() {
            this.style.backgroundColor = '#f0f0f0';
            this.style.transform = 'scale(0.98)';
        });
        
        item.addEventListener('touchend', function() {
            setTimeout(() => {
                this.style.backgroundColor = '';
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
    
    navButtons.forEach(btn => {
        btn.addEventListener('touchstart', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = 'scale(0.95)';
            }
        });
        
        btn.addEventListener('touchend', function() {
            setTimeout(() => {
                if (!this.classList.contains('active')) {
                    this.style.transform = 'scale(1)';
                }
            }, 150);
        });
    });
}

// Handle online/offline status
window.addEventListener('online', () => {
    showNotification('🌐 Back online!');
    console.log('App is online');
});

window.addEventListener('offline', () => {
    showNotification('📱 You are offline - App cached for offline use');
    console.log('App is offline');
});

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
    }
    
    // Close modal with Escape key
    if (e.key === 'Escape') {
        closeModal();
    }
    
    // Add keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case '1':
                e.preventDefault();
                document.querySelector('[data-page="home"]').click();
                break;
            case '2':
                e.preventDefault();
                document.querySelector('[data-page="statistics"]').click();
                break;
            case '3':
                e.preventDefault();
                document.querySelector('[data-page="chat"]').click();
                break;
            case '4':
                e.preventDefault();
                document.querySelector('[data-page="profile"]').click();
                break;
        }
    }
});

document.addEventListener('mousedown', function() {
    document.body.classList.remove('keyboard-navigation');
});

// Performance monitoring
window.addEventListener('load', function() {
    const loadTime = performance.now();
    console.log(`App loaded in ${Math.round(loadTime)}ms`);
    
    if (loadTime > 3000) {
        console.warn('App took longer than expected to load');
    }
});

// Add haptic feedback for supported devices
function triggerHapticFeedback() {
    if ('vibrate' in navigator) {
        navigator.vibrate(50);
    }
}

// Add haptic feedback to navigation buttons
navButtons.forEach(btn => {
    btn.addEventListener('click', triggerHapticFeedback);
});

// Add haptic feedback to toggle
if (notificationToggle) {
    notificationToggle.addEventListener('change', triggerHapticFeedback);
}

// Initialize app state
console.log('Profile Settings Web App initialized with enhanced features and modal tabs');