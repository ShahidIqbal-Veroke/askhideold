// Case Management Types for Salesforce Anti-Fraud Platform

export type CaseStatus = 'open' | 'investigating' | 'pending_review' | 'closed';
export type CasePriority = 'urgent' | 'high' | 'normal' | 'low';
export type CaseDecision = 'fraud_confirmed' | 'fraud_rejected' | 'insufficient_proof' | 'pending';

export interface CaseMetrics {
  estimatedLoss: number;
  recoveredAmount: number;
  preventedAmount: number;
  investigationCost: number;
  totalRoi: number; // calculated: (recovered + prevented) - investigationCost
}

export interface CaseEvent {
  id: string;
  type: 'created' | 'alert_added' | 'assigned' | 'status_changed' | 'decision_made' | 'note_added';
  description: string;
  userId: string;
  userName: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface Case {
  // Identification
  id: string;
  reference: string; // CASE-2024-001
  
  // Context
  sinisterNumber?: string;
  policyNumber?: string;
  insuredName?: string;
  
  // Alerts Composition
  alerts: string[]; // Alert IDs
  primaryAlertId: string; // Main alert that created this case
  
  // Investigation
  status: CaseStatus;
  priority: CasePriority;
  investigator?: string;
  investigatorName?: string;
  supervisor?: string;
  supervisorName?: string;
  
  // === NOUVEAU: TRAÇABILITÉ ÉQUIPES ===
  qualifiedBy: string;        // Gestionnaire qui a qualifié
  qualifiedByName: string;
  investigationTeam: 'gestionnaire' | 'fraude' | 'expert' | 'compliance';
  
  handovers: Array<{
    from: string;
    fromTeam: string;
    fromRole: string;
    to: string;
    toTeam: string;
    toRole: string;
    reason: string;
    timestamp: Date;
    metadata?: Record<string, any>;
  }>;
  
  // Decision
  decision: CaseDecision;
  decisionReason?: string;
  decisionDate?: Date;
  
  // Financial Impact
  metrics: CaseMetrics;
  
  // Timeline & Notes
  timeline: CaseEvent[];
  notes: string[];
  
  // Metadata
  tags: string[];
  fraudTypes: string[];
  
  // Audit
  createdAt: Date;
  createdBy: string;
  createdByName: string;
  updatedAt: Date;
  closedAt?: Date;
}

// Case Statistics
export interface CaseStats {
  total: number;
  open: number;
  investigating: number;
  pendingReview: number;
  closed: number;
  
  byPriority: {
    urgent: number;
    high: number;
    normal: number;
    low: number;
  };
  
  byDecision: {
    fraudConfirmed: number;
    fraudRejected: number;
    insufficientProof: number;
    pending: number;
  };
  
  financialImpact: {
    totalRecovered: number;
    totalPrevented: number;
    totalInvestigationCosts: number;
    netRoi: number;
  };
  
  avgInvestigationTime: number; // in days
  todayCount: number;
  weekCount: number;
}

// Case Filter Options
export interface CaseFilters {
  status?: CaseStatus[];
  priority?: CasePriority[];
  investigator?: string;
  supervisor?: string;
  decision?: CaseDecision[];
  dateFrom?: Date;
  dateTo?: Date;
  searchTerm?: string;
  tags?: string[];
}

// Case Creation Request
export interface CreateCaseRequest {
  alertIds: string[];
  primaryAlertId: string;
  priority: CasePriority;
  assignTo?: string;
  notes?: string;
  estimatedLoss?: number;
  
  // === NOUVEAU: SUPPORT MULTI-ÉQUIPE ===
  investigationTeam?: 'gestionnaire' | 'fraude' | 'expert' | 'compliance';
  handoverReason?: string; // Si assigné à équipe différente
}

// Case Update Request
export interface UpdateCaseRequest {
  caseId: string;
  status?: CaseStatus;
  priority?: CasePriority;
  investigator?: string;
  supervisor?: string;
  decision?: CaseDecision;
  decisionReason?: string;
  metrics?: Partial<CaseMetrics>;
  addNote?: string;
  addTags?: string[];
}

// Case Assignment Request
export interface CaseAssignment {
  caseIds: string[];
  assignTo: string;
  role: 'investigator' | 'supervisor';
  reason?: string;
}