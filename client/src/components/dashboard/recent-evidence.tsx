
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

interface EvidenceItem {
  id: string;
  type: string;
  location: string;
  timestamp: string;
  officerId: string;
  incidentId?: string;
  imageUrl?: string;
  description?: string;
  fileSize?: number;
}

export default function RecentEvidence() {
  const { data: evidenceItems = [], isLoading, error } = useQuery({
    queryKey: ["/api/evidence/recent"],
    queryFn: async () => {
      const response = await fetch("/api/evidence/recent?limit=5");
      if (!response.ok) {
        throw new Error('Failed to fetch recent evidence');
      }
      return response.json();
    },
    staleTime: 30000, // 30 seconds
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getEvidenceIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      'photo': 'fas fa-camera',
      'video': 'fas fa-video',
      'audio': 'fas fa-microphone',
      'document': 'fas fa-file-alt',
      'report': 'fas fa-clipboard-list',
      'witness_statement': 'fas fa-comment-alt'
    };
    return iconMap[type.toLowerCase()] || 'fas fa-file';
  };

  const getTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      'photo': 'text-green-400',
      'video': 'text-blue-400', 
      'audio': 'text-purple-400',
      'document': 'text-yellow-400',
      'report': 'text-orange-400',
      'witness_statement': 'text-cyan-400'
    };
    return colorMap[type.toLowerCase()] || 'text-slate-400';
  };

  if (error) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4" data-testid="text-recent-evidence-title">
          Recent Evidence
        </h3>
        <div className="text-center py-4">
          <i className="fas fa-exclamation-triangle text-red-400 text-2xl mb-2"></i>
          <p className="text-red-400 text-sm">Failed to load evidence</p>
          <Button 
            size="sm" 
            className="mt-2 bg-red-600 hover:bg-red-700"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white" data-testid="text-recent-evidence-title">
          Recent Evidence
        </h3>
        <Button 
          size="sm" 
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
          onClick={() => window.open('/evidence', '_blank')}
        >
          View All
        </Button>
      </div>
      
      <div className="space-y-3">
        {isLoading ? (
          // Loading skeleton
          Array.from({length: 3}).map((_, index) => (
            <div key={index} className="p-3 border border-slate-600 rounded-lg animate-pulse">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-8 bg-slate-600 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-600 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-slate-600 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-3 bg-slate-600 rounded w-1/4"></div>
            </div>
          ))
        ) : evidenceItems.length === 0 ? (
          <div className="text-center py-8">
            <i className="fas fa-folder-open text-slate-400 text-3xl mb-3"></i>
            <p className="text-slate-400 text-sm mb-2">No evidence uploaded yet</p>
            <Button 
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => window.open('/evidence/upload', '_blank')}
            >
              <i className="fas fa-upload mr-2"></i>
              Upload Evidence
            </Button>
          </div>
        ) : (
          evidenceItems.map((item: EvidenceItem) => (
            <div key={item.id} className="p-3 border border-slate-600 rounded-lg hover:border-slate-500 transition-colors">
              <div className="flex items-center space-x-3 mb-2">
                {item.imageUrl ? (
                  <img 
                    src={item.imageUrl}
                    alt={item.type}
                    className="w-12 h-8 rounded object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling!.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-12 h-8 rounded bg-slate-600 flex items-center justify-center ${item.imageUrl ? 'hidden' : ''}`}>
                  <i className={`${getEvidenceIcon(item.type)} ${getTypeColor(item.type)}`}></i>
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium capitalize">
                    {item.type.replace('_', ' ')}
                  </p>
                  <p className="text-slate-400 text-xs">{item.location}</p>
                  {item.description && (
                    <p className="text-slate-500 text-xs mt-1 truncate">{item.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-xs">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </p>
                  {item.fileSize && (
                    <p className="text-slate-500 text-xs">{formatFileSize(item.fileSize)}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-slate-400 text-xs">
                  Officer: {item.officerId}
                  {item.incidentId && ` • Incident: ${item.incidentId}`}
                </p>
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 p-1"
                  onClick={() => window.open(`/evidence/${item.id}`, '_blank')}
                >
                  <i className="fas fa-external-link-alt text-xs"></i>
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-700">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Auto-refreshes every 30 seconds</span>
          <span className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
            Live
          </span>
        </div>
      </div>
    </div>
  );
}
