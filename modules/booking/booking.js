import { supabase } from '../../lib/supabaseClient.js';

// ========== LOAD DROPDOWN OPTIONS ==========
function loadDropdowns() {
    // Sarana
    const saranaSelect = document.getElementById('sarana');
    const saranaOptions = ['Aula SMP', 'Aula SMA', 'Sound Portable 1', 'Sound Portable 2', 'Proyektor', 'Laptop'];
    saranaOptions.forEach(value => {
        const opt = document.createElement('option');
        opt.value = value;
        opt.textContent = value;
        saranaSelect.appendChild(opt);
    });

    // Alat tambahan
    const alatSelect = document.getElementById('alat_tambahan');
    const alatOptions = ['Mic Wireless', 'Kabel Roll', 'Kursi Tambahan', 'Meja Lipat', 'Whiteboard'];
    alatOptions.forEach(value => {
        const opt = document.createElement('option');
        opt.value = value;
        opt.textContent = value;
        alatSelect.appendChild(opt);
    });
}

// ========== LOAD RIWAYAT HARI INI ==========
async function loadTodayHistory() {
    const tbody = document.getElementById('history-table-body');
    const today = new Date().toISOString().split('T')[0];

    try {
        const { data, error } = await supabase
            .from('bookings')
            .select('nama, sarana, jam_mulai, jam_selesai, status')
            .eq('tanggal_mulai', today)
            .order('jam_mulai', { ascending: true });

        if (error) throw error;

        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 opacity-60">Belum ada booking hari ini</td></tr>';
            return;
        }

        let html = '';
        data.forEach((item, index) => {
            const jam = item.jam_mulai 
                ? item.jam_mulai.slice(0,5) + (item.jam_selesai ? ' - ' + item.jam_selesai.slice(0,5) : '') 
                : '-';
            const statusClass = item.status === 'pending' ? 'text-yellow-600' : 'text-green-600';
            html += `
                <tr class="border-b dark:border-gray-700">
                    <td class="px-2 py-2">${index + 1}</td>
                    <td class="px-2 py-2">${item.nama || '-'}</td>
                    <td class="px-2 py-2">${item.sarana || '-'}</td>
                    <td class="px-2 py-2">${jam}</td>
                    <td class="px-2 py-2 ${statusClass}">${item.status || 'pending'}</td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    } catch (err) {
        console.error('Gagal memuat riwayat:', err);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-red-500">Gagal memuat data</td></tr>';
    }
}

// ========== HANDLE SUBMIT FORM ==========
document.getElementById('bookingForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nama = document.getElementById('nama').value.trim();
    const no_hp = document.getElementById('no_hp').value.trim();
    const unit_kerja = document.getElementById('unit_kerja').value.trim();
    const sarana = document.getElementById('sarana').value;
    const keperluan = document.getElementById('keperluan').value.trim();
    const tgl_mulai = document.getElementById('tgl_mulai').value;
    const tgl_selesai = document.getElementById('tgl_selesai').value;
    const jam_mulai = document.getElementById('jam_mulai').value;
    const jam_selesai = document.getElementById('jam_selesai').value;
    const alatSelect = document.getElementById('alat_tambahan');
    const alat_tambahan = Array.from(alatSelect.selectedOptions).map(opt => opt.value).join(', ');
    const catatan = document.getElementById('catatan').value.trim();

    // Validasi
    if (!nama || !sarana || !keperluan || !tgl_mulai) {
        document.getElementById('form-result').innerHTML = '<span class="text-red-500">Nama, Sarana, Keperluan, dan Tanggal Mulai harus diisi!</span>';
        return;
    }

    const formData = {
        nama,
        no_hp: no_hp || null,
        unit_kerja: unit_kerja || null,
        sarana,
        keperluan,
        tanggal_mulai: tgl_mulai,
        tanggal_selesai: tgl_selesai || null,
        jam_mulai: jam_mulai || null,
        jam_selesai: jam_selesai || null,
        alat_tambahan: alat_tambahan || null,
        catatan: catatan || null,
        status: 'pending'
    };

    const { error } = await supabase.from('bookings').insert([formData]);
    const resultDiv = document.getElementById('form-result');

    if (error) {
        resultDiv.innerHTML = `<span class="text-red-500">Gagal: ${error.message}</span>`;
    } else {
        resultDiv.innerHTML = '<span class="text-green-500">Booking berhasil! ✅</span>';
        e.target.reset();
        await loadTodayHistory();
        setTimeout(() => resultDiv.innerHTML = '', 3000);
    }
});

// ========== REFRESH RIWAYAT ==========
document.getElementById('refresh-history').addEventListener('click', loadTodayHistory);

// ========== INIT ==========
loadDropdowns();
loadTodayHistory();
