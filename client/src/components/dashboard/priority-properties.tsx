import { useQuery } from "@tanstack/react-query";

export default function PriorityProperties() {
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["/api/properties"],
  });

  const priorityProperties = properties
    .filter((property: any) => property.riskLevel === "high" || property.status === "active")
    .slice(0, 3);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white" data-testid="text-priority-properties-title">
          Priority Properties
        </h3>
        <button 
          className="text-slate-400 hover:text-white transition-colors"
          data-testid="button-view-all-properties"
        >
          <i className="fas fa-external-link-alt text-xs"></i>
        </button>
      </div>
      
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-4">
            <i className="fas fa-spinner fa-spin text-slate-400"></i>
            <p className="text-slate-400 text-sm mt-2">Loading properties...</p>
          </div>
        ) : priorityProperties.length === 0 ? (
          <div className="text-center py-4">
            <i className="fas fa-building text-slate-400 text-xl mb-2"></i>
            <p className="text-slate-400 text-sm">No priority properties</p>
          </div>
        ) : (
          priorityProperties.map((property: any) => (
            <div key={property.id} className="p-3 border border-slate-600 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white text-sm font-medium">
                  {property.name}
                </p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  property.riskLevel === "high"
                    ? "bg-red-500/20 text-red-400"
                    : property.status === "active"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-yellow-500/20 text-yellow-400"
                }`}>
                  {property.riskLevel === "high" ? "High Risk" : 
                   property.status === "active" ? "Secure" : "Alert"}
                </span>
              </div>
              <p className="text-slate-400 text-xs mb-2">
                {property.address}
              </p>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  <i className="fas fa-shield-alt mr-1"></i>
                  {property.type === "commercial" ? "24/7 Coverage" : "Scheduled"}
                </span>
                <span>
                  <i className="fas fa-users mr-1"></i>
                  {property.riskLevel === "high" ? "2 Officers" : "1 Officer"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
