/**
 * Document Classification Service
 * Enhanced classification to identify business context and document patterns for insurance fraud detection
 */

import { DocumentInfo } from './fraudDetectionService';
import { FraudContext } from './fraudTypologyService';

export interface EnhancedDocumentClassification {
  // Core Classification
  documentType: string;
  businessContext: FraudContext;
  confidenceScore: number;
  
  // Business Classification
  businessFamily: 'subscription' | 'claims' | 'identity' | 'financial' | 'medical' | 'automotive' | 'unknown';
  workflowStage: 'onboarding' | 'renewal' | 'claim_submission' | 'claim_processing' | 'dispute' | 'unknown';
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  
  // Content Analysis
  contentIndicators: ContentIndicator[];
  extractedEntities: ExtractedEntity[];
  riskIndicators: RiskIndicator[];
  
  // Technical Properties
  technicalProperties: TechnicalProperties;
  
  // Insurance-Specific Context
  insuranceContext: InsuranceContext;
  
  // Fraud Susceptibility
  fraudSusceptibility: FraudSusceptibility;
}

export interface ContentIndicator {
  type: 'monetary' | 'temporal' | 'identity' | 'vehicle' | 'medical' | 'legal';
  value: string;
  confidence: number;
  businessRelevance: 'high' | 'medium' | 'low';
  riskFactor: number; // 0-1 scale
}

export interface ExtractedEntity {
  entityType: 'person' | 'organization' | 'vehicle' | 'address' | 'amount' | 'date' | 'policy_number' | 'claim_number';
  value: string;
  confidence: number;
  sourceField?: string;
  validation: 'valid' | 'suspect' | 'invalid' | 'unknown';
}

export interface RiskIndicator {
  category: 'quality' | 'authenticity' | 'consistency' | 'compliance';
  indicator: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  description: string;
  businessImpact: string;
}

export interface TechnicalProperties {
  fileFormat: string;
  creationMethod: 'scan' | 'digital' | 'photo' | 'generated' | 'unknown';
  quality: QualityMetrics;
  security: SecurityFeatures;
  metadata: DocumentMetadata;
}

export interface QualityMetrics {
  imageQuality: number;     // 0-1 score
  textLegibility: number;   // 0-1 score
  colorAccuracy: number;    // 0-1 score
  resolution: number;       // DPI
  compression: 'none' | 'low' | 'medium' | 'high' | 'extreme';
}

export interface SecurityFeatures {
  watermarks: boolean;
  securityPrinting: boolean;
  holographicElements: boolean;
  specialInks: boolean;
  embossing: boolean;
  microtext: boolean;
}

export interface DocumentMetadata {
  creationDate?: Date;
  modificationDate?: Date;
  software?: string;
  device?: string;
  gpsLocation?: { latitude: number; longitude: number };
  suspiciousMetadata: boolean;
}

export interface InsuranceContext {
  lineOfBusiness: 'auto' | 'home' | 'life' | 'health' | 'commercial' | 'unknown';
  documentPurpose: 'verification' | 'claim' | 'quote' | 'policy_change' | 'dispute' | 'unknown';
  customerSegment: 'individual' | 'sme' | 'corporate' | 'unknown';
  expectedDocuments: string[]; // What other documents should accompany this one
  complianceRequirements: string[];
}

export interface FraudSusceptibility {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  susceptibilityFactors: Array<{
    factor: string;
    weight: number;
    description: string;
  }>;
  historicalFraudRate: number; // For this document type
  commonFraudPatterns: string[];
  preventionMeasures: string[];
}

