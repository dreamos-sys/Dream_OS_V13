/**
 * 📅 DREAM OS v13.3 - BOOKING ENGINE (HIGH-END EDITION)
 * Logic Sakral: H-1, Jam Kerja 07:30-16:00, No Weekend.
 * Standards: ISO 27001, 9001
 */

(function() {
    const supabase = window.supabase;
    if (!supabase) {
        console.error('❌ Supabase not found! Pastikan script core sudah ter-load.');
        return;
    }

    // --- 1. HELPER: KONVERSI JAM KE DESIMAL ---
    function parseJam(jamStr) {
        if (!jamStr) return 0;
        const [h, m] = jamStr.split(':').map(Number);
        return h + (m / 60);
    }

    // --- 2. SISTEM ANTI-DOUBLE BOOKING (CONFLICT CHECKER) ---
    async function checkConflict(sarana, tanggal, jamMulai, jamSelesai) {
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('sarana', sarana)
            .eq('tanggal_mulai', tanggal)
            .neq('status', 'rejected'); 

        if (error) return false;

        const mulaiInput = parseJam(jamMulai);
        const selesaiInput = parseJam(jamSelesai);

        return data.find(b => {
            const bMulai = parseJam(b.jam_mulai);
            const bSelesai = parseJam(b.jam_selesai);
            // Logika Tabrakan: (Mulai < ExistingSelesai) && (Selesai > ExistingMulai)
            return (mulaiInput < bSelesai) && (selesaiInput > bMulai);
        });
    }

    // --- 3. VALIDASI ATURAN SAKRAL (THE CORE LOGIC) ---
    function validateRules(sarana, tgl, jamM, jamS) {
        const d = new Date(tgl);
        const hari = d.getDay(); // 0:Minggu, 6:Sabtu
        const jamMulai = parseJam(jamM);
        const jamSelesai = parseJam(jamS);

        // A. Validasi Minimal H-1
        const now = new Date();
        const inputDate = new Date(tgl);
        const diffDays = Math.floor((inputDate - now.setHours(0,0,0,0)) / (1000*60*60*24));
        if (diffDays < 1) return "Minimal booking H-1, Bro!";

        // B. Jam Kerja (07:30 - 16:00)
        if (jamMulai < 7.5 || jamSelesai > 16) return "Hanya melayani jam kerja (07:30-16:00)";

        // C. Aturan Weekend
        if (hari === 6 || hari === 0) return "Weekend? Hubungi Erwinsyah / Hanung Budianto S. E";

        // D. Maintenance Masjid
        if (sarana.includes("Masjid")) return "Masjid sedang maintenance.";

        return null; // Lolos Validasi
    }

    // --- 4. LOAD DROPDOWNS ---
    function initDropdowns() {
        const saranaSelect = document.getElementById('sarana');
        if (!saranaSelect) return;
        
        const saranaList = ['Aula SMP', 'Aula SMA', 'Saung Besar', 'Saung Kecil', 'Masjid', 'Serbaguna', 'Labkom SD', 'Labkom SMP', 'Labkom SMA', 'Lapangan Volley', 'Lapangan SMA', 'Perpus SMP'];
        saranaSelect.innerHTML = saranaList.map(v => `<option value="${v}">${v}</option>`).join('');
    }

    // --- 5. HANDLE SUBMIT (OPTIMISTIC & SECURE) ---
    const bForm = document.getElementById('bookingForm');
    if (bForm) {
        bForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const resDiv = document.getElementById('form-result');
            const submitBtn = e.target.querySelector('button[type="submit"]');

            // 1. Ambil Data
            const formData = {
                nama: document.getElementById('nama').value.trim(),
                sarana: document.getElementById('sarana').value,
                tgl: document.getElementById('tgl_mulai').value,
                jamM: document.getElementById('jam_mulai').value,
                jamS: document.getElementById('jam_selesai').value,
                keperluan: document.getElementById('keperluan').value
            };

            if (!formData.nama || !formData.tgl) return alert("Isi Nama & Tanggal!");

            // 2. Validasi Aturan
            const errorMsg = validateRules(formData.sarana, formData.tgl, formData.jamM, formData.jamS);
            if (errorMsg) {
                resDiv.innerHTML = `<span class="text-red-500">🚫 ${errorMsg}</span>`;
                return;
            }

            // 3. Cek Bentrok Jadwal
            resDiv.innerHTML = "🔍 Mengecek jadwal...";
            const conflict = await checkConflict(formData.sarana, formData.tgl, formData.jamM, formData.jamS);
            if (conflict) {
                resDiv.innerHTML = `<span class="text-red-500">❌ Bentrok dengan: ${conflict.nama}</span>`;
                return;
            }

            // 4. Kirim ke Supabase
            submitBtn.disabled = true;
            submitBtn.innerText = "MENGIRIM...";

            const { error } = await supabase.from('bookings').insert([{
                nama: formData.nama,
                sarana: formData.sarana,
                tanggal_mulai: formData.tgl,
                jam_mulai: formData.jamM,
                jam_selesai: formData.jamS,
                keperluan: formData.keperluan,
                status: 'pending'
            }]);

            if (!error) {
                resDiv.innerHTML = `<span class="text-green-500 font-black animate-bounce">✅ BERHASIL! Menunggu Approval Pak Hanung.</span>`;
                bForm.reset();
                setTimeout(() => { location.reload(); }, 2000);
            } else {
                resDiv.innerHTML = `<span class="text-red-500">Gagal: ${error.message}</span>`;
                submitBtn.disabled = false;
                submitBtn.innerText = "SUBMIT BOOKING";
            }
        });
    }

    // Booting Engine
    initDropdowns();
    console.log("💎 Dream OS Booking Engine v13.3 Online!");
})();
