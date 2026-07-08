import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";

const DashboardLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="h-full relative font-sans text-slate-900 dark:text-slate-50 antialiased selection:bg-primary/20">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-slate-900 border-r border-slate-800 shadow-2xl">
        <Sidebar />
      </div>
      <main className="md:pl-72 flex flex-col h-full bg-slate-50/50 dark:bg-slate-950">
        <Navbar />
        <div className="flex-1 p-6 lg:p-8 overflow-auto pb-24">
          <div className="max-w-7xl mx-auto w-full h-full animate-in fade-in zoom-in-95 duration-500">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
