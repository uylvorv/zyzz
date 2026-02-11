/* ===================================================================
   Parallax Quotes — GSAP ScrollTrigger powered
   Loads GSAP from CDN, then initializes parallax quote animations
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // In lite mode, just show quotes statically
    if (window.ASCENSION_LITE) {
        document.querySelectorAll('.parallax-quote').forEach(q => {
            const text = q.querySelector('.quote-text');
            const author = q.querySelector('.quote-author');
            if (text) { text.style.opacity = '1'; text.style.transform = 'none'; text.style.filter = 'none'; }
            if (author) { author.style.opacity = '1'; }
        });
        return;
    }

    // Wait for GSAP to load
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        initParallaxQuotes();
    } else {
        // Fallback: use IntersectionObserver
        initFallbackParallax();
    }
});

function initParallaxQuotes() {
    gsap.registerPlugin(ScrollTrigger);

    const quotes = document.querySelectorAll('.parallax-quote');

    quotes.forEach((quote, index) => {
        const text = quote.querySelector('.quote-text');
        const author = quote.querySelector('.quote-author');
        const glow = quote.querySelector('.quote-glow');

        // Create timeline for each quote
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: quote,
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse',
            }
        });

        tl.fromTo(text, {
            opacity: 0,
            y: 80,
            scale: 0.95,
            filter: 'blur(10px)'
        }, {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            duration: 1.2,
            ease: 'power3.out'
        });

        if (author) {
            tl.fromTo(author, {
                opacity: 0,
                y: 20
            }, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power2.out'
            }, '-=0.4');
        }

        if (glow) {
            tl.fromTo(glow, {
                opacity: 0,
                scale: 0.5
            }, {
                opacity: 0.1,
                scale: 1,
                duration: 1.5,
                ease: 'power2.out'
            }, '-=1');
        }

        // Parallax movement on scroll
        gsap.to(text, {
            y: -30,
            scrollTrigger: {
                trigger: quote,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1
            }
        });
    });
}

/* Fallback for when GSAP doesn't load */
function initFallbackParallax() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const text = entry.target.querySelector('.quote-text');
            const author = entry.target.querySelector('.quote-author');

            if (entry.isIntersecting) {
                if (text) text.classList.add('visible');
                if (author) {
                    setTimeout(() => author.classList.add('visible'), 300);
                }
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('.parallax-quote').forEach(q => observer.observe(q));
}
