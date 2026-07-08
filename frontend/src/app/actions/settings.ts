"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateSettings(data: { theme: string; emailAlerts: boolean }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.companyId) {
    throw new Error("Unauthorized: Company profile not found");
  }

  const settings = await db.setting.upsert({
    where: { companyId: session.user.companyId },
    update: data,
    create: {
      companyId: session.user.companyId,
      ...data,
    },
  });

  revalidatePath("/settings");
  return settings;
}
