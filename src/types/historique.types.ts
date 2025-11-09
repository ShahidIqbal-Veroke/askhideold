// Historique Management Types - Événements transversaux par assuré
// Timeline complète de toutes les interactions et événements

export type HistoriqueEventType = 
  | 'creation_assure' | 'modification_profil' | 'validation_kyc'
  | 'souscription_contrat' | 'modification_contrat' | 'renouvellement' | 'suspension' | 'resiliation'
  | 'declaration_sinistre' | 'expertise_sinistre' | 'paiement_indemnisation' | 'cloture_sinistre'
  | 'alerte_generee' | 'alerte_qualifiee' | 'escalade_equipe' | 'dossier_cree' | 'investigation_terminee'
  | 'contact_client' | 'document_recu' | 'validation_document' | 'demande_complement'
  | 'paiement_prime' | 'relance_impaye' | 'mise_en_demeure'
  | 'reclamation_client' | 'satisfaction_client'
  | 'action_commerciale' | 'upselling' | 'cross_selling'
  | 'controle_qualite' | 'audit_dossier' | 'compliance_check'
  | 'system_event' | 'data_enrichment' | 'risk_assessment';

export type HistoriqueCategory = 
  | 'commercial' | 'operationnel' | 'fraude' | 'sinistre' | 'compliance' | 'technique' | 'relation_client';

export type HistoriqueSource = 
  | 'user_action' | 'system_automatic' | 'external_api' | 'batch_process' | 'webhook' | 'manual_entry';

export type HistoriqueImpact = 'low' | 'medium' | 'high' | 'critical';

// Métadonnées spécifiques par type d'événement
export interface CommercialEventMetadata {
  opportunityValue?: number;
  productType?: string;
  campaignId?: string;
  conversionRate?: number;
  salesPerson?: string;
}

export interface OperationalEventMetadata {
  processId?: string;
  stepName?: string;
  duration?: number;        // en minutes
  automationLevel?: 'manual' | 'semi_auto' | 'full_auto';
  errorCode?: string;
}

export interface FraudeEventMetadata {
  riskScore?: number;
  fraudType?: string;
  detectionMethod?: string;
  investigatorId?: string;
  evidenceLevel?: 'low' | 'medium' | 'high';
  financialImpact?: number;
}

export interface SinistreEventMetadata {
  sinistreNumber?: string;
  sinistreType?: string;
  expertId?: string;
  estimatedAmount?: number;
  actualAmount?: number;
  complexity?: 'simple' | 'medium' | 'complex';
}

export interface ComplianceEventMetadata {
  regulationType?: string;
  complianceScore?: number;
  auditId?: string;
  controlType?: string;
  finding?: string;
  remediation?: string;
}

export interface RelationClientEventMetadata {
  contactMethod?: 'phone' | 'email' | 'letter' | 'sms' | 'chat' | 'in_person';
  satisfaction?: number;    // 1-5
  issueResolved?: boolean;
  escalationLevel?: number;
  responseTime?: number;    // en heures
}

// Entité principale Historique
export interface Historique {
  // Identification
  id: string;
  assureId: string;           // Référence vers l'assuré principal
  cycleVieId?: string;        // Référence vers le cycle de vie (si applicable)
  
  // === CORRECTION: Lien avec Demande ===
  demandeId?: string;         // Si cet événement vient d'une demande
  
  // Classification de l'événement
  eventType: HistoriqueEventType;
  category: HistoriqueCategory;
  source: HistoriqueSource;
  impact: HistoriqueImpact;
  
  // Description de l'événement
  title: string;
  description: string;
  shortSummary?: string;      // Version courte pour affichage liste
  
  // Contexte business
  businessContext?: {
    contractId?: string;
    policyNumber?: string;
    sinistreNumber?: string;
    amount?: number;
    currency?: string;
    lineOfBusiness?: string;
  };
  
  // Acteurs
  triggeredBy: string;        // ID utilisateur/système qui a déclenché
  triggeredByName: string;    // Nom pour affichage
  triggeredByRole?: string;   // Rôle au moment de l'action
  affectedUsers?: string[];   // Autres utilisateurs impactés
  
  // Relations avec autres entités
  relatedEntities: {
    alerteIds?: string[];
    dossierIds?: string[];
    risqueIds?: string[];
    demandeIds?: string[];
    documentIds?: string[];
    contractIds?: string[];
  };
  
  // Métadonnées spécifiques selon le type
  metadata: {
    commercial?: CommercialEventMetadata;
    operational?: OperationalEventMetadata;
    fraude?: FraudeEventMetadata;
    sinistre?: SinistreEventMetadata;
    compliance?: ComplianceEventMetadata;
    relationClient?: RelationClientEventMetadata;
    custom?: Record<string, any>;
  };
  
  // État et workflow
  status: 'active' | 'completed' | 'cancelled' | 'error';
  requiresAction: boolean;
  actionRequired?: string;
  dueDate?: Date;
  completedAt?: Date;
  
  // Données techniques
  rawData?: any;              // Données originales brutes
  enrichedData?: any;         // Données enrichies
  externalReferences?: Array<{
    system: string;
    id: string;
    url?: string;
  }>;
  
  // Géolocalisation et contexte
  location?: {
    ip?: string;
    country?: string;
    city?: string;
    coordinates?: [number, number];
  };
  deviceInfo?: {
    userAgent?: string;
    platform?: string;
    isMobile?: boolean;
  };
  
  // Audit et traçabilité
  createdAt: Date;
  updatedAt?: Date;
  version: number;            // Pour gestion des versions
  corrections?: Array<{
    correctedAt: Date;
    correctedBy: string;
    reason: string;
    oldValue: any;
    newValue: any;
  }>;
  
