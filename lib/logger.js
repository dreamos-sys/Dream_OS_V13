// lib/logger.js
import { CONFIG } from '../config.js';

export const log = {
  info: (msg, data) => {
    if (CONFIG.debug) console.log(`ℹ️ ${msg}`, data || '');
  },
  warn: (msg, data) => console.warn(`⚠️ ${msg}`, data || ''),
  error: (msg, err) => console.error(`❌ ${msg}`, err),
  // Bisa tambahkan fungsi untuk kirim ke Supabase nanti
};
