// config.js
export const CONFIG = {
  // Jam kerja (format desimal, 7.5 = 07:30)
  workHours: {
    start: 7.5,
    end: 16.0,
  },
  // Hari kerja (0=Minggu, 1=Senin, ...)
  workDays: [1, 2, 3, 4, 5], // Senin-Jumat
  // Aturan khusus Jumat (misal aula khusus)
  fridayRules: {
    aula: { start: 10.5, end: 13.0 }, // 10:30-13:00 untuk persiapan shalat
  },
  // Maksimal durasi booking (jam)
  maxBookingDuration: 24,
  // Shift sekuriti (contoh awal, bisa diubah nanti)
  securityShifts: [
    { name: 'Pagi', start: 7, end: 19, weekdays: [1,2,3,4,5], count: 3 },
    { name: 'Malam', start: 19, end: 7, weekdays: [1,2,3,4,5,6,0], count: 2 },
    { name: 'Weekend', start: 7, end: 19, weekdays: [6,0], count: 2 },
  ],
  // Mode debug (true saat pengembangan)
  debug: true,
};
