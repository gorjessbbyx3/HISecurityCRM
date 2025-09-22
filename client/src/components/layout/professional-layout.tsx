
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
  MapPin,
  TrendingUp,
  Zap,
  Globe
} from "lucide-react";

interface ProfessionalLayoutProps {
  children: ReactNode;
}

const navigationItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: Home,
    description: "System Overview",
    category: "Core"
  },
  {
    name: "Staff Management",
    path: "/staff",
    icon: Users,
    description: "Personnel Control",
    category: "Operations"
  },
  {
    name: "Client Portal",
    path: "/clients",
    icon: Building2,
    description: "Client Relations",
    category: "Business"
  },
  {
    name: "Properties",
    path: "/properties",
    icon: MapPin,
    description: "Asset Management",
    category: "Operations"
  },
  {
    name: "Patrol Reports",
    path: "/patrol-reports",
    icon: ClipboardList,
    description: "Field Operations",
    category: "Operations"
  },
  {
    name: "Incident Management",
    path: "/reports",
    icon: AlertTriangle,
    description: "Security Events",
    category: "Operations"
  },
  {
    name: "Crime Intelligence",
    path: "/crime-intelligence",
    icon: Camera,
    description: "Threat Analysis",
    category: "Intelligence"
  },
  {
    name: "Scheduling",
    path: "/scheduling",
    icon: Calendar,
    description: "Resource Planning",
    category: "Operations"
  },
  {
    name: "Financial",
    path: "/accounting",
    icon: Calculator,
    description: "Billing & Payroll",
    category: "Business"
  },
  {
    name: "Law Reference",
    path: "/law-reference",
    icon: BookOpen,
    description: "Legal Resources",
    category: "Reference"
  },
  {
    name: "Community",
    path: "/community-outreach",
    icon: Heart,
    description: "Public Relations",
    category: "Business"
  }
];

