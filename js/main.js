/**
 * ACPL Jewellery - Main Page Script
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
    initTabs();
    initSearch();
    loadProducts();
});

/**
 * Initialize tab switching
 */
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const searchTab = document.getElementById('search-tab');
    const scanTab = document.getElementById('scan-tab');
    const scannerModal = document.getElementById('scanner-modal');
    const closeScannerBtn = document.getElementById('close-scanner-btn');

    let scanner = null;

    // Close scanner modal function
    const closeScanner = async () => {
        if (scanner) {
            await scanner.stop();
        }
        scannerModal.classList.add('hidden');
        document.body.style.overflow = '';

        // Switch back to search tab
        tabBtns.forEach(b => b.classList.remove('active'));
        tabBtns[0].classList.add('active'); // Search tab
        searchTab.classList.add('active');
        scanTab.classList.remove('active');
    };

    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const tab = btn.dataset.tab;

            // Update active states
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (tab === 'search') {
                searchTab.classList.add('active');
                scanTab.classList.remove('active');

                // Close scanner if open
                if (!scannerModal.classList.contains('hidden')) {
                    await closeScanner();
                }
            } else {
                searchTab.classList.remove('active');
                scanTab.classList.add('active');

                // Open scanner modal directly
                scannerModal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';

                if (!scanner) {
                    scanner = new QRScanner('qr-reader');
                }
                await scanner.start();
            }
        });
    });

    // Close button
    closeScannerBtn.addEventListener('click', closeScanner);

    // Close on backdrop click
    scannerModal.addEventListener('click', (e) => {
        if (e.target === scannerModal) {
            closeScanner();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !scannerModal.classList.contains('hidden')) {
            closeScanner();
        }
    });
}

/**
 * Initialize search functionality
 */
function initSearch() {
    const input = document.getElementById('style-code-input');
    const btn = document.getElementById('search-btn');

    const performSearch = () => {
        const styleCode = input.value.trim();
        if (styleCode) {
            const url = `${window.location.origin}/product.html?style=${encodeURIComponent(styleCode)}`;
            console.log('Search navigating to:', url);
            window.location.href = url;
        }
    };

    btn.addEventListener('click', performSearch);

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

/**
 * Load and display products
 */
async function loadProducts() {
    const grid = document.getElementById('products-grid');

    try {
        const products = await sheetsAPI.fetchProducts();

        if (products.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                    <p style="color: var(--text-secondary);">No products found. Add some products to your Google Sheet!</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = products.map(product => createProductCard(product)).join('');

    } catch (error) {
        console.error('Error loading products:', error);
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <p style="color: var(--text-secondary);">
                    Unable to load products. Please check:
                    <br>1. Your Google Sheet ID is correct in config.js
                    <br>2. The sheet is published (File → Share → Publish to web)
                </p>
            </div>
        `;
    }
}

function createProductCard(product) {
    const cols = CONFIG.COLUMNS;
    const styleCode = product[cols.styleCode] || '';
    const name = product[cols.name] || styleCode;
    const category = product[cols.category] || '';
    const price = product[cols.price] || '';
    const imageUrl = product[cols.imageUrl] || '';

    // Build the product URL directly
    const productUrl = `product.html?style=${encodeURIComponent(styleCode)}`;

    const imageHtml = imageUrl
        ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(name)}" loading="lazy">`
        : `<span class="product-image-placeholder">💎</span>`;

    const priceHtml = price
        ? `<div class="product-price">₹${escapeHtml(formatPrice(price))}</div>`
        : '';

    // Use <a> tag instead of <div> for native navigation
    return `
        <a href="${productUrl}" class="product-card">
            <div class="product-image">
                ${imageHtml}
            </div>
            <div class="product-info">
                ${category ? `<div class="product-category">${escapeHtml(category)}</div>` : ''}
                <div class="product-name">${escapeHtml(name)}</div>
                <div class="product-code">${escapeHtml(styleCode)}</div>
                ${priceHtml}
            </div>
        </a>
    `;
}

/**
 * Format price with commas
 */
function formatPrice(price) {
    // Remove any existing formatting
    const num = String(price).replace(/[^\d.]/g, '');
    const parts = num.split('.');

    // Add Indian-style commas
    let intPart = parts[0];
    let lastThree = intPart.slice(-3);
    let otherNumbers = intPart.slice(0, -3);

    if (otherNumbers !== '') {
        lastThree = ',' + lastThree;
    }

    const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

    return parts.length > 1 ? formatted + '.' + parts[1] : formatted;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
