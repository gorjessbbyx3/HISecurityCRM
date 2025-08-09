import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

export default function PatrolReports() {
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["/api/patrol-reports/recent"],
  });

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white" data-testid="text-patrol-reports-title">
          Daily Patrol Reports
        </h3>
        <Button
          className="bg-navy-700 hover:bg-navy-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          data-testid="button-create-patrol-report"
        >
          <i className="fas fa-plus mr-2"></i>New Report
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <i className="fas fa-spinner fa-spin text-slate-400 text-2xl mb-2"></i>
            <p className="text-slate-400">Loading patrol reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-8">
            <i className="fas fa-file-alt text-slate-400 text-2xl mb-2"></i>
            <p className="text-slate-400">No patrol reports available</p>
            <p className="text-slate-500 text-sm">Create your first patrol report to get started</p>
          </div>
        ) : (
          reports.slice(0, 3).map((report: any) => (
            <div key={report.id} className="border border-slate-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-navy-700 flex items-center justify-center">
                    <i className="fas fa-user text-gold-500"></i>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">
                      {report.officer?.firstName || "Officer"} {report.officer?.lastName || ""}
                    </p>
                    <p className="text-slate-400 text-xs">
                      {report.officer?.shift || "Day Shift"} - {report.property?.name || "Zone A"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-xs">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    report.status === "complete" 
                      ? "bg-green-500/20 text-green-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}>
                    {report.status === "complete" ? "Complete" : "In Progress"}
                  </span>
                </div>
              </div>
              <p className="text-slate-300 text-sm mb-3">
                {report.summary || "Patrol report in progress..."}
              </p>
              <div className="flex items-center space-x-4 text-xs text-slate-400">
                <span>
                  <i className="fas fa-camera mr-1"></i>
                  {Array.isArray(report.photos) ? report.photos.length : 0} Photos
                </span>
                <span>
                  <i className="fas fa-map-marker-alt mr-1"></i>
                  {Array.isArray(report.checkpointsVisited) ? report.checkpointsVisited.length : 0} Checkpoints
                </span>
                <span>
                  <i className="fas fa-clock mr-1"></i>
                  {report.endTime && report.startTime 
                    ? `${Math.round((new Date(report.endTime).getTime() - new Date(report.startTime).getTime()) / (1000 * 60 * 60 * 100)) / 10} Hours`
                    : "In Progress"
                  }
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
