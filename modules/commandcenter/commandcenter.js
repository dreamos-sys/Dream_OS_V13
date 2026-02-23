/**
 * 🏛️ DREAM OS v13.4 - COMMAND CENTER (FINAL VERSION)
 * Semua event listener pakai addEventListener.
 * Menggunakan window.supabase dari root.
 */

(function() {
    // ========== DEBUG TOOL dengan tombol close ==========
    const debugDiv = document.createElement('div');
    debugDiv.id = 'debug-console';
    debugDiv.style.cssText = 'position:fixed; bottom:10px; right:10px; background:#111; color:#0f0; padding:8px; border-radius:8px; font-size:10px; font-family:monospace; z-index:9999; max-width:300px; max-height:200px; overflow:auto; border:1px solid #0f0;';
    debugDiv.innerHTML = '<div style="position:absolute; top:2px; right:2px; cursor:pointer; color:white; background:red; width:16px; height:16px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px;" onclick="this.parentElement.style.display=\'none\'">×</div>';
    document.body.appendChild(debugDiv);

    function log(msg) {
        const line = document.createElement('div');
        line.textContent = `> ${msg}`;
        debugDiv.appendChild(line);
        console.log(msg);
        debugDiv.scrollTop = debugDiv.scrollHeight;
    }

    log('🚀 Command Center v13.4 starting...');

    // ========== CEK SUPABASE ==========
    if (!window.supabase) {
        log('❌ window.supabase tidak ditemukan! Pastikan root index.html memuatnya.');
        return;
    }
    const supabase = window.supabase;
    log('✅ Supabase client ready');

    // ========== CLOCK ==========
    function updateClock() {
        const clockEl = document.getElementById('clock');
        if (clockEl) {
            clockEl.textContent = new Date().toLocaleTimeString('id-ID');
        }
    }
    setInterval(updateClock, 1000);
    log('✅ Clock started');

    // ========== TAB SYSTEM ==========
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');
    log(`📊 Ditemukan ${tabs.length} tab buttons`);

    function switchTab(tabId) {
        log(`👉 Switching to tab: ${tabId}`);
        contents.forEach(c => c.classList.add('hidden'));
        const targetContent = document.getElementById(`tab-${tabId}`);
        if (targetContent) targetContent.classList.remove('hidden');
        else log(`❌ Content tab-${tabId} not found!`);

        tabs.forEach(t => {
            t.classList.remove('active', 'text-purple-500', 'border-b-2', 'border-purple-500');
            t.classList.add('text-gray-400');
        });
        const activeBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active', 'text-purple-500', 'border-b-2', 'border-purple-500');
            activeBtn.classList.remove('text-gray-400');
        }

        // Panggil fungsi spesifik saat tab diaktifkan
        if (tabId === 'analytics') loadAnalytics();
        if (tabId === 'ruangkerja') loadRuangKerja();
        if (tabId === 'dana') loadDanaList();
        if (tabId === 'approval') loadApprovals();
        if (tabId === 'slides') loadSlidePreviews();
        if (tabId === 'pengajuan') loadSpjList?.(); // jika ada
    }

    tabs.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = btn.dataset.tab;
            log(`🖱️ Tab clicked: ${tabId}`);
            switchTab(tabId);
        });
    });
    log('✅ Tab event listeners attached');
    setTimeout(() => {
        log('🏁 Showing default tab (dashboard)');
        switchTab('dashboard');
    }, 500);

    // ========== VOICE COMMAND ==========
    const micBtn = document.getElementById('mic-button');
    if (micBtn) {
        log('🎤 Mic button found');
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.lang = 'id-ID';
            recognition.continuous = false;
            micBtn.addEventListener('click', () => {
                log('🎤 Voice recognition started');
                micBtn.classList.add('animate-ping');
                recognition.start();
            });
            recognition.onresult = (e) => {
                const cmd = e.results[0][0].transcript.toLowerCase();
                log(`🎤 Command: ${cmd}`);
                micBtn.classList.remove('animate-ping');
                if (cmd.includes('dashboard')) switchTab('dashboard');
                else if (cmd.includes('ruang kerja')) switchTab('ruangkerja');
                else if (cmd.includes('dana')) switchTab('dana');
                else if (cmd.includes('analisis')) switchTab('analytics');
                else if (cmd.includes('tanya')) switchTab('ai');
                else if (cmd.includes('pengajuan')) switchTab('pengajuan');
                else if (cmd.includes('slide')) switchTab('slides');
                else if (cmd.includes('logout')) {
                    sessionStorage.removeItem('allowed_modules');
                    window.location.href = '/Dream_OS_V13/';
                }
            };
            recognition.onerror = (e) => {
                log(`❌ Voice error: ${e.error}`);
                micBtn.classList.remove('animate-ping');
            };
        } else {
            log('⚠️ Speech recognition not supported');
            micBtn.style.opacity = '0.5';
        }
    } else {
        log('❌ Mic button not found');
    }

    // ========== CAMERA ==========
    const video = document.getElementById('camera-preview');
    const canvas = document.getElementById('camera-canvas');
    let stream = null;
    const startBtn = document.getElementById('start-camera');
    const stopBtn = document.getElementById('stop-camera');
    const captureBtn = document.getElementById('capture-photo');
    if (startBtn) {
        startBtn.addEventListener('click', async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                video.srcObject = stream;
                log('🎥 Camera started');
            } catch (err) { log(`❌ Camera error: ${err.message}`); }
        });
    }
    if (stopBtn) {
        stopBtn.addEventListener('click', () => {
            if (stream) {
                stream.getTracks().forEach(t => t.stop());
                video.srcObject = null;
                log('📷 Camera stopped');
            }
        });
    }
    if (captureBtn) {
        captureBtn.addEventListener('click', () => {
            if (!stream || !video.srcObject) { log('❌ Camera not active'); return; }
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            const imgData = canvas.toDataURL('image/png');
            document.getElementById('camera-result').innerHTML = '✅ Foto tersimpan!';
            document.getElementById('spj_photo_data').value = imgData;
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
            if (question.includes('hanung')) aiAnswer.innerText = "Bapak Hanung Budianto S. E adalah Approver utama sistem ini.";
            else if (question.includes('k3')) aiAnswer.innerText = "Silakan cek tab Analytics untuk data K3 real-time.";
            else if (question.includes('dana')) aiAnswer.innerText = "Cek tab Dana untuk pengajuan.";
            else aiAnswer.innerText = "Bismillah, saya sedang mempelajari perintah tersebut.";
        });
    }

    // ========== SECURITY CHECK ==========
    window.triggerSecurityCheck = () => {
        log('🔒 Security check triggered');
        const coreStatus = document.getElementById('core-status');
        if (!coreStatus) return;
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                const latDiff = Math.abs(pos.coords.latitude - (-6.4));
                const lngDiff = Math.abs(pos.coords.longitude - (106.8));
                if (latDiff < 0.5 && lngDiff < 0.5) {
                    coreStatus.innerText = "SECURE (IN DEPOK)";
                    coreStatus.className = "text-blue-400 font-bold";
                    alert("✅ Device Secure.");
                } else {
                    coreStatus.innerText = "⚠️ OUTSIDE SAFE CORE";
                    coreStatus.className = "text-yellow-500";
                }
                log(`📍 GPS: ${pos.coords.latitude}, ${pos.coords.longitude}`);
            }, () => {
                coreStatus.innerText = "GPS DISABLED";
                coreStatus.className = "text-yellow-500";
                log('❌ GPS denied');
            });
        } else {
            coreStatus.innerText = "GPS NOT SUPPORTED";
        }
    };

    // ========== ANALYTICS ==========
    function loadAnalytics() {
        log('📈 Loading analytics...');
        const ctx = document.getElementById('bookingChart')?.getContext('2d');
        if (!ctx) { log('❌ Canvas not found'); return; }
        if (window.myChart) window.myChart.destroy();
        window.myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
                datasets: [{
                    label: 'Booking',
                    data: [2, 5, 3, 8, 4, 1, 0],
                    borderColor: '#8b5cf6',
                    tension: 0.4,
                    backgroundColor: 'rgba(139,92,246,0.2)',
                    fill: true
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
        log('✅ Chart created');
    }

    // ========== LOAD RUANG KERJA (Semua Data Pending) ==========
    async function loadRuangKerja() {
        log('🏢 Loading Ruang Kerja...');
        try {
            // 1. Booking pending
            const { data: booking } = await supabase
                .from('bookings')
                .select('id, nama_peminjam, ruang, tanggal, jam_mulai')
                .eq('status', 'pending')
                .limit(5);
            const bookingList = document.getElementById('rk-booking-list');
            if (bookingList) {
                if (booking?.length) {
                    bookingList.innerHTML = booking.map(b => 
                        `<div class="p-2 bg-slate-700 rounded text-xs flex justify-between">
                            <span>📅 ${b.tanggal} ${b.jam_mulai} - ${b.nama_peminjam} (${b.ruang})</span>
                            <button onclick="viewBookingDetail('${b.id}')" class="text-blue-400">Detail</button>
                        </div>`
                    ).join('');
                } else {
                    bookingList.innerHTML = '<p class="text-slate-400 text-xs">Tidak ada pending booking</p>';
                }
            }

            // 2. K3 pending
            const { data: k3 } = await supabase
                .from('k3_reports')
                .select('id, tanggal, lokasi, jenis_laporan, pelapor')
                .eq('status', 'pending')
                .limit(5);
            const k3List = document.getElementById('rk-k3-list');
            if (k3List) {
                if (k3?.length) {
                    k3List.innerHTML = k3.map(k => 
                        `<div class="p-2 bg-slate-700 rounded text-xs flex justify-between">
                            <span>⚠️ ${k.tanggal} - ${k.lokasi} (${k.jenis_laporan}) - ${k.pelapor}</span>
                            <a href="#k3-officer" class="text-blue-400">Verif</a>
                        </div>`
                    ).join('');
                } else {
                    k3List.innerHTML = '<p class="text-slate-400 text-xs">Tidak ada pending K3</p>';
                }
            }

            // 3. Janitor indoor & outdoor pending
            const [janitorIn, janitorOut] = await Promise.all([
                supabase.from('janitor_indoor').select('id, tanggal, shift, petugas, lokasi').eq('status', 'pending').limit(3),
                supabase.from('janitor_outdoor').select('id, tanggal, shift, petugas, area').eq('status', 'pending').limit(3)
            ]);
            const janitorList = document.getElementById('rk-janitor-list');
            if (janitorList) {
                let html = '';
                if (janitorIn.data?.length) {
                    janitorIn.data.forEach(j => html += `<div class="p-2 bg-slate-700 rounded text-xs">🏠 ${j.tanggal} ${j.shift} - ${j.petugas} (${j.lokasi})</div>`);
                }
                if (janitorOut.data?.length) {
                    janitorOut.data.forEach(j => html += `<div class="p-2 bg-slate-700 rounded text-xs">🌳 ${j.tanggal} ${j.shift} - ${j.petugas} (${j.area})</div>`);
                }
                if (!html) html = '<p class="text-slate-400 text-xs">Tidak ada pending janitor</p>';
                janitorList.innerHTML = html;
            }

            // 4. Maintenance aktif (status proses)
            const { data: maint } = await supabase
                .from('maintenance_tasks')
                .select('id, lokasi, deskripsi, prioritas')
                .eq('status', 'proses')
                .limit(5);
            const maintList = document.getElementById('rk-maintenance-list');
            if (maintList) {
                if (maint?.length) {
                    maintList.innerHTML = maint.map(m => 
                        `<div class="p-2 bg-slate-700 rounded text-xs">🔧 ${m.lokasi} - ${m.deskripsi.substring(0,30)}... (${m.prioritas})</div>`
                    ).join('');
                } else {
                    maintList.innerHTML = '<p class="text-slate-400 text-xs">Tidak ada maintenance aktif</p>';
                }
            }

            // 5. Pengajuan dana pending
            const { data: pengajuan } = await supabase
                .from('pengajuan_dana')
                .select('id, judul, kategori, nominal, pengaju')
                .eq('status', 'pending')
                .limit(5);
            const pengajuanList = document.getElementById('rk-pengajuan-list');
            if (pengajuanList) {
                if (pengajuan?.length) {
                    pengajuanList.innerHTML = pengajuan.map(p => 
                        `<div class="p-2 bg-slate-700 rounded text-xs">💰 ${p.judul} - Rp ${p.nominal?.toLocaleString()} (${p.pengaju})</div>`
                    ).join('');
                } else {
                    pengajuanList.innerHTML = '<p class="text-slate-400 text-xs">Tidak ada pengajuan pending</p>';
                }
            }

            // 6. Reminder (next_service dalam 7 hari ke depan)
            const today = new Date().toISOString().split('T')[0];
            const nextWeek = new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0];
            const { data: reminder } = await supabase
                .from('preventive_maintenance')
                .select('*')
                .lte('next_service', nextWeek)
                .order('next_service', { ascending: true });
            const reminderList = document.getElementById('rk-reminder-list');
            if (reminderList) {
                if (reminder?.length) {
                    reminderList.innerHTML = reminder.map(r => {
                        const statusClass = r.next_service < today ? 'text-red-500' : 'text-yellow-500';
                        return `<div class="p-2 bg-slate-700 rounded text-xs ${statusClass}">⏰ ${r.nama_item} - ${r.lokasi} (next: ${r.next_service})</div>`;
                    }).join('');
                } else {
                    reminderList.innerHTML = '<p class="text-slate-400 text-xs">Tidak ada reminder</p>';
                }
            }

            // 7. Cuaca & mitigasi (sementara statis)
            document.getElementById('weather-display').innerHTML = '🌤️ Cerah, 26°C (update otomatis)';
            document.getElementById('traffic-display').innerHTML = 'Lalu lintas: Lancar';
            document.getElementById('disaster-display').innerHTML = 'Tidak ada peringatan bencana';

        } catch (err) {
            log(`❌ Error load Ruang Kerja: ${err.message}`);
        }
    }

    // ========== LOAD SEMUA BOOKING UNTUK TABEL ==========
    async function loadAllBookings() {
        const tbody = document.getElementById('booking-table-body');
        if (!tbody) return;
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            if (!data?.length) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-slate-500">Belum ada booking</td></tr>';
                return;
            }
            let html = '';
            data.forEach(b => {
                const statusColor = b.status === 'pending' ? 'text-yellow-500' : b.status === 'approved' ? 'text-green-500' : 'text-red-500';
                html += `<tr class="border-b border-slate-700">
                    <td class="p-2">${b.nama_peminjam || '-'}</td>
                    <td>${b.ruang || '-'}</td>
                    <td>${b.tanggal || '-'}</td>
                    <td>${b.jam_mulai || ''} - ${b.jam_selesai || ''}</td>
                    <td><span class="${statusColor}">${b.status || '-'}</span></td>
                    <td>
                        <button onclick="viewBookingDetail('${b.id}')" class="bg-blue-600 px-2 py-1 rounded text-[10px]">Detail</button>
                    </td>
                </tr>`;
            });
            tbody.innerHTML = html;
        } catch (err) {
            log(`❌ Error load all bookings: ${err.message}`);
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-red-500">Error memuat data</td></tr>';
        }
    }

    // ========== KALENDER BOOKING (FullCalendar) ==========
    let calendar = null;
    async function initCalendar() {
        const calendarEl = document.getElementById('calendar');
        if (!calendarEl) return;
        if (calendar) calendar.destroy();

        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('status', 'approved'); // hanya yang approved untuk kalender

        const events = (data || []).map(b => ({
            title: `${b.nama_peminjam} - ${b.ruang}`,
            start: `${b.tanggal}T${b.jam_mulai}`,
            end: `${b.tanggal}T${b.jam_selesai}`,
            color: b.status === 'approved' ? '#10b981' : '#f59e0b',
            extendedProps: { id: b.id }
        }));

        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            events: events,
            eventClick: (info) => {
                viewBookingDetail(info.event.extendedProps.id);
            }
        });
        calendar.render();
        log('✅ Calendar initialized');
    }

    // ========== MODAL DETAIL BOOKING ==========
    window.viewBookingDetail = async (id) => {
        const modal = document.getElementById('booking-detail-modal');
        const contentDiv = document.getElementById('booking-detail-content');
        if (!modal || !contentDiv) return;

        try {
            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .eq('id', id)
                .single();
            if (error) throw error;

            contentDiv.innerHTML = `
                <div class="space-y-2 text-sm">
                    <p><strong>Peminjam:</strong> ${data.nama_peminjam}</p>
                    <p><strong>Divisi:</strong> ${data.divisi || '-'}</p>
                    <p><strong>No HP:</strong> ${data.no_hp || '-'}</p>
                    <p><strong>Ruang:</strong> ${data.ruang}</p>
                    <p><strong>Tanggal:</strong> ${data.tanggal}</p>
                    <p><strong>Jam:</strong> ${data.jam_mulai} - ${data.jam_selesai}</p>
                    <p><strong>Keperluan:</strong> ${data.keperluan || '-'}</p>
                    <p><strong>Peralatan:</strong> ${data.peralatan || '-'}</p>
                    <p><strong>Status:</strong> <span class="${data.status === 'pending' ? 'text-yellow-500' : data.status === 'approved' ? 'text-green-500' : 'text-red-500'}">${data.status}</span></p>
                    <p><strong>Lampiran:</strong> ${data.attachments?.length ? data.attachments.map(u => `<a href="${u}" target="_blank" class="text-blue-400">File</a>`).join(', ') : 'Tidak ada'}</p>
                </div>
            `;
            // Simpan id booking di modal untuk keperluan approve/reject
            modal.dataset.bookingId = id;
            modal.classList.remove('hidden');
        } catch (err) {
            alert('Gagal memuat detail booking: ' + err.message);
        }
    };

    window.approveBooking = async () => {
        const modal = document.getElementById('booking-detail-modal');
        const id = modal.dataset.bookingId;
        if (!id) return;
        await updateStatus('bookings', id, 'approved');
        modal.classList.add('hidden');
        loadAllBookings(); // refresh tabel
        if (calendar) initCalendar(); // refresh kalender
    };

    window.rejectBooking = async () => {
        const modal = document.getElementById('booking-detail-modal');
        const id = modal.dataset.bookingId;
        if (!id) return;
        await updateStatus('bookings', id, 'rejected');
        modal.classList.add('hidden');
        loadAllBookings();
        if (calendar) initCalendar();
    };

    window.closeBookingDetail = () => {
        document.getElementById('booking-detail-modal').classList.add('hidden');
    };

    // ========== EXPORT BOOKINGS (sementara alert) ==========
    window.exportBookings = () => {
        alert('Fitur ekspor sedang dalam pengembangan. Akan segera hadir!');
        // Nanti bisa implementasi dengan jsPDF atau SheetJS
    };

    // ========== UPDATE STATISTIK HEADER ==========
    async function updateStats() {
        try {
            const { count: booking } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending');
            const { count: k3 } = await supabase.from('k3_reports').select('*', { count: 'exact', head: true }).eq('status', 'pending');
            const { count: pengajuan } = await supabase.from('pengajuan_dana').select('*', { count: 'exact', head: true }).eq('status', 'pending');
            const { count: reminder } = await supabase.from('preventive_maintenance').select('*', { count: 'exact', head: true }).lt('next_service', new Date().toISOString().split('T')[0]);
            document.getElementById('stat-booking').textContent = booking || 0;
            document.getElementById('stat-k3').textContent = k3 || 0;
            document.getElementById('stat-pengajuan').textContent = pengajuan || 0;
            document.getElementById('stat-reminder').textContent = reminder || 0;
        } catch (err) {
            log(`❌ Error update stats: ${err.message}`);
        }
    }

    // ========== LOAD APPROVALS (Booking, K3, Dana) ==========
    async function loadApprovals() {
        log('✅ Loading approvals...');
        try {
            // Booking pending (dengan kolom yang benar)
            const { data: bookings } = await supabase
                .from('bookings')
                .select('id, nama_peminjam, ruang, tanggal, jam_mulai')
                .eq('status', 'pending')
                .limit(5);
            const bookingDiv = document.getElementById('approval-booking');
            if (bookingDiv) {
                if (bookings?.length) {
                    bookingDiv.innerHTML = bookings.map(b => `
                        <div class="flex justify-between items-center bg-slate-700 p-3 rounded-xl">
                            <span class="text-xs">${b.nama_peminjam} - ${b.ruang} (${b.tanggal} ${b.jam_mulai})</span>
                            <div>
                                <button onclick="updateStatus('bookings','${b.id}','approved')" class="bg-green-600 px-3 py-1 rounded text-[10px]">✓</button>
                                <button onclick="updateStatus('bookings','${b.id}','rejected')" class="bg-red-600 px-3 py-1 rounded text-[10px]">✗</button>
                            </div>
                        </div>
                    `).join('');
                } else {
                    bookingDiv.innerHTML = '<p class="text-xs text-slate-400">Tidak ada pending booking</p>';
                }
            }

            // K3 pending
            const { data: k3 } = await supabase
                .from('k3_reports')
                .select('id, tanggal, lokasi, jenis_laporan, pelapor')
                .eq('status', 'pending')
                .limit(5);
            const k3Div = document.getElementById('approval-k3');
            if (k3Div) {
                if (k3?.length) {
                    k3Div.innerHTML = k3.map(k => `
                        <div class="flex justify-between items-center bg-slate-700 p-3 rounded-xl">
                            <span class="text-xs">${k.tanggal} - ${k.lokasi} (${k.jenis_laporan}) - ${k.pelapor}</span>
                            <a href="#k3-officer" class="bg-blue-600 px-3 py-1 rounded text-[10px]">Verif</a>
                        </div>
                    `).join('');
                } else {
                    k3Div.innerHTML = '<p class="text-xs text-slate-400">Tidak ada pending K3</p>';
                }
            }

            // Pengajuan dana pending
            const { data: dana } = await supabase
                .from('pengajuan_dana')
                .select('id, judul, kategori, nominal, pengaju')
                .eq('status', 'pending')
                .limit(5);
            const danaDiv = document.getElementById('approval-dana');
            if (danaDiv) {
                if (dana?.length) {
                    danaDiv.innerHTML = dana.map(d => `
                        <div class="flex justify-between items-center bg-slate-700 p-3 rounded-xl">
                            <span class="text-xs">${d.judul} - Rp ${d.nominal?.toLocaleString()} (${d.pengaju})</span>
                            <div>
                                <button onclick="updatePengajuanDana('${d.id}','disetujui')" class="bg-green-600 px-3 py-1 rounded text-[10px]">✓</button>
                                <button onclick="updatePengajuanDana('${d.id}','ditolak')" class="bg-red-600 px-3 py-1 rounded text-[10px]">✗</button>
                            </div>
                        </div>
                    `).join('');
                } else {
                    danaDiv.innerHTML = '<p class="text-xs text-slate-400">Tidak ada pengajuan dana</p>';
                }
            }
        } catch (err) {
            log(`❌ Error load approvals: ${err.message}`);
        }
    }

    window.updateStatus = async (table, id, status) => {
        log(`🔄 updateStatus dipanggil: table=${table}, id=${id}, status=${status}`);
        try {
            await supabase.from(table).update({ status }).eq('id', id);
            log(`✅ ${table} ${id} updated to ${status}`);
            loadApprovals();
            loadRuangKerja();
            loadAllBookings();
            updateStats();
            if (table === 'bookings' && calendar) initCalendar(); // refresh kalender jika booking berubah
        } catch (err) {
            log(`❌ Error update: ${err.message}`);
        }
    };

    window.updatePengajuanDana = async (id, status) => {
        log(`🔄 updatePengajuanDana: id=${id}, status=${status}`);
        try {
            await supabase.from('pengajuan_dana').update({ status }).eq('id', id);
            log(`✅ Pengajuan dana ${id} updated to ${status}`);
            loadApprovals();
            loadRuangKerja();
            updateStats();
        } catch (err) {
            log(`❌ Error update: ${err.message}`);
        }
    };

    // ========== DANA ==========
    async function loadDanaList() {
        log('💰 Loading Dana list...');
        const container = document.getElementById('dana-list');
        if (!container) return;
        try {
            const { data } = await supabase
                .from('pengajuan_dana')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);
            if (data?.length) {
                container.innerHTML = data.map(d => `
                    <div class="p-3 bg-slate-700 rounded flex justify-between items-center">
                        <div>
                            <strong>${d.judul}</strong> (${d.kategori.replace(/_/g,' ')})<br>
                            <span class="text-xs">Rp ${d.nominal.toLocaleString()} | ${d.periode || '-'} | Pengaju: ${d.pengaju}</span>
                        </div>
                        <span class="${d.status === 'pending' ? 'text-yellow-500' : d.status === 'disetujui' ? 'text-green-500' : 'text-red-500'} text-xs">${d.status}</span>
                    </div>
                `).join('');
            } else {
                container.innerHTML = '<p class="text-slate-400">Belum ada pengajuan dana.</p>';
            }
        } catch (err) {
            log(`❌ Error load Dana: ${err.message}`);
            container.innerHTML = '<p class="text-red-400">Gagal memuat data.</p>';
        }
    }

    document.getElementById('danaForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            kategori: document.getElementById('dana_kategori').value,
            judul: document.getElementById('dana_judul').value,
            deskripsi: document.getElementById('dana_deskripsi').value,
            nominal: parseFloat(document.getElementById('dana_nominal').value),
            periode: document.getElementById('dana_periode').value,
            pengaju: document.getElementById('dana_pengaju').value,
            departemen: document.getElementById('dana_departemen').value,
            status: 'pending'
        };
        const { error } = await supabase.from('pengajuan_dana').insert([data]);
        const result = document.getElementById('dana-result');
        if (error) {
            result.innerHTML = `<span class="text-red-500">Gagal: ${error.message}</span>`;
        } else {
            result.innerHTML = '<span class="text-green-500">Pengajuan dana berhasil!</span>';
            e.target.reset();
            loadDanaList();
            updateStats();
        }
    });

    // ========== SPJ ==========
    async function loadSpjList() {
        // bisa diisi nanti
    }

    document.getElementById('spjForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const judul = document.getElementById('spj_judul').value;
        const fotoData = document.getElementById('spj_photo_data').value;
        if (!judul || !fotoData) {
            alert('Judul dan foto harus diisi!');
            return;
        }
        // Simpan ke tabel spj (asumsi ada)
        const { error } = await supabase.from('spj').insert([{
            judul: judul,
            foto: fotoData,
            status: 'pending'
        }]);
        if (error) {
            alert('Gagal: ' + error.message);
        } else {
            alert('SPJ berhasil diajukan!');
            e.target.reset();
            document.getElementById('camera-result').innerHTML = 'No Image Captured';
            document.getElementById('spj_photo_data').value = '';
        }
    });

    // ========== SLIDE ==========
    async function loadSlidePreviews() {
        log('🖼️ Loading slide previews...');
        try {
            const { data } = await supabase
                .from('admin_info')
                .select('*')
                .order('created_at', { ascending: false });
            const slide5 = data?.find(s => s.slide_number === 5)?.content || '-';
            const slide6 = data?.find(s => s.slide_number === 6)?.content || '-';
            const slide7 = data?.find(s => s.slide_number === 7)?.content || '-';
            document.getElementById('preview-slide5').textContent = slide5;
            document.getElementById('preview-slide6').textContent = slide6;
            document.getElementById('preview-slide7').textContent = slide7;
        } catch (err) {
            log(`❌ Error load slide previews: ${err.message}`);
        }
    }

    document.getElementById('slideForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const slideNumber = parseInt(document.getElementById('slide_number').value);
        const content = document.getElementById('slide_content').value;
        const { error } = await supabase
            .from('admin_info')
            .insert([{ slide_number: slideNumber, content }]);
        if (error) {
            alert('Gagal update: ' + error.message);
        } else {
            alert('Slide berhasil diupdate!');
            loadSlidePreviews();
        }
    });

    // ========== REMINDER ==========
    window.showAddReminderForm = () => {
        document.getElementById('reminder-modal').classList.remove('hidden');
    };
    window.closeReminderModal = () => {
        document.getElementById('reminder-modal').classList.add('hidden');
    };
    document.getElementById('reminderForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            nama_item: document.getElementById('reminder_nama').value,
            lokasi: document.getElementById('reminder_lokasi').value,
            interval_bulan: parseInt(document.getElementById('reminder_interval').value),
            terakhir_service: document.getElementById('reminder_terakhir').value
        };
        const { error } = await supabase.from('preventive_maintenance').insert([data]);
        if (!error) {
            closeReminderModal();
            loadRuangKerja(); // refresh reminder di ruang kerja
            updateStats();
        } else {
            alert('Gagal: ' + error.message);
        }
    });

    // ========== GLOBAL SEARCH (DIPERBAIKI) ==========
    let searchTimeout = null;
    const searchInput = document.getElementById('global-search-input');
    const searchResults = document.getElementById('search-results');

    if (searchInput) {
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
    }

    async function performSearch(query) {
        log(`🔍 Searching for: "${query}"`);
        searchResults.innerHTML = '<div class="p-3 text-slate-400">Memuat...</div>';
        searchResults.classList.remove('hidden');

        try {
            const results = [];

            // 1. Bookings (dengan kolom yang benar)
            const { data: bookings } = await supabase
                .from('bookings')
                .select('id, nama_peminjam, ruang, tanggal, jam_mulai, status')
                .or(`nama_peminjam.ilike.%${query}%,ruang.ilike.%${query}%,keperluan.ilike.%${query}%`)
                .limit(3);
            if (bookings?.length) results.push({ type: '📅 Booking', icon: '📅', items: bookings.map(b => ({ ...b, display: `${b.nama_peminjam} - ${b.ruang} ${b.tanggal}` })) });

            // 2. Assets (asumsi tabel assets)
            const { data: assets } = await supabase
                .from('assets')
                .select('id, nama_asset, kategori, lokasi, kondisi')
                .or(`nama_asset.ilike.%${query}%,kategori.ilike.%${query}%,lokasi.ilike.%${query}%`)
                .limit(3);
            if (assets?.length) results.push({ type: '🏢 Asset', icon: '🏢', items: assets.map(a => ({ ...a, display: `${a.nama_asset} (${a.kategori})` })) });

            // 3. K3
            const { data: k3s } = await supabase
                .from('k3_reports')
                .select('id, tanggal, lokasi, jenis_laporan, pelapor')
                .or(`lokasi.ilike.%${query}%,jenis_laporan.ilike.%${query}%,pelapor.ilike.%${query}%,deskripsi.ilike.%${query}%`)
                .limit(3);
            if (k3s?.length) results.push({ type: '⚠️ K3', icon: '⚠️', items: k3s.map(k => ({ ...k, display: `${k.tanggal} ${k.lokasi} (${k.jenis_laporan})` })) });

            // 4. Maintenance Tasks
            const { data: maintenance } = await supabase
                .from('maintenance_tasks')
                .select('id, lokasi, deskripsi, prioritas, status')
                .or(`lokasi.ilike.%${query}%,deskripsi.ilike.%${query}%`)
                .limit(3);
            if (maintenance?.length) results.push({ type: '🔧 Maintenance', icon: '🔧', items: maintenance.map(m => ({ ...m, display: `${m.lokasi} - ${m.deskripsi.substring(0,30)}` })) });

            // 5. Gudang Stok
            const { data: stok } = await supabase
                .from('gudang_stok')
                .select('id, nama_barang, kategori, stok, satuan')
                .or(`nama_barang.ilike.%${query}%,kategori.ilike.%${query}%`)
                .limit(3);
            if (stok?.length) results.push({ type: '📦 Stok', icon: '📦', items: stok.map(s => ({ ...s, display: `${s.nama_barang} (stok: ${s.stok} ${s.satuan})` })) });

            // 6. SPJ
            const { data: spj } = await supabase
                .from('spj')
                .select('id, judul, nominal, status')
                .ilike('judul', `%${query}%`)
                .limit(3);
            if (spj?.length) results.push({ type: '📄 SPJ', icon: '📄', items: spj.map(s => ({ ...s, display: `${s.judul} - Rp ${s.nominal?.toLocaleString()}` })) });

            if (results.length === 0) {
                searchResults.innerHTML = '<div class="p-4 text-center text-slate-400">Tidak ada hasil</div>';
                return;
            }

            let html = '';
            results.forEach(group => {
                html += `<div class="p-2 border-b border-slate-700 last:border-0">`;
                html += `<div class="text-xs font-bold text-purple-400 mb-1">${group.icon} ${group.type}</div>`;
                group.items.forEach(item => {
                    html += `<div class="p-2 hover:bg-slate-800 rounded cursor-pointer text-sm" onclick="window.goToItem('${group.type}', '${item.id}')">${item.display || item.judul || item.nama_asset || item.lokasi}</div>`;
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
        alert(`🔍 ${type} ID: ${id} (navigasi menyusul)`);
        // Bisa diarahkan ke halaman detail modul masing-masing
    };

    // ========== INIT ==========
    (async function init() {
        // Muat data awal
        loadApprovals();
        updateStats();
        await loadAllBookings();
        initCalendar();

        // Set interval untuk update statistik
        setInterval(updateStats, 30000);
        setInterval(loadRuangKerja, 60000); // refresh ruang kerja tiap 1 menit

        log('✅ Command Center ready.');
    })();

})();