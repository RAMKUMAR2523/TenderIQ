"use client";

import { useState } from "react";
import { saveTenderInterest } from "@/app/actions/tenders";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bookmark, MessageSquare, FileText, CheckCircle2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function TenderDetailsClient({ tender }: { tender: any }) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveInterest = async () => {
    setIsSaving(true);
    const result = await saveTenderInterest(tender.id);
    setIsSaving(false);
    
    if (result.success) {
      toast.success("Tender saved to your pipeline.");
    } else {
      toast.error(result.error || "Failed to save tender.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6 border-b">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">{tender.department}</Badge>
            <Badge variant="secondary">{tender.state || "National"}</Badge>
            <span className="text-sm text-muted-foreground ml-2">Ref: {tender.referenceNumber}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{tender.title}</h1>
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted-foreground font-medium">
            <div>Estimated Value: <span className="text-foreground text-lg">₹{(tender.tenderValue / 100000).toFixed(2)} Lakhs</span></div>
            {tender.closingDate && (
              <div>Closing Date: <span className="text-foreground text-lg">{new Date(tender.closingDate).toLocaleDateString()}</span></div>
            )}
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none gap-2" onClick={handleSaveInterest} disabled={isSaving}>
            <Bookmark className="w-4 h-4" /> Save
          </Button>
          <Link href={`/chat/${tender.id}`} className="flex-1 md:flex-none">
            <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <MessageSquare className="w-4 h-4" /> AI Chat
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-3 px-6">Overview</TabsTrigger>
          <TabsTrigger value="ai-summary" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-3 px-6">AI Summary</TabsTrigger>
          <TabsTrigger value="eligibility" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-3 px-6">Eligibility</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{tender.description}</p>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Important Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1">Department</div>
                    <div className="font-medium">{tender.department}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Location</div>
                    <div className="font-medium">{tender.state || "Not specified"}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Published Date</div>
                    <div className="font-medium">{new Date(tender.createdAt).toLocaleDateString()}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ai-summary" className="pt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" /> Executive Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed">
                {tender.executiveSummary || "AI summary is currently being generated..."}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-500" /> Risk Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed">
                {tender.riskAnalysis || "No significant risks identified by AI."}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Key Deliverables & Timeline</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold mb-2">Deliverables</h4>
                    <p className="text-muted-foreground">{tender.deliverables || "See official document for deliverables."}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Timeline Requirements</h4>
                    <p className="text-muted-foreground">{tender.timeline || "See official document for timeline."}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="eligibility" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" /> Eligibility Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted/50 rounded-lg whitespace-pre-wrap text-sm leading-relaxed">
                {tender.eligibilityReqs || "Eligibility requirements not extracted yet."}
              </div>
              <div className="mt-6 flex justify-end">
                <Button variant="outline">Run AI Eligibility Matcher</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
