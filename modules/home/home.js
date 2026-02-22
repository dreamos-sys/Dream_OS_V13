<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#00f3ff">
    <title>Dream OS v13.4</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Inter',sans-serif;min-height:100vh;background:linear-gradient(135deg,#0a0e27,#1a1f3a);color:#e2e8f0}
        .glass{background:rgba(255,255,255,0.05);border:1px solid rgba(0,243,255,0.2);border-radius:20px;backdrop-filter:blur(10px)}
        .neon-text{text-shadow:0 0 10px rgba(0,243,255,0.5)}
        .spinner{width:40px;height:40px;border:3px solid rgba(0,243,255,0.2);border-top-color:#00f3ff;border-radius:50%;animation:spin 1s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .menu-card{transition:all 0.3s}
        .menu-card:hover{transform:translateY(-4px);box-shadow:0 8px 24px rgba(0,243,255,0.2)}
        .slide{display:none;position:absolute;inset:0;align-items:center;justify-content:center;padding:1.5rem;text-align:center;animation:fadeIn 0.5s}
        .slide.active{display:flex}
        .bottom-nav{position:fixed;bottom:0;left:0;right:0;background:rgba(10,14,39,0.95);backdrop-filter:blur(20px);border-top:1px solid rgba(0,243,255,0.2);padding:0.75rem;display:flex;justify-content:space-around;z-index:100}
        .nav-item{display:flex;flex-direction:column;align-items:center;color:#94a3b8;font-size:0.65rem;transition:color 0.3s}
        .nav-item.active{color:#00f3ff}
        .nav-item i{font-size:1.5rem;margin-bottom:0.25rem}
        .loading-screen{position:fixed;inset:0;background:linear-gradient(135deg,#0a0e27,#1a1f3a);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;transition:opacity 0.5s}
        .loading-screen.hidden{opacity:0;pointer-events:none}
    </style>
</head>
<body>

    <!-- LOADING SCREEN -->
    <div id="loading" class="loading-screen">
        <div class="spinner" style="width:60px;height:60px;border-width:4px;margin-bottom:1.5rem"></div>
        <h1 class="text-2xl font-bold neon-text mb-2">DREAM OS</h1>
        <p class="text-sm text-slate-400">v13.4 - Enterprise Edition</p>
        <p class="text-xs text-slate-500 mt-6">🤖 AI Powered • 🔒 Secure</p>
    </div>

    <!-- MAIN APP -->
    <div id="app" class="max-w-6xl mx-auto min-h-screen flex flex-col pb-20">
        
        <!-- HEADER -->
        <header class="text-center py-6 px-4">
            <p class="text-sm text-slate-400 mb-2">بِسْمِ اللَّهِ</p>
            <h1 class="text-3xl font-black neon-text">DREAM <span style="color:#00f3ff">OS</span></h1>
            <p class="text-xs text-slate-500 mt-2">📊 Enterprise Management System</p>
        </header>

        <!-- SLIDESHOW -->        <div class="glass mx-4 mb-6 relative overflow-hidden" style="min-height:180px">
            <div class="slide active">
                <p class="text-2xl font-bold neon-text mb-2">✨ Welcome</p>
                <p class="text-sm text-slate-400">SIF Al-Fikri</p>
                <div class="flex gap-2 mt-3 justify-center">
                    <span class="bg-emerald-600/80 text-white text-[10px] font-bold px-3 py-1 rounded-full">ISO 27001</span>
                    <span class="bg-cyan-600/80 text-white text-[10px] font-bold px-3 py-1 rounded-full">v13.4</span>
                </div>
            </div>
            <div class="slide">
                <p class="text-2xl font-bold text-blue-400 mb-2">📅 Booking</p>
                <p class="text-4xl font-black" id="slide-booking">0</p>
                <p class="text-xs text-slate-400">Pending</p>
            </div>
            <div class="slide">
                <p class="text-2xl font-bold text-orange-400 mb-2">⚠️ K3</p>
                <p class="text-4xl font-black" id="slide-k3">0</p>
                <p class="text-xs text-slate-400">Laporan</p>
            </div>
            <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span class="w-2 h-2 rounded-full bg-slate-600"></span>
                <span class="w-2 h-2 rounded-full bg-slate-600"></span>
            </div>
        </div>

        <!-- MODULES GRID -->
        <div class="px-4 flex-1">
            <h2 class="text-sm font-bold text-slate-400 mb-3">📱 MODULES</h2>
            <div id="menu-grid" class="grid grid-cols-3 gap-3"></div>
        </div>

        <!-- MAIN CONTENT -->
        <main id="main-content" class="px-4 mt-6"></main>
    </div>

    <!-- BOTTOM NAV -->
    <nav class="bottom-nav">
        <a href="#home" class="nav-item active"><i class="fas fa-house"></i><span>Home</span></a>
        <a href="#booking" class="nav-item"><i class="fas fa-calendar"></i><span>Booking</span></a>
        <a href="#k3" class="nav-item"><i class="fas fa-triangle-exclamation"></i><span>K3</span></a>
        <a href="#commandcenter" class="nav-item"><i class="fas fa-chart-pie"></i><span>Admin</span></a>
        <a href="#inventaris" class="nav-item"><i class="fas fa-clipboard-list"></i><span>Inventory</span></a>
    </nav>

    <!-- SUPABASE -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    
    <!-- APP SCRIPT -->
    <script>        // ===== CONFIG =====
        const CONFIG={
            supabase:{url:'https://rqpodzjexghrvcpyacyo.supabase.co',key:'sb_publishable_U9MbSdPJOMSmaw3BsHJcVQ_PDiOy-UM'},
            debug:true
        };
        window.supabase=supabase.createClient(CONFIG.supabase.url,CONFIG.supabase.key);
        
        // ===== HIDE LOADING =====
        setTimeout(()=>{document.getElementById('loading').classList.add('hidden')},1500);
        
        // ===== SLIDESHOW =====
        let slide=0;
        const slides=document.querySelectorAll('.slide');
        setInterval(()=>{slides[slide].classList.remove('active');slide=(slide+1)%slides.length;slides[slide].classList.add('active')},4000);
        
        // ===== UPDATE STATS =====
        async function updateStats(){
            try{
                const{count:b}=await supabase.from('bookings').select('*',{count:'exact',head:true}).eq('status','pending');
                document.getElementById('slide-booking').textContent=b||0;
                const{count:k}=await supabase.from('k3_reports').select('*',{count:'exact',head:true}).eq('status','pending');
                document.getElementById('slide-k3').textContent=k||0;
            }catch(e){console.warn(e)}
        }
        updateStats();
        setInterval(updateStats,30000);
        
        // ===== MENU MAP (23 MODULES) =====
        const menuMap={
            'home':{name:'Home',sub:'Dashboard',icon:'fa-house',color:'bg-gradient-to-br from-amber-500 to-amber-700'},
            'booking':{name:'Booking',sub:'Sarana',icon:'fa-calendar-check',color:'bg-gradient-to-br from-blue-500 to-blue-700'},
            'k3':{name:'K3',sub:'Laporan',icon:'fa-triangle-exclamation',color:'bg-gradient-to-br from-orange-500 to-orange-700'},
            'sekuriti':{name:'Sekuriti',sub:'Laporan',icon:'fa-shield-halved',color:'bg-gradient-to-br from-green-600 to-green-800'},
            'janitor-indoor':{name:'Janitor',sub:'Indoor',icon:'fa-broom',color:'bg-gradient-to-br from-teal-500 to-teal-700'},
            'janitor-outdoor':{name:'Janitor',sub:'Outdoor',icon:'fa-leaf',color:'bg-gradient-to-br from-cyan-500 to-cyan-700'},
            'stok':{name:'Stok',sub:'Alat',icon:'fa-box-archive',color:'bg-gradient-to-br from-purple-600 to-purple-800'},
            'maintenance':{name:'Maintenance',sub:'Perbaikan',icon:'fa-screwdriver-wrench',color:'bg-gradient-to-br from-yellow-600 to-yellow-800'},
            'asset':{name:'Asset',sub:'Inventaris',icon:'fa-building-shield',color:'bg-gradient-to-br from-indigo-600 to-indigo-800'},
            'commandcenter':{name:'Command',sub:'Center',icon:'fa-file-signature',color:'bg-gradient-to-br from-pink-600 to-pink-800'},
            'dana':{name:'Dana',sub:'Keuangan',icon:'fa-money-bill-wave',color:'bg-gradient-to-br from-emerald-600 to-emerald-800'},
            'spj':{name:'SPJ',sub:'Laporan',icon:'fa-file-invoice',color:'bg-gradient-to-br from-cyan-600 to-cyan-800'},
            'reminder':{name:'Reminder',sub:'Pengingat',icon:'fa-bell',color:'bg-gradient-to-br from-red-600 to-red-800'},
            'weather':{name:'Cuaca',sub:'Real-time',icon:'fa-cloud-sun',color:'bg-gradient-to-br from-sky-600 to-sky-800'},
            'lalin':{name:'Lalin',sub:'Traffic',icon:'fa-traffic-light',color:'bg-gradient-to-br from-lime-600 to-lime-800'},
            'mitigasi':{name:'Mitigasi',sub:'Bencana',icon:'fa-first-aid',color:'bg-gradient-to-br from-rose-600 to-rose-800'},
            'ai-speak':{name:'AI',sub:'Voice',icon:'fa-microphone-lines',color:'bg-gradient-to-br from-violet-600 to-violet-800'},
            'prediction':{name:'Predict',sub:'AI',icon:'fa-chart-line',color:'bg-gradient-to-br from-fuchsia-600 to-fuchsia-800'},
            'inventaris':{name:'Inventaris',sub:'Aset',icon:'fa-clipboard-list',color:'bg-gradient-to-br from-purple-500 to-purple-700'},
            'gudang':{name:'Gudang',sub:'Warehouse',icon:'fa-warehouse',color:'bg-gradient-to-br from-orange-600 to-orange-800'}
        };        
        // ===== ROUTES =====
        const routes={
            '#home':'./modules/home/index.html',
            '#booking':'./modules/booking/index.html',
            '#k3':'./modules/k3/index.html',
            '#commandcenter':'./modules/commandcenter/index.html',
            '#inventaris':'./modules/inventaris/index.html',
            '#gudang':'./modules/gudang/index.html'
        };
        
        // ===== RENDER MENU =====
        function renderMenu(){
            const allowed=JSON.parse(sessionStorage.getItem('allowed_modules')||'[]');
            const visible=allowed.filter(id=>menuMap[id]);
            const grid=document.getElementById('menu-grid');
            
            if(visible.length===0){
                grid.innerHTML='<div class="col-span-full text-center py-8 opacity-60"><p>Tidak ada modul.</p></div>';
            }else{
                grid.innerHTML=visible.map((id,i)=>{
                    const m=menuMap[id];
                    return `<a href="#${id}" class="menu-card ${m.color} text-white p-4 rounded-2xl text-center flex flex-col items-center justify-center" style="animation:fadeIn 0.3s ease ${i*0.05}s backwards"><i class="fas ${m.icon} text-3xl mb-2"></i><span class="text-sm font-bold">${m.name}</span><span class="text-[9px] uppercase opacity-80">${m.sub}</span></a>`;
                }).join('');
            }
        }
        
        // ===== ROUTER =====
        async function router(){
            const main=document.getElementById('main-content');
            const allowed=sessionStorage.getItem('allowed_modules');
            
            if(!allowed){
                renderLogin();
                return;
            }
            
            renderMenu();
            
            const hash=window.location.hash||'#home';
            const path=routes[hash];
            
            if(path){
                try{
                    main.innerHTML='<div class="text-center py-8"><div class="spinner" style="margin:0 auto 1rem"></div><p class="text-sm text-slate-400">Loading...</p></div>';
                    const r=await fetch(path);
                    main.innerHTML=await r.text();
                }catch(e){main.innerHTML='<p class="text-center text-red-400">Error: '+e.message+'</p>'}
            }
        }        
        // ===== LOGIN =====
        function renderLogin(){
            document.getElementById('main-content').innerHTML=`
                <div class="glass p-6 rounded-2xl max-w-md mx-auto mt-8">
                    <div class="text-center mb-4">
                        <i class="fas fa-lock text-5xl mb-3" style="color:#00f3ff"></i>
                        <h2 class="text-xl font-bold">Dream OS</h2>
                        <p class="text-xs text-slate-400">Access Control</p>
                    </div>
                    <input type="password" id="pass" placeholder="Access Code" class="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-center mb-3">
                    <button onclick="login()" class="w-full bg-cyan-600 hover:bg-cyan-500 text-white p-3 rounded-xl font-bold">LOGIN</button>
                    <p id="msg" class="text-center text-sm mt-3"></p>
                </div>
            `;
        }
        
        async function login(){
            const code=document.getElementById('pass').value;
            const msg=document.getElementById('msg');
            msg.innerHTML='<span class="text-yellow-400">⏳...</span>';
            const{data}=await supabase.from('access_codes').select('allowed_modules').eq('code',code).maybeSingle();
            if(data){
                sessionStorage.setItem('allowed_modules',JSON.stringify(data.allowed_modules));
                msg.innerHTML='<span class="text-green-400">✅ Success!</span>';
                setTimeout(()=>{window.location.hash='#home';router()},1000);
            }else{
                msg.innerHTML='<span class="text-red-400">❌ Wrong!</span>';
            }
        }
        
        // ===== NAV ACTIVE =====
        document.querySelectorAll('.nav-item').forEach(item=>{
            item.addEventListener('click',()=>{
                document.querySelectorAll('.nav-item').forEach(i=>i.classList.remove('active'));
                item.classList.add('active');
            });
        });
        
        // ===== INIT =====
        window.addEventListener('hashchange',router);
        window.addEventListener('load',()=>{console.log('🚀 Dream OS Loaded');router()});
    </script>
</body>
</html>