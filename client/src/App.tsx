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
import Dashboard from "@/pages/ultimate-dashboard";
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

function AppContent() {
  const { isAuthenticated, isLoading, login } = useAuth();

  useEffect(() => {
    // Auto-login with default admin credentials if not authenticated
    const autoLogin = async () => {
      if (!isAuthenticated && !isLoading && !localStorage.getItem('auth_token')) {
        console.log('🔐 Auto-logging in with default admin credentials...');
        await login('STREETPATROL808', 'Password3211');
      }
    };

    autoLogin();
  }, [isAuthenticated, isLoading, login]);

  // Show loading while auto-login is in progress
  if (isLoading || (!isAuthenticated && !localStorage.getItem('auth_token'))) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
            <i className="fas fa-shield-alt text-slate-900 text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Hawaii Security CRM
          </h2>
          <p className="text-slate-400">
            Initializing security management system...
          </p>
        </div>
      </div>
    );
  }

  return (
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
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AppContent />
        <Toaster />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;