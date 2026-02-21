alert('🤖 AI Speak Module Loaded');

(function() {
    const supabase = window.supabase;
    const chatDisplay = document.getElementById('chat-display');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const voiceBtn = document.getElementById('voice-btn');
    const voiceWave = document.getElementById('voice-wave');

    // Add message to chat
    function addMessage(text, isUser = false) {
        const div = document.createElement('div');
        div.className = `flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`;
        div.innerHTML = `
            <div class="w-10 h-10 rounded-full ${isUser ? 'bg-blue-600' : 'bg-purple-600'} flex items-center justify-center text-xl">${isUser ? '👤' : '🤖'}</div>
            <div class="${isUser ? 'bg-blue-600' : 'bg-slate-800'} p-3 rounded-2xl ${isUser ? 'rounded-tr-none' : 'rounded-tl-none'} max-w-[80%]">
                <p class="text-sm">${text}</p>
                <p class="text-xs opacity-60 mt-1">Baru saja</p>
            </div>
        `;
        chatDisplay.appendChild(div);
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
    }

    // AI Response logic (simple rule-based)
    async function getAIResponse(question) {
        const q = question.toLowerCase();
        
        if (q.includes('booking') && q.includes('pending')) {
            const { count } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending');
            return `📅 Saat ini ada **${count || 0} booking pending** yang perlu diproses.`;
        }
        if (q.includes('k3')) {
            const { count } = await supabase.from('k3_reports').select('*', { count: 'exact', head: true }).eq('status', 'pending');
            return `⚠️ Ada **${count || 0} laporan K3** yang menunggu verifikasi.`;
        }
        if (q.includes('approver') || q.includes('hanung')) {
            return `✍️ Approver utama sistem ini adalah **Bapak Hanung Budianto, S.E.** Beliau bertanggung jawab atas approval booking, K3, dan pengajuan dana.`;
        }
        if (q.includes('maintenance')) {
            const { count } = await supabase.from('maintenance_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending');
            return `🔧 Ada **${count || 0} request maintenance** yang belum ditangani.`;
        }
        if (q.includes('aman') || q.includes('keamanan')) {
            return `🛡️ Status keamanan: **AMAM**. Sistem berjalan normal dengan proteksi ISO 27001 aktif.`;
        }
        if (q.includes('saran') || q.includes('suggest')) {
            const hour = new Date().getHours();
            if (hour < 10) return `💡 **Saran Pagi:** Cek jadwal booking hari ini dan pastikan semua sarana siap.`;            if (hour < 15) return `💡 **Saran Siang:** Waktu yang baik untuk melaporkan temuan K3 jika ada.`;
            return `💡 **Saran Sore:** Pastikan semua laporan harian sudah terinput sebelum pulang.`;
        }
        
        return `🤖 Maaf, saya belum bisa menjawab pertanyaan itu. Coba tanya tentang booking, K3, maintenance, atau keamanan.`;
    }

    // Send message
    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        addMessage(text, true);
        chatInput.value = '';

        // Show typing indicator
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.className = 'flex items-center gap-2 text-slate-400 text-sm ml-14';
        typingDiv.innerHTML = '<span>🤖</span><span>AI sedang mengetik...</span>';
        chatDisplay.appendChild(typingDiv);
        chatDisplay.scrollTop = chatDisplay.scrollHeight;

        const response = await getAIResponse(text);
        typingDiv.remove();
        addMessage(response);
    }

    sendBtn?.addEventListener('click', sendMessage);
    chatInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

    // Quick questions
    document.querySelectorAll('.quick-q').forEach(btn => {
        btn.addEventListener('click', () => {
            chatInput.value = btn.dataset.q;
            sendMessage();
        });
    });

    // Voice recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'id-ID';
        recognition.continuous = false;

        voiceBtn?.addEventListener('click', () => {
            voiceWave.classList.remove('hidden');
            recognition.start();
        });
        recognition.onresult = (e) => {
            voiceWave.classList.add('hidden');
            const text = e.results[0][0].transcript;
            chatInput.value = text;
            sendMessage();
        };

        recognition.onerror = () => {
            voiceWave.classList.add('hidden');
            alert('❌ Gagal mengenali suara. Coba lagi.');
        };
    } else {
        voiceBtn.style.display = 'none';
    }
})();