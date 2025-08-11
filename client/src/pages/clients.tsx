
import Layout from "@/components/layout/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Clients() {
  const clients = [
    { id: 1, name: "Ala Moana Shopping Center", contact: "John Manager", phone: "(808) 555-0123", email: "john@alamoana.com", properties: 3, status: "Active" },
    { id: 2, name: "Waikiki Resort Group", contact: "Sarah Director", phone: "(808) 555-0456", email: "sarah@waikikiresorts.com", properties: 5, status: "Active" },
    { id: 3, name: "Pearl Harbor Memorial", contact: "Mike Administrator", phone: "(808) 555-0789", email: "mike@pearlharbor.gov", properties: 1, status: "Active" },
    { id: 4, name: "Honolulu Airport Authority", contact: "Lisa Coordinator", phone: "(808) 555-0321", email: "lisa@honoluluairport.gov", properties: 2, status: "Pending" }
  ];

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Clients</h1>
          <Button className="bg-navy-700 hover:bg-navy-600 text-white">
            <i className="fas fa-plus mr-2"></i>
            Add Client
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Clients</p>
                <p className="text-2xl font-bold text-white">47</p>
              </div>
              <i className="fas fa-users text-blue-500 text-2xl"></i>
            </div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Active Contracts</p>
                <p className="text-2xl font-bold text-white">43</p>
              </div>
              <i className="fas fa-handshake text-green-500 text-2xl"></i>
            </div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Pending Reviews</p>
                <p className="text-2xl font-bold text-white">4</p>
              </div>
              <i className="fas fa-clock text-yellow-500 text-2xl"></i>
            </div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">New This Month</p>
                <p className="text-2xl font-bold text-white">6</p>
              </div>
              <i className="fas fa-plus-circle text-blue-500 text-2xl"></i>
            </div>
          </Card>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Client Directory</h2>
            <div className="space-y-4">
              {clients.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-navy-700 rounded-full flex items-center justify-center">
                      <i className="fas fa-building text-gold-500 text-lg"></i>
                    </div>
                    <div>
                      <p className="font-medium text-white">{client.name}</p>
                      <p className="text-sm text-slate-400">{client.contact} • {client.phone}</p>
                      <p className="text-sm text-slate-400">{client.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-slate-400">{client.properties} properties</span>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      client.status === "Active" ? "bg-green-600 text-white" : "bg-yellow-600 text-white"
                    }`}>
                      {client.status}
                    </span>
                    <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-600">
                      <i className="fas fa-edit mr-2"></i>
                      Edit
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
