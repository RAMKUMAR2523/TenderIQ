// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { getDashboardStats, getRecentTenders, getMonthlyTrends  } from "@/services/dashboard";
import DashboardClient from "../dashboard-client";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const stats = await getDashboardStats();
        const recentTenders = await getRecentTenders();
        const monthlyTrends = await getMonthlyTrends();
        if (isMounted) {
          setData({ stats, recentTenders, monthlyTrends });
          setLoading(false);
        }
      } catch (e) {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  if (loading) return <div className="flex h-full items-center justify-center">Loading...</div>;
  if (!data) return null;

  return (
    <DashboardClient 
      stats={data.stats} 
      recentTenders={data.recentTenders} 
      monthlyTrends={data.monthlyTrends}
      user={{ companyId: "test", id: "test" }} 
    />
  );
}
