import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Camera, MapPin, Clock } from "lucide-react";

interface PatrolReport {
  id: string;
  officerId: string;
  summary: string;
  status: string;
  startTime: string;
  shiftType: string;
  checkpoints?: any;
  photos?: any;
}

export default function PatrolReportsWidget() {
  const { data: reports, isLoading } = useQuery<PatrolReport[]>({
    queryKey: ["/api/patrol-reports"],
  });

  const recentReports = reports?.slice(0, 2) || [];

  return (
    <div className="security-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white" data-testid="text-patrol-reports-title">
          Daily Patrol Reports
        </h3>
        <Button 
          className="btn-primary-security text-sm font-medium" 
          data-testid="button-new-patrol-report"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Report
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="border border-slate-600 rounded-lg p-4 animate-pulse">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-slate-600 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-600 rounded mb-2"></div>
                    <div className="h-3 bg-slate-600 rounded w-2/3"></div>
                  </div>
                </div>
                <div className="h-12 bg-slate-600 rounded mb-3"></div>
                <div className="flex space-x-4">
                  <div className="h-3 bg-slate-600 rounded w-16"></div>
                  <div className="h-3 bg-slate-600 rounded w-20"></div>
                  <div className="h-3 bg-slate-600 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : recentReports.length === 0 ? (
          <div className="border border-slate-600 rounded-lg p-4 text-center">
            <p className="text-slate-400 text-sm" data-testid="text-no-patrol-reports">
              No patrol reports available
            </p>
          </div>
        ) : (
          recentReports.map((report, index) => (
            <div key={report.id} className="border border-slate-600 rounded-lg p-4" data-testid={`patrol-report-${index}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src="" alt="Officer" />
                    <AvatarFallback className="bg-blue-600 text-white">
                      {report.officerId?.slice(0, 2).toUpperCase() || 'OF'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white font-medium text-sm" data-testid={`text-officer-name-${index}`}>
                      Officer {report.officerId?.slice(0, 8) || 'Unknown'}
                    </p>
                    <p className="text-slate-400 text-xs" data-testid={`text-shift-type-${index}`}>
                      {report.shiftType?.charAt(0).toUpperCase() + report.shiftType?.slice(1) || 'N/A'} Shift
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-xs" data-testid={`text-report-time-${index}`}>
                    {new Date(report.startTime).toLocaleDateString()}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    report.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    report.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`} data-testid={`text-report-status-${index}`}>
                    {report.status === 'completed' ? 'Complete' :
                     report.status === 'in_progress' ? 'In Progress' : 'Unknown'}
                  </span>
                </div>
              </div>
              <p className="text-slate-300 text-sm mb-3" data-testid={`text-report-summary-${index}`}>
                {report.summary || 'No summary available'}
              </p>
              <div className="flex items-center space-x-4 text-xs text-slate-400">
                <span data-testid={`text-photos-count-${index}`}>
                  <Camera className="inline w-3 h-3 mr-1" />
                  {report.photos ? JSON.parse(report.photos).length : 0} Photos
                </span>
                <span data-testid={`text-checkpoints-count-${index}`}>
                  <MapPin className="inline w-3 h-3 mr-1" />
                  {report.checkpoints ? JSON.parse(report.checkpoints).length : 0} Checkpoints
                </span>
                <span data-testid={`text-duration-${index}`}>
                  <Clock className="inline w-3 h-3 mr-1" />
                  {report.status === 'completed' ? '2.5 Hours' : 'Ongoing'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
