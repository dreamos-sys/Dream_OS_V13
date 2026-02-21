alert('🚦 Lalin Module Loaded');

(function() {
    // Traffic status (mock data - can integrate with Google Maps API later)
    const trafficData = {
        routes: [
            { name: 'Jl. Margonda Raya', status: 'lancar', time: '15 min', color: 'green' },
            { name: 'Jl. Depok Raya', status: 'padat', time: '25 min', color: 'yellow' },
            { name: 'Jl. Citayam', status: 'lancar', time: '12 min', color: 'green' },
            { name: 'Tol Jagorawi', status: 'sangat padat', time: '35 min', color: 'red' }
        ]
    };

    function loadTraffic() {
        // Get current hour for traffic estimation
        const hour = new Date().getHours();
        const day = new Date().getDay();
        
        // Determine traffic status based on time
        let status, statusClass, icon, desc;
        
        const isWeekday = day >= 1 && day <= 5;
        const isMorningPeak = hour >= 6 && hour <= 8;
        const isEveningPeak = hour >= 15 && hour <= 18;

        if (isWeekday && (isMorningPeak || isEveningPeak)) {
            status = 'PADAT MERAYAP';
            statusClass = 'traffic-red';
            icon = '🔴';
            desc = 'Jam sibuk! Waktu perjalanan bisa 2x lebih lama.';
        } else if (isWeekday && (hour >= 9 && hour <= 14)) {
            status = 'LANCAR';
            statusClass = 'traffic-green';
            icon = '🟢';
            desc = 'Kondisi baik untuk perjalanan.';
        } else {
            status = 'NORMAL';
            statusClass = 'traffic-yellow';
            icon = '🟡';
            desc = 'Lalu lintas stabil.';
        }

        // Update UI
        const card = document.getElementById('traffic-status-card');
        card.className = `glass-card p-6 rounded-3xl ${statusClass}`;
        
        document.getElementById('traffic-icon').textContent = icon;
        document.getElementById('traffic-status').textContent = status;
        document.getElementById('traffic-desc').textContent = desc;
        document.getElementById('traffic-time').textContent = new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'});
        // Load routes
        loadRoutes();

        // Generate travel tips
        generateTravelTips(status, hour, day);

        // Save to localStorage
        localStorage.setItem('trafficData', JSON.stringify({
            status,
            timestamp: Date.now()
        }));
    }

    function loadRoutes() {
        const container = document.getElementById('routes-container');
        
        const routes = trafficData.routes.map(route => {
            const colorClass = route.color === 'green' ? 'text-green-400' : route.color === 'yellow' ? 'text-yellow-400' : 'text-red-400';
            const bgColor = route.color === 'green' ? 'bg-green-500/20' : route.color === 'yellow' ? 'bg-yellow-500/20' : 'bg-red-500/20';
            
            return `
                <div class="flex justify-between items-center bg-slate-800/50 p-4 rounded-xl">
                    <div class="flex items-center gap-3">
                        <div class="w-3 h-3 rounded-full ${route.color === 'green' ? 'bg-green-500' : route.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'}"></div>
                        <span class="font-medium">${route.name}</span>
                    </div>
                    <div class="text-right">
                        <span class="${colorClass} font-bold">${route.status.toUpperCase()}</span>
                        <span class="text-xs text-slate-400 ml-2">~${route.time}</span>
                    </div>
                </div>
            `;
        });

        container.innerHTML = routes.join('');
    }

    function generateTravelTips(status, hour, day) {
        const container = document.getElementById('travel-tips');
        const tips = [];

        const isWeekday = day >= 1 && day <= 5;

        if (status.includes('PADAT')) {
            tips.push('🚗 **Rute Alternatif:** Gunakan Jl. Citayam untuk menghindari kemacetan Margonda.');
            tips.push('⏰ **Berangkat Lebih Awal:** Tambahkan 30 menit untuk waktu perjalanan.');
            tips.push('🏍️ **Ojek Online:** Pertimbangkan ojek online untuk lebih cepat.');
        }
        if (isWeekday && hour >= 6 && hour <= 7) {
            tips.push('🚌 **Transportasi Umum:** KRL dan TransJakarta lebih predictable saat jam sibuk.');
        }

        if (day === 0 || day === 6) {
            tips.push('🎉 **Akhir Pekan:** Traffic biasanya lebih lancar, kecuali ada event khusus.');
        }

        // Weather-based tips
        const weatherData = localStorage.getItem('weatherData');
        if (weatherData) {
            const weather = JSON.parse(weatherData);
            if (weather.weather && weather.weather[0].main === 'Rain') {
                tips.push('🌧️ **Hujan:** Waspada genangan di Jl. Depok Raya. Bawa jas hujan!');
            }
        }

        if (tips.length === 0) {
            tips.push('✅ **Kondisi Normal:** Perjalanan dapat dilakukan seperti biasa.');
        }

        container.innerHTML = tips.map(tip => `
            <div class="bg-slate-800/50 p-4 rounded-xl border-l-4 border-green-500">
                <p class="text-sm">${tip}</p>
            </div>
        `).join('');
    }

    document.getElementById('refresh-lalin')?.addEventListener('click', loadTraffic);
    loadTraffic();

    // Auto refresh every 15 minutes
    setInterval(loadTraffic, 15 * 60 * 1000);
})();