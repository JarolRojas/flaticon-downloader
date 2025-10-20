/**
 * Flaticon Downloader - Popup Script
 * Main logic for downloading icons from Flaticon pages
 */

// DOM Elements
const downloadBtn = document.getElementById('downloadBtn');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtn = document.getElementById('saveBtn');
const statusText = document.getElementById('statusText');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const folderInput = document.getElementById('folderName');
const namingSection = document.getElementById('namingSection');
const statsSection = document.getElementById('statsSection');

// Stats elements
const totalFoundEl = document.getElementById('totalFound');
const totalDownloadedEl = document.getElementById('totalDownloaded');
const totalErrorsEl = document.getElementById('totalErrors');
const downloadTimeEl = document.getElementById('downloadTime');
const totalSizeEl = document.getElementById('totalSize');

// State
let isDownloading = false;
let abortController = null;
let downloadedImages = [];
let startTime = null;
let timeInterval = null;

/**
 * Format bytes to human readable format
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    const value = bytes / Math.pow(k, i);
    return value.toFixed(2) + ' ' + sizes[i];
}

/**
 * Format time in seconds to readable format
 */
function formatTime(seconds) {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;
    return `${minutes}m ${remaining}s`;
}

/**
 * Update status display
 */
function updateStatus(message, type = 'info') {
    statusText.textContent = message;
    statusText.className = `status-text ${type}`;
}

/**
 * Update progress bar
 */
function updateProgress(current, total) {
    if (total > 0) {
        const percentage = (current / total) * 100;
        progressFill.style.width = `${percentage}%`;
    }
}

/**
 * Reset UI to initial state
 */
function resetUI() {
    isDownloading = false;
    downloadedImages = [];
    
    // Limpieza de timers y controladores
    if (timeInterval) clearInterval(timeInterval);
    if (abortController) abortController.abort();
    
    // Reset de botones y controles
    downloadBtn.disabled = false;
    downloadBtn.style.display = 'inline-block';
    downloadBtn.textContent = 'Iniciar Descarga';
    cancelBtn.style.display = 'none';
    saveBtn.disabled = false;
    saveBtn.textContent = 'Guardar flaticon-icons.zip';
    
    // Reset de secciones
    progressBar.style.display = 'none';
    progressFill.style.width = '0%';
    namingSection.style.display = 'none';
    statsSection.style.display = 'none';
    
    // Reset de inputs
    folderInput.value = 'flaticon-icons';
    
    // Reset de estadísticas
    totalFoundEl.textContent = '0';
    totalDownloadedEl.textContent = '0';
    totalErrorsEl.textContent = '0';
    totalSizeEl.textContent = '0 KB';
    downloadTimeEl.textContent = '0s';
    
    // Reset de estado
    updateStatus('Listo para descargar', 'info');
    
    // Forzar redimensionamiento del popup
    setTimeout(() => {
        document.body.style.height = 'auto';
    }, 100);
}

/**
 * Extract image URLs from page (runs in content context)
 */
function extractImagesFromPage() {
    const images = new Set();
    
    try {
        // Find all img elements
        document.querySelectorAll('img').forEach(img => {
            if (img.src && img.src.includes('flaticon')) {
                images.add(img.src);
            }
        });

        // Find in picture elements
        document.querySelectorAll('picture source').forEach(source => {
            if (source.srcset) {
                const matches = source.srcset.match(/https?:\/\/[^\s]+/g) || [];
                matches.forEach(url => {
                    if (url.includes('flaticon')) {
                        images.add(url.split(' ')[0]);
                    }
                });
            }
        });

        // Find in CSS backgrounds
        document.querySelectorAll('[style*="background-image"]').forEach(el => {
            const match = el.style.backgroundImage.match(/url\(['"]?([^'")]+)['"]?\)/);
            if (match && match[1] && match[1].includes('flaticon')) {
                images.add(match[1]);
            }
        });
    } catch (error) {
        console.error('Error extracting images:', error);
    }
    
    return Array.from(images);
}

/**
 * Download a single image with error handling
 */
