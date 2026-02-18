alert('booking.js loaded!');
import { supabase } from '../../lib/supabaseClient.js';

(function() {
    const debugDiv = document.createElement('div');
    debugDiv.style.cssText = 'background:#111;color:#0f0;padding:8px;margin:10px;border-radius:8px;white-space:pre-wrap;';
    document.body.prepend(debugDiv);
    const log = (msg) => { debugDiv.innerHTML += msg + '<br>'; console.log(msg); };

    log('🚀 booking.js dimuat');

    try {
        const saranaSelect = document.getElementById('sarana');
        const alatSelect = document.getElementById('alat_tambahan');
        if (!saranaSelect || !alatSelect) {
            log('❌ Elemen sarana atau alat tidak ditemukan!');
            return;
        }
        log('✅ Elemen ditemukan');

        // Load sarana
        const saranaList = ['Aula SMP', 'Aula SMA', 'Saung Besar', 'Saung Kecil', 'Masjid', 'Serbaguna', 'Labkom SD', 'Labkom SMP', 'Labkom SMA', 'Lapangan Volley', 'Lapangan Basket', 'Lapangan SMA', 'Lapangan Tanah', 'Kantin SMP', 'Kantin SMA', 'Perpus SD', 'Perpus SMP', 'Perpus SMA', 'Mushalla SMA'];
        saranaList.forEach(v => {
            const opt = document.createElement('option');
            opt.value = v; opt.textContent = v;
            saranaSelect.appendChild(opt);
        });
        log(`✅ Sarana ditambahkan: ${saranaList.length} item`);

        // Load alat
        const alatList = ['Sound Portable', 'Projector', 'Standing Mic', 'Meja Panjang', 'Meja Siswa', 'Kursi Futura', 'Kursi Chitose', 'Taplak Meja', 'TV'];
        alatList.forEach(v => {
            const opt = document.createElement('option');
            opt.value = v; opt.textContent = v;
            alatSelect.appendChild(opt);
        });
        log(`✅ Alat ditambahkan: ${alatList.length} item`);

        log('✅ Dropdown berhasil dimuat!');
    } catch (err) {
        log('❌ Error: ' + err.message);
    }
})();