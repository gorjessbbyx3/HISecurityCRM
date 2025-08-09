import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PropertyList() {
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["/api/properties"],
  });

  const priorityProperties = properties
    .filter((property: any) => property.riskLevel === "high" || property.status === "active")
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/20 text-green-400";
      case "maintenance": return "bg-yellow-500/20 text-yellow-400";
      case "inactive": return "bg-red-500/20 text-red-400";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "high": return "bg-red-500/20 text-red-400";
      case "medium": return "bg-yellow-500/20 text-yellow-400";
      case "low": return "bg-green-500/20 text-green-400";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg" data-testid="property-list-title">
            Priority Properties
          </CardTitle>
          <Button 
            size="sm" 
            variant="ghost" 
            className="text-slate-400 hover:text-white"
            data-testid="view-all-properties-button"
          >
            <i className="fas fa-external-link-alt text-xs"></i>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="p-3 border border-slate-600 rounded-lg animate-pulse">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 bg-slate-600 rounded w-1/2"></div>
                  <div className="h-5 bg-slate-600 rounded w-16"></div>
                </div>
                <div className="h-3 bg-slate-600 rounded w-full mb-2"></div>
                <div className="flex items-center justify-between">
                  <div className="h-3 bg-slate-600 rounded w-1/4"></div>
                  <div className="h-3 bg-slate-600 rounded w-1/4"></div>
                </div>
              </div>
            ))
          ) : priorityProperties.length === 0 ? (
            <div className="text-center py-4">
              <i className="fas fa-building text-slate-400 text-xl mb-2"></i>
              <p className="text-slate-400 text-sm">No priority properties</p>
            </div>
          ) : (
            priorityProperties.map((property: any) => (
              <div 
                key={property.id} 
                className="p-3 border border-slate-600 rounded-lg hover:border-slate-500 transition-colors"
                data-testid={`property-item-${property.id}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white text-sm font-medium">
                    {property.name}
                  </h4>
                  <div className="flex space-x-1">
                    <Badge className={getStatusColor(property.status)} data-testid={`property-status-${property.id}`}>
                      {property.status}
                    </Badge>
                    <Badge className={getRiskColor(property.riskLevel)} data-testid={`property-risk-${property.id}`}>
                      {property.riskLevel} risk
                    </Badge>
                  </div>
                </div>
                
                <p className="text-slate-400 text-xs mb-3 line-clamp-2">
                  {property.address}
                </p>
                
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center">
                      <i className="fas fa-shield-alt mr-1"></i>
                      {property.type === "commercial" ? "24/7" : "Scheduled"}
                    </span>
                    <span className="flex items-center">
                      <i className="fas fa-users mr-1"></i>
                      {property.riskLevel === "high" ? "2" : "1"} Officer{property.riskLevel === "high" ? "s" : ""}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-slate-400 hover:text-white p-1"
                    data-testid={`property-details-${property.id}`}
                  >
                    <i className="fas fa-info-circle text-xs"></i>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
