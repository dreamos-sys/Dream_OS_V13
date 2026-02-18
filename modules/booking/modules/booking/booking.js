import { supabase } from '../../lib/supabaseClient.js';
import { CONFIG } from '../../config.js';
import { log } from '../../lib/logger.js';

// ========== LOAD DROPDOWN OPTIONS ==========
function loadDropdowns() {
    // SARANA (19 pilihan)
    const saranaSelect = document.getElementById('sarana');
    const saranaOptions = [
        'Aula SMP', 'Aula SMA', 'Saung Besar', 'Saung Kecil', 
        'Masjid', 'Serbaguna', 'Labkom SD', 'Labkom SMP', 'Labkom SMA',
        'Lapangan Volley', 'Lapangan Basket', 'Lapangan SMA', 'Lapangan Tanah',
        'Kantin SMP', 'Kantin SMA', 'Perpus SD', 'Perpus SMP', 'Perpus SMA',
        'Mushalla SMA'
    ];
    saranaOptions.forEach(value => {
        const opt = document.createElement('option');
        opt.value = value;
        opt.textContent = value;
        saranaSelect.appendChild(opt);
    });

    // ALAT TAMBAHAN (9 pilihan)
    const alatSelect = document.getElementById('alat_tambahan');
    const alatOptions = [
        'Sound Portable', 'Projector', 'Standing Mic', 
        'Meja Panjang', 'Meja Siswa', 'Kursi Futura', 'Kursi Chitose',
        'Taplak Meja', 'TV'
    ];
    alatOptions.forEach(value => {
        const opt = document.createElement('option');
        opt.value = value;
        opt.textContent = value;
        alatSelect.appendChild(opt);
    });
}

// ========== VALIDASI ATURAN BOOKING ==========
function isValidBooking(tanggal, jamMulai, jamSelesai, sarana) {
    const tgl = new Date(tanggal);
    const hari = tgl.getDay();

    // CEK ATURAN TANGGAL (H-1 & MAKSIMAL 30 HARI)
    const today = new Date();
    today.setHours(0,0,0,0);
    const bookingDate = new Date(tanggal);
    bookingDate.setHours(0,0,0,0);
    const diffDays = Math.ceil((bookingDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 1) {
        return { valid: false, reason: 'Booking harus dilakukan minimal sehari sebelum tanggal pemakaian (H-1)' };
    }
    if (diffDays > 30) {
        return { valid: false, reason: 'Booking maksimal 30 hari ke depan' };
    }

    // KHUSUS HARI MINGGU
    const hariIni = today.getDay();
    if (hariIni === 0) {
        if (diffDays !== 1) {
            return { valid: false, reason: 'Hari Minggu hanya bisa booking untuk hari Senin' };
        }
    }

    // ATURAN HARI KERJA
    if (hari === 0) {
        return { valid: false, reason: 'Hari Minggu libur, tidak bisa booking' };
    }
    if (hari === 6) {
        return { valid: false, reason: 'Hari Sabtu hanya bisa dengan persetujuan Kabag Umum' };
    }

    // CEK JAM KERJA
    if (!jamMulai || !jamSelesai) {
        return { valid: false, reason: 'Jam mulai dan selesai harus diisi' };
    }

    const mulai = parseFloat(jamMulai.replace(':', '.'));
    const selesai = parseFloat(jamSelesai.replace(':', '.'));

    // ATURAN KHUSUS JUMAT UNTUK AULA SMP & SERBAGUNA
    if (hari === 5) {
        if (sarana.includes('Aula SMP') || sarana.includes('Serbaguna')) {
            if (mulai < 10.5 || selesai > 13.0) {
                return { valid: false, reason: 'Khusus Jumat, Aula SMP & Serbaguna hanya tersedia 10:30 - 13:00 (persiapan shalat)' };
            }
        } else {
            if (mulai < CONFIG.workHours.start || selesai > CONFIG.workHours.end) {
                return { valid: false, reason: 'Di luar jam kerja (07:30 - 16:00)' };
            }
        }
    } else {
        if (mulai < CONFIG.workHours.start || selesai > CONFIG.workHours.end) {
            return { valid: false, reason: 'Di luar jam kerja (07:30 - 16:00)' };
        }
    }

    // SARANA MASJID TIDAK BOLEH DIBOOKING
    if (sarana.includes('Masjid')) {
        return { valid: false, reason: 'Masjid tidak tersedia untuk booking umum (khusus maintenance)' };
    }

    return { valid: true };
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
        log.error('Gagal memuat riwayat', err);
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

    if (!nama || !sarana || !keperluan || !tgl_mulai) {
        document.getElementById('form-result').innerHTML = '<span class="text-red-500">Nama, Sarana, Keperluan, dan Tanggal Mulai harus diisi!</span>';
        return;
    }

    const valid = isValidBooking(tgl_mulai, jam_mulai, jam_selesai, sarana);
    if (!valid.valid) {
        document.getElementById('form-result').innerHTML = `<span class="text-red-500">${valid.reason}</span>`;
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
        log.error('Gagal insert booking', error);
        resultDiv.innerHTML = `<span class="text-red-500">Gagal: ${error.message}</span>`;
    } else {
        log.info('Booking berhasil', formData);
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