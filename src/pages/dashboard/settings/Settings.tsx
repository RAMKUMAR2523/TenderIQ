// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { getSettings } from "@/services/settings";
import SettingsClient from "./settings-client";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const data = await getSettings() || { theme: "light", emailAlerts: true };
        if (isMounted) {
          setSettings(data);
          setLoading(false);
        }
      } catch (e) {
        if (isMounted) {
           setSettings({ theme: "light", emailAlerts: true });
           setLoading(false);
        }
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  if (loading) return <div className="flex h-full items-center justify-center">Loading...</div>;
  return <SettingsClient initialSettings={settings} />;
}
