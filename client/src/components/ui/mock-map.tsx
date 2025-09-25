
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "./button";

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  markers?: Array<{
    id: string;
    position: [number, number];
    type: 'patrol' | 'incident' | 'property';
    title?: string;
    description?: string;
  }>;
  center?: [number, number];
  zoom?: number;
  height?: string;
}

export function MockMap({ 
  markers = [],
  center = [21.3099, -157.8581], // Honolulu
  zoom = 11,
  height = "400px"
}: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView(center, zoom);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);

      // Add sample markers if none provided
      if (markers.length === 0) {
        const sampleMarkers = [
          { position: [21.2793, -157.8311] as [number, number], type: 'incident' as const, title: 'Security Incident' },
          { position: [21.3099, -157.8581] as [number, number], type: 'patrol' as const, title: 'Patrol Officer' },
          { position: [21.2911, -157.8420] as [number, number], type: 'property' as const, title: 'Protected Property' }
        ];

        sampleMarkers.forEach(marker => {
          const color = marker.type === 'incident' ? '#ef4444' : 
                       marker.type === 'patrol' ? '#10b981' : '#3b82f6';
          
          L.circleMarker(marker.position, {
            color: color,
            fillColor: color,
            fillOpacity: 0.8,
            radius: 8
          }).bindPopup(marker.title || 'Marker').addTo(mapRef.current!);
        });
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [center, zoom]);

  useEffect(() => {
    if (mapRef.current && markers.length > 0) {
      // Clear existing markers and add new ones
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.CircleMarker) {
          mapRef.current!.removeLayer(layer);
        }
      });

      markers.forEach(marker => {
        const color = marker.type === 'incident' ? '#ef4444' : 
                     marker.type === 'patrol' ? '#10b981' : '#3b82f6';
        
        const mapMarker = L.circleMarker(marker.position, {
          color: color,
          fillColor: color,
          fillOpacity: 0.8,
          radius: 8
        });

        if (marker.title || marker.description) {
          mapMarker.bindPopup(`
            <div>
              ${marker.title ? `<h4 class="font-bold">${marker.title}</h4>` : ''}
              ${marker.description ? `<p>${marker.description}</p>` : ''}
            </div>
          `);
        }

        mapMarker.addTo(mapRef.current!);
      });
    }
  }, [markers]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      mapRef.current?.invalidateSize();
    }, 100);
  };

  return (
    <div className={`relative bg-slate-700 rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`} 
         style={{ height: isFullscreen ? '100vh' : height }}>
      
      {/* Map controls */}
      <div className="absolute top-4 right-4 space-y-2 z-10">
        <Button size="sm" className="bg-white text-black hover:bg-gray-100 shadow-md">
          Auto-Fit: OFF
        </Button>
        <Button 
          size="sm" 
          className="bg-white text-black hover:bg-gray-100 shadow-md"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? 'Exit Full' : 'Full Page'}
        </Button>
      </div>

      {/* Map container */}
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Close fullscreen button */}
      {isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 left-4 z-10 bg-white text-black hover:bg-gray-100 px-3 py-2 rounded shadow-md"
        >
          <i className="fas fa-times"></i> Close
        </button>
      )}
    </div>
  );
}
