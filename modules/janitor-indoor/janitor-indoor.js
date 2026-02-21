alert('✅ janitor-indoor.js dimuat (versi lengkap)');

(function() {
    const supabase = window.supabase;
    if (!supabase) {
        alert('Supabase tidak terdefinisi');
        return;
    }

    // Elemen tab
    const tabForm = document.getElementById('tab-form');
    const tabHistory = document.getElementById('tab-history');
    const tabSchedule = document.getElementById('tab-schedule');
    const panelForm = document.getElementById('panel-form');
    const panelHistory = document.getElementById('panel-history');
    const panelSchedule = document.getElementById('panel-schedule');

    function activateTab(active) {
        [tabForm, tabHistory, tabSchedule].forEach(t => t.classList.remove('active', 'border-teal-500', 'text-teal-600'));
        tabForm.classList.add('text-gray-500');
        tabHistory.classList.add('text-gray-500');
        tabSchedule.classList.add('text-gray-500');
        panelForm.classList.add('hidden');
        panelHistory.classList.add('hidden');
        panelSchedule.classList.add('hidden');

        if (active === 'form') {
            tabForm.classList.add('active', 'border-teal-500', 'text-teal-600');
            panelForm.classList.remove('hidden');
        } else if (active === 'history') {
            tabHistory.classList.add('active', 'border-teal-500', 'text-teal-600');
            panelHistory.classList.remove('hidden');
            loadHistory();
        } else if (active === 'schedule') {
            tabSchedule.classList.add('active', 'border-teal-500', 'text-teal-600');
            panelSchedule.classList.remove('hidden');
            loadSchedule();
        }
    }

    tabForm.addEventListener('click', () => activateTab('form'));
    tabHistory.addEventListener('click', () => activateTab('history'));
    tabSchedule.addEventListener('click', () => activateTab('schedule'));

    // ========== LOAD RIWAYAT ==========
    async function loadHistory() {
        const tbody = document.getElementById('history-body');
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4">⏳ Memuat...</td></tr>';

        try {
            const { data, error } = await supabase
                .from('janitor_indoor')
                .select('id, tanggal, shift, petugas, lokasi, status, created_at')
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;

            if (!data || data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 opacity-60">Belum ada data</td></tr>';
                return;
            }

            let html = '';
            data.forEach(item => {
                const statusClass = item.status === 'pending' ? 'text-yellow-600' : (item.status === 'verified' ? 'text-green-600' : 'text-blue-600');
                html += `
                    <tr class="border-b dark:border-gray-700">
                        <td class="px-2 py-2">${item.tanggal}</td>
                        <td class="px-2 py-2">${item.shift || '-'}</td>
                        <td class="px-2 py-2">${item.petugas}</td>
                        <td class="px-2 py-2">${item.lokasi}</td>
                        <td class="px-2 py-2 ${statusClass}">${item.status}</td>
                        <td class="px-2 py-2">
                            <button onclick="viewDetail('${item.id}')" class="text-blue-500 text-xs">Detail</button>
                        </td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
        } catch (err) {
            console.error('Gagal load history:', err);
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-red-500">Gagal memuat</td></tr>';
        }
    }

    window.viewDetail = (id) => {
        alert('Fitur detail menyusul. ID: ' + id);
    };

    // ========== LOAD JADWAL (Sementara statis) ==========
    function loadSchedule() {
        const tbody = document.getElementById('schedule-body');
        // Contoh jadwal statis (bisa diambil dari tabel jadwal nanti)
        tbody.innerHTML = `
            <tr><td>Senin</td><td>Budi</td><td>Ani</td><td>Cici</td></tr>
            <tr><td>Selasa</td><td>Budi</td><td>Ani</td><td>Cici</td></tr>
            <tr><td>Rabu</td><td>Budi</td><td>Ani</td><td>Cici</td></tr>
            <tr><td>Kamis</td><td>Budi</td><td>Ani</td><td>Cici</td></tr>
            <tr><td>Jumat</td><td>Budi</td><td>Ani</td><td>Cici</td></tr>
            <tr><td>Sabtu</td><td>Budi</td><td>Ani</td><td>Cici</td></tr>
            <tr><td>Minggu</td><td>Libur</td><td>Libur</td><td>Libur</td></tr>
        `;
    }

    // ========== SUBMIT FORM ==========
    document.getElementById('janitorIndoorForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        // Ambil data dasar
        const tanggal = document.getElementById('tanggal').value;
        const shift = document.getElementById('shift').value;
        const petugas = document.getElementById('petugas').value;
        const lokasi = document.getElementById('lokasi').value;
        const catatan = document.getElementById('catatan').value;

        if (!tanggal || !petugas || !lokasi) {
            document.getElementById('form-result').innerHTML = '<span class="text-red-500">Tanggal, Petugas, Lokasi harus diisi!</span>';
            return;
        }

        // Kumpulkan item toilet
        const toiletItems = {
            pintu_utama: document.getElementById('toilet_pintu_utama').checked,
            pintu_kubikal: document.getElementById('toilet_pintu_kubikal').checked,
            kaca: document.getElementById('toilet_kaca').checked,
            exhaust: document.getElementById('toilet_exhaust').checked,
            dinding: document.getElementById('toilet_dinding').checked,
            tempat_wudhu: document.getElementById('toilet_tempat_wudhu').checked,
            lantai: document.getElementById('toilet_lantai').checked,
            floor_drain: document.getElementById('toilet_floor_drain').checked,
            kloset: document.getElementById('toilet_kloset').checked,
            plafon: document.getElementById('toilet_plafon').checked,
            tempat_sampah: document.getElementById('toilet_tempat_sampah').checked
        };

        // Kumpulkan item ruangan
        const ruangItems = {
            loby_utama: document.getElementById('ruang_loby_utama')?.checked || false,
            teras: document.getElementById('ruang_teras')?.checked || false,
            lorong_utama: document.getElementById('ruang_lorong_utama')?.checked || false,
            balkon: document.getElementById('ruang_balkon')?.checked || false,
            pintu_utama: document.getElementById('ruang_pintu_utama')?.checked || false,
            pintu_kelas: document.getElementById('ruang_pintu_kelas')?.checked || false,
            jendela: document.getElementById('ruang_jendela')?.checked || false,
            kelas: document.getElementById('ruang_kelas')?.checked || false,
            aula: document.getElementById('ruang_aula')?.checked || false,
            sentra_musik: document.getElementById('ruang_sentra_musik')?.checked || false,
            sentra_kreasi: document.getElementById('ruang_sentra_kreasi')?.checked || false,
            uks: document.getElementById('ruang_uks')?.checked || false,
            psikolog: document.getElementById('ruang_psikolog')?.checked || false,
            lab_kom: document.getElementById('ruang_lab_kom')?.checked || false,
            lab_ipa: document.getElementById('ruang_lab_ipa')?.checked || false,
            perpus: document.getElementById('ruang_perpus')?.checked || false,
            kepsek: document.getElementById('ruang_kepsek')?.checked || false,
            guru_laki: document.getElementById('ruang_guru_laki')?.checked || false,
            guru_perempuan: document.getElementById('ruang_guru_perempuan')?.checked || false,
            pemasaran: document.getElementById('ruang_pemasaran')?.checked || false,
            admin_tu: document.getElementById('ruang_admin_tu')?.checked || false,
            rapat: document.getElementById('ruang_rapat')?.checked || false,
            ceo: document.getElementById('ruang_ceo')?.checked || false,
            kabid: document.getElementById('ruang_kabid')?.checked || false,
            osis: document.getElementById('ruang_osis')?.checked || false,
            mushalla: document.getElementById('ruang_mushalla')?.checked || false,
            inklusi: document.getElementById('ruang_inklusi')?.checked || false,
            gudang_olahraga: document.getElementById('ruang_gudang_olahraga')?.checked || false,
            serbaguna: document.getElementById('ruang_serbaguna')?.checked || false,
            masjid: document.getElementById('ruang_masjid')?.checked || false,
            kantin: document.getElementById('ruang_kantin')?.checked || false,
            saung_besar: document.getElementById('ruang_saung_besar')?.checked || false,
            saung_kecil: document.getElementById('ruang_saung_kecil')?.checked || false,
            pos: document.getElementById('ruang_pos')?.checked || false,
            gudang_umum: document.getElementById('ruang_gudang_umum')?.checked || false,
            tangga: document.getElementById('ruang_tangga')?.checked || false,
            lift: document.getElementById('ruang_lift')?.checked || false,
            lainnya: document.getElementById('ruang_lainnya')?.checked || false
        };

        const items = {
            toilet: toiletItems,
            ruangan: ruangItems
        };

        // Upload foto (sederhana, belum implementasi storage)
        // Untuk sementara kita kosongkan dulu
        const fotoSebelum = null;
        const fotoSesudah = null;

        const formData = {
            tanggal,
            shift,
            petugas,
            lokasi,
            items,
            catatan: catatan || null,
            foto_sebelum: fotoSebelum,
            foto_sesudah: fotoSesudah,
            status: 'pending'
        };

        const { error } = await supabase.from('janitor_indoor').insert([formData]);
        const resultDiv = document.getElementById('form-result');

        if (error) {
            resultDiv.innerHTML = `<span class="text-red-500">Gagal: ${error.message}</span>`;
        } else {
            resultDiv.innerHTML = '<span class="text-green-500">Ceklis indoor berhasil! ✅</span>';
            e.target.reset();
            setTimeout(() => resultDiv.innerHTML = '', 3000);
        }
    });

    // ========== REFRESH ==========
    document.getElementById('refresh-history').addEventListener('click', loadHistory);

    // ========== INIT ==========
    activateTab('form');
    // loadHistory sudah dipanggil saat tab history diklik
})();