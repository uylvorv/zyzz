/* ===================================================================
   Audio Player JS — Visual Waveform Animation
   Canvas-based animated waveform bars
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initWaveform();
});

function initWaveform() {
    const canvas = document.getElementById('waveform-canvas');
    if (!canvas) return;
    if (window.ASCENSION_LITE) return; // Skip animation in lite mode

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    function resize() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
    }
    resize();
    window.addEventListener('resize', resize);

    const BAR_COUNT = 80;
    const BAR_WIDTH = 3;
    const BAR_GAP = 2;

    // Generate random amplitudes
    const amplitudes = [];
    for (let i = 0; i < BAR_COUNT; i++) {
        amplitudes.push(0.2 + Math.random() * 0.8);
    }

    let time = 0;

    function draw() {
        const w = canvas.width / dpr;
        const h = canvas.height / dpr;
        ctx.clearRect(0, 0, w, h);

        const totalBarWidth = BAR_WIDTH + BAR_GAP;
        const startX = (w - BAR_COUNT * totalBarWidth) / 2;

        for (let i = 0; i < BAR_COUNT; i++) {
            const baseAmp = amplitudes[i];
            // Oscillate each bar with a phase offset
            const amp = baseAmp * (0.4 + 0.6 * Math.abs(Math.sin(time * 2 + i * 0.15)));
            const barHeight = amp * h * 0.7;

            const x = startX + i * totalBarWidth;
            const y = (h - barHeight) / 2;

            // Gradient color: gold to cyan
            const mixFactor = i / BAR_COUNT;
            const r = Math.floor(212 - mixFactor * 212);
            const g = Math.floor(168 - mixFactor * 168 + mixFactor * 229);
            const b = Math.floor(83 - mixFactor * 83 + mixFactor * 255);
            const alpha = 0.4 + amp * 0.4;

            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx.beginPath();
            ctx.roundRect(x, y, BAR_WIDTH, barHeight, 1.5);
            ctx.fill();

            // Glow effect for taller bars
            if (amp > 0.6) {
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.15})`;
                ctx.beginPath();
                ctx.roundRect(x - 2, y - 2, BAR_WIDTH + 4, barHeight + 4, 3);
                ctx.fill();
            }
        }

        time += 0.008;
        requestAnimationFrame(draw);
    }

    // Only animate when visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                draw();
                observer.unobserve(canvas);
            }
        });
    }, { threshold: 0.1 });

    observer.observe(canvas);
}
