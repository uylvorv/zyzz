/* ===================================================================
   Gallery JS — Dynamic Loading, Masonry, Lightbox, Filtering
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    loadGallery();
});

let galleryItemsData = [];

async function loadGallery() {
    try {
        const response = await fetch('data/gallery.json');
        if (!response.ok) throw new Error('Failed to load gallery manifest');

        galleryItemsData = await response.json();
        renderGallery(galleryItemsData);
        initGalleryFilter();
        initLightbox();
    } catch (error) {
        console.error('Error loading gallery:', error);
        // Fallback or error message could go here
    }
}

function renderGallery(items) {
    const grid = document.querySelector('.masonry-grid');
    if (!grid) return;

    grid.innerHTML = '';

    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'masonry-item animate-in';
        div.setAttribute('data-category', item.category || 'all');

        div.style.opacity = '0';
        div.style.animation = 'fadeIn 0.5s ease forwards';

        let innerHTML = '';
        if (item.type === 'video') {
            innerHTML = `
                <div class="video-thumbnail">
                    <video src="${item.src}" muted loop playsinline onmouseover="this.play()" onmouseout="this.pause()"></video>
                    <div class="play-icon"><i class="fa-solid fa-play"></i></div>
                </div>
                <div class="item-overlay">
                    <div class="item-info">
                        <h4>${item.caption}</h4>
                        <span>${item.category} • Video</span>
                    </div>
                </div>
            `;
        } else {
            innerHTML = `
                <img src="${item.src}" alt="${item.caption}" loading="lazy">
                <div class="item-overlay">
                    <div class="item-info">
                        <h4>${item.caption}</h4>
                        <span>${item.category}</span>
                    </div>
                </div>
            `;
        }

        div.innerHTML = innerHTML;
        grid.appendChild(div);
    });
}

/* --- Category Filter --- */
function initGalleryFilter() {
    const tabs = document.querySelectorAll('.filter-tab');

    if (!tabs.length) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const filter = tab.getAttribute('data-filter');
            const items = document.querySelectorAll('.masonry-item');

            items.forEach(item => {
                const category = item.getAttribute('data-category');

                if (filter === 'all' || category === filter || (filter === 'iconic' && !category)) {
                    // Show
                    item.classList.remove('hidden');
                    item.style.display = '';
                    // Re-trigger animation
                    item.style.animation = 'none';
                    item.offsetHeight; /* trigger reflow */
                    item.style.animation = 'fadeIn 0.4s ease forwards';
                } else {
                    // Hide
                    item.classList.add('hidden');
                    setTimeout(() => {
                        if (item.classList.contains('hidden')) item.style.display = 'none';
                    }, 400); // Wait for fade out if we added one, otherwise immediate
                    item.style.display = 'none'; // Simple hide for now
                }
            });
        });
    });
}

/* --- Lightbox --- */
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    const lightboxImg = lightbox.querySelector('.lightbox-img');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');

    let currentIndex = 0;
    let visibleItems = [];

    function getVisibleItems() {
        return Array.from(document.querySelectorAll('.masonry-item:not(.hidden)'));
    }

    // Open lightbox - Delegated event
    document.querySelector('.masonry-grid')?.addEventListener('click', (e) => {
        const item = e.target.closest('.masonry-item');
        if (!item) return;

        visibleItems = getVisibleItems();
        currentIndex = visibleItems.indexOf(item);
        showImage(currentIndex);
        lightbox.classList.add('open');
        lightbox.classList.add('active'); // using .active in CSS? Check CSS.
        document.body.style.overflow = 'hidden';
    });

    function showImage(index) {
        if (index < 0 || index >= visibleItems.length) return;

        const item = visibleItems[index];
        const isVideo = item.querySelector('video');
        const src = isVideo ? isVideo.src : item.querySelector('img').src;
        const caption = item.querySelector('.item-info h4')?.textContent || '';

        // Check if lightbox already has a video element
        let lightboxVideo = lightbox.querySelector('.lightbox-video');

        if (isVideo) {
            // Show video
            lightboxImg.style.display = 'none';
            if (!lightboxVideo) {
                lightboxVideo = document.createElement('video');
                lightboxVideo.className = 'lightbox-video';
                lightboxVideo.controls = true;
                lightboxVideo.autoplay = true;
                lightboxVideo.style.maxWidth = '100%';
                lightboxVideo.style.maxHeight = '85vh';
                lightboxVideo.style.border = '1px solid var(--accent-gold)';
                lightboxVideo.style.boxShadow = '0 0 50px rgba(0,0,0,0.8)';
                lightbox.querySelector('.lightbox-content').insertBefore(lightboxVideo, lightboxImg);
            } else {
                lightboxVideo.style.display = 'block';
            }
            lightboxVideo.src = src;
        } else {
            // Show image
            if (lightboxVideo) {
                lightboxVideo.style.display = 'none';
                lightboxVideo.pause();
            }
            lightboxImg.style.display = 'block';
            lightboxImg.src = src;
        }

        lightboxCaption.textContent = caption;
        currentIndex = index;
    }

    // Close
    function closeLightbox() {
        lightbox.classList.remove('open');
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    closeBtn?.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // Navigation
    prevBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
        showImage(currentIndex);
    });

    nextBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % visibleItems.length;
        showImage(currentIndex);
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('open') && !lightbox.classList.contains('active')) return;

        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') {
            currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
            showImage(currentIndex);
        }
        if (e.key === 'ArrowRight') {
            currentIndex = (currentIndex + 1) % visibleItems.length;
            showImage(currentIndex);
        }
    });
}

