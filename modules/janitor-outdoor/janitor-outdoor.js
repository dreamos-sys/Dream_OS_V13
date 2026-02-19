alert('✅ janitor-outdoor.js dimuat!');

(function() {
    const supabase = window.supabase;
    if (!supabase) return;

    // ========== LOAD RIWAYAT ==========
    async function loadHistory() {
        const tbody = document.getElementById('history-body');
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4">⏳ Memuat...</td></tr>';

        try {
            const { data, error } = await supabase
                .from('janitor_outdoor')
                .select('tanggal, area, petugas, status')
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;

            if (!data || data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 opacity-60">Belum ada data outdoor</td></tr>';
                return;
            }

            let html = '';
            data.forEach(item => {
                html += `
                    <tr class="border-b dark:border-gray-700">
                        <td class="px-2 py-2">${item.tanggal}</td>
                        <td class="px-2 py-2">${item.area}</td>
                        <td class="px-2 py-2">${item.petugas}</td>
                        <td class="px-2 py-2 ${item.status === 'pending' ? 'text-yellow-600' : 'text-green-600'}">${item.status}</td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
        } catch (err) {
            console.error('Gagal load history outdoor:', err);
            tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-red-500">Gagal memuat</td></tr>';
        }
    }

    // ========== SUBMIT FORM ==========
    document.getElementById('janitorOutdoorForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const tanggal = document.getElementById('tanggal').value;
        const shift = document.getElementById('shift').value;
        const petugas = document.getElementById('petugas').value;
        const area = document.getElementById('area').value;
        const catatan = document.getElementById('catatan').value;

        // Ambil status checklist outdoor
        const items = {
            rumput: document.getElementById('check_rumput').checked,
            penyiraman: document.getElementById('check_penyiraman').checked,
            sampah: document.getElementById('check_sampah').checked,
            daun: document.getElementById('check_daun').checked,
            saluran: document.getElementById('check_saluran').checked,
            lapangan: document.getElementById('check_lapangan').checked,
            parkir: document.getElementById('check_parkir').checked,
            trotoar: document.getElementById('check_trotoar').checked
        };

        if (!tanggal || !petugas || !area) {
            document.getElementById('form-result').innerHTML = '<span class="text-red-500">Tanggal, Petugas, Area harus diisi!</span>';
            return;
        }

        const formData = {
            tanggal,
            shift: shift || null,
            petugas,
            area,
            items,
            catatan: catatan || null,
            status: 'pending'
        };

        const { error } = await supabase.from('janitor_outdoor').insert([formData]);
        const resultDiv = document.getElementById('form-result');

        if (error) {
            resultDiv.innerHTML = `<span class="text-red-500">Gagal: ${error.message}</span>`;
        } else {
            resultDiv.innerHTML = '<span class="text-green-500">Ceklis outdoor berhasil! ✅</span>';
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