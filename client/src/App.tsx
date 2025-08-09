import { Route, Switch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/useAuth";

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
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

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

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
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
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
