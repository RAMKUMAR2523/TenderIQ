// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { getCompanyDocuments } from "@/services/vault";
import VaultClient from "./VaultClient";

export default function VaultPage() {
  const [documents, setDocuments] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const data = await getCompanyDocuments();
        if (isMounted) {
          setDocuments(data || []);
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
  return <VaultClient initialDocuments={documents} />;
}
