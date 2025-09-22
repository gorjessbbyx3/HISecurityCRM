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
  Signal,
  Gauge,
  ArrowUpRight,
  ArrowDownRight,
  Home,
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
        return 'text-green-400 bg-green-500/20 border-green-500/50';
      case 'degraded':
      case 'slow':
      case 'limited':
      case 'impaired':
      case 'testing':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
      case 'offline':
      case 'disconnected':
      case 'down':
      case 'unavailable':
        return 'text-red-400 bg-red-500/20 border-red-500/50';
      default:
        return 'text-slate-400 bg-slate-500/20 border-slate-500/50';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-red-500/50 bg-red-500/10 text-red-300';
      case 'high': return 'border-orange-500/50 bg-orange-500/10 text-orange-300';
      case 'medium': return 'border-yellow-500/50 bg-yellow-500/10 text-yellow-300';
      case 'low': return 'border-blue-500/50 bg-blue-500/10 text-blue-300';
      default: return 'border-slate-500/50 bg-slate-500/10 text-slate-300';
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-8 bg-slate-950 min-h-screen">
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-6 animate-pulse"></div>
          <h2 className="text-3xl font-bold text-white mb-4">Loading Dashboard...</h2>
          <p className="text-xl text-slate-400">Please wait while we gather your security data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-slate-950 min-h-screen">
        <div className="max-w-2xl mx-auto text-center py-20">
          <AlertTriangle className="w-20 h-20 text-red-400 mx-auto mb-8" />
          <h2 className="text-4xl font-bold text-red-400 mb-6">System Error</h2>
          <p className="text-xl text-slate-400 mb-8">Unable to load dashboard data. Please refresh the page or contact support.</p>
          <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
            <Activity className="w-6 h-6 mr-3" />
            Refresh Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-2">
      <div className="max-w-7xl mx-auto space-y-2">
        {/* Modern Street Patrol Header */}
        <div className="mb-4 bg-gradient-to-r from-slate-900/90 via-blue-900/30 to-indigo-900/20 rounded-xl border border-blue-500/20 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-2xl shadow-blue-500/40 border-2 border-blue-400/30">
                <Shield className="w-8 h-8 text-white drop-shadow-lg" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse shadow-lg shadow-green-500/50"></div>
              <div className="absolute inset-0 w-16 h-16 border border-blue-400/20 rounded-xl animate-pulse"></div>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-black text-white tracking-wider mb-1 enterprise-logo">
                STREET PATROL
              </h1>
              <div className="text-sm text-blue-400 font-bold uppercase tracking-widest mb-2">
                COMMAND CENTER
              </div>
              <div className="flex items-center justify-center gap-2 text-xs">
                <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400 font-bold">PATROL ACTIVE</span>
                </div>
                <div className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full">
                  <span className="text-blue-400 font-mono text-xs">
                    {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          
        </div>

        {/* Emergency Alerts - Top Priority */}
        {stats?.emergencyAlerts && stats.emergencyAlerts.length > 0 && (
          <div className="mb-2">
            <div className="bg-red-600 text-white p-2 rounded-lg mb-2 text-center">
              <Siren className="w-5 h-5 mx-auto mb-1 animate-pulse" />
              <h2 className="text-sm font-bold mb-1">EMERGENCY ALERTS</h2>
              <p className="text-xs">Immediate attention required</p>
            </div>

            <div className="grid gap-2">
              {stats.emergencyAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-2 rounded-lg border ${getAlertColor(alert.type)}`}
                >
                  <div className="flex items-start gap-2">
                    <AlertOctagon className="w-5 h-5 flex-shrink-0 animate-pulse" />
                    <div className="flex-1">
                      <h3 className="text-sm font-bold mb-1">{alert.title}</h3>
                      <p className="text-xs mb-1">{alert.description}</p>
                      {alert.location && (
                        <div className="flex items-center gap-1 text-xs mb-1">
                          <MapPin className="w-3 h-3" />
                          <span className="font-semibold">Location: {alert.location}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono">
                          {format(new Date(alert.timestamp), 'MMM dd, HH:mm:ss')}
                        </span>
                        <Badge className="text-xs px-1 py-0 font-bold">
                          {alert.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Metrics - Ultra Compact */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
          {/* Active Patrols */}
          <Card className="bg-slate-800 border-slate-600 border hover:border-blue-500 transition-all p-1">
            <CardContent className="text-center p-1">
              <Radio className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <h3 className="text-xs font-bold text-white mb-1">ACTIVE PATROLS</h3>
              <div className="text-lg font-bold text-blue-400 mb-1" data-testid="stat-active-patrols">
                {stats?.activePatrols || 0}
              </div>
              <p className="text-xs text-slate-300 mb-1">Units Deployed</p>
              <Link href="/patrol-reports">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1 text-xs font-bold h-6">
                  MANAGE
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Staff Status */}
          <Card className="bg-slate-800 border-slate-600 border hover:border-green-500 transition-all p-1">
            <CardContent className="text-center p-1">
              <UserCheck className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <h3 className="text-xs font-bold text-white mb-1">STAFF ON DUTY</h3>
              <div className="text-lg font-bold text-green-400 mb-1" data-testid="stat-on-duty-staff">
                {stats?.onDutyStaff || 0}
              </div>
              <p className="text-xs text-slate-300 mb-1">Officers Available</p>
              <Link href="/staff">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-1 text-xs font-bold h-6">
                  VIEW STAFF
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Open Incidents */}
          <Card className="bg-slate-800 border-slate-600 border hover:border-orange-500 transition-all p-1">
            <CardContent className="text-center p-1">
              <AlertTriangle className="w-5 h-5 text-orange-400 mx-auto mb-1" />
              <h3 className="text-xs font-bold text-white mb-1">OPEN INCIDENTS</h3>
              <div className="text-lg font-bold text-orange-400 mb-1" data-testid="stat-open-incidents">
                {stats?.openIncidents || 0}
              </div>
              <p className="text-xs text-slate-300 mb-1">Active Cases</p>
              <Link href="/reports">
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-1 text-xs font-bold h-6">
                  VIEW INCIDENTS
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Properties */}
          <Card className="bg-slate-800 border-slate-600 border hover:border-purple-500 transition-all p-1">
            <CardContent className="text-center p-1">
              <Building2 className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <h3 className="text-xs font-bold text-white mb-1">PROPERTIES</h3>
              <div className="text-lg font-bold text-purple-400 mb-1" data-testid="stat-active-properties">
                {stats?.activeProperties || 0}
              </div>
              <p className="text-xs text-slate-300 mb-1">Under Protection</p>
              <Link href="/properties">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-1 text-xs font-bold h-6">
                  MANAGE
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Ultra Compact */}
        <div className="mb-3">
          <h2 className="text-sm font-bold text-white text-center mb-2">QUICK ACTIONS</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Link href="/patrol-reports">
              <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex flex-col items-center gap-1 p-2">
                <FileCheck className="w-4 h-4" />
                PATROL REPORT
              </Button>
            </Link>

            <Link href="/reports">
              <Button className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex flex-col items-center gap-1 p-2">
                <AlertTriangle className="w-4 h-4" />
                LOG INCIDENT
              </Button>
            </Link>

            <Link href="/scheduling">
              <Button className="w-full h-12 bg-green-600 hover:bg-green-700 text-white text-xs font-bold flex flex-col items-center gap-1 p-2">
                <Calendar className="w-4 h-4" />
                SCHEDULE
              </Button>
            </Link>

            <Button
              className="w-full h-12 bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex flex-col items-center gap-1 p-2"
              onClick={() => {
                if (confirm('This will activate emergency response. Continue?')) {
                  alert('Emergency response activated!');
                }
              }}
            >
              <PhoneCall className="w-4 h-4 animate-pulse" />
              EMERGENCY
            </Button>
          </div>
        </div>

        {/* System Status & Activity - Ultra Compact Two Column */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
          {/* System Status - Ultra Compact */}
          <div>
            <h2 className="text-sm font-bold text-white text-center mb-2">SYSTEM STATUS</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
              {stats?.systemStatus && Object.entries(stats.systemStatus).map(([system, status]) => (
                <Card key={system} className="bg-slate-800 border-slate-600 border p-1">
                  <CardContent className="text-center p-1">
                    <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
                      status === 'online' || status === 'connected' || status === 'active' || status === 'operational' || status === 'ready'
                        ? 'bg-green-500'
                        : status === 'degraded' || status === 'slow' || status === 'limited' || status === 'impaired' || status === 'testing'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    } animate-pulse`} />
                    <h3 className="text-xs font-bold text-white mb-1 uppercase">{system}</h3>
                    <div className={`px-1 py-0.5 rounded text-xs font-bold ${getStatusColor(status)}`}>
                      {status.toUpperCase()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Activity - Ultra Compact */}
          <div>
            <h2 className="text-sm font-bold text-white text-center mb-2">RECENT ACTIVITY</h2>
            <Card className="bg-slate-800 border-slate-600 border p-1">
              <CardContent className="p-1">
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {stats?.recentActivities?.length ? (
                    stats.recentActivities.slice(0, 3).map((activity) => (
                      <div key={activity.id} className="flex items-start gap-2 p-1 bg-slate-700 rounded">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs text-white font-medium mb-1">{activity.description}</p>
                          <div className="flex items-center gap-1">
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
                    <div className="text-center py-3">
                      <Activity className="w-5 h-5 mx-auto mb-1 text-slate-500" />
                      <p className="text-xs text-slate-400">No recent activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation Links - Ultra Compact */}
        <div className="text-center">
          <h2 className="text-sm font-bold text-white mb-2">MAIN SECTIONS</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Link href="/staff">
              <Card className="bg-slate-800 border-slate-600 border hover:border-blue-500 transition-all p-2 cursor-pointer">
                <CardContent className="text-center p-1">
                  <Users className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                  <h3 className="text-sm font-bold text-white mb-1">STAFF</h3>
                  <p className="text-xs text-slate-300">Manage Personnel</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/clients">
              <Card className="bg-slate-800 border-slate-600 border hover:border-green-500 transition-all p-2 cursor-pointer">
                <CardContent className="text-center p-1">
                  <Building2 className="w-5 h-5 text-green-400 mx-auto mb-1" />
                  <h3 className="text-sm font-bold text-white mb-1">CLIENTS</h3>
                  <p className="text-xs text-slate-300">Client Relations</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/accounting">
              <Card className="bg-slate-800 border-slate-600 border hover:border-purple-500 transition-all p-2 cursor-pointer">
                <CardContent className="text-center p-1">
                  <DollarSign className="w-5 h-5 text-purple-400 mx-auto mb-1" />
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