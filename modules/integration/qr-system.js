// ==================== QR CODE MODULE ====================
window.DreamOSQR = (function() {
    function log(...args) { console.log('[🔲 QR]', ...args); }
    function warn(...args) { console.warn('[🔲 QR]', ...args); }
    function error(...args) { console.error('[🔲 QR]', ...args); }

    function generateQR(data, elementId) {
        const el = document.getElementById(elementId);
        if (!el) {
            warn(`Element #${elementId} not found`);
            return;
        }
        try {
            const size = 100;
            el.innerHTML = `
                <div style="width: ${size}px; height: ${size}px; background: #f5f5f5; border: 2px solid #333; display: grid; grid-template-columns: repeat(10,1fr); grid-template-rows: repeat(10,1fr);">
                    ${Array(100).fill().map(() => `<div style="background: ${Math.random() > 0.5 ? '#000' : '#fff'};"></div>`).join('')}
                </div>
            `;
            log('QR generated for', data);
        } catch (err) {
            error('QR generation error:', err);
        }
    }

    function openQRScanner() {
        if (!document.getElementById('qrScannerModal')) {
            const modal = document.createElement('div');
            modal.id = 'qrScannerModal';
            modal.style.cssText = 'display: none; position: fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:9997;';
            modal.innerHTML = `
                <div style="position: absolute; top:50%; left:50%; transform:translate(-50%,-50%); text-align:center; color:white;">
                    <div style="width:300px; height:300px; border:3px solid white; margin:0 auto;"></div>
                    <div style="margin-top:20px; font-size:1.2rem;">Scan QR Code...</div>
                    <button id="closeQRScannerBtn" style="margin-top:30px; padding:15px 30px; background:#ff4757; color:white; border:none; border-radius:10px; cursor:pointer;">TUTUP</button>
                </div>
            `;
            document.body.appendChild(modal);
            document.getElementById('closeQRScannerBtn').addEventListener('click', closeQRScanner);
        }

        const modal = document.getElementById('qrScannerModal');
        modal.style.display = 'block';
        log('QR scanner opened');

        // Simulate scan after 2s
        setTimeout(() => {
            closeQRScanner();
            const dummyData = {
                type: 'MAINTENANCE_TICKET',
                id: 'MT-' + Math.floor(Math.random() * 10000),
                location: 'Aula SMP',
                issue: 'AC Bocor'
            };
            if (confirm(`✅ QR Code terdeteksi!\nType: ${dummyData.type}\nID: ${dummyData.id}\n\nBuka detail?`)) {
                if (window.EventBus) {
                    window.EventBus.emit('qr:scanned', dummyData);
                }
                // Navigasi ke maintenance module (contoh)
                window.location.hash = '#maintenance';
            }
        }, 2000);
    }

    function closeQRScanner() {
        const modal = document.getElementById('qrScannerModal');
        if (modal) modal.style.display = 'none';
        log('QR scanner closed');
    }

    return {
        generateQR,
        openQRScanner,
        closeQRScanner
    };
})();

console.log('✅ QR System Module Loaded');