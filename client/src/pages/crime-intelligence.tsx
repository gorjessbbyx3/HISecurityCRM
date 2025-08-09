import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertIncidentSchema, type Incident } from "@shared/schema";

export default function CrimeIntelligence() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const { data: incidents = [], isLoading: incidentsLoading } = useQuery({
    queryKey: ["/api/incidents"],
    enabled: isAuthenticated,
  });

  const { data: recentIncidents = [] } = useQuery({
    queryKey: ["/api/incidents", { recent: true }],
    enabled: isAuthenticated,
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
    enabled: isAuthenticated,
  });

  const form = useForm({
    resolver: zodResolver(insertIncidentSchema.omit({ reportedBy: true, occuredAt: true })),
    defaultValues: {
      propertyId: "",
      incidentType: "trespassing",
      severity: "medium",
      description: "",
      location: "",
      coordinates: "",
      status: "open",
      photoUrls: [],
      policeReported: false,
      policeReportNumber: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/incidents", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      toast({
        title: "Success",
        description: "Incident reported successfully",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to report incident",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest(`/api/incidents/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      toast({
        title: "Success",
        description: "Incident updated successfully",
      });
      setIsDialogOpen(false);
      setSelectedIncident(null);
      form.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to update incident",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    if (selectedIncident) {
      updateMutation.mutate({ id: selectedIncident.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openEditDialog = (incident: Incident) => {
    setSelectedIncident(incident);
    form.reset({
      propertyId: incident.propertyId || "",
      incidentType: incident.incidentType || "trespassing",
      severity: incident.severity || "medium",
      description: incident.description || "",
      location: incident.location || "",
      coordinates: incident.coordinates || "",
      status: incident.status || "open",
      photoUrls: incident.photoUrls || [],
      policeReported: incident.policeReported || false,
      policeReportNumber: incident.policeReportNumber || "",
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setSelectedIncident(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500/20 text-red-400";
      case "high": return "bg-orange-500/20 text-orange-400";
      case "medium": return "bg-yellow-500/20 text-yellow-400";
      case "low": return "bg-blue-500/20 text-blue-400";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-red-500/20 text-red-400";
      case "investigating": return "bg-yellow-500/20 text-yellow-400";
      case "resolved": return "bg-green-500/20 text-green-400";
      case "closed": return "bg-slate-500/20 text-slate-400";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  const getIncidentTypeIcon = (type: string) => {
    switch (type) {
      case "trespassing": return "fas fa-user-slash";
      case "vandalism": return "fas fa-hammer";
      case "theft": return "fas fa-user-ninja";
      case "suspicious_activity": return "fas fa-eye";
      default: return "fas fa-exclamation-triangle";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-map-marked-alt text-4xl text-gold-500 mb-4 animate-pulse"></i>
          <p className="text-white">Loading Crime Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white min-h-screen">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-y-auto" data-testid="main-crime-intelligence">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white" data-testid="text-page-title">
                  Crime Intelligence Dashboard
                </h2>
                <p className="text-slate-400 mt-1" data-testid="text-page-subtitle">
                  Monitor crime patterns, track incidents, and analyze security threats across Hawaii
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={openCreateDialog}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      data-testid="button-report-incident"
                    >
                      <i className="fas fa-exclamation-triangle mr-2"></i>Report Incident
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {selectedIncident ? "Update Incident" : "Report New Incident"}
                      </DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="incidentType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Incident Type *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-slate-700 border-slate-600" data-testid="select-incident-type">
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-slate-700 border-slate-600">
                                    <SelectItem value="trespassing">Trespassing</SelectItem>
                                    <SelectItem value="vandalism">Vandalism</SelectItem>
                                    <SelectItem value="theft">Theft</SelectItem>
                                    <SelectItem value="suspicious_activity">Suspicious Activity</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="severity"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Severity</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-slate-700 border-slate-600" data-testid="select-severity">
                                      <SelectValue placeholder="Select severity" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-slate-700 border-slate-600">
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="propertyId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Property</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-slate-700 border-slate-600" data-testid="select-property">
                                    <SelectValue placeholder="Select property (optional)" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-slate-700 border-slate-600">
                                  {properties.map((property: any) => (
                                    <SelectItem key={property.id} value={property.id}>
                                      {property.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Specific location or address" 
                                  {...field} 
                                  className="bg-slate-700 border-slate-600"
                                  data-testid="input-location"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description *</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Detailed description of the incident" 
                                  {...field} 
                                  className="bg-slate-700 border-slate-600 min-h-[100px]"
                                  data-testid="textarea-description"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="coordinates"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>GPS Coordinates</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="21.3099, -157.8581 (lat, lng)" 
                                  {...field} 
                                  className="bg-slate-700 border-slate-600"
                                  data-testid="input-coordinates"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-slate-700 border-slate-600" data-testid="select-status">
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-slate-700 border-slate-600">
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="investigating">Investigating</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="policeReportNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Police Report #</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="HPD report number" 
                                    {...field} 
                                    className="bg-slate-700 border-slate-600"
                                    data-testid="input-police-report"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsDialogOpen(false)}
                            className="border-slate-600 text-slate-300"
                            data-testid="button-cancel"
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={createMutation.isPending || updateMutation.isPending}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            data-testid="button-save-incident"
                          >
                            {createMutation.isPending || updateMutation.isPending ? (
                              <>
                                <i className="fas fa-spinner fa-spin mr-2"></i>
                                Saving...
                              </>
                            ) : (
                              selectedIncident ? "Update Incident" : "Report Incident"
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  className="bg-navy-700 hover:bg-navy-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  data-testid="button-analytics"
                >
                  <i className="fas fa-chart-line mr-2"></i>Analytics
                </Button>
              </div>
            </div>

            {/* Crime Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Total Incidents</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-total-incidents">
                        {incidents.length}
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
                      <p className="text-slate-400 text-sm font-medium">Last 24 Hours</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-recent-incidents">
                        {recentIncidents.length}
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
                      <p className="text-slate-400 text-sm font-medium">High Priority</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-high-priority">
                        {incidents.filter((incident: any) => 
                          incident.severity === "high" || incident.severity === "critical"
                        ).length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-fire text-orange-400 text-lg"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Open Cases</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-open-cases">
                        {incidents.filter((incident: any) => 
                          incident.status === "open" || incident.status === "investigating"
                        ).length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-folder-open text-blue-400 text-lg"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Crime Map */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-800 border-slate-700 mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Interactive Crime Map</CardTitle>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-slate-400 hover:text-white"
                        data-testid="button-refresh-map"
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
                  <div className="bg-slate-700 rounded-lg h-80 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <i className="fas fa-map-marked-alt text-4xl text-gold-500 mb-3"></i>
                        <p className="text-white font-medium">Hawaii Crime Map</p>
                        <p className="text-slate-400 text-sm">Real-time incident tracking</p>
                      </div>
                    </div>
                    
                    {/* Crime Markers */}
                    {incidents.slice(0, 5).map((incident: any, index: number) => (
                      <div 
                        key={incident.id}
                        className={`absolute w-3 h-3 rounded-full animate-pulse ${
                          incident.severity === 'critical' ? 'bg-red-500' :
                          incident.severity === 'high' ? 'bg-orange-500' :
                          incident.severity === 'medium' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`}
                        style={{
                          top: `${20 + (index * 15)}%`,
                          left: `${15 + (index * 18)}%`
                        }}
                        title={incident.incidentType}
                      ></div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Incidents */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Recent Incidents</CardTitle>
                </CardHeader>
                <CardContent>
                  {incidentsLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="animate-pulse">
                          <div className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg">
                            <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                            <div className="flex-1">
                              <div className="h-4 bg-slate-600 rounded w-3/4 mb-2"></div>
                              <div className="h-3 bg-slate-600 rounded w-1/2"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : incidents.length === 0 ? (
                    <div className="text-center py-8">
                      <i className="fas fa-shield-alt text-4xl text-slate-400 mb-4"></i>
                      <p className="text-slate-400">No incidents reported</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {incidents.slice(0, 5).map((incident: any) => (
                        <div 
                          key={incident.id} 
                          className="flex items-center justify-between p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors cursor-pointer"
                          onClick={() => openEditDialog(incident)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${
                              incident.severity === 'critical' ? 'bg-red-500' :
                              incident.severity === 'high' ? 'bg-orange-500' :
                              incident.severity === 'medium' ? 'bg-yellow-500' :
                              'bg-blue-500'
                            }`}></div>
                            <div className="flex items-center space-x-2">
                              <i className={`${getIncidentTypeIcon(incident.incidentType)} text-slate-400`}></i>
                              <div>
                                <p className="text-white text-sm font-medium capitalize">
                                  {incident.incidentType.replace('_', ' ')}
                                </p>
                                <p className="text-slate-400 text-xs">{incident.location}</p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-slate-400 text-xs">
                              {new Date(incident.createdAt).toLocaleTimeString()}
                            </p>
                            <div className="flex space-x-1 mt-1">
                              <Badge className={getSeverityColor(incident.severity)}>
                                {incident.severity}
                              </Badge>
                              <Badge className={getStatusColor(incident.status)}>
                                {incident.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Analytics Panel */}
            <div className="space-y-6">
              {/* Incident Types */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Incident Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['trespassing', 'vandalism', 'theft', 'suspicious_activity'].map((type) => {
                      const count = incidents.filter((incident: any) => incident.incidentType === type).length;
                      const percentage = incidents.length > 0 ? (count / incidents.length) * 100 : 0;
                      return (
                        <div key={type} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <i className={`${getIncidentTypeIcon(type)} text-slate-400 w-4`}></i>
                            <span className="text-white text-sm capitalize">
                              {type.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-white text-sm font-medium">{count}</p>
                            <div className="w-16 h-1 bg-slate-600 rounded-full mt-1">
                              <div 
                                className="h-1 bg-gold-500 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Severity Distribution */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Severity Levels</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['critical', 'high', 'medium', 'low'].map((severity) => {
                      const count = incidents.filter((incident: any) => incident.severity === severity).length;
                      return (
                        <div key={severity} className="flex items-center justify-between">
                          <span className="text-white text-sm capitalize">{severity}</span>
                          <Badge className={getSeverityColor(severity)}>
                            {count}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
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
                      onClick={openCreateDialog}
                      data-testid="button-emergency-report"
                    >
                      <i className="fas fa-exclamation-triangle mr-2"></i>Emergency Report
                    </Button>
                    <Button 
                      className="w-full bg-navy-700 hover:bg-navy-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                      data-testid="button-export-data"
                    >
                      <i className="fas fa-download mr-2"></i>Export Data
                    </Button>
                    <Button 
                      className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                      data-testid="button-generate-report"
                    >
                      <i className="fas fa-file-alt mr-2"></i>Generate Report
                    </Button>
                    <Button 
                      className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                      data-testid="button-contact-police"
                    >
                      <i className="fas fa-phone mr-2"></i>Contact HPD
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
