/**
 * 📅 DREAM OS v13.4 - BOOKING ENGINE (REVISED)
 * Logic Sakral: H-1, Jam Kerja 07:30-16:00, No Weekend.
 */

(function() {
    const supabase = window.supabase;
    
    // --- 1. DATA MASTER ---
    const SARANA_LIST = [
        "Aula SMP - sound,lighting,ac,projector",
        "Aula SMA - sound, ac, projector",
        "Saung Besar - sound",
        "Saung Kecil",
        "Masjid - sound (Maintenance)",
        "Serbaguna - sound",
        "Labkom SD",
        "Labkom SMP",
        "Labkom SMA",
        "Lapangan Volley",
        "Lapangan Basket",
        "Lapangan SMA",
        "Lapangan Tanah",
        "Kantin SMP",
        "Kantin SMA",
        "Perpus SD",
        "Perpus SMP",
        "Perpus SMA",
        "Mushalla SMA"
    ];

    const ALAT_LIST = [
        { n: "Sound Portable", q: 4 },
        { n: "Projector", q: 6 },
        { n: "Standing Mic", q: 8 },
        { n: "Meja Panjang", q: 20 },
        { n: "Meja Siswa", q: 100 },
        { n: "Kursi Futura", q: 250 },
        { n: "Kursi Chitose", q: 150 },
        { n: "Taplak Meja", q: 40 },
        { n: "TV", q: 1 }
    ];

    // --- 2. INIT UI ---
    function initApp() {
        // Render Sarana
        const sSelect = document.getElementById('sarana');
        sSelect.innerHTML = SARANA_LIST.map(s => `<option value="${s}">${s}</option>`).join('');

        // Render Alat Checkboxes
        const aContainer = document.getElementById('alat-container');
        aContainer.innerHTML = ALAT_LIST.map((a, i) => `
            <div class="flex items-center gap-2">
                <input type="checkbox" id="alat-${i}" value="${a.n}" class="checkbox-item w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500">
                <label for="alat-${i}" class="text-[11px] text-slate-300">${a.n} (${a.q})</label>
            </div>
        `).join('');
    }

    function parseJam(jamStr) {
        const [h, m] = jamStr.split(':').map(Number);
        return h + (m / 60);
    }

    // --- 3. LOGIKA VALIDASI SAKRAL ---
    function validateRules(sarana, tgl, jamM, jamS) {
        const d = new Date(tgl);
        const hari = d.getDay(); 
        const jamMulai = parseJam(jamM);
        const jamSelesai = parseJam(jamS);

        // Minimal H-1
        const now = new Date();
        const inputDate = new Date(tgl);
        const diffDays = Math.floor((inputDate - now.setHours(0,0,0,0)) / (1000*60*60*24));
        if (diffDays < 1) return "Minimal booking H-1, Bro!";

        // Jam Kerja (07:30 - 16:00)
        if (jamMulai < 7.5 || jamSelesai > 16) return "Hanya melayani jam kerja (07:30-16:00)";

        // Aturan Weekend
        if (hari === 6 || hari === 0) return "Weekend? Hubungi Erwinsyah / Hanung Budianto S. E";

        // Maintenance Masjid
        if (sarana.includes("Masjid")) return "🚫 Masjid Maintenance! Ga bisa dipakai. 😎";

        return null;
    }

    // --- 4. HANDLE SUBMIT ---
    document.getElementById('bookingForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const resDiv = document.getElementById('form-result');
        
        // Ambil Alat yang dicentang
        const alatDipilih = [];
        ALAT_LIST.forEach((a, i) => {
            if(document.getElementById(`alat-${i}`).checked) alatDipilih.push(a.n);
        });

        const formData = {
            nama: document.getElementById('nama').value,
            divisi: document.getElementById('divisi').value,
            no_hp: document.getElementById('no_hp').value,
            sarana: document.getElementById('sarana').value,
            tgl: document.getElementById('tgl_mulai').value,
            jamM: document.getElementById('jam_mulai').value,
            jamS: document.getElementById('jam_selesai').value,
            alat: alatDipilih.join(', '),
            keperluan: document.getElementById('keperluan').value
        };

        const errorMsg = validateRules(formData.sarana, formData.tgl, formData.jamM, formData.jamS);
        if (errorMsg) {
            resDiv.innerHTML = `<span class="text-red-500">🚫 ${errorMsg}</span>`;
            return;
        }

        resDiv.innerHTML = "🔍 Memproses ke Command Center...";

        // Insert ke Supabase
        const { error } = await supabase.from('bookings').insert([{
            nama: formData.nama,
            divisi: formData.divisi,
            no_hp: formData.no_hp,
            sarana: formData.sarana,
            tanggal_mulai: formData.tgl,
            jam_mulai: formData.jamM,
            jam_selesai: formData.jamS,
            peralatan: formData.alat,
            keperluan: formData.keperluan,
            status: 'pending'
        }]);

        if (!error) {
            resDiv.innerHTML = `<span class="text-green-500 animate-pulse">✅ BERHASIL! Menunggu Approval Pak Hanung.</span>`;
            e.target.reset();
        } else {
            resDiv.innerHTML = `<span class="text-red-400">Error: ${error.message}</span>`;
        }
    });

    initApp();
    console.log("💎 Dream OS Booking Engine v13.4 Ready!");
})();
