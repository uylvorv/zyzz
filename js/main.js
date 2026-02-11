/* ===================================================================
   THE ASCENSION — Main JavaScript
   Shared functionality: Nav, Cursor, Sidebar, Timer, Scroll Animations
   + Performance Mode Toggle
   =================================================================== */

// Global lite-mode flag
window.ASCENSION_LITE = false;

// Main JavaScript file for shared functionality

// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch((err) => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initPerfToggle();       // Must run first
    initPageLoader();
    initNavigation();
    if (!window.ASCENSION_LITE) initCustomCursor();
    initCommunitySidebar();
    initLegacyTimer();
    initScrollAnimations();
});

/* --- Performance Mode Toggle --- */
function initPerfToggle() {
    // Check localStorage preference
    const saved = localStorage.getItem('ascension-lite-mode');
    if (saved === 'true') {
        window.ASCENSION_LITE = true;
        document.body.classList.add('lite-mode');
    }

    // Find or create toggle (it's in the nav HTML)
    const toggle = document.getElementById('perf-toggle');
    if (!toggle) return;

    // Sync toggle visual state
    if (window.ASCENSION_LITE) {
        toggle.classList.add('active');
    }

    toggle.addEventListener('click', () => {
        window.ASCENSION_LITE = !window.ASCENSION_LITE;
        toggle.classList.toggle('active');

        if (window.ASCENSION_LITE) {
            document.body.classList.add('lite-mode');
            localStorage.setItem('ascension-lite-mode', 'true');
            // Stop cursor animation
            destroyCustomCursor();
        } else {
            document.body.classList.remove('lite-mode');
            localStorage.setItem('ascension-lite-mode', 'false');
            // Restart cursor
            initCustomCursor();
        }
    });
}

/* --- Page Loader --- */
function initPageLoader() {
    const loader = document.querySelector('.page-loader');
    if (!loader) return;

    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.classList.add('loaded');
            setTimeout(() => loader.remove(), 600);
        }, window.ASCENSION_LITE ? 100 : 500);
    });
}

/* --- Navigation --- */
function initNavigation() {
    const nav = document.querySelector('.main-nav');
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');

    // Scroll effect – throttled for perf
    let scrollTick = false;
    window.addEventListener('scroll', () => {
        if (!scrollTick) {
            requestAnimationFrame(() => {
                if (window.scrollY > 50) {
                    nav.classList.add('scrolled');
                } else {
                    nav.classList.remove('scrolled');
                }
                scrollTick = false;
            });
            scrollTick = true;
        }
    });

    // Mobile toggle
    if (toggle && links) {
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            links.classList.toggle('open');
        });

        // Close on link click
        links.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                toggle.classList.remove('active');
                links.classList.remove('open');
            });
        });
    }

    // Active page highlight
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(a => {
        const href = a.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            a.classList.add('active');
        }
    });
}

/* --- Custom Cursor with Light Trail --- */
let cursorRAF = null;
let cursorElements = { dot: null, ring: null, canvas: null, ctx: null };

