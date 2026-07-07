import { getTenderById } from "@/app/actions/tenders";
import { notFound } from "next/navigation";
import TenderDetailsClient from "./tender-details-client";

export default async function TenderDetailsPage({ params }: { params: { id: string } }) {
  const tender = await getTenderById(params.id);

  if (!tender) {
    notFound();
  }

  return <TenderDetailsClient tender={tender} />;
}
