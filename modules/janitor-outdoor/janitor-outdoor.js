alert('✅ janitor-outdoor.js dimuat (versi lengkap)');

(function() {
    const supabase = window.supabase;
    if (!supabase) {
        alert('Supabase tidak terdefinisi');
        return;
    }

    const tabForm = document.getElementById('tab-form');
    const tabHistory = document.getElementById('tab-history');
    const tabSchedule = document.getElementById('tab-schedule');
    const panelForm = document.getElementById('panel-form');
    const panelHistory = document.getElementById('panel-history');
    const panelSchedule = document.getElementById('panel-schedule');

    function activateTab(active) {
        [tabForm, tabHistory, tabSchedule].forEach(t => t.classList.remove('active', 'border-cyan-500', 'text-cyan-600'));
        tabForm.classList.add('text-gray-500');
        tabHistory.classList.add('text-gray-500');
        tabSchedule.classList.add('text-gray-500');
        panelForm.classList.add('hidden');
        panelHistory.classList.add('hidden');
        panelSchedule.classList.add('hidden');

        if (active === 'form') {
            tabForm.classList.add('active', 'border-cyan-500', 'text-cyan-600');
            panelForm.classList.remove('hidden');
        } else if (active === 'history') {
            tabHistory.classList.add('active', 'border-cyan-500', 'text-cyan-600');
            panelHistory.classList.remove('hidden');
            loadHistory();
        } else if (active === 'schedule') {
            tabSchedule.classList.add('active', 'border-cyan-500', 'text-cyan-600');
            panelSchedule.classList.remove('hidden');
            loadSchedule();
        }
    }

    tabForm.addEventListener('click', () => activateTab('form'));
    tabHistory.addEventListener('click', () => activateTab('history'));
    tabSchedule.addEventListener('click', () => activateTab('schedule'));

    // ========== LOAD RIWAYAT ==========
    async function loadHistory() {
        const tbody = document.getElementById('history-body');
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4">⏳ Memuat...</td></tr>';

        try {
            const { data, error } = await supabase
                .from('janitor_outdoor')
                .select('id, tanggal, shift, petugas, area, status, created_at')
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;

            if (!data || data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 opacity-60">Belum ada data</td></tr>';
                return;
            }

            let html = '';
            data.forEach(item => {
                const statusClass = item.status === 'pending' ? 'text-yellow-600' : (item.status === 'verified' ? 'text-green-600' : 'text-blue-600');
                html += `
                    <tr class="border-b dark:border-gray-700">
                        <td class="px-2 py-2">${item.tanggal}</td>
                        <td class="px-2 py-2">${item.shift || '-'}</td>
                        <td class="px-2 py-2">${item.petugas}</td>
                        <td class="px-2 py-2">${item.area}</td>
                        <td class="px-2 py-2 ${statusClass}">${item.status}</td>
                        <td class="px-2 py-2">
                            <button onclick="viewDetail('${item.id}')" class="text-blue-500 text-xs">Detail</button>
                        </td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
        } catch (err) {
            console.error('Gagal load history:', err);
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-red-500">Gagal memuat</td></tr>';
        }
    }

    window.viewDetail = (id) => {
        alert('Fitur detail menyusul. ID: ' + id);
    };

    // ========== LOAD JADWAL (Sementara statis) ==========
    function loadSchedule() {
        const tbody = document.getElementById('schedule-body');
        tbody.innerHTML = `
            <tr><td>Senin</td><td>Joko</td><td>Rina</td><td>Agus</td></tr>
            <tr><td>Selasa</td><td>Joko</td><td>Rina</td><td>Agus</td></tr>
            <tr><td>Rabu</td><td>Joko</td><td>Rina</td><td>Agus</td></tr>
            <tr><td>Kamis</td><td>Joko</td><td>Rina</td><td>Agus</td></tr>
            <tr><td>Jumat</td><td>Joko</td><td>Rina</td><td>Agus</td></tr>
            <tr><td>Sabtu</td><td>Joko</td><td>Rina</td><td>Agus</td></tr>
            <tr><td>Minggu</td><td>Libur</td><td>Libur</td><td>Libur</td></tr>
        `;
    }

    // ========== SUBMIT FORM ==========
    document.getElementById('janitorOutdoorForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const tanggal = document.getElementById('tanggal').value;
        const shift = document.getElementById('shift').value;
        const petugas = document.getElementById('petugas').value;
        const area = document.getElementById('area').value;
        const catatan = document.getElementById('catatan').value;

        if (!tanggal || !petugas || !area) {
            document.getElementById('form-result').innerHTML = '<span class="text-red-500">Tanggal, Petugas, Area harus diisi!</span>';
            return;
        }

        // Kumpulkan item outdoor
        const items = {
            jalan_utama: document.getElementById('check_jalan_utama')?.checked || false,
            lorong: document.getElementById('check_lorong')?.checked || false,
            parkir_motor: document.getElementById('check_parkir_motor')?.checked || false,
            parkir_mobil: document.getElementById('check_parkir_mobil')?.checked || false,
            area_loby: document.getElementById('check_area_loby')?.checked || false,
            playground: document.getElementById('check_playground')?.checked || false,
            taman: document.getElementById('check_taman')?.checked || false,
            lapangan: document.getElementById('check_lapangan')?.checked || false,
            saluran: document.getElementById('check_saluran')?.checked || false,
            trotoar: document.getElementById('check_trotoar')?.checked || false,
            rumput: document.getElementById('check_rumput')?.checked || false,
            penyiraman: document.getElementById('check_penyiraman')?.checked || false,
            sampah: document.getElementById('check_sampah')?.checked || false,
            daun: document.getElementById('check_daun')?.checked || false
        };

        const formData = {
            tanggal,
            shift,
            petugas,
            area,
            items,
            catatan: catatan || null,
            foto_sebelum: null,
            foto_sesudah: null,
            status: 'pending'
        };

        const { error } = await supabase.from('janitor_outdoor').insert([formData]);
        const resultDiv = document.getElementById('form-result');

        if (error) {
            resultDiv.innerHTML = `<span class="text-red-500">Gagal: ${error.message}</span>`;
        } else {
            resultDiv.innerHTML = '<span class="text-green-500">Ceklis outdoor berhasil! ✅</span>';
            e.target.reset();
            setTimeout(() => resultDiv.innerHTML = '', 3000);
        }
    });

    document.getElementById('refresh-history').addEventListener('click', loadHistory);

    // ========== INIT ==========
    activateTab('form');
})();