// Document type to business context mapping with enhanced patterns
const DOCUMENT_BUSINESS_MAPPING = {
  // Identity Documents
  'carte_identite': {
    context: 'subscription' as FraudContext,
    family: 'identity' as const,
    stage: 'onboarding' as const,
    urgency: 'medium' as const,
    lineOfBusiness: 'auto' as const,
    fraudPatterns: ['identity_theft', 'age_manipulation', 'false_identity'],
    riskLevel: 'high' as const
  },
  'permis_conduire': {
    context: 'subscription' as FraudContext,
    family: 'identity' as const,
    stage: 'onboarding' as const,
    urgency: 'high' as const,
    lineOfBusiness: 'auto' as const,
    fraudPatterns: ['license_fraud', 'point_manipulation', 'false_history'],
    riskLevel: 'high' as const
  },
  'passeport': {
    context: 'subscription' as FraudContext,
    family: 'identity' as const,
    stage: 'onboarding' as const,
    urgency: 'medium' as const,
    lineOfBusiness: 'auto' as const,
    fraudPatterns: ['identity_theft', 'document_forgery'],
    riskLevel: 'medium' as const
  },
  
  // Vehicle Documents
  'carte_grise': {
    context: 'subscription' as FraudContext,
    family: 'automotive' as const,
    stage: 'onboarding' as const,
    urgency: 'high' as const,
    lineOfBusiness: 'auto' as const,
    fraudPatterns: ['vehicle_misrepresentation', 'vin_fraud', 'ownership_fraud'],
    riskLevel: 'high' as const
  },
  'certificat_immatriculation': {
    context: 'subscription' as FraudContext,
    family: 'automotive' as const,
    stage: 'onboarding' as const,
    urgency: 'high' as const,
    lineOfBusiness: 'auto' as const,
    fraudPatterns: ['vehicle_misrepresentation', 'theft_fraud'],
    riskLevel: 'high' as const
  },
  
  // Insurance Documents
  'releve_information': {
    context: 'subscription' as FraudContext,
    family: 'financial' as const,
    stage: 'onboarding' as const,
    urgency: 'high' as const,
    lineOfBusiness: 'auto' as const,
    fraudPatterns: ['bonus_malus_fraud', 'history_manipulation'],
    riskLevel: 'critical' as const
  },
  'attestation_assurance': {
    context: 'subscription' as FraudContext,
    family: 'financial' as const,
    stage: 'renewal' as const,
    urgency: 'medium' as const,
    lineOfBusiness: 'auto' as const,
    fraudPatterns: ['coverage_fraud', 'false_attestation'],
    riskLevel: 'medium' as const
  },
  
  // Claims Documents
  'facture': {
    context: 'claims' as FraudContext,
    family: 'financial' as const,
    stage: 'claim_processing' as const,
    urgency: 'high' as const,
    lineOfBusiness: 'auto' as const,
    fraudPatterns: ['invoice_fraud', 'amount_inflation', 'false_invoice'],
    riskLevel: 'critical' as const
  },
  'devis': {
    context: 'claims' as FraudContext,
    family: 'financial' as const,
    stage: 'claim_submission' as const,
    urgency: 'medium' as const,
    lineOfBusiness: 'auto' as const,
    fraudPatterns: ['estimate_inflation', 'quote_manipulation'],
    riskLevel: 'high' as const
  },
  'photo_degats': {
    context: 'claims' as FraudContext,
    family: 'automotive' as const,
    stage: 'claim_submission' as const,
    urgency: 'high' as const,
    lineOfBusiness: 'auto' as const,
    fraudPatterns: ['staged_damage', 'pre_existing_damage', 'photo_manipulation'],
    riskLevel: 'high' as const
  },
  'constat_amiable': {
    context: 'claims' as FraudContext,
    family: 'legal' as const,
    stage: 'claim_submission' as const,
    urgency: 'critical' as const,
    lineOfBusiness: 'auto' as const,
    fraudPatterns: ['staged_accident', 'false_statement', 'collusion'],
    riskLevel: 'critical' as const
  },
  'rapport_expertise': {
    context: 'claims' as FraudContext,
    family: 'automotive' as const,
    stage: 'claim_processing' as const,
    urgency: 'high' as const,
    lineOfBusiness: 'auto' as const,
    fraudPatterns: ['expert_collusion', 'report_manipulation'],
    riskLevel: 'medium' as const
  },
  
  // Medical Documents
  'certificat_medical': {
    context: 'claims' as FraudContext,
    family: 'medical' as const,
    stage: 'claim_submission' as const,
    urgency: 'high' as const,
    lineOfBusiness: 'auto' as const,
    fraudPatterns: ['medical_fraud', 'false_certificate', 'exaggerated_injuries'],
    riskLevel: 'high' as const
  },
  'ordonnance': {
    context: 'claims' as FraudContext,
    family: 'medical' as const,
    stage: 'claim_processing' as const,
    urgency: 'medium' as const,
    lineOfBusiness: 'health' as const,
    fraudPatterns: ['prescription_fraud', 'false_prescription'],
    riskLevel: 'medium' as const
  },
  
  // Financial Documents
  'justificatif_domicile': {
    context: 'subscription' as FraudContext,
    family: 'identity' as const,
    stage: 'onboarding' as const,
    urgency: 'low' as const,
    lineOfBusiness: 'auto' as const,
    fraudPatterns: ['address_fraud', 'zone_manipulation'],
    riskLevel: 'medium' as const
  },
  'releve_bancaire': {
    context: 'subscription' as FraudContext,
    family: 'financial' as const,
    stage: 'onboarding' as const,
    urgency: 'low' as const,
    lineOfBusiness: 'auto' as const,
    fraudPatterns: ['financial_fraud', 'false_statements'],
    riskLevel: 'low' as const
  }
};

