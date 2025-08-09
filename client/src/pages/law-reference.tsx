import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LawReference {
  id: string;
  title: string;
  code: string;
  category: string;
  description: string;
  penalties: string;
  relevantTo: string[];
  lastUpdated: string;
}

const hawaiiLaws: LawReference[] = [
  {
    id: "hrs-708-815",
    title: "Criminal Trespass in the First Degree",
    code: "HRS §708-815",
    category: "Trespassing",
    description: "A person commits the offense of criminal trespass in the first degree if the person knowingly enters or remains unlawfully in a dwelling.",
    penalties: "Class C felony punishable by up to 5 years imprisonment and/or fine up to $10,000",
    relevantTo: ["security_officer", "supervisor", "admin"],
    lastUpdated: "2024-01-15"
  },
  {
    id: "hrs-708-816",
    title: "Criminal Trespass in the Second Degree",
    code: "HRS §708-816",
    category: "Trespassing",
    description: "A person commits the offense of criminal trespass in the second degree if the person knowingly enters or remains unlawfully in or upon premises.",
    penalties: "Petty misdemeanor punishable by up to 30 days imprisonment and/or fine up to $1,000",
    relevantTo: ["security_officer", "supervisor", "admin"],
    lastUpdated: "2024-01-15"
  },
  {
    id: "hrs-431-1",
    title: "Private Security Guard Licensing",
    code: "HRS §431-1",
    category: "Security Regulations",
    description: "Requirements for private security guard licensing, training, and certification in Hawaii.",
    penalties: "Operating without license: misdemeanor punishable by fine up to $1,000",
    relevantTo: ["supervisor", "admin"],
    lastUpdated: "2024-02-01"
  },
  {
    id: "hrs-134-51",
    title: "Citizen's Arrest",
    code: "HRS §134-51",
    category: "Arrest Powers",
    description: "A private person may arrest another when a felony has been committed and the person has reasonable cause to believe the person to be arrested has committed it.",
    penalties: "Improper detention may result in false imprisonment charges",
    relevantTo: ["security_officer", "supervisor", "admin"],
    lastUpdated: "2024-01-20"
  },
  {
    id: "hrs-708-830",
    title: "Theft in the First Degree",
    code: "HRS §708-830",
    category: "Theft",
    description: "A person commits the offense of theft in the first degree if the person commits theft of property or services with a value exceeding $20,000.",
    penalties: "Class B felony punishable by up to 10 years imprisonment",
    relevantTo: ["security_officer", "supervisor", "admin"],
    lastUpdated: "2024-01-10"
  },
  {
    id: "hrs-708-831",
    title: "Theft in the Second Degree",
    code: "HRS §708-831",
    category: "Theft",
    description: "A person commits the offense of theft in the second degree if the person commits theft of property or services with a value exceeding $750.",
    penalties: "Class C felony punishable by up to 5 years imprisonment",
    relevantTo: ["security_officer", "supervisor", "admin"],
    lastUpdated: "2024-01-10"
  },
  {
    id: "hrs-711-1100",
    title: "Disorderly Conduct",
    code: "HRS §711-1100",
    category: "Public Order",
    description: "A person commits disorderly conduct if, with intent to cause physical inconvenience or alarm, the person makes unreasonable noise or creates a hazardous condition.",
    penalties: "Petty misdemeanor punishable by up to 30 days imprisonment and/or fine up to $1,000",
    relevantTo: ["security_officer", "supervisor", "admin"],
    lastUpdated: "2024-01-25"
  },
  {
    id: "hrs-708-894",
    title: "Unauthorized Entry into Motor Vehicle",
    code: "HRS §708-894",
    category: "Vehicle Crimes",
    description: "A person commits unauthorized entry into motor vehicle in the first degree if the person intentionally or knowingly enters or remains unlawfully in a motor vehicle, without being invited, licensed, or otherwise authorized.",
    penalties: "Class C felony if motor vehicle occupied; misdemeanor if unoccupied",
    relevantTo: ["security_officer", "supervisor", "admin"],
    lastUpdated: "2024-01-18"
  }
];

