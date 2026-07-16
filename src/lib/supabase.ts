import { createClient } from '@supabase/supabase-js';
import { getEnv } from './env';

export const getSupabase = () => {
  const env = getEnv();
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (!supabaseUrl || !supabaseKey) {
    if (process.env.NODE_ENV === 'production') {
       console.warn("Supabase env vars missing during build.");
    }
    return createClient("https://mock.supabase.co", "mock-key");
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

export const supabase: any = new Proxy({} as ReturnType<typeof createClient>, {
  get: (target, prop) => {
    return (getSupabase() as any)[prop];
  }
});
