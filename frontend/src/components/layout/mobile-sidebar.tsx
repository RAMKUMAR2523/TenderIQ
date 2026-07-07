"use client";

import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import { useState, useEffect } from "react";

export function MobileSidebar() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <Sheet>
      <SheetTrigger>
        <div className="md:hidden pr-4">
          <Menu />
        </div>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 border-none bg-slate-900 w-72">
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
}
