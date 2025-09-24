
import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MapPin,
  Radio,
  Camera,
  Mic,
  WifiOff,
  Wifi,
  AlertTriangle,
  Navigation,
  Clock,
  Users,
  Activity,
  Settings,
  Volume2,
  VolumeX,
  Maximize2,
  Filter,
  RefreshCw,
  Upload,
  Download
} from "lucide-react";
import { format } from "date-fns";

interface LiveIncident {
  id: string;
  type: string;
  description: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  reportedBy: string;
  status: 'active' | 'investigating' | 'resolved';
  assignedOfficer?: string;
  estimatedResponseTime?: number;
}

interface OfficerLocation {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
  status: 'on_patrol' | 'responding' | 'investigating' | 'available' | 'off_duty';
  lastUpdate: string;
  currentProperty?: string;
  speed?: number;
  heading?: number;
  batteryLevel?: number;
  signalStrength?: number;
}

interface VoiceReport {
  id: string;
  audioUrl: string;
  transcript: string;
  confidence: number;
  duration: number;
  timestamp: string;
  officerId: string;
  incidentId?: string;
  status: 'recording' | 'transcribing' | 'completed' | 'failed';
}

interface PhotoEvidence {
  id: string;
  imageUrl: string;
  thumbnail: string;
  coordinates: { lat: number; lng: number };
  timestamp: string;
  officerId: string;
  incidentId?: string;
  description?: string;
  uploadStatus: 'uploading' | 'completed' | 'failed' | 'queued';
}

