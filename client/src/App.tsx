import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import ErrorBoundary from '@/components/ErrorBoundary';
import Layout from '@/components/layout/layout';
import { useAuth } from '@/hooks/useAuth';

// Import pages
import LandingPage from '@/pages/landing';
import Dashboard from '@/pages/dashboard';
import StaffManagement from '@/pages/staff-management';
import Properties from '@/pages/properties';
import PatrolReports from '@/pages/patrol-reports';
import CrimeIntelligence from '@/pages/crime-intelligence';
import Reports from '@/pages/reports';
import Scheduling from '@/pages/scheduling';
import Accounting from '@/pages/accounting';
import Clients from '@/pages/clients';
import Staff from '@/pages/staff';
import CommunityOutreach from '@/pages/community-outreach';
import HawaiiLaw from '@/pages/hawaii-law';
import LawReference from '@/pages/law-reference';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/staff-management" element={<ProtectedRoute><StaffManagement /></ProtectedRoute>} />
            <Route path="/properties" element={<ProtectedRoute><Properties /></ProtectedRoute>} />
            <Route path="/patrol-reports" element={<ProtectedRoute><PatrolReports /></ProtectedRoute>} />
            <Route path="/crime-intelligence" element={<ProtectedRoute><CrimeIntelligence /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/scheduling" element={<ProtectedRoute><Scheduling /></ProtectedRoute>} />
            <Route path="/accounting" element={<ProtectedRoute><Accounting /></ProtectedRoute>} />
            <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
            <Route path="/staff" element={<ProtectedRoute><Staff /></ProtectedRoute>} />
            <Route path="/community-outreach" element={<ProtectedRoute><CommunityOutreach /></ProtectedRoute>} />
            <Route path="/hawaii-law" element={<ProtectedRoute><HawaiiLaw /></ProtectedRoute>} />
            <Route path="/law-reference" element={<ProtectedRoute><LawReference /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;