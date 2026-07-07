import { getTenders } from "@/app/actions/tenders";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function TendersPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string };
}) {
  const query = searchParams.q || "";
  const category = searchParams.category || "All";

  const tenders = await getTenders(query, category);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tender Marketplace</h1>
          <p className="text-muted-foreground mt-1">
            Discover and apply for government tenders matched to your profile.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Search</label>
                <form action="/tenders" method="GET">
                  <input
                    type="text"
                    name="q"
                    defaultValue={query}
                    placeholder="Keywords..."
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <input type="hidden" name="category" value={category} />
                  <button type="submit" className="hidden">Search</button>
                </form>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Category</label>
                <div className="space-y-2 text-sm">
                  {["All", "Ministry of Education", "Smart City Mission", "Defense"].map(cat => (
                    <Link 
                      key={cat} 
                      href={`/tenders?category=${encodeURIComponent(cat)}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                      className={`block py-1 px-2 rounded-md transition-colors ${category === cat ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"}`}
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tender List */}
        <div className="col-span-1 md:col-span-3 space-y-4">
          {tenders.length === 0 ? (
            <Card className="p-12 text-center text-muted-foreground">
              No tenders found matching your criteria.
            </Card>
          ) : (
            tenders.map((tender) => (
              <Card key={tender.id} className="transition-all hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline">{tender.department}</Badge>
                        <Badge variant="secondary">{tender.state || "National"}</Badge>
                        {tender.closingDate && new Date(tender.closingDate) < new Date(new Date().setDate(new Date().getDate() + 7)) && (
                          <Badge variant="destructive">Closing Soon</Badge>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold leading-tight mt-2">
                        {tender.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {tender.description || tender.executiveSummary}
                      </p>
                      
                      <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm font-medium text-muted-foreground">
                        <div>Value: <span className="text-foreground">₹{(tender.tenderValue! / 100000).toFixed(2)} Lakhs</span></div>
                        <div>Ref: <span className="text-foreground">{tender.referenceNumber}</span></div>
                        {tender.closingDate && (
                          <div>Closes: <span className="text-foreground">{new Date(tender.closingDate).toLocaleDateString()}</span></div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col justify-center items-end gap-3 min-w-[140px]">
                      <div className="text-center px-4 py-2 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 rounded-lg w-full">
                        <div className="text-xs font-semibold uppercase tracking-wider">AI Match</div>
                        <div className="text-2xl font-bold">85%</div>
                      </div>
                      <Link 
                        href={`/tenders/${tender.id}`} 
                        className={cn(buttonVariants({ variant: "default" }), "w-full")}
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
