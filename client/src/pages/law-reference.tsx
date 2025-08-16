import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
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

  const lawSections = [
    {
      title: "Hawaii Revised Statutes Chapter 463",
      subtitle: "Private Detectives and Guards",
      description: "Comprehensive regulations for private security services in Hawaii",
      sections: ["Licensing Requirements", "Duties and Responsibilities", "Prohibited Activities", "Penalties"]
    },
    {
      title: "Use of Force Guidelines",
      subtitle: "HRS 703-304 through 703-309",
      description: "Legal framework for justified use of force in security situations",
      sections: ["Self Defense", "Defense of Others", "Defense of Property", "Citizen's Arrest"]
    },
    {
      title: "Trespassing Laws",
      subtitle: "HRS 708-813 through 708-815",
      description: "Criminal trespass definitions and enforcement procedures",
      sections: ["First Degree Trespass", "Second Degree Trespass", "Warning Procedures", "Removal Authority"]
    },
    {
      title: "Evidence Handling",
      subtitle: "Hawaii Rules of Evidence",
      description: "Proper procedures for collecting and preserving evidence",
      sections: ["Chain of Custody", "Photography Rules", "Witness Statements", "Report Writing"]
    }
  ];

  const quickReferences = [
    { title: "Emergency Contacts", icon: "fas fa-phone", count: "24/7" },
    { title: "Legal Forms", icon: "fas fa-file-alt", count: "15" },
    { title: "Court Procedures", icon: "fas fa-gavel", count: "8" },
    { title: "Case Law Updates", icon: "fas fa-balance-scale", count: "New" }
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Hawaii Law Reference</h1>
          <Button className="bg-navy-700 hover:bg-navy-600 text-white">
            <i className="fas fa-search mr-2"></i>
            Search Laws
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickReferences.map((ref, index) => (
            <Card key={index} className="bg-slate-800 border-slate-700 p-4 cursor-pointer hover:bg-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">{ref.title}</p>
                  <p className="text-2xl font-bold text-white">{ref.count}</p>
                </div>
                <i className={`${ref.icon} text-gold-500 text-2xl`}></i>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid gap-6">
          {lawSections.map((section, index) => (
            <Card key={index} className="bg-slate-800 border-slate-700 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{section.title}</h3>
                  <p className="text-gold-500 font-medium mb-2">{section.subtitle}</p>
                  <p className="text-slate-300 mb-4">{section.description}</p>
                </div>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  <i className="fas fa-external-link-alt mr-2"></i>
                  View Full Text
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {section.sections.map((subsection, subIndex) => (
                  <div key={subIndex} className="bg-slate-700 p-3 rounded-lg">
                    <p className="text-sm text-white font-medium">{subsection}</p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <Card className="bg-slate-800 border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Legal Updates</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
              <div>
                <p className="text-white font-medium">Updated Security Guard Training Requirements</p>
                <p className="text-sm text-slate-400">Effective January 2024 - New 40-hour training mandate</p>
              </div>
              <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">New</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
              <div>
                <p className="text-white font-medium">Body Camera Usage Guidelines</p>
                <p className="text-sm text-slate-400">Updated privacy and evidence handling procedures</p>
              </div>
              <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">Updated</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}