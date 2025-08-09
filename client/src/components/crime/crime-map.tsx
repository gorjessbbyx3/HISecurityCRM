export default function CrimeMap() {
  return (
    <div className="bg-slate-700 rounded-lg h-64 relative overflow-hidden">
      {/* Crime Map Placeholder */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy-900/50 to-slate-900/50"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-map-marked-alt text-4xl text-gold-500 mb-3"></i>
          <p className="text-white font-medium">Interactive Crime Map</p>
          <p className="text-slate-400 text-sm">Real-time incident tracking</p>
        </div>
      </div>
      
      {/* Crime Markers */}
      <div className="absolute top-4 left-4 w-3 h-3 bg-red-500 rounded-full animate-pulse" title="High Priority Incident"></div>
      <div className="absolute top-12 right-8 w-3 h-3 bg-yellow-500 rounded-full animate-pulse" title="Medium Priority Incident"></div>
      <div className="absolute bottom-8 left-12 w-3 h-3 bg-orange-500 rounded-full animate-pulse" title="Under Investigation"></div>
      <div className="absolute bottom-16 right-16 w-3 h-3 bg-green-500 rounded-full" title="Resolved Incident"></div>
    </div>
  );
}
