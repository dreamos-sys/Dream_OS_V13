import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://rqpodzjexghrvcpyacyo.supabase.co';
const supabaseAnonKey = 'sb_publishable_U9MbSdPJOMSmaw3BsHJcVQ_PDiOy-UM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);