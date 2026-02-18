// lib/pluginLoader.js
import { log } from './logger.js';

// Daftar manifest secara manual (tambahin setiap kali bikin modul baru)
const MANIFESTS = [
    {
        id: 'booking',
        name: 'Booking Sarana',
        icon: '📅',
        color: 'bg-blue-500',
        route: '#booking',
        access: ['user', 'admin'],
        description: 'Modul peminjaman sarana',
        version: '1.0.0'
    },
    {
        id: 'k3',
        name: 'Laporan K3',
        icon: '⚠️',
        color: 'bg-orange-500',
        route: '#k3',
        access: ['user', 'admin'],
        description: 'Laporan Kesehatan dan Keselamatan Kerja',
        version: '1.0.0'
    }
];

export async function loadAllManifests() {
    // Bisa langsung return, atau kalau mau simulasi async, gunakan Promise
    return MANIFESTS;
}

export function getAccessibleModules(manifests, allowedList) {
    return manifests.filter(m => 
        m.access.some(role => allowedList.includes(role) || allowedList.includes('admin'))
    );
}
