// CycleVie Management Types - Gestion du cycle de vie assuré
// Les 4 étapes clés : Souscription → Vie du contrat → Sinistre et paiement → Résiliation

export type CycleVieStage = 'souscription' | 'vie_contrat' | 'sinistre_paiement' | 'resiliation';
export type CycleVieStatus = 'active' | 'completed' | 'suspended' | 'cancelled';

// Données spécifiques par étape
export interface SouscriptionData {
  dateDebut: Date;
  typeContrat: string;
  primeInitiale: number;
  documentsRequis: string[];
  validationKYC: boolean;
  bonusmalus?: number;
  antecedents: string[];
}

export interface VieContratData {
  modifications: Array<{
    date: Date;
    type: string;
    ancienneValeur: any;
    nouvelleValeur: any;
    motif: string;
  }>;
  renouvellements: Array<{
    date: Date;
    nouvellePrime: number;
    changements: string[];
  }>;
  suspensions?: Array<{
    dateDebut: Date;
    dateFin?: Date;
    motif: string;
  }>;
}

export interface SinistrePaiementData {
  sinistres: Array<{
    numeroSinistre: string;
    dateDeclaration: Date;
    typeSinistre: string;
    montantDeclare: number;
    montantIndemnise?: number;
    statut: string;
    expertiseRequise: boolean;
  }>;
  paiements: Array<{
    date: Date;
    montant: number;
    type: 'prime' | 'franchise' | 'indemnisation';
    statut: 'pending' | 'completed' | 'failed';
  }>;
}

export interface ResiliationData {
  dateResiliation?: Date;
  motifResiliation?: string;
  typeResiliation: 'client' | 'assureur' | 'mutual';
  penalites?: number;
  remboursements?: number;
  documentsFinalisation: string[];
}

// Entité principale CycleVie
export interface CycleVie {
  // Identification
  id: string;
  assureId: string;           // Référence vers l'assuré
  contractId: string;         // Référence vers le contrat spécifique
  
  // Étape actuelle
  currentStage: CycleVieStage;
  status: CycleVieStatus;
  progression: number;        // Pourcentage de complétion (0-100)
  
  // Données par étape
  souscription?: SouscriptionData;
  vieContrat?: VieContratData;
  sinistrePaiement?: SinistrePaiementData;
  resiliation?: ResiliationData;
  
  // Métriques et analytics
  metriques: {
    dureeEtapeActuelle: number;      // Jours dans l'étape actuelle
    dureeTotale: number;             // Jours depuis début cycle
    nombreModifications: number;      // Nombre de modifications
    nombreSinistres: number;         // Nombre de sinistres
    montantTotalPrimes: number;      // Cumul des primes
    montantTotalIndemnisations: number; // Cumul des indemnisations
    ratioSinistralite: number;       // Ratio sinistres/primes
  };
  
  // Relations
  historiqueIds: string[];     // IDs des événements historiques
  risqueIds: string[];         // IDs des risques détectés
  demandeIds: string[];        // IDs des demandes liées
  alerteIds: string[];         // IDs des alertes générées
  dossierIds: string[];        // IDs des dossiers d'investigation
  
  // Workflow et validation
  validationRequise: boolean;
  prochaineMileStone?: Date;
  actionsPendantes: string[];
  documentsManquants: string[];
  
  // Audit
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  lastActivityAt: Date;
  stageHistory: Array<{
    stage: CycleVieStage;
    enteredAt: Date;
    exitedAt?: Date;
    duration?: number;        // Durée en jours
    triggeredBy: string;      // Événement qui a déclenché le changement
  }>;
}

// Événements de transition entre étapes
export interface CycleVieTransition {
  id: string;
  cycleVieId: string;
  fromStage: CycleVieStage;
  toStage: CycleVieStage;
  triggeredBy: string;        // ID de l'événement déclencheur
  triggeredByType: 'demande' | 'sinistre' | 'modification' | 'system' | 'manual';
  validationRequired: boolean;
  validatedBy?: string;
  validatedAt?: Date;
  metadata?: Record<string, any>;
  timestamp: Date;
}

