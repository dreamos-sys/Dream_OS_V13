/**
 * 🏛️ DREAM OS v13.3 - MASTER COMMAND CENTER (FULL ENGINE + AI + VOICE)
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
    let recognition = null;

    // ========== 1. VOICE COMMAND (MIC BUTTON) ==========
    function initVoiceButton() {
        const micBtn = document.getElementById('mic-button');
        if (!micBtn) return;

        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            micBtn.style.display = 'none';
            return;
        }

        micBtn.addEventListener('click', () => {
            if (recognition && recognition.recognizing) {
                recognition.stop();
                micBtn.classList.remove('bg-red-500');
                micBtn.classList.add('bg-gray-500');
                micBtn.title = 'Aktifkan Voice Command';
                recognition.recognizing = false;
            } else {
                startVoiceRecognition(micBtn);
            }
        });
    }

    function startVoiceRecognition(btn) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.lang = 'id-ID';
        recognition.interimResults = false;

        recognition.onstart = () => {
            btn.classList.remove('bg-gray-500');
            btn.classList.add('bg-red-500');
            btn.title = 'Matikan Voice Command';
            recognition.recognizing = true;
        };

        recognition.onresult = (event) => {
            const transcript = event.results[event.resultIndex][0].transcript.toLowerCase().trim();
            console.log('🎤 Perintah:', transcript);

            // Navigasi
            if (transcript.includes('buka booking')) window.location.hash = '#booking';
            else if (transcript.includes('buka k3')) window.location.hash = '#k3';
            else if (transcript.includes('buka sekuriti')) window.location.hash = '#sekuriti';
            else if (transcript.includes('buka janitor indoor')) window.location.hash = '#janitor-indoor';
            else if (transcript.includes('buka janitor outdoor')) window.location.hash = '#janitor-outdoor';
            else if (transcript.includes('buka stok')) window.location.hash = '#stok';
            else if (transcript.includes('buka maintenance')) window.location.hash = '#maintenance';
            else if (transcript.includes('buka asset')) window.location.hash = '#asset';
            else if (transcript.includes('buka command center')) window.location.hash = '#commandcenter';
            else if (transcript.includes('logout')) {
                sessionStorage.removeItem('allowed_modules');
                window.location.href = '/Dream_OS_V13/';
            }
        };

        recognition.onerror = (event) => {
            console.error('Voice error:', event.error);
            btn.classList.remove('bg-red-500');
            btn.classList.add('bg-gray-500');
            recognition.recognizing = false;
        };

        recognition.onend = () => {
            btn.classList.remove('bg-red-500');
            btn.classList.add('bg-gray-500');
            recognition.recognizing = false;
        };

        recognition.start();
    }

    // ========== 2. AI ASSISTANT (TAB AI) ==========
    async function askAI() {
        const question = document.getElementById('ai-question').value;
        const answerDiv = document.getElementById('ai-answer');
        if (!question) return;

        answerDiv.innerHTML = '<p class="text-sm opacity-70">⏳ Memikirkan jawaban...</p>';

        try {
            let answer = '';
            if (question.includes('booking pending') || question.includes('booking hari ini')) {
                const { count } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending');
                answer = `📅 Booking pending: ${count || 0}`;
            } else if (question.includes('k3 pending') || question.includes('laporan k3')) {
                const { count } = await supabase.from('k3_reports').select('*', { count: 'exact', head: true }).eq('status', 'pending');
                answer = `⚠️ Laporan K3 pending: ${count || 0}`;
            } else if (question.includes('maintenance pending')) {
                const { count } = await supabase.from('maintenance_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending');
                answer = `🔧 Maintenance pending: ${count || 0}`;
            } else if (question.includes('selamat pagi') || question.includes('halo')) {
                answer = `☀️ Selamat pagi, My Bro! Semangat puasa!`;
            } else if (question.includes('siapa')) {
                answer = `Saya Dream OS AI Assistant, siap membantu!`;
            } else {
                answer = `Maaf, saya belum bisa menjawab pertanyaan itu. Coba tanya tentang booking, K3, atau maintenance.`;
            }

            answerDiv.innerHTML = `<p class="text-sm">${answer}</p>`;
        } catch (err) {
            answerDiv.innerHTML = `<p class="text-sm text-red-500">Error: ${err.message}</p>`;
        }
    }

    // ========== 3. LOAD QR LIBRARY ==========
    async function loadQRLibrary() {
        if (window.qr) return;
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@paulmillr/qr@0.5.1/umd/qr.min.js';
        script.onload = () => console.log('✅ QR Engine Online');
        document.head.appendChild(script);
    }

    // ========== 4. SMART PREDICTIVE ENGINE ==========
    async function runSmartAnalysis() {
        console.log("🤖 AI Agent: Analyzing Patterns...");
        const alertContainer = document.getElementById('smart-alerts-container');
        if (!alertContainer) return;
        alertContainer.innerHTML = '';

        // A. Weather & Environment (Depok Focus)
        const weather = "Hujan";
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
        const { data: inv } = await supabase.from('stok').select('*').lt('jumlah', 10);
        inv?.forEach(i => {
            createAlert(`📦 STOK KRITIS: ${i.nama_barang} sisa ${i.jumlah}!`, "bg-orange-600");
        });
    }

    function createAlert(msg, color) {
        const div = document.createElement('div');
        div.className = `${color} text-white p-3 rounded-2xl mb-2 text-[10px] font-black animate-pulse flex justify-between items-center shadow-lg`;
        div.innerHTML = `<span>${msg}</span><button onclick="this.parentElement.remove()">✕</button>`;
        document.getElementById('smart-alerts-container')?.prepend(div);
    }

    // ========== 5. CAMERA & OPTICAL SYSTEM ==========
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

    // ========== 6. SPJ, QR & PRINT ENGINE ==========
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

    // ========== 7. DATA LOADERS ==========
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
        const appBookingDiv = document.getElementById('approval-booking');
        if (appBookingDiv) {
            appBookingDiv.innerHTML = bookings?.map(b => `
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
            `).join('') || '<p class="text-center text-[10px] opacity-30">Tidak ada pending booking</p>';
        }

        // C. Load SPJ History
        const { data: spjs } = await supabase.from('spj').select('*').order('created_at', { ascending: false }).limit(5);
        const riwayatSpjDiv = document.getElementById('riwayat-spj');
        if (riwayatSpjDiv) {
            riwayatSpjDiv.innerHTML = spjs?.map(s => `
                <div class="bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm flex justify-between items-center">
                    <div>
                        <p class="text-[10px] font-black uppercase">${s.judul}</p>
                        <p class="text-[9px] text-purple-600 font-bold">Rp ${Number(s.nominal).toLocaleString()}</p>
                    </div>
                    <button class="print-btn bg-slate-100 dark:bg-slate-700 p-2 rounded-xl text-[10px]" data-spj='${JSON.stringify(s)}'>🖨️</button>
                </div>
            `).join('') || '';
        }
    }

    // ========== 8. SLIDE MANAGEMENT ==========
    async function loadSlides() {
        const { data } = await supabase.from('admin_info').select('*').in('slide_number', [5,6,7]);
        data?.forEach(s => {
            const el = document.getElementById(`preview-slide${s.slide_number}`);
            if(el) el.textContent = s.content;
        });
    }

    // ========== 9. ANALYTICS (Chart.js) ==========
    let bookingChart = null;

    async function loadAnalytics() {
        try {
            // Ambil data booking 7 hari terakhir
            const today = new Date();
            const dates = [];
            const counts = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(today.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                dates.push(dateStr.slice(5));
                const { count } = await supabase
                    .from('bookings')
                    .select('*', { count: 'exact', head: true })
                    .eq('tanggal_mulai', dateStr);
                counts.push(count || 0);
            }

            const ctx = document.getElementById('bookingChart')?.getContext('2d');
            if (!ctx) return;

            if (bookingChart) {
                bookingChart.data.labels = dates;
                bookingChart.data.datasets[0].data = counts;
                bookingChart.update();
            } else {
                bookingChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: dates,
                        datasets: [{
                            label: 'Jumlah Booking per Hari',
                            data: counts,
                            borderColor: '#3b82f6',
                            backgroundColor: 'rgba(59, 130, 246, 0.2)',
                            tension: 0.3,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            y: { beginAtZero: true, ticks: { stepSize: 1 } }
                        }
                    }
                });
            }

            // Prediksi maintenance sederhana
            const maintDiv = document.getElementById('maintenancePredict');
            if (maintDiv) {
                const { data: assets } = await supabase
                    .from('assets')
                    .select('nama_asset, kondisi')
                    .in('kondisi', ['rusak_berat', 'rusak_ringan'])
                    .limit(5);
                if (assets?.length) {
                    maintDiv.innerHTML = assets.map(a => `
                        <div class="flex justify-between text-xs p-2 bg-red-50 dark:bg-red-900/20 rounded">
                            <span>${a.nama_asset}</span>
                            <span class="text-red-500">${a.kondisi}</span>
                        </div>
                    `).join('');
                } else {
                    maintDiv.innerHTML = '<p class="text-center opacity-50">Tidak ada prediksi maintenance</p>';
                }
            }
        } catch (err) {
            console.error('Gagal load analytics', err);
        }
    }

    // ========== 10. TAB SWITCHER (DIPERBAIKI) ==========
    function initTabs() {
        console.log('Initializing tabs...');
        const tabs = document.querySelectorAll('.tab-btn');
        const contents = document.querySelectorAll('.tab-content');

        if (tabs.length === 0) {
            console.warn('Tidak ada tab ditemukan!');
            return;
        }

        // Fungsi untuk menampilkan tab tertentu
        function showTab(tabId) {
            console.log('Switching to tab:', tabId);
            // Sembunyikan semua konten
            contents.forEach(c => c.classList.add('hidden'));
            // Tampilkan konten yang dipilih
            const targetContent = document.getElementById(`tab-${tabId}`);
            if (targetContent) {
                targetContent.classList.remove('hidden');
            } else {
                console.warn('Konten tab tidak ditemukan:', tabId);
            }

            // Update class pada tombol
            tabs.forEach(t => {
                t.classList.remove('active', 'text-purple-600', 'border-b-2', 'border-purple-600');
                t.classList.add('text-gray-600', 'dark:text-gray-300');
            });
            const activeTab = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
            if (activeTab) {
                activeTab.classList.add('active', 'text-purple-600', 'border-b-2', 'border-purple-600');
                activeTab.classList.remove('text-gray-600', 'dark:text-gray-300');
            }

            // Jika tab analytics, muat grafik
            if (tabId === 'analytics') {
                loadAnalytics();
            }
        }

        // Pasang event listener ke setiap tombol
        tabs.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const tabId = this.dataset.tab;
                if (tabId) {
                    showTab(tabId);
                }
            });
        });

        // Tampilkan tab pertama (dashboard) secara default
        showTab('dashboard');
    }

    // ========== 11. EVENT LISTENERS LAINNYA ==========
    function initEvents() {
        // AI Assistant submit
        const askBtn = document.getElementById('ask-ai');
        if (askBtn) askBtn.addEventListener('click', askAI);
        const aiInput = document.getElementById('ai-question');
        if (aiInput) {
            aiInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') askAI();
            });
        }

        // Slide Form
        const slideForm = document.getElementById('slideForm');
        if (slideForm) {
            slideForm.onsubmit = async (e) => {
                e.preventDefault();
                const num = document.getElementById('slide_number').value;
                const content = document.getElementById('slide_content').value;
                const { error } = await supabase.from('admin_info').insert([{ slide_number: parseInt(num), content }]);
                if (!error) { alert('Slide Updated!'); loadSlides(); }
            };
        }

        // SPJ Form
        const spjForm = document.getElementById('spjForm');
        if (spjForm) {
            spjForm.onsubmit = async (e) => {
                e.preventDefault();
                const judul = document.getElementById('spj_judul').value;
                const nominal = parseFloat(document.getElementById('spj_nominal').value);
                const { error } = await supabase.from('spj').insert([{
                    judul,
                    nominal,
                    status: 'pending'
                }]);
                if(!error) { alert('SPJ Diajukan!'); refreshDashboardData(); }
            };
        }

        // Delegate Print Click
        document.addEventListener('click', (e) => {
            if(e.target.closest('.print-btn')) {
                const spj = JSON.parse(e.target.closest('.print-btn').dataset.spj);
                printSPJ(spj);
            }
        });

        // Camera Buttons
        const startBtn = document.getElementById('start-camera');
        if (startBtn) startBtn.onclick = startCamera;
        const stopBtn = document.getElementById('stop-camera');
        if (stopBtn) stopBtn.onclick = stopCamera;
        const captureBtn = document.getElementById('capture-photo');
        if (captureBtn) captureBtn.onclick = capturePhoto;
    }

    // ========== 12. SYSTEM BOOTSTRAP ==========
    window.updateStatus = async (table, id, status) => {
        const { error } = await supabase.from(table).update({ status }).eq('id', id);
        if(!error) refreshDashboardData();
    };

    async function bootstrap() {
        console.log("🚀 System Booting: Bismillah bi idznillah...");
        await loadQRLibrary();
        initTabs(); // PENTING: inisialisasi tab dulu
        initEvents();
        refreshDashboardData();
        loadSlides();
        runSmartAnalysis();
        initVoiceButton();

        // Auto Refresh System (Every 30 Sec)
        setInterval(() => {
            refreshDashboardData();
            runSmartAnalysis();
        }, 30000);
    }

    bootstrap();
})();