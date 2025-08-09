import { useQuery } from "@tanstack/react-query";

export default function StatsCards() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const statsData = [
    {
      title: "Active Patrols",
      value: stats?.activePatrols || 0,
      change: "+2 from yesterday",
      changeType: "positive",
      icon: "fas fa-walking",
      iconColor: "text-green-400",
      iconBg: "bg-green-500/20",
    },
    {
      title: "Crime Incidents",
      value: stats?.crimeIncidents || 0,
      change: "-3 from last week",
      changeType: "positive",
      icon: "fas fa-exclamation-triangle",
      iconColor: "text-red-400",
      iconBg: "bg-red-500/20",
    },
    {
      title: "Properties Secured",
      value: stats?.propertiesSecured || 0,
      change: "100% compliance",
      changeType: "neutral",
      icon: "fas fa-building",
      iconColor: "text-blue-400",
      iconBg: "bg-blue-500/20",
    },
    {
      title: "Staff On Duty",
      value: stats?.staffOnDuty || 0,
      change: "Next shift in 4h",
      changeType: "neutral",
      icon: "fas fa-user-shield",
      iconColor: "text-gold-400",
      iconBg: "bg-gold-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => (
        <div 
          key={index} 
          className="bg-slate-800 border border-slate-700 rounded-xl p-6"
          data-testid={`card-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">{stat.title}</p>
              <p 
                className="text-2xl font-bold text-white mt-1"
                data-testid={`text-${stat.title.toLowerCase().replace(/\s+/g, '-')}-value`}
              >
                {isLoading ? "..." : stat.value}
              </p>
              <p 
                className={`text-xs mt-2 ${
                  stat.changeType === "positive" 
                    ? "text-green-400" 
                    : stat.changeType === "negative"
                    ? "text-red-400"
                    : "text-blue-400"
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
            </div>
            <div className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
              <i className={`${stat.icon} ${stat.iconColor} text-lg`}></i>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
