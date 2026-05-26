export interface UserProfile {
  uid: string;
  email: string;
  name?: string;
  phone?: string;
  role: 'admin' | 'govt_analyst' | 'intl_agency' | 'analyst' | 'contributor' | 'beneficiary';
  createdAt: string;
}

export type SeverityType = 'Critical' | 'High' | 'Medium' | 'Low';

export interface FieldReport {
  reportId: string;
  location: string;
  latitude: number;
  longitude: number;
  incidentType: string;
  severity: SeverityType;
  description: string;
  createdAt: string;
  submittedBy: string;
  verifiedByAI: boolean;
  aiAnalysis?: string;
  evidence?: string[];
  isDeleted?: boolean;
}

export interface RiskAlert {
  alertId: string;
  areaName: string;
  incidentType: string;
  severity: SeverityType;
  description: string;
  createdAt: string;
  score: number;
  status: 'active' | 'acknowledged' | 'resolved';
}

export interface HistoricalRisk {
  riskId: string;
  areaName: string;
  date: string;
  foodSecurity: number;
  health: number;
  education: number;
  income: number;
  overallRisk: number;
}

export type TabType = 'home' | 'reports' | 'field' | 'alerts' | 'profile' | 'upload' | 'settings';

export interface DashboardStats {
  avgRiskScore: number;
  avgRiskScoreDelta: number;
  areasMonitoredCount: number;
  activeAlertsCount: number;
  criticalAlertsCount: number;
  reportsTodayCount: number;
  reportsTodayDelta: number;
  aiVerifiedCount: number;
  aiVerifiedPercent: number;
  freshnessPercent: number;
}