  // Analytics et insights
  insights?: {
    sentiment?: 'positive' | 'neutral' | 'negative';
    keywords?: string[];
    suggestedActions?: string[];
    relatedPatterns?: string[];
  };
}

// Agrégations et vues d'historique
export interface HistoriqueTimeline {
  assureId: string;
  events: Historique[];
  groupedByDate: Record<string, Historique[]>;
  groupedByCategory: Record<HistoriqueCategory, Historique[]>;
  groupedByCycle: Record<string, Historique[]>;
  
  // Métriques de la timeline
  totalEvents: number;
  dateRange: {
    start: Date;
    end: Date;
    durationDays: number;
  };
  activityLevel: 'low' | 'medium' | 'high' | 'very_high';
  
  // Patterns détectés
  patterns: {
    mostActiveCategory: HistoriqueCategory;
    averageEventsPerMonth: number;
    peakActivityPeriods: Array<{
      start: Date;
      end: Date;
      eventCount: number;
    }>;
    cyclicalPatterns?: string[];
  };
}

// Statistiques et KPIs historique
export interface HistoriqueStats {
  totalEvents: number;
  byType: Record<HistoriqueEventType, number>;
  byCategory: Record<HistoriqueCategory, number>;
  bySource: Record<HistoriqueSource, number>;
  byImpact: Record<HistoriqueImpact, number>;
  
  // Métriques temporelles
  eventsThisMonth: number;
  eventsThisWeek: number;
  eventsToday: number;
  averageEventsPerDay: number;
  
  // Métriques qualitatives
  actionRequiredCount: number;
  overdueTasks: number;
  completionRate: number;     // % d'événements complétés
  
  // Top insights
  topCategories: Array<{
    category: HistoriqueCategory;
    count: number;
    percentage: number;
  }>;
  topUsers: Array<{
    userId: string;
    userName: string;
    eventCount: number;
  }>;
  
  // Tendances
  trends: {
    weekOverWeek: number;      // % changement vs semaine précédente
    monthOverMonth: number;    // % changement vs mois précédent
    busyHours: number[];       // Heures les plus actives (0-23)
    busyDaysOfWeek: number[];  // Jours les plus actifs (0-6)
  };
}

// Filtres de recherche historique
export interface HistoriqueFilters {
  assureId?: string;
  cycleVieId?: string;
  eventTypes?: HistoriqueEventType[];
  categories?: HistoriqueCategory[];
  sources?: HistoriqueSource[];
  impacts?: HistoriqueImpact[];
  
  // Filtres temporels
  dateFrom?: Date;
  dateTo?: Date;
  createdFrom?: Date;
  createdTo?: Date;
  
  // Filtres business
  businessContext?: {
    contractIds?: string[];
    sinistreNumbers?: string[];
    minAmount?: number;
    maxAmount?: number;
    linesOfBusiness?: string[];
  };
  
  // Filtres utilisateur
  triggeredBy?: string[];
  triggeredByRoles?: string[];
  
  // Filtres état
  statuses?: ('active' | 'completed' | 'cancelled' | 'error')[];
  requiresAction?: boolean;
  overdue?: boolean;
  
  // Recherche textuelle
  searchTerm?: string;
  searchFields?: ('title' | 'description' | 'metadata')[];
  
  // Filtres techniques
  hasLocation?: boolean;
  hasDeviceInfo?: boolean;
  hasExternalReferences?: boolean;
}

// Requêtes de création/modification
export interface CreateHistoriqueRequest {
  assureId: string;
  cycleVieId?: string;
  eventType: HistoriqueEventType;
  category: HistoriqueCategory;
  source: HistoriqueSource;
  impact: HistoriqueImpact;
  title: string;
  description: string;
  businessContext?: any;
  relatedEntities?: any;
  metadata?: any;
  requiresAction?: boolean;
  actionRequired?: string;
  dueDate?: Date;
}

export interface UpdateHistoriqueRequest {
  historiqueId: string;
  status?: 'active' | 'completed' | 'cancelled' | 'error';
  completedAt?: Date;
  addCorrection?: {
    reason: string;
    oldValue: any;
    newValue: any;
  };
  updateMetadata?: Record<string, any>;
  addInsight?: {
    type: string;
    value: any;
  };
}

// Recherche et analytics avancés
export interface HistoriqueSearch {
  query: string;
  filters: HistoriqueFilters;
  sortBy?: 'createdAt' | 'impact' | 'relevance';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface HistoriqueSearchResult {
  events: Historique[];
  totalCount: number;
  facets: {
    categories: Record<HistoriqueCategory, number>;
    types: Record<HistoriqueEventType, number>;
    timeDistribution: Record<string, number>;
  };
  suggestions?: string[];
  relatedAssures?: string[];
}

// Pattern detection et anomalies
export interface HistoriquePattern {
  id: string;
  assureId: string;
  patternType: 'frequency' | 'sequence' | 'correlation' | 'anomaly';
  description: string;
  confidence: number;         // 0-1
  significance: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: Date;
  involvedEvents: string[];
  
  // Détails selon le type
  frequencyPattern?: {
    eventType: HistoriqueEventType;
    frequency: number;        // événements par période
    period: 'day' | 'week' | 'month';
    deviation: number;        // écart à la normale
  };
  
  sequencePattern?: {
    eventSequence: HistoriqueEventType[];
    probability: number;      // probabilité de la séquence
    averageInterval: number;  // intervalle moyen entre événements
  };
  
  anomalyPattern?: {
    expectedValue: any;
    actualValue: any;
    deviationMagnitude: number;
    context: string;
  };
}