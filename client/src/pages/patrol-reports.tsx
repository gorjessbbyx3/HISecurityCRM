
import Layout from "@/components/layout/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PatrolReports() {
  const patrolReports = [
    { id: 1, officer: "John Smith", location: "Waikiki Beach", time: "14:30", date: "2024-01-15", status: "Completed", duration: "2h 30m" },
    { id: 2, officer: "Sarah Johnson", location: "Ala Moana Center", time: "10:00", date: "2024-01-15", status: "In Progress", duration: "1h 15m" },
    { id: 3, officer: "Mike Wilson", location: "Pearl Harbor", time: "22:00", date: "2024-01-14", status: "Completed", duration: "8h 00m" },
    { id: 4, officer: "Lisa Chen", location: "Downtown Honolulu", time: "06:00", date: "2024-01-15", status: "Scheduled", duration: "4h 00m" }
  ];

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Patrol Reports</h1>
          <Button className="bg-navy-700 hover:bg-navy-600 text-white">
            <i className="fas fa-plus mr-2"></i>
            New Report
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Today's Patrols</p>
                <p className="text-2xl font-bold text-white">12</p>
              </div>
              <i className="fas fa-route text-blue-500 text-2xl"></i>
            </div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Active Patrols</p>
                <p className="text-2xl font-bold text-white">3</p>
              </div>
              <i className="fas fa-walking text-green-500 text-2xl"></i>
            </div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Completed</p>
                <p className="text-2xl font-bold text-white">8</p>
              </div>
              <i className="fas fa-check-circle text-green-500 text-2xl"></i>
            </div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Hours</p>
                <p className="text-2xl font-bold text-white">24</p>
              </div>
              <i className="fas fa-clock text-yellow-500 text-2xl"></i>
            </div>
          </Card>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Patrol Reports</h2>
            <div className="space-y-4">
              {patrolReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-navy-700 rounded-full flex items-center justify-center">
                      <i className="fas fa-user-shield text-gold-500"></i>
                    </div>
                    <div>
                      <p className="font-medium text-white">{report.officer}</p>
                      <p className="text-sm text-slate-400">{report.location} • {report.date} at {report.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-slate-400">{report.duration}</span>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      report.status === "Completed" ? "bg-green-600 text-white" :
                      report.status === "In Progress" ? "bg-blue-600 text-white" :
                      "bg-yellow-600 text-white"
                    }`}>
                      {report.status}
                    </span>
                    <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-600">
                      View Report
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
