// Demande Management Types - Origine des événements et interactions
// Point d'entrée de toutes les interactions client/système

export type DemandeType = 
  | 'souscription_contrat' | 'modification_contrat' | 'renouvellement' | 'resiliation'
  | 'declaration_sinistre' | 'complement_sinistre' | 'contestation_decision' | 'recours_expertise'
  | 'demande_info' | 'reclamation' | 'mise_en_demeure' | 'mediation'
  | 'changement_coordonnees' | 'ajout_conducteur' | 'changement_vehicule' | 'suspension_temporaire'
  | 'demande_ristourne' | 'attestation' | 'duplicata' | 'historique_sinistres'
  | 'consultation_dossier' | 'droit_rectification' | 'droit_oubli' | 'droit_portabilite'
  | 'signalement_fraude' | 'alerte_externe' | 'controle_qualite' | 'audit_compliance'
  | 'integration_api' | 'webhook_externe' | 'batch_import' | 'system_sync';

export type DemandeCategory = 
  | 'commercial' | 'operationnel' | 'sinistre' | 'service_client' | 'juridique' 
  | 'compliance' | 'technique' | 'externe' | 'automatique';

export type DemandeStatus = 
  | 'received' | 'in_progress' | 'pending_validation' | 'pending_documents' | 'pending_payment'
  | 'completed' | 'rejected' | 'cancelled' | 'escalated' | 'suspended';

export type DemandePriority = 'low' | 'medium' | 'high' | 'urgent' | 'critical';

export type DemandeChannel = 
  | 'web_portal' | 'mobile_app' | 'phone' | 'email' | 'chat' | 'postal_mail' 
  | 'in_person' | 'api' | 'webhook' | 'batch' | 'system_automatic';

export type DemandeOrigin = 'client' | 'prospect' | 'intermediaire' | 'expert' | 'partenaire' | 'system' | 'regulator';

// Données spécifiques par type de demande
export interface SouscriptionData {
  typeContrat: string;
  ligneAssurance: string;
  dateEffet: Date;
  primeProposee: number;
  franchiseChoisie: number;
  garantiesSelectionnees: string[];
  documentsRequis: string[];
  questionnaireSante?: any;
  declarationRisques?: any;
}

export interface SinistreData {
  typeSinistre: string;
  dateOccurrence: Date;
  lieuSinistre: string;
  circonstances: string;
  degatsEstimes: number;
  tiersImpliques?: Array<{
    nom: string;
    assureur?: string;
    responsabilite: number; // %
  }>;
  temoins?: Array<{
    nom: string;
    contact: string;
    declaration: string;
  }>;
  forcesOrdre: boolean;
  expertiseRequise: boolean;
  documentsJoints: string[];
}

export interface ModificationData {
  typeModification: string;
  anciennesValeurs: Record<string, any>;
  nouvellesValeurs: Record<string, any>;
  justification: string;
  dateEffet: Date;
  impactPrime?: number;
  validationRequise: boolean;
}

export interface ReclamationData {
  motifReclamation: string;
  categorieProbleme: string;
  descriptionDetaillee: string;
  prejudiceSubi?: number;
  solutionSouhaitee: string;
  precedentsContacts: Array<{
    date: Date;
    canal: string;
    interlocuteur: string;
    reponse: string;
  }>;
  urgence: DemandePriority;
}

export interface ComplianceData {
  typeControle: string;
  organisme: string;
  dateNotification: Date;
  echeanceReponse: Date;
  documentsRequis: string[];
  sanctionsPotentielles: string[];
  impactReglementaire: 'low' | 'medium' | 'high' | 'critical';
}

// Entité principale Demande
export interface Demande {
  // Identification unique
  id: string;
  referenceExterne?: string;        // Référence client/externe
  numeroSuivi: string;              // Numéro de suivi client
  
  // Classification
  type: DemandeType;
  category: DemandeCategory;
  status: DemandeStatus;
  priority: DemandePriority;
  
  // Origine et canal
  origin: DemandeOrigin;
  channel: DemandeChannel;
  source: {
    system?: string;                // Système source si automatique
    userId?: string;                // ID utilisateur si manuel
    ipAddress?: string;             // IP d'origine
    userAgent?: string;             // User agent
    referrer?: string;              // Page de référence
  };
  
  // Demandeur
  demandeur: {
    assureId?: string;              // Si demande d'un assuré existant
    identite: {
      nom: string;
      prenom?: string;
      email?: string;
      telephone?: string;
      adresse?: any;
    };
    qualite: 'assure' | 'souscripteur' | 'beneficiaire' | 'mandataire' | 'tiers' | 'systeme';
    authentifie: boolean;
    verificationKYC: boolean;
  };
  
  // Contenu de la demande
  objet: string;                    // Titre/objet de la demande
  description: string;              // Description détaillée
  motivation?: string;              // Motivation/justification
  
  // Données spécifiques par type
  donnees: {
    souscription?: SouscriptionData;
    sinistre?: SinistreData;
    modification?: ModificationData;
    reclamation?: ReclamationData;
    compliance?: ComplianceData;
    custom?: Record<string, any>;   // Données personnalisées
  };
  