export default function LawReference() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredLaws, setFilteredLaws] = useState<LawReference[]>(hawaiiLaws);

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

  useEffect(() => {
    let filtered = hawaiiLaws;

    if (selectedCategory !== "all") {
      filtered = filtered.filter(law => law.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (searchQuery) {
      filtered = filtered.filter(law =>
        law.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        law.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        law.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        law.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredLaws(filtered);
  }, [searchQuery, selectedCategory]);

  const categories = Array.from(new Set(hawaiiLaws.map(law => law.category)));

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "trespassing": return "bg-red-500/20 text-red-400";
      case "theft": return "bg-orange-500/20 text-orange-400";
      case "security regulations": return "bg-blue-500/20 text-blue-400";
      case "arrest powers": return "bg-purple-500/20 text-purple-400";
      case "public order": return "bg-yellow-500/20 text-yellow-400";
      case "vehicle crimes": return "bg-cyan-500/20 text-cyan-400";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-gavel text-4xl text-gold-500 mb-4 animate-pulse"></i>
          <p className="text-white">Loading Law Reference...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white min-h-screen">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-y-auto" data-testid="main-law-reference">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white" data-testid="text-page-title">
                  Hawaii Law Reference
                </h2>
                <p className="text-slate-400 mt-1" data-testid="text-page-subtitle">
                  Quick reference to relevant Hawaii state laws and regulations for security operations
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button 
                  className="bg-navy-700 hover:bg-navy-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  data-testid="button-print-reference"
                >
                  <i className="fas fa-print mr-2"></i>Print Reference
                </Button>
                <Button 
                  className="bg-gold-500 hover:bg-gold-600 text-black px-4 py-2 rounded-lg font-medium transition-colors"
                  data-testid="button-export-pdf"
                >
                  <i className="fas fa-file-pdf mr-2"></i>Export PDF
                </Button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="md:col-span-2">
                <div className="relative">
                  <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                  <Input
                    type="text"
                    placeholder="Search laws by title, code, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-800 border-slate-700 text-white"
                    data-testid="input-search-laws"
                  />
                </div>
              </div>
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  data-testid="select-category-filter"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Total Laws</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-total-laws">
                        {hawaiiLaws.length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-gavel text-blue-400 text-lg"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Categories</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-total-categories">
                        {categories.length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-list text-green-400 text-lg"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Felony Offenses</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-felony-offenses">
                        {hawaiiLaws.filter(law => law.penalties.toLowerCase().includes('felony')).length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-exclamation-triangle text-red-400 text-lg"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Security Related</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-security-laws">
                        {hawaiiLaws.filter(law => 
                          law.category.toLowerCase().includes('security') || 
                          law.relevantTo.includes('security_officer')
                        ).length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gold-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-shield-alt text-gold-400 text-lg"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Law References */}
          <div className="space-y-6">
            {filteredLaws.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-12 text-center">
                  <i className="fas fa-search text-4xl text-slate-400 mb-4"></i>
                  <h3 className="text-xl font-semibold text-white mb-2">No Laws Found</h3>
                  <p className="text-slate-400">Try adjusting your search criteria</p>
                </CardContent>
              </Card>
            ) : (
              filteredLaws.map((law) => (
                <Card key={law.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <CardTitle className="text-white text-lg">{law.title}</CardTitle>
                          <Badge className="bg-navy-700 text-gold-400 font-mono text-xs">
                            {law.code}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getCategoryColor(law.category)}>
                            {law.category}
                          </Badge>
                          <span className="text-slate-400 text-sm">
                            Updated: {new Date(law.lastUpdated).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-slate-400 hover:text-white hover:bg-slate-700"
                          data-testid="button-bookmark-law"
                        >
                          <i className="fas fa-bookmark"></i>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                          data-testid="button-share-law"
                        >
                          <i className="fas fa-share"></i>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-white font-medium mb-2">Description</h4>
                        <p className="text-slate-300 text-sm leading-relaxed">{law.description}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-white font-medium mb-2">Penalties</h4>
                        <div className="bg-slate-700 p-3 rounded-lg">
                          <p className="text-slate-300 text-sm">{law.penalties}</p>
                        </div>
                      </div>

                      {law.relevantTo.length > 0 && (
                        <div>
                          <h4 className="text-white font-medium mb-2">Relevant To</h4>
                          <div className="flex flex-wrap gap-2">
                            {law.relevantTo.map((role) => (
                              <Badge key={role} className="bg-slate-700 text-slate-300 text-xs">
                                {role.replace('_', ' ').toLowerCase()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Important Notes Section */}
          <Card className="bg-slate-800 border-slate-700 mt-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <i className="fas fa-exclamation-triangle text-gold-500 mr-2"></i>
                Important Legal Disclaimers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-slate-300 text-sm">
                <p>
                  <strong className="text-white">Legal Advice Disclaimer:</strong> This reference material is for 
                  informational purposes only and does not constitute legal advice. Always consult with qualified 
                  legal counsel for specific situations.
                </p>
                <p>
                  <strong className="text-white">Currency of Information:</strong> Hawaii state laws are subject 
                  to change. Always verify current statutes through official channels before taking action.
                </p>
                <p>
                  <strong className="text-white">Jurisdictional Limits:</strong> Security officers have limited 
                  authority and must operate within the bounds of private security regulations and citizen's rights.
                </p>
                <p>
                  <strong className="text-white">Emergency Situations:</strong> In emergency situations, always 
                  contact 911 immediately. Do not attempt to detain individuals unless you have proper authority 
                  and training.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Reference Contact Information */}
          <Card className="bg-slate-800 border-slate-700 mt-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <i className="fas fa-phone text-blue-500 mr-2"></i>
                Emergency & Important Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-exclamation-circle text-red-500 w-4"></i>
                    <div>
                      <p className="text-white font-medium">Emergency Services</p>
                      <p className="text-slate-400 text-sm">911</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-shield-alt text-blue-500 w-4"></i>
                    <div>
                      <p className="text-white font-medium">Honolulu Police Department</p>
                      <p className="text-slate-400 text-sm">(808) 529-3111</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-gavel text-gold-500 w-4"></i>
                    <div>
                      <p className="text-white font-medium">Hawaii State Capitol</p>
                      <p className="text-slate-400 text-sm">(808) 586-0329</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-id-card text-purple-500 w-4"></i>
                    <div>
                      <p className="text-white font-medium">Private Security Licensing</p>
                      <p className="text-slate-400 text-sm">(808) 586-2700</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-book text-green-500 w-4"></i>
                    <div>
                      <p className="text-white font-medium">Hawaii Legal Resource</p>
                      <p className="text-slate-400 text-sm">www.capitol.hawaii.gov</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-users text-cyan-500 w-4"></i>
                    <div>
                      <p className="text-white font-medium">Security Officer Training</p>
                      <p className="text-slate-400 text-sm">(808) 586-2700</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
