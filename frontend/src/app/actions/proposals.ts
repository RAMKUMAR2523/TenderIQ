"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function generateProposal(tenderId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    throw new Error("Unauthorized");
  }

  const tender = await db.tender.findUnique({ where: { id: tenderId } });
  if (!tender) {
    throw new Error("Tender not found");
  }

  // Fallback template logic since no LLM key is provided yet
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

  const proposal = await db.proposal.create({
    data: {
      companyId: session.user.companyId,
      tenderId: tender.id,
      techProposal: content,
      status: "DRAFT",
    },
    include: { tender: true }
  });

  revalidatePath("/proposals");
  return proposal;
}

export async function getAvailableTenders() {
  return await db.tender.findMany({ take: 10, orderBy: { createdAt: "desc" } });
}
