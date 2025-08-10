import { useEffect } from "react";
import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Pages
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Staff from "@/pages/staff";
import Clients from "@/pages/clients";
import Properties from "@/pages/properties";
import Reports from "@/pages/reports";
import CrimeIntelligence from "@/pages/crime-intelligence";
import LawReference from "@/pages/law-reference";
import CommunityOutreach from "@/pages/community-outreach";
import Accounting from "@/pages/accounting";
import StaffManagement from "@/pages/staff-management";
import Scheduling from "@/pages/scheduling";
import PatrolReports from "@/pages/patrol-reports";
import HawaiiLaw from "@/pages/hawaii-law";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading, user, checkAuthStatus } = useAuth();

  console.log("Router state:", { isAuthenticated, isLoading, user });

  // Listen for storage events to refetch auth status when other tabs log in/out
  useEffect(() => {
    const handleStorageChange = () => {
      checkAuthStatus();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkAuthStatus]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 bg-navy-700 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <i className="fas fa-shield-alt text-gold-500 text-lg animate-pulse"></i>
          </div>
          <p className="text-white">Loading Hawaii Security CRM...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="*" component={Landing} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/staff" component={Staff} />
      <Route path="/staff-management" component={StaffManagement} />
      <Route path="/clients" component={Clients} />
      <Route path="/properties" component={Properties} />
      <Route path="/reports" component={Reports} />
      <Route path="/patrol-reports" component={PatrolReports} />
      <Route path="/crime-intelligence" component={CrimeIntelligence} />
      <Route path="/law-reference" component={LawReference} />
      <Route path="/hawaii-law" component={HawaiiLaw} />
      <Route path="/community-outreach" component={CommunityOutreach} />
      <Route path="/accounting" component={Accounting} />
      <Route path="/scheduling" component={Scheduling} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <Router />
        <Toaster />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
