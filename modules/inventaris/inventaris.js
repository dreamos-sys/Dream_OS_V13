alert('📋 Inventaris Module Loaded');

(function() {
    const supabase = window.supabase;
    if (!supabase) return alert('Supabase tidak tersedia');

    let allData = [];

    // Submit form
    document.getElementById('inventarisForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const resultDiv = document.getElementById('form-result');
        resultDiv.innerHTML = '<span class="text-yellow-500">⏳ Menyimpan...</span>';

        const formData = {
            kode: document.getElementById('aset_kode').value.toUpperCase(),
            nama: document.getElementById('aset_nama').value,
            kategori: document.getElementById('aset_kategori').value,
            lokasi: document.getElementById('aset_lokasi').value,
            kondisi: document.getElementById('aset_kondisi').value,
            jumlah: parseInt(document.getElementById('aset_jumlah').value) || 1,
            nilai: parseFloat(document.getElementById('aset_nilai').value) || 0,
            tanggal_perolehan: document.getElementById('aset_tanggal').value || null,
            catatan: document.getElementById('aset_catatan').value || null,
            created_at: new Date()
        };

        try {
            const { error } = await supabase.from('inventaris').insert([formData]);
            if (error) throw error;

            resultDiv.innerHTML = '<span class="text-green-500 animate-pulse">✅ Aset berhasil disimpan!</span>';
            e.target.reset();
            loadInventaris();
            setTimeout(() => resultDiv.innerHTML = '', 3000);
        } catch (err) {
            resultDiv.innerHTML = `<span class="text-red-500">Gagal: ${err.message}</span>`;
        }
    });

    // Load inventaris
    async function loadInventaris() {
        const tbody = document.getElementById('inventaris-table-body');
        if (!tbody) return;
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4">⏳ Memuat...</td></tr>';

        try {
            const { data, error } = await supabase
                .from('inventaris')
                .select('*')                .order('created_at', { ascending: false });

            if (error) throw error;

            allData = data || [];
            updateStats(allData);
            populateQRSelect(allData);
            renderTable(allData);
        } catch (err) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-red-500">Gagal memuat</td></tr>';
        }
    }

    // Update statistics
    function updateStats(data) {
        document.getElementById('stat-total').textContent = data.length;
        document.getElementById('stat-baik').textContent = data.filter(d => d.kondisi === 'baik').length;
        document.getElementById('stat-rusak-ringan').textContent = data.filter(d => d.kondisi === 'rusak-ringan').length;
        document.getElementById('stat-rusak-berat').textContent = data.filter(d => d.kondisi === 'rusak-berat').length;
        document.getElementById('stat-hilang').textContent = data.filter(d => d.kondisi === 'hilang').length;
    }

    // Render table
    function renderTable(data) {
        const tbody = document.getElementById('inventaris-table-body');
        const search = document.getElementById('search-inventaris')?.value.toLowerCase() || '';
        const filterKategori = document.getElementById('filter-kategori')?.value || '';
        const filterKondisi = document.getElementById('filter-kondisi')?.value || '';

        const filtered = data.filter(item => {
            const matchSearch = item.kode?.toLowerCase().includes(search) || 
                               item.nama?.toLowerCase().includes(search) ||
                               item.lokasi?.toLowerCase().includes(search);
            const matchKategori = !filterKategori || item.kategori === filterKategori;
            const matchKondisi = !filterKondisi || item.kondisi === filterKondisi;
            return matchSearch && matchKategori && matchKondisi;
        });

        if (!filtered.length) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 opacity-60">Tidak ada data</td></tr>';
            return;
        }

        const kondisiClass = {
            'baik': 'status-baik',
            'rusak-ringan': 'status-rusak-ringan',
            'rusak-berat': 'status-rusak-berat',
            'hilang': 'status-hilang'
        };
        const kondisiIcon = {
            'baik': '✅',
            'rusak-ringan': '⚠️',
            'rusak-berat': '❌',
            'hilang': '❓'
        };

        tbody.innerHTML = filtered.map(item => `
            <tr class="border-b border-slate-700 hover:bg-slate-800/50 transition">
                <td class="p-3 font-mono text-xs">${item.kode || '-'}</td>
                <td class="p-3 font-medium">${item.nama || '-'}</td>
                <td class="p-3 capitalize">${item.kategori || '-'}</td>
                <td class="p-3 text-xs">${item.lokasi || '-'}</td>
                <td class="p-3"><span class="status-badge ${kondisiClass[item.kondisi] || 'status-hilang'}">${kondisiIcon[item.kondisi] || '❓'} ${item.kondisi || 'unknown'}</span></td>
                <td class="p-3">
                    <div class="flex gap-1">
                        <button onclick="openEditModal('${item.id}')" class="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-xs">✏️</button>
                        <button onclick="deleteAset('${item.id}')" class="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded text-xs">🗑️</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Edit modal
    window.openEditModal = async (id) => {
        const item = allData.find(d => d.id === id);
        if (!item) return;

        document.getElementById('edit-id').value = item.id;
        document.getElementById('edit-kode').value = item.kode;
        document.getElementById('edit-nama').value = item.nama;
        document.getElementById('edit-kategori').value = item.kategori;
        document.getElementById('edit-lokasi').value = item.lokasi;
        document.getElementById('edit-kondisi').value = item.kondisi;
        document.getElementById('edit-jumlah').value = item.jumlah;
        document.getElementById('edit-catatan').value = item.catatan || '';

        document.getElementById('edit-modal').classList.remove('hidden');
    };

    window.closeEditModal = () => {
        document.getElementById('edit-modal').classList.add('hidden');
    };

    document.getElementById('editForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-id').value;
        
        const updateData = {            nama: document.getElementById('edit-nama').value,
            kategori: document.getElementById('edit-kategori').value,
            lokasi: document.getElementById('edit-lokasi').value,
            kondisi: document.getElementById('edit-kondisi').value,
            jumlah: parseInt(document.getElementById('edit-jumlah').value),
            catatan: document.getElementById('edit-catatan').value,
            updated_at: new Date()
        };

        try {
            const { error } = await supabase.from('inventaris').update(updateData).eq('id', id);
            if (error) throw error;

            closeEditModal();
            loadInventaris();
            alert('✅ Aset berhasil diupdate!');
        } catch (err) {
            alert(`❌ Gagal: ${err.message}`);
        }
    });

    // Delete
    window.deleteAset = async (id) => {
        if (!confirm('⚠️ Yakin ingin menghapus aset ini?')) return;

        try {
            const { error } = await supabase.from('inventaris').delete().eq('id', id);
            if (error) throw error;

            loadInventaris();
            alert('✅ Aset berhasil dihapus!');
        } catch (err) {
            alert(`❌ Gagal: ${err.message}`);
        }
    };

    // QR Code
    function populateQRSelect(data) {
        const select = document.getElementById('qr-aset-select');
        if (!select) return;
        select.innerHTML = '<option value="">Pilih Aset</option>' + 
            data.map(item => `<option value="${item.id}">${item.kode} - ${item.nama}</option>`).join('');
    }

    window.generateQRCode = () => {
        const id = document.getElementById('qr-aset-select').value;
        const item = allData.find(d => d.id === id);
        if (!item) { alert('Pilih aset dulu!'); return; }

        const qrData = JSON.stringify({            type: 'INVENTARIS',
            kode: item.kode,
            nama: item.nama,
            lokasi: item.lokasi,
            kondisi: item.kondisi
        });

        // Simple QR visualization (replace with qrcode.js library for production)
        const qrDisplay = document.getElementById('qr-code-display');
        qrDisplay.innerHTML = `
            <div style="width:150px;height:150px;background:#f5f5f5;border:2px solid #333;display:grid;grid-template-columns:repeat(10,1fr);grid-template-rows:repeat(10,1fr);">
                ${Array(100).fill().map(() => `<div style="background:${Math.random()>0.5?'#000':'#fff'}"></div>`).join('')}
            </div>
            <p style="margin-top:10px;font-weight:bold;">${item.kode}</p>
        `;
        document.getElementById('qr-result').classList.remove('hidden');
    };

    window.printQR = () => {
        const qrContent = document.getElementById('qr-code-display').innerHTML;
        const printWindow = window.open('', '', 'width=400,height=500');
        printWindow.document.write(`
            <html><head><title>Print QR Label</title></head>
            <body style="text-align:center;padding:20px;">
                <h3>QR Code Aset</h3>
                ${qrContent}
                <p style="font-size:12px;color:#666;">Dream OS Inventory System</p>
            </body></html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    // Export CSV
    window.exportToCSV = () => {
        const headers = ['Kode', 'Nama', 'Kategori', 'Lokasi', 'Kondisi', 'Jumlah', 'Nilai', 'Tanggal Perolehan', 'Catatan'];
        const csv = [headers.join(',')] + 
            allData.map(item => [
                item.kode, item.nama, item.kategori, item.lokasi, item.kondisi, 
                item.jumlah, item.nilai, item.tanggal_perolehan, `"${item.catatan || ''}"`
            ].join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventaris_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };
    // Filter events
    document.getElementById('search-inventaris')?.addEventListener('input', () => renderTable(allData));
    document.getElementById('filter-kategori')?.addEventListener('change', () => renderTable(allData));
    document.getElementById('filter-kondisi')?.addEventListener('change', () => renderTable(allData));

    // Initial load
    loadInventaris();
})();