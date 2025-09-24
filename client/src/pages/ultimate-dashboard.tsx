
import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Clock,
  Users,
  AlertTriangle,
  Shield,
  MapPin,
  Bell,
  Calendar,
  FileText,
  Activity,
  Radio,
  Eye,
  ChevronRight,
  Settings,
  Search,
  Filter
} from "lucide-react";
import { format } from "date-fns";

interface DashboardStats {
  totalClients: number;
  activeProperties: number;
  totalStaff: number;
  onDutyStaff: number;
  openIncidents: number;
  resolvedIncidents24h: number;
  activePatrols: number;
  scheduledAppointments: number;
  monthlyRevenue: number;
  expenses: number;
  recentActivities: Activity[];
  systemStatus: SystemStatus;
  emergencyAlerts: EmergencyAlert[];
  performanceMetrics: PerformanceMetrics;
}

interface SystemStatus {
  server: 'online' | 'degraded' | 'offline';
  database: 'connected' | 'slow' | 'disconnected';
  communications: 'active' | 'limited' | 'down';
  gps: 'operational' | 'impaired' | 'unavailable';
  emergency: 'ready' | 'testing' | 'offline';
}

interface EmergencyAlert {
  id: string;
  type: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  location?: string;
  timestamp: string;
  status: 'active' | 'investigating' | 'resolved';
}

interface PerformanceMetrics {
  responseTime: number;
  clientSatisfaction: number;
  incidentResolution: number;
  patrolEfficiency: number;
  staffUtilization: number;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  userId?: string;
  metadata?: any;
}

// TRACKTIK-style metric card component
const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  bgColor, 
  textColor = "text-white",
  size = "default" 
}: {
  title: string;
  value: number | string;
  icon: any;
  bgColor: string;
  textColor?: string;
  size?: "small" | "default";
}) => (
  <div className={`${bgColor} rounded-lg p-4 ${size === "small" ? "min-h-[80px]" : "min-h-[100px]"} flex flex-col justify-between shadow-lg`}>
    <div className="flex items-center justify-between">
      <Icon className={`w-6 h-6 ${textColor} opacity-80`} />
      <div className={`${textColor} text-right`}>
        <div className={`text-xs font-medium opacity-80 uppercase tracking-wide`}>
          {title}
        </div>
        <div className={`text-2xl font-bold ${size === "small" ? "text-xl" : "text-3xl"}`}>
          {value}
        </div>
      </div>
    </div>
  </div>
);

// Activity item component matching TRACKTIK style
const ActivityItem = ({ activity }: { activity: any }) => (
  <div className="flex items-start gap-3 p-3 hover:bg-slate-700/50 rounded-lg transition-colors">
    <Avatar className="w-8 h-8 mt-1">
      <AvatarFallback className="bg-blue-600 text-white text-xs">
        MP
      </AvatarFallback>
    </Avatar>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm font-medium text-white">Michael Prinsky</span>
        <span className="text-xs text-slate-400">signed in to</span>
        <span className="text-sm text-blue-400">City Healthcare Center</span>
      </div>
      <div className="text-xs text-slate-400">At Mobile Patrol - Northern</div>
      <div className="flex items-center gap-4 mt-1">
        <span className="text-xs text-slate-500">{format(new Date(activity.timestamp), 'h:mm a')}</span>
        <div className="flex items-center gap-1">
          <Radio className="w-3 h-3 text-green-400" />
          <span className="text-xs text-green-400">94%</span>
        </div>
      </div>
    </div>
    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-xs">
      Track
    </Button>
  </div>
);

