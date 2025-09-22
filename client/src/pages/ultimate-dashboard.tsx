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
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Large, Clear Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            STREET PATROL Dashboard
          </h1>
          <p className="text-2xl text-slate-400">
            Hawaii Security Enterprise Platform
          </p>
          <div className="mt-6 text-lg text-green-400 font-semibold">
            System Status: ONLINE • {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Emergency Alerts - Top Priority */}
        {stats?.emergencyAlerts && stats.emergencyAlerts.length > 0 && (
          <div className="mb-12">
            <div className="bg-red-600 text-white p-6 rounded-2xl mb-6 text-center">
              <Siren className="w-12 h-12 mx-auto mb-4 animate-pulse" />
              <h2 className="text-3xl font-bold mb-2">EMERGENCY ALERTS</h2>
              <p className="text-xl">Immediate attention required</p>
            </div>

            <div className="grid gap-6">
              {stats.emergencyAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-8 rounded-2xl border-4 ${getAlertColor(alert.type)}`}
                >
                  <div className="flex items-start gap-6">
                    <AlertOctagon className="w-12 h-12 flex-shrink-0 animate-pulse" />
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-3">{alert.title}</h3>
                      <p className="text-lg mb-4">{alert.description}</p>
                      {alert.location && (
                        <div className="flex items-center gap-3 text-lg mb-4">
                          <MapPin className="w-6 h-6" />
                          <span className="font-semibold">Location: {alert.location}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-mono">
                          {format(new Date(alert.timestamp), 'MMM dd, HH:mm:ss')}
                        </span>
                        <Badge className="text-lg px-4 py-2 font-bold">
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

        {/* Key Metrics - Large and Clear */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Active Patrols */}
          <Card className="bg-slate-800 border-slate-600 border-2 hover:border-blue-500 transition-all p-6">
            <CardContent className="text-center p-4">
              <Radio className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">ACTIVE PATROLS</h3>
              <div className="text-5xl font-bold text-blue-400 mb-2" data-testid="stat-active-patrols">
                {stats?.activePatrols || 0}
              </div>
              <p className="text-lg text-slate-300">Units Deployed</p>
              <Link href="/patrol-reports">
                <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-bold">
                  MANAGE PATROLS
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Staff Status */}
          <Card className="bg-slate-800 border-slate-600 border-2 hover:border-green-500 transition-all p-6">
            <CardContent className="text-center p-4">
              <UserCheck className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">STAFF ON DUTY</h3>
              <div className="text-5xl font-bold text-green-400 mb-2" data-testid="stat-on-duty-staff">
                {stats?.onDutyStaff || 0}
              </div>
              <p className="text-lg text-slate-300">Officers Available</p>
              <Link href="/staff">
                <Button className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-bold">
                  VIEW STAFF
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Open Incidents */}
          <Card className="bg-slate-800 border-slate-600 border-2 hover:border-orange-500 transition-all p-6">
            <CardContent className="text-center p-4">
              <AlertTriangle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">OPEN INCIDENTS</h3>
              <div className="text-5xl font-bold text-orange-400 mb-2" data-testid="stat-open-incidents">
                {stats?.openIncidents || 0}
              </div>
              <p className="text-lg text-slate-300">Active Cases</p>
              <Link href="/reports">
                <Button className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white py-3 text-lg font-bold">
                  VIEW INCIDENTS
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Properties */}
          <Card className="bg-slate-800 border-slate-600 border-2 hover:border-purple-500 transition-all p-6">
            <CardContent className="text-center p-4">
              <Building2 className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">PROPERTIES</h3>
              <div className="text-5xl font-bold text-purple-400 mb-2" data-testid="stat-active-properties">
                {stats?.activeProperties || 0}
              </div>
              <p className="text-lg text-slate-300">Under Protection</p>
              <Link href="/properties">
                <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg font-bold">
                  MANAGE PROPERTIES
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Large Buttons */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white text-center mb-8">QUICK ACTIONS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/patrol-reports">
              <Button className="w-full h-32 bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold flex flex-col items-center gap-4 p-6">
                <FileCheck className="w-12 h-12" />
                NEW PATROL REPORT
              </Button>
            </Link>

            <Link href="/reports">
              <Button className="w-full h-32 bg-orange-600 hover:bg-orange-700 text-white text-xl font-bold flex flex-col items-center gap-4 p-6">
                <AlertTriangle className="w-12 h-12" />
                LOG INCIDENT
              </Button>
            </Link>

            <Link href="/scheduling">
              <Button className="w-full h-32 bg-green-600 hover:bg-green-700 text-white text-xl font-bold flex flex-col items-center gap-4 p-6">
                <Calendar className="w-12 h-12" />
                VIEW SCHEDULE
              </Button>
            </Link>

            <Button
              className="w-full h-32 bg-red-600 hover:bg-red-700 text-white text-xl font-bold flex flex-col items-center gap-4 p-6"
              onClick={() => {
                if (confirm('This will activate emergency response. Continue?')) {
                  alert('Emergency response activated!');
                }
              }}
            >
              <PhoneCall className="w-12 h-12 animate-pulse" />
              EMERGENCY
            </Button>
          </div>
        </div>

        {/* System Status - Simple and Clear */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white text-center mb-8">SYSTEM STATUS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {stats?.systemStatus && Object.entries(stats.systemStatus).map(([system, status]) => (
              <Card key={system} className="bg-slate-800 border-slate-600 border-2 p-6">
                <CardContent className="text-center p-4">
                  <div className={`w-8 h-8 rounded-full mx-auto mb-4 ${
                    status === 'online' || status === 'connected' || status === 'active' || status === 'operational' || status === 'ready'
                      ? 'bg-green-500'
                      : status === 'degraded' || status === 'slow' || status === 'limited' || status === 'impaired' || status === 'testing'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  } animate-pulse`} />
                  <h3 className="text-lg font-bold text-white mb-2 uppercase">{system}</h3>
                  <div className={`px-4 py-2 rounded-lg text-lg font-bold ${getStatusColor(status)}`}>
                    {status.toUpperCase()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity - Simple List */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white text-center mb-8">RECENT ACTIVITY</h2>
          <Card className="bg-slate-800 border-slate-600 border-2 p-6">
            <CardContent className="p-6">
              <div className="space-y-6">
                {stats?.recentActivities?.length ? (
                  stats.recentActivities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-6 p-4 bg-slate-700 rounded-xl">
                      <div className="w-4 h-4 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-lg text-white font-medium mb-2">{activity.description}</p>
                        <div className="flex items-center gap-4">
                          <p className="text-sm text-slate-400 font-mono">
                            {format(new Date(activity.timestamp), 'MMM dd, HH:mm:ss')}
                          </p>
                          <Badge className="text-sm bg-blue-500/20 text-blue-400">
                            {activity.type.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Activity className="w-16 h-16 mx-auto mb-4 text-slate-500" />
                    <p className="text-xl text-slate-400">No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Links - Large and Clear */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-8">MAIN SECTIONS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/staff">
              <Card className="bg-slate-800 border-slate-600 border-2 hover:border-blue-500 transition-all p-6 cursor-pointer">
                <CardContent className="text-center p-6">
                  <Users className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">STAFF</h3>
                  <p className="text-lg text-slate-300">Manage Personnel</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/clients">
              <Card className="bg-slate-800 border-slate-600 border-2 hover:border-green-500 transition-all p-6 cursor-pointer">
                <CardContent className="text-center p-6">
                  <Building2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">CLIENTS</h3>
                  <p className="text-lg text-slate-300">Client Relations</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/accounting">
              <Card className="bg-slate-800 border-slate-600 border-2 hover:border-purple-500 transition-all p-6 cursor-pointer">
                <CardContent className="text-center p-6">
                  <DollarSign className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">FINANCIAL</h3>
                  <p className="text-lg text-slate-300">Billing & Payroll</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}