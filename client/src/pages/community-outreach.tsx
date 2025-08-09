import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface OutreachResource {
  id: string;
  name: string;
  category: string;
  type: string;
  description: string;
  address: string;
  phone: string;
  website?: string;
  hours: string;
  services: string[];
  eligibility: string;
  isEmergency: boolean;
  coordinates: string;
}

const communityResources: OutreachResource[] = [
  {
    id: "aloha-house",
    name: "Aloha House Kauai",
    category: "Substance Abuse",
    type: "Treatment Center",
    description: "Comprehensive addiction treatment services including detox, residential treatment, and outpatient programs.",
    address: "1065 Kikowaena Street, Lihue, HI 96766",
    phone: "(808) 245-8334",
    website: "https://alohahouse.org",
    hours: "24/7 Emergency Services",
    services: ["Detoxification", "Residential Treatment", "Outpatient Services", "Counseling", "Support Groups"],
    eligibility: "Adults 18+ with substance abuse issues",
    isEmergency: true,
    coordinates: "21.9811, -159.3722"
  },
  {
    id: "ihope",
    name: "IHS - Institute for Human Services",
    category: "Homeless Services",
    type: "Shelter",
    description: "Hawaii's largest homeless service provider offering emergency shelter, transitional housing, and support services.",
    address: "350 Sumner Street, Honolulu, HI 96817",
    phone: "(808) 536-4302",
    website: "https://ihshawaii.org",
    hours: "24/7 for emergencies, Office: Mon-Fri 8am-5pm",
    services: ["Emergency Shelter", "Transitional Housing", "Case Management", "Job Training", "Mental Health Services"],
    eligibility: "Homeless individuals and families",
    isEmergency: true,
    coordinates: "21.3281, -157.8712"
  },
  {
    id: "next-step-shelter",
    name: "Next Step Shelter",
    category: "Homeless Services",
    type: "Emergency Shelter",
    description: "Emergency shelter providing temporary housing and support services for homeless individuals.",
    address: "418 Kuwili Street, Honolulu, HI 96817",
    phone: "(808) 599-1344",
    hours: "Daily 7pm-7am for intake",
    services: ["Emergency Shelter", "Meals", "Shower Facilities", "Case Management", "Housing Assistance"],
    eligibility: "Single adults experiencing homelessness",
    isEmergency: true,
    coordinates: "21.3099, -157.8581"
  },
  {
    id: "salvation-army",
    name: "Salvation Army Family Treatment Services",
    category: "Family Services",
    type: "Treatment Center",
    description: "Comprehensive family services including addiction treatment, housing assistance, and social services.",
    address: "3624 Waokanaka Street, Honolulu, HI 96817",
    phone: "(808) 988-2136",
    website: "https://salvationarmyhawaii.org",
    hours: "Mon-Fri 8am-4:30pm",
    services: ["Family Counseling", "Addiction Treatment", "Emergency Assistance", "Food Pantry", "Clothing"],
    eligibility: "Families and individuals in need",
    isEmergency: false,
    coordinates: "21.3361, -157.8631"
  },
  {
    id: "mental-health-america",
    name: "Mental Health America of Hawaii",
    category: "Mental Health",
    type: "Support Services",
    description: "Mental health advocacy, education, and support services for individuals with mental health conditions.",
    address: "1130 N Nimitz Highway, Suite A-259, Honolulu, HI 96817",
    phone: "(808) 521-1846",
    website: "https://mentalhealthhawaii.org",
    hours: "Mon-Fri 8am-4:30pm",
    services: ["Mental Health Education", "Support Groups", "Advocacy", "Crisis Support", "Resource Referrals"],
    eligibility: "Individuals with mental health concerns and their families",
    isEmergency: false,
    coordinates: "21.3281, -157.8712"
  },
  {
    id: "catholic-charities",
    name: "Catholic Charities Hawaii",
    category: "Social Services",
    type: "Multi-Service",
    description: "Comprehensive social services including housing, immigration assistance, and emergency aid.",
    address: "1822 Keeaumoku Street, Honolulu, HI 96822",
    phone: "(808) 537-6321",
    website: "https://catholiccharitieshawaii.org",
    hours: "Mon-Fri 8am-4:30pm",
    services: ["Housing Assistance", "Immigration Services", "Emergency Financial Aid", "Food Assistance", "Senior Services"],
    eligibility: "Low-income individuals and families",
    isEmergency: false,
    coordinates: "21.3156, -157.8489"
  },
  {
    id: "hale-kipa",
    name: "Hale Kipa",
    category: "Youth Services",
    type: "Youth Shelter",
    description: "Services for at-risk youth including emergency shelter, transitional living, and support services.",
    address: "94-801 Farrington Highway, Waipahu, HI 96797",
    phone: "(808) 671-8131",
    website: "https://halekipa.org",
    hours: "24/7 Crisis Hotline",
    services: ["Youth Emergency Shelter", "Transitional Living", "Counseling", "Education Support", "Life Skills Training"],
    eligibility: "Youth ages 10-24 in crisis",
    isEmergency: true,
    coordinates: "21.3851, -158.0069"
  },
  {
    id: "food-bank-hawaii",
    name: "Hawaii Foodbank",
    category: "Food Security",
    type: "Food Bank",
    description: "Hawaii's largest hunger-relief organization providing food assistance throughout the state.",
    address: "2611 Kilihau Street, Honolulu, HI 96819",
    phone: "(808) 836-3600",
    website: "https://hawaiifoodbank.org",
    hours: "Mon-Fri 7am-3:30pm",
    services: ["Food Distribution", "Mobile Food Pantry", "School Backpack Program", "Senior Food Program"],
    eligibility: "Low-income individuals and families",
    isEmergency: false,
    coordinates: "21.3156, -157.8489"
  }
];

