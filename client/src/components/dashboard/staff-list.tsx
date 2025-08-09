import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function StaffList() {
  const { data: activeStaff = [], isLoading } = useQuery({
    queryKey: ["/api/staff/active"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "on_break": return "bg-yellow-500";
      case "off_duty": return "bg-red-500";
      default: return "bg-slate-500";
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg" data-testid="staff-list-title">
            Staff On Duty
          </CardTitle>
          <Button 
            size="sm" 
            variant="ghost" 
            className="text-slate-400 hover:text-white"
            data-testid="view-all-staff-button"
          >
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-3 animate-pulse">
                <div className="w-10 h-10 bg-slate-600 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-600 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-slate-600 rounded w-1/2"></div>
                </div>
                <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
              </div>
            ))
          ) : activeStaff.length === 0 ? (
            <div className="text-center py-4">
              <i className="fas fa-user-slash text-slate-400 text-xl mb-2"></i>
              <p className="text-slate-400 text-sm">No staff currently on duty</p>
            </div>
          ) : (
            activeStaff.slice(0, 6).map((member: any) => (
              <div 
                key={member.id} 
                className="flex items-center justify-between hover:bg-slate-700 p-2 rounded-lg transition-colors"
                data-testid={`staff-member-${member.id}`}
              >
                <div className="flex items-center space-x-3">
                  {member.profileImageUrl ? (
                    <img 
                      src={member.profileImageUrl}
                      alt={`${member.firstName} ${member.lastName}`}
                      className="w-10 h-10 rounded-full object-cover border border-slate-600"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-navy-700 flex items-center justify-center border border-slate-600">
                      <i className="fas fa-user text-gold-500 text-sm"></i>
                    </div>
                  )}
                  <div>
                    <p className="text-white text-sm font-medium">
                      {member.firstName && member.lastName 
                        ? `${member.firstName} ${member.lastName}`
                        : member.email?.split('@')[0] || "Officer"
                      }
                    </p>
                    <p className="text-slate-400 text-xs">
                      {member.zone ? `Zone ${member.zone}` : "Central"} • {member.shift || "Day Shift"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div 
                    className={`w-2 h-2 rounded-full ${getStatusColor(member.status)}`}
                    title={member.status}
                  ></div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-slate-400 hover:text-white p-1"
                    data-testid={`contact-staff-${member.id}`}
                  >
                    <i className="fas fa-phone text-xs"></i>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {activeStaff.length > 6 && (
          <Button 
            variant="ghost"
            className="w-full mt-4 text-slate-400 hover:text-white text-sm"
            data-testid="view-more-staff"
          >
            View {activeStaff.length - 6} more staff members →
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
