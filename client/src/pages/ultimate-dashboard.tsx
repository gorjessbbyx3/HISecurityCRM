import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Shield,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle,
  FileText,
  Phone,
  RefreshCw
} from "lucide-react";
import { Link } from "wouter";

interface DashboardStats {
  totalClients: number;
  activeProperties: number;
  totalStaff: number;
  onDutyStaff: number;
  openIncidents: number;
  resolvedIncidents24h: number;
  activePatrols: number;
  monthlyRevenue: number;
}

export default function UltimateDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());

  const queryClient = useQueryClient();

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch dashboard statistics
  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    refetchInterval: 60000, // Refresh every minute
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Loading Dashboard...</h2>
          <p className="text-xl text-gray-600">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-red-800 mb-2">System Error</h2>
          <p className="text-xl text-gray-600 mb-6">Unable to load dashboard information</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-xl"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-blue-800 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Hawaii Security Services</h1>
              <p className="text-xl text-blue-200">Security Management Dashboard</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{currentTime.toLocaleTimeString()}</div>
              <div className="text-lg text-blue-200">{currentTime.toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-8">
        {/* Refresh Button */}
        <div className="mb-8 text-center">
          <Button 
            onClick={handleRefresh}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-xl font-bold rounded-lg shadow-lg"
          >
            <RefreshCw className="w-6 h-6 mr-3" />
            Refresh Information
          </Button>
        </div>

        {/* Main Statistics - Large Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Active Patrols */}
          <Card className="bg-white shadow-xl border-2 border-green-200 hover:shadow-2xl transition-all">
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-12 h-12 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">Active Patrols</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-6xl font-bold text-green-600 mb-4">{stats?.activePatrols || 0}</div>
              <p className="text-lg text-gray-600">Officers on Duty</p>
            </CardContent>
          </Card>

          {/* Total Staff */}
          <Card className="bg-white shadow-xl border-2 border-blue-200 hover:shadow-2xl transition-all">
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-12 h-12 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">Staff Available</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-6xl font-bold text-blue-600 mb-4">{stats?.onDutyStaff || 0}</div>
              <p className="text-lg text-gray-600">Out of {stats?.totalStaff || 0} Total</p>
            </CardContent>
          </Card>

          {/* Open Incidents */}
          <Card className="bg-white shadow-xl border-2 border-orange-200 hover:shadow-2xl transition-all">
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-12 h-12 text-orange-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">Open Cases</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-6xl font-bold text-orange-600 mb-4">{stats?.openIncidents || 0}</div>
              <p className="text-lg text-gray-600">Need Attention</p>
            </CardContent>
          </Card>

          {/* Properties Secured */}
          <Card className="bg-white shadow-xl border-2 border-purple-200 hover:shadow-2xl transition-all">
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-purple-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">Protected Properties</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-6xl font-bold text-purple-600 mb-4">{stats?.activeProperties || 0}</div>
              <p className="text-lg text-gray-600">Under Security</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Large Buttons */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-8">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Link href="/patrol-reports">
              <Card className="bg-blue-600 text-white hover:bg-blue-700 transition-all cursor-pointer transform hover:scale-105 shadow-xl">
                <CardContent className="p-8 text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Patrol Reports</h3>
                  <p className="text-lg">View & Create Reports</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/reports">
              <Card className="bg-red-600 text-white hover:bg-red-700 transition-all cursor-pointer transform hover:scale-105 shadow-xl">
                <CardContent className="p-8 text-center">
                  <AlertTriangle className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Incidents</h3>
                  <p className="text-lg">Log New Incident</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/staff">
              <Card className="bg-green-600 text-white hover:bg-green-700 transition-all cursor-pointer transform hover:scale-105 shadow-xl">
                <CardContent className="p-8 text-center">
                  <Users className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Staff</h3>
                  <p className="text-lg">Manage Personnel</p>
                </CardContent>
              </Card>
            </Link>

            <Card className="bg-orange-600 text-white hover:bg-orange-700 transition-all cursor-pointer transform hover:scale-105 shadow-xl">
              <CardContent className="p-8 text-center">
                <Phone className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Emergency</h3>
                <p className="text-lg">Call 911 / Alert</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Today's Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-gray-800 text-center">Today's Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                <span className="text-xl font-semibold text-gray-700">Patrols Completed</span>
                <span className="text-3xl font-bold text-green-600">8</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                <span className="text-xl font-semibold text-gray-700">New Incidents</span>
                <span className="text-3xl font-bold text-orange-600">2</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                <span className="text-xl font-semibold text-gray-700">Cases Resolved</span>
                <span className="text-3xl font-bold text-blue-600">{stats?.resolvedIncidents24h || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-gray-800 text-center">System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-green-100 rounded-lg">
                <span className="text-xl font-semibold text-gray-700">Security System</span>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-xl font-bold text-green-600">ONLINE</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-100 rounded-lg">
                <span className="text-xl font-semibold text-gray-700">Communications</span>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-xl font-bold text-green-600">ACTIVE</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-100 rounded-lg">
                <span className="text-xl font-semibold text-gray-700">GPS Tracking</span>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-xl font-bold text-green-600">WORKING</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Important Numbers */}
        <div className="mt-12">
          <Card className="bg-red-50 border-2 border-red-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-4xl font-bold text-red-800 text-center">Emergency Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="p-6">
                  <Phone className="w-12 h-12 text-red-600 mx-auto mb-4" />
                  <div className="text-2xl font-bold text-gray-800 mb-2">911</div>
                  <div className="text-lg text-gray-600">Emergency Services</div>
                </div>
                <div className="p-6">
                  <Phone className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <div className="text-2xl font-bold text-gray-800 mb-2">(808) 555-0123</div>
                  <div className="text-lg text-gray-600">Security Dispatch</div>
                </div>
                <div className="p-6">
                  <Phone className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <div className="text-2xl font-bold text-gray-800 mb-2">(808) 555-0456</div>
                  <div className="text-lg text-gray-600">Manager On-Call</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}