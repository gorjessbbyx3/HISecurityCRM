
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
  Plus,
  Eye
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

// Senior-friendly stat card with larger text and clearer design
const SeniorStatCard = ({ title, value, icon: Icon, color, href, testId }: {
  title: string;
  value: number;
  icon: any;
  color: string;
  href: string;
  testId: string;
}) => (
  <Card className="senior-dashboard bg-card hover:bg-slate-600 transition-all duration-300 border-2 border-slate-600 hover:border-blue-500">
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-4">
        <Icon className={`w-8 h-8 ${color}`} />
        <div className={`card-value ${color}`} data-testid={testId}>
          {value}
        </div>
      </div>
      <h3 className="card-title mb-4">{title}</h3>
      <Link href={href}>
        <Button className="button-large w-full bg-blue-600 hover:bg-blue-700 text-white font-bold">
          <Eye className="w-5 h-5 mr-2" />
          VIEW DETAILS
        </Button>
      </Link>
    </CardContent>
  </Card>
);

// Senior-friendly system status with larger indicators
const SeniorSystemStatus = ({ systemStatus }: { systemStatus?: SystemStatus }) => {
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Object.entries(systemStatus).map(([system, status]) => (
        <Card key={system} className="senior-dashboard bg-card p-6">
          <CardContent className="text-center p-2">
            <div className={`w-6 h-6 rounded-full mx-auto mb-4 ${getStatusColor(status)} animate-pulse`} />
            <h3 className="card-title mb-2 uppercase">{system}</h3>
            <div className={`status-indicator ${
              status.toLowerCase().includes('online') || status.toLowerCase().includes('connected') || 
              status.toLowerCase().includes('active') || status.toLowerCase().includes('operational') || 
              status.toLowerCase().includes('ready') ? 'text-success' : 
              status.toLowerCase().includes('degraded') || status.toLowerCase().includes('slow') || 
              status.toLowerCase().includes('limited') || status.toLowerCase().includes('impaired') || 
              status.toLowerCase().includes('testing') ? 'text-warning' : 'text-danger'
            }`}>
              {status.toUpperCase()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

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
    cacheTime: 60000,
  });

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, queryClient]);

  // Senior-friendly stat cards
  const statCards = useMemo(() => [
    {
      title: "SECURITY PATROLS",
      value: stats?.activePatrols || 0,
      icon: Radio,
      color: "text-primary",
      href: "/patrol-reports",
      testId: "stat-active-patrols"
    },
    {
      title: "STAFF WORKING",
      value: stats?.onDutyStaff || 0,
      icon: UserCheck,
      color: "text-success",
      href: "/staff",
      testId: "stat-on-duty-staff"
    },
    {
      title: "INCIDENTS TODAY",
      value: stats?.openIncidents || 0,
      icon: AlertTriangle,
      color: "text-warning",
      href: "/reports",
      testId: "stat-open-incidents"
    },
    {
      title: "PROPERTIES SECURE",
      value: stats?.activeProperties || 0,
      icon: Building2,
      color: "text-primary",
      href: "/properties",
      testId: "stat-active-properties"
    }
  ], [stats]);

  // Loading state with larger elements
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-24 h-24 bg-blue-500 rounded-full mx-auto mb-8 animate-pulse"></div>
          <h2 className="senior-dashboard text-4xl font-bold text-white mb-6">Loading Security Dashboard...</h2>
          <p className="senior-dashboard card-description text-2xl">Please wait while we gather your security data...</p>
        </div>
      </div>
    );
  }

  // Error state with clear messaging
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center max-w-2xl">
          <AlertTriangle className="w-24 h-24 text-red-400 mx-auto mb-8" />
          <h2 className="senior-dashboard text-4xl font-bold text-red-400 mb-6">System Error</h2>
          <p className="senior-dashboard card-description text-2xl mb-8">Unable to load dashboard data. Please try refreshing the page.</p>
          <Button onClick={() => window.location.reload()} className="button-large bg-blue-600 hover:bg-blue-700">
            <Activity className="w-6 h-6 mr-3" />
            REFRESH DASHBOARD
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="senior-dashboard min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Large, Clear Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900/30 to-indigo-900/20 rounded-2xl border-2 border-blue-500/30 p-8">
          <div className="flex items-center justify-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-pulse border-2 border-white"></div>
            </div>
            <div className="text-center">
              <h1 className="text-5xl font-black text-white tracking-wider mb-2">SECURITY COMMAND CENTER</h1>
              <div className="card-description text-2xl mb-4">Hawaii Street Patrol Management System</div>
              <div className="flex items-center justify-center gap-4 text-xl">
                <div className="flex items-center gap-2 px-4 py-3 bg-green-500/20 border-2 border-green-500/30 rounded-full">
                  <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-success font-bold text-xl">SYSTEM ONLINE</span>
                </div>
                <div className="px-4 py-3 bg-blue-500/20 border-2 border-blue-500/30 rounded-full">
                  <span className="text-primary font-mono text-xl">
                    {format(new Date(), 'MMM dd, yyyy - HH:mm')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Alerts - Large and Prominent */}
        {stats?.emergencyAlerts && stats.emergencyAlerts.length > 0 && (
          <div className="bg-red-600 text-white p-8 rounded-2xl border-2 border-red-500">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Siren className="w-10 h-10 animate-pulse" />
              <h2 className="text-3xl font-bold">EMERGENCY ALERTS</h2>
            </div>
            <div className="space-y-4">
              {stats.emergencyAlerts.slice(0, 2).map((alert) => (
                <div key={alert.id} className="bg-red-700/50 p-6 rounded-xl border-2 border-red-500/50">
                  <div className="flex items-start gap-4">
                    <AlertOctagon className="w-8 h-8 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">{alert.title}</h3>
                      <p className="text-xl opacity-90 mb-3">{alert.description}</p>
                      {alert.location && (
                        <div className="flex items-center gap-2 text-lg">
                          <MapPin className="w-5 h-5" />
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

        {/* Key Metrics - Large Cards */}
        <div>
          <h2 className="text-3xl font-bold text-white text-center mb-6">SECURITY STATUS OVERVIEW</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {statCards.map((card, index) => (
              <SeniorStatCard key={index} {...card} />
            ))}
          </div>
        </div>

        {/* Quick Actions - Large Buttons */}
        <div>
          <h2 className="text-3xl font-bold text-white text-center mb-6">QUICK ACTIONS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/patrol-reports">
              <Button className="button-large w-full h-24 bg-blue-600 hover:bg-blue-700 text-white flex flex-col items-center gap-3">
                <FileCheck className="w-8 h-8" />
                <span className="text-xl font-bold">CREATE PATROL REPORT</span>
              </Button>
            </Link>
            <Link href="/reports">
              <Button className="button-large w-full h-24 bg-orange-600 hover:bg-orange-700 text-white flex flex-col items-center gap-3">
                <AlertTriangle className="w-8 h-8" />
                <span className="text-xl font-bold">LOG INCIDENT</span>
              </Button>
            </Link>
            <Link href="/scheduling">
              <Button className="button-large w-full h-24 bg-green-600 hover:bg-green-700 text-white flex flex-col items-center gap-3">
                <Calendar className="w-8 h-8" />
                <span className="text-xl font-bold">VIEW SCHEDULE</span>
              </Button>
            </Link>
            <Button
              className="button-large w-full h-24 bg-red-600 hover:bg-red-700 text-white flex flex-col items-center gap-3"
              onClick={() => {
                if (confirm('Are you sure you want to activate emergency response?')) {
                  alert('Emergency response has been activated!');
                }
              }}
            >
              <PhoneCall className="w-8 h-8 animate-pulse" />
              <span className="text-xl font-bold">EMERGENCY CALL</span>
            </Button>
          </div>
        </div>

        {/* System Status & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* System Status */}
          <div>
            <h2 className="text-3xl font-bold text-white text-center mb-6">SYSTEM STATUS</h2>
            <SeniorSystemStatus systemStatus={stats?.systemStatus} />
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-3xl font-bold text-white text-center mb-6">RECENT ACTIVITY</h2>
            <Card className="senior-dashboard bg-card">
              <CardContent className="p-6">
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {stats?.recentActivities?.length ? (
                    stats.recentActivities.slice(0, 3).map((activity) => (
                      <div key={activity.id} className="activity-item">
                        <div className="flex items-start gap-4">
                          <div className="w-4 h-4 bg-blue-500 rounded-full mt-3 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="activity-text">{activity.description}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <p className="timestamp">
                                {format(new Date(activity.timestamp), 'MMM dd, yyyy - HH:mm')}
                              </p>
                              <Badge className="text-lg bg-blue-500/20 text-blue-400 px-3 py-1">
                                {activity.type.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Activity className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                      <p className="card-description">No recent activity to display</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation Links - Large Cards */}
        <div>
          <h2 className="text-3xl font-bold text-white text-center mb-6">MAIN SECTIONS</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/staff">
              <Card className="senior-dashboard bg-card hover:bg-slate-600 transition-all cursor-pointer h-48">
                <CardContent className="text-center p-8 h-full flex flex-col justify-center">
                  <Users className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="card-title mb-2">STAFF MANAGEMENT</h3>
                  <p className="card-description">Manage Security Personnel</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/clients">
              <Card className="senior-dashboard bg-card hover:bg-slate-600 transition-all cursor-pointer h-48">
                <CardContent className="text-center p-8 h-full flex flex-col justify-center">
                  <Building2 className="w-16 h-16 text-success mx-auto mb-4" />
                  <h3 className="card-title mb-2">CLIENT RELATIONS</h3>
                  <p className="card-description">Manage Client Accounts</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/accounting">
              <Card className="senior-dashboard bg-card hover:bg-slate-600 transition-all cursor-pointer h-48">
                <CardContent className="text-center p-8 h-full flex flex-col justify-center">
                  <DollarSign className="w-16 h-16 text-warning mx-auto mb-4" />
                  <h3 className="card-title mb-2">FINANCIAL REPORTS</h3>
                  <p className="card-description">Billing & Payroll</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
