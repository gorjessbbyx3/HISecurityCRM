import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Property {
  id: string;
  name: string;
  address: string;
  type: string;
  status: string;
  guardCount: number;
  clientName?: string;
  contractValue?: number;
}

export default function Properties() {
  const { data: properties = [], isLoading, error } = useQuery({
    queryKey: ["/api/properties"],
    queryFn: async () => {
      const response = await fetch("/api/properties", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch properties');
      return response.json();
    },
    refetchInterval: 30000,
  });

  const { data: propertyStats } = useQuery({
    queryKey: ["/api/properties/stats"],
    queryFn: async () => {
      const response = await fetch("/api/properties/stats", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch property stats');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-building text-4xl text-gold-500 mb-4 animate-pulse"></i>
            <p className="text-white">Loading properties...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6">
          <div className="text-center text-red-400">
            <i className="fas fa-exclamation-triangle text-4xl mb-4"></i>
            <p>Error loading property data. Please try again.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Properties</h1>
          <Button className="bg-navy-700 hover:bg-navy-600 text-white">
            <i className="fas fa-plus mr-2"></i>
            Add Property
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Properties</p>
                <p className="text-2xl font-bold text-white">{propertyStats?.total || properties.length}</p>
              </div>
              <i className="fas fa-building text-blue-500 text-2xl"></i>
            </div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Active Properties</p>
                <p className="text-2xl font-bold text-white">{propertyStats?.active || properties.filter((p: Property) => p.status === "Active").length}</p>
              </div>
              <i className="fas fa-shield-alt text-green-500 text-2xl"></i>
            </div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Guards</p>
                <p className="text-2xl font-bold text-white">{propertyStats?.totalGuards || properties.reduce((sum: number, p: Property) => sum + p.guardCount, 0)}</p>
              </div>
              <i className="fas fa-users text-yellow-500 text-2xl"></i>
            </div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Under Review</p>
                <p className="text-2xl font-bold text-white">{propertyStats?.underReview || properties.filter((p: Property) => p.status === "Under Review").length}</p>
              </div>
              <i className="fas fa-clock text-orange-500 text-2xl"></i>
            </div>
          </Card>
        </div>

        <div className="grid gap-6">
          {properties.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-building text-4xl text-slate-600 mb-4"></i>
              <p className="text-slate-400">No properties found</p>
            </div>
          ) : (
            properties.map((property: Property) => (
            <Card key={property.id} className="bg-slate-800 border-slate-700 p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-white">{property.name}</h3>
                  <p className="text-slate-300">{property.address}</p>
                  <div className="flex space-x-4">
                    <span className="text-sm text-slate-400">Type: {property.type}</span>
                    <span className="text-sm text-slate-400">Guards: {property.guardCount}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    property.status === "Active" 
                      ? "bg-green-600 text-white" 
                      : "bg-yellow-600 text-white"
                  }`}>
                    {property.status}
                  </span>
                  <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                    <i className="fas fa-edit mr-2"></i>
                    Edit
                  </Button>
                </div>
              </div>
            </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}