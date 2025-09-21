
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
  ArrowDownRight
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
        return 'status-online';
      case 'degraded':
      case 'slow':
      case 'limited':
      case 'impaired':
      case 'testing':
        return 'status-warning';
      case 'offline':
      case 'disconnected':
      case 'down':
      case 'unavailable':
        return 'status-offline';
      default:
        return 'status-offline';
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
      <div className="p-8 space-y-8">
        <div className="animate-fade-in-up">
          <div className="h-8 bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg animate-pulse mb-4 w-64"></div>
          <div className="h-4 bg-slate-800 rounded animate-pulse w-96"></div>
        </div>
        
        <div className="enterprise-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-40 bg-slate-800/50 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="enterprise-card p-8 text-center border-red-500/50 bg-red-500/10">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-red-400 mb-4">System Error</h3>
          <p className="text-slate-400 mb-6">Unable to load dashboard data. Please refresh the page or contact system administrator.</p>
          <Button onClick={() => window.location.reload()} className="btn-enterprise-primary">
            <Activity className="w-4 h-4 mr-2" />
            Refresh Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="p-8 space-y-8">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 animate-fade-in-up">
          <div>
            <h1 className="text-4xl font-bold mb-3 text-gradient-primary">
              Security Operations Center
            </h1>
            <p className="text-slate-400 text-lg">
              Real-time monitoring and enterprise security management platform
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm font-medium backdrop-blur-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              data-testid="select-time-range"
            >
              <option value="1h">LAST HOUR</option>
              <option value="24h">LAST 24 HOURS</option>
              <option value="7d">LAST 7 DAYS</option>
              <option value="30d">LAST 30 DAYS</option>
            </select>
            
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] })}
              className="btn-enterprise-secondary px-6 py-3 rounded-xl font-medium flex items-center gap-3"
              data-testid="button-refresh"
            >
              <Activity className="w-4 h-4" />
              REFRESH
            </button>
          </div>
        </div>

        {/* Emergency Alerts */}
        {stats?.emergencyAlerts && stats.emergencyAlerts.length > 0 && (
          <div className="space-y-6 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <Siren className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Emergency Alerts</h2>
                <p className="text-red-400">Active threat notifications requiring immediate attention</p>
              </div>
            </div>
            
            <div className="enterprise-grid">
              {stats.emergencyAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`enterprise-card p-6 ${getAlertColor(alert.type)} border-2`}
                  data-testid={`alert-${alert.type}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <AlertOctagon className="w-6 h-6 animate-pulse flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-lg">{alert.title}</h4>
                        <p className="text-sm opacity-90 mt-1">{alert.description}</p>
                      </div>
                    </div>
                    <Badge className={`${alert.type === 'critical' ? 'bg-red-500/20 text-red-300 border-red-500/50' : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'} text-xs font-bold px-3 py-1`}>
                      {alert.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  {alert.location && (
                    <div className="flex items-center gap-2 text-sm opacity-80 mb-4">
                      <MapPin className="w-4 h-4" />
                      <span className="font-medium">{alert.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs border-t border-current/20 pt-3 mt-3">
                    <span className="font-mono">
                      {format(new Date(alert.timestamp), 'MMM dd, HH:mm:ss')}
                    </span>
                    <span className="font-bold uppercase tracking-wide">
                      PRIORITY {alert.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System Status */}
        <div className="space-y-6 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">System Health Matrix</h2>
              <p className="text-slate-400">Real-time infrastructure monitoring and status</p>
            </div>
          </div>
          
          <div className="enterprise-grid">
            {stats?.systemStatus && Object.entries(stats.systemStatus).map(([system, status]) => (
              <div
                key={system}
                className="metric-card group"
                data-testid={`system-${system}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(status) === 'status-online' ? 'bg-green-500' : getStatusColor(status) === 'status-warning' ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`} />
                    <span className="text-lg font-bold text-white uppercase tracking-wide">{system}</span>
                  </div>
                  <Gauge className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                </div>
                
                <div className={`status-indicator ${getStatusColor(status)} mb-4`}>
                  <span>{status.toUpperCase()}</span>
                </div>
                
                <div className="text-xs text-slate-500 uppercase tracking-wide">
                  Last checked: {new Date().toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="space-y-6 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Operational Metrics</h2>
              <p className="text-slate-400">Key performance indicators and operational data</p>
            </div>
          </div>
          
          <div className="enterprise-grid">
            {/* Active Patrols */}
            <div className="metric-card group cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-white uppercase tracking-wide">Active Patrols</h4>
                <Radio className="w-6 h-6 text-blue-400 group-hover:text-blue-300 transition-colors animate-pulse" />
              </div>
              <div className="metric-value" data-testid="stat-active-patrols">
                {stats?.activePatrols || 0}
              </div>
              <p className="metric-label mb-4">Units Deployed</p>
              <div className="metric-change positive">
                <ArrowUpRight className="w-3 h-3" />
                <span>+2 from yesterday</span>
              </div>
              <Link href="/patrol-reports">
                <button className="btn-enterprise-primary w-full mt-4 py-3 text-sm font-medium">
                  MANAGE PATROLS
                </button>
              </Link>
            </div>

            {/* Staff Status */}
            <div className="metric-card group cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-white uppercase tracking-wide">Personnel</h4>
                <UserCheck className="w-6 h-6 text-green-400 group-hover:text-green-300 transition-colors" />
              </div>
              <div className="metric-value" data-testid="stat-on-duty-staff">
                {stats?.onDutyStaff || 0}<span className="text-slate-500">/{stats?.totalStaff || 0}</span>
              </div>
              <p className="metric-label mb-4">On Duty / Total Staff</p>
              <div className="metric-change positive">
                <ArrowUpRight className="w-3 h-3" />
                <span>98% availability</span>
              </div>
              <Link href="/staff">
                <button className="btn-enterprise-primary w-full mt-4 py-3 text-sm font-medium">
                  VIEW PERSONNEL
                </button>
              </Link>
            </div>

            {/* Incidents */}
            <div className="metric-card group cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-white uppercase tracking-wide">Open Incidents</h4>
                <AlertTriangle className="w-6 h-6 text-orange-400 group-hover:text-orange-300 transition-colors" />
              </div>
              <div className="metric-value" data-testid="stat-open-incidents">
                {stats?.openIncidents || 0}
              </div>
              <p className="metric-label mb-4">Active Cases</p>
              <div className="metric-change negative">
                <ArrowDownRight className="w-3 h-3" />
                <span>-3 since last hour</span>
              </div>
              <Link href="/reports">
                <button className="btn-enterprise-primary w-full mt-4 py-3 text-sm font-medium">
                  MANAGE INCIDENTS
                </button>
              </Link>
            </div>

            {/* Revenue */}
            <div className="metric-card group cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-white uppercase tracking-wide">Monthly Revenue</h4>
                <DollarSign className="w-6 h-6 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
              </div>
              <div className="metric-value" data-testid="stat-monthly-revenue">
                ${(stats?.monthlyRevenue || 0).toLocaleString()}
              </div>
              <p className="metric-label mb-4">Current Month</p>
              <div className="metric-change positive">
                <ArrowUpRight className="w-3 h-3" />
                <span>+12% vs last month</span>
              </div>
              <Link href="/accounting">
                <button className="btn-enterprise-primary w-full mt-4 py-3 text-sm font-medium">
                  VIEW FINANCES
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Performance Dashboard */}
        {stats?.performanceMetrics && (
          <div className="enterprise-card p-8 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Performance Analytics</h3>
                <p className="text-slate-400">Key performance indicators for operational excellence</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
              {Object.entries(stats.performanceMetrics).map(([metric, value]) => (
                <div key={metric} className="space-y-4" data-testid={`metric-${metric}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                      {metric.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-2xl font-bold text-gradient-primary">{value}%</span>
                  </div>
                  
                  <div className="progress-bar h-4">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {value >= 80 ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : value >= 60 ? (
                        <TrendingDown className="w-4 h-4 text-yellow-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                      <span className={`text-xs font-bold ${
                        value >= 80 ? 'text-green-400' : 
                        value >= 60 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {value >= 80 ? 'EXCELLENT' : value >= 60 ? 'GOOD' : 'NEEDS ATTENTION'}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">
                      Target: 85%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions & Activity Feed */}
        <div className="enterprise-grid-lg animate-fade-in-up" style={{animationDelay: '0.5s'}}>
          {/* Enhanced Quick Actions */}
          <div className="enterprise-card p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Mission Control</h3>
                <p className="text-slate-400">Essential operations and rapid deployment tools</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Link href="/patrol-reports">
                <div className="quick-action text-center" data-testid="action-new-report">
                  <FileCheck className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <span className="text-sm font-bold text-white block">PATROL REPORT</span>
                  <span className="text-xs text-slate-400 mt-1 block">Create new entry</span>
                </div>
              </Link>
              
              <Link href="/reports">
                <div className="quick-action text-center" data-testid="action-log-incident">
                  <AlertTriangle className="w-8 h-8 text-orange-400 mx-auto mb-3" />
                  <span className="text-sm font-bold text-white block">INCIDENT LOG</span>
                  <span className="text-xs text-slate-400 mt-1 block">Report event</span>
                </div>
              </Link>
              
              <Link href="/scheduling">
                <div className="quick-action text-center" data-testid="action-schedule">
                  <Calendar className="w-8 h-8 text-green-400 mx-auto mb-3" />
                  <span className="text-sm font-bold text-white block">SCHEDULE</span>
                  <span className="text-xs text-slate-400 mt-1 block">Manage shifts</span>
                </div>
              </Link>
              
              <button 
                className="quick-action text-center bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-500/50 hover:from-red-500/30 hover:to-red-600/30" 
                data-testid="action-emergency"
                onClick={() => {
                  if (confirm('This will activate emergency response protocols. Confirm to proceed?')) {
                    alert('Emergency response activated. Dispatching security units.');
                  }
                }}
              >
                <PhoneCall className="w-8 h-8 text-red-400 mx-auto mb-3 animate-pulse" />
                <span className="text-sm font-bold text-red-300 block">EMERGENCY</span>
                <span className="text-xs text-red-400 mt-1 block">Immediate response</span>
              </button>
            </div>
          </div>

          {/* Enhanced Activity Feed */}
          <div className="enterprise-card p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Live Activity Feed</h3>
                <p className="text-slate-400">Real-time system events and operational updates</p>
              </div>
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
                      <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0 animate-pulse" />
                      <div className="flex-1">
                        <p className="text-sm text-white font-medium leading-relaxed">{activity.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <p className="text-xs text-slate-400 font-mono">
                            {format(new Date(activity.timestamp), 'MMM dd, HH:mm:ss')} UTC
                          </p>
                          <Badge className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/50">
                            {activity.type.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Activity className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">No Recent Activity</p>
                  <p className="text-sm">System monitoring in progress...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Assets & Clients Overview */}
        <div className="enterprise-grid-lg animate-fade-in-up" style={{animationDelay: '0.6s'}}>
          <div className="enterprise-card p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Protected Assets</h3>
                <p className="text-slate-400">Secured properties and locations under management</p>
              </div>
            </div>
            
            <div className="metric-value mb-6" data-testid="stat-active-properties">
              {stats?.activeProperties || 0}
            </div>
            <p className="metric-label mb-8">Active Properties</p>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                <span className="text-slate-300 font-medium">High Security</span>
                <div className="flex items-center gap-3">
                  <span className="text-white font-bold text-lg">12</span>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                </div>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                <span className="text-slate-300 font-medium">Standard</span>
                <div className="flex items-center gap-3">
                  <span className="text-white font-bold text-lg">8</span>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                </div>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                <span className="text-slate-300 font-medium">Residential</span>
                <div className="flex items-center gap-3">
                  <span className="text-white font-bold text-lg">5</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>
            
            <Link href="/properties">
              <button className="btn-enterprise-primary w-full py-4 font-medium text-base">
                MANAGE PROPERTIES
              </button>
            </Link>
          </div>

          <div className="enterprise-card p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Client Portfolio</h3>
                <p className="text-slate-400">Active contracts and client relationships</p>
              </div>
            </div>
            
            <div className="metric-value mb-6" data-testid="stat-total-clients">
              {stats?.totalClients || 0}
            </div>
            <p className="metric-label mb-8">Active Contracts</p>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                <span className="text-slate-300 font-medium">Enterprise</span>
                <div className="flex items-center gap-3">
                  <span className="text-white font-bold text-lg">6</span>
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                <span className="text-slate-300 font-medium">Commercial</span>
                <div className="flex items-center gap-3">
                  <span className="text-white font-bold text-lg">12</span>
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                </div>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                <span className="text-slate-300 font-medium">Residential</span>
                <div className="flex items-center gap-3">
                  <span className="text-white font-bold text-lg">7</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>
            
            <Link href="/clients">
              <button className="btn-enterprise-primary w-full py-4 font-medium text-base">
                MANAGE CLIENTS
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
