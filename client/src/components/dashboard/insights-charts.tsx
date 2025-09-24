
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from "recharts";

interface InsightsData {
  incidentTrends: Array<{
    month: string;
    incidents: number;
    resolved: number;
  }>;
  incidentTypes: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  responseTimeMetrics: Array<{
    week: string;
    avgResponseTime: number;
    target: number;
  }>;
  patrolEfficiency: Array<{
    officer: string;
    efficiency: number;
    hours: number;
  }>;
  propertyRiskLevels: Array<{
    riskLevel: string;
    count: number;
    color: string;
  }>;
  monthlyStats: Array<{
    month: string;
    patrols: number;
    incidents: number;
    revenue: number;
  }>;
}

const COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6',
  teal: '#14B8A6'
};

const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#14B8A6'];

export default function InsightsCharts() {
  const { data: insights, isLoading } = useQuery<InsightsData>({
    queryKey: ["/api/insights/charts"],
    queryFn: async () => {
      const response = await fetch("/api/insights/charts");
      if (!response.ok) {
        throw new Error("Failed to fetch insights data");
      }
      return response.json();
    },
    staleTime: 30000,
    cacheTime: 60000,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="senior-dashboard bg-card animate-pulse">
            <CardHeader>
              <div className="h-6 bg-slate-600 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-slate-600 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const mockData: InsightsData = insights || {
    incidentTrends: [
      { month: 'Jan', incidents: 45, resolved: 42 },
      { month: 'Feb', incidents: 38, resolved: 35 },
      { month: 'Mar', incidents: 52, resolved: 48 },
      { month: 'Apr', incidents: 41, resolved: 40 },
      { month: 'May', incidents: 35, resolved: 34 },
      { month: 'Jun', incidents: 29, resolved: 28 }
    ],
    incidentTypes: [
      { type: 'Theft', count: 45, percentage: 35 },
      { type: 'Vandalism', count: 32, percentage: 25 },
      { type: 'Trespassing', count: 28, percentage: 22 },
      { type: 'Assault', count: 15, percentage: 12 },
      { type: 'Other', count: 8, percentage: 6 }
    ],
    responseTimeMetrics: [
      { week: 'Week 1', avgResponseTime: 8.5, target: 10 },
      { week: 'Week 2', avgResponseTime: 7.2, target: 10 },
      { week: 'Week 3', avgResponseTime: 9.1, target: 10 },
      { week: 'Week 4', avgResponseTime: 6.8, target: 10 }
    ],
    patrolEfficiency: [
      { officer: 'Officer A', efficiency: 94, hours: 40 },
      { officer: 'Officer B', efficiency: 87, hours: 38 },
      { officer: 'Officer C', efficiency: 91, hours: 42 },
      { officer: 'Officer D', efficiency: 89, hours: 39 }
    ],
    propertyRiskLevels: [
      { riskLevel: 'Low Risk', count: 45, color: COLORS.success },
      { riskLevel: 'Medium Risk', count: 28, color: COLORS.warning },
      { riskLevel: 'High Risk', count: 12, color: COLORS.danger },
      { riskLevel: 'Critical', count: 3, color: '#991B1B' }
    ],
    monthlyStats: [
      { month: 'Jan', patrols: 156, incidents: 45, revenue: 125000 },
      { month: 'Feb', patrols: 142, incidents: 38, revenue: 118000 },
      { month: 'Mar', patrols: 168, incidents: 52, revenue: 135000 },
      { month: 'Apr', patrols: 159, incidents: 41, revenue: 128000 },
      { month: 'May', patrols: 174, incidents: 35, revenue: 142000 },
      { month: 'Jun', patrols: 181, incidents: 29, revenue: 148000 }
    ]
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-white mb-4">SECURITY INSIGHTS & ANALYTICS</h2>
        <p className="card-description text-xl">Visual analysis of security operations and trends</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Incident Trends */}
        <Card className="senior-dashboard bg-card">
          <CardHeader>
            <CardTitle className="text-2xl text-white text-center">INCIDENT TRENDS (6 MONTHS)</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ChartContainer
              config={{
                incidents: { label: "Total Incidents", color: COLORS.danger },
                resolved: { label: "Resolved", color: COLORS.success }
              }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockData.incidentTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: '#D1D5DB', fontSize: 14, fontWeight: 'bold' }}
                    axisLine={{ stroke: '#6B7280' }}
                  />
                  <YAxis 
                    tick={{ fill: '#D1D5DB', fontSize: 14, fontWeight: 'bold' }}
                    axisLine={{ stroke: '#6B7280' }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="incidents" fill={COLORS.danger} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="resolved" fill={COLORS.success} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Incident Types Distribution */}
        <Card className="senior-dashboard bg-card">
          <CardHeader>
            <CardTitle className="text-2xl text-white text-center">INCIDENT TYPES BREAKDOWN</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ChartContainer
              config={{
                count: { label: "Count", color: COLORS.primary }
              }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockData.incidentTypes}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ type, percentage }) => `${type}: ${percentage}%`}
                    labelLine={false}
                  >
                    {mockData.incidentTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Response Time Metrics */}
        <Card className="senior-dashboard bg-card">
          <CardHeader>
            <CardTitle className="text-2xl text-white text-center">RESPONSE TIME PERFORMANCE</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ChartContainer
              config={{
                avgResponseTime: { label: "Avg Response (min)", color: COLORS.primary },
                target: { label: "Target (min)", color: COLORS.warning }
              }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData.responseTimeMetrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="week" 
                    tick={{ fill: '#D1D5DB', fontSize: 14, fontWeight: 'bold' }}
                    axisLine={{ stroke: '#6B7280' }}
                  />
                  <YAxis 
                    tick={{ fill: '#D1D5DB', fontSize: 14, fontWeight: 'bold' }}
                    axisLine={{ stroke: '#6B7280' }}
                    label={{ value: 'Minutes', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#D1D5DB' } }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="avgResponseTime" 
                    stroke={COLORS.primary} 
                    strokeWidth={4}
                    dot={{ r: 6, fill: COLORS.primary }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    stroke={COLORS.warning} 
                    strokeWidth={3}
                    strokeDasharray="8 8"
                    dot={{ r: 4, fill: COLORS.warning }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Patrol Efficiency */}
        <Card className="senior-dashboard bg-card">
          <CardHeader>
            <CardTitle className="text-2xl text-white text-center">PATROL EFFICIENCY RATINGS</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ChartContainer
              config={{
                efficiency: { label: "Efficiency %", color: COLORS.success }
              }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockData.patrolEfficiency} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    type="number" 
                    domain={[0, 100]}
                    tick={{ fill: '#D1D5DB', fontSize: 14, fontWeight: 'bold' }}
                    axisLine={{ stroke: '#6B7280' }}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="officer"
                    tick={{ fill: '#D1D5DB', fontSize: 14, fontWeight: 'bold' }}
                    axisLine={{ stroke: '#6B7280' }}
                    width={100}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="efficiency" 
                    fill={COLORS.success} 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Property Risk Levels */}
        <Card className="senior-dashboard bg-card">
          <CardHeader>
            <CardTitle className="text-2xl text-white text-center">PROPERTY RISK ASSESSMENT</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {mockData.propertyRiskLevels.map((risk, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-white">{risk.riskLevel}</span>
                    <span className="text-2xl font-bold text-white">{risk.count}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-6">
                    <div
                      className="h-6 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${(risk.count / 88) * 100}%`,
                        backgroundColor: risk.color
                      }}
                    />
                  </div>
                  <div className="text-lg text-slate-400">
                    {Math.round((risk.count / 88) * 100)}% of total properties
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Operations Overview */}
        <Card className="senior-dashboard bg-card">
          <CardHeader>
            <CardTitle className="text-2xl text-white text-center">MONTHLY OPERATIONS OVERVIEW</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ChartContainer
              config={{
                patrols: { label: "Patrols", color: COLORS.primary },
                incidents: { label: "Incidents", color: COLORS.danger }
              }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockData.monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: '#D1D5DB', fontSize: 14, fontWeight: 'bold' }}
                    axisLine={{ stroke: '#6B7280' }}
                  />
                  <YAxis 
                    tick={{ fill: '#D1D5DB', fontSize: 14, fontWeight: 'bold' }}
                    axisLine={{ stroke: '#6B7280' }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area 
                    type="monotone" 
                    dataKey="patrols" 
                    stackId="1"
                    stroke={COLORS.primary} 
                    fill={COLORS.primary}
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="incidents" 
                    stackId="2"
                    stroke={COLORS.danger} 
                    fill={COLORS.danger}
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Key Performance Indicators */}
      <Card className="senior-dashboard bg-card">
        <CardHeader>
          <CardTitle className="text-3xl text-white text-center">KEY PERFORMANCE INDICATORS</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-white">94%</span>
              </div>
              <h3 className="card-title mb-2">INCIDENT RESOLUTION</h3>
              <p className="card-description">Average resolution rate</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-white">7.4</span>
              </div>
              <h3 className="card-title mb-2">RESPONSE TIME</h3>
              <p className="card-description">Minutes average</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-white">88</span>
              </div>
              <h3 className="card-title mb-2">PROPERTIES SECURED</h3>
              <p className="card-description">Under active protection</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-white">97%</span>
              </div>
              <h3 className="card-title mb-2">CLIENT SATISFACTION</h3>
              <p className="card-description">Customer feedback score</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
