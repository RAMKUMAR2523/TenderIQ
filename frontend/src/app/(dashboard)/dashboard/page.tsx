import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDashboardStats, getRecentTenders } from "@/app/actions/analytics";
import DashboardClient from "../dashboard-client";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const stats = await getDashboardStats();
  const recentTenders = await getRecentTenders();

  return (
    <DashboardClient 
      stats={stats} 
      recentTenders={recentTenders} 
      user={session.user} 
    />
  );
}
