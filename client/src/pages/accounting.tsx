
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Accounting() {
  const monthlyRevenue = [
    { month: "Jan", revenue: 125000, expenses: 98000, profit: 27000 },
    { month: "Feb", revenue: 132000, expenses: 101000, profit: 31000 },
    { month: "Mar", revenue: 145000, expenses: 105000, profit: 40000 },
    { month: "Apr", revenue: 138000, expenses: 103000, profit: 35000 },
    { month: "May", revenue: 155000, expenses: 108000, profit: 47000 },
    { month: "Jun", revenue: 162000, expenses: 112000, profit: 50000 }
  ];

  const clientAccounts = [
    { client: "Ala Moana Shopping Center", monthly: 45000, status: "Current", lastPayment: "Jan 30, 2024" },
    { client: "Waikiki Resort Group", monthly: 38000, status: "Current", lastPayment: "Jan 28, 2024" },
    { client: "Pearl Harbor Memorial", monthly: 25000, status: "Current", lastPayment: "Jan 25, 2024" },
    { client: "Honolulu Airport Authority", monthly: 32000, status: "Overdue", lastPayment: "Dec 15, 2023" },
    { client: "Diamond Head Lookout", monthly: 15000, status: "Pending", lastPayment: "Jan 20, 2024" }
  ];

  const expenses = [
    { category: "Payroll", amount: 85000, percentage: 65, trend: "+2%" },
    { category: "Equipment", amount: 12000, percentage: 9, trend: "-5%" },
    { category: "Insurance", amount: 8000, percentage: 6, trend: "0%" },
    { category: "Training", amount: 5000, percentage: 4, trend: "+10%" },
    { category: "Utilities", amount: 3000, percentage: 2, trend: "+3%" },
    { category: "Other", amount: 18000, percentage: 14, trend: "+1%" }
  ];

  return (
    
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Accounting & Finance</h1>
          <div className="flex space-x-3">
            <Button className="bg-green-700 hover:bg-green-600 text-white">
              <i className="fas fa-download mr-2"></i>
              Export Report
            </Button>
            <Button className="bg-navy-700 hover:bg-navy-600 text-white">
              <i className="fas fa-plus mr-2"></i>
              New Transaction
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Monthly Revenue</p>
                <p className="text-2xl font-bold text-white">$162,000</p>
                <p className="text-sm text-green-500">+8.3% from last month</p>
              </div>
              <i className="fas fa-dollar-sign text-green-500 text-2xl"></i>
            </div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Monthly Expenses</p>
                <p className="text-2xl font-bold text-white">$112,000</p>
                <p className="text-sm text-red-500">+4.2% from last month</p>
              </div>
              <i className="fas fa-credit-card text-red-500 text-2xl"></i>
            </div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Net Profit</p>
                <p className="text-2xl font-bold text-white">$50,000</p>
                <p className="text-sm text-green-500">+17.6% from last month</p>
              </div>
              <i className="fas fa-chart-line text-blue-500 text-2xl"></i>
            </div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Outstanding A/R</p>
                <p className="text-2xl font-bold text-white">$32,000</p>
                <p className="text-sm text-yellow-500">1 overdue account</p>
              </div>
              <i className="fas fa-exclamation-triangle text-yellow-500 text-2xl"></i>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Client Accounts</h2>
            <div className="space-y-4">
              {clientAccounts.map((account, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{account.client}</p>
                    <p className="text-sm text-slate-400">Last payment: {account.lastPayment}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">${account.monthly.toLocaleString()}/mo</p>
                    <span className={`px-2 py-1 rounded text-xs ${
                      account.status === "Current" ? "bg-green-600 text-white" :
                      account.status === "Overdue" ? "bg-red-600 text-white" :
                      "bg-yellow-600 text-white"
                    }`}>
                      {account.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Expense Breakdown</h2>
            <div className="space-y-4">
              {expenses.map((expense, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">{expense.category}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-white">${expense.amount.toLocaleString()}</span>
                      <span className={`text-sm ${
                        expense.trend.startsWith('+') ? 'text-red-500' : 
                        expense.trend.startsWith('-') ? 'text-green-500' : 'text-slate-400'
                      }`}>
                        {expense.trend}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${expense.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="bg-slate-800 border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Revenue Trend (6 Months)</h2>
          <div className="grid grid-cols-6 gap-4">
            {monthlyRevenue.map((month, index) => (
              <div key={index} className="text-center">
                <div className="bg-slate-700 p-4 rounded-lg mb-2">
                  <p className="text-white font-bold text-lg">{month.month}</p>
                  <p className="text-green-500 text-sm">${(month.revenue / 1000).toFixed(0)}K</p>
                  <p className="text-red-500 text-sm">${(month.expenses / 1000).toFixed(0)}K</p>
                  <p className="text-blue-500 text-sm font-bold">${(month.profit / 1000).toFixed(0)}K</p>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(month.profit / 50000) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    
  );
}