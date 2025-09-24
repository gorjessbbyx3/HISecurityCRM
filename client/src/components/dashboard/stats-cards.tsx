import { useQuery } from "@tanstack/react-query";
import { DashboardStats } from "@shared/schema";
import { memo } from "react";

const StatsCards = memo(() => {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }
      return response.json();
    },
    staleTime: 15000,
    cacheTime: 60000,
  });

  // Component implementation would go here
  return null;
});

export default StatsCards;

const StatsCards = memo(() => {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    staleTime: 15000,
    cacheTime: 60000,
  });

  const statsData = [
    {
      title: "Active Patrols",
      value: stats?.activePatrols || 0,
      change: stats?.activePatrolsChange || "No change",
      changeType: stats?.activePatrolsChangeType || "neutral",
      icon: "fas fa-walking",
      iconColor: "text-green-400",
      iconBg: "bg-green-500/20",
    },
    {
      title: "Total Incidents",
      value: stats?.totalIncidents || 0,
      change: stats?.incidentsChange || "No data",
      changeType: stats?.incidentsChangeType || "neutral",
      icon: "fas fa-exclamation-triangle",
      iconColor: "text-red-400",
      iconBg: "bg-red-500/20",
    },
    {
      title: "Properties Secured",
      value: stats?.propertiesSecured || 0,
      change: stats?.propertiesChange || "Active monitoring",
      changeType: stats?.propertiesChangeType || "neutral",
      icon: "fas fa-building",
      iconColor: "text-blue-400",
      iconBg: "bg-blue-500/20",
    },
    {
      title: "Staff On Duty",
      value: stats?.staffOnDuty || 0,
      change: stats?.staffChange || "Current shift",
      changeType: stats?.staffChangeType || "neutral",
      icon: "fas fa-user-shield",
      iconColor: "text-gold-400",
      iconBg: "bg-gold-500/20",
    },
  ];

  // Mocking data if stats are not yet loaded to avoid errors in mapping
  const displayStats = isLoading ? Array(4).fill({ value: '...', trend: '', title: '', icon: '', color: '' }) : statsData;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {displayStats.map((stat, index) => (
        <div 
          key={index} 
          className="bg-slate-800 border border-slate-600 rounded-xl p-6 hover:bg-slate-700 hover:shadow-xl transition-all duration-300 group"
          data-testid={`card-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <div className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-400/20 to-amber-600/20 rounded-bl-full opacity-50"></div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-2 uppercase tracking-wide">
                  {stat.title}
                </p>
                <p 
                  className="text-3xl font-bold text-white mb-1 group-hover:text-amber-400 transition-all duration-300"
                  data-testid={`text-${stat.title.toLowerCase().replace(/\s+/g, '-')}-value`}
                >
                  {isLoading ? "..." : stat.value}
                </p>
                <div className="flex items-center space-x-2">
                  <p 
                    className={`text-sm font-semibold px-2 py-1 rounded-full ${
                      stat.changeType === "positive" 
                        ? "bg-green-500/20 text-green-400" 
                        : stat.changeType === "negative"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-slate-500/20 text-slate-400"
                    }`}
                  >
                    <i className={`fas ${
                      stat.changeType === "positive" 
                        ? "fa-arrow-up" 
                        : stat.changeType === "negative"
                        ? "fa-arrow-down"
                        : "fa-shield-alt"
                    } mr-1`}></i>
                    {stat.change}
                  </p>
                  <span className="text-xs text-slate-500">vs last period</span>
                </div>
              </div>
              <div className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <i className={`${stat.icon} ${stat.iconColor} text-xl`}></i>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

StatsCards.displayName = 'StatsCards';

export default StatsCards;