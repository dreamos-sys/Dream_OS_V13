alert('📋 SPJ Module Loaded');

(function() {
    const supabase = window.supabase;
    if (!supabase) return alert('Supabase tidak tersedia');

    // Camera setup
    let stream = null;
    const video = document.getElementById('camera-preview');
    const canvas = document.getElementById('camera-canvas');
    const photoResult = document.getElementById('photo-result');
    const placeholder = document.getElementById('camera-placeholder');

    document.getElementById('start-camera')?.addEventListener('click', async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            video.srcObject = stream;
            video.classList.remove('hidden');
            placeholder.classList.add('hidden');
        } catch (err) {
            alert('❌ Gagal akses kamera: ' + err.message);
        }
    });

    document.getElementById('stop-camera')?.addEventListener('click', () => {
        if (stream) {
            stream.getTracks().forEach(t => t.stop());
            video.srcObject = null;
            video.classList.add('hidden');
            placeholder.classList.remove('hidden');
        }
    });

    document.getElementById('capture-photo')?.addEventListener('click', () => {
        if (!stream) { alert('❌ Nyalakan kamera dulu!'); return; }
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        const imgData = canvas.toDataURL('image/jpeg');
        photoResult.src = imgData;
        photoResult.classList.remove('hidden');
        placeholder.classList.add('hidden');
        document.getElementById('spj_photo_data').value = imgData;
    });

    // Submit form
    document.getElementById('spjForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const resultDiv = document.getElementById('form-result');
        resultDiv.innerHTML = '<span class="text-yellow-500">⏳ Mengirim...</span>';
        const formData = {
            judul: document.getElementById('spj_judul').value,
            nominal: document.getElementById('spj_nominal').value,
            tanggal: document.getElementById('spj_tanggal').value || null,
            deskripsi: document.getElementById('spj_deskripsi').value || null,
            foto_url: document.getElementById('spj_photo_data').value || null,
            pengaju: document.getElementById('spj_pengaju').value,
            status: 'pending',
            created_at: new Date()
        };

        try {
            const { error } = await supabase.from('spj').insert([formData]);
            if (error) throw error;

            resultDiv.innerHTML = '<span class="text-green-500 animate-pulse">✅ SPJ berhasil diajukan!</span>';
            e.target.reset();
            if (stream) stream.getTracks().forEach(t => t.stop());
            video.classList.add('hidden');
            photoResult.classList.add('hidden');
            placeholder.classList.remove('hidden');
            loadSPJHistory();
            setTimeout(() => resultDiv.innerHTML = '', 3000);
        } catch (err) {
            resultDiv.innerHTML = `<span class="text-red-500">Gagal: ${err.message}</span>`;
        }
    });

    // Load history
    async function loadSPJHistory() {
        const container = document.getElementById('spj-history');
        if (!container) return;

        try {
            const { data, error } = await supabase
                .from('spj')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;

            if (!data?.length) {
                container.innerHTML = '<p class="text-center text-slate-500">Belum ada SPJ</p>';
                return;
            }

            container.innerHTML = data.map(item => `
                <div class="bg-slate-800/50 p-3 rounded-xl flex justify-between items-center">                    <div>
                        <p class="text-sm font-bold">${item.judul}</p>
                        <p class="text-xs text-slate-400">Rp ${Number(item.nominal).toLocaleString()} | ${item.pengaju}</p>
                    </div>
                    <span class="text-xs ${item.status === 'approved' ? 'text-green-500' : item.status === 'rejected' ? 'text-red-500' : 'text-yellow-500'}">${item.status}</span>
                </div>
            `).join('');
        } catch (err) {
            container.innerHTML = '<p class="text-center text-red-500">Gagal memuat</p>';
        }
    }

    loadSPJHistory();
})();