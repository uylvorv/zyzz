const fs = require('fs');
const path = require('path');

const GALLERY_ROOT = path.join(__dirname, '../assets/gallery');
const OUTPUT_FILE = path.join(__dirname, '../data/gallery.json');

// Supported extensions
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const VIDEO_EXTS = ['.mp4', '.webm', '.mov'];

// Categories map to folder names
const CATEGORIES = ['Iconic', 'Gym', 'Festival', 'Transformation'];

function scanGallery() {
    if (!fs.existsSync(GALLERY_ROOT)) {
        console.error(`Gallery root not found: ${GALLERY_ROOT}`);
        return;
    }

    const galleryItems = [];

    // Scan each category folder
    CATEGORIES.forEach(category => {
        const folderPath = path.join(GALLERY_ROOT, category);

        if (!fs.existsSync(folderPath)) {
            // Warn but continue
            console.warn(`Category folder not found, skipping: ${folderPath}`);
            return;
        }

        const files = fs.readdirSync(folderPath);

        files.forEach(file => {
            const ext = path.extname(file).toLowerCase();
            const basename = path.basename(file, ext);
            // standardized category slug for filtering (e.g. "Iconic" -> "iconic")
            const categorySlug = category.toLowerCase();

            let type = 'unknown';
            if (IMAGE_EXTS.includes(ext)) type = 'image';
            else if (VIDEO_EXTS.includes(ext)) type = 'video';
            else return; // Skip unknown files

            // Generate clean caption
            // e.g. "zyzz_gym_01" -> "Zyzz Gym 01"
            let caption = basename
                .replace(/[_-]/g, ' ')
                .trim();

            // Capitalize Words
            caption = caption.replace(/\b\w/g, l => l.toUpperCase());

            galleryItems.push({
                src: `assets/gallery/${category}/${file}`,
                type: type,
                category: categorySlug,
                caption: caption
            });
        });
    });

    // Write JSON
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(galleryItems, null, 2));
    console.log(`Scanned ${galleryItems.length} items across ${CATEGORIES.length} folders.`);
    console.log(`Manifest updated at: ${OUTPUT_FILE}`);
}

scanGallery();
