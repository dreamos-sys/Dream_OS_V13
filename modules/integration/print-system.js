// ==================== WIFI PRINTING MODULE ====================
window.DreamOSPrint = (function() {
    function log(...args) { console.log('[🖨️ Print]', ...args); }
    function warn(...args) { console.warn('[🖨️ Print]', ...args); }
    function error(...args) { console.error('[🖨️ Print]', ...args); }

    function createPrintUI() {
        if (document.getElementById('printPreviewModal')) return;

        const html = `
            <div id="printPreviewModal" style="
                display: none; position: fixed; top: 0; left: 0;
                width: 100%; height: 100%; background: rgba(0,0,0,0.95);
                z-index: 9998; overflow-y: auto; padding: 20px;
            ">
                <div style="background: white; max-width: 800px; margin: 40px auto; border-radius: 15px; padding: 30px; color: black;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="margin: 0;">🖨️ PRINT PREVIEW</h2>
                        <button id="printCloseBtn" style="background: #ff4757; color: white; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 1.2rem;">×</button>
                    </div>
                    <div id="printContent" style="margin-top: 30px;"></div>
                    <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #eee;">
                        <h3>WiFi Printer Options</h3>
                        <div style="display: flex; gap: 15px; align-items: center; margin-top: 15px;">
                            <select id="printerSelect" style="flex: 1; padding: 12px; border-radius: 8px; border: 1px solid #ddd;">
                                <option value="">-- Auto-detect WiFi Printer --</option>
                                <option value="epson">EPSON L3150 (WiFi)</option>
                                <option value="hp">HP LaserJet MFP (Office)</option>
                                <option value="canon">Canon PIXMA (Gudang)</option>
                            </select>
                            <button id="scanPrintersBtn" style="padding: 12px 20px; background: #2196F3; color: white; border: none; border-radius: 8px; cursor: pointer;">🔍 Scan Network</button>
                        </div>
                        <div style="margin-top: 20px; display: flex; gap: 15px;">
                            <button id="printNowBtn" style="flex: 1; padding: 15px; background: #4CAF50; color: white; border: none; border-radius: 10px; font-size: 1.1rem; cursor: pointer;">🖨️ PRINT NOW</button>
                            <button id="savePdfBtn" style="flex: 1; padding: 15px; background: #FF9800; color: white; border: none; border-radius: 10px; font-size: 1.1rem; cursor: pointer;">📄 SAVE PDF</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        const div = document.createElement('div');
        div.innerHTML = html;
        document.body.appendChild(div);

        // Attach listeners
        document.getElementById('printCloseBtn').addEventListener('click', closePrintPreview);
        document.getElementById('scanPrintersBtn').addEventListener('click', scanPrinters);
        document.getElementById('printNowBtn').addEventListener('click', printDocument);
        document.getElementById('savePdfBtn').addEventListener('click', saveAsPDF);
    }

    function openPrintPreview(content, title = "Document") {
        createPrintUI();
        const modal = document.getElementById('printPreviewModal');
        const contentDiv = document.getElementById('printContent');
        contentDiv.innerHTML = `
            <div style="border: 2px dashed #ddd; padding: 30px; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="font-size: 2rem;">🖨️</div>
                    <h2 style="color: #333;">${title}</h2>
                    <div style="color: #666; font-size: 0.9rem;">Dream OS v13.0 - WiFi Smart Printing</div>
                </div>
                ${content}
                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
                    <div style="display: flex; justify-content: space-between; color: #666; font-size: 0.8rem;">
                        <div>Printed from: Dream OS v13.0<br>Date: ${new Date().toLocaleString('id-ID')}</div>
                        <div style="text-align: right;"><div id="printQRCode"></div><div style="margin-top: 5px;">Scan verifikasi</div></div>
                    </div>
                </div>
            </div>
        `;
        // Generate QR if available
        if (window.DreamOSQR) {
            try {
                window.DreamOSQR.generateQR(`DOC-${Date.now()}`, 'printQRCode');
            } catch (err) {
                error('QR generate error:', err);
            }
        }
        modal.style.display = 'block';
        log('Print preview opened:', title);
    }

    function closePrintPreview() {
        const modal = document.getElementById('printPreviewModal');
        if (modal) modal.style.display = 'none';
        log('Print preview closed');
    }

    function scanPrinters() {
        const select = document.getElementById('printerSelect');
        if (!select) return;
        select.innerHTML = '<option value="">Scanning network...</option>';
        // Simulate network scan
        setTimeout(() => {
            select.innerHTML = `
                <option value="">-- Select WiFi Printer --</option>
                <option value="epson">🟢 EPSON L3150 (WiFi - Ready)</option>
                <option value="hp">🟢 HP LaserJet MFP (Office)</option>
                <option value="canon">🔴 Canon PIXMA (Offline)</option>
            `;
            alert('✅ 3 printers found on network!');
            log('Printers scanned');
        }, 1500);
    }

    function printDocument() {
        const printer = document.getElementById('printerSelect')?.value;
        if (!printer) {
            alert('Pilih printer terlebih dahulu!');
            return;
        }
        alert(`🖨️ Mencetak ke ${printer}... (simulasi)`);
        log('Printing to', printer);
        closePrintPreview();
    }

    function saveAsPDF() {
        alert('📄 Generating PDF... (simulasi)');
        log('PDF saved');
        closePrintPreview();
    }

    // Public API
    return {
        openPrintPreview,
        closePrintPreview,
        scanPrinters,
        printDocument,
        saveAsPDF
    };
})();

console.log('✅ Print System Module Loaded');