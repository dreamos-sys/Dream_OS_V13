// Master Logic Dashboard Dream OS v13 [cite: 2026-01-11]
console.log("Dashboard Logic Active - Bismillah!");

// 1. Listen Global Eye (Show/Hide Mata) [cite: 2026-01-11]
document.addEventListener('dream_eye', (e) => {
    const isVisible = e.detail;
    document.querySelectorAll('.dream-value').forEach(el => {
        el.textContent = isVisible ? el.getAttribute('data-val') : '••••';
    });
});

// 2. Fungsi Simpan Laporan K3 & Security [cite: 2026-01-11]
async function saveReport() {
    const day = document.getElementById('day-num').value;
    const desc = document.getElementById('report-desc').value;
    const cat = document.getElementById('k3-cat').value;

    if(!day || !desc) {
        alert("Bismillah, isi dulu laporannya My Bro!");
        return;
    }

    // Filter Jam Kerja (07:30 - 16:00) kecuali SECURITY [cite: 2026-01-11]
    const now = new Date();
    const hour = now.getHours();
    const min = now.getMinutes();
    const timeDec = hour + (min/60);

    if(cat !== 'SECURITY' && (timeDec < 7.5 || timeDec > 16)) {
        alert("Akses Blokir! Laporan K3 hanya di jam kerja (07:30-16:00). Security aman 24 jam! [cite: 2026-01-11]");
        return;
    }

    // Kirim ke Supabase [cite: 2026-01-16]
    const { error } = await supabase
        .from('security_reports')
        .insert([{ 
            report_day: day, 
            reporter: sessionStorage.getItem('dr_user'), 
            description: desc,
            category: cat 
        }]);

    if(!error) {
        alert("Laporan Berhasil Masuk Cloud! [cite: 2026-01-16]");
        document.getElementById('report-desc').value = '';
    } else {
        alert("Gagal kirim, cek koneksi atau SQL! 🤣🤣🤣");
    }
}
