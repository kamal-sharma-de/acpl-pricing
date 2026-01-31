/**
 * ACPL Jewellery - Admin Page Script
 */

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initLogin();
    initAdmin();
});

// Session storage key
const AUTH_KEY = 'acpl_admin_auth';

function checkAuth() {
    if (sessionStorage.getItem(AUTH_KEY) === 'true') {
        showDashboard();
    }
}

function initLogin() {
    const form = document.getElementById('login-form');
    const passwordInput = document.getElementById('password-input');
    const errorMsg = document.getElementById('login-error');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (passwordInput.value === CONFIG.ADMIN_PASSWORD) {
            sessionStorage.setItem(AUTH_KEY, 'true');
            errorMsg.classList.add('hidden');
            showDashboard();
        } else {
            errorMsg.classList.remove('hidden');
            passwordInput.value = '';
            passwordInput.focus();
        }
    });
}

function showDashboard() {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');
    loadAdminData();
}

function initAdmin() {
    document.getElementById('logout-btn').addEventListener('click', () => {
        sessionStorage.removeItem(AUTH_KEY);
        location.reload();
    });

    document.getElementById('download-all-pdf').addEventListener('click', downloadAllPDF);

    document.getElementById('filter-input').addEventListener('input', (e) => {
        filterQRCards(e.target.value);
    });

    document.getElementById('sheet-link').href = sheetsAPI.getEditUrl();
}

async function loadAdminData() {
    const grid = document.getElementById('qr-grid');

    try {
        const products = await sheetsAPI.fetchProducts();
        const categories = await sheetsAPI.getCategories();

        document.getElementById('total-products').textContent = products.length;
        document.getElementById('total-categories').textContent = categories.length;

        if (products.length === 0) {
            grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-secondary);">No products found.</p>';
            return;
        }

        grid.innerHTML = products.map(p => createQRCard(p)).join('');

        // Generate QR codes after a small delay to ensure DOM is updated
        setTimeout(() => {
            products.forEach(p => {
                const styleCode = p[CONFIG.COLUMNS.styleCode];
                generateQRCode(styleCode);
            });
        }, 100);

    } catch (error) {
        console.error('Error loading admin data:', error);
        grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--error);">Error loading products.</p>';
    }
}

function createQRCard(product) {
    const styleCode = product[CONFIG.COLUMNS.styleCode];
    const name = product[CONFIG.COLUMNS.name] || styleCode;

    return `
        <div class="qr-card" data-style-code="${styleCode}">
            <div class="qr-code-container">
                <div id="qr-${styleCode}"></div>
            </div>
            <div class="qr-style-code">${styleCode}</div>
            <div class="qr-product-name">${name}</div>
            <button class="qr-download-btn" onclick="downloadQR('${styleCode}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download PNG
            </button>
        </div>
    `;
}

function generateQRCode(styleCode) {
    const container = document.getElementById(`qr-${styleCode}`);
    if (!container) return;

    // Use shortened URL format for simpler QR pattern (fewer characters = easier to scan at small sizes)
    const url = `${CONFIG.BASE_URL}/p/${encodeURIComponent(styleCode)}`;

    // Clear any existing content
    container.innerHTML = '';

    // Use qrcodejs library with optimized settings for small jewelry prints
    new QRCode(container, {
        text: url,
        width: 256,           // Higher resolution for sharper printing
        height: 256,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H  // 30% error correction - best for scratches/wear
    });
}

function downloadQR(styleCode) {
    const container = document.getElementById(`qr-${styleCode}`);
    if (!container) return;

    // qrcodejs creates an img element inside the container
    const img = container.querySelector('img');
    if (!img) {
        console.error('QR image not found for:', styleCode);
        return;
    }

    const link = document.createElement('a');
    link.download = `QR_${styleCode}.png`;
    link.href = img.src;
    link.click();
}

async function downloadAllPDF() {
    const btn = document.getElementById('download-all-pdf');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner" style="width:16px;height:16px;border-width:2px;"></span> Generating...';

    try {
        const products = await sheetsAPI.fetchProducts();
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');

        const qrSize = 40;
        const cols = 4;
        const margin = 15;
        const spacing = (210 - 2 * margin - cols * qrSize) / (cols - 1);
        let x = margin, y = margin + 10;

        pdf.setFontSize(16);
        pdf.text('ACPL - QR Codes', 105, 12, { align: 'center' });

        for (let i = 0; i < products.length; i++) {
            const styleCode = products[i][CONFIG.COLUMNS.styleCode];
            const container = document.getElementById(`qr-${styleCode}`);
            const img = container ? container.querySelector('img') : null;

            if (img) {
                pdf.addImage(img.src, 'PNG', x, y, qrSize, qrSize);
                pdf.setFontSize(8);
                pdf.text(styleCode, x + qrSize / 2, y + qrSize + 5, { align: 'center' });
            }

            x += qrSize + spacing;

            if ((i + 1) % cols === 0) {
                x = margin;
                y += qrSize + 15;

                if (y > 260 && i < products.length - 1) {
                    pdf.addPage();
                    y = margin + 10;
                    pdf.setFontSize(16);
                    pdf.text('ACPL - QR Codes', 105, 12, { align: 'center' });
                }
            }
        }

        pdf.save('ACPL_QR_Codes.pdf');

    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
    }

    btn.disabled = false;
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 18 15 15"/></svg> Download All (PDF)`;
}

function filterQRCards(query) {
    const cards = document.querySelectorAll('.qr-card');
    const q = query.toLowerCase();

    cards.forEach(card => {
        const code = card.dataset.styleCode.toLowerCase();
        card.style.display = code.includes(q) ? 'block' : 'none';
    });
}