function initCustomCursor() {
    // Don't init on touch devices or if already running
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;
    if (cursorRAF) return; // already running

    let dot = document.querySelector('.cursor-dot');
    let ring = document.querySelector('.cursor-ring');
    let canvas = document.getElementById('cursor-trail-canvas');

    if (!dot) {
        dot = document.createElement('div');
        dot.classList.add('cursor-dot');
        document.body.appendChild(dot);
    }
    if (!ring) {
        ring = document.createElement('div');
        ring.classList.add('cursor-ring');
        document.body.appendChild(ring);
    }
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'cursor-trail-canvas';
        document.body.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');
    cursorElements = { dot, ring, canvas, ctx };

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let mouseX = 0, mouseY = 0;
    let dotX = 0, dotY = 0;
    let ringX = 0, ringY = 0;

    const trail = [];
    const TRAIL_LENGTH = 20; // reduced from 25

    document.addEventListener('mousemove', onMouseMove);
    function onMouseMove(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        trail.push({ x: mouseX, y: mouseY, life: 1.0 });
        if (trail.length > TRAIL_LENGTH) trail.shift();
    }

    // Hover effect on interactive elements
    const hoverTargets = 'a, button, .btn, input, textarea, [data-cursor-hover]';
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(hoverTargets)) ring.classList.add('hover');
    });
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(hoverTargets)) ring.classList.remove('hover');
    });

    function animateCursor() {
        // Smooth follow
        dotX += (mouseX - dotX) * 0.35;
        dotY += (mouseY - dotY) * 0.35;
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;

        dot.style.left = dotX - 4 + 'px';
        dot.style.top = dotY - 4 + 'px';
        ring.style.left = ringX - 17.5 + 'px';
        ring.style.top = ringY - 17.5 + 'px';

        // Draw trail
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = trail.length - 1; i >= 0; i--) {
            const point = trail[i];
            point.life -= 0.04; // faster fade = fewer draw ops

            if (point.life <= 0) {
                trail.splice(i, 1);
                continue;
            }

            const alpha = point.life * 0.35;
            const size = point.life * 3;

            ctx.beginPath();
            ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(212, 168, 83, ${alpha})`;
            ctx.fill();
        }

        cursorRAF = requestAnimationFrame(animateCursor);
    }

    cursorRAF = requestAnimationFrame(animateCursor);

    // Store cleanup reference
    cursorElements._onMouseMove = onMouseMove;
}

function destroyCustomCursor() {
    if (cursorRAF) {
        cancelAnimationFrame(cursorRAF);
        cursorRAF = null;
    }
    // Hide elements but don't remove (in case user toggles back)
    if (cursorElements.dot) cursorElements.dot.style.display = 'none';
    if (cursorElements.ring) cursorElements.ring.style.display = 'none';
    if (cursorElements.canvas) {
        const ctx = cursorElements.canvas.getContext('2d');
        ctx.clearRect(0, 0, cursorElements.canvas.width, cursorElements.canvas.height);
        cursorElements.canvas.style.display = 'none';
    }
}

/* --- Community Sidebar --- */
function initCommunitySidebar() {
    const countEl = document.querySelector('.discord-count');
    if (countEl) {
        let count = 1247;
        function updateCount() {
            count += Math.floor(Math.random() * 11) - 5;
            count = Math.max(1200, Math.min(1350, count));
            countEl.textContent = count.toLocaleString();
        }
        updateCount();
        setInterval(updateCount, 8000);
    }
}

/* --- Legacy Timer --- */
function initLegacyTimer() {
    const timerEl = document.querySelector('.legacy-timer');
    if (!timerEl) return;

    const startDate = new Date('2007-06-01');

    function updateTimer() {
        const now = new Date();
        const diff = now - startDate;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        const daysEl = timerEl.querySelector('[data-timer="days"]');
        const hoursEl = timerEl.querySelector('[data-timer="hours"]');
        const minutesEl = timerEl.querySelector('[data-timer="minutes"]');
        const secondsEl = timerEl.querySelector('[data-timer="seconds"]');

        if (daysEl) daysEl.textContent = days.toLocaleString();
        if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
        if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
        if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');
    }

    updateTimer();
    setInterval(updateTimer, 1000);
}

/* --- Scroll Animations (IntersectionObserver) --- */
function initScrollAnimations() {
    // In lite mode, just make everything visible immediately
    if (window.ASCENSION_LITE) {
        document.querySelectorAll('.animate-in').forEach(el => {
            el.classList.add('visible');
        });
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                const children = entry.target.querySelectorAll('.stagger-child');
                children.forEach((child, i) => {
                    child.style.transitionDelay = `${i * 100}ms`;
                    child.classList.add('visible');
                });
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.animate-in').forEach(el => {
        observer.observe(el);
    });
}
