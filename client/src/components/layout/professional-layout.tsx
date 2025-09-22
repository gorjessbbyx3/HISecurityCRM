
import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Globe,
  Siren,
  Radio,
  Wifi,
  ShieldCheck
} from "lucide-react";

interface ProfessionalLayoutProps {
  children: ReactNode;
}

const tabItems = [
  { name: "Dashboard", path: "/dashboard", icon: Home },
  { name: "Staff", path: "/staff", icon: Users },
  { name: "Clients", path: "/clients", icon: Building2 },
  { name: "Properties", path: "/properties", icon: MapPin },
  { name: "Patrols", path: "/patrol-reports", icon: ClipboardList },
  { name: "Incidents", path: "/reports", icon: AlertTriangle },
  { name: "Intelligence", path: "/crime-intelligence", icon: Camera },
  { name: "Schedule", path: "/scheduling", icon: Calendar },
  { name: "Financial", path: "/accounting", icon: Calculator },
  { name: "Law", path: "/law-reference", icon: BookOpen },
  { name: "Community", path: "/community-outreach", icon: Heart }
];

export default function ProfessionalLayout({ children }: ProfessionalLayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const isActive = (path: string) => {
    if (path === "/dashboard" && (location === "/" || location === "/dashboard")) {
      return true;
    }
    return location === path;
  };

  const getCurrentTabValue = () => {
    const currentTab = tabItems.find(item => isActive(item.path));
    return currentTab ? currentTab.path : "/dashboard";
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Navigation Tabs at Top with integrated notifications and user menu */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-blue-500/20 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between py-3">
            {/* Left: Brand */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 border border-blue-400/30">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 tracking-wider">
                    STREET PATROL
                  </h1>
                  <p className="text-xs text-blue-400 font-bold uppercase tracking-widest">
                    COMMAND CENTER
                  </p>
                </div>
              </div>
            </div>

            {/* Center: Navigation Tabs */}
            <div className="flex-1 mx-8">
              <Tabs value={getCurrentTabValue()} className="w-full">
                <TabsList className="h-12 bg-slate-800/30 border border-slate-600/50 p-1 w-full justify-center overflow-x-auto backdrop-blur-sm">
                  {tabItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    
                    return (
                      <Link key={item.path} href={item.path}>
                        <TabsTrigger 
                          value={item.path}
                          className={`
                            flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all rounded-lg
                            ${active 
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/40 border border-blue-400/50' 
                              : 'text-slate-300 hover:text-white hover:bg-slate-700/70 hover:border hover:border-slate-600'
                            }
                            whitespace-nowrap min-w-fit uppercase tracking-wider
                          `}
                          data-testid={`tab-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="hidden lg:inline font-semibold text-xs">{item.name}</span>
                          {active && <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>}
                        </TabsTrigger>
                      </Link>
                    );
                  })}
                </TabsList>
              </Tabs>
            </div>

            {/* Right: Notifications, Emergency Alert & User */}
            <div className="flex items-center gap-3">
              {/* System Status */}
              <div className="hidden xl:flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-bold text-xs uppercase tracking-wider">ONLINE</span>
              </div>

              {/* Emergency Alert */}
              <Button 
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white border border-red-500/50 shadow-lg shadow-red-500/25 transition-all duration-300 hover:scale-105"
                size="sm"
              >
                <Siren className="w-4 h-4 mr-2 animate-pulse" />
                <span className="hidden md:inline">ALERT</span>
              </Button>

              {/* Notifications */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative p-3 bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/50 rounded-xl transition-all duration-300 hover:bg-slate-700/50 backdrop-blur-sm" 
                data-testid="button-notifications"
              >
                <Bell className="w-5 h-5 text-slate-300 hover:text-white" />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 animate-pulse">
                  <span className="text-xs text-white font-bold">3</span>
                </div>
              </Button>

              {/* User Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex items-center gap-3 p-2 bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/50 rounded-xl transition-all duration-300 hover:bg-slate-700/50 backdrop-blur-sm"
                    data-testid="button-user-menu"
                  >
                    <Avatar className="w-8 h-8 border-2 border-blue-500/50 shadow-lg shadow-blue-500/25">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm">
                        {user?.firstName?.[0] || user?.username?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left hidden xl:block">
                      <div className="font-bold text-white text-sm tracking-wide">
                        {user?.firstName && user?.lastName 
                          ? `${user.firstName} ${user.lastName}`
                          : user?.username || 'User'
                        }
                      </div>
                      <Badge className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30 font-semibold uppercase tracking-wider">
                        {user?.role || 'Officer'}
                      </Badge>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 hidden xl:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 bg-slate-800/95 border-slate-700 shadow-2xl shadow-slate-950/80 backdrop-blur-sm">
                  <DropdownMenuLabel className="text-slate-300 p-4">
                    <div className="font-bold text-base">Command Portal</div>
                    <div className="text-xs text-slate-500 mt-1">Security access & controls</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem className="text-slate-300 hover:bg-slate-700 focus:bg-slate-700 p-4" data-testid="menu-profile">
                    <Settings className="mr-3 h-5 w-5 text-blue-400" />
                    <div>
                      <div className="font-semibold">Profile Settings</div>
                      <div className="text-xs text-slate-500">Configure preferences</div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-slate-300 hover:bg-slate-700 focus:bg-slate-700 p-4" data-testid="menu-notifications">
                    <Bell className="mr-3 h-5 w-5 text-yellow-400" />
                    <div>
                      <div className="font-semibold">Alert Center</div>
                      <div className="text-xs text-slate-500">Notification settings</div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 p-4"
                    data-testid="menu-logout"
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    <div>
                      <div className="font-semibold">Secure Logout</div>
                      <div className="text-xs text-red-500/70">End patrol session</div>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 bg-slate-950">
        {children}
      </main>
    </div>
  );
}
