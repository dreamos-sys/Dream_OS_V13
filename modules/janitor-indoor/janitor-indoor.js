alert('✅ janitor-indoor.js dimuat!');

(function() {
    const supabase = window.supabase;
    if (!supabase) return;

    // ========== LOAD RIWAYAT ==========
    async function loadHistory() {
        const tbody = document.getElementById('history-body');
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4">⏳ Memuat...</td></tr>';

        try {
            const { data, error } = await supabase
                .from('janitor_indoor')
                .select('tanggal, lokasi, petugas, status')
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;

            if (!data || data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 opacity-60">Belum ada data</td></tr>';
                return;
            }

            let html = '';
            data.forEach(item => {
                html += `
                    <tr class="border-b dark:border-gray-700">
                        <td class="px-2 py-2">${item.tanggal}</td>
                        <td class="px-2 py-2">${item.lokasi}</td>
                        <td class="px-2 py-2">${item.petugas}</td>
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

    // ========== SUBMIT FORM ==========
    document.getElementById('janitorIndoorForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const tanggal = document.getElementById('tanggal').value;
        const shift = document.getElementById('shift').value;
        const petugas = document.getElementById('petugas').value;
        const lokasi = document.getElementById('lokasi').value;
        const catatan = document.getElementById('catatan').value;

        // Ambil status checklist
        const items = {
            pintu: document.getElementById('check_pintu').checked,
            lantai: document.getElementById('check_lantai').checked,
            jendela: document.getElementById('check_jendela').checked,
            kloset: document.getElementById('check_kloset').checked,
            washtafel: document.getElementById('check_washtafel').checked,
            kaca: document.getElementById('check_kaca').checked,
            tempat_sampah: document.getElementById('check_tempat_sampah').checked,
            plafon: document.getElementById('check_plafon').checked
        };

        if (!tanggal || !petugas || !lokasi) {
            document.getElementById('form-result').innerHTML = '<span class="text-red-500">Tanggal, Petugas, Lokasi harus diisi!</span>';
            return;
        }

        const formData = {
            tanggal,
            shift: shift || null,
            petugas,
            lokasi,
            items,
            catatan: catatan || null,
            status: 'pending'
        };

        const { error } = await supabase.from('janitor_indoor').insert([formData]);
        const resultDiv = document.getElementById('form-result');

        if (error) {
            resultDiv.innerHTML = `<span class="text-red-500">Gagal: ${error.message}</span>`;
        } else {
            resultDiv.innerHTML = '<span class="text-green-500">Ceklis berhasil! ✅</span>';
            e.target.reset();
            loadHistory();
            setTimeout(() => resultDiv.innerHTML = '', 3000);
        }
    });

    // ========== REFRESH ==========
    document.getElementById('refresh-history')?.addEventListener('click', loadHistory);

    // ========== INIT ==========
    loadHistory();
})();