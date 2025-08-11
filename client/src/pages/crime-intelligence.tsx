import Layout from "@/components/layout/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CrimeIntelligence() {
  const crimeData = [
    { id: 1, type: "Theft", location: "Waikiki Beach", time: "2:30 PM", severity: "Medium", status: "Investigating" },
    { id: 2, type: "Vandalism", location: "Ala Moana Center", time: "11:45 AM", severity: "Low", status: "Resolved" },
    { id: 3, type: "Assault", location: "Downtown Honolulu", time: "9:15 PM", severity: "High", status: "Under Review" },
    { id: 4, type: "Burglary", location: "Pearl Harbor", time: "3:20 AM", severity: "High", status: "Active" }
  ];

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Crime Intelligence</h1>
          <Button className="bg-navy-700 hover:bg-navy-600 text-white">
            <i className="fas fa-plus mr-2"></i>
            Add Incident
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Incidents</p>
                <p className="text-2xl font-bold text-white">127</p>
              </div>
              <i className="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
            </div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Active Cases</p>
                <p className="text-2xl font-bold text-white">23</p>
              </div>
              <i className="fas fa-search text-blue-500 text-2xl"></i>
            </div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Resolved Today</p>
                <p className="text-2xl font-bold text-white">8</p>
              </div>
              <i className="fas fa-check-circle text-green-500 text-2xl"></i>
            </div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">High Priority</p>
                <p className="text-2xl font-bold text-white">5</p>
              </div>
              <i className="fas fa-fire text-orange-500 text-2xl"></i>
            </div>
          </Card>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Incidents</h2>
            <div className="space-y-4">
              {crimeData.map((incident) => (
                <div key={incident.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      incident.severity === "High" ? "bg-red-500" :
                      incident.severity === "Medium" ? "bg-yellow-500" : "bg-green-500"
                    }`}></div>
                    <div>
                      <p className="font-medium text-white">{incident.type}</p>
                      <p className="text-sm text-slate-400">{incident.location} • {incident.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      incident.status === "Active" ? "bg-red-600 text-white" :
                      incident.status === "Investigating" ? "bg-blue-600 text-white" :
                      incident.status === "Under Review" ? "bg-yellow-600 text-white" :
                      "bg-green-600 text-white"
                    }`}>
                      {incident.status}
                    </span>
                    <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-600">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}