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
import { insertPropertySchema, type Property } from "@shared/schema";

export default function Properties() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
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

  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ["/api/properties"],
    enabled: isAuthenticated,
  }) as { data: Property[], isLoading: boolean };

  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients"],
    enabled: isAuthenticated,
  }) as { data: any[] };

  const form = useForm({
    resolver: zodResolver(insertPropertySchema),
    defaultValues: {
      name: "",
      address: "",
      clientId: "",
      propertyType: "commercial",
      zone: "",
      securityLevel: "standard",
      accessCodes: "",
      specialInstructions: "",
      coordinates: "",
      coverageType: "patrol",
      status: "active",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/properties", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "Success",
        description: "Property created successfully",
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
        description: "Failed to create property",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest(`/api/properties/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "Success",
        description: "Property updated successfully",
      });
      setIsDialogOpen(false);
      setSelectedProperty(null);
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
        description: "Failed to update property",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    if (selectedProperty) {
      updateMutation.mutate({ id: selectedProperty.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openEditDialog = (property: Property) => {
    setSelectedProperty(property);
    form.reset({
      name: property.name || "",
      address: property.address || "",
      clientId: property.clientId || "",
      propertyType: property.propertyType || "commercial",
      zone: property.zone || "",
      securityLevel: property.securityLevel || "standard",
      accessCodes: property.accessCodes || "",
      specialInstructions: property.specialInstructions || "",
      coordinates: property.coordinates || "",
      coverageType: property.coverageType || "patrol",
      status: property.status || "active",
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setSelectedProperty(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/20 text-green-400";
      case "inactive": return "bg-red-500/20 text-red-400";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case "maximum": return "bg-red-500/20 text-red-400";
      case "high": return "bg-orange-500/20 text-orange-400";
      case "standard": return "bg-blue-500/20 text-blue-400";
      case "low": return "bg-slate-500/20 text-slate-400";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-building text-4xl text-gold-500 mb-4 animate-pulse"></i>
          <p className="text-white">Loading Properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white min-h-screen">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-y-auto" data-testid="main-properties">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white" data-testid="text-page-title">
                  Property Management
                </h2>
                <p className="text-slate-400 mt-1" data-testid="text-page-subtitle">
                  Manage secured properties, access codes, and security configurations
                </p>
              </div>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={openCreateDialog}
                    className="bg-gold-500 hover:bg-gold-600 text-black px-4 py-2 rounded-lg font-medium transition-colors"
                    data-testid="button-add-property"
                  >
                    <i className="fas fa-building mr-2"></i>Add Property
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedProperty ? "Edit Property" : "Add New Property"}
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Property Name *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter property name" 
                                  {...field} 
                                  className="bg-slate-700 border-slate-600"
                                  data-testid="input-property-name"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="clientId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Client</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-slate-700 border-slate-600" data-testid="select-client">
                                    <SelectValue placeholder="Select client" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-slate-700 border-slate-600">
                                  {clients.map((client: any) => (
                                    <SelectItem key={client.id} value={client.id}>
                                      {client.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Property address" 
                                {...field} 
                                className="bg-slate-700 border-slate-600"
                                data-testid="textarea-address"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="propertyType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Property Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-slate-700 border-slate-600" data-testid="select-property-type">
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-slate-700 border-slate-600">
                                  <SelectItem value="residential">Residential</SelectItem>
                                  <SelectItem value="commercial">Commercial</SelectItem>
                                  <SelectItem value="industrial">Industrial</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="zone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Security Zone</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Zone A, B, Central, etc." 
                                  {...field} 
                                  className="bg-slate-700 border-slate-600"
                                  data-testid="input-zone"
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
                          name="securityLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Security Level</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-slate-700 border-slate-600" data-testid="select-security-level">
                                    <SelectValue placeholder="Select level" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-slate-700 border-slate-600">
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="standard">Standard</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                  <SelectItem value="maximum">Maximum</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="coverageType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Coverage Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-slate-700 border-slate-600" data-testid="select-coverage-type">
                                    <SelectValue placeholder="Select coverage" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-slate-700 border-slate-600">
                                  <SelectItem value="patrol">Patrol</SelectItem>
                                  <SelectItem value="stationed">Stationed</SelectItem>
                                  <SelectItem value="mobile">Mobile</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

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

                      <FormField
                        control={form.control}
                        name="accessCodes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Access Codes</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Security codes, key information, etc." 
                                {...field} 
                                className="bg-slate-700 border-slate-600"
                                data-testid="textarea-access-codes"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="specialInstructions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Special Instructions</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Special security instructions and protocols" 
                                {...field} 
                                className="bg-slate-700 border-slate-600"
                                data-testid="textarea-special-instructions"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

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
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
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
                          data-testid="button-save-property"
                        >
                          {createMutation.isPending || updateMutation.isPending ? (
                            <>
                              <i className="fas fa-spinner fa-spin mr-2"></i>
                              Saving...
                            </>
                          ) : (
                            selectedProperty ? "Update Property" : "Create Property"
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Property Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Total Properties</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-total-properties">
                        {properties.length}
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
                      <p className="text-slate-400 text-sm font-medium">Active Properties</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-active-properties">
                        {properties.filter((property: any) => property.status === "active").length}
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
                      <p className="text-slate-400 text-sm font-medium">High Security</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-high-security">
                        {properties.filter((property: any) => 
                          property.securityLevel === "high" || property.securityLevel === "maximum"
                        ).length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-lock text-red-400 text-lg"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">24/7 Coverage</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-stationed-coverage">
                        {properties.filter((property: any) => property.coverageType === "stationed").length}
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

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {propertiesLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
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
            ) : properties.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <i className="fas fa-building text-4xl text-slate-400 mb-4"></i>
                <h3 className="text-xl font-semibold text-white mb-2">No Properties Found</h3>
                <p className="text-slate-400 mb-4">Start by adding your first secured property</p>
                <Button 
                  onClick={openCreateDialog}
                  className="bg-gold-500 hover:bg-gold-600 text-black"
                  data-testid="button-add-first-property"
                >
                  <i className="fas fa-building mr-2"></i>Add First Property
                </Button>
              </div>
            ) : (
              properties.map((property: any) => (
                <Card key={property.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-lg bg-navy-700 flex items-center justify-center">
                          <i className={`fas ${
                            property.propertyType === 'residential' ? 'fa-home' :
                            property.propertyType === 'industrial' ? 'fa-industry' :
                            'fa-building'
                          } text-gold-500`}></i>
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg">{property.name}</CardTitle>
                          <p className="text-slate-400 text-sm capitalize">{property.propertyType}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge className={getStatusColor(property.status)}>
                          {property.status}
                        </Badge>
                        <Badge className={getSecurityLevelColor(property.securityLevel)}>
                          {property.securityLevel}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start text-slate-300 text-sm">
                        <i className="fas fa-map-marker-alt mr-2 text-slate-400 w-4 mt-0.5"></i>
                        <span className="line-clamp-2">{property.address}</span>
                      </div>
                      {property.zone && (
                        <div className="flex items-center text-slate-300 text-sm">
                          <i className="fas fa-crosshairs mr-2 text-slate-400 w-4"></i>
                          Zone {property.zone}
                        </div>
                      )}
                      <div className="flex items-center text-slate-300 text-sm">
                        <i className="fas fa-eye mr-2 text-slate-400 w-4"></i>
                        {property.coverageType} coverage
                      </div>
                      {property.coordinates && (
                        <div className="flex items-center text-slate-300 text-sm">
                          <i className="fas fa-satellite mr-2 text-slate-400 w-4"></i>
                          GPS Tracked
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-600">
                      <div className="text-xs text-slate-400">
                        Added {new Date(property.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(property)}
                          className="text-slate-400 hover:text-white hover:bg-slate-700"
                          data-testid="button-edit-property"
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                          data-testid="button-view-incidents"
                        >
                          <i className="fas fa-exclamation-triangle"></i>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                          data-testid="button-view-patrols"
                        >
                          <i className="fas fa-route"></i>
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
