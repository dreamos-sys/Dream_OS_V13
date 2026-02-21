alert('📸 K3 Module Loaded – Smart Version');

(function() {
    const supabase = window.supabase;
    if (!supabase) return alert('Supabase tidak tersedia');

    // Elemen dinamis
    const jenisSelect = document.getElementById('jenis_laporan');
    const dynamicFields = document.getElementById('dynamic-fields');

    // Template field untuk setiap jenis
    const fieldTemplates = {
        kerusakan: `
            <div class="field-section space-y-3 border-l-4 border-orange-400 pl-4 py-2 bg-slate-800/50 rounded-r-xl">
                <h4 class="font-semibold text-orange-400">🔧 Detail Kerusakan</h4>
                <div>
                    <label class="text-xs font-mono text-slate-400">Kategori Kerusakan</label>
                    <input type="text" id="kategori_kerusakan" placeholder="Contoh: Listrik, Plumbing" class="w-full p-2 rounded-lg bg-slate-700 border border-slate-600">
                </div>
                <div>
                    <label class="text-xs font-mono text-slate-400">Prioritas</label>
                    <select id="priority" class="w-full p-2 rounded-lg bg-slate-700 border border-slate-600">
                        <option value="rendah">Rendah</option>
                        <option value="normal" selected>Normal</option>
                        <option value="tinggi">Tinggi</option>
                    </select>
                </div>
            </div>
        `,
        kehilangan: `
            <div class="field-section space-y-3 border-l-4 border-blue-400 pl-4 py-2 bg-slate-800/50 rounded-r-xl">
                <h4 class="font-semibold text-blue-400">🔒 Detail Kehilangan</h4>
                <div>
                    <label class="text-xs font-mono text-slate-400">Barang Hilang</label>
                    <input type="text" id="barang_hilang" placeholder="Sebutkan barang" class="w-full p-2 rounded-lg bg-slate-700 border border-slate-600">
                </div>
                <div>
                    <label class="text-xs font-mono text-slate-400">Estimasi Nilai (Rp)</label>
                    <input type="number" id="nilai_estimasi" placeholder="Contoh: 500000" class="w-full p-2 rounded-lg bg-slate-700 border border-slate-600">
                </div>
            </div>
        `,
        kebersihan: `
            <div class="field-section space-y-3 border-l-4 border-green-400 pl-4 py-2 bg-slate-800/50 rounded-r-xl">
                <h4 class="font-semibold text-green-400">🧹 Detail Kebersihan</h4>
                <div>
                    <label class="text-xs font-mono text-slate-400">Area Kebersihan</label>
                    <input type="text" id="area_kebersihan" placeholder="Contoh: Toilet, Koridor" class="w-full p-2 rounded-lg bg-slate-700 border border-slate-600">
                </div>
                <div>
                    <label class="text-xs font-mono text-slate-400">Tingkat Kekotoran</label>
                    <select id="tingkat_kekotoran" class="w-full p-2 rounded-lg bg-slate-700 border border-slate-600">
                        <option value="ringan">Ringan</option>
                        <option value="sedang">Sedang</option>
                        <option value="berat">Berat</option>
                    </select>
                </div>
            </div>
        `
    };

    // Toggle field berdasarkan jenis
    function toggleFields() {
        const jenis = jenisSelect.value;
        dynamicFields.innerHTML = fieldTemplates[jenis] || '';
    }
    jenisSelect.addEventListener('change', toggleFields);
    toggleFields(); // inisialisasi

    // Fungsi kamera (global)
    window.openK3Camera = function() {
        if (typeof DreamOSCamera !== 'undefined') {
            DreamOSCamera.openCamera('k3', (photoData) => {
                // Tampilkan preview
                const preview = document.getElementById('k3PhotoPreview');
                preview.innerHTML = `<img src="${photoData}" class="max-w-full max-h-40 rounded-lg">`;
                document.getElementById('k3PhotoData').value = photoData;
            });
        } else {
            alert('Sistem kamera tidak tersedia');
        }
    };

    // Submit form
    document.getElementById('k3Form').addEventListener('submit', async (e) => {
        e.preventDefault();

        // Data dasar
        const formData = {
            tanggal: document.getElementById('tanggal').value,
            waktu: document.getElementById('waktu').value || null,
            lokasi: document.getElementById('lokasi').value,
            jenis_laporan: jenisSelect.value,
            deskripsi: document.getElementById('deskripsi').value,
            pelapor: document.getElementById('pelapor').value,
            no_hp: document.getElementById('no_hp').value || null,
            korban: document.getElementById('korban').value || null,
            tindakan: document.getElementById('tindakan').value || null,
            priority: null, // default
            // field tambahan akan diisi dari dynamic
        };

        // Validasi dasar
        if (!formData.tanggal || !formData.lokasi || !formData.jenis_laporan || !formData.deskripsi || !formData.pelapor) {
            document.getElementById('form-result').innerHTML = '<span class="text-red-500">Harap isi semua field wajib!</span>';
            return;
        }

        // Ambil field khusus berdasarkan jenis
        if (formData.jenis_laporan === 'kerusakan') {
            formData.kategori_kerusakan = document.getElementById('kategori_kerusakan')?.value || null;
            formData.priority = document.getElementById('priority')?.value || 'normal';
        } else if (formData.jenis_laporan === 'kehilangan') {
            formData.barang_hilang = document.getElementById('barang_hilang')?.value || null;
            formData.nilai_estimasi = document.getElementById('nilai_estimasi')?.value || null;
            formData.priority = 'normal'; // kehilangan tidak punya prioritas, set default
        } else if (formData.jenis_laporan === 'kebersihan') {
            formData.area_kebersihan = document.getElementById('area_kebersihan')?.value || null;
            formData.tingkat_kekotoran = document.getElementById('tingkat_kekotoran')?.value || null;
            formData.priority = 'normal';
        }

        // Departemen tujuan
        const departemenMap = {
            kerusakan: 'maintenance',
            kehilangan: 'sekuriti',
            kebersihan: 'janitor'
        };
        formData.departemen_tujuan = departemenMap[formData.jenis_laporan];

        // Foto dari kamera
        const photoData = document.getElementById('k3PhotoData').value;
        if (photoData) {
            // Simpan ke storage nanti, untuk sementara kita simpan sebagai data URL
            // Idealnya upload ke Supabase Storage
            formData.foto_url = [photoData]; // array
        }

        // Insert ke database
        const { error } = await supabase.from('k3_reports').insert([formData]);
        const resultDiv = document.getElementById('form-result');

        if (error) {
            resultDiv.innerHTML = `<span class="text-red-500">Gagal: ${error.message}</span>`;
        } else {
            resultDiv.innerHTML = '<span class="text-green-500 animate-pulse">✅ Laporan K3 berhasil!</span>';
            e.target.reset();
            dynamicFields.innerHTML = ''; // reset dinamis
            toggleFields(); // kembalikan ke default
            document.getElementById('k3PhotoPreview').innerHTML = '<span class="text-slate-400">Belum ada foto</span>';
            document.getElementById('k3PhotoData').value = '';
            loadTodayHistory();
            setTimeout(() => resultDiv.innerHTML = '', 3000);
        }
    });

    // Load riwayat hari ini
    async function loadTodayHistory() {
        const tbody = document.getElementById('history-table-body');
        if (!tbody) return;
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4">⏳ Memuat...</td></tr>';

        const today = new Date().toISOString().split('T')[0];
        try {
            const { data, error } = await supabase
                .from('k3_reports')
                .select('tanggal, lokasi, jenis_laporan, pelapor, status')
                .eq('tanggal', today)
                .order('created_at', { ascending: false });
            if (error) throw error;

            if (!data?.length) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 opacity-60">Belum ada laporan hari ini</td></tr>';
                return;
            }

            let html = '';
            data.forEach((item, idx) => {
                const icon = {
                    kerusakan: '🔧',
                    kehilangan: '🔒',
                    kebersihan: '🧹'
                }[item.jenis_laporan] || '📝';
                html += `<tr class="border-b border-slate-700">
                    <td class="p-2">${idx+1}</td>
                    <td class="p-2">${item.tanggal}</td>
                    <td class="p-2">${item.lokasi}</td>
                    <td class="p-2">${icon} ${item.jenis_laporan}</td>
                    <td class="p-2">${item.pelapor}</td>
                    <td class="p-2 ${item.status === 'pending' ? 'text-yellow-500' : 'text-green-500'}">${item.status}</td>
                </tr>`;
            });
            tbody.innerHTML = html;
        } catch (err) {
            console.error(err);
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-red-500">Gagal memuat</td></tr>';
        }
    }

    // Refresh manual
    document.getElementById('refresh-history')?.addEventListener('click', loadTodayHistory);

    // Initial load
    loadTodayHistory();
})();