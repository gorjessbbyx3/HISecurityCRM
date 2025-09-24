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

  if (isLoading) {
    return <div className="animate-pulse">Loading stats...</div>;
  }

  if (!stats) {
    return <div>No stats available</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Stats cards implementation */}
      <div className="bg-card p-4 rounded-lg">
        <h3 className="text-lg font-semibold">Total Properties</h3>
        <p className="text-2xl font-bold">{stats.activeProperties}</p>
      </div>
      <div className="bg-card p-4 rounded-lg">
        <h3 className="text-lg font-semibold">Active Patrols</h3>
        <p className="text-2xl font-bold">{stats.activePatrols}</p>
      </div>
      <div className="bg-card p-4 rounded-lg">
        <h3 className="text-lg font-semibold">On Duty Staff</h3>
        <p className="text-2xl font-bold">{stats.onDutyStaff}</p>
      </div>
      <div className="bg-card p-4 rounded-lg">
        <h3 className="text-lg font-semibold">Open Incidents</h3>
        <p className="text-2xl font-bold">{stats.openIncidents}</p>
      </div>
    </div>
  );
});

export default StatsCards;