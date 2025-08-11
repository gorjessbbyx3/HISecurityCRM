import Layout from "@/components/layout/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Properties() {
  const properties = [
    { id: 1, name: "Ala Moana Shopping Center", address: "1450 Ala Moana Blvd, Honolulu", type: "Commercial", status: "Active", guards: 6 },
    { id: 2, name: "Waikiki Beach Resort", address: "2255 Kalakaua Ave, Honolulu", type: "Resort", status: "Active", guards: 4 },
    { id: 3, name: "Pearl Harbor Memorial", address: "1 Arizona Memorial Pl, Honolulu", type: "Government", status: "Active", guards: 8 },
    { id: 4, name: "Honolulu Airport", address: "300 Rodgers Blvd, Honolulu", type: "Transportation", status: "Active", guards: 12 },
    { id: 5, name: "Diamond Head Lookout", address: "Diamond Head Rd, Honolulu", type: "Tourist", status: "Under Review", guards: 2 }
  ];

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

        <div className="grid gap-6">
          {properties.map((property) => (
            <Card key={property.id} className="bg-slate-800 border-slate-700 p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-white">{property.name}</h3>
                  <p className="text-slate-300">{property.address}</p>
                  <div className="flex space-x-4">
                    <span className="text-sm text-slate-400">Type: {property.type}</span>
                    <span className="text-sm text-slate-400">Guards: {property.guards}</span>
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
          ))}
        </div>
      </div>
    </Layout>
  );
}