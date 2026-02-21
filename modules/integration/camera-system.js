// ==================== CAMERA SYSTEM MODULE ====================
window.DreamOSCamera = (function() {
    let currentStream = null;
    let currentModule = null;
    let currentCallback = null;

    // Private helpers
    function log(...args) { console.log('[📸 Camera]', ...args); }
    function warn(...args) { console.warn('[📸 Camera]', ...args); }
    function error(...args) { console.error('[📸 Camera]', ...args); }

    function createCameraUI() {
        if (document.getElementById('dreamOSCameraModal')) return;

        const cameraHTML = `
            <div id="dreamOSCameraModal" style="
                display: none; position: fixed; top: 0; left: 0; 
                width: 100%; height: 100%; background: rgba(0,0,0,0.9);
                z-index: 9999; color: white; font-family: 'Segoe UI', sans-serif;
            ">
                <div style="position: absolute; top: 20px; right: 20px; z-index: 10000;">
                    <button id="cameraClose" style="
                        background: #ff4757; color: white; border: none;
                        width: 50px; height: 50px; border-radius: 50%;
                        font-size: 1.5rem; cursor: pointer;
                    ">×</button>
                </div>
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; width: 90%; max-width: 800px;">
                    <video id="cameraFeed" autoplay style="width: 100%; max-height: 70vh; border-radius: 15px; transform: scaleX(-1);"></video>
                    <div style="margin-top: 20px; display: flex; gap: 15px; justify-content: center;">
                        <button id="capturePhoto" style="padding: 15px 30px; background: #4CAF50; color: white; border: none; border-radius: 10px; font-size: 1.1rem; cursor: pointer;">📸 CAPTURE</button>
                        <button id="switchCamera" style="padding: 15px 30px; background: #2196F3; color: white; border: none; border-radius: 10px; font-size: 1.1rem; cursor: pointer;">🔄 SWITCH</button>
                    </div>
                    <div id="photoPreview" style="margin-top: 30px; display: none;"></div>
                    <div style="margin-top: 20px; color: #ccc; font-size: 0.9rem;"><i class="fas fa-info-circle"></i> Foto otomatis ke form aktif</div>
                </div>
            </div>
        `;
        const div = document.createElement('div');
        div.innerHTML = cameraHTML;
        document.body.appendChild(div);

        // Attach listeners
        document.getElementById('cameraClose').addEventListener('click', closeCamera);
        document.getElementById('capturePhoto').addEventListener('click', capturePhoto);
        document.getElementById('switchCamera').addEventListener('click', switchCamera);
    }

    function openCamera(moduleName, callback) {
        currentModule = moduleName;
        currentCallback = callback;
        createCameraUI();

        const modal = document.getElementById('dreamOSCameraModal');
        modal.style.display = 'block';

        navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment',
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            }
        })
        .then(stream => {
            currentStream = stream;
            document.getElementById('cameraFeed').srcObject = stream;
            log('Camera opened for module:', moduleName);
        })
        .catch(err => {
            error('Camera access error:', err);
            alert('❌ Tidak bisa mengakses kamera. Periksa izin.');
            closeCamera();
        });
    }

    function closeCamera() {
        const modal = document.getElementById('dreamOSCameraModal');
        if (modal) modal.style.display = 'none';
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
            currentStream = null;
        }
        const preview = document.getElementById('photoPreview');
        if (preview) { preview.style.display = 'none'; preview.innerHTML = ''; }
        currentModule = null;
        currentCallback = null;
        log('Camera closed');
    }

    function switchCamera() {
        if (currentStream) currentStream.getTracks().forEach(track => track.stop());

        navigator.mediaDevices.enumerateDevices()
            .then(devices => {
                const videoDevices = devices.filter(d => d.kind === 'videoinput');
                if (videoDevices.length < 2) return navigator.mediaDevices.getUserMedia({ video: true });

                const currentLabel = currentStream?.getVideoTracks()[0]?.label;
                const otherDevice = videoDevices.find(d => d.label !== currentLabel);
                if (otherDevice) {
                    return navigator.mediaDevices.getUserMedia({
                        video: { deviceId: { exact: otherDevice.deviceId } }
                    });
                }
                return navigator.mediaDevices.getUserMedia({ video: true });
            })
            .then(stream => {
                currentStream = stream;
                document.getElementById('cameraFeed').srcObject = stream;
                log('Camera switched');
            })
            .catch(err => error('Switch camera error:', err));
    }

    function capturePhoto() {
        const video = document.getElementById('cameraFeed');
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0);
        const photoData = canvas.toDataURL('image/jpeg', 0.8);

        const preview = document.getElementById('photoPreview');
        preview.innerHTML = `
            <div style="background: white; padding: 15px; border-radius: 10px; display: inline-block;">
                <img src="${photoData}" style="max-width: 300px; border-radius: 5px;">
                <div style="margin-top: 10px; display: flex; gap: 10px; justify-content: center;">
                    <button onclick="DreamOSCamera.usePhoto('${photoData}')" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">✅ USE</button>
                    <button onclick="DreamOSCamera.retakePhoto()" style="padding: 10px 20px; background: #FF9800; color: white; border: none; border-radius: 5px; cursor: pointer;">🔄 RETAKE</button>
                </div>
            </div>
        `;
        preview.style.display = 'block';
        log('Photo captured');
    }

    function usePhoto(photoData) {
        if (currentCallback) currentCallback(photoData);

        // Notify via EventBus if exists
        if (window.EventBus) {
            window.EventBus.emit('camera:photoCaptured', {
                module: currentModule,
                photo: photoData
            });
        }

        // Update preview & hidden input jika ada
        const previewId = `${currentModule}PhotoPreview`;
        const previewEl = document.getElementById(previewId);
        if (previewEl) {
            previewEl.innerHTML = `<img src="${photoData}" style="max-width:200px; border-radius:5px;"><div style="font-size:0.8rem; color:#666; margin-top:5px;">✅ Attached</div>`;
        }

        const inputId = `${currentModule}PhotoInput`;
        const inputEl = document.getElementById(inputId);
        if (inputEl) inputEl.value = photoData;

        closeCamera();
    }

    function retakePhoto() {
        document.getElementById('photoPreview').style.display = 'none';
        document.getElementById('photoPreview').innerHTML = '';
    }

    // Public API
    return {
        openCamera,
        closeCamera,
        usePhoto,
        retakePhoto,
        getCurrentModule: () => currentModule
    };
})();

console.log('✅ Camera System Module Loaded');