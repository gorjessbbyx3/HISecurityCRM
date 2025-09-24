
import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Shield,
  Home,
  Users,
  Building2,
  FileText,
  Camera,
  AlertTriangle,
  Calculator,
  Calendar,
  ClipboardList,
  BookOpen,
  Bell,
  Search,
  Settings,
  LogOut,
  Menu,
  MapPin,
  Activity,
  BarChart3,
  Radio,
  Eye,
  MessageSquare
} from "lucide-react";

interface ProfessionalLayoutProps {
  children: ReactNode;
}

const sidebarItems = [
  { name: "Dashboard", path: "/dashboard", icon: Home },
  { name: "Staff (Clients)", path: "/staff", icon: Users },
  { name: "Employees", path: "/employees", icon: Users },
  { name: "Sites", path: "/properties", icon: Building2 },
  { name: "Sales & Leads", path: "/sales", icon: BarChart3 },
  { name: "Settings", path: "/settings", icon: Settings }
];

const topNavItems = [
  { name: "Live Dashboard", path: "/dashboard" },
  { name: "Operation Reports", path: "/reports" },
  { name: "Mobile Dispatch", path: "/dispatch" },
  { name: "Settings Overview", path: "/settings" },
  { name: "Schedules & Attendance", path: "/scheduling" },
  { name: "HR & Payroll", path: "/hr" },
  { name: "Billing", path: "/accounting" },
  { name: "LiveMonitor", path: "/monitor" }
];

export default function ProfessionalLayout({ children }: ProfessionalLayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const isActive = (path: string) => {
    if (path === "/dashboard" && (location === "/" || location === "/dashboard")) {
      return true;
    }
    return location === path;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex">
      {/* Left Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-slate-800 border-r border-slate-700 flex flex-col transition-all duration-300`}>
        {/* Logo / Brand */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-lg font-bold text-white">TRACKTIK</h1>
                <p className="text-xs text-slate-400">Security Management</p>
              </div>
            )}
          </div>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-b border-slate-700">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src="" />
                <AvatarFallback className="bg-blue-600 text-white">
                  {user?.firstName?.[0] || user?.username?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium text-sm">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user?.username || 'User'
                  }
                </div>
                <div className="text-xs text-slate-400">Administrator</div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-blue-600 text-white text-xs">
                  {user?.firstName?.[0] || user?.username?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link key={item.path} href={item.path}>
                  <div className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer
                    ${active 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                    }
                  `}>
                    <Icon className="w-5 h-5" />
                    {!sidebarCollapsed && (
                      <span className="text-sm font-medium">{item.name}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-700">
          <Button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-slate-400 hover:text-white"
          >
            <Menu className="w-4 h-4" />
            {!sidebarCollapsed && <span className="ml-2">Collapse</span>}
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation Bar */}
        <header className="bg-slate-800 border-b border-slate-700 px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Top Navigation Tabs */}
            <nav className="flex items-center gap-6">
              {topNavItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <button className={`
                    px-3 py-2 text-sm font-medium transition-colors
                    ${isActive(item.path)
                      ? 'text-white border-b-2 border-blue-500'
                      : 'text-slate-400 hover:text-white'
                    }
                  `}>
                    {item.name}
                  </button>
                </Link>
              ))}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                <Search className="w-4 h-4" />
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white relative">
                <Bell className="w-4 h-4" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </Button>

              {/* Settings */}
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                <Settings className="w-4 h-4" />
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                  <DropdownMenuLabel className="text-slate-300">Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-slate-300 hover:bg-slate-700 focus:bg-slate-700"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
