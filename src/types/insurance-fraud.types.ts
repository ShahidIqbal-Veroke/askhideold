/**
 * Types spécifiques à la fraude en assurance
 * Mapping des détections techniques vers les typologies métier
 */

export enum InsuranceFraudType {
  // === FRAUDE SOUSCRIPTION ===
  MODIFICATION_ADRESSE = 'modification_adresse',           // Impact zonage tarifaire
  FAUX_BONUS_MALUS = 'faux_bonus_malus',                  // Historique falsifié  
  USURPATION_IDENTITE = 'usurpation_identite',           // Documents volés/falsifiés
  DATE_PERMIS_INVALIDE = 'date_permis_invalide',         // Tarification erronée
  FAUX_JUSTIFICATIFS = 'faux_justificatifs',             // Documents support falsifiés
  ANTECEDENTS_CACHES = 'antecedents_caches',             // Sinistres/résiliations cachés
  VEHICULE_MISREPRESENTE = 'vehicule_misrepresente',     // Caractéristiques falsifiées
  
  // === FRAUDE SINISTRE ===
  DOCUMENT_FALSIFIE = 'document_falsifie',               // Factures/constats modifiés
  MONTANT_GONFLE = 'montant_gonfle',                     // Surfacturation
  SINISTRE_FICTIF = 'sinistre_fictif',                  // Événement inventé
  MISE_EN_SCENE = 'mise_en_scene',                      // Accident organisé
  EXPERT_COMPLICE = 'expert_complice',                  // Connivence professionnelle
  REPARATEUR_COMPLICE = 'reparateur_complice',          // Surfacturation organisée
  PIECES_DETOURNEES = 'pieces_detournees',              // Vol de pièces organisé
  
  // === FRAUDE ORGANISÉE ===
  RESEAU_ORGANISE = 'reseau_organise',                  // Fraude à grande échelle
  BLANCHIMENT = 'blanchiment',                          // Recyclage argent sale
  CYBER_FRAUDE = 'cyber_fraude',                        // Attaques informatiques
}

export enum FraudContext {
  SOUSCRIPTION = 'souscription',    // Fraude à l'entrée (tarification)
  SINISTRE = 'sinistre',            // Fraude à la sortie (indemnisation)
  GESTION = 'gestion',              // Fraude en cours de contrat
  RESILIATION = 'resiliation',      // Fraude à la sortie
}

export enum InsuranceLineOfBusiness {
  AUTO = 'auto',
  HABITATION = 'habitation', 
  SANTE = 'sante',
  PROFESSIONNELLE = 'professionnelle',
  VOYAGE = 'voyage',
  JURIDIQUE = 'juridique',
}

export enum DocumentBusinessContext {
  DEVIS = 'devis',                  // Phase avant souscription
  SOUSCRIPTION = 'souscription',   // Signature contrat
  DECLARATION_SINISTRE = 'declaration_sinistre',
  EXPERTISE = 'expertise',         // Évaluation sinistre
  INDEMNISATION = 'indemnisation', // Paiement
  MODIFICATION = 'modification',   // Avenant contrat
  RESILIATION = 'resiliation',
}

export interface FraudTypologyMapping {
  insuranceFraudType: InsuranceFraudType;
  context: FraudContext;
  lineOfBusiness: InsuranceLineOfBusiness[];
  severity: 'critical' | 'high' | 'medium' | 'low';
  
  // Impact business
  riskLevel: number;                // 0-100
  averageAmount: number;            // Montant moyen de la fraude
  detectionDifficulty: number;      // 0-100 (difficulté détection)
  investigationComplexity: 'simple' | 'medium' | 'complex';
  
  // Métadonnées métier
  regulatoryImplications: string[]; // Obligations réglementaires
  businessImpact: string[];         // Impact sur l'activité
  preventionMeasures: string[];     // Mesures de prévention
}

export interface InsuranceAlert {
  // Données métier enrichies
  fraudTypology: FraudTypologyMapping[];
  businessContext: DocumentBusinessContext;
  lineOfBusiness: InsuranceLineOfBusiness;
  
  // Évaluation business
  estimatedLoss: number;            // Perte estimée
  confidenceLevel: number;          // Niveau de confiance 0-1
  urgencyLevel: 'immediate' | 'high' | 'normal' | 'low';
  
  // Context client/contrat
  policyInfo?: {
    policyNumber: string;
    insuredName: string;
    vehicleInfo?: {
      vin: string;
      licensePlate: string;
      make: string;
      model: string;
    };
    claimInfo?: {
      claimNumber: string;
      eventDate: Date;
      reportedAmount: number;
    };
  };
  
  // Recommandations business
  recommendedActions: RecommendedAction[];
  investigationPriority: number;    // 0-100
  escalationRequired: boolean;
}

export interface RecommendedAction {
  action: 'investigate' | 'expert_required' | 'documentation_request' | 'claim_suspension' | 'policy_review';
  description: string;
  urgency: 'immediate' | 'within_24h' | 'within_week' | 'routine';
  estimatedCost: number;
  expectedROI: number;
}

export interface ROIContext {
  fraudContext: FraudContext;
  lineOfBusiness: InsuranceLineOfBusiness;
  
  // ROI Souscription  
  annualPremiumAtRisk?: number;     // Prime annuelle en risque
  customerLifetimeValue?: number;   // Valeur client sur durée vie
  riskMultiplier?: number;          // Multiplicateur de risque
  
  // ROI Sinistre
  claimAmount?: number;             // Montant déclaré
  estimatedSavings?: number;        // Économies estimées
  immediateRecovery?: number;       // Récupération immédiate
  
  // Coûts
  investigationCost: number;        // Coût investigation
  technologyCost: number;           // Coût technologique
  opportunityCost: number;          // Coût d'opportunité
  
  // Résultat
  totalROI: number;                 // ROI net calculé
  roiRatio: number;                 // Ratio ROI (bénéfice/coût)
  paybackPeriod: number;            // Période de retour (jours)
}