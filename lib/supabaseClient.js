import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://your-project.supabase.co'; // GANTI!
const SUPABASE_ANON_KEY = 'your-anon-key'; // GANTI!

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
