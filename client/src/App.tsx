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
import AdvancedAnalytics from "@/pages/advanced-analytics";
import SecurityCompliance from "@/pages/security-compliance";
import RealTimeOperations from "./pages/real-time-operations";
import AIAutomation from "./pages/ai-automation";


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
    <Switch>
      <Route path="/" component={() => <ProfessionalLayout><Dashboard /></ProfessionalLayout>} />
      <Route path="/dashboard" component={() => <ProfessionalLayout><Dashboard /></ProfessionalLayout>} />
      <Route path="/staff" component={() => <ProfessionalLayout><Staff /></ProfessionalLayout>} />
      <Route path="/clients" component={() => <ProfessionalLayout><Clients /></ProfessionalLayout>} />
      <Route path="/properties" component={() => <ProfessionalLayout><Properties /></ProfessionalLayout>} />
      <Route path="/reports" component={() => <ProfessionalLayout><Reports /></ProfessionalLayout>} />
      <Route path="/crime-intelligence" component={() => <ProfessionalLayout><CrimeIntelligence /></ProfessionalLayout>} />
      <Route path="/law-reference" component={() => <ProfessionalLayout><LawReference /></ProfessionalLayout>} />
      <Route path="/community-outreach" component={() => <ProfessionalLayout><CommunityOutreach /></ProfessionalLayout>} />
      <Route path="/accounting" component={() => <ProfessionalLayout><Accounting /></ProfessionalLayout>} />
      <Route path="/staff-management" component={() => <ProfessionalLayout><StaffManagement /></ProfessionalLayout>} />
      <Route path="/scheduling" component={() => <ProfessionalLayout><Scheduling /></ProfessionalLayout>} />
      <Route path="/patrol-reports" component={() => <ProfessionalLayout><PatrolReports /></ProfessionalLayout>} />
      <Route path="/hawaii-law" component={() => <ProfessionalLayout><HawaiiLaw /></ProfessionalLayout>} />
      <Route path="/advanced-analytics" component={() => <ProfessionalLayout><AdvancedAnalytics /></ProfessionalLayout>} />
      <Route path="/security-compliance" component={() => <ProfessionalLayout><SecurityCompliance /></ProfessionalLayout>} />
      <Route path="/real-time-operations" component={() => <ProfessionalLayout><RealTimeOperations /></ProfessionalLayout>} />
      <Route path="/ai-automation" component={() => <ProfessionalLayout><AIAutomation /></ProfessionalLayout>} />
      <Route component={NotFound} />
    </Switch>
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