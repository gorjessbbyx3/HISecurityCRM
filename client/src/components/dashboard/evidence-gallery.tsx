import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

interface Evidence {
  id: string;
  type: string;
  filename: string;
  uploadedAt: string;
  description?: string;
  tags?: string[];
}

const EvidenceGallery = () => {
  const { data: evidence, isLoading } = useQuery({
    queryKey: ["/api/evidence"],
    queryFn: async () => {
      const response = await fetch("/api/evidence");
      if (!response.ok) {
        throw new Error("Failed to fetch evidence");
      }
      return response.json();
    },
    staleTime: 15000,
    cacheTime: 60000,
  });

  if (isLoading) {
    return <div className="animate-pulse">Loading evidence...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {evidence?.map((item: Evidence) => (
        <Dialog key={item.id}>
          <DialogTrigger asChild>
            <div className="bg-card p-4 rounded-lg cursor-pointer hover:bg-card/80">
              <div className="aspect-video bg-muted rounded mb-2 flex items-center justify-center">
                <span className="text-muted-foreground">{item.type}</span>
              </div>
              <h4 className="font-semibold">{item.filename}</h4>
              <p className="text-sm text-muted-foreground">{item.uploadedAt}</p>
              {item.tags && (
                <div className="flex gap-1 mt-2">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{item.filename}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded flex items-center justify-center">
                <span className="text-muted-foreground">Evidence Preview</span>
              </div>
              {item.description && (
                <p className="text-sm">{item.description}</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )) || (
        <div className="col-span-full text-center py-8">
          <p className="text-muted-foreground">No evidence found</p>
        </div>
      )}
    </div>
  );
};

export default EvidenceGallery;