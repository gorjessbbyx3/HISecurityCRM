export interface DashboardStats {
  activePatrols: number;
  crimeIncidents: number;
  propertiesSecured: number;
  staffOnDuty: number;
}

export interface IncidentSummary {
  id: string;
  type: string;
  location: string;
  time: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
}

export interface StaffMember {
  id: string;
  name: string;
  zone: string;
  status: 'active' | 'inactive' | 'on_break';
  profileImage?: string;
}

export interface PropertyInfo {
  id: string;
  name: string;
  address: string;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'secure' | 'alert' | 'maintenance';
  coverage: string;
  officers: number;
}

export interface PatrolReport {
  id: string;
  officer: {
    name: string;
    shift: string;
  };
  property: string;
  date: string;
  status: 'complete' | 'in_progress' | 'pending';
  summary: string;
  photos: number;
  checkpoints: number;
  duration?: string;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
}
