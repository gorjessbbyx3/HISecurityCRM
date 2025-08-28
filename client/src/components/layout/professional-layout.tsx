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
  Scale,
  Heart,
  Calculator,
  Calendar,
  ClipboardList,
  BookOpen,
  Bell,
  Search,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Activity,
  MapPin
} from "lucide-react";

interface ProfessionalLayoutProps {
  children: ReactNode;
}

const navigationItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: Home,
    description: "Overview & Analytics"
  },
  {
    name: "Staff Management",
    path: "/staff",
    icon: Users,
    description: "Personnel & Schedules"
  },
  {
    name: "Client Portal",
    path: "/clients",
    icon: Building2,
    description: "Client Relationships"
  },
  {
    name: "Properties",
    path: "/properties",
    icon: MapPin,
    description: "Secured Locations"
  },
  {
    name: "Patrol Reports",
    path: "/patrol-reports",
    icon: ClipboardList,
    description: "Field Operations"
  },
  {
    name: "Incident Management",
    path: "/reports",
    icon: AlertTriangle,
    description: "Security Events"
  },
  {
    name: "Crime Intelligence",
    path: "/crime-intelligence",
    icon: Camera,
    description: "Threat Analysis"
  },
  {
    name: "Scheduling",
    path: "/scheduling",
    icon: Calendar,
    description: "Resource Planning"
  },
  {
    name: "Financial",
    path: "/accounting",
    icon: Calculator,
    description: "Billing & Payroll"
  },
  {
    name: "Law Reference",
    path: "/law-reference",
    icon: BookOpen,
    description: "Legal Resources"
  },
  {
    name: "Community",
    path: "/community-outreach",
    icon: Heart,
    description: "Public Relations"
  }
];

export default function ProfessionalLayout({ children }: ProfessionalLayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    await logout();
  };

  const filteredNavItems = navigationItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isActive = (path: string) => {
    if (path === "/dashboard" && (location === "/" || location === "/dashboard")) {
      return true;
    }
    return location === path;
  };

  return (
    <div className="h-screen flex overflow-hidden" style={{background: 'linear-gradient(135deg, #0c1631 0%, #1a2951 50%, #2d4a6b 100%)'}}>
      {/* Sidebar */}
      <div className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        fixed inset-y-0 left-0 z-50 w-80 bg-gradient-to-b from-blue-900/95 to-indigo-900/95 backdrop-blur-sm border-r border-cyan-500/30 shadow-lg shadow-cyan-500/20
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Header */}
          <div className="p-6 border-b border-cyan-500/30 bg-gradient-to-r from-blue-800/30 to-cyan-700/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-400/50">
                  <Shield className="w-6 h-6 text-blue-900" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">Hawaii Security</h1>
                  <p className="text-xs text-cyan-400">Command Center</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-slate-400 hover:text-white"
                data-testid="button-close-sidebar"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-cyan-500/20">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-blue-900/50 border border-cyan-500/30 rounded-lg text-cyan-100 placeholder:text-cyan-400/70 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 text-sm focus:bg-blue-800/50 transition-all shadow-inner"
                data-testid="input-search"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`
                    group flex items-center justify-between p-4 rounded-xl transition-all duration-200 border-2
                    ${active
                      ? 'bg-gradient-to-r from-amber-500/30 to-orange-500/30 border-amber-400/60 text-amber-200 shadow-lg shadow-amber-500/30'
                      : 'text-slate-200 bg-slate-800/60 border-slate-600/40 hover:bg-slate-700/80 hover:text-white hover:border-amber-400/40 hover:shadow-md'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                  data-testid={`link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="flex items-center gap-4">
                    <Icon className={`w-6 h-6 ${active ? 'text-amber-300' : 'text-slate-400 group-hover:text-amber-300'}`} />
                    <div>
                      <div className="font-semibold text-sm">{item.name}</div>
                      <span className={`text-xs font-medium ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-cyan-500/30">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full p-3 h-auto justify-start hover:bg-blue-800/40 hover:border-cyan-500/20"
                  data-testid="button-user-menu"
                >
                  <div className="flex items-center gap-3 w-full">
                    <Avatar className="w-10 h-10 border-2 border-cyan-500/50">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-blue-900 font-semibold">
                        {user?.firstName?.[0] || user?.username?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-white text-sm">
                        {user?.firstName && user?.lastName 
                          ? `${user.firstName} ${user.lastName}`
                          : user?.username || 'User'
                        }
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                          {user?.role || 'Officer'}
                        </Badge>

                      </div>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-blue-900/95 border-cyan-500/30 backdrop-blur-sm">
                <DropdownMenuLabel className="text-cyan-300">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-cyan-500/30" />
                <DropdownMenuItem className="text-cyan-300 hover:bg-blue-800/50 focus:bg-blue-800/50" data-testid="menu-profile">
                  <Settings className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="text-cyan-300 hover:bg-blue-800/50 focus:bg-blue-800/50" data-testid="menu-notifications">
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-cyan-500/30" />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-red-400 hover:bg-blue-800/50 focus:bg-blue-800/50"
                  data-testid="menu-logout"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 backdrop-blur-sm border-b border-cyan-500/30 px-6 py-4 shadow-lg shadow-cyan-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-slate-400 hover:text-white"
                data-testid="button-open-sidebar"
              >
                <Menu className="w-5 h-5" />
              </Button>

              <div>
                <h2 className="text-xl font-semibold text-white">
                  {navigationItems.find(item => isActive(item.path))?.name || 'Dashboard'}
                </h2>
                <p className="text-sm text-slate-400">
                  {navigationItems.find(item => isActive(item.path))?.description || 'System Overview'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Status Indicator */}
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-400">System Online</span>
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white relative" data-testid="button-notifications">
                <Bell className="w-5 h-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">3</span>
                </div>
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gradient-to-br from-blue-950 to-indigo-950">
          {children}
        </main>
      </div>
    </div>
  );
}