  // Contexte business
  contexte: {
    contratIds: string[];           // Contrats concernés
    policyNumbers: string[];        // Numéros de police
    sinistreNumber?: string;        // Numéro de sinistre si applicable
    cycleVieIds: string[];          // Cycles de vie impactés
    montantConcerne?: number;       // Montant financier concerné
    urgenceMetier: boolean;         // Urgence métier
    impactClient: 'low' | 'medium' | 'high' | 'critical';
  };
  
  // Documents et pièces jointes
  documents: Array<{
    id: string;
    nom: string;
    type: string;
    taille: number;                 // Bytes
    statut: 'pending' | 'validated' | 'rejected' | 'missing';
    obligatoire: boolean;
    analysisResults?: any;          // Résultats analyse Hedi
    uploadedAt: Date;
    uploadedBy: string;
  }>;
  
  // Workflow et traitement
  workflow: {
    etapeActuelle: string;
    etapesSuivantes: string[];
    validationsRequises: Array<{
      type: string;
      valideur: string;             // Rôle/équipe valideur
      seuil?: number;               // Seuil si applicable
      obligatoire: boolean;
      deadline?: Date;
    }>;
    escalations: Array<{
      declencheur: string;          // Condition de déclenchement
      vers: string;                 // Équipe/personne destination
      delai: number;                // Délai en heures
      automatique: boolean;
    }>;
  };
  
  // SLA et délais
  sla: {
    dateReception: Date;
    delaiReglementaire?: number;    // Jours réglementaires
    delaiCommercial: number;        // Jours engagement commercial
    dateEcheance: Date;             // Date limite traitement
    dateTraitement?: Date;          // Date traitement effectif
    respectSLA: boolean;
    retardJustifie?: string;        // Justification si retard
  };
  
  // Communication et interactions
  communications: Array<{
    id: string;
    type: 'email' | 'sms' | 'courrier' | 'appel' | 'chat' | 'notification';
    direction: 'inbound' | 'outbound';
    contenu: string;
    pieceJointe?: string[];
    expediteur: string;
    destinataire: string;
    timestamp: Date;
    lue: boolean;
    reponseRequise: boolean;
  }>;
  
  // Relations avec autres entités
  relations: {
    assureId?: string;              // Assuré principal
    cycleVieIds: string[];          // Cycles de vie impactés
    demandesLiees: string[];        // Autres demandes liées
  };
  
  // === CORRECTION: Demande → Historique ===
  historiqueId?: string;            // L'historique créé par cette demande une fois traitée
  
  // Traitement et décision
  traitement: {
    assigneA?: string;              // Gestionnaire assigné
    equipeTraitante?: string;       // Équipe responsable
    dateAssignation?: Date;
    historiqueTRaitement: Array<{
      date: Date;
      action: string;
      auteur: string;
      commentaire?: string;
      documentsAjoutes?: string[];
    }>;
    
    // Décision finale
    decision?: {
      type: 'accepte' | 'refuse' | 'accepte_avec_reserves' | 'en_attente_complements';
      motif: string;
      conditions?: string[];
      montantAccorde?: number;
      dateDecision: Date;
      decideur: string;
      voieRecours?: string;
    };
  };
  
  // Qualité et satisfaction
  qualite: {
    noteComplexite: number;         // 1-5 (complexité du traitement)
    tempsTraitement: number;        // Minutes effectives de traitement
    nombreAllerRetours: number;     // Échanges avec le demandeur
    erreurs: Array<{
      type: string;
      description: string;
      corrigeeAt?: Date;
    }>;
    
    // Satisfaction client
    satisfaction?: {
      note: number;                 // 1-5
      commentaire?: string;
      dateEnquete: Date;
      recommanderait: boolean;
    };
  };
  
  // Analytics et metrics
  metrics: {
    scoreUrgence: number;           // Score calculé d'urgence (0-100)
    scoreComplexite: number;        // Score de complexité (0-100)
    impactBusiness: number;         // Impact business (0-100)
    coutTraitement: number;         // Coût de traitement (€)
    valeurClient: number;           // Valeur du client (€)
    rentabilite: number;            // Rentabilité de la demande (€)
  };
  
  // Conformité et audit
  conformite: {
    respectProcedure: boolean;
    controles: Array<{
      type: string;
      resultat: 'conforme' | 'non_conforme' | 'partiel';
      date: Date;
      controleur: string;
      observations?: string;
    }>;
    archivage: {
      dureeConservation: number;    // Années
      categorieArchive: string;
      dateArchivage?: Date;
      lieuArchivage?: string;
    };
  };
  
  // Métadonnées techniques
  metadata: {
    version: number;                // Version de la demande
    tags: string[];                 // Tags pour classification
    flags: string[];                // Flags spéciaux
    customFields: Record<string, any>; // Champs personnalisés
    integrationData?: {             // Données d'intégration
      systemeSource: string;
      correlationId?: string;
      batchId?: string;
      syncVersion?: number;
    };
  };
  
