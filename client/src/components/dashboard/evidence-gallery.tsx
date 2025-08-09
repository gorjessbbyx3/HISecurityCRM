import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface EvidenceItem {
  id: string;
  type: string;
  location: string;
  timestamp: string;
  imageUrl: string;
  description: string;
  officerName: string;
}

export default function EvidenceGallery() {
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);

  // Mock evidence data - in real app this would come from API
  const recentEvidence: EvidenceItem[] = [
    {
      id: "1",
      type: "Trespasser Documentation",
      location: "Zone A - East Entry",
      timestamp: "2 hours ago",
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
      description: "Individual attempting unauthorized entry at east gate. Subject was documented and escorted off premises.",
      officerName: "Officer Martinez"
    },
    {
      id: "2",
      type: "Property Damage Report",
      location: "Parking Structure Level 2",
      timestamp: "4 hours ago",
      imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
      description: "Vandalism discovered on parking structure wall. Evidence preserved and police notified.",
      officerName: "Officer Chen"
    },
    {
      id: "3",
      type: "Community Outreach",
      location: "Main Entrance",
      timestamp: "1 day ago",
      imageUrl: "https://images.unsplash.com/photo-1559526324-593bc073d938?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
      description: "Community assistance provided to individual in need. Connected with local shelter services.",
      officerName: "Officer Wong"
    },
    {
      id: "4",
      type: "Security Patrol",
      location: "Zone B - Perimeter",
      timestamp: "1 day ago",
      imageUrl: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
      description: "Routine perimeter check completed. All access points secured and functioning properly.",
      officerName: "Officer Johnson"
    }
  ];

  const getTypeIcon = (type: string) => {
    if (type.includes("Trespasser")) return "fas fa-user-slash";
    if (type.includes("Damage")) return "fas fa-exclamation-triangle";
    if (type.includes("Outreach")) return "fas fa-hands-helping";
    if (type.includes("Patrol")) return "fas fa-route";
    return "fas fa-camera";
  };

  const getTypeColor = (type: string) => {
    if (type.includes("Trespasser")) return "text-red-400";
    if (type.includes("Damage")) return "text-orange-400";
    if (type.includes("Outreach")) return "text-green-400";
    if (type.includes("Patrol")) return "text-blue-400";
    return "text-slate-400";
  };

  return (
    <>
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-4">
          <CardTitle className="text-white text-lg" data-testid="evidence-gallery-title">
            Recent Evidence & Documentation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentEvidence.map((evidence) => (
              <div 
                key={evidence.id} 
                className="p-3 border border-slate-600 rounded-lg hover:border-slate-500 transition-colors cursor-pointer"
                onClick={() => setSelectedEvidence(evidence)}
                data-testid={`evidence-item-${evidence.id}`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img 
                      src={evidence.imageUrl}
                      alt={evidence.type}
                      className="w-16 h-12 rounded object-cover"
                    />
                    <div className="absolute top-1 left-1">
                      <i className={`${getTypeIcon(evidence.type)} ${getTypeColor(evidence.type)} text-xs bg-slate-900/80 p-1 rounded`}></i>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white text-sm font-medium truncate">
                      {evidence.type}
                    </h4>
                    <p className="text-slate-400 text-xs truncate">
                      {evidence.location}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-slate-500 text-xs">
                        {evidence.timestamp}
                      </span>
                      <span className="text-slate-500 text-xs">
                        {evidence.officerName}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-slate-400 hover:text-white p-1 flex-shrink-0"
                    data-testid={`view-evidence-${evidence.id}`}
                  >
                    <i className="fas fa-eye text-xs"></i>
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <Button 
            variant="ghost"
            className="w-full mt-4 text-slate-400 hover:text-white text-sm"
            data-testid="view-all-evidence"
          >
            View All Evidence →
          </Button>
        </CardContent>
      </Card>

      {/* Evidence Detail Modal */}
      <Dialog open={!!selectedEvidence} onOpenChange={() => setSelectedEvidence(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Evidence Details</DialogTitle>
          </DialogHeader>
          
          {selectedEvidence && (
            <div className="space-y-4">
              <div className="relative">
                <img 
                  src={selectedEvidence.imageUrl}
                  alt={selectedEvidence.type}
                  className="w-full h-64 rounded-lg object-cover"
                />
                <div className="absolute top-3 left-3">
                  <div className="flex items-center space-x-2 bg-slate-900/80 px-3 py-1 rounded-full">
                    <i className={`${getTypeIcon(selectedEvidence.type)} ${getTypeColor(selectedEvidence.type)}`}></i>
                    <span className="text-white text-sm font-medium">{selectedEvidence.type}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-slate-400 text-sm font-medium mb-1">Location</h4>
                  <p className="text-white">{selectedEvidence.location}</p>
                </div>
                <div>
                  <h4 className="text-slate-400 text-sm font-medium mb-1">Documented by</h4>
                  <p className="text-white">{selectedEvidence.officerName}</p>
                </div>
                <div>
                  <h4 className="text-slate-400 text-sm font-medium mb-1">Time</h4>
                  <p className="text-white">{selectedEvidence.timestamp}</p>
                </div>
                <div>
                  <h4 className="text-slate-400 text-sm font-medium mb-1">Evidence ID</h4>
                  <p className="text-white font-mono">EVD-{selectedEvidence.id.padStart(6, '0')}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-slate-400 text-sm font-medium mb-2">Description</h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {selectedEvidence.description}
                </p>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-600">
                <Button
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  data-testid="download-evidence"
                >
                  <i className="fas fa-download mr-2"></i>Download
                </Button>
                <Button
                  className="bg-navy-700 hover:bg-navy-600 text-white"
                  data-testid="add-to-report"
                >
                  <i className="fas fa-file-alt mr-2"></i>Add to Report
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
