/**
 * ACPL Jewellery - Google Sheets Integration
 * 
 * Fetches data from a published Google Sheet (no API key needed)
 * The sheet must be published to the web as CSV
 */

class SheetsAPI {
    constructor() {
        this.cache = null;
        this.cacheTime = null;
        this.cacheDuration = 5 * 60 * 1000; // 5 minutes cache
    }

    /**
     * Get the public CSV URL for a Google Sheet
     */
    getSheetUrl() {
        const sheetId = CONFIG.GOOGLE_SHEET_ID;
        const sheetName = CONFIG.SHEET_NAME;
        return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
    }

    /**
     * Get the edit URL for the Google Sheet
     */
    getEditUrl() {
        return `https://docs.google.com/spreadsheets/d/${CONFIG.GOOGLE_SHEET_ID}/edit`;
    }

    /**
     * Parse CSV string into array of objects
     */
    parseCSV(csvText) {
        const lines = csvText.split('\n');
        if (lines.length < 2) return [];

        // Parse header row
        const headers = this.parseCSVLine(lines[0]);

        // Parse data rows
        const data = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const values = this.parseCSVLine(line);
            const row = {};

            headers.forEach((header, index) => {
                row[header.toLowerCase().trim()] = values[index] || '';
            });

            // Only include rows that have a style code
            const styleCodeColumn = CONFIG.COLUMNS.styleCode;
            if (row[styleCodeColumn] && row[styleCodeColumn].trim()) {
                data.push(row);
            }
        }

        return data;
    }

    /**
     * Parse a single CSV line handling quoted values
     */
    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        values.push(current.trim());
        return values;
    }

    /**
     * Fetch all products from the Google Sheet
     */
    async fetchProducts() {
        // Return cached data if still valid
        if (this.cache && this.cacheTime && (Date.now() - this.cacheTime < this.cacheDuration)) {
            return this.cache;
        }

        try {
            const url = this.getSheetUrl();
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Failed to fetch sheet: ${response.status}`);
            }

            const csvText = await response.text();
            const products = this.parseCSV(csvText);

            // Cache the results
            this.cache = products;
            this.cacheTime = Date.now();

            return products;
        } catch (error) {
            console.error('Error fetching products:', error);

            // Return cached data if available, even if stale
            if (this.cache) {
                console.log('Returning stale cached data');
                return this.cache;
            }

            throw error;
        }
    }

    /**
     * Get a single product by style code
     */
    async getProductByStyleCode(styleCode) {
        const products = await this.fetchProducts();
        const styleCodeColumn = CONFIG.COLUMNS.styleCode;

        return products.find(p => {
            const productCode = (p[styleCodeColumn] || '').trim().toLowerCase();
            const searchCode = (styleCode || '').trim().toLowerCase();
            return productCode === searchCode;
        });
    }

    /**
     * Get all unique categories
     */
    async getCategories() {
        const products = await this.fetchProducts();
        const categoryColumn = CONFIG.COLUMNS.category;

        const categories = new Set();
        products.forEach(p => {
            if (p[categoryColumn]) {
                categories.add(p[categoryColumn]);
            }
        });

        return Array.from(categories);
    }

    /**
     * Clear the cache
     */
    clearCache() {
        this.cache = null;
        this.cacheTime = null;
    }
}

// Create global instance
window.sheetsAPI = new SheetsAPI();
