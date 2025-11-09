import { 
  FraudContext, 
  InsuranceLineOfBusiness, 
  InsuranceFraudType,
  ROIContext 
} from '@/types/insurance-fraud.types';

/**
 * Service de calcul ROI différencié selon contexte métier
 * Souscription vs Sinistre avec logiques business spécifiques
 */
export class ROICalculationService {

  /**
   * Tarifs de référence par métier
   */
  private static readonly COST_STRUCTURE = {
    // Coûts technologiques (par alerte)
    technologyCost: 2.50,
    
    // Coûts humains (par heure)
    analystHourly: 45,
    investigatorHourly: 65,
    expertHourly: 120,
    
    // Coûts process (fixe)
    qualificationCost: 15,   // Temps qualification alerte
    reportingCost: 25,       // Coût administratif
    complianceCost: 50,      // Coût conformité/légal
    
    // Valeurs business (moyennes marché)
    customerLifetimeValue: 1200,  // Valeur client sur durée vie
    brandProtectionValue: 0.1,    // 10% CA protégé si fraude évitée
    regulatoryComplianceValue: 500, // Valeur conformité réglementaire
  };

  /**
   * Multiplicateurs ROI par ligne d'assurance
   */
  private static readonly LINE_MULTIPLIERS: Record<InsuranceLineOfBusiness, number> = {
    [InsuranceLineOfBusiness.AUTO]: 1.0,          // Référence
    [InsuranceLineOfBusiness.HABITATION]: 0.8,    // Moins exposé
    [InsuranceLineOfBusiness.SANTE]: 1.2,         // Plus sensible
    [InsuranceLineOfBusiness.PROFESSIONNELLE]: 1.5, // Montants élevés
    [InsuranceLineOfBusiness.VOYAGE]: 0.6,        // Montants faibles
    [InsuranceLineOfBusiness.JURIDIQUE]: 0.9,     // Complexité
  };

  /**
   * Patterns de montants par type de fraude (€)
   */
  private static readonly FRAUD_AMOUNT_PATTERNS: Record<InsuranceFraudType, {
    min: number;
    max: number;
    average: number;
    timeToDetection: number; // jours
  }> = {
    // === SOUSCRIPTION ===
    [InsuranceFraudType.MODIFICATION_ADRESSE]: { min: 50, max: 800, average: 320, timeToDetection: 30 },
    [InsuranceFraudType.FAUX_BONUS_MALUS]: { min: 200, max: 1500, average: 850, timeToDetection: 45 },
    [InsuranceFraudType.USURPATION_IDENTITE]: { min: 1000, max: 5000, average: 2500, timeToDetection: 15 },
    [InsuranceFraudType.DATE_PERMIS_INVALIDE]: { min: 100, max: 900, average: 450, timeToDetection: 60 },
    [InsuranceFraudType.FAUX_JUSTIFICATIFS]: { min: 300, max: 2000, average: 1200, timeToDetection: 20 },
    [InsuranceFraudType.VEHICULE_MISREPRESENTE]: { min: 500, max: 4000, average: 2100, timeToDetection: 25 },
    
    // === SINISTRE ===
    [InsuranceFraudType.DOCUMENT_FALSIFIE]: { min: 800, max: 8000, average: 3200, timeToDetection: 10 },
    [InsuranceFraudType.MONTANT_GONFLE]: { min: 200, max: 5000, average: 1800, timeToDetection: 7 },
    [InsuranceFraudType.SINISTRE_FICTIF]: { min: 2000, max: 15000, average: 6500, timeToDetection: 5 },
    [InsuranceFraudType.EXPERT_COMPLICE]: { min: 1500, max: 12000, average: 4500, timeToDetection: 14 },
    [InsuranceFraudType.REPARATEUR_COMPLICE]: { min: 800, max: 6000, average: 2800, timeToDetection: 12 },
    [InsuranceFraudType.RESEAU_ORGANISE]: { min: 5000, max: 50000, average: 18000, timeToDetection: 21 },
    
    // === AUTRES ===
    [InsuranceFraudType.CYBER_FRAUDE]: { min: 2000, max: 25000, average: 8500, timeToDetection: 3 },
    [InsuranceFraudType.BLANCHIMENT]: { min: 10000, max: 100000, average: 35000, timeToDetection: 30 },
  } as any;

