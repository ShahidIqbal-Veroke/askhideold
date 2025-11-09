import { 
  Risque, 
  RisqueStats, 
  RisqueFilters, 
  CreateRisqueRequest, 
  UpdateRisqueRequest,
  RisqueType,
  RisqueCategory,
  RisqueLevel,
  RisqueStatus,
  RisqueSource,
  RisqueScoring,
  RisqueCorrelation,
  RisquePrediction,
  FraudRiskFactors,
  ComplianceRiskFactors,
  OperationalRiskFactors,
  FinancialRiskFactors
} from '@/types/risque.types';

// Mock data generator pour développement
const generateMockRisques = (): Risque[] => {
  const mockRisques: Risque[] = [];
  const types: RisqueType[] = [
    'fraude_documentaire', 'fraude_sinistre', 'fraude_souscription', 'compliance',
    'operationnel', 'financier', 'cyber_fraude'
  ];
  const categories: RisqueCategory[] = ['fraud', 'aml', 'operational', 'financial', 'regulatory'];
  const levels: RisqueLevel[] = ['low', 'medium', 'high', 'very_high', 'critical'];
  const statuses: RisqueStatus[] = ['detected', 'investigating', 'mitigated', 'accepted'];
  const sources: RisqueSource[] = ['document_analysis', 'behavioral_analysis', 'pattern_detection', 'ai_prediction'];
  
  for (let i = 1; i <= 30; i++) {
    const createdDate = new Date();
    createdDate.setHours(createdDate.getHours() - Math.random() * 168); // Last week
    
    const type = types[Math.floor(Math.random() * types.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const level = levels[Math.floor(Math.random() * levels.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const source = sources[Math.floor(Math.random() * sources.length)];
    
    const baseScore = Math.floor(Math.random() * 100);
    const adjustedScore = Math.max(0, Math.min(100, baseScore + (Math.random() - 0.5) * 20));
    const finalScore = Math.max(0, Math.min(100, adjustedScore + (Math.random() - 0.5) * 10));
    
    const estimatedLoss = Math.floor(Math.random() * 50000) + 1000;
    const maxLoss = estimatedLoss * (1.5 + Math.random());
    
    mockRisques.push({
      id: `RISK-2024-${String(i).padStart(4, '0')}`,
      assureId: `ASSURE-${String(Math.floor(Math.random() * 20) + 1).padStart(4, '0')}`,
      cycleVieId: Math.random() > 0.5 ? `CYCLE-${Math.floor(Math.random() * 10) + 1}` : undefined,
      historiqueId: Math.random() > 0.6 ? `HIST-2024-${String(i).padStart(4, '0')}` : undefined,
      
      type,
      category,
      level,
      status,
      source,
      
      title: generateRiskTitle(type, i),
      description: generateRiskDescription(type, category),
      shortDescription: generateShortDescription(type),
      
      scoring: {
        baseScore,
        adjustedScore,
        finalScore,
        confidence: Math.random() * 0.4 + 0.6, // 0.6-1.0
        componentScores: {
          historical: Math.floor(Math.random() * 100),
          behavioral: Math.floor(Math.random() * 100),
          contextual: Math.floor(Math.random() * 100),
          predictive: Math.floor(Math.random() * 100),
        },
        adjustmentFactors: {
          timeDecay: (Math.random() - 0.5) * 0.4, // -0.2 to 0.2
          volumeWeight: (Math.random() - 0.5) * 0.6, // -0.3 to 0.3
          complexityBonus: Math.random() * 0.3,
          industryContext: (Math.random() - 0.5) * 0.2,
          seasonality: (Math.random() - 0.5) * 0.1,
        },
        qualityMetrics: {
          dataCompleteness: Math.random() * 0.3 + 0.7, // 0.7-1.0
          dataFreshness: Math.random() * 0.4 + 0.6, // 0.6-1.0
          algorithmicCertainty: Math.random() * 0.5 + 0.5, // 0.5-1.0
          crossValidation: Math.random() * 0.6 + 0.4, // 0.4-1.0
        },
      },
      
      riskFactors: generateRiskFactors(category),
      
      potentialImpact: {
        financial: {
          estimatedLoss,
          maxLoss,
          confidence: Math.random() * 0.4 + 0.6,
        },
        operational: {
          processDisruption: level === 'critical' ? 'very_high' : level,
          resourceImpact: level,
          timeToResolve: Math.floor(Math.random() * 30) + 1,
        },
        reputational: {
          brandImpact: level,
          customerImpact: category === 'fraud' ? 'high' : 'medium',
          regulatoryImpact: category === 'regulatory' ? 'high' : 'low',
        },
        regulatory: {
          complianceViolation: category === 'regulatory' || Math.random() > 0.7,
          penaltyRisk: category === 'regulatory' ? Math.floor(Math.random() * 100000) : 0,
          reportingRequired: category === 'aml' || category === 'regulatory',
        },
      },
      
      businessContext: {
        contractIds: [`CONT-${i}`],
        policyNumbers: [`POL-${2024000 + i}`],
        sinistreNumbers: type.includes('sinistre') ? [`SIN-2024-${8800 + i}`] : undefined,
        lineOfBusiness: ['Auto', 'Habitation', 'Santé'],
        geography: ['France', 'Europe'],
        timeframe: {
          detectedAt: createdDate,
          firstOccurrence: new Date(createdDate.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          lastOccurrence: createdDate,
          frequency: Math.floor(Math.random() * 5) + 1,
        },
      },
      
      relatedEntities: {
        alerteIds: Math.random() > 0.5 ? [`ALERT-2024-${String(i).padStart(4, '0')}`] : [],
        dossierIds: status === 'investigating' ? [`CASE-2024-${String(i).padStart(4, '0')}`] : [],
        demandeIds: Math.random() > 0.7 ? [`DEM-2024-${String(i).padStart(4, '0')}`] : [],
        parentRisqueId: Math.random() > 0.8 ? `RISK-2024-${String(Math.max(1, i - 1)).padStart(4, '0')}` : undefined,
        childRisqueIds: [],
        correlatedRisqueIds: Math.random() > 0.6 ? 
          [`RISK-2024-${String(Math.min(30, i + 1)).padStart(4, '0')}`] : [],
      },
      
      evidence: {
        documents: Math.random() > 0.4 ? [{
          id: `DOC-${i}`,
          type: 'fraud_evidence',
          name: 'document_suspect.pdf',
          confidenceScore: Math.random() * 0.4 + 0.6,
          analysisResults: { fraud_score: finalScore },
        }] : [],
        dataPoints: [{
          source: 'fraud_detection_system',
          type: 'behavioral_anomaly',
          value: { anomaly_score: Math.random() * 100 },
          reliability: Math.random() * 0.3 + 0.7,
          timestamp: createdDate,
        }],
        patterns: Math.random() > 0.5 ? [{
          type: 'frequency_pattern',
          description: 'Fréquence inhabituelle de sinistres',
          strength: Math.random() * 0.4 + 0.6,
          supportingEvents: [`HIST-${i}-1`, `HIST-${i}-2`],
        }] : [],
      },
      
      mitigation: {
        recommendedActions: generateRecommendedActions(type, level),
        implementedActions: status === 'mitigated' ? [{
          action: 'Vérification manuelle documents',
          implementedBy: 'V. Dubois',
          implementedAt: new Date(createdDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000),
          actualEffort: Math.floor(Math.random() * 8) + 2,
          actualCost: Math.floor(Math.random() * 500) + 100,
          effectiveness: Math.random() * 0.4 + 0.6,
          notes: 'Action complétée avec succès',
        }] : [],
        residualRisk: {
          level: status === 'mitigated' ? 
            (level === 'critical' ? 'high' : level === 'very_high' ? 'medium' : 'low') : level,
          score: status === 'mitigated' ? Math.floor(finalScore * 0.3) : finalScore,
          acceptanceRequired: level === 'critical' || level === 'very_high',
          acceptedBy: status === 'accepted' ? 'M. Supervisor' : undefined,
          acceptedAt: status === 'accepted' ? new Date() : undefined,
          reviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      },
      
      monitoring: {
        isActive: status !== 'closed',
        thresholds: {
          scoreIncrease: 10,
          frequencyIncrease: 2,
          newEvidenceWeight: 0.3,
        },
        alerts: [],
        nextReview: new Date(Date.now() + Math.floor(Math.random() * 14 + 7) * 24 * 60 * 60 * 1000),
        reviewFrequency: level === 'critical' ? 7 : level === 'very_high' ? 14 : 30,
      },
      
      predictions: {
        evolutionTrend: ['increasing', 'stable', 'decreasing'][Math.floor(Math.random() * 3)] as any,
        escalationProbability: Math.random(),
        timeToEscalation: Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 1 : undefined,
        similarCases: [],
        recommendedModels: ['fraud_detection_v2', 'behavioral_analysis'],
      },
      
      createdAt: createdDate,
      createdBy: 'system',
      updatedAt: createdDate,
      lastReviewAt: Math.random() > 0.5 ? 
        new Date(createdDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined,
      lastReviewBy: Math.random() > 0.5 ? 'V. Dubois' : undefined,
      
      version: 1,
      scoreHistory: [{
        timestamp: createdDate,
        score: finalScore,
        level,
        reason: 'Création initiale du risque',
        triggeredBy: 'system',
      }],
      
      metadata: {
        industry: 'assurance',
        segment: ['particulier', 'professionnel'][Math.floor(Math.random() * 2)],
        tags: [type, category, `level_${level}`],
        customFields: {},
      },
      
      workflow: {
        requiresApproval: level === 'critical' || level === 'very_high',
        approvedBy: (level === 'critical' || level === 'very_high') && Math.random() > 0.5 ? 'P. Manager' : undefined,
        approvedAt: (level === 'critical' || level === 'very_high') && Math.random() > 0.5 ? 
          new Date(createdDate.getTime() + Math.random() * 24 * 60 * 60 * 1000) : undefined,
        closedBy: status === 'closed' ? 'V. Dubois' : undefined,
        closedAt: status === 'closed' ? 
          new Date(createdDate.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000) : undefined,
        closureReason: status === 'closed' ? 'Faux positif après investigation' : undefined,
      },
    });
  }
  
  return mockRisques.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

// Helper functions for mock data generation
function generateRiskTitle(type: RisqueType, index: number): string {
  const titles = {
    fraude_documentaire: `Suspicion fraude documentaire - Dossier ${index}`,
    fraude_sinistre: `Fraude potentielle sinistre SIN-2024-${8800 + index}`,
    fraude_souscription: `Anomalies souscription contrat POL-${2024000 + index}`,
    compliance: `Non-conformité réglementaire détectée`,
    operationnel: `Risque opérationnel - Processus défaillant`,
    financier: `Risque financier - Exposition importante`,
    cyber_fraude: `Tentative cyberattaque détectée`,
  };
  return titles[type] || `Risque ${type} détecté`;
}

function generateRiskDescription(type: RisqueType, category: RisqueCategory): string {
  const descriptions = {
    fraude_documentaire: 'Détection d\'incohérences dans les documents fournis, suggérant une possible falsification',
    fraude_sinistre: 'Analyse comportementale révèle des patterns suspects dans la déclaration de sinistre',
    fraude_souscription: 'Informations contradictoires dans le processus de souscription',
    compliance: 'Écart détecté par rapport aux exigences réglementaires en vigueur',
    operationnel: 'Défaillance identifiée dans les processus opérationnels',
    financier: 'Exposition financière dépassant les seuils de tolérance',
    cyber_fraude: 'Activité suspecte détectée par les systèmes de sécurité',
  };
  return descriptions[type] || `Risque de catégorie ${category} identifié`;
}

function generateShortDescription(type: RisqueType): string {
  const short = {
    fraude_documentaire: 'Document suspect',
    fraude_sinistre: 'Sinistre frauduleux',
    fraude_souscription: 'Souscription douteuse',
    compliance: 'Non-conformité',
    operationnel: 'Défaillance process',
    financier: 'Risque financier',
    cyber_fraude: 'Cyberattaque',
  };
  return short[type] || 'Risque détecté';
}

function generateRiskFactors(category: RisqueCategory): any {
  switch (category) {
    case 'fraud':
      return {
        fraud: {
          documentInconsistencies: Math.floor(Math.random() * 100),
          identityVerificationIssues: Math.floor(Math.random() * 100),
          behavioralAnomalies: Math.floor(Math.random() * 100),
          networkConnections: Math.floor(Math.random() * 100),
          frequencyPatterns: Math.floor(Math.random() * 100),
          amountAnomalies: Math.floor(Math.random() * 100),
          geographicAnomalies: Math.floor(Math.random() * 100),
          temporalAnomalies: Math.floor(Math.random() * 100),
        } as FraudRiskFactors
      };
    case 'aml':
      return {
        compliance: {
          kycCompleteness: Math.floor(Math.random() * 100),
          amlScreening: Math.floor(Math.random() * 100),
          sanctionsCheck: Math.floor(Math.random() * 100),
          pepExposure: Math.floor(Math.random() * 100),
          regulatoryCompliance: Math.floor(Math.random() * 100),
          dataQuality: Math.floor(Math.random() * 100),
        } as ComplianceRiskFactors
      };
    case 'operational':
      return {
        operational: {
          processDeviation: Math.floor(Math.random() * 100),
          systemReliability: Math.floor(Math.random() * 100),
          humanError: Math.floor(Math.random() * 100),
          dataIntegrity: Math.floor(Math.random() * 100),
          controlEffectiveness: Math.floor(Math.random() * 100),
        } as OperationalRiskFactors
      };
    case 'financial':
      return {
        financial: {
          creditRisk: Math.floor(Math.random() * 100),
          liquidityRisk: Math.floor(Math.random() * 100),
          concentrationRisk: Math.floor(Math.random() * 100),
          marketRisk: Math.floor(Math.random() * 100),
          counterpartyRisk: Math.floor(Math.random() * 100),
        } as FinancialRiskFactors
      };
    default:
      return {};
  }
}

function generateRecommendedActions(type: RisqueType, level: RisqueLevel): any[] {
  const baseActions = [
    {
      action: 'Vérification manuelle approfondie',
      priority: 'high' as const,
      estimatedEffort: 4,
      estimatedCost: 200,
      expectedReduction: 60,
      responsible: 'Expert Fraude',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      action: 'Audit des documents',
      priority: 'medium' as const,
      estimatedEffort: 2,
      estimatedCost: 100,
      expectedReduction: 30,
      responsible: 'Gestionnaire',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }
  ];

  if (level === 'critical' || level === 'very_high') {
    baseActions.push({
      action: 'Escalade direction',
      priority: 'urgent' as const,
      estimatedEffort: 1,
      estimatedCost: 50,
      expectedReduction: 80,
      responsible: 'Superviseur',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
  }

  return baseActions;
}

class RisqueService {
  private risques: Risque[] = [];
  private correlations: RisqueCorrelation[] = [];
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (!this.initialized) {
      this.risques = generateMockRisques();
      this.initialized = true;
    }
  }

  // === DÉTECTION AUTOMATIQUE DE RISQUES ===

  async detectRiskFromAlert(alertId: string, assureId: string): Promise<string | null> {
    // Logique simplifiée de détection de risque depuis une alerte
    const riskId = `RISK-${Date.now()}`;
    
    const newRisk: Risque = {
      id: riskId,
      assureId,
      
      type: 'fraude_documentaire',
      category: 'fraud',
      level: 'medium',
      status: 'detected',
      source: 'document_analysis',
      
      title: `Risque fraude documentaire détecté`,
      description: `Risque généré automatiquement suite à l'alerte ${alertId}`,
      shortDescription: 'Fraude documentaire',
      
      scoring: this.calculateInitialScoring(),
      riskFactors: {
        fraud: {
          documentInconsistencies: 75,
          identityVerificationIssues: 30,
          behavioralAnomalies: 45,
          networkConnections: 20,
          frequencyPatterns: 60,
          amountAnomalies: 55,
          geographicAnomalies: 25,
          temporalAnomalies: 40,
        }
      },
      
      potentialImpact: {
        financial: {
          estimatedLoss: 5000,
          maxLoss: 8000,
          confidence: 0.7,
        },
        operational: {
          processDisruption: 'medium',
          resourceImpact: 'medium',
          timeToResolve: 5,
        },
        reputational: {
          brandImpact: 'low',
          customerImpact: 'medium',
          regulatoryImpact: 'low',
        },
        regulatory: {
          complianceViolation: false,
          penaltyRisk: 0,
          reportingRequired: false,
        },
      },
      
      businessContext: {
        contractIds: [],
        policyNumbers: [],
        lineOfBusiness: ['Auto'],
        geography: ['France'],
        timeframe: {
          detectedAt: new Date(),
          frequency: 1,
        },
      },
      
      relatedEntities: {
        alerteIds: [alertId],
        dossierIds: [],
        demandeIds: [],
        parentRisqueId: undefined,
        childRisqueIds: [],
        correlatedRisqueIds: [],
      },
      
      evidence: {
        documents: [],
        dataPoints: [{
          source: 'fraud_detection',
          type: 'alert_trigger',
          value: { alertId },
          reliability: 0.8,
          timestamp: new Date(),
        }],
        patterns: [],
      },
      
      mitigation: {
        recommendedActions: generateRecommendedActions('fraude_documentaire', 'medium'),
        implementedActions: [],
        residualRisk: {
          level: 'medium',
          score: 65,
          acceptanceRequired: false,
          reviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
      
      monitoring: {
        isActive: true,
        thresholds: {
          scoreIncrease: 10,
          frequencyIncrease: 2,
          newEvidenceWeight: 0.3,
        },
        alerts: [],
        nextReview: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        reviewFrequency: 7,
      },
      
      predictions: {
        evolutionTrend: 'stable',
        escalationProbability: 0.3,
        similarCases: [],
        recommendedModels: ['fraud_detection_v2'],
      },
      
      createdAt: new Date(),
      createdBy: 'system',
      updatedAt: new Date(),
      
      version: 1,
      scoreHistory: [{
        timestamp: new Date(),
        score: 65,
        level: 'medium',
        reason: 'Détection initiale depuis alerte',
        triggeredBy: 'system',
      }],
      
      metadata: {
        industry: 'assurance',
        tags: ['auto_detected', 'document_fraud'],
        customFields: { sourceAlert: alertId },
      },
      
      workflow: {
        requiresApproval: false,
      },
    };
    
    this.risques.unshift(newRisk);
    console.log(`✅ Risque ${riskId} créé automatiquement depuis alerte ${alertId}`);
    
    return riskId;
  }

  // === CRUD OPERATIONS ===

  async createRisque(request: CreateRisqueRequest, userId: string): Promise<Risque> {
    const newRisque: Risque = {
      id: `RISK-${Date.now()}`,
      assureId: request.assureId,
      cycleVieId: request.cycleVieId,
      historiqueId: request.historiqueId,
      
      type: request.type,
      category: request.category,
      level: this.calculateLevelFromScore(request.initialScore || 50),
      status: 'detected',
      source: request.source,
      
      title: request.title,
      description: request.description,
      shortDescription: request.title.substring(0, 50),
      
      scoring: this.calculateScoring(request.initialScore || 50),
      riskFactors: request.riskFactors || {},
      
      potentialImpact: this.calculatePotentialImpact(request.type, request.initialScore || 50),
      businessContext: request.businessContext || {
        contractIds: [],
        policyNumbers: [],
        lineOfBusiness: [],
        geography: [],
        timeframe: {
          detectedAt: new Date(),
          frequency: 1,
        },
      },
      
      relatedEntities: {
        alerteIds: [],
        dossierIds: [],
        demandeIds: [],
        parentRisqueId: undefined,
        childRisqueIds: [],
        correlatedRisqueIds: [],
      },
      
      evidence: request.evidence || {
        documents: [],
        dataPoints: [],
        patterns: [],
      },
      
      mitigation: {
        recommendedActions: generateRecommendedActions(request.type, this.calculateLevelFromScore(request.initialScore || 50)),
        implementedActions: [],
        residualRisk: {
          level: this.calculateLevelFromScore(request.initialScore || 50),
          score: request.initialScore || 50,
          acceptanceRequired: false,
          reviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
      
      monitoring: {
        isActive: true,
        thresholds: {
          scoreIncrease: 10,
          frequencyIncrease: 2,
          newEvidenceWeight: 0.3,
        },
        alerts: [],
        nextReview: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        reviewFrequency: 14,
      },
      
      predictions: {
        evolutionTrend: 'stable',
        escalationProbability: 0.2,
        similarCases: [],
        recommendedModels: [],
      },
      
      createdAt: new Date(),
      createdBy: userId,
      updatedAt: new Date(),
      
      version: 1,
      scoreHistory: [{
        timestamp: new Date(),
        score: request.initialScore || 50,
        level: this.calculateLevelFromScore(request.initialScore || 50),
        reason: 'Création manuelle du risque',
        triggeredBy: userId,
      }],
      
      metadata: request.metadata || {
        tags: [],
        customFields: {},
      },
      
      workflow: {
        requiresApproval: this.calculateLevelFromScore(request.initialScore || 50) === 'critical',
      },
    };

    this.risques.unshift(newRisque);
    return newRisque;
  }

  async getRisques(filters?: RisqueFilters): Promise<Risque[]> {
    let filtered = [...this.risques];

    if (filters) {
      if (filters.assureId) {
        filtered = filtered.filter(r => r.assureId === filters.assureId);
      }
      if (filters.types) {
        filtered = filtered.filter(r => filters.types!.includes(r.type));
      }
      if (filters.categories) {
        filtered = filtered.filter(r => filters.categories!.includes(r.category));
      }
      if (filters.levels) {
        filtered = filtered.filter(r => filters.levels!.includes(r.level));
      }
      if (filters.statuses) {
        filtered = filtered.filter(r => filters.statuses!.includes(r.status));
      }
      if (filters.sources) {
        filtered = filtered.filter(r => filters.sources!.includes(r.source));
      }
      if (filters.minScore !== undefined) {
        filtered = filtered.filter(r => r.scoring.finalScore >= filters.minScore!);
      }
      if (filters.maxScore !== undefined) {
        filtered = filtered.filter(r => r.scoring.finalScore <= filters.maxScore!);
      }
      if (filters.minConfidence !== undefined) {
        filtered = filtered.filter(r => r.scoring.confidence >= filters.minConfidence!);
      }
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(r => 
          r.title.toLowerCase().includes(term) ||
          r.description.toLowerCase().includes(term)
        );
      }
    }

    return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getRisque(id: string): Promise<Risque | null> {
    return this.risques.find(r => r.id === id) || null;
  }

  async updateRisque(request: UpdateRisqueRequest, userId: string): Promise<Risque | null> {
    const risqueIndex = this.risques.findIndex(r => r.id === request.risqueId);
    if (risqueIndex === -1) return null;

    const existingRisque = this.risques[risqueIndex];
    const now = new Date();

    // Update score history if score changed
    const newScore = request.updateScoring?.finalScore;
    if (newScore && newScore !== existingRisque.scoring.finalScore) {
      existingRisque.scoreHistory.push({
        timestamp: now,
        score: newScore,
        level: this.calculateLevelFromScore(newScore),
        reason: 'Mise à jour manuelle du score',
        triggeredBy: userId,
      });
    }

    const updatedRisque: Risque = {
      ...existingRisque,
      level: request.newLevel || existingRisque.level,
      status: request.newStatus || existingRisque.status,
      scoring: request.updateScoring ? 
        { ...existingRisque.scoring, ...request.updateScoring } : 
        existingRisque.scoring,
      evidence: request.addEvidence ? {
        ...existingRisque.evidence,
        documents: request.addEvidence.document ? 
          [...existingRisque.evidence.documents, request.addEvidence.document] : 
          existingRisque.evidence.documents,
        dataPoints: request.addEvidence.dataPoint ? 
          [...existingRisque.evidence.dataPoints, request.addEvidence.dataPoint] : 
          existingRisque.evidence.dataPoints,
      } : existingRisque.evidence,
      mitigation: request.addMitigationAction ? {
        ...existingRisque.mitigation,
        recommendedActions: [...existingRisque.mitigation.recommendedActions, request.addMitigationAction],
      } : request.implementAction ? {
        ...existingRisque.mitigation,
        implementedActions: [...existingRisque.mitigation.implementedActions, {
          action: request.implementAction.actionId,
          implementedBy: request.implementAction.implementedBy,
          implementedAt: now,
          actualEffort: request.implementAction.actualEffort,
          actualCost: request.implementAction.actualCost,
          effectiveness: request.implementAction.effectiveness,
          notes: request.implementAction.notes,
        }],
      } : existingRisque.mitigation,
      monitoring: request.updateMonitoring ? 
        { ...existingRisque.monitoring, ...request.updateMonitoring } : 
        existingRisque.monitoring,
      updatedAt: now,
      version: existingRisque.version + 1,
    };

    this.risques[risqueIndex] = updatedRisque;
    return updatedRisque;
  }

  // === SCORING ET CALCULS ===

  private calculateInitialScoring(): RisqueScoring {
    const baseScore = 65;
    const adjustedScore = 68;
    const finalScore = 70;

    return {
      baseScore,
      adjustedScore,
      finalScore,
      confidence: 0.8,
      componentScores: {
        historical: 60,
        behavioral: 75,
        contextual: 70,
        predictive: 65,
      },
      adjustmentFactors: {
        timeDecay: -0.1,
        volumeWeight: 0.2,
        complexityBonus: 0.15,
        industryContext: 0.05,
        seasonality: 0.0,
      },
      qualityMetrics: {
        dataCompleteness: 0.9,
        dataFreshness: 0.8,
        algorithmicCertainty: 0.85,
        crossValidation: 0.75,
      },
    };
  }

  private calculateScoring(initialScore: number): RisqueScoring {
    const baseScore = initialScore;
    const adjustedScore = Math.max(0, Math.min(100, baseScore + (Math.random() - 0.5) * 10));
    const finalScore = Math.max(0, Math.min(100, adjustedScore + (Math.random() - 0.5) * 5));

    return {
      baseScore,
      adjustedScore,
      finalScore,
      confidence: Math.random() * 0.3 + 0.7,
      componentScores: {
        historical: Math.floor(Math.random() * 100),
        behavioral: Math.floor(Math.random() * 100),
        contextual: Math.floor(Math.random() * 100),
        predictive: Math.floor(Math.random() * 100),
      },
      adjustmentFactors: {
        timeDecay: (Math.random() - 0.5) * 0.4,
        volumeWeight: (Math.random() - 0.5) * 0.6,
        complexityBonus: Math.random() * 0.3,
        industryContext: (Math.random() - 0.5) * 0.2,
        seasonality: (Math.random() - 0.5) * 0.1,
      },
      qualityMetrics: {
        dataCompleteness: Math.random() * 0.3 + 0.7,
        dataFreshness: Math.random() * 0.4 + 0.6,
        algorithmicCertainty: Math.random() * 0.5 + 0.5,
        crossValidation: Math.random() * 0.6 + 0.4,
      },
    };
  }

  private calculateLevelFromScore(score: number): RisqueLevel {
    if (score >= 90) return 'critical';
    if (score >= 75) return 'very_high';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    if (score >= 20) return 'low';
    return 'very_low';
  }

  private calculatePotentialImpact(type: RisqueType, score: number): any {
    const baseLoss = score * 100; // Simplified calculation
    return {
      financial: {
        estimatedLoss: baseLoss,
        maxLoss: baseLoss * 1.5,
        confidence: 0.7,
      },
      operational: {
        processDisruption: this.calculateLevelFromScore(score),
        resourceImpact: this.calculateLevelFromScore(score),
        timeToResolve: Math.max(1, Math.floor(score / 10)),
      },
      reputational: {
        brandImpact: type.includes('fraude') ? 'high' : 'medium',
        customerImpact: 'medium',
        regulatoryImpact: type === 'compliance' ? 'high' : 'low',
      },
      regulatory: {
        complianceViolation: type === 'compliance',
        penaltyRisk: type === 'compliance' ? baseLoss * 2 : 0,
        reportingRequired: type === 'compliance' || type === 'blanchiment',
      },
    };
  }

  // === STATISTICS ===

  async getStats(): Promise<RisqueStats> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const scores = this.risques.map(r => r.scoring.finalScore).sort((a, b) => a - b);
    
    const stats: RisqueStats = {
      total: this.risques.length,
      byType: {} as any,
      byCategory: {} as any,
      byLevel: {} as any,
      byStatus: {} as any,
      
      scoreDistribution: {
        ranges: [
          { min: 0, max: 20, count: scores.filter(s => s < 20).length },
          { min: 20, max: 40, count: scores.filter(s => s >= 20 && s < 40).length },
          { min: 40, max: 60, count: scores.filter(s => s >= 40 && s < 60).length },
          { min: 60, max: 80, count: scores.filter(s => s >= 60 && s < 80).length },
          { min: 80, max: 100, count: scores.filter(s => s >= 80).length },
        ],
        average: scores.reduce((sum, s) => sum + s, 0) / scores.length,
        median: scores[Math.floor(scores.length / 2)],
        percentile95: scores[Math.floor(scores.length * 0.95)],
      },
      
      newRisksThisMonth: this.risques.filter(r => r.createdAt >= monthStart).length,
      escalatedRisks: this.risques.filter(r => r.workflow.escalatedTo).length,
      mitigatedRisks: this.risques.filter(r => r.status === 'mitigated').length,
      overdueReviews: this.risques.filter(r => 
        r.monitoring.nextReview < now && r.status !== 'closed'
      ).length,
      
      mitigationEffectiveness: {
        averageReduction: 45, // Mock value
        timeToMitigation: 5, // Mock value in days
        costBenefit: 3.2, // Mock ratio
      },
      
      trends: {
        scoreEvolution: [], // TODO: Implement based on score history
        emergingPatterns: ['Fraude documentaire en hausse', 'Cyber-menaces émergentes'],
        topRiskFactors: [
          { factor: 'Document inconsistencies', impact: 75, frequency: 15 },
          { factor: 'Behavioral anomalies', impact: 68, frequency: 12 },
        ],
      },
    };

    // Fill counters
    this.risques.forEach(risque => {
      stats.byType[risque.type] = (stats.byType[risque.type] || 0) + 1;
      stats.byCategory[risque.category] = (stats.byCategory[risque.category] || 0) + 1;
      stats.byLevel[risque.level] = (stats.byLevel[risque.level] || 0) + 1;
      stats.byStatus[risque.status] = (stats.byStatus[risque.status] || 0) + 1;
    });

    return stats;
  }

  // === CORRELATION DETECTION ===

  async detectCorrelations(assureId: string): Promise<RisqueCorrelation[]> {
    const assureRisks = await this.getRisques({ assureId });
    const correlations: RisqueCorrelation[] = [];
    
    // Simple correlation detection based on timing and types
    for (let i = 0; i < assureRisks.length; i++) {
      for (let j = i + 1; j < assureRisks.length; j++) {
        const risk1 = assureRisks[i];
        const risk2 = assureRisks[j];
        
        const timeDiff = Math.abs(risk1.createdAt.getTime() - risk2.createdAt.getTime());
        const daysDiff = timeDiff / (24 * 60 * 60 * 1000);
        
        // Correlate if created within 7 days and similar types
        if (daysDiff <= 7 && risk1.category === risk2.category) {
          correlations.push({
            id: `CORR-${Date.now()}-${i}-${j}`,
            primaryRisqueId: risk1.id,
            correlatedRisqueIds: [risk2.id],
            correlationType: 'temporal',
            strength: Math.max(0.3, 1 - (daysDiff / 7)),
            confidence: 0.7,
            analysis: {
              pattern: `Risks of type ${risk1.category} occurring within ${Math.floor(daysDiff)} days`,
              timelag: Math.floor(daysDiff),
              conditions: [`Same category: ${risk1.category}`],
              exceptions: [],
            },
            impact: {
              amplificationFactor: 1.3,
              cascadeRisk: true,
              systemicRisk: false,
            },
            detectedAt: new Date(),
          });
        }
      }
    }
    
    return correlations;
  }
}

// Export singleton instance
export const risqueService = new RisqueService();