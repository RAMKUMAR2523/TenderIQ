import { MobileSidebar } from "./mobile-sidebar";
import { NotificationBell } from "@/components/layout/notification-bell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  return (
    <div className="flex items-center p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm h-16 w-full justify-between md:justify-end sticky top-0 z-50 transition-all duration-200">
      <div className="md:hidden flex items-center">
        <MobileSidebar />
      </div>
      <div className="flex w-full md:w-auto justify-end items-center gap-4">
        <NotificationBell />
        <div className="hidden md:flex flex-col text-right mr-2">
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Ramkumar</span>
          <span className="text-xs text-muted-foreground">Admin</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="cursor-pointer outline-none transition-transform hover:scale-105 active:scale-95">
            <Avatar className="ring-2 ring-primary/10 hover:ring-primary/30 transition-all">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">CN</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 shadow-lg border-gray-100 dark:border-gray-800 rounded-xl">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Ramkumar</p>
                <p className="text-xs leading-none text-muted-foreground">ramkumar@tenderiq.com</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer transition-colors focus:bg-slate-100 dark:focus:bg-slate-800">
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer transition-colors focus:bg-slate-100 dark:focus:bg-slate-800">
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 cursor-pointer focus:bg-red-50 dark:focus:bg-red-950 transition-colors">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
