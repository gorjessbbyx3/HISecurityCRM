import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  shift?: string;
  location?: string;
}

export default function Staff() {
  const { data: onDutyStaff = [], isLoading } = useQuery({
    queryKey: ["/api/staff/on-duty"],
    queryFn: async () => {
      const response = await fetch("/api/staff/on-duty", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch on-duty staff');
      return response.json();
    },
    refetchInterval: 30000,
  });

  const { data: scheduleData } = useQuery({
    queryKey: ["/api/staff/schedule/today"],
    queryFn: async () => {
      const response = await fetch("/api/staff/schedule/today", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch today\'s schedule');
      return response.json();
    },
  });

  const { data: staffStats } = useQuery({
    queryKey: ["/api/staff/dashboard-stats"],
    queryFn: async () => {
      const response = await fetch("/api/staff/dashboard-stats", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch staff stats');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-users text-4xl text-gold-500 mb-4 animate-pulse"></i>
            <p className="text-white">Loading staff overview...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Staff Overview</h1>
          <div className="flex space-x-3">
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
              <i className="fas fa-calendar-alt mr-2"></i>
              View Schedule
            </Button>
            <Button className="bg-navy-700 hover:bg-navy-600 text-white">
              <i className="fas fa-user-plus mr-2"></i>
              Quick Check-in
            </Button>
          </div>
        </div>

        {/* Staff Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">On Duty Now</p>
                <p className="text-2xl font-bold text-white">{staffStats?.onDuty || onDutyStaff.length}</p>
              </div>
              <i className="fas fa-user-check text-green-500 text-2xl"></i>
            </div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Scheduled Today</p>
                <p className="text-2xl font-bold text-white">{staffStats?.scheduledToday || 0}</p>
              </div>
              <i className="fas fa-calendar-check text-blue-500 text-2xl"></i>
            </div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Available</p>
                <p className="text-2xl font-bold text-white">{staffStats?.available || 0}</p>
              </div>
              <i className="fas fa-user-clock text-yellow-500 text-2xl"></i>
            </div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Off Duty</p>
                <p className="text-2xl font-bold text-white">{staffStats?.offDuty || 0}</p>
              </div>
              <i className="fas fa-user-times text-red-500 text-2xl"></i>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* On-Duty Staff */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Currently On Duty</h2>
            <div className="space-y-4">
              {onDutyStaff.length === 0 ? (
                <div className="text-center py-8">
                  <i className="fas fa-user-clock text-4xl text-slate-600 mb-4"></i>
                  <p className="text-slate-400">No staff currently on duty</p>
                </div>
              ) : (
                onDutyStaff.map((staff: StaffMember) => (
                  <div key={staff.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                        <i className="fas fa-shield-alt text-white text-sm"></i>
                      </div>
                      <div>
                        <p className="text-white font-medium">{staff.firstName} {staff.lastName}</p>
                        <p className="text-sm text-slate-400">{staff.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {staff.location && (
                        <p className="text-sm text-slate-300">{staff.location}</p>
                      )}
                      <Badge className="bg-green-600 text-white">On Duty</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Today's Schedule */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Today's Schedule</h2>
            <div className="space-y-4">
              {!scheduleData || scheduleData.length === 0 ? (
                <div className="text-center py-8">
                  <i className="fas fa-calendar-times text-4xl text-slate-600 mb-4"></i>
                  <p className="text-slate-400">No schedule data available</p>
                </div>
              ) : (
                scheduleData.map((schedule: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{schedule.staffName}</p>
                      <p className="text-sm text-slate-400">{schedule.shift} • {schedule.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-300">{schedule.startTime} - {schedule.endTime}</p>
                      <Badge variant="outline" className="border-slate-600 text-slate-300">
                        {schedule.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 h-20">
              <div className="text-center">
                <i className="fas fa-clock text-2xl mb-2"></i>
                <p>Emergency Check-in</p>
              </div>
            </Button>
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 h-20">
              <div className="text-center">
                <i className="fas fa-route text-2xl mb-2"></i>
                <p>Assign Patrol</p>
              </div>
            </Button>
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 h-20">
              <div className="text-center">
                <i className="fas fa-phone text-2xl mb-2"></i>
                <p>Emergency Contact</p>
              </div>
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
}