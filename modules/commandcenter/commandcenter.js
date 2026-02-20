/**
 * 🏛️ DREAM OS v13.4 - COMMAND CENTER (FIXED VERSION)
 * Semua event listener pakai addEventListener.
 * Menggunakan window.supabase dari root (tidak bikin client baru).
 */

(function() {
    // ========== DEBUG TOOL (Tampil di layar) ==========
    const debugDiv = document.createElement('div');
    debugDiv.id = 'debug-console';
    debugDiv.style.cssText = 'position:fixed; bottom:10px; right:10px; background:#111; color:#0f0; padding:8px; border-radius:8px; font-size:10px; font-family:monospace; z-index:9999; max-width:300px; max-height:200px; overflow:auto; border:1px solid #0f0;';
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
        if (tabId === 'analytics') loadAnalytics();
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

    // ========== VOICE COMMAND (sama) ==========
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

    // ========== LOAD APPROVALS ==========
    async function loadApprovals() {
        try {
            const { data: bookings } = await supabase
                .from('bookings')
                .select('*')
                .eq('status', 'pending')
                .limit(5);
            const bookingDiv = document.getElementById('approval-booking');
            if (bookingDiv) {
                if (bookings && bookings.length) {
                    bookingDiv.innerHTML = bookings.map(b => `
                        <div class="flex justify-between items-center bg-slate-700 p-3 rounded-xl">
                            <span class="text-xs">${b.nama} - ${b.sarana}</span>
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
        } catch (err) { log(`❌ Error load approvals: ${err.message}`); }
    }

    window.updateStatus = async (table, id, status) => {
        try {
            await supabase.from(table).update({ status }).eq('id', id);
            log(`✅ ${table} ${id} updated to ${status}`);
            loadApprovals();
        } catch (err) { log(`❌ Error update: ${err.message}`); }
    };
    loadApprovals();

    // ========== GLOBAL SEARCH HUB ==========
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

            // 1. Bookings
            const { data: bookings } = await supabase
                .from('bookings')
                .select('id, nama, sarana, tanggal_mulai, status')
                .or(`nama.ilike.%${query}%,sarana.ilike.%${query}%,keperluan.ilike.%${query}%`)
                .limit(3);
            if (bookings?.length) results.push({ type: '📅 Booking', icon: '📅', items: bookings });

            // 2. Assets
            const { data: assets } = await supabase
                .from('assets')
                .select('id, nama_asset, kategori, lokasi, kondisi')
                .or(`nama_asset.ilike.%${query}%,kategori.ilike.%${query}%,lokasi.ilike.%${query}%`)
                .limit(3);
            if (assets?.length) results.push({ type: '🏢 Asset', icon: '🏢', items: assets });

            // 3. K3
            const { data: k3s } = await supabase
                .from('k3_reports')
                .select('id, tanggal, lokasi, jenis_laporan, pelapor')
                .or(`lokasi.ilike.%${query}%,jenis_laporan.ilike.%${query}%,pelapor.ilike.%${query}%,deskripsi.ilike.%${query}%`)
                .limit(3);
            if (k3s?.length) results.push({ type: '⚠️ K3', icon: '⚠️', items: k3s });

            // 4. Maintenance
            const { data: maintenance } = await supabase
                .from('maintenance_requests')
                .select('id, lokasi, deskripsi, prioritas, status')
                .or(`lokasi.ilike.%${query}%,deskripsi.ilike.%${query}%`)
                .limit(3);
            if (maintenance?.length) results.push({ type: '🔧 Maintenance', icon: '🔧', items: maintenance });

            // 5. Stok
            const { data: stok } = await supabase
                .from('stok')
                .select('id, nama_barang, kategori, jumlah, lokasi')
                .or(`nama_barang.ilike.%${query}%,kategori.ilike.%${query}%`)
                .limit(3);
            if (stok?.length) results.push({ type: '📦 Stok', icon: '📦', items: stok });

            // 6. SPJ
            const { data: spj } = await supabase
                .from('spj')
                .select('id, judul, nominal, status')
                .ilike('judul', `%${query}%`)
                .limit(3);
            if (spj?.length) results.push({ type: '📄 SPJ', icon: '📄', items: spj });

            if (results.length === 0) {
                searchResults.innerHTML = '<div class="p-4 text-center text-slate-400">Tidak ada hasil</div>';
                return;
            }

            let html = '';
            results.forEach(group => {
                html += `<div class="p-2 border-b border-slate-700 last:border-0">`;
                html += `<div class="text-xs font-bold text-purple-400 mb-1">${group.icon} ${group.type}</div>`;
                group.items.forEach(item => {
                    // navigasi placeholder
                    html += `<div class="p-2 hover:bg-slate-800 rounded cursor-pointer" onclick="window.goToItem('${group.type}', '${item.id}')">`;
                    if (group.type.includes('Booking')) {
                        html += `<div class="text-sm">${item.nama} - ${item.sarana}</div>`;
                        html += `<div class="text-[10px] text-slate-400">${item.tanggal_mulai} | ${item.status}</div>`;
                    } else if (group.type.includes('Asset')) {
                        html += `<div class="text-sm">${item.nama_asset}</div>`;
                        html += `<div class="text-[10px] text-slate-400">${item.kategori} | ${item.lokasi} | ${item.kondisi}</div>`;
                    } else if (group.type.includes('K3')) {
                        html += `<div class="text-sm">${item.lokasi} - ${item.jenis_laporan}</div>`;
                        html += `<div class="text-[10px] text-slate-400">${item.tanggal} | ${item.pelapor}</div>`;
                    } else if (group.type.includes('Maintenance')) {
                        html += `<div class="text-sm">${item.lokasi}</div>`;
                        html += `<div class="text-[10px] text-slate-400">${item.deskripsi.substring(0,50)}... | ${item.prioritas}</div>`;
                    } else if (group.type.includes('Stok')) {
                        html += `<div class="text-sm">${item.nama_barang}</div>`;
                        html += `<div class="text-[10px] text-slate-400">${item.kategori} | Stok: ${item.jumlah} | ${item.lokasi}</div>`;
                    } else if (group.type.includes('SPJ')) {
                        html += `<div class="text-sm">${item.judul}</div>`;
                        html += `<div class="text-[10px] text-slate-400">Rp ${Number(item.nominal).toLocaleString()} | ${item.status}</div>`;
                    }
                    html += `</div>`;
                });
                html += `</div>`;
            });
            searchResults.innerHTML = html;

        } catch (err) {
            log(`❌ Search error: ${err.message}`);
            searchResults.innerHTML = '<div class="p-3 text-red-400">Error saat mencari</div>';
        }
    }

    // Navigasi sementara
    window.goToItem = (type, id) => {
        alert(`🔍 ${type} ID: ${id}`);
    };

    log('✅ Command Center ready.');
})();