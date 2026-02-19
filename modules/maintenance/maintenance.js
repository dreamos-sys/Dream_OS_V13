alert('✅ maintenance.js dimuat!');

(function() {
    const supabase = window.supabase;
    if (!supabase) {
        alert('❌ supabase tidak terdefinisi!');
        return;
    }

    // ========== LOAD RIWAYAT MAINTENANCE ==========
    async function loadHistory() {
        const listDiv = document.getElementById('history-list');
        listDiv.innerHTML = '<p class="text-center py-4">⏳ Memuat...</p>';

        try {
            const { data, error } = await supabase
                .from('maintenance_requests')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;

            if (!data || data.length === 0) {
                listDiv.innerHTML = '<p class="text-center py-4 opacity-60">Belum ada request maintenance</p>';
                return;
            }

            let html = '<div class="space-y-2">';
            data.forEach(item => {
                const statusClass = item.status === 'pending' ? 'text-yellow-600' : 'text-green-600';
                html += `
                    <div class="border-b pb-2">
                        <div class="flex justify-between">
                            <span class="font-semibold">${item.lokasi}</span>
                            <span class="${statusClass}">${item.status}</span>
                        </div>
                        <div class="text-xs">${item.tanggal} | ${item.kategori || '-'} | Prioritas: ${item.prioritas}</div>
                        <div class="text-sm">${item.deskripsi.substring(0, 50)}...</div>
                    </div>
                `;
            });
            html += '</div>';
            listDiv.innerHTML = html;
        } catch (err) {
            console.error('Gagal load maintenance:', err);
            listDiv.innerHTML = '<p class="text-center py-4 text-red-500">Gagal memuat data</p>';
        }
    }

    // ========== HANDLE SUBMIT ==========
    document.getElementById('maintenanceForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const tanggal = document.getElementById('tanggal').value;
        const pelapor = document.getElementById('pelapor').value.trim();
        const lokasi = document.getElementById('lokasi').value.trim();
        const kategori = document.getElementById('kategori').value;
        const prioritas = document.getElementById('prioritas').value;
        const deskripsi = document.getElementById('deskripsi').value.trim();

        if (!tanggal || !pelapor || !lokasi || !deskripsi) {
            document.getElementById('form-result').innerHTML = '<span class="text-red-500">Tanggal, Pelapor, Lokasi, Deskripsi harus diisi!</span>';
            return;
        }

        const formData = {
            tanggal,
            pelapor,
            lokasi,
            kategori: kategori || null,
            prioritas,
            deskripsi,
            status: 'pending'
        };

        const { error } = await supabase.from('maintenance_requests').insert([formData]);
        const resultDiv = document.getElementById('form-result');

        if (error) {
            resultDiv.innerHTML = `<span class="text-red-500">Gagal: ${error.message}</span>`;
        } else {
            resultDiv.innerHTML = '<span class="text-green-500">Request maintenance berhasil! ✅</span>';
            e.target.reset();
            loadHistory();
            setTimeout(() => resultDiv.innerHTML = '', 3000);
        }
    });

    // ========== INIT ==========
    loadHistory();
})();