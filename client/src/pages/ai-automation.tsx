
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Target,
  Calendar,
  MapPin,
  Activity,
  Shield,
  Zap,
  Clock,
  Users,
  Settings,
  ChevronRight,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw
} from "lucide-react";
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';

interface PredictiveAnalysis {
  id: string;
  type: 'crime_pattern' | 'hotspot_prediction' | 'risk_assessment' | 'resource_optimization';
  title: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  timeframe: string;
  location?: string;
  findings: string[];
  recommendations: string[];
  generatedAt: string;
  status: 'analyzing' | 'completed' | 'monitoring' | 'expired';
}

interface SmartAlert {
  id: string;
  type: 'anomaly_detected' | 'pattern_deviation' | 'risk_threshold' | 'prediction_triggered';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  confidence: number;
  location?: string;
  timestamp: string;
  aiModel: string;
  actionRequired: boolean;
  relatedIncidents: string[];
}

interface AutomatedSchedule {
  id: string;
  title: string;
  type: 'patrol_optimization' | 'shift_balancing' | 'resource_allocation' | 'coverage_gap_fix';
  scheduleDate: string;
  optimizationScore: number;
  staffEfficiency: number;
  coverageImprovement: number;
  costSavings: number;
  generatedBy: 'ai_scheduler' | 'pattern_analysis' | 'workload_optimizer';
  status: 'proposed' | 'approved' | 'active' | 'completed';
  affectedStaff: number;
  affectedProperties: number;
}

interface RiskAssessment {
  propertyId: string;
  propertyName: string;
  currentRiskScore: number;
  previousRiskScore: number;
  riskTrend: 'increasing' | 'decreasing' | 'stable';
  riskFactors: {
    factor: string;
    impact: number;
    confidence: number;
  }[];
  lastUpdated: string;
  nextAssessment: string;
  recommendedActions: string[];
}

