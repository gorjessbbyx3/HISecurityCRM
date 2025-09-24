
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  status: 'success' | 'failed' | 'blocked';
}

interface ComplianceReport {
  id: string;
  type: string;
  period: string;
  status: 'pending' | 'completed' | 'overdue';
  lastGenerated: Date;
  nextDue: Date;
  complianceScore: number;
  findings: string[];
}

interface SecurityPolicy {
  id: string;
  name: string;
  category: string;
  status: 'active' | 'inactive' | 'pending';
  lastReviewed: Date;
  nextReview: Date;
  riskLevel: string;
  description: string;
}

export default function SecurityCompliance() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("7");
  const [filterAction, setFilterAction] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: auditLogs = [], isLoading: auditLoading } = useQuery({
    queryKey: ["/api/security/audit-logs", selectedTimeframe, filterAction, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        days: selectedTimeframe,
        ...(filterAction !== "all" && { action: filterAction }),
        ...(searchTerm && { search: searchTerm })
      });
      const response = await fetch(`/api/security/audit-logs?${params}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch audit logs');
      return response.json();
    },
  });

  const { data: complianceReports = [] } = useQuery({
    queryKey: ["/api/security/compliance-reports"],
    queryFn: async () => {
      const response = await fetch('/api/security/compliance-reports', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch compliance reports');
      return response.json();
    },
  });

  const { data: securityPolicies = [] } = useQuery({
    queryKey: ["/api/security/policies"],
    queryFn: async () => {
      const response = await fetch('/api/security/policies', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch security policies');
      return response.json();
    },
  });

  // Mock data for demonstration
  const mockAuditLogs: AuditLogEntry[] = [
    {
      id: "1",
      timestamp: new Date(),
      userId: "admin-001",
      userName: "Admin User",
      action: "LOGIN",
      resource: "Authentication System",
      details: "Successful admin login",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0...",
      riskLevel: "low",
      status: "success"
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 300000),
      userId: "off-002",
      userName: "John Smith",
      action: "EVIDENCE_ACCESS",
      resource: "Evidence ID: EV-2024-001",
      details: "Accessed confidential evidence file",
      ipAddress: "192.168.1.105",
      userAgent: "Mozilla/5.0...",
      riskLevel: "medium",
      status: "success"
    },
    {
      id: "3",
      timestamp: new Date(Date.now() - 600000),
      userId: "unknown",
      userName: "Unknown User",
      action: "LOGIN_ATTEMPT",
      resource: "Authentication System",
      details: "Failed login attempt - invalid credentials",
      ipAddress: "203.45.67.89",
      userAgent: "Bot/1.0",
      riskLevel: "high",
      status: "blocked"
    },
    {
      id: "4",
      timestamp: new Date(Date.now() - 900000),
      userId: "sup-001",
      userName: "Sarah Johnson",
      action: "SCHEDULE_MODIFY",
      resource: "Schedule ID: SCH-2024-045",
      details: "Modified officer schedule for emergency coverage",
      ipAddress: "192.168.1.102",
      userAgent: "Mozilla/5.0...",
      riskLevel: "low",
      status: "success"
    },
    {
      id: "5",
      timestamp: new Date(Date.now() - 1200000),
      userId: "admin-001",
      userName: "Admin User",
      action: "POLICY_UPDATE",
      resource: "Security Policy: SP-001",
      details: "Updated access control policy",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0...",
      riskLevel: "critical",
      status: "success"
    }
  ];

  const mockComplianceReports: ComplianceReport[] = [
    {
      id: "1",
      type: "SOX Compliance",
      period: "Q4 2024",
      status: "completed",
      lastGenerated: new Date(Date.now() - 86400000),
      nextDue: new Date(Date.now() + 86400000 * 90),
      complianceScore: 94,
      findings: ["Minor documentation gaps", "All critical controls functioning"]
    },
    {
      id: "2",
      type: "GDPR Privacy Audit",
      period: "December 2024",
      status: "pending",
      lastGenerated: new Date(Date.now() - 86400000 * 30),
      nextDue: new Date(Date.now() + 86400000 * 7),
      complianceScore: 87,
      findings: ["Data retention policy needs review", "Consent management operational"]
    },
    {
      id: "3",
      type: "Security Assessment",
      period: "Annual 2024",
      status: "overdue",
      lastGenerated: new Date(Date.now() - 86400000 * 45),
      nextDue: new Date(Date.now() - 86400000 * 5),
      complianceScore: 92,
      findings: ["Penetration testing completed", "Vulnerability patches applied"]
    }
  ];

  const mockSecurityPolicies: SecurityPolicy[] = [
    {
      id: "1",
      name: "Access Control Policy",
      category: "Authentication",
      status: "active",
      lastReviewed: new Date(Date.now() - 86400000 * 30),
      nextReview: new Date(Date.now() + 86400000 * 335),
      riskLevel: "High",
      description: "Defines user access levels and authentication requirements"
    },
    {
      id: "2",
      name: "Data Encryption Standard",
      category: "Data Protection",
      status: "active",
      lastReviewed: new Date(Date.now() - 86400000 * 15),
      nextReview: new Date(Date.now() + 86400000 * 350),
      riskLevel: "Critical",
      description: "Encryption requirements for data at rest and in transit"
    },
    {
      id: "3",
      name: "Incident Response Protocol",
      category: "Security Operations",
      status: "pending",
      lastReviewed: new Date(Date.now() - 86400000 * 90),
      nextReview: new Date(Date.now() + 86400000 * 275),
      riskLevel: "High",
      description: "Procedures for responding to security incidents"
    }
  ];

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-600 text-white';
      case 'medium': return 'bg-yellow-600 text-white';
      case 'low': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-600 text-white';
      case 'failed': return 'bg-red-600 text-white';
      case 'blocked': return 'bg-red-800 text-white';
      case 'completed': return 'bg-green-600 text-white';
      case 'pending': return 'bg-yellow-600 text-white';
      case 'overdue': return 'bg-red-600 text-white';
      case 'active': return 'bg-green-600 text-white';
      case 'inactive': return 'bg-gray-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-slate-900 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Security & Compliance</h1>
          <p className="text-slate-400 text-lg">System security monitoring and regulatory compliance management</p>
        </div>
        <div className="flex space-x-3">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <i className="fas fa-shield-alt mr-2"></i>
            Security Scan
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            <i className="fas fa-download mr-2"></i>
            Generate Report
          </Button>
        </div>
      </div>

      {/* Security Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Security Score</p>
                <p className="text-3xl font-bold text-green-400">94%</p>
                <p className="text-sm text-green-400">+2% from last month</p>
              </div>
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <i className="fas fa-shield-alt text-white text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Active Threats</p>
                <p className="text-3xl font-bold text-red-400">3</p>
                <p className="text-sm text-red-400">2 mitigated today</p>
              </div>
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                <i className="fas fa-exclamation-triangle text-white text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Compliance Rate</p>
                <p className="text-3xl font-bold text-blue-400">91%</p>
                <p className="text-sm text-blue-400">3 reports due</p>
              </div>
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <i className="fas fa-clipboard-check text-white text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Failed Login Attempts</p>
                <p className="text-3xl font-bold text-yellow-400">12</p>
                <p className="text-sm text-yellow-400">Last 24 hours</p>
              </div>
              <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center">
                <i className="fas fa-lock text-white text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="audit" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full bg-slate-800 border-slate-700">
          <TabsTrigger value="audit" className="text-white data-[state=active]:bg-blue-600">Audit Trail</TabsTrigger>
          <TabsTrigger value="compliance" className="text-white data-[state=active]:bg-blue-600">Compliance</TabsTrigger>
          <TabsTrigger value="policies" className="text-white data-[state=active]:bg-blue-600">Policies</TabsTrigger>
          <TabsTrigger value="mfa" className="text-white data-[state=active]:bg-blue-600">Multi-Factor Auth</TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl text-white">System Audit Trail</CardTitle>
                <div className="flex space-x-3">
                  <Input
                    placeholder="Search audit logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64 bg-slate-700 border-slate-600 text-white"
                  />
                  <Select value={filterAction} onValueChange={setFilterAction}>
                    <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="all">All Actions</SelectItem>
                      <SelectItem value="LOGIN">Login</SelectItem>
                      <SelectItem value="EVIDENCE_ACCESS">Evidence Access</SelectItem>
                      <SelectItem value="POLICY_UPDATE">Policy Update</SelectItem>
                      <SelectItem value="SCHEDULE_MODIFY">Schedule Change</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                    <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="1">24 Hours</SelectItem>
                      <SelectItem value="7">7 Days</SelectItem>
                      <SelectItem value="30">30 Days</SelectItem>
                      <SelectItem value="90">90 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAuditLogs.map((log) => (
                  <div key={log.id} className="p-4 bg-slate-700 rounded-lg border-l-4 border-l-blue-500">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge className={getRiskBadgeColor(log.riskLevel)}>
                            {log.riskLevel.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusBadgeColor(log.status)}>
                            {log.status.toUpperCase()}
                          </Badge>
                          <span className="text-white font-medium">{log.action}</span>
                        </div>
                        <p className="text-slate-300 mb-1">{log.details}</p>
                        <div className="text-sm text-slate-400 space-y-1">
                          <div>User: <span className="text-slate-300">{log.userName}</span></div>
                          <div>Resource: <span className="text-slate-300">{log.resource}</span></div>
                          <div>IP: <span className="text-slate-300">{log.ipAddress}</span></div>
                        </div>
                      </div>
                      <div className="text-right text-sm text-slate-400">
                        <div>{log.timestamp.toLocaleDateString()}</div>
                        <div>{log.timestamp.toLocaleTimeString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-xl text-white">Compliance Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockComplianceReports.map((report) => (
                    <div key={report.id} className="p-4 bg-slate-700 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-white font-medium">{report.type}</h4>
                          <p className="text-slate-400 text-sm">{report.period}</p>
                        </div>
                        <Badge className={getStatusBadgeColor(report.status)}>
                          {report.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-slate-300">Compliance Score</span>
                        <span className={`font-bold ${
                          report.complianceScore >= 90 ? 'text-green-400' :
                          report.complianceScore >= 80 ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {report.complianceScore}%
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-slate-400">Key Findings:</div>
                        {report.findings.map((finding, index) => (
                          <div key={index} className="text-sm text-slate-300 pl-4">
                            • {finding}
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center mt-3 text-sm text-slate-400">
                        <span>Next Due: {report.nextDue.toLocaleDateString()}</span>
                        <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                          View Report
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-xl text-white">Compliance Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-400 mb-2">91%</div>
                    <div className="text-slate-300">Overall Compliance Score</div>
                    <div className="w-full bg-slate-600 rounded-full h-3 mt-3">
                      <div className="bg-blue-500 h-3 rounded-full" style={{ width: '91%' }}></div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
                      <span className="text-slate-300">SOX Compliance</span>
                      <span className="text-green-400 font-bold">94%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
                      <span className="text-slate-300">GDPR Privacy</span>
                      <span className="text-yellow-400 font-bold">87%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
                      <span className="text-slate-300">Security Standards</span>
                      <span className="text-green-400 font-bold">92%</span>
                    </div>
                  </div>

                  <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <i className="fas fa-exclamation-triangle text-red-400"></i>
                      <span className="text-red-300 font-medium">Compliance Issues</span>
                    </div>
                    <div className="text-sm text-slate-300 space-y-1">
                      <div>• 1 overdue security assessment</div>
                      <div>• 2 pending policy reviews</div>
                      <div>• 3 expired certificates</div>
                    </div>
                  </div>

                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Generate Compliance Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="policies" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl text-white">Security Policies</CardTitle>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <i className="fas fa-plus mr-2"></i>
                  New Policy
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {mockSecurityPolicies.map((policy) => (
                  <div key={policy.id} className="p-4 bg-slate-700 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-white font-medium">{policy.name}</h4>
                      <Badge className={getStatusBadgeColor(policy.status)}>
                        {policy.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Category:</span>
                        <span className="text-slate-300">{policy.category}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Risk Level:</span>
                        <Badge className={getRiskBadgeColor(policy.riskLevel)} size="sm">
                          {policy.riskLevel}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Last Reviewed:</span>
                        <span className="text-slate-300">{policy.lastReviewed.toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Next Review:</span>
                        <span className="text-slate-300">{policy.nextReview.toLocaleDateString()}</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 mb-4">{policy.description}</p>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 flex-1">
                        Review
                      </Button>
                      <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 flex-1">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mfa" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-xl text-white">Multi-Factor Authentication</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-green-900/30 border border-green-700 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <i className="fas fa-shield-alt text-green-400"></i>
                      <span className="text-green-300 font-medium">MFA Status: Enabled</span>
                    </div>
                    <div className="text-sm text-slate-300">
                      Multi-factor authentication is active for all admin accounts
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Available Authentication Methods</h4>
                    
                    <div className="p-3 bg-slate-700 rounded-lg flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <i className="fas fa-mobile-alt text-blue-400"></i>
                        <div>
                          <div className="text-white">SMS Authentication</div>
                          <div className="text-sm text-slate-400">Receive codes via SMS</div>
                        </div>
                      </div>
                      <Badge className="bg-green-600 text-white">Active</Badge>
                    </div>

                    <div className="p-3 bg-slate-700 rounded-lg flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <i className="fas fa-qrcode text-blue-400"></i>
                        <div>
                          <div className="text-white">Authenticator App</div>
                          <div className="text-sm text-slate-400">Google Authenticator, Authy</div>
                        </div>
                      </div>
                      <Badge className="bg-green-600 text-white">Active</Badge>
                    </div>

                    <div className="p-3 bg-slate-700 rounded-lg flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <i className="fas fa-fingerprint text-blue-400"></i>
                        <div>
                          <div className="text-white">Biometric Authentication</div>
                          <div className="text-sm text-slate-400">Fingerprint, facial recognition</div>
                        </div>
                      </div>
                      <Badge className="bg-yellow-600 text-white">Setup Required</Badge>
                    </div>

                    <div className="p-3 bg-slate-700 rounded-lg flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <i className="fas fa-key text-blue-400"></i>
                        <div>
                          <div className="text-white">Hardware Security Key</div>
                          <div className="text-sm text-slate-400">YubiKey, FIDO2 devices</div>
                        </div>
                      </div>
                      <Badge className="bg-gray-600 text-white">Not Configured</Badge>
                    </div>
                  </div>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Configure MFA Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-xl text-white">User MFA Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-slate-700 rounded-lg">
                    <div className="text-3xl font-bold text-green-400 mb-2">89%</div>
                    <div className="text-slate-300">Users with MFA Enabled</div>
                    <div className="text-sm text-slate-400">34 of 38 users</div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
                      <div>
                        <div className="text-white">Admin Users</div>
                        <div className="text-sm text-slate-400">5 users</div>
                      </div>
                      <Badge className="bg-green-600 text-white">100% MFA</Badge>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
                      <div>
                        <div className="text-white">Supervisors</div>
                        <div className="text-sm text-slate-400">8 users</div>
                      </div>
                      <Badge className="bg-green-600 text-white">100% MFA</Badge>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
                      <div>
                        <div className="text-white">Security Officers</div>
                        <div className="text-sm text-slate-400">20 users</div>
                      </div>
                      <Badge className="bg-yellow-600 text-white">85% MFA</Badge>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
                      <div>
                        <div className="text-white">Guards</div>
                        <div className="text-sm text-slate-400">5 users</div>
                      </div>
                      <Badge className="bg-red-600 text-white">60% MFA</Badge>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <i className="fas fa-exclamation-triangle text-yellow-400"></i>
                      <span className="text-yellow-300 font-medium">Action Required</span>
                    </div>
                    <div className="text-sm text-slate-300">
                      4 users still need to enable MFA. Send reminder notifications.
                    </div>
                  </div>

                  <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                    Send MFA Reminders
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
