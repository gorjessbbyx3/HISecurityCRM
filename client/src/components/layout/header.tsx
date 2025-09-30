import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { User, Settings, LogOut, Bell, AlertCircle, CheckCircle, Info } from "lucide-react";
import { useLocation } from "wouter";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

export function Header() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "alert",
      title: "New Incident Reported",
      message: "A new incident was reported at Waikiki Beach property",
      time: "5 minutes ago",
      unread: true,
    },
    {
      id: 2,
      type: "info",
      title: "Patrol Report Submitted",
      message: "Officer Johnson submitted patrol report for Diamond Head",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 3,
      type: "success",
      title: "Shift Completed",
      message: "Your night shift has been marked as completed",
      time: "2 hours ago",
      unread: false,
    },
  ]);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, unread: false } : n
    ));
  };

  return (
    <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-navy-700 rounded-lg flex items-center justify-center">
              <i className="fas fa-shield-alt text-gold-500 text-lg"></i>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white" data-testid="text-app-title">
                Hawaii Security CRM
              </h1>
              <p className="text-xs text-slate-400">Crime Watch & Protection Services</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center bg-slate-700 rounded-lg px-4 py-2">
            <i className="fas fa-search text-slate-400 mr-3"></i>
            <input 
              type="text" 
              placeholder="Search clients, properties, incidents..." 
              className="bg-transparent text-white placeholder-slate-400 outline-none text-sm w-64"
              data-testid="input-global-search"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <Popover>
              <PopoverTrigger asChild>
                <button 
                  className="relative p-2 text-slate-400 hover:text-white transition-colors"
                  data-testid="button-notifications"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.filter(n => n.unread).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                      {notifications.filter(n => n.unread).length}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent 
                align="end" 
                className="w-80 p-0 bg-slate-800 border-slate-700"
                data-testid="popover-notifications"
              >
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                  <h3 className="font-semibold text-white">Notifications</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs text-slate-400 hover:text-white"
                    data-testid="button-mark-all-read"
                  >
                    Mark all as read
                  </Button>
                </div>
                <ScrollArea className="h-96">
                  <div className="divide-y divide-slate-700">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                        <p className="text-slate-400">No notifications</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <button
                          key={notification.id}
                          onClick={() => markAsRead(notification.id)}
                          className={`w-full p-4 text-left hover:bg-slate-700/50 transition-colors ${
                            notification.unread ? "bg-slate-700/30" : ""
                          }`}
                          data-testid={`notification-${notification.id}`}
                        >
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 mt-1">
                              {notification.type === "alert" && (
                                <AlertCircle className="w-5 h-5 text-red-400" />
                              )}
                              {notification.type === "info" && (
                                <Info className="w-5 h-5 text-blue-400" />
                              )}
                              {notification.type === "success" && (
                                <CheckCircle className="w-5 h-5 text-green-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-medium text-white">
                                  {notification.title}
                                </p>
                                {notification.unread && (
                                  <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></span>
                                )}
                              </div>
                              <p className="text-sm text-slate-400 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </ScrollArea>
                <div className="p-3 border-t border-slate-700">
                  <Button
                    variant="ghost"
                    className="w-full text-sm text-slate-400 hover:text-white"
                    data-testid="button-view-all-notifications"
                  >
                    View all notifications
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-3 border-l border-slate-600 pl-4 hover:opacity-80 transition-opacity" data-testid="button-user-menu">
                  {user?.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl}
                      alt="Profile" 
                      className="w-8 h-8 rounded-full object-cover border-2 border-gold-500"
                      data-testid="img-user-avatar"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-navy-700 flex items-center justify-center border-2 border-gold-500">
                      <User className="w-4 h-4 text-gold-500" />
                    </div>
                  )}
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-white" data-testid="text-user-name">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user?.email?.split('@')[0] || "Officer"
                      }
                    </p>
                    <p className="text-xs text-slate-400" data-testid="text-user-role">
                      {user?.role?.replace('_', ' ').toUpperCase() || "SECURITY OFFICER"}
                    </p>
                  </div>
                  <i className="fas fa-chevron-down text-xs text-slate-400"></i>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700">
                <DropdownMenuLabel className="text-slate-300">
                  My Account
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem 
                  className="text-slate-300 focus:bg-slate-700 focus:text-white cursor-pointer"
                  onClick={() => setLocation('/profile')}
                  data-testid="menu-profile"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-slate-300 focus:bg-slate-700 focus:text-white cursor-pointer"
                  onClick={() => setLocation('/settings')}
                  data-testid="menu-settings"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem 
                  className="text-red-400 focus:bg-slate-700 focus:text-red-300 cursor-pointer"
                  onClick={() => window.location.href = "/api/logout"}
                  data-testid="menu-logout"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
