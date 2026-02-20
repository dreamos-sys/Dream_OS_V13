(function() {
    const grid = document.getElementById('menu-grid');
    if (!grid) return;

    const allowed = JSON.parse(sessionStorage.getItem('allowed_modules') || '[]');
    
    const menuMap = {
        'booking': { name: 'Booking', icon: '📅', color: 'bg-blue-500' },
        'k3': { name: 'K3 Report', icon: '⚠️', color: 'bg-orange-500' },
        'sekuriti': { name: 'Security', icon: '🛡️', color: 'bg-emerald-600' },
        'janitor-indoor': { name: 'Janitor In', icon: '🧹', color: 'bg-teal-600' },
        'janitor-outdoor': { name: 'Janitor Out', icon: '🌿', color: 'bg-cyan-600' },
        'stok': { name: 'Inventory', icon: '📦', color: 'bg-purple-600' },
        'maintenance': { name: 'Maint.', icon: '🔧', color: 'bg-yellow-600' },
        'asset': { name: 'Asset', icon: '🏢', color: 'bg-indigo-600' },
        'commandcenter': { name: 'Command', icon: '📊', color: 'bg-rose-600' }
    };

    grid.innerHTML = allowed.filter(id => menuMap[id]).map(id => `
        <a href="#${id}" class="group relative overflow-hidden ${menuMap[id].color} p-5 rounded-[2rem] text-white flex flex-col items-center justify-center shadow-lg transform transition active:scale-90">
            <span class="text-3xl mb-2 group-hover:scale-125 transition-transform">${menuMap[id].icon}</span>
            <span class="text-[10px] font-black uppercase tracking-tighter">${menuMap[id].name}</span>
        </a>
    `).join('');

    document.getElementById('btnLogout').onclick = () => {
        sessionStorage.clear();
        window.location.reload();
    };
})();