// Content patterns for enhanced analysis
const CONTENT_PATTERNS = {
  monetary: {
    regex: /(?:€|EUR|euros?)\s*(\d{1,3}(?:[,\s]\d{3})*(?:[,\.]\d{2})?)|(\d{1,3}(?:[,\s]\d{3})*(?:[,\.]\d{2})?)\s*(?:€|EUR|euros?)/gi,
    businessRelevance: 'high' as const
  },
  vin: {
    regex: /[A-HJ-NPR-Z0-9]{17}/g,
    businessRelevance: 'high' as const
  },
  license_plate: {
    regex: /[A-Z]{2}-\d{3}-[A-Z]{2}|\d{1,4}\s*[A-Z]{1,3}\s*\d{2}/g,
    businessRelevance: 'high' as const
  },
  policy_number: {
    regex: /(?:police|contrat|policy)\s*:?\s*([A-Z0-9-]{6,20})/gi,
    businessRelevance: 'high' as const
  },
  claim_number: {
    regex: /(?:sinistre|claim|dossier)\s*:?\s*([A-Z0-9-]{6,20})/gi,
    businessRelevance: 'high' as const
  },
  date: {
    regex: /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})|(\d{2,4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/g,
    businessRelevance: 'medium' as const
  }
};

export class DocumentClassificationService {
  /**
   * Performs enhanced classification of insurance documents
   */
  static classifyDocument(
    documentInfo: DocumentInfo,
    extractedText?: string,
    technicalAnalysis?: any
  ): EnhancedDocumentClassification {
    const docType = this.normalizeDocumentType(documentInfo.type);
    const mapping = DOCUMENT_BUSINESS_MAPPING[docType as keyof typeof DOCUMENT_BUSINESS_MAPPING];
    
    const contentIndicators = this.analyzeContent(extractedText || documentInfo.extracted_text || '');
    const extractedEntities = this.extractEntities(documentInfo, extractedText);
    const riskIndicators = this.identifyRiskIndicators(documentInfo, technicalAnalysis);
    const technicalProps = this.analyzeTechnicalProperties(documentInfo, technicalAnalysis);
    
    return {
      documentType: docType,
      businessContext: mapping?.context || this.inferContextFromContent(contentIndicators),
      confidenceScore: this.calculateConfidenceScore(mapping, contentIndicators, extractedEntities),
      
      businessFamily: mapping?.family || 'unknown',
      workflowStage: mapping?.stage || this.inferWorkflowStage(contentIndicators),
      urgencyLevel: mapping?.urgency || this.calculateUrgency(riskIndicators),
      
      contentIndicators,
      extractedEntities,
      riskIndicators,
      technicalProperties: technicalProps,
      
      insuranceContext: this.buildInsuranceContext(mapping, documentInfo),
      fraudSusceptibility: this.assessFraudSusceptibility(mapping, riskIndicators, contentIndicators)
    };
  }

  /**
   * Normalizes document type for consistent mapping
   */
  private static normalizeDocumentType(type: string): string {
    const normalized = type.toLowerCase()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
    
    // Handle common variations
    const variations: Record<string, string> = {
      'carte_identite': 'carte_identite',
      'carte_d_identite': 'carte_identite',
      'cni': 'carte_identite',
      'permis_de_conduire': 'permis_conduire',
      'permis': 'permis_conduire',
      'carte_grise': 'carte_grise',
      'certificat_immatriculation': 'certificat_immatriculation',
      'releve_d_information': 'releve_information',
      'rib': 'releve_information',
      'facture': 'facture',
      'invoice': 'facture',
      'devis': 'devis',
      'estimate': 'devis',
      'photo': 'photo_degats',
      'image': 'photo_degats',
      'constat': 'constat_amiable',
      'rapport': 'rapport_expertise',
      'certificat': 'certificat_medical',
      'medical': 'certificat_medical',
      'ordonnance': 'ordonnance',
      'prescription': 'ordonnance'
    };
    
    return variations[normalized] || normalized;
  }

