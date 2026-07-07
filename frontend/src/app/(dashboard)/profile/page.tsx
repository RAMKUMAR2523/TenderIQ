import { getCompanyProfile } from "@/app/actions/company";
import { ProfileForm } from "./profile-form";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  // Since we haven't built the login page yet, we will mock the session for development 
  // or redirect to login. For now, we will pass empty data if not logged in just to show UI.
  
  let companyData = null;
  if (session) {
    companyData = await getCompanyProfile();
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-medium">Company Profile</h3>
        <p className="text-sm text-muted-foreground">
          Manage your company details, certifications, and experience here. These details are used to auto-check tender eligibility.
        </p>
        {!session && (
          <p className="text-sm text-amber-600 mt-2 font-medium">
            Note: You are currently viewing this in preview mode. Data will not be saved without an active session.
          </p>
        )}
      </div>
      
      <ProfileForm initialData={companyData} />
    </div>
  );
}
