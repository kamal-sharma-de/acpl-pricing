/**
 * ACPL Jewellery - Product Detail Page Script
 */

document.addEventListener('DOMContentLoaded', () => {
    loadProduct();
});

async function loadProduct() {
    const container = document.getElementById('product-container');
    const notFound = document.getElementById('not-found');

    const urlParams = new URLSearchParams(window.location.search);
    const styleCode = urlParams.get('style');

    if (!styleCode) {
        container.classList.add('hidden');
        notFound.classList.remove('hidden');
        return;
    }

    try {
        const product = await sheetsAPI.getProductByStyleCode(styleCode);

        if (!product) {
            container.classList.add('hidden');
            notFound.classList.remove('hidden');
            return;
        }

        const cols = CONFIG.COLUMNS;
        const name = product[cols.name] || styleCode;
        document.title = `${name} - ${CONFIG.STORE_NAME}`;

        container.innerHTML = createProductDetail(product);

    } catch (error) {
        console.error('Error loading product:', error);
        container.innerHTML = `<div style="text-align:center;padding:60px;"><p>Error loading product.</p></div>`;
    }
}

function createProductDetail(product) {
    const cols = CONFIG.COLUMNS;
    const styleCode = product[cols.styleCode] || '';
    const name = product[cols.name] || styleCode;
    const category = product[cols.category] || '';
    const metalType = product[cols.metalType] || '';
    const grossWeight = product[cols.grossWeight] || '';
    const metalWeight = product[cols.metalWeight] || '';
    const diaWeight = product[cols.diaWeight] || '';
    const purity = product[cols.purity] || '';
    const price = product[cols.price] || '';
    const description = product[cols.description] || '';
    const imageUrl = product[cols.imageUrl] || '';

    const specs = [];
    if (metalType) specs.push({ label: 'Metal Type', value: metalType });
    if (purity) specs.push({ label: 'Purity', value: purity });
    if (grossWeight) specs.push({ label: 'Gross Weight', value: grossWeight });
    if (metalWeight) specs.push({ label: 'Metal Weight', value: metalWeight });
    if (diaWeight) specs.push({ label: 'Diamond Weight', value: diaWeight });

    const specsHtml = specs.length > 0
        ? `<div class="product-specs">${specs.map(s => `<div class="spec-row"><span class="spec-label">${s.label}</span><span class="spec-value">${s.value}</span></div>`).join('')}</div>`
        : '';

    const imageHtml = imageUrl
        ? `<img src="${imageUrl}" alt="${name}">`
        : `<span class="product-detail-image-placeholder">💎</span>`;

    const priceHtml = price ? `<div class="product-detail-price">₹${formatPrice(price)}</div>` : '';
    const descHtml = description ? `<p class="product-description">${description}</p>` : '';

    return `
        <div class="product-detail-image">${imageHtml}</div>
        <div class="product-detail-info">
            ${category ? `<div class="product-detail-category">${category}</div>` : ''}
            <h1 class="product-detail-name">${name}</h1>
            <p class="product-detail-code">Style Code: ${styleCode}</p>
            ${priceHtml}
            ${specsHtml}
            ${descHtml}
        </div>
    `;
}

function formatPrice(price) {
    const num = String(price).replace(/[^\d.]/g, '');
    const parts = num.split('.');
    let intPart = parts[0];
    let lastThree = intPart.slice(-3);
    let otherNumbers = intPart.slice(0, -3);
    if (otherNumbers !== '') lastThree = ',' + lastThree;
    const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
    return parts.length > 1 ? formatted + '.' + parts[1] : formatted;
}
