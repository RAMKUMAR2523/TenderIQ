// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { getConnectorStatus } from "@/services/dashboard";
import ConnectorsClient from "./ConnectorsClient";

export default function AdminConnectorsPage() {
  const [data, setData] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const d = await getConnectorStatus();
        if (isMounted) {
          setData(d);
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
  return <ConnectorsClient initialData={data} />;
}
