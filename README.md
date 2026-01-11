# ACPL QR Jewellery Website

A simple website for scanning QR codes or searching by style code to view jewellery product details. Data is managed via Google Sheets.

## Quick Start

### 1. Start the Server
```bash
cd d:\Projects\qr-jewellery
npx -y http-server . -p 8080 -c-1
```
Then open: **http://localhost:8080**

### 2. Admin Access
- URL: `http://localhost:8080/admin.html`
- Password: `acpl2026` (change in `js/config.js`)

---

## Features

| Feature | Description |
|---------|-------------|
| **QR Scanner** | Customers scan QR codes on jewellery to view details |
| **Style Search** | Enter style code manually to find products |
| **Product Page** | Shows all product specifications |
| **Admin Panel** | Generate & download QR codes (individual PNG or PDF) |

---

## Configuration

Edit `js/config.js`:

```javascript
GOOGLE_SHEET_ID: 'your-sheet-id-here',  // From sheet URL
SHEET_NAME: 'Sheet1',                    // Tab name
ADMIN_PASSWORD: 'your-password',         // Admin login
```

---

## Google Sheet Setup

### Required Columns
| Column | Required | Description |
|--------|----------|-------------|
| `style_code` | ✅ Yes | Unique product identifier |
| `name` | No | Product name |
| `category` | No | Ring, Necklace, Earrings, etc. |
| `metal_type` | No | Gold, Silver, Platinum |
| `gross_weight` | No | Total weight |
| `metal_weight` | No | Metal weight |
| `dia_weight` | No | Diamond weight |
| `purity` | No | 22K, 18K, etc. |
| `price` | No | Price in INR |
| `description` | No | Product description |
| `image_url` | No | Image URL |

### How to Set Up
1. Create a Google Sheet with columns above
2. Add your products
3. Go to **Share** → Set **"Anyone with the link"** → **Viewer**
4. Copy the Sheet ID from the URL
5. Paste it in `js/config.js`

---

## Deployment

This is a static website. You can host it on:
- **Netlify** (free) - drag & drop folder
- **Vercel** (free) - connect GitHub repo
- **GitHub Pages** (free)
- **Any web server** - just copy files

> ⚠️ **Important**: Do NOT use `npx serve` in production — it strips URL query parameters. Use `http-server`, nginx, or any standard static file server.

---

## File Structure
```
qr-jewellery/
├── index.html          # Home page
├── product.html        # Product details page
├── admin.html          # Admin panel
├── css/
│   └── styles.css      # All styles
└── js/
    ├── config.js       # Configuration
    ├── sheets.js       # Google Sheets API
    ├── scanner.js      # QR code scanner
    ├── main.js         # Home page logic
    ├── product.js      # Product page logic
    └── admin.js        # Admin panel logic
```
