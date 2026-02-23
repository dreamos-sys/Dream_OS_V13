<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DREAM OS v13.0 - Master Config</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    
    <style>
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
        body { font-family: 'JetBrains+Mono', monospace; overflow: hidden; }
        .glass { background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1); }
        .ghost-border { border: 1px solid rgba(139, 92, 246, 0.3); box-shadow: 0 0 15px rgba(139, 92, 246, 0.1); }
        .shimmer { background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%); background-size: 200% 100%; animation: shimmer 2s infinite; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    </style>
</head>
<body class="bg-[#020617] text-slate-200 w-screen h-screen">

    <div id="login-zone" class="fixed inset-0 z-[999] flex items-center justify-center bg-[#020617]">
        <div class="w-full max-w-sm p-8 rounded-[2rem] glass ghost-border text-center">
            <div class="mb-6">
                <i class="fas fa-microchip text-4xl text-purple-500 mb-2"></i>
                <h1 class="text-xl font-bold tracking-widest uppercase">Dream OS <span class="text-purple-400">v13</span></h1>
                <p class="text-[10px] text-slate-500">Out of The Box Inside</p>
            </div>

            <div class="space-y-4">
                <div class="relative">
                    <input type="password" id="access-key" 
                           class="w-full bg-slate-900/50 border border-slate-700 p-4 rounded-xl text-center focus:outline-none focus:border-purple-500 transition-all" 
                           placeholder="••••••••">
                    <i class="fas fa-eye-slash absolute right-4 top-5 text-slate-600 cursor-pointer hover:text-white" onclick="togglePass()"></i>
                </div>
                <button onclick="checkAccess()" 
                        class="w-full bg-white text-black font-bold p-4 rounded-xl hover:bg-purple-500 hover:text-white transition-all">
                    BISMILLAH
                </button>
            </div>
            <p id="error-msg" class="text-red-500 text-[10px] mt-4 opacity-0 transition-opacity">AKSES DITOLAK: NIAT TIDAK TERDETEKSI</p>
        </div>
    </div>

    <div id="app-shell" class="hidden h-screen flex flex-col">
        <header class="h-16 border-b border-slate-800 flex items-center justify-between px-6 glass">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <i class="fas fa-ghost text-sm"></i>
                </div>
                <div>
                    <h2 id="user-display" class="text-xs font-bold leading-none">MY BRO</h2>
                    <span id="mode-tag" class="text-[9px] text-purple-400">GHOST MODE ACTIVE</span>
                </div>
            </div>
            <div class="flex items-center gap-4 text-xs">
                <span id="clock" class="text-slate-400">00:00:00</span>
                <button onclick="logout()" class="text-red-400 hover:text-red-300"><i class="fas fa-power-off"></i></button>
            </div>
        </header>

        <main id="view-port" class="flex-1 overflow-auto p-4 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-[#020617]">
            <div id="loader" class="hidden flex flex-col items-center justify-center h-full">
                <div class="w-12 h-1 shimmers rounded-full overflow-hidden mb-2"></div>
                <p class="text-[10px] text-slate-500 italic">Connecting to Dream Core...</p>
            </div>
            <div id="module-content"></div>
        </main>

        <nav class="h-16 border-t border-slate-800 glass flex items-center justify-around px-2">
            <button onclick="loadModule('dashboard')" class="nav-btn text-purple-500"><i class="fas fa-home"></i></button>
            <button onclick="loadModule('inventory')" class="nav-btn text-slate-500"><i class="fas fa-boxes"></i></button>
            <button onclick="loadModule('approval')" class="nav-btn text-slate-500"><i class="fas fa-check-double"></i></button>
            <button onclick="loadModule('security')" class="nav-btn text-slate-500"><i class="fas fa-shield-alt"></i></button>
        </nav>
    </div>

    <script src="router.js"></script>
</body>
</html>
