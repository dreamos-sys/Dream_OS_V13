alert('💰 Dana Module Loaded');

(function() {
    const supabase = window.supabase;
    if (!supabase) return alert('Supabase tidak tersedia');

    // Submit form
    document.getElementById('danaForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const resultDiv = document.getElementById('form-result');
        resultDiv.innerHTML = '<span class="text-yellow-500">⏳ Mengirim...</span>';

        const formData = {
            kategori: document.getElementById('dana_kategori').value,
            judul: document.getElementById('dana_judul').value,
            deskripsi: document.getElementById('dana_deskripsi').value || null,
            nominal: document.getElementById('dana_nominal').value,
            periode: document.getElementById('dana_periode').value || null,
            pengaju: document.getElementById('dana_pengaju').value,
            departemen: document.getElementById('dana_departemen').value || null,
            status: 'pending',
            created_at: new Date()
        };

        try {
            const { error } = await supabase.from('pengajuan_dana').insert([formData]);
            if (error) throw error;

            resultDiv.innerHTML = '<span class="text-green-500 animate-pulse">✅ Pengajuan dana berhasil!</span>';
            e.target.reset();
            loadDanaHistory();
            setTimeout(() => resultDiv.innerHTML = '', 3000);
        } catch (err) {
            resultDiv.innerHTML = `<span class="text-red-500">Gagal: ${err.message}</span>`;
        }
    });

    // Load history
    async function loadDanaHistory() {
        const tbody = document.getElementById('dana-table-body');
        if (!tbody) return;
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4">⏳ Memuat...</td></tr>';

        try {
            const { data, error } = await supabase
                .from('pengajuan_dana')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;

            if (!data?.length) {
                tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 opacity-60">Belum ada pengajuan</td></tr>';
                return;
            }

            let html = '';
            data.forEach(item => {
                const statusColor = item.status === 'approved' ? 'text-green-500' : item.status === 'rejected' ? 'text-red-500' : 'text-yellow-500';
                html += `<tr class="border-b border-slate-700">
                    <td class="p-2">${new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                    <td class="p-2">${item.judul}</td>
                    <td class="p-2">Rp ${Number(item.nominal).toLocaleString()}</td>
                    <td class="p-2 ${statusColor}">${item.status}</td>
                </tr>`;
            });
            tbody.innerHTML = html;
        } catch (err) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-red-500">Gagal memuat</td></tr>';
        }
    }

    document.getElementById('refresh-dana')?.addEventListener('click', loadDanaHistory);
    loadDanaHistory();
})();