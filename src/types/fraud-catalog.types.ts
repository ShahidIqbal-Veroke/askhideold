/**
 * Types pour le Catalogue des Fraudes - Architecture Décloisonnée
 * Classification & Playbooks pour Ville/Quartiers
 */

// === ARCHITECTURE VILLE (Sources Décloisonnées) ===
export type FraudCitySource = 'cyber' | 'aml' | 'documentaire' | 'comportemental';

// === ARCHITECTURE QUARTIERS (Contexte Métier) ===
export type BusinessDistrict = 'auto' | 'sante' | 'habitation' | 'professionnelle' | 'voyage';

// === ÉQUIPES SPÉCIALISÉES ===
export type SpecializedTeam = 
  | 'gestionnaire' 
  | 'fraude' 
  | 'expert' 
  | 'compliance'
  | 'cyber_fraud_team'
  | 'behavior_analysis_team'
  | 'automotive_fraud_team'
  | 'health_fraud_team'
  | 'property_fraud_team'
  | 'commercial_fraud_team'
  | 'travel_fraud_team';

// === RÈGLES DE CLASSIFICATION (Événement → Alerte) ===
export interface FraudRule {
  id: string;
  name: string;
  condition: string;                    // Expression logique
  threshold: number;                    // Score minimum
  confidence_required: number;          // Confiance minimale (0-1)
  auto_assign_team: SpecializedTeam;    // Équipe auto-assignée
  escalation_score: number;             // Score pour escalade
  business_context: BusinessDistrict[]; // Quartiers applicables
  active: boolean;
}

// === ÉTAPES D'INVESTIGATION (Alerte → Dossier) ===
export interface InvestigationStep {
  step_order: number;
  action: string;
  description: string;
  required_role: SpecializedTeam;
  estimated_hours: number;
  dependencies: string[];               // IDs des étapes prérequises
  deliverables: string[];              // Livrables attendus
  is_mandatory: boolean;
  can_be_automated: boolean;
}

// === EXIGENCES DE PREUVES ===
export interface EvidenceRequirement {
  id: string;
  type: string;                        // Type de preuve
  description: string;
  is_mandatory: boolean;
  collection_method: string;           // Comment collecter
  validation_criteria: string[];       // Critères de validation
  legal_weight: 'low' | 'medium' | 'high' | 'critical';
}

// === RÈGLES D'ESCALADE ===
export interface EscalationRule {
  trigger_condition: string;           // Condition de déclenchement
  escalate_to_team: SpecializedTeam;   // Équipe destination
  escalate_to_role: string;            // Rôle spécifique
  notification_required: boolean;
  sla_adjustment_hours: number;        // Ajustement SLA
  reason_template: string;             // Template justification
}

// === TEMPLATES DE PREUVES ===
export interface ProofTemplate {
  id: string;
  name: string;
  category: string;
  template_content: string;            // Template de rapport
  required_fields: Array<{
    field_name: string;
    field_type: 'text' | 'number' | 'date' | 'file' | 'signature';
    is_required: boolean;
    validation_rules: string[];
  }>;
  legal_references: string[];
  regulatory_compliance: string[];
}

// === CATALOGUE PRINCIPAL ===
export interface FraudCatalog {
  // Identification
  id: string;
  name: string;
  description: string;
  version: string;
  
  // Architecture Ville/Quartier
  city_source: FraudCitySource;        // Source de détection
  applicable_districts: BusinessDistrict[]; // Quartiers métier
  
  // Classification (Événement → Alerte)
  classification: {
    fraud_type: string;                // Type de fraude spécifique
    severity_range: [number, number];  // Score min/max
    auto_detection_rules: FraudRule[]; // Règles automatiques
    manual_triggers: string[];         // Triggers manuels
    correlation_patterns: string[];    // Patterns de corrélation
  };
  
  // Playbook (Alerte → Dossier)
  playbook: {
    investigation_steps: InvestigationStep[];
    evidence_requirements: EvidenceRequirement[];
    specialized_team: SpecializedTeam;
    default_sla_hours: number;
    escalation_triggers: EscalationRule[];
    risk_assessment_method: string;
  };
  