  /**
   * Calcule le ROI selon le contexte métier
   */
  static calculateROI(
    fraudType: InsuranceFraudType,
    fraudContext: FraudContext,
    lineOfBusiness: InsuranceLineOfBusiness,
    detectedAmount: number = 0,
    investigationComplexity: 'simple' | 'medium' | 'complex' = 'medium'
  ): ROIContext {
    
    switch (fraudContext) {
      case FraudContext.SOUSCRIPTION:
        return this.calculateSubscriptionROI(fraudType, lineOfBusiness, detectedAmount, investigationComplexity);
      
      case FraudContext.SINISTRE:
        return this.calculateClaimROI(fraudType, lineOfBusiness, detectedAmount, investigationComplexity);
      
      case FraudContext.GESTION:
        return this.calculateManagementROI(fraudType, lineOfBusiness, detectedAmount, investigationComplexity);
      
      default:
        return this.calculateGenericROI(fraudType, lineOfBusiness, detectedAmount, investigationComplexity);
    }
  }

  /**
   * ROI Fraude Souscription - Impact sur tarification et risque
   */
  private static calculateSubscriptionROI(
    fraudType: InsuranceFraudType,
    lineOfBusiness: InsuranceLineOfBusiness,
    detectedAmount: number,
    complexity: 'simple' | 'medium' | 'complex'
  ): ROIContext {
    
    const pattern = this.FRAUD_AMOUNT_PATTERNS[fraudType];
    const multiplier = this.LINE_MULTIPLIERS[lineOfBusiness];
    
    // Montant de référence si non fourni
    const baseAmount = detectedAmount || pattern.average;
    
    // === CALCUL BÉNÉFICES SOUSCRIPTION ===
    
    // 1. Prime annuelle en risque (sous-tarification évitée)
    const annualPremiumAtRisk = baseAmount * 3.2 * multiplier; // Facteur 3.2x pour annualisation
    
    // 2. Valeur client sur durée de vie
    const customerLifetimeValue = this.COST_STRUCTURE.customerLifetimeValue * multiplier;
    
    // 3. Multiplicateur de risque selon type fraude
    const riskMultiplier = this.getSubscriptionRiskMultiplier(fraudType);
    
    // 4. Économies totales
    const totalSavings = (annualPremiumAtRisk + customerLifetimeValue) * riskMultiplier;
    
    // === CALCUL COÛTS ===
    const costs = this.calculateInvestigationCosts(complexity, pattern.timeToDetection);
    
    // === ROI NET ===
    const totalROI = totalSavings - costs.totalCost;
    const roiRatio = totalROI / costs.totalCost;
    const paybackPeriod = Math.max(1, pattern.timeToDetection * 0.8); // Plus rapide que détection
    
    return {
      fraudContext: FraudContext.SOUSCRIPTION,
      lineOfBusiness,
      
      // Spécifique souscription
      annualPremiumAtRisk,
      customerLifetimeValue,
      riskMultiplier,
      
      // Coûts
      investigationCost: costs.investigationCost,
      technologyCost: costs.technologyCost,
      opportunityCost: costs.opportunityCost,
      
      // Résultats
      totalROI,
      roiRatio,
      paybackPeriod,
    };
  }

