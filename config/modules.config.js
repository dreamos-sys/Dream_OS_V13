// ========== MODULE CONFIGURATION ==========
export const MODULES_CONFIG = [
    {
        id: 'home',
        name: 'Dashboard',
        icon: '🏠',
        color: 'bg-gradient-to-br from-amber-500 to-yellow-600',
        route: '#home',
        access: ['user', 'admin'],
        description: 'Dashboard utama sistem',
        version: '13.4.0',
        category: 'core'
    },
    {
        id: 'booking',
        name: 'Booking Sarana',
        icon: '📅',
        color: 'bg-gradient-to-br from-blue-500 to-blue-700',
        route: '#booking',
        access: ['user', 'admin'],
        description: 'Peminjaman sarana & prasarana',
        version: '13.4.0',
        category: 'operations'
    },
    {
        id: 'booking-officer',
        name: 'Petugas Booking',
        icon: '👨‍💼',
        color: 'bg-gradient-to-br from-blue-600 to-indigo-700',
        route: '#booking-officer',
        access: ['admin'],
        description: 'Management booking officer',
        version: '13.4.0',
        category: 'operations'
    },
    {
        id: 'booking-approval',
        name: 'Approval Booking',
        icon: '✅',
        color: 'bg-gradient-to-br from-green-500 to-emerald-700',
        route: '#booking-approval',
        access: ['admin'],
        description: 'Persetujuan peminjaman',
        version: '13.4.0',
        category: 'operations'
    },
    {
        id: 'k3',
        name: 'Laporan K3',
        icon: '⚠️',        color: 'bg-gradient-to-br from-orange-500 to-red-600',
        route: '#k3',
        access: ['user', 'admin'],
        description: 'Keselamatan & kesehatan kerja',
        version: '13.4.0',
        category: 'safety'
    },
    {
        id: 'k3-officer',
        name: 'K3 Officer',
        icon: '🛡️',
        color: 'bg-gradient-to-br from-orange-600 to-red-700',
        route: '#k3-officer',
        access: ['admin'],
        description: 'Verifikasi laporan K3',
        version: '13.4.0',
        category: 'safety'
    },
    {
        id: 'sekuriti',
        name: 'Laporan Sekuriti',
        icon: '👮',
        color: 'bg-gradient-to-br from-green-600 to-emerald-800',
        route: '#sekuriti',
        access: ['user', 'admin'],
        description: 'Keamanan & patroli',
        version: '13.4.0',
        category: 'security'
    },
    {
        id: 'janitor-indoor',
        name: 'Janitor Indoor',
        icon: '🧹',
        color: 'bg-gradient-to-br from-teal-500 to-teal-700',
        route: '#janitor-indoor',
        access: ['user', 'admin'],
        description: 'Kebersihan dalam gedung',
        version: '13.4.0',
        category: 'maintenance'
    },
    {
        id: 'janitor-outdoor',
        name: 'Janitor Outdoor',
        icon: '🌿',
        color: 'bg-gradient-to-br from-cyan-500 to-cyan-700',
        route: '#janitor-outdoor',
        access: ['user', 'admin'],
        description: 'Kebersihan area luar',
        version: '13.4.0',
        category: 'maintenance'    },
    {
        id: 'stok',
        name: 'Alat & Stok',
        icon: '📦',
        color: 'bg-gradient-to-br from-purple-500 to-purple-700',
        route: '#stok',
        access: ['user', 'admin'],
        description: 'Manajemen inventaris',
        version: '13.4.0',
        category: 'inventory'
    },
    {
        id: 'maintenance',
        name: 'Maintenance',
        icon: '🔧',
        color: 'bg-gradient-to-br from-yellow-500 to-yellow-700',
        route: '#maintenance',
        access: ['user', 'admin'],
        description: 'Perbaikan & pemeliharaan',
        version: '13.4.0',
        category: 'maintenance'
    },
    {
        id: 'asset',
        name: 'Asset',
        icon: '🏢',
        color: 'bg-gradient-to-br from-indigo-500 to-indigo-700',
        route: '#asset',
        access: ['user', 'admin'],
        description: 'Manajemen aset',
        version: '13.4.0',
        category: 'inventory'
    },
    {
        id: 'commandcenter',
        name: 'Command Center',
        icon: '📊',
        color: 'bg-gradient-to-br from-pink-500 to-pink-700',
        route: '#commandcenter',
        access: ['admin'],
        description: 'Panel monitoring admin',
        version: '13.4.0',
        category: 'admin'
    },
    {
        id: 'dana',
        name: 'Pengajuan Dana',
        icon: '💰',
        color: 'bg-gradient-to-br from-emerald-500 to-emerald-700',        route: '#dana',
        access: ['admin'],
        description: 'Management keuangan',
        version: '13.4.0',
        category: 'finance'
    },
    {
        id: 'spj',
        name: 'SPJ',
        icon: '📋',
        color: 'bg-gradient-to-br from-blue-500 to-cyan-600',
        route: '#spj',
        access: ['user', 'admin'],
        description: 'Surat pertanggungjawaban',
        version: '13.4.0',
        category: 'finance'
    },
    {
        id: 'reminder',
        name: 'Reminder',
        icon: '⏰',
        color: 'bg-gradient-to-br from-yellow-500 to-orange-600',
        route: '#reminder',
        access: ['admin'],
        description: 'Pengingat maintenance',
        version: '13.4.0',
        category: 'maintenance'
    },
    {
        id: 'weather',
        name: 'Cuaca',
        icon: '🌤️',
        color: 'bg-gradient-to-br from-sky-500 to-sky-700',
        route: '#weather',
        access: ['user', 'admin'],
        description: 'Informasi cuaca real-time',
        version: '13.4.0',
        category: 'info'
    },
    {
        id: 'lalin',
        name: 'Lalu Lintas',
        icon: '🚦',
        color: 'bg-gradient-to-br from-green-500 to-green-700',
        route: '#lalin',
        access: ['user', 'admin'],
        description: 'Monitor lalu lintas',
        version: '13.4.0',
        category: 'info'
    },    {
        id: 'mitigasi',
        name: 'Mitigasi',
        icon: '⚠️',
        color: 'bg-gradient-to-br from-red-500 to-red-700',
        route: '#mitigasi',
        access: ['user', 'admin'],
        description: 'Mitigasi bencana',
        version: '13.4.0',
        category: 'safety'
    },
    {
        id: 'ai-speak',
        name: 'AI Assistant',
        icon: '🤖',
        color: 'bg-gradient-to-br from-violet-500 to-violet-700',
        route: '#ai-speak',
        access: ['user', 'admin'],
        description: 'Asisten suara AI',
        version: '13.4.0',
        category: 'ai'
    },
    {
        id: 'prediction',
        name: 'AI Prediction',
        icon: '📈',
        color: 'bg-gradient-to-br from-fuchsia-500 to-fuchsia-700',
        route: '#prediction',
        access: ['admin'],
        description: 'Prediksi analitik AI',
        version: '13.4.0',
        category: 'ai'
    }
];

// Category mapping for filtering
export const CATEGORIES = {
    core: { name: 'Core', icon: '🏠', color: 'amber' },
    operations: { name: 'Operations', icon: '📋', color: 'blue' },
    safety: { name: 'Safety', icon: '🛡️', color: 'orange' },
    security: { name: 'Security', icon: '👮', color: 'green' },
    maintenance: { name: 'Maintenance', icon: '🔧', color: 'yellow' },
    inventory: { name: 'Inventory', icon: '📦', color: 'purple' },
    finance: { name: 'Finance', icon: '💰', color: 'emerald' },
    admin: { name: 'Admin', icon: '📊', color: 'pink' },
    info: { name: 'Information', icon: 'ℹ️', color: 'sky' },
    ai: { name: 'AI Features', icon: '🤖', color: 'violet' }
};

export default MODULES_CONFIG;