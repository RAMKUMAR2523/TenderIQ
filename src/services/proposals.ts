// @ts-nocheck
import { supabase } from '@/lib/supabase';

export async function generateProposal(tenderId: string) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) throw new Error("Unauthorized");
  
  const companyId = userData.user.user_metadata?.companyId;
  if (!companyId) throw new Error("Unauthorized");

  const { data: tender, error: tenderError } = await supabase.from('tenders').select('*').eq('id', tenderId).single();
  if (tenderError || !tender) throw new Error("Tender not found");

  const content = `
TECHNICAL AND FINANCIAL PROPOSAL
--------------------------------
Prepared for: ${tender.department}
Tender Ref: ${tender.referenceNumber}
Tender Title: ${tender.title}

1. Executive Summary
We are pleased to submit this proposal for ${tender.title}. Our company has extensive experience delivering similar projects with a proven track record.

2. Technical Approach
We will utilize state-of-the-art methodology to ensure all requirements defined in ${tender.referenceNumber} are met or exceeded.

3. Financial Bid
Our estimated total cost for this project is aligned with the standard market rates for ${tender.department}.

4. Conclusion
We look forward to the opportunity to work with you.
  `.trim();

  const { data: proposal, error: proposalError } = await supabase.from('proposals').insert({
    companyId,
    tenderId: tender.id,
    techProposal: content,
    status: "DRAFT"
  }).select('*, tender:tenders(*)').single();

  if (proposalError) throw new Error("Failed to create proposal");

  return proposal;
}

export async function getAvailableTenders() {
  const { data, error } = await supabase.from('tenders').select('*').order('createdAt', { ascending: false }).limit(10);
  if (error) return [];
  return data;
}

export async function getProposals() {
  const { data } = await supabase.from('proposals').select('*');
  return data || [];
}
