/**
 * 🛰️ DREAM OS ROUTER - v13.0 MASTER CONFIGURATION
 * Core Logic: Ghost Stealth Mode vs Admin ISO Mode
 * Created for: My Bro (Erwinsyah & Hanung Budianto S.E)
 */

const CONFIG = {
    // 🔑 DATA REAL SUPABASE ANTUM (OUT OF THE BOX INSIDE)
    SB_URL: "https://zntofshvpxvrmvubrltq.supabase.co", 
    SB_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpudG9mc2h2cHh2cm12dWJybHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY1ODkyMjksImV4cCI6MjA1MjE2NTIyOX0.S_1-M9yXp-yqW-C7-f8-Q8-Y-Z-A-B-C", // Ini Anon Key Antum!

    // 🔐 PASSWORD SAKRAL
    KEYS: {
        GHOST: "Bismillah-Ghost-V13", // Develop: Erwinsyah (NO LOG)
        ADMIN: "Admin-Shalawat-2026"  // Approver: Hanung Budianto S.E (ISO LOG)
    }
};

// 1. Inisialisasi Supabase
if (typeof supabase !== 'undefined') {
    window.supabaseClient = supabase.createClient(CONFIG.SB_URL, CONFIG.SB_KEY);
    console.log("✅ Dream Core Synchronized.");
}

// 2. Real-time Clock (Power Soul of Shalawat)
setInterval(() => {
    const clock = document.getElementById('clock');
    if (clock) {
        const now = new Date();
        clock.textContent = now.toLocaleTimeString('id-ID', { hour12: false });
    }
}, 1000);

// 3. Toggle Password (Eye Icon)
function togglePass() {
    const input = document.getElementById('access-key');
    const icon = event.target;
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    }
}

// 4. Logic Cek Akses (Ghost vs Admin)
async function checkAccess() {
    const input = document.getElementById('access-key').value;
    const error = document.getElementById('error-msg');
    
    error.classList.add('opacity-0');

    if (input === CONFIG.KEYS.GHOST) {
        setupSession('ERWINSYAH', 'GHOST_STEALTH');
        return;
    }

    if (input === CONFIG.KEYS.ADMIN) {
        setupSession('HANUNG BUDIANTO S.E', 'ADMIN_STANDARD');
        return;
    }

    error.classList.remove('opacity-0');
    console.warn("⚠️ Akses ditolak. Niat tidak terdeteksi.");
}

// 5. Setup Session & Security Shield
async function setupSession(user, mode) {
    sessionStorage.setItem('dream_user', user);
    sessionStorage.setItem('dream_mode', mode);

    const isRedmi = navigator.userAgent.includes("Redmi") || navigator.userAgent.includes("Xiaomi");
    if (!isRedmi && mode !== 'GHOST_STEALTH') {
        console.warn("⚠️ Warning: Akses luar perangkat Redmi Note detect!");
    }

    if (mode === 'ADMIN_STANDARD') {
        await logToSupabase('LOGIN', `Admin ${user} masuk sistem`);
    } else {
        console.log("%c👻 GHOST MODE: Aktif. Jejak dihapus dari kernel.", "color: #a855f7; font-weight: bold;");
    }

    document.getElementById('login-zone').classList.add('hidden');
    document.getElementById('app-shell').classList.remove('hidden');
    document.getElementById('user-display').textContent = user;
    document.getElementById('mode-tag').textContent = mode.replace('_', ' ');

    loadModule('dashboard');
}

// 6. Lazy Module Loader
async function loadModule(moduleName) {
    const content = document.getElementById('module-content');
    const loader = document.getElementById('loader');
    loader.classList.remove('hidden');
    
    try {
        const response = await fetch(`./modules/${moduleName}/index.html`);
        if (!response.ok) throw new Error('Module Not Found');
        const html = await response.text();
        content.innerHTML = html;
        
        const oldScript = document.getElementById('module-script');
        if (oldScript) oldScript.remove();
        const script = document.createElement('script');
        script.id = 'module-script';
        script.src = `./modules/${moduleName}/script.js`;
        document.body.appendChild(script);
    } catch (err) {
        content.innerHTML = `<div class="p-20 text-center opacity-50 italic">Modul ${moduleName} sedang disempurnakan...</div>`;
    } finally {
        loader.classList.add('hidden');
    }
}

// 7. Fungsi Log Supabase (Audit Trail ISO)
async function logToSupabase(action, detail) {
    const mode = sessionStorage.getItem('dream_mode');
    if (mode === 'GHOST_STEALTH' || !window.supabaseClient) return;

    try {
        await window.supabaseClient.from('audit_logs').insert([{
            action: action,
            detail: detail,
            user: sessionStorage.getItem('dream_user'),
            device: navigator.userAgent,
            timestamp: new Date().toISOString()
        }]);
    } catch (e) {
        console.error("Gagal kirim log ISO:", e);
    }
}

function logout() {
    sessionStorage.clear();
    location.reload();
}

window.onbeforeunload = function() {
    if (sessionStorage.getItem('dream_mode') === 'GHOST_STEALTH') {
        sessionStorage.clear();
    }
};
