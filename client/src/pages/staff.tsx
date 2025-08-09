import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Staff() {
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

  const { data: staff = [], isLoading: staffLoading } = useQuery({
    queryKey: ["/api/staff"],
    enabled: isAuthenticated,
  });

  const { data: activeStaff = [] } = useQuery({
    queryKey: ["/api/staff/active"],
    enabled: isAuthenticated,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/20 text-green-400";
      case "inactive": return "bg-red-500/20 text-red-400";
      case "on_leave": return "bg-yellow-500/20 text-yellow-400";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "security_officer": return "fas fa-shield-alt";
      case "supervisor": return "fas fa-user-tie";
      case "admin": return "fas fa-user-cog";
      default: return "fas fa-user";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-user-shield text-4xl text-gold-500 mb-4 animate-pulse"></i>
          <p className="text-white">Loading Staff...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white min-h-screen">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-y-auto" data-testid="main-staff">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white" data-testid="text-page-title">
                  Staff Management
                </h2>
                <p className="text-slate-400 mt-1" data-testid="text-page-subtitle">
                  Manage security officers, schedules, and team assignments
                </p>
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  className="bg-navy-700 hover:bg-navy-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  data-testid="button-schedule-shift"
                >
                  <i className="fas fa-calendar-plus mr-2"></i>Schedule Shift
                </Button>
                <Button 
                  className="bg-gold-500 hover:bg-gold-600 text-black px-4 py-2 rounded-lg font-medium transition-colors"
                  data-testid="button-add-staff"
                >
                  <i className="fas fa-user-plus mr-2"></i>Add Staff
                </Button>
              </div>
            </div>

            {/* Staff Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Total Staff</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-total-staff">
                        {staff.length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-users text-blue-400 text-lg"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">On Duty</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-staff-on-duty">
                        {activeStaff.length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-user-shield text-green-400 text-lg"></i>
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
                        {activeStaff.filter((member: any) => member.shift === "day" || member.shift === "night").length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gold-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-clock text-gold-400 text-lg"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Coverage</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-coverage">
                        100%
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-shield-alt text-green-400 text-lg"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Staff Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staffLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
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
            ) : staff.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <i className="fas fa-user-shield text-4xl text-slate-400 mb-4"></i>
                <h3 className="text-xl font-semibold text-white mb-2">No Staff Members Found</h3>
                <p className="text-slate-400 mb-4">Start by adding your first security officer</p>
                <Button 
                  className="bg-gold-500 hover:bg-gold-600 text-black"
                  data-testid="button-add-first-staff"
                >
                  <i className="fas fa-user-plus mr-2"></i>Add First Staff Member
                </Button>
              </div>
            ) : (
              staff.map((member: any) => (
                <Card key={member.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {member.profileImageUrl ? (
                          <img 
                            src={member.profileImageUrl}
                            alt={`${member.firstName} ${member.lastName}`}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-navy-700 flex items-center justify-center">
                            <i className={`${getRoleIcon(member.role)} text-gold-500`}></i>
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-white text-lg">
                            {member.firstName && member.lastName 
                              ? `${member.firstName} ${member.lastName}`
                              : member.email?.split('@')[0] || "Officer"
                            }
                          </CardTitle>
                          <p className="text-slate-400 text-sm capitalize">
                            {member.role?.replace('_', ' ') || "Security Officer"}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(member.status)}>
                        {member.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {member.badge && (
                        <div className="flex items-center text-slate-300 text-sm">
                          <i className="fas fa-id-badge mr-2 text-slate-400 w-4"></i>
                          Badge #{member.badge}
                        </div>
                      )}
                      {member.zone && (
                        <div className="flex items-center text-slate-300 text-sm">
                          <i className="fas fa-map-marker-alt mr-2 text-slate-400 w-4"></i>
                          Zone {member.zone}
                        </div>
                      )}
                      {member.shift && (
                        <div className="flex items-center text-slate-300 text-sm">
                          <i className="fas fa-clock mr-2 text-slate-400 w-4"></i>
                          {member.shift.charAt(0).toUpperCase() + member.shift.slice(1)} Shift
                        </div>
                      )}
                      {member.phone && (
                        <div className="flex items-center text-slate-300 text-sm">
                          <i className="fas fa-phone mr-2 text-slate-400 w-4"></i>
                          {member.phone}
                        </div>
                      )}
                      {member.email && (
                        <div className="flex items-center text-slate-300 text-sm">
                          <i className="fas fa-envelope mr-2 text-slate-400 w-4"></i>
                          {member.email}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-600">
                      <div className="text-xs text-slate-400">
                        Joined {new Date(member.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-slate-400 hover:text-white hover:bg-slate-700"
                          data-testid="button-view-schedule"
                        >
                          <i className="fas fa-calendar-alt"></i>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-slate-400 hover:text-white hover:bg-slate-700"
                          data-testid="button-edit-staff"
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                          data-testid="button-contact-staff"
                        >
                          <i className="fas fa-phone"></i>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Current Shifts Section */}
          {activeStaff.length > 0 && (
            <div className="mt-12">
              <h3 className="text-xl font-bold text-white mb-6">Current Shifts</h3>
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeStaff.map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {member.profileImageUrl ? (
                          <img 
                            src={member.profileImageUrl}
                            alt={`${member.firstName} ${member.lastName}`}
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
                          <p className="text-slate-400 text-xs">
                            Zone {member.zone || "Central"}
                          </p>
                        </div>
                      </div>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
