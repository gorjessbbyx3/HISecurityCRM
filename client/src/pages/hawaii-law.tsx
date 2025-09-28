
import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";

interface LawReference {
  id: string;
  title: string;
  category: string;
  code: string;
  description: string;
  fullText: string;
  penalties: string;
  relatedCodes: string[];
  lastUpdated: string;
}

export default function HawaiiLaw() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLaw, setSelectedLaw] = useState<LawReference | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const queryClient = useQueryClient();
  const form = useForm();

  const { data: laws = [], isLoading } = useQuery({
    queryKey: ["/api/law-references", { search: searchTerm, category: selectedCategory }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      
      const response = await fetch(`/api/law-references?${params}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch law references');
      return response.json();
    },
  });

  const createLawMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/law-references", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create law reference');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/law-references"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Law reference created successfully",
      });
    },
    onError: (error) => {
      console.error("Create law error:", error);
      toast({
        title: "Error",
        description: "Failed to create law reference",
        variant: "destructive",
      });
    },
  });

  const handleCreateLaw = (data: any) => {
    createLawMutation.mutate({
      ...data,
      relatedCodes: data.relatedCodes?.split(',').map((s: string) => s.trim()) || [],
    });
  };

  const categories = [
    'criminal', 'traffic', 'property', 'public_safety', 'business', 
    'environmental', 'civil_rights', 'administrative', 'other'
  ];

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'criminal': return 'fa-gavel';
      case 'traffic': return 'fa-car';
      case 'property': return 'fa-building';
      case 'public_safety': return 'fa-shield-alt';
      case 'business': return 'fa-briefcase';
      case 'environmental': return 'fa-leaf';
      case 'civil_rights': return 'fa-balance-scale';
      case 'administrative': return 'fa-file-contract';
      default: return 'fa-book';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'criminal': return 'bg-red-500';
      case 'traffic': return 'bg-blue-500';
      case 'property': return 'bg-green-500';
      case 'public_safety': return 'bg-orange-500';
      case 'business': return 'bg-purple-500';
      case 'environmental': return 'bg-teal-500';
      case 'civil_rights': return 'bg-indigo-500';
      case 'administrative': return 'bg-gray-500';
      default: return 'bg-slate-500';
    }
  };

  const filteredLaws = laws.filter((law: LawReference) => {
    const matchesSearch = !searchTerm || 
      law.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      law.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      law.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || law.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-slate-900 text-white min-h-screen">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Hawaii Law Reference</h2>
                <p className="text-slate-400 mt-1">
                  Quick access to relevant Hawaii state laws and regulations
                </p>
              </div>
              
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gold-500 hover:bg-gold-600 text-black">
                    <i className="fas fa-plus mr-2"></i>Add Law Reference
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700 max-w-4xl">
                  <DialogHeader>
                    <DialogTitle className="text-white">Add Law Reference</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={form.handleSubmit(handleCreateLaw)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title" className="text-white">Title</Label>
                        <Input 
                          id="title"
                          {...form.register("title", { required: true })}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="code" className="text-white">Code/Section</Label>
                        <Input 
                          id="code"
                          {...form.register("code", { required: true })}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="e.g., HRS §711-1101"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="category" className="text-white">Category</Label>
                      <Select onValueChange={(value) => form.setValue("category", value)}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          {categories.map((category) => (
                            <SelectItem key={category} value={category} className="text-white">
                              {category.replace('_', ' ').toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="description" className="text-white">Description</Label>
                      <Textarea 
                        id="description"
                        {...form.register("description", { required: true })}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="Brief description of the law"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="fullText" className="text-white">Full Text</Label>
                      <Textarea 
                        id="fullText"
                        {...form.register("fullText", { required: true })}
                        className="bg-slate-700 border-slate-600 text-white h-32"
                        placeholder="Complete text of the law or regulation"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="penalties" className="text-white">Penalties</Label>
                      <Textarea 
                        id="penalties"
                        {...form.register("penalties")}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="Penalties and consequences for violations"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="relatedCodes" className="text-white">Related Codes (comma separated)</Label>
                      <Input 
                        id="relatedCodes"
                        {...form.register("relatedCodes")}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="e.g., HRS §711-1102, HRS §711-1103"
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsCreateDialogOpen(false)}
                        className="border-slate-600 text-slate-300"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-gold-500 hover:bg-gold-600 text-black"
                        disabled={createLawMutation.isPending}
                      >
                        {createLawMutation.isPending ? 'Creating...' : 'Create Reference'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search laws by title, code, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="w-full md:w-48">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="all" className="text-white">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category} className="text-white">
                        {category.replace('_', ' ').toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Quick Reference Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-red-900/20 border-red-500/30">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-gavel text-red-400 text-xl"></i>
                </div>
                <h3 className="text-white font-bold mb-2">Criminal Law</h3>
                <p className="text-red-400 text-2xl font-bold mb-2">
                  {laws.filter((law: LawReference) => law.category === 'criminal').length}
                </p>
                <p className="text-slate-300 text-sm">References</p>
              </CardContent>
            </Card>

            <Card className="bg-blue-900/20 border-blue-500/30">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-car text-blue-400 text-xl"></i>
                </div>
                <h3 className="text-white font-bold mb-2">Traffic Law</h3>
                <p className="text-blue-400 text-2xl font-bold mb-2">
                  {laws.filter((law: LawReference) => law.category === 'traffic').length}
                </p>
                <p className="text-slate-300 text-sm">References</p>
              </CardContent>
            </Card>

            <Card className="bg-green-900/20 border-green-500/30">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-building text-green-400 text-xl"></i>
                </div>
                <h3 className="text-white font-bold mb-2">Property Law</h3>
                <p className="text-green-400 text-2xl font-bold mb-2">
                  {laws.filter((law: LawReference) => law.category === 'property').length}
                </p>
                <p className="text-slate-300 text-sm">References</p>
              </CardContent>
            </Card>

            <Card className="bg-orange-900/20 border-orange-500/30">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-shield-alt text-orange-400 text-xl"></i>
                </div>
                <h3 className="text-white font-bold mb-2">Public Safety</h3>
                <p className="text-orange-400 text-2xl font-bold mb-2">
                  {laws.filter((law: LawReference) => law.category === 'public_safety').length}
                </p>
                <p className="text-slate-300 text-sm">References</p>
              </CardContent>
            </Card>
          </div>

          {/* Law References */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Law References</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="animate-pulse bg-slate-700 h-48 rounded-lg"></div>
                  ))}
                </div>
              ) : filteredLaws.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-book text-4xl text-slate-400 mb-4"></i>
                  <p className="text-slate-400 text-lg">No law references found</p>
                  <p className="text-slate-500 text-sm">
                    {searchTerm || selectedCategory !== 'all' 
                      ? 'Try adjusting your search or filter criteria'
                      : 'Add law references to build your legal database'
                    }
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-slate-300 bg-slate-700 border border-slate-600 rounded-lg">
                    <thead className="text-xs uppercase bg-slate-800 text-slate-400">
                      <tr>
                        <th className="px-6 py-3">Title</th>
                        <th className="px-6 py-3">Code</th>
                        <th className="px-6 py-3">Category</th>
                        <th className="px-6 py-3">Description</th>
                        <th className="px-6 py-3">Penalties</th>
                        <th className="px-6 py-3">Related Codes</th>
                        <th className="px-6 py-3">Last Updated</th>
                        <th className="px-6 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLaws.map((law: LawReference) => (
                        <tr 
                          key={law.id} 
                          className="border-b border-slate-600 hover:bg-slate-600 cursor-pointer"
                          onClick={() => setSelectedLaw(law)}
                        >
                          <td className="px-6 py-4 font-medium text-white max-w-xs truncate">{law.title}</td>
                          <td className="px-6 py-4 text-slate-300">{law.code}</td>
                          <td className="px-6 py-4">
                            <Badge className={`${getCategoryColor(law.category)} text-white text-xs`}>
                              {law.category.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 max-w-md truncate" title={law.description}>{law.description}</td>
                          <td className="px-6 py-4 max-w-xs truncate" title={law.penalties || 'N/A'}>{law.penalties || 'N/A'}</td>
                          <td className="px-6 py-4">
                            {law.relatedCodes && law.relatedCodes.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {law.relatedCodes.slice(0, 3).map((code, index) => (
                                  <Badge key={index} variant="outline" className="text-xs border-slate-600 text-slate-300">
                                    {code}
                                  </Badge>
                                ))}
                                {law.relatedCodes.length > 3 && (
                                  <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                                    +{law.relatedCodes.length - 3}
                                  </Badge>
                                )}
                              </div>
                            ) : 'None'}
                          </td>
                          <td className="px-6 py-4 text-slate-400">{new Date(law.lastUpdated).toLocaleDateString()}</td>
                          <td className="px-6 py-4">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLaw(law);
                              }}
                              className="text-slate-400 hover:text-white"
                            >
                              <i className="fas fa-eye mr-1"></i>View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Law Details Dialog */}
          {selectedLaw && (
            <Dialog open={!!selectedLaw} onOpenChange={() => setSelectedLaw(null)}>
              <DialogContent className="bg-slate-800 border-slate-700 max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-white flex items-center space-x-3">
                    <div className={`w-10 h-10 ${getCategoryColor(selectedLaw.category)}/20 rounded-lg flex items-center justify-center`}>
                      <i className={`fas ${getCategoryIcon(selectedLaw.category)} text-${getCategoryColor(selectedLaw.category).replace('bg-', '').replace('-500', '')}-400`}></i>
                    </div>
                    <span>{selectedLaw.title}</span>
                    <Badge className={`${getCategoryColor(selectedLaw.category)} text-white ml-auto`}>
                      {selectedLaw.category.replace('_', ' ')}
                    </Badge>
                  </DialogTitle>
                  <p className="text-slate-400">{selectedLaw.code}</p>
                </DialogHeader>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-white font-medium mb-2">Description</h4>
                    <p className="text-slate-300">{selectedLaw.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-white font-medium mb-2">Full Text</h4>
                    <div className="bg-slate-700 p-4 rounded-lg">
                      <p className="text-slate-300 whitespace-pre-wrap text-sm leading-relaxed">
                        {selectedLaw.fullText}
                      </p>
                    </div>
                  </div>
                  
                  {selectedLaw.penalties && (
                    <div>
                      <h4 className="text-white font-medium mb-2">Penalties</h4>
                      <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg">
                        <p className="text-red-200 text-sm leading-relaxed">{selectedLaw.penalties}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedLaw.relatedCodes && selectedLaw.relatedCodes.length > 0 && (
                    <div>
                      <h4 className="text-white font-medium mb-2">Related Laws</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedLaw.relatedCodes.map((code, index) => (
                          <Badge key={index} variant="outline" className="border-slate-600 text-slate-300">
                            {code}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-slate-400">
                    Last updated: {new Date(selectedLaw.lastUpdated).toLocaleDateString()}
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedLaw(null)}
                      className="border-slate-600 text-slate-300"
                    >
                      Close
                    </Button>
                    <Button 
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                      onClick={() => window.print()}
                    >
                      <i className="fas fa-print mr-2"></i>Print
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </main>
      </div>
    </div>
  );
}
