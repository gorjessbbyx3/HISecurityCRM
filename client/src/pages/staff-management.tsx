import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Plus, 
  Search, 
  ShieldQuestion, 
  Phone, 
  Mail,
  Edit,
  Trash2,
  Shield,
  Users,
  Clock
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isUnauthorizedError } from "@/lib/authUtils";

interface StaffMember {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  role: string;
  zone?: string;
  phoneNumber?: string;
  badgeNumber?: string;
  isActive: boolean;
  createdAt: string;
}

const staffSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(["staff", "supervisor", "admin"]),
  zone: z.string().optional(),
  phoneNumber: z.string().optional(),
  badgeNumber: z.string().optional(),
  isActive: z.boolean().default(true),
});

type StaffFormData = z.infer<typeof staffSchema>;

export default function StaffManagement() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const form = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      role: "staff",
      zone: "",
      phoneNumber: "",
      badgeNumber: "",
      isActive: true,
    },
  });

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

  // Check if user is admin or supervisor
  const canManageStaff = user?.role === 'admin' || user?.role === 'supervisor';

  const { data: staffMembers = [], isLoading: isLoadingStaff } = useQuery<StaffMember[]>({
    queryKey: ["/api/auth/staff"],
    retry: false,
  });

  const createStaffMutation = useMutation({
    mutationFn: async (staffData: StaffFormData) => {
      await apiRequest("/api/auth/staff", {
        method: "POST",
        body: JSON.stringify(staffData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/staff"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Staff member created successfully",
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
        description: "Failed to create staff member",
        variant: "destructive",
      });
    },
  });

  const updateStaffMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<StaffFormData> }) => {
      await apiRequest(`/api/auth/staff/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/staff"] });
      setIsEditDialogOpen(false);
      setSelectedStaff(null);
      form.reset();
      toast({
        title: "Success",
        description: "Staff member updated successfully",
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
        description: "Failed to update staff member",
        variant: "destructive",
      });
    },
  });

  const handleCreateStaff = (data: StaffFormData) => {
    createStaffMutation.mutate(data);
  };

  const handleUpdateStaff = (data: StaffFormData) => {
    if (selectedStaff) {
      updateStaffMutation.mutate({ id: selectedStaff.id, data });
    }
  };

  const handleEditStaff = (staff: StaffMember) => {
    setSelectedStaff(staff);
    form.reset({
      email: staff.email || "",
      firstName: staff.firstName || "",
      lastName: staff.lastName || "",
      role: staff.role as "staff" | "supervisor" | "admin",
      zone: staff.zone || "",
      phoneNumber: staff.phoneNumber || "",
      badgeNumber: staff.badgeNumber || "",
      isActive: staff.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const filteredStaff = staffMembers.filter(staff => {
    const name = `${staff.firstName || ''} ${staff.lastName || ''}`.toLowerCase();
    const email = staff.email?.toLowerCase() || '';
    const badge = staff.badgeNumber?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    
    return name.includes(query) || email.includes(query) || badge.includes(query);
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/20 text-red-400';
      case 'supervisor':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'staff':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-y-auto" data-testid="main-staff-management">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white" data-testid="text-page-title">
                  Staff Management
                </h2>
                <p className="text-slate-400 mt-1">
                  Manage security team members and their assignments
                </p>
              </div>
              {canManageStaff && (
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="btn-gold font-medium" 
                      data-testid="button-add-staff"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Staff Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-white">Add New Staff Member</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={form.handleSubmit(handleCreateStaff)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-slate-300">First Name *</Label>
                          <Input
                            id="firstName"
                            {...form.register("firstName")}
                            className="bg-slate-700 border-slate-600 text-white"
                            data-testid="input-first-name"
                          />
                          {form.formState.errors.firstName && (
                            <p className="text-red-400 text-sm">{form.formState.errors.firstName.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-slate-300">Last Name *</Label>
                          <Input
                            id="lastName"
                            {...form.register("lastName")}
                            className="bg-slate-700 border-slate-600 text-white"
                            data-testid="input-last-name"
                          />
                          {form.formState.errors.lastName && (
                            <p className="text-red-400 text-sm">{form.formState.errors.lastName.message}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-slate-300">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            {...form.register("email")}
                            className="bg-slate-700 border-slate-600 text-white"
                            data-testid="input-email"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phoneNumber" className="text-slate-300">Phone Number</Label>
                          <Input
                            id="phoneNumber"
                            {...form.register("phoneNumber")}
                            className="bg-slate-700 border-slate-600 text-white"
                            data-testid="input-phone"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="role" className="text-slate-300">Role</Label>
                          <Select onValueChange={(value) => form.setValue("role", value as any)} defaultValue="staff">
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white" data-testid="select-role">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-700 border-slate-600">
                              <SelectItem value="staff">Security Staff</SelectItem>
                              <SelectItem value="supervisor">Supervisor</SelectItem>
                              {user?.role === 'admin' && (
                                <SelectItem value="admin">Administrator</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="badgeNumber" className="text-slate-300">Badge Number</Label>
                          <Input
                            id="badgeNumber"
                            {...form.register("badgeNumber")}
                            className="bg-slate-700 border-slate-600 text-white"
                            data-testid="input-badge-number"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="zone" className="text-slate-300">Zone Assignment</Label>
                        <Input
                          id="zone"
                          {...form.register("zone")}
                          placeholder="e.g., Zone A, Zone B, Mobile Unit"
                          className="bg-slate-700 border-slate-600 text-white"
                          data-testid="input-zone"
                        />
                      </div>

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsCreateDialogOpen(false)}
                          className="border-slate-600 text-slate-300"
                          data-testid="button-cancel"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          className="btn-gold"
                          disabled={createStaffMutation.isPending}
                          data-testid="button-save-staff"
                        >
                          {createStaffMutation.isPending ? "Creating..." : "Create Staff Member"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Search */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search staff members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                  data-testid="input-search-staff"
                />
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="security-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Total Staff</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-total-staff">
                        {staffMembers.length}
                      </p>
                    </div>
                    <Users className="text-blue-400 h-8 w-8" />
                  </div>
                </CardContent>
              </Card>

              <Card className="security-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Active Staff</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-active-staff">
                        {staffMembers.filter(s => s.isActive).length}
                      </p>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="security-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Supervisors</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-supervisors">
                        {staffMembers.filter(s => s.role === 'supervisor').length}
                      </p>
                    </div>
                    <ShieldQuestion className="text-yellow-400 h-8 w-8" />
                  </div>
                </CardContent>
              </Card>

              <Card className="security-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Administrators</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-administrators">
                        {staffMembers.filter(s => s.role === 'admin').length}
                      </p>
                    </div>
                    <Shield className="text-red-400 h-8 w-8" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Staff Grid */}
          {isLoadingStaff ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="security-card p-6 animate-pulse">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-slate-700 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-slate-700 rounded mb-2"></div>
                      <div className="h-3 bg-slate-700 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredStaff.length === 0 ? (
            <Card className="security-card">
              <CardContent className="p-12 text-center">
                <Users className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <p className="text-slate-400" data-testid="text-no-staff">
                  {searchQuery ? "No staff members found matching your search" : "No staff members found"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStaff.map((staff, index) => (
                <Card key={staff.id} className="security-card hover:border-slate-600 transition-colors" data-testid={`staff-card-${index}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={staff.profileImageUrl || ""} alt="Staff" />
                          <AvatarFallback className="bg-blue-600 text-white font-medium">
                            {`${staff.firstName?.[0] || ''}${staff.lastName?.[0] || ''}`.toUpperCase() || 'SM'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-white text-lg" data-testid={`text-staff-name-${index}`}>
                            {`${staff.firstName || ''} ${staff.lastName || ''}`.trim() || 'Unknown'}
                          </CardTitle>
                          {staff.badgeNumber && (
                            <p className="text-slate-400 text-sm mt-1" data-testid={`text-badge-${index}`}>
                              Badge: {staff.badgeNumber}
                            </p>
                          )}
                        </div>
                      </div>
                      {canManageStaff && (
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditStaff(staff)}
                            className="text-slate-400 hover:text-white h-8 w-8"
                            data-testid={`button-edit-${index}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {staff.email && (
                      <div className="flex items-center space-x-2 text-slate-300 text-sm">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span data-testid={`text-email-${index}`}>{staff.email}</span>
                      </div>
                    )}
                    {staff.phoneNumber && (
                      <div className="flex items-center space-x-2 text-slate-300 text-sm">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span data-testid={`text-phone-${index}`}>{staff.phoneNumber}</span>
                      </div>
                    )}
                    {staff.zone && (
                      <div className="flex items-center space-x-2 text-slate-300 text-sm">
                        <Shield className="h-4 w-4 text-slate-400" />
                        <span data-testid={`text-zone-${index}`}>{staff.zone}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex space-x-2">
                        <Badge className={getRoleColor(staff.role)} data-testid={`badge-role-${index}`}>
                          {staff.role === 'admin' ? 'Administrator' : 
                           staff.role === 'supervisor' ? 'Supervisor' : 'Security Staff'}
                        </Badge>
                        <Badge className={getStatusColor(staff.isActive)} data-testid={`badge-status-${index}`}>
                          {staff.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <span className="text-slate-500 text-xs" data-testid={`text-joined-${index}`}>
                        {new Date(staff.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Edit Staff Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">Edit Staff Member</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(handleUpdateStaff)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-firstName" className="text-slate-300">First Name *</Label>
                    <Input
                      id="edit-firstName"
                      {...form.register("firstName")}
                      className="bg-slate-700 border-slate-600 text-white"
                      data-testid="input-edit-first-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-lastName" className="text-slate-300">Last Name *</Label>
                    <Input
                      id="edit-lastName"
                      {...form.register("lastName")}
                      className="bg-slate-700 border-slate-600 text-white"
                      data-testid="input-edit-last-name"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-email" className="text-slate-300">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      {...form.register("email")}
                      className="bg-slate-700 border-slate-600 text-white"
                      data-testid="input-edit-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-phoneNumber" className="text-slate-300">Phone Number</Label>
                    <Input
                      id="edit-phoneNumber"
                      {...form.register("phoneNumber")}
                      className="bg-slate-700 border-slate-600 text-white"
                      data-testid="input-edit-phone"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-role" className="text-slate-300">Role</Label>
                    <Select onValueChange={(value) => form.setValue("role", value as any)} value={form.watch("role")}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white" data-testid="select-edit-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="staff">Security Staff</SelectItem>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                        {user?.role === 'admin' && (
                          <SelectItem value="admin">Administrator</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-badgeNumber" className="text-slate-300">Badge Number</Label>
                    <Input
                      id="edit-badgeNumber"
                      {...form.register("badgeNumber")}
                      className="bg-slate-700 border-slate-600 text-white"
                      data-testid="input-edit-badge-number"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-zone" className="text-slate-300">Zone Assignment</Label>
                  <Input
                    id="edit-zone"
                    {...form.register("zone")}
                    className="bg-slate-700 border-slate-600 text-white"
                    data-testid="input-edit-zone"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditDialogOpen(false)}
                    className="border-slate-600 text-slate-300"
                    data-testid="button-cancel-edit"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="btn-gold"
                    disabled={updateStaffMutation.isPending}
                    data-testid="button-update-staff"
                  >
                    {updateStaffMutation.isPending ? "Updating..." : "Update Staff Member"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}
