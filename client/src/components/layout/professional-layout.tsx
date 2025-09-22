
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
      {/* Redesigned Modern Header */}
      <header className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border-b border-gradient-to-r from-blue-500/20 via-indigo-500/30 to-purple-500/20 shadow-2xl shadow-slate-950/80">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-0 right-1/4 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-0 left-1/2 w-36 h-36 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="relative z-10 px-6 py-5">
          <div className="max-w-7xl mx-auto">
            {/* Top Row: Brand & Status */}
            <div className="flex items-center justify-between mb-4">
              {/* Left: Enhanced Brand Identity */}
              <div className="flex items-center gap-5">
                <div className="relative group">
                  {/* Main Shield */}
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/50 border-3 border-blue-400/40 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                    <Shield className="w-10 h-10 text-white drop-shadow-2xl" />
                  </div>
                  
                  {/* Status Indicator */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full border-3 border-slate-950 flex items-center justify-center shadow-lg shadow-green-500/50">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                  
                  {/* Animated Rings */}
                  <div className="absolute inset-0 w-20 h-20 border-2 border-blue-400/30 rounded-2xl animate-spin opacity-60" style={{animationDuration: '8s'}}></div>
                  <div className="absolute -inset-1 w-22 h-22 border border-indigo-400/20 rounded-2xl animate-spin opacity-40" style={{animationDuration: '12s', animationDirection: 'reverse'}}></div>
                </div>

                <div className="space-y-1">
                  <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 tracking-wider enterprise-logo drop-shadow-2xl">
                    STREET PATROL
                  </h1>
                  <div className="flex items-center gap-3">
                    <div className="h-px bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 flex-1 max-w-16"></div>
                    <p className="text-sm text-blue-300 font-bold uppercase tracking-[0.3em] px-2 py-1 bg-blue-500/10 border border-blue-500/30 rounded-md">
                      COMMAND CENTER
                    </p>
                    <div className="h-px bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 flex-1 max-w-16"></div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 font-mono">OPERATIONAL SINCE</span>
                    <span className="text-blue-400 font-bold">2024</span>
                    <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                    <span className="text-green-400 font-bold">HAWAII AUTHORIZED</span>
                  </div>
                </div>
              </div>

              {/* Right: System Status & User */}
              <div className="flex items-center gap-4">
                {/* System Status Panel */}
                <div className="hidden lg:flex items-center gap-3 p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                    <span className="text-green-400 font-bold text-sm uppercase tracking-wider">ONLINE</span>
                  </div>
                  <div className="w-px h-4 bg-slate-600"></div>
                  <div className="text-xs text-slate-400 font-mono">
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {/* Emergency Alert Button */}
                <Button 
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white border border-red-500/50 shadow-lg shadow-red-500/25 transition-all duration-300 hover:scale-105"
                  size="sm"
                >
                  <Siren className="w-4 h-4 mr-2 animate-pulse" />
                  ALERT
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
                      className="flex items-center gap-3 p-3 bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/50 rounded-xl transition-all duration-300 hover:bg-slate-700/50 backdrop-blur-sm"
                      data-testid="button-user-menu"
                    >
                      <Avatar className="w-10 h-10 border-2 border-blue-500/50 shadow-lg shadow-blue-500/25">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm">
                          {user?.firstName?.[0] || user?.username?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left hidden lg:block">
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
                      <ChevronRight className="w-4 h-4 text-slate-400 hidden lg:block" />
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

            {/* Bottom Row: Live Status Indicators */}
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-full backdrop-blur-sm">
                <Radio className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-bold text-sm uppercase tracking-wider">PATROL ACTIVE</span>
              </div>
              
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full backdrop-blur-sm">
                <Wifi className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 font-bold text-sm uppercase tracking-wider">CONNECTED</span>
              </div>
              
              <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full backdrop-blur-sm">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span className="text-purple-400 font-bold text-sm uppercase tracking-wider">SECURE</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs - Moved to Top */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-blue-500/20 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <Tabs value={getCurrentTabValue()} className="w-full">
            <TabsList className="h-14 bg-slate-800/30 border border-slate-600/50 p-1 w-full justify-start overflow-x-auto backdrop-blur-sm">
              {tabItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <Link key={item.path} href={item.path}>
                    <TabsTrigger 
                      value={item.path}
                      className={`
                        flex items-center gap-3 px-6 py-3 text-sm font-bold transition-all rounded-lg
                        ${active 
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/40 border border-blue-400/50' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-700/70 hover:border hover:border-slate-600'
                        }
                        whitespace-nowrap min-w-fit uppercase tracking-wider
                      `}
                      data-testid={`tab-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="hidden sm:inline font-semibold">{item.name}</span>
                      {active && <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>}
                    </TabsTrigger>
                  </Link>
                );
              })}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 bg-slate-950">
        {children}
      </main>
    </div>
  );
}
