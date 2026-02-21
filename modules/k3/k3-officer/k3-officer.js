alert('🛡️ K3 Officer Module Loaded – Smart Integration');

(function() {
    const supabase = window.supabase;
    if (!supabase) return alert('Supabase tidak tersedia');

    let currentTab = 'pending';

    // Load laporan
    async function loadReports(tab = 'pending') {
        const container = document.getElementById('reports-list');
        container.innerHTML = '<div class="text-center py-8 text-slate-500">⏳ Memuat...</div>';

        try {
            let query = supabase
                .from('k3_reports')
                .select('id, tanggal, lokasi, jenis_laporan, deskripsi, pelapor, status, priority, created_at')
                .order('created_at', { ascending: false });

            if (tab === 'pending') query = query.eq('status', 'pending');

            const { data, error } = await query;
            if (error) throw error;

            if (!data?.length) {
                container.innerHTML = '<div class="text-center py-8 text-slate-400">Tidak ada laporan</div>';
                return;
            }

            let html = '';
            data.forEach(report => {
                const icon = {
                    kerusakan: '🔧',
                    kehilangan: '🔒',
                    kebersihan: '🧹'
                }[report.jenis_laporan] || '📝';

                const priorityBadge = report.priority ?
                    `<span class="text-xs px-2 py-1 rounded-full ${report.priority === 'tinggi' ? 'bg-red-500/20 text-red-400' : report.priority === 'normal' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}">${report.priority}</span>` : '';

                html += `
                    <div class="glass-card p-4 rounded-xl border-l-4 ${report.status === 'pending' ? 'border-yellow-500' : 'border-green-500'}">
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="text-xs opacity-60">${report.tanggal}</span>
                                    ${priorityBadge}
                                </div>
                                <h3 class="font-semibold">${icon} ${report.lokasi}</h3>
                                <p class="text-sm text-slate-300">${report.deskripsi.substring(0,100)}...</p>
                                <p class="text-xs mt-1 text-slate-400">Pelapor: ${report.pelapor}</p>
                            </div>
                            <div>
                                ${report.status === 'pending' ?
                                    `<button onclick="openVerifyModal('${report.id}')" class="bg-orange-600 hover:bg-orange-500 text-white px-3 py-1 rounded text-sm transition">Verifikasi</button>` :
                                    `<span class="text-green-500 text-sm">✓ Verified</span>`}
                            </div>
                        </div>
                    </div>
                `;
            });
            container.innerHTML = html;
        } catch (err) {
            console.error(err);
            container.innerHTML = '<div class="text-center py-8 text-red-500">Error memuat data</div>';
        }
    }

    // Modal verifikasi
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
                priority: priority,
                verified_by: 'K3 Officer', // atau dari session
                verified_notes: notes || null
            })
            .eq('id', id);

        if (error) {
            alert('Gagal verifikasi: ' + error.message);
        } else {
            // Ambil data lengkap laporan
            const { data: report } = await supabase
                .from('k3_reports')
                .select('*')
                .eq('id', id)
                .single();

            if (report) {
                await createDepartmentTask(report);
            }

            document.getElementById('verify-modal').classList.add('hidden');
            loadReports(currentTab);
        }
    });

    // Buat task di departemen terkait
    async function createDepartmentTask(report) {
        const dept = report.departemen_tujuan;

        const taskData = {
            k3_report_id: report.id,
            status: 'pending',
            prioritas: report.priority || 'normal',
            deskripsi: report.deskripsi,
            lokasi: report.lokasi,
            pelapor: report.pelapor,
            created_at: new Date()
        };

        if (dept === 'maintenance') {
            // maintenance_tasks sudah ada
            const { error } = await supabase.from('maintenance_tasks').insert([taskData]);
            if (error) console.error('Gagal insert maintenance:', error);
            else console.log('✅ Task maintenance dibuat');
        }
        else if (dept === 'sekuriti') {
            // Buat tabel sekuriti_tasks dulu (SQL menyusul)
            const { error } = await supabase.from('sekuriti_tasks').insert([taskData]);
            if (error) console.error('Gagal insert sekuriti:', error);
            else console.log('✅ Task sekuriti dibuat');
        }
        else if (dept === 'janitor') {
            // Buat tabel janitor_tasks
            const { error } = await supabase.from('janitor_tasks').insert([{
                ...taskData,
                // bisa tambah field spesifik
            }]);
            if (error) console.error('Gagal insert janitor:', error);
            else console.log('✅ Task janitor dibuat');
        }
    }

    // Tab switching
    document.getElementById('tab-pending').addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active', 'bg-orange-600', 'text-white'));
        document.getElementById('tab-pending').classList.add('active', 'bg-orange-600', 'text-white');
        document.getElementById('tab-all').classList.remove('bg-orange-600', 'text-white');
        document.getElementById('tab-all').classList.add('bg-slate-800', 'text-slate-300');
        currentTab = 'pending';
        loadReports('pending');
    });

    document.getElementById('tab-all').addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active', 'bg-orange-600', 'text-white'));
        document.getElementById('tab-all').classList.add('active', 'bg-orange-600', 'text-white');
        document.getElementById('tab-pending').classList.remove('bg-orange-600', 'text-white');
        document.getElementById('tab-pending').classList.add('bg-slate-800', 'text-slate-300');
        currentTab = 'all';
        loadReports('all');
    });

    // Init
    loadReports('pending');
})();