import { 
  InsuranceFraudType, 
  FraudContext, 
  InsuranceLineOfBusiness, 
  DocumentBusinessContext, 
  FraudTypologyMapping,
  InsuranceAlert 
} from '@/types/insurance-fraud.types';
import { FraudAnalysisResult, KeyFinding } from './fraudDetectionService';

/**
 * Service de mapping des détections techniques vers typologies métier assurance
 */
export class FraudTypologyService {
  
  /**
   * Mapping principal : codes techniques → typologies assurance
   */
  private static readonly TECHNICAL_TO_BUSINESS_MAPPING: Record<string, Partial<FraudTypologyMapping>> = {
    // === DÉTECTIONS TECHNIQUES DOCUMENT ===
    'DIGITAL_PRINT_DETECTED': {
      insuranceFraudType: InsuranceFraudType.USURPATION_IDENTITE,
      context: FraudContext.SOUSCRIPTION,
      severity: 'high',
      riskLevel: 85,
      averageAmount: 2500,
      detectionDifficulty: 30,
      investigationComplexity: 'medium',
    },
    
    'SIGNATURE_INCONSISTENCY': {
      insuranceFraudType: InsuranceFraudType.DOCUMENT_FALSIFIE,
      context: FraudContext.SINISTRE,
      severity: 'high',
      riskLevel: 80,
      averageAmount: 3200,
      detectionDifficulty: 45,
      investigationComplexity: 'medium',
    },
    
    'AMOUNT_ANOMALY': {
      insuranceFraudType: InsuranceFraudType.MONTANT_GONFLE,
      context: FraudContext.SINISTRE,
      severity: 'medium',
      riskLevel: 70,
      averageAmount: 1800,
      detectionDifficulty: 25,
      investigationComplexity: 'simple',
    },
    
    'DATE_INCONSISTENCY': {
      insuranceFraudType: InsuranceFraudType.DATE_PERMIS_INVALIDE,
      context: FraudContext.SOUSCRIPTION,
      severity: 'medium',
      riskLevel: 65,
      averageAmount: 450,
      detectionDifficulty: 20,
      investigationComplexity: 'simple',
    },
    
    'TEMPLATE_MISMATCH': {
      insuranceFraudType: InsuranceFraudType.FAUX_JUSTIFICATIFS,
      context: FraudContext.SOUSCRIPTION,
      severity: 'high',
      riskLevel: 90,
      averageAmount: 1200,
      detectionDifficulty: 60,
      investigationComplexity: 'complex',
    },
    
    'AI_GENERATED_CONTENT': {
      insuranceFraudType: InsuranceFraudType.CYBER_FRAUDE,
      context: FraudContext.SINISTRE,
      severity: 'critical',
      riskLevel: 95,
      averageAmount: 5000,
      detectionDifficulty: 80,
      investigationComplexity: 'complex',
    },
    
    'BONUS_MALUS_ANOMALY': {
      insuranceFraudType: InsuranceFraudType.FAUX_BONUS_MALUS,
      context: FraudContext.SOUSCRIPTION,
      severity: 'high',
      riskLevel: 75,
      averageAmount: 850,
      detectionDifficulty: 35,
      investigationComplexity: 'medium',
    },
    
    'ADDRESS_ANOMALY': {
      insuranceFraudType: InsuranceFraudType.MODIFICATION_ADRESSE,
      context: FraudContext.SOUSCRIPTION,
      severity: 'medium',
      riskLevel: 60,
      averageAmount: 320,
      detectionDifficulty: 25,
      investigationComplexity: 'simple',
    },
    
    'VIN_ANOMALY': {
      insuranceFraudType: InsuranceFraudType.VEHICULE_MISREPRESENTE,
      context: FraudContext.SOUSCRIPTION,
      severity: 'high',
      riskLevel: 85,
      averageAmount: 2100,
      detectionDifficulty: 40,
      investigationComplexity: 'medium',
    },
    
    'EXPERT_SEAL_MISSING': {
      insuranceFraudType: InsuranceFraudType.EXPERT_COMPLICE,
      context: FraudContext.SINISTRE,
      severity: 'critical',
      riskLevel: 90,
      averageAmount: 4500,
      detectionDifficulty: 70,
      investigationComplexity: 'complex',
    },
    
    'INVOICE_TAMPERING': {
      insuranceFraudType: InsuranceFraudType.REPARATEUR_COMPLICE,
      context: FraudContext.SINISTRE,
      severity: 'high',
      riskLevel: 80,
      averageAmount: 2800,
      detectionDifficulty: 50,
      investigationComplexity: 'medium',
    },
    
    'ORGANIZED_PATTERN': {
      insuranceFraudType: InsuranceFraudType.RESEAU_ORGANISE,
      context: FraudContext.SINISTRE,
      severity: 'critical',
      riskLevel: 95,
      averageAmount: 12000,
      detectionDifficulty: 85,
      investigationComplexity: 'complex',
    },
  };

  /**
   * Mapping type de document → contexte business
   */
  private static readonly DOCUMENT_TO_CONTEXT: Record<string, DocumentBusinessContext> = {
    'carte_grise': DocumentBusinessContext.SOUSCRIPTION,
    'permis_conduire': DocumentBusinessContext.SOUSCRIPTION,
    'releve_information': DocumentBusinessContext.SOUSCRIPTION,
    'justificatif_domicile': DocumentBusinessContext.SOUSCRIPTION,
    'constat_amiable': DocumentBusinessContext.DECLARATION_SINISTRE,
    'facture_reparation': DocumentBusinessContext.INDEMNISATION,
    'expertise_auto': DocumentBusinessContext.EXPERTISE,
    'certificat_medical': DocumentBusinessContext.EXPERTISE,
    'quittance_assurance': DocumentBusinessContext.MODIFICATION,
  };

  /**
   * Mapping type de document → ligne d'assurance
   */
  private static readonly DOCUMENT_TO_LINE_OF_BUSINESS: Record<string, InsuranceLineOfBusiness> = {
    'carte_grise': InsuranceLineOfBusiness.AUTO,
    'permis_conduire': InsuranceLineOfBusiness.AUTO,
    'constat_amiable': InsuranceLineOfBusiness.AUTO,
    'facture_reparation': InsuranceLineOfBusiness.AUTO,
    'expertise_auto': InsuranceLineOfBusiness.AUTO,
    'justificatif_domicile': InsuranceLineOfBusiness.HABITATION,
    'attestation_salaire': InsuranceLineOfBusiness.PROFESSIONNELLE,
    'certificat_medical': InsuranceLineOfBusiness.SANTE,
    'ordonnance': InsuranceLineOfBusiness.SANTE,
    'facture_soins': InsuranceLineOfBusiness.SANTE,
  };

  /**
   * Analyse et enrichit les résultats techniques avec typologie métier
   */
  static analyzeBusinessFraud(
    analysisResult: FraudAnalysisResult,
    documentFileName: string = ''
  ): InsuranceAlert {
    const documentType = this.extractDocumentType(analysisResult, documentFileName);
    const businessContext = this.DOCUMENT_TO_CONTEXT[documentType] || DocumentBusinessContext.SOUSCRIPTION;
    const lineOfBusiness = this.DOCUMENT_TO_LINE_OF_BUSINESS[documentType] || InsuranceLineOfBusiness.AUTO;
    
    // Analyse des findings techniques
    const fraudTypologies = this.mapTechnicalFindings(analysisResult.key_findings);
    
    // Extraction contexte client/contrat
    const policyInfo = this.extractPolicyInfo(analysisResult);
    
    // Calcul évaluation business
    const businessEvaluation = this.calculateBusinessImpact(fraudTypologies, analysisResult);
    
    // Génération recommandations
    const recommendedActions = this.generateRecommendations(fraudTypologies, businessEvaluation);

    return {
      fraudTypology: fraudTypologies,
      businessContext,
      lineOfBusiness,
      estimatedLoss: businessEvaluation.estimatedLoss,
      confidenceLevel: analysisResult.confidence || 0.8,
      urgencyLevel: this.calculateUrgency(fraudTypologies, businessEvaluation),
      policyInfo,
      recommendedActions,
      investigationPriority: this.calculateInvestigationPriority(fraudTypologies, businessEvaluation),
      escalationRequired: this.shouldEscalate(fraudTypologies, businessEvaluation),
    };
  }

  /**
   * Map les findings techniques vers typologies business
   */
  private static mapTechnicalFindings(keyFindings: KeyFinding[]): FraudTypologyMapping[] {
    const mappings: FraudTypologyMapping[] = [];
    
    for (const finding of keyFindings) {
      const mapping = this.TECHNICAL_TO_BUSINESS_MAPPING[finding.code];
      if (mapping) {
        mappings.push({
          ...mapping,
          lineOfBusiness: [InsuranceLineOfBusiness.AUTO], // Default, peut être affiné
          regulatoryImplications: this.getRegulatoryImplications(mapping.insuranceFraudType!),
          businessImpact: this.getBusinessImpact(mapping.insuranceFraudType!),
          preventionMeasures: this.getPreventionMeasures(mapping.insuranceFraudType!),
        } as FraudTypologyMapping);
      }
    }
    
    return mappings;
  }

  /**
   * Extrait les informations de police/contrat
   */
  private static extractPolicyInfo(result: FraudAnalysisResult): any {
    const documentInfo = result.document_info;
    
    return {
      policyNumber: documentInfo.registration_number || documentInfo.vin,
      insuredName: this.extractInsuredName(result),
      vehicleInfo: {
        vin: documentInfo.vin,
        licensePlate: documentInfo.license_plate,
        make: this.extractVehicleMake(result),
        model: this.extractVehicleModel(result),
      },
      claimInfo: {
        claimNumber: this.extractClaimNumber(result),
        eventDate: this.extractEventDate(result),
        reportedAmount: this.extractReportedAmount(result),
      },
    };
  }

  /**
   * Calcule l'impact business global
   */
  private static calculateBusinessImpact(
    typologies: FraudTypologyMapping[],
    analysisResult: FraudAnalysisResult
  ) {
    let totalEstimatedLoss = 0;
    let maxRiskLevel = 0;
    
    for (const typology of typologies) {
      totalEstimatedLoss += typology.averageAmount || 0;
      maxRiskLevel = Math.max(maxRiskLevel, typology.riskLevel || 0);
    }
    
    // Ajustement selon le score de risque
    const riskMultiplier = analysisResult.risk_score || 0.5;
    totalEstimatedLoss *= riskMultiplier;
    
    return {
      estimatedLoss: totalEstimatedLoss,
      riskLevel: maxRiskLevel,
      complexityScore: this.calculateComplexityScore(typologies),
    };
  }

  /**
   * Génère les recommandations business
   */
  private static generateRecommendations(
    typologies: FraudTypologyMapping[],
    businessEvaluation: any
  ) {
    const recommendations = [];
    
    // Recommandations basées sur la typologie
    for (const typology of typologies) {
      if (typology.investigationComplexity === 'complex') {
        recommendations.push({
          action: 'expert_required' as const,
          description: `Expertise spécialisée requise pour ${typology.insuranceFraudType}`,
          urgency: 'within_24h' as const,
          estimatedCost: 500,
          expectedROI: (typology.averageAmount || 0) * 0.8,
        });
      }
      
      if (typology.riskLevel > 80) {
        recommendations.push({
          action: 'claim_suspension' as const,
          description: 'Suspension temporaire en attente investigation',
          urgency: 'immediate' as const,
          estimatedCost: 100,
          expectedROI: businessEvaluation.estimatedLoss,
        });
      }
    }
    
    return recommendations;
  }

  // === MÉTHODES UTILITAIRES ===
  
  private static extractDocumentType(result: FraudAnalysisResult, fileName: string): string {
    // Logique d'extraction du type de document
    const docType = result.document_info.type?.toLowerCase() || '';
    if (docType.includes('carte_grise') || fileName.includes('carte_grise')) return 'carte_grise';
    if (docType.includes('permis') || fileName.includes('permis')) return 'permis_conduire';
    if (docType.includes('releve') || fileName.includes('releve')) return 'releve_information';
    if (docType.includes('constat') || fileName.includes('constat')) return 'constat_amiable';
    return 'document_generique';
  }
  
  private static extractInsuredName(result: FraudAnalysisResult): string {
    // Extraction du nom de l'assuré depuis les données OCR ou extraites
    return 'Nom Assuré'; // À implémenter selon la structure des données
  }
  
  private static extractVehicleMake(result: FraudAnalysisResult): string {
    // Extraction marque véhicule
    return result.document_info.vin?.substring(0, 3) || '';
  }
  
  private static extractVehicleModel(result: FraudAnalysisResult): string {
    // Extraction modèle véhicule
    return ''; // À implémenter
  }
  
  private static extractClaimNumber(result: FraudAnalysisResult): string {
    // Extraction numéro de sinistre
    return result.document_info.registration_number || '';
  }
  
  private static extractEventDate(result: FraudAnalysisResult): Date {
    // Extraction date événement
    return new Date();
  }
  
  private static extractReportedAmount(result: FraudAnalysisResult): number {
    // Extraction montant déclaré
    return 0; // À implémenter selon extraction de montants
  }
  
  private static calculateUrgency(typologies: FraudTypologyMapping[], evaluation: any): 'immediate' | 'high' | 'normal' | 'low' {
    const maxSeverity = Math.max(...typologies.map(t => 
      t.severity === 'critical' ? 4 : 
      t.severity === 'high' ? 3 : 
      t.severity === 'medium' ? 2 : 1
    ));
    
    if (maxSeverity >= 4 || evaluation.estimatedLoss > 5000) return 'immediate';
    if (maxSeverity >= 3 || evaluation.estimatedLoss > 2000) return 'high';
    if (maxSeverity >= 2 || evaluation.estimatedLoss > 500) return 'normal';
    return 'low';
  }
  
  private static calculateInvestigationPriority(typologies: FraudTypologyMapping[], evaluation: any): number {
    // Score 0-100 de priorité d'investigation
    let score = 0;
    
    // Facteur sévérité
    const avgSeverity = typologies.reduce((sum, t) => sum + (t.riskLevel || 0), 0) / typologies.length;
    score += avgSeverity * 0.4;
    
    // Facteur montant
    const amountFactor = Math.min((evaluation.estimatedLoss / 10000) * 30, 30);
    score += amountFactor;
    
    // Facteur complexité
    const complexityFactor = evaluation.complexityScore * 0.3;
    score += complexityFactor;
    
    return Math.round(Math.min(score, 100));
  }
  
  private static shouldEscalate(typologies: FraudTypologyMapping[], evaluation: any): boolean {
    return typologies.some(t => t.severity === 'critical') || 
           evaluation.estimatedLoss > 10000 ||
           evaluation.complexityScore > 80;
  }
  
  private static calculateComplexityScore(typologies: FraudTypologyMapping[]): number {
    if (typologies.length === 0) return 0;
    
    const avgComplexity = typologies.reduce((sum, t) => {
      const complexityScore = t.investigationComplexity === 'complex' ? 100 :
                            t.investigationComplexity === 'medium' ? 60 : 30;
      return sum + complexityScore;
    }, 0) / typologies.length;
    
    return avgComplexity;
  }
  
  private static getBusinessImpact(fraudType: InsuranceFraudType): string[] {
    const impacts: Record<InsuranceFraudType, string[]> = {
      [InsuranceFraudType.MODIFICATION_ADRESSE]: ['Impact tarifaire zonage', 'Fausse déclaration'],
      [InsuranceFraudType.FAUX_BONUS_MALUS]: ['Sous-tarification', 'Sélection adverse'],
      [InsuranceFraudType.USURPATION_IDENTITE]: ['Risque pénal', 'Image de marque'],
      [InsuranceFraudType.MONTANT_GONFLE]: ['Surcoût indemnisation', 'Inflation sinistralité'],
      [InsuranceFraudType.SINISTRE_FICTIF]: ['Perte directe', 'Détournement fonds'],
      [InsuranceFraudType.DOCUMENT_FALSIFIE]: ['Fausse preuve', 'Risque juridique'],
      // ... autres mappings
    } as any;
    
    return impacts[fraudType] || ['Impact générique'];
  }
  
  private static getPreventionMeasures(fraudType: InsuranceFraudType): string[] {
    const measures: Record<InsuranceFraudType, string[]> = {
      [InsuranceFraudType.MODIFICATION_ADRESSE]: ['Vérification géocodage', 'Contrôle justificatifs'],
      [InsuranceFraudType.FAUX_BONUS_MALUS]: ['Vérification AGIRA', 'Contrôle historique'],
      [InsuranceFraudType.USURPATION_IDENTITE]: ['Contrôle biométrique', 'Vérification documents'],
      [InsuranceFraudType.MONTANT_GONFLE]: ['Contrôle factures', 'Barème tarifaire'],
      // ... autres mappings
    } as any;
    
    return measures[fraudType] || ['Mesures génériques'];
  }
  
  private static getRegulatoryImplications(fraudType: InsuranceFraudType): string[] {
    const regulations: Record<InsuranceFraudType, string[]> = {
      [InsuranceFraudType.USURPATION_IDENTITE]: ['RGPD', 'Code pénal art. 441-1'],
      [InsuranceFraudType.BLANCHIMENT]: ['TRACFIN', 'LCB-FT'],
      [InsuranceFraudType.RESEAU_ORGANISE]: ['Signalement PHAROS', 'Coopération judiciaire'],
      // ... autres mappings
    } as any;
    
    return regulations[fraudType] || [];
  }
}