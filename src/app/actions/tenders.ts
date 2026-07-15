"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getTenders(query?: string, category?: string) {
  let where = {};
  if (query) {
    where = {
      OR: [
        { title: { contains: query } },
        { description: { contains: query } },
        { department: { contains: query } },
      ],
    };
  }

  // Assuming category matches department for now
  if (category && category !== "All") {
    where = { ...where, department: category };
  }

  return await db.tender.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      companies: true,
      documents: true,
    }
  });
}

export async function getTenderById(id: string) {
  return await db.tender.findUnique({
    where: { id },
    include: {
      documents: true,
      companies: {
        include: { company: true }
      }
    }
  });
}

export async function saveTenderInterest(tenderId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return { error: "User is not associated with a company." };
  }

  try {
    await db.companyTender.upsert({
      where: {
        companyId_tenderId: {
          companyId: session.user.companyId,
          tenderId,
        }
      },
      update: {
        status: "INTERESTED"
      },
      create: {
        companyId: session.user.companyId,
        tenderId,
        status: "INTERESTED"
      }
    });

    revalidatePath(`/tenders/${tenderId}`);
    return { success: true };
  } catch (error) {
    console.error("Error saving tender interest:", error);
    return { error: "Failed to save interest." };
  }
}
