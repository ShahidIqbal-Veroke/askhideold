// Risque Management Types - Gestion évolutive des risques par assuré
// Scoring dynamique et détection proactive des patterns de fraude

export type RisqueType = 
  | 'fraude_documentaire' | 'fraude_identite' | 'fraude_sinistre' | 'fraude_souscription'
  | 'fraude_reseau' | 'blanchiment' | 'cyber_fraude' | 'compliance'
  | 'operationnel' | 'reputationnel' | 'financier' | 'legal';

export type RisqueCategory = 
  | 'fraud' | 'aml' | 'kyc' | 'operational' | 'financial' | 'regulatory' | 'reputational' | 'technical';

export type RisqueLevel = 'very_low' | 'low' | 'medium' | 'high' | 'very_high' | 'critical';

export type RisqueStatus = 'detected' | 'investigating' | 'mitigated' | 'accepted' | 'transferred' | 'closed';

export type RisqueSource = 
  | 'document_analysis' | 'behavioral_analysis' | 'pattern_detection' | 'external_source'
  | 'manual_review' | 'system_rule' | 'ai_prediction' | 'third_party_alert';

// Facteurs de risque spécifiques
export interface FraudRiskFactors {
  documentInconsistencies: number;     // Score incohérences documentaires (0-100)
  identityVerificationIssues: number; // Problèmes vérification identité (0-100)
  behavioralAnomalies: number;         // Anomalies comportementales (0-100)
  networkConnections: number;          // Connexions avec réseaux suspects (0-100)
  frequencyPatterns: number;           // Patterns de fréquence suspects (0-100)
  amountAnomalies: number;            // Anomalies de montants (0-100)
  geographicAnomalies: number;        // Anomalies géographiques (0-100)
  temporalAnomalies: number;          // Anomalies temporelles (0-100)
}

export interface ComplianceRiskFactors {
  kycCompleteness: number;            // Complétude KYC (0-100)
  amlScreening: number;               // Résultat screening AML (0-100)
  sanctionsCheck: number;             // Vérification listes sanctions (0-100)
  pepExposure: number;                // Exposition PEP (0-100)
  regulatoryCompliance: number;       // Conformité réglementaire (0-100)
  dataQuality: number;                // Qualité des données (0-100)
}

export interface OperationalRiskFactors {
  processDeviation: number;           // Écart aux processus (0-100)
  systemReliability: number;          // Fiabilité système (0-100)
  humanError: number;                 // Risque erreur humaine (0-100)
  dataIntegrity: number;              // Intégrité des données (0-100)
  controlEffectiveness: number;       // Efficacité des contrôles (0-100)
}

export interface FinancialRiskFactors {
  creditRisk: number;                 // Risque de crédit (0-100)
  liquidityRisk: number;              // Risque de liquidité (0-100)
  concentrationRisk: number;          // Risque de concentration (0-100)
  marketRisk: number;                 // Risque de marché (0-100)
  counterpartyRisk: number;           // Risque de contrepartie (0-100)
}

// Calcul de score dynamique
export interface RisqueScoring {
  baseScore: number;                  // Score de base (0-100)
  adjustedScore: number;              // Score ajusté après facteurs (0-100)
  finalScore: number;                 // Score final après pondération (0-100)
  confidence: number;                 // Confiance dans le scoring (0-1)
  
  // Détail des composants
  componentScores: {
    historical: number;               // Basé sur l'historique
    behavioral: number;               // Basé sur le comportement
    contextual: number;               // Basé sur le contexte
    predictive: number;               // Basé sur la prédiction
  };
  
  // Facteurs d'ajustement
  adjustmentFactors: {
    timeDecay: number;                // Décroissance temporelle (-1 à 1)
    volumeWeight: number;             // Pondération volume (-1 à 1)
    complexityBonus: number;          // Bonus complexité (-1 à 1)
    industryContext: number;          // Contexte sectoriel (-1 à 1)
    seasonality: number;              // Facteur saisonnalité (-1 à 1)
  };
  
  // Métriques de qualité
  qualityMetrics: {
    dataCompleteness: number;         // Complétude des données (0-1)
    dataFreshness: number;            // Fraîcheur des données (0-1)
    algorithmicCertainty: number;     // Certitude algorithmique (0-1)
    crossValidation: number;          // Validation croisée (0-1)
  };
}

// Entité principale Risque
export interface Risque {
  // Identification
  id: string;
  assureId: string;                   // Référence vers l'assuré
  cycleVieId?: string;                // Référence vers le cycle de vie
  historiqueId?: string;              // Événement historique déclencheur
  
  // Classification du risque
  type: RisqueType;
  category: RisqueCategory;
  level: RisqueLevel;
  status: RisqueStatus;
  source: RisqueSource;
  
