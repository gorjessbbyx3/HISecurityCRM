import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

export default function CrimeMap() {
  const [refreshing, setRefreshing] = useState(false);

  const { data: crimeData, isLoading, refetch } = useQuery({
    queryKey: ['/api/crime-data/live'],
    staleTime: 300000, // 5 minutes
  });

  const { data: analytics } = useQuery({
    queryKey: ['/api/crime-data/analytics'],
    staleTime: 600000, // 10 minutes
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white" data-testid="text-crime-intelligence-title">
          {import.meta.env.VITE_CRIME_MAP_TITLE || 'Crime Intelligence Dashboard'}
        </h3>
        <div className="flex space-x-2">
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-slate-400 hover:text-white transition-colors disabled:opacity-50"
            data-testid="button-refresh-data"
          >
            <i className={`fas fa-sync-alt ${refreshing ? 'animate-spin' : ''}`}></i>
          </button>
          <button 
            className="text-slate-400 hover:text-white transition-colors"
            data-testid="button-fullscreen-map"
          >
            <i className="fas fa-expand"></i>
          </button>
        </div>
      </div>

      {/* Live Data Stats */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-700 p-3 rounded-lg">
            <p className="text-slate-400 text-xs">Total Incidents (30d)</p>
            <p className="text-white text-lg font-bold">{analytics.totalIncidents}</p>
          </div>
          <div className="bg-slate-700 p-3 rounded-lg">
            <p className="text-slate-400 text-xs">Top Crime Type</p>
            <p className="text-white text-sm font-medium">
              {analytics.topCrimeTypes?.[0]?.type || 'N/A'}
            </p>
          </div>
          <div className="bg-slate-700 p-3 rounded-lg">
            <p className="text-slate-400 text-xs">Active Hotspot</p>
            <p className="text-white text-sm font-medium">
              {analytics.topLocations?.[0]?.location || 'N/A'}
            </p>
          </div>
          <div className="bg-slate-700 p-3 rounded-lg">
            <p className="text-slate-400 text-xs">Data Source</p>
            <p className="text-green-400 text-sm font-medium">Honolulu PD</p>
          </div>
        </div>
      )}

      {/* Crime Map Placeholder */}
      <div className="bg-slate-700 rounded-lg h-64 mb-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-map-marked-alt text-4xl text-gold-500 mb-3"></i>
            <p className="text-white font-medium">Interactive Crime Map</p>
            <p className="text-slate-400 text-sm">Real-time incident tracking</p>
          </div>
        </div>
        
        {/* Crime Markers */}
        <div className="absolute top-4 left-4 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        <div className="absolute top-12 right-8 w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
        <div className="absolute bottom-8 left-12 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
      </div>

      {/* Recent Incidents from Live Data */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-white mb-3">
          Recent Incidents from Honolulu PD
          {isLoading && <span className="text-slate-400 text-xs ml-2">(Loading...)</span>}
        </h4>
        
        {crimeData && crimeData.length > 0 ? (
          crimeData.slice(0, 5).map((incident: any, index: number) => (
            <div key={incident.id || index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  incident.type?.toLowerCase().includes('theft') || incident.type?.toLowerCase().includes('burglary') 
                    ? 'bg-red-500' 
                    : incident.type?.toLowerCase().includes('assault') 
                    ? 'bg-orange-500' 
                    : 'bg-yellow-500'
                }`}></div>
                <div>
                  <p className="text-white text-sm font-medium">{incident.type || 'Unknown'}</p>
                  <p className="text-slate-400 text-xs">{incident.location || 'Location not available'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-xs">
                  {incident.date ? new Date(incident.date).toLocaleDateString() : 'N/A'}
                </p>
                <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full">
                  Live Data
                </span>
              </div>
            </div>
          ))
        ) : !isLoading ? (
          <div className="text-center py-4">
            <p className="text-slate-400">No recent incidents from Honolulu PD API</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                  <div>
                    <div className="h-3 bg-slate-600 rounded w-20 mb-1"></div>
                    <div className="h-2 bg-slate-600 rounded w-32"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-2 bg-slate-600 rounded w-12 mb-1"></div>
                  <div className="h-4 bg-slate-600 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
