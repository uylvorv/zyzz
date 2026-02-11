/* ===================================================================
   Animated Stats — Character Selection Screen Effect
   Numbers count up, bars animate in, observer-triggered
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initAnimatedStats();
    initCountUpStats();
});

function initAnimatedStats() {
    const statBars = document.querySelectorAll('.stat-bar');
    if (!statBars.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bars = entry.target.querySelectorAll('.stat-bar');
                bars.forEach((bar, i) => {
                    setTimeout(() => {
                        const targetWidth = bar.getAttribute('data-width');
                        bar.style.width = targetWidth;
                        bar.classList.add('visible');
                    }, i * 150);
                });

                // Also animate the stat values
                const values = entry.target.querySelectorAll('.stat-value');
                values.forEach((val, i) => {
                    const target = parseInt(val.getAttribute('data-target'));
                    setTimeout(() => {
                        animateValue(val, 0, target, 1200);
                    }, i * 150);
                });

                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    const statsContainer = document.querySelector('.character-card');
    if (statsContainer) observer.observe(statsContainer);
}

function initCountUpStats() {
    const physicalStats = document.querySelectorAll('.physical-stat .stat-number');
    if (!physicalStats.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseFloat(el.getAttribute('data-target'));
                const decimals = el.getAttribute('data-decimals') || 0;
                const suffix = el.getAttribute('data-suffix') || '';
                const prefix = el.getAttribute('data-prefix') || '';

                animateValue(el, 0, target, 1500, parseInt(decimals), prefix, suffix);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    physicalStats.forEach(stat => observer.observe(stat));
}

function animateValue(el, start, end, duration, decimals = 0, prefix = '', suffix = '') {
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing: ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = start + (end - start) * eased;

        if (decimals > 0) {
            el.textContent = prefix + current.toFixed(decimals) + suffix;
        } else {
            el.textContent = prefix + Math.floor(current).toLocaleString() + suffix;
        }

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    requestAnimationFrame(update);
}
