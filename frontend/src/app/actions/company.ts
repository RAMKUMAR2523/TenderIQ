"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getCompanyProfile() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.companyId) {
    return null;
  }

  const company = await db.company.findUnique({
    where: { id: session.user.companyId },
  });

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
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    let companyId = session.user.companyId;

    if (!companyId) {
      // Create new company if user doesn't have one
      const company = await db.company.create({
        data: {
          ...data,
          users: {
            connect: { id: session.user.id }
          }
        }
      });
      companyId = company.id;
      
      // We also update the user to link the companyId
      await db.user.update({
        where: { id: session.user.id },
        data: { companyId }
      });
    } else {
      // Update existing company
      await db.company.update({
        where: { id: companyId },
        data,
      });
    }

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Error updating company profile:", error);
    return { error: "Failed to update company profile" };
  }
}
