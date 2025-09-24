import { useEffect, Suspense, lazy } from "react";
import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import ProfessionalLayout from "@/components/layout/professional-layout";

// Lazy load pages for code splitting
const Dashboard = lazy(() => import("@/pages/ultimate-dashboard"));
const Staff = lazy(() => import("@/pages/staff"));
const Clients = lazy(() => import("@/pages/clients"));
const Properties = lazy(() => import("@/pages/properties"));
const Reports = lazy(() => import("@/pages/reports"));
const CrimeIntelligence = lazy(() => import("@/pages/crime-intelligence"));
const LawReference = lazy(() => import("@/pages/law-reference"));
const CommunityOutreach = lazy(() => import("@/pages/community-outreach"));
const Accounting = lazy(() => import("@/pages/accounting"));
const StaffManagement = lazy(() => import("@/pages/staff-management"));
const Scheduling = lazy(() => import("@/pages/scheduling"));
const PatrolReports = lazy(() => import("@/pages/patrol-reports"));
const HawaiiLaw = lazy(() => import("@/pages/hawaii-law"));
const NotFound = lazy(() => import("@/pages/not-found"));
const AdvancedAnalytics = lazy(() => import("@/pages/advanced-analytics"));
const SecurityCompliance = lazy(() => import("@/pages/security-compliance"));
const RealTimeOperations = lazy(() => import("./pages/real-time-operations"));
const AIAutomation = lazy(() => import("./pages/ai-automation"));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center">
    <div className="text-center">
      <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-slate-400">Loading...</p>
    </div>
  </div>
);


function AppContent() {
  const { isAuthenticated, isLoading, login } = useAuth();

  useEffect(() => {
    // Auto-login with default admin credentials if not authenticated
    const autoLogin = async () => {
      if (!isAuthenticated && !isLoading && !localStorage.getItem('auth_token')) {
        console.log('🔐 Auto-logging in with default admin credentials...');
        try {
          await login('STREETPATROL808', 'Password3211');
        } catch (error) {
          console.error('Auto-login failed:', error);
        }
      }
    };

    // Only run auto-login after initial auth check is complete
    if (!isLoading && !isAuthenticated) {
      const timer = setTimeout(() => {
        autoLogin();
      }, 100); // Small delay to ensure state is stable
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, login]);

  // Show loading while authentication is being checked
  if (isLoading) {
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
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
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