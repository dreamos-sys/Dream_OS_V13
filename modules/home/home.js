// modules/home/home.js
(function() {
    const allowed = JSON.parse(sessionStorage.getItem('allowed_modules') || '[]');
    const debugDiv = document.getElementById('debug-info');
    if (debugDiv) debugDiv.innerText = 'Modul diizinkan: ' + (allowed.join(', ') || 'kosong');

    const menuMap = {
        booking: { name: 'Booking Sarana', icon: '📅', color: 'bg-blue-500' },
        k3: { name: 'Laporan K3', icon: '⚠️', color: 'bg-orange-500' }
    };

    const grid = document.getElementById('menu-grid');
    const visible = allowed.filter(id => menuMap[id]);
    if (visible.length === 0) {
        grid.innerHTML = '<p class="col-span-full text-center">Tidak ada modul tersedia.</p>';
    } else {
        grid.innerHTML = visible.map(id => `
            <a href="#${id}" class="${menuMap[id].color} text-white p-4 rounded-xl text-center font-semibold shadow">
                <span class="block text-2xl mb-1">${menuMap[id].icon}</span>
                ${menuMap[id].name}
            </a>
        `).join('');
    }

    document.getElementById('logout').addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.removeItem('allowed_modules');
        window.location.reload();
    });
})();
     async function loadModule() {
    // ... (kode sebelumnya)
    try {
        const res = await fetch(path);
        const html = await res.text();
        document.getElementById('main-content').innerHTML = html;
        
        // Load JavaScript untuk modul (termasuk home)
        const script = document.createElement('script');
        script.type = 'module';
        script.src = `./modules/${moduleId}/${moduleId}.js`;
        document.body.appendChild(script);
    } catch (err) { ... }
     }
