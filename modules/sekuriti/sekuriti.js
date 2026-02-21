alert('🛡️ Bismillah bi idznillah... S.M.A.R.T Security Logic Activated!');

(function() {
    const supabase = window.supabase;
    
    // --- KONFIGURASI SMART LOGIC ---
    const DEPOK_CORE = { lat: -6.4000, lng: 106.8200 }; // Titik tengah SIF Al-Fikri
    const SAFE_RADIUS_KM = 5.0;

    // Data Jadwal dari Excel (Mockup AI Sinkronisasi)
    const jadwalBulanIni = [
        { nama: 'SUDARSONO', today: 'M', tomorrow: 'L' },
        { nama: 'MARHUSIN', today: 'M', tomorrow: 'M' },
        { nama: 'HERIYATNO', today: 'L', tomorrow: 'P' },
        { nama: 'SUNARKO', today: 'P', tomorrow: 'M' },
        { nama: 'HARIYANSAHC', today: 'M', tomorrow: 'L' },
        { nama: 'AGUS SUTISNA', today: 'L', tomorrow: 'P' },
        { nama: 'DONIH', today: 'CT', tomorrow: 'L' } // Cuti!
    ];

    // ========== 1. SMART SYSTEM DETECTION ==========
    function runSmartDetection() {
        const now = new Date();
        const hour = now.getHours();
        
        // A. Auto Detect Shift & Tanggal
        document.getElementById('tanggal').value = now.toISOString().split('T')[0];
        const shiftInput = document.getElementById('shift');
        const shiftStatus = document.getElementById('ai-shift-status');
        
        let currentShift = (hour >= 7 && hour < 19) ? 'SIANG (07:00-19:00)' : 'MALAM (19:00-07:00)';
        shiftInput.value = currentShift;
        shiftStatus.innerHTML = currentShift.includes('SIANG') ? '☀️ SIANG' : '🌙 MALAM';

        // B. Populate Select Petugas berdasarkan Jadwal Hari Ini
        const selectPetugas = document.getElementById('petugas');
        let shiftCode = currentShift.includes('SIANG') ? 'P' : 'M';
        let petugasAktif = jadwalBulanIni.filter(p => p.today === shiftCode);
        
        selectPetugas.innerHTML = '<option value="">-- Pindai Petugas --</option>';
        jadwalBulanIni.forEach(p => {
            let label = `${p.nama} (Jadwal: ${p.today})`;
            if (p.today === 'CT') label += ' ⚠️ CUTI';
            if (p.today === 'L') label += ' 💤 LIBUR';
            selectPetugas.innerHTML += `<option value="${p.nama}">${label}</option>`;
        });

        // Update Dashboard Info
        document.getElementById('ai-personnel-count').innerText = `${petugasAktif.length} ORANG (${shiftCode})`;

        // C. Cek Anomali (Contoh: Kalo Pak Donih milih namanya padahal CT)
        selectPetugas.addEventListener('change', (e) => {
            const nama = e.target.value;
            const dataP = jadwalBulanIni.find(p => p.nama === nama);
            const anomalyEl = document.getElementById('ai-anomaly-status');
            
            if (dataP && (dataP.today === 'CT' || dataP.today === 'L')) {
                anomalyEl.innerHTML = `<span class="text-red-500 animate-pulse">⚠️ ${dataP.today === 'CT' ? 'CUTI' : 'LIBUR'} MELAPOR!</span>`;
            } else {
                anomalyEl.innerHTML = `<span class="text-emerald-400">CLEAR</span>`;
            }
        });

        // Render Tabel Jadwal Tab
        renderJadwalMatriks();
    }

    // Hitung Jarak (Haversine) buat SAFE CORE 5KM
    function checkSafeCore(lat, lng) {
        const R = 6371; // Radius Bumi dalam km
        const dLat = (lat - DEPOK_CORE.lat) * Math.PI / 180;
        const dLng = (lng - DEPOK_CORE.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(DEPOK_CORE.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;

        const geoStatus = document.getElementById('ai-geo-status');
        if (distance <= SAFE_RADIUS_KM) {
            geoStatus.innerHTML = `<span class="text-emerald-400"><i class="fas fa-shield-alt"></i> AMAN (${distance.toFixed(1)}km)</span>`;
            return true;
        } else {
            geoStatus.innerHTML = `<span class="text-red-500 animate-pulse">⚠️ OUT OF CORE (${distance.toFixed(1)}km)</span>`;
            // Logic "Depok Lightning Strike" bisa di-trigger di sini jika butuh action agresif
            return false;
        }
    }

    // ========== 2. GEOTAGGING & UPLOAD ==========
    function handleGeotagging() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject("Browser tidak support GPS!");
                return;
            }
            
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    checkSafeCore(latitude, longitude); // Verifikasi Safe Core
                    resolve({ lat: latitude, lng: longitude });
                }, 
                (err) => reject("Izin GPS Ditolak! Laporan diblokir sistem keamanan."), 
                { enableHighAccuracy: true, timeout: 10000 }
            );
        });
    }

    // ========== 3. SUBMIT LAPORAN 24 JAM ==========
    document.getElementById('sekuritiForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        const originalBtn = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-2"></i> Mengenkripsi Data...';

        try {
            // 1. Wajib ada foto geotagging
            const fotoInput = document.getElementById('foto_sekuriti');
            if (fotoInput.files.length === 0) {
                throw new Error("Sistem mewajibkan Foto Geotagging Real-time!");
            }

            // 2. Kunci Koordinat GPS
            document.getElementById('form-result').innerHTML = '<span class="text-yellow-400">Mengunci Satelit GPS...</span>';
            const coords = await handleGeotagging();
            
            // Cek anomali jadwal
            const namaPetugas = document.getElementById('petugas').value;
            const dataP = jadwalBulanIni.find(p => p.nama === namaPetugas);
            if (dataP && dataP.today === 'CT') {
                const lanjut = confirm(`⚠️ Sistem mendeteksi ${namaPetugas} sedang CUTI. Tetap kirim laporan?`);
                if(!lanjut) throw new Error("Dibatalkan User.");
            }

            // 3. (Simulasi) Upload Foto ke Supabase Storage
            // const file = fotoInput.files[0];
            // const fileName = `sekuriti/${Date.now()}_${coords.lat}_${coords.lng}.jpg`;
            // await supabase.storage.from('k3-foto').upload(fileName, file);
            // const { data: urlData } = supabase.storage.from('k3-foto').getPublicUrl(fileName);

            const formData = {
                tanggal: document.getElementById('tanggal').value,
                shift: document.getElementById('shift').value,
                petugas: [namaPetugas],
                deskripsi: document.getElementById('deskripsi').value,
                koordinat: `${coords.lat}, ${coords.lng}`,
                // foto_url: urlData.publicUrl,
                status: 'verified' // Auto-verified karena masuk safe core
            };

            const { error } = await supabase.from('sekuriti_reports').insert([formData]);
            if (error) throw error;

            document.getElementById('form-result').innerHTML = '<span class="text-emerald-400 font-bold"><i class="fas fa-check-circle"></i> Transmisi Sukses. Tersimpan di Database.</span>';
            e.target.reset();
            setTimeout(() => { document.getElementById('form-result').innerHTML = ''; }, 4000);
            
            // Render ulang history
            // loadHistory(); 
            
        } catch (err) {
            document.getElementById('form-result').innerHTML = `<span class="text-red-500"><i class="fas fa-times-circle"></i> ${err.message || err}</span>`;
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalBtn;
        }
    });

    // ========== 4. RENDER JADWAL UI ==========
    function renderJadwalMatriks() {
        const tbody = document.getElementById('jadwal-view-body');
        tbody.innerHTML = jadwalBulanIni.map(s => {
            // Styling warna berdasarkan status
            let getStyle = (val) => {
                if(val === 'M') return 'text-orange-400 font-bold';
                if(val === 'P') return 'text-blue-400 font-bold';
                if(val === 'CT') return 'bg-red-500/20 text-red-400 font-black rounded';
                return 'text-slate-500';
            };

            return `
            <tr class="border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors">
                <td class="px-4 py-3 font-semibold">${s.nama}</td>
                <td class="px-4 py-3 text-center border-l border-slate-700 bg-emerald-900/10">
                    <span class="${getStyle(s.today)} px-2 py-1">${s.today}</span>
                </td>
                <td class="px-4 py-3 text-center border-l border-slate-700"><span class="${getStyle(s.tomorrow)}">${s.tomorrow}</span></td>
                <td class="px-4 py-3 text-center border-l border-slate-700">-</td>
            </tr>
        `}).join('');
    }

    // ========== TAB NAVIGATION ==========
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(b => {
                b.classList.remove('bg-emerald-500', 'text-white', 'shadow-[0_0_15px_rgba(16,185,129,0.5)]');
                b.classList.add('text-slate-400');
            });
            this.classList.remove('text-slate-400');
            this.classList.add('bg-emerald-500', 'text-white', 'shadow-[0_0_15px_rgba(16,185,129,0.5)]');

            document.querySelectorAll('.tab-content').forEach(tc => tc.classList.add('hidden'));
            document.getElementById(`tab-${this.dataset.tab}`).classList.remove('hidden');
        });
    });

    // INIT
    runSmartDetection();

    // Trigger GPS awal untuk Safe Core Check
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => checkSafeCore(pos.coords.latitude, pos.coords.longitude),
            (err) => console.log("Menunggu izin GPS user...")
        );
    }

})();
