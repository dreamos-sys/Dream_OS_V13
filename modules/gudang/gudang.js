alert('🏭 Gudang Module Loaded');

(function() {
    const supabase = window.supabase;
    if (!supabase) return alert('Supabase tidak tersedia');

    let stockData = [];

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => {
                b.classList.remove('active', 'bg-emerald-600', 'text-white');
                b.classList.add('bg-slate-700', 'text-slate-300');
            });
            btn.classList.remove('bg-slate-700', 'text-slate-300');
            btn.classList.add('active', 'bg-emerald-600', 'text-white');
            
            document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
            document.getElementById(`tab-${btn.dataset.tab}`).classList.remove('hidden');
        });
    });

    // Add new stock
    document.getElementById('newStockForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            kode: document.getElementById('new-kode').value.toUpperCase(),
            nama: document.getElementById('new-nama').value,
            kategori: document.getElementById('new-kategori').value,
            stok: parseInt(document.getElementById('new-stok').value),
            satuan: document.getElementById('new-satuan').value,
            reorder_level: parseInt(document.getElementById('new-reorder').value) || 10,
            harga_satuan: parseFloat(document.getElementById('new-harga').value) || 0,
            created_at: new Date()
        };

        try {
            const { error } = await supabase.from('gudang_stok').insert([formData]);
            if (error) throw error;

            alert('✅ Barang berhasil ditambahkan!');
            closeAddStockModal();
            loadStock();
        } catch (err) {
            alert(`❌ Gagal: ${err.message}`);
        }
    });
    // Stock In
    document.getElementById('stockInForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const barangId = document.getElementById('in_barang_id').value;
        const jumlah = parseInt(document.getElementById('in_jumlah').value);
        
        // Update stock
        const { data: current } = await supabase.from('gudang_stok').select('stok').eq('id', barangId).single();
        const newStock = current.stok + jumlah;

        try {
            await supabase.from('gudang_stok').update({ stok: newStock }).eq('id', barangId);
            await supabase.from('stock_transactions').insert([{
                barang_id: barangId,
                type: 'in',
                jumlah: jumlah,
                supplier: document.getElementById('in_supplier').value,
                catatan: document.getElementById('in_catatan').value,
                tanggal: document.getElementById('in_tanggal').value || new Date().toISOString().split('T')[0],
                created_at: new Date()
            }]);

            alert('✅ Barang masuk tercatat!');
            e.target.reset();
            loadStock();
            loadStockHistory();
        } catch (err) {
            alert(`❌ Gagal: ${err.message}`);
        }
    });

    // Stock Out
    document.getElementById('stockOutForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const barangId = document.getElementById('out_barang_id').value;
        const jumlah = parseInt(document.getElementById('out_jumlah').value);
        
        // Check stock
        const { data: current } = await supabase.from('gudang_stok').select('stok').eq('id', barangId).single();
        if (current.stok < jumlah) {
            alert('❌ Stok tidak mencukupi!');
            return;
        }

        const newStock = current.stok - jumlah;

        try {
            await supabase.from('gudang_stok').update({ stok: newStock }).eq('id', barangId);            await supabase.from('stock_transactions').insert([{
                barang_id: barangId,
                type: 'out',
                jumlah: jumlah,
                keperluan: document.getElementById('out_keperluan').value,
                peminta: document.getElementById('out_peminta').value,
                tanggal: document.getElementById('out_tanggal').value || new Date().toISOString().split('T')[0],
                created_at: new Date()
            }]);

            alert('✅ Barang keluar tercatat!');
            e.target.reset();
            loadStock();
            loadStockHistory();
        } catch (err) {
            alert(`❌ Gagal: ${err.message}`);
        }
    });

    // Load stock
    async function loadStock() {
        const tbody = document.getElementById('stock-table-body');
        if (!tbody) return;

        try {
            const { data, error } = await supabase
                .from('gudang_stok')
                .select('*')
                .order('kategori', { ascending: true });

            if (error) throw error;

            stockData = data || [];
            updateStats(stockData);
            populateSelects(stockData);
            renderStockTable(stockData);
        } catch (err) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-red-500">Gagal memuat</td></tr>';
        }
    }

    function updateStats(data) {
        document.getElementById('stat-total-items').textContent = data.length;
        document.getElementById('stat-stok-aman').textContent = data.filter(d => d.stok > d.reorder_level).length;
        document.getElementById('stat-stok-rendah').textContent = data.filter(d => d.stok <= d.reorder_level && d.stok > 0).length;
        document.getElementById('stat-perlu-order').textContent = data.filter(d => d.stok <= 0).length;
    }

    function populateSelects(data) {
        const inSelect = document.getElementById('in_barang_id');        const outSelect = document.getElementById('out_barang_id');
        
        const options = data.map(item => 
            `<option value="${item.id}">${item.kode} - ${item.nama} (Stok: ${item.stok})</option>`
        ).join('');

        if (inSelect) inSelect.innerHTML = '<option value="">Pilih barang...</option>' + options;
        if (outSelect) outSelect.innerHTML = '<option value="">Pilih barang...</option>' + options;
    }

    function renderStockTable(data) {
        const tbody = document.getElementById('stock-table-body');
        if (!tbody) return;

        if (!data.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 opacity-60">Belum ada data</td></tr>';
            return;
        }

        tbody.innerHTML = data.map(item => {
            let statusClass = 'stock-good';
            let statusText = '✅ Aman';
            
            if (item.stok <= 0) {
                statusClass = 'stock-low';
                statusText = '❌ Habis';
            } else if (item.stok <= item.reorder_level) {
                statusClass = 'stock-low';
                statusText = '⚠️ Perlu Order';
            }

            return `
                <tr class="border-b border-slate-700 hover:bg-slate-800/50 transition">
                    <td class="p-3 font-mono text-xs">${item.kode || '-'}</td>
                    <td class="p-3 font-medium">${item.nama || '-'}</td>
                    <td class="p-3 capitalize">${item.kategori || '-'}</td>
                    <td class="p-3 font-bold">${item.stok || 0}</td>
                    <td class="p-3 text-xs">${item.satuan || '-'}</td>
                    <td class="p-3"><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td class="p-3">
                        <button onclick="quickAdjust('${item.id}')" class="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-xs">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Load history    async function loadStockHistory() {
        try {
            const { data } = await supabase
                .from('stock_transactions')
                .select('*, gudang_stok(kode, nama)')
                .order('created_at', { ascending: false })
                .limit(20);

            const inHistory = document.getElementById('stock-in-history');
            const outHistory = document.getElementById('stock-out-history');

            if (inHistory) {
                const ins = data?.filter(d => d.type === 'in') || [];
                inHistory.innerHTML = ins.length ? ins.map(item => `
                    <div class="bg-slate-800/50 p-3 rounded-xl flex justify-between items-center">
                        <div>
                            <p class="text-sm font-bold">${item.gudang_stok?.nama || 'Unknown'}</p>
                            <p class="text-xs text-slate-400">+${item.jumlah} | ${item.supplier || '-'}</p>
                        </div>
                        <span class="text-xs text-green-400">${new Date(item.tanggal).toLocaleDateString('id-ID')}</span>
                    </div>
                `).join('') : '<p class="text-slate-500">Belum ada</p>';
            }

            if (outHistory) {
                const outs = data?.filter(d => d.type === 'out') || [];
                outHistory.innerHTML = outs.length ? outs.map(item => `
                    <div class="bg-slate-800/50 p-3 rounded-xl flex justify-between items-center">
                        <div>
                            <p class="text-sm font-bold">${item.gudang_stok?.nama || 'Unknown'}</p>
                            <p class="text-xs text-slate-400">-${item.jumlah} | ${item.keperluan || '-'}</p>
                        </div>
                        <span class="text-xs text-orange-400">${new Date(item.tanggal).toLocaleDateString('id-ID')}</span>
                    </div>
                `).join('') : '<p class="text-slate-500">Belum ada</p>';
            }
        } catch (err) {
            console.error('History load error:', err);
        }
    }

    async function loadHistory() {
        const from = document.getElementById('history-from')?.value;
        const to = document.getElementById('history-to')?.value;
        const container = document.getElementById('full-history');

        try {
            let query = supabase.from('stock_transactions').select('*, gudang_stok(kode, nama)');
            if (from) query = query.gte('tanggal', from);
            if (to) query = query.lte('tanggal', to);            
            const { data } = await query.order('created_at', { ascending: false });

            container.innerHTML = data?.length ? data.map(item => `
                <div class="bg-slate-800/50 p-4 rounded-xl flex justify-between items-center">
                    <div>
                        <p class="text-sm font-bold">${item.gudang_stok?.nama || 'Unknown'}</p>
                        <p class="text-xs text-slate-400">${item.type === 'in' ? '📥' : '📤'} ${item.jumlah} ${item.satuan || ''}</p>
                    </div>
                    <span class="text-xs ${item.type === 'in' ? 'text-green-400' : 'text-orange-400'}">
                        ${new Date(item.tanggal).toLocaleDateString('id-ID')}
                    </span>
                </div>
            `).join('') : '<p class="text-slate-500">Tidak ada data</p>';
        } catch (err) {
            container.innerHTML = '<p class="text-red-500">Gagal memuat</p>';
        }
    }

    // Modal functions
    window.openAddStockModal = () => {
        document.getElementById('add-stock-modal').classList.remove('hidden');
    };

    window.closeAddStockModal = () => {
        document.getElementById('add-stock-modal').classList.add('hidden');
    };

    window.quickAdjust = (id) => {
        prompt('Adjust stock (enter new value):');
        // Implement full edit modal if needed
    };

    // Initial load
    loadStock();
    loadStockHistory();
})();