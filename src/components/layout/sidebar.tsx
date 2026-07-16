import { Link } from "react-router-dom";
import { 
  Briefcase, 
  LayoutDashboard, 
  Search, 
  FileText, 
  Building2, 
  Settings,
  MessageSquare
} from "lucide-react";

export function Sidebar() {
  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      color: "text-sky-500",
    },
    {
      label: "Discover Tenders",
      icon: Search,
      href: "/tenders",
      color: "text-violet-500",
    },
    {
      label: "AI Chat",
      icon: MessageSquare,
      href: "/chat",
      color: "text-pink-700",
    },
    {
      label: "Proposals",
      icon: FileText,
      href: "/proposals",
      color: "text-orange-700",
    },
    {
      label: "Company Profile",
      icon: Building2,
      href: "/company",
      color: "text-emerald-500",
    },
    {
      label: "Vault",
      icon: Briefcase,
      href: "/vault",
      color: "text-gray-500",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
      color: "text-gray-500",
    },
  ];

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900 text-white">
      <div className="px-3 py-2 flex-1">
        <Link to="/dashboard" className="flex items-center pl-3 mb-14">
          <h1 className="text-2xl font-bold">
            TenderIQ <span className="text-blue-500">AI</span>
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              to={route.href}
              className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition"
            >
              <div className="flex items-center flex-1">
                <route.icon className={`h-5 w-5 mr-3 ${route.color}`} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
