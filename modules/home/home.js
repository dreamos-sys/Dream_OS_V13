(function() {
    const debugDiv = document.getElementById('debug-info');
    const checkpoint = (num, msg) => {
        const status = '✅';
        if (debugDiv) debugDiv.innerHTML += `<br>${status} Checkpoint ${num}: ${msg}`;
        console.log(`${status} Checkpoint ${num}: ${msg}`);
    };

    try {
        checkpoint(1, 'Script started');

        const allowed = JSON.parse(sessionStorage.getItem('allowed_modules') || '[]');
        checkpoint(2, `Allowed modules: ${allowed.join(', ') || 'kosong'}`);

        const grid = document.getElementById('menu-grid');
        if (!grid) throw new Error('Menu grid not found!');
        checkpoint(3, 'Grid element found');

        const menuMap = {
            booking: { name: 'Booking Sarana', icon: '📅', color: 'bg-blue-500' },
            k3: { name: 'Laporan K3', icon: '⚠️', color: 'bg-orange-500' },
            security: { name: 'Laporan Sekuriti', icon: '🛡️', color: 'bg-green-600' },
            cs: { name: 'Ceklis Janitor', icon: '🧹', color: 'bg-teal-600' },
            alat: { name: 'Alat & Stok', icon: '📦', color: 'bg-purple-600' },
            maintenance: { name: 'Maintenance', icon: '🔧', color: 'bg-yellow-600' },
            asset: { name: 'Asset', icon: '🏢', color: 'bg-indigo-600' },
            report: { name: 'Laporan Bulanan', icon: '📊', color: 'bg-pink-600' },
            admin: { name: 'Admin Panel', icon: '⚙️', color: 'bg-gray-700' }
        };
        checkpoint(4, 'Menu map defined');

        const visible = allowed.filter(id => menuMap[id]);
        checkpoint(5, `Visible modules: ${visible.length}`);

        if (visible.length === 0) {
            grid.innerHTML = '<p class="col-span-full text-center">Tidak ada modul tersedia.</p>';
        } else {
            grid.innerHTML = visible.map(id => `
                <a href="#${id}" class="${menuMap[id].color} text-white p-4 rounded-xl text-center font-semibold shadow hover:opacity-90 transition">
                    <span class="block text-2xl mb-1">${menuMap[id].icon}</span>
                    ${menuMap[id].name}
                </a>
            `).join('');
        }
        checkpoint(6, 'Menu rendered');

        const logoutBtn = document.getElementById('logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                sessionStorage.removeItem('allowed_modules');
                window.location.reload();
            });
            checkpoint(7, 'Logout handler attached');
        }

        if (debugDiv) debugDiv.innerHTML = `<div style="background:#111;color:#0f0;padding:8px;border-radius:8px;">✅ ALL CHECKPOINTS PASSED! Menu rendered.</div>`;
    } catch (err) {
        if (debugDiv) debugDiv.innerHTML = `<div style="background:#300;color:#f00;padding:8px;border-radius:8px;">❌ ERROR: ${err.message}</div>`;
        console.error(err);
    }
})();