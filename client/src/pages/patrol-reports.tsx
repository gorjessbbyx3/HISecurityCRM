import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import PatrolReportForm from "@/components/forms/patrol-report-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PatrolReports() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

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

  const { data: patrolReports = [], isLoading: reportsLoading } = useQuery<any[]>({
    queryKey: ["/api/patrol-reports"],
    enabled: isAuthenticated,
  });

  const { data: properties = [] } = useQuery<any[]>({
    queryKey: ["/api/properties"],
    enabled: isAuthenticated,
  });

  const { data: staff = [] } = useQuery<any[]>({
    queryKey: ["/api/staff"],
    enabled: isAuthenticated,
  });

  const filteredReports = patrolReports.filter((report: any) => {
    const matchesSearch = report.observations?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         properties.find((p: any) => p.id === report.propertyId)?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500/20 text-green-400";
      case "in_progress": return "bg-yellow-500/20 text-yellow-400";
      case "reviewed": return "bg-blue-500/20 text-blue-400";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  const getShiftIcon = (shiftType: string) => {
    switch (shiftType) {
      case "day": return "fas fa-sun";
      case "night": return "fas fa-moon";
      case "swing": return "fas fa-clock";
      default: return "fas fa-clock";
    }
  };

  const getPropertyName = (propertyId: string) => {
    const property = properties.find((p: any) => p.id === propertyId);
    return property?.name || "Unknown Property";
  };

  const getOfficerName = (officerId: string) => {
    const officer = staff.find((s: any) => s.id === officerId);
    if (officer?.firstName && officer?.lastName) {
      return `${officer.firstName} ${officer.lastName}`;
    }
    return officer?.email?.split('@')[0] || "Unknown Officer";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-file-alt text-4xl text-gold-500 mb-4 animate-pulse"></i>
          <p className="text-white">Loading Patrol Reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white min-h-screen">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-y-auto" data-testid="main-patrol-reports">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white" data-testid="text-page-title">
                  Daily Patrol Reports
                </h2>
                <p className="text-slate-400 mt-1" data-testid="text-page-subtitle">
                  Create, manage, and review patrol reports with photos and checkpoints
                </p>
              </div>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-gold-500 hover:bg-gold-600 text-black px-4 py-2 rounded-lg font-medium transition-colors"
                    data-testid="button-new-report"
                  >
                    <i className="fas fa-plus mr-2"></i>New Report
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700 max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-white">Create Patrol Report</DialogTitle>
                  </DialogHeader>
                  <PatrolReportForm 
                    onSuccess={() => setIsDialogOpen(false)}
                    properties={properties}
                    currentUserId={user?.id}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                <Input
                  placeholder="Search reports by observations or property..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700 text-white"
                  data-testid="input-search-reports"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white" data-testid="select-status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Report Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Total Reports</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-total-reports">
                        {patrolReports.length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-file-alt text-blue-400 text-lg"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">In Progress</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-in-progress-reports">
                        {patrolReports.filter((r: any) => r.status === 'in_progress').length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-clock text-yellow-400 text-lg"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Completed Today</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-completed-today">
                        {patrolReports.filter((r: any) => {
                          const today = new Date().toDateString();
                          return r.status === 'completed' && new Date(r.endTime).toDateString() === today;
                        }).length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-check-circle text-green-400 text-lg"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Photos Uploaded</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-photos-uploaded">
                        {patrolReports.reduce((total: number, r: any) => total + (r.photosUploaded?.length || 0), 0)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-camera text-purple-400 text-lg"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Reports List */}
          <div className="space-y-6">
            {reportsLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-slate-600 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-slate-600 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-slate-600 rounded w-1/2"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-slate-600 rounded w-full"></div>
                        <div className="h-3 bg-slate-600 rounded w-2/3"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-file-alt text-4xl text-slate-400 mb-4"></i>
                <h3 className="text-xl font-semibold text-white mb-2">No Patrol Reports Found</h3>
                <p className="text-slate-400 mb-4">
                  {searchTerm || statusFilter !== "all" ? "No reports match your search criteria" : "Start by creating your first patrol report"}
                </p>
                <Button 
                  className="bg-gold-500 hover:bg-gold-600 text-black"
                  onClick={() => setIsDialogOpen(true)}
                  data-testid="button-create-first-report"
                >
                  <i className="fas fa-plus mr-2"></i>Create First Report
                </Button>
              </div>
            ) : (
              filteredReports.map((report: any) => (
                <Card key={report.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-navy-700 flex items-center justify-center">
                          <i className={`${getShiftIcon(report.shiftType)} text-gold-500`}></i>
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg">
                            {getPropertyName(report.propertyId)}
                          </CardTitle>
                          <p className="text-slate-400 text-sm">
                            {getOfficerName(report.officerId)} • {report.shiftType} Shift
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(report.status)}>
                        {report.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {report.observations && (
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-2">Observations</h4>
                          <p className="text-slate-300 text-sm">{report.observations}</p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center text-slate-300">
                          <i className="fas fa-clock mr-2 text-slate-400 w-4"></i>
                          Started: {new Date(report.startTime).toLocaleString()}
                        </div>
                        {report.endTime && (
                          <div className="flex items-center text-slate-300">
                            <i className="fas fa-flag-checkered mr-2 text-slate-400 w-4"></i>
                            Ended: {new Date(report.endTime).toLocaleString()}
                          </div>
                        )}
                        <div className="flex items-center text-slate-300">
                          <i className="fas fa-camera mr-2 text-slate-400 w-4"></i>
                          Photos: {report.photosUploaded?.length || 0}
                        </div>
                        <div className="flex items-center text-slate-300">
                          <i className="fas fa-map-marker-alt mr-2 text-slate-400 w-4"></i>
                          Checkpoints: {report.checkpoints?.length || 0}
                        </div>
                      </div>

                      {report.weatherConditions && (
                        <div className="flex items-center text-slate-300 text-sm">
                          <i className="fas fa-cloud mr-2 text-slate-400 w-4"></i>
                          Weather: {report.weatherConditions}
                        </div>
                      )}

                      {report.recommendations && (
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-2">Recommendations</h4>
                          <p className="text-slate-300 text-sm">{report.recommendations}</p>
                        </div>
                      )}

                      {report.supervisorNotes && (
                        <div className="p-3 bg-navy-700/50 rounded-lg border border-navy-600">
                          <h4 className="text-sm font-semibold text-white mb-2">Supervisor Notes</h4>
                          <p className="text-slate-300 text-sm">{report.supervisorNotes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-600">
                      <div className="text-xs text-slate-400">
                        Created {new Date(report.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-slate-400 hover:text-white hover:bg-slate-700"
                          onClick={() => setSelectedReport(report)}
                          data-testid="button-view-photos"
                        >
                          <i className="fas fa-images"></i>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-slate-400 hover:text-white hover:bg-slate-700"
                          data-testid="button-edit-report"
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                          data-testid="button-download-report"
                        >
                          <i className="fas fa-download"></i>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
