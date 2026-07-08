"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return [];
  }

  return await db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10
  });
}

export async function markNotificationAsRead(id: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await db.notification.update({
    where: { id, userId: session.user.id },
    data: { isRead: true }
  });
  
  revalidatePath("/");
}

export async function createMockNotification(title: string, message: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null;
  }

  const notification = await db.notification.create({
    data: {
      userId: session.user.id,
      type: "ALERT",
      title,
      message,
    }
  });
  revalidatePath("/");
  return notification;
}
