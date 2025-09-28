import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertIncidentSchema, insertPatrolReportSchema } from "@shared/schema";

export default function QuickActions() {
  const { toast } = useToast();
  const router = useRouter();

  const emergencyMutation = useMutation({
    mutationFn: async () => {
      const incidentData = insertIncidentSchema.parse({
        incidentType: "emergency",
        severity: "critical",
        description: "Emergency alert triggered from dashboard",
        status: "open",
        occuredAt: new Date(),
      });
      return await apiRequest("/api/incidents", {
        method: "POST",
        body: JSON.stringify(incidentData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      toast({
        title: "Emergency Alert Sent",
        description: "Emergency incident has been reported and authorities notified.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send emergency alert. Please try again.",
        variant: "destructive",
      });
    },
  });

  const patrolMutation = useMutation({
    mutationFn: async () => {
      const patrolData = insertPatrolReportSchema.parse({
        shiftType: "emergency",
        startTime: new Date(),
        summary: "Emergency patrol scheduled from dashboard",
        status: "in_progress",
      });
      return await apiRequest("/api/patrol-reports", {
        method: "POST",
        body: JSON.stringify(patrolData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patrol-reports"] });
      toast({
        title: "Patrol Scheduled",
        description: "Emergency patrol has been scheduled and dispatched.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to schedule patrol. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAction = (action: string) => {
    switch (action) {
      case "emergency-alert":
        emergencyMutation.mutate();
        break;
      case "log-incident":
        router.push("/crime-intelligence");
        break;
      case "schedule-patrol":
        patrolMutation.mutate();
        break;
      case "generate-report":
        generateReport();
        break;
      default:
        console.log(`Unknown action: ${action}`);
    }
  };

  const generateReport = async () => {
    try {
      const response = await apiRequest("/api/incidents");
      const incidents = response;

      // Generate CSV content
      const csvHeaders = ["ID", "Type", "Severity", "Location", "Status", "Date"];
      const csvRows = incidents.map((incident: any) => [
        incident.id,
        incident.incidentType,
        incident.severity,
        incident.location || "N/A",
        incident.status,
        new Date(incident.createdAt).toLocaleDateString(),
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map((field: string) => `"${field}"`).join(","))
        .join("\n");

      // Download CSV
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `incident-report-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Report Generated",
        description: "Incident report has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4" data-testid="text-quick-actions-title">
        Quick Actions
      </h3>

      <div className="space-y-2">
        <Button
          onClick={() => handleAction("emergency-alert")}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
          data-testid="button-emergency-alert"
        >
          <i className="fas fa-exclamation-triangle mr-2"></i>Emergency Alert
        </Button>

        <Button
          onClick={() => handleAction("log-incident")}
          className="w-full bg-navy-700 hover:bg-navy-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
          data-testid="button-log-incident"
        >
          <i className="fas fa-plus mr-2"></i>Log Incident
        </Button>

        <Button
          onClick={() => handleAction("schedule-patrol")}
          className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
          data-testid="button-schedule-patrol"
        >
          <i className="fas fa-route mr-2"></i>Schedule Patrol
        </Button>

        <Button
          onClick={() => handleAction("generate-report")}
          className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
          data-testid="button-generate-report"
        >
          <i className="fas fa-file-alt mr-2"></i>Generate Report
        </Button>
      </div>
    </div>
  );
}
