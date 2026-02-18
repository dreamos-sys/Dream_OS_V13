function isValidBooking(tanggal, jamMulai, jamSelesai, sarana) {
    const tgl = new Date(tanggal);
    const hari = tgl.getDay(); // 0=Minggu, 1=Senin, ... 6=Sabtu

    // ========== CEK ATURAN TANGGAL (H-1 & MAKSIMAL 30 HARI) ==========
    const today = new Date();
    today.setHours(0,0,0,0); // tanggal hari ini tanpa jam
    const bookingDate = new Date(tanggal);
    bookingDate.setHours(0,0,0,0);
    const diffDays = Math.ceil((bookingDate - today) / (1000 * 60 * 60 * 24)); // selisih hari

    // Minimal H-1 (booking harus sehari sebelum)
    if (diffDays < 1) {
        return { valid: false, reason: 'Booking harus dilakukan minimal sehari sebelum tanggal pemakaian (H-1)' };
    }
    // Maksimal 30 hari ke depan
    if (diffDays > 30) {
        return { valid: false, reason: 'Booking maksimal 30 hari ke depan' };
    }

    // ========== KHUSUS HARI MINGGU ==========
    const hariIni = today.getDay();
    if (hariIni === 0) { // hari ini Minggu
        // Hanya boleh booking untuk besok (Senin)
        if (diffDays !== 1) {
            return { valid: false, reason: 'Hari Minggu hanya bisa booking untuk hari Senin' };
        }
    }

    // ========== ATURAN HARI KERJA ==========
    if (hari === 0) { // Minggu
        return { valid: false, reason: 'Hari Minggu libur, tidak bisa booking' };
    }
    if (hari === 6) { // Sabtu
        return { valid: false, reason: 'Hari Sabtu hanya bisa dengan persetujuan Kabag Umum' };
    }

    // ========== CEK JAM KERJA ==========
    if (!jamMulai || !jamSelesai) {
        return { valid: false, reason: 'Jam mulai dan selesai harus diisi' };
    }

    const mulai = parseFloat(jamMulai.replace(':', '.'));
    const selesai = parseFloat(jamSelesai.replace(':', '.'));

    // Aturan khusus Jumat untuk Aula SMP dan Serbaguna
    if (hari === 5) { // Jumat
        if (sarana.includes('Aula SMP') || sarana.includes('Serbaguna')) {
            if (mulai < 10.5 || selesai > 13.0) { // 10:30 - 13:00
                return { valid: false, reason: 'Khusus Jumat, Aula SMP & Serbaguna hanya tersedia 10:30 - 13:00 (persiapan shalat)' };
            }
        } else {
            // Untuk sarana lain, jam kerja normal
            if (mulai < CONFIG.workHours.start || selesai > CONFIG.workHours.end) {
                return { valid: false, reason: 'Di luar jam kerja (07:30 - 16:00)' };
            }
        }
    } else {
        // Hari biasa (Senin-Kamis)
        if (mulai < CONFIG.workHours.start || selesai > CONFIG.workHours.end) {
            return { valid: false, reason: 'Di luar jam kerja (07:30 - 16:00)' };
        }
    }

    // Sarana Masjid: tidak boleh dibooking
    if (sarana.includes('Masjid')) {
        return { valid: false, reason: 'Masjid tidak tersedia untuk booking umum (khusus maintenance)' };
    }

    return { valid: true };
}
