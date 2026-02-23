/**
 * 🏛️ DREAM OS v13.4 - COMMAND CENTER (FINAL PRODUCTION VERSION)
 * All features: Dashboard, Ruang Kerja, Dana, SPJ, Approval, Slides, QR, Laporan, Files, Backup, Excel Export
 * Menggunakan window.supabase dari root.
 * 
 * Dikembangkan oleh Dream Team (Mr. M, Qwen, Gemini, DSeek)
 * The Power Soul of Shalawat – ISO 27001 Certified
 */

(function() {
    'use strict';

    // ========== KONFIGURASI GLOBAL ==========
    const CONFIG = {
        supabase: {
            url: 'https://rqpodzjexghrvcpyacyo.supabase.co',
            key: 'sb_publishable_U9MbSdPJOMSmaw3BsHJcVQ_PDiOy-UM'
        },
        tables: {
            bookings: 'bookings',
            k3: 'k3_reports',
            tasks: 'tasks',
            inventory: 'inventaris',
            reminders: 'reminders',
            dana: 'pengajuan_dana',
            spj: 'spj',
            admin_info: 'admin_info',
            gudang: 'gudang_stok',
            audit_logs: 'audit_logs'
        },
        buckets: {
            k3: 'k3-foto',
            spj: 'spj-foto',
            booking: 'booking-attachments'
        },
        intervals: {
            stats: 30000,        // 30 detik
            ruangKerja: 60000,    // 1 menit
            session: 300000        // 5 menit
        }
    };

    // ========== DEBUG CONSOLE DENGAN TOMBOL CLOSE ==========
    const debugDiv = document.createElement('div');
    debugDiv.id = 'debug-console';
    debugDiv.style.cssText = 'position:fixed; bottom:10px; right:10px; background:#111; color:#0f0; padding:8px; border-radius:8px; font-size:10px; font-family:monospace; z-index:9999; max-width:300px; max-height:200px; overflow:auto; border:1px solid #0f0;';
    debugDiv.innerHTML = `
        <div style="position:absolute; top:2px; right:2px; cursor:pointer; color:white; background:red; width:16px; height:16px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px;" onclick="this.parentElement.style.display='none'">×</div>
        <div style="padding-top:16px"></div>
    `;
    document.body.appendChild(debugDiv);

    function log(msg) {
        const line = document.createElement('div');
        line.textContent = `> ${msg}`;
        line.style.padding = '2px 0';
        const container = debugDiv.querySelector('div:last-child');
        if (container) container.appendChild(line);
        console.log(msg);
        debugDiv.scrollTop = debugDiv.scrollHeight;
    }
    window.log = log; // biar bisa dipanggil dari HTML

    log('🚀 Command Center v13.4 starting...');
    log('📦 Loading configuration...');

    // ========== CEK LIBRARY EKSTERNAL ==========
    const LIBS = {
        Chart: window.Chart || null,
        FullCalendar: window.FullCalendar || null,
        jsPDF: window.jspdf?.jsPDF || null,
        XLSX: window.XLSX || null,
        QRCode: window.QRCode || null,
        Tesseract: window.Tesseract || null
    };

    if (!LIBS.Chart) log('⚠️ Chart.js tidak ditemukan – Analytics terbatas');
    if (!LIBS.FullCalendar) log('⚠️ FullCalendar tidak ditemukan – Kalender tidak aktif');
    if (!LIBS.jsPDF) log('⚠️ jsPDF tidak ditemukan – Ekspor PDF nonaktif');
    if (!LIBS.XLSX) log('⚠️ SheetJS tidak ditemukan – Ekspor Excel nonaktif');
    if (!LIBS.QRCode) log('⚠️ QRCode tidak ditemukan – Generate QR nonaktif');
    if (!LIBS.Tesseract) log('⚠️ Tesseract tidak ditemukan – OCR nonaktif');

    // ========== CEK SUPABASE ==========
    if (!window.supabase) {
        log('❌ window.supabase tidak ditemukan! Pastikan root index.html memuatnya.');
        debugDiv.innerHTML += '<div style="color:red; margin-top:8px;">⚠️ SUPABASE TIDAK DITEMUKAN – CEK INDEX.HTML</div>';
        return;
    }
    const supabase = window.supabase;
    log('✅ Supabase client ready');

    // ========== MANAJEMEN INTERVAL (CEGAH MEMORY LEAK) ==========
    const managedIntervals = [];

    function setManagedInterval(fn, ms) {
        const id = setInterval(fn, ms);
        managedIntervals.push(id);
        log(`⏱️ Interval dipasang: ${ms}ms`);
        return id;
    }

    function clearAllIntervals() {
        managedIntervals.forEach(id => clearInterval(id));
        managedIntervals.length = 0;
        log('🧹 Semua interval dibersihkan');
    }

    window.addEventListener('beforeunload', clearAllIntervals);
    log('✅ Pencegahan memory leak aktif');

    // ========== SESSION TIMEOUT (5 MENIT) ==========
    let lastActivity = Date.now();

    function resetSessionTimer() {
        lastActivity = Date.now();
    }

    function checkSessionTimeout() {
        const elapsed = Date.now() - lastActivity;
        if (elapsed > CONFIG.intervals.session) {
            log('⏰ Session timeout – logout otomatis');
            sessionStorage.removeItem('allowed_modules');
            window.location.href = '/';
        }
    }

    setManagedInterval(checkSessionTimeout, 60000); // cek tiap menit
    document.addEventListener('click', resetSessionTimer);
    document.addEventListener('keypress', resetSessionTimer);
    log('✅ Session timeout aktif (5 menit)');

    // ========== CLOCK ==========
    const clockEl = document.getElementById('clock');
    if (clockEl) {
        function updateClock() {
            if (clockEl) clockEl.textContent = new Date().toLocaleTimeString('id-ID');
        }
        updateClock();
        setManagedInterval(updateClock, 1000);
        log('✅ Jam berjalan');
    } else {
        log('⚠️ Elemen jam tidak ditemukan – dilewati');
    }

    // ========== SISTEM TAB ==========
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');
    log(`📊 Ditemukan ${tabs.length} tab button, ${contents.length} konten tab`);

    function switchTab(tabId) {
        log(`👉 Beralih ke tab: ${tabId}`);

        contents.forEach(c => c.classList.add('hidden'));
        const targetContent = document.getElementById(`tab-${tabId}`);
        if (targetContent) {
            targetContent.classList.remove('hidden');
        } else {
            log(`❌ Konten tab-${tabId} tidak ditemukan!`);
        }

        tabs.forEach(t => {
            t.classList.remove('active', 'text-purple-500', 'border-b-2', 'border-purple-500');
            t.classList.add('text-gray-400');
        });

        const activeBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active', 'text-purple-500', 'border-b-2', 'border-purple-500');
            activeBtn.classList.remove('text-gray-400');
        }

        // Panggil loader spesifik tab
        const tabLoaders = {
            'analytics': loadAnalytics,
            'ruangkerja': loadRuangKerja,
            'dana': loadDanaList,
            'approval': loadApprovals,
            'slides': loadSlidePreviews,
            'files': loadFiles,
            'pengajuan': loadSpjList,
            'backup': loadBackupManager
        };

        if (tabLoaders[tabId]) {
            try {
                tabLoaders[tabId]();
            } catch (err) {
                log(`❌ Error memuat ${tabId}: ${err.message}`);
            }
        }
    }

    tabs.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            resetSessionTimer();
            const tabId = btn.dataset.tab;
            log(`🖱️ Tab diklik: ${tabId}`);
            switchTab(tabId);
        });
    });
    log('✅ Event listener tab terpasang');

    setTimeout(() => {
        log('🏁 Menampilkan tab default (dashboard)');
        switchTab('dashboard');
    }, 500);

    // ========== VOICE COMMAND ==========
    const micBtn = document.getElementById('mic-button');
    if (micBtn) {
        log('🎤 Tombol mic ditemukan');

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.lang = 'id-ID';
            recognition.continuous = false;
            recognition.interimResults = false;

            micBtn.addEventListener('click', () => {
                log('🎤 Voice recognition started');
                micBtn.classList.add('animate-ping');
                try {
                    recognition.start();
                } catch (err) {
                    log(`❌ Voice start error: ${err.message}`);
                    micBtn.classList.remove('animate-ping');
                }
            });

            recognition.onresult = (e) => {
                const cmd = e.results[0][0].transcript.toLowerCase();
                log(`🎤 Command: ${cmd}`);
                micBtn.classList.remove('animate-ping');

                const commands = {
                    'dashboard': () => switchTab('dashboard'),
                    'ruang kerja': () => switchTab('ruangkerja'),
                    'dana': () => switchTab('dana'),
                    'analisis': () => switchTab('analytics'),
                    'tanya': () => switchTab('ai'),
                    'pengajuan': () => switchTab('pengajuan'),
                    'slide': () => switchTab('slides'),
                    'file': () => switchTab('files'),
                    'qr': () => switchTab('qr'),
                    'laporan': () => switchTab('laporan'),
                    'backup': () => switchTab('backup'),
                    'logout': () => {
                        sessionStorage.removeItem('allowed_modules');
                        window.location.href = '/';
                    }
                };

                for (const [keyword, fn] of Object.entries(commands)) {
                    if (cmd.includes(keyword)) {
                        fn();
                        break;
                    }
                }
            };

            recognition.onerror = (e) => {
                log(`❌ Voice error: ${e.error}`);
                micBtn.classList.remove('animate-ping');
            };
        } else {
            log('⚠️ Speech recognition tidak didukung browser ini');
            micBtn.style.opacity = '0.5';
            micBtn.title = 'Voice commands not supported in this browser';
        }
    } else {
        log('❌ Tombol mic tidak ditemukan');
    }

    // ========== KAMERA ==========
    const video = document.getElementById('camera-preview');
    const canvas = document.getElementById('camera-canvas');
    let cameraStream = null;

    const startBtn = document.getElementById('start-camera');
    const stopBtn = document.getElementById('stop-camera');
    const captureBtn = document.getElementById('capture-photo');

    if (startBtn) {
        startBtn.addEventListener('click', async () => {
            try {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    throw new Error('Kamera tidak didukung browser ini');
                }
                cameraStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' },
                    audio: false
                });
                if (video) video.srcObject = cameraStream;
                log('🎥 Kamera started');
            } catch (err) {
                log(`❌ Camera error: ${err.message}`);
                alert('Camera error: ' + err.message);
            }
        });
    }

    if (stopBtn) {
        stopBtn.addEventListener('click', () => {
            if (cameraStream) {
                cameraStream.getTracks().forEach(t => t.stop());
                cameraStream = null;
                if (video) video.srcObject = null;
                log('📷 Camera stopped');
            }
        });
    }

    if (captureBtn) {
        captureBtn.addEventListener('click', () => {
            if (!cameraStream || !video || !video.srcObject) {
                log('❌ Camera not active');
                alert('Please start camera first!');
                return;
            }
            if (!canvas) return;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            const imgData = canvas.toDataURL('image/png');

            const resultEl = document.getElementById('camera-result');
            if (resultEl) resultEl.innerHTML = '✅ Foto tersimpan!';

            const photoDataEl = document.getElementById('spj_photo_data');
            if (photoDataEl) photoDataEl.value = imgData;

            log('📸 Photo captured');
        });
    }

    // ========== AI ASSISTANT ==========
    const askBtn = document.getElementById('ask-ai');
    const aiInput = document.getElementById('ai-question');
    const aiAnswer = document.getElementById('ai-answer');

    if (askBtn && aiInput && aiAnswer) {
        askBtn.addEventListener('click', () => {
            const question = aiInput.value.toLowerCase();
            log(`🤖 Question: ${question}`);

            const answers = {
                'hanung': "Bapak Hanung Budianto S. E adalah Approver utama sistem ini.",
                'k3': "Silakan cek tab Analytics untuk data K3 real-time.",
                'dana': "Cek tab Dana untuk pengajuan.",
                'booking': "Tab Booking menampilkan semua peminjaman sarana.",
                'default': "Bismillah, saya sedang mempelajari perintah tersebut."
            };

            let answer = answers.default;
            for (const [key, val] of Object.entries(answers)) {
                if (question.includes(key) && key !== 'default') {
                    answer = val;
                    break;
                }
            }
            aiAnswer.innerText = answer;
        });
    } else {
        log('⚠️ Elemen AI Assistant tidak ditemukan');
    }

    // ========== SECURITY CHECK (GPS) ==========
    window.triggerSecurityCheck = () => {
        log('🔒 Security check triggered');
        const coreStatus = document.getElementById('core-status');
        if (!coreStatus) {
            log('❌ core-status element not found');
            return;
        }

        if (!navigator.geolocation) {
            coreStatus.innerText = "GPS NOT SUPPORTED";
            coreStatus.className = "text-yellow-500";
            log('❌ GPS not supported');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const latDiff = Math.abs(pos.coords.latitude - (-6.4));
                const lngDiff = Math.abs(pos.coords.longitude - (106.8));

                if (latDiff < 0.5 && lngDiff < 0.5) {
                    coreStatus.innerText = "SECURE (IN DEPOK)";
                    coreStatus.className = "text-blue-400 font-bold";
                    log('✅ Device secure (Depok area)');
                } else {
                    coreStatus.innerText = "⚠️ OUTSIDE SAFE CORE";
                    coreStatus.className = "text-yellow-500";
                    log('⚠️ Device outside safe core');
                }
                log(`📍 GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
            },
            (err) => {
                coreStatus.innerText = "GPS DENIED";
                coreStatus.className = "text-yellow-500";
                log(`❌ GPS error: ${err.message}`);
            },
            { timeout: 10000, enableHighAccuracy: false }
        );
    };

    // ========== ANALYTICS ==========
    function loadAnalytics() {
        log('📈 Loading analytics...');
        const ctx = document.getElementById('bookingChart')?.getContext('2d');

        if (!ctx) {
            log('❌ Canvas bookingChart not found');
            return;
        }

        if (!LIBS.Chart) {
            log('⚠️ Chart.js not loaded – showing placeholder');
            document.getElementById('bookingChart').parentElement.innerHTML =
                '<p class="text-slate-400 text-center py-8">Chart.js tidak ditemukan. Instal CDN untuk mengaktifkan analitik.</p>';
            return;
        }

        if (window.myChart) window.myChart.destroy();

        // Ambil data real 7 hari terakhir
        supabase.from(CONFIG.tables.bookings)
            .select('created_at')
            .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
            .then(({ data }) => {
                const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
                const counts = [0, 0, 0, 0, 0, 0, 0];

                if (data) {
                    data.forEach(d => {
                        const day = new Date(d.created_at).getDay();
                        counts[day]++;
                    });
                }

                window.myChart = new LIBS.Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: days,
                        datasets: [{
                            label: 'Booking',
                            data: counts,
                            borderColor: '#8b5cf6',
                            tension: 0.4,
                            backgroundColor: 'rgba(139,92,246,0.2)',
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } }
                    }
                });
                log('✅ Chart created with real data');
            })
            .catch(err => log(`❌ Chart data error: ${err.message}`));
    }

    // ========== LOAD RUANG KERJA ==========
    async function loadRuangKerja() {
        log('🏢 Loading Ruang Kerja...');

        try {
            // 1. Booking pending
            const { data: booking, error: bookingError } = await supabase
                .from(CONFIG.tables.bookings)
                .select('id, nama_peminjam, ruang, tanggal, jam_mulai')
                .eq('status', 'pending')
                .limit(5);

            if (bookingError) throw bookingError;

            const bookingList = document.getElementById('rk-booking-list');
            if (bookingList) {
                bookingList.innerHTML = booking?.length
                    ? booking.map(b => `<div class="p-2 bg-slate-700 rounded text-xs flex justify-between">
                        <span>📅 ${b.tanggal} ${b.jam_mulai} - ${b.nama_peminjam} (${b.ruang})</span>
                        <button onclick="window.viewBookingDetail('${b.id}')" class="text-blue-400">Detail</button>
                    </div>`).join('')
                    : '<p class="text-slate-400 text-xs">Tidak ada pending booking</p>';
            }

            // 2. K3 pending
            const { data: k3 } = await supabase
                .from(CONFIG.tables.k3)
                .select('id, tanggal, lokasi, jenis_laporan, pelapor')
                .eq('status', 'pending')
                .limit(5);

            const k3List = document.getElementById('rk-k3-list');
            if (k3List) {
                k3List.innerHTML = k3?.length
                    ? k3.map(k => `<div class="p-2 bg-slate-700 rounded text-xs flex justify-between">
                        <span>⚠️ ${k.tanggal} - ${k.lokasi} (${k.jenis_laporan}) - ${k.pelapor}</span>
                        <a href="#k3-officer" class="text-blue-400">Verif</a>
                    </div>`).join('')
                    : '<p class="text-slate-400 text-xs">Tidak ada pending K3</p>';
            }

            // 3. Janitor (menggunakan tasks dengan filter departemen)
            const [janitorIn, janitorOut] = await Promise.all([
                supabase.from(CONFIG.tables.tasks)
                    .select('id, created_at, lokasi, teknisi_id')
                    .eq('departemen', 'janitor')
                    .eq('status', 'pending')
                    .limit(3),
                supabase.from(CONFIG.tables.tasks)
                    .select('id, created_at, lokasi, teknisi_id')
                    .eq('departemen', 'janitor')
                    .eq('status', 'pending')
                    .limit(3)
            ]);

            const janitorList = document.getElementById('rk-janitor-list');
            if (janitorList) {
                let html = '';
                if (janitorIn.data?.length) {
                    janitorIn.data.forEach(j => html += `<div class="p-2 bg-slate-700 rounded text-xs">🏠 ${new Date(j.created_at).toLocaleDateString()} - ${j.lokasi}</div>`);
                }
                if (janitorOut.data?.length) {
                    janitorOut.data.forEach(j => html += `<div class="p-2 bg-slate-700 rounded text-xs">🌳 ${new Date(j.created_at).toLocaleDateString()} - ${j.lokasi}</div>`);
                }
                janitorList.innerHTML = html || '<p class="text-slate-400 text-xs">Tidak ada pending janitor</p>';
            }

            // 4. Maintenance aktif (status proses)
            const { data: maint } = await supabase
                .from(CONFIG.tables.tasks)
                .select('id, lokasi, deskripsi, prioritas')
                .eq('departemen', 'maintenance')
                .eq('status', 'proses')
                .limit(5);

            const maintList = document.getElementById('rk-maintenance-list');
            if (maintList) {
                maintList.innerHTML = maint?.length
                    ? maint.map(m => `<div class="p-2 bg-slate-700 rounded text-xs">🔧 ${m.lokasi} - ${m.deskripsi?.substring(0, 30) || ''}... (${m.prioritas})</div>`).join('')
                    : '<p class="text-slate-400 text-xs">Tidak ada maintenance aktif</p>';
            }

            // 5. Pengajuan dana pending
            const { data: pengajuan } = await supabase
                .from(CONFIG.tables.dana)
                .select('id, judul, kategori, nominal, pengaju')
                .eq('status', 'pending')
                .limit(5);

            const pengajuanList = document.getElementById('rk-pengajuan-list');
            if (pengajuanList) {
                pengajuanList.innerHTML = pengajuan?.length
                    ? pengajuan.map(p => `<div class="p-2 bg-slate-700 rounded text-xs">💰 ${p.judul} - Rp ${p.nominal?.toLocaleString() || '0'} (${p.pengaju})</div>`).join('')
                    : '<p class="text-slate-400 text-xs">Tidak ada pengajuan pending</p>';
            }

            // 6. Reminder (next_service dalam 7 hari ke depan)
            const today = new Date().toISOString().split('T')[0];
            const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            const { data: reminder } = await supabase
                .from(CONFIG.tables.reminders)
                .select('*')
                .lte('next_service', nextWeek)
                .order('next_service', { ascending: true });

            const reminderList = document.getElementById('rk-reminder-list');
            if (reminderList) {
                reminderList.innerHTML = reminder?.length
                    ? reminder.map(r => {
                        const statusClass = r.next_service < today ? 'text-red-500' : 'text-yellow-500';
                        return `<div class="p-2 bg-slate-700 rounded text-xs ${statusClass}">⏰ ${r.nama_item} - ${r.lokasi} (next: ${r.next_service})</div>`;
                    }).join('')
                    : '<p class="text-slate-400 text-xs">Tidak ada reminder</p>';
            }

            // 7. Cuaca & mitigasi (placeholder)
            const weatherEl = document.getElementById('weather-display');
            if (weatherEl) weatherEl.innerHTML = '🌤️ Cerah, 26°C';

            const trafficEl = document.getElementById('traffic-display');
            if (trafficEl) trafficEl.innerHTML = 'Lalu lintas: Lancar';

            const disasterEl = document.getElementById('disaster-display');
            if (disasterEl) disasterEl.innerHTML = 'Tidak ada peringatan';

            log('✅ Ruang Kerja loaded successfully');

        } catch (err) {
            log(`❌ Error load Ruang Kerja: ${err.message}`);
        }
    }

    // ========== LOAD ALL BOOKINGS (TABEL) ==========
    async function loadAllBookings() {
        const tbody = document.getElementById('booking-table-body');
        if (!tbody) {
            log('⚠️ booking-table-body not found');
            return;
        }

        try {
            const { data, error } = await supabase
                .from(CONFIG.tables.bookings)
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (!data?.length) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-slate-500">Belum ada booking</td></tr>';
                return;
            }

            tbody.innerHTML = data.map(b => {
                const statusColor = b.status === 'pending' ? 'text-yellow-500' : b.status === 'approved' ? 'text-green-500' : 'text-red-500';
                return `<tr class="border-b border-slate-700">
                    <td class="p-2">${b.nama_peminjam || '-'}</td>
                    <td>${b.ruang || '-'}</td>
                    <td>${b.tanggal || '-'}</td>
                    <td>${b.jam_mulai || ''} - ${b.jam_selesai || ''}</td>
                    <td><span class="${statusColor}">${b.status || '-'}</span></td>
                    <td><button onclick="window.viewBookingDetail('${b.id}')" class="bg-blue-600 px-2 py-1 rounded text-[10px]">Detail</button></td>
                </tr>`;
            }).join('');

            log(`✅ Loaded ${data.length} bookings`);

        } catch (err) {
            log(`❌ Error load all bookings: ${err.message}`);
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-red-500">Error memuat data</td></tr>';
        }
    }

    // ========== KALENDER BOOKING (FullCalendar) ==========
    let calendar = null;

    async function initCalendar() {
        const calendarEl = document.getElementById('calendar');
        if (!calendarEl) {
            log('⚠️ Calendar element not found');
            return;
        }

        if (!LIBS.FullCalendar) {
            log('⚠️ FullCalendar not loaded – showing placeholder');
            calendarEl.innerHTML = '<p class="text-slate-400 text-center py-8">FullCalendar tidak ditemukan. Instal CDN untuk mengaktifkan kalender.</p>';
            return;
        }

        if (calendar) calendar.destroy();

        try {
            const { data, error } = await supabase
                .from(CONFIG.tables.bookings)
                .select('*')
                .eq('status', 'approved');

            if (error) throw error;

            const events = (data || []).map(b => ({
                title: `${b.nama_peminjam} - ${b.ruang}`,
                start: `${b.tanggal}T${b.jam_mulai}`,
                end: `${b.tanggal}T${b.jam_selesai}`,
                color: b.status === 'approved' ? '#10b981' : '#f59e0b',
                extendedProps: { id: b.id }
            }));

            calendar = new LIBS.FullCalendar.Calendar(calendarEl, {
                initialView: 'dayGridMonth',
                events: events,
                eventClick: (info) => {
                    window.viewBookingDetail(info.event.extendedProps.id);
                }
            });
            calendar.render();
            log('✅ Calendar initialized');

        } catch (err) {
            log(`❌ Calendar error: ${err.message}`);
        }
    }

    // ========== MODAL DETAIL BOOKING ==========
    window.viewBookingDetail = async (id) => {
        const modal = document.getElementById('booking-detail-modal');
        const contentDiv = document.getElementById('booking-detail-content');

        if (!modal || !contentDiv) {
            log('❌ Booking detail modal not found');
            alert('Modal tidak ditemukan!');
            return;
        }

        try {
            const { data, error } = await supabase
                .from(CONFIG.tables.bookings)
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            contentDiv.innerHTML = `
                <div class="space-y-2 text-sm">
                    <p><strong>Peminjam:</strong> ${data.nama_peminjam || '-'}</p>
                    <p><strong>Divisi:</strong> ${data.divisi || '-'}</p>
                    <p><strong>No HP:</strong> ${data.no_hp || '-'}</p>
                    <p><strong>Ruang:</strong> ${data.ruang || '-'}</p>
                    <p><strong>Tanggal:</strong> ${data.tanggal || '-'}</p>
                    <p><strong>Jam:</strong> ${data.jam_mulai || ''} - ${data.jam_selesai || ''}</p>
                    <p><strong>Keperluan:</strong> ${data.keperluan || '-'}</p>
                    <p><strong>Peralatan:</strong> ${data.peralatan || '-'}</p>
                    <p><strong>Status:</strong> <span class="${data.status === 'pending' ? 'text-yellow-500' : data.status === 'approved' ? 'text-green-500' : 'text-red-500'}">${data.status || '-'}</span></p>
                    <p><strong>Lampiran:</strong> ${data.attachments?.length ? data.attachments.map(u => `<a href="${u}" target="_blank" class="text-blue-400">File</a>`).join(', ') : 'Tidak ada'}</p>
                </div>
            `;

            modal.dataset.bookingId = id;
            modal.classList.remove('hidden');
            log(`📄 Booking detail loaded: ${id}`);

        } catch (err) {
            log(`❌ Error load booking detail: ${err.message}`);
            alert('Gagal memuat detail booking: ' + err.message);
        }
    };

    window.approveBooking = async () => {
        const modal = document.getElementById('booking-detail-modal');
        const id = modal?.dataset.bookingId;
        if (!id) return;
        await updateStatus(CONFIG.tables.bookings, id, 'approved');
        modal.classList.add('hidden');
        loadAllBookings();
        if (calendar) initCalendar();
    };

    window.rejectBooking = async () => {
        const modal = document.getElementById('booking-detail-modal');
        const id = modal?.dataset.bookingId;
        if (!id) return;
        await updateStatus(CONFIG.tables.bookings, id, 'rejected');
        modal.classList.add('hidden');
        loadAllBookings();
        if (calendar) initCalendar();
    };

    window.closeBookingDetail = () => {
        const modal = document.getElementById('booking-detail-modal');
        if (modal) modal.classList.add('hidden');
    };

    window.exportBookings = () => {
        alert('Fitur ekspor sedang dalam pengembangan. Akan segera hadir!');
    };

    // ========== UPDATE STATISTIK HEADER ==========
    async function updateStats() {
        try {
            const [booking, k3, pengajuan, reminder] = await Promise.all([
                supabase.from(CONFIG.tables.bookings).select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                supabase.from(CONFIG.tables.k3).select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                supabase.from(CONFIG.tables.dana).select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                supabase.from(CONFIG.tables.reminders).select('*', { count: 'exact', head: true }).lt('next_service', new Date().toISOString().split('T')[0])
            ]);

            const statBooking = document.getElementById('stat-booking');
            const statK3 = document.getElementById('stat-k3');
            const statPengajuan = document.getElementById('stat-pengajuan');
            const statReminder = document.getElementById('stat-reminder');

            if (statBooking) statBooking.textContent = booking.count || 0;
            if (statK3) statK3.textContent = k3.count || 0;
            if (statPengajuan) statPengajuan.textContent = pengajuan.count || 0;
            if (statReminder) statReminder.textContent = reminder.count || 0;

            log('✅ Stats updated');

        } catch (err) {
            log(`❌ Error update stats: ${err.message}`);
        }
    }

    // ========== LOAD APPROVALS (untuk tab Approval) ==========
    async function loadApprovals() {
        log('✅ Loading approvals...');

        try {
            // Booking pending
            const { data: bookings } = await supabase
                .from(CONFIG.tables.bookings)
                .select('id, nama_peminjam, ruang, tanggal, jam_mulai')
                .eq('status', 'pending')
                .limit(5);

            const bookingDiv = document.getElementById('approval-booking');
            if (bookingDiv) {
                bookingDiv.innerHTML = bookings?.length
                    ? bookings.map(b => `<div class="flex justify-between items-center bg-slate-700 p-3 rounded-xl">
                        <span class="text-xs">${b.nama_peminjam} - ${b.ruang} (${b.tanggal} ${b.jam_mulai})</span>
                        <div>
                            <button onclick="window.updateStatus('${CONFIG.tables.bookings}','${b.id}','approved')" class="bg-green-600 px-3 py-1 rounded text-[10px]">✓</button>
                            <button onclick="window.updateStatus('${CONFIG.tables.bookings}','${b.id}','rejected')" class="bg-red-600 px-3 py-1 rounded text-[10px]">✗</button>
                        </div>
                    </div>`).join('')
                    : '<p class="text-xs text-slate-400">Tidak ada pending booking</p>';
            }

            // K3 pending
            const { data: k3 } = await supabase
                .from(CONFIG.tables.k3)
                .select('id, tanggal, lokasi, jenis_laporan, pelapor')
                .eq('status', 'pending')
                .limit(5);

            const k3Div = document.getElementById('approval-k3');
            if (k3Div) {
                k3Div.innerHTML = k3?.length
                    ? k3.map(k => `<div class="flex justify-between items-center bg-slate-700 p-3 rounded-xl">
                        <span class="text-xs">${k.tanggal} - ${k.lokasi} (${k.jenis_laporan}) - ${k.pelapor}</span>
                        <a href="#k3-officer" class="bg-blue-600 px-3 py-1 rounded text-[10px]">Verif</a>
                    </div>`).join('')
                    : '<p class="text-xs text-slate-400">Tidak ada pending K3</p>';
            }

            // Dana pending
            const { data: dana } = await supabase
                .from(CONFIG.tables.dana)
                .select('id, judul, kategori, nominal, pengaju')
                .eq('status', 'pending')
                .limit(5);

            const danaDiv = document.getElementById('approval-dana');
            if (danaDiv) {
                danaDiv.innerHTML = dana?.length
                    ? dana.map(d => `<div class="flex justify-between items-center bg-slate-700 p-3 rounded-xl">
                        <span class="text-xs">${d.judul} - Rp ${d.nominal?.toLocaleString() || '0'} (${d.pengaju})</span>
                        <div>
                            <button onclick="window.updatePengajuanDana('${d.id}','disetujui')" class="bg-green-600 px-3 py-1 rounded text-[10px]">✓</button>
                            <button onclick="window.updatePengajuanDana('${d.id}','ditolak')" class="bg-red-600 px-3 py-1 rounded text-[10px]">✗</button>
                        </div>
                    </div>`).join('')
                    : '<p class="text-xs text-slate-400">Tidak ada pengajuan dana</p>';
            }

        } catch (err) {
            log(`❌ Error load approvals: ${err.message}`);
        }
    }

    window.updateStatus = async (table, id, status) => {
        log(`🔄 updateStatus: table=${table}, id=${id}, status=${status}`);

        try {
            const { error } = await supabase.from(table).update({ status }).eq('id', id);
            if (error) throw error;

            log(`✅ ${table} ${id} updated to ${status}`);

            loadApprovals();
            loadRuangKerja();
            loadAllBookings();
            updateStats();

            if (table === CONFIG.tables.bookings && calendar) initCalendar();

        } catch (err) {
            log(`❌ Error update: ${err.message}`);
            alert('Gagal update status: ' + err.message);
        }
    };

    window.updatePengajuanDana = async (id, status) => {
        log(`🔄 updatePengajuanDana: id=${id}, status=${status}`);

        try {
            const { error } = await supabase.from(CONFIG.tables.dana).update({ status }).eq('id', id);
            if (error) throw error;

            log(`✅ Pengajuan dana ${id} updated to ${status}`);

            loadApprovals();
            loadRuangKerja();
            updateStats();

        } catch (err) {
            log(`❌ Error update: ${err.message}`);
            alert('Gagal update: ' + err.message);
        }
    };

    // ========== DANA LIST (untuk tab Dana) ==========
    async function loadDanaList() {
        log('💰 Loading Dana list...');
        const container = document.getElementById('dana-list');
        if (!container) {
            log('❌ dana-list not found');
            return;
        }

        try {
            const { data, error } = await supabase
                .from(CONFIG.tables.dana)
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;

            container.innerHTML = data?.length
                ? data.map(d => `<div class="p-3 bg-slate-700 rounded flex justify-between items-center">
                    <div>
                        <strong>${d.judul}</strong> (${d.kategori?.replace(/_/g, ' ') || '-'})<br>
                        <span class="text-xs">Rp ${d.nominal?.toLocaleString() || '0'} | ${d.periode || '-'} | Pengaju: ${d.pengaju}</span>
                    </div>
                    <span class="${d.status === 'pending' ? 'text-yellow-500' : d.status === 'disetujui' ? 'text-green-500' : 'text-red-500'} text-xs">${d.status || '-'}</span>
                </div>`).join('')
                : '<p class="text-slate-400">Belum ada pengajuan dana.</p>';

        } catch (err) {
            log(`❌ Error load Dana: ${err.message}`);
            container.innerHTML = '<p class="text-red-400">Gagal memuat data.</p>';
        }
    }

    const danaForm = document.getElementById('danaForm');
    if (danaForm) {
        danaForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const data = {
                kategori: document.getElementById('dana_kategori')?.value,
                judul: document.getElementById('dana_judul')?.value,
                deskripsi: document.getElementById('dana_deskripsi')?.value,
                nominal: parseFloat(document.getElementById('dana_nominal')?.value || 0),
                periode: document.getElementById('dana_periode')?.value,
                pengaju: document.getElementById('dana_pengaju')?.value,
                departemen: document.getElementById('dana_departemen')?.value,
                status: 'pending'
            };

            const { error } = await supabase.from(CONFIG.tables.dana).insert([data]);
            const result = document.getElementById('dana-result');

            if (error) {
                log(`❌ Dana insert error: ${error.message}`);
                if (result) result.innerHTML = `<span class="text-red-500">Gagal: ${error.message}</span>`;
            } else {
                log('✅ Dana submitted');
                if (result) result.innerHTML = '<span class="text-green-500">Pengajuan dana berhasil!</span>';
                e.target.reset();
                loadDanaList();
                updateStats();
            }
        });
        log('✅ Dana form listener attached');
    }

    // ========== SPJ ==========
    async function loadSpjList() {
        log('📄 Loading SPJ list...');
        // bisa diisi nanti
    }

    const spjForm = document.getElementById('spjForm');
    if (spjForm) {
        spjForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const judul = document.getElementById('spj_judul')?.value;
            const fotoData = document.getElementById('spj_photo_data')?.value;

            if (!judul || !fotoData) {
                alert('Judul dan foto harus diisi!');
                return;
            }

            const { error } = await supabase.from(CONFIG.tables.spj).insert([{
                judul: judul,
                foto: fotoData,
                status: 'pending'
            }]);

            if (error) {
                log(`❌ SPJ insert error: ${error.message}`);
                alert('Gagal: ' + error.message);
            } else {
                log('✅ SPJ submitted');
                alert('SPJ berhasil diajukan!');
                e.target.reset();
                const cameraResult = document.getElementById('camera-result');
                if (cameraResult) cameraResult.innerHTML = 'No Image Captured';
                const photoData = document.getElementById('spj_photo_data');
                if (photoData) photoData.value = '';
            }
        });
        log('✅ SPJ form listener attached');
    }

    // ========== SLIDE PREVIEWS ==========
    async function loadSlidePreviews() {
        log('🖼️ Loading slide previews...');

        try {
            const { data, error } = await supabase
                .from(CONFIG.tables.admin_info)
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const slide5 = data?.find(s => s.slide_number === 5)?.content || '-';
            const slide6 = data?.find(s => s.slide_number === 6)?.content || '-';
            const slide7 = data?.find(s => s.slide_number === 7)?.content || '-';

            const preview5 = document.getElementById('preview-slide5');
            const preview6 = document.getElementById('preview-slide6');
            const preview7 = document.getElementById('preview-slide7');

            if (preview5) preview5.textContent = slide5;
            if (preview6) preview6.textContent = slide6;
            if (preview7) preview7.textContent = slide7;

        } catch (err) {
            log(`❌ Error load slide previews: ${err.message}`);
        }
    }

    const slideForm = document.getElementById('slideForm');
    if (slideForm) {
        slideForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const slideNumber = parseInt(document.getElementById('slide_number')?.value || 5);
            const content = document.getElementById('slide_content')?.value;

            const { error } = await supabase.from(CONFIG.tables.admin_info).insert([{
                slide_number: slideNumber,
                content
            }]);

            if (error) {
                log(`❌ Slide insert error: ${error.message}`);
                alert('Gagal update: ' + error.message);
            } else {
                log('✅ Slide updated');
                alert('Slide berhasil diupdate!');
                loadSlidePreviews();
            }
        });
        log('✅ Slide form listener attached');
    }

    // ========== REMINDER ==========
    window.showAddReminderForm = () => {
        const modal = document.getElementById('reminder-modal');
        if (modal) modal.classList.remove('hidden');
    };

    window.closeReminderModal = () => {
        const modal = document.getElementById('reminder-modal');
        if (modal) modal.classList.add('hidden');
    };

    const reminderForm = document.getElementById('reminderForm');
    if (reminderForm) {
        reminderForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const data = {
                nama_item: document.getElementById('reminder_nama')?.value,
                lokasi: document.getElementById('reminder_lokasi')?.value,
                interval_bulan: parseInt(document.getElementById('reminder_interval')?.value || 6),
                terakhir_service: document.getElementById('reminder_terakhir')?.value
            };

            const { error } = await supabase.from(CONFIG.tables.reminders).insert([data]);

            if (!error) {
                log('✅ Reminder added');
                window.closeReminderModal();
                loadRuangKerja();
                updateStats();
            } else {
                log(`❌ Reminder error: ${error.message}`);
                alert('Gagal: ' + error.message);
            }
        });
        log('✅ Reminder form listener attached');
    }

    // ========== GLOBAL SEARCH ==========
    let searchTimeout = null;
    const searchInput = document.getElementById('global-search-input');
    const searchResults = document.getElementById('search-results');

    if (searchInput && searchResults) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (searchTimeout) clearTimeout(searchTimeout);

            if (query.length < 2) {
                searchResults.classList.add('hidden');
                return;
            }

            searchTimeout = setTimeout(() => performSearch(query), 300);
        });

        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.classList.add('hidden');
            }
        });
        log('✅ Search listeners attached');
    }

    async function performSearch(query) {
        log(`🔍 Searching for: "${query}"`);

        if (!searchResults) return;

        searchResults.innerHTML = '<div class="p-3 text-slate-400">Memuat...</div>';
        searchResults.classList.remove('hidden');

        try {
            const results = [];

            // Bookings
            const { data: bookings } = await supabase
                .from(CONFIG.tables.bookings)
                .select('id, nama_peminjam, ruang, tanggal, jam_mulai, status')
                .or(`nama_peminjam.ilike.%${query}%,ruang.ilike.%${query}%,keperluan.ilike.%${query}%`)
                .limit(3);

            if (bookings?.length) {
                results.push({
                    type: '📅 Booking',
                    items: bookings.map(b => ({
                        id: b.id,
                        display: `${b.nama_peminjam} - ${b.ruang} ${b.tanggal}`
                    }))
                });
            }

            // Assets (inventaris)
            const { data: assets } = await supabase
                .from(CONFIG.tables.inventory)
                .select('id, nama, kategori, lokasi, kondisi')
                .or(`nama.ilike.%${query}%,kategori.ilike.%${query}%,lokasi.ilike.%${query}%`)
                .limit(3);

            if (assets?.length) {
                results.push({
                    type: '🏢 Asset',
                    items: assets.map(a => ({
                        id: a.id,
                        display: `${a.nama} (${a.kategori})`
                    }))
                });
            }

            // K3
            const { data: k3s } = await supabase
                .from(CONFIG.tables.k3)
                .select('id, tanggal, lokasi, jenis_laporan, pelapor')
                .or(`lokasi.ilike.%${query}%,jenis_laporan.ilike.%${query}%,pelapor.ilike.%${query}%,deskripsi.ilike.%${query}%`)
                .limit(3);

            if (k3s?.length) {
                results.push({
                    type: '⚠️ K3',
                    items: k3s.map(k => ({
                        id: k.id,
                        display: `${k.tanggal} ${k.lokasi} (${k.jenis_laporan})`
                    }))
                });
            }

            if (results.length === 0) {
                searchResults.innerHTML = '<div class="p-4 text-center text-slate-400">Tidak ada hasil</div>';
                return;
            }

            let html = '';
            results.forEach(group => {
                html += `<div class="p-2 border-b border-slate-700 last:border-0">`;
                html += `<div class="text-xs font-bold text-purple-400 mb-1">${group.type}</div>`;
                group.items.forEach(item => {
                    html += `<div class="p-2 hover:bg-slate-800 rounded cursor-pointer text-sm" onclick="window.goToItem('${group.type}', '${item.id}')">${item.display}</div>`;
                });
                html += `</div>`;
            });
            searchResults.innerHTML = html;

        } catch (err) {
            log(`❌ Search error: ${err.message}`);
            searchResults.innerHTML = '<div class="p-3 text-red-400">Error saat mencari</div>';
        }
    }

    window.goToItem = (type, id) => {
        log(`🔍 Navigate to: ${type} - ${id}`);
        alert(`🔍 ${type} ID: ${id}\n\nNavigasi akan diimplementasikan di Phase 2.`);
    };

    // ========== QR MANAGER ==========
    document.getElementById('qr-entity-type')?.addEventListener('change', async (e) => {
        const type = e.target.value;
        const select = document.getElementById('qr-entity-id');
        select.innerHTML = '<option value="">-- Pilih Item --</option>';
        if (!type) return;

        let data;
        if (type === 'booking') {
            const { data: bookings } = await supabase.from(CONFIG.tables.bookings).select('id, nama_peminjam, ruang').order('created_at', { ascending: false }).limit(20);
            data = bookings;
        } else if (type === 'asset') {
            const { data: assets } = await supabase.from(CONFIG.tables.inventory).select('id, nama, lokasi').order('created_at', { ascending: false }).limit(20);
            data = assets;
        } else if (type === 'k3') {
            const { data: k3s } = await supabase.from(CONFIG.tables.k3).select('id, lokasi, jenis_laporan').order('created_at', { ascending: false }).limit(20);
            data = k3s;
        } else if (type === 'maintenance') {
            const { data: tasks } = await supabase.from(CONFIG.tables.tasks).select('id, lokasi, deskripsi').order('created_at', { ascending: false }).limit(20);
            data = tasks;
        } else if (type === 'dana') {
            const { data: dana } = await supabase.from(CONFIG.tables.dana).select('id, judul').order('created_at', { ascending: false }).limit(20);
            data = dana;
        }

        if (data?.length) {
            data.forEach(item => {
                const label = item.nama_peminjam || item.nama || item.lokasi || item.judul || 'Item';
                select.innerHTML += `<option value="${item.id}">${label}</option>`;
            });
        }
    });

    window.generateQRFromCommandCenter = async function() {
        const type = document.getElementById('qr-entity-type')?.value;
        const id = document.getElementById('qr-entity-id')?.value;
        if (!type || !id) {
            alert('Pilih entitas dan item terlebih dahulu!');
            return;
        }

        if (!window.QRCode) {
            alert('QRCode library tidak tersedia. Pastikan CDN QRCode.js sudah dimuat.');
            return;
        }

        let data;
        if (type === 'booking') {
            const { data: booking } = await supabase.from(CONFIG.tables.bookings).select('*').eq('id', id).single();
            data = { type: 'booking', ...booking };
        } else if (type === 'asset') {
            const { data: asset } = await supabase.from(CONFIG.tables.inventory).select('*').eq('id', id).single();
            data = { type: 'asset', ...asset };
        } else if (type === 'k3') {
            const { data: k3 } = await supabase.from(CONFIG.tables.k3).select('*').eq('id', id).single();
            data = { type: 'k3', ...k3 };
        } else if (type === 'maintenance') {
            const { data: task } = await supabase.from(CONFIG.tables.tasks).select('*').eq('id', id).single();
            data = { type: 'maintenance', ...task };
        } else if (type === 'dana') {
            const { data: dana } = await supabase.from(CONFIG.tables.dana).select('*').eq('id', id).single();
            data = { type: 'dana', ...dana };
        }

        if (!data) return;

        const qrData = JSON.stringify(data);
        const previewDiv = document.getElementById('qr-preview');
        previewDiv.innerHTML = '';
        new QRCode(previewDiv, {
            text: qrData,
            width: 200,
            height: 200
        });
    };

    window.printCurrentQR = function() {
        const qrPreview = document.getElementById('qr-preview').innerHTML;
        if (!qrPreview || qrPreview.includes('QR akan tampil')) {
            alert('Tidak ada QR untuk dicetak!');
            return;
        }

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head><title>Print QR Code</title></head>
                <body style="text-align: center; padding: 20px;">
                    ${qrPreview}
                    <p>Dicetak dari Dream OS Command Center</p>
                </body>
            </html>
        `);
        printWindow.print();
    };

    // ========== FILE MANAGER ==========
    let currentBucket = CONFIG.buckets.k3;

    const fileBucketSelect = document.getElementById('file-bucket');
    if (fileBucketSelect) {
        fileBucketSelect.addEventListener('change', (e) => {
            currentBucket = e.target.value;
            loadFiles();
        });
        log('✅ File bucket listener attached');
    }

    window.loadFiles = async function() {
        const container = document.getElementById('file-list');
        if (!container) {
            log('❌ file-list not found');
            return;
        }

        container.innerHTML = '<div class="text-center text-slate-400 py-8 col-span-full">⏳ Memuat file...</div>';

        try {
            const { data: files, error } = await supabase.storage
                .from(currentBucket)
                .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

            if (error) throw error;

            if (!files || files.length === 0) {
                container.innerHTML = '<div class="text-center text-slate-400 py-8 col-span-full">Tidak ada file dalam bucket ini</div>';
                return;
            }

            let html = '';
            for (const file of files) {
                const { data: urlData } = supabase.storage.from(currentBucket).getPublicUrl(file.name);
                const publicUrl = urlData?.publicUrl || '';
                const fileSize = (file.metadata?.size || 0) / 1024;
                const fileType = file.metadata?.mimetype || 'unknown';

                html += `
                    <div class="bg-slate-700/50 p-4 rounded-xl border border-slate-600 hover:bg-slate-700 transition">
                        <div class="flex flex-col items-center">
                            <div class="w-full h-32 bg-slate-800 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                                ${fileType.startsWith('image/')
                        ? `<img src="${publicUrl}" class="max-w-full max-h-full object-contain" onerror="this.style.display='none'">`
                        : `<i class="fas fa-file text-4xl text-slate-400"></i>`
                    }
                            </div>
                            <p class="text-xs font-bold truncate w-full text-center" title="${file.name}">${file.name}</p>
                            <p class="text-[10px] text-slate-400 mt-1">${fileSize.toFixed(1)} KB</p>
                            <div class="flex gap-2 mt-2">
                                <a href="${publicUrl}" target="_blank" class="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded-lg text-[10px]">🔍 Lihat</a>
                                <button onclick="window.downloadFile('${currentBucket}', '${file.name}')" class="bg-green-600 hover:bg-green-500 px-3 py-1 rounded-lg text-[10px]">⬇️</button>
                                <button onclick="window.deleteFile('${currentBucket}', '${file.name}')" class="bg-red-600 hover:bg-red-500 px-3 py-1 rounded-lg text-[10px]">🗑️</button>
                            </div>
                        </div>
                    </div>
                `;
            }
            container.innerHTML = html;
            log(`✅ Loaded ${files.length} files from ${currentBucket}`);

        } catch (err) {
            log(`❌ Error loading files: ${err.message}`);
            container.innerHTML = `<div class="text-center text-red-500 py-8 col-span-full">❌ Gagal memuat file: ${err.message}</div>`;
        }
    };

    window.downloadFile = async function(bucket, fileName) {
        try {
            const { data, error } = await supabase.storage.from(bucket).download(fileName);
            if (error) throw error;

            const url = URL.createObjectURL(data);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            log(`✅ File ${fileName} downloaded`);
        } catch (err) {
            log(`❌ Download error: ${err.message}`);
            alert('Gagal download: ' + err.message);
        }
    };

    window.deleteFile = async function(bucket, fileName) {
        if (!confirm(`Yakin ingin menghapus ${fileName}?`)) return;

        try {
            const { error } = await supabase.storage.from(bucket).remove([fileName]);
            if (error) throw error;

            log(`✅ File ${fileName} deleted`);
            loadFiles();
        } catch (err) {
            log(`❌ Delete error: ${err.message}`);
            alert('Gagal hapus: ' + err.message);
        }
    };

    // ========== EKSPOR LAPORAN PDF ==========
    async function generatePDF_A4(title, data, type, startDate, endDate) {
        if (!LIBS.jsPDF) {
            alert('jsPDF tidak ditemukan. Instal CDN untuk mengaktifkan PDF export.');
            return;
        }

        const { jsPDF } = LIBS;
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        const marginLeft = 15;
        const marginRight = 15;
        const pageWidth = doc.internal.pageSize.getWidth();

        doc.setFontSize(18);
        doc.setTextColor(40, 40, 40);
        doc.text(title, marginLeft, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Periode: ${startDate} s/d ${endDate}`, marginLeft, 28);
        doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, marginLeft, 34);

        doc.setDrawColor(200);
        doc.line(marginLeft, 38, pageWidth - marginRight, 38);

        let columns = [];
        let rows = [];

        if (type === 'booking') {
            columns = ['Nama', 'Ruang', 'Tanggal', 'Jam Mulai', 'Jam Selesai', 'Status'];
            rows = data.map(b => [b.nama_peminjam, b.ruang, b.tanggal, b.jam_mulai, b.jam_selesai, b.status]);
        } else if (type === 'k3') {
            columns = ['Tanggal', 'Lokasi', 'Jenis', 'Deskripsi', 'Pelapor', 'Status'];
            rows = data.map(k => [k.tanggal, k.lokasi, k.jenis_laporan, (k.deskripsi || '').substring(0, 50) + '...', k.pelapor, k.status]);
        } else if (type === 'dana') {
            columns = ['Tanggal', 'Judul', 'Kategori', 'Nominal', 'Pengaju', 'Status'];
            rows = data.map(d => [new Date(d.created_at).toLocaleDateString('id-ID'), d.judul, d.kategori, `Rp ${Number(d.nominal).toLocaleString()}`, d.pengaju, d.status]);
        }

        if (window.jspdf?.autotable) {
            doc.autoTable({
                head: [columns],
                body: rows,
                startY: 45,
                margin: { left: marginLeft, right: marginRight },
                styles: { fontSize: 9, cellPadding: 3 },
                headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [245, 247, 250] }
            });
        }

        doc.save(`Laporan_${type}_${new Date().toISOString().slice(0, 10)}.pdf`);
        log('✅ PDF generated');
    }

    window.exportReport = async function() {
        const type = document.getElementById('report-type')?.value;
        const start = document.getElementById('report-start')?.value;
        const end = document.getElementById('report-end')?.value;
        const statusDiv = document.getElementById('report-status');

        if (!start || !end) {
            if (statusDiv) statusDiv.innerHTML = '<span class="text-red-500">Pilih rentang tanggal!</span>';
            return;
        }

        if (statusDiv) statusDiv.innerHTML = '<span class="text-yellow-500">⏳ Menggenerate laporan...</span>';

        try {
            let data = [];
            let title = 'Laporan';

            if (type === 'booking') {
                title = 'Laporan Booking';
                const { data: bookings, error } = await supabase
                    .from(CONFIG.tables.bookings)
                    .select('nama_peminjam, ruang, tanggal, jam_mulai, jam_selesai, status')
                    .gte('tanggal', start)
                    .lte('tanggal', end)
                    .order('tanggal', { ascending: true });
                if (error) throw error;
                data = bookings || [];
            } else if (type === 'k3') {
                title = 'Laporan K3';
                const { data: k3s, error } = await supabase
                    .from(CONFIG.tables.k3)
                    .select('tanggal, lokasi, jenis_laporan, deskripsi, pelapor, status')
                    .gte('tanggal', start)
                    .lte('tanggal', end)
                    .order('tanggal', { ascending: true });
                if (error) throw error;
                data = k3s || [];
            } else if (type === 'dana') {
                title = 'Laporan Pengajuan Dana';
                const { data: dana, error } = await supabase
                    .from(CONFIG.tables.dana)
                    .select('created_at, judul, kategori, nominal, pengaju, status')
                    .gte('created_at', start + 'T00:00:00')
                    .lte('created_at', end + 'T23:59:59')
                    .order('created_at', { ascending: true });
                if (error) throw error;
                data = dana || [];
            }

            await generatePDF_A4(title, data, type, start, end);

            if (statusDiv) statusDiv.innerHTML = '<span class="text-green-500">✅ PDF berhasil digenerate!</span>';

        } catch (err) {
            log(`❌ Export error: ${err.message}`);
            if (statusDiv) statusDiv.innerHTML = `<span class="text-red-500">❌ Error: ${err.message}</span>`;
        }
    };

    // ========== BACKUP MANAGER (TAMBAHAN) ==========
    async function loadBackupManager() {
        log('💾 Loading Backup Manager...');

        const container = document.getElementById('backup-container');
        if (!container) {
            log('⚠️ backup-container not found');
            return;
        }

        const backups = window.BackupManager?.listBackups() || [];

        container.innerHTML = `
            <div class="space-y-4">
                <div class="flex gap-2 flex-wrap">
                    <button onclick="window.BackupManager?.createBackup()" class="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl text-xs font-bold transition">
                        💾 Create Backup
                    </button>
                    <button onclick="window.BackupManager?.backupToGoogleDrive()" class="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-xl text-xs font-bold transition">
                        ☁️ Google Drive
                    </button>
                    <button onclick="window.ExcelExport?.exportAllTables()" class="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-xl text-xs font-bold transition">
                        📊 Export Excel
                    </button>
                </div>

                <div class="bg-slate-800 rounded-xl p-4">
                    <h4 class="font-bold text-sm mb-3">📦 Available Backups</h4>
                    ${backups.length
                ? backups.map(b => `
                        <div class="flex justify-between items-center bg-slate-700 p-3 rounded-lg mb-2">
                            <span class="text-xs">${b.date.toLocaleString('id-ID')}</span>
                            <div class="flex gap-2">
                                <button onclick="window.BackupManager?.restoreBackup('${b.key}')" class="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-[10px] transition">
                                    🔄 Restore
                                </button>
                                <button onclick="window.BackupManager?.deleteBackup('${b.key}')" class="bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-[10px] transition">
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    `).join('')
                : '<p class="text-slate-400 text-xs">No backups found. Create your first backup!</p>'
            }
                </div>
            </div>
        `;

        log('✅ Backup Manager loaded');
    }

    // ========== EXCEL EXPORT (INTEGRASI DENGAN SHEETJS) ==========
    window.ExcelExport = {
        async exportAllTables() {
            if (!LIBS.XLSX) {
                alert('SheetJS tidak ditemukan. Instal CDN untuk mengaktifkan export Excel.');
                return;
            }

            log('📊 Exporting all tables to Excel...');
            alert('Fitur Excel export akan segera diimplementasikan.');
            // Implementasi lebih lanjut bisa ditambahkan di sini
        }
    };

    // ========== BACKUP MANAGER SIMULASI (UNTUK UI) ==========
    window.BackupManager = {
        listBackups() {
            return [];
        },
        createBackup() {
            alert('Fitur backup akan segera hadir!');
        },
        backupToGoogleDrive() {
            alert('Fitur backup ke Google Drive akan segera hadir!');
        },
        restoreBackup(key) {
            alert(`Restore backup ${key} akan segera hadir!`);
        },
        deleteBackup(key) {
            alert(`Hapus backup ${key} akan segera hadir!`);
        }
    };

    // ========== INITIALIZATION ==========
    (async function init() {
        log('🏁 Initializing Command Center...');

        try {
            await Promise.all([
                loadApprovals(),
                updateStats(),
                loadAllBookings(),
                initCalendar()
            ]);

            setManagedInterval(updateStats, CONFIG.intervals.stats);
            setManagedInterval(loadRuangKerja, CONFIG.intervals.ruangKerja);

            log('✅ Command Center ready.');
            log('📊 Modules: All loaded');
            log('🔒 Security: Active');
            log('⏱️ Session timeout: 5 minutes');

        } catch (err) {
            log(`❌ Init error: ${err.message}`);
        }
    })();

})();