export default function AIAutomation() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("7");
  const [selectedAIModel, setSelectedAIModel] = useState("all");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Predictive Analytics Data
  const { data: predictiveAnalyses = [], isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/ai/predictive-analytics", selectedTimeframe],
    queryFn: async () => {
      const response = await fetch(`/api/ai/predictive-analytics?days=${selectedTimeframe}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch predictive analytics');
      return response.json();
    },
    refetchInterval: autoRefresh ? 30000 : false,
  });

  // Smart Alerts Data
  const { data: smartAlerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ["/api/ai/smart-alerts"],
    queryFn: async () => {
      const response = await fetch('/api/ai/smart-alerts', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch smart alerts');
      return response.json();
    },
    refetchInterval: autoRefresh ? 15000 : false,
  });

  // Automated Scheduling Data
  const { data: automatedSchedules = [], isLoading: schedulingLoading } = useQuery({
    queryKey: ["/api/ai/automated-schedules"],
    queryFn: async () => {
      const response = await fetch('/api/ai/automated-schedules', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch automated schedules');
      return response.json();
    },
    refetchInterval: autoRefresh ? 60000 : false,
  });

  // Risk Assessments Data
  const { data: riskAssessments = [], isLoading: riskLoading } = useQuery({
    queryKey: ["/api/ai/risk-assessments"],
    queryFn: async () => {
      const response = await fetch('/api/ai/risk-assessments', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch risk assessments');
      return response.json();
    },
    refetchInterval: autoRefresh ? 45000 : false,
  });

  // Mock data for demonstration
  const mockPredictiveData = [
    {
      id: "pred-001",
      type: "crime_pattern",
      title: "Vehicle Break-in Pattern Detected",
      confidence: 87,
      impact: "high",
      timeframe: "Next 48 hours",
      location: "Downtown Parking District",
      findings: [
        "Increased incidents during lunch hours (11AM-2PM)",
        "Targeting vehicles with visible electronics",
        "Pattern consistent with previous holiday periods"
      ],
      recommendations: [
        "Increase patrol frequency in identified hotspots",
        "Deploy undercover units during peak times",
        "Issue public awareness alerts about vehicle security"
      ],
      generatedAt: new Date().toISOString(),
      status: "monitoring"
    },
    {
      id: "pred-002",
      type: "hotspot_prediction",
      title: "Emerging Crime Hotspot",
      confidence: 73,
      impact: "medium",
      timeframe: "Next 7 days",
      location: "Ala Moana Shopping Area",
      findings: [
        "30% increase in reported incidents",
        "Peak activity during evening hours",
        "Correlation with nearby construction activity"
      ],
      recommendations: [
        "Establish temporary patrol base",
        "Coordinate with construction site security",
        "Install additional surveillance cameras"
      ],
      generatedAt: new Date(Date.now() - 3600000).toISOString(),
      status: "completed"
    }
  ];

  const mockSmartAlerts = [
    {
      id: "alert-001",
      type: "anomaly_detected",
      title: "Unusual Activity Pattern",
      description: "AI detected 40% increase in trespassing incidents at Waikiki Beach area compared to historical average",
      severity: "warning",
      confidence: 82,
      location: "Waikiki Beach",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      aiModel: "Pattern Recognition v2.1",
      actionRequired: true,
      relatedIncidents: ["INC-2024-0891", "INC-2024-0892"]
    },
    {
      id: "alert-002",
      type: "risk_threshold",
      title: "Property Risk Score Exceeded",
      description: "Diamond Head Property risk score increased to 8.2/10, triggering high-risk protocol",
      severity: "critical",
      confidence: 94,
      location: "Diamond Head Property",
      timestamp: new Date(Date.now() - 900000).toISOString(),
      aiModel: "Risk Assessment AI v3.0",
      actionRequired: true,
      relatedIncidents: ["INC-2024-0890"]
    }
  ];

  const mockAutomatedSchedules = [
    {
      id: "sched-001",
      title: "Optimized Weekend Patrol Schedule",
      type: "patrol_optimization",
      scheduleDate: "2024-02-03",
      optimizationScore: 94,
      staffEfficiency: 87,
      coverageImprovement: 23,
      costSavings: 1250,
      generatedBy: "ai_scheduler",
      status: "proposed",
      affectedStaff: 12,
      affectedProperties: 8
    },
    {
      id: "sched-002",
      title: "Coverage Gap Resolution",
      type: "coverage_gap_fix",
      scheduleDate: "2024-02-05",
      optimizationScore: 89,
      staffEfficiency: 92,
      coverageImprovement: 31,
      costSavings: 850,
      generatedBy: "pattern_analysis",
      status: "approved",
      affectedStaff: 6,
      affectedProperties: 4
    }
  ];

  const mockRiskAssessments = [
    {
      propertyId: "prop-001",
      propertyName: "Waikiki Beach Resort",
      currentRiskScore: 7.2,
      previousRiskScore: 6.8,
      riskTrend: "increasing",
      riskFactors: [
        { factor: "High foot traffic", impact: 0.8, confidence: 92 },
        { factor: "Recent incidents", impact: 0.6, confidence: 87 },
        { factor: "Limited lighting", impact: 0.4, confidence: 78 }
      ],
      lastUpdated: new Date(Date.now() - 7200000).toISOString(),
      nextAssessment: new Date(Date.now() + 86400000).toISOString(),
      recommendedActions: [
        "Increase evening patrol frequency",
        "Install additional lighting",
        "Review security camera coverage"
      ]
    },
    {
      propertyId: "prop-002",
      propertyName: "Downtown Office Complex",
      currentRiskScore: 4.3,
      previousRiskScore: 5.1,
      riskTrend: "decreasing",
      riskFactors: [
        { factor: "Improved access control", impact: -0.3, confidence: 95 },
        { factor: "Regular maintenance", impact: -0.2, confidence: 88 },
        { factor: "Staff training", impact: -0.3, confidence: 91 }
      ],
      lastUpdated: new Date(Date.now() - 3600000).toISOString(),
      nextAssessment: new Date(Date.now() + 86400000).toISOString(),
      recommendedActions: [
        "Maintain current security protocols",
        "Continue staff training program"
      ]
    }
  ];

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-400';
    if (confidence >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'info': return <Activity className="w-5 h-5 text-blue-400" />;
      default: return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="p-6 space-y-6 bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">AI & Automation Center</h1>
          <p className="text-slate-400 text-lg">Intelligent security operations powered by machine learning</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 text-sm">Auto-refresh:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`${autoRefresh ? 'bg-green-700 border-green-600' : 'bg-gray-700 border-gray-600'} text-white`}
            >
              {autoRefresh ? 'ON' : 'OFF'}
            </Button>
          </div>
          
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32 bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="1">1 Day</SelectItem>
              <SelectItem value="7">7 Days</SelectItem>
              <SelectItem value="30">30 Days</SelectItem>
              <SelectItem value="90">90 Days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Settings className="w-4 h-4 mr-2" />
            AI Settings
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active Predictions</p>
                <p className="text-3xl font-bold text-white">{mockPredictiveData.length}</p>
              </div>
              <Brain className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Smart Alerts</p>
                <p className="text-3xl font-bold text-white">{mockSmartAlerts.length}</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Automated Schedules</p>
                <p className="text-3xl font-bold text-white">{mockAutomatedSchedules.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Risk Assessments</p>
                <p className="text-3xl font-bold text-white">{mockRiskAssessments.length}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="predictive" className="space-y-6">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="predictive" className="data-[state=active]:bg-blue-600">
            <TrendingUp className="w-4 h-4 mr-2" />
            Predictive Analytics
          </TabsTrigger>
          <TabsTrigger value="alerts" className="data-[state=active]:bg-blue-600">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Smart Alerts
          </TabsTrigger>
          <TabsTrigger value="scheduling" className="data-[state=active]:bg-blue-600">
            <Calendar className="w-4 h-4 mr-2" />
            Automated Scheduling
          </TabsTrigger>
          <TabsTrigger value="risk" className="data-[state=active]:bg-blue-600">
            <Target className="w-4 h-4 mr-2" />
            Risk Assessment
          </TabsTrigger>
        </TabsList>

        {/* Predictive Analytics Tab */}
        <TabsContent value="predictive" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-white">Predictive Analytics</h2>
            <Button variant="outline" size="sm" className="bg-slate-800 border-slate-700 text-white">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Analysis
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockPredictiveData.map((analysis) => (
              <Card key={analysis.id} className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-white text-lg">{analysis.title}</CardTitle>
                    <div className="flex space-x-2">
                      <Badge className={`${getImpactColor(analysis.impact)} text-white`}>
                        {analysis.impact.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className={`${getConfidenceColor(analysis.confidence)} border-current`}>
                        {analysis.confidence}% confidence
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-slate-400 text-sm">
                    <span>{analysis.timeframe}</span>
                    {analysis.location && (
                      <>
                        <MapPin className="w-4 h-4" />
                        <span>{analysis.location}</span>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-white font-medium mb-2">Key Findings:</h4>
                      <ul className="space-y-1">
                        {analysis.findings.map((finding, index) => (
                          <li key={index} className="text-slate-300 text-sm flex items-start">
                            <span className="text-blue-400 mr-2">•</span>
                            {finding}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-white font-medium mb-2">Recommendations:</h4>
                      <ul className="space-y-1">
                        {analysis.recommendations.slice(0, 2).map((rec, index) => (
                          <li key={index} className="text-slate-300 text-sm flex items-start">
                            <ChevronRight className="w-4 h-4 text-green-400 mr-1 flex-shrink-0 mt-0.5" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-slate-700">
                      <span className="text-slate-400 text-sm">
                        Generated: {new Date(analysis.generatedAt).toLocaleString()}
                      </span>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Smart Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-white">Smart Alerts</h2>
            <div className="flex space-x-3">
              <Select value={selectedAIModel} onValueChange={setSelectedAIModel}>
                <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Models</SelectItem>
                  <SelectItem value="pattern">Pattern Recognition</SelectItem>
                  <SelectItem value="risk">Risk Assessment</SelectItem>
                  <SelectItem value="anomaly">Anomaly Detection</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {mockSmartAlerts.map((alert) => (
              <Alert key={alert.id} className={`${
                alert.severity === 'critical' ? 'bg-red-900/20 border-red-700' :
                alert.severity === 'warning' ? 'bg-yellow-900/20 border-yellow-700' :
                'bg-blue-900/20 border-blue-700'
              }`}>
                <div className="flex items-start space-x-4">
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-white font-semibold text-lg">{alert.title}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge className={`${getConfidenceColor(alert.confidence)} border-current`} variant="outline">
                          {alert.confidence}% confidence
                        </Badge>
                        {alert.actionRequired && (
                          <Badge className="bg-red-600 text-white">
                            Action Required
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <AlertDescription className="text-slate-300 mb-4">
                      {alert.description}
                    </AlertDescription>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Location:</span>
                        <p className="text-white">{alert.location || 'Multiple locations'}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">AI Model:</span>
                        <p className="text-white">{alert.aiModel}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Generated:</span>
                        <p className="text-white">{new Date(alert.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                    
                    {alert.relatedIncidents.length > 0 && (
                      <div className="mt-4">
                        <span className="text-slate-400 text-sm">Related Incidents:</span>
                        <div className="flex space-x-2 mt-1">
                          {alert.relatedIncidents.map((incident) => (
                            <Badge key={incident} variant="outline" className="text-blue-400 border-blue-600">
                              {incident}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button size="sm" variant="outline" className="bg-slate-700 border-slate-600 text-white">
                        Investigate
                      </Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                        Take Action
                      </Button>
                    </div>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        </TabsContent>

        {/* Automated Scheduling Tab */}
        <TabsContent value="scheduling" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-white">Automated Scheduling</h2>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <Zap className="w-4 h-4 mr-2" />
              Generate New Schedule
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockAutomatedSchedules.map((schedule) => (
              <Card key={schedule.id} className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-white text-lg">{schedule.title}</CardTitle>
                    <Badge className={`${
                      schedule.status === 'approved' ? 'bg-green-600' :
                      schedule.status === 'proposed' ? 'bg-yellow-600' :
                      schedule.status === 'active' ? 'bg-blue-600' :
                      'bg-gray-600'
                    } text-white`}>
                      {schedule.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-slate-400 text-sm">
                    {schedule.type.replace('_', ' ').toUpperCase()} • {schedule.scheduleDate}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-slate-400 text-sm">Optimization Score</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <Progress value={schedule.optimizationScore} className="flex-1" />
                        <span className="text-white text-sm font-medium">{schedule.optimizationScore}%</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">Staff Efficiency</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <Progress value={schedule.staffEfficiency} className="flex-1" />
                        <span className="text-white text-sm font-medium">{schedule.staffEfficiency}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-slate-400">Coverage Improvement:</span>
                      <p className="text-green-400 font-medium">+{schedule.coverageImprovement}%</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Cost Savings:</span>
                      <p className="text-green-400 font-medium">${schedule.costSavings}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Affected Staff:</span>
                      <p className="text-white">{schedule.affectedStaff} officers</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Properties:</span>
                      <p className="text-white">{schedule.affectedProperties} locations</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-slate-700">
                    <span className="text-slate-400 text-sm">
                      Generated by: {schedule.generatedBy.replace('_', ' ')}
                    </span>
                    <div className="flex space-x-2">
                      {schedule.status === 'proposed' && (
                        <>
                          <Button size="sm" variant="outline" className="bg-slate-700 border-slate-600 text-white">
                            Review
                          </Button>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                            Approve
                          </Button>
                        </>
                      )}
                      {schedule.status !== 'proposed' && (
                        <Button size="sm" variant="outline" className="bg-slate-700 border-slate-600 text-white">
                          View Details
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Risk Assessment Tab */}
        <TabsContent value="risk" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-white">AI Risk Assessment</h2>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              <Brain className="w-4 h-4 mr-2" />
              Run Assessment
            </Button>
          </div>

          <div className="space-y-6">
            {mockRiskAssessments.map((assessment) => (
              <Card key={assessment.propertyId} className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white text-lg">{assessment.propertyName}</CardTitle>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-slate-400">
                        <span>Last updated: {new Date(assessment.lastUpdated).toLocaleString()}</span>
                        <span>Next assessment: {new Date(assessment.nextAssessment).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-white mb-1">{assessment.currentRiskScore}/10</div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm ${
                          assessment.riskTrend === 'increasing' ? 'text-red-400' :
                          assessment.riskTrend === 'decreasing' ? 'text-green-400' :
                          'text-gray-400'
                        }`}>
                          {assessment.riskTrend === 'increasing' ? '↗' : assessment.riskTrend === 'decreasing' ? '↘' : '→'}
                          {assessment.riskTrend}
                        </span>
                        <span className="text-slate-400 text-sm">
                          (prev: {assessment.previousRiskScore})
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-white font-medium mb-3">Risk Factors</h4>
                      <div className="space-y-3">
                        {assessment.riskFactors.map((factor, index) => (
                          <div key={index} className="bg-slate-700 p-3 rounded">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-white text-sm font-medium">{factor.factor}</span>
                              <span className={`text-sm ${factor.impact > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                {factor.impact > 0 ? '+' : ''}{factor.impact}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Progress value={factor.confidence} className="flex-1" />
                              <span className="text-slate-400 text-xs">{factor.confidence}% confidence</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-white font-medium mb-3">Recommended Actions</h4>
                      <div className="space-y-2">
                        {assessment.recommendedActions.map((action, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <ChevronRight className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                            <span className="text-slate-300 text-sm">{action}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-slate-700">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white mr-2">
                          Implement Actions
                        </Button>
                        <Button size="sm" variant="outline" className="bg-slate-700 border-slate-600 text-white">
                          Export Report
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