// Règles de transition par étape
export interface CycleVieRule {
  id: string;
  fromStage: CycleVieStage;
  toStage: CycleVieStage;
  conditions: Array<{
    field: string;
    operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
    value: any;
  }>;
  automaticTransition: boolean;
  requiredDocuments: string[];
  requiredValidations: string[];
  estimatedDuration: number;  // Jours estimés pour cette transition
}

// Statistiques et KPIs par cycle de vie
export interface CycleVieStats {
  total: number;
  byStage: {
    souscription: number;
    vie_contrat: number;
    sinistre_paiement: number;
    resiliation: number;
  };
  byStatus: {
    active: number;
    completed: number;
    suspended: number;
    cancelled: number;
  };
  
  // Métriques temporelles
  averageDurationByStage: {
    souscription: number;
    vie_contrat: number;
    sinistre_paiement: number;
    resiliation: number;
  };
  
  // Métriques business
  conversionRates: {
    souscription_to_active: number;    // % qui passent de souscription à actif
    active_to_renewal: number;         // % qui renouvellent
    sinistre_to_resolution: number;    // % de sinistres résolus
  };
  
  averageLifetimeValue: number;
  churnRate: number;                   // Taux de résiliation
  frequencySinistres: number;          // Fréquence moyenne des sinistres
  
  // Détection d'anomalies
  anomalies: {
    transitionsRapides: number;        // Cycles qui progressent trop vite
    stagnation: number;                // Cycles bloqués trop longtemps
    reversions: number;                // Retours en arrière inhabituels
  };
}

// Filtres de recherche CycleVie
export interface CycleVieFilters {
  stage?: CycleVieStage[];
  status?: CycleVieStatus[];
  assureId?: string;
  contractId?: string;
  
  // Filtres temporels
  createdFrom?: Date;
  createdTo?: Date;
  lastActivityFrom?: Date;
  lastActivityTo?: Date;
  stageEnteredFrom?: Date;
  stageEnteredTo?: Date;
  
  // Filtres métriques
  minDuration?: number;
  maxDuration?: number;
  minSinistres?: number;
  hasAnomalies?: boolean;
  validationRequired?: boolean;
  
  // Filtres business
  lineOfBusiness?: string[];
  minPremiumAmount?: number;
  hasActiveAlerts?: boolean;
}

// Requêtes de création/modification
export interface CreateCycleVieRequest {
  assureId: string;
  contractId: string;
  initialStage: CycleVieStage;
  souscriptionData?: Partial<SouscriptionData>;
  metadata?: Record<string, any>;
}

export interface UpdateCycleVieRequest {
  cycleVieId: string;
  newStage?: CycleVieStage;
  newStatus?: CycleVieStatus;
  souscriptionData?: Partial<SouscriptionData>;
  vieContratData?: Partial<VieContratData>;
  sinistrePaiementData?: Partial<SinistrePaiementData>;
  resiliationData?: Partial<ResiliationData>;
  addHistorique?: string;
  addRisque?: string;
  addDemande?: string;
  notes?: string;
}

// Prédictions et recommendations
export interface CycleViePrediction {
  cycleVieId: string;
  predictedNextStage: CycleVieStage;
  estimatedTransitionDate: Date;
  confidence: number;          // 0-1
  riskFactors: string[];
  recommendations: string[];
  businessImpact: {
    revenueImpact: number;
    riskScore: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
  };
}

// Alertes spécifiques au cycle de vie
export interface CycleVieAlert {
  id: string;
  cycleVieId: string;
  type: 'stagnation' | 'rapid_progression' | 'anomaly' | 'validation_required' | 'document_missing';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: Record<string, any>;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
  createdAt: Date;
}