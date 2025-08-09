import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: stats, isLoading: statsLoading } = useQuery<{
    activePatrols: number;
    crimeIncidents: number;
    propertiesSecured: number;
    staffOnDuty: number;
  }>({
    queryKey: ["/api/dashboard/stats"],
    enabled: isAuthenticated,
  });

  const { data: recentIncidents = [] } = useQuery<any[]>({
    queryKey: ["/api/incidents"],
    enabled: isAuthenticated,
  });

  const { data: todaysReports = [] } = useQuery<any[]>({
    queryKey: ["/api/patrol-reports"],
    enabled: isAuthenticated,
  });

  const { data: activeStaff = [] } = useQuery<any[]>({
    queryKey: ["/api/staff/active"],
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 bg-navy-700 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <i className="fas fa-shield-alt text-gold-500 text-lg animate-pulse"></i>
          </div>
          <p className="text-white">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const getIncidentSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500/20 text-red-400";
      case "high": return "bg-orange-500/20 text-orange-400";
      case "medium": return "bg-yellow-500/20 text-yellow-400";
      case "low": return "bg-blue-500/20 text-blue-400";
      default: return "bg-slate-500/20 text-slate-400";
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
                  className="bg-gold-500 hover:bg-gold-600 text-black px-4 py-2 rounded-lg font-medium transition-colors"
                  data-testid="button-create-report"
                >
                  <i className="fas fa-plus mr-2"></i>New Report
                </Button>
                <Button 
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  data-testid="button-emergency"
                >
                  <i className="fas fa-exclamation-circle mr-2"></i>Emergency
                </Button>
              </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Active Patrols</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-active-patrols">
                        {statsLoading ? "..." : stats?.activePatrols || 0}
                      </p>
                      <p className="text-green-400 text-xs mt-2">
                        <i className="fas fa-arrow-up mr-1"></i>+2 from yesterday
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-walking text-green-400 text-lg"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Crime Incidents</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-crime-incidents">
                        {statsLoading ? "..." : stats?.crimeIncidents || 0}
                      </p>
                      <p className="text-red-400 text-xs mt-2">
                        <i className="fas fa-arrow-down mr-1"></i>-3 from last week
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
                      <p className="text-slate-400 text-sm font-medium">Properties Secured</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-properties-secured">
                        {statsLoading ? "..." : stats?.propertiesSecured || 0}
                      </p>
                      <p className="text-blue-400 text-xs mt-2">
                        <i className="fas fa-shield-alt mr-1"></i>100% compliance
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-building text-blue-400 text-lg"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Staff On Duty</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-staff-on-duty">
                        {statsLoading ? "..." : stats?.staffOnDuty || 0}
                      </p>
                      <p className="text-gold-400 text-xs mt-2">
                        <i className="fas fa-users mr-1"></i>Next shift in 4h
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gold-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-user-shield text-gold-400 text-lg"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Crime Intelligence */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-800 border-slate-700 mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Crime Intelligence Dashboard</CardTitle>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-slate-400 hover:text-white"
                        data-testid="button-refresh-data"
                      >
                        <i className="fas fa-sync-alt"></i>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-slate-400 hover:text-white"
                        data-testid="button-fullscreen-map"
                      >
                        <i className="fas fa-expand"></i>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Crime Map Placeholder */}
                  <div className="bg-slate-700 rounded-lg h-64 mb-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <i className="fas fa-map-marked-alt text-4xl text-gold-500 mb-3"></i>
                        <p className="text-white font-medium">Interactive Crime Map</p>
                        <p className="text-slate-400 text-sm">Real-time incident tracking</p>
                      </div>
                    </div>
                    
                    {/* Crime Markers */}
                    <div className="absolute top-4 left-4 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <div className="absolute top-12 right-8 w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                    <div className="absolute bottom-8 left-12 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                  </div>

                  {/* Recent Incidents */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-white mb-3">Recent Incidents (Last 24 Hours)</h4>
                    {recentIncidents.length === 0 ? (
                      <div className="text-center py-8">
                        <i className="fas fa-shield-alt text-4xl text-slate-400 mb-4"></i>
                        <p className="text-slate-400">No recent incidents reported</p>
                      </div>
                    ) : (
                      recentIncidents.slice(0, 3).map((incident: any) => (
                        <div key={incident.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${
                              incident.severity === 'high' ? 'bg-red-500' :
                              incident.severity === 'medium' ? 'bg-yellow-500' :
                              'bg-orange-500'
                            }`}></div>
                            <div>
                              <p className="text-white text-sm font-medium">{incident.incidentType}</p>
                              <p className="text-slate-400 text-xs">{incident.location}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-slate-400 text-xs">
                              {new Date(incident.createdAt).toLocaleTimeString()}
                            </p>
                            <Badge className={getIncidentSeverityColor(incident.severity)}>
                              {incident.severity}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Daily Patrol Reports */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Daily Patrol Reports</CardTitle>
                    <Button 
                      size="sm"
                      className="bg-navy-700 hover:bg-navy-600 text-white"
                      data-testid="button-create-patrol-report"
                    >
                      <i className="fas fa-plus mr-2"></i>New Report
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {todaysReports.length === 0 ? (
                    <div className="text-center py-8">
                      <i className="fas fa-clipboard-list text-4xl text-slate-400 mb-4"></i>
                      <p className="text-slate-400 mb-4">No patrol reports for today</p>
                      <Button 
                        size="sm"
                        className="bg-gold-500 hover:bg-gold-600 text-black"
                        data-testid="button-create-first-report"
                      >
                        Create First Report
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {todaysReports.slice(0, 3).map((report: any) => (
                        <div key={report.id} className="border border-slate-600 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-navy-700 rounded-full flex items-center justify-center">
                                <i className="fas fa-user-shield text-gold-500"></i>
                              </div>
                              <div>
                                <p className="text-white font-medium text-sm">Officer Report</p>
                                <p className="text-slate-400 text-xs">{report.shiftType} Shift</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-slate-400 text-xs">
                                {new Date(report.createdAt).toLocaleTimeString()}
                              </p>
                              <Badge className={
                                report.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                report.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-slate-500/20 text-slate-400'
                              }>
                                {report.status}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-slate-300 text-sm mb-3">{report.summary}</p>
                          <div className="flex items-center space-x-4 text-xs text-slate-400">
                            <span><i className="fas fa-camera mr-1"></i>{report.photoUrls?.length || 0} Photos</span>
                            <span><i className="fas fa-map-marker-alt mr-1"></i>{report.checkpoints?.length || 0} Checkpoints</span>
                            <span><i className="fas fa-clock mr-1"></i>
                              {report.endTime && report.startTime 
                                ? `${Math.round((new Date(report.endTime).getTime() - new Date(report.startTime).getTime()) / (1000 * 60))} min`
                                : 'Ongoing'
                              }
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Active Staff */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Staff On Duty</CardTitle>
                </CardHeader>
                <CardContent>
                  {activeStaff.length === 0 ? (
                    <div className="text-center py-4">
                      <i className="fas fa-user-shield text-2xl text-slate-400 mb-2"></i>
                      <p className="text-slate-400 text-sm">No active staff</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeStaff.slice(0, 5).map((member: any) => (
                        <div key={member.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {member.profileImageUrl ? (
                              <img 
                                src={member.profileImageUrl}
                                alt="Staff member"
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-navy-700 flex items-center justify-center">
                                <i className="fas fa-user text-gold-500 text-sm"></i>
                              </div>
                            )}
                            <div>
                              <p className="text-white text-sm font-medium">
                                {member.firstName && member.lastName 
                                  ? `${member.firstName.charAt(0)}. ${member.lastName}`
                                  : member.email?.split('@')[0] || "Officer"
                                }
                              </p>
                              <p className="text-slate-400 text-xs">{member.zone || "Central"}</p>
                            </div>
                          </div>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <Button
                    variant="ghost"
                    className="w-full mt-4 text-slate-400 hover:text-white"
                    data-testid="button-view-all-staff"
                  >
                    View All Staff →
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button 
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                      data-testid="button-emergency-alert"
                    >
                      <i className="fas fa-exclamation-triangle mr-2"></i>Emergency Alert
                    </Button>
                    <Button 
                      className="w-full bg-navy-700 hover:bg-navy-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                      data-testid="button-log-incident"
                    >
                      <i className="fas fa-plus mr-2"></i>Log Incident
                    </Button>
                    <Button 
                      className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                      data-testid="button-schedule-patrol"
                    >
                      <i className="fas fa-route mr-2"></i>Schedule Patrol
                    </Button>
                    <Button 
                      className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                      data-testid="button-generate-report"
                    >
                      <i className="fas fa-file-alt mr-2"></i>Generate Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
