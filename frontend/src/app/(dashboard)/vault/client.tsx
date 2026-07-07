"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, UploadCloud, Folder, Search, MoreVertical, Trash, Eye } from "lucide-react";

const mockDocuments = [
  { id: 1, name: "GST_Certificate_2026.pdf", type: "PDF", size: "2.4 MB", uploadedAt: "Oct 12, 2026", status: "Active" },
  { id: 2, name: "Company_Profile_v3.docx", type: "DOCX", size: "1.1 MB", uploadedAt: "Sep 28, 2026", status: "Active" },
  { id: 3, name: "Financial_Audit_FY25.pdf", type: "PDF", size: "5.7 MB", uploadedAt: "Aug 15, 2026", status: "Active" },
  { id: 4, name: "ISO_9001_Certificate.pdf", type: "PDF", size: "890 KB", uploadedAt: "Jun 04, 2026", status: "Expiring Soon" },
];

export default function VaultClient() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Vault</h1>
          <p className="text-muted-foreground mt-1">
            Securely store and manage your company certificates and proposals.
          </p>
        </div>
        <Button className="gap-2">
          <UploadCloud className="w-4 h-4" /> Upload Document
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Folders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <Button variant="ghost" className="w-full justify-start gap-2 font-medium bg-muted">
                <Folder className="w-4 h-4 text-blue-500" /> All Documents
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2 font-medium">
                <Folder className="w-4 h-4 text-yellow-500" /> Certificates
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2 font-medium">
                <Folder className="w-4 h-4 text-green-500" /> Financials
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2 font-medium">
                <Folder className="w-4 h-4 text-purple-500" /> Proposals
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1 md:col-span-3 space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search documents..."
                className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {mockDocuments.map((doc) => (
              <Card key={doc.id} className="group transition-all hover:shadow-md hover:border-primary/30">
                <CardContent className="p-4 flex flex-col justify-between h-full">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-primary/10 text-primary rounded-lg">
                      <FileText className="w-6 h-6" />
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="mt-4">
                    <h3 className="font-semibold text-sm truncate" title={doc.name}>{doc.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{doc.size} • {doc.uploadedAt}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <div className={`text-xs font-medium px-2 py-1 rounded-full ${doc.status === 'Expiring Soon' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                      {doc.status}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"><Trash className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
