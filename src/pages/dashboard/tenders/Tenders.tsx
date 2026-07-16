// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { getTenders } from "@/services/tenders";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, Building2, MapPin, CalendarDays, ArrowRight } from "lucide-react";
import { format } from "date-fns";

export default function TendersPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";

  const [tenders, setTenders] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const data = await getTenders(query, category);
        if (isMounted) {
          setTenders(data);
          setLoading(false);
        }
      } catch (e) {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [query, category]);

  if (loading) return <div className="flex h-full items-center justify-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Active Tenders</h2>
          <p className="text-muted-foreground mt-1">Discover and bid on public and private sector opportunities.</p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tenders by keyword, department, or ID..." className="pl-9" defaultValue={query} />
        </div>
        <Button variant="outline" className="shrink-0">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {tenders.map((tender: any) => (
          <Card key={tender.id} className="flex flex-col transition-all hover:shadow-md border-primary/10">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mb-2">
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">{tender.source}</span>
                    <span className="flex items-center"><Building2 className="w-3 h-3 mr-1" /> {tender.department}</span>
                    <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {tender.state}</span>
                    <span className={new Date(tender.closingDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? "text-destructive flex items-center" : "flex items-center"}>
                      <CalendarDays className="w-3 h-3 mr-1" /> 
                      Closes: {format(new Date(tender.closingDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <CardTitle className="text-xl leading-tight line-clamp-2">
                    <Link to={`/tenders/${tender.id}`} className="hover:text-primary transition-colors">
                      {tender.title}
                    </Link>
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 pb-4">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {tender.description || tender.executiveSummary}
              </p>
            </CardContent>
            <CardFooter className="pt-0 flex items-center justify-between border-t border-border/50 bg-slate-50/50 dark:bg-slate-900/50 px-6 py-3 mt-auto">
              <div className="text-sm font-semibold">
                {tender.tenderValue ? `Est. Value: ₹${(tender.tenderValue / 10000000).toFixed(2)} Cr` : "Value Undisclosed"}
              </div>
              <Button asChild size="sm" className="gap-1.5 rounded-full">
                <Link to={`/dashboard/tenders/${tender.id}`}>
                  View Details <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
