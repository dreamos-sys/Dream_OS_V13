/**
 * 🛰️ DREAM OS ROUTER v13.4 - MASTER CONFIGURATION
 * Terintegrasi dengan 9 modul inti, 7-slide panel, dan akses berbasis role
 * The Power Soul of Shalawat
 */

const CONFIG = {
    // 🔑 Koneksi Supabase (PASTIKAN URL DAN KEY BENAR)
    SUPABASE: {
        URL: "https://rqpodzjexghrvcpyacyo.supabase.co",
        KEY: "sb_publishable_U9MbSdPJOMSmaw3BsHJcVQ_PDiOy-UM" // anon key publishable
    },
    // 🔐 Daftar password sakral (12 role sesuai data)
    KEYS: {
        "012443410": { role: "DEVELOPER", allowed_modules: ['booking','k3','sekuriti','janitor-indoor','janitor-outdoor','stok','maintenance','asset','commandcenter'], noLog: true },
        "Mr.M_Architect_2025": { role: "MASTER", allowed_modules: ['booking','k3','sekuriti','janitor-indoor','janitor-outdoor','stok','maintenance','asset','commandcenter'], noLog: true },
        "4dm1n_AF6969@00": { role: "ADMIN", allowed_modules: ['booking','k3','sekuriti','janitor-indoor','janitor-outdoor','stok','maintenance','asset','commandcenter'] },
        "LHPSsec_AF2025": { role: "SEKURITI", allowed_modules: ['sekuriti'] },
        "CHCS_AF_@003": { role: "JANITOR", allowed_modules: ['janitor-indoor','janitor-outdoor'] },
        "SACS_AF@004": { role: "STOK", allowed_modules: ['stok'] },
        "M41n_4F@234": { role: "MAINTENANCE", allowed_modules: ['maintenance'] },
        "4dm1n_6969@01": { role: "INVENTARIS", allowed_modules: ['asset'] },
        "4dm1n_9696@02": { role: "GUDANG", allowed_modules: ['stok'] },
        "4553Tumum_AF@1112": { role: "ASSET", allowed_modules: ['asset'] },
        "user_@1234": { role: "USER_BOOKING", allowed_modules: ['booking'] },
        "user_@2345": { role: "USER_K3", allowed_modules: ['k3'] }
    },
    // 📦 Daftar modul (sama dengan manifest)
    MODULES: [
        { id: 'booking', name: 'Booking Sarana', icon: '📅', color: 'from-blue-500 to-blue-700' },
        { id: 'k3', name: 'Laporan K3', icon: '⚠️', color: 'from-orange-500 to-red-600' },
        { id: 'sekuriti', name: 'Laporan Sekuriti', icon: '🛡️', color: 'from-emerald-500 to-teal-700' },
        { id: 'janitor-indoor', name: 'Janitor Indoor', icon: '🧹', color: 'from-cyan-500 to-cyan-700' },
        { id: 'janitor-outdoor', name: 'Janitor Outdoor', icon: '🌿', color: 'from-green-500 to-green-700' },
        { id: 'stok', name: 'Alat & Stok', icon: '📦', color: 'from-purple-500 to-purple-700' },
        { id: 'maintenance', name: 'Maintenance', icon: '🔧', color: 'from-amber-500 to-amber-700' },
        { id: 'asset', name: 'Asset', icon: '🏢', color: 'from-slate-500 to-slate-700' },
        { id: 'commandcenter', name: 'Command Center', icon: '📊', color: 'from-pink-500 to-pink-700' }
    ],
    workHours: { start: 7.5, end: 16.0 },
    lockoutTime: 300
};

// 1. Inisialisasi Supabase
const supabaseClient = supabase.createClient(CONFIG.SUPABASE.URL, CONFIG.SUPABASE.KEY);
window.supabase = supabaseClient; // supaya bisa dipakai di modul

// 2. State global
let currentUser = null;
let currentRole = null;
let currentAllowedModules = [];
let failedAttempts = 0;
let isLocked = false;

