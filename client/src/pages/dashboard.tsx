
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EvidenceGallery } from "@/components/dashboard/evidence-gallery";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/stats", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    refetchInterval: 30000,
  });

  const { data: patrolReports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ["/api/patrol-reports", { today: true }],
    queryFn: async () => {
      const response = await fetch("/api/patrol-reports?today=true", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch reports');
      return response.json();
    },
    refetchInterval: 60000,
  });

  const { data: recentIncidents = [], isLoading: incidentsLoading } = useQuery({
    queryKey: ["/api/incidents", { recent: true }],
    queryFn: async () => {
      const response = await fetch("/api/incidents?recent=true", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch incidents');
      return response.json();
    },
    refetchInterval: 30000,
  });

  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ["/api/activities"],
    queryFn: async () => {
      const response = await fetch("/api/activities?limit=10", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch activities');
      return response.json();
    },
    refetchInterval: 15000,
  });

  const handleNewReport = () => {
    window.location.href = '/patrol-reports';
  };

  const handleEmergency = () => {
    // Emergency protocol - could integrate with emergency services
    alert('Emergency protocol activated. Contact emergency services immediately.');
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'overdue': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-slate-900 text-white min-h-screen">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-y-auto" data-testid="main-dashboard">
          {/* Dashboard Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white" data-testid="text-page-title">
                  Security Operations Dashboard
                </h2>
                <p className="text-slate-400 mt-1" data-testid="text-page-subtitle">
                  Monitor crime intelligence, manage patrols, and oversee security operations across Hawaii
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  onClick={handleNewReport}
                  className="bg-gold-500 hover:bg-gold-600 text-black px-4 py-2 rounded-lg font-medium transition-colors"
                  data-testid="button-create-report"
                >
                  <i className="fas fa-plus mr-2"></i>New Report
                </Button>
                <Button 
                  onClick={handleEmergency}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  data-testid="button-emergency"
                >
                  <i className="fas fa-exclamation-circle mr-2"></i>Emergency
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Total Incidents</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {statsLoading ? '...' : stats?.totalIncidents || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <i className="fas fa-exclamation-triangle text-red-400 text-lg"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Active Patrols</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {statsLoading ? '...' : stats?.activePatrols || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <i className="fas fa-route text-blue-400 text-lg"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Properties Secured</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {statsLoading ? '...' : stats?.propertiesSecured || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <i className="fas fa-shield-alt text-green-400 text-lg"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Staff On Duty</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {statsLoading ? '...' : stats?.staffOnDuty || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gold-500/20 rounded-lg flex items-center justify-center">
                    <i className="fas fa-users text-gold-400 text-lg"></i>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Recent Patrol Reports */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white">Today's Patrol Reports</CardTitle>
                  <Button 
                    size="sm" 
                    className="bg-gold-500 hover:bg-gold-600 text-black"
                    onClick={() => window.location.href = '/patrol-reports'}
                  >
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  {reportsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse bg-slate-700 h-20 rounded"></div>
                      ))}
                    </div>
                  ) : patrolReports.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      No patrol reports for today
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {patrolReports.slice(0, 5).map((report: any) => (
                        <div key={report.id} className="bg-slate-700 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <i className="fas fa-clipboard-list text-blue-400"></i>
                              </div>
                              <div>
                                <h4 className="text-white font-medium">{report.officerName || 'Officer'}</h4>
                                <p className="text-slate-400 text-sm">{report.propertyName || report.location}</p>
                              </div>
                            </div>
                            <Badge className={`${getStatusColor(report.status)} text-white`}>
                              {report.status || 'unknown'}
                            </Badge>
                          </div>
                          <p className="text-slate-300 text-sm mb-2">{report.summary}</p>
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>{report.shiftType} shift</span>
                            <span>{new Date(report.startTime).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Incidents */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white">Recent Incidents</CardTitle>
                  <Button 
                    size="sm" 
                    className="bg-red-500 hover:bg-red-600 text-white"
                    onClick={() => window.location.href = '/crime-intelligence'}
                  >
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  {incidentsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse bg-slate-700 h-16 rounded"></div>
                      ))}
                    </div>
                  ) : recentIncidents.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      No recent incidents
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentIncidents.slice(0, 4).map((incident: any) => (
                        <div key={incident.id} className="bg-slate-700 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <Badge className={`${getSeverityColor(incident.severity)} text-white`}>
                                {incident.severity}
                              </Badge>
                              <span className="text-white font-medium">{incident.incidentType}</span>
                            </div>
                            <span className="text-slate-400 text-sm">
                              {new Date(incident.occuredAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-slate-300 text-sm mb-1">{incident.location}</p>
                          <p className="text-slate-400 text-xs">{incident.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Evidence Gallery */}
              <EvidenceGallery />

              {/* Activity Feed */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {activitiesLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="animate-pulse bg-slate-700 h-12 rounded"></div>
                      ))}
                    </div>
                  ) : activities.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      No recent activity
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activities.map((activity: any) => (
                        <div key={activity.id} className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <i className="fas fa-circle text-blue-400 text-xs"></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm">{activity.description}</p>
                            <p className="text-slate-400 text-xs mt-1">
                              {new Date(activity.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
