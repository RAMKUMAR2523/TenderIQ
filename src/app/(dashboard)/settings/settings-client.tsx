"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { updateSettings } from "@/app/actions/settings";
import { toast } from "sonner";

export default function SettingsClient({ initialSettings }: { initialSettings: any }) {
  const [theme, setTheme] = useState(initialSettings?.theme || "system");
  const [emailAlerts, setEmailAlerts] = useState(initialSettings?.emailAlerts ?? true);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings({ theme, emailAlerts });
      toast.success("Settings saved successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground mt-1">Manage your account preferences and notifications.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the look and feel of TenderIQ.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Theme</label>
              <select 
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System Default</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Configure how you receive alerts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Email Alerts</p>
                <p className="text-xs text-muted-foreground">Receive daily summaries of matching tenders.</p>
              </div>
              <input 
                type="checkbox" 
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="h-4 w-4"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Button onClick={handleSave} className="gap-2">
        <Save className="h-4 w-4" /> Save Settings
      </Button>
    </div>
  );
}
