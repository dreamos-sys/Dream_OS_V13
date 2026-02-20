alert('✅ k3-officer.js dimuat');

(function() {
    const supabase = window.supabase;
    if (!supabase) {
        alert('❌ supabase tidak terdefinisi!');
        return;
    }

    let currentTab = 'pending';

    // ========== LOAD REPORTS ==========
    async function loadReports(tab = 'pending') {
        const container = document.getElementById('reports-list');
        container.innerHTML = '<div class="text-center py-8">⏳ Memuat...</div>';

        try {
            let query = supabase
                .from('k3_reports')
                .select('id, tanggal, lokasi, jenis_laporan, deskripsi, pelapor, status, priority, created_at')
                .order('created_at', { ascending: false });

            if (tab === 'pending') {
                query = query.eq('status', 'pending');
            }

            const { data, error } = await query;
            if (error) throw error;

            if (!data || data.length === 0) {
                container.innerHTML = '<div class="text-center py-8 opacity-60">Tidak ada laporan</div>';
                return;
            }

            let html = '';
            data.forEach(report => {
                const jenisIcon = {
                    kerusakan: '🔧',
                    kehilangan: '🔒',
                    kebersihan: '🧹'
                }[report.jenis_laporan] || '📝';

                const priorityBadge = report.priority ? 
                    `<span class="text-xs px-2 py-1 rounded ${report.priority === 'tinggi' ? 'bg-red-200 text-red-800' : report.priority === 'normal' ? 'bg-yellow-200' : 'bg-green-200'}">${report.priority}</span>` : '';

                html += `
                    <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 ${report.status === 'pending' ? 'border-yellow-500' : 'border-green-500'}">
                        <div class="flex justify-between items-start">
                            <div>
                                <span class="text-sm opacity-60">${report.tanggal}</span>
                                <h3 class="font-semibold">${jenisIcon} ${report.lokasi}</h3>
                                <p class="text-sm">${report.deskripsi.substring(0, 100)}...</p>
                                <p class="text-xs mt-1">Pelapor: ${report.pelapor}</p>
                                ${priorityBadge}
                            </div>
                            <div>
                                ${report.status === 'pending' ? 
                                    `<button onclick="openVerifyModal('${report.id}')" class="bg-orange-500 text-white px-3 py-1 rounded text-sm">Verifikasi</button>` : 
                                    `<span class="text-green-600 text-sm">✓ Verified</span>`}
                            </div>
                        </div>
                    </div>
                `;
            });
            container.innerHTML = html;
        } catch (err) {
            console.error('Gagal load laporan', err);
            container.innerHTML = '<div class="text-center py-8 text-red-500">Gagal memuat data</div>';
        }
    }

    // ========== MODAL VERIFIKASI ==========
    window.openVerifyModal = (id) => {
        document.getElementById('verify-id').value = id;
        document.getElementById('verify-modal').classList.remove('hidden');
    };

    document.getElementById('verify-cancel')?.addEventListener('click', () => {
        document.getElementById('verify-modal').classList.add('hidden');
    });

    document.getElementById('verify-submit')?.addEventListener('click', async () => {
        const id = document.getElementById('verify-id').value;
        const priority = document.getElementById('verify-priority').value;
        const notes = document.getElementById('verify-notes').value;

        if (!id) return;

        // Update status k3_reports
        const { error } = await supabase
            .from('k3_reports')
            .update({ 
                status: 'verified', 
                priority, 
                verified_by: window.currentUser?.id || null,
                verified_notes: notes || null
            })
            .eq('id', id);

        if (error) {
            alert('Gagal verifikasi: ' + error.message);
        } else {
            // Ambil data laporan untuk dibuat task di departemen
            const { data: report } = await supabase
                .from('k3_reports')
                .select('*')
                .eq('id', id)
                .single();

            if (report) {
                // Buat task sesuai departemen tujuan
                await createDepartmentTask(report);
            }

            document.getElementById('verify-modal').classList.add('hidden');
            loadReports(currentTab);
        }
    });

    // ========== BUAT TASK DI DEPARTEMEN ==========
    async function createDepartmentTask(report) {
        const departemen = report.departemen_tujuan;
        const taskData = {
            k3_report_id: report.id,
            status: 'pending',
            deskripsi: report.deskripsi,
            lokasi: report.lokasi,
            priority: report.priority,
            pelapor: report.pelapor
        };

        if (departemen === 'maintenance') {
            // Insert ke maintenance_tasks
            await supabase.from('maintenance_tasks').insert([{
                ...taskData,
                kategori_kerusakan: report.kategori_kerusakan,
                teknisi_id: null
            }]);
        } else if (departemen === 'sekuriti') {
            // Nanti buat tabel sekuriti_tasks
            console.log('Task sekuriti dibuat', report.id);
        } else if (departemen === 'janitor') {
            // Nanti buat tabel janitor_tasks
            console.log('Task janitor dibuat', report.id);
        }
    }

    // ========== TAB SWITCHING ==========
    document.getElementById('tab-pending')?.addEventListener('click', () => {
        document.getElementById('tab-pending').classList.add('border-b-2', 'border-orange-500');
        document.getElementById('tab-all').classList.remove('border-b-2', 'border-orange-500');
        currentTab = 'pending';
        loadReports('pending');
    });

    document.getElementById('tab-all')?.addEventListener('click', () => {
        document.getElementById('tab-all').classList.add('border-b-2', 'border-orange-500');
        document.getElementById('tab-pending').classList.remove('border-b-2', 'border-orange-500');
        currentTab = 'all';
        loadReports('all');
    });

    // ========== INIT ==========
    loadReports('pending');
})();