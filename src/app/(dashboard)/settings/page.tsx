import SettingsClient from "./settings-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  let settings = null;
  if (session.user.companyId) {
    settings = await db.setting.findUnique({
      where: { companyId: session.user.companyId }
    });
  }

  return <SettingsClient initialSettings={settings} />;
}
