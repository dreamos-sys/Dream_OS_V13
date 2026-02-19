alert('✅ stok.js dimuat!');

(function() {
    const supabase = window.supabase;
    if (!supabase) {
        alert('❌ supabase tidak terdefinisi!');
        return;
    }

    // ========== LOAD DAFTAR STOK ==========
    async function loadStok() {
        const listDiv = document.getElementById('stok-list');
        listDiv.innerHTML = '<p class="text-center py-4">⏳ Memuat...</p>';

        try {
            const { data, error } = await supabase
                .from('stok')
                .select('*')
                .order('nama_barang', { ascending: true });

            if (error) throw error;

            if (!data || data.length === 0) {
                listDiv.innerHTML = '<p class="text-center py-4 opacity-60">Belum ada data stok</p>';
                return;
            }

            let html = '<div class="space-y-2">';
            data.forEach(item => {
                const stokWarning = item.jumlah <= item.minimal_stok ? 'text-red-500 font-bold' : '';
                html += `
                    <div class="border-b pb-2">
                        <div class="flex justify-between">
                            <span class="font-semibold">${item.nama_barang}</span>
                            <span class="${stokWarning}">${item.jumlah} ${item.satuan || ''}</span>
                        </div>
                        <div class="text-xs opacity-60">${item.kategori || '-'} | Lokasi: ${item.lokasi || '-'}</div>
                    </div>
                `;
            });
            html += '</div>';
            listDiv.innerHTML = html;
        } catch (err) {
            console.error('Gagal load stok:', err);
            listDiv.innerHTML = '<p class="text-center py-4 text-red-500">Gagal memuat data</p>';
        }
    }

    // ========== HANDLE SUBMIT ==========
    document.getElementById('stokForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nama_barang = document.getElementById('nama_barang').value.trim();
        const kategori = document.getElementById('kategori').value;
        const jumlah = parseInt(document.getElementById('jumlah').value);
        const satuan = document.getElementById('satuan').value.trim();
        const lokasi = document.getElementById('lokasi').value.trim();
        const minimal_stok = parseInt(document.getElementById('minimal_stok').value) || 0;

        if (!nama_barang || !jumlah) {
            document.getElementById('form-result').innerHTML = '<span class="text-red-500">Nama barang dan jumlah harus diisi!</span>';
            return;
        }

        const formData = {
            nama_barang,
            kategori: kategori || null,
            jumlah,
            satuan: satuan || null,
            lokasi: lokasi || null,
            minimal_stok
        };

        const { error } = await supabase.from('stok').insert([formData]);
        const resultDiv = document.getElementById('form-result');

        if (error) {
            resultDiv.innerHTML = `<span class="text-red-500">Gagal: ${error.message}</span>`;
        } else {
            resultDiv.innerHTML = '<span class="text-green-500">Stok berhasil ditambahkan! ✅</span>';
            e.target.reset();
            loadStok();
            setTimeout(() => resultDiv.innerHTML = '', 3000);
        }
    });

    // ========== INIT ==========
    loadStok();
})();