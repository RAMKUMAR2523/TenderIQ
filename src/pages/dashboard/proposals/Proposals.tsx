// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { getProposals } from "@/services/proposals";
import ProposalsClient from "./proposals-client";

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const data = await getProposals();
        if (isMounted) {
          setProposals(data || []);
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
  return <ProposalsClient initialProposals={proposals} />;
}
