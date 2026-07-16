import { supabase } from '@/lib/supabase';

export async function getCompanyDocuments() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return [];

  const companyId = userData.user.user_metadata?.companyId;
  if (!companyId) return [];

  const { data, error } = await supabase.from('company_documents')
    .select('*')
    .eq('companyId', companyId)
    .order('createdAt', { ascending: false });

  if (error) {
    console.error("Error fetching documents:", error);
    return [];
  }
  return data;
}

export async function addCompanyDocument(data: { name: string, type: string, fileUrl: string }) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) throw new Error("Unauthorized");

  const companyId = userData.user.user_metadata?.companyId;
  if (!companyId) throw new Error("Unauthorized");

  const { data: doc, error } = await supabase.from('company_documents')
    .insert({
      ...data,
      companyId
    }).select().single();

  if (error) throw new Error("Failed to add document");

  return doc;
}
