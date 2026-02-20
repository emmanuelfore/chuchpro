import { createClient } from '@supabase/supabase-js';

// These should be replaced with actual project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'church-programs-auth-token',
        // Fix for "Navigator LockManager returned a null lock" warning - disable locking
        lock: typeof navigator !== 'undefined' ? (name, acquireTimeout, fn) => fn() : undefined,
    }
});
