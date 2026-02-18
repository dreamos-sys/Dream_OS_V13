alert('✅ booking.js dimuat (global mode)');

(function() {
    // Ambil supabase dari global (sudah tersedia dari index.html)
    const supabase = window.supabase;
    
    // Debug box di layar
    const debugDiv = document.createElement('div');
    debugDiv.style.cssText = 'background:#111;color:#0f0;padding:8px;margin:10px;border-radius:8px;white-space:pre-wrap;';
    document.body.prepend(debugDiv);
    const log = (msg) => { debugDiv.innerHTML += msg + '<br>'; console.log(msg); };

    log('🚀 Script booking dimulai');

    try {
        const saranaSelect = document.getElementById('sarana');
        const alatSelect = document.getElementById('alat_tambahan');
        if (!saranaSelect || !alatSelect) {
            log('❌ Elemen sarana/alat tidak ditemukan!');
            return;
        }
        log('✅ Elemen ditemukan');

        // Hapus opsi lama (placeholder) agar bersih
        saranaSelect.innerHTML = '<option value="">Pilih Sarana</option>';
        alatSelect.innerHTML = '';

        // Daftar sarana
        const saranaList = ['Aula SMP', 'Aula SMA', 'Saung Besar', 'Saung Kecil', 'Masjid', 'Serbaguna', 'Labkom SD', 'Labkom SMP', 'Labkom SMA', 'Lapangan Volley', 'Lapangan Basket', 'Lapangan SMA', 'Lapangan Tanah', 'Kantin SMP', 'Kantin SMA', 'Perpus SD', 'Perpus SMP', 'Perpus SMA', 'Mushalla SMA'];
        saranaList.forEach(v => {
            const opt = document.createElement('option');
            opt.value = v;
            opt.textContent = v;
            saranaSelect.appendChild(opt);
        });
        log(`✅ Sarana: ${saranaList.length} opsi ditambahkan`);

        // Daftar alat
        const alatList = ['Sound Portable', 'Projector', 'Standing Mic', 'Meja Panjang', 'Meja Siswa', 'Kursi Futura', 'Kursi Chitose', 'Taplak Meja', 'TV'];
        alatList.forEach(v => {
            const opt = document.createElement('option');
            opt.value = v;
            opt.textContent = v;
            alatSelect.appendChild(opt);
        });
        log(`✅ Alat: ${alatList.length} opsi ditambahkan`);

        // Tambahkan CSS paksa agar dropdown terlihat
        const style = document.createElement('style');
        style.textContent = `
            #sarana, #alat_tambahan {
                background-color: white !important;
                color: black !important;
                border: 2px solid #3b82f6 !important;
                padding: 8px !important;
                border-radius: 6px !important;
            }
            .dark #sarana, .dark #alat_tambahan {
                background-color: #1f2937 !important;
                color: white !important;
                border-color: #fbbf24 !important;
            }
        `;
        document.head.appendChild(style);
        log('✅ CSS paksa ditambahkan');

        log('🎉 SEMUA BERHASIL! Dropdown siap digunakan.');
    } catch (err) {
        log('❌ Error: ' + err.message);
        console.error(err);
    }
})();