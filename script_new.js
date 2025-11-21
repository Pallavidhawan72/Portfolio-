class ThemeToggle {
    constructor() {
        this.themeToggle = document.querySelector('.theme-toggle');
        this.body = document.body;
        this.logoLink = document.querySelector('.nav-brand a');
        this.init();
        this.initCustomCursor();
    }

    initCustomCursor() {
        // Create custom cursor elements
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        const cursorDot = document.createElement('div');
        cursorDot.className = 'custom-cursor-dot';
        
        document.body.appendChild(cursor);
        document.body.appendChild(cursorDot);
        
        this.cursor = cursor;
        this.cursorDot = cursorDot;
        // logical mouse position (updated on mousemove)
        this.mouseX = window.innerWidth / 2;
        this.mouseY = window.innerHeight / 2;
        // desired cursor position (may be adjusted by magnetic effect)
        this.cursorX = window.innerWidth / 2;
        this.cursorY = window.innerHeight / 2;
        // rendered cursor position (used for lerp smoothing)
        this.cursorRenderX = window.innerWidth / 2;
        this.cursorRenderY = window.innerHeight / 2;
        // last trail timestamp for throttling
        this.lastTrailTime = 0;
        
        // Set initial cursor position to center
        this.cursor.style.left = '0px';
        this.cursor.style.top = '0px';
        this.cursor.style.transform = `translate3d(${this.cursorX}px, ${this.cursorY}px, 0) translate(-50%, -50%)`;
        this.cursorDot.style.left = '0px';
        this.cursorDot.style.top = '0px';
        this.cursorDot.style.transform = `translate3d(${this.mouseX}px, ${this.mouseY}px, 0) translate(-50%, -50%)`;
        
        // Mouse move event with magnetic attraction
        // Use transform updates (translate3d) to keep updates on the compositor
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;

            // Check for magnetic elements and set target cursorX/Y
            const magneticElement = this.findMagneticElement(e.target);
            if (magneticElement) {
                this.applyMagneticEffect(magneticElement, e);
            } else {
                this.cursorX = this.mouseX;
                this.cursorY = this.mouseY;
                this.cursor.classList.remove('magnetic');
            }

            // update small dot immediately via transform (will be snapped to pointer)
            this.cursorDot.style.transform = `translate3d(${this.mouseX}px, ${this.mouseY}px, 0) translate(-50%, -50%)`;
        }, { passive: true });
        
        // Smooth cursor following animation
        this.animateCursor();
        
        // Enhanced hover effects
        this.setupHoverEffects();
        
        // Enhanced click effects
        this.setupClickEffects();
        
        // Window events
        this.setupWindowEvents();
    }

    findMagneticElement(element) {
        const magneticSelectors = ['.project-card', '.nav-brand a', '.theme-toggle', 'button'];
        
        for (let selector of magneticSelectors) {
            const magneticElement = element.closest(selector);
            if (magneticElement) return magneticElement;
        }
        return null;
    }

    applyMagneticEffect(element, event) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const distanceX = event.clientX - centerX;
        const distanceY = event.clientY - centerY;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
        
        const maxDistance = 80;
        
        if (distance < maxDistance) {
            // Smooth easing function for magnetic strength
            const magneticStrength = Math.pow(1 - distance / maxDistance, 2);
            
            // Smooth pull with cubic easing
            const pullStrength = 0.25;
            const pullX = -distanceX * magneticStrength * pullStrength;
            const pullY = -distanceY * magneticStrength * pullStrength;
            
            this.cursorX = event.clientX + pullX;
            this.cursorY = event.clientY + pullY;
            this.cursor.classList.add('magnetic');
        } else {
            this.cursorX = event.clientX;
            this.cursorY = event.clientY;
            this.cursor.classList.remove('magnetic');
        }
    }

    createTrail() {
        // Disabled trail to improve performance
        return;
    }

    animateCursor() {
        // Smooth following using lerp with optimized easing
        const easing = 0.2; // Balanced for smooth following
        
        // Calculate distance to target for adaptive easing
        const distanceX = this.cursorX - this.cursorRenderX;
        const distanceY = this.cursorY - this.cursorRenderY;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
        
        // Adaptive easing: faster when far, smoother when close
        const adaptiveEasing = distance > 100 ? easing * 1.5 : easing;

        // Lerp rendered pos towards target with adaptive easing
        this.cursorRenderX += distanceX * adaptiveEasing;
        this.cursorRenderY += distanceY * adaptiveEasing;

        // Apply transform with GPU acceleration
        this.cursor.style.transform = `translate3d(${this.cursorRenderX}px, ${this.cursorRenderY}px, 0) translate(-50%, -50%)`;

        requestAnimationFrame(() => this.animateCursor());
    }

    setupHoverEffects() {
        // Project cards
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach(element => {
            element.addEventListener('mouseenter', () => {
                this.cursor.className = 'custom-cursor project-hover';
            });
            element.addEventListener('mouseleave', () => {
                this.cursor.className = 'custom-cursor';
            });
        });
        
        // Logo
        const logoElement = document.querySelector('.nav-brand a');
        if (logoElement) {
            logoElement.addEventListener('mouseenter', () => {
                this.cursor.className = 'custom-cursor logo-hover';
            });
            logoElement.addEventListener('mouseleave', () => {
                this.cursor.className = 'custom-cursor';
            });
        }
        
        // Buttons and theme toggle
        const buttons = document.querySelectorAll('button, .theme-toggle');
        buttons.forEach(element => {
            element.addEventListener('mouseenter', () => {
                this.cursor.className = 'custom-cursor button-hover';
            });
            element.addEventListener('mouseleave', () => {
                this.cursor.className = 'custom-cursor';
            });
        });
        
        // Text elements and other links
        const textElements = document.querySelectorAll('a:not(.nav-brand a), p, h1, h2, h3');
        textElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                if (!this.cursor.classList.contains('project-hover') && 
                    !this.cursor.classList.contains('logo-hover') && 
                    !this.cursor.classList.contains('button-hover')) {
                    this.cursor.classList.add('text-hover');
                }
            });
            element.addEventListener('mouseleave', () => {
                this.cursor.classList.remove('text-hover');
            });
        });
    }

    setupClickEffects() {
        document.addEventListener('mousedown', () => {
            this.cursor.classList.add('click');
        });
        
        document.addEventListener('mouseup', () => {
            this.cursor.classList.remove('click');
        });
    }

    setupWindowEvents() {
        // Hide cursor when leaving window
        document.addEventListener('mouseleave', () => {
            this.cursor.style.opacity = '0';
            this.cursorDot.style.opacity = '0';
        });
        
        document.addEventListener('mouseenter', () => {
            this.cursor.style.opacity = '1';
            this.cursorDot.style.opacity = '1';
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            // Reset cursor position
            this.cursorX = this.mouseX;
            this.cursorY = this.mouseY;
        });
    }

    init() {
        // Load saved theme or default to dark
        const savedTheme = localStorage.getItem('theme') || 'dark';
        this.setTheme(savedTheme);
        
        // Add event listener
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
            
            // Add keyboard support
            this.themeToggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleTheme();
                }
            });
        }
        
        // Initialize animations
        this.initAnimations();
        
        // Initialize logo animation
        this.initLogoAnimation();
    }

    initLogoAnimation() {
        if (this.logoLink) {
            this.logoLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.createParticleExplosion(e);
                
                // Navigate after animation
                setTimeout(() => {
                    if (this.logoLink.href) {
                        window.location.href = this.logoLink.href;
                    }
                }, 600);
            });
        }
    }

    createParticleExplosion(event) {
        const rect = this.logoLink.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Create particles
        for (let i = 0; i < 12; i++) {
            this.createParticle(centerX, centerY, i);
        }
    }

    createParticle(centerX, centerY, index) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: var(--text-primary);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            left: ${centerX}px;
            top: ${centerY}px;
        `;
        
        document.body.appendChild(particle);
        
        // Animate particle
        const angle = (index / 12) * Math.PI * 2;
        const distance = 100 + Math.random() * 50;
        const duration = 600 + Math.random() * 200;
        
        const endX = centerX + Math.cos(angle) * distance;
        const endY = centerY + Math.sin(angle) * distance;
        
        particle.animate([
            {
                transform: `translate(0, 0) scale(1)`,
                opacity: 1
            },
            {
                transform: `translate(${endX - centerX}px, ${endY - centerY}px) scale(0)`,
                opacity: 0
            }
        ], {
            duration: duration,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }).addEventListener('finish', () => {
            document.body.removeChild(particle);
        });
    }

    setTheme(theme) {
        if (theme === 'light') {
            this.body.setAttribute('data-theme', 'light');
            this.themeToggle.classList.add('active');
            this.themeToggle.setAttribute('aria-checked', 'true');
        } else {
            this.body.setAttribute('data-theme', 'dark');
            this.themeToggle.classList.remove('active');
            this.themeToggle.setAttribute('aria-checked', 'false');
        }
        localStorage.setItem('theme', theme);
        
        // Update cursor colors for the new theme
        this.updateCursorTheme(theme);
    }

    updateCursorTheme(theme) {
        // Force cursor color update based on theme
        if (this.cursor && this.cursorDot) {
            if (theme === 'light') {
                this.cursor.style.background = 'rgba(0, 0, 0, 0.8)';
                this.cursorDot.style.background = 'rgba(0, 0, 0, 0.9)';
            } else {
                this.cursor.style.background = 'rgba(255, 255, 255, 0.8)';
                this.cursorDot.style.background = 'rgba(255, 255, 255, 0.9)';
            }
        }
    }

    toggleTheme() {
        const currentTheme = this.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        
        // Add click animation
        this.animateToggle();
    }

    animateToggle() {
        this.themeToggle.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.themeToggle.style.transform = 'scale(1)';
        }, 150);
    }

    initAnimations() {
        // Fade in animation for page load
        document.addEventListener('DOMContentLoaded', () => {
            document.body.style.opacity = '0';
            document.body.style.transition = 'opacity 0.5s ease';
            
            setTimeout(() => {
                document.body.style.opacity = '1';
            }, 100);
        });

        // Stagger animation for title words
        this.animateTitleWords();
        
        // Animate cards on scroll
        this.initScrollAnimations();
    }

    animateTitleWords() {
        const titleWords = document.querySelectorAll('.title-word');
        titleWords.forEach((word, index) => {
            word.style.opacity = '0';
            word.style.transform = 'translateY(20px)';
            word.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            
            setTimeout(() => {
                word.style.opacity = '1';
                word.style.transform = 'translateY(0)';
            }, 200 + (index * 100));
        });
    }

    initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Animate project cards
        const cards = document.querySelectorAll('.project-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = `all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${index * 0.1}s`;
            observer.observe(card);
        });

        // Animate social icons
        const socialIcons = document.querySelectorAll('.social-icon');
        socialIcons.forEach((icon, index) => {
            icon.style.opacity = '0';
            icon.style.transform = 'scale(0.8)';
            icon.style.transition = `all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${1000 + (index * 100)}ms`;
            
            setTimeout(() => {
                icon.style.opacity = '1';
                icon.style.transform = 'scale(1)';
            }, 1000 + (index * 100));
        });
        
        // Initialize timeline scroll animation
        this.initTimelineAnimation();
    }
    
    initTimelineAnimation() {
        const timeline = document.querySelector('.timeline');
        if (!timeline) {
            console.log('Timeline not found');
            return;
        }
        
        console.log('Timeline animation initialized');
        
        // Create animated ball element
        const ball = document.createElement('div');
        ball.className = 'timeline-ball';
        ball.style.opacity = '1';
        ball.style.position = 'absolute';
        ball.style.left = '50%';
        ball.style.zIndex = '999';
        timeline.appendChild(ball);
        
        console.log('Ball element created');
        
        // Function to update timeline progress
        const updateTimelineProgress = () => {
            const timelineRect = timeline.getBoundingClientRect();
            const scrollTop = window.pageYOffset || window.scrollY || document.documentElement.scrollTop;
            const windowHeight = window.innerHeight;
            
            // Get timeline position
            const timelineTop = timeline.offsetTop;
            const timelineHeight = timeline.offsetHeight;
            
            // Calculate how far through the timeline we are
            const scrollFromTop = scrollTop - timelineTop + windowHeight / 2;
            const progress = scrollFromTop / timelineHeight;
            
            // Clamp between 0 and 1
            const clampedProgress = Math.max(0, Math.min(1, progress));
            
            // Calculate ball position
            const ballPosition = clampedProgress * timelineHeight;
            
            // Update ball position
            ball.style.top = ballPosition + 'px';
            
            // Show/hide based on visibility
            if (timelineRect.top < windowHeight && timelineRect.bottom > 0) {
                ball.style.opacity = '1';
            } else {
                ball.style.opacity = '0';
            }
            
            console.log('Scroll:', scrollTop, 'Ball pos:', ballPosition, 'Progress:', clampedProgress);
        };
        
        // Scroll event listener
        window.addEventListener('scroll', () => {
            updateTimelineProgress();
        }, { passive: true });
        
        // Initial update
        setTimeout(() => {
            updateTimelineProgress();
        }, 100);
        
        // Update on resize
        window.addEventListener('resize', updateTimelineProgress, { passive: true });
    }
}

// Enhanced hover effects and initialization
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme toggle (which sets up the custom cursor and timeline animation)
    new ThemeToggle();

    // Add hover effects to project cards
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add click effects to social icons
    const socialIcons = document.querySelectorAll('.social-icon');
    socialIcons.forEach(icon => {
        icon.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('div');
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(255, 255, 255, 0.3)';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple 0.6s linear';
            ripple.style.left = '50%';
            ripple.style.top = '50%';
            ripple.style.width = '20px';
            ripple.style.height = '20px';
            ripple.style.marginLeft = '-10px';
            ripple.style.marginTop = '-10px';
            ripple.style.pointerEvents = 'none';
            
            this.style.position = 'relative';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Smooth scroll for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Ensure About card navigates to about.html (fallback and accessibility)
    (function ensureAboutNavigation() {
        const selectors = ['.project-card.about-card', '.about-cta', '.about-button'];
        const els = Array.from(document.querySelectorAll(selectors.join(','))).filter(Boolean);
        els.forEach(el => {
            // If there's already an anchor ancestor, prefer it and don't override
            const anchorAncestor = el.closest('a[href]');
            if (anchorAncestor) {
                // make sure keyboard users can focus the anchor
                anchorAncestor.setAttribute('tabindex', anchorAncestor.getAttribute('tabindex') || '0');
                return;
            }

            // make non-anchor elements keyboard-focusable
            if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');

            // click handler
            el.addEventListener('click', (e) => {
                // navigate to about page
                window.location.href = 'about.html';
            });

            // keyboard handler (Enter / Space)
            el.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    window.location.href = 'about.html';
                }
            });
        });
    })();

    // CV download handlers for header/main CV links
    (function attachCvDownloadHandlers(){
        function showToast(msg) {
            const t = document.createElement('div');
            t.textContent = msg;
            t.style.position = 'fixed';
            t.style.left = '50%';
            t.style.bottom = '24px';
            t.style.transform = 'translateX(-50%)';
            t.style.padding = '12px 18px';
            t.style.background = 'rgba(0,0,0,0.8)';
            t.style.color = '#fff';
            t.style.borderRadius = '8px';
            t.style.zIndex = 99999;
            document.body.appendChild(t);
            setTimeout(() => t.remove(), 3000);
        }

        async function handleCvClick(e) {
            e.preventDefault();
            const el = e.currentTarget;
            const url = el.getAttribute('href');
            if (!url) return;

            try {
                const res = await fetch(url, { method: 'HEAD' });
                if (res.ok) {
                    // trigger download
                    const a = document.createElement('a');
                    a.href = url;
                    // prefer provided download filename or derive from url
                    const downloadName = el.getAttribute('download') || url.split('/').pop();
                    a.setAttribute('download', downloadName);
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                } else {
                    showToast('CV not found on server — downloading fallback.');
                    // fallback blob
                    const fallback = new Blob([
                        'Pallavi Dhawan\nProfessional CV\n(placeholder - original CV not available)'
                    ], { type: 'application/pdf' });
                    const blobUrl = URL.createObjectURL(fallback);
                    const a = document.createElement('a');
                    a.href = blobUrl;
                    a.download = el.getAttribute('download') || 'PallaviDhawan_CV.pdf';
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(blobUrl);
                }
            } catch (err) {
                showToast('Network error — downloading fallback.');
                const fallback = new Blob([
                    'Pallavi Dhawan\nProfessional CV\n(placeholder - original CV not available)'
                ], { type: 'application/pdf' });
                const blobUrl = URL.createObjectURL(fallback);
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = el.getAttribute('download') || 'PallaviDhawan_CV.pdf';
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(blobUrl);
            }
        }

        // Attach to any element with class 'cv-link' or id 'download-cv'
        const cvEls = Array.from(document.querySelectorAll('.cv-link, #download-cv'));
        cvEls.forEach(el => {
            el.addEventListener('click', handleCvClick);
        });
    })();

});
            t.style.left = '50%';
