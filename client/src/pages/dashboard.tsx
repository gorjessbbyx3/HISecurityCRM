import { Layout, Grid, Section } from "@/components/layout/enhanced-layout";
import { StatsCard, ListCard, ActionCard } from "@/components/ui/enhanced-card";
import { Button } from "@/components/ui/button";
import { EvidenceGallery } from "@/components/dashboard/evidence-gallery";
import { useQuery } from "@tanstack/react-query";
import LoginTest from "@/components/test/LoginTest";
import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/stats", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    refetchInterval: 30000,
  });

  const { data: patrolReports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ["/api/patrol-reports", { today: true }],
    queryFn: async () => {
      const response = await fetch("/api/patrol-reports?today=true", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch reports');
      return response.json();
    },
    refetchInterval: 60000,
  });

  const { data: recentIncidents = [], isLoading: incidentsLoading } = useQuery({
    queryKey: ["/api/incidents", { recent: true }],
    queryFn: async () => {
      const response = await fetch("/api/incidents?recent=true", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch incidents');
      return response.json();
    },
    refetchInterval: 30000,
  });

  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ["/api/activities"],
    queryFn: async () => {
      const response = await fetch("/api/activities?limit=10", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch activities');
      return response.json();
    },
    refetchInterval: 15000,
  });

  const handleNewReport = () => {
    window.location.href = '/patrol-reports';
  };

  const handleEmergency = () => {
    // Emergency protocol - could integrate with emergency services
    alert('Emergency protocol activated. Contact emergency services immediately.');
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'overdue': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const { isAuthenticated, user } = useAuth();

  return (
    <Layout
      title="Security Operations Dashboard"
      subtitle="Monitor crime intelligence, manage patrols, and oversee security operations across Hawaii"
      actions={
        <>
          <Button 
            onClick={handleNewReport}
            className="bg-gold-500 hover:bg-gold-600 text-black"
            data-testid="button-create-report"
          >
            <i className="fas fa-plus mr-2"></i>New Report
          </Button>
          <Button 
            onClick={handleEmergency}
            className="bg-red-600 hover:bg-red-700 text-white"
            data-testid="button-emergency"
          >
            <i className="fas fa-exclamation-circle mr-2"></i>Emergency
          </Button>
        </>
      }
    >
      <Section>
        {/* Stats Cards */}
        <Grid cols={4} className="mb-8">
          <StatsCard
            title="Total Incidents"
            value={statsLoading ? '...' : stats?.totalIncidents || 0}
            icon={<i className="fas fa-exclamation-triangle text-red-400 text-lg"></i>}
            loading={statsLoading}
          />
          <StatsCard
            title="Active Patrols"
            value={statsLoading ? '...' : stats?.activePatrols || 0}
            icon={<i className="fas fa-route text-blue-400 text-lg"></i>}
            loading={statsLoading}
          />
          <StatsCard
            title="Properties Secured"
            value={statsLoading ? '...' : stats?.propertiesSecured || 0}
            icon={<i className="fas fa-shield-alt text-green-400 text-lg"></i>}
            loading={statsLoading}
          />
          <StatsCard
            title="Staff On Duty"
            value={statsLoading ? '...' : stats?.staffOnDuty || 0}
            icon={<i className="fas fa-users text-gold-400 text-lg"></i>}
            loading={statsLoading}
          />
        </Grid>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <ListCard
              title="Today's Patrol Reports"
              items={patrolReports.slice(0, 5).map((report: any) => ({
                id: report.id,
                title: report.officerName || 'Officer',
                description: `${report.summary} - ${report.shiftType} shift at ${new Date(report.startTime).toLocaleTimeString()}`,
                badge: {
                  text: report.status || 'unknown',
                  variant: getStatusColor(report.status)
                }
              }))}
              onViewAll={() => window.location.href = '/patrol-reports'}
              loading={reportsLoading}
              emptyMessage="No patrol reports for today"
            />

            <ListCard
              title="Recent Incidents"
              items={recentIncidents.slice(0, 4).map((incident: any) => ({
                id: incident.id,
                title: incident.incidentType,
                description: `${incident.location} - ${incident.description}`,
                badge: {
                  text: incident.severity,
                  variant: getSeverityColor(incident.severity)
                }
              }))}
              onViewAll={() => window.location.href = '/crime-intelligence'}
              loading={incidentsLoading}
              emptyMessage="No recent incidents"
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <EvidenceGallery />
            
            <ListCard
              title="Recent Activity"
              items={activities.map((activity: any) => ({
                id: activity.id,
                title: activity.description,
                description: new Date(activity.createdAt).toLocaleString()
              }))}
              loading={activitiesLoading}
              emptyMessage="No recent activity"
            />
          </div>
        </div>

        {/* Show login test for non-authenticated users */}
        {!isAuthenticated && (
          <LoginTest />
        )}
      </Section>
    </Layout>
  );
}