  /**
   * Analyzes document content for business indicators
   */
  private static analyzeContent(text: string): ContentIndicator[] {
    const indicators: ContentIndicator[] = [];
    const lowercaseText = text.toLowerCase();
    
    // Apply content patterns
    Object.entries(CONTENT_PATTERNS).forEach(([type, pattern]) => {
      const matches = text.match(pattern.regex);
      if (matches) {
        matches.forEach(match => {
          indicators.push({
            type: type as any,
            value: match,
            confidence: 0.8,
            businessRelevance: pattern.businessRelevance,
            riskFactor: this.calculateContentRiskFactor(type, match, lowercaseText)
          });
        });
      }
    });
    
    // Business-specific indicators
    const businessKeywords = {
      subscription: ['souscription', 'police', 'contrat', 'premium', 'cotisation'],
      claims: ['sinistre', 'dommage', 'accident', 'reparation', 'expertise'],
      medical: ['medecin', 'hopital', 'medicament', 'traitement', 'blessure'],
      financial: ['montant', 'euro', 'facture', 'paiement', 'remboursement']
    };
    
    Object.entries(businessKeywords).forEach(([category, keywords]) => {
      const keywordCount = keywords.reduce((count, keyword) => 
        count + (lowercaseText.match(new RegExp(keyword, 'g'))?.length || 0), 0
      );
      
      if (keywordCount > 0) {
        indicators.push({
          type: category as any,
          value: `${keywordCount} keywords found`,
          confidence: Math.min(keywordCount * 0.2, 1.0),
          businessRelevance: 'medium',
          riskFactor: 0.1
        });
      }
    });
    
    return indicators.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Extracts structured entities from document
   */
  private static extractEntities(
    documentInfo: DocumentInfo,
    extractedText?: string
  ): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    const text = extractedText || documentInfo.extracted_text || '';
    
    // Extract from document info
    if (documentInfo.vin) {
      entities.push({
        entityType: 'vehicle',
        value: documentInfo.vin,
        confidence: 0.95,
        sourceField: 'vin',
        validation: this.validateVIN(documentInfo.vin)
      });
    }
    
    if (documentInfo.registration_number) {
      entities.push({
        entityType: 'vehicle',
        value: documentInfo.registration_number,
        confidence: 0.9,
        sourceField: 'registration_number',
        validation: 'unknown'
      });
    }
    
    if (documentInfo.owner_name) {
      entities.push({
        entityType: 'person',
        value: documentInfo.owner_name,
        confidence: 0.8,
        sourceField: 'owner_name',
        validation: 'unknown'
      });
    }
    
    // Extract from text using patterns
    const vinMatches = text.match(/[A-HJ-NPR-Z0-9]{17}/g);
    if (vinMatches) {
      vinMatches.forEach(vin => {
        if (!entities.some(e => e.value === vin)) {
          entities.push({
            entityType: 'vehicle',
            value: vin,
            confidence: 0.85,
            validation: this.validateVIN(vin)
          });
        }
      });
    }
    
    // Extract monetary amounts
    const amountMatches = text.match(/(?:€|EUR)\s*(\d{1,3}(?:[,\s]\d{3})*(?:[,\.]\d{2})?)/g);
    if (amountMatches) {
      amountMatches.forEach(amount => {
        entities.push({
          entityType: 'amount',
          value: amount,
          confidence: 0.7,
          validation: 'unknown'
        });
      });
    }
    
    return entities;
  }

