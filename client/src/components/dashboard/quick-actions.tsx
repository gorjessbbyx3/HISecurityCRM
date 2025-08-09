import { Button } from "@/components/ui/button";

export default function QuickActions() {
  const handleAction = (action: string) => {
    console.log(`Action triggered: ${action}`);
    // TODO: Implement actual functionality
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
