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



function App() {
  // Skip authentication and go directly to the main app
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