// 3. Helper: Toast (pastikan elemen #toast-container ada di HTML)
function showToast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// 4. Toggle password (eye icon) - perbaiki parameter event
window.togglePass = function(icon) {
    const input = document.getElementById('access-key');
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    }
};

// 5. Cek akses
async function checkAccess() {
    if (isLocked) return;
    const key = document.getElementById('access-key').value.trim();
    const userData = CONFIG.KEYS[key];

    if (userData) {
        failedAttempts = 0;
        currentUser = key;
        currentRole = userData.role;
        currentAllowedModules = userData.allowed_modules;

        sessionStorage.setItem('dream_session', key);
        sessionStorage.setItem('dream_role', userData.role);
        sessionStorage.setItem('dream_modules', JSON.stringify(userData.allowed_modules));

        if (!userData.noLog) {
            await logActivity('login', key);
        }

        showToast(`Selamat datang, ${userData.role}!`, 'success');

        // Sembunyikan login, tampilkan app-shell
        document.getElementById('login-zone').classList.add('hidden');
        document.getElementById('app-shell').classList.remove('hidden');

        // Update UI header
        document.getElementById('user-display').textContent = userData.role;
        document.getElementById('mode-tag').textContent = userData.role;

        // Render grid modul
        renderGrid();

        // Muat data slide
        loadSlideData();

        // Mulai jam
        startClock();

        // Mulai slider shalawat
        startShalawatSlider();

    } else {
        failedAttempts++;
        const err = document.getElementById('error-msg');
        err.textContent = `Akses ditolak (${failedAttempts}/3)`;
        err.classList.remove('opacity-0');
        showToast('Access Denied!', 'error');

        if (failedAttempts >= 3) lockout();
        setTimeout(() => err.classList.add('opacity-0'), 2000);

        await logActivity('login_failed', key);
    }
}

// 6. Lockout jika 3x gagal
function lockout() {
    isLocked = true;
    const btn = document.getElementById('btnLogin');
    const timerDisplay = document.getElementById('lockout-timer');
    btn.disabled = true;
    btn.classList.add('bg-slate-400');
    timerDisplay.classList.remove('hidden');

    let sec = CONFIG.lockoutTime;
    const interval = setInterval(() => {
        const min = Math.floor(sec / 60);
        const s = sec % 60;
        timerDisplay.textContent = `SYSTEM LOCKED: ${min}:${s < 10 ? '0' : ''}${s}`;
        sec--;
        if (sec < 0) {
            clearInterval(interval);
            isLocked = false;
            failedAttempts = 0;
            btn.disabled = false;
            btn.classList.remove('bg-slate-400');
            timerDisplay.classList.add('hidden');
            showToast('System unlocked. Try again.', 'warning');
        }
    }, 1000);
}

// 7. Render grid modul berdasarkan allowed_modules
function renderGrid() {
    const container = document.getElementById('grid-container');
    if (!container) return;
    container.innerHTML = '';
    CONFIG.MODULES.forEach(m => {
        if (currentAllowedModules.includes(m.id)) {
            container.innerHTML += `
                <div onclick="openModule('${m.id}')" class="icon-card glass-light rounded-[2.2rem] p-4 flex flex-col items-center border-b-2 border-transparent hover:border-emerald-500 transition-all">
                    <div class="w-14 h-14 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center text-2xl mb-3 shadow-lg">
                        ${m.icon}
                    </div>
                    <span class="text-[9px] font-black uppercase text-center text-slate-800 leading-tight">${m.name}</span>
                </div>
            `;
        }
    });
}

