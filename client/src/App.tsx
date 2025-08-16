import { useEffect } from "react";
import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import ProfessionalLayout from "@/components/layout/professional-layout";

// Pages
import Login from "@/pages/login";
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



function App() {
  const { isAuthenticated, isLoading, user } = useAuth();

  console.log('🔍 App.tsx - Auth State:', { isAuthenticated, isLoading, user: user?.username });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
            <div className="w-8 h-8 border-4 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
          </div>
          <p className="text-lg font-medium">Loading Hawaii Security CRM...</p>
          <p className="text-slate-400 text-sm mt-2">Initializing secure environment</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login page
  if (!isAuthenticated) {
    console.log('🔒 Not authenticated - showing login page');
    return (
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <Login />
          <Toaster />
        </ErrorBoundary>
      </QueryClientProvider>
    );
  }

  // If authenticated, show the main app with routing
  console.log('✅ Authenticated - showing main app');
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <ProfessionalLayout>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/staff" component={Staff} />
            <Route path="/clients" component={Clients} />
            <Route path="/properties" component={Properties} />
            <Route path="/reports" component={Reports} />
            <Route path="/crime-intelligence" component={CrimeIntelligence} />
            <Route path="/law-reference" component={LawReference} />
            <Route path="/community-outreach" component={CommunityOutreach} />
            <Route path="/accounting" component={Accounting} />
            <Route path="/staff-management" component={StaffManagement} />
            <Route path="/scheduling" component={Scheduling} />
            <Route path="/patrol-reports" component={PatrolReports} />
            <Route path="/hawaii-law" component={HawaiiLaw} />
            <Route component={NotFound} />
          </Switch>
        </ProfessionalLayout>
        <Toaster />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;