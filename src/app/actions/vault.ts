"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getCompanyDocuments() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.companyId) {
    return [];
  }

  return await db.companyDocument.findMany({
    where: { companyId: session.user.companyId },
    orderBy: { createdAt: "desc" }
  });
}

export async function addCompanyDocument(data: { name: string, type: string, fileUrl: string }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.companyId) {
    throw new Error("Unauthorized");
  }

  const doc = await db.companyDocument.create({
    data: {
      ...data,
      companyId: session.user.companyId,
    }
  });

  revalidatePath('/vault');
  return doc;
}
