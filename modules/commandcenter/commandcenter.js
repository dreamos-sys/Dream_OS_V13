alert('✅ commandcenter.js dimuat!');

(function() {
    const supabase = window.supabase;
    if (!supabase) {
        alert('❌ supabase tidak terdefinisi!');
        return;
    }

    // ========== TAB NAVIGATION ==========
    function initTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.tab-btn').forEach(b => {
                    b.classList.remove('active', 'text-purple-600', 'border-b-2', 'border-purple-600');
                    b.classList.add('text-gray-600', 'dark:text-gray-300');
                });
                this.classList.add('active', 'text-purple-600', 'border-b-2', 'border-purple-600');

                document.querySelectorAll('.tab-content').forEach(tc => tc.classList.add('hidden'));
                const tabId = this.dataset.tab;
                document.getElementById(`tab-${tabId}`).classList.remove('hidden');
            });
        });
    }

    // ========== LOAD STATISTIK ==========
    async function loadStats() {
        const { count: bookingCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending');
        document.getElementById('stat-booking').textContent = bookingCount || 0;

        const { count: k3Count } = await supabase.from('k3_reports').select('*', { count: 'exact', head: true }).eq('status', 'pending');
        document.getElementById('stat-k3').textContent = k3Count || 0;

        const { count: maintenanceCount } = await supabase.from('maintenance_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending');
        document.getElementById('stat-maintenance').textContent = maintenanceCount || 0;
    }

    // ========== LOAD APPROVAL ==========
    async function loadApprovals() {
        const bookingDiv = document.getElementById('approval-booking');
        const { data: bookings } = await supabase.from('bookings').select('id, nama, sarana, tanggal_mulai').eq('status', 'pending').limit(5);
        if (bookings?.length) {
            bookingDiv.innerHTML = bookings.map(b => `
                <div class="flex justify-between items-center border-b py-2">
                    <span>${b.nama} - ${b.sarana} (${b.tanggal_mulai})</span>
                    <div>
                        <button class="approve-booking text-green-500 mr-2" data-id="${b.id}">✅ Setuju</button>
                        <button class="reject-booking text-red-500" data-id="${b.id}">❌ Tolak</button>
                    </div>
                </div>
            `).join('');
        } else {
            bookingDiv.innerHTML = '<p class="opacity-60">Tidak ada pending booking</p>';
        }

        const k3Div = document.getElementById('approval-k3');
        const { data: k3s } = await supabase.from('k3_reports').select('id, tanggal, lokasi, jenis_laporan, pelapor').eq('status', 'pending').limit(5);
        if (k3s?.length) {
            k3Div.innerHTML = k3s.map(k => `
                <div class="flex justify-between items-center border-b py-2">
                    <span>${k.tanggal} - ${k.lokasi} (${k.jenis_laporan})</span>
                    <div>
                        <button class="approve-k3 text-green-500 mr-2" data-id="${k.id}">✅ Proses</button>
                        <button class="reject-k3 text-red-500" data-id="${k.id}">❌ Tolak</button>
                    </div>
                </div>
            `).join('');
        } else {
            k3Div.innerHTML = '<p class="opacity-60">Tidak ada pending K3</p>';
        }
    }

    // ========== LOAD SLIDE INFO ==========
    async function loadSlideInfo() {
        const { data } = await supabase.from('admin_info').select('slide_number, content').order('created_at', { ascending: false });
        if (data) {
            const slide5 = data.find(d => d.slide_number === 5);
            const slide6 = data.find(d => d.slide_number === 6);
            const slide7 = data.find(d => d.slide_number === 7);
            document.getElementById('preview-slide5').textContent = slide5?.content || '-';
            document.getElementById('preview-slide6').textContent = slide6?.content || '-';
            document.getElementById('preview-slide7').textContent = slide7?.content || '-';
        }
    }

    // ========== UPDATE SLIDE ==========
    document.getElementById('slideForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const slideNumber = parseInt(document.getElementById('slide_number').value);
        const content = document.getElementById('slide_content').value.trim();

        if (!content) {
            alert('Konten tidak boleh kosong');
            return;
        }

        const { error } = await supabase.from('admin_info').insert([{
            slide_number: slideNumber,
            content: content,
            created_by: 'Admin'
        }]);

        if (error) {
            alert('Gagal update slide: ' + error.message);
        } else {
            alert('Slide berhasil diupdate!');
            document.getElementById('slide_content').value = '';
            loadSlideInfo();
        }
    });

    // ========== APPROVAL HANDLERS ==========
    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('approve-booking')) {
            const id = e.target.dataset.id;
            await supabase.from('bookings').update({ status: 'approved' }).eq('id', id);
            loadApprovals();
            loadStats();
        }
        if (e.target.classList.contains('reject-booking')) {
            const id = e.target.dataset.id;
            await supabase.from('bookings').update({ status: 'rejected' }).eq('id', id);
            loadApprovals();
            loadStats();
        }
        if (e.target.classList.contains('approve-k3')) {
            const id = e.target.dataset.id;
            await supabase.from('k3_reports').update({ status: 'processed' }).eq('id', id);
            loadApprovals();
            loadStats();
        }
        if (e.target.classList.contains('reject-k3')) {
            const id = e.target.dataset.id;
            await supabase.from('k3_reports').update({ status: 'rejected' }).eq('id', id);
            loadApprovals();
            loadStats();
        }
    });

    // ========== INIT ==========
    initTabs();
    loadStats();
    loadApprovals();
    loadSlideInfo();
})();