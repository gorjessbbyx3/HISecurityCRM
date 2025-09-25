
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Evidence {
  id: string;
  type: 'photo' | 'video' | 'audio' | 'document';
  filename: string;
  uploadedAt: string;
  description?: string;
  tags?: string[];
  fileSize: number;
  mimeType: string;
  officerId: string;
  incidentId?: string;
  location?: string;
  thumbnailUrl?: string;
  fileUrl: string;
}

const EvidenceGallery = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const { data: evidence = [], isLoading, error } = useQuery({
    queryKey: ["/api/evidence", searchQuery, filterType],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filterType !== 'all') params.append('type', filterType);
      
      const response = await fetch(`/api/evidence?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch evidence");
      }
      return response.json();
    },
    staleTime: 15000,
    cacheTime: 60000,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', getFileType(file.type));
      
      const response = await fetch('/api/evidence/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload evidence');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evidence"] });
      toast({
        title: "Success",
        description: "Evidence uploaded successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload evidence",
        variant: "destructive",
      });
    },
  });

  const getFileType = (mimeType: string): Evidence['type'] => {
    if (mimeType.startsWith('image/')) return 'photo';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTypeIcon = (type: Evidence['type']) => {
    const icons = {
      photo: '📷',
      video: '🎥',
      audio: '🎵',
      document: '📄'
    };
    return icons[type];
  };

  const getTypeColor = (type: Evidence['type']) => {
    const colors = {
      photo: 'bg-green-100 text-green-800',
      video: 'bg-blue-100 text-blue-800',
      audio: 'bg-purple-100 text-purple-800',
      document: 'bg-yellow-100 text-yellow-800'
    };
    return colors[type];
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 50MB",
          variant: "destructive",
        });
        return;
      }
      
      uploadMutation.mutate(file);
    }
  };

  if (error) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="text-center">
            <i className="fas fa-exclamation-triangle text-red-400 text-3xl mb-3"></i>
            <p className="text-red-400 mb-4">Failed to load evidence</p>
            <Button 
              onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/evidence"] })}
              className="bg-red-600 hover:bg-red-700"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Evidence Gallery</h2>
          <p className="text-slate-400">Manage and review collected evidence</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Input
            placeholder="Search evidence..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 bg-slate-700 border-slate-600 text-white"
          />
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded-md"
          >
            <option value="all">All Types</option>
            <option value="photo">Photos</option>
            <option value="video">Videos</option>
            <option value="audio">Audio</option>
            <option value="document">Documents</option>
          </select>
          
          <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md cursor-pointer transition-colors">
            <i className="fas fa-upload mr-2"></i>
            Upload Evidence
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
              disabled={uploadMutation.isLoading}
            />
          </label>
        </div>
      </div>

      {/* Loading indicator */}
      {uploadMutation.isLoading && (
        <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
          <div className="flex items-center">
            <i className="fas fa-spinner fa-spin text-blue-400 mr-3"></i>
            <span className="text-blue-400">Uploading evidence...</span>
          </div>
        </div>
      )}

      {/* Evidence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-slate-800 border border-slate-700 rounded-lg p-4 animate-pulse">
              <div className="aspect-video bg-slate-600 rounded mb-3"></div>
              <div className="h-4 bg-slate-600 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-600 rounded w-1/2"></div>
            </div>
          ))
        ) : evidence.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <i className="fas fa-folder-open text-slate-400 text-5xl mb-4"></i>
            <p className="text-slate-400 text-lg mb-2">No evidence found</p>
            <p className="text-slate-500 text-sm">Upload evidence to get started</p>
          </div>
        ) : (
          evidence.map((item: Evidence) => (
            <Dialog key={item.id}>
              <DialogTrigger asChild>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 cursor-pointer hover:bg-slate-700 transition-colors">
                  <div className="aspect-video bg-slate-600 rounded mb-3 relative overflow-hidden">
                    {item.type === 'photo' && item.thumbnailUrl ? (
                      <img 
                        src={item.thumbnailUrl} 
                        alt={item.filename}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling!.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    
                    <div className={`w-full h-full flex items-center justify-center ${item.type === 'photo' && item.thumbnailUrl ? 'hidden' : ''}`}>
                      <span className="text-4xl">{getTypeIcon(item.type)}</span>
                    </div>
                    
                    <div className="absolute top-2 right-2">
                      <Badge className={getTypeColor(item.type)} variant="secondary">
                        {item.type}
                      </Badge>
                    </div>
                  </div>
                  
                  <h4 className="font-semibold text-white truncate mb-1">{item.filename}</h4>
                  <p className="text-sm text-slate-400 mb-2">{new Date(item.uploadedAt).toLocaleDateString()}</p>
                  <p className="text-xs text-slate-500">{formatFileSize(item.fileSize)}</p>
                  
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {item.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs border-slate-600 text-slate-300">
                          {tag}
                        </Badge>
                      ))}
                      {item.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                          +{item.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </DialogTrigger>
              
              <DialogContent className="max-w-4xl bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">{item.filename}</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  {/* Evidence preview */}
                  <div className="bg-slate-700 rounded-lg p-4">
                    {item.type === 'photo' ? (
                      <img src={item.fileUrl} alt={item.filename} className="max-w-full h-auto rounded" />
                    ) : item.type === 'video' ? (
                      <video controls className="max-w-full h-auto rounded">
                        <source src={item.fileUrl} type={item.mimeType} />
                      </video>
                    ) : item.type === 'audio' ? (
                      <audio controls className="w-full">
                        <source src={item.fileUrl} type={item.mimeType} />
                      </audio>
                    ) : (
                      <div className="text-center py-8">
                        <i className="fas fa-file text-4xl text-slate-400 mb-2"></i>
                        <p className="text-slate-300">Document preview not available</p>
                        <Button 
                          className="mt-2 bg-blue-600 hover:bg-blue-700"
                          onClick={() => window.open(item.fileUrl, '_blank')}
                        >
                          Download
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Evidence details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-400">Officer ID</p>
                      <p className="text-white">{item.officerId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">File Size</p>
                      <p className="text-white">{formatFileSize(item.fileSize)}</p>
                    </div>
                    {item.location && (
                      <div>
                        <p className="text-sm text-slate-400">Location</p>
                        <p className="text-white">{item.location}</p>
                      </div>
                    )}
                    {item.incidentId && (
                      <div>
                        <p className="text-sm text-slate-400">Incident ID</p>
                        <p className="text-white">{item.incidentId}</p>
                      </div>
                    )}
                  </div>
                  
                  {item.description && (
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Description</p>
                      <p className="text-white">{item.description}</p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          ))
        )}
      </div>
    </div>
  );
};

export default EvidenceGallery;
