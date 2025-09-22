
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
      {/* Header with Logo and User */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Hawaii Security</h1>
              <p className="text-xs text-blue-400 font-medium uppercase tracking-wider">Enterprise Platform</p>
            </div>
          </div>

          {/* User Profile and Actions */}
          <div className="flex items-center gap-4">
            {/* System Status */}
            <div className="hidden md:flex items-center gap-2 text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-medium">ONLINE</span>
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-slate-800 relative p-2" data-testid="button-notifications">
              <Bell className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/25">
                <span className="text-xs text-white font-bold">3</span>
              </div>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-3 hover:bg-slate-800/50 p-2"
                  data-testid="button-user-menu"
                >
                  <Avatar className="w-8 h-8 border-2 border-blue-500/50">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm">
                      {user?.firstName?.[0] || user?.username?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden md:block">
                    <div className="font-semibold text-white text-sm">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user?.username || 'User'
                      }
                    </div>
                    <Badge className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {user?.role || 'Officer'}
                    </Badge>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-slate-800 border-slate-700">
                <DropdownMenuLabel className="text-slate-300">
                  <div className="font-semibold">Account Management</div>
                  <div className="text-xs text-slate-500 mt-1">Secure access controls</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem className="text-slate-300 hover:bg-slate-700 focus:bg-slate-700" data-testid="menu-profile">
                  <Settings className="mr-3 h-4 w-4 text-blue-400" />
                  <div>
                    <div className="font-medium">Profile Settings</div>
                    <div className="text-xs text-slate-500">Manage preferences</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-slate-300 hover:bg-slate-700 focus:bg-slate-700" data-testid="menu-notifications">
                  <Bell className="mr-3 h-4 w-4 text-yellow-400" />
                  <div>
                    <div className="font-medium">Notifications</div>
                    <div className="text-xs text-slate-500">Alert preferences</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/10"
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
