import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function HawaiiLaw() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const lawCategories = [
    {
      id: "property",
      title: "Property & Trespassing",
      icon: "fas fa-home",
      laws: [
        {
          code: "HRS 708-815",
          title: "Criminal Trespass in the First Degree",
          description: "A person commits criminal trespass in the first degree if the person knowingly enters or remains unlawfully in a dwelling.",
          penalty: "Class C felony",
          keyPoints: [
            "Applies to dwelling houses and residential buildings",
            "Must prove knowing and unlawful entry or remaining",
            "Enhanced penalties for repeat offenses"
          ]
        },
        {
          code: "HRS 708-816",
          title: "Criminal Trespass in the Second Degree",
          description: "A person commits criminal trespass in the second degree if the person knowingly enters or remains unlawfully in or upon premises.",
          penalty: "Petty misdemeanor",
          keyPoints: [
            "Covers commercial and public properties",
            "Warning signs may establish knowledge",
            "Security personnel can enforce trespass warnings"
          ]
        }
      ]
    },
    {
      id: "security",
      title: "Private Security Regulations",
      icon: "fas fa-shield-alt",
      laws: [
        {
          code: "HRS 463",
          title: "Private Security Services",
          description: "Regulations governing private security services, including licensing requirements and operational standards.",
          penalty: "Administrative sanctions",
          keyPoints: [
            "Security officers must be licensed",
            "Background checks required",
            "Continuing education requirements",
            "Uniform and identification standards"
          ]
        },
        {
          code: "HAR 16-97",
          title: "Security Guard Rules",
          description: "Administrative rules for security guard operations and training requirements.",
          penalty: "License suspension/revocation",
          keyPoints: [
            "40-hour basic training requirement",
            "Annual recertification needed",
            "Use of force limitations",
            "Report writing standards"
          ]
        }
      ]
    },
    {
      id: "public",
      title: "Public Safety & Peace",
      icon: "fas fa-balance-scale",
      laws: [
        {
          code: "HRS 711-1101",
          title: "Disorderly Conduct",
          description: "A person commits disorderly conduct if the person intentionally causes inconvenience, annoyance, or alarm to another person.",
          penalty: "Petty misdemeanor",
          keyPoints: [
            "Covers disturbing the peace",
            "Includes loud or unreasonable noise",
            "Fighting or threatening behavior",
            "Blocking pedestrian or vehicular traffic"
          ]
        },
        {
          code: "HRS 708-830",
          title: "Theft in the Fourth Degree",
          description: "A person commits theft if the person obtains or exerts unauthorized control over property with intent to deprive the owner.",
          penalty: "Petty misdemeanor",
          keyPoints: [
            "Property value under $250",
            "Intent to permanently deprive required",
            "Can include shoplifting",
            "Security can detain suspects reasonably"
          ]
        }
      ]
    },
    {
      id: "community",
      title: "Community Watch Laws",
      icon: "fas fa-users",
      laws: [
        {
          code: "HRS 663-1.6",
          title: "Good Samaritan Protection",
          description: "Protection from liability for persons providing emergency care or assistance in good faith.",
          penalty: "Civil liability protection",
          keyPoints: [
            "Protects voluntary assistance in emergencies",
            "Must act in good faith",
            "Does not protect gross negligence",
            "Covers medical and safety assistance"
          ]
        },
        {
          code: "HRS 803-44",
          title: "Citizen's Arrest Authority",
          description: "Authority for private persons to make arrests under specific circumstances.",
          penalty: "Liability if improper",
          keyPoints: [
            "Felony must be committed in presence",
            "Reasonable belief standard",
            "Must immediately turn over to police",
            "Use only reasonable force"
          ]
        }
      ]
    }
  ];

  const emergencyContacts = [
    {
      name: "Honolulu Police Department",
      emergency: "911",
      nonemergency: "(808) 529-3111",
      type: "Police"
    },
    {
      name: "Hawaii State Sheriff",
      emergency: "911",
      nonemergency: "(808) 586-1352",
      type: "State Law Enforcement"
    },
    {
      name: "Private Security Board",
      emergency: "N/A",
      nonemergency: "(808) 586-3000",
      type: "Licensing"
    },
    {
      name: "Department of Commerce",
      emergency: "N/A",
      nonemergency: "(808) 586-2850",
      type: "Regulatory"
    }
  ];

  const filteredLaws = lawCategories.map(category => ({
    ...category,
    laws: category.laws.filter(law =>
      law.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      law.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      law.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.laws.length > 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-gavel text-4xl text-gold-500 mb-4 animate-pulse"></i>
          <p className="text-white">Loading Hawaii Law Reference...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white min-h-screen">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-y-auto" data-testid="main-hawaii-law">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white" data-testid="text-page-title">
                  Hawaii Law Reference
                </h2>
                <p className="text-slate-400 mt-1" data-testid="text-page-subtitle">
                  Quick reference guide to relevant Hawaii state laws and security regulations
                </p>
              </div>
              
              <Button 
                className="bg-gold-500 hover:bg-gold-600 text-black px-4 py-2 rounded-lg font-medium transition-colors"
                data-testid="button-download-guide"
              >
                <i className="fas fa-download mr-2"></i>Download Guide
              </Button>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                <Input
                  placeholder="Search laws by title, code, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700 text-white"
                  data-testid="input-search-laws"
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Law Categories</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-law-categories">
                        {lawCategories.length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-book text-blue-400 text-lg"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Total Laws</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-total-laws">
                        {lawCategories.reduce((total, category) => total + category.laws.length, 0)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gold-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-gavel text-gold-400 text-lg"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Security Regulations</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-security-regulations">
                        {lawCategories.find(c => c.id === 'security')?.laws.length || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-shield-alt text-green-400 text-lg"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Emergency Contacts</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-emergency-contacts">
                        {emergencyContacts.length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-phone text-red-400 text-lg"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="laws" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800">
              <TabsTrigger value="laws" className="data-[state=active]:bg-navy-700" data-testid="tab-laws">
                <i className="fas fa-book mr-2"></i>Laws & Regulations
              </TabsTrigger>
              <TabsTrigger value="contacts" className="data-[state=active]:bg-navy-700" data-testid="tab-contacts">
                <i className="fas fa-phone mr-2"></i>Emergency Contacts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="laws" className="space-y-6">
              {(searchTerm ? filteredLaws : lawCategories).map((category) => (
                <Card key={category.id} className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gold-500/20 rounded-lg flex items-center justify-center">
                        <i className={`${category.icon} text-gold-500`}></i>
                      </div>
                      <CardTitle className="text-white">{category.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {category.laws.map((law, index) => (
                        <div key={index} className="p-4 bg-slate-700 rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-white font-semibold text-lg">{law.title}</h3>
                              <Badge className="bg-navy-700 text-gold-400 mt-1">{law.code}</Badge>
                            </div>
                            <Badge className={
                              law.penalty.includes('felony') ? 'bg-red-500/20 text-red-400' :
                              law.penalty.includes('misdemeanor') ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-blue-500/20 text-blue-400'
                            }>
                              {law.penalty}
                            </Badge>
                          </div>
                          
                          <p className="text-slate-300 mb-4">{law.description}</p>
                          
                          <div>
                            <h4 className="text-white font-medium mb-2">Key Points:</h4>
                            <ul className="space-y-1">
                              {law.keyPoints.map((point, pointIndex) => (
                                <li key={pointIndex} className="text-slate-300 text-sm flex items-start">
                                  <i className="fas fa-check text-green-400 mr-2 mt-1 text-xs"></i>
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="contacts" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {emergencyContacts.map((contact, index) => (
                  <Card key={index} className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white">{contact.name}</CardTitle>
                        <Badge className="bg-blue-500/20 text-blue-400">{contact.type}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                          <div className="flex items-center space-x-2">
                            <i className="fas fa-exclamation-triangle text-red-400"></i>
                            <span className="text-white font-medium">Emergency</span>
                          </div>
                          <a 
                            href={`tel:${contact.emergency}`}
                            className="text-red-400 font-bold text-lg hover:text-red-300 transition-colors"
                            data-testid="link-emergency-number"
                          >
                            {contact.emergency}
                          </a>
                        </div>
                        
                        {contact.nonemergency !== "N/A" && (
                          <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <i className="fas fa-phone text-slate-400"></i>
                              <span className="text-white">Non-Emergency</span>
                            </div>
                            <a 
                              href={`tel:${contact.nonemergency}`}
                              className="text-blue-400 font-medium hover:text-blue-300 transition-colors"
                              data-testid="link-nonemergency-number"
                            >
                              {contact.nonemergency}
                            </a>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Quick Reference Card */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    <i className="fas fa-info-circle text-blue-400 mr-2"></i>
                    Quick Reference Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-white font-semibold mb-3">When to Call Police</h4>
                      <ul className="space-y-2 text-slate-300 text-sm">
                        <li><i className="fas fa-check text-green-400 mr-2"></i>Any crime in progress</li>
                        <li><i className="fas fa-check text-green-400 mr-2"></i>Threats of violence</li>
                        <li><i className="fas fa-check text-green-400 mr-2"></i>Property damage over $300</li>
                        <li><i className="fas fa-check text-green-400 mr-2"></i>Trespassing after warnings</li>
                        <li><i className="fas fa-check text-green-400 mr-2"></i>Suspected drug activity</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-3">Security Authority Limits</h4>
                      <ul className="space-y-2 text-slate-300 text-sm">
                        <li><i className="fas fa-times text-red-400 mr-2"></i>Cannot conduct searches</li>
                        <li><i className="fas fa-times text-red-400 mr-2"></i>No arrest powers (except citizen's arrest)</li>
                        <li><i className="fas fa-times text-red-400 mr-2"></i>Cannot use excessive force</li>
                        <li><i className="fas fa-check text-green-400 mr-2"></i>Can detain briefly for police</li>
                        <li><i className="fas fa-check text-green-400 mr-2"></i>Can issue trespass warnings</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
