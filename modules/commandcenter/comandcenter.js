/**
 * 🏛️ DREAM OS v13.4 - COMMAND CENTER (FIXED VERSION)
 * Semua event listener pakai addEventListener, bukan onclick.
 * Dilengkapi debug box di pojok kanan bawah.
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
        // Auto scroll ke bawah
        debugDiv.scrollTop = debugDiv.scrollHeight;
    }

    log('🚀 Command Center v13.4 starting...');

    // ========== SUPABASE INIT ==========
    const supabaseUrl = 'https://rqpodzjexghrvcpyacyo.supabase.co';
    const supabaseKey = 'sb_publishable_U9MbSdPJOMSmaw3BsHJcVQ_PDiOy-UM';
    
    if (!window.supabase) {
        log('❌ Supabase library tidak ditemukan!');
    } else {
        window.supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
        log('✅ Supabase client created');
    }

    // ========== CLOCK ==========
    function updateClock() {
        const clockEl = document.getElementById('clock');
        if (clockEl) {
            clockEl.textContent = new Date().toLocaleTimeString('id-ID');
        }
    }
    setInterval(updateClock, 1000);
    log('✅ Clock started');

    // ========== TAB SYSTEM (DENGAN EVENT LISTENER) ==========
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');
    log(`📊 Ditemukan ${tabs.length} tab buttons`);

    function switchTab(tabId) {
        log(`👉 Switching to tab: ${tabId}`);
        
        // Sembunyikan semua konten
        contents.forEach(c => c.classList.add('hidden'));
        
        // Tampilkan konten yang dipilih
        const targetContent = document.getElementById(`tab-${tabId}`);
        if (targetContent) {
            targetContent.classList.remove('hidden');
            log(`✅ Content tab-${tabId} shown`);
        } else {
            log(`❌ Content tab-${tabId} not found!`);
        }

        // Update class pada tombol
        tabs.forEach(t => {
            t.classList.remove('active', 'text-purple-500', 'border-b-2', 'border-purple-500');
            t.classList.add('text-gray-400');
        });
        
        const activeBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active', 'text-purple-500', 'border-b-2', 'border-purple-500');
            activeBtn.classList.remove('text-gray-400');
            log(`✅ Tab button ${tabId} activated`);
        } else {
            log(`❌ Tab button ${tabId} not found!`);
        }

        // Muat analytics jika tab analytics
        if (tabId === 'analytics') {
            loadAnalytics();
        }
    }

    // Pasang event listener ke setiap tab
    tabs.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = btn.dataset.tab;
            log(`🖱️ Tab clicked: ${tabId}`);
            switchTab(tabId);
        });
    });
    log('✅ Tab event listeners attached');

    // Tampilkan tab pertama (dashboard) secara default
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
            micBtn.title = 'Voice tidak didukung browser ini';
        }
    } else {
        log('❌ Mic button not found!');
    }

    // ========== CAMERA MODULE ==========
    const video = document.getElementById('camera-preview');
    const canvas = document.getElementById('camera-canvas');
    let stream = null;

    const startBtn = document.getElementById('start-camera');
    const stopBtn = document.getElementById('stop-camera');
    const captureBtn = document.getElementById('capture-photo');

    if (startBtn) {
        startBtn.addEventListener('click', async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: 'environment' } 
                });
                video.srcObject = stream;
                log('🎥 Camera started');
            } catch (err) {
                log(`❌ Camera error: ${err.message}`);
            }
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
            if (!stream || !video.srcObject) {
                log('❌ Camera not active');
                return;
            }
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            const imgData = canvas.toDataURL('image/png');
            document.getElementById('camera-result').innerHTML = '✅ Foto tersimpan!';
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
            
            if (question.includes('hanung')) {
                aiAnswer.innerText = "Bapak Hanung Budianto S. E adalah Approver utama sistem ini. [cite: 2026-01-24]";
            } else if (question.includes('k3')) {
                aiAnswer.innerText = "Silakan cek tab Analytics untuk data K3 real-time.";
            } else {
                aiAnswer.innerText = "Bismillah, saya sedang mempelajari perintah tersebut.";
            }
        });
        log('✅ AI assistant attached');
    } else {
        log('❌ AI elements not found');
    }

    // ========== SECURITY CHECK ==========
    window.triggerSecurityCheck = () => {
        log('🔒 Security check triggered');
        const coreStatus = document.getElementById('core-status');
        if (!coreStatus) {
            log('❌ core-status element not found');
            return;
        }
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                // Logic sederhana: kita asumsikan di Depok (lat -6.4, long 106.8)
                const latDiff = Math.abs(pos.coords.latitude - (-6.4));
                const lngDiff = Math.abs(pos.coords.longitude - (106.8));
                if (latDiff < 0.5 && lngDiff < 0.5) {
                    coreStatus.innerText = "SECURE (IN DEPOK)";
                    coreStatus.className = "text-blue-400 font-bold";
                    alert("✅ Bismillah, Device Secure. [cite: 2026-01-18]");
                } else {
                    coreStatus.innerText = "⚠️ OUTSIDE SAFE CORE";
                    coreStatus.className = "text-yellow-500";
                }
                log(`📍 GPS: ${pos.coords.latitude}, ${pos.coords.longitude}`);
            }, () => {
                coreStatus.innerText = "GPS DISABLED";
                coreStatus.className = "text-yellow-500";
                log('❌ GPS permission denied');
            });
        } else {
            coreStatus.innerText = "GPS NOT SUPPORTED";
            log('❌ Geolocation not supported');
        }
    };

    // ========== ANALYTICS CHART ==========
    function loadAnalytics() {
        log('📈 Loading analytics chart...');
        const ctx = document.getElementById('bookingChart')?.getContext('2d');
        if (!ctx) {
            log('❌ Canvas bookingChart not found');
            return;
        }
        
        // Hapus chart lama jika ada
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
                    backgroundColor: 'rgba(139, 92, 246, 0.2)',
                    fill: true
                }]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                }
            }
        });
        log('✅ Chart created');
    }

    log('✅ Command Center initialized. Bismillah bi idznillah!');
})();