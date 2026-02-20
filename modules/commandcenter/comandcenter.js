/**
 * 🏛️ DREAM OS v13.3 - COMMAND CENTER (DEBUG VERSION)
 * Dengan log di layar untuk memudahkan debug
 */

(function() {
    // BUAT KOTAK DEBUG DI LAYAR
    const debugDiv = document.createElement('div');
    debugDiv.style.cssText = 'background:#111;color:#0f0;padding:8px;margin:10px;border-radius:8px;white-space:pre-wrap;font-size:12px;z-index:9999;position:relative;';
    document.body.prepend(debugDiv);
    const log = (msg) => { 
        debugDiv.innerHTML += msg + '<br>'; 
        console.log(msg); 
    };

    log('🚀 Command Center script dimulai');

    const supabase = window.supabase;
    if (!supabase) {
        log('❌ Supabase Error: System Not Connected');
        return;
    }

    // ========== CONFIG & GLOBALS ==========
    let cameraStream = null;
    let capturedPhotoData = null;
    let recognition = null;

    log('✅ Supabase OK');

    // ========== 1. CEK ELEMEN TAB ==========
    function checkElements() {
        const tabs = document.querySelectorAll('.tab-btn');
        log(`📊 Ditemukan ${tabs.length} tombol tab`);
        tabs.forEach((t, i) => log(`   Tab ${i}: ${t.dataset.tab || 'no data'}`));

        const contents = document.querySelectorAll('.tab-content');
        log(`📄 Ditemukan ${contents.length} konten tab`);

        return { tabs, contents };
    }

    // ========== 2. TAB SWITCHER (DIPERBAIKI DENGAN FALLBACK) ==========
    function initTabs() {
        log('🔄 Inisialisasi tabs...');
        const { tabs, contents } = checkElements();

        if (tabs.length === 0) {
            log('❌ TIDAK ADA TOMBOL TAB! Cek HTML');
            return;
        }

        // Fungsi untuk menampilkan tab
        function showTab(tabId) {
            log(`👉 Menampilkan tab: ${tabId}`);
            // Sembunyikan semua konten
            contents.forEach(c => c.classList.add('hidden'));
            // Tampilkan konten yang dipilih
            const targetContent = document.getElementById(`tab-${tabId}`);
            if (targetContent) {
                targetContent.classList.remove('hidden');
                log(`✅ Konten tab-${tabId} ditemukan dan ditampilkan`);
            } else {
                log(`❌ Konten tab-${tabId} TIDAK DITEMUKAN`);
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
                log(`✅ Tombol tab-${tabId} diaktifkan`);
            } else {
                log(`❌ Tombol tab-${tabId} TIDAK DITEMUKAN`);
            }

            // Jika tab analytics, muat grafik
            if (tabId === 'analytics') {
                log('📈 Memuat analytics...');
                loadAnalytics();
            }
        }

        // Pasang event listener ke setiap tombol
        tabs.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const tabId = this.dataset.tab;
                log(`🖱️ Tombol ${tabId} diklik`);
                if (tabId) {
                    showTab(tabId);
                }
            });
            log(`✅ Event listener dipasang untuk tab ${btn.dataset.tab}`);
        });

        // Tampilkan tab pertama (dashboard) secara default
        log('🏁 Menampilkan tab default (dashboard)');
        showTab('dashboard');
    }

    // ========== 3. VOICE COMMAND ==========
    function initVoiceButton() {
        const micBtn = document.getElementById('mic-button');
        if (!micBtn) {
            log('❌ Tombol mic tidak ditemukan');
            return;
        }
        log('🎤 Tombol mic ditemukan');

        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            log('⚠️ Voice command tidak didukung browser ini');
            micBtn.style.display = 'none';
            return;
        }

        micBtn.addEventListener('click', () => {
            log('🎤 Tombol mic diklik');
            if (recognition && recognition.recognizing) {
                recognition.stop();
                micBtn.classList.remove('bg-red-500');
                micBtn.classList.add('bg-gray-500');
                recognition.recognizing = false;
                log('🎤 Voice command dimatikan');
            } else {
                startVoiceRecognition(micBtn);
            }
        });
        log('✅ Event listener mic dipasang');
    }

    function startVoiceRecognition(btn) {
        log('🎤 Memulai voice recognition...');
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.lang = 'id-ID';
        recognition.interimResults = false;

        recognition.onstart = () => {
            btn.classList.remove('bg-gray-500');
            btn.classList.add('bg-red-500');
            recognition.recognizing = true;
            log('🎤 Voice recognition aktif');
        };

        recognition.onresult = (event) => {
            const transcript = event.results[event.resultIndex][0].transcript.toLowerCase().trim();
            log(`🎤 Perintah: ${transcript}`);

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
            log(`❌ Voice error: ${event.error}`);
            btn.classList.remove('bg-red-500');
            btn.classList.add('bg-gray-500');
            recognition.recognizing = false;
        };

        recognition.onend = () => {
            btn.classList.remove('bg-red-500');
            btn.classList.add('bg-gray-500');
            recognition.recognizing = false;
            log('🎤 Voice recognition berakhir');
        };

        recognition.start();
    }

    // ========== 4. AI ASSISTANT ==========
    async function askAI() {
        const question = document.getElementById('ai-question').value;
        const answerDiv = document.getElementById('ai-answer');
        if (!question) {
            log('❌ Pertanyaan kosong');
            return;
        }

        log(`🤖 Pertanyaan: ${question}`);
        answerDiv.innerHTML = '<p class="text-sm opacity-70">⏳ Memikirkan jawaban...</p>';

        try {
            let answer = '';
            if (question.includes('booking pending') || question.includes('booking hari ini')) {
                const { count } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending');
                answer = `📅 Booking pending: ${count || 0}`;
                log(`📊 Booking pending: ${count || 0}`);
            } else if (question.includes('k3 pending') || question.includes('laporan k3')) {
                const { count } = await supabase.from('k3_reports').select('*', { count: 'exact', head: true }).eq('status', 'pending');
                answer = `⚠️ Laporan K3 pending: ${count || 0}`;
                log(`⚠️ K3 pending: ${count || 0}`);
            } else if (question.includes('maintenance pending')) {
                const { count } = await supabase.from('maintenance_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending');
                answer = `🔧 Maintenance pending: ${count || 0}`;
                log(`🔧 Maintenance pending: ${count || 0}`);
            } else if (question.includes('selamat pagi') || question.includes('halo')) {
                answer = `☀️ Selamat pagi, My Bro! Semangat puasa!`;
            } else if (question.includes('siapa')) {
                answer = `Saya Dream OS AI Assistant, siap membantu!`;
            } else {
                answer = `Maaf, saya belum bisa menjawab pertanyaan itu. Coba tanya tentang booking, K3, atau maintenance.`;
            }

            answerDiv.innerHTML = `<p class="text-sm">${answer}</p>`;
            log(`🤖 Jawaban: ${answer}`);
        } catch (err) {
            answerDiv.innerHTML = `<p class="text-sm text-red-500">Error: ${err.message}</p>`;
            log(`❌ Error AI: ${err.message}`);
        }
    }

    // ========== 5. ANALYTICS ==========
    async function loadAnalytics() {
        log('📈 Memuat analytics...');
        try {
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
            log(`📊 Data booking: ${counts.join(', ')}`);

            const ctx = document.getElementById('bookingChart')?.getContext('2d');
            if (!ctx) {
                log('❌ Canvas bookingChart tidak ditemukan');
                return;
            }

            if (window.bookingChart) window.bookingChart.destroy();
            window.bookingChart = new Chart(ctx, {
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
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
                }
            });
            log('✅ Grafik booking dibuat');
        } catch (err) {
            log(`❌ Error analytics: ${err.message}`);
        }
    }

    // ========== 6. DATA LOADERS ==========
    async function refreshDashboardData() {
        log('🔄 Memuat data dashboard...');
        try {
            const { count: bCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending');
            const { count: kCount } = await supabase.from('k3_reports').select('*', { count: 'exact', head: true }).eq('status', 'pending');
            const { count: mCount } = await supabase.from('maintenance_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending');

            if(document.getElementById('stat-booking')) document.getElementById('stat-booking').textContent = bCount || 0;
            if(document.getElementById('stat-k3')) document.getElementById('stat-k3').textContent = kCount || 0;
            if(document.getElementById('stat-maintenance')) document.getElementById('stat-maintenance').textContent = mCount || 0;

            log(`📊 Booking: ${bCount || 0}, K3: ${kCount || 0}, Maintenance: ${mCount || 0}`);
        } catch (err) {
            log(`❌ Error load data: ${err.message}`);
        }
    }

    // ========== 7. SLIDE MANAGEMENT ==========
    async function loadSlides() {
        try {
            const { data } = await supabase.from('admin_info').select('*').in('slide_number', [5,6,7]);
            data?.forEach(s => {
                const el = document.getElementById(`preview-slide${s.slide_number}`);
                if(el) el.textContent = s.content;
            });
            log(`✅ Slide loaded: ${data?.length || 0} items`);
        } catch (err) {
            log(`❌ Error load slides: ${err.message}`);
        }
    }

    // ========== 8. EVENT LISTENERS ==========
    function initEvents() {
        log('🔄 Memasang event listeners...');

        // AI Assistant
        const askBtn = document.getElementById('ask-ai');
        if (askBtn) {
            askBtn.addEventListener('click', askAI);
            log('✅ AI ask button listener');
        } else log('❌ Tombol ask-ai tidak ditemukan');

        const aiInput = document.getElementById('ai-question');
        if (aiInput) {
            aiInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') askAI();
            });
            log('✅ AI input listener');
        } else log('❌ Input ai-question tidak ditemukan');

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
            log('✅ Slide form listener');
        } else log('❌ Slide form tidak ditemukan');

        // Camera buttons
        const startBtn = document.getElementById('start-camera');
        if (startBtn) { startBtn.onclick = startCamera; log('✅ Start camera'); } else log('❌ Start camera tidak ditemukan');
        const stopBtn = document.getElementById('stop-camera');
        if (stopBtn) { stopBtn.onclick = stopCamera; log('✅ Stop camera'); } else log('❌ Stop camera tidak ditemukan');
        const captureBtn = document.getElementById('capture-photo');
        if (captureBtn) { captureBtn.onclick = capturePhoto; log('✅ Capture photo'); } else log('❌ Capture photo tidak ditemukan');
    }

    // ========== 9. CAMERA (placeholder) ==========
    function startCamera() { log('🎥 startCamera dipanggil'); alert('Camera belum diimplementasi'); }
    function stopCamera() { log('📷 stopCamera dipanggil'); }
    function capturePhoto() { log('📸 capturePhoto dipanggil'); }

    // ========== 10. SYSTEM BOOTSTRAP ==========
    async function bootstrap() {
        log('🚀 System Booting dimulai...');
        log('⏳ Menunggu 1 detik untuk memastikan DOM ready...');
        setTimeout(() => {
            log('▶️ Memulai inisialisasi...');
            initTabs();
            initVoiceButton();
            initEvents();
            refreshDashboardData();
            loadSlides();
        }, 1000);
    }

    bootstrap();
})();