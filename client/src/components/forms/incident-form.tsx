import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const incidentSchema = z.object({
  propertyId: z.string().optional(),
  type: z.string().min(1, "Incident type is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  coordinates: z.string().optional(),
  priority: z.string().default("medium"),
  status: z.string().default("open"),
  photos: z.array(z.string()).default([]),
  evidence: z.string().optional(),
  policeNotified: z.boolean().default(false),
  policeReportNumber: z.string().optional(),
});

type IncidentFormData = z.infer<typeof incidentSchema>;

interface IncidentFormProps {
  initialData?: any;
  onSaved?: () => void;
  onCancel?: () => void;
}

export default function IncidentForm({ initialData, onSaved, onCancel }: IncidentFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [photoUrls, setPhotoUrls] = useState<string[]>(initialData?.photos || []);

  const form = useForm<IncidentFormData>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      propertyId: initialData?.propertyId || "",
      type: initialData?.type || "",
      description: initialData?.description || "",
      location: initialData?.location || "",
      coordinates: initialData?.coordinates || "",
      priority: initialData?.priority || "medium",
      status: initialData?.status || "open",
      photos: initialData?.photos || [],
      evidence: initialData?.evidence || "",
      policeNotified: initialData?.policeNotified || false,
      policeReportNumber: initialData?.policeReportNumber || "",
    },
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
  });

  const createIncidentMutation = useMutation({
    mutationFn: async (data: IncidentFormData) => {
      const formattedData = {
        ...data,
        photos: photoUrls,
      };
      await apiRequest("POST", "/api/incidents", formattedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      toast({
        title: "Success",
        description: "Incident report created successfully",
      });
      onSaved?.();
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
        description: "Failed to create incident report",
        variant: "destructive",
      });
    },
  });

  const updateIncidentMutation = useMutation({
    mutationFn: async (data: IncidentFormData) => {
      const formattedData = {
        ...data,
        photos: photoUrls,
      };
      await apiRequest("PUT", `/api/incidents/${initialData.id}`, formattedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      toast({
        title: "Success",
        description: "Incident report updated successfully",
      });
      onSaved?.();
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
        description: "Failed to update incident report",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: IncidentFormData) => {
    if (initialData) {
      updateIncidentMutation.mutate(data);
    } else {
      createIncidentMutation.mutate(data);
    }
  };

  const addPhotoUrl = () => {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter image URL...';
    input.className = 'w-full p-2 border rounded bg-slate-700 border-slate-600 text-white';
    
    const dialog = document.createElement('div');
    dialog.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    dialog.innerHTML = `
      <div class="bg-slate-800 p-6 rounded-lg border border-slate-700 max-w-md w-full mx-4">
        <h3 class="text-white font-semibold mb-4">Add Photo URL</h3>
        <div class="mb-4"></div>
        <div class="flex space-x-3">
          <button class="add-btn bg-gold-500 hover:bg-gold-600 text-black px-4 py-2 rounded font-medium">Add</button>
          <button class="cancel-btn bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded">Cancel</button>
        </div>
      </div>
    `;
    
    dialog.querySelector('.mb-4')?.appendChild(input);
    
    dialog.querySelector('.add-btn')?.addEventListener('click', () => {
      if (input.value.trim()) {
        setPhotoUrls(prev => [...prev, input.value.trim()]);
      }
      document.body.removeChild(dialog);
    });
    
    dialog.querySelector('.cancel-btn')?.addEventListener('click', () => {
      document.body.removeChild(dialog);
    });
    
    document.body.appendChild(dialog);
    input.focus();
  };

  const removePhoto = (index: number) => {
    setPhotoUrls(prev => prev.filter((_, i) => i !== index));
  };

  const incidentTypes = [
    "Trespassing",
    "Vandalism", 
    "Theft",
    "Suspicious Activity",
    "Disturbance",
    "Medical Emergency",
    "Fire/Safety",
    "Vehicle Issue",
    "Property Damage",
    "Other"
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Incident Type *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white" data-testid="select-incident-type">
                      <SelectValue placeholder="Select incident type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {incidentTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Priority Level</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white" data-testid="select-priority">
                      <SelectValue placeholder="Select priority" />
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

          <FormField
            control={form.control}
            name="propertyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Property (Optional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white" data-testid="select-property">
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="">No specific property</SelectItem>
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
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white" data-testid="select-status">
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
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Location *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Specific location of incident..." className="bg-slate-700 border-slate-600 text-white" data-testid="input-location" />
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
              <FormLabel className="text-white">GPS Coordinates (Optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="21.3099, -157.8581" className="bg-slate-700 border-slate-600 text-white" data-testid="input-coordinates" />
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
              <FormLabel className="text-white">Description *</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Detailed description of the incident..." className="bg-slate-700 border-slate-600 text-white min-h-[100px]" data-testid="input-description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="evidence"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Evidence Notes</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Description of physical evidence, witness statements, etc..." className="bg-slate-700 border-slate-600 text-white" data-testid="input-evidence" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Photos Section */}
        <div>
          <FormLabel className="text-white">Photos</FormLabel>
          <div className="mt-2">
            {photoUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {photoUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={url} 
                      alt={`Evidence ${index + 1}`} 
                      className="w-full h-24 object-cover rounded-lg border border-slate-600"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={addPhotoUrl}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
              data-testid="add-photo-button"
            >
              <i className="fas fa-camera mr-2"></i>Add Photo URL
            </Button>
          </div>
        </div>

        {/* Police Notification */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="policeNotified"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="border-slate-600 data-[state=checked]:bg-gold-500 data-[state=checked]:border-gold-500"
                    data-testid="checkbox-police-notified"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-white">
                    Police Notified
                  </FormLabel>
                  <p className="text-sm text-slate-400">
                    Check if law enforcement has been contacted about this incident
                  </p>
                </div>
              </FormItem>
            )}
          />

          {form.watch("policeNotified") && (
            <FormField
              control={form.control}
              name="policeReportNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Police Report Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Police report reference number..." className="bg-slate-700 border-slate-600 text-white" data-testid="input-police-report" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-slate-600">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
            data-testid="button-cancel-incident"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createIncidentMutation.isPending || updateIncidentMutation.isPending}
            className="bg-gold-500 hover:bg-gold-600 text-black"
            data-testid="button-save-incident"
          >
            {createIncidentMutation.isPending || updateIncidentMutation.isPending ? (
              <i className="fas fa-spinner fa-spin mr-2"></i>
            ) : (
              <i className="fas fa-save mr-2"></i>
            )}
            {initialData ? "Update Incident" : "Create Incident"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
