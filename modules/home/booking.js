alert('✅ Dream OS Booking Engine v13.3 Loaded!');

(function() {
    const supabase = window.supabase;

    // --- Helper Jam ---
    function parseJam(jamStr) {
        if (!jamStr) return 0;
        const [h, m] = jamStr.split(':').map(Number);
        return h + (m / 60);
    }

    // --- 🛡️ SISTEM ANTI-DOUBLE BOOKING TERBAIK ---
    async function checkConflict(sarana, tanggal, jamMulai, jamSelesai) {
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('sarana', sarana)
            .eq('tanggal_mulai', tanggal)
            .neq('status', 'rejected'); // Abaikan yang sudah ditolak

        if (error) return false;

        const mulaiInput = parseJam(jamMulai);
        const selesaiInput = parseJam(jamSelesai);

        // Cari tabrakan jam
        const conflict = data.find(b => {
            const bMulai = parseJam(b.jam_mulai);
            const bSelesai = parseJam(b.jam_selesai);
            // Logika Tabrakan: (InputMulai < ExistingSelesai) && (InputSelesai > ExistingMulai)
            return (mulaiInput < bSelesai) && (selesaiInput > bMulai);
        });

        return conflict ? true : false;
    }

    // --- 🛡️ VALIDASI ATURAN KERJA ---
    function validateRules(sarana, tgl, jamM, jamS) {
        const d = new Date(tgl);
        const hari = d.getDay(); // 0:Minggu, 6:Sabtu, 5:Jumat
        const jamMulai = parseJam(jamM);
        const jamSelesai = parseJam(jamS);

        // 1. Cek Minimal H-1 & Jam Kerja Input
        const now = new Date();
        const inputDate = new Date(tgl);
        const diffDays = Math.floor((inputDate - now.setHours(0,0,0,0)) / (1000*60*60*24));

        if (diffDays < 1) return "Minimal booking H-1!";
        
        // 2. Cek Jam Kerja (07:30 - 16:00)
        if (jamMulai < 7.5 || jamSelesai > 16) return "Pemesanan diluar jam kerja (07:30-16:00)";

        // 3. Masjid Maintenance
        if (sarana.includes("Masjid")) return "Masjid sedang maintenance, tidak bisa dibooking.";

        // 4. Aturan Hari
        if (hari === 6 || hari === 0) return "Sabtu/Minggu Hubungi Erwinsyah / Hanung Budianto S. E";
        
        // 5. Aturan Khusus Jumat (Aula & Serbaguna)
        if (hari === 5) {
            if (sarana === "Aula SMP" || sarana === "Serbaguna") {
                // Tabrakan dengan waktu Shalat Jumat (10:30 - 13:00)
                if ((jamMulai < 13 && jamSelesai > 10.5)) {
                    return "Maaf, Aula/Serbaguna dipakai Shalat Jumat (10:30-13:00)";
                }
            }
        }

        return null; // Valid
    }

    // --- HANDLE SUBMIT ---
    document.getElementById('bookingForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const resDiv = document.getElementById('form-result');
        resDiv.innerHTML = '<span class="text-blue-500">🔍 Mengecek Jadwal...</span>';

        const sarana = document.getElementById('sarana').value;
        const tgl = document.getElementById('tgl_mulai').value;
        const jamM = document.getElementById('jam_mulai').value;
        const jamS = document.getElementById('jam_selesai').value;

        // Step 1: Validasi Aturan
        const ruleError = validateRules(sarana, tgl, jamM, jamS);
        if (ruleError) {
            resDiv.innerHTML = `<span class="text-red-500">🚫 ${ruleError}</span>`;
            return;
        }

        // Step 2: Cek Double Booking
        const isConflict = await checkConflict(sarana, tgl, jamM, jamS);
        if (isConflict) {
            resDiv.innerHTML = `<span class="text-red-500">🚫 Sarana sudah dibooking pada jam tersebut!</span>`;
            return;
        }

        // Step 3: Insert ke DB
        const formData = {
            nama: document.getElementById('nama').value,
            sarana: sarana,
            tanggal_mulai: tgl,
            jam_mulai: jamM,
            jam_selesai: jamS,
            unit_kerja: document.getElementById('unit_kerja').value,
            keperluan: document.getElementById('keperluan').value,
            no_hp: document.getElementById('no_hp').value,
            status: 'pending'
        };

        const { error } = await supabase.from('bookings').insert([formData]);
        if (error) {
            resDiv.innerHTML = `<span class="text-red-500">Gagal: ${error.message}</span>`;
        } else {
            resDiv.innerHTML = `<span class="text-green-500 animate-bounce">BERHASIL! ✅ Menunggu Approval...</span>`;
            e.target.reset();
            loadHistory();
        }
    });

    // --- LOAD DROPDOWNS & HISTORY (Simple) ---
    async function loadHistory() {
        const tbody = document.getElementById('history-table-body');
        const today = new Date().toISOString().split('T')[0];
        const { data } = await supabase.from('bookings').select('*').eq('tanggal_mulai', today).order('jam_mulai', {ascending: true});
        
        if (data) {
            tbody.innerHTML = data.map(b => `
                <tr class="border-b">
                    <td class="p-2 font-bold">${b.nama}</td>
                    <td class="p-2">${b.sarana}</td>
                    <td class="p-2">${b.jam_mulai} - ${b.jam_selesai}</td>
                    <td class="p-2"><span class="px-2 py-1 rounded text-[10px] bg-yellow-100 text-yellow-600 font-black uppercase">${b.status}</span></td>
                </tr>
            `).join('');
        }
    }

    // Init
    loadHistory();
    // Dropdown fill (simplified)
    const saranaList = ['Aula SMP', 'Aula SMA', 'Saung Besar', 'Saung Kecil', 'Masjid', 'Serbaguna', 'Labkom SD', 'Labkom SMP', 'Labkom SMA', 'Lapangan Volley', 'Lapangan Basket', 'Lapangan SMA', 'Lapangan Tanah', 'Kantin SMP', 'Kantin SMA', 'Perpus SD', 'Perpus SMP', 'Perpus SMA', 'Mushalla SMA'];
    const select = document.getElementById('sarana');
    saranaList.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s; opt.textContent = s;
        select.appendChild(opt);
    });

})();
