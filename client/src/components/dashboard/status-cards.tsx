import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";

export default function StatusCards() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const statusData = [
    {
      title: "Active Patrols",
      value: stats?.activePatrols || 0,
      change: stats?.activePatrolsChange || "Current status",
      changeType: (stats?.activePatrolsChangeType || "neutral") as const,
      icon: "fas fa-walking",
      iconColor: "text-green-400",
      iconBg: "bg-green-500/20",
      description: "Officers currently on patrol"
    },
    {
      title: "Recent Incidents",
      value: stats?.totalIncidents || 0,
      change: stats?.incidentsChange || "No recent data",
      changeType: (stats?.incidentsChangeType || "neutral") as const,
      icon: "fas fa-exclamation-triangle",
      iconColor: "text-red-400",
      iconBg: "bg-red-500/20",
      description: "Security incidents tracked"
    },
    {
      title: "Properties Secured",
      value: stats?.propertiesSecured || 0,
      change: stats?.propertiesChange || "Active monitoring",
      changeType: (stats?.propertiesChangeType || "neutral") as const,
      icon: "fas fa-building",
      iconColor: "text-blue-400",
      iconBg: "bg-blue-500/20",
      description: "Properties under protection"
    },
    {
      title: "Staff Available",
      value: stats?.staffOnDuty || 0,
      change: stats?.staffChange || "Current shift",
      changeType: (stats?.staffChangeType || "neutral") as const,
      icon: "fas fa-user-shield",
      iconColor: "text-gold-400",
      iconBg: "bg-gold-500/20",
      description: "Security officers on duty"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statusData.map((item, index) => (
        <Card 
          key={index} 
          className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors"
          data-testid={`status-card-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-slate-400 text-sm font-medium mb-1">{item.title}</p>
                <p 
                  className="text-2xl font-bold text-white"
                  data-testid={`status-value-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {isLoading ? "..." : item.value}
                </p>
                <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                <p 
                  className={`text-xs mt-2 flex items-center ${
                    item.changeType === "positive" 
                      ? "text-green-400" 
                      : item.changeType === "negative"
                      ? "text-red-400"
                      : "text-blue-400"
                  }`}
                >
                  <i className={`fas ${
                    item.changeType === "positive" 
                      ? "fa-arrow-up" 
                      : item.changeType === "negative"
                      ? "fa-arrow-down"
                      : "fa-shield-alt"
                  } mr-1`}></i>
                  {item.change}
                </p>
              </div>
              <div className={`w-12 h-12 ${item.iconBg} rounded-lg flex items-center justify-center ml-4`}>
                <i className={`${item.icon} ${item.iconColor} text-lg`}></i>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
