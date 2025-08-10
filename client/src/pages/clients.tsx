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
import { insertClientSchema, type Client } from "@shared/schema";

export default function Clients() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
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

  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ["/api/clients"],
    enabled: isAuthenticated,
  }) as { data: Client[], isLoading: boolean };

  const form = useForm({
    resolver: zodResolver(insertClientSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      address: "",
      contactPerson: "",
      contractStart: "",
      contractEnd: "",
      status: "active",
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/clients", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Success",
        description: "Client created successfully",
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
        description: "Failed to create client",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest(`/api/clients/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Success",
        description: "Client updated successfully",
      });
      setIsDialogOpen(false);
      setSelectedClient(null);
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
        description: "Failed to update client",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    if (selectedClient) {
      updateMutation.mutate({ id: selectedClient.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openEditDialog = (client: Client) => {
    setSelectedClient(client);
    form.reset({
      name: client.name || "",
      email: client.email || "",
      phone: client.phone || "",
      company: client.company || "",
      address: client.address || "",
      contactPerson: client.contactPerson || "",
      contractStart: client.contractStart || "",
      contractEnd: client.contractEnd || "",
      status: client.status || "active",
      notes: client.notes || "",
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setSelectedClient(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/20 text-green-400";
      case "inactive": return "bg-red-500/20 text-red-400";
      case "pending": return "bg-yellow-500/20 text-yellow-400";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-users text-4xl text-gold-500 mb-4 animate-pulse"></i>
          <p className="text-white">Loading Clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white min-h-screen">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-y-auto" data-testid="main-clients">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white" data-testid="text-page-title">
                  Client Management
                </h2>
                <p className="text-slate-400 mt-1" data-testid="text-page-subtitle">
                  Manage security clients, contracts, and service agreements
                </p>
              </div>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={openCreateDialog}
                    className="bg-gold-500 hover:bg-gold-600 text-black px-4 py-2 rounded-lg font-medium transition-colors"
                    data-testid="button-add-client"
                  >
                    <i className="fas fa-user-plus mr-2"></i>Add Client
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedClient ? "Edit Client" : "Add New Client"}
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
                              <FormLabel>Client Name *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter client name" 
                                  {...field} 
                                  className="bg-slate-700 border-slate-600"
                                  data-testid="input-client-name"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="company"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Company name" 
                                  {...field} 
                                  className="bg-slate-700 border-slate-600"
                                  data-testid="input-company"
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
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input 
                                  type="email"
                                  placeholder="client@email.com" 
                                  {...field} 
                                  className="bg-slate-700 border-slate-600"
                                  data-testid="input-email"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="(808) 555-0123" 
                                  {...field} 
                                  className="bg-slate-700 border-slate-600"
                                  data-testid="input-phone"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="contactPerson"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Person</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Primary contact name" 
                                {...field} 
                                className="bg-slate-700 border-slate-600"
                                data-testid="input-contact-person"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Client address" 
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
                          name="contractStart"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contract Start</FormLabel>
                              <FormControl>
                                <Input 
                                  type="date"
                                  {...field} 
                                  className="bg-slate-700 border-slate-600"
                                  data-testid="input-contract-start"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="contractEnd"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contract End</FormLabel>
                              <FormControl>
                                <Input 
                                  type="date"
                                  {...field} 
                                  className="bg-slate-700 border-slate-600"
                                  data-testid="input-contract-end"
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
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Additional notes about client" 
                                {...field} 
                                className="bg-slate-700 border-slate-600"
                                data-testid="textarea-notes"
                              />
                            </FormControl>
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
                          data-testid="button-save-client"
                        >
                          {createMutation.isPending || updateMutation.isPending ? (
                            <>
                              <i className="fas fa-spinner fa-spin mr-2"></i>
                              Saving...
                            </>
                          ) : (
                            selectedClient ? "Update Client" : "Create Client"
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Client Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Total Clients</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-total-clients">
                        {clients.length}
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
                      <p className="text-slate-400 text-sm font-medium">Active Contracts</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-active-contracts">
                        {clients.filter((client: any) => client.status === "active").length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-file-contract text-green-400 text-lg"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Pending Contracts</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-pending-contracts">
                        {clients.filter((client: any) => client.status === "pending").length}
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
                      <p className="text-slate-400 text-sm font-medium">This Month</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-new-clients">
                        {clients.filter((client: any) => {
                          const created = new Date(client.createdAt);
                          const now = new Date();
                          return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                        }).length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gold-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-user-plus text-gold-400 text-lg"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Clients Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clientsLoading ? (
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
            ) : clients.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <i className="fas fa-users text-4xl text-slate-400 mb-4"></i>
                <h3 className="text-xl font-semibold text-white mb-2">No Clients Found</h3>
                <p className="text-slate-400 mb-4">Start by adding your first security client</p>
                <Button 
                  onClick={openCreateDialog}
                  className="bg-gold-500 hover:bg-gold-600 text-black"
                  data-testid="button-add-first-client"
                >
                  <i className="fas fa-user-plus mr-2"></i>Add First Client
                </Button>
              </div>
            ) : (
              clients.map((client: any) => (
                <Card key={client.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-navy-700 flex items-center justify-center">
                          <i className="fas fa-building text-gold-500"></i>
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg">{client.name}</CardTitle>
                          {client.company && (
                            <p className="text-slate-400 text-sm">{client.company}</p>
                          )}
                        </div>
                      </div>
                      <Badge className={getStatusColor(client.status)}>
                        {client.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {client.contactPerson && (
                        <div className="flex items-center text-slate-300 text-sm">
                          <i className="fas fa-user mr-2 text-slate-400 w-4"></i>
                          {client.contactPerson}
                        </div>
                      )}
                      {client.email && (
                        <div className="flex items-center text-slate-300 text-sm">
                          <i className="fas fa-envelope mr-2 text-slate-400 w-4"></i>
                          {client.email}
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center text-slate-300 text-sm">
                          <i className="fas fa-phone mr-2 text-slate-400 w-4"></i>
                          {client.phone}
                        </div>
                      )}
                      {client.address && (
                        <div className="flex items-center text-slate-300 text-sm">
                          <i className="fas fa-map-marker-alt mr-2 text-slate-400 w-4"></i>
                          <span className="truncate">{client.address}</span>
                        </div>
                      )}
                      {client.contractStart && (
                        <div className="flex items-center text-slate-300 text-sm">
                          <i className="fas fa-calendar mr-2 text-slate-400 w-4"></i>
                          Contract: {new Date(client.contractStart).toLocaleDateString()}
                          {client.contractEnd && ` - ${new Date(client.contractEnd).toLocaleDateString()}`}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-600">
                      <div className="text-xs text-slate-400">
                        Added {new Date(client.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(client)}
                          className="text-slate-400 hover:text-white hover:bg-slate-700"
                          data-testid="button-edit-client"
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                          data-testid="button-view-properties"
                        >
                          <i className="fas fa-building"></i>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                          data-testid="button-contact-client"
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
        </main>
      </div>
    </div>
  );
}
