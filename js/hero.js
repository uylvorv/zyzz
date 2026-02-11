/* ===================================================================
   Hero JS — VHS Glitch Effect Controller
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    if (!window.ASCENSION_LITE) initHeroGlitch();
    initVideoFallback();
});

function initHeroGlitch() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    // Random glitch effect
    function randomGlitch() {
        const heroContent = hero.querySelector('.hero-content');
        if (!heroContent) return;

        // Quick transform glitch
        const x = (Math.random() - 0.5) * 6;
        const y = (Math.random() - 0.5) * 4;
        heroContent.style.transform = `translate(${x}px, ${y}px)`;

        setTimeout(() => {
            heroContent.style.transform = 'translate(0, 0)';
        }, 50 + Math.random() * 100);
    }

    // Trigger glitch at random intervals
    function scheduleGlitch() {
        const delay = 3000 + Math.random() * 7000; // 3-10 seconds
        setTimeout(() => {
            randomGlitch();
            scheduleGlitch();
        }, delay);
    }
    scheduleGlitch();

    // Add random VHS tracking bars
    function addTrackingBar() {
        const bar = document.createElement('div');
        bar.style.cssText = `
            position: absolute;
            left: 0;
            right: 0;
            height: ${2 + Math.random() * 5}px;
            top: ${Math.random() * 100}%;
            background: rgba(255, 255, 255, 0.05);
            z-index: 4;
            pointer-events: none;
        `;
        hero.appendChild(bar);
        setTimeout(() => bar.remove(), 100 + Math.random() * 200);
    }

    setInterval(() => {
        if (Math.random() > 0.7) addTrackingBar();
    }, 2000);
}

function initVideoFallback() {
    const video = document.querySelector('.hero-video');
    const fallbackImg = document.querySelector('.hero-fallback');

    if (video) {
        video.addEventListener('error', () => {
            video.style.display = 'none';
            if (fallbackImg) fallbackImg.style.display = 'block';
        });

        // Auto-hide fallback if video loads
        video.addEventListener('loadeddata', () => {
            if (fallbackImg) fallbackImg.style.display = 'none';
        });
    }
}
