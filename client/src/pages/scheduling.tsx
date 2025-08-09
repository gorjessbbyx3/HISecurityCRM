import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertShiftSchema } from "@shared/schema";
import { z } from "zod";

const shiftFormSchema = insertShiftSchema.extend({
  date: z.string(),
});

export default function Scheduling() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

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

  const { data: shifts = [], isLoading: shiftsLoading } = useQuery({
    queryKey: ["/api/shifts"],
    enabled: isAuthenticated,
  });

  const { data: activeShifts = [] } = useQuery({
    queryKey: ["/api/shifts/active"],
    enabled: isAuthenticated,
  });

  const { data: staff = [] } = useQuery({
    queryKey: ["/api/staff"],
    enabled: isAuthenticated,
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
    enabled: isAuthenticated,
  });

  const form = useForm({
    resolver: zodResolver(shiftFormSchema),
    defaultValues: {
      officerId: "",
      propertyId: "",
      shiftType: "day",
      date: new Date().toISOString().split('T')[0],
      startTime: "08:00",
      endTime: "16:00",
      status: "scheduled",
      notes: "",
    },
  });

  const createShiftMutation = useMutation({
    mutationFn: async (data: z.infer<typeof shiftFormSchema>) => {
      const payload = {
        ...data,
        date: new Date(data.date),
      };
      return await apiRequest("/api/shifts", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shifts"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Shift scheduled successfully",
      });
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
        description: "Failed to schedule shift",
        variant: "destructive",
      });
    },
  });

  const getShiftTypeColor = (shiftType: string) => {
    switch (shiftType) {
      case "day": return "bg-yellow-500/20 text-yellow-400";
      case "night": return "bg-blue-500/20 text-blue-400";
      case "swing": return "bg-purple-500/20 text-purple-400";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-500/20 text-blue-400";
      case "in_progress": return "bg-green-500/20 text-green-400";
      case "completed": return "bg-slate-500/20 text-slate-400";
      case "cancelled": return "bg-red-500/20 text-red-400";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  const getStaffName = (officerId: string) => {
    const officer = staff.find((s: any) => s.id === officerId);
    if (officer?.firstName && officer?.lastName) {
      return `${officer.firstName} ${officer.lastName}`;
    }
    return officer?.email?.split('@')[0] || "Unknown Officer";
  };

  const getPropertyName = (propertyId: string) => {
    const property = properties.find((p: any) => p.id === propertyId);
    return property?.name || "Unknown Property";
  };

  const getShiftsForDate = (date: Date) => {
    return shifts.filter((shift: any) => {
      const shiftDate = new Date(shift.date);
      return shiftDate.toDateString() === date.toDateString();
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-calendar-check text-4xl text-gold-500 mb-4 animate-pulse"></i>
          <p className="text-white">Loading Scheduling...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white min-h-screen">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-y-auto" data-testid="main-scheduling">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white" data-testid="text-page-title">
                  Staff Scheduling
                </h2>
                <p className="text-slate-400 mt-1" data-testid="text-page-subtitle">
                  Manage shifts, assign officers, and coordinate security coverage
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex bg-slate-800 rounded-lg p-1">
                  <Button
                    variant={viewMode === "calendar" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("calendar")}
                    className={viewMode === "calendar" ? "bg-navy-700" : ""}
                    data-testid="button-calendar-view"
                  >
                    <i className="fas fa-calendar mr-2"></i>Calendar
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={viewMode === "list" ? "bg-navy-700" : ""}
                    data-testid="button-list-view"
                  >
                    <i className="fas fa-list mr-2"></i>List
                  </Button>
                </div>
                
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="bg-gold-500 hover:bg-gold-600 text-black px-4 py-2 rounded-lg font-medium transition-colors"
                      data-testid="button-schedule-shift"
                    >
                      <i className="fas fa-plus mr-2"></i>Schedule Shift
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Schedule New Shift</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit((data) => createShiftMutation.mutate(data))} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="officerId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Officer</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white" data-testid="select-officer">
                                      <SelectValue placeholder="Select officer" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-slate-700 border-slate-600">
                                    {staff.map((officer: any) => (
                                      <SelectItem key={officer.id} value={officer.id}>
                                        {getStaffName(officer.id)}
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
                            name="propertyId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Property</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white" data-testid="select-property">
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
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="shiftType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Shift Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white" data-testid="select-shift-type">
                                      <SelectValue />
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
                          <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Date</FormLabel>
                                <FormControl>
                                  <Input {...field} type="date" className="bg-slate-700 border-slate-600 text-white" data-testid="input-shift-date" />
                                </FormControl>
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
                                <FormLabel className="text-white">Start Time</FormLabel>
                                <FormControl>
                                  <Input {...field} type="time" className="bg-slate-700 border-slate-600 text-white" data-testid="input-start-time" />
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
                                <FormLabel className="text-white">End Time</FormLabel>
                                <FormControl>
                                  <Input {...field} type="time" className="bg-slate-700 border-slate-600 text-white" data-testid="input-end-time" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} data-testid="button-cancel-shift">
                            Cancel
                          </Button>
                          <Button type="submit" className="bg-gold-500 hover:bg-gold-600 text-black" disabled={createShiftMutation.isPending} data-testid="button-save-shift">
                            {createShiftMutation.isPending ? "Scheduling..." : "Schedule Shift"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Schedule Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Total Shifts</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-total-shifts">
                        {shifts.length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-calendar text-blue-400 text-lg"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Active Shifts</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-active-shifts">
                        {activeShifts.length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-clock text-green-400 text-lg"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Coverage Rate</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-coverage-rate">
                        {properties.length > 0 ? Math.round((activeShifts.length / properties.length) * 100) : 0}%
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-shield-alt text-purple-400 text-lg"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Available Staff</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-available-staff">
                        {staff.filter((s: any) => s.status === 'active').length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gold-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-users text-gold-400 text-lg"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Schedule Content */}
          {viewMode === "calendar" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Schedule Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border border-slate-700"
                    data-testid="calendar-schedule"
                  />
                </CardContent>
              </Card>

              {/* Daily Schedule */}
              <div className="lg:col-span-2">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Schedule for {selectedDate.toLocaleDateString()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {getShiftsForDate(selectedDate).length === 0 ? (
                        <div className="text-center py-8">
                          <i className="fas fa-calendar-times text-4xl text-slate-400 mb-3"></i>
                          <p className="text-white font-medium">No shifts scheduled</p>
                          <p className="text-slate-400 text-sm">Add a shift for this date</p>
                        </div>
                      ) : (
                        getShiftsForDate(selectedDate).map((shift: any) => (
                          <div key={shift.id} className="p-4 bg-slate-700 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-3">
                                <Badge className={getShiftTypeColor(shift.shiftType)}>
                                  {shift.shiftType}
                                </Badge>
                                <span className="text-white font-medium">
                                  {getStaffName(shift.officerId)}
                                </span>
                              </div>
                              <Badge className={getStatusColor(shift.status)}>
                                {shift.status}
                              </Badge>
                            </div>
                            <div className="text-slate-300 text-sm space-y-1">
                              <p><i className="fas fa-building mr-2"></i>{getPropertyName(shift.propertyId)}</p>
                              <p><i className="fas fa-clock mr-2"></i>{shift.startTime} - {shift.endTime}</p>
                              {shift.notes && <p><i className="fas fa-note-sticky mr-2"></i>{shift.notes}</p>}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            /* List View */
            <div className="space-y-4">
              {shiftsLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
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
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : shifts.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-calendar-check text-4xl text-slate-400 mb-4"></i>
                  <h3 className="text-xl font-semibold text-white mb-2">No Shifts Scheduled</h3>
                  <p className="text-slate-400 mb-4">Start by scheduling your first shift</p>
                  <Button 
                    className="bg-gold-500 hover:bg-gold-600 text-black"
                    onClick={() => setIsDialogOpen(true)}
                    data-testid="button-schedule-first-shift"
                  >
                    <i className="fas fa-plus mr-2"></i>Schedule First Shift
                  </Button>
                </div>
              ) : (
                shifts.map((shift: any) => (
                  <Card key={shift.id} className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-full bg-navy-700 flex items-center justify-center">
                            <i className="fas fa-user-shield text-gold-500"></i>
                          </div>
                          <div>
                            <h3 className="text-white font-medium">{getStaffName(shift.officerId)}</h3>
                            <p className="text-slate-400 text-sm">{getPropertyName(shift.propertyId)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-white text-sm">{new Date(shift.date).toLocaleDateString()}</p>
                            <p className="text-slate-400 text-sm">{shift.startTime} - {shift.endTime}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Badge className={getShiftTypeColor(shift.shiftType)}>
                              {shift.shiftType}
                            </Badge>
                            <Badge className={getStatusColor(shift.status)}>
                              {shift.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
