/**
 * 🏠 DREAM OS v13.4 - HOME MODULE
 * Dashboard & Quick Actions
 * The Power Soul of Shalawat
 */

(function() {
    'use strict';

    console.log('🏠 Home Module Loaded - Dream OS v13.4');

    // ===== CONFIGURATION =====
    const CONFIG = {
        refreshInterval: 30000, // 30 seconds
        maxRecentActivity: 10
    };

    // ===== LOAD DASHBOARD STATS =====
    async function loadStats() {
        try {
            const [booking, k3, inventory, warehouse] = await Promise.all([
                window.supabase
                    .from('bookings')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'pending'),
                window.supabase
                    .from('k3_reports')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'pending'),
                window.supabase
                    .from('inventaris')
                    .select('*', { count: 'exact', head: true }),
                window.supabase
                    .from('gudang_stok')
                    .select('*', { count: 'exact', head: true })
            ]);

            // Update UI
            const statBooking = document.getElementById('stat-booking');
            const statK3 = document.getElementById('stat-k3');
            const statInventory = document.getElementById('stat-inventory');
            const statWarehouse = document.getElementById('stat-warehouse');

            if (statBooking) statBooking.textContent = booking.count || 0;
            if (statK3) statK3.textContent = k3.count || 0;
            if (statInventory) statInventory.textContent = inventory.count || 0;
            if (statWarehouse) statWarehouse.textContent = warehouse.count || 0;

            console.log('📊 Stats loaded:', {
                booking: booking.count || 0,                k3: k3.count || 0,
                inventory: inventory.count || 0,
                warehouse: warehouse.count || 0
            });

        } catch (error) {
            console.error('❌ Failed to load stats:', error);
        }
    }

    // ===== LOAD RECENT ACTIVITY =====
    async function loadRecentActivity() {
        try {
            const container = document.getElementById('recent-activity');
            if (!container) return;

            // Fetch recent activities from multiple tables
            const [bookings, k3Reports, stockTx] = await Promise.all([
                window.supabase
                    .from('bookings')
                    .select('nama_peminjam,ruang,tanggal,created_at,status')
                    .order('created_at', { ascending: false })
                    .limit(5),
                window.supabase
                    .from('k3_reports')
                    .select('lokasi,jenis_laporan,created_at,status')
                    .order('created_at', { ascending: false })
                    .limit(5),
                window.supabase
                    .from('stock_transactions')
                    .select('type,jumlah,created_at,gudang_stok(nama_barang)')
                    .order('created_at', { ascending: false })
                    .limit(5)
            ]);

            const activities = [];

            // Process bookings
            if (bookings.data) {
                bookings.data.forEach(b => {
                    activities.push({
                        type: 'booking',
                        icon: b.status === 'approved' ? '✅' : '⏳',
                        title: b.status === 'approved' ? 'Booking Approved' : 'New Booking',
                        desc: `${b.nama_peminjam} - ${b.ruang}`,
                        time: new Date(b.created_at).toLocaleString('id-ID')
                    });
                });
            }
            // Process K3 reports
            if (k3Reports.data) {
                k3Reports.data.forEach(k => {
                    activities.push({
                        type: 'k3',
                        icon: k.status === 'verified' ? '✅' : '⚠️',
                        title: k.status === 'verified' ? 'K3 Verified' : 'New K3 Report',
                        desc: `${k.jenis_laporan} - ${k.lokasi}`,
                        time: new Date(k.created_at).toLocaleString('id-ID')
                    });
                });
            }

            // Process stock transactions
            if (stockTx.data) {
                stockTx.data.forEach(s => {
                    activities.push({
                        type: 'stock',
                        icon: s.type === 'in' ? '📥' : '📤',
                        title: s.type === 'in' ? 'Stock In' : 'Stock Out',
                        desc: `${s.gudang_stok?.nama_barang || 'Unknown'} (${s.jumlah})`,
                        time: new Date(s.created_at).toLocaleString('id-ID')
                    });
                });
            }

            // Sort by time and limit
            activities.sort((a, b) => new Date(b.time) - new Date(a.time));
            const recent = activities.slice(0, CONFIG.maxRecentActivity);

            // Render
            if (recent.length === 0) {
                container.innerHTML = `
                    <div class="text-center text-slate-400 py-4">
                        <i class="fas fa-inbox text-3xl mb-2"></i>
                        <p>No recent activity</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = recent.map(a => `
                <div class="flex items-center gap-3 bg-slate-800/50 p-3 rounded-xl hover:bg-slate-800/70 transition">
                    <div class="text-2xl">${a.icon}</div>
                    <div class="flex-1">
                        <p class="text-sm font-bold">${a.title}</p>
                        <p class="text-xs text-slate-400">${a.desc}</p>
                    </div>
                    <div class="text-xs text-slate-500">${a.time.split(' ')[1]}</div>
                </div>            `).join('');

        } catch (error) {
            console.error('❌ Failed to load activity:', error);
            const container = document.getElementById('recent-activity');
            if (container) {
                container.innerHTML = `
                    <div class="text-center text-red-400 py-4">
                        <i class="fas fa-triangle-exclamation text-2xl mb-2"></i>
                        <p>Failed to load activity</p>
                    </div>
                `;
            }
        }
    }

    // ===== GENERATE AI INSIGHTS =====
    async function generateAIInsights() {
        try {
            const container = document.getElementById('ai-insights');
            if (!container) return;

            const insights = [];

            // Get stats for insights
            const { count: bookingCount } = await window.supabase
                .from('bookings')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');

            const { count: k3Count } = await window.supabase
                .from('k3_reports')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');

            // Booking insight
            if (bookingCount > 10) {
                insights.push({
                    type: 'warning',
                    icon: '⚠️',
                    message: `📅 ${bookingCount} booking menunggu approval. Pertimbangkan untuk approve segera.`
                });
            }

            // K3 insight
            if (k3Count > 5) {
                insights.push({
                    type: 'warning',
                    icon: '⚠️',
                    message: `⚠️ ${k3Count} laporan K3 pending. Prioritaskan verifikasi.`                });
            }

            // Time-based insights
            const hour = new Date().getHours();
            const day = new Date().getDay();

            if (day === 5 && hour >= 10 && hour <= 12) {
                insights.push({
                    type: 'info',
                    icon: '🕌',
                    message: 'Jumat berkah! Persiapan shalat Jumat.'
                });
            }

            if (hour >= 15 && hour < 16) {
                insights.push({
                    type: 'info',
                    icon: '📋',
                    message: 'Saatnya laporan K3 sebelum pulang.'
                });
            }

            if (hour >= 7 && hour < 8) {
                insights.push({
                    type: 'info',
                    icon: '☀️',
                    message: 'Selamat pagi! Cek jadwal booking hari ini.'
                });
            }

            // Default insight
            if (insights.length === 0) {
                insights.push({
                    type: 'success',
                    icon: '✅',
                    message: 'Sistem berjalan normal. Tidak ada anomali yang terdeteksi.'
                });
            }

            // Render insights
            const colorMap = {
                warning: 'border-orange-500',
                info: 'border-blue-500',
                success: 'border-emerald-500'
            };

            container.innerHTML = insights.map(i => `
                <div class="bg-slate-800/50 p-4 rounded-xl border-l-4 ${colorMap[i.type]} hover:bg-slate-800/70 transition">
                    <p class="text-sm">${i.icon} ${i.message}</p>                </div>
            `).join('');

        } catch (error) {
            console.error('❌ Failed to generate insights:', error);
        }
    }

    // ===== LOGOUT FUNCTION =====
    window.logout = function() {
        if (confirm('⚠️ Yakin ingin logout?')) {
            sessionStorage.removeItem('allowed_modules');
            
            // Show loading state
            const logoutBtn = document.querySelector('button[onclick="logout()"]');
            if (logoutBtn) {
                logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Logging out...';
                logoutBtn.disabled = true;
            }
            
            // Redirect after short delay
            setTimeout(() => {
                window.location.href = '/';
            }, 500);
        }
    };

    // ===== INITIALIZATION =====
    function init() {
        console.log('🏠 Initializing Home Module...');
        
        // Load initial data
        loadStats();
        loadRecentActivity();
        generateAIInsights();
        
        // Auto refresh
        setInterval(loadStats, CONFIG.refreshInterval);
        setInterval(loadRecentActivity, CONFIG.refreshInterval);
        setInterval(generateAIInsights, CONFIG.refreshInterval * 2);
        
        console.log('✅ Home Module Initialized');
    }

    // Start
    init();

})();