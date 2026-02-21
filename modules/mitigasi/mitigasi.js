alert('⚠️ Mitigasi Module Loaded');

(function() {
    // Toggle protocol accordion
    window.toggleProtocol = function(type) {
        const el = document.getElementById(`protocol-${type}`);
        if (el) {
            el.classList.toggle('hidden');
        }
    };

    // Check disaster status (mock - can integrate with BMKG API)
    async function checkDisasterStatus() {
        const statusCard = document.getElementById('mitigation-status');
        const statusIcon = document.getElementById('status-icon');
        const statusText = document.getElementById('status-text');
        const statusDesc = document.getElementById('status-desc');
        const alertsContainer = document.getElementById('active-alerts');
        const checkTime = document.getElementById('check-time');

        checkTime.textContent = new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'});

        try {
            // Mock data - integrate with BMKG API for real data
            // BMKG API: https://data.bmkg.go.id/
            const mockStatus = 'safe'; // 'safe', 'warning', 'critical'

            if (mockStatus === 'critical') {
                statusCard.className = 'glass-card p-6 rounded-3xl alert-critical';
                statusIcon.textContent = '🚨';
                statusText.textContent = 'BAHAYA!';
                statusDesc.textContent = 'Bencana terdeteksi! Segera evakuasi!';
                
                alertsContainer.innerHTML = `
                    <div class="bg-red-500/20 p-4 rounded-xl border-l-4 border-red-500">
                        <h3 class="font-bold text-red-400 mb-2">🚨 PERINGATAN MERAH</h3>
                        <p class="text-sm">Gempa bumi terdeteksi magnitude 6.5</p>
                        <p class="text-xs text-slate-400 mt-1">Sumber: BMKG</p>
                    </div>
                `;
            } else if (mockStatus === 'warning') {
                statusCard.className = 'glass-card p-6 rounded-3xl alert-warning';
                statusIcon.textContent = '⚠️';
                statusText.textContent = 'WASPADA';
                statusDesc.textContent = 'Potensi bencana dalam 24 jam';
                
                alertsContainer.innerHTML = `
                    <div class="bg-yellow-500/20 p-4 rounded-xl border-l-4 border-yellow-500">
                        <h3 class="font-bold text-yellow-400 mb-2">⚠️ PERINGATAN KUNING</h3>
                        <p class="text-sm">Potensi hujan lebat dan angin kencang</p>                        <p class="text-xs text-slate-400 mt-1">Sumber: BMKG</p>
                    </div>
                `;
            } else {
                statusCard.className = 'glass-card p-6 rounded-3xl alert-safe';
                statusIcon.textContent = '✅';
                statusText.textContent = 'KONDISI AMAN';
                statusDesc.textContent = 'Tidak ada peringatan bencana aktif';
                
                alertsContainer.innerHTML = `
                    <div class="bg-green-500/20 p-4 rounded-xl border-l-4 border-green-500">
                        <p class="text-sm">✅ Tidak ada peringatan bencana saat ini</p>
                    </div>
                `;
            }

            // Save status
            localStorage.setItem('mitigationStatus', JSON.stringify({
                status: mockStatus,
                timestamp: Date.now()
            }));

        } catch (err) {
            console.error('Mitigation check error:', err);
            statusDesc.textContent = 'Gagal memeriksa status. Periksa koneksi.';
        }
    }

    // Weather-based alerts
    function checkWeatherAlerts() {
        const weatherData = localStorage.getItem('weatherData');
        if (!weatherData) return;

        const weather = JSON.parse(weatherData);
        const alertsContainer = document.getElementById('active-alerts');
        
        if (weather.weather && weather.weather[0].main === 'Thunderstorm') {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'bg-yellow-500/20 p-4 rounded-xl border-l-4 border-yellow-500 mt-3';
            alertDiv.innerHTML = `
                <h3 class="font-bold text-yellow-400 mb-2">⛈️ CUACA EKSTREM</h3>
                <p class="text-sm">Badai petir terdeteksi. Hindari aktivitas outdoor.</p>
            `;
            alertsContainer.appendChild(alertDiv);
        }
    }

    document.getElementById('refresh-mitigasi')?.addEventListener('click', () => {
        checkDisasterStatus();
        checkWeatherAlerts();    });

    // Initial check
    checkDisasterStatus();
    checkWeatherAlerts();

    // Auto check every hour
    setInterval(checkDisasterStatus, 60 * 60 * 1000);
})();