export default function RealTimeOperations() {
  const [selectedTab, setSelectedTab] = useState("incidents");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [mapView, setMapView] = useState<'satellite' | 'terrain' | 'street'>('street');
  
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const offlineDataRef = useRef<any[]>([]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const connectWebSocket = () => {
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('✅ WebSocket connected for real-time updates');
        wsRef.current?.send(JSON.stringify({
          type: 'subscribe',
          channel: 'incidents'
        }));
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleRealTimeUpdate(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected, attempting to reconnect...');
        setTimeout(connectWebSocket, 3000);
      };
    };
    
    connectWebSocket();
    
    return () => {
      wsRef.current?.close();
    };
  }, []);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineData();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Real-time incident data
  const { data: liveIncidents = [], isLoading: incidentsLoading } = useQuery({
    queryKey: ["/api/incidents/live"],
    queryFn: async () => {
      const response = await fetch("/api/incidents/live", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch live incidents');
      return response.json();
    },
    refetchInterval: isOnline ? 10000 : false,
    enabled: isOnline,
  });

  // Officer location data
  const { data: officerLocations = [], isLoading: locationsLoading } = useQuery({
    queryKey: ["/api/officers/locations"],
    queryFn: async () => {
      const response = await fetch("/api/officers/locations", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch officer locations');
      return response.json();
    },
    refetchInterval: isOnline ? 5000 : false,
    enabled: isOnline,
  });

  // Voice reports data
  const { data: voiceReports = [], isLoading: voiceLoading } = useQuery({
    queryKey: ["/api/voice-reports"],
    queryFn: async () => {
      const response = await fetch("/api/voice-reports", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch voice reports');
      return response.json();
    },
    refetchInterval: isOnline ? 15000 : false,
    enabled: isOnline,
  });

  // Photo evidence data
  const { data: photoEvidence = [], isLoading: photoLoading } = useQuery({
    queryKey: ["/api/photo-evidence"],
    queryFn: async () => {
      const response = await fetch("/api/photo-evidence", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch photo evidence');
      return response.json();
    },
    refetchInterval: isOnline ? 20000 : false,
    enabled: isOnline,
  });

  const handleRealTimeUpdate = (data: any) => {
    switch (data.type) {
      case 'incident_created':
      case 'incident_updated':
        queryClient.invalidateQueries({ queryKey: ["/api/incidents/live"] });
        if (audioEnabled && data.data.severity === 'critical') {
          playAlertSound();
        }
        break;
      case 'officer_location_update':
        queryClient.setQueryData(["/api/officers/locations"], (old: any) => {
          if (!old) return [data.data];
          const updated = old.map((officer: any) => 
            officer.id === data.data.id ? { ...officer, ...data.data } : officer
          );
          return updated.some((o: any) => o.id === data.data.id) 
            ? updated 
            : [...updated, data.data];
        });
        break;
      case 'voice_report_completed':
        queryClient.invalidateQueries({ queryKey: ["/api/voice-reports"] });
        break;
      case 'photo_uploaded':
        queryClient.invalidateQueries({ queryKey: ["/api/photo-evidence"] });
        break;
    }
  };

  const syncOfflineData = async () => {
    if (offlineDataRef.current.length === 0) return;
    
    try {
      for (const data of offlineDataRef.current) {
        await fetch(data.endpoint, {
          method: data.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data.payload),
          credentials: 'include'
        });
      }
      offlineDataRef.current = [];
      console.log('✅ Offline data synced successfully');
    } catch (error) {
      console.error('Error syncing offline data:', error);
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        await processVoiceReport(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting voice recording:', error);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processVoiceReport = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('timestamp', new Date().toISOString());
    
    if (!isOnline) {
      // Store for later sync
      offlineDataRef.current.push({
        endpoint: '/api/voice-reports',
        method: 'POST',
        payload: formData
      });
      return;
    }
    
    try {
      await fetch('/api/voice-reports', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      queryClient.invalidateQueries({ queryKey: ["/api/voice-reports"] });
    } catch (error) {
      console.error('Error uploading voice report:', error);
    }
  };

  const capturePhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0);
        
        canvas.toBlob(async (blob) => {
          if (blob) {
            await processPhotoEvidence(blob);
          }
          stream.getTracks().forEach(track => track.stop());
        }, 'image/jpeg', 0.8);
      };
    } catch (error) {
      console.error('Error capturing photo:', error);
    }
  };

  const processPhotoEvidence = async (photoBlob: Blob) => {
    // Get current location
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000
      });
    });
    
    const formData = new FormData();
    formData.append('photo', photoBlob);
    formData.append('coordinates', JSON.stringify({
      lat: position.coords.latitude,
      lng: position.coords.longitude
    }));
    formData.append('timestamp', new Date().toISOString());
    
    if (!isOnline) {
      // Store for later sync
      offlineDataRef.current.push({
        endpoint: '/api/photo-evidence',
        method: 'POST',
        payload: formData
      });
      return;
    }
    
    try {
      await fetch('/api/photo-evidence', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      queryClient.invalidateQueries({ queryKey: ["/api/photo-evidence"] });
    } catch (error) {
      console.error('Error uploading photo evidence:', error);
    }
  };

  const playAlertSound = () => {
    if (!audioEnabled) return;
    const audio = new Audio('/alert-sound.mp3');
    audio.play().catch(console.error);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_patrol': return 'bg-green-500';
      case 'responding': return 'bg-red-500';
      case 'investigating': return 'bg-orange-500';
      case 'available': return 'bg-blue-500';
      case 'off_duty': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredIncidents = liveIncidents.filter((incident: LiveIncident) => 
    filterSeverity === 'all' || incident.severity === filterSeverity
  );

  return (
    <div className="p-6 space-y-6 bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Real-Time Operations Center</h1>
          <p className="text-slate-400 text-lg">Live incident monitoring and field operations management</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <Alert className={`${isOnline ? 'bg-green-900 border-green-700' : 'bg-red-900 border-red-700'} text-white`}>
            <div className="flex items-center space-x-2">
              {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              <span className="text-sm font-medium">
                {isOnline ? 'Online' : 'Offline Mode'}
              </span>
            </div>
          </Alert>
          
          {/* Audio Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`${audioEnabled ? 'bg-green-700 border-green-600' : 'bg-gray-700 border-gray-600'} text-white`}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          
          {/* Quick Actions */}
          <div className="flex space-x-2">
            <Button
              className={`${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
              onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
            >
              <Mic className="w-4 h-4 mr-2" />
              {isRecording ? 'Stop Recording' : 'Voice Report'}
            </Button>
            
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={capturePhoto}
            >
              <Camera className="w-4 h-4 mr-2" />
              Capture Evidence
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="incidents" className="data-[state=active]:bg-blue-600">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Live Incidents ({filteredIncidents.length})
          </TabsTrigger>
          <TabsTrigger value="tracking" className="data-[state=active]:bg-blue-600">
            <Navigation className="w-4 h-4 mr-2" />
            GPS Tracking ({officerLocations.length})
          </TabsTrigger>
          <TabsTrigger value="voice" className="data-[state=active]:bg-blue-600">
            <Mic className="w-4 h-4 mr-2" />
            Voice Reports ({voiceReports.length})
          </TabsTrigger>
          <TabsTrigger value="evidence" className="data-[state=active]:bg-blue-600">
            <Camera className="w-4 h-4 mr-2" />
            Photo Evidence ({photoEvidence.length})
          </TabsTrigger>
        </TabsList>

        {/* Live Incidents Tab */}
        <TabsContent value="incidents" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-white">Live Incident Stream</h2>
            <div className="flex space-x-3">
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger className="w-32 bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="bg-slate-800 border-slate-700 text-white">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredIncidents.map((incident: LiveIncident) => (
              <Card key={incident.id} className="bg-slate-800 border-slate-700 hover:border-blue-500 transition-colors cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-white text-lg">{incident.type}</CardTitle>
                    <Badge className={`${getSeverityColor(incident.severity)} text-white`}>
                      {incident.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-400 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{format(new Date(incident.timestamp), 'HH:mm:ss')}</span>
                    <MapPin className="w-4 h-4 ml-2" />
                    <span>{incident.location}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 text-sm mb-4">{incident.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-slate-400">
                      Reported by: {incident.reportedBy}
                    </div>
                    <Badge variant="outline" className={`${
                      incident.status === 'active' ? 'border-red-500 text-red-400' :
                      incident.status === 'investigating' ? 'border-yellow-500 text-yellow-400' :
                      'border-green-500 text-green-400'
                    }`}>
                      {incident.status}
                    </Badge>
                  </div>
                  {incident.estimatedResponseTime && (
                    <div className="mt-2 text-xs text-blue-400">
                      ETA: {incident.estimatedResponseTime} minutes
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* GPS Tracking Tab */}
        <TabsContent value="tracking" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-white">Officer GPS Tracking</h2>
            <div className="flex space-x-3">
              <Select value={mapView} onValueChange={setMapView}>
                <SelectTrigger className="w-32 bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="street">Street View</SelectItem>
                  <SelectItem value="satellite">Satellite</SelectItem>
                  <SelectItem value="terrain">Terrain</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="bg-slate-800 border-slate-700 text-white">
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map Area */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-0">
                  <div className="h-96 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-slate-600 text-center">
                        <MapPin className="w-16 h-16 mx-auto mb-4" />
                        <p className="text-lg font-medium">Interactive GPS Map</p>
                        <p className="text-sm">Real-time officer location tracking</p>
                      </div>
                    </div>
                    
                    {/* Simulated officer markers */}
                    {officerLocations.slice(0, 5).map((officer, index) => (
                      <div
                        key={officer.id}
                        className={`absolute w-4 h-4 rounded-full ${getStatusColor(officer.status)} animate-pulse`}
                        style={{
                          left: `${20 + index * 15}%`,
                          top: `${30 + index * 10}%`
                        }}
                        title={officer.name}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Officer Status List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Active Officers</h3>
              {officerLocations.map((officer: OfficerLocation) => (
                <Card key={officer.id} className="bg-slate-700 border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-white font-medium">{officer.name}</h4>
                      <Badge className={`${getStatusColor(officer.status)} text-white text-xs`}>
                        {officer.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-xs text-slate-400">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3 h-3" />
                        <span>{officer.currentProperty || 'Mobile patrol'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3 h-3" />
                        <span>{format(new Date(officer.lastUpdate), 'HH:mm:ss')}</span>
                      </div>
                      {officer.speed && (
                        <div className="flex items-center space-x-2">
                          <Activity className="w-3 h-3" />
                          <span>{officer.speed} mph</span>
                        </div>
                      )}
                      {officer.batteryLevel && (
                        <div className="flex items-center space-x-2">
                          <span className="text-green-400">🔋 {officer.batteryLevel}%</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Voice Reports Tab */}
        <TabsContent value="voice" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-white">Voice-to-Text Reports</h2>
            <Button
              className={`${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
              onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
            >
              <Mic className="w-4 h-4 mr-2" />
              {isRecording ? 'Stop Recording' : 'New Voice Report'}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {voiceReports.map((report: VoiceReport) => (
              <Card key={report.id} className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-white text-lg">Voice Report #{report.id.slice(-6)}</CardTitle>
                    <Badge className={`${
                      report.status === 'completed' ? 'bg-green-600' :
                      report.status === 'transcribing' ? 'bg-yellow-600' :
                      report.status === 'failed' ? 'bg-red-600' :
                      'bg-blue-600'
                    } text-white`}>
                      {report.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-slate-400 text-sm">
                    <span>{format(new Date(report.timestamp), 'MMM dd, HH:mm')}</span>
                    <span>{report.duration}s</span>
                    {report.confidence && (
                      <span className="text-green-400">
                        {Math.round(report.confidence * 100)}% confidence
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {report.transcript && (
                    <div className="bg-slate-700 p-3 rounded mb-4">
                      <p className="text-slate-300 text-sm">{report.transcript}</p>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Officer: {report.officerId}</span>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="bg-slate-700 border-slate-600 text-white">
                        <Download className="w-4 h-4" />
                      </Button>
                      {report.incidentId && (
                        <Button size="sm" variant="outline" className="bg-slate-700 border-slate-600 text-blue-400">
                          View Incident
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Photo Evidence Tab */}
        <TabsContent value="evidence" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-white">Photo Evidence</h2>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={capturePhoto}
            >
              <Camera className="w-4 h-4 mr-2" />
              Capture Photo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {photoEvidence.map((photo: PhotoEvidence) => (
              <Card key={photo.id} className="bg-slate-800 border-slate-700">
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={photo.thumbnail || photo.imageUrl}
                      alt="Evidence"
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <Badge className={`absolute top-2 right-2 ${
                      photo.uploadStatus === 'completed' ? 'bg-green-600' :
                      photo.uploadStatus === 'uploading' ? 'bg-yellow-600' :
                      photo.uploadStatus === 'failed' ? 'bg-red-600' :
                      'bg-blue-600'
                    } text-white`}>
                      {photo.uploadStatus}
                    </Badge>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center space-x-2 text-slate-400 text-sm mb-2">
                      <Clock className="w-4 h-4" />
                      <span>{format(new Date(photo.timestamp), 'MMM dd, HH:mm')}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-400 text-sm mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {photo.coordinates.lat.toFixed(6)}, {photo.coordinates.lng.toFixed(6)}
                      </span>
                    </div>
                    {photo.description && (
                      <p className="text-slate-300 text-sm mb-3">{photo.description}</p>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-xs">Officer: {photo.officerId}</span>
                      <Button size="sm" variant="outline" className="bg-slate-700 border-slate-600 text-white">
                        <Maximize2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Offline Mode Indicator */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 bg-orange-600 text-white p-3 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-5 h-5" />
            <span className="font-medium">Offline Mode</span>
          </div>
          <p className="text-sm mt-1">
            Data will sync when connection is restored
            {offlineDataRef.current.length > 0 && (
              <span className="ml-1">({offlineDataRef.current.length} items queued)</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
