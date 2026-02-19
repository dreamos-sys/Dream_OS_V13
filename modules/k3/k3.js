alert('✅ k3.js dimuat!');

(function() {
    const supabase = window.supabase;
    if (!supabase) {
        alert('❌ supabase tidak terdefinisi!');
        return;
    }

    // ========== LOAD RIWAYAT ==========
    async function loadTodayHistory() {
        const tbody = document.getElementById('history-table-body');
        if (!tbody) return;

        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4">⏳ Memuat data...</td></tr>';

        const today = new Date().toISOString().split('T')[0];
        try {
            const { data, error } = await supabase
                .from('k3_reports')
                .select('tanggal, lokasi, jenis_insiden, pelapor, status')
                .eq('tanggal', today)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (!data || data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 opacity-60">Belum ada laporan hari ini</td></tr>';
                return;
            }

            let html = '';
            data.forEach((item, index) => {
                html += `
                    <tr class="border-b dark:border-gray-700">
                        <td class="px-2 py-2">${index + 1}</td>
                        <td class="px-2 py-2">${item.tanggal || '-'}</td>
                        <td class="px-2 py-2">${item.lokasi || '-'}</td>
                        <td class="px-2 py-2">${item.jenis_insiden || '-'}</td>
                        <td class="px-2 py-2">${item.pelapor || '-'}</td>
                        <td class="px-2 py-2 ${item.status === 'pending' ? 'text-yellow-600' : 'text-green-600'}">${item.status || 'pending'}</td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
        } catch (err) {
            console.error('Gagal memuat riwayat:', err);
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-red-500">Gagal memuat data</td></tr>';
        }
    }

    // ========== HANDLE SUBMIT ==========
    document.getElementById('k3Form')?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const tanggal = document.getElementById('tanggal').value;
        const waktu = document.getElementById('waktu')?.value || null;
        const lokasi = document.getElementById('lokasi').value;
        const jenis = document.getElementById('jenis')?.value || null;
        const deskripsi = document.getElementById('deskripsi').value;
        const korban = document.getElementById('korban')?.value || null;
        const tindakan = document.getElementById('tindakan')?.value || null;
        const pelapor = document.getElementById('pelapor').value;
        const no_hp = document.getElementById('no_hp')?.value || null;

        if (!tanggal || !lokasi || !deskripsi || !pelapor) {
            document.getElementById('form-result').innerHTML = '<span class="text-red-500">Tanggal, Lokasi, Deskripsi, dan Pelapor harus diisi!</span>';
            return;
        }

        const formData = {
            tanggal,
            waktu,
            lokasi,
            jenis_insiden: jenis,
            deskripsi,
            korban,
            tindakan,
            pelapor,
            no_hp,
            status: 'pending'
        };

        const { error } = await supabase.from('k3_reports').insert([formData]);
        if (error) {
            document.getElementById('form-result').innerHTML = `<span class="text-red-500">Gagal: ${error.message}</span>`;
        } else {
            document.getElementById('form-result').innerHTML = '<span class="text-green-500">Laporan K3 berhasil! ✅</span>';
            e.target.reset();
            loadTodayHistory();
            setTimeout(() => document.getElementById('form-result').innerHTML = '', 3000);
        }
    });

    // ========== REFRESH ==========
    document.getElementById('refresh-history')?.addEventListener('click', loadTodayHistory);

    // ========== INIT ==========
    loadTodayHistory();
})();