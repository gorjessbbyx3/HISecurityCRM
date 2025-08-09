import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertFinancialRecordSchema, type FinancialRecord } from "@shared/schema";

export default function Accounting() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedRecord, setSelectedRecord] = useState<FinancialRecord | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("current_month");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: financialSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ["/api/financial/summary"],
    enabled: isAuthenticated,
  });

  const { data: financialRecords = [], isLoading: recordsLoading } = useQuery({
    queryKey: ["/api/financial/records"],
    enabled: isAuthenticated,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients"],
    enabled: isAuthenticated,
  });

  const form = useForm({
    resolver: zodResolver(insertFinancialRecordSchema),
    defaultValues: {
      clientId: "",
      recordType: "payment",
      amount: "",
      description: "",
      category: "patrol_services",
      taxCategory: "deductible",
      transactionDate: new Date().toISOString().split('T')[0],
      paymentMethod: "check",
      referenceNumber: "",
      status: "pending",
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/financial/records", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial/records"] });
      queryClient.invalidateQueries({ queryKey: ["/api/financial/summary"] });
      toast({
        title: "Success",
        description: "Financial record created successfully",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create financial record",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    const formattedData = {
      ...data,
      amount: parseFloat(data.amount),
    };
    createMutation.mutate(formattedData);
  };

  const openCreateDialog = () => {
    setSelectedRecord(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const getRecordTypeColor = (type: string) => {
    switch (type) {
      case "payment": return "bg-green-500/20 text-green-400";
      case "invoice": return "bg-blue-500/20 text-blue-400";
      case "expense": return "bg-red-500/20 text-red-400";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-500/20 text-green-400";
      case "pending": return "bg-yellow-500/20 text-yellow-400";
      case "overdue": return "bg-red-500/20 text-red-400";
      case "cancelled": return "bg-slate-500/20 text-slate-400";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  const getTaxCategoryIcon = (category: string) => {
    switch (category) {
      case "deductible": return "fas fa-check-circle";
      case "non_deductible": return "fas fa-times-circle";
      case "exempt": return "fas fa-minus-circle";
      default: return "fas fa-question-circle";
    }
  };

  const filteredRecords = financialRecords.filter((record: any) => {
    const recordDate = new Date(record.transactionDate);
    const now = new Date();
    
    switch (selectedPeriod) {
      case "current_month":
        return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
      case "last_month":
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return recordDate.getMonth() === lastMonth.getMonth() && recordDate.getFullYear() === lastMonth.getFullYear();
      case "current_year":
        return recordDate.getFullYear() === now.getFullYear();
      case "last_year":
        return recordDate.getFullYear() === now.getFullYear() - 1;
      default:
        return true;
    }
  });

  const periodSummary = {
    totalRevenue: filteredRecords
      .filter((record: any) => record.recordType === "payment")
      .reduce((sum: number, record: any) => sum + parseFloat(record.amount || 0), 0),
    totalExpenses: filteredRecords
      .filter((record: any) => record.recordType === "expense")
      .reduce((sum: number, record: any) => sum + parseFloat(record.amount || 0), 0),
    totalInvoices: filteredRecords
      .filter((record: any) => record.recordType === "invoice")
      .reduce((sum: number, record: any) => sum + parseFloat(record.amount || 0), 0),
  };

  const netProfit = periodSummary.totalRevenue - periodSummary.totalExpenses;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-calculator text-4xl text-gold-500 mb-4 animate-pulse"></i>
          <p className="text-white">Loading Accounting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white min-h-screen">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-y-auto" data-testid="main-accounting">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white" data-testid="text-page-title">
                  Smart Accounting
                </h2>
                <p className="text-slate-400 mt-1" data-testid="text-page-subtitle">
                  Financial tracking with tax-friendly categorization and automated expense reporting
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-slate-800 rounded-lg px-3 py-2">
                  <i className="fas fa-calendar text-slate-400"></i>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="bg-transparent text-white text-sm outline-none"
                    data-testid="select-period"
                  >
                    <option value="current_month">Current Month</option>
                    <option value="last_month">Last Month</option>
                    <option value="current_year">Current Year</option>
                    <option value="last_year">Last Year</option>
                    <option value="all">All Time</option>
                  </select>
                </div>
                
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={openCreateDialog}
                      className="bg-gold-500 hover:bg-gold-600 text-black px-4 py-2 rounded-lg font-medium transition-colors"
                      data-testid="button-add-record"
                    >
                      <i className="fas fa-plus mr-2"></i>Add Record
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create Financial Record</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="recordType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Record Type *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-slate-700 border-slate-600" data-testid="select-record-type">
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-slate-700 border-slate-600">
                                    <SelectItem value="payment">Payment Received</SelectItem>
                                    <SelectItem value="invoice">Invoice Sent</SelectItem>
                                    <SelectItem value="expense">Business Expense</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Amount *</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00" 
                                    {...field} 
                                    className="bg-slate-700 border-slate-600"
                                    data-testid="input-amount"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="clientId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Client (Optional)</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-slate-700 border-slate-600" data-testid="select-client">
                                    <SelectValue placeholder="Select client (optional)" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-slate-700 border-slate-600">
                                  {clients.map((client: any) => (
                                    <SelectItem key={client.id} value={client.id}>
                                      {client.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description *</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Description of transaction" 
                                  {...field} 
                                  className="bg-slate-700 border-slate-600"
                                  data-testid="textarea-description"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-slate-700 border-slate-600" data-testid="select-category">
                                      <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-slate-700 border-slate-600">
                                    <SelectItem value="patrol_services">Patrol Services</SelectItem>
                                    <SelectItem value="consultation">Consultation</SelectItem>
                                    <SelectItem value="equipment">Equipment</SelectItem>
                                    <SelectItem value="travel">Travel</SelectItem>
                                    <SelectItem value="training">Training</SelectItem>
                                    <SelectItem value="insurance">Insurance</SelectItem>
                                    <SelectItem value="office_supplies">Office Supplies</SelectItem>
                                    <SelectItem value="vehicle_maintenance">Vehicle Maintenance</SelectItem>
                                    <SelectItem value="utilities">Utilities</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="taxCategory"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tax Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-slate-700 border-slate-600" data-testid="select-tax-category">
                                      <SelectValue placeholder="Select tax category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-slate-700 border-slate-600">
                                    <SelectItem value="deductible">Tax Deductible</SelectItem>
                                    <SelectItem value="non_deductible">Non-Deductible</SelectItem>
                                    <SelectItem value="exempt">Tax Exempt</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="transactionDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Transaction Date *</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="date"
                                    {...field} 
                                    className="bg-slate-700 border-slate-600"
                                    data-testid="input-transaction-date"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="paymentMethod"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Payment Method</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-slate-700 border-slate-600" data-testid="select-payment-method">
                                      <SelectValue placeholder="Select method" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-slate-700 border-slate-600">
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="check">Check</SelectItem>
                                    <SelectItem value="credit_card">Credit Card</SelectItem>
                                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                    <SelectItem value="paypal">PayPal</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="referenceNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Reference Number</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Invoice #, Check #, etc." 
                                    {...field} 
                                    className="bg-slate-700 border-slate-600"
                                    data-testid="input-reference-number"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-slate-700 border-slate-600" data-testid="select-status">
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-slate-700 border-slate-600">
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="overdue">Overdue</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notes</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Additional notes" 
                                  {...field} 
                                  className="bg-slate-700 border-slate-600"
                                  data-testid="textarea-notes"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end space-x-3 pt-4">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsDialogOpen(false)}
                            className="border-slate-600 text-slate-300"
                            data-testid="button-cancel"
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={createMutation.isPending}
                            className="bg-gold-500 hover:bg-gold-600 text-black"
                            data-testid="button-save-record"
                          >
                            {createMutation.isPending ? (
                              <>
                                <i className="fas fa-spinner fa-spin mr-2"></i>
                                Saving...
                              </>
                            ) : (
                              "Create Record"
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                <Button 
                  className="bg-navy-700 hover:bg-navy-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  data-testid="button-export-tax-report"
                >
                  <i className="fas fa-file-excel mr-2"></i>Export Tax Report
                </Button>
              </div>
            </div>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Total Revenue</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-total-revenue">
                        ${periodSummary.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-green-400 text-xs mt-2">
                        <i className="fas fa-arrow-up mr-1"></i>Period Total
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-dollar-sign text-green-400 text-lg"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Total Expenses</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-total-expenses">
                        ${periodSummary.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-red-400 text-xs mt-2">
                        <i className="fas fa-arrow-down mr-1"></i>Period Total
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-credit-card text-red-400 text-lg"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Net Profit</p>
                      <p className={`text-2xl font-bold mt-1 ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`} data-testid="text-net-profit">
                        ${netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      <p className={`text-xs mt-2 ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        <i className={`fas ${netProfit >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'} mr-1`}></i>
                        {((netProfit / Math.max(periodSummary.totalRevenue, 1)) * 100).toFixed(1)}% Margin
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-chart-line text-blue-400 text-lg"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Tax Deductible</p>
                      <p className="text-2xl font-bold text-white mt-1" data-testid="text-tax-deductible">
                        ${filteredRecords
                          .filter((record: any) => record.taxCategory === "deductible")
                          .reduce((sum: number, record: any) => sum + parseFloat(record.amount || 0), 0)
                          .toLocaleString('en-US', { minimumFractionDigits: 2 })
                        }
                      </p>
                      <p className="text-gold-400 text-xs mt-2">
                        <i className="fas fa-percentage mr-1"></i>Tax Savings
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gold-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-receipt text-gold-400 text-lg"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Financial Records */}
          <div className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Financial Records</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-blue-500/20 text-blue-400">
                      {filteredRecords.length} Records
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-slate-400 hover:text-white"
                      data-testid="button-filter-records"
                    >
                      <i className="fas fa-filter"></i>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {recordsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className="flex items-center space-x-3 p-4 bg-slate-700 rounded-lg">
                          <div className="w-12 h-12 bg-slate-600 rounded-lg"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-slate-600 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-slate-600 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredRecords.length === 0 ? (
                  <div className="text-center py-12">
                    <i className="fas fa-calculator text-4xl text-slate-400 mb-4"></i>
                    <h3 className="text-xl font-semibold text-white mb-2">No Financial Records Found</h3>
                    <p className="text-slate-400 mb-4">Start by adding your first financial record</p>
                    <Button 
                      onClick={openCreateDialog}
                      className="bg-gold-500 hover:bg-gold-600 text-black"
                      data-testid="button-create-first-record"
                    >
                      <i className="fas fa-plus mr-2"></i>Create First Record
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredRecords.map((record: any) => (
                      <div key={record.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            record.recordType === 'payment' ? 'bg-green-500/20' :
                            record.recordType === 'invoice' ? 'bg-blue-500/20' :
                            'bg-red-500/20'
                          }`}>
                            <i className={`${
                              record.recordType === 'payment' ? 'fas fa-dollar-sign text-green-400' :
                              record.recordType === 'invoice' ? 'fas fa-file-invoice text-blue-400' :
                              'fas fa-credit-card text-red-400'
                            } text-lg`}></i>
                          </div>
                          <div>
                            <h4 className="text-white font-medium">{record.description}</h4>
                            <div className="flex items-center space-x-3 mt-1">
                              <Badge className={getRecordTypeColor(record.recordType)}>
                                {record.recordType}
                              </Badge>
                              <span className="text-slate-400 text-sm">{record.category?.replace('_', ' ')}</span>
                              <span className="text-slate-400 text-sm">
                                {new Date(record.transactionDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className={`text-lg font-bold ${
                              record.recordType === 'payment' ? 'text-green-400' :
                              record.recordType === 'expense' ? 'text-red-400' :
                              'text-blue-400'
                            }`}>
                              ${parseFloat(record.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={getStatusColor(record.status)}>
                                {record.status}
                              </Badge>
                              <i className={`${getTaxCategoryIcon(record.taxCategory)} ${
                                record.taxCategory === 'deductible' ? 'text-green-400' :
                                record.taxCategory === 'non_deductible' ? 'text-red-400' :
                                'text-slate-400'
                              } text-sm`} title={record.taxCategory}></i>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-slate-400 hover:text-white hover:bg-slate-600"
                              data-testid="button-edit-record"
                            >
                              <i className="fas fa-edit"></i>
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                              data-testid="button-view-receipt"
                            >
                              <i className="fas fa-receipt"></i>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tax Information */}
          <Card className="bg-slate-800 border-slate-700 mt-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <i className="fas fa-info-circle text-blue-500 mr-2"></i>
                Tax Reference Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-medium mb-3">Common Security Business Deductions</h4>
                  <ul className="space-y-2 text-slate-300 text-sm">
                    <li className="flex items-start space-x-2">
                      <i className="fas fa-check text-green-500 w-4 mt-0.5"></i>
                      <span>Vehicle expenses (mileage, maintenance, fuel)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <i className="fas fa-check text-green-500 w-4 mt-0.5"></i>
                      <span>Security equipment and uniforms</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <i className="fas fa-check text-green-500 w-4 mt-0.5"></i>
                      <span>Professional licenses and certifications</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <i className="fas fa-check text-green-500 w-4 mt-0.5"></i>
                      <span>Business insurance premiums</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <i className="fas fa-check text-green-500 w-4 mt-0.5"></i>
                      <span>Training and continuing education</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-3">Record Keeping Best Practices</h4>
                  <ul className="space-y-2 text-slate-300 text-sm">
                    <li className="flex items-start space-x-2">
                      <i className="fas fa-exclamation-triangle text-yellow-500 w-4 mt-0.5"></i>
                      <span>Keep receipts for all business expenses</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <i className="fas fa-exclamation-triangle text-yellow-500 w-4 mt-0.5"></i>
                      <span>Track business mileage with dates and destinations</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <i className="fas fa-exclamation-triangle text-yellow-500 w-4 mt-0.5"></i>
                      <span>Separate business and personal expenses</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <i className="fas fa-exclamation-triangle text-yellow-500 w-4 mt-0.5"></i>
                      <span>Maintain records for at least 7 years</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <i className="fas fa-exclamation-triangle text-yellow-500 w-4 mt-0.5"></i>
                      <span>Consult with a tax professional annually</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-slate-700 rounded-lg">
                <p className="text-slate-300 text-sm">
                  <strong className="text-white">Disclaimer:</strong> This information is for general guidance only. 
                  Tax laws vary and change frequently. Always consult with a qualified tax professional for advice 
                  specific to your situation.
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
