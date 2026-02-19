alert('✅ sekuriti.js dimuat!');

(function() {
    const supabase = window.supabase;
    if (!supabase) {
        alert('❌ supabase tidak terdefinisi!');
        return;
    }

    // ========== TAB NAVIGATION ==========
    function initTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.tab-btn').forEach(b => {
                    b.classList.remove('active', 'text-green-600', 'border-b-2', 'border-green-600');
                    b.classList.add('text-gray-600', 'dark:text-gray-300');
                });
                this.classList.add('active', 'text-green-600', 'border-b-2', 'border-green-600');

                document.querySelectorAll('.tab-content').forEach(tc => tc.classList.add('hidden'));
                const tabId = this.dataset.tab;
                document.getElementById(`tab-${tabId}`).classList.remove('hidden');
            });
        });
    }

    // ========== LOAD RIWAYAT LAPORAN ==========
    async function loadHistory() {
        const tbody = document.getElementById('history-body');
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4">⏳ Memuat...</td></tr>';

        try {
            const { data, error } = await supabase
                .from('sekuriti_reports')
                .select('tanggal, shift, petugas, status')
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;

            if (!data || data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 opacity-60">Belum ada laporan</td></tr>';
                return;
            }

            let html = '';
            data.forEach(item => {
                html += `
                    <tr class="border-b dark:border-gray-700">
                        <td class="px-2 py-2">${item.tanggal}</td>
                        <td class="px-2 py-2">${item.shift}</td>
                        <td class="px-2 py-2">${item.petugas?.join(', ') || '-'}</td>
                        <td class="px-2 py-2 ${item.status === 'pending' ? 'text-yellow-600' : 'text-green-600'}">${item.status}</td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
        } catch (err) {
            console.error('Gagal load history:', err);
            tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-red-500">Gagal memuat</td></tr>';
        }
    }

    // ========== SUBMIT LAPORAN ==========
    document.getElementById('sekuritiForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const tanggal = document.getElementById('tanggal').value;
        const shift = document.getElementById('shift').value;
        const petugasStr = document.getElementById('petugas').value;
        const petugas = petugasStr.split(',').map(p => p.trim());
        const jenis_laporan = document.getElementById('jenis_laporan').value;
        const lokasi = document.getElementById('lokasi').value;
        const deskripsi = document.getElementById('deskripsi').value;
        const tindakan = document.getElementById('tindakan').value;
        const serah_terima = document.getElementById('serah_terima').value;

        if (!tanggal || !shift || !petugasStr || !deskripsi) {
            document.getElementById('form-result').innerHTML = '<span class="text-red-500">Tanggal, Shift, Petugas, Deskripsi harus diisi!</span>';
            return;
        }

        const formData = {
            tanggal,
            shift,
            petugas,
            jenis_laporan: jenis_laporan || null,
            lokasi: lokasi || null,
            deskripsi,
            tindakan: tindakan || null,
            serah_terima: serah_terima || null,
            status: 'pending'
        };

        const { error } = await supabase.from('sekuriti_reports').insert([formData]);
        const resultDiv = document.getElementById('form-result');

        if (error) {
            resultDiv.innerHTML = `<span class="text-red-500">Gagal: ${error.message}</span>`;
        } else {
            resultDiv.innerHTML = '<span class="text-green-500">Laporan berhasil! ✅</span>';
            e.target.reset();
            loadHistory();
            setTimeout(() => resultDiv.innerHTML = '', 3000);
        }
    });

    // ========== SUBMIT JADWAL ==========
    document.getElementById('jadwalForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const tanggal = document.getElementById('jadwal_tanggal').value;
        const shift = document.getElementById('jadwal_shift').value;
        const petugas1 = document.getElementById('petugas1').value;
        const petugas2 = document.getElementById('petugas2').value;
        const petugas3 = document.getElementById('petugas3').value;

        if (!tanggal || !shift || !petugas1 || !petugas2) {
            alert('Tanggal, Shift, Petugas 1 dan 2 harus diisi');
            return;
        }

        // Simpan ke tabel sekuriti_jadwal (perlu dibuat)
        alert('Fitur jadwal akan segera diimplementasikan');
        // const { error } = await supabase.from('sekuriti_jadwal').insert(...)
    });

    // ========== REFRESH ==========
    document.getElementById('refresh-history')?.addEventListener('click', loadHistory);

    // ========== INIT ==========
    initTabs();
    loadHistory();
})();