alert('✅ Dream OS Booking Engine v13.3 Optimistic UI Loaded!');

(function() {
    const supabase = window.supabase;
    if (!supabase) {
        alert('❌ supabase tidak terdefinisi!');
        return;
    }

    // --- Helper Jam ---
    function parseJam(jamStr) {
        if (!jamStr) return 0;
        const [h, m] = jamStr.split(':').map(Number);
        return h + (m / 60);
    }

    // --- 🛡️ SISTEM ANTI-DOUBLE BOOKING TERBAIK ---
    async function checkConflict(sarana, tanggal, jamMulai, jamSelesai) {
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('sarana', sarana)
            .eq('tanggal_mulai', tanggal)
            .neq('status', 'rejected'); // Abaikan yang sudah ditolak

        if (error) return false;

        const mulaiInput = parseJam(jamMulai);
        const selesaiInput = parseJam(jamSelesai);

        // Cari tabrakan jam
        const conflict = data.find(b => {
            const bMulai = parseJam(b.jam_mulai);
            const bSelesai = parseJam(b.jam_selesai);
            // Logika Tabrakan: (InputMulai < ExistingSelesai) && (InputSelesai > ExistingMulai)
            return (mulaiInput < bSelesai) && (selesaiInput > bMulai);
        });

        return conflict ? true : false;
    }

    // --- 🛡️ VALIDASI ATURAN KERJA ---
    function validateRules(sarana, tgl, jamM, jamS) {
        const d = new Date(tgl);
        const hari = d.getDay(); // 0:Minggu, 6:Sabtu, 5:Jumat
        const jamMulai = parseJam(jamM);
        const jamSelesai = parseJam(jamS);

        // 1. Cek Minimal H-1 & Jam Kerja Input
        const now = new Date();
        const inputDate = new Date(tgl);
        const diffDays = Math.floor((inputDate - now.setHours(0,0,0,0)) / (1000*60*60*24));

        if (diffDays < 1) return "Minimal booking H-1!";

        // 2. Cek Jam Kerja (07:30 - 16:00)
        if (jamMulai < 7.5 || jamSelesai > 16) return "Pemesanan diluar jam kerja (07:30-16:00)";

        // 3. Masjid Maintenance
        if (sarana.includes("Masjid")) return "Masjid sedang maintenance, tidak bisa dibooking.";

        // 4. Aturan Hari
        if (hari === 6 || hari === 0) return "Sabtu/Minggu Hubungi Erwinsyah / Hanung Budianto S. E";

        // 5. Aturan Khusus Jumat (Aula & Serbaguna)
        if (hari === 5) {
            if (sarana === "Aula SMP" || sarana === "Serbaguna") {
                // Tabrakan dengan waktu Shalat Jumat (10:30 - 13:00)
                if ((jamMulai < 13 && jamSelesai > 10.5)) {
                    return "Maaf, Aula/Serbaguna dipakai Shalat Jumat (10:30-13:00)";
                }
            }
        }

        return null; // Valid
    }

    // ========== LOAD DROPDOWNS ==========
    function loadDropdowns() {
        const saranaSelect = document.getElementById('sarana');
        const alatSelect = document.getElementById('alat_tambahan');
        if (saranaSelect) {
            const saranaList = ['Aula SMP', 'Aula SMA', 'Saung Besar', 'Saung Kecil', 'Masjid', 'Serbaguna', 'Labkom SD', 'Labkom SMP', 'Labkom SMA', 'Lapangan Volley', 'Lapangan Basket', 'Lapangan SMA', 'Lapangan Tanah', 'Kantin SMP', 'Kantin SMA', 'Perpus SD', 'Perpus SMP', 'Perpus SMA', 'Mushalla SMA'];
            saranaList.forEach(v => {
                const opt = document.createElement('option');
                opt.value = v; opt.textContent = v;
                saranaSelect.appendChild(opt);
            });
        }
        // Alat tambahan (opsional) – kalau ada di form
        if (alatSelect) {
            const alatList = ['Sound Portable', 'Projector', 'Standing Mic', 'Meja Panjang', 'Meja Siswa', 'Kursi Futura', 'Kursi Chitose', 'Taplak Meja', 'TV'];
            alatList.forEach(v => {
                const opt = document.createElement('option');
                opt.value = v; opt.textContent = v;
                alatSelect.appendChild(opt);
            });
        }
    }

    // ========== LOAD RIWAYAT DENGAN SPINNER ==========
    async function loadHistory() {
        const tbody = document.getElementById('history-table-body');
        if (!tbody) return;

        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4"><span class="spinner"></span> Memuat data...</td></tr>`;

        const today = new Date().toISOString().split('T')[0];
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select('nama, sarana, jam_mulai, jam_selesai, status, id')
                .eq('tanggal_mulai', today)
                .order('jam_mulai', { ascending: true });

            if (error) throw error;

            if (!data || data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 opacity-60">Belum ada booking hari ini</td></tr>';
                return;
            }

            let html = '';
            data.forEach(item => {
                const jam = item.jam_mulai 
                    ? item.jam_mulai.slice(0,5) + (item.jam_selesai ? ' - ' + item.jam_selesai.slice(0,5) : '') 
                    : '-';
                const statusClass = item.status === 'pending' ? 'text-yellow-600' : 'text-green-600';
                html += `
                    <tr class="border-b dark:border-gray-700">
                        <td class="px-2 py-2">${item.nama}</td>
                        <td class="px-2 py-2">${item.sarana}</td>
                        <td class="px-2 py-2">${jam}</td>
                        <td class="px-2 py-2 ${statusClass}">${item.status}</td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
        } catch (err) {
            console.error('Gagal memuat riwayat:', err);
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-red-500">Gagal memuat data</td></tr>';
        }
    }

    // ========== OPTIMISTIC UI FUNCTIONS ==========
    let tempCounter = 0;

    function addOptimisticRow(formData) {
        const tbody = document.getElementById('history-table-body');
        if (!tbody) return;

        const tempId = Date.now() + (tempCounter++);
        const row = document.createElement('tr');
        row.id = `temp-${tempId}`;
        row.className = 'border-b dark:border-gray-700 opacity-75';
        row.innerHTML = `
            <td class="px-2 py-2">${formData.nama}</td>
            <td class="px-2 py-2">${formData.sarana}</td>
            <td class="px-2 py-2">${formData.jam_mulai || ''} - ${formData.jam_selesai || ''}</td>
            <td class="px-2 py-2 text-yellow-600">⏳ pending</td>
        `;
        tbody.prepend(row);
        return tempId;
    }

    function removeOptimisticRow(tempId) {
        const row = document.getElementById(`temp-${tempId}`);
        if (row) row.remove();
    }

    // ========== HANDLE SUBMIT DENGAN SPINNER ==========
    document.getElementById('bookingForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;
        submitBtn.innerHTML = '<span class="spinner mr-2"></span> Mengirim...';
        submitBtn.disabled = true;

        const resDiv = document.getElementById('form-result');
        resDiv.innerHTML = '<span class="text-blue-500">🔍 Mengecek Jadwal...</span>';

        const sarana = document.getElementById('sarana').value;
        const tgl = document.getElementById('tgl_mulai').value;
        const jamM = document.getElementById('jam_mulai').value;
        const jamS = document.getElementById('jam_selesai').value;
        const nama = document.getElementById('nama').value.trim();
        const unit_kerja = document.getElementById('unit_kerja').value.trim();
        const keperluan = document.getElementById('keperluan').value.trim();
        const no_hp = document.getElementById('no_hp').value.trim();

        if (!nama || !sarana || !keperluan || !tgl) {
            resDiv.innerHTML = '<span class="text-red-500">Nama, Sarana, Keperluan, Tanggal Mulai harus diisi!</span>';
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            return;
        }

        const ruleError = validateRules(sarana, tgl, jamM, jamS);
        if (ruleError) {
            resDiv.innerHTML = `<span class="text-red-500">🚫 ${ruleError}</span>`;
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            return;
        }

        const formDataOptimistic = { nama, sarana, jam_mulai: jamM, jam_selesai: jamS };
        const tempId = addOptimisticRow(formDataOptimistic);

        const isConflict = await checkConflict(sarana, tgl, jamM, jamS);
        if (isConflict) {
            removeOptimisticRow(tempId);
            resDiv.innerHTML = `<span class="text-red-500">🚫 Sarana sudah dibooking pada jam tersebut!</span>`;
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            return;
        }

        const formData = {
            nama,
            sarana,
            tanggal_mulai: tgl,
            jam_mulai: jamM,
            jam_selesai: jamS,
            unit_kerja: unit_kerja || null,
            keperluan: keperluan || null,
            no_hp: no_hp || null,
            status: 'pending'
        };

        const { data, error } = await supabase.from('bookings').insert([formData]).select();

        if (error) {
            removeOptimisticRow(tempId);
            resDiv.innerHTML = `<span class="text-red-500">Gagal: ${error.message}</span>`;
        } else {
            removeOptimisticRow(tempId);
            resDiv.innerHTML = `<span class="text-green-500 animate-bounce">BERHASIL! ✅ Menunggu Approval...</span>`;
            e.target.reset();
            await loadHistory();
            setTimeout(() => resDiv.innerHTML = '', 3000);
        }

        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });

    // ========== REFRESH ==========
    const refreshBtn = document.getElementById('refresh-history');
    if (refreshBtn) refreshBtn.addEventListener('click', loadHistory);

    // ========== INIT ==========
    loadDropdowns();
    loadHistory();
})();