
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

interface Evidence {
  id: string;
  incidentId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedBy: string;
  uploadedByName?: string;
  createdAt: string;
  incident?: {
    incidentType: string;
    location: string;
    description: string;
  };
}

export function EvidenceGallery() {
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);

  const { data: evidence = [], isLoading, error } = useQuery({
    queryKey: ["/api/evidence"],
    queryFn: async () => {
      const response = await fetch("/api/evidence", {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch evidence');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Evidence Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Evidence Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-400">
            Failed to load evidence
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatFileType = (fileType: string) => {
    switch (fileType) {
      case 'image': return 'Photo';
      case 'video': return 'Video';
      case 'document': return 'Document';
      default: return 'File';
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Evidence Gallery</CardTitle>
        <Button 
          size="sm" 
          className="bg-gold-500 hover:bg-gold-600 text-black"
          onClick={() => window.location.href = '/crime-intelligence'}
        >
          View All
        </Button>
      </CardHeader>
      <CardContent>
        {evidence.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No evidence files available
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {evidence.slice(0, 6).map((item: Evidence) => (
              <Dialog key={item.id}>
                <DialogTrigger asChild>
                  <div 
                    className="relative group cursor-pointer"
                    onClick={() => setSelectedEvidence(item)}
                  >
                    <div className="aspect-square bg-slate-700 rounded-lg overflow-hidden">
                      {item.fileType === 'image' ? (
                        <img
                          src={item.fileUrl}
                          alt={item.fileName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <i className={`fas ${
                            item.fileType === 'video' ? 'fa-video' : 'fa-file-alt'
                          } text-4xl text-slate-400`}></i>
                        </div>
                      )}
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="text-xs">
                        {formatFileType(item.fileType)}
                      </Badge>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-xs">
                      <p className="truncate">{item.incident?.incidentType || 'Evidence'}</p>
                      <p className="text-slate-300 truncate">{item.incident?.location}</p>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700 max-w-4xl">
                  <DialogHeader>
                    <DialogTitle className="text-white">{item.fileName}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="aspect-video bg-slate-700 rounded-lg overflow-hidden">
                      {item.fileType === 'image' ? (
                        <img
                          src={item.fileUrl}
                          alt={item.fileName}
                          className="w-full h-full object-contain"
                        />
                      ) : item.fileType === 'video' ? (
                        <video
                          src={item.fileUrl}
                          controls
                          className="w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <i className="fas fa-file-alt text-6xl text-slate-400 mb-4"></i>
                            <p className="text-white">{item.fileName}</p>
                            <Button 
                              className="mt-4"
                              onClick={() => window.open(item.fileUrl, '_blank')}
                            >
                              Download File
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400">Incident Type</p>
                        <p className="text-white">{item.incident?.incidentType || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Location</p>
                        <p className="text-white">{item.incident?.location || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Uploaded By</p>
                        <p className="text-white">{item.uploadedByName || 'System'}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Date</p>
                        <p className="text-white">{new Date(item.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {item.incident?.description && (
                      <div>
                        <p className="text-slate-400 text-sm">Description</p>
                        <p className="text-white text-sm">{item.incident.description}</p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
