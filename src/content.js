/**
 * Content Script for Flaticon Downloader
 * Handles communication between popup and page content
 */

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractImages') {
        const images = extractImagesFromPage();
        sendResponse({ images });
    }
});

/**
 * Extract all Flaticon images from the current page
 */
function extractImagesFromPage() {
    const images = new Set();
    
    try {
        // Find the container with id pack-view__inner
        const container = document.getElementById('pack-view__inner');
        if (!container) {
            console.log('[Flaticon Downloader] Container pack-view__inner not found');
            return Array.from(images);
        }
        
        // Find all img elements with Flaticon URLs within the container
        container.querySelectorAll('img').forEach(img => {
            if (img.src && (img.src.includes('flaticon') || img.src.includes('cdn-icons'))) {
                images.add(img.src);
            }
        });
        
        // Find images in picture elements within the container
        container.querySelectorAll('picture source').forEach(source => {
            if (source.srcset) {
                const urls = source.srcset.match(/https?:\/\/[^\s]+/g) || [];
                urls.forEach(url => {
                    if (url.includes('flaticon') || url.includes('cdn-icons')) {
                        images.add(url.split(' ')[0]);
                    }
                });
            }
        });
        
        // Find images in background styles within the container
        container.querySelectorAll('[style*="background-image"]').forEach(el => {
            const match = el.style.backgroundImage.match(/url\(['"]?([^'")]+)['"]?\)/);
            if (match && match[1] && (match[1].includes('flaticon') || match[1].includes('cdn-icons'))) {
                images.add(match[1]);
            }
        });
        
        console.log(`[Flaticon Downloader] Found ${images.size} images`);
    } catch (error) {
        console.error('[Flaticon Downloader] Error extracting images:', error);
    }
    
    return Array.from(images);
}

console.log('[Flaticon Downloader] Content script loaded');