const crisisHotlines = [
  {
    name: "National Suicide Prevention Lifeline",
    phone: "988",
    description: "24/7 confidential support for people in distress",
    availability: "24/7"
  },
  {
    name: "Hawaii Crisis Line",
    phone: "(808) 832-3100",
    description: "Statewide mental health crisis support",
    availability: "24/7"
  },
  {
    name: "Domestic Violence Hotline",
    phone: "(808) 841-0822",
    description: "Support for domestic violence survivors",
    availability: "24/7"
  },
  {
    name: "Teen Line Hawaii",
    phone: "(808) 832-3399",
    description: "Crisis support for teens and young adults",
    availability: "Daily 6pm-12am"
  },
  {
    name: "Substance Abuse Treatment Locator",
    phone: "1-800-662-4357",
    description: "24/7 treatment referral service",
    availability: "24/7"
  }
];

export default function CommunityOutreach() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredResources, setFilteredResources] = useState<OutreachResource[]>(communityResources);

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
    let filtered = communityResources;

    if (selectedCategory !== "all") {
      filtered = filtered.filter(resource => 
        resource.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(resource =>
        resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.services.some(service => 
          service.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        resource.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredResources(filtered);
  }, [searchQuery, selectedCategory]);

  const categories = Array.from(new Set(communityResources.map(resource => resource.category)));

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "homeless services": return "bg-blue-500/20 text-blue-400";
      case "substance abuse": return "bg-red-500/20 text-red-400";
      case "mental health": return "bg-purple-500/20 text-purple-400";
      case "family services": return "bg-green-500/20 text-green-400";
      case "youth services": return "bg-cyan-500/20 text-cyan-400";
      case "food security": return "bg-orange-500/20 text-orange-400";
      case "social services": return "bg-yellow-500/20 text-yellow-400";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-hands-helping text-4xl text-gold-500 mb-4 animate-pulse"></i>
          <p className="text-white">Loading Community Outreach...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white min-h-screen">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-y-auto" data-testid="main-community-outreach">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white" data-testid="text-page-title">
                  Community Outreach Resources
                </h2>
                <p className="text-slate-400 mt-1" data-testid="text-page-subtitle">
                  Comprehensive directory of Hawaii community services for homeless individuals, substance abuse treatment, and crisis intervention
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button 
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  data-testid="button-emergency-contacts"
                >
                  <i className="fas fa-phone mr-2"></i>Emergency Contacts
                </Button>
                <Button 
                  className="bg-gold-500 hover:bg-gold-600 text-black px-4 py-2 rounded-lg font-medium transition-colors"
                  data-testid="button-print-directory"
                >
                  <i className="fas fa-print mr-2"></i>Print Directory
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
                    placeholder="Search resources by name, service, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-800 border-slate-700 text-white"
                    data-testid="input-search-resources"
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
                      <p className="text-slate-400 text-sm font-medium">Total Resources</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-total-resources">
                        {communityResources.length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-hands-helping text-blue-400 text-lg"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Emergency Services</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-emergency-services">
                        {communityResources.filter(resource => resource.isEmergency).length}
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
                      <p className="text-slate-400 text-sm font-medium">24/7 Services</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-247-services">
                        {communityResources.filter(resource => resource.hours.includes('24/7')).length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-clock text-green-400 text-lg"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Shelter Beds</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-shelter-services">
                        {communityResources.filter(resource => 
                          resource.services.some(service => service.toLowerCase().includes('shelter'))
                        ).length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gold-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-home text-gold-400 text-lg"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Resources List */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {filteredResources.length === 0 ? (
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-12 text-center">
                      <i className="fas fa-search text-4xl text-slate-400 mb-4"></i>
                      <h3 className="text-xl font-semibold text-white mb-2">No Resources Found</h3>
                      <p className="text-slate-400">Try adjusting your search criteria</p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredResources.map((resource) => (
                    <Card key={resource.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <CardTitle className="text-white text-lg">{resource.name}</CardTitle>
                              {resource.isEmergency && (
                                <Badge className="bg-red-500/20 text-red-400">
                                  <i className="fas fa-exclamation-triangle mr-1"></i>Emergency
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge className={getCategoryColor(resource.category)}>
                                {resource.category}
                              </Badge>
                              <Badge className="bg-slate-700 text-slate-300">
                                {resource.type}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                              data-testid="button-call-resource"
                            >
                              <i className="fas fa-phone"></i>
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                              data-testid="button-directions"
                            >
                              <i className="fas fa-map-marker-alt"></i>
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <p className="text-slate-300 text-sm">{resource.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="flex items-start space-x-2 mb-2">
                                <i className="fas fa-map-marker-alt text-slate-400 w-4 mt-0.5"></i>
                                <p className="text-slate-300">{resource.address}</p>
                              </div>
                              <div className="flex items-center space-x-2 mb-2">
                                <i className="fas fa-phone text-slate-400 w-4"></i>
                                <p className="text-slate-300">{resource.phone}</p>
                              </div>
                              {resource.website && (
                                <div className="flex items-center space-x-2">
                                  <i className="fas fa-globe text-slate-400 w-4"></i>
                                  <a 
                                    href={resource.website} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 underline"
                                  >
                                    Website
                                  </a>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2 mb-2">
                                <i className="fas fa-clock text-slate-400 w-4"></i>
                                <p className="text-slate-300">{resource.hours}</p>
                              </div>
                              <div className="flex items-start space-x-2">
                                <i className="fas fa-users text-slate-400 w-4 mt-0.5"></i>
                                <p className="text-slate-300">{resource.eligibility}</p>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-white font-medium mb-2">Services Offered</h4>
                            <div className="flex flex-wrap gap-2">
                              {resource.services.map((service, index) => (
                                <Badge key={index} className="bg-slate-700 text-slate-300 text-xs">
                                  {service}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Crisis Hotlines & Quick Actions */}
            <div className="space-y-6">
              {/* Crisis Hotlines */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <i className="fas fa-phone text-red-500 mr-2"></i>
                    Crisis Hotlines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {crisisHotlines.map((hotline, index) => (
                      <div key={index} className="p-3 bg-slate-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-medium text-sm">{hotline.name}</h4>
                          <Button
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 text-xs"
                            data-testid="button-call-hotline"
                          >
                            <i className="fas fa-phone mr-1"></i>Call
                          </Button>
                        </div>
                        <p className="text-gold-400 font-mono text-sm mb-1">{hotline.phone}</p>
                        <p className="text-slate-300 text-xs mb-1">{hotline.description}</p>
                        <p className="text-slate-400 text-xs">{hotline.availability}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button 
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                      data-testid="button-emergency-assistance"
                    >
                      <i className="fas fa-ambulance mr-2"></i>Emergency Assistance
                    </Button>
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                      data-testid="button-find-shelter"
                    >
                      <i className="fas fa-home mr-2"></i>Find Nearest Shelter
                    </Button>
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                      data-testid="button-substance-abuse-help"
                    >
                      <i className="fas fa-hand-holding-heart mr-2"></i>Substance Abuse Help
                    </Button>
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                      data-testid="button-mental-health-resources"
                    >
                      <i className="fas fa-brain mr-2"></i>Mental Health Resources
                    </Button>
                    <Button 
                      className="w-full bg-gold-500 hover:bg-gold-600 text-black py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                      data-testid="button-food-assistance"
                    >
                      <i className="fas fa-utensils mr-2"></i>Food Assistance
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Resource Map */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <i className="fas fa-map text-blue-500 mr-2"></i>
                    Resource Map
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-700 rounded-lg h-48 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <i className="fas fa-map-marked-alt text-3xl text-gold-500 mb-2"></i>
                        <p className="text-white font-medium text-sm">Hawaii Resource Map</p>
                        <p className="text-slate-400 text-xs">Click to view interactive map</p>
                      </div>
                    </div>
                    
                    {/* Resource Markers */}
                    {filteredResources.slice(0, 6).map((resource, index) => (
                      <div 
                        key={resource.id}
                        className={`absolute w-2 h-2 rounded-full ${
                          resource.isEmergency ? 'bg-red-500' : 'bg-blue-500'
                        } animate-pulse`}
                        style={{
                          top: `${15 + (index * 12)}%`,
                          left: `${20 + (index * 10)}%`
                        }}
                        title={resource.name}
                      ></div>
                    ))}
                  </div>
                  <Button 
                    className="w-full mt-3 bg-navy-700 hover:bg-navy-600 text-white"
                    data-testid="button-view-full-map"
                  >
                    <i className="fas fa-expand mr-2"></i>View Full Map
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Important Information */}
          <Card className="bg-slate-800 border-slate-700 mt-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <i className="fas fa-info-circle text-blue-500 mr-2"></i>
                Important Information for Security Officers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-medium mb-3">When Encountering Homeless Individuals</h4>
                  <ul className="space-y-2 text-slate-300 text-sm">
                    <li className="flex items-start space-x-2">
                      <i className="fas fa-check text-green-500 w-4 mt-0.5"></i>
                      <span>Approach with compassion and respect</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <i className="fas fa-check text-green-500 w-4 mt-0.5"></i>
                      <span>Offer information about nearby resources</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <i className="fas fa-check text-green-500 w-4 mt-0.5"></i>
                      <span>Know emergency contact numbers</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <i className="fas fa-check text-green-500 w-4 mt-0.5"></i>
                      <span>Document interactions appropriately</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-3">Crisis Intervention Guidelines</h4>
                  <ul className="space-y-2 text-slate-300 text-sm">
                    <li className="flex items-start space-x-2">
                      <i className="fas fa-exclamation-triangle text-yellow-500 w-4 mt-0.5"></i>
                      <span>Call 911 for immediate medical emergencies</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <i className="fas fa-exclamation-triangle text-yellow-500 w-4 mt-0.5"></i>
                      <span>Use crisis hotlines for mental health emergencies</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <i className="fas fa-exclamation-triangle text-yellow-500 w-4 mt-0.5"></i>
                      <span>Maintain safe distance in volatile situations</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <i className="fas fa-exclamation-triangle text-yellow-500 w-4 mt-0.5"></i>
                      <span>Document all incidents thoroughly</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
