// Assuré Management Types for Salesforce Anti-Fraud Platform
// Entité centrale pour modélisation cycle de vie assuré

export type AssureStatus = 'prospect' | 'active' | 'suspended' | 'terminated';
export type AssureType = 'particulier' | 'professionnel' | 'entreprise';
export type AssureRiskLevel = 'low' | 'medium' | 'high' | 'critical';

// Informations d'identification assuré
export interface AssureIdentity {
  // Identification principale
  nom: string;
  prenom?: string;
  raisonSociale?: string; // Pour professionnels/entreprises
  
  // Documents d'identité
  numeroIdentite?: string; // CNI, passeport
  numeroSiren?: string;    // Pour entreprises
  numeroSiret?: string;    // Pour établissements
  
  // Contact
  email?: string;
  telephone?: string;
  adresse?: AssureAddress;
  
  // Dates importantes
  dateNaissance?: Date;
  dateCreationEntreprise?: Date;
}

export interface AssureAddress {
  ligne1: string;
  ligne2?: string;
  codePostal: string;
  ville: string;
  pays: string;
  coordonnees?: {
    latitude: number;
    longitude: number;
  };
}

// Profil de risque assuré
export interface AssureRiskProfile {
  // Scoring global
  riskScore: number;        // 0-100
  riskLevel: AssureRiskLevel;
  confidenceLevel: number;  // 0-1
  
  // Historique
  nombreSinistres: number;
  montantTotalSinistres: number;
  nombreAlertes: number;
  nombreDossiersFraude: number;
  
  // Indicateurs comportementaux
  frequenceModifications: number;    // Modifications contrat/profil
  delaiDeclarationMoyen: number;     // Délai moyen déclaration sinistres (jours)
  coherenceDocuments: number;        // Score cohérence documents (0-100)
  
  // Facteurs de risque
  facteursDurcissement: string[];    // Raisons augmentation risque
  facteursMitigation: string[];      // Raisons réduction risque
  
  // Métadonnées
  derniereMiseAJour: Date;
  prochainReview: Date;
}

// Portefeuille contrats assuré
export interface AssurePortfolio {
  contracts: AssureContract[];
  totalPremiums: number;          // Total primes annuelles
  customerLifetimeValue: number;  // Valeur client calculée
  lineOfBusiness: string[];       // Lignes d'assurance souscrites
  ancienneteclient: number;       // Ancienneté en mois
}

export interface AssureContract {
  id: string;
  policyNumber: string;
  lineOfBusiness: string;         // auto, habitation, santé, etc.
  dateDebut: Date;
  dateFin?: Date;
  primeAnnuelle: number;
  status: 'active' | 'suspended' | 'terminated' | 'pending';
  vehicule?: VehicleInfo;
  habitation?: PropertyInfo;
}

export interface VehicleInfo {
  vin?: string;
  immatriculation?: string;
  marque?: string;
  modele?: string;
  annee?: number;
  valeurVenal?: number;
}

export interface PropertyInfo {
  typeLogement: string;           // maison, appartement, etc.
  superficie?: number;
  valeurAssurée?: number;
  adresse: AssureAddress;
}

// Entité principale Assuré
export interface Assure {
  // Identification
  id: string;
  numeroClient: string;          // Identifiant métier unique
  type: AssureType;
  status: AssureStatus;
  
  // Profil
  identity: AssureIdentity;
  riskProfile: AssureRiskProfile;
  portfolio: AssurePortfolio;
  
  // Relations
  cyclesVie: string[];           // IDs des cycles de vie
  historiqueIds: string[];       // IDs historique global
  alerteIds: string[];           // IDs alertes liées
  dossierIds: string[];          // IDs dossiers/cases liés
  
  // Gestion commerciale
  gestionnaire?: string;         // Gestionnaire client attitré
  agence?: string;               // Agence de rattachement
  segment?: string;              // Segmentation client
  
  // Audit
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  lastLoginAt?: Date;
  dataValidatedAt?: Date;        // Dernière validation des données
}

// Statistiques globales assurés
export interface AssureStats {
  total: number;
  byStatus: {
    prospect: number;
    active: number;
    suspended: number;
    terminated: number;
  };
  byType: {
    particulier: number;
    professionnel: number;
    entreprise: number;
  };
  byRiskLevel: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  
  // Métriques business
  averageLifetimeValue: number;
  totalPremiums: number;
  alertRate: number;             // % assurés avec alertes
  fraudRate: number;             // % assurés avec fraude confirmée
  
  // Activité récente
  newThisMonth: number;
  newThisWeek: number;
  reviewDueCount: number;        // Profils à revoir
}

// Filtres de recherche assurés
export interface AssureFilters {
  status?: AssureStatus[];
  type?: AssureType[];
  riskLevel?: AssureRiskLevel[];
  gestionnaire?: string;
  agence?: string;
  segment?: string;
  lineOfBusiness?: string[];
  
  // Recherche textuelle
  searchTerm?: string;           // Nom, email, numero client
  
  // Filtres temporels
  createdFrom?: Date;
  createdTo?: Date;
  lastActivityFrom?: Date;
  lastActivityTo?: Date;
  
  // Filtres métier
  hasActiveAlerts?: boolean;
  hasFraudHistory?: boolean;
  reviewDue?: boolean;
  minLifetimeValue?: number;
  maxRiskScore?: number;
}

// Requêtes de création/modification
export interface CreateAssureRequest {
  identity: AssureIdentity;
  type: AssureType;
  initialContract?: Partial<AssureContract>;
  gestionnaire?: string;
  agence?: string;
  segment?: string;
}

export interface UpdateAssureRequest {
  assureId: string;
  identity?: Partial<AssureIdentity>;
  riskProfile?: Partial<AssureRiskProfile>;
  portfolio?: Partial<AssurePortfolio>;
  gestionnaire?: string;
  status?: AssureStatus;
  notes?: string;
}

// Recherche et enrichissement
export interface AssureSearchResult {
  assure: Assure;
  matchScore: number;            // Score de pertinence recherche
  matchFields: string[];         // Champs qui matchent
  alertCount: number;
  recentActivity: boolean;
}

export interface AssureEnrichmentRequest {
  assureId: string;
  source: 'manual' | 'document_analysis' | 'external_api';
  data: Record<string, any>;
  confidence: number;
}

// Types pour liaison avec système existant
export interface AssureAlertLink {
  assureId: string;
  alertId: string;
  cycleVieStage: string;        // souscription, sinistre, gestion, résiliation
  confidence: number;           // Confiance du matching
  extractedData?: Record<string, any>;
  createdAt: Date;
  validatedAt?: Date;
  validatedBy?: string;
}