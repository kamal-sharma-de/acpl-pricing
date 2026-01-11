/**
 * ACPL Jewellery - QR Code Scanner
 * 
 * Uses html5-qrcode library for camera-based QR scanning
 */

class QRScanner {
    constructor(elementId) {
        this.elementId = elementId;
        this.scanner = null;
        this.isScanning = false;
    }

    /**
     * Start the QR scanner
     */
    async start() {
        if (this.isScanning) return;

        try {
            this.scanner = new Html5Qrcode(this.elementId);

            // Get viewport dimensions for responsive qrbox
            const viewportWidth = Math.min(window.innerWidth - 48, 350);
            const qrboxSize = Math.floor(viewportWidth * 0.8);

            await this.scanner.start(
                { facingMode: "environment" }, // Use back camera
                {
                    fps: 15, // Higher FPS for better detection
                    qrbox: { width: qrboxSize, height: qrboxSize },
                    aspectRatio: 1,
                    disableFlip: false, // Allow scanning mirrored QR codes
                    experimentalFeatures: {
                        useBarCodeDetectorIfSupported: true // Use native detector if available
                    }
                },
                (decodedText) => this.onScanSuccess(decodedText),
                (errorMessage) => this.onScanError(errorMessage)
            );

            this.isScanning = true;
        } catch (error) {
            console.error('Error starting scanner:', error);
            this.showCameraError(error);
        }
    }

    /**
     * Stop the QR scanner
     */
    async stop() {
        if (!this.isScanning || !this.scanner) return;

        try {
            await this.scanner.stop();
            this.isScanning = false;
        } catch (error) {
            console.error('Error stopping scanner:', error);
        }
    }

    /**
     * Handle successful QR code scan
     */
    onScanSuccess(decodedText) {
        // Stop scanning after successful read
        this.stop();

        // Check if it's a URL with style parameter
        try {
            const url = new URL(decodedText);
            const styleCode = url.searchParams.get('style');

            if (styleCode) {
                this.navigateToProduct(styleCode);
                return;
            }
        } catch (e) {
            // Not a URL, treat as style code directly
        }

        // Treat the decoded text as a style code
        this.navigateToProduct(decodedText);
    }

    /**
     * Handle scan errors (mostly just noise, ignored)
     */
    onScanError(errorMessage) {
        // Ignore scan errors - they happen when no QR is in view
    }

    /**
     * Navigate to product page
     */
    navigateToProduct(styleCode) {
        // Use CONFIG.BASE_URL for GitHub Pages compatibility
        const baseUrl = typeof CONFIG !== 'undefined' ? CONFIG.BASE_URL : window.location.origin;
        window.location.href = `${baseUrl}/product.html?style=${encodeURIComponent(styleCode)}`;
    }

    /**
     * Show camera error message
     */
    showCameraError(error) {
        const container = document.getElementById(this.elementId);
        if (!container) return;

        let message = 'Unable to access camera.';

        if (error.name === 'NotAllowedError') {
            message = 'Camera permission denied. Please allow camera access and refresh the page.';
        } else if (error.name === 'NotFoundError') {
            message = 'No camera found on this device.';
        } else if (error.name === 'NotReadableError') {
            message = 'Camera is in use by another application.';
        }

        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: var(--text-secondary);">
                <svg style="width: 48px; height: 48px; margin-bottom: 16px; color: var(--text-muted);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
                <p>${message}</p>
            </div>
        `;
    }
}

// Create global instance
window.QRScanner = QRScanner;
