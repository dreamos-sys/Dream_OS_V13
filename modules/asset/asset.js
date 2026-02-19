alert('🚀 High-End Asset System Activated!');

(function() {
    const supabase = window.supabase;
    if (!supabase) {
        alert('❌ Supabase Error: Pastikan koneksi database aktif!');
        return;
    }

    // --- UTILITY: Format Rupiah ---
    const formatIDR = (val) => new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(val || 0);

    // --- LOGIC: Hitung Penyusutan (Depresiasi) ---
    // Sesuai standar akuntansi, kita asumsikan umur manfaat rata-rata 5 tahun
    function calculateBookValue(harga, tanggalBeli) {
        if (!harga || !tanggalBeli) return 0;
        const thnBeli = new Date(tanggalBeli).getFullYear();
        const thnSekarang = new Date().getFullYear();
        const umur = thnSekarang - thnBeli;
        const masaManfaat = 5; // Tahun
        const sisaValue = harga - (harga * (Math.min(umur, masaManfaat) / masaManfaat));
        return sisaValue;
    }

    // --- 📊 UPDATE STATISTICS ---
    function updateStats(assets) {
        const total = assets.length;
        const value = assets.reduce((acc, curr) => acc + (curr.harga || 0), 0);
        const damaged = assets.filter(a => a.kondisi === 'rusak_berat').length;
        const repair = assets.filter(a => a.kondisi === 'rusak_ringan').length;
        
        // Update Kartu Atas
        document.getElementById('stat-total-asset').textContent = total;
        document.getElementById('stat-total-value').textContent = formatIDR(value);
        document.getElementById('stat-asset-repair').textContent = repair;
        document.getElementById('stat-asset-damaged').textContent = damaged;

        // Update Panel Depresiasi
        document.getElementById('total-investasi').textContent = formatIDR(value);
        
        const totalBookValue = assets.reduce((acc, curr) => 
            acc + calculateBookValue(curr.harga, curr.tanggal_beli), 0);
        document.getElementById('current-book-value').textContent = formatIDR(totalBookValue);
    }

    // --- 📦 RENDER TABLE (HIGH-END) ---
    async function loadAssets() {
        const tbody = document.getElementById('asset-list');
        tbody.innerHTML = '<tr><td colspan="5" class="p-8 text-center animate-pulse">📡 Sinkronisasi Data ISO...</td></tr>';

        try {
            const { data, error } = await supabase
                .from('assets')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            window.currentAssets = data; // Simpan di global untuk fitur Search
            renderTable(data);
            updateStats(data);

        } catch (err) {
            console.error('Error:', err);
            tbody.innerHTML = '<tr><td colspan="5" class="p-8 text-center text-red-500">❌ Gagal terhubung ke database</td></tr>';
        }
    }

    function renderTable(items) {
        const tbody = document.getElementById('asset-list');
        if (items.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="p-8 text-center opacity-50">Data Kosong</td></tr>';
            return;
        }

        tbody.innerHTML = items.map(item => {
            // Label Kondisi
            let badgeColor = 'bg-green-100 text-green-700';
            if(item.kondisi === 'rusak_ringan') badgeColor = 'bg-yellow-100 text-yellow-700';
            if(item.kondisi === 'rusak_berat') badgeColor = 'bg-red-100 text-red-700';

            return `
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td class="p-3">
                        <div class="font-bold text-gray-800 dark:text-gray-200">${item.nama_asset}</div>
                        <div class="text-[10px] text-gray-400 uppercase tracking-tighter">${item.kategori}</div>
                    </td>
                    <td class="p-3 text-xs font-semibold text-gray-500">${item.lokasi}</td>
                    <td class="p-3">
                        <span class="px-2 py-1 rounded-full text-[10px] font-black uppercase ${badgeColor}">
                            ${item.kondisi.replace('_', ' ')}
                        </span>
                    </td>
                    <td class="p-3 font-mono text-xs font-bold text-indigo-600">
                        ${formatIDR(item.harga)}
                    </td>
                    <td class="p-3">
                        <button class="bg-gray-100 hover:bg-indigo-600 hover:text-white p-1.5 rounded-lg transition-all text-xs">
                            🔍 Detail
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // --- 🔍 LIVE SEARCH ---
    document.getElementById('searchAsset')?.addEventListener('input', (e) => {
        const keyword = e.target.value.toLowerCase();
        const filtered = window.currentAssets.filter(a => 
            a.nama_asset.toLowerCase().includes(keyword) || 
            a.lokasi.toLowerCase().includes(keyword)
        );
        renderTable(filtered);
    });

    // --- 💾 HANDLE SUBMIT (ISO STANDARD) ---
    document.getElementById('assetForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        btn.disabled = true;
        btn.innerHTML = '<span>⏳ Memproses...</span>';

        const formData = {
            nama_asset: document.getElementById('nama_asset').value,
            kategori: document.getElementById('kategori').value,
            lokasi: document.getElementById('lokasi').value,
            kondisi: document.getElementById('kondisi').value,
            harga: parseFloat(document.getElementById('harga').value),
            tanggal_beli: document.getElementById('tanggal_beli').value,
            created_by: 'Erwinsyah' // Applicant
        };

        const { error } = await supabase.from('assets').insert([formData]);

        if (error) {
            alert('❌ Gagal Simpan: ' + error.message);
        } else {
            // Sukses
            const resDiv = document.getElementById('form-result');
            resDiv.innerHTML = '<b class="text-green-500 animate-bounce">Aset Berhasil Terdaftar! ✅</b>';
            e.target.reset();
            loadAssets();
            setTimeout(() => resDiv.innerHTML = '', 4000);
        }
        btn.disabled = false;
        btn.innerHTML = '<span>💾 SIMPAN KE INVENTARIS</span>';
    });

    // --- 📤 EXPORT CSV (Fitur Bonus) ---
    document.getElementById('btn-export-asset')?.onclick = () => {
        let csv = 'Nama Asset,Kategori,Lokasi,Kondisi,Harga,Tanggal Beli\n';
        window.currentAssets.forEach(a => {
            csv += `${a.nama_asset},${a.kategori},${a.lokasi},${a.kondisi},${a.harga},${a.tanggal_beli}\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'Inventaris_AlFikri_2026.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // --- INIT ---
    loadAssets();

})();
