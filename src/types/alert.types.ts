// Alert System Types for Salesforce Anti-Fraud Platform  
// EVENT-DRIVEN ARCHITECTURE: Alerts are derived from Events, not directly linked to persons
// ARCHITECTURE DÉCLOISONNÉE: Ville (Sources) + Quartiers (Métier)

import { FraudCitySource, BusinessDistrict, SpecializedTeam, ClassificationResult } from './fraud-catalog.types';

export type AlertSource = 'document_analysis' | 'pattern_detection' | 'behavioral_analysis' | 'correlation' | 'external_api';
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';
export type AlertStatus = 'pending' | 'assigned' | 'in_review' | 'qualified' | 'rejected';
export type AlertQualification = 'fraud_confirmed' | 'false_positive' | 'requires_investigation';

export interface AlertMetadata {
  // Basic Information
  sinisterNumber?: string;
  policyNumber?: string;
  insuredName?: string;
  amount?: number;
  documentType?: string;
  fileName?: string;
  
  // Business Context
  businessContext?: 'subscription' | 'claims' | 'unknown';
  documentFamily?: 'subscription' | 'claims' | 'identity' | 'financial' | 'medical' | 'automotive' | 'unknown';
  workflowStage?: 'onboarding' | 'renewal' | 'claim_submission' | 'claim_processing' | 'dispute' | 'unknown';
  urgencyLevel?: 'low' | 'medium' | 'high' | 'critical';
  
  // Fraud Analysis
  primaryFraudType?: string;
  fraudTypes?: string[];
  businessImpact?: 'low' | 'medium' | 'high' | 'critical';
  riskFactors?: string[];
  
  // Financial Impact
  estimatedLoss?: number;
  preventedAmount?: number;
  directROI?: number;
  riskAdjustedROI?: number;
  
  // Technical Evidence
  technicalEvidence?: Array<{
    code: string;
    message: string;
    severity: 'info' | 'warn' | 'fail';
    confidence: number;
  }>;
  
  // Classification Insights
  contentIndicators?: number;
  extractedEntities?: number;
  riskIndicators?: number;
  
  // === ARCHITECTURE DÉCLOISONNÉE: Ville/Quartier ===
  fraud_city_source?: FraudCitySource;     // Source Ville: cyber, aml, documentaire, comportemental
  business_district?: BusinessDistrict;     // Quartier métier: auto, santé, habitation, etc.
  catalog_classification?: ClassificationResult; // Résultat classification catalogue
  
  // === EVENT-DRIVEN: Person link through Event->History, not direct ===
  // assureId is DERIVED from event processing, not a direct link
  assureId?: string;                    // Person ID (derived from event->historique)
  assureLinkConfidence?: number;        // Confidence of person matching (0-1)
  cycleVieStage?: string;               // Lifecycle stage when alert created
  event_type?: string;                  // Type of event that triggered alert
}

export interface Alert {
  // Identification
  id: string;
  
  // EVENT-DRIVEN: Core relationships (Alert linked to Event, NOT directly to person)
  event_id: string;        // Source event that triggered this alert
  historique_id: string;   // History entry created from event processing
  
  // Source Information
  source: AlertSource;
  sourceModule: string; // e.g., 'fraud-detection-service', 'behavior-analysis'
  detection_module: string; // Module that detected the anomaly
  
  // Classification
  type: string; // e.g., 'document_suspect', 'unusual_pattern'
  severity: AlertSeverity;
  score: number; // 0-100 unified score
  confidence: number; // 0-1 confidence level
  
  // Business Context (derived from event, not direct link)
  metadata: AlertMetadata;
  
  // === ARCHITECTURE DÉCLOISONNÉE ===
  fraud_city_source: FraudCitySource;      // Source Ville obligatoire
  business_district: BusinessDistrict;      // Quartier métier obligatoire
  fraud_catalog_id?: string;                // ID du catalogue fraud utilisé
  playbook_assigned: boolean;               // Playbook automatiquement assigné
  
  // Gouvernance intégrée
  governance: {
    rule_triggered?: string;                // Règle qui a déclenché l'alerte
    sla_deadline: Date;                     // Deadline SLA calculée
    escalation_level: number;               // Niveau escalade (0-3)
    audit_requirements: string[];           // Exigences audit
    specialized_team_required?: SpecializedTeam; // Équipe spécialisée requise
  };
  
  // Workflow States
  status: AlertStatus;
  qualification?: AlertQualification;
  qualificationNotes?: string;
  
  // Risk Impact Tracking (conditional feedback loop)
  impacts_risk: boolean;         // true only if qualification = fraud_confirmed
  risk_impact_applied?: Date;    // When risk profile was updated
  impacted_assure_id?: string;   // Person whose risk was impacted (derived from event)
  
  // Assignment
  assignedTo?: string;
  assignedBy?: string;
  assignedAt?: Date;
  team?: string;
  
  // Detection Data
  detection_data: {
    patterns_matched?: string[];
    anomaly_scores?: Record<string, number>;
    correlation_ids?: string[];
    ml_predictions?: any;
  };
  
  // Technical Data
  rawData: any; // Original data from source module
  enrichedData?: any; // Additional enriched data
  
  // Audit Trail
  createdAt: Date;
  createdBy?: string;
  updatedAt: Date;
  qualifiedAt?: Date;
  qualifiedBy?: string;
  
  // Relations
  caseId?: string; // If a case was created
  relatedAlertIds?: string[]; // Correlated alerts
}

// Alert Statistics for Dashboard
export interface AlertStats {
  pending: number;
  assigned: number;
  inReview: number;
  qualified: number;
  rejected: number;
  
  bySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  
  avgProcessingTime: number; // in minutes
  todayCount: number;
  weekCount: number;
}

// Alert Filter Options
export interface AlertFilters {
  status?: AlertStatus[];
  severity?: AlertSeverity[];
  assignedTo?: string;
  team?: string;
  dateFrom?: Date;
  dateTo?: Date;
  source?: AlertSource[];
  searchTerm?: string;
}

// Alert Assignment Request
export interface AlertAssignment {
  alertIds: string[];
  assignTo: string;
  reason?: string;
}

// Alert Qualification Request
export interface AlertQualificationRequest {
  alertId: string;
  qualification: AlertQualification;
  notes?: string;
  createCase?: boolean;
  linkedAlerts?: string[]; // Other alerts to link to same case
}