export default function UltimateDashboard() {
  const [refreshInterval] = useState(30000);
  const queryClient = useQueryClient();

  // Fetch dashboard statistics
  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }
      return response.json();
    },
    refetchInterval: refreshInterval,
    staleTime: 15000,
  });

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, queryClient]);

  // Mock data for demonstration
  const mockActivities = [
    {
      id: "1",
      type: "signin",
      description: "Michael Prinsky signed in to City Healthcare Center",
      timestamp: new Date().toISOString(),
      userId: "mp001"
    },
    {
      id: "2", 
      type: "patrol",
      description: "Mobile Patrol - Northern / Armed Mobile Patrol Officer",
      timestamp: new Date(Date.now() - 240000).toISOString(),
      userId: "mp002"
    },
    {
      id: "3",
      type: "patrol", 
      description: "Mobile Patrol - Northern / Mobile Patrol MP",
      timestamp: new Date(Date.now() - 660000).toISOString(),
      userId: "mp003"
    }
  ];

  // Top metric cards data
  const topMetrics = [
    { title: "LATE LONE WORKER", value: "00", icon: Clock, bgColor: "bg-slate-600" },
    { title: "CLOCKING VIA MOBILE", value: "11", icon: Users, bgColor: "bg-blue-500" },
    { title: "INACTIVE MOBILE USERS", value: "11", icon: AlertTriangle, bgColor: "bg-red-500" },
    { title: "SCANNING RULES", value: "23", icon: Shield, bgColor: "bg-orange-500" },
    { title: "REPORTS TO APPROVE", value: "13", icon: FileText, bgColor: "bg-blue-600" },
    { title: "REPORTS TO PUBLISH", value: "01", icon: Eye, bgColor: "bg-blue-700" },
    { title: "MESSAGE BOARD", value: "144", icon: Bell, bgColor: "bg-cyan-500" },
    { title: "SCHEDULED SHIFTS", value: "25", icon: Calendar, bgColor: "bg-green-500" },
    { title: "LATE SHIFTS", value: "00", icon: Clock, bgColor: "bg-purple-600" },
    { title: "PANIC TRIGGERED", value: "01", icon: AlertTriangle, bgColor: "bg-red-600" }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-lg mx-auto mb-4 animate-pulse"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Dashboard...</h2>
          <p className="text-slate-400">Please wait...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-400 mb-2">System Error</h2>
          <p className="text-slate-400">Unable to load dashboard data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Top Metrics Bar */}
      <div className="bg-slate-800 p-4 border-b border-slate-700">
        <div className="grid grid-cols-5 lg:grid-cols-10 gap-3">
          {topMetrics.map((metric, index) => (
            <MetricCard
              key={index}
              title={metric.title}
              value={metric.value}
              icon={metric.icon}
              bgColor={metric.bgColor}
              size="small"
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-140px)]">
        {/* Activity Feed Panel */}
        <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
          {/* Activity Feed Header */}
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Activity Feed</h3>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  <Filter className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="flex gap-4 text-sm">
              <button className="text-blue-400 border-b-2 border-blue-400 pb-1">Activity Feed</button>
              <button className="text-slate-400 hover:text-white">Attendance</button>
              <button className="text-slate-400 hover:text-white">Scheduled Tours</button>
            </div>
          </div>

          {/* Activity List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {mockActivities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>

          {/* Mobile Patrol Status */}
          <div className="p-4 border-t border-slate-700">
            <div className="bg-slate-700 rounded-lg p-3">
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-blue-600 text-white">
                    DB
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">Darius Bates</div>
                  <div className="text-xs text-slate-400">Mobile Patrol - South Western - Mobile</div>
                  <div className="text-xs text-green-400">Clock In Time...</div>
                </div>
              </div>
              
              {/* Status indicators */}
              <div className="flex justify-between items-center mt-3">
                <div className="text-center">
                  <Clock className="w-6 h-6 mx-auto mb-1 text-slate-400" />
                  <div className="text-xs text-slate-400">TIME CLOCK</div>
                </div>
                <div className="text-center">
                  <FileText className="w-6 h-6 mx-auto mb-1 text-slate-400" />
                  <div className="text-xs text-slate-400">SITES</div>
                </div>
                <div className="text-center">
                  <Shield className="w-6 h-6 mx-auto mb-1 text-blue-400" />
                  <div className="text-xs text-slate-400">CHECKPOINTS</div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mt-4">
                <Button className="bg-red-600 hover:bg-red-700 text-white flex-1 text-sm">
                  Finish
                </Button>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white flex-1 text-sm">
                  Optimize
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white flex-1 text-sm">
                  Reload
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Map and Status Panel */}
        <div className="flex-1 flex flex-col">
          {/* Map Area */}
          <div className="flex-1 relative bg-slate-700">
            {/* Map placeholder */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
              <div className="text-slate-600 text-center">
                <MapPin className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg font-medium">Interactive Map</p>
                <p className="text-sm">Real-time patrol tracking</p>
              </div>
            </div>

            {/* Map controls */}
            <div className="absolute top-4 right-4 space-y-2">
              <Button size="sm" className="bg-white text-black hover:bg-gray-100">
                Auto-Fit: OFF
              </Button>
              <Button size="sm" className="bg-white text-black hover:bg-gray-100">
                Full Page
              </Button>
            </div>

            {/* Status overlay */}
            <div className="absolute bottom-4 left-4 bg-slate-800/90 rounded-lg p-3 backdrop-blur">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-blue-400">Status - On Route</span>
              </div>
              <div className="text-xs text-slate-300">City Healthcare Center (08:00am - 10:00pm) ID#5128</div>
              <div className="text-xs text-blue-400 cursor-pointer">Click here when arrived on site</div>
            </div>
          </div>
        </div>

        {/* Right Panel - Patrol Status */}
        <div className="w-80 bg-slate-800 border-l border-slate-700 p-4">
          <div className="space-y-4">
            {/* Quick actions */}
            <div className="bg-slate-700 rounded-lg p-3">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium">Mobile Patrol - Northern</span>
                <span className="text-xs text-green-400">Armed Mobile Patrol Officer</span>
              </div>
              <div className="text-xs text-slate-400 mb-2">
                Last Action: about 4 hours ago<br />
                North Winnipeg
              </div>
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white w-full">
                Track
              </Button>
            </div>

            {/* Additional patrol entries */}
            {[
              { name: "Mobile Patrol - Northern", role: "Mobile Patrol MP", time: "about 11 minutes ago", location: "North Winnipeg" },
              { name: "TrackPoint", role: "Main entrance", time: "about 2 hours ago", location: "North End" },
              { name: "Great Northern Hotel", role: "Patrol Officer", time: "yesterday", location: "South Winnipeg" },
              { name: "Mobile Patrol - Southern", role: "Mobile Patrol Boston", time: "about 2 hours ago", location: "South Winnipeg" }
            ].map((patrol, index) => (
              <div key={index} className="bg-slate-700 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{patrol.name}</div>
                    <div className="text-xs text-slate-400">{patrol.role}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Last Action: {patrol.time}<br />
                      {patrol.location}
                    </div>
                  </div>
                  <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                    Track
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
