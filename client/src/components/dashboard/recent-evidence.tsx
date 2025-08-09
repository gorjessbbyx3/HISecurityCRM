export default function RecentEvidence() {
  const evidenceItems = [
    {
      id: 1,
      type: "Trespasser Photo",
      location: "Zone A - East Entry",
      time: "2 hours ago",
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=40"
    },
    {
      id: 2,
      type: "Incident Report",
      location: "Parking Structure",
      time: "4 hours ago",
      imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=40"
    },
    {
      id: 3,
      type: "Outreach Photo",
      location: "Community Center",
      time: "1 day ago",
      imageUrl: "https://images.unsplash.com/photo-1559526324-593bc073d938?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=40"
    }
  ];

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4" data-testid="text-recent-evidence-title">
        Recent Evidence
      </h3>
      
      <div className="space-y-3">
        {evidenceItems.map((item) => (
          <div key={item.id} className="p-3 border border-slate-600 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <img 
                src={item.imageUrl}
                alt={item.type}
                className="w-12 h-8 rounded object-cover"
              />
              <div>
                <p className="text-white text-sm font-medium">{item.type}</p>
                <p className="text-slate-400 text-xs">{item.location}</p>
              </div>
            </div>
            <p className="text-slate-400 text-xs">{item.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
