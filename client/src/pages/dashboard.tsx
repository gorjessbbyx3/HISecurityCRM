import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Users,
  MapPin,
  Clock,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Calendar
} from "lucide-react";

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
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-6">
                <div className="w-full h-20 bg-slate-700 animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Security Command Center</h1>
          <p className="text-slate-400">Real-time monitoring and management</p>
        </div>
        <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
          System Online
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-400">Active Clients</CardTitle>
              <Users className="w-4 h-4 text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.totalClients || 0}</div>
            <p className="text-sm text-green-400">+2 from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-400">Properties Secured</CardTitle>
              <MapPin className="w-4 h-4 text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.activeProperties || 0}</div>
            <p className="text-sm text-green-400">All monitored</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-400">Staff on Duty</CardTitle>
              <Shield className="w-4 h-4 text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats?.onDutyStaff || 0} / {stats?.totalStaff || 0}
            </div>
            <p className="text-sm text-green-400">Full coverage</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-400">Monthly Revenue</CardTitle>
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${(stats?.monthlyRevenue || 0).toLocaleString()}
            </div>
            <p className="text-sm text-green-400">+12% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-400" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest security events and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <div>
                  <p className="text-white text-sm">Patrol completed at Downtown Office Complex</p>
                  <p className="text-slate-400 text-xs">5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <div>
                  <p className="text-white text-sm">New client consultation scheduled</p>
                  <p className="text-slate-400 text-xs">15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div>
                  <p className="text-white text-sm">Staff shift change completed</p>
                  <p className="text-slate-400 text-xs">1 hour ago</p>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4 border-slate-600 text-slate-300 hover:bg-slate-700">
              View All Activity
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Report Incident
            </Button>
            <Button variant="outline" className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Patrol
            </Button>
            <Button variant="outline" className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700">
              <Users className="w-4 h-4 mr-2" />
              Add Staff Member
            </Button>
            <Button variant="outline" className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}