  /**
   * ROI Fraude Sinistre - Impact direct sur indemnisation
   */
  private static calculateClaimROI(
    fraudType: InsuranceFraudType,
    lineOfBusiness: InsuranceLineOfBusiness,
    detectedAmount: number,
    complexity: 'simple' | 'medium' | 'complex'
  ): ROIContext {
    
    const pattern = this.FRAUD_AMOUNT_PATTERNS[fraudType];
    const multiplier = this.LINE_MULTIPLIERS[lineOfBusiness];
    
    // Montant de référence
    const claimAmount = detectedAmount || pattern.average;
    
    // === CALCUL BÉNÉFICES SINISTRE ===
    
    // 1. Récupération immédiate (montant non payé)
    const immediateRecovery = claimAmount * multiplier;
    
    // 2. Économies indemnisation (frais évités)
    const indemnizationSavings = immediateRecovery * 0.15; // 15% frais gestion sinistre
    
    // 3. Effet dissuasion (autres fraudes évitées)
    const deterrentEffect = immediateRecovery * 0.2; // 20% effet multiplicateur
    
    // 4. Protection image/compliance
    const brandProtection = immediateRecovery * this.COST_STRUCTURE.brandProtectionValue;
    
    const totalSavings = immediateRecovery + indemnizationSavings + deterrentEffect + brandProtection;
    
    // === CALCUL COÛTS ===
    const costs = this.calculateInvestigationCosts(complexity, pattern.timeToDetection);
    
    // === ROI NET ===
    const totalROI = totalSavings - costs.totalCost;
    const roiRatio = totalROI / costs.totalCost;
    const paybackPeriod = Math.max(1, pattern.timeToDetection * 0.3); // Très rapide pour sinistre
    
    return {
      fraudContext: FraudContext.SINISTRE,
      lineOfBusiness,
      
      // Spécifique sinistre
      claimAmount,
      immediateRecovery,
      estimatedSavings: totalSavings,
      
      // Coûts
      investigationCost: costs.investigationCost,
      technologyCost: costs.technologyCost,
      opportunityCost: costs.opportunityCost,
      
      // Résultats
      totalROI,
      roiRatio,
      paybackPeriod,
    };
  }

  /**
   * ROI Fraude Gestion - Impact sur portefeuille
   */
  private static calculateManagementROI(
    fraudType: InsuranceFraudType,
    lineOfBusiness: InsuranceLineOfBusiness,
    detectedAmount: number,
    complexity: 'simple' | 'medium' | 'complex'
  ): ROIContext {
    
    // Logique hybride souscription/sinistre
    const subscriptionROI = this.calculateSubscriptionROI(fraudType, lineOfBusiness, detectedAmount, complexity);
    const claimROI = this.calculateClaimROI(fraudType, lineOfBusiness, detectedAmount, complexity);
    
    // Moyenne pondérée
    const totalROI = (subscriptionROI.totalROI + claimROI.totalROI) * 0.7; // Facteur réduction
    
    return {
      ...subscriptionROI,
      fraudContext: FraudContext.GESTION,
      totalROI,
      roiRatio: totalROI / (subscriptionROI.investigationCost + subscriptionROI.technologyCost),
      paybackPeriod: (subscriptionROI.paybackPeriod + claimROI.paybackPeriod) / 2,
    };
  }

  /**
   * ROI générique pour nouveaux types
   */
  private static calculateGenericROI(
    fraudType: InsuranceFraudType,
    lineOfBusiness: InsuranceLineOfBusiness,
    detectedAmount: number,
    complexity: 'simple' | 'medium' | 'complex'
  ): ROIContext {
    
    const estimatedAmount = detectedAmount || 1500; // Valeur par défaut
    const multiplier = this.LINE_MULTIPLIERS[lineOfBusiness];
    
    const totalSavings = estimatedAmount * multiplier * 2; // Facteur conservateur
    const costs = this.calculateInvestigationCosts(complexity, 14); // 2 semaines par défaut
    
    const totalROI = totalSavings - costs.totalCost;
    
    return {
      fraudContext: FraudContext.SINISTRE, // Par défaut
      lineOfBusiness,
      estimatedSavings: totalSavings,
      investigationCost: costs.investigationCost,
      technologyCost: costs.technologyCost,
      opportunityCost: costs.opportunityCost,
      totalROI,
      roiRatio: totalROI / costs.totalCost,
      paybackPeriod: 14,
    };
  }

