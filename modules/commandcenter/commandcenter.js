alert('✅ commandcenter.js dimuat (dengan QR & Kamera)');

(function() {
    const supabase = window.supabase;
    if (!supabase) {
        alert('❌ supabase tidak terdefinisi!');
        return;
    }

    // ========== LOAD QR CODE LIBRARY (dynamic) ==========
    async function loadQRLibrary() {
        if (window.qr) return;
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@paulmillr/qr@0.5.1/umd/qr.min.js';
        script.onload = () => console.log('✅ QR library loaded');
        document.head.appendChild(script);
    }
    loadQRLibrary();

    // ========== KAMERA FUNGSI ==========
    let cameraStream = null;
    let capturedPhotoData = null;

    async function startCamera() {
        const video = document.getElementById('camera-preview');
        if (!video) return;
        try {
            cameraStream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 640, height: 480 },
                audio: false 
            });
            video.srcObject = cameraStream;
            alert('Kamera aktif, silakan ambil foto');
        } catch (err) {
            console.error('Gagal akses kamera:', err);
            alert('Tidak dapat mengakses kamera. Pastikan izin diberikan dan HTTPS digunakan.');
        }
    }

    function stopCamera() {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            cameraStream = null;
            const video = document.getElementById('camera-preview');
            if (video) video.srcObject = null;
        }
    }

    function capturePhoto() {
        const video = document.getElementById('camera-preview');
        const canvas = document.getElementById('camera-canvas');
        const resultDiv = document.getElementById('camera-result');
        const hiddenInput = document.getElementById('spj_photo_data');
        if (!video || !canvas || !video.srcObject) {
            alert('Kamera belum aktif');
            return;
        }
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataURL = canvas.toDataURL('image/png');
        capturedPhotoData = dataURL;
        hiddenInput.value = dataURL;
        resultDiv.innerHTML = '✅ Foto berhasil diambil!';
        // Tampilkan preview kecil
        const img = document.createElement('img');
        img.src = dataURL;
        img.className = 'w-16 h-16 object-cover rounded mt-1';
        resultDiv.appendChild(img);
    }

    // ========== GENERATE QR CODE ==========
    function generateQRForSPJ(spj) {
        if (!window.qr) {
            console.warn('QR library belum siap');
            return '<div class="text-red-500">QR library loading...</div>';
        }
        try {
            // Data yang akan diencode ke QR
            const qrData = `SPJ:${spj.id}|${spj.judul}|${spj.nominal}|${new Date(spj.created_at).toLocaleDateString()}`;
            // Generate SVG QR
            const qrSvg = window.qr.encodeQR(qrData, 'svg', { scale: 2, border: 1 });
            return qrSvg;
        } catch (err) {
            console.error('Gagal generate QR:', err);
            return '<div class="text-red-500">Gagal generate QR</div>';
        }
    }

    // ========== PRINT SPJ (WiFi Printer) ==========
    async function printSPJ(spj) {
        // Sederhana: generate PDF dan buka dialog print
        // Untuk printer WiFi, kita asumsikan browser bisa print ke printer default
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Popup diblokir. Izinkan popup untuk mencetak.');
            return;
        }
        const qrSvg = window.qr ? window.qr.encodeQR(`SPJ:${spj.id}|${spj.judul}`, 'svg', { scale: 2 }) : '';
        printWindow.document.write(`
            <html>
            <head><title>Cetak SPJ</title>
            <style>
                body { font-family: sans-serif; padding: 20px; }
                .header { font-size: 20px; font-weight: bold; margin-bottom: 20px; }
                .qr { margin: 20px 0; }
                table { border-collapse: collapse; width: 100%; }
                td, th { border: 1px solid #ccc; padding: 8px; text-align: left; }
            </style>
            </head>
            <body>
                <div class="header">SURAT PERTANGGUNGJAWABAN (SPJ)</div>
                <table>
                    <tr><th>ID</th><td>${spj.id}</td></tr>
                    <tr><th>Judul</th><td>${spj.judul}</td></tr>
                    <tr><th>Nominal</th><td>Rp ${spj.nominal?.toLocaleString() || '-'}</td></tr>
                    <tr><th>Tanggal</th><td>${new Date(spj.created_at).toLocaleDateString()}</td></tr>
                    <tr><th>Status</th><td>${spj.status}</td></tr>
                </table>
                <div class="qr">
                    <h4>QR Code Verifikasi:</h4>
                    ${qrSvg}
                </div>
                <p>Dicetak dari Dream OS Command Center</p>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    }

    // ========== LOAD STATISTIK ==========
    async function loadStats() {
        const { count: bookingCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending');
        document.getElementById('stat-booking').textContent = bookingCount || 0;
        const { count: k3Count } = await supabase.from('k3_reports').select('*', { count: 'exact', head: true }).eq('status', 'pending');
        document.getElementById('stat-k3').textContent = k3Count || 0;
        const { count: maintenanceCount } = await supabase.from('maintenance_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending');
        document.getElementById('stat-maintenance').textContent = maintenanceCount || 0;
    }

    // ========== LOAD APPROVAL ==========
    async function loadApprovals() {
        const bookingDiv = document.getElementById('approval-booking');
        const { data: bookings } = await supabase.from('bookings').select('id, nama, sarana, tanggal_mulai').eq('status', 'pending').limit(5);
        if (bookings?.length) {
            bookingDiv.innerHTML = bookings.map(b => `
                <div class="flex justify-between items-center border-b py-2">
                    <span>${b.nama} - ${b.sarana} (${b.tanggal_mulai})</span>
                    <div>
                        <button class="approve-booking text-green-500 mr-2" data-id="${b.id}">✅ Setuju</button>
                        <button class="reject-booking text-red-500" data-id="${b.id}">❌ Tolak</button>
                    </div>
                </div>
            `).join('');
        } else {
            bookingDiv.innerHTML = '<p class="opacity-60">Tidak ada pending booking</p>';
        }

        const k3Div = document.getElementById('approval-k3');
        const { data: k3s } = await supabase.from('k3_reports').select('id, tanggal, lokasi, jenis_laporan, pelapor').eq('status', 'pending').limit(5);
        if (k3s?.length) {
            k3Div.innerHTML = k3s.map(k => `
                <div class="flex justify-between items-center border-b py-2">
                    <span>${k.tanggal} - ${k.lokasi} (${k.jenis_laporan}) - ${k.pelapor}</span>
                    <div>
                        <button class="approve-k3 text-green-500 mr-2" data-id="${k.id}">✅ Proses</button>
                        <button class="reject-k3 text-red-500" data-id="${k.id}">❌ Tolak</button>
                    </div>
                </div>
            `).join('');
        } else {
            k3Div.innerHTML = '<p class="opacity-60">Tidak ada pending K3</p>';
        }
    }

    // ========== LOAD PENGAJUAN BOOKING ==========
    async function loadPengajuanBooking() {
        const div = document.getElementById('pengajuan-booking');
        const { data: bookings } = await supabase.from('bookings').select('id, nama, sarana, tanggal_mulai, jam_mulai').eq('status', 'pending').limit(10);
        if (bookings?.length) {
            div.innerHTML = bookings.map(b => `
                <div class="flex justify-between items-center border-b py-2">
                    <span>${b.nama} - ${b.sarana} (${b.tanggal_mulai} ${b.jam_mulai || ''})</span>
                    <div>
                        <button class="approve-booking-special text-green-500 mr-2" data-id="${b.id}">✅ Setujui</button>
                        <button class="reject-booking-special text-red-500" data-id="${b.id}">❌ Tolak</button>
                    </div>
                </div>
            `).join('');
        } else {
            div.innerHTML = '<p class="opacity-60">Tidak ada pengajuan booking</p>';
        }
    }

    // ========== LOAD RIWAYAT SPJ + QR ==========
    async function loadSPJ() {
        const div = document.getElementById('riwayat-spj');
        const { data } = await supabase.from('spj').select('*').order('created_at', { ascending: false }).limit(10);
        if (data?.length) {
            div.innerHTML = data.map(s => `
                <div class="border rounded-lg p-3 mb-2">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <div class="font-semibold">${s.judul}</div>
                            <div class="text-xs">Nominal: Rp ${s.nominal?.toLocaleString() || '-'}</div>
                            <div class="text-xs">Status: <span class="${s.status === 'pending' ? 'text-yellow-600' : 'text-green-600'}">${s.status}</span></div>
                        </div>
                        <div class="flex space-x-2">
                            <button class="print-spj text-blue-600 text-xs px-2 py-1 border rounded" data-id="${s.id}" data-judul="${s.judul}" data-nominal="${s.nominal}" data-created="${s.created_at}">🖨️ Cetak</button>
                        </div>
                    </div>
                    <div class="mt-2 qr-container-${s.id}">${generateQRForSPJ(s)}</div>
                </div>
            `).join('');
        } else {
            div.innerHTML = '<p class="opacity-60">Belum ada pengajuan SPJ</p>';
        }
    }

    // ========== LOAD SLIDE INFO ==========
    async function loadSlideInfo() {
        const { data } = await supabase.from('admin_info').select('slide_number, content').order('created_at', { ascending: false });
        if (data) {
            const slide5 = data.find(d => d.slide_number === 5);
            const slide6 = data.find(d => d.slide_number === 6);
            const slide7 = data.find(d => d.slide_number === 7);
            document.getElementById('preview-slide5').textContent = slide5?.content || '-';
            document.getElementById('preview-slide6').textContent = slide6?.content || '-';
            document.getElementById('preview-slide7').textContent = slide7?.content || '-';
        }
    }

    // ========== UPDATE SLIDE ==========
    document.getElementById('slideForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const slideNumber = parseInt(document.getElementById('slide_number').value);
        const content = document.getElementById('slide_content').value.trim();
        if (!content) {
            alert('Konten tidak boleh kosong');
            return;
        }
        const { error } = await supabase.from('admin_info').insert([{
            slide_number: slideNumber,
            content: content,
            created_by: 'Admin'
        }]);
        if (error) {
            alert('Gagal update slide: ' + error.message);
        } else {
            alert('Slide berhasil diupdate!');
            document.getElementById('slide_content').value = '';
            loadSlideInfo();
        }
    });

    // ========== SUBMIT SPJ ==========
    document.getElementById('spjForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const judul = document.getElementById('spj_judul').value.trim();
        const nominal = parseFloat(document.getElementById('spj_nominal').value);
        const photoData = document.getElementById('spj_photo_data').value;
        const fileInput = document.getElementById('spj_file');
        const file = fileInput.files[0];

        if (!judul || !nominal) {
            alert('Judul dan nominal harus diisi');
            return;
        }

        let fileUrl = null;
        // Upload foto dari kamera jika ada
        if (photoData) {
            // Konversi dataURL ke Blob untuk upload
            const response = await fetch(photoData);
            const blob = await response.blob();
            const fileName = `spj/photo_${Date.now()}.png`;
            const { error } = await supabase.storage.from('spj').upload(fileName, blob);
            if (error) {
                alert('Gagal upload foto: ' + error.message);
                return;
            }
            fileUrl = supabase.storage.from('spj').getPublicUrl(fileName).data.publicUrl;
        } else if (file) {
            const fileName = `spj/${Date.now()}_${file.name}`;
            const { error } = await supabase.storage.from('spj').upload(fileName, file);
            if (error) {
                alert('Gagal upload file: ' + error.message);
                return;
            }
            fileUrl = supabase.storage.from('spj').getPublicUrl(fileName).data.publicUrl;
        }

        const { error } = await supabase.from('spj').insert([{
            judul,
            nominal,
            file_url: fileUrl,
            status: 'pending',
            created_by: 'Admin'
        }]);

        if (error) {
            alert('Gagal simpan SPJ: ' + error.message);
        } else {
            alert('SPJ berhasil diajukan!');
            document.getElementById('spjForm').reset();
            document.getElementById('spj_photo_data').value = '';
            document.getElementById('camera-result').innerHTML = 'Belum ada foto';
            if (cameraStream) stopCamera();
            loadSPJ();
        }
    });

    // ========== EVENT LISTENER KAMERA ==========
    document.getElementById('start-camera')?.addEventListener('click', startCamera);
    document.getElementById('stop-camera')?.addEventListener('click', stopCamera);
    document.getElementById('capture-photo')?.addEventListener('click', capturePhoto);

    // ========== HANDLE PRINT SPJ (Event Delegation) ==========
    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('print-spj')) {
            const id = e.target.dataset.id;
            const judul = e.target.dataset.judul;
            const nominal = e.target.dataset.nominal;
            const created = e.target.dataset.created;
            const spj = { id, judul, nominal, created_at: created };
            printSPJ(spj);
        }
        // Approval biasa
        if (e.target.classList.contains('approve-booking')) {
            const id = e.target.dataset.id;
            await supabase.from('bookings').update({ status: 'approved' }).eq('id', id);
            loadApprovals(); loadStats(); loadPengajuanBooking();
        }
        if (e.target.classList.contains('reject-booking')) {
            const id = e.target.dataset.id;
            await supabase.from('bookings').update({ status: 'rejected' }).eq('id', id);
            loadApprovals(); loadStats(); loadPengajuanBooking();
        }
        if (e.target.classList.contains('approve-k3')) {
            const id = e.target.dataset.id;
            await supabase.from('k3_reports').update({ status: 'processed' }).eq('id', id);
            loadApprovals(); loadStats();
        }
        if (e.target.classList.contains('reject-k3')) {
            const id = e.target.dataset.id;
            await supabase.from('k3_reports').update({ status: 'rejected' }).eq('id', id);
            loadApprovals(); loadStats();
        }
        if (e.target.classList.contains('approve-booking-special')) {
            const id = e.target.dataset.id;
            await supabase.from('bookings').update({ status: 'approved' }).eq('id', id);
            loadPengajuanBooking(); loadApprovals(); loadStats();
        }
        if (e.target.classList.contains('reject-booking-special')) {
            const id = e.target.dataset.id;
            await supabase.from('bookings').update({ status: 'rejected' }).eq('id', id);
            loadPengajuanBooking(); loadApprovals(); loadStats();
        }
    });

    // ========== TAB NAVIGATION ==========
    function initTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.tab-btn').forEach(b => {
                    b.classList.remove('active', 'text-purple-600', 'border-b-2', 'border-purple-600');
                    b.classList.add('text-gray-600', 'dark:text-gray-300');
                });
                this.classList.add('active', 'text-purple-600', 'border-b-2', 'border-purple-600');
                document.querySelectorAll('.tab-content').forEach(tc => tc.classList.add('hidden'));
                const tabId = this.dataset.tab;
                document.getElementById(`tab-${tabId}`).classList.remove('hidden');
            });
        });
    }

    // ========== INIT ==========
    initTabs();
    loadStats();
    loadApprovals();
    loadPengajuanBooking();
    loadSPJ();
    loadSlideInfo();

    // Auto refresh setiap 30 detik
    setInterval(() => {
        loadStats();
        loadApprovals();
        loadPengajuanBooking();
        loadSPJ();
    }, 30000);
})();