  // Gouvernance
  governance: {
    approval_required: boolean;
    audit_level: 'standard' | 'enhanced' | 'forensic';
    regulatory_framework: string[];
    legal_implications: string[];
    data_retention_days: number;
  };
  
  // Preuves et Documentation
  proof_templates: ProofTemplate[];
  documentation: {
    procedure_url?: string;
    training_materials: string[];
    best_practices: string[];
    common_pitfalls: string[];
  };
  
  // Métriques et Performance
  performance_metrics: {
    average_investigation_time: number; // Heures
    success_rate: number;               // % de fraudes confirmées
    false_positive_rate: number;        // % de faux positifs
    cost_per_investigation: number;     // Coût moyen €
    roi_factor: number;                 // Multiplicateur ROI
  };
  
  // Metadata
  created_at: Date;
  created_by: string;
  updated_at: Date;
  last_review_date: Date;
  next_review_date: Date;
  is_active: boolean;
  tags: string[];
}

// === RÉSULTAT DE CLASSIFICATION ===
export interface ClassificationResult {
  catalog_id: string;
  confidence: number;                  // 0-1
  score: number;                       // 0-100
  triggered_rules: FraudRule[];
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  recommended_team: SpecializedTeam;
  estimated_investigation_time: number;
  business_impact: 'low' | 'medium' | 'high' | 'critical';
  auto_escalation_required: boolean;
}

// === PLAN D'INVESTIGATION GÉNÉRÉ ===
export interface GeneratedInvestigationPlan {
  catalog_id: string;
  plan_id: string;
  steps: InvestigationStep[];
  estimated_total_hours: number;
  required_evidence: EvidenceRequirement[];
  assigned_teams: SpecializedTeam[];
  critical_path: string[];            // IDs des étapes critiques
  parallel_tracks: string[][];        // Étapes pouvant être parallélisées
  checkpoints: Array<{
    step_id: string;
    review_required: boolean;
    decision_point: boolean;
  }>;
}

// === GOUVERNANCE DASHBOARD ===
export interface GovernanceMetrics {
  rules_active: number;
  sla_compliance_rate: number;         // % SLA respectés
  escalation_rate: number;             // % alertes escaladées
  audit_trails_complete: number;       // Nombre de trails complets
  
  // Métriques par Ville
  city_metrics: Record<FraudCitySource, {
    alerts_generated: number;
    avg_processing_time: number;
    success_rate: number;
    resource_utilization: number;
  }>;
  
  // Métriques par Quartier
  district_metrics: Record<BusinessDistrict, {
    active_cases: number;
    avg_resolution_time: number;
    customer_impact: number;
    financial_recovery: number;
  }>;
  
  // ROI Global
  total_roi: number;
  prevention_value: number;
  operational_cost: number;
  efficiency_gain: number;
}

// === FILTRES ET RECHERCHE ===
export interface FraudCatalogFilters {
  city_sources?: FraudCitySource[];
  business_districts?: BusinessDistrict[];
  specialized_teams?: SpecializedTeam[];
  min_success_rate?: number;
  max_investigation_time?: number;
  active_only?: boolean;
  has_automation?: boolean;
  requires_approval?: boolean;
  tags?: string[];
}

// === REQUÊTES DE GESTION ===
export interface CreateCatalogRequest {
  name: string;
  description: string;
  city_source: FraudCitySource;
  applicable_districts: BusinessDistrict[];
  classification: any;
  playbook: any;
  governance: any;
  created_by: string;
}

export interface UpdateCatalogRequest {
  catalog_id: string;
  updates: Partial<FraudCatalog>;
  reason: string;
  updated_by: string;
}

// === AUDIT ET TRAÇABILITÉ ===
export interface CatalogAuditEvent {
  id: string;
  catalog_id: string;
  event_type: 'created' | 'updated' | 'activated' | 'deactivated' | 'rule_triggered' | 'escalated';
  description: string;
  actor: string;
  impact_level: 'low' | 'medium' | 'high';
  metadata: Record<string, any>;
  timestamp: Date;
}