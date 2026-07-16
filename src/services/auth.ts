import { supabase } from '@/lib/supabase';

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error("Error signing out:", error);
}

// Additional auth methods like signInWithPassword, etc., can be added here
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error("Error getting session:", error);
    return null;
  }
  return session;
}
