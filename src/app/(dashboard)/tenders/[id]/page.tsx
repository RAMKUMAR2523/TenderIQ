import { getTenderById } from "@/app/actions/tenders";
import { notFound } from "next/navigation";
import TenderDetailsClient from "./tender-details-client";

export default async function TenderDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const tender = await getTenderById(params.id);

  if (!tender) {
    notFound();
  }

  return <TenderDetailsClient tender={tender} />;
}
