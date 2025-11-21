// Theme Toggle Functionality
class ThemeToggle {
    constructor() {
        this.toggle = document.querySelector('.theme-toggle');
        this.body = document.body;
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        
        this.init();
    }
    
    init() {
        // Apply saved theme on load
        this.applyTheme(this.currentTheme);
        
        // Add click event listener
        this.toggle.addEventListener('click', () => {
            this.switchTheme();
        });
        
        // Add keyboard support
        this.toggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.switchTheme();
            }
        });
        
        // Make toggle focusable
        this.toggle.setAttribute('tabindex', '0');
        this.toggle.setAttribute('role', 'switch');
        this.toggle.setAttribute('aria-label', 'Toggle dark/light mode');
    }
    
    switchTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(this.currentTheme);
        
        // Add a subtle feedback animation
        this.toggle.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.toggle.style.transform = 'scale(1)';
        }, 100);
    }
    
    applyTheme(theme) {
        // Update body data attribute
        this.body.setAttribute('data-theme', theme);
        
        // Update toggle state
        if (theme === 'light') {
            this.toggle.classList.add('active');
            this.toggle.setAttribute('aria-checked', 'true');
        } else {
            this.toggle.classList.remove('active');
            this.toggle.setAttribute('aria-checked', 'false');
        }
        
        // Save to localStorage
        localStorage.setItem('theme', theme);
        
        // Update meta theme-color for mobile browsers
        this.updateMetaThemeColor(theme);
    }
    
    updateMetaThemeColor(theme) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        
        metaThemeColor.content = theme === 'dark' ? '#0a0a0a' : '#ffffff';
    }
}

// Smooth loading animation
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme toggle
    new ThemeToggle();
    
    // Add smooth entrance animation
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.style.transform = 'translateY(-100%)';
        navbar.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
        
        setTimeout(() => {
            navbar.style.transform = 'translateY(0)';
        }, 100);
    }
    
    // Add intersection observer for future scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for scroll animations (for future content)
    document.querySelectorAll('.fade-in').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Handle prefers-color-scheme changes
if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', (e) => {
        // Only auto-switch if user hasn't manually set a preference
        if (!localStorage.getItem('theme')) {
            const theme = e.matches ? 'dark' : 'light';
            document.body.setAttribute('data-theme', theme);
        }
    });
}