  // Description
  title: string;
  description: string;
  shortDescription?: string;
  
  // Scoring et évaluation
  scoring: RisqueScoring;
  
  // Facteurs de risque spécifiques
  riskFactors: {
    fraud?: FraudRiskFactors;
    compliance?: ComplianceRiskFactors;
    operational?: OperationalRiskFactors;
    financial?: FinancialRiskFactors;
  };
  
  // Impact potentiel
  potentialImpact: {
    financial: {
      estimatedLoss: number;          // Perte estimée (€)
      maxLoss: number;                // Perte maximale (€)
      confidence: number;             // Confiance estimation (0-1)
    };
    operational: {
      processDisruption: RisqueLevel;
      resourceImpact: RisqueLevel;
      timeToResolve: number;          // Jours estimés
    };
    reputational: {
      brandImpact: RisqueLevel;
      customerImpact: RisqueLevel;
      regulatoryImpact: RisqueLevel;
    };
    regulatory: {
      complianceViolation: boolean;
      penaltyRisk: number;            // Amende potentielle (€)
      reportingRequired: boolean;
    };
  };
  
  // Contexte business
  businessContext: {
    contractIds: string[];
    policyNumbers: string[];
    sinistreNumbers?: string[];
    lineOfBusiness: string[];
    geography: string[];
    timeframe: {
      detectedAt: Date;
      firstOccurrence?: Date;
      lastOccurrence?: Date;
      frequency: number;              // Occurrences par période
    };
  };
  
  // Relations avec autres entités
  relatedEntities: {
    alerteIds: string[];              // Alertes générées par ce risque
    dossierIds: string[];             // Dossiers d'investigation
    demandeIds: string[];             // Demandes liées
    parentRisqueId?: string;          // Risque parent (si décomposition)
    childRisqueIds: string[];         // Risques enfants
    correlatedRisqueIds: string[];    // Risques corrélés
  };
  
  // Evidence et preuves
  evidence: {
    documents: Array<{
      id: string;
      type: string;
      name: string;
      confidenceScore: number;
      analysisResults?: any;
    }>;
    dataPoints: Array<{
      source: string;
      type: string;
      value: any;
      reliability: number;            // Fiabilité (0-1)
      timestamp: Date;
    }>;
    patterns: Array<{
      type: string;
      description: string;
      strength: number;               // Force du pattern (0-1)
      supportingEvents: string[];
    }>;
  };
  
  // Mitigation et actions
  mitigation: {
    recommendedActions: Array<{
      action: string;
      priority: 'low' | 'medium' | 'high' | 'urgent';
      estimatedEffort: number;        // Heures estimées
      estimatedCost: number;          // Coût estimé (€)
      expectedReduction: number;      // Réduction risque attendue (%)
      responsible?: string;
      dueDate?: Date;
    }>;
    implementedActions: Array<{
      action: string;
      implementedBy: string;
      implementedAt: Date;
      actualEffort: number;
      actualCost: number;
      effectiveness: number;          // Efficacité réelle (0-1)
      notes?: string;
    }>;
    residualRisk: {
      level: RisqueLevel;
      score: number;
      acceptanceRequired: boolean;
      acceptedBy?: string;
      acceptedAt?: Date;
      reviewDate?: Date;
    };
  };
  
  // Monitoring et alerting
  monitoring: {
    isActive: boolean;
    thresholds: {
      scoreIncrease: number;          // Seuil augmentation score
      frequencyIncrease: number;      // Seuil augmentation fréquence
      newEvidenceWeight: number;      // Poids nouvelles preuves
    };
    alerts: Array<{
      type: string;
      triggeredAt: Date;
      message: string;
      acknowledged: boolean;
    }>;
    nextReview: Date;
    reviewFrequency: number;          // Jours entre reviews
  };
  
  // ML et prédictions
  predictions: {
    evolutionTrend: 'increasing' | 'stable' | 'decreasing';
    escalationProbability: number;    // Probabilité escalade (0-1)
    timeToEscalation?: number;        // Jours avant escalade probable
    similarCases: Array<{
      assureId: string;
      similarity: number;             // Similarité (0-1)
      outcome: string;
      lessons: string[];
    }>;
    recommendedModels: string[];      // Modèles ML recommandés
  };
  
  // Audit et traçabilité
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  lastReviewAt?: Date;
  lastReviewBy?: string;
  
  // Versions et historique
  version: number;
  scoreHistory: Array<{
    timestamp: Date;
    score: number;
    level: RisqueLevel;
    reason: string;
    triggeredBy: string;
  }>;
  
  // Métadonnées et configuration
  metadata: {
    industry?: string;
    segment?: string;
    tags: string[];
    customFields: Record<string, any>;
  };
  
