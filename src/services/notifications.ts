import { supabase } from '@/lib/supabase';

export async function getNotifications() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return [];

  const { data, error } = await supabase.from('notifications')
    .select('*')
    .eq('userId', userData.user.id)
    .order('createdAt', { ascending: false })
    .limit(10);

  if (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
  return data;
}

export async function markNotificationAsRead(id: string) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) throw new Error("Unauthorized");

  const { error } = await supabase.from('notifications')
    .update({ isRead: true })
    .eq('id', id)
    .eq('userId', userData.user.id);

  if (error) throw new Error("Failed to mark as read");
}

export async function createMockNotification(title: string, message: string) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return null;

  const { data, error } = await supabase.from('notifications').insert({
    userId: userData.user.id,
    type: "ALERT",
    title,
    message,
  }).select().single();

  if (error) return null;
  return data;
}
