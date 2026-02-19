alert('✅ booking.js dimuat (final)');

(function() {
    const supabase = window.supabase;

    // ========== PARSING JAM (DIPERBAIKI) ==========
    function parseJam(jamStr) {
        if (!jamStr) return null;
        // Hapus spasi, ganti titik atau koma dengan titik dua
        const cleaned = jamStr.replace(/\s+/g, '').replace(/[.,]/g, ':');
        const parts = cleaned.split(':').map(Number);
        if (parts.length < 2) return null;
        return parts[0] + (parts[1] / 60);
    }

    // ========== LOAD DROPDOWN ==========
    function loadDropdowns() {
        const saranaSelect = document.getElementById('sarana');
        const alatSelect = document.getElementById('alat_tambahan');
        if (!saranaSelect || !alatSelect) return;

        saranaSelect.innerHTML = '<option value="">Pilih Sarana</option>';
        alatSelect.innerHTML = '';

        const saranaList = ['Aula SMP', 'Aula SMA', 'Saung Besar', 'Saung Kecil', 'Masjid', 'Serbaguna', 'Labkom SD', 'Labkom SMP', 'Labkom SMA', 'Lapangan Volley', 'Lapangan Basket', 'Lapangan SMA', 'Lapangan Tanah', 'Kantin SMP', 'Kantin SMA', 'Perpus SD', 'Perpus SMP', 'Perpus SMA', 'Mushalla SMA'];
        saranaList.forEach(v => {
            const opt = document.createElement('option');
            opt.value = v; opt.textContent = v;
            saranaSelect.appendChild(opt);
        });

        const alatList = ['Sound Portable', 'Projector', 'Standing Mic', 'Meja Panjang', 'Meja Siswa', 'Kursi Futura', 'Kursi Chitose', 'Taplak Meja', 'TV'];
        alatList.forEach(v => {
            const opt = document.createElement('option');
            opt.value = v; opt.textContent = v;
            alatSelect.appendChild(opt);
        });
    }

    // ========== LOAD RIWAYAT ==========
    async function loadTodayHistory() {
        const tbody = document.getElementById('history-table-body');
        if (!tbody) return;

        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">⏳ Memuat...</td></tr>';

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

    // ========== VALIDASI (PAKAI PARSING JAM) ==========
    function isValidBooking(tanggal, jamMulai, jamSelesai, sarana) {
        const tgl = new Date(tanggal);
        const hari = tgl.getDay();

        // Aturan tanggal
        const today = new Date();
        today.setHours(0,0,0,0);
        const bookingDate = new Date(tanggal);
        bookingDate.setHours(0,0,0,0);
        const diffDays = Math.ceil((bookingDate - today) / (1000 * 60 * 60 * 24));

        if (diffDays < 1) return { valid: false, reason: 'Minimal H-1' };
        if (diffDays > 30) return { valid: false, reason: 'Maksimal 30 hari' };

        const hariIni = today.getDay();
        if (hariIni === 0 && diffDays !== 1) 
            return { valid: false, reason: 'Minggu hanya bisa booking untuk Senin' };

        if (hari === 0) return { valid: false, reason: 'Minggu libur' };
        if (hari === 6) return { valid: false, reason: 'Sabtu perlu ijin Kabag Umum' };

        if (!jamMulai || !jamSelesai) return { valid: false, reason: 'Jam harus diisi' };

        // GUNAKAN PARSING JAM YANG SUDAH DIPERBAIKI
        const mulai = parseJam(jamMulai);
        const selesai = parseJam(jamSelesai);

        if (mulai === null || selesai === null) {
            return { valid: false, reason: 'Format jam tidak valid' };
        }

        if (hari === 5) { // Jumat
            if (sarana.includes('Aula SMP') || sarana.includes('Serbaguna')) {
                if (mulai < 10.5 || selesai > 13.0) 
                    return { valid: false, reason: 'Aula/Serbaguna Jumat hanya 10:30-13:00' };
            } else {
                if (mulai < 7.5 || selesai > 16.0) 
                    return { valid: false, reason: 'Di luar jam kerja (07:30-16:00)' };
            }
        } else {
            if (mulai < 7.5 || selesai > 16.0) 
                return { valid: false, reason: 'Di luar jam kerja (07:30-16:00)' };
        }

        if (sarana.includes('Masjid')) 
            return { valid: false, reason: 'Masjid tidak untuk booking umum' };

        return { valid: true };
    }

    // ========== HANDLE SUBMIT ==========
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
            document.getElementById('form-result').innerHTML = '<span class="text-red-500">Nama, Sarana, Keperluan, Tanggal Mulai harus diisi!</span>';
            return;
        }

        const valid = isValidBooking(tgl_mulai, jam_mulai, jam_selesai, sarana);
        if (!valid.valid) {
            document.getElementById('form-result').innerHTML = `<span class="text-red-500">${valid.reason}</span>`;
            return;
        }

        const formData = {
            nama, no_hp: no_hp || null, unit_kerja: unit_kerja || null, sarana, keperluan,
            tanggal_mulai: tgl_mulai, tanggal_selesai: tgl_selesai || null,
            jam_mulai: jam_mulai || null, jam_selesai: jam_selesai || null,
            alat_tambahan: alat_tambahan || null, catatan: catatan || null,
            status: 'pending'
        };

        const { error } = await supabase.from('bookings').insert([formData]);
        const resultDiv = document.getElementById('form-result');

        if (error) {
            resultDiv.innerHTML = `<span class="text-red-500">Gagal: ${error.message}</span>`;
        } else {
            resultDiv.innerHTML = '<span class="text-green-500">Booking berhasil! ✅</span>';
            e.target.reset();
            loadTodayHistory();
            setTimeout(() => resultDiv.innerHTML = '', 3000);
        }
    });

    // ========== REFRESH ==========
    document.getElementById('refresh-history').addEventListener('click', loadTodayHistory);

    // ========== INIT ==========
    loadDropdowns();
    loadTodayHistory();

    // CSS paksa (opsional, bisa dihapus nanti)
    const style = document.createElement('style');
    style.textContent = `
        #sarana, #alat_tambahan {
            background-color: white !important;
            color: black !important;
            border: 2px solid #3b82f6 !important;
        }
        .dark #sarana, .dark #alat_tambahan {
            background-color: #1f2937 !important;
            color: white !important;
            border-color: #fbbf24 !important;
        }
    `;
    document.head.appendChild(style);
})();