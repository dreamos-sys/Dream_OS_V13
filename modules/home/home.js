(function() {
    const allowed = JSON.parse(sessionStorage.getItem('allowed_modules') || '[]');

    const menuMap = {
        'booking': { name: 'Booking', sub: 'Sarana', icon: 'fa-calendar-check', color: 'bg-gradient-to-br from-blue-500 to-blue-700' },
        'k3': { name: 'K3', sub: 'Laporan', icon: 'fa-triangle-exclamation', color: 'bg-gradient-to-br from-orange-500 to-orange-700' },
        'sekuriti': { name: 'Sekuriti', sub: 'Laporan', icon: 'fa-shield-halved', color: 'bg-gradient-to-br from-green-600 to-green-800' },
        'janitor-indoor': { name: 'Janitor', sub: 'Indoor', icon: 'fa-broom', color: 'bg-gradient-to-br from-teal-500 to-teal-700' },
        'janitor-outdoor': { name: 'Janitor', sub: 'Outdoor', icon: 'fa-leaf', color: 'bg-gradient-to-br from-cyan-500 to-cyan-700' },
        'stok': { name: 'Stok', sub: 'Alat &', icon: 'fa-box-archive', color: 'bg-gradient-to-br from-purple-600 to-purple-800' },
        'maintenance': { name: 'Maintenance', sub: 'Perbaikan', icon: 'fa-screwdriver-wrench', color: 'bg-gradient-to-br from-yellow-600 to-yellow-800' },
        'asset': { name: 'Asset', sub: 'Inventaris', icon: 'fa-building-shield', color: 'bg-gradient-to-br from-indigo-600 to-indigo-800' },
        'commandcenter': { name: 'Command', sub: 'Center', icon: 'fa-file-signature', color: 'bg-gradient-to-br from-pink-600 to-pink-800' }
    };

    const visible = allowed.filter(id => menuMap[id]);
    const grid = document.getElementById('menu-grid');

    if (visible.length === 0) {
        grid.innerHTML = '<p class="col-span-3 text-center opacity-60">Tidak ada modul tersedia.</p>';
    } else {
        grid.innerHTML = visible.map(id => {
            const m = menuMap[id];
            return `
                <a href="#${id}" 
                   class="menu-card ${m.color} text-white p-3 rounded-2xl text-center flex flex-col items-center justify-center active:scale-95 transition-transform duration-100">
                    <i class="fas ${m.icon} text-3xl mb-1"></i>
                    <span class="text-sm font-bold">${m.name}</span>
                    <span class="text-[8px] uppercase tracking-wider opacity-80">${m.sub}</span>
                </a>
            `;
        }).join('');
    }

    // Logout (cukup satu listener)
    const logoutBtn = document.getElementById('logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('allowed_modules');
            // Redirect ke halaman utama (relative path aman)
            window.location.href = '/';
        });
    }
})();