// 8. Buka modul (mirip core.openMod)
window.openModule = async function(id) {
    const hour = new Date().getHours() + new Date().getMinutes()/60;
    if (id === 'booking' && (hour < CONFIG.workHours.start || hour > CONFIG.workHours.end)) {
        showToast('Booking hanya 07:30 - 16:00!', 'warning');
        return;
    }

    const mod = CONFIG.MODULES.find(m => m.id === id);
    if (!mod) return;

    // Sembunyikan app-shell, tampilkan module-window
    document.getElementById('app-shell').classList.add('hidden');
    document.getElementById('module-window').classList.remove('hidden');
    const content = document.getElementById('module-content');
    content.innerHTML = `
        <div class="text-center py-20">
            <div class="spinner w-16 h-16 mx-auto mb-4"></div>
            <p class="text-emerald-400 font-mono text-sm animate-pulse">Loading ${mod.name}...</p>
        </div>
    `;

    try {
        const res = await fetch(`./modules/${id}/index.html`);
        if (!res.ok) throw new Error('Module not found');
        const html = await res.text();
        content.innerHTML = html;

        // Load module script
        const oldScript = document.getElementById('module-script');
        if (oldScript) oldScript.remove();
        const script = document.createElement('script');
        script.id = 'module-script';
        script.src = `./modules/${id}/${id}.js`;
        script.onerror = () => console.log(`JS module ${id} not found`);
        document.body.appendChild(script);
    } catch (err) {
        content.innerHTML = `<div class="p-20 text-center opacity-50 italic">Modul ${mod.name} sedang disempurnakan...</div>`;
    }
};

// 9. Tutup modul dan kembali ke app-shell
window.closeModule = function() {
    document.getElementById('module-window').classList.add('hidden');
    document.getElementById('app-shell').classList.remove('hidden');
    document.getElementById('module-content').innerHTML = '';
};

// 10. Fungsi untuk 7-slide panel (ambil data dari Supabase)
async function loadSlideData() {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        // Booking hari ini
        const { data: bookings } = await supabaseClient
            .from('bookings')
            .select('nama_peminjam, ruang, jam_mulai')
            .eq('tanggal', today)
            .eq('status', 'approved')
            .order('jam_mulai', { ascending: true })
            .limit(5);
        const bookingList = document.getElementById('today-booking-list');
        if (bookingList) {
            bookingList.innerHTML = bookings?.length 
                ? bookings.map(b => `<div class="flex justify-between text-[10px] border-b border-slate-700 pb-1"><span>${b.jam_mulai} - ${b.nama_peminjam}</span><span class="text-emerald-400">${b.ruang}</span></div>`).join('')
                : '<p class="text-slate-400 text-[10px]">Tidak ada booking hari ini</p>';
        }

        // K3 hari ini
        const { data: k3 } = await supabaseClient
            .from('k3_reports')
            .select('lokasi, jenis_laporan')
            .eq('tanggal', today)
            .limit(5);
        const k3List = document.getElementById('today-k3-list');
        if (k3List) {
            k3List.innerHTML = k3?.length
                ? k3.map(k => `<div class="flex justify-between text-[10px] border-b border-slate-700 pb-1"><span>${k.lokasi}</span><span class="text-orange-400">${k.jenis_laporan}</span></div>`).join('')
                : '<p class="text-slate-400 text-[10px]">Tidak ada laporan K3</p>';
        }

        // Cuaca & mitigasi (gunakan API OpenWeather)
        await updateWeather();

        // Pengumuman & konten dinamis dari admin_info
        const { data: ann } = await supabaseClient
            .from('admin_info')
            .select('content')
            .eq('slide_number', 5)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
        document.getElementById('admin-announcement').innerHTML = `<p class="text-sm">${ann?.content || 'Tidak ada pengumuman'}</p>`;

        const slide6 = await supabaseClient.from('admin_info').select('content').eq('slide_number', 6).order('created_at', { ascending: false }).limit(1).maybeSingle();
        document.getElementById('dynamic-slide-6').innerHTML = `<p class="text-sm">${slide6.data?.content || 'Kosong'}</p>`;

        const slide7 = await supabaseClient.from('admin_info').select('content').eq('slide_number', 7).order('created_at', { ascending: false }).limit(1).maybeSingle();
        document.getElementById('dynamic-slide-7').innerHTML = `<p class="text-sm">${slide7.data?.content || 'Kosong'}</p>`;

    } catch (err) {
        console.warn('Slide data error:', err);
    }
}

