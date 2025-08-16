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
    <div className="h-screen bg-slate-950 flex overflow-hidden">
      {/* Sidebar */}
      <div className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        fixed inset-y-0 left-0 z-50 w-80 bg-slate-900/95 backdrop-blur-sm border-r border-slate-700/50
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Header */}
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-slate-900" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Hawaii Security</h1>
                  <p className="text-xs text-slate-400">Command Center</p>
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
          <div className="p-4 border-b border-slate-700/30">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 text-sm"
                data-testid="input-search"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`
                    group flex items-center justify-between p-3 rounded-xl transition-all duration-200
                    ${active
                      ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/30 text-amber-400'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white border border-transparent'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                  data-testid={`link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${active ? 'text-amber-400' : 'text-slate-400 group-hover:text-white'}`} />
                    <div>
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className={`text-xs ${active ? 'text-amber-300/70' : 'text-slate-500'}`}>
                        {item.description}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${active ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-slate-700/50">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full p-3 h-auto justify-start hover:bg-slate-800/50"
                  data-testid="button-user-menu"
                >
                  <div className="flex items-center gap-3 w-full">
                    <Avatar className="w-10 h-10 border-2 border-slate-700">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900 font-semibold">
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
                        <Badge variant="secondary" className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30">
                          {user?.role || 'Officer'}
                        </Badge>

                      </div>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700">
                <DropdownMenuLabel className="text-slate-300">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem className="text-slate-300 hover:bg-slate-700 focus:bg-slate-700" data-testid="menu-profile">
                  <Settings className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="text-slate-300 hover:bg-slate-700 focus:bg-slate-700" data-testid="menu-notifications">
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-red-400 hover:bg-slate-700 focus:bg-slate-700"
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
        <header className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4">
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
        <main className="flex-1 overflow-auto bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}