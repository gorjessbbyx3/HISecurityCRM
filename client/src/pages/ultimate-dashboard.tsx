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
    <div className="min-h-screen bg-slate-950 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Compact Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-2xl">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            STREET PATROL Dashboard
          </h1>
          <p className="text-lg text-slate-400 mb-2">
            Hawaii Security Enterprise Platform
          </p>
          <div className="text-sm text-green-400 font-semibold">
            System Status: ONLINE • {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Emergency Alerts - Top Priority */}
        {stats?.emergencyAlerts && stats.emergencyAlerts.length > 0 && (
          <div className="mb-6">
            <div className="bg-red-600 text-white p-4 rounded-xl mb-4 text-center">
              <Siren className="w-8 h-8 mx-auto mb-2 animate-pulse" />
              <h2 className="text-xl font-bold mb-1">EMERGENCY ALERTS</h2>
              <p className="text-sm">Immediate attention required</p>
            </div>

            <div className="grid gap-4">
              {stats.emergencyAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border-2 ${getAlertColor(alert.type)}`}
                >
                  <div className="flex items-start gap-4">
                    <AlertOctagon className="w-8 h-8 flex-shrink-0 animate-pulse" />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-2">{alert.title}</h3>
                      <p className="text-sm mb-2">{alert.description}</p>
                      {alert.location && (
                        <div className="flex items-center gap-2 text-sm mb-2">
                          <MapPin className="w-4 h-4" />
                          <span className="font-semibold">Location: {alert.location}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-mono">
                          {format(new Date(alert.timestamp), 'MMM dd, HH:mm:ss')}
                        </span>
                        <Badge className="text-sm px-2 py-1 font-bold">
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

        {/* Key Metrics - Compact */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Active Patrols */}
          <Card className="bg-slate-800 border-slate-600 border hover:border-blue-500 transition-all p-3">
            <CardContent className="text-center p-2">
              <Radio className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-white mb-1">ACTIVE PATROLS</h3>
              <div className="text-2xl font-bold text-blue-400 mb-1" data-testid="stat-active-patrols">
                {stats?.activePatrols || 0}
              </div>
              <p className="text-xs text-slate-300 mb-2">Units Deployed</p>
              <Link href="/patrol-reports">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1 text-xs font-bold">
                  MANAGE
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Staff Status */}
          <Card className="bg-slate-800 border-slate-600 border hover:border-green-500 transition-all p-3">
            <CardContent className="text-center p-2">
              <UserCheck className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-white mb-1">STAFF ON DUTY</h3>
              <div className="text-2xl font-bold text-green-400 mb-1" data-testid="stat-on-duty-staff">
                {stats?.onDutyStaff || 0}
              </div>
              <p className="text-xs text-slate-300 mb-2">Officers Available</p>
              <Link href="/staff">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-1 text-xs font-bold">
                  VIEW STAFF
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Open Incidents */}
          <Card className="bg-slate-800 border-slate-600 border hover:border-orange-500 transition-all p-3">
            <CardContent className="text-center p-2">
              <AlertTriangle className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-white mb-1">OPEN INCIDENTS</h3>
              <div className="text-2xl font-bold text-orange-400 mb-1" data-testid="stat-open-incidents">
                {stats?.openIncidents || 0}
              </div>
              <p className="text-xs text-slate-300 mb-2">Active Cases</p>
              <Link href="/reports">
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-1 text-xs font-bold">
                  VIEW INCIDENTS
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Properties */}
          <Card className="bg-slate-800 border-slate-600 border hover:border-purple-500 transition-all p-3">
            <CardContent className="text-center p-2">
              <Building2 className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-white mb-1">PROPERTIES</h3>
              <div className="text-2xl font-bold text-purple-400 mb-1" data-testid="stat-active-properties">
                {stats?.activeProperties || 0}
              </div>
              <p className="text-xs text-slate-300 mb-2">Under Protection</p>
              <Link href="/properties">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-1 text-xs font-bold">
                  MANAGE
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Compact Buttons */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white text-center mb-4">QUICK ACTIONS</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/patrol-reports">
              <Button className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold flex flex-col items-center gap-1 p-3">
                <FileCheck className="w-6 h-6" />
                PATROL REPORT
              </Button>
            </Link>

            <Link href="/reports">
              <Button className="w-full h-16 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold flex flex-col items-center gap-1 p-3">
                <AlertTriangle className="w-6 h-6" />
                LOG INCIDENT
              </Button>
            </Link>

            <Link href="/scheduling">
              <Button className="w-full h-16 bg-green-600 hover:bg-green-700 text-white text-sm font-bold flex flex-col items-center gap-1 p-3">
                <Calendar className="w-6 h-6" />
                SCHEDULE
              </Button>
            </Link>

            <Button
              className="w-full h-16 bg-red-600 hover:bg-red-700 text-white text-sm font-bold flex flex-col items-center gap-1 p-3"
              onClick={() => {
                if (confirm('This will activate emergency response. Continue?')) {
                  alert('Emergency response activated!');
                }
              }}
            >
              <PhoneCall className="w-6 h-6 animate-pulse" />
              EMERGENCY
            </Button>
          </div>
        </div>

        {/* System Status & Activity - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* System Status - Compact */}
          <div>
            <h2 className="text-lg font-bold text-white text-center mb-4">SYSTEM STATUS</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {stats?.systemStatus && Object.entries(stats.systemStatus).map(([system, status]) => (
                <Card key={system} className="bg-slate-800 border-slate-600 border p-3">
                  <CardContent className="text-center p-2">
                    <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
                      status === 'online' || status === 'connected' || status === 'active' || status === 'operational' || status === 'ready'
                        ? 'bg-green-500'
                        : status === 'degraded' || status === 'slow' || status === 'limited' || status === 'impaired' || status === 'testing'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    } animate-pulse`} />
                    <h3 className="text-xs font-bold text-white mb-1 uppercase">{system}</h3>
                    <div className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(status)}`}>
                      {status.toUpperCase()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Activity - Compact List */}
          <div>
            <h2 className="text-lg font-bold text-white text-center mb-4">RECENT ACTIVITY</h2>
            <Card className="bg-slate-800 border-slate-600 border p-3">
              <CardContent className="p-3">
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {stats?.recentActivities?.length ? (
                    stats.recentActivities.slice(0, 3).map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-2 bg-slate-700 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-white font-medium mb-1">{activity.description}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-slate-400 font-mono">
                              {format(new Date(activity.timestamp), 'MMM dd, HH:mm')}
                            </p>
                            <Badge className="text-xs bg-blue-500/20 text-blue-400">
                              {activity.type.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <Activity className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                      <p className="text-sm text-slate-400">No recent activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation Links - Compact */}
        <div className="text-center">
          <h2 className="text-lg font-bold text-white mb-4">MAIN SECTIONS</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/staff">
              <Card className="bg-slate-800 border-slate-600 border hover:border-blue-500 transition-all p-4 cursor-pointer">
                <CardContent className="text-center p-3">
                  <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <h3 className="text-lg font-bold text-white mb-1">STAFF</h3>
                  <p className="text-sm text-slate-300">Manage Personnel</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/clients">
              <Card className="bg-slate-800 border-slate-600 border hover:border-green-500 transition-all p-4 cursor-pointer">
                <CardContent className="text-center p-3">
                  <Building2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <h3 className="text-lg font-bold text-white mb-1">CLIENTS</h3>
                  <p className="text-sm text-slate-300">Client Relations</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/accounting">
              <Card className="bg-slate-800 border-slate-600 border hover:border-purple-500 transition-all p-4 cursor-pointer">
                <CardContent className="text-center p-3">
                  <DollarSign className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <h3 className="text-lg font-bold text-white mb-1">FINANCIAL</h3>
                  <p className="text-sm text-slate-300">Billing & Payroll</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}