  // Workflow et approbations
  workflow: {
    requiresApproval: boolean;
    approvedBy?: string;
    approvedAt?: Date;
    escalatedTo?: string;
    escalatedAt?: Date;
    closedBy?: string;
    closedAt?: Date;
    closureReason?: string;
  };
}

// Corrélation et analyse de risques
export interface RisqueCorrelation {
  id: string;
  primaryRisqueId: string;
  correlatedRisqueIds: string[];
  correlationType: 'causal' | 'temporal' | 'behavioral' | 'contextual';
  strength: number;                   // Force corrélation (0-1)
  confidence: number;                 // Confiance (0-1)
  
  // Analyse de la corrélation
  analysis: {
    pattern: string;
    timelag?: number;                 // Décalage temporel (jours)
    conditions: string[];             // Conditions pour corrélation
    exceptions: string[];             // Exceptions observées
  };
  
  // Impact de la corrélation
  impact: {
    amplificationFactor: number;      // Facteur amplification
    cascadeRisk: boolean;             // Risque en cascade
    systemicRisk: boolean;            // Risque systémique
  };
  
  detectedAt: Date;
  validatedBy?: string;
  validatedAt?: Date;
}

// Statistiques et KPIs risques
export interface RisqueStats {
  total: number;
  byType: Record<RisqueType, number>;
  byCategory: Record<RisqueCategory, number>;
  byLevel: Record<RisqueLevel, number>;
  byStatus: Record<RisqueStatus, number>;
  
  // Distribution des scores
  scoreDistribution: {
    ranges: Array<{
      min: number;
      max: number;
      count: number;
    }>;
    average: number;
    median: number;
    percentile95: number;
  };
  
  // Métriques temporelles
  newRisksThisMonth: number;
  escalatedRisks: number;
  mitigatedRisks: number;
  overdueReviews: number;
  
  // Efficacité mitigation
  mitigationEffectiveness: {
    averageReduction: number;         // % réduction moyenne
    timeToMitigation: number;         // Jours moyen mitigation
    costBenefit: number;              // Ratio coût/bénéfice
  };
  
  // Tendances
  trends: {
    scoreEvolution: Array<{
      date: Date;
      averageScore: number;
      riskCount: number;
    }>;
    emergingPatterns: string[];
    topRiskFactors: Array<{
      factor: string;
      impact: number;
      frequency: number;
    }>;
  };
}

// Filtres et recherche
export interface RisqueFilters {
  assureId?: string;
  cycleVieId?: string;
  types?: RisqueType[];
  categories?: RisqueCategory[];
  levels?: RisqueLevel[];
  statuses?: RisqueStatus[];
  sources?: RisqueSource[];
  
  // Filtres scoring
  minScore?: number;
  maxScore?: number;
  minConfidence?: number;
  
  // Filtres temporels
  detectedFrom?: Date;
  detectedTo?: Date;
  lastReviewFrom?: Date;
  lastReviewTo?: Date;
  
  // Filtres business
  contractIds?: string[];
  linesOfBusiness?: string[];
  minPotentialLoss?: number;
  hasCorrelations?: boolean;
  requiresApproval?: boolean;
  overdueReview?: boolean;
  
  // Recherche textuelle
  searchTerm?: string;
  tags?: string[];
}

// Requêtes de création/modification
export interface CreateRisqueRequest {
  assureId: string;
  cycleVieId?: string;
  historiqueId?: string;
  type: RisqueType;
  category: RisqueCategory;
  source: RisqueSource;
  title: string;
  description: string;
  initialScore?: number;
  riskFactors?: any;
  businessContext?: any;
  evidence?: any;
  metadata?: any;
}

export interface UpdateRisqueRequest {
  risqueId: string;
  newLevel?: RisqueLevel;
  newStatus?: RisqueStatus;
  updateScoring?: Partial<RisqueScoring>;
  addEvidence?: any;
  addMitigationAction?: any;
  implementAction?: {
    actionId: string;
    implementedBy: string;
    actualEffort: number;
    actualCost: number;
    effectiveness: number;
    notes?: string;
  };
  updateMonitoring?: any;
  addNote?: string;
}

// Analyse prédictive et recommandations
export interface RisquePrediction {
  risqueId: string;
  predictionType: 'escalation' | 'mitigation_success' | 'evolution' | 'correlation';
  timeHorizon: number;                // Jours
  prediction: any;
  confidence: number;                 // 0-1
  factors: Array<{
    factor: string;
    weight: number;
    trend: 'positive' | 'negative' | 'stable';
  }>;
  recommendations: string[];
  generatedAt: Date;
  validUntil: Date;
}