  // Audit trail
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  lastModifiedBy: string;
  archivedAt?: Date;
  
  // Historique des versions
  versionsHistory: Array<{
    version: number;
    modifiedAt: Date;
    modifiedBy: string;
    changesDescription: string;
    snapshot?: any;                 // Snapshot de la version
  }>;
}

// Statistiques et KPIs demandes
export interface DemandeStats {
  total: number;
  byType: Record<DemandeType, number>;
  byCategory: Record<DemandeCategory, number>;
  byStatus: Record<DemandeStatus, number>;
  byPriority: Record<DemandePriority, number>;
  byChannel: Record<DemandeChannel, number>;
  byOrigin: Record<DemandeOrigin, number>;
  
  // Métriques SLA
  slaMetrics: {
    totalRespectSLA: number;        // % SLA respectés
    delaiMoyenTraitement: number;   // Jours moyen
    enRetard: number;               // Nombre en retard
    aEcheance: number;              // Nombre à échéance < 24h
  };
  
  // Métriques qualité
  qualityMetrics: {
    satisfactionMoyenne: number;    // Note moyenne 1-5
    tauxPremierContact: number;     // % résolues au 1er contact
    tauxErreur: number;             // % avec erreurs
    complexiteMoyenne: number;      // Complexité moyenne 1-5
  };
  
  // Métriques business
  businessMetrics: {
    valeurTotale: number;           // Valeur totale des demandes (€)
    coutTotalTraitement: number;    // Coût total traitement (€)
    rentabiliteMoyenne: number;     // Rentabilité moyenne (€)
    impactChiffreAffaires: number;  // Impact CA (€)
  };
  
  // Tendances
  trends: {
    evolutionVolume: Array<{
      periode: string;
      nombre: number;
      evolution: number;            // % vs période précédente
    }>;
    tendancesEmergentes: string[];  // Nouveaux types/patterns
    cannauxEnCroissance: DemandeChannel[];
    typesEnDeclin: DemandeType[];
  };
  
  // Performance équipes
  performanceEquipes: Array<{
    equipe: string;
    nombreTraitees: number;
    delaiMoyen: number;
    tauxSLA: number;
    satisfactionMoyenne: number;
    productivite: number;           // Demandes/jour/personne
  }>;
}

// Filtres et recherche
export interface DemandeFilters {
  types?: DemandeType[];
  categories?: DemandeCategory[];
  statuses?: DemandeStatus[];
  priorities?: DemandePriority[];
  channels?: DemandeChannel[];
  origins?: DemandeOrigin[];
  
  // Filtres temporels
  dateReceptionFrom?: Date;
  dateReceptionTo?: Date;
  dateEcheanceFrom?: Date;
  dateEcheanceTo?: Date;
  
  // Filtres business
  assureId?: string;
  contratIds?: string[];
  assigneA?: string;
  equipeTraitante?: string;
  respectSLA?: boolean;
  enRetard?: boolean;
  
  // Filtres montants
  montantMin?: number;
  montantMax?: number;
  
  // Recherche textuelle
  searchTerm?: string;
  searchFields?: ('objet' | 'description' | 'numeroSuivi')[];
  
  // Filtres qualité
  avecErreurs?: boolean;
  satisfactionMin?: number;
  complexiteMin?: number;
  
  // Filtres métadonnées
  tags?: string[];
  flags?: string[];
  hasDocuments?: boolean;
  documentsMissingOnly?: boolean;
}

// Requêtes de création/modification
export interface CreateDemandeRequest {
  type: DemandeType;
  category: DemandeCategory;
  priority: DemandePriority;
  origin: DemandeOrigin;
  channel: DemandeChannel;
  demandeur: any;
  objet: string;
  description: string;
  contexte?: any;
  donnees?: any;
  documents?: any[];
  assigneA?: string;
  metadata?: any;
}

export interface UpdateDemandeRequest {
  demandeId: string;
  newStatus?: DemandeStatus;
  newPriority?: DemandePriority;
  assigneA?: string;
  addDocument?: any;
  addCommunication?: any;
  updateWorkflow?: any;
  addTraitement?: any;
  setDecision?: any;
  updateMetadata?: any;
  addNote?: string;
}

// Workflows et automatisation
export interface DemandeWorkflowRule {
  id: string;
  name: string;
  demandeTypes: DemandeType[];
  conditions: Array<{
    field: string;
    operator: string;
    value: any;
  }>;
  actions: Array<{
    type: 'assign' | 'escalate' | 'notify' | 'validate' | 'reject';
    target: string;
    parameters?: any;
    delay?: number;               // Minutes
  }>;
  active: boolean;
  priority: number;
}

// Prédictions et recommandations
export interface DemandePrediction {
  demandeId: string;
  predictionType: 'sla_risk' | 'complexity' | 'satisfaction' | 'cost';
  prediction: any;
  confidence: number;             // 0-1
  factors: string[];
  recommendations: string[];
  generatedAt: Date;
}