// 11. Update cuaca
async function updateWeather() {
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=-6.4&lon=106.8&appid=f7890d7569950ffa34a5827880e8442f&units=metric`);
        const data = await res.json();
        const iconMap = { Clear: '☀️', Clouds: '☁️', Rain: '🌧️', Drizzle: '🌦️', Thunderstorm: '⛈️', Snow: '❄️', Mist: '🌫️', Fog: '🌫️' };
        document.getElementById('weather-icon-big').innerText = iconMap[data.weather[0].main] || '🌤️';
        document.getElementById('weather-temp-big').innerText = Math.round(data.main.temp) + '°C';
        document.getElementById('weather-desc-big').innerText = data.weather[0].description.toUpperCase();
        document.getElementById('weather-humidity').innerText = data.main.humidity + '%';
        document.getElementById('weather-wind').innerText = Math.round(data.wind.speed * 3.6) + ' km/h';
        document.getElementById('traffic-status').innerText = 'Lancar';
        document.getElementById('disaster-status').innerText = 'Aman';
    } catch (e) {}
}

// 12. Jam digital
function startClock() {
    setInterval(() => {
        const clock = document.getElementById('clock');
        if (clock) clock.textContent = new Date().toLocaleTimeString('id-ID');
    }, 1000);
}

// 13. Slider Shalawat (3 slide)
function startShalawatSlider() {
    const texts = [
        { ar: "بِسْمِ اللَّهِ بِإِذْنِ اللَّهِ", id: "Bismillah bi idznillah" },
        { ar: "اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ", id: "The Power Soul of Shalawat" },
        { ar: "فَرِيقُ الأَحْلَامِ", id: "Dream Team: Out of The Box Inside" }
    ];
    let i = 0;
    const box = document.getElementById('shalawat-slider');
    if (!box) return;
    const update = () => {
        box.innerHTML = `<div class="animate-up text-center"><p class="font-arabic text-2xl text-emerald-600 font-black mb-1">${texts[i].ar}</p><p class="text-[8px] uppercase tracking-[0.3em] text-slate-400 font-bold italic">${texts[i].id}</p></div>`;
        i = (i + 1) % texts.length;
    };
    update();
    setInterval(update, 7000);
}

// 14. Log aktivitas ke Supabase
async function logActivity(action, detail) {
    if (currentRole === 'DEVELOPER' || currentRole === 'MASTER') return; // ghost mode
    try {
        await supabaseClient.from('audit_logs').insert([{
            action,
            detail,
            user: currentRole,
            device: navigator.userAgent,
            created_at: new Date().toISOString()
        }]);
    } catch (e) {}
}

// 15. Logout
window.logout = function() {
    sessionStorage.clear();
    location.reload();
};

// 16. Pengecekan session saat halaman dimuat
window.addEventListener('DOMContentLoaded', () => {
    const session = sessionStorage.getItem('dream_session');
    const role = sessionStorage.getItem('dream_role');
    const modulesJson = sessionStorage.getItem('dream_modules');

    if (session && role && modulesJson) {
        currentUser = session;
        currentRole = role;
        currentAllowedModules = JSON.parse(modulesJson);
        document.getElementById('login-zone').classList.add('hidden');
        document.getElementById('app-shell').classList.remove('hidden');
        document.getElementById('user-display').textContent = role;
        document.getElementById('mode-tag').textContent = role;
        renderGrid();
        loadSlideData();
        startClock();
        startShalawatSlider();
        showToast('Selamat datang kembali!', 'success');
    }

    // Inisialisasi event listener untuk toggle eye jika ada
    const toggleBtn = document.getElementById('toggleEye');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            togglePass(this);
        });
    }

    // Enter untuk login
    document.getElementById('access-key')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') checkAccess();
    });
});

// Expose fungsi ke global
window.checkAccess = checkAccess;