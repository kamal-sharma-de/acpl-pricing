/**
 * ACPL Jewellery - Configuration
 * 
 * IMPORTANT: Update these values before deploying!
 */

const CONFIG = {
    // Google Sheet Configuration
    // To get your sheet ID:
    // 1. Open your Google Sheet
    // 2. Look at the URL: https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit
    // 3. Copy the YOUR_SHEET_ID part
    GOOGLE_SHEET_ID: '1SYAfXsaSn2R_80NZw_OCkeoEROqUlSe7uTn1OMaRWH0',

    // Sheet name (tab name at the bottom of your sheet)
    SHEET_NAME: 'Sheet1',

    // Admin password (change this!)
    ADMIN_PASSWORD: 'acpl2026',

    // Website base URL (update when deploying)
    // This is used in QR codes to create the product URL
    // For GitHub Pages: window.location.origin + '/acpl-pricing'
    BASE_URL: window.location.origin + '/acpl-pricing',

    // Store information
    STORE_NAME: 'ACPL',
    STORE_TAGLINE: 'Fine Jewellery',

    // Column mapping (these should match your Google Sheet headers)
    // The keys are internal names, values are the column headers in your sheet
    COLUMNS: {
        styleCode: 'style_code',      // Required - unique identifier
        name: 'name',
        category: 'category',
        metalType: 'metal_type',
        grossWeight: 'gross_weight',
        metalWeight: 'metal_weight',
        diaWeight: 'dia_weight',
        purity: 'purity',
        price: 'price',
        description: 'description',
        imageUrl: 'image_url'
    }
};

// Make CONFIG globally available
window.CONFIG = CONFIG;
