import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, UploadCloud, Folder, Search, MoreVertical, Trash, Eye } from "lucide-react";
import { toast } from "sonner";
import { useRef } from "react";

interface VaultClientProps {
  initialDocuments: any[];
}

export default function VaultClient({ initialDocuments }: VaultClientProps) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", e.target.files[0]);

      const res = await fetch("/api/vault/upload", { method: "POST", body: formData });
      const data = await res.json();
      
      if (data.success) {
        setDocuments(prev => [data.document, ...prev]);
        toast.success("Document uploaded successfully");
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleDownload = (id: string) => {
    window.location.href = `/api/vault/download?id=${id}`;
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      const res = await fetch(`/api/vault/delete?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setDocuments(prev => prev.filter(doc => doc.id !== id));
        toast.success("Document deleted");
      } else {
        toast.error(data.error || "Failed to delete");
      }
    } catch (err) {
      toast.error("Failed to delete document");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Vault</h1>
          <p className="text-muted-foreground mt-1">
            Securely store and manage your company certificates and proposals.
          </p>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleUpload} 
        />
        <Button className="gap-2" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
          <UploadCloud className="w-4 h-4" /> {isUploading ? "Uploading..." : "Upload Document"}
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
            {documents.length === 0 ? (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                No documents in your vault.
              </div>
            ) : (
              documents.map((doc) => (
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
                    <p className="text-xs text-muted-foreground mt-1">{doc.type} • {new Date(doc.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <div className={`text-xs font-medium px-2 py-1 rounded-full ${doc.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700'}`}>
                      {doc.status}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDownload(doc.id)}><Eye className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950" onClick={() => handleDelete(doc.id)}><Trash className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
