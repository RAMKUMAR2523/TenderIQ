// @ts-nocheck
import { supabase } from '@/lib/supabase';

export async function getCompanyProfile() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return null;

  const companyId = userData.user.user_metadata?.companyId;
  if (!companyId) return null;

  const { data: company, error } = await supabase.from('companies').select('*').eq('id', companyId).single();
  if (error) {
    console.error("Error fetching company:", error);
    return null;
  }
  return company;
}

export async function updateCompanyProfile(data: {
  name: string;
  gst?: string;
  pan?: string;
  cin?: string;
  annualTurnover?: string;
  industries?: string;
}) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return { error: "Unauthorized" };

  try {
    let companyId = userData.user.user_metadata?.companyId;

    if (!companyId) {
      // Create new company
      const { data: company, error: createError } = await supabase.from('companies').insert(data).select().single();
      if (createError) throw createError;
      
      companyId = company.id;
      
      // Update user metadata with new companyId
      const { error: updateError } = await supabase.auth.updateUser({
        data: { companyId }
      });
      if (updateError) throw updateError;
    } else {
      // Update existing company
      const { error: updateError } = await supabase.from('companies').update(data).eq('id', companyId);
      if (updateError) throw updateError;
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating company profile:", error);
    return { error: "Failed to update company profile" };
  }
}
