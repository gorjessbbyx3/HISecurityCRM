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
    <div className="min-h-screen">
      {/* Intelligence Agency Header */}
      <header className="agency-header">
        <div className="container-fluid py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="agency-logo">STREET PATROL</div>
              <div className="h-8 w-px bg-gradient-to-b from-transparent via-green-400 to-transparent"></div>
              <div>
                <h1 className="text-2xl font-agency font-bold text-white">COMMAND CENTER</h1>
                <p className="text-sm text-slate-400 font-medium">Intelligence Operations Division</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="status-indicator status-online">
                <span>SYSTEM ONLINE</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container-fluid section-padding space-y-8">
        {/* Header Controls */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="mb-2">Tactical Overview</h2>
            <p className="text-slate-400">Real-time security intelligence dashboard</p>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="bg-glass border border-glow rounded-lg px-3 py-2 text-white text-sm font-agency backdrop-blur-md"
              data-testid="select-time-range"
            >
              <option value="1h">LAST HOUR</option>
              <option value="24h">LAST 24 HOURS</option>
              <option value="7d">LAST 7 DAYS</option>
              <option value="30d">LAST 30 DAYS</option>
            </select>
            
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] })}
              className="btn-secondary px-4 py-2 rounded-lg text-sm font-medium"
              data-testid="button-refresh"
            >
              <Activity className="w-4 h-4 mr-2" />
              REFRESH INTEL
            </button>
          </div>
        </div>

        {/* Emergency Alerts */}
        {stats?.emergencyAlerts && stats.emergencyAlerts.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-agency font-bold text-white flex items-center gap-3">
              <Siren className="w-6 h-6 text-red-400 animate-pulse" />
              ACTIVE THREAT ALERTS
            </h3>
            <div className="system-grid">
              {stats.emergencyAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`intel-card p-6 ${getAlertColor(alert.type)} animate-fade-in-up`}
                  data-testid={`alert-${alert.type}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <AlertOctagon className="w-6 h-6 animate-pulse" />
                      <div>
                        <h4 className="font-agency font-bold text-lg">{alert.title}</h4>
                        <p className="text-sm opacity-90 mt-1">{alert.description}</p>
                      </div>
                    </div>
                    <Badge className={`status-indicator ${alert.type === 'critical' ? 'status-offline' : 'status-degraded'} text-xs font-agency`}>
                      {alert.status.toUpperCase()}
                    </Badge>
                  </div>
                  {alert.location && (
                    <div className="flex items-center gap-2 text-sm opacity-80 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span className="font-medium">{alert.location}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-agency font-medium">
                      TIMESTAMP: {format(new Date(alert.timestamp), 'HH:mm:ss')}
                    </span>
                    <span className="status-indicator status-online">
                      ACTIVE
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* System Status */}
        <div className="space-y-4">
          <h3 className="font-agency font-bold text-white flex items-center gap-3">
            <Shield className="w-6 h-6 text-green-400" />
            SYSTEM STATUS MATRIX
          </h3>
          
          <div className="system-grid">
            {stats?.systemStatus && Object.entries(stats.systemStatus).map(([system, status]) => (
              <div
                key={system}
                className="intel-card p-6 animate-slide-in"
                data-testid={`system-${system}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-agency font-bold text-white uppercase tracking-wide">{system}</span>
                  <div className={`w-4 h-4 rounded-full ${getStatusColor(status).split(' ')[1]} animate-pulse`} />
                </div>
                <div className={`status-indicator ${
                  status === 'online' || status === 'connected' || status === 'active' || status === 'operational' || status === 'ready' 
                    ? 'status-online' 
                    : status === 'degraded' || status === 'slow' || status === 'limited' || status === 'impaired' || status === 'testing'
                    ? 'status-degraded'
                    : 'status-offline'
                }`}>
                  <span>{status.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      {/* Key Metrics Grid */}
        <div className="space-y-4">
          <h3 className="font-agency font-bold text-white flex items-center gap-3">
            <Target className="w-6 h-6 text-amber-400" />
            OPERATIONAL METRICS
          </h3>
          
          <div className="system-grid">
            {/* Active Operations */}
            <div className="intel-card p-6 hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-agency font-bold text-white uppercase tracking-wide">Active Patrols</h4>
                <Radio className="w-6 h-6 text-blue-400 animate-pulse" />
              </div>
              <div className="metric-value mb-2" data-testid="stat-active-patrols">
                {stats?.activePatrols || 0}
              </div>
              <p className="metric-label mb-4">Units Deployed</p>
              <Link href="/patrol-reports">
                <button className="btn-secondary w-full py-2 text-sm font-medium">
                  VIEW PATROLS
                </button>
              </Link>
            </div>

        {/* Staff Status */}
            <div className="intel-card p-6 hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-agency font-bold text-white uppercase tracking-wide">Personnel</h4>
                <UserCheck className="w-6 h-6 text-green-400 animate-pulse" />
              </div>
              <div className="metric-value mb-2" data-testid="stat-on-duty-staff">
                {stats?.onDutyStaff || 0}/{stats?.totalStaff || 0}
              </div>
              <p className="metric-label mb-4">Active Agents</p>
              <Link href="/staff">
                <button className="btn-secondary w-full py-2 text-sm font-medium">
                  MANAGE STAFF
                </button>
              </Link>
            </div>

            {/* Incident Management */}
            <div className="intel-card p-6 hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-agency font-bold text-white uppercase tracking-wide">Incidents</h4>
                <AlertTriangle className="w-6 h-6 text-orange-400 animate-bounce-subtle" />
              </div>
              <div className="metric-value mb-2" data-testid="stat-open-incidents">
                {stats?.openIncidents || 0}
              </div>
              <p className="metric-label mb-4">Open Cases</p>
              <Link href="/reports">
                <button className="btn-secondary w-full py-2 text-sm font-medium">
                  VIEW INCIDENTS
                </button>
              </Link>
            </div>

            {/* Revenue */}
            <div className="intel-card p-6 hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-agency font-bold text-white uppercase tracking-wide">Revenue</h4>
                <DollarSign className="w-6 h-6 text-amber-400 animate-glow" />
              </div>
              <div className="metric-value mb-2" data-testid="stat-monthly-revenue">
                ${(stats?.monthlyRevenue || 0).toLocaleString()}
              </div>
              <p className="metric-label mb-4">Monthly Intake</p>
              <Link href="/accounting">
                <button className="btn-secondary w-full py-2 text-sm font-medium">
                  VIEW FINANCES
                </button>
              </Link>
            </div>
          </div>
        </div>

      {/* Performance Metrics */}
        {stats?.performanceMetrics && (
          <div className="intel-card p-8">
            <div className="mb-6">
              <h3 className="font-agency font-bold text-white flex items-center gap-3 mb-2">
                <Target className="w-6 h-6 text-amber-400 animate-glow" />
                PERFORMANCE MATRIX
              </h3>
              <p className="text-slate-400 text-sm">
                Key performance indicators for operational excellence
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {Object.entries(stats.performanceMetrics).map(([metric, value]) => (
                <div key={metric} className="space-y-4" data-testid={`metric-${metric}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-agency font-medium text-slate-300 uppercase tracking-wide">
                      {metric.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-xl font-agency font-bold text-white">{value}%</span>
                  </div>
                  
                  <div className="progress-bar h-3">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {value >= 80 ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : value >= 60 ? (
                      <TrendingDown className="w-4 h-4 text-yellow-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                    <span className={`text-xs font-medium ${
                      value >= 80 ? 'text-green-400' : 
                      value >= 60 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {value >= 80 ? 'OPTIMAL' : value >= 60 ? 'NOMINAL' : 'CRITICAL'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Quick Actions & Recent Activity */}
        <div className="system-grid-lg">
          {/* Quick Actions */}
          <div className="intel-card p-8">
            <div className="mb-6">
              <h3 className="font-agency font-bold text-white flex items-center gap-3 mb-2">
                <Zap className="w-6 h-6 text-amber-400 animate-glow" />
                TACTICAL OPERATIONS
              </h3>
              <p className="text-slate-400 text-sm">
                Critical command functions and emergency protocols
              </p>
            </div>
            
            <div className="quick-actions">
              <Link href="/patrol-reports">
                <div className="quick-action-btn" data-testid="action-new-report">
                  <FileCheck className="w-8 h-8 text-green-400" />
                  <span className="text-xs font-agency font-bold">NEW REPORT</span>
                </div>
              </Link>
              
              <Link href="/reports">
                <div className="quick-action-btn" data-testid="action-log-incident">
                  <AlertTriangle className="w-8 h-8 text-orange-400" />
                  <span className="text-xs font-agency font-bold">LOG INCIDENT</span>
                </div>
              </Link>
              
              <Link href="/scheduling">
                <div className="quick-action-btn" data-testid="action-schedule">
                  <Calendar className="w-8 h-8 text-blue-400" />
                  <span className="text-xs font-agency font-bold">SCHEDULE</span>
                </div>
              </Link>
              
              <button 
                className="quick-action-btn btn-emergency" 
                data-testid="action-emergency"
                onClick={() => {
                  if (confirm('This will trigger emergency protocols. Continue?')) {
                    alert('Emergency protocols activated. Dispatching response teams.');
                  }
                }}
              >
                <PhoneCall className="w-8 h-8 text-white" />
                <span className="text-xs font-agency font-bold">EMERGENCY</span>
              </button>
            </div>
          </div>

        {/* Recent Activity */}
          <div className="intel-card p-8">
            <div className="mb-6">
              <h3 className="font-agency font-bold text-white flex items-center gap-3 mb-2">
                <Activity className="w-6 h-6 text-amber-400 animate-glow" />
                INTELLIGENCE FEED
              </h3>
              <p className="text-slate-400 text-sm">
                Real-time system events and operational updates
              </p>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {stats?.recentActivities?.length ? (
                stats.recentActivities.map((activity) => (
                  <div 
                    key={activity.id}
                    className="activity-item"
                    data-testid={`activity-${activity.type}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-3 h-3 bg-green-400 rounded-full mt-2 flex-shrink-0 animate-pulse" />
                      <div className="flex-1">
                        <p className="text-sm text-white font-medium">{activity.description}</p>
                        <p className="text-xs text-slate-400 mt-1 font-agency">
                          {format(new Date(activity.timestamp), 'MMM dd, HH:mm:ss')} UTC
                        </p>
                      </div>
                      <div className="status-indicator status-online text-xs">
                        LOGGED
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="text-sm font-agency">NO RECENT INTELLIGENCE</p>
                  <p className="text-xs">All systems monitoring...</p>
                </div>
              )}
            </div>
          </div>
        </div>

      {/* Property & Client Overview */}
        <div className="system-grid-lg">
          <div className="intel-card p-8">
            <div className="mb-6">
              <h3 className="font-agency font-bold text-white flex items-center gap-3 mb-2">
                <Building2 className="w-6 h-6 text-amber-400" />
                SECURED ASSETS
              </h3>
            </div>
            
            <div className="metric-value mb-4" data-testid="stat-active-properties">
              {stats?.activeProperties || 0}
            </div>
            <p className="metric-label mb-6">Protected Properties</p>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center p-3 bg-glass-light rounded-lg">
                <span className="text-slate-300 font-medium">High Security</span>
                <span className="text-white font-agency font-bold">12</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-glass-light rounded-lg">
                <span className="text-slate-300 font-medium">Standard</span>
                <span className="text-white font-agency font-bold">8</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-glass-light rounded-lg">
                <span className="text-slate-300 font-medium">Residential</span>
                <span className="text-white font-agency font-bold">5</span>
              </div>
            </div>
            
            <Link href="/properties">
              <button className="btn-secondary w-full py-3 font-medium">
                MANAGE PROPERTIES
              </button>
            </Link>
          </div>

          <div className="intel-card p-8">
            <div className="mb-6">
              <h3 className="font-agency font-bold text-white flex items-center gap-3 mb-2">
                <Users className="w-6 h-6 text-amber-400" />
                CLIENT REGISTRY
              </h3>
            </div>
            
            <div className="metric-value mb-4" data-testid="stat-total-clients">
              {stats?.totalClients || 0}
            </div>
            <p className="metric-label mb-6">Active Contracts</p>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center p-3 bg-glass-light rounded-lg">
                <span className="text-slate-300 font-medium">Enterprise</span>
                <span className="text-white font-agency font-bold">6</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-glass-light rounded-lg">
                <span className="text-slate-300 font-medium">Commercial</span>
                <span className="text-white font-agency font-bold">12</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-glass-light rounded-lg">
                <span className="text-slate-300 font-medium">Residential</span>
                <span className="text-white font-agency font-bold">7</span>
              </div>
            </div>
            
            <Link href="/clients">
              <button className="btn-secondary w-full py-3 font-medium">
                MANAGE CLIENTS
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}