alert('🛡️ Bismillah... S.M.A.R.T Security AI with Master Schedule');

(function() {
    const supabase = window.supabase;
    if (!supabase) return alert('Supabase tidak tersedia');

    // ========== KONSTANTA ==========
    const DEPOK_CORE = { lat: -6.4000, lng: 106.8200 };
    const SAFE_RADIUS_KM = 5.0;
    const listPetugas = ['SUDARSONO', 'MARHUSIN', 'HERIYATNO', 'SUNARKO', 'HARIYANSAHC', 'AGUS SUTISNA', 'DONIH'];

    // ========== ELEMEN DOM ==========
    const tanggalInput = document.getElementById('tanggal');
    const shiftInput = document.getElementById('shift');
    const shiftStatus = document.getElementById('ai-shift-status');
    const petugasSelect = document.getElementById('petugas');
    const geoStatus = document.getElementById('ai-geo-status');
    const personelCount = document.getElementById('ai-personnel-count');
    const anomalyStatus = document.getElementById('ai-anomaly-status');
    const form = document.getElementById('sekuritiForm');
    const fotoInput = document.getElementById('foto_sekuriti');
    const formResult = document.getElementById('form-result');

    // ========== 1. DETEKSI SHIFT OTOMATIS ==========
    function detectShift() {
        const now = new Date();
        const jam = now.getHours();
        const shiftCode = (jam >= 7 && jam < 19) ? 'P' : 'M';
        const shiftLabel = shiftCode === 'P' ? 'PAGI (07:00-19:00)' : 'MALAM (19:00-07:00)';
        if (tanggalInput) tanggalInput.value = now.toISOString().split('T')[0];
        if (shiftInput) shiftInput.value = shiftLabel;
        if (shiftStatus) shiftStatus.innerText = shiftCode === 'P' ? '☀️ PAGI' : '🌙 MALAM';
        return shiftCode;
    }

    // ========== 2. LOAD JADWAL MASTER DARI DATABASE ==========
    async function loadMasterSchedule(bulan = null, tahun = 2026) {
        if (!bulan) {
            const now = new Date();
            bulan = now.getMonth() + 1;
        }
        const { data, error } = await supabase
            .from('sekuriti_jadwal_master')
            .select('*')
            .eq('bulan', bulan)
            .eq('tahun', tahun);
        if (error) {
            console.error('Gagal load master schedule', error);
            return [];
        }
        return data || [];
    }

    // ========== 3. RENDER DROPDOWN PETUGAS BERDASARKAN JADWAL ==========
    async function renderPetugasDropdown() {
        const now = new Date();
        const tgl = now.getDate();
        const bulan = now.getMonth() + 1;
        const tahun = now.getFullYear();
        const shiftCode = detectShift(); // P atau M

        const jadwal = await loadMasterSchedule(bulan, tahun);
        if (!jadwal.length) {
            petugasSelect.innerHTML = '<option value="">-- MASTER JADWAL BELUM ADA --</option>';
            return;
        }

        let onDuty = [];
        let options = '<option value="">-- PILIH PETUGAS --</option>';
        jadwal.forEach(item => {
            const statusHariIni = item.jadwal_array[tgl - 1] || 'L';
            const nama = item.petugas_name;
            let label = `${nama} [${statusHariIni}]`;
            let isOnDuty = (statusHariIni === shiftCode);
            if (isOnDuty) {
                label += ' ⭐ BERTUGAS';
                onDuty.push(nama);
            }
            options += `<option value="${nama}" data-status="${statusHariIni}">${label}</option>`;
        });
        petugasSelect.innerHTML = options;
        if (personelCount) personelCount.innerText = `${onDuty.length} PERSONEL JAGA (${shiftCode})`;
    }

    // ========== 4. DETEKSI ANOMALI SAAT PILIH PETUGAS ==========
    petugasSelect.addEventListener('change', function() {
        const selected = this.options[this.selectedIndex];
        const status = selected?.dataset?.status;
        if (anomalyStatus) {
            if (status === 'CT' || status === 'L') {
                anomalyStatus.innerHTML = `<span class="text-red-500 animate-pulse">⚠️ ${status === 'CT' ? 'CUTI' : 'LIBUR'} MELAPOR!</span>`;
            } else {
                anomalyStatus.innerHTML = `<span class="text-emerald-400">CLEAR</span>`;
            }
        }
    });

    // ========== 5. CEK GPS DAN RADIUS ==========
    function checkSafeCore(lat, lng) {
        const R = 6371;
        const dLat = (lat - DEPOK_CORE.lat) * Math.PI / 180;
        const dLng = (lng - DEPOK_CORE.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(DEPOK_CORE.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;

        if (distance <= SAFE_RADIUS_KM) {
            geoStatus.innerHTML = `<span class="text-emerald-400"><i class="fas fa-shield-alt"></i> AMAN (${distance.toFixed(1)}km)</span>`;
            return true;
        } else {
            geoStatus.innerHTML = `<span class="text-red-500 animate-pulse">⚠️ OUT OF CORE (${distance.toFixed(1)}km)</span>`;
            return false;
        }
    }

    function getGeolocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) reject('GPS tidak didukung');
            navigator.geolocation.getCurrentPosition(
                pos => resolve(pos.coords),
                err => reject('Izin GPS ditolak'),
                { enableHighAccuracy: true, timeout: 10000 }
            );
        });
    }

    // ========== 6. SUBMIT LAPORAN ==========
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-2"></i> Memproses...';

        try {
            // Validasi foto
            if (fotoInput.files.length === 0) {
                throw new Error('Foto geotagging wajib diambil!');
            }

            formResult.innerHTML = '<span class="text-yellow-400">Mengunci GPS...</span>';
            const coords = await getGeolocation();
            const isSafe = checkSafeCore(coords.latitude, coords.longitude);
            if (!isSafe) {
                // Boleh tetap lapor? Bisa kasih peringatan tapi tetap lanjut
                if (!confirm('Anda berada di luar safe core. Tetap kirim laporan?')) {
                    throw new Error('Laporan dibatalkan');
                }
            }

            const namaPetugas = petugasSelect.value;
            if (!namaPetugas) throw new Error('Pilih petugas jaga!');

            // Upload foto ke storage (jika ingin benar-benar upload, aktifkan)
            // const file = fotoInput.files[0];
            // const fileName = `sekuriti/${Date.now()}_${coords.latitude}_${coords.longitude}.jpg`;
            // const { error: uploadError } = await supabase.storage.from('k3-foto').upload(fileName, file);
            // if (uploadError) throw uploadError;
            // const { data: urlData } = supabase.storage.from('k3-foto').getPublicUrl(fileName);
            // const fotoUrl = urlData.publicUrl;

            const report = {
                tanggal: tanggalInput.value,
                shift: shiftInput.value,
                petugas: [namaPetugas],
                deskripsi: document.getElementById('deskripsi').value,
                koordinat: `${coords.latitude}, ${coords.longitude}`,
                // foto_url: [fotoUrl],
                status: 'verified'
            };

            const { error } = await supabase.from('sekuriti_reports').insert([report]);
            if (error) throw error;

            formResult.innerHTML = '<span class="text-emerald-400 font-bold"><i class="fas fa-check-circle"></i> Laporan tersimpan!</span>';
            e.target.reset();
            loadHistory(); // refresh riwayat
        } catch (err) {
            formResult.innerHTML = `<span class="text-red-500"><i class="fas fa-times-circle"></i> ${err.message}</span>`;
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    });

    // ========== 7. LOAD HISTORY LAPORAN ==========
    async function loadHistory() {
        const container = document.getElementById('history-container');
        if (!container) return;
        container.innerHTML = '<div class="text-center py-10 opacity-50"><div class="spinner border-emerald-500 mb-2"></div><p class="text-xs font-mono">Memuat riwayat...</p></div>';

        try {
            const { data, error } = await supabase
                .from('sekuriti_reports')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);
            if (error) throw error;
            if (!data?.length) {
                container.innerHTML = '<p class="text-center py-10 text-slate-500 font-mono text-sm">Belum ada laporan.</p>';
                return;
            }

            let html = '';
            data.forEach(r => {
                html += `
                    <div class="bg-slate-800/50 p-4 rounded-xl mb-3 border-l-4 border-emerald-500 font-mono text-xs">
                        <div class="flex justify-between">
                            <span class="text-emerald-400">${r.tanggal} ${r.shift}</span>
                            <span class="text-slate-500">${new Date(r.created_at).toLocaleTimeString('id-ID')}</span>
                        </div>
                        <div class="mt-1 text-white">👤 ${r.petugas.join(', ')}</div>
                        <div class="text-slate-300">${r.deskripsi || '-'}</div>
                        ${r.koordinat ? `<div class="text-[9px] text-slate-500 mt-1"><i class="fas fa-map-marker-alt mr-1"></i>${r.koordinat}</div>` : ''}
                    </div>
                `;
            });
            container.innerHTML = html;
        } catch (err) {
            container.innerHTML = `<p class="text-center py-10 text-red-500 font-mono text-sm">Error: ${err.message}</p>`;
        }
    }

    // ========== 8. EDITOR JADWAL MASTER ==========
    function initJadwalEditor() {
        const header = document.getElementById('header-tanggal');
        const body = document.getElementById('body-input-jadwal');
        if (!header || !body) return;

        // Tentukan jumlah hari dalam bulan (Februari = 28)
        const jmlHari = 28; // Bisa dibuat dinamis berdasarkan bulan

        // Generate header tanggal
        for (let i = 1; i <= jmlHari; i++) {
            header.innerHTML += `<th class="p-1 border border-slate-700 text-center w-8">${i}</th>`;
        }

        // Generate baris per petugas
        listPetugas.forEach(nama => {
            let row = `<tr class="border-b border-slate-800"><td class="p-2 bg-slate-900/50 font-bold text-white sticky left-0">${nama}</td>`;
            for (let i = 1; i <= jmlHari; i++) {
                row += `<td class="p-0 border border-slate-800">
                    <input type="text" data-nama="${nama}" data-tgl="${i}" 
                    class="w-8 h-8 bg-transparent text-center text-white focus:bg-emerald-500/20 outline-none uppercase" 
                    placeholder="L" maxlength="2">
                </td>`;
            }
            row += `</tr>`;
            body.innerHTML += row;
        });
    }

    document.getElementById('save-master-jadwal')?.addEventListener('click', async () => {
        const btn = document.getElementById('save-master-jadwal');
        btn.innerHTML = 'MENYIMPAN...';
        const bulan = document.getElementById('select-bulan').value;
        const tahun = 2026;

        try {
            for (let nama of listPetugas) {
                const inputs = document.querySelectorAll(`input[data-nama="${nama}"]`);
                const arrayJadwal = Array.from(inputs).map(inp => inp.value.toUpperCase() || 'L');
                const { error } = await supabase
                    .from('sekuriti_jadwal_master')
                    .upsert({
                        petugas_name: nama,
                        bulan: parseInt(bulan),
                        tahun: tahun,
                        jadwal_array: arrayJadwal
                    }, { onConflict: 'petugas_name, bulan, tahun' });
                if (error) throw error;
            }
            alert('✅ Jadwal master berhasil disimpan!');
        } catch (err) {
            alert('❌ Gagal: ' + err.message);
        } finally {
            btn.innerHTML = '<i class="fas fa-save mr-2"></i> SIMPAN JADWAL MASTER';
        }
    });

    // ========== 9. RENDER MATRIKS JADWAL (HARI INI, BESOK, LUSA) ==========
    async function renderJadwalMatriks() {
        const tbody = document.getElementById('jadwal-view-body');
        if (!tbody) return;
        const now = new Date();
        const tgl = now.getDate();
        const bulan = now.getMonth() + 1;
        const tahun = now.getFullYear();
        const jadwal = await loadMasterSchedule(bulan, tahun);
        if (!jadwal.length) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-slate-500">Master jadwal belum ada</td></tr>';
            return;
        }

        let html = '';
        jadwal.forEach(item => {
            const sTgl = item.jadwal_array[tgl - 1] || '-';
            const sBesok = item.jadwal_array[tgl] || '-';
            const sLusa = item.jadwal_array[tgl + 1] || '-';
            html += `<tr class="border-b border-slate-700/50">
                <td class="px-4 py-3 font-semibold">${item.petugas_name}</td>
                <td class="px-4 py-3 text-center border-l border-slate-700 ${sTgl === 'P' ? 'text-orange-400' : sTgl === 'M' ? 'text-blue-400' : ''}">${sTgl}</td>
                <td class="px-4 py-3 text-center border-l border-slate-700">${sBesok}</td>
                <td class="px-4 py-3 text-center border-l border-slate-700">${sLusa}</td>
            </tr>`;
        });
        tbody.innerHTML = html;
    }

    // ========== 10. TAB NAVIGASI ==========
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(b => {
                b.classList.remove('bg-emerald-500', 'text-white', 'shadow-[0_0_15px_rgba(16,185,129,0.5)]');
                b.classList.add('text-slate-400');
            });
            this.classList.remove('text-slate-400');
            this.classList.add('bg-emerald-500', 'text-white', 'shadow-[0_0_15px_rgba(16,185,129,0.5)]');

            document.querySelectorAll('.tab-content').forEach(tc => tc.classList.add('hidden'));
            const target = document.getElementById(`tab-${this.dataset.tab}`);
            if (target) target.classList.remove('hidden');

            // Panggil fungsi spesifik sesuai tab
            if (this.dataset.tab === 'laporan') {
                renderPetugasDropdown();
                loadHistory();
            } else if (this.dataset.tab === 'jadwal') {
                renderJadwalMatriks();
            }
        });
    });

    // ========== 11. INIT ==========
    (async function init() {
        detectShift();
        await renderPetugasDropdown();
        loadHistory();
        renderJadwalMatriks();
        initJadwalEditor();

        // Cek GPS awal
        try {
            const coords = await getGeolocation();
            checkSafeCore(coords.latitude, coords.longitude);
        } catch (err) {
            if (geoStatus) geoStatus.innerHTML = `<span class="text-red-500">GPS tidak aktif</span>`;
        }
    })();

})();