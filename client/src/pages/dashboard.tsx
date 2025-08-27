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
            <Card key={i} className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border-cyan-500/30 shadow-lg shadow-cyan-500/10">
              <CardContent className="p-6">
                <div className="w-full h-20 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 animate-pulse rounded"></div>
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">Security Command Center</h1>
          <p className="text-cyan-400">Real-time monitoring and management</p>
        </div>
        <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30 shadow-lg shadow-green-500/20">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
          System Online
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border-cyan-500/30 shadow-lg shadow-cyan-500/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-cyan-400">Active Clients</CardTitle>
              <Users className="w-4 h-4 text-cyan-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-100">{stats?.totalClients || 0}</div>
            <p className="text-sm text-green-400">+2 from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border-cyan-500/30 shadow-lg shadow-cyan-500/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-cyan-400">Properties Secured</CardTitle>
              <MapPin className="w-4 h-4 text-cyan-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-100">{stats?.activeProperties || 0}</div>
            <p className="text-sm text-green-400">All monitored</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border-cyan-500/30 shadow-lg shadow-cyan-500/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-cyan-400">Staff on Duty</CardTitle>
              <Shield className="w-4 h-4 text-cyan-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-100">
              {stats?.onDutyStaff || 0} / {stats?.totalStaff || 0}
            </div>
            <p className="text-sm text-green-400">Full coverage</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border-cyan-500/30 shadow-lg shadow-cyan-500/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-cyan-400">Monthly Revenue</CardTitle>
              <DollarSign className="w-4 h-4 text-cyan-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-100">
              ${(stats?.monthlyRevenue || 0).toLocaleString()}
            </div>
            <p className="text-sm text-green-400">+12% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border-cyan-500/30 shadow-lg shadow-cyan-500/10">
          <CardHeader>
            <CardTitle className="text-cyan-200 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-300" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-cyan-400/70">Latest security events and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-blue-800/20 rounded-lg border border-cyan-500/20">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <div>
                  <p className="text-cyan-100 text-sm">Patrol completed at Downtown Office Complex</p>
                  <p className="text-cyan-400/70 text-xs">5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-800/20 rounded-lg border border-cyan-500/20">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <div>
                  <p className="text-cyan-100 text-sm">New client consultation scheduled</p>
                  <p className="text-cyan-400/70 text-xs">15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-800/20 rounded-lg border border-cyan-500/20">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div>
                  <p className="text-cyan-100 text-sm">Staff shift change completed</p>
                  <p className="text-cyan-400/70 text-xs">1 hour ago</p>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4 border-cyan-500/30 text-cyan-300 hover:bg-blue-800/40 hover:border-cyan-400">
              View All Activity
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border-cyan-500/30 shadow-lg shadow-cyan-500/10">
          <CardHeader>
            <CardTitle className="text-cyan-200">Quick Actions</CardTitle>
            <CardDescription className="text-cyan-400/70">Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/30 shadow-lg shadow-amber-500/10">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Report Incident
            </Button>
            <Button variant="outline" className="w-full justify-start border-cyan-500/30 text-cyan-300 hover:bg-blue-800/40 hover:border-cyan-400">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Patrol
            </Button>
            <Button variant="outline" className="w-full justify-start border-cyan-500/30 text-cyan-300 hover:bg-blue-800/40 hover:border-cyan-400">
              <Users className="w-4 h-4 mr-2" />
              Add Staff Member
            </Button>
            <Button variant="outline" className="w-full justify-start border-cyan-500/30 text-cyan-300 hover:bg-blue-800/40 hover:border-cyan-400">
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}