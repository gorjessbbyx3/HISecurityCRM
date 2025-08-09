export default function CrimeMap() {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white" data-testid="text-crime-intelligence-title">
          Crime Intelligence Dashboard
        </h3>
        <div className="flex space-x-2">
          <button 
            className="text-slate-400 hover:text-white transition-colors"
            data-testid="button-refresh-data"
          >
            <i className="fas fa-sync-alt"></i>
          </button>
          <button 
            className="text-slate-400 hover:text-white transition-colors"
            data-testid="button-fullscreen-map"
          >
            <i className="fas fa-expand"></i>
          </button>
        </div>
      </div>

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

      {/* Recent Incidents */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-white mb-3">Recent Incidents (Last 24 Hours)</h4>
        
        <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <div>
              <p className="text-white text-sm font-medium">Trespassing</p>
              <p className="text-slate-400 text-xs">Waikiki Beach Resort - Building A</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-xs">2:30 PM</p>
            <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full">High</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <div>
              <p className="text-white text-sm font-medium">Suspicious Activity</p>
              <p className="text-slate-400 text-xs">Honolulu Shopping Center - Parking Lot</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-xs">1:15 PM</p>
            <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full">Medium</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <div>
              <p className="text-white text-sm font-medium">Vandalism</p>
              <p className="text-slate-400 text-xs">Pearl Harbor Memorial Park</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-xs">11:45 AM</p>
            <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-1 rounded-full">Medium</span>
          </div>
        </div>
      </div>
    </div>
  );
}
