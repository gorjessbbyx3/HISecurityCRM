import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Shield,
  Users,
  MapPin,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Camera,
  PhoneCall,
  Car,
  FileText,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  Target,
  Zap,
  ShieldCheck,
  Radio,
  Navigation,
  Headphones,
  Timer,
  Building2,
  UserCheck,
  FileCheck,
  AlertOctagon,
  Siren,
  Globe,
  Wifi,
  Battery,
  Signal
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

export default function UltimateDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState("24h");
  const [refreshInterval, setRefreshInterval] = useState(30000);
  
  const queryClient = useQueryClient();

  // Fetch dashboard statistics
  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats", selectedTimeRange],
    refetchInterval: refreshInterval,
  });

  // Real-time updates via WebSocket simulation
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, queryClient]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'online':
      case 'connected':
      case 'active':
      case 'operational':
      case 'ready':
        return 'text-green-400 bg-green-400/20';
      case 'degraded':
      case 'slow':
      case 'limited':
      case 'impaired':
      case 'testing':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'offline':
      case 'disconnected':
      case 'down':
      case 'unavailable':
        return 'text-red-400 bg-red-400/20';
      default:
        return 'text-slate-400 bg-slate-400/20';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-red-500 bg-red-500/10 text-red-400';
      case 'high': return 'border-orange-500 bg-orange-500/10 text-orange-400';
      case 'medium': return 'border-yellow-500 bg-yellow-500/10 text-yellow-400';
      case 'low': return 'border-blue-500 bg-blue-500/10 text-blue-400';
      default: return 'border-slate-500 bg-slate-500/10 text-slate-400';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-800/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-400 mb-2">Dashboard Error</h3>
          <p className="text-slate-400">Unable to load dashboard data. Please refresh the page.</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Refresh Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-slate-950 min-h-screen">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Command Center</h1>
          <p className="text-slate-400">Real-time security operations overview</p>
        </div>
        
        <div className="flex items-center gap-4">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
            data-testid="select-time-range"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] })}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
            data-testid="button-refresh"
          >
            <Activity className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Emergency Alerts */}
      {stats?.emergencyAlerts && stats.emergencyAlerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Siren className="w-5 h-5 text-red-400" />
            Active Alerts
          </h2>
          <div className="grid gap-3">
            {stats.emergencyAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border ${getAlertColor(alert.type)} flex items-center justify-between`}
                data-testid={`alert-${alert.type}`}
              >
                <div className="flex items-center gap-3">
                  <AlertOctagon className="w-5 h-5" />
                  <div>
                    <h4 className="font-semibold">{alert.title}</h4>
                    <p className="text-sm opacity-80">{alert.description}</p>
                    {alert.location && (
                      <p className="text-xs opacity-60 mt-1">📍 {alert.location}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="mb-2">
                    {alert.status.toUpperCase()}
                  </Badge>
                  <p className="text-xs opacity-60">
                    {format(new Date(alert.timestamp), 'HH:mm')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <h2 className="lg:col-span-5 text-lg font-semibold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-400" />
          System Status
        </h2>
        
        {stats?.systemStatus && Object.entries(stats.systemStatus).map(([system, status]) => (
          <div
            key={system}
            className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
            data-testid={`system-${system}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-300 capitalize">{system}</span>
              <div className={`w-2 h-2 rounded-full ${getStatusColor(status).split(' ')[1]}`} />
            </div>
            <p className={`text-xs ${getStatusColor(status).split(' ')[0]} font-medium uppercase tracking-wide`}>
              {status}
            </p>
          </div>
        ))}
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Operations */}
        <Card className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-sm font-medium">Active Patrols</CardTitle>
              <Radio className="w-5 h-5 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1" data-testid="stat-active-patrols">
              {stats?.activePatrols || 0}
            </div>
            <p className="text-xs text-slate-400">Currently deployed</p>
            <Link href="/patrol-reports">
              <Button variant="ghost" size="sm" className="w-full mt-3 text-blue-400 hover:bg-blue-400/10">
                View Patrols
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Staff Status */}
        <Card className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-sm font-medium">On-Duty Staff</CardTitle>
              <UserCheck className="w-5 h-5 text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1" data-testid="stat-on-duty-staff">
              {stats?.onDutyStaff || 0}/{stats?.totalStaff || 0}
            </div>
            <p className="text-xs text-slate-400">Personnel available</p>
            <Link href="/staff">
              <Button variant="ghost" size="sm" className="w-full mt-3 text-green-400 hover:bg-green-400/10">
                Manage Staff
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Incident Management */}
        <Card className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-sm font-medium">Open Incidents</CardTitle>
              <AlertTriangle className="w-5 h-5 text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1" data-testid="stat-open-incidents">
              {stats?.openIncidents || 0}
            </div>
            <p className="text-xs text-slate-400">Requiring attention</p>
            <Link href="/reports">
              <Button variant="ghost" size="sm" className="w-full mt-3 text-orange-400 hover:bg-orange-400/10">
                View Incidents
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="w-5 h-5 text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1" data-testid="stat-monthly-revenue">
              ${(stats?.monthlyRevenue || 0).toLocaleString()}
            </div>
            <p className="text-xs text-slate-400">Current month</p>
            <Link href="/accounting">
              <Button variant="ghost" size="sm" className="w-full mt-3 text-amber-400 hover:bg-amber-400/10">
                View Finances
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      {stats?.performanceMetrics && (
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-400" />
              Performance Metrics
            </CardTitle>
            <CardDescription className="text-slate-400">
              Key performance indicators for operational excellence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {Object.entries(stats.performanceMetrics).map(([metric, value]) => (
                <div key={metric} className="space-y-3" data-testid={`metric-${metric}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300 capitalize">
                      {metric.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-lg font-bold text-white">{value}%</span>
                  </div>
                  <Progress 
                    value={value} 
                    className="h-2 bg-slate-700"
                  />
                  <div className="flex items-center gap-1">
                    {value >= 80 ? (
                      <TrendingUp className="w-3 h-3 text-green-400" />
                    ) : value >= 60 ? (
                      <TrendingDown className="w-3 h-3 text-yellow-400" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-400" />
                    )}
                    <span className={`text-xs ${
                      value >= 80 ? 'text-green-400' : 
                      value >= 60 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {value >= 80 ? 'Excellent' : value >= 60 ? 'Good' : 'Needs Improvement'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-slate-400">
              Frequently used operations and emergency procedures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/patrol-reports">
                <Button 
                  variant="outline" 
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 h-20 flex-col gap-2"
                  data-testid="action-new-report"
                >
                  <FileCheck className="w-5 h-5" />
                  <span className="text-xs">New Report</span>
                </Button>
              </Link>
              
              <Link href="/reports">
                <Button 
                  variant="outline" 
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 h-20 flex-col gap-2"
                  data-testid="action-log-incident"
                >
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-xs">Log Incident</span>
                </Button>
              </Link>
              
              <Link href="/scheduling">
                <Button 
                  variant="outline" 
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 h-20 flex-col gap-2"
                  data-testid="action-schedule"
                >
                  <Calendar className="w-5 h-5" />
                  <span className="text-xs">Schedule</span>
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                className="w-full border-red-600 text-red-400 hover:bg-red-600/10 h-20 flex-col gap-2"
                data-testid="action-emergency"
                onClick={() => {
                  if (confirm('This will trigger emergency protocols. Continue?')) {
                    alert('Emergency protocols activated. Dispatching response teams.');
                  }
                }}
              >
                <PhoneCall className="w-5 h-5" />
                <span className="text-xs">Emergency</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-400" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-slate-400">
              Latest system events and operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {stats?.recentActivities?.length ? (
                stats.recentActivities.map((activity) => (
                  <div 
                    key={activity.id}
                    className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg"
                    data-testid={`activity-${activity.type}`}
                  >
                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-white">{activity.description}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {format(new Date(activity.timestamp), 'MMM dd, HH:mm')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Property & Client Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              Protected Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-4" data-testid="stat-active-properties">
              {stats?.activeProperties || 0}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">High Security</span>
                <span className="text-white font-medium">12</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Standard</span>
                <span className="text-white font-medium">8</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Residential</span>
                <span className="text-white font-medium">5</span>
              </div>
            </div>
            <Link href="/properties">
              <Button variant="outline" size="sm" className="w-full mt-4 border-slate-600 text-slate-300 hover:bg-slate-700">
                Manage Properties
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              Active Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-4" data-testid="stat-total-clients">
              {stats?.totalClients || 0}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Enterprise</span>
                <span className="text-white font-medium">6</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Commercial</span>
                <span className="text-white font-medium">12</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Residential</span>
                <span className="text-white font-medium">7</span>
              </div>
            </div>
            <Link href="/clients">
              <Button variant="outline" size="sm" className="w-full mt-4 border-slate-600 text-slate-300 hover:bg-slate-700">
                Manage Clients
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}