const groupedItems = navigationItems.reduce((acc, item) => {
  if (!acc[item.category]) {
    acc[item.category] = [];
  }
  acc[item.category].push(item);
  return acc;
}, {} as Record<string, typeof navigationItems>);

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
    <div className="h-screen flex overflow-hidden bg-slate-950">
      {/* Enterprise Sidebar */}
      <div className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        fixed inset-y-0 left-0 z-50 w-80 enterprise-sidebar
        transform transition-transform duration-300 ease-out
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Header */}
          <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold enterprise-logo">Hawaii Security</h1>
                  <p className="text-xs text-blue-400 font-medium uppercase tracking-wider">Enterprise Platform</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-slate-400 hover:text-white hover:bg-slate-800"
                data-testid="button-close-sidebar"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* System Status Bar */}
          <div className="px-6 py-3 border-b border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-medium">SYSTEM ONLINE</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <div className="flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  <span>99.9%</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>OPTIMAL</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Search */}
          <div className="p-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-blue-400 transition-colors" />
              <input
                type="text"
                placeholder="Search features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm transition-all backdrop-blur-sm"
                data-testid="input-search"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 pb-4 space-y-6">
            {searchQuery ? (
              /* Search Results */
              <div className="space-y-1">
                {filteredNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`nav-item group flex items-center gap-4 ${active ? 'active' : ''}`}
                      onClick={() => setSidebarOpen(false)}
                      data-testid={`link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'} transition-colors`} />
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{item.name}</div>
                        <div className={`text-xs ${active ? 'text-blue-200' : 'text-slate-500 group-hover:text-slate-400'}`}>
                          {item.description}
                        </div>
                      </div>
                      {active && <div className="w-2 h-2 bg-white rounded-full" />}
                    </Link>
                  );
                })}
              </div>
            ) : (
              /* Grouped Navigation */
              Object.entries(groupedItems).map(([category, items]) => (
                <div key={category} className="space-y-3">
                  <div className="flex items-center gap-2 px-3">
                    <div className="h-px bg-gradient-to-r from-slate-700 to-transparent flex-1" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{category}</span>
                    <div className="h-px bg-gradient-to-l from-slate-700 to-transparent flex-1" />
                  </div>
                  
                  <div className="space-y-1">
                    {items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.path);
                      
                      return (
                        <Link
                          key={item.path}
                          href={item.path}
                          className={`nav-item group flex items-center gap-4 ${active ? 'active' : ''}`}
                          onClick={() => setSidebarOpen(false)}
                          data-testid={`link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'} transition-colors`} />
                          <div className="flex-1">
                            <div className="font-semibold text-sm">{item.name}</div>
                            <div className={`text-xs ${active ? 'text-blue-200' : 'text-slate-500 group-hover:text-slate-400'}`}>
                              {item.description}
                            </div>
                          </div>
                          {active && <div className="w-2 h-2 bg-white rounded-full" />}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-slate-800 bg-gradient-to-r from-slate-800/30 to-slate-900/30">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full p-4 h-auto justify-start hover:bg-slate-800/50 group"
                  data-testid="button-user-menu"
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className="relative">
                      <Avatar className="w-11 h-11 border-2 border-blue-500/50 group-hover:border-blue-400 transition-colors">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-lg">
                          {user?.firstName?.[0] || user?.username?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900"></div>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-white text-sm">
                        {user?.firstName && user?.lastName 
                          ? `${user.firstName} ${user.lastName}`
                          : user?.username || 'User'
                        }
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30">
                          {user?.role || 'Officer'}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Globe className="w-3 h-3" />
                          <span>Online</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 enterprise-card border-slate-800">
                <DropdownMenuLabel className="text-slate-300 px-4 py-3">
                  <div className="font-semibold">Account Management</div>
                  <div className="text-xs text-slate-500 mt-1">Secure access controls</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-800" />
                <DropdownMenuItem className="text-slate-300 hover:bg-slate-800 focus:bg-slate-800 px-4 py-3" data-testid="menu-profile">
                  <Settings className="mr-3 h-4 w-4 text-blue-400" />
                  <div>
                    <div className="font-medium">Profile Settings</div>
                    <div className="text-xs text-slate-500">Manage preferences</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-slate-300 hover:bg-slate-800 focus:bg-slate-800 px-4 py-3" data-testid="menu-notifications">
                  <Bell className="mr-3 h-4 w-4 text-yellow-400" />
                  <div>
                    <div className="font-medium">Notifications</div>
                    <div className="text-xs text-slate-500">Alert preferences</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-800" />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 px-4 py-3"
                  data-testid="menu-logout"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <div>
                    <div className="font-medium">Sign Out</div>
                    <div className="text-xs text-red-500/70">Secure logout</div>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Enhanced Top Bar */}
        <header className="enterprise-header px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-slate-400 hover:text-white hover:bg-slate-800"
                data-testid="button-open-sidebar"
              >
                <Menu className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  {(() => {
                    const currentItem = navigationItems.find(item => isActive(item.path));
                    const Icon = currentItem?.icon || Home;
                    return <Icon className="w-4 h-4 text-white" />;
                  })()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {navigationItems.find(item => isActive(item.path))?.name || 'STREET PATROL'}
                  </h2>
                  <p className="text-sm text-slate-400">
                    {navigationItems.find(item => isActive(item.path))?.description || 'System Overview'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* System Status */}
              <div className="hidden md:flex items-center gap-4">
                <div className="status-indicator status-online">
                  <span>System Online</span>
                </div>
                <div className="text-sm text-slate-400 font-mono">
                  {new Date().toLocaleTimeString()}
                </div>
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-slate-800 relative" data-testid="button-notifications">
                <Bell className="w-5 h-5" />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/25">
                  <span className="text-xs text-white font-bold">3</span>
                </div>
              </Button>

              {/* Quick Actions */}
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-slate-800" data-testid="button-quick-actions">
                <Zap className="w-5 h-5" />
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
