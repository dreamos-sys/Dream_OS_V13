/**
 * 📅 DREAM OS v13.4 - SMART LOGIC ENGINE
 * Feature: Auto-Approval & Overlap Detection
 */

// --- CONFIG SUPABASE (Ganti dengan Key Antum, My Bro) ---
const SUPABASE_URL = "URL_SUPABASE_ANTUM";
const SUPABASE_KEY = "KEY_ANON_ANTUM";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- DATA MASTER ---
const SARANA_LIST = [
    "Aula SMP", "Aula SMA", "Saung Besar", "Saung Kecil", 
    "Masjid (Maintenance)", "Serbaguna", "Labkom SD", "Labkom SMP", 
    "Labkom SMA", "Lapangan Volley", "Lapangan Basket", "Lapangan SMA",
    "Lapangan Tanah", "Kantin SMP", "Kantin SMA", "Perpus SD", "Perpus SMP", "Perpus SMA"
];

const ALAT_LIST = [
    "Sound Portable", "Projector", "Standing Mic", "Meja Panjang", 
    "Meja Siswa", "Kursi Futura", "Kursi Chitose", "Taplak Meja"
];

// --- INITIALIZE UI ---
function initApp() {
    const sSelect = document.getElementById('sarana');
    sSelect.innerHTML = SARANA_LIST.map(s => `<option value="${s}">${s}</option>`).join('');

    const aContainer = document.getElementById('alat-container');
    aContainer.innerHTML = ALAT_LIST.map((a, i) => `
        <div class="flex items-center gap-2">
            <input type="checkbox" id="alat-${i}" value="${a}" class="w-4 h-4 accent-purple-500">
            <label for="alat-${i}" class="text-[11px] text-slate-300 cursor-pointer">${a}</label>
        </div>
    `).join('');
}

// --- VALIDASI ATURAN SAKRAL ---
function validateRules(sarana, tgl, jamM, jamS) {
    const d = new Date(tgl);
    const hari = d.getDay(); 
    const now = new Date();
    now.setHours(0,0,0,0);
    const inputDate = new Date(tgl);
    
    // 1. H-1 Check
    const diffDays = Math.floor((inputDate - now) / (1000 * 60 * 60 * 24));
    if (diffDays < 1) return "Minimal booking H-1, My Bro!";

    // 2. Jam Kerja (07:30 - 16:00)
    if (jamM < "07:30" || jamS > "16:00") return "Hanya melayani jam kerja (07:30 - 16:00)";
    if (jamM >= jamS) return "Jam Selesai harus lebih besar dari Jam Mulai!";

    // 3. Weekend Check
    if (hari === 6 || hari === 0) return "Weekend? Silakan hubungi Pak Erwinsyah / Pak Hanung secara langsung.";

    // 4. Maintenance Check
    if (sarana.toLowerCase().includes("masjid")) return "🚫 Masjid sedang Maintenance!";

    return null;
}

// --- CORE ENGINE: HANDLE SUBMIT ---
document.getElementById('bookingForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const resDiv = document.getElementById('form-result');
    const submitBtn = document.getElementById('submitBtn');

    // Ambil Data
    const alatTerpilih = [];
    ALAT_LIST.forEach((a, i) => {
        if(document.getElementById(`alat-${i}`).checked) alatTerpilih.push(a);
    });

    const formData = {
        nama: document.getElementById('nama').value,
        divisi: document.getElementById('divisi').value,
        no_hp: document.getElementById('no_hp').value,
        sarana: document.getElementById('sarana').value,
        tgl: document.getElementById('tgl_mulai').value,
        jamM: document.getElementById('jam_mulai').value,
        jamS: document.getElementById('jam_selesai').value,
        alat: alatTerpilih.join(', '),
        keperluan: document.getElementById('keperluan').value
    };

    // 1. Validasi Aturan
    const errorMsg = validateRules(formData.sarana, formData.tgl, formData.jamM, formData.jamS);
    if (errorMsg) {
        resDiv.innerHTML = `<span class="text-red-400 font-bold">🚫 ${errorMsg}</span>`;
        return;
    }

    // Start Processing
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-50');
    resDiv.innerHTML = `<div class="flex items-center gap-2 text-blue-400 font-bold animate-pulse">
        <span>⚡</span> Menjalankan Deteksi Overlap...
    </div>`;

    try {
        // 2. DETEKSI DOUBLE BOOKING
        const { data: existing, error: checkError } = await supabase
            .from('bookings')
            .select('jam_mulai, jam_selesai')
            .eq('sarana', formData.sarana)
            .eq('tanggal_mulai', formData.tgl)
            .eq('status', 'approved');

        if (checkError) throw checkError;

        let isBentrok = false;
        for (const b of existing) {
            // Logika Overlap: (MulaiA < SelesaiB) && (SelesaiA > MulaiB)
            if (formData.jamM < b.jam_selesai && formData.jamS > b.jam_mulai) {
                isBentrok = true;
                break;
            }
        }

        // 3. Tentukan Status & Catatan
        const finalStatus = isBentrok ? 'pending' : 'approved';
        const note = isBentrok ? 'Conflict detected - Manual review required' : 'Auto-approved by Dream Engine';

        // 4. Insert ke Database
        const { error: insertError } = await supabase.from('bookings').insert([{
            nama: formData.nama,
            divisi: formData.divisi,
            no_hp: formData.no_hp,
            sarana: formData.sarana,
            tanggal_mulai: formData.tgl,
            jam_mulai: formData.jamM,
            jam_selesai: formData.jamS,
            peralatan: formData.alat,
            keperluan: formData.keperluan,
            status: finalStatus,
            notes: note
        }]);

        if (insertError) throw insertError;

        // 5. Success Feedback
        if (finalStatus === 'approved') {
            resDiv.innerHTML = `
                <div class="bg-emerald-500/20 border border-emerald-500 p-4 rounded-2xl w-full">
                    <p class="text-emerald-400 font-black">✅ AUTO-APPROVED!</p>
                    <p class="text-[10px] text-emerald-200 uppercase tracking-tighter">Sarana tersedia & jadwal telah dikunci otomatis.</p>
                </div>`;
            e.target.reset();
        } else {
            resDiv.innerHTML = `
                <div class="bg-amber-500/20 border border-amber-500 p-4 rounded-2xl w-full">
                    <p class="text-amber-400 font-black">📋 DALAM ANTRIAN</p>
                    <p class="text-[10px] text-amber-200 uppercase tracking-tighter">Ada jadwal bentrok. Menunggu review Pak Hanung Budianto S. E.</p>
                </div>`;
        }

    } catch (err) {
        console.error(err);
        resDiv.innerHTML = `<span class="text-red-500 font-bold">❌ Error: ${err.message}</span>`;
    } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-50');
    }
});

initApp();
console.log("💎 Dream OS Booking Engine v13.4 Running...");
