
import { MapPin, Navigation, Crosshair } from "lucide-react";
import { Button } from "./button";

export function MockMap() {
  return (
    <div className="w-full h-full relative bg-gradient-to-br from-green-50 to-blue-50 overflow-hidden">
      {/* Street grid overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-30">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Map markers */}
      <div className="absolute top-1/4 left-1/3 text-red-600">
        <MapPin className="w-6 h-6" />
      </div>
      <div className="absolute top-1/2 right-1/3 text-blue-600">
        <Navigation className="w-6 h-6" />
      </div>
      <div className="absolute bottom-1/3 left-1/2 text-green-600">
        <Crosshair className="w-6 h-6" />
      </div>

      {/* Map controls */}
      <div className="absolute top-4 right-4 space-y-2">
        <Button size="sm" className="bg-white text-black hover:bg-gray-100 shadow-md">
          Auto-Fit: OFF
        </Button>
        <Button size="sm" className="bg-white text-black hover:bg-gray-100 shadow-md">
          Full Page
        </Button>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col space-y-1">
        <Button size="sm" className="bg-white text-black hover:bg-gray-100 w-10 h-10 p-0">
          +
        </Button>
        <Button size="sm" className="bg-white text-black hover:bg-gray-100 w-10 h-10 p-0">
          -
        </Button>
      </div>

      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-slate-600 text-center bg-white/80 rounded-lg p-6">
          <MapPin className="w-12 h-12 mx-auto mb-2" />
          <p className="font-medium">Interactive Map</p>
          <p className="text-sm">Real-time patrol tracking</p>
        </div>
      </div>
    </div>
  );
}
