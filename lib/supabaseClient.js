import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://rqpodzjexghrvcpyacyo.supabase.co'; // GANTI!
const SUPABASE_ANON_KEY = 'sb_publishable_U9MbSdPJOMSmaw3BsHJcVQ_PDiOy-UM'; // GANTI!

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
