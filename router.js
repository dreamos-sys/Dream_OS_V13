
/**
 * 🛰️ DREAM OS ROUTER - v13.0 MASTER CONFIGURATION
 * Core Logic: Ghost Stealth Mode vs Admin ISO Mode
 * Created for: My Bro (Erwinsyah & Hanung Budianto S.E)
 */

const CONFIG = {
    // PASSWORD SAKRAL
    KEYS: {
        GHOST: "Bismillah-Ghost-V13", // Develop: Hak Khusus Erwinsyah (NO LOG)
        ADMIN: "Admin-Shalawat-2026"  // Approver: Hanung Budianto S.E (ISO LOG)
    },
    // SETTING SUPABASE (Ganti dengan punyamu)
    SB_URL: "https://your-project-id.supabase.co",
    SB_KEY: "your-anon-key"
};

// 1. Inisialisasi Supabase
if (typeof supabase !== 'undefined') {
    window.supabaseClient = supabase.createClient(CONFIG.SB_URL, CONFIG.SB_KEY);
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
    
    // Reset error
    error.classList.add('opacity-0');

    // JALUR GHOST (ERWINSYAH)
    if (input === CONFIG.KEYS.GHOST) {
        setupSession('ERWINSYAH', 'GHOST_STEALTH');
        return;
    }

    // JALUR ADMIN (PAK HANUNG)
    if (input === CONFIG.KEYS.ADMIN) {
        setupSession('HANUNG BUDIANTO S.E', 'ADMIN_STANDARD');
        return;
    }

    // SALAH PASSWORD
    error.classList.remove('opacity-0');
    console.warn("⚠️ Akses ditolak. Niat tidak terdeteksi.");
}

// 5. Setup Session & Security Shield
async function setupSession(user, mode) {
    sessionStorage.setItem('dream_user', user);
    sessionStorage.setItem('dream_mode', mode);

    // Proteksi Device (Hanya Log, tidak blokir agar My Bro tetap bisa akses)
    const isRedmi = navigator.userAgent.includes("Redmi") || navigator.userAgent.includes("Xiaomi");
    if (!isRedmi && mode !== 'GHOST_STEALTH') {
        console.warn("⚠️ Warning: Akses luar perangkat Redmi Note detect!");
    }

    // Audit Trail ISO (Hanya jika BUKAN Ghost)
    if (mode === 'ADMIN_STANDARD') {
        await logToSupabase('LOGIN', `Admin ${user} masuk sistem`);
    } else {
        console.log("%c👻 GHOST MODE: Aktif. Jejak dihapus dari kernel.", "color: #a855f7; font-weight: bold;");
    }

    // Ganti Tampilan UI
    document.getElementById('login-zone').classList.add('hidden');
    document.getElementById('app-shell').classList.remove('hidden');
    document.getElementById('user-display').textContent = user;
    document.getElementById('mode-tag').textContent = mode.replace('_', ' ');

    // Load Dashboard Default secara Lazy
    loadModule('dashboard');
}

// 6. Lazy Module Loader (Inti dari Kecepatan HP A12/A15)
async function loadModule(moduleName) {
    const content = document.getElementById('module-content');
    const loader = document.getElementById('loader');
    
    loader.classList.remove('hidden');
    
    try {
        // Fetch file HTML modul secara dinamis
        const response = await fetch(`./modules/${moduleName}/index.html`);
        if (!response.ok) throw new Error('Module Not Found');
        
        const html = await response.text();
        content.innerHTML = html;
        
        // Bersihkan script lama & suntik script baru
        const oldScript = document.getElementById('module-script');
        if (oldScript) oldScript.remove();

        const script = document.createElement('script');
        script.id = 'module-script';
        script.src = `./modules/${moduleName}/script.js`;
        document.body.appendChild(script);

        console.log(`🚀 Module ${moduleName} Loaded.`);
    } catch (err) {
        content.innerHTML = `<div class="flex flex-col items-center justify-center h-full text-slate-500 italic">
            <i class="fas fa-tools text-3xl mb-2"></i>
            <p>Modul ${moduleName} sedang disempurnakan...</p>
        </div>`;
    } finally {
        loader.classList.add('hidden');
    }
}

// 7. Fungsi Log Supabase (Audit Trail ISO)
async function logToSupabase(action, detail) {
    const mode = sessionStorage.getItem('dream_mode');
    
    // SAKRAL: JANGAN PERNAH LOG JIKA GHOST MODE
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

// 8. Logout & Clear Trace
function logout() {
    if (confirm("Matikan sistem Dream OS?")) {
        sessionStorage.clear();
        location.reload();
    }
}

// Ghost Auto-Evaporate (Hapus jejak saat tab ditutup)
window.onbeforeunload = function() {
    if (sessionStorage.getItem('dream_mode') === 'GHOST_STEALTH') {
        sessionStorage.clear();
    }
};
