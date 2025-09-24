
import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Shield,
  Users,
  MapPin,
  Clock,
  Activity,
  AlertOctagon,
  Siren,
  Radio,
  UserCheck,
  Building2,
  PhoneCall,
  Calendar,
  FileCheck,
  DollarSign,
  Plus
} from "lucide-react";
import { Link } from "wouter";
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

// Memoized stat card component
const StatCard = ({ title, value, icon: Icon, color, href, testId }: {
  title: string;
  value: number;
  icon: any;
  color: string;
  href: string;
  testId: string;
}) => (
  <Card className="bg-slate-800 border-slate-600 hover:border-blue-500 transition-all duration-200">
    <CardContent className="p-3">
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-5 h-5 ${color}`} />
        <div className={`text-xl font-bold ${color}`} data-testid={testId}>
          {value}
        </div>
      </div>
      <h3 className="text-xs font-bold text-white mb-2">{title}</h3>
      <Link href={href}>
        <Button className="w-full h-7 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold">
          MANAGE
        </Button>
      </Link>
    </CardContent>
  </Card>
);

// Memoized system status component
const SystemStatusGrid = ({ systemStatus }: { systemStatus?: SystemStatus }) => {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'online':
      case 'connected':
      case 'active':
      case 'operational':
      case 'ready':
        return 'bg-green-500';
      case 'degraded':
      case 'slow':
      case 'limited':
      case 'impaired':
      case 'testing':
        return 'bg-yellow-500';
      default:
        return 'bg-red-500';
    }
  };

  if (!systemStatus) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {Object.entries(systemStatus).map(([system, status]) => (
        <Card key={system} className="bg-slate-800 border-slate-600 p-2">
          <CardContent className="text-center p-1">
            <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${getStatusColor(status)} animate-pulse`} />
            <h3 className="text-xs font-bold text-white mb-1 uppercase">{system}</h3>
            <div className="text-xs font-bold text-slate-300">
              {status.toUpperCase()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default function UltimateDashboard() {
  const [refreshInterval] = useState(30000); // Fixed refresh interval
  const queryClient = useQueryClient();

  // Fetch dashboard statistics with optimized caching
  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    refetchInterval: refreshInterval,
    staleTime: 15000, // Consider data fresh for 15 seconds
    cacheTime: 60000, // Keep in cache for 1 minute
  });

  // Auto-refresh effect
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, queryClient]);

  // Memoized stat cards to prevent unnecessary re-renders
  const statCards = useMemo(() => [
    {
      title: "ACTIVE PATROLS",
      value: stats?.activePatrols || 0,
      icon: Radio,
      color: "text-blue-400",
      href: "/patrol-reports",
      testId: "stat-active-patrols"
    },
    {
      title: "STAFF ON DUTY",
      value: stats?.onDutyStaff || 0,
      icon: UserCheck,
      color: "text-green-400",
      href: "/staff",
      testId: "stat-on-duty-staff"
    },
    {
      title: "OPEN INCIDENTS",
      value: stats?.openIncidents || 0,
      icon: AlertTriangle,
      color: "text-orange-400",
      href: "/reports",
      testId: "stat-open-incidents"
    },
    {
      title: "PROPERTIES",
      value: stats?.activeProperties || 0,
      icon: Building2,
      color: "text-purple-400",
      href: "/properties",
      testId: "stat-active-properties"
    }
  ], [stats]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-6 animate-pulse"></div>
          <h2 className="text-2xl font-bold text-white mb-4">Loading Dashboard...</h2>
          <p className="text-slate-400">Gathering security data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-red-400 mb-4">System Error</h2>
          <p className="text-slate-400 mb-6">Unable to load dashboard data.</p>
          <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
            <Activity className="w-4 h-4 mr-2" />
            Refresh Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-3">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Optimized Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900/30 to-indigo-900/20 rounded-xl border border-blue-500/20 p-4">
          <div className="flex items-center justify-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div className="text-center">
              <h1 className="text-xl font-black text-white tracking-wider">STREET PATROL</h1>
              <div className="text-xs text-blue-400 font-bold uppercase tracking-widest">COMMAND CENTER</div>
              <div className="flex items-center justify-center gap-2 text-xs mt-1">
                <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400 font-bold">ACTIVE</span>
                </div>
                <div className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full">
                  <span className="text-blue-400 font-mono text-xs">
                    {format(new Date(), 'MMM dd, HH:mm')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Alerts - Conditional Rendering */}
        {stats?.emergencyAlerts && stats.emergencyAlerts.length > 0 && (
          <div className="bg-red-600 text-white p-3 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Siren className="w-5 h-5 animate-pulse" />
              <h2 className="text-sm font-bold">EMERGENCY ALERTS</h2>
            </div>
            <div className="space-y-2">
              {stats.emergencyAlerts.slice(0, 2).map((alert) => (
                <div key={alert.id} className="bg-red-700/50 p-2 rounded border border-red-500/50">
                  <div className="flex items-start gap-2">
                    <AlertOctagon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-sm font-bold">{alert.title}</h3>
                      <p className="text-xs opacity-90">{alert.description}</p>
                      {alert.location && (
                        <div className="flex items-center gap-1 text-xs mt-1">
                          <MapPin className="w-3 h-3" />
                          <span>{alert.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Metrics - Optimized Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statCards.map((card, index) => (
            <StatCard key={index} {...card} />
          ))}
        </div>

        {/* Quick Actions - Streamlined */}
        <div>
          <h2 className="text-sm font-bold text-white text-center mb-3">QUICK ACTIONS</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Link href="/patrol-reports">
              <Button className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex flex-col items-center gap-1">
                <FileCheck className="w-4 h-4" />
                PATROL REPORT
              </Button>
            </Link>
            <Link href="/reports">
              <Button className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex flex-col items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                LOG INCIDENT
              </Button>
            </Link>
            <Link href="/scheduling">
              <Button className="w-full h-14 bg-green-600 hover:bg-green-700 text-white text-xs font-bold flex flex-col items-center gap-1">
                <Calendar className="w-4 h-4" />
                SCHEDULE
              </Button>
            </Link>
            <Button
              className="w-full h-14 bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex flex-col items-center gap-1"
              onClick={() => {
                if (confirm('Activate emergency response?')) {
                  alert('Emergency response activated!');
                }
              }}
            >
              <PhoneCall className="w-4 h-4 animate-pulse" />
              EMERGENCY
            </Button>
          </div>
        </div>

        {/* System Status & Activity - Optimized Two Column */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* System Status */}
          <div>
            <h2 className="text-sm font-bold text-white text-center mb-3">SYSTEM STATUS</h2>
            <SystemStatusGrid systemStatus={stats?.systemStatus} />
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-sm font-bold text-white text-center mb-3">RECENT ACTIVITY</h2>
            <Card className="bg-slate-800 border-slate-600">
              <CardContent className="p-3">
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {stats?.recentActivities?.length ? (
                    stats.recentActivities.slice(0, 4).map((activity) => (
                      <div key={activity.id} className="flex items-start gap-2 p-2 bg-slate-700 rounded">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white font-medium truncate">{activity.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-slate-400 font-mono">
                              {format(new Date(activity.timestamp), 'MMM dd, HH:mm')}
                            </p>
                            <Badge className="text-xs bg-blue-500/20 text-blue-400 px-1 py-0">
                              {activity.type.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <Activity className="w-6 h-6 mx-auto mb-2 text-slate-500" />
                      <p className="text-xs text-slate-400">No recent activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation Links - Simplified */}
        <div>
          <h2 className="text-sm font-bold text-white text-center mb-3">MAIN SECTIONS</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Link href="/staff">
              <Card className="bg-slate-800 border-slate-600 hover:border-blue-500 transition-all cursor-pointer">
                <CardContent className="text-center p-4">
                  <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-white mb-1">STAFF</h3>
                  <p className="text-xs text-slate-300">Manage Personnel</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/clients">
              <Card className="bg-slate-800 border-slate-600 hover:border-green-500 transition-all cursor-pointer">
                <CardContent className="text-center p-4">
                  <Building2 className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-white mb-1">CLIENTS</h3>
                  <p className="text-xs text-slate-300">Client Relations</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/accounting">
              <Card className="bg-slate-800 border-slate-600 hover:border-purple-500 transition-all cursor-pointer">
                <CardContent className="text-center p-4">
                  <DollarSign className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-white mb-1">FINANCIAL</h3>
                  <p className="text-xs text-slate-300">Billing & Payroll</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