async function downloadImage(url, signal) {
    try {
        // Add timestamp to avoid cache
        const urlWithTimestamp = url.includes('?') 
            ? `${url}&t=${Date.now()}` 
            : `${url}?t=${Date.now()}`;

        const response = await fetch(urlWithTimestamp, {
            signal,
            mode: 'cors',
            credentials: 'omit',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const blob = await response.blob();
        return blob;
    } catch (error) {
        console.warn(`Failed to download ${url}:`, error.message);
        return null;
    }
}

/**
 * Extract filename from URL
 */
function getFilenameFromUrl(url) {
    const path = url.split('?')[0];
    const filename = path.substring(path.lastIndexOf('/') + 1);
    return filename || `icon_${Date.now()}.png`;
}

/**
 * Start the download process
 */
async function startDownload() {
    isDownloading = true;
    downloadedImages = [];
    startTime = Date.now();
    
    downloadBtn.disabled = true;
    cancelBtn.style.display = 'inline-block';
    progressBar.style.display = 'block';
    statsSection.style.display = 'block';
    namingSection.style.display = 'none';
    
    abortController = new AbortController();

    try {
        updateStatus('🔍 Buscando iconos en la página...', 'info');

        // Get active tab
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tabs[0]) {
            throw new Error('No se pudo acceder a la pestaña activa');
        }

        // Execute script in page context using chrome.scripting (Manifest V3)
        const results = await chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: extractImagesFromPage
        });

        const imageUrls = results[0]?.result || [];

        if (imageUrls.length === 0) {
            updateStatus('❌ No se encontraron iconos en esta página', 'error');
            resetUI();
            return;
        }

        totalFoundEl.textContent = imageUrls.length;
        updateStatus(`✅ ${imageUrls.length} iconos encontrados. Descargando...`, 'success');

        // Download all images
        let downloaded = 0;
        let errors = 0;

        // Start time updater
        timeInterval = setInterval(() => {
            const elapsed = Math.round((Date.now() - startTime) / 1000);
            downloadTimeEl.textContent = formatTime(elapsed);
        }, 1000);

        for (let i = 0; i < imageUrls.length; i++) {
            if (abortController.signal.aborted) {
                updateStatus('⚠️ Descarga cancelada por el usuario', 'warning');
                break;
            }

            const url = imageUrls[i];
            const blob = await downloadImage(url, abortController.signal);

            if (blob) {
                downloadedImages.push({
                    filename: getFilenameFromUrl(url),
                    blob: blob
                });
                downloaded++;
            } else {
                errors++;
            }

            // Update UI
            updateProgress(i + 1, imageUrls.length);
            totalDownloadedEl.textContent = downloaded;
            totalErrorsEl.textContent = errors;
            totalSizeEl.textContent = 'Calculando...';

            // Small delay to avoid overwhelming the server
            if (i < imageUrls.length - 1) {
                await new Promise(r => setTimeout(r, 100));
            }
        }

        if (downloaded === 0) {
            updateStatus('❌ No se pudo descargar ningún icono', 'error');
            resetUI();
            return;
        }

        if (timeInterval) clearInterval(timeInterval);

        // Calcular tamaño real del ZIP antes de mostrar
        updateStatus('📦 Calculando tamaño del archivo...', 'info');
        
        const tempZip = new JSZip();
        const tempFolder = tempZip.folder('flaticon-icons');
        for (const image of downloadedImages) {
            tempFolder.file(image.filename, image.blob);
        }
        
        const tempContent = await tempZip.generateAsync({ 
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 }
        });
        
        totalSizeEl.textContent = formatBytes(tempContent.size);

        updateStatus(`✅ ${downloaded} iconos listos para guardar`, 'success');
        progressBar.style.display = 'none';
        cancelBtn.style.display = 'none';
        namingSection.style.display = 'block';

    } catch (error) {
        if (error.name !== 'AbortError') {
            updateStatus(`❌ Error: ${error.message}`, 'error');
            console.error('Download error:', error);
        }
        resetUI();
    }
}

/**
 * Save downloaded images as ZIP file
 */
async function saveAsZip() {
    try {
        if (!downloadedImages || downloadedImages.length === 0) {
            updateStatus('❌ No hay imágenes para guardar', 'error');
            return;
        }

        updateStatus('📦 Generando archivo ZIP...', 'info');
        saveBtn.disabled = true;

        const folderName = folderInput.value.trim() || 'flaticon-icons';

        if (typeof JSZip === 'undefined') {
            throw new Error('JSZip no está disponible');
        }

        const zip = new JSZip();
        const folder = zip.folder(folderName);

        // Add all images to ZIP
        for (const image of downloadedImages) {
            folder.file(image.filename, image.blob);
        }

        // Generate ZIP 
        const content = await zip.generateAsync({ 
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 }
        });

        // Trigger download
        const url = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${folderName}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        updateStatus('✅ ¡ZIP descargado correctamente!', 'success');
        // Pequeña pausa para que se vea el mensaje de éxito
        setTimeout(() => {
            resetUI();
        }, 800);

    } catch (error) {
        updateStatus(`❌ Error: ${error.message}`, 'error');
        console.error('ZIP creation error:', error);
        saveBtn.disabled = false;
    }
}

/**
 * Cancel download
 */
function cancelDownload() {
    if (abortController) {
        abortController.abort();
    }
    if (timeInterval) {
        clearInterval(timeInterval);
    }
    updateStatus('❌ Descarga cancelada', 'error');
    // Pequeña pausa para que se vea el mensaje antes de resetear
    setTimeout(() => {
        resetUI();
    }, 500);
}

// Event listeners
downloadBtn.addEventListener('click', startDownload);
cancelBtn.addEventListener('click', cancelDownload);
saveBtn.addEventListener('click', saveAsZip);

// Update ZIP filename preview
folderInput.addEventListener('input', () => {
    const filename = folderInput.value.trim() || 'flaticon-icons';
    saveBtn.textContent = `Guardar ${filename}.zip`;
});

console.log('Flaticon Downloader - Loaded successfully');