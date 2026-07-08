import VaultClient from "./client";
import { getCompanyDocuments } from "@/app/actions/vault";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function VaultPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const documents = await getCompanyDocuments();
  return <VaultClient initialDocuments={documents} />;
}
