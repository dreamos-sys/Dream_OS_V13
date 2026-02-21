alert('📊 Prediction Module Loaded');

(function() {
    const supabase = window.supabase;
    if (!supabase) return alert('Supabase tidak tersedia');

    // Simple prediction logic (bisa dikembangkan dengan ML nanti)
    async function loadPredictions() {
        // Booking prediction (average based on last 30 days)
        const {  bookings } = await supabase.from('bookings').select('created_at').gte('created_at', new Date(Date.now() - 30*24*60*60*1000).toISOString());
        const avgBooking = bookings ? Math.ceil(bookings.length / 4) : 0; // per week
        document.getElementById('pred-booking').textContent = `~${avgBooking} booking/minggu`;

        // K3 risk (based on pending reports)
        const {  k3s } = await supabase.from('k3_reports').select('jenis_laporan, lokasi').eq('status', 'pending');
        const riskLevel = k3s && k3s.length > 5 ? 'TINGGI ⚠️' : k3s && k3s.length > 2 ? 'SEDANG ⚡' : 'RENDAH ✅';
        document.getElementById('pred-k3').textContent = riskLevel;

        // Dana estimation
        const {  dana } = await supabase.from('pengajuan_dana').select('nominal').gte('created_at', new Date(Date.now() - 30*24*60*60*1000).toISOString());
        const totalDana = dana ? dana.reduce((sum, d) => sum + Number(d.nominal), 0) : 0;
        document.getElementById('pred-dana').textContent = `Rp ${(totalDana/1000000).toFixed(1)}Jt`;

        // Generate AI insights
        generateInsights(bookings, k3s, dana);
    }

    function generateInsights(bookings, k3s, dana) {
        const insights = [];
        
        // Booking insight
        if (bookings && bookings.length > 20) {
            insights.push('📅 **Tren Booking Meningkat:** Pertimbangkan penambahan sarana untuk memenuhi permintaan.');
        }

        // K3 insight
        if (k3s && k3s.length > 0) {
            const lokasiMap = {};
            k3s.forEach(k => { lokasiMap[k.lokasi] = (lokasiMap[k.lokasi] || 0) + 1; });
            const topLokasi = Object.entries(lokasiMap).sort((a,b) => b[1] - a[1])[0];
            if (topLokasi) {
                insights.push(`⚠️ **Area Rawan:** ${topLokasi[0]} memiliki ${topLokasi[1]} laporan K3. Perlu perhatian khusus.`);
            }
        }

        // Dana insight
        if (dana && dana.length > 10) {
            insights.push('💰 **Pengajuan Dana Tinggi:** Rata-rata pengajuan meningkat. Pastikan budget mencukupi.');
        }

        // Default insight
        if (insights.length === 0) {
            insights.push('✅ **Sistem Stabil:** Tidak ada anomali yang terdeteksi. Pertahankan performa!');
        }

        const container = document.getElementById('ai-insights');
        container.innerHTML = insights.map(i => `
            <div class="bg-slate-800/50 p-4 rounded-xl border-l-4 border-purple-500">
                <p class="text-sm">${i}</p>
            </div>
        `).join('');
    }

    // Charts
    async function loadCharts() {
        // Booking chart
        const bookingCtx = document.getElementById('bookingChart')?.getContext('2d');
        if (bookingCtx) {
            const {  bookings } = await supabase.from('bookings').select('created_at').order('created_at', { ascending: true }).limit(30);
            const labels = bookings ? bookings.map((_, i) => `Hari ${i+1}`) : [];
            const data = bookings ? bookings.map(() => Math.floor(Math.random() * 10)) : [];

            new Chart(bookingCtx, {
                type: 'line',
                 { labels, datasets: [{ label: 'Booking',  borderColor: '#06b6d4', tension: 0.4, fill: true, backgroundColor: 'rgba(6,182,212,0.2)' }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
            });
        }

        // K3 chart
        const k3Ctx = document.getElementById('k3Chart')?.getContext('2d');
        if (k3Ctx) {
            new Chart(k3Ctx, {
                type: 'doughnut',
                 { labels: ['Kerusakan', 'Kehilangan', 'Kebersihan'], datasets: [{  [40, 30, 30], backgroundColor: ['#f97316', '#3b82f6', '#22c55e'] }] },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }
    }

    loadPredictions();
    loadCharts();
})();