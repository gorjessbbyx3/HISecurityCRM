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

const patrolReportSchema = z.object({
  officerId: z.string().optional(),
  propertyId: z.string().min(1, "Property is required"),
  shiftType: z.string().min(1, "Shift type is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().optional(),
  checkpoints: z.string().optional(),
  incidentsReported: z.number().default(0),
  summary: z.string().min(10, "Summary must be at least 10 characters"),
  photoUrls: z.string().optional(),
  weatherConditions: z.string().optional(),
  vehicleUsed: z.string().optional(),
  mileage: z.number().optional(),
  status: z.string().default("in_progress"),
});

type PatrolReportFormData = z.infer<typeof patrolReportSchema>;

interface PatrolReportFormProps {
  onSuccess?: () => void;
  properties?: any[];
  currentUserId?: string;
}

export default function PatrolReportForm({ onSuccess, properties = [], currentUserId }: PatrolReportFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<PatrolReportFormData>({
    resolver: zodResolver(patrolReportSchema),
    defaultValues: {
      officerId: currentUserId || "",
      propertyId: "",
      shiftType: "",
      startTime: new Date().toISOString().slice(0, 16),
      endTime: "",
      checkpoints: "",
      incidentsReported: 0,
      summary: "",
      photoUrls: "",
      weatherConditions: "",
      vehicleUsed: "",
      mileage: 0,
      status: "in_progress",
    },
  });

  const createPatrolReportMutation = useMutation({
    mutationFn: async (data: PatrolReportFormData) => {
      const formattedData = {
        ...data,
        officerId: currentUserId,
        checkpoints: data.checkpoints ? data.checkpoints.split(',').map(c => c.trim()) : [],
        photoUrls: data.photoUrls ? data.photoUrls.split(',').map(p => p.trim()) : [],
        mileage: Number(data.mileage) || 0,
      };
      await apiRequest("/api/patrol-reports", {
        method: "POST",
        body: JSON.stringify(formattedData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patrol-reports"] });
      toast({
        title: "Success",
        description: "Patrol report created successfully",
      });
      form.reset();
      onSuccess?.();
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

  const onSubmit = (data: PatrolReportFormData) => {
    createPatrolReportMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="propertyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-300">Property *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
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

          <FormField
            control={form.control}
            name="shiftType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-300">Shift Type *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white" data-testid="select-shift-type">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-300">Start Time *</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                    className="bg-slate-700 border-slate-600 text-white"
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
                <FormLabel className="text-slate-300">End Time</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                    className="bg-slate-700 border-slate-600 text-white"
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
              <FormLabel className="text-slate-300">Summary *</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Describe patrol activities, observations, and any incidents..."
                  className="bg-slate-700 border-slate-600 text-white min-h-[120px]"
                  data-testid="textarea-summary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="weatherConditions"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-300">Weather Conditions</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g., Clear, Rainy, Windy"
                    className="bg-slate-700 border-slate-600 text-white"
                    data-testid="input-weather"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vehicleUsed"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-300">Vehicle Used</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Vehicle ID or license plate"
                    className="bg-slate-700 border-slate-600 text-white"
                    data-testid="input-vehicle"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="incidentsReported"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-300">Incidents Reported</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    className="bg-slate-700 border-slate-600 text-white"
                    data-testid="input-incidents"
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
                <FormLabel className="text-slate-300">Mileage</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    placeholder="Miles driven"
                    className="bg-slate-700 border-slate-600 text-white"
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
          name="checkpoints"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-300">Checkpoints (comma-separated)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g., Main Entrance, Parking Lot, Loading Dock"
                  className="bg-slate-700 border-slate-600 text-white"
                  data-testid="input-checkpoints"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="photoUrls"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-300">Photo URLs (comma-separated)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="https://example.com/photo1.jpg, https://example.com/photo2.jpg"
                  className="bg-slate-700 border-slate-600 text-white"
                  data-testid="input-photo-urls"
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
              <FormLabel className="text-slate-300">Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white" data-testid="select-status">
                    <SelectValue />
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

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="submit"
            className="bg-gold-500 hover:bg-gold-600 text-black px-6"
            disabled={createPatrolReportMutation.isPending}
            data-testid="button-submit-patrol-report"
          >
            {createPatrolReportMutation.isPending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Creating...
              </>
            ) : (
              <>
                <i className="fas fa-check mr-2"></i>
                Create Patrol Report
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
