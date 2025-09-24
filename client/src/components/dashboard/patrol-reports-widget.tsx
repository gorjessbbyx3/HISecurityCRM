import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Camera, MapPin, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface PatrolReport {
  id: string;
  officerName: string;
  location: string;
  status: string;
  timestamp: string;
  description: string;
}

const PatrolReportsWidget = () => {
  const { data: reports, isLoading } = useQuery({
    queryKey: ["/api/patrol-reports"],
    queryFn: async () => {
      const response = await fetch("/api/patrol-reports");
      if (!response.ok) {
        throw new Error("Failed to fetch patrol reports");
      }
      return response.json();
    },
    staleTime: 15000,
    cacheTime: 60000,
  });

  if (isLoading) {
    return <div className="animate-pulse">Loading patrol reports...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recent Patrol Reports</h3>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Report
        </Button>
      </div>

      <div className="space-y-3">
        {reports?.map((report: PatrolReport) => (
          <div key={report.id} className="bg-card p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback>{report.officerName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{report.officerName}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    report.status === 'completed' ? 'bg-green-100 text-green-800' :
                    report.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {report.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{report.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {report.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {report.timestamp}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )) || (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No patrol reports found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatrolReportsWidget;