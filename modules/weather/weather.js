alert('🌤️ Weather Module Loaded');

(function() {
    // OpenWeatherMap API (FREE tier)
    const WEATHER_API_KEY = 'f7890d7569950ffa34a5827880e8442f'; 
    const WEATHER_URL = 'https://api.openweathermap.org/data/2.5';
    const LOCATION = { lat: -6.4, lon: 106.8 }; // Depok coordinates

    // Weather icon mapping
    const weatherIcons = {
        'Clear': '☀️', 'Clouds': '☁️', 'Rain': '🌧️', 'Drizzle': '🌦️',
        'Thunderstorm': '⛈️', 'Snow': '❄️', 'Mist': '🌫️', 'Smoke': '🌫️',
        'Haze': '🌫️', 'Dust': '🌪️', 'Fog': '🌫️', 'Sand': '🌪️', 'Ash': '🌋',
        'Squall': '💨', 'Tornado': '🌪️'
    };

    // Load weather data
    async function loadWeather() {
        try {
            // Current weather
            const currentRes = await fetch(`${WEATHER_URL}/weather?lat=${LOCATION.lat}&lon=${LOCATION.lon}&appid=${WEATHER_API_KEY}&units=metric`);
            const current = await currentRes.json();

            if (current.cod !== 200) throw new Error('Failed to fetch weather');

            // Update UI
            document.getElementById('current-temp').textContent = `${Math.round(current.main.temp)}°C`;
            document.getElementById('weather-desc').textContent = current.weather[0].description;
            document.getElementById('weather-icon').textContent = weatherIcons[current.weather[0].main] || '🌤️';
            document.getElementById('humidity').textContent = `${current.main.humidity}%`;
            document.getElementById('wind').textContent = `${Math.round(current.wind.speed * 3.6)} km/h`; // m/s to km/h
            document.getElementById('uv').textContent = 'Moderate'; // UV needs separate API
            document.getElementById('update-time').textContent = `Updated: ${new Date().toLocaleTimeString('id-ID')}`;

            // Check for alerts
            checkWeatherAlerts(current);

            // Generate recommendations
            generateRecommendations(current);

            // Save to localStorage for offline
            localStorage.setItem('weatherData', JSON.stringify({
                ...current,
                timestamp: Date.now()
            }));

        } catch (err) {
            console.error('Weather error:', err);
            // Fallback to cached data
            const cached = localStorage.getItem('weatherData');            if (cached) {
                const data = JSON.parse(cached);
                // Check if cache is less than 2 hours old
                if (Date.now() - data.timestamp < 2 * 60 * 60 * 1000) {
                    document.getElementById('weather-desc').textContent = 'Data cached (offline)';
                }
            }
        }
    }

    // Check for severe weather alerts
    function checkWeatherAlerts(data) {
        const alertBanner = document.getElementById('weather-alert');
        const alertMessage = document.getElementById('alert-message');
        
        const temp = data.main.temp;
        const weather = data.weather[0].main;
        const wind = data.wind.speed;

        let alert = null;

        if (weather === 'Thunderstorm') {
            alert = '⛈️ Badai petir terdeteksi! Hindari aktivitas outdoor.';
        } else if (temp > 35) {
            alert = '🔥 Panas ekstrem! Pastikan hidrasi cukup dan hindari matahari langsung.';
        } else if (temp < 20) {
            alert = '❄️ Suhu dingin! Gunakan pakaian hangat.';
        } else if (wind > 10) {
            alert = '💨 Angin kencang! Amankan benda-benda ringan di luar.';
        } else if (weather === 'Rain' && data.rain?.['1h'] > 10) {
            alert = '🌧️ Hujan lebat! Waspada banjir dan genangan.';
        }

        if (alert) {
            alertMessage.textContent = alert;
            alertBanner.classList.remove('hidden');
        } else {
            alertBanner.classList.add('hidden');
        }
    }

    // Generate activity recommendations
    function generateRecommendations(data) {
        const container = document.getElementById('activity-recommendations');
        const temp = data.main.temp;
        const weather = data.weather[0].main;
        const humidity = data.main.humidity;

        const recommendations = [];
        // General recommendations
        if (weather === 'Clear' && temp >= 25 && temp <= 32) {
            recommendations.push('✅ **Cuaca Ideal:** Kondisi sempurna untuk aktivitas outdoor dan olahraga.');
        }

        if (humidity > 80) {
            recommendations.push('💧 **Kelembaban Tinggi:** Pastikan ventilasi udara baik. Waspada jamur.');
        }

        // School-specific recommendations
        if (weather === 'Rain') {
            recommendations.push('🏫 **Untuk Sekolah:** Siapkan payung/jas hujan. Waspadai lantai licin.');
            recommendations.push('🚌 **Transport:** Antisipasi kemacetan saat hujan. Berangkat lebih awal.');
        }

        if (temp > 33) {
            recommendations.push('❄️ **AC & Ventilasi:** Pastikan AC berfungsi baik. Sediakan air minum cukup.');
            recommendations.push('⚡ **Listrik:** Beban AC tinggi. Monitor konsumsi listrik.');
        }

        if (weather === 'Thunderstorm') {
            recommendations.push('⚡ **Safety:** Hindari penggunaan perangkat elektronik outdoor.');
            recommendations.push('🔌 **Listrik:** Waspada gangguan listrik. Siapkan UPS jika ada.');
        }

        // Default
        if (recommendations.length === 0) {
            recommendations.push('✅ **Kondisi Normal:** Aktivitas dapat berjalan seperti biasa.');
        }

        container.innerHTML = recommendations.map(rec => `
            <div class="bg-slate-800/50 p-4 rounded-xl border-l-4 border-cyan-500">
                <p class="text-sm">${rec}</p>
            </div>
        `).join('');
    }

    // Load 7-day forecast (simplified - mock data for free API)
    async function loadForecast() {
        const container = document.getElementById('forecast-container');
        
        // For free API, we'll use simplified forecast
        const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        const today = new Date().getDay();
        
        let html = '';
        for (let i = 0; i < 7; i++) {
            const dayIndex = (today + i) % 7;
            const temp = Math.round(28 + Math.random() * 8 - 4); // Mock temp 24-36°C
            const weathers = ['☀️', '☁️', '🌧️', '⛈️', '🌦️'];            const weather = weathers[Math.floor(Math.random() * weathers.length)];
            
            html += `
                <div class="bg-slate-800/50 p-4 rounded-2xl text-center">
                    <p class="text-xs text-slate-400 mb-2">${days[dayIndex]}</p>
                    <p class="text-3xl mb-2">${weather}</p>
                    <p class="text-lg font-bold">${temp}°C</p>
                </div>
            `;
        }
        
        container.innerHTML = html;
    }

    // Refresh button
    document.getElementById('refresh-weather')?.addEventListener('click', () => {
        loadWeather();
        loadForecast();
    });

    // Initial load
    loadWeather();
    loadForecast();

    // Auto refresh every 30 minutes
    setInterval(loadWeather, 30 * 60 * 1000);
})();