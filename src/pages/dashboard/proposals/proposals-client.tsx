import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Download, Edit } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { generateProposal, getAvailableTenders  } from "@/services/proposals";

interface ProposalsClientProps {
  initialProposals: any[];
}

export default function ProposalsClient({ initialProposals }: ProposalsClientProps) {
  const [proposals, setProposals] = useState(initialProposals);
  const [tenders, setTenders] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    getAvailableTenders().then(setTenders);
  }, []);

  const handleGenerate = async (tenderId: string) => {
    setIsGenerating(true);
    try {
      const newProposal = await generateProposal(tenderId);
      setProposals(prev => [newProposal, ...prev]);
      toast.success("Proposal generated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate proposal");
    } finally {
      setIsGenerating(false);
    }
  };

  const exportPDF = (proposal: any) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Proposal: ${proposal.tender.title}`, 20, 20);
    doc.setFontSize(12);
    
    const splitText = doc.splitTextToSize(proposal.techProposal || "", 170);
    doc.text(splitText, 20, 40);
    
    doc.save(`Proposal_${proposal.tender.referenceNumber}.pdf`);
    toast.success("PDF exported successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Proposals</h2>
          <p className="text-muted-foreground mt-1">
            Manage and generate AI-assisted tender proposals.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <select 
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm max-w-[200px]"
            id="tenderSelect"
          >
            {tenders.map(t => (
              <option key={t.id} value={t.id}>{t.title.substring(0, 30)}...</option>
            ))}
          </select>
          <Button 
            onClick={() => {
              const el = document.getElementById("tenderSelect") as HTMLSelectElement;
              if (el?.value) handleGenerate(el.value);
            }} 
            className="gap-2" 
            disabled={isGenerating}
          >
            <Plus className="h-4 w-4" /> {isGenerating ? "Generating..." : "Generate"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {proposals.length === 0 ? (
          <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl border-gray-200 dark:border-gray-800">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No Proposals Yet</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Generate your first AI proposal by selecting a tender and clicking generate.
            </p>
          </div>
        ) : (
          proposals.map(proposal => (
            <Card key={proposal.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{proposal.tender.title}</CardTitle>
                <CardDescription>Status: {proposal.status}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <Edit className="h-4 w-4" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => exportPDF(proposal)}>
                    <Download className="h-4 w-4" /> PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
