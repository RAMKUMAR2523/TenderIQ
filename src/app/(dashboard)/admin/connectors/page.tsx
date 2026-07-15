import { getConnectorStatus } from "@/app/actions/admin";
import { AdminConnectorsClient } from "./client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - Connectors | TenderIQ",
  description: "Manage data aggregation connectors.",
};

export default async function AdminConnectorsPage() {
  const data = await getConnectorStatus();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Connector Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor the health and sync status of all Data Aggregation Engine connectors.
        </p>
      </div>

      <AdminConnectorsClient initialData={data} />
    </div>
  );
}
