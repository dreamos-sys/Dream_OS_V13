/**
 * 🏠 DREAM OS v13.4 - HOME MODULE
 * Dashboard & Quick Actions
 * The Power Soul of Shalawat
 */

(function() {
    'use strict';

    console.log('🏠 Home Module Loaded - Dream OS v13.4');

    const CONFIG = {
        refreshInterval: 30000,
        maxRecentActivity: 10
    };

    async function loadStats() {
        try {
            const [booking, k3, inventory, warehouse] = await Promise.all([
                window.supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                window.supabase.from('k3_reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                window.supabase.from('inventaris').select('*', { count: 'exact', head: true }),
                window.supabase.from('gudang_stok').select('*', { count: 'exact', head: true })
            ]);

            document.getElementById('stat-booking').textContent = booking.count || 0;
            document.getElementById('stat-k3').textContent = k3.count || 0;
            document.getElementById('stat-inventory').textContent = inventory.count || 0;
            document.getElementById('stat-warehouse').textContent = warehouse.count || 0;

            console.log('📊 Stats loaded');
        } catch (error) {
            console.error('❌ Gagal load statistik:', error);
        }
    }

    async function loadRecentActivity() {
        const container = document.getElementById('recent-activity');
        if (!container) return;

        try {
            const [bookings, k3Reports] = await Promise.all([
                window.supabase.from('bookings').select('nama_peminjam,ruang,created_at,status').order('created_at', { ascending: false }).limit(5),
                window.supabase.from('k3_reports').select('lokasi,jenis_laporan,created_at,status').order('created_at', { ascending: false }).limit(5)
            ]);

            let activities = [];

            if (bookings.data) {
                bookings.data.forEach(b => {
                    activities.push({
                        icon: b.status === 'approved' ? '✅' : '⏳',
                        title: b.status === 'approved' ? 'Booking Disetujui' : 'Booking Baru',
                        desc: `${b.nama_peminjam} - ${b.ruang}`,
                        time: new Date(b.created_at).toLocaleString('id-ID')
                    });
                });
            }

            if (k3Reports.data) {
                k3Reports.data.forEach(k => {
                    activities.push({
                        icon: k.status === 'verified' ? '✅' : '⚠️',
                        title: k.status === 'verified' ? 'K3 Terverifikasi' : 'Laporan K3 Baru',
                        desc: `${k.jenis_laporan} - ${k.lokasi}`,
                        time: new Date(k.created_at).toLocaleString('id-ID')
                    });
                });
            }

            activities.sort((a, b) => new Date(b.time) - new Date(a.time));
            activities = activities.slice(0, CONFIG.maxRecentActivity);

            if (activities.length === 0) {
                container.innerHTML = '<div class="text-center text-slate-400 py-4"><i class="fas fa-inbox text-3xl mb-2"></i><p>Belum ada aktivitas</p></div>';
                return;
            }

            container.innerHTML = activities.map(a => `
                <div class="flex items-center gap-3 bg-slate-800/50 p-3 rounded-xl">
                    <div class="text-2xl">${a.icon}</div>
                    <div class="flex-1">
                        <p class="text-sm font-bold">${a.title}</p>
                        <p class="text-xs text-slate-400">${a.desc}</p>
                    </div>
                    <div class="text-xs text-slate-500">${a.time.split(' ')[1]}</div>
                </div>
            `).join('');

        } catch (error) {
            console.error('❌ Gagal load aktivitas:', error);
            container.innerHTML = '<div class="text-center text-red-400 py-4"><i class="fas fa-exclamation-triangle text-2xl mb-2"></i><p>Gagal memuat aktivitas</p></div>';
        }
    }

    async function generateAIInsights() {
        const container = document.getElementById('ai-insights');
        if (!container) return;

        try {
            const { count: bookingCount } = await window.supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending');
            const { count: k3Count } = await window.supabase.from('k3_reports').select('*', { count: 'exact', head: true }).eq('status', 'pending');
            const hour = new Date().getHours();
            const day = new Date().getDay();

            let insights = [];

            if (bookingCount > 10) insights.push({ type: 'warning', icon: '⚠️', message: `📅 ${bookingCount} booking pending.` });
            if (k3Count > 5) insights.push({ type: 'warning', icon: '⚠️', message: `⚠️ ${k3Count} laporan K3 pending.` });
            if (day === 5 && hour >= 10 && hour <= 12) insights.push({ type: 'info', icon: '🕌', message: 'Jumat berkah! Persiapan shalat Jumat.' });
            if (hour >= 15 && hour < 16) insights.push({ type: 'info', icon: '📋', message: 'Saatnya laporan K3 sebelum pulang.' });
            if (hour >= 7 && hour < 8) insights.push({ type: 'info', icon: '☀️', message: 'Selamat pagi! Cek jadwal booking hari ini.' });

            if (insights.length === 0) insights.push({ type: 'success', icon: '✅', message: 'Sistem berjalan normal.' });

            const colorMap = { warning: 'border-orange-500', info: 'border-blue-500', success: 'border-emerald-500' };

            container.innerHTML = insights.map(i => `
                <div class="bg-slate-800/50 p-4 rounded-xl border-l-4 ${colorMap[i.type]}">
                    <p class="text-sm">${i.icon} ${i.message}</p>
                </div>
            `).join('');

        } catch (error) {
            console.error('❌ Gagal generate insights:', error);
        }
    }

    function init() {
        console.log('🏠 Inisialisasi Home Module...');
        loadStats();
        loadRecentActivity();
        generateAIInsights();
        setInterval(loadStats, CONFIG.refreshInterval);
        setInterval(loadRecentActivity, CONFIG.refreshInterval);
        setInterval(generateAIInsights, CONFIG.refreshInterval * 2);
    }

    init();
})();