  /**
   * Calcule les coûts d'investigation selon complexité
   */
  private static calculateInvestigationCosts(
    complexity: 'simple' | 'medium' | 'complex',
    investigationDays: number
  ) {
    const { technologyCost, analystHourly, investigatorHourly, expertHourly } = this.COST_STRUCTURE;
    
    // Heures d'investigation selon complexité
    const hoursMap = {
      simple: 2,    // 2h analyst
      medium: 5,    // 3h analyst + 2h investigator
      complex: 12   // 4h analyst + 4h investigator + 4h expert
    };
    
    const totalHours = hoursMap[complexity];
    
    // Coût humain
    let investigationCost = 0;
    switch (complexity) {
      case 'simple':
        investigationCost = totalHours * analystHourly;
        break;
      case 'medium':
        investigationCost = (3 * analystHourly) + (2 * investigatorHourly);
        break;
      case 'complex':
        investigationCost = (4 * analystHourly) + (4 * investigatorHourly) + (4 * expertHourly);
        break;
    }
    
    // Coût d'opportunité (autres dossiers non traités)
    const opportunityCost = investigationDays * 0.1 * investigationCost;
    
    const totalCost = investigationCost + technologyCost + opportunityCost;
    
    return {
      investigationCost,
      technologyCost,
      opportunityCost,
      totalCost,
    };
  }

  /**
   * Multiplicateur de risque pour fraude souscription
   */
  private static getSubscriptionRiskMultiplier(fraudType: InsuranceFraudType): number {
    const multipliers: Record<InsuranceFraudType, number> = {
      [InsuranceFraudType.USURPATION_IDENTITE]: 2.5,      // Très grave
      [InsuranceFraudType.VEHICULE_MISREPRESENTE]: 2.0,   // Impact tarifaire fort
      [InsuranceFraudType.FAUX_BONUS_MALUS]: 1.8,         // Impact historique
      [InsuranceFraudType.MODIFICATION_ADRESSE]: 1.3,     // Impact zonage
      [InsuranceFraudType.DATE_PERMIS_INVALIDE]: 1.5,     // Impact expérience
      [InsuranceFraudType.FAUX_JUSTIFICATIFS]: 1.4,       // Impact éligibilité
    } as any;
    
    return multipliers[fraudType] || 1.0;
  }

  /**
   * Formatte le ROI pour affichage business
   */
  static formatROIForDisplay(roi: ROIContext): {
    summary: string;
    details: string[];
    recommendations: string[];
  } {
    const formatCurrency = (amount: number) => `€${Math.round(amount).toLocaleString('fr-FR')}`;
    const formatRatio = (ratio: number) => `${(ratio * 100).toFixed(1)}%`;
    
    let summary = '';
    const details: string[] = [];
    const recommendations: string[] = [];
    
    if (roi.fraudContext === FraudContext.SOUSCRIPTION) {
      summary = `ROI Souscription: ${formatCurrency(roi.totalROI)} (ratio: ${formatRatio(roi.roiRatio)})`;
      details.push(`Prime annuelle protégée: ${formatCurrency(roi.annualPremiumAtRisk || 0)}`);
      details.push(`Valeur client: ${formatCurrency(roi.customerLifetimeValue || 0)}`);
      details.push(`Période de retour: ${roi.paybackPeriod} jours`);
      
      if (roi.roiRatio > 3) {
        recommendations.push('ROI excellent - Prioriser ce type de détection');
      }
    } else {
      summary = `ROI Sinistre: ${formatCurrency(roi.totalROI)} (ratio: ${formatRatio(roi.roiRatio)})`;
      details.push(`Montant récupéré: ${formatCurrency(roi.immediateRecovery || 0)}`);
      details.push(`Économies totales: ${formatCurrency(roi.estimatedSavings || 0)}`);
      details.push(`Retour immédiat: ${roi.paybackPeriod} jours`);
      
      if (roi.roiRatio > 5) {
        recommendations.push('ROI exceptionnel - Impact immédiat');
      }
    }
    
    details.push(`Coût investigation: ${formatCurrency(roi.investigationCost)}`);
    details.push(`Coût technologique: ${formatCurrency(roi.technologyCost)}`);
    
    return { summary, details, recommendations };
  }
}