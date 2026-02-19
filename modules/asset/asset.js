alert('✅ asset.js dimuat!');

(function() {
    const supabase = window.supabase;
    if (!supabase) {
        alert('❌ supabase tidak terdefinisi!');
        return;
    }

    // ========== LOAD DAFTAR ASSET ==========
    async function loadAssets() {
        const listDiv = document.getElementById('asset-list');
        listDiv.innerHTML = '<p class="text-center py-4">⏳ Memuat...</p>';

        try {
            const { data, error } = await supabase
                .from('assets')
                .select('*')
                .order('nama_asset', { ascending: true });

            if (error) throw error;

            if (!data || data.length === 0) {
                listDiv.innerHTML = '<p class="text-center py-4 opacity-60">Belum ada data asset</p>';
                return;
            }

            let html = '<div class="space-y-2">';
            data.forEach(item => {
                html += `
                    <div class="border-b pb-2">
                        <div class="flex justify-between">
                            <span class="font-semibold">${item.nama_asset}</span>
                            <span class="text-xs ${item.kondisi === 'baik' ? 'text-green-500' : 'text-red-500'}">${item.kondisi}</span>
                        </div>
                        <div class="text-xs">${item.kategori || '-'} | Lokasi: ${item.lokasi || '-'}</div>
                        <div class="text-xs">Harga: ${item.harga ? 'Rp ' + item.harga.toLocaleString() : '-'}</div>
                    </div>
                `;
            });
            html += '</div>';
            listDiv.innerHTML = html;
        } catch (err) {
            console.error('Gagal load asset:', err);
            listDiv.innerHTML = '<p class="text-center py-4 text-red-500">Gagal memuat data</p>';
        }
    }

    // ========== HANDLE SUBMIT ==========
    document.getElementById('assetForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nama_asset = document.getElementById('nama_asset').value.trim();
        const kategori = document.getElementById('kategori').value;
        const lokasi = document.getElementById('lokasi').value.trim();
        const kondisi = document.getElementById('kondisi').value;
        const harga = parseFloat(document.getElementById('harga').value) || null;
        const tanggal_beli = document.getElementById('tanggal_beli').value || null;

        if (!nama_asset) {
            document.getElementById('form-result').innerHTML = '<span class="text-red-500">Nama asset harus diisi!</span>';
            return;
        }

        const formData = {
            nama_asset,
            kategori: kategori || null,
            lokasi: lokasi || null,
            kondisi: kondisi || 'baik',
            harga,
            tanggal_beli
        };

        const { error } = await supabase.from('assets').insert([formData]);
        const resultDiv = document.getElementById('form-result');

        if (error) {
            resultDiv.innerHTML = `<span class="text-red-500">Gagal: ${error.message}</span>`;
        } else {
            resultDiv.innerHTML = '<span class="text-green-500">Asset berhasil ditambahkan! ✅</span>';
            e.target.reset();
            loadAssets();
            setTimeout(() => resultDiv.innerHTML = '', 3000);
        }
    });

    // ========== INIT ==========
    loadAssets();
})();