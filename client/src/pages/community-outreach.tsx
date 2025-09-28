import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";

interface CommunityResource {
  id: string;
  name: string;
  category: string;
  description: string;
  contactInfo?: string;
  website?: string;
  address?: string;
  phone?: string;
  email?: string;
  hours?: string;
  services?: string[];
  status?: string;
  lastUpdated: Date;
}

export default function CommunityOutreach() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<CommunityResource | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const queryClient = useQueryClient();
  const createForm = useForm();
  const editForm = useForm();

  const { data: allResources = [], isLoading } = useQuery({
    queryKey: ["/api/community-resources"],
    queryFn: async () => {
      const response = await fetch("/api/community-resources", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch resources');
      return response.json();
    },
  });

  const resources = allResources.filter((resource: CommunityResource) =>
    resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const createResourceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/community-resources", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create resource');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community-resources"] });
      setIsCreateDialogOpen(false);
      createForm.reset();
      toast({
        title: "Success",
        description: "Community resource created successfully",
      });
    },
    onError: (error) => {
      console.error("Create error:", error);
      toast({
        title: "Error",
        description: "Failed to create community resource",
        variant: "destructive",
      });
    },
  });

  const updateResourceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/community-resources/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update resource');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community-resources"] });
      setIsEditDialogOpen(false);
      setSelectedResource(null);
      editForm.reset();
      toast({
        title: "Success",
        description: "Community resource updated successfully",
      });
    },
    onError: (error) => {
      console.error("Update error:", error);
      toast({
        title: "Error",
        description: "Failed to update community resource",
        variant: "destructive",
      });
    },
  });

  const deleteResourceMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/community-resources/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete resource');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community-resources"] });
      toast({
        title: "Success",
        description: "Community resource deleted successfully",
      });
    },
    onError: (error) => {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: "Failed to delete community resource",
        variant: "destructive",
      });
    },
  });

  const handleCreateResource = (data: any) => {
    createResourceMutation.mutate({
      ...data,
      services: data.services?.split(',').map((s: string) => s.trim()) || [],
    });
  };

  const handleUpdateResource = (data: any) => {
    if (!selectedResource) return;
    updateResourceMutation.mutate({
      id: selectedResource.id,
      data: {
        ...data,
        services: data.services?.split(',').map((s: string) => s.trim()) || [],
      },
    });
  };

  const handleDeleteResource = (id: string) => {
    if (confirm("Are you sure you want to delete this resource?")) {
      deleteResourceMutation.mutate(id);
    }
  };

  const openEditDialog = (resource: CommunityResource) => {
    setSelectedResource(resource);
    editForm.reset({
      name: resource.name,
      category: resource.category,
      description: resource.description,
      address: resource.address,
      phone: resource.phone,
      email: resource.email || '',
      website: resource.website || '',
      hours: resource.hours,
      services: resource.services?.join(', ') || '',
    });
    setIsEditDialogOpen(true);
  };

  const getResourceTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'shelter': return 'fa-home';
      case 'medical': return 'fa-hospital';
      case 'food': return 'fa-utensils';
      case 'legal': return 'fa-gavel';
      case 'mental_health': return 'fa-brain';
      case 'education': return 'fa-graduation-cap';
      case 'employment': return 'fa-briefcase';
      default: return 'fa-info-circle';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-500';
      case 'limited': return 'bg-yellow-500';
      case 'closed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const resourceTypes = [
    'shelter', 'medical', 'food', 'legal', 'mental_health',
    'education', 'employment', 'transportation', 'financial', 'other'
  ];

  return (
    <div className="bg-slate-900 text-white min-h-screen">
      <Header />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Community Outreach</h2>
                <p className="text-slate-400 mt-1">
                  Connect community members with essential services and resources
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gold-500 hover:bg-gold-600 text-black">
                      <i className="fas fa-plus mr-2"></i>Add Resource
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-white">Add Community Resource</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={createForm.handleSubmit(handleCreateResource)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name" className="text-white">Name</Label>
                          <Input
                            id="name"
                            {...createForm.register("name", { required: true })}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="category" className="text-white">Category</Label>
                          <Select onValueChange={(value) => createForm.setValue("category", value)}>
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-700 border-slate-600">
                              {resourceTypes.map((type) => (
                                <SelectItem key={type} value={type} className="text-white">
                                  {type.replace('_', ' ').toUpperCase()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="description" className="text-white">Description</Label>
                        <Textarea
                          id="description"
                          {...createForm.register("description", { required: true })}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>

                      <div>
                        <Label htmlFor="address" className="text-white">Address</Label>
                        <Input
                          id="address"
                          {...createForm.register("address", { required: true })}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone" className="text-white">Phone</Label>
                          <Input
                            id="phone"
                            {...createForm.register("phone", { required: true })}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email" className="text-white">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            {...createForm.register("email")}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="website" className="text-white">Website</Label>
                          <Input
                            id="website"
                            {...createForm.register("website")}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="hours" className="text-white">Hours</Label>
                          <Input
                            id="hours"
                            {...createForm.register("hours", { required: true })}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="e.g., Mon-Fri 9AM-5PM"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="services" className="text-white">Services (comma separated)</Label>
                        <Input
                          id="services"
                          {...createForm.register("services")}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="e.g., Housing assistance, Case management"
                        />
                      </div>

                      <div className="flex justify-end space-x-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsCreateDialogOpen(false)}
                          className="border-slate-600 text-slate-300"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="bg-gold-500 hover:bg-gold-600 text-black"
                          disabled={createResourceMutation.isPending}
                        >
                          {createResourceMutation.isPending ? 'Creating...' : 'Create Resource'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>

                <Input
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white px-4 py-2 rounded-lg w-64 max-w-full"
                />
              </div>
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-white">Edit Community Resource</DialogTitle>
                </DialogHeader>
                <form onSubmit={editForm.handleSubmit(handleUpdateResource)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-white">Name</Label>
                      <Input
                        id="name"
                        {...editForm.register("name", { required: true })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category" className="text-white">Category</Label>
                      <Select onValueChange={(value) => editForm.setValue("category", value)}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          {resourceTypes.map((type) => (
                            <SelectItem key={type} value={type} className="text-white">
                              {type.replace('_', ' ').toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-white">Description</Label>
                    <Textarea
                      id="description"
                      {...editForm.register("description", { required: true })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address" className="text-white">Address</Label>
                    <Input
                      id="address"
                      {...editForm.register("address", { required: true })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone" className="text-white">Phone</Label>
                      <Input
                        id="phone"
                        {...editForm.register("phone", { required: true })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-white">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        {...editForm.register("email")}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="website" className="text-white">Website</Label>
                      <Input
                        id="website"
                        {...editForm.register("website")}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hours" className="text-white">Hours</Label>
                      <Input
                        id="hours"
                        {...editForm.register("hours", { required: true })}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="e.g., Mon-Fri 9AM-5PM"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="services" className="text-white">Services (comma separated)</Label>
                    <Input
                      id="services"
                      {...editForm.register("services")}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="e.g., Housing assistance, Case management"
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditDialogOpen(false)}
                      className="border-slate-600 text-slate-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gold-500 hover:bg-gold-600 text-black"
                      disabled={updateResourceMutation.isPending}
                    >
                      {updateResourceMutation.isPending ? 'Updating...' : 'Update Resource'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Emergency Contacts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-red-900/20 border-red-500/30">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-phone text-red-400 text-2xl"></i>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Emergency</h3>
                <p className="text-red-400 text-3xl font-bold mb-2">911</p>
                <p className="text-slate-300 text-sm">Police, Fire, Medical</p>
              </CardContent>
            </Card>

            <Card className="bg-blue-900/20 border-blue-500/30">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-exclamation-triangle text-blue-400 text-2xl"></i>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Crisis Hotline</h3>
                <p className="text-blue-400 text-xl font-bold mb-2">988</p>
                <p className="text-slate-300 text-sm">Suicide & Crisis Lifeline</p>
              </CardContent>
            </Card>

            <Card className="bg-green-900/20 border-green-500/30">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-shield-alt text-green-400 text-2xl"></i>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Hawaii Security</h3>
                <p className="text-green-400 text-xl font-bold mb-2">(808) 555-0123</p>
                <p className="text-slate-300 text-sm">24/7 Security Services</p>
              </CardContent>
            </Card>
          </div>

          {/* Community Resources */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Community Resources ({resources.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="animate-pulse bg-slate-700 h-48 rounded-lg"></div>
                  ))}
                </div>
              ) : resources.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-heart text-4xl text-slate-400 mb-4"></i>
                  <p className="text-slate-400 text-lg">No community resources match your search</p>
                  <p className="text-slate-500 text-sm">Try adjusting your search terms or add new resources</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {resources.map((resource: CommunityResource) => (
                    <Card key={resource.id} className="bg-slate-700 border-slate-600 hover:border-slate-500 transition-colors">
                      <CardContent className="p-6 relative">
                        <div className="flex justify-end mb-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditDialog(resource);
                            }}
                            className="text-slate-400 hover:text-white"
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteResource(resource.id);
                            }}
                            className="text-red-400 hover:text-red-300"
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </div>
                        <div className="flex items-start justify-between mb-4" onClick={() => setSelectedResource(resource)}>
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                              <i className={`fas ${getResourceTypeIcon(resource.category)} text-blue-400`}></i>
                            </div>
                            <div>
                              <h3 className="text-white font-medium">{resource.name}</h3>
                              <p className="text-slate-400 text-sm capitalize">{resource.category?.replace('_', ' ')}</p>
                            </div>
                          </div>
                          <Badge className={`${getStatusColor(resource.status)} text-white`}>
                            {resource.status}
                          </Badge>
                        </div>

                        <p className="text-slate-300 text-sm mb-4 line-clamp-3">{resource.description}</p>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center text-slate-400">
                            <i className="fas fa-map-marker-alt w-4 mr-2"></i>
                            <span className="truncate">{resource.address}</span>
                          </div>
                          <div className="flex items-center text-slate-400">
                            <i className="fas fa-phone w-4 mr-2"></i>
                            <span>{resource.phone}</span>
                          </div>
                          <div className="flex items-center text-slate-400">
                            <i className="fas fa-clock w-4 mr-2"></i>
                            <span>{resource.hours}</span>
                          </div>
                        </div>

                        {resource.services && resource.services.length > 0 && (
                          <div className="mt-4">
                            <div className="flex flex-wrap gap-1">
                              {resource.services.slice(0, 3).map((service, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {service}
                                </Badge>
                              ))}
                              {resource.services.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{resource.services.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resource Details Dialog */}
          {selectedResource && (
            <Dialog open={!!selectedResource} onOpenChange={() => setSelectedResource(null)}>
              <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-white flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <i className={`fas ${getResourceTypeIcon(selectedResource.category || '')} text-blue-400`}></i>
                    </div>
                    <span>{selectedResource.name}</span>
                    <Badge className={`${getStatusColor(selectedResource.status)} text-white ml-auto`}>
                      {selectedResource.status}
                    </Badge>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-white font-medium mb-2">Description</h4>
                    <p className="text-slate-300">{selectedResource.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-white font-medium mb-2">Contact Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-slate-300">
                          <i className="fas fa-map-marker-alt w-5 mr-2 text-slate-400"></i>
                          <span>{selectedResource.address}</span>
                        </div>
                        <div className="flex items-center text-slate-300">
                          <i className="fas fa-phone w-5 mr-2 text-slate-400"></i>
                          <span>{selectedResource.phone}</span>
                        </div>
                        {selectedResource.email && (
                          <div className="flex items-center text-slate-300">
                            <i className="fas fa-envelope w-5 mr-2 text-slate-400"></i>
                            <span>{selectedResource.email}</span>
                          </div>
                        )}
                        {selectedResource.website && (
                          <div className="flex items-center text-slate-300">
                            <i className="fas fa-globe w-5 mr-2 text-slate-400"></i>
                            <a href={selectedResource.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                              Visit Website
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-white font-medium mb-2">Hours</h4>
                      <p className="text-slate-300 text-sm">{selectedResource.hours}</p>
                    </div>
                  </div>

                  {selectedResource.services && selectedResource.services.length > 0 && (
                    <div>
                      <h4 className="text-white font-medium mb-2">Services Offered</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedResource.services.map((service, index) => (
                          <Badge key={index} variant="secondary">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3">
                    <Button variant="outline" onClick={() => setSelectedResource(null)} className="border-slate-600 text-slate-300">
                      Close
                    </Button>
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                      <i className="fas fa-directions mr-2"></i>Get Directions
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </main>
      </div>
    </div>
  );
}
