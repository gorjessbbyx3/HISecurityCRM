
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
  Globe
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
      {/* Modern Header with Balanced Layout */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-blue-500/30 px-6 py-4 shadow-lg shadow-slate-900/50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Left: Status Indicators */}
          <div className="flex items-center gap-6">
            {/* System Status */}
            <div className="flex items-center gap-3 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-bold text-sm uppercase tracking-wider">PATROL ACTIVE</span>
            </div>
            
            {/* Live Time */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 font-mono text-sm">
                {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Center: Brand Identity */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-2xl shadow-blue-500/40 border-2 border-blue-400/30 transition-all duration-300 group-hover:scale-105">
                <Shield className="w-8 h-8 text-white drop-shadow-lg" />
              </div>
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full border-3 border-slate-900 animate-pulse shadow-lg shadow-green-500/50"></div>
              <div className="absolute inset-0 w-16 h-16 border border-blue-400/20 rounded-xl animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 tracking-wider mb-1 enterprise-logo drop-shadow-lg">
                STREET PATROL
              </h1>
              <div className="flex items-center justify-center gap-2">
                <div className="w-8 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
                <p className="text-xs text-blue-400 font-bold uppercase tracking-[0.2em]">COMMAND HQ</p>
                <div className="w-8 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
              </div>
            </div>
          </div>

          {/* Right: User Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-slate-400 hover:text-white hover:bg-slate-800/50 relative p-3 rounded-lg border border-slate-700/50 hover:border-blue-500/30 transition-all duration-300" 
              data-testid="button-notifications"
            >
              <Bell className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/25 animate-pulse">
                <span className="text-xs text-white font-bold">3</span>
              </div>
            </Button>

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-3 hover:bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 hover:border-blue-500/30 transition-all duration-300"
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
              <DropdownMenuContent align="end" className="w-72 bg-slate-800 border-slate-700 shadow-2xl shadow-slate-900/50">
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
      </header>

      {/* Navigation Tabs */}
      <div className="bg-slate-900 border-b border-slate-800 px-4">
        <div className="max-w-7xl mx-auto">
          <Tabs value={getCurrentTabValue()} className="w-full">
            <TabsList className="h-12 bg-slate-800/50 border border-slate-700 p-1 w-full justify-start overflow-x-auto">
              {tabItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <Link key={item.path} href={item.path}>
                    <TabsTrigger 
                      value={item.path}
                      className={`
                        flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all
                        ${active 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-700'
                        }
                        whitespace-nowrap min-w-fit
                      `}
                      data-testid={`tab-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{item.name}</span>
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
