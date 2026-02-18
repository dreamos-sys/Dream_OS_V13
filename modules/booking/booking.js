import { supabase } from '../../lib/supabaseClient.js';
import { CONFIG } from '../../config.js';
import { log } from '../../lib/logger.js';

function loadDropdowns() {
    const saranaSelect = document.getElementById('sarana');
    ['Aula SMP','Aula SMA','Sound Portable','Proyektor','Laptop'].forEach(v => {
        const opt = document.createElement('option');
        opt.value = v; opt.textContent = v; saranaSelect.appendChild(opt);
    });
}

function isValidBooking(tanggal, jamMulai, jamSelesai, sarana) {
    const tgl = new Date(tanggal);
    const hari = tgl.getDay();
    if (!CONFIG.workDays.includes(hari)) return { valid: false, reason: 'Hari libur' };
    if (!jamMulai || !jamSelesai) return { valid: false, reason: 'Jam harus diisi' };
    const mulai = parseFloat(jamMulai.replace(':', '.'));
    const selesai = parseFloat(jamSelesai.replace(':', '.'));
    if (mulai < CONFIG.workHours.start || selesai > CONFIG.workHours.end) 
        return { valid: false, reason: 'Di luar jam kerja' };
    if (hari === 5 && sarana.includes('Aula')) {
        if (mulai < CONFIG.fridayRules.aula.start || selesai > CONFIG.fridayRules.aula.end)
            return { valid: false, reason: 'Khusus Jumat, aula 10:30-13:00' };
    }
    return { valid: true };
}

async function loadTodayHistory() {
    const tbody = document.getElementById('history-table-body');
    if (!tbody) return;
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase.from('bookings').select('nama,sarana,jam_mulai,jam_selesai,status').eq('tanggal_mulai', today);
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">Belum ada booking</td></tr>';
    } else {
        let html = '';
        data.forEach((item, i) => {
            const jam = item.jam_mulai ? item.jam_mulai.slice(0,5) + (item.jam_selesai ? ' - ' + item.jam_selesai.slice(0,5) : '') : '-';
            html += `<tr><td>${i+1}</td><td>${item.nama}</td><td>${item.sarana}</td><td>${jam}</td><td>${item.status}</td></tr>`;
        });
        tbody.innerHTML = html;
    }
}

document.getElementById('bookingForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nama = document.getElementById('nama').value.trim();
    const sarana = document.getElementById('sarana').value;
    const tgl_mulai = document.getElementById('tgl_mulai').value;
    const jam_mulai = document.getElementById('jam_mulai').value;
    const jam_selesai = document.getElementById('jam_selesai').value;
    const valid = isValidBooking(tgl_mulai, jam_mulai, jam_selesai, sarana);
    if (!valid.valid) {
        document.getElementById('form-result').innerHTML = `<span class="text-red-500">${valid.reason}</span>`;
        return;
    }
    const formData = { nama, sarana, tanggal_mulai: tgl_mulai, jam_mulai, jam_selesai, status: 'pending' };
    const { error } = await supabase.from('bookings').insert([formData]);
    if (error) {
        document.getElementById('form-result').innerHTML = `<span class="text-red-500">Gagal: ${error.message}</span>`;
    } else {
        document.getElementById('form-result').innerHTML = '<span class="text-green-500">Booking berhasil!</span>';
        e.target.reset();
        loadTodayHistory();
    }
});

loadDropdowns();
loadTodayHistory();