  /**
   * Identifies potential risk indicators
   */
  private static identifyRiskIndicators(
    documentInfo: DocumentInfo,
    technicalAnalysis?: any
  ): RiskIndicator[] {
    const indicators: RiskIndicator[] = [];
    
    // Quality indicators
    if (documentInfo.is_digital_print) {
      indicators.push({
        category: 'authenticity',
        indicator: 'digital_print_detected',
        severity: 'warning',
        description: 'Document créé numériquement au lieu d\'être scanné',
        businessImpact: 'Risque de falsification de document'
      });
    }
    
    // Technical analysis indicators
    if (technicalAnalysis) {
      if (technicalAnalysis.font_inconsistency) {
        indicators.push({
          category: 'authenticity',
          indicator: 'font_inconsistency',
          severity: 'error',
          description: 'Incohérences dans les polices de caractères',
          businessImpact: 'Indication possible de modification du document'
        });
      }
      
      if (technicalAnalysis.metadata_suspicious) {
        indicators.push({
          category: 'authenticity',
          indicator: 'suspicious_metadata',
          severity: 'warning',
          description: 'Métadonnées du document suspectes',
          businessImpact: 'Document potentiellement altéré'
        });
      }
    }
    
    // Business logic indicators
    if (documentInfo.coordinates && this.isLocationSuspicious(documentInfo.coordinates)) {
      indicators.push({
        category: 'compliance',
        indicator: 'suspicious_location',
        severity: 'info',
        description: 'Géolocalisation inhabituelle',
        businessImpact: 'Vérification de cohérence géographique nécessaire'
      });
    }
    
    return indicators.sort((a, b) => {
      const severityOrder = { critical: 4, error: 3, warning: 2, info: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  /**
   * Analyzes technical properties of the document
   */
  private static analyzeTechnicalProperties(
    documentInfo: DocumentInfo,
    technicalAnalysis?: any
  ): TechnicalProperties {
    return {
      fileFormat: documentInfo.format || 'unknown',
      creationMethod: documentInfo.is_digital_print ? 'digital' : 'scan',
      quality: {
        imageQuality: technicalAnalysis?.image_quality || 0.8,
        textLegibility: technicalAnalysis?.text_legibility || 0.8,
        colorAccuracy: technicalAnalysis?.color_accuracy || 0.8,
        resolution: technicalAnalysis?.resolution || 300,
        compression: technicalAnalysis?.compression || 'medium'
      },
      security: {
        watermarks: technicalAnalysis?.watermarks || false,
        securityPrinting: technicalAnalysis?.security_printing || false,
        holographicElements: technicalAnalysis?.holographic || false,
        specialInks: technicalAnalysis?.special_inks || false,
        embossing: technicalAnalysis?.embossing || false,
        microtext: technicalAnalysis?.microtext || false
      },
      metadata: {
        creationDate: technicalAnalysis?.creation_date,
        modificationDate: technicalAnalysis?.modification_date,
        software: technicalAnalysis?.software,
        device: technicalAnalysis?.device,
        gpsLocation: documentInfo.coordinates,
        suspiciousMetadata: technicalAnalysis?.suspicious_metadata || false
      }
    };
  }

  /**
   * Builds insurance-specific context
   */
  private static buildInsuranceContext(
    mapping: any,
    documentInfo: DocumentInfo
  ): InsuranceContext {
    return {
      lineOfBusiness: mapping?.lineOfBusiness || 'unknown',
      documentPurpose: this.inferDocumentPurpose(documentInfo, mapping),
      customerSegment: 'individual', // Default assumption
      expectedDocuments: this.getExpectedDocuments(mapping?.family, mapping?.context),
      complianceRequirements: this.getComplianceRequirements(mapping?.family)
    };
  }

  /**
   * Assesses fraud susceptibility
   */
  private static assessFraudSusceptibility(
    mapping: any,
    riskIndicators: RiskIndicator[],
    contentIndicators: ContentIndicator[]
  ): FraudSusceptibility {
    const criticalIndicators = riskIndicators.filter(r => r.severity === 'critical').length;
    const errorIndicators = riskIndicators.filter(r => r.severity === 'error').length;
    const highRiskContent = contentIndicators.filter(c => c.riskFactor > 0.7).length;
    
    let overallRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';
    
    if (criticalIndicators > 0 || mapping?.riskLevel === 'critical') {
      overallRisk = 'critical';
    } else if (errorIndicators > 1 || highRiskContent > 2 || mapping?.riskLevel === 'high') {
      overallRisk = 'high';
    } else if (errorIndicators > 0 || highRiskContent > 0 || mapping?.riskLevel === 'medium') {
      overallRisk = 'medium';
    }
    
    return {
      overallRisk,
      susceptibilityFactors: this.calculateSusceptibilityFactors(mapping, riskIndicators),
      historicalFraudRate: this.getHistoricalFraudRate(mapping?.family),
      commonFraudPatterns: mapping?.fraudPatterns || [],
      preventionMeasures: this.getPreventionMeasures(mapping?.family)
    };
  }

  // Helper methods
  private static calculateContentRiskFactor(type: string, match: string, text: string): number {
    // Implement risk scoring based on content type and context
    const riskFactors: Record<string, number> = {
      monetary: 0.3,
      vin: 0.5,
      license_plate: 0.4,
      policy_number: 0.6,
      claim_number: 0.7,
      date: 0.2
    };
    
    return riskFactors[type] || 0.1;
  }

  private static validateVIN(vin: string): 'valid' | 'suspect' | 'invalid' | 'unknown' {
    if (vin.length !== 17) return 'invalid';
    if (/[IOQ]/.test(vin)) return 'invalid'; // VINs don't contain I, O, or Q
    // Add more VIN validation logic here
    return 'valid';
  }

  private static isLocationSuspicious(coordinates: { latitude?: number; longitude?: number }): boolean {
    // Implement geolocation validation logic
    return false; // Placeholder
  }

  private static inferContextFromContent(indicators: ContentIndicator[]): FraudContext {
    const subscriptionKeywords = indicators.filter(i => 
      ['subscription', 'identity', 'financial'].includes(i.type)
    ).length;
    
    const claimsKeywords = indicators.filter(i => 
      ['claims', 'medical', 'monetary'].includes(i.type)
    ).length;
    
    if (claimsKeywords > subscriptionKeywords) return 'claims';
    if (subscriptionKeywords > 0) return 'subscription';
    return 'unknown';
  }

  private static calculateConfidenceScore(
    mapping: any,
    contentIndicators: ContentIndicator[],
    extractedEntities: ExtractedEntity[]
  ): number {
    let score = 0.5; // Base score
    
    if (mapping) score += 0.3; // Document type recognized
    if (contentIndicators.length > 0) score += 0.1;
    if (extractedEntities.length > 0) score += 0.1;
    
    return Math.min(score, 1.0);
  }

  private static inferWorkflowStage(indicators: ContentIndicator[]): 'onboarding' | 'renewal' | 'claim_submission' | 'claim_processing' | 'dispute' | 'unknown' {
    // Implement workflow stage inference logic
    return 'unknown';
  }

  private static calculateUrgency(riskIndicators: RiskIndicator[]): 'low' | 'medium' | 'high' | 'critical' {
    const criticalCount = riskIndicators.filter(r => r.severity === 'critical').length;
    const errorCount = riskIndicators.filter(r => r.severity === 'error').length;
    
    if (criticalCount > 0) return 'critical';
    if (errorCount > 1) return 'high';
    if (errorCount > 0) return 'medium';
    return 'low';
  }

  private static inferDocumentPurpose(documentInfo: DocumentInfo, mapping: any): string {
    return mapping?.stage || 'unknown';
  }

  private static getExpectedDocuments(family?: string, context?: FraudContext): string[] {
    const expectedDocs: Record<string, string[]> = {
      identity: ['carte_identite', 'justificatif_domicile'],
      automotive: ['carte_grise', 'permis_conduire'],
      financial: ['releve_bancaire', 'attestation_assurance']
    };
    
    return expectedDocs[family || ''] || [];
  }

  private static getComplianceRequirements(family?: string): string[] {
    const requirements: Record<string, string[]> = {
      identity: ['GDPR', 'KYC', 'Identity_Verification'],
      medical: ['HIPAA_Equivalent', 'Medical_Privacy'],
      financial: ['PCI_DSS', 'Financial_Regulations']
    };
    
    return requirements[family || ''] || ['GDPR'];
  }

  private static calculateSusceptibilityFactors(mapping: any, riskIndicators: RiskIndicator[]): Array<{ factor: string; weight: number; description: string }> {
    const factors = [];
    
    if (mapping?.riskLevel === 'critical') {
      factors.push({
        factor: 'High-value document type',
        weight: 0.8,
        description: 'Document type frequently targeted for fraud'
      });
    }
    
    if (riskIndicators.some(r => r.category === 'authenticity')) {
      factors.push({
        factor: 'Authenticity concerns',
        weight: 0.7,
        description: 'Technical indicators suggest possible document manipulation'
      });
    }
    
    return factors;
  }

  private static getHistoricalFraudRate(family?: string): number {
    const rates: Record<string, number> = {
      identity: 0.12,
      automotive: 0.18,
      financial: 0.08,
      medical: 0.15
    };
    
    return rates[family || ''] || 0.05;
  }

  private static getPreventionMeasures(family?: string): string[] {
    const measures: Record<string, string[]> = {
      identity: ['Cross-reference with official databases', 'Biometric verification', 'Document authenticity checks'],
      automotive: ['VIN validation', 'Vehicle history check', 'DMV verification'],
      financial: ['Bank verification', 'Income validation', 'Credit check'],
      medical: ['Provider verification', 'Medical history cross-check', 'Treatment validation']
    };
    
    return measures[family || ''] || ['Standard verification procedures'];
  }
}