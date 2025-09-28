import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

export default function RecentEvidence() {
  const { isAuthenticated } = useAuth();

  const { data: evidenceItems = [], isLoading } = useQuery({
    queryKey: ["/api/evidence"],
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4" data-testid="text-recent-evidence-title">
          Recent Evidence
        </h3>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="p-3 border border-slate-600 rounded-lg animate-pulse">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-8 bg-slate-600 rounded"></div>
                <div className="flex-1">
                  <div className="h-3 bg-slate-600 rounded w-3/4 mb-1"></div>
                  <div className="h-2 bg-slate-600 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-2 bg-slate-600 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4" data-testid="text-recent-evidence-title">
        Recent Evidence
      </h3>

      <div className="space-y-3">
        {evidenceItems.length === 0 ? (
          <div className="text-center py-8">
            <i className="fas fa-image text-slate-400 text-2xl mb-2"></i>
            <p className="text-slate-400 text-sm">No recent evidence</p>
          </div>
        ) : (
          evidenceItems.slice(0, 5).map((item: any) => (
            <div key={item.id} className="p-3 border border-slate-600 rounded-lg">
              <div className="flex items-center space-x-3 mb-2">
                <img
                  src={item.imageUrl || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=40"}
                  alt={item.type || item.description}
                  className="w-12 h-8 rounded object-cover"
                />
                <div>
                  <p className="text-white text-sm font-medium">{item.type || item.description}</p>
                  <p className="text-slate-400 text-xs">{item.location}</p>
                </div>
              </div>
              <p className="text-slate-400 text-xs">
                {item.createdAt ? new Date(item.createdAt).toLocaleString() : item.time}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
