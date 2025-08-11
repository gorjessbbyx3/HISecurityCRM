
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ScheduleEntry {
  id: string;
  staffName: string;
  shift: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
}

export default function Scheduling() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: schedules = [], isLoading, error } = useQuery({
    queryKey: ["/api/schedules", selectedDate],
    queryFn: async () => {
      const response = await fetch(`/api/schedules?date=${selectedDate}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch schedules');
      return response.json();
    },
  });

  const { data: scheduleStats } = useQuery({
    queryKey: ["/api/schedules/stats"],
    queryFn: async () => {
      const response = await fetch("/api/schedules/stats", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch schedule stats');
      return response.json();
    },
  });

  const { data: staffAvailability = [] } = useQuery({
    queryKey: ["/api/staff/availability"],
    queryFn: async () => {
      const response = await fetch("/api/staff/availability", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch staff availability');
      return response.json();
    },
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled": return "bg-blue-600 text-white";
      case "confirmed": return "bg-green-600 text-white";
      case "pending": return "bg-yellow-600 text-white";
      case "cancelled": return "bg-red-600 text-white";
      default: return "bg-gray-600 text-white";
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-calendar-alt text-4xl text-gold-500 mb-4 animate-pulse"></i>
            <p className="text-white">Loading schedules...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6">
          <div className="text-center text-red-400">
            <i className="fas fa-exclamation-triangle text-4xl mb-4"></i>
            <p>Error loading schedule data. Please try again.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Staff Scheduling</h1>
          <div className="flex space-x-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white rounded px-3 py-2"
            />
            <Button className="bg-navy-700 hover:bg-navy-600 text-white">
              <i className="fas fa-plus mr-2"></i>
              New Schedule
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Scheduled Today</p>
                <p className="text-2xl font-bold text-white">{scheduleStats?.scheduledToday || schedules.length}</p>
              </div>
              <i className="fas fa-calendar-check text-blue-500 text-2xl"></i>
            </div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Available Staff</p>
                <p className="text-2xl font-bold text-white">{scheduleStats?.availableStaff || staffAvailability.length}</p>
              </div>
              <i className="fas fa-users text-green-500 text-2xl"></i>
            </div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Open Shifts</p>
                <p className="text-2xl font-bold text-white">{scheduleStats?.openShifts || 0}</p>
              </div>
              <i className="fas fa-exclamation-triangle text-yellow-500 text-2xl"></i>
            </div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Coverage %</p>
                <p className="text-2xl font-bold text-white">{scheduleStats?.coveragePercentage || "0"}%</p>
              </div>
              <i className="fas fa-chart-pie text-purple-500 text-2xl"></i>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Schedule for {new Date(selectedDate).toLocaleDateString()}
              </h2>
              <div className="space-y-4">
                {schedules.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="fas fa-calendar-times text-4xl text-slate-600 mb-4"></i>
                    <p className="text-slate-400">No schedules found for this date</p>
                  </div>
                ) : (
                  schedules.map((schedule: ScheduleEntry) => (
                    <div key={schedule.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-navy-700 rounded-full flex items-center justify-center">
                          <i className="fas fa-user-clock text-gold-500"></i>
                        </div>
                        <div>
                          <p className="font-medium text-white">{schedule.staffName}</p>
                          <p className="text-sm text-slate-400">{schedule.location}</p>
                          <p className="text-sm text-slate-400">{schedule.startTime} - {schedule.endTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="border-slate-600 text-slate-300">
                          {schedule.shift}
                        </Badge>
                        <Badge className={getStatusColor(schedule.status)}>
                          {schedule.status}
                        </Badge>
                        <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-600">
                          <i className="fas fa-edit mr-2"></i>
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Staff Availability</h2>
            <div className="space-y-3">
              {staffAvailability.length === 0 ? (
                <div className="text-center py-8">
                  <i className="fas fa-user-times text-4xl text-slate-600 mb-4"></i>
                  <p className="text-slate-400">No availability data</p>
                </div>
              ) : (
                staffAvailability.map((staff: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{staff.name}</p>
                      <p className="text-sm text-slate-400">{staff.role}</p>
                    </div>
                    <Badge className={staff.available ? "bg-green-600 text-white" : "bg-red-600 text-white"}>
                      {staff.available ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
