import { supabase } from '@/lib/supabase';

export async function updateSettings(data: { theme: string; emailAlerts: boolean }) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) throw new Error("Unauthorized");

  const companyId = userData.user.user_metadata?.companyId;
  if (!companyId) throw new Error("Unauthorized: Company profile not found");

  const { data: settings, error } = await supabase.from('settings').upsert({
    companyId,
    ...data
  }, { onConflict: 'companyId' }).select().single();

  if (error) throw new Error("Failed to update settings");
  return settings;
}

export async function getSettings() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return null;

  const companyId = userData.user.user_metadata?.companyId;
  if (!companyId) return null;

  const { data, error } = await supabase.from('settings').select('*').eq('companyId', companyId).single();
  if (error) return null;
  return data;
}
