import Layout from "@/components/layout/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Reports() {
  const reports = [
    {
      id: "INC-001",
      type: "Theft",
      location: "Waikiki Beach Resort",
      reporter: "John Smith",
      date: "2024-01-15",
      time: "14:30",
      status: "Under Investigation",
      priority: "Medium"
    },
    {
      id: "INC-002",
      type: "Vandalism",
      location: "Ala Moana Center",
      reporter: "Sarah Johnson",
      date: "2024-01-14",
      time: "22:15",
      status: "Resolved",
      priority: "Low"
    },
    {
      id: "INC-003",
      type: "Assault",
      location: "Pearl Harbor Memorial",
      reporter: "Mike Wilson",
      date: "2024-01-13",
      time: "16:45",
      status: "Pending Review",
      priority: "High"
    },
    {
      id: "INC-004",
      type: "Trespassing",
      location: "Diamond Head Lookout",
      reporter: "Lisa Chen",
      date: "2024-01-12",
      time: "10:20",
      status: "Closed",
      priority: "Low"
    }
  ];

  const reportTypes = [
    { type: "Theft", count: 23, color: "bg-red-500" },
    { type: "Vandalism", count: 15, color: "bg-yellow-500" },
    { type: "Trespassing", count: 12, color: "bg-blue-500" },
    { type: "Assault", count: 8, color: "bg-purple-500" },
    { type: "Other", count: 6, color: "bg-gray-500" }
  ];

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Incident Reports</h1>
          <Button className="bg-navy-700 hover:bg-navy-600 text-white">
            <i className="fas fa-plus mr-2"></i>
            File New Report
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Reports</p>
                <p className="text-2xl font-bold text-white">127</p>
              </div>
              <i className="fas fa-file-alt text-blue-500 text-2xl"></i>
            </div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Open Cases</p>
                <p className="text-2xl font-bold text-white">18</p>
              </div>
              <i className="fas fa-folder-open text-yellow-500 text-2xl"></i>
            </div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Resolved Today</p>
                <p className="text-2xl font-bold text-white">5</p>
              </div>
              <i className="fas fa-check-circle text-green-500 text-2xl"></i>
            </div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">High Priority</p>
                <p className="text-2xl font-bold text-white">3</p>
              </div>
              <i className="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Recent Reports</h2>
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        report.priority === "High" ? "bg-red-500" :
                        report.priority === "Medium" ? "bg-yellow-500" : "bg-green-500"
                      }`}></div>
                      <div>
                        <p className="font-medium text-white">{report.id} - {report.type}</p>
                        <p className="text-sm text-slate-400">{report.location} • {report.date} at {report.time}</p>
                        <p className="text-sm text-slate-400">Reported by: {report.reporter}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        report.status === "Under Investigation" ? "bg-blue-600 text-white" :
                        report.status === "Resolved" ? "bg-green-600 text-white" :
                        report.status === "Pending Review" ? "bg-yellow-600 text-white" :
                        "bg-gray-600 text-white"
                      }`}>
                        {report.status}
                      </span>
                      <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-600">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Report Types</h2>
            <div className="space-y-4">
              {reportTypes.map((type, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">{type.type}</span>
                    <span className="text-white">{type.count}</span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div
                      className={`${type.color} h-2 rounded-full`}
                      style={{ width: `${(type.count / 25) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}