alert('⏰ Reminder Module Loaded');

(function() {
    const supabase = window.supabase;
    if (!supabase) return alert('Supabase tidak tersedia');

    // Submit form
    document.getElementById('reminderForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const resultDiv = document.getElementById('form-result');
        resultDiv.innerHTML = '<span class="text-yellow-500">⏳ Menyimpan...</span>';

        const terakhir = document.getElementById('reminder_terakhir').value;
        const interval = parseInt(document.getElementById('reminder_interval').value);
        
        // Hitung next service date
        let nextService = null;
        if (terakhir) {
            const date = new Date(terakhir);
            date.setMonth(date.getMonth() + interval);
            nextService = date.toISOString().split('T')[0];
        }

        const formData = {
            nama_item: document.getElementById('reminder_nama').value,
            lokasi: document.getElementById('reminder_lokasi').value,
            interval_bulan: interval,
            terakhir_service: terakhir || null,
            next_service: nextService,
            prioritas: document.getElementById('reminder_prioritas').value,
            catatan: document.getElementById('reminder_catatan').value || null,
            status: 'active',
            created_at: new Date()
        };

        try {
            const { error } = await supabase.from('reminders').insert([formData]);
            if (error) throw error;

            resultDiv.innerHTML = '<span class="text-green-500 animate-pulse">✅ Reminder berhasil disimpan!</span>';
            e.target.reset();
            loadReminders();
            setTimeout(() => resultDiv.innerHTML = '', 3000);
        } catch (err) {
            resultDiv.innerHTML = `<span class="text-red-500">Gagal: ${err.message}</span>`;
        }
    });

    // Load reminders
    async function loadReminders() {
        const container = document.getElementById('reminder-list');
        if (!container) return;

        try {
            const { data, error } = await supabase
                .from('reminders')
                .select('*')
                .order('next_service', { ascending: true })
                .limit(50);

            if (error) throw error;

            if (!data?.length) {
                container.innerHTML = '<p class="text-center text-slate-500">Belum ada reminder</p>';
                return;
            }

            const today = new Date();
            container.innerHTML = data.map(item => {
                const next = item.next_service ? new Date(item.next_service) : null;
                const daysLeft = next ? Math.ceil((next - today) / (1000 * 60 * 60 * 24)) : null;
                const urgency = daysLeft !== null ? (daysLeft <= 0 ? 'bg-red-500/20 text-red-400' : daysLeft <= 7 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400') : 'bg-slate-500/20 text-slate-400';
                const urgencyText = daysLeft !== null ? (daysLeft <= 0 ? `⚠️ Terlewat ${Math.abs(daysLeft)} hari` : daysLeft <= 7 ? `⏰ ${daysLeft} hari lagi` : `✅ ${daysLeft} hari lagi`) : '📅 Belum dijadwalkan';

                return `
                    <div class="bg-slate-800/50 p-4 rounded-xl border-l-4 ${item.prioritas === 'kritis' ? 'border-red-500' : item.prioritas === 'tinggi' ? 'border-yellow-500' : 'border-green-500'}">
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <h3 class="font-bold">${item.nama_item}</h3>
                                <p class="text-xs text-slate-400">${item.lokasi}</p>
                            </div>
                            <span class="text-xs px-2 py-1 rounded-full ${urgency}">${urgencyText}</span>
                        </div>
                        <div class="flex justify-between text-xs text-slate-400">
                            <span>Interval: ${item.interval_bulan} bulan</span>
                            <span>${item.prioritas.toUpperCase()}</span>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (err) {
            container.innerHTML = '<p class="text-center text-red-500">Gagal memuat</p>';
        }
    }

    document.getElementById('refresh-reminder')?.addEventListener('click', loadReminders);
    loadReminders();
})();