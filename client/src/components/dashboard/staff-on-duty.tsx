import { useQuery } from "@tanstack/react-query";

export default function StaffOnDuty() {
  const { data: staff = [], isLoading } = useQuery({
    queryKey: ["/api/staff/active"],
  });

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4" data-testid="text-staff-on-duty-title">
        Staff On Duty
      </h3>
      
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-4">
            <i className="fas fa-spinner fa-spin text-slate-400"></i>
            <p className="text-slate-400 text-sm mt-2">Loading staff...</p>
          </div>
        ) : staff.length === 0 ? (
          <div className="text-center py-4">
            <i className="fas fa-user-slash text-slate-400 text-xl mb-2"></i>
            <p className="text-slate-400 text-sm">No staff currently on duty</p>
          </div>
        ) : (
          staff.slice(0, 4).map((member: any) => (
            <div key={member.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {member.profileImageUrl ? (
                  <img 
                    src={member.profileImageUrl}
                    alt={`${member.firstName} ${member.lastName}`}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-navy-700 flex items-center justify-center">
                    <i className="fas fa-user text-gold-500 text-sm"></i>
                  </div>
                )}
                <div>
                  <p className="text-white text-sm font-medium">
                    {member.firstName && member.lastName 
                      ? `${member.firstName.charAt(0)}. ${member.lastName}`
                      : member.email?.split('@')[0] || "Officer"
                    }
                  </p>
                  <p className="text-slate-400 text-xs">
                    {member.zone || "Central"}
                  </p>
                </div>
              </div>
              <div className={`w-2 h-2 rounded-full ${
                member.status === "active" ? "bg-green-500" : "bg-yellow-500"
              }`}></div>
            </div>
          ))
        )}
      </div>
      
      <button 
        className="w-full mt-4 text-center text-sm text-slate-400 hover:text-white transition-colors"
        data-testid="button-view-all-staff"
      >
        View All Staff →
      </button>
    </div>
  );
}
