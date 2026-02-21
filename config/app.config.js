// ========== GLOBAL APP CONFIGURATION ==========
export const CONFIG = {
    // App Info
    app: {
        name: 'Dream OS',
        version: '13.4.0',
        codename: 'Future Edition',
        build: '2026.01',
        copyright: 'SIF Al-Fikri'
    },

    // Supabase Configuration
    supabase: {
        url: 'https://rqpodzjexghrvcpyacyo.supabase.co',
        key: 'sb_publishable_U9MbSdPJOMSmaw3BsHJcVQ_PDiOy-UM',
        timeout: 30000
    },

    // Prayer Times Configuration
    prayer: {
        lat: -6.4,
        lon: 106.8,
        method: 20,
        madhab: 'shafi',
        notifications: true
    },

    // UI Configuration
    ui: {
        slides: {
            interval: 7000,
            autoPlay: true,
            totalSlides: 7
        },
        data: {
            refreshInterval: 30000,
            cacheEnabled: true,
            cacheDuration: 300000 // 5 minutes
        },
        animations: {
            enabled: true,
            reducedMotion: false
        },
        theme: {
            default: 'light',
            autoDetect: true
        }
    },

    // Work Hours Configuration    workHours: {
        start: 7.5, // 07:30
        end: 16.0,  // 16:00
        breakStart: 12.0,
        breakEnd: 13.0
    },

    workDays: [1, 2, 3, 4, 5], // Monday to Friday

    fridayRules: {
        aula: {
            start: 10.5, // 10:30
            end: 13.0    // 13:00
        }
    },

    // Booking Configuration
    booking: {
        maxDuration: 24, // hours
        advanceBooking: 30, // days
        requireApproval: true,
        allowRecurring: true
    },

    // Security Configuration
    security: {
        sessionTimeout: 3600000, // 1 hour
        maxLoginAttempts: 5,
        lockoutDuration: 900000, // 15 minutes
        requirePasswordChange: 90 // days
    },

    // Notification Configuration
    notifications: {
        enabled: true,
        sound: true,
        vibration: true,
        desktop: true,
        mobile: true
    },

    // Feature Flags
    features: {
        camera: true,
        printing: true,
        qrCode: true,
        voiceCommand: true,
        aiAssistant: true,
        predictiveAnalytics: true,
        offlineMode: true,        pwa: true
    },

    // Debug Configuration
    debug: {
        enabled: true,
        verbose: false,
        logToServer: false
    },

    // API Endpoints
    api: {
        weather: 'https://api.openweathermap.org/data/2.5',
        prayer: 'https://api.aladhan.com/v1',
        maps: 'https://maps.google.com'
    },

    // Storage Keys
    storage: {
        theme: 'dreamos_theme',
        session: 'dreamos_session',
        cache: 'dreamos_cache',
        preferences: 'dreamos_prefs'
    }
};

export default CONFIG;