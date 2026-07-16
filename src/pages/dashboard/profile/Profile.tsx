// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { getCompanyProfile } from "@/services/company";
import ProfileForm from "./profile-form";

export default function ProfilePage() {
  const [companyData, setCompanyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const data = await getCompanyProfile();
        if (isMounted) {
          setCompanyData(data || { name: "" });
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
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Company Profile</h2>
        <p className="text-muted-foreground mt-1">Manage your company details for AI matching.</p>
      </div>
      <div className="max-w-3xl">
        <ProfileForm initialData={companyData} />
      </div>
    </div>
  );
}
