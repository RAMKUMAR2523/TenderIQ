// @ts-nocheck
import { supabase } from '@/lib/supabase';

export async function getTenders(query?: string, category?: string) {
  let supabaseQuery = supabase.from('tenders').select(`
    *,
    companies:company_tenders(*),
    documents(*)
  `).order('createdAt', { ascending: false });

  if (query) {
    supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%,department.ilike.%${query}%`);
  }

  if (category && category !== "All") {
    supabaseQuery = supabaseQuery.eq('department', category);
  }

  const { data, error } = await supabaseQuery;
  if (error) {
    console.error("Error fetching tenders:", error);
    return [];
  }
  return data;
}

export async function getTenderById(id: string) {
  const { data, error } = await supabase.from('tenders').select(`
    *,
    documents(*),
    companies:company_tenders(
      *,
      company:companies(*)
    )
  `).eq('id', id).single();

  if (error) {
    console.error("Error fetching tender by id:", error);
    return null;
  }
  return data;
}

export async function saveTenderInterest(tenderId: string) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    return { error: "User is not authenticated." };
  }
  
  // We need to fetch the companyId for the user, assuming it's in user_metadata or another table
  const companyId = userData.user.user_metadata?.companyId;
  if (!companyId) {
    return { error: "User is not associated with a company." };
  }

  try {
    const { error } = await supabase.from('company_tenders').upsert({
      companyId,
      tenderId,
      status: "INTERESTED"
    }, { onConflict: 'companyId,tenderId' });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error saving tender interest:", error);
    return { error: "Failed to save interest." };
  }
}
