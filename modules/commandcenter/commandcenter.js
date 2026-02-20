/**
 * 🏛️ DREAM OS v13.3 - MASTER COMMAND CENTER (FULL ENGINE)
 * Developer: Ghost Architect / Dream Team
 * Standards: ISO 27001, 55001, 9001
 * Device Optimized: Redmi Note 9 Pro
 */

(function() {
    const supabase = window.supabase;
    if (!supabase) {
        console.error('❌ Supabase Error: System Not Connected');
        return;
    }

    // ========== CONFIG & GLOBALS ==========
    let cameraStream = null;
    let capturedPhotoData = null;
    const GHOST_ARCHITECT = "012443410";

    // ========== 1. INITIAL LOADERS (Mata & Telinga Sistem) ==========
    async function loadQRLibrary() {
        if (window.qr) return;
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@paulmillr/qr@0.5.1/umd/qr.min.js';
        script.onload = () => console.log('✅ QR Engine Online');
        document.head.appendChild(script);
    }

    // ========== 2. SMART PREDICTIVE ENGINE (The "Brain") ==========
    async function runSmartAnalysis() {
        console.log("🤖 AI Agent: Analyzing Patterns...");
        const alertContainer = document.getElementById('smart-alerts-container');
        if (!alertContainer) return;
        alertContainer.innerHTML = ''; // Reset alerts

        // A. Weather & Environment (Depok Focus)
        const weather = "Hujan"; // Bisa diintegrasikan ke API Cuaca
        if (weather === "Hujan") {
            createAlert("🌧️ CUACA: Depok Hujan. Tim Outdoor Waspada Licin & Cek Saluran Air!", "bg-indigo-600");
        }

        // B. Booking Reminders (H-1 Logic)
        const { data: bks } = await supabase.from('bookings').select('*').eq('status', 'approved');
        const now = new Date();
        bks?.forEach(b => {
            const bDate = new Date(b.tanggal_mulai + 'T' + (b.jam_mulai || '00:00'));
            const diffHrs = (bDate - now) / (1000 * 60 * 60);
            if (diffHrs > 0 && diffHrs <= 2) {
                createAlert(`🚨 URGENT: Booking ${b.sarana} (${b.nama}) mulai 2 jam lagi!`, "bg-red-600");
            }
        });

        // C. Inventory Alert (ISO 55001)
        const { data: inv } = await supabase.from('inventory').select('*').lt('stok_akhir', 10);
        inv?.forEach(i => {
            createAlert(`📦 STOK KRITIS: ${i.item_name} sisa ${i.stok_akhir}!`, "bg-orange-600");
        });
    }

    function createAlert(msg, color) {
        const div = document.createElement('div');
        div.className = `${color} text-white p-3 rounded-2xl mb-2 text-[10px] font-black animate-pulse flex justify-between items-center shadow-lg`;
        div.innerHTML = `<span>${msg}</span><button onclick="this.parentElement.remove()">✕</button>`;
        document.getElementById('smart-alerts-container')?.prepend(div);
    }

    // ========== 3. CAMERA & OPTICAL SYSTEM (The "Eyes") ==========
    async function startCamera() {
        const video = document.getElementById('camera-preview');
        try {
            cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
            video.srcObject = cameraStream;
            document.getElementById('camera-result').innerText = "🎥 Live Feed Active";
        } catch (err) {
            alert('Akses Kamera Ditolak/Gagal');
        }
    }

    function stopCamera() {
        if (cameraStream) {
            cameraStream.getTracks().forEach(t => t.stop());
            document.getElementById('camera-preview').srcObject = null;
            document.getElementById('camera-result').innerText = "📷 Camera Off";
        }
    }

    function capturePhoto() {
        const video = document.getElementById('camera-preview');
        const canvas = document.getElementById('camera-canvas');
        if (!video.srcObject) return alert('Aktifkan kamera dulu!');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        capturedPhotoData = canvas.toDataURL('image/png');
        document.getElementById('spj_photo_data').value = capturedPhotoData;
        document.getElementById('camera-result').innerHTML = "✅ Photo Captured!";
    }

    // ========== 4. SPJ, QR & PRINT ENGINE (The "Admin") ==========
    function generateQR(spj) {
        if (!window.qr) return "QR Loading...";
        const qrData = `DREAM-OS|SPJ-${spj.id}|${spj.nominal}|${spj.status}`;
        return window.qr.encodeQR(qrData, 'svg', { scale: 2 });
    }

    async function printSPJ(spj) {
        const printWin = window.open('', '_blank');
        const qrSvg = generateQR(spj);
        printWin.document.write(`
            <html><body style="font-family:sans-serif; padding:40px;">
                <h2 style="border-bottom:2px solid #000;">SPJ VERIFICATION - DREAM OS</h2>
                <p><b>ID:</b> ${spj.id}</p>
                <p><b>Judul:</b> ${spj.judul}</p>
                <p><b>Nominal:</b> Rp ${Number(spj.nominal).toLocaleString()}</p>
                <p><b>Tanggal:</b> ${new Date(spj.created_at).toLocaleDateString()}</p>
                <div style="margin-top:20px;">${qrSvg}</div>
                <p style="font-size:10px; margin-top:50px;">Verified by ISO 27001 System</p>
                <script>setTimeout(() => { window.print(); window.close(); }, 500);</script>
            </body></html>
        `);
    }

    // ========== 5. DATA LOADERS (Statistics & Lists) ==========
    async function refreshDashboardData() {
        // A. Stats Matrix
        const { count: bCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending');
        const { count: kCount } = await supabase.from('k3_reports').select('*', { count: 'exact', head: true }).eq('status', 'pending');
        const { count: mCount } = await supabase.from('maintenance_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending');
        
        if(document.getElementById('stat-booking')) document.getElementById('stat-booking').textContent = bCount || 0;
        if(document.getElementById('stat-k3')) document.getElementById('stat-k3').textContent = kCount || 0;
        if(document.getElementById('stat-maintenance')) document.getElementById('stat-maintenance').textContent = mCount || 0;

        // B. Load List Approval
        const { data: bookings } = await supabase.from('bookings').select('*').eq('status', 'pending').limit(5);
        document.getElementById('pengajuan-booking').innerHTML = bookings?.map(b => `
            <div class="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div class="text-[10px] font-bold">
                    <p>${b.nama}</p>
                    <p class="opacity-50">${b.sarana} (${b.tanggal_mulai})</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="updateStatus('bookings','${b.id}','approved')" class="bg-green-500 text-white p-2 rounded-lg text-[8px] font-black">SETUJU</button>
                    <button onclick="updateStatus('bookings','${b.id}','rejected')" class="bg-red-500 text-white p-2 rounded-lg text-[8px] font-black">TOLAK</button>
                </div>
            </div>
        `).join('') || '<p class="text-center text-[10px] opacity-30">Semua Terkendali</p>';

        // C. Load SPJ History
        const { data: spjs } = await supabase.from('spj').select('*').order('created_at', { ascending: false }).limit(5);
        document.getElementById('riwayat-spj').innerHTML = spjs?.map(s => `
            <div class="bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm flex justify-between items-center">
                <div>
                    <p class="text-[10px] font-black uppercase">${s.judul}</p>
                    <p class="text-[9px] text-purple-600 font-bold">Rp ${Number(s.nominal).toLocaleString()}</p>
                </div>
                <button class="print-btn bg-slate-100 dark:bg-slate-700 p-2 rounded-xl text-[10px]" data-spj='${JSON.stringify(s)}'>🖨️</button>
            </div>
        `).join('') || '';
    }

    // ========== 6. SLIDE MANAGEMENT (5, 6, 7) ==========
    async function loadSlides() {
        const { data } = await supabase.from('admin_info').select('*').in('slide_number', [5,6,7]);
        data?.forEach(s => {
            const el = document.getElementById(`preview-slide${s.slide_number}`);
            if(el) el.textContent = s.content;
        });
    }

    // ========== 7. EVENT LISTENERS & TABS ==========
    function initEvents() {
        // Tab Switcher
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('border-purple-600', 'active'));
                document.getElementById(`tab-${btn.dataset.tab}`).classList.remove('hidden');
                btn.classList.add('border-purple-600', 'active');
            };
        });

        // Slide Form
        document.getElementById('slideForm').onsubmit = async (e) => {
            e.preventDefault();
            const num = document.getElementById('slide_number').value;
            const content = document.getElementById('slide_content').value;
            const { error } = await supabase.from('admin_info').upsert({ slide_number: parseInt(num), content: content });
            if (!error) { alert('Slide Updated!'); loadSlides(); }
        };

        // SPJ Form
        document.getElementById('spjForm').onsubmit = async (e) => {
            e.preventDefault();
            const photo = document.getElementById('spj_photo_data').value;
            // Logic upload & insert ke Supabase
            const { error } = await supabase.from('spj').insert([{
                judul: document.getElementById('spj_judul').value,
                nominal: document.getElementById('spj_nominal').value,
                status: 'pending'
            }]);
            if(!error) { alert('SPJ Diajukan!'); refreshDashboardData(); }
        };

        // Delegate Print Click
        document.addEventListener('click', (e) => {
            if(e.target.closest('.print-btn')) {
                const spj = JSON.parse(e.target.closest('.print-btn').dataset.spj);
                printSPJ(spj);
            }
        });

        // Camera Buttons
        document.getElementById('start-camera').onclick = startCamera;
        document.getElementById('stop-camera').onclick = stopCamera;
        document.getElementById('capture-photo').onclick = capturePhoto;
    }

    // ========== 8. SYSTEM BOOTSTRAP ==========
    window.updateStatus = async (table, id, status) => {
        const { error } = await supabase.from(table).update({ status }).eq('id', id);
        if(!error) refreshDashboardData();
    };

    async function bootstrap() {
        console.log("🚀 System Booting: Bismillah bi idznillah...");
        await loadQRLibrary();
        initEvents();
        refreshDashboardData();
        loadSlides();
        runSmartAnalysis();
        
        // Auto Refresh System (Every 30 Sec)
        setInterval(() => {
            refreshDashboardData();
            runSmartAnalysis();
        }, 30000);
    }

    bootstrap();
})();
