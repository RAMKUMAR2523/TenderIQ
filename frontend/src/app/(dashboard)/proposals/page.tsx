import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ProposalsClient from "./proposals-client";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function ProposalsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  // Fetch proposals for the company
  const companyId = session.user.companyId;
  let proposals: any[] = [];
  
  if (companyId) {
    proposals = await db.proposal.findMany({
      where: { companyId },
      include: { tender: true },
      orderBy: { updatedAt: 'desc' }
    });
  }

  return (
    <div className="w-full h-full">
      <ProposalsClient initialProposals={proposals} />
    </div>
  );
}
