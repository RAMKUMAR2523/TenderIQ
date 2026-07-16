// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { getTenderById } from "@/services/tenders";
import TenderDetailsClient from "./tender-details-client";
import { useParams } from 'react-router-dom';

export default function TenderDetailsPage() {
  const { id } = useParams();
  const [tender, setTender] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const data = await getTenderById(id as string);
        if (isMounted) {
          setTender(data);
          setLoading(false);
        }
      } catch (e) {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [id]);

  if (loading) return <div className="flex h-full items-center justify-center">Loading...</div>;
  if (!tender) return <div>Tender not found</div>;

  return <TenderDetailsClient tender={tender} />;
}
