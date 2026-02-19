alert('✅ k3.js dimuat (versi 3 jenis laporan)!');

(function() {
    const supabase = window.supabase;
    if (!supabase) {
        alert('❌ supabase tidak terdefinisi!');
        return;
    }

    // ========== TOGGLE FIELD BERDASARKAN JENIS LAPORAN ==========
    function toggleFields() {
        const jenis = document.getElementById('jenis_laporan')?.value;
        const fieldKerusakan = document.getElementById('field-kerusakan');
        const fieldKehilangan = document.getElementById('field-kehilangan');
        const fieldKebersihan = document.getElementById('field-kebersihan');

        // Sembunyikan semua dulu
        if (fieldKerusakan) fieldKerusakan.style.display = 'none';
        if (fieldKehilangan) fieldKehilangan.style.display = 'none';
        if (fieldKebersihan) fieldKebersihan.style.display = 'none';

        // Tampilkan sesuai jenis
        if (jenis === 'kerusakan' && fieldKerusakan) fieldKerusakan.style.display = 'block';
        if (jenis === 'kehilangan' && fieldKehilangan) fieldKehilangan.style.display = 'block';
        if (jenis === 'kebersihan' && fieldKebersihan) fieldKebersihan.style.display = 'block';
    }

    // ========== LOAD RIWAYAT ==========
    async function loadTodayHistory() {
        const tbody = document.getElementById('history-table-body');
        if (!tbody) return;

        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4">⏳ Memuat data...</td></tr>';

        const today = new Date().toISOString().split('T')[0];
        try {
            const { data, error } = await supabase
                .from('k3_reports')
                .select('tanggal, lokasi, jenis_laporan, pelapor, status')
                .eq('tanggal', today)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (!data || data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 opacity-60">Belum ada laporan hari ini</td></tr>';
                return;
            }

            let html = '';
            data.forEach((item, index) => {
                const jenisIcon = {
                    'kerusakan': '🔧',
                    'kehilangan': '🔒',
                    'kebersihan': '🧹'
                }[item.jenis_laporan] || '📝';

                html += `
                    <tr class="border-b dark:border-gray-700">
                        <td class="px-2 py-2">${index + 1}</td>
                        <td class="px-2 py-2">${item.tanggal || '-'}</td>
                        <td class="px-2 py-2">${item.lokasi || '-'}</td>
                        <td class="px-2 py-2">${jenisIcon} ${item.jenis_laporan || '-'}</td>
                        <td class="px-2 py-2">${item.pelapor || '-'}</td>
                        <td class="px-2 py-2 ${item.status === 'pending' ? 'text-yellow-600' : 'text-green-600'}">${item.status || 'pending'}</td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
        } catch (err) {
            console.error('Gagal memuat riwayat:', err);
            tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-red-500">Gagal memuat data</td></tr>';
        }
    }

    // ========== HANDLE SUBMIT ==========
    document.getElementById('k3Form')?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const tanggal = document.getElementById('tanggal')?.value;
        const waktu = document.getElementById('waktu')?.value || null;
        const lokasi = document.getElementById('lokasi')?.value;
        const jenis = document.getElementById('jenis_laporan')?.value;
        const deskripsi = document.getElementById('deskripsi')?.value;
        const pelapor = document.getElementById('pelapor')?.value;
        const no_hp = document.getElementById('no_hp')?.value || null;

        if (!tanggal || !lokasi || !jenis || !deskripsi || !pelapor) {
            document.getElementById('form-result').innerHTML = '<span class="text-red-500">Tanggal, Lokasi, Jenis, Deskripsi, Pelapor harus diisi!</span>';
            return;
        }

        // Ambil field tambahan sesuai jenis
        let extraData = {};
        if (jenis === 'kerusakan') {
            extraData.kategori_kerusakan = document.getElementById('kategori_kerusakan')?.value || null;
            extraData.prioritas = document.getElementById('prioritas')?.value || 'normal';
        } else if (jenis === 'kehilangan') {
            extraData.barang_hilang = document.getElementById('barang_hilang')?.value || null;
            extraData.nilai_estimasi = document.getElementById('nilai_estimasi')?.value || null;
        } else if (jenis === 'kebersihan') {
            extraData.area_kebersihan = document.getElementById('area_kebersihan')?.value || null;
            extraData.tingkat_kekotoran = document.getElementById('tingkat_kekotoran')?.value || null;
        }

        const formData = {
            tanggal,
            waktu,
            lokasi,
            jenis_laporan: jenis,
            deskripsi,
            pelapor,
            no_hp,
            ...extraData,
            status: 'pending'
        };

        const { error } = await supabase.from('k3_reports').insert([formData]);
        const resultDiv = document.getElementById('form-result');

        if (error) {
            resultDiv.innerHTML = `<span class="text-red-500">Gagal: ${error.message}</span>`;
        } else {
            resultDiv.innerHTML = '<span class="text-green-500">Laporan K3 berhasil! ✅</span>';
            e.target.reset();
            toggleFields(); // sembunyikan field khusus
            loadTodayHistory();
            setTimeout(() => resultDiv.innerHTML = '', 3000);
        }
    });

    // ========== REFRESH ==========
    document.getElementById('refresh-history')?.addEventListener('click', loadTodayHistory);

    // ========== EVENT LISTENER UNTUK DROPDOWN JENIS ==========
    const jenisSelect = document.getElementById('jenis_laporan');
    if (jenisSelect) {
        jenisSelect.addEventListener('change', toggleFields);
    }

    // ========== INIT ==========
    toggleFields(); // sembunyikan semua field khusus di awal
    loadTodayHistory();
})();