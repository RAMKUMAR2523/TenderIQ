// @ts-nocheck
import { supabase } from '@/lib/supabase';

export async function getDashboardStats() {
  const { count: totalActiveTenders } = await supabase.from('tenders').select('*', { count: 'exact', head: true });
  const { count: proposalsInProgress } = await supabase.from('proposals').select('*', { count: 'exact', head: true }).eq('status', 'DRAFT');
  const { count: submittedBids } = await supabase.from('company_tenders').select('*', { count: 'exact', head: true }).eq('status', 'BIDDING');
  const { count: wonBids } = await supabase.from('company_tenders').select('*', { count: 'exact', head: true }).eq('status', 'WON');
  const { count: lostBids } = await supabase.from('company_tenders').select('*', { count: 'exact', head: true }).eq('status', 'LOST');

  const won = wonBids || 0;
  const lost = lostBids || 0;
  const winRate = (won + lost) > 0 ? Math.round((won / (won + lost)) * 100) : 0;

  return {
    totalActiveTenders: totalActiveTenders || 0,
    proposalsInProgress: proposalsInProgress || 0,
    submittedBids: submittedBids || 0,
    wonBids: won,
    lostBids: lost,
    winRate,
  };
}

export async function getRecentTenders() {
  const { data } = await supabase.from('tenders').select('*').order('createdAt', { ascending: false }).limit(5);
  return data || [];
}

export async function getMonthlyTrends() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return [];

  const companyId = userData.user.user_metadata?.companyId;
  if (!companyId) return [];

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const { data: tenders } = await supabase.from('company_tenders')
    .select('status, updatedAt')
    .eq('companyId', companyId)
    .gte('updatedAt', sixMonthsAgo.toISOString());

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const trendsMap = new Map();

  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    trendsMap.set(monthNames[d.getMonth()], { submitted: 0, won: 0 });
  }

  (tenders || []).forEach(t => {
    const month = monthNames[new Date(t.updatedAt).getMonth()];
    if (trendsMap.has(month)) {
      const data = trendsMap.get(month);
      if (t.status === 'BIDDING' || t.status === 'WON' || t.status === 'LOST') data.submitted++;
      if (t.status === 'WON') data.won++;
    }
  });

  return Array.from(trendsMap, ([name, data]) => ({ name, ...data }));
}

export async function getConnectorStatus() {
  return [
    { id: "cppp", name: "CPPP Portal", status: "ACTIVE", lastSync: new Date().toISOString() },
    { id: "gem", name: "GeM Portal", status: "ERROR", lastSync: new Date().toISOString() },
  ];
}
