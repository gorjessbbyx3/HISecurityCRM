
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, AreaChart, Area, ScatterChart, Scatter } from "recharts";
import { useState } from "react";

interface HeatMapData {
  location: string;
  incidents: number;
  patrolCoverage: number;
  riskScore: number;
  coordinates: { lat: number; lng: number };
}

interface PerformanceMetrics {
  officerId: string;
  name: string;
  responseTime: number;
  incidentsHandled: number;
  patrolEfficiency: number;
  clientSatisfaction: number;
  hoursWorked: number;
  overtimeHours: number;
  kpiScore: number;
}

interface TrendData {
  month: string;
  year: number;
  incidents: number;
  crimeTypes: Record<string, number>;
  seasonalIndex: number;
  weatherFactor: number;
}

interface CostAnalysis {
  category: string;
  investment: number;
  roi: number;
  costPerIncident: number;
  savings: number;
  efficiency: number;
}

export default function AdvancedAnalytics() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("30");
  const [selectedMetric, setSelectedMetric] = useState("all");

  const { data: heatMapData = [], isLoading: heatMapLoading } = useQuery({
    queryKey: ["/api/analytics/heatmap", selectedTimeframe],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/heatmap?days=${selectedTimeframe}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch heat map data');
      return response.json();
    },
  });

  const { data: performanceMetrics = [], isLoading: performanceLoading } = useQuery({
    queryKey: ["/api/analytics/performance", selectedTimeframe],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/performance?days=${selectedTimeframe}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch performance metrics');
      return response.json();
    },
  });

  const { data: trendData = [], isLoading: trendLoading } = useQuery({
    queryKey: ["/api/analytics/trends"],
    queryFn: async () => {
      const response = await fetch('/api/analytics/trends', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch trend data');
      return response.json();
    },
  });

  const { data: costAnalysis = [], isLoading: costLoading } = useQuery({
    queryKey: ["/api/analytics/cost-analysis"],
    queryFn: async () => {
      const response = await fetch('/api/analytics/cost-analysis', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch cost analysis');
      return response.json();
    },
  });

  // Mock data for demonstration
  const mockHeatMapData: HeatMapData[] = [
    { location: "Waikiki Beach", incidents: 45, patrolCoverage: 85, riskScore: 7.2, coordinates: { lat: 21.2793, lng: -157.8311 } },
    { location: "Downtown Honolulu", incidents: 32, patrolCoverage: 92, riskScore: 6.1, coordinates: { lat: 21.3099, lng: -157.8581 } },
    { location: "Ala Moana", incidents: 28, patrolCoverage: 78, riskScore: 5.8, coordinates: { lat: 21.2911, lng: -157.8420 } },
    { location: "Pearl Harbor", incidents: 15, patrolCoverage: 95, riskScore: 3.2, coordinates: { lat: 21.3731, lng: -157.9519 } },
    { location: "Diamond Head", incidents: 22, patrolCoverage: 70, riskScore: 4.9, coordinates: { lat: 21.2620, lng: -157.8055 } },
  ];

  const mockPerformanceMetrics: PerformanceMetrics[] = [
    { officerId: "OFF001", name: "John Smith", responseTime: 7.2, incidentsHandled: 28, patrolEfficiency: 94, clientSatisfaction: 96, hoursWorked: 168, overtimeHours: 8, kpiScore: 92 },
    { officerId: "OFF002", name: "Sarah Johnson", responseTime: 8.1, incidentsHandled: 24, patrolEfficiency: 89, clientSatisfaction: 94, hoursWorked: 160, overtimeHours: 4, kpiScore: 88 },
    { officerId: "OFF003", name: "Mike Wilson", responseTime: 6.8, incidentsHandled: 31, patrolEfficiency: 96, clientSatisfaction: 98, hoursWorked: 172, overtimeHours: 12, kpiScore: 95 },
    { officerId: "OFF004", name: "Lisa Chen", responseTime: 9.2, incidentsHandled: 19, patrolEfficiency: 85, clientSatisfaction: 91, hoursWorked: 156, overtimeHours: 2, kpiScore: 84 },
  ];

  const mockTrendData: TrendData[] = trendData.length > 0 ? trendData : [
    { month: "Jan", year: 2024, incidents: 145, crimeTypes: { theft: 45, vandalism: 32, trespassing: 28, assault: 15, other: 25 }, seasonalIndex: 0.8, weatherFactor: 0.9 },
    { month: "Feb", year: 2024, incidents: 132, crimeTypes: { theft: 42, vandalism: 28, trespassing: 25, assault: 12, other: 25 }, seasonalIndex: 0.8, weatherFactor: 0.85 },
    { month: "Mar", year: 2024, incidents: 158, crimeTypes: { theft: 52, vandalism: 35, trespassing: 31, assault: 18, other: 22 }, seasonalIndex: 1.0, weatherFactor: 0.95 },
    { month: "Apr", year: 2024, incidents: 142, crimeTypes: { theft: 48, vandalism: 30, trespassing: 28, assault: 16, other: 20 }, seasonalIndex: 1.1, weatherFactor: 1.0 },
    { month: "May", year: 2024, incidents: 136, crimeTypes: { theft: 45, vandalism: 28, trespassing: 26, assault: 14, other: 23 }, seasonalIndex: 1.2, weatherFactor: 1.1 },
    { month: "Jun", year: 2024, incidents: 165, crimeTypes: { theft: 58, vandalism: 38, trespassing: 32, assault: 20, other: 17 }, seasonalIndex: 1.3, weatherFactor: 1.2 },
  ];

  const mockCostAnalysis: CostAnalysis[] = [
    { category: "Patrol Operations", investment: 450000, roi: 2.3, costPerIncident: 285, savings: 125000, efficiency: 87 },
    { category: "Technology Systems", investment: 180000, roi: 3.1, costPerIncident: 115, savings: 95000, efficiency: 92 },
    { category: "Training Programs", investment: 75000, roi: 4.2, costPerIncident: 48, savings: 65000, efficiency: 95 },
    { category: "Equipment & Vehicles", investment: 320000, roi: 1.8, costPerIncident: 205, savings: 85000, efficiency: 82 },
    { category: "Personnel", investment: 1200000, roi: 2.7, costPerIncident: 765, savings: 280000, efficiency: 89 },
  ];

  return (
    <div className="p-6 space-y-6 bg-slate-900 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Advanced Analytics Dashboard</h1>
          <p className="text-slate-400 text-lg">Comprehensive security intelligence and performance analysis</p>
        </div>
        <div className="flex space-x-3">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32 bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="7">7 Days</SelectItem>
              <SelectItem value="30">30 Days</SelectItem>
              <SelectItem value="90">90 Days</SelectItem>
              <SelectItem value="365">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <i className="fas fa-download mr-2"></i>
            Export Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="heatmap" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full bg-slate-800 border-slate-700">
          <TabsTrigger value="heatmap" className="text-white data-[state=active]:bg-blue-600">Heat Maps</TabsTrigger>
          <TabsTrigger value="performance" className="text-white data-[state=active]:bg-blue-600">Performance</TabsTrigger>
          <TabsTrigger value="trends" className="text-white data-[state=active]:bg-blue-600">Trends</TabsTrigger>
          <TabsTrigger value="cost" className="text-white data-[state=active]:bg-blue-600">Cost Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="heatmap" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Crime Density Heat Map</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-700 rounded-lg h-96 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <i className="fas fa-map-marked-alt text-6xl text-red-500 mb-4"></i>
                      <p className="text-white font-bold text-xl">Interactive Crime Heat Map</p>
                      <p className="text-slate-400">Geographic incident density visualization</p>
                    </div>
                  </div>
                  
                  {/* Heat map markers */}
                  {mockHeatMapData.map((point, index) => (
                    <div
                      key={index}
                      className="absolute w-6 h-6 rounded-full animate-pulse"
                      style={{
                        backgroundColor: `rgba(239, 68, 68, ${point.riskScore / 10})`,
                        left: `${20 + index * 15}%`,
                        top: `${25 + (index % 3) * 20}%`,
                        boxShadow: `0 0 ${point.riskScore * 3}px rgba(239, 68, 68, 0.6)`
                      }}
                    />
                  ))}
                </div>
                
                <div className="mt-4 flex justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-slate-300">Low Risk (1-3)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                    <span className="text-slate-300">Medium Risk (4-6)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span className="text-slate-300">High Risk (7-10)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-xl text-white">Location Risk Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockHeatMapData.map((location, index) => (
                    <div key={index} className="p-3 bg-slate-700 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-white font-medium">{location.location}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          location.riskScore >= 7 ? 'bg-red-600 text-white' :
                          location.riskScore >= 4 ? 'bg-yellow-600 text-white' :
                          'bg-green-600 text-white'
                        }`}>
                          {location.riskScore.toFixed(1)}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Incidents:</span>
                          <span className="text-white">{location.incidents}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Coverage:</span>
                          <span className="text-white">{location.patrolCoverage}%</span>
                        </div>
                        <div className="w-full bg-slate-600 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${location.patrolCoverage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-xl text-white">Officer Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    kpiScore: { label: "KPI Score", color: "#3B82F6" },
                    responseTime: { label: "Response Time", color: "#EF4444" }
                  }}
                  className="h-80"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockPerformanceMetrics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: '#D1D5DB', fontSize: 12 }}
                        axisLine={{ stroke: '#6B7280' }}
                      />
                      <YAxis 
                        tick={{ fill: '#D1D5DB', fontSize: 12 }}
                        axisLine={{ stroke: '#6B7280' }}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="kpiScore" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-xl text-white">Efficiency vs Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    efficiency: { label: "Patrol Efficiency", color: "#10B981" },
                    responseTime: { label: "Response Time", color: "#F59E0B" }
                  }}
                  className="h-80"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart data={mockPerformanceMetrics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="responseTime" 
                        tick={{ fill: '#D1D5DB', fontSize: 12 }}
                        axisLine={{ stroke: '#6B7280' }}
                        label={{ value: 'Response Time (min)', position: 'insideBottom', offset: -5, style: { fill: '#D1D5DB' } }}
                      />
                      <YAxis 
                        dataKey="patrolEfficiency"
                        tick={{ fill: '#D1D5DB', fontSize: 12 }}
                        axisLine={{ stroke: '#6B7280' }}
                        label={{ value: 'Efficiency (%)', angle: -90, position: 'insideLeft', style: { fill: '#D1D5DB' } }}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Scatter dataKey="patrolEfficiency" fill="#10B981" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-xl text-white">Detailed Performance Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left text-slate-400 p-3">Officer</th>
                        <th className="text-center text-slate-400 p-3">Response Time</th>
                        <th className="text-center text-slate-400 p-3">Incidents</th>
                        <th className="text-center text-slate-400 p-3">Efficiency</th>
                        <th className="text-center text-slate-400 p-3">Satisfaction</th>
                        <th className="text-center text-slate-400 p-3">KPI Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockPerformanceMetrics.map((officer) => (
                        <tr key={officer.officerId} className="border-b border-slate-700">
                          <td className="text-white p-3 font-medium">{officer.name}</td>
                          <td className="text-center p-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              officer.responseTime <= 7 ? 'bg-green-600 text-white' :
                              officer.responseTime <= 9 ? 'bg-yellow-600 text-white' :
                              'bg-red-600 text-white'
                            }`}>
                              {officer.responseTime.toFixed(1)}m
                            </span>
                          </td>
                          <td className="text-center text-white p-3">{officer.incidentsHandled}</td>
                          <td className="text-center text-white p-3">{officer.patrolEfficiency}%</td>
                          <td className="text-center text-white p-3">{officer.clientSatisfaction}%</td>
                          <td className="text-center p-3">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              officer.kpiScore >= 90 ? 'bg-green-600 text-white' :
                              officer.kpiScore >= 80 ? 'bg-yellow-600 text-white' :
                              'bg-red-600 text-white'
                            }`}>
                              {officer.kpiScore}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-xl text-white">Incident Trends with Seasonal Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    incidents: { label: "Incidents", color: "#EF4444" },
                    seasonalIndex: { label: "Seasonal Index", color: "#8B5CF6" }
                  }}
                  className="h-80"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fill: '#D1D5DB', fontSize: 12 }}
                        axisLine={{ stroke: '#6B7280' }}
                      />
                      <YAxis 
                        tick={{ fill: '#D1D5DB', fontSize: 12 }}
                        axisLine={{ stroke: '#6B7280' }}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area 
                        type="monotone" 
                        dataKey="incidents" 
                        stroke="#EF4444" 
                        fill="#EF4444" 
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-xl text-white">Crime Type Distribution Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    theft: { label: "Theft", color: "#EF4444" },
                    vandalism: { label: "Vandalism", color: "#F59E0B" },
                    trespassing: { label: "Trespassing", color: "#3B82F6" },
                    assault: { label: "Assault", color: "#8B5CF6" },
                    other: { label: "Other", color: "#6B7280" }
                  }}
                  className="h-80"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockTrendData.map(d => ({ 
                      month: d.month, 
                      ...d.crimeTypes 
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fill: '#D1D5DB', fontSize: 12 }}
                        axisLine={{ stroke: '#6B7280' }}
                      />
                      <YAxis 
                        tick={{ fill: '#D1D5DB', fontSize: 12 }}
                        axisLine={{ stroke: '#6B7280' }}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area type="monotone" dataKey="theft" stackId="1" stroke="#EF4444" fill="#EF4444" />
                      <Area type="monotone" dataKey="vandalism" stackId="1" stroke="#F59E0B" fill="#F59E0B" />
                      <Area type="monotone" dataKey="trespassing" stackId="1" stroke="#3B82F6" fill="#3B82F6" />
                      <Area type="monotone" dataKey="assault" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" />
                      <Area type="monotone" dataKey="other" stackId="1" stroke="#6B7280" fill="#6B7280" />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-xl text-white">Predictive Analysis & Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Weather Correlation</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
                        <span className="text-slate-300">Rainy Days</span>
                        <span className="text-green-400">-15% incidents</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
                        <span className="text-slate-300">Hot Days (&gt;85°F)</span>
                        <span className="text-red-400">+22% incidents</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
                        <span className="text-slate-300">Weekend Events</span>
                        <span className="text-yellow-400">+35% incidents</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Seasonal Patterns</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-slate-700 rounded">
                        <div className="text-white font-medium">Summer Peak</div>
                        <div className="text-slate-400 text-sm">June-August: +30% incidents</div>
                        <div className="text-blue-400 text-sm">Increase tourist patrols</div>
                      </div>
                      <div className="p-3 bg-slate-700 rounded">
                        <div className="text-white font-medium">Holiday Spikes</div>
                        <div className="text-slate-400 text-sm">Dec 20-Jan 5: +45% incidents</div>
                        <div className="text-blue-400 text-sm">Deploy additional officers</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">AI Recommendations</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-900/30 border border-blue-700 rounded">
                        <div className="text-blue-300 font-medium">Optimal Patrol Times</div>
                        <div className="text-slate-400 text-sm">2-6 PM & 10 PM-2 AM</div>
                      </div>
                      <div className="p-3 bg-yellow-900/30 border border-yellow-700 rounded">
                        <div className="text-yellow-300 font-medium">Resource Allocation</div>
                        <div className="text-slate-400 text-sm">Shift 20% to high-risk zones</div>
                      </div>
                      <div className="p-3 bg-green-900/30 border border-green-700 rounded">
                        <div className="text-green-300 font-medium">Prevention Focus</div>
                        <div className="text-slate-400 text-sm">Target vandalism hotspots</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cost" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-xl text-white">ROI by Investment Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    roi: { label: "ROI", color: "#10B981" },
                    investment: { label: "Investment", color: "#3B82F6" }
                  }}
                  className="h-80"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockCostAnalysis}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="category" 
                        tick={{ fill: '#D1D5DB', fontSize: 10 }}
                        axisLine={{ stroke: '#6B7280' }}
                        angle={-45}
                        textAnchor="end"
                        height={100}
                      />
                      <YAxis 
                        tick={{ fill: '#D1D5DB', fontSize: 12 }}
                        axisLine={{ stroke: '#6B7280' }}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="roi" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-xl text-white">Cost per Incident Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    costPerIncident: { label: "Cost per Incident", color: "#F59E0B" },
                    efficiency: { label: "Efficiency", color: "#8B5CF6" }
                  }}
                  className="h-80"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockCostAnalysis}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="category" 
                        tick={{ fill: '#D1D5DB', fontSize: 10 }}
                        axisLine={{ stroke: '#6B7280' }}
                        angle={-45}
                        textAnchor="end"
                        height={100}
                      />
                      <YAxis 
                        tick={{ fill: '#D1D5DB', fontSize: 12 }}
                        axisLine={{ stroke: '#6B7280' }}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="costPerIncident" 
                        stroke="#F59E0B" 
                        strokeWidth={3}
                        dot={{ r: 6, fill: "#F59E0B" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-xl text-white">Investment Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-slate-700 rounded-lg">
                    <div className="text-3xl font-bold text-green-400 mb-2">$655K</div>
                    <div className="text-slate-300">Total Savings</div>
                    <div className="text-sm text-slate-400">Achieved in 2024</div>
                  </div>
                  <div className="text-center p-4 bg-slate-700 rounded-lg">
                    <div className="text-3xl font-bold text-blue-400 mb-2">2.6x</div>
                    <div className="text-slate-300">Average ROI</div>
                    <div className="text-sm text-slate-400">Across all investments</div>
                  </div>
                  <div className="text-center p-4 bg-slate-700 rounded-lg">
                    <div className="text-3xl font-bold text-purple-400 mb-2">89%</div>
                    <div className="text-slate-300">Efficiency Score</div>
                    <div className="text-sm text-slate-400">Operations effectiveness</div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left text-slate-400 p-3">Category</th>
                        <th className="text-center text-slate-400 p-3">Investment</th>
                        <th className="text-center text-slate-400 p-3">ROI</th>
                        <th className="text-center text-slate-400 p-3">Cost/Incident</th>
                        <th className="text-center text-slate-400 p-3">Savings</th>
                        <th className="text-center text-slate-400 p-3">Efficiency</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockCostAnalysis.map((item, index) => (
                        <tr key={index} className="border-b border-slate-700">
                          <td className="text-white p-3 font-medium">{item.category}</td>
                          <td className="text-center text-white p-3">${(item.investment / 1000).toFixed(0)}K</td>
                          <td className="text-center p-3">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              item.roi >= 3 ? 'bg-green-600 text-white' :
                              item.roi >= 2 ? 'bg-yellow-600 text-white' :
                              'bg-red-600 text-white'
                            }`}>
                              {item.roi.toFixed(1)}x
                            </span>
                          </td>
                          <td className="text-center text-white p-3">${item.costPerIncident}</td>
                          <td className="text-center text-green-400 p-3">${(item.savings / 1000).toFixed(0)}K</td>
                          <td className="text-center text-white p-3">{item.efficiency}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
