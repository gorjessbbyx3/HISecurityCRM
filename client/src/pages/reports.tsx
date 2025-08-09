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
import { insertPatrolReportSchema, type PatrolReport } from "@shared/schema";

export default function Reports() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [selectedReport, setSelectedReport] = useState<PatrolReport | null>(null);
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

  const { data: reports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ["/api/patrol-reports"],
    enabled: isAuthenticated,
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
    enabled: isAuthenticated,
  });

  const form = useForm({
    resolver: zodResolver(insertPatrolReportSchema.omit({ officerId: true })),
    defaultValues: {
      propertyId: "",
      shiftType: "day",
      startTime: new Date().toISOString().slice(0, 16),
      endTime: "",
      checkpoints: [],
      incidentsReported: 0,
      summary: "",
      photoUrls: [],
      weatherConditions: "",
      vehicleUsed: "",
      mileage: "",
      status: "in_progress",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/patrol-reports", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patrol-reports"] });
      toast({
        title: "Success",
        description: "Patrol report created successfully",
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
        description: "Failed to create patrol report",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest(`/api/patrol-reports/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patrol-reports"] });
      toast({
        title: "Success",
        description: "Patrol report updated successfully",
      });
      setIsDialogOpen(false);
      setSelectedReport(null);
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
        description: "Failed to update patrol report",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    if (selectedReport) {
      updateMutation.mutate({ id: selectedReport.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openEditDialog = (report: PatrolReport) => {
    setSelectedReport(report);
    form.reset({
      propertyId: report.propertyId || "",
      shiftType: report.shiftType || "day",
      startTime: report.startTime ? new Date(report.startTime).toISOString().slice(0, 16) : "",
      endTime: report.endTime ? new Date(report.endTime).toISOString().slice(0, 16) : "",
      checkpoints: report.checkpoints || [],
      incidentsReported: report.incidentsReported || 0,
      summary: report.summary || "",
      photoUrls: report.photoUrls || [],
      weatherConditions: report.weatherConditions || "",
      vehicleUsed: report.vehicleUsed || "",
      mileage: report.mileage || "",
      status: report.status || "in_progress",
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setSelectedReport(null);
    form.reset({
      startTime: new Date().toISOString().slice(0, 16),
    });
    setIsDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500/20 text-green-400";
      case "in_progress": return "bg-yellow-500/20 text-yellow-400";
      case "reviewed": return "bg-blue-500/20 text-blue-400";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  const getShiftColor = (shift: string) => {
    switch (shift) {
      case "day": return "bg-yellow-500/20 text-yellow-400";
      case "night": return "bg-blue-500/20 text-blue-400";
      case "swing": return "bg-purple-500/20 text-purple-400";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-file-alt text-4xl text-gold-500 mb-4 animate-pulse"></i>
          <p className="text-white">Loading Reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white min-h-screen">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-y-auto" data-testid="main-reports">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white" data-testid="text-page-title">
                  Patrol Reports
                </h2>
                <p className="text-slate-400 mt-1" data-testid="text-page-subtitle">
                  Daily patrol reports with photos, checkpoints, and incident documentation
                </p>
              </div>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={openCreateDialog}
                    className="bg-gold-500 hover:bg-gold-600 text-black px-4 py-2 rounded-lg font-medium transition-colors"
                    data-testid="button-add-report"
                  >
                    <i className="fas fa-plus mr-2"></i>New Report
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedReport ? "Edit Patrol Report" : "Create New Patrol Report"}
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="propertyId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Property</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-slate-700 border-slate-600" data-testid="select-property">
                                    <SelectValue placeholder="Select property" />
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
                          name="shiftType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Shift Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-slate-700 border-slate-600" data-testid="select-shift-type">
                                    <SelectValue placeholder="Select shift" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-slate-700 border-slate-600">
                                  <SelectItem value="day">Day Shift</SelectItem>
                                  <SelectItem value="night">Night Shift</SelectItem>
                                  <SelectItem value="swing">Swing Shift</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="startTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Time *</FormLabel>
                              <FormControl>
                                <Input 
                                  type="datetime-local"
                                  {...field} 
                                  className="bg-slate-700 border-slate-600"
                                  data-testid="input-start-time"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="endTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Time</FormLabel>
                              <FormControl>
                                <Input 
                                  type="datetime-local"
                                  {...field} 
                                  className="bg-slate-700 border-slate-600"
                                  data-testid="input-end-time"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="summary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Patrol Summary *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe patrol activities, observations, and outcomes" 
                                {...field} 
                                className="bg-slate-700 border-slate-600 min-h-[100px]"
                                data-testid="textarea-summary"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="incidentsReported"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Incidents Reported</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  min="0"
                                  placeholder="0" 
                                  {...field} 
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  className="bg-slate-700 border-slate-600"
                                  data-testid="input-incidents-reported"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="weatherConditions"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Weather Conditions</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Clear, Rainy, Windy, etc." 
                                  {...field} 
                                  className="bg-slate-700 border-slate-600"
                                  data-testid="input-weather"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="vehicleUsed"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Vehicle Used</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Vehicle ID or description" 
                                  {...field} 
                                  className="bg-slate-700 border-slate-600"
                                  data-testid="input-vehicle"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="mileage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mileage</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  step="0.1"
                                  placeholder="0.0" 
                                  {...field} 
                                  className="bg-slate-700 border-slate-600"
                                  data-testid="input-mileage"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

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
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="reviewed">Reviewed</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

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
                          className="bg-gold-500 hover:bg-gold-600 text-black"
                          data-testid="button-save-report"
                        >
                          {createMutation.isPending || updateMutation.isPending ? (
                            <>
                              <i className="fas fa-spinner fa-spin mr-2"></i>
                              Saving...
                            </>
                          ) : (
                            selectedReport ? "Update Report" : "Create Report"
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Report Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Total Reports</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-total-reports">
                        {reports.length}
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
                      <p className="text-slate-400 text-sm font-medium">Today's Reports</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-todays-reports">
                        {reports.filter((report: any) => {
                          const today = new Date().toDateString();
                          return new Date(report.createdAt).toDateString() === today;
                        }).length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-calendar-day text-green-400 text-lg"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Active Patrols</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-active-patrols">
                        {reports.filter((report: any) => report.status === "in_progress").length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-walking text-yellow-400 text-lg"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Incidents</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-total-incidents">
                        {reports.reduce((sum: number, report: any) => sum + (report.incidentsReported || 0), 0)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-exclamation-triangle text-red-400 text-lg"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Reports List */}
          <div className="space-y-6">
            {reportsLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-slate-600 rounded-lg"></div>
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
            ) : reports.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-12 text-center">
                  <i className="fas fa-file-alt text-4xl text-slate-400 mb-4"></i>
                  <h3 className="text-xl font-semibold text-white mb-2">No Patrol Reports Found</h3>
                  <p className="text-slate-400 mb-4">Start by creating your first patrol report</p>
                  <Button 
                    onClick={openCreateDialog}
                    className="bg-gold-500 hover:bg-gold-600 text-black"
                    data-testid="button-create-first-report"
                  >
                    <i className="fas fa-plus mr-2"></i>Create First Report
                  </Button>
                </CardContent>
              </Card>
            ) : (
              reports.map((report: any) => (
                <Card key={report.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-lg bg-navy-700 flex items-center justify-center">
                          <i className="fas fa-clipboard-list text-gold-500"></i>
                        </div>
                        <div>
                          <CardTitle className="text-white">
                            Patrol Report - {properties.find((p: any) => p.id === report.propertyId)?.name || "Unknown Property"}
                          </CardTitle>
                          <div className="flex items-center space-x-4 mt-1">
                            <Badge className={getShiftColor(report.shiftType)}>
                              {report.shiftType} shift
                            </Badge>
                            <Badge className={getStatusColor(report.status)}>
                              {report.status}
                            </Badge>
                            <span className="text-slate-400 text-sm">
                              {new Date(report.startTime).toLocaleDateString()} - {new Date(report.startTime).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(report)}
                          className="text-slate-400 hover:text-white hover:bg-slate-700"
                          data-testid="button-edit-report"
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                          data-testid="button-view-details"
                        >
                          <i className="fas fa-eye"></i>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 mb-4">{report.summary}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center text-slate-400">
                        <i className="fas fa-clock mr-2 w-4"></i>
                        Duration: {
                          report.endTime && report.startTime
                            ? `${Math.round((new Date(report.endTime).getTime() - new Date(report.startTime).getTime()) / (1000 * 60))} min`
                            : 'Ongoing'
                        }
                      </div>
                      <div className="flex items-center text-slate-400">
                        <i className="fas fa-exclamation-triangle mr-2 w-4"></i>
                        Incidents: {report.incidentsReported || 0}
                      </div>
                      <div className="flex items-center text-slate-400">
                        <i className="fas fa-camera mr-2 w-4"></i>
                        Photos: {report.photoUrls?.length || 0}
                      </div>
                      <div className="flex items-center text-slate-400">
                        <i className="fas fa-map-marker-alt mr-2 w-4"></i>
                        Checkpoints: {report.checkpoints?.length || 0}
                      </div>
                    </div>

                    {report.weatherConditions && (
                      <div className="mt-3 flex items-center text-slate-400 text-sm">
                        <i className="fas fa-cloud mr-2 w-4"></i>
                        Weather: {report.weatherConditions}
                      </div>
                    )}

                    {report.vehicleUsed && (
                      <div className="mt-2 flex items-center text-slate-400 text-sm">
                        <i className="fas fa-car mr-2 w-4"></i>
                        Vehicle: {report.vehicleUsed}
                        {report.mileage && ` (${report.mileage} miles)`}
                      </div>
                    )}
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
