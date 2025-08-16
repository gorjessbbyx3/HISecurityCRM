
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Client {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  propertyCount: number;
  status: string;
  contractValue?: number;
  lastContact?: string;
}

export default function Clients() {
  const { data: clients = [], isLoading, error } = useQuery({
    queryKey: ["/api/clients"],
    queryFn: async () => {
      const response = await fetch("/api/clients", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch clients');
      return response.json();
    },
    refetchInterval: 30000,
  });

  const { data: clientStats } = useQuery({
    queryKey: ["/api/clients/stats"],
    queryFn: async () => {
      const response = await fetch("/api/clients/stats", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch client stats');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-4"></div>
          <p className="text-white">Loading clients...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-400">
          <p>Error loading client data. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
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
                <p className="text-2xl font-bold text-white">{clientStats?.total || clients.length}</p>
              </div>
              <i className="fas fa-users text-blue-500 text-2xl"></i>
            </div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Active Contracts</p>
                <p className="text-2xl font-bold text-white">{clientStats?.active || clients.filter((c: Client) => c.status === "Active").length}</p>
              </div>
              <i className="fas fa-handshake text-green-500 text-2xl"></i>
            </div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Pending Reviews</p>
                <p className="text-2xl font-bold text-white">{clientStats?.pending || clients.filter((c: Client) => c.status === "Pending").length}</p>
              </div>
              <i className="fas fa-clock text-yellow-500 text-2xl"></i>
            </div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">New This Month</p>
                <p className="text-2xl font-bold text-white">{clientStats?.newThisMonth || 0}</p>
              </div>
              <i className="fas fa-plus-circle text-blue-500 text-2xl"></i>
            </div>
          </Card>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Client Directory</h2>
            <div className="space-y-4">
              {clients.length === 0 ? (
                <div className="text-center py-8">
                  <i className="fas fa-building text-4xl text-slate-600 mb-4"></i>
                  <p className="text-slate-400">No clients found</p>
                </div>
              ) : (
                clients.map((client: Client) => (
                  <div key={client.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-navy-700 rounded-full flex items-center justify-center">
                        <i className="fas fa-building text-gold-500 text-lg"></i>
                      </div>
                      <div>
                        <p className="font-medium text-white">{client.name}</p>
                        <p className="text-sm text-slate-400">{client.contactPerson} • {client.phone}</p>
                        <p className="text-sm text-slate-400">{client.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-slate-400">{client.propertyCount} properties</span>
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
                ))
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
