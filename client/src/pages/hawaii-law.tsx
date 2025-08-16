

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HawaiiLaw() {
  const guardCardRequirements = [
    {
      title: "Age Requirements",
      description: "Must be at least 18 years old",
      icon: "fas fa-calendar-alt",
      status: "Required"
    },
    {
      title: "Background Check",
      description: "FBI and state criminal background investigation",
      icon: "fas fa-search",
      status: "Required"
    },
    {
      title: "Training Course",
      description: "Complete 40-hour basic security training program",
      icon: "fas fa-graduation-cap",
      status: "Required"
    },
    {
      title: "Written Examination",
      description: "Pass state-administered security guard exam",
      icon: "fas fa-file-alt",
      status: "Required"
    }
  ];

  const prohibitedActivities = [
    "Carrying firearms without proper endorsement",
    "Making arrests beyond citizen's arrest authority",
    "Impersonating law enforcement officers",
    "Using excessive force in any situation",
    "Conducting searches without proper authority",
    "Detaining individuals without legal justification"
  ];

  const legalAuthorities = [
    {
      title: "Citizen's Arrest",
      description: "Authority to detain individuals who commit felonies or misdemeanors in your presence",
      statute: "HRS 803-7"
    },
    {
      title: "Property Protection",
      description: "Right to protect property from theft, vandalism, or trespassing",
      statute: "HRS 708-800"
    },
    {
      title: "Use of Force",
      description: "Limited authority to use reasonable force when legally justified",
      statute: "HRS 703-304"
    },
    {
      title: "Trespass Enforcement",
      description: "Authority to warn and remove trespassers from protected property",
      statute: "HRS 708-814"
    }
  ];

  return (
    
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Hawaii Guard Card Law</h1>
          <Button className="bg-navy-700 hover:bg-navy-600 text-white">
            <i className="fas fa-download mr-2"></i>
            Download Handbook
          </Button>
        </div>

        <Card className="bg-slate-800 border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Guard Card Requirements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guardCardRequirements.map((req, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 bg-slate-700 rounded-lg">
                <div className="w-10 h-10 bg-navy-700 rounded-full flex items-center justify-center">
                  <i className={`${req.icon} text-gold-500`}></i>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium mb-1">{req.title}</h3>
                  <p className="text-slate-300 text-sm mb-2">{req.description}</p>
                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">{req.status}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-slate-800 border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Legal Authorities</h2>
          <div className="space-y-4">
            {legalAuthorities.map((authority, index) => (
              <div key={index} className="p-4 bg-slate-700 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-white font-medium">{authority.title}</h3>
                  <span className="text-gold-500 text-sm font-mono">{authority.statute}</span>
                </div>
                <p className="text-slate-300 text-sm">{authority.description}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-slate-800 border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Prohibited Activities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {prohibitedActivities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg">
                <i className="fas fa-times-circle text-red-500"></i>
                <p className="text-slate-300 text-sm">{activity}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-slate-800 border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Renewal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-slate-700 rounded-lg">
              <i className="fas fa-calendar-check text-blue-500 text-2xl mb-2"></i>
              <h3 className="text-white font-medium mb-1">Renewal Period</h3>
              <p className="text-slate-300 text-sm">Every 2 years</p>
            </div>
            <div className="text-center p-4 bg-slate-700 rounded-lg">
              <i className="fas fa-graduation-cap text-green-500 text-2xl mb-2"></i>
              <h3 className="text-white font-medium mb-1">Continuing Education</h3>
              <p className="text-slate-300 text-sm">8 hours required</p>
            </div>
            <div className="text-center p-4 bg-slate-700 rounded-lg">
              <i className="fas fa-dollar-sign text-yellow-500 text-2xl mb-2"></i>
              <h3 className="text-white font-medium mb-1">Renewal Fee</h3>
              <p className="text-slate-300 text-sm">$50.00</p>
            </div>
          </div>
        </Card>
      </div>
    
  );
}
