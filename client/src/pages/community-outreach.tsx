

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CommunityOutreach() {
  const programs = [
    {
      title: "Neighborhood Watch Training",
      description: "Free security awareness training for local communities",
      date: "Every 2nd Saturday",
      participants: 150,
      status: "Active"
    },
    {
      title: "School Safety Seminars",
      description: "Educational programs for students and faculty",
      date: "Monthly",
      participants: 500,
      status: "Active"
    },
    {
      title: "Business Security Consultations",
      description: "Free security assessments for local businesses",
      date: "On Request",
      participants: 75,
      status: "Active"
    },
    {
      title: "Senior Safety Workshops",
      description: "Safety education specifically designed for senior citizens",
      date: "Quarterly",
      participants: 200,
      status: "Planning"
    }
  ];

  const upcomingEvents = [
    {
      title: "Community Safety Fair",
      date: "March 15, 2024",
      time: "10:00 AM - 4:00 PM",
      location: "Ala Moana Beach Park",
      description: "Interactive booths, demonstrations, and safety education"
    },
    {
      title: "Business Security Workshop",
      date: "March 22, 2024",
      time: "2:00 PM - 5:00 PM",
      location: "Honolulu Community Center",
      description: "Advanced security planning for small businesses"
    },
    {
      title: "Youth Safety Program",
      date: "April 5, 2024",
      time: "9:00 AM - 12:00 PM",
      location: "McKinley High School",
      description: "Interactive safety education for teenagers"
    }
  ];

  const partnerships = [
    { name: "Honolulu Police Department", type: "Law Enforcement", status: "Active" },
    { name: "Hawaii Department of Education", type: "Education", status: "Active" },
    { name: "Neighborhood Board 12", type: "Community", status: "Active" },
    { name: "Waikiki Business Association", type: "Business", status: "Active" },
    { name: "Hawaii Fire Department", type: "Emergency Services", status: "Active" }
  ];

  return (
    
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Community Outreach</h1>
          <Button className="bg-navy-700 hover:bg-navy-600 text-white">
            <i className="fas fa-plus mr-2"></i>
            New Program
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Active Programs</p>
                <p className="text-2xl font-bold text-white">8</p>
              </div>
              <i className="fas fa-hands-helping text-blue-500 text-2xl"></i>
            </div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Participants</p>
                <p className="text-2xl font-bold text-white">925</p>
              </div>
              <i className="fas fa-users text-green-500 text-2xl"></i>
            </div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Events This Month</p>
                <p className="text-2xl font-bold text-white">12</p>
              </div>
              <i className="fas fa-calendar-alt text-yellow-500 text-2xl"></i>
            </div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Partnerships</p>
                <p className="text-2xl font-bold text-white">15</p>
              </div>
              <i className="fas fa-handshake text-purple-500 text-2xl"></i>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Active Programs</h2>
            <div className="space-y-4">
              {programs.map((program, index) => (
                <div key={index} className="p-4 bg-slate-700 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-white font-medium">{program.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      program.status === "Active" ? "bg-green-600 text-white" : "bg-yellow-600 text-white"
                    }`}>
                      {program.status}
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm mb-2">{program.description}</p>
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>{program.date}</span>
                    <span>{program.participants} participants</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Upcoming Events</h2>
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="p-4 bg-slate-700 rounded-lg">
                  <h3 className="text-white font-medium mb-1">{event.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-slate-400 mb-2">
                    <span><i className="fas fa-calendar mr-1"></i>{event.date}</span>
                    <span><i className="fas fa-clock mr-1"></i>{event.time}</span>
                  </div>
                  <p className="text-sm text-slate-400 mb-2">
                    <i className="fas fa-map-marker-alt mr-1"></i>{event.location}
                  </p>
                  <p className="text-slate-300 text-sm">{event.description}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="bg-slate-800 border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Community Partnerships</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {partnerships.map((partner, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                <div>
                  <p className="text-white font-medium">{partner.name}</p>
                  <p className="text-sm text-slate-400">{partner.type}</p>
                </div>
                <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">{partner.status}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    
  );
}
