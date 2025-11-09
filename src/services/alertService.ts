import { Alert, AlertFilters, AlertStats, AlertAssignment, AlertQualificationRequest, AlertSource, AlertStatus } from '@/types/alert.types';
import { FraudAnalysisResult } from './fraudDetectionService';
import { FraudTypologyService } from './fraudTypologyService';
import { ROICalculationService } from './roiCalculationService';
import { assureService } from './assureService';
import { historiqueService } from './historiqueService';
import { risqueService } from './risqueService';
import { fraudCatalogService } from './fraudCatalogService';
import { intelligentRoutingService } from './intelligentRoutingService';
import { FraudCitySource, BusinessDistrict } from '@/types/fraud-catalog.types';
import { 
  InsuranceAlert, 
  FraudContext, 
  InsuranceLineOfBusiness, 
  ROIContext,
  InsuranceFraudType 
} from '@/types/insurance-fraud.types';
import { AssureAlertLink } from '@/types/assure.types';
import { Evenement } from '@/types/event.types';

// AlertService no longer generates mock alerts - they come from demoData.ts

class AlertService {
  private alerts: Alert[] = [];
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (!this.initialized) {
      // AlertService NO LONGER generates alerts - they come from demoData.ts only
      this.alerts = [];
      console.log(`📥 AlertService initialized - alerts managed by demoData.ts`);
      this.initialized = true;
    }
  }

  // NOUVEAU : Create alert with Catalog Classification + Intelligent Routing
  async createFromFraudAnalysis(
    result: FraudAnalysisResult, 
    fileName: string, 
    userId: string,
    claimAmount?: number,
    customerPremium?: number
  ): Promise<{
    alert: Alert;
    insuranceAlert: InsuranceAlert;
    roiContext: ROIContext;
    assureLink?: AssureAlertLink;
    catalogClassification?: any;
    routingResult?: any;
  }> {
    // Analyze business fraud using insurance typology mapping
    const insuranceAlert = FraudTypologyService.analyzeBusinessFraud(result, fileName);

    // Calculate ROI based on primary fraud type and context
    const primaryFraudType = insuranceAlert.fraudTypology[0]?.insuranceFraudType || InsuranceFraudType.DOCUMENT_FALSIFIE;
    const fraudContext = insuranceAlert.fraudTypology[0]?.context || FraudContext.SINISTRE;
    const lineOfBusiness = insuranceAlert.lineOfBusiness;
    const detectedAmount = claimAmount || insuranceAlert.estimatedLoss;
    const investigationComplexity = insuranceAlert.fraudTypology[0]?.investigationComplexity || 'medium';

    const roiContext = ROICalculationService.calculateROI(
      primaryFraudType,
      fraudContext,
      lineOfBusiness,
      detectedAmount,
      investigationComplexity
    );

    // === NOUVEAU : CLASSIFICATION VIA CATALOGUE ===
    // 1. Déterminer source Ville et quartier métier
    const fraud_city_source = this.determineCitySource(result, fileName);
    const business_district = this.determineBusinessDistrict(lineOfBusiness, fileName);
    
    // 2. Classification automatique via catalogue
    const catalogClassification = await fraudCatalogService.classifyAndCreateAlert(
      fraud_city_source,
      business_district,
      result,
      insuranceAlert.confidenceLevel,
      Math.round(result.risk_score * 100)
    );

    console.log(`🎯 Classification catalogue: ${catalogClassification.classification.catalog_id} (${Math.round(catalogClassification.classification.confidence * 100)}%)`);

    // === NOUVEAU : ROUTAGE INTELLIGENT PRÉLIMINAIRE ===
    const preliminaryAlert: Partial<Alert> = {
      fraud_city_source,
      business_district,
      severity: this.calculateInsuranceSeverity(result.risk_score * 100, insuranceAlert),
      score: Math.round(result.risk_score * 100),
      confidence: insuranceAlert.confidenceLevel,
      metadata: {
        fraud_city_source,
        business_district,
        catalog_classification: catalogClassification.classification
      }
    } as Partial<Alert>;

    const routingResult = await intelligentRoutingService.routeAlert(preliminaryAlert as Alert);

    // === CRÉATION ALERTE ENRICHIE ===
    const alert: Alert = {
      id: `ALERT-${Date.now()}`,
      event_id: `EVT-PENDING-${Date.now()}`, // Will be replaced when created from actual event
      historique_id: `HIST-PENDING-${Date.now()}`, // Will be replaced when created from actual event
      source: 'document_analysis',
      sourceModule: 'fraud-detection-service',
      detection_module: 'document-ai-analysis',
      type: this.mapInsuranceFraudTypeToAlertType(primaryFraudType, fraudContext),
      severity: this.calculateInsuranceSeverity(result.risk_score * 100, insuranceAlert),
      score: Math.round(result.risk_score * 100),
      confidence: insuranceAlert.confidenceLevel,
      impacts_risk: false, // Only true when qualified as fraud_confirmed
      
      // === ARCHITECTURE DÉCLOISONNÉE INTÉGRÉE ===
      fraud_city_source: fraud_city_source,
      business_district: business_district,
      fraud_catalog_id: catalogClassification.applicable_catalog?.id,
      playbook_assigned: !!catalogClassification.applicable_catalog,
      
      // === GOUVERNANCE AUTOMATIQUE ===
      governance: {
        rule_triggered: catalogClassification.classification.triggered_rules[0]?.name || 'manual_classification',
        sla_deadline: new Date(Date.now() + routingResult.sla_hours * 60 * 60 * 1000),
        escalation_level: routingResult.requires_approval ? 1 : 0,
        audit_requirements: catalogClassification.applicable_catalog?.governance.regulatory_framework || ['standard_audit'],
        specialized_team_required: routingResult.assigned_team
      },
      detection_data: {
        patterns_matched: result.key_findings.map(f => f.code),
        anomaly_scores: result.risk_buckets.reduce((acc, bucket) => {
          acc[bucket.name] = bucket.score;
          return acc;
        }, {} as Record<string, number>),
        ml_predictions: result
      },
      metadata: {
        // Business context
        businessContext: this.mapFraudContextToBusinessContext(fraudContext),
        documentFamily: this.mapLineOfBusinessToDocumentFamily(lineOfBusiness),
        workflowStage: this.mapBusinessContextToWorkflowStage(insuranceAlert.businessContext),
        urgencyLevel: insuranceAlert.urgencyLevel,
        
        // Original fields enhanced
        sinisterNumber: insuranceAlert.policyInfo?.claimInfo?.claimNumber || this.extractSinisterNumber(result),
        policyNumber: insuranceAlert.policyInfo?.policyNumber,
        insuredName: insuranceAlert.policyInfo?.insuredName,
        documentType: this.getDocumentTypeFromContext(insuranceAlert.businessContext),
        
        // Fraud analysis
        primaryFraudType: this.formatInsuranceFraudType(primaryFraudType),
        fraudTypes: insuranceAlert.fraudTypology.map(ft => this.formatInsuranceFraudType(ft.insuranceFraudType)),
        businessImpact: this.calculateBusinessImpactLevel(insuranceAlert.fraudTypology),
        riskFactors: result.risk_buckets.map(b => b.name),
        
        // Financial impact
        estimatedLoss: insuranceAlert.estimatedLoss,
        preventedAmount: roiContext.totalROI > 0 ? roiContext.totalROI : insuranceAlert.estimatedLoss,
        directROI: roiContext.totalROI,
        riskAdjustedROI: roiContext.roiRatio,
        
        // Technical evidence - Enhanced with detailed descriptions
        technicalEvidence: result.key_findings.map(finding => ({
          code: finding.code,
          message: this.enhanceTechnicalMessage(finding.code, finding.message),
          severity: finding.level === 'fail' ? 'fail' : finding.level === 'warn' ? 'warn' : 'info',
          confidence: finding.confidence
        })),
        
        // Classification insights
        contentIndicators: insuranceAlert.fraudTypology.length,
        extractedEntities: insuranceAlert.policyInfo ? 5 : 2, // Mock based on policy info availability
        riskIndicators: result.risk_buckets.length,
        
        // Legacy fields for compatibility
        amount: detectedAmount,
        fileName: fileName,
        
        // === ENRICHISSEMENT CATALOGUE ===
        fraud_city_source: fraud_city_source,
        business_district: business_district,
        catalog_classification: catalogClassification.classification
      },
      status: 'pending',
      
      // === ASSIGNATION AUTOMATIQUE ===
      assignedTo: routingResult.estimated_complexity === 'critical' ? undefined : 'auto_assigned',
      team: routingResult.assigned_team,
      
      rawData: {
        originalResult: result,
        insuranceAlert,
        roiContext,
        catalogClassification: catalogClassification,
        routingResult: routingResult
      },
      createdAt: new Date(),
      createdBy: userId,
      updatedAt: new Date(),
    };

    this.alerts.unshift(alert);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      const { db } = await import('../lib/localStorage');
      db.create('alerts', alert);
    }
    
    // === NOUVEAU: ENRICHISSEMENT AUTOMATIQUE ASSURÉ ===
    // Tentative de liaison automatique avec un assuré existant
    let assureLink: AssureAlertLink | undefined;
    try {
      assureLink = await assureService.enrichAssureFromAlert(alert) || undefined;
      
      // Si trouvé, enrichir les métadonnées de l'alerte
      if (assureLink) {
        alert.metadata.assureId = assureLink.assureId;
        alert.metadata.assureLinkConfidence = assureLink.confidence;
        alert.metadata.cycleVieStage = assureLink.cycleVieStage;
        
        console.log(`✅ Alerte ${alert.id} liée automatiquement à l'assuré ${assureLink.assureId} (confiance: ${Math.round(assureLink.confidence * 100)}%)`);
      } else {
        console.log(`⚠️ Aucun assuré trouvé pour l'alerte ${alert.id} - Assuré potentiellement nouveau`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'enrichissement assuré:', error);
    }
    
    console.log(`✅ Alerte créée avec architecture décloisonnée: ${alert.id}`);
    console.log(`   └─ Ville: ${fraud_city_source} | Quartier: ${business_district}`);
    console.log(`   └─ Équipe: ${routingResult.assigned_team} | SLA: ${routingResult.sla_hours}h`);
    
    return {
      alert,
      insuranceAlert,
      roiContext,
      assureLink,
      catalogClassification: catalogClassification,
      routingResult: routingResult
    };
  }

  // EVENT-DRIVEN: Create alert from event processing
  async createAlertFromEvent(
    event: Evenement,
    historiqueId: string,
    detectionData: {
      source: AlertSource;
      module: string;
      score: number;
      confidence: number;
      patterns?: string[];
      fraudTypes?: string[];
    }
  ): Promise<Alert> {
    const alert: Alert = {
      id: `ALERT-${Date.now()}`,
      event_id: event.id,
      historique_id: historiqueId,
      source: detectionData.source,
      sourceModule: detectionData.module,
      detection_module: detectionData.module,
      type: this.mapEventTypeToAlertType(event.type),
      severity: this.calculateSeverityFromScore(detectionData.score),
      score: detectionData.score,
      confidence: detectionData.confidence,
      impacts_risk: false, // Only true when qualified as fraud_confirmed
      detection_data: {
        patterns_matched: detectionData.patterns || [],
        anomaly_scores: { combined: detectionData.score },
        event_type: event.type,
        event_category: event.category
      },
      metadata: {
        // Person ID derived from event, not direct link
        assureId: event.assure_id,
        event_type: event.type,
        sinisterNumber: event.data.sinisterNumber,
        policyNumber: event.data.policyNumber,
        amount: event.data.amount,
        documentType: event.data.documentType,
        fraudTypes: detectionData.fraudTypes || [],
        cycleVieStage: event.cycle_vie_id ? 'active' : 'unknown'
      },
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      rawData: { event, detectionData }
    };
    
    // Add to alerts array
    this.alerts.unshift(alert);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      const { db } = await import('../lib/localStorage');
      db.create('alerts', alert);
    }
    
    return alert;
  }
  
  // Helper: Map event type to alert type
  private mapEventTypeToAlertType(eventType: string): string {
    switch (eventType) {
      case 'document_upload': return 'document_analysis';
      case 'declaration_sinistre': return 'claim_anomaly';
      case 'modification_contrat': return 'contract_change_suspect';
      case 'paiement': return 'payment_anomaly';
      default: return 'generic_anomaly';
    }
  }
  
  // Helper: Calculate severity from score
  private calculateSeverityFromScore(score: number): Alert['severity'] {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  // Get alerts with filters
  async getAlerts(filters?: AlertFilters): Promise<Alert[]> {
    // Load alerts from demoData.ts via localStorage DB
    if (typeof window !== 'undefined') {
      const { db } = await import('../lib/localStorage');
      this.alerts = db.getAll<Alert>('alerts');
    }
    
    let filtered = [...this.alerts];

    if (filters) {
      if (filters.status && filters.status.length > 0) {
        filtered = filtered.filter(a => filters.status!.includes(a.status));
      }
      if (filters.severity && filters.severity.length > 0) {
        filtered = filtered.filter(a => filters.severity!.includes(a.severity));
      }
      if (filters.assignedTo) {
        filtered = filtered.filter(a => a.assignedTo === filters.assignedTo);
      }
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(a => 
          a.id.toLowerCase().includes(term) ||
          a.metadata.sinisterNumber?.toLowerCase().includes(term) ||
          a.metadata.documentType?.toLowerCase().includes(term)
        );
      }
    }

    return filtered;
  }

  // Get single alert
  async getAlert(id: string): Promise<Alert | null> {
    return this.alerts.find(a => a.id === id) || null;
  }

  // Assign alerts
  async assignAlerts(assignment: AlertAssignment): Promise<void> {
    const now = new Date();
    assignment.alertIds.forEach(id => {
      const alert = this.alerts.find(a => a.id === id);
      if (alert) {
        alert.assignedTo = assignment.assignTo;
        alert.assignedAt = now;
        alert.status = 'assigned';
        alert.updatedAt = now;
      }
    });
  }

  // Qualify alert
  async qualifyAlert(request: AlertQualificationRequest): Promise<Alert | null> {
    const alert = this.alerts.find(a => a.id === request.alertId);
    if (!alert) return null;

    // Update alert status
    alert.qualification = request.qualification;
    alert.qualificationNotes = request.notes;
    alert.status = 'qualified';
    alert.qualifiedAt = new Date();
    alert.updatedAt = new Date();

    // === EVENT-DRIVEN: FEEDBACK LOOP - Only if fraud confirmed ===
    // Risk impact ONLY happens when fraud is confirmed
    if (request.qualification === 'fraud_confirmed') {
      // Mark that this alert will impact risk
      alert.impacts_risk = true;
      alert.risk_impact_applied = new Date();
      
      // If we have a person ID (derived from event), update their risk profile
      if (alert.metadata.assureId) {
        try {
          console.log(`🔄 Fraude confirmée pour l'alerte ${alert.id} (event: ${alert.event_id}) - Impact risque personne ${alert.metadata.assureId}`);
          
          // 1. Update person's risk profile (Risk is linked to Person)
          await this.updateAssureRiskProfile(alert.metadata.assureId, alert);
          
          // 2. Create fraud event in history (traceable via event chain)
          await this.createFraudHistoryEvent(alert.metadata.assureId, alert);
          
          // 3. Detect/create new associated risks
          await this.detectAssociatedRisks(alert.metadata.assureId, alert);
          
          // Store impacted person ID
          alert.impacted_assure_id = alert.metadata.assureId;
          
          console.log(`✅ Risque impacté pour personne ${alert.metadata.assureId} via event ${alert.event_id}`);
        } catch (error) {
          console.error('Erreur lors de l\'impact sur le risque:', error);
          // Don't fail qualification
        }
      } else {
        console.log(`⚠️ Alerte ${alert.id} confirmée mais pas de personne liée (event ${alert.event_id})`);
      }
    } else {
      // Not fraud confirmed = no risk impact
      alert.impacts_risk = false;
      console.log(`ℹ️ Alerte ${alert.id} qualifiée '${request.qualification}' - Pas d'impact risque`);
    }

    return alert;
  }

  // === NOUVEAUX HELPERS POUR LA BOUCLE DE RÉTROACTION ===

  private async updateAssureRiskProfile(assureId: string, alert: Alert): Promise<void> {
    try {
      // Utiliser le service existant pour mettre à jour le profil de risque
      const assure = await assureService.getAssure(assureId);
      if (assure) {
        // Incrémenter le score de risque selon la gravité de la fraude
        const riskIncrement = this.calculateRiskIncrement(alert);
        
        await assureService.updateAssure({
          assureId,
          riskProfile: {
            ...assure.riskProfile,
            riskScore: Math.min(100, assure.riskProfile.riskScore + riskIncrement),
            riskLevel: this.calculateRiskLevel(assure.riskProfile.riskScore + riskIncrement),
            nombreAlertes: assure.riskProfile.nombreAlertes + 1,
            nombreDossiersFraude: assure.riskProfile.nombreDossiersFraude + 1,
            facteursDurcissement: [
              ...assure.riskProfile.facteursDurcissement,
              `Fraude confirmée: ${alert.type} (${new Date().toLocaleDateString()})`
            ],
            derniereMiseAJour: new Date()
          }
        }, 'system');
      }
    } catch (error) {
      console.error('Erreur mise à jour profil assuré:', error);
    }
  }

  private async createFraudHistoryEvent(assureId: string, alert: Alert): Promise<void> {
    try {
      await historiqueService.createHistorique({
        type: 'fraude_confirmee',
        titre: `Fraude confirmée - ${alert.type}`,
        description: `Alerte ${alert.id} qualifiée comme fraude confirmée. ${alert.qualificationNotes || ''}`,
        assureId,
        metadata: {
          alertId: alert.id,
          alertType: alert.type,
          severity: alert.severity,
          score: alert.score,
          amount: alert.metadata.amount,
          documentType: alert.metadata.documentType,
          sinisterNumber: alert.metadata.sinisterNumber
        }
      });
    } catch (error) {
      console.error('Erreur création événement historique:', error);
    }
  }

  private async detectAssociatedRisks(assureId: string, alert: Alert): Promise<void> {
    try {
      // Utiliser le service existant pour détecter/créer des risques associés
      await risqueService.detectRiskFromAlert(alert.id, assureId);
    } catch (error) {
      console.error('Erreur détection risques associés:', error);
    }
  }

  private calculateRiskIncrement(alert: Alert): number {
    // Calcul du score d'incrément selon la gravité
    const baseIncrement = {
      'critical': 25,
      'high': 15,
      'medium': 10,
      'low': 5
    }[alert.severity] || 5;

    // Ajustement selon le type de fraude
    const typeMultiplier = alert.type.includes('document') ? 1.5 : 
                          alert.type.includes('network') ? 2.0 : 1.0;

    // Ajustement selon le montant
    const amountMultiplier = (alert.metadata.amount || 0) > 10000 ? 1.3 : 1.0;

    return Math.round(baseIncrement * typeMultiplier * amountMultiplier);
  }

  private calculateRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  // Get statistics
  async getStats(userId?: string, teamId?: string): Promise<AlertStats> {
    let relevantAlerts = [...this.alerts];
    
    if (userId) {
      relevantAlerts = relevantAlerts.filter(a => a.assignedTo === userId);
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      pending: relevantAlerts.filter(a => a.status === 'pending').length,
      assigned: relevantAlerts.filter(a => a.status === 'assigned').length,
      inReview: relevantAlerts.filter(a => a.status === 'in_review').length,
      qualified: relevantAlerts.filter(a => a.status === 'qualified').length,
      rejected: relevantAlerts.filter(a => a.status === 'rejected').length,
      
      bySeverity: {
        critical: relevantAlerts.filter(a => a.severity === 'critical').length,
        high: relevantAlerts.filter(a => a.severity === 'high').length,
        medium: relevantAlerts.filter(a => a.severity === 'medium').length,
        low: relevantAlerts.filter(a => a.severity === 'low').length,
      },
      
      avgProcessingTime: 45, // Mock value in minutes
      todayCount: relevantAlerts.filter(a => a.createdAt >= todayStart).length,
      weekCount: relevantAlerts.filter(a => a.createdAt >= weekStart).length,
    };
  }

  // Helper methods
  private calculateSeverity(score: number): 'critical' | 'high' | 'medium' | 'low' {
    if (score >= 85) return 'critical';
    if (score >= 70) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  }


  private extractSinisterNumber(result: FraudAnalysisResult): string | undefined {
    // Extract from document info
    return result.document_info.registration_number;
  }

  private extractAmount(result: FraudAnalysisResult): number {
    // Try to extract amount from document info or metadata
    // This is a simplified implementation
    return Math.floor(Math.random() * 10000);
  }

  // === NOUVELLES MÉTHODES POUR ARCHITECTURE DÉCLOISONNÉE ===

  private determineCitySource(result: FraudAnalysisResult, fileName: string): FraudCitySource {
    // 1. Détection Cyber-fraude : patterns réseau, corrélations multiples
    if (result.key_findings.some(f => f.code.includes('NETWORK') || f.code.includes('CORRELATION'))) {
      return 'cyber';
    }

    // 2. Détection AML : montants élevés, patterns blanchiment
    if (result.metadata?.amount > 15000 || 
        result.key_findings.some(f => f.code.includes('AML') || f.code.includes('SUSPICIOUS_PATTERN'))) {
      return 'aml';
    }

    // 3. Détection Comportementale : patterns temporels, fréquence
    if (result.key_findings.some(f => f.code.includes('BEHAVIORAL') || f.code.includes('FREQUENCY'))) {
      return 'comportemental';
    }

    // 4. Default : Documentaire (analyse de documents)
    return 'documentaire';
  }

  private determineBusinessDistrict(lineOfBusiness: InsuranceLineOfBusiness, fileName: string): BusinessDistrict {
    // Mapping line of business → district
    switch (lineOfBusiness) {
      case InsuranceLineOfBusiness.AUTO:
        return 'auto';
      case InsuranceLineOfBusiness.SANTE:
        return 'sante';
      case InsuranceLineOfBusiness.HABITATION:
        return 'habitation';
      case InsuranceLineOfBusiness.PROFESSIONNELLE:
        return 'professionnelle';
      case InsuranceLineOfBusiness.VOYAGE:
        return 'voyage';
      default:
        // Fallback basé sur le nom de fichier
        if (fileName.toLowerCase().includes('auto') || fileName.toLowerCase().includes('vehicule')) {
          return 'auto';
        }
        if (fileName.toLowerCase().includes('sante') || fileName.toLowerCase().includes('medical')) {
          return 'sante';
        }
        if (fileName.toLowerCase().includes('habitation') || fileName.toLowerCase().includes('logement')) {
          return 'habitation';
        }
        return 'auto'; // Default
    }
  }

  // === HELPER METHODS POUR COMPATIBILITY ===
  
  private enhanceTechnicalMessage(code: string, originalMessage: string): string {
    // Enhanced technical messages in French with detailed explanations
    const enhancedMessages: Record<string, string> = {
      'METADATA_TAMPERED': 'Métadonnées modifiées – le document a été altéré après sa création. Les propriétés du fichier indiquent une manipulation post-création.',
      'EXACT_DUPLICATE': 'Document dupliqué – ce fichier a déjà été soumis plusieurs fois dans différents dossiers. Risque de fraude par réutilisation.',
      'VIN_CHECK_DIGIT_FAIL': 'Erreur de contrôle VIN – la clé de vérification interne du VIN est incorrecte. Le numéro de châssis ne respecte pas l\'algorithme de validation.',
      'OCR_SUSPICIOUS_PATTERN': 'Texte OCR suspect – caractères anormaux détectés dans la reconnaissance optique. Possible manipulation du contenu textuel.',
      'OCR_HIGH_NOISE': 'Texte peu lisible – niveau de bruit élevé dans le scan. La qualité du document pourrait masquer des altérations.',
      'DIGITAL_PRINT_DETECTED': 'Impression numérique détectée – le document n\'est pas un original. Risque de falsification ou usurpation d\'identité.',
      'SIGNATURE_INCONSISTENCY': 'Signature incohérente – variations détectées par rapport aux signatures de référence. Possible falsification.',
      'AMOUNT_ANOMALY': 'Anomalie sur le montant – incohérence entre les montants détectés et les références. Tentative probable de gonflement.',
      'DATE_INCONSISTENCY': 'Incohérence de dates – chronologie impossible entre les événements du document. Manipulation temporelle détectée.',
      'TEMPLATE_MISMATCH': 'Modèle non conforme – le document ne correspond pas aux templates officiels connus. Document potentiellement contrefait.',
      'AI_GENERATED_CONTENT': 'Contenu généré par IA – patterns de génération artificielle détectés. Document créé par intelligence artificielle.',
      'BONUS_MALUS_ANOMALY': 'Anomalie bonus/malus – coefficient incohérent avec l\'historique assurantiel. Falsification du relevé d\'information.',
      'ADDRESS_ANOMALY': 'Anomalie d\'adresse – localisation incohérente ou inexistante. Tentative de modification du risque géographique.',
      'VIN_ANOMALY': 'Anomalie VIN – format ou séquence invalide pour le constructeur déclaré. Véhicule potentiellement maquillé.',
      'EXPERT_SEAL_MISSING': 'Cachet expert manquant – absence de validation officielle sur un rapport d\'expertise. Document non authentifié.',
      'INVOICE_TAMPERING': 'Facture modifiée – altérations détectées dans les montants ou descriptions. Surfacturation probable.',
      'ORGANIZED_PATTERN': 'Pattern organisé – similitudes avec d\'autres dossiers suggérant un réseau de fraude. Investigation approfondie requise.',
      'IMAGE_MANIPULATION': 'Photo retouchée – zones clonées ou modifiées détectées dans l\'image. Dissimulation de dommages ou amplification.',
      'EXIF_DATA_STRIPPED': 'Métadonnées EXIF supprimées – informations de prise de vue effacées. Tentative de dissimulation de l\'origine.',
      'HASH_COLLISION': 'Collision de hash – empreinte numérique identique à un document antérieur. Réutilisation frauduleuse.',
      'PDF_LAYER_ANOMALY': 'Anomalie de couches PDF – contenu caché ou superposé détecté. Manipulation du document visible.',
      'CREATION_DATE_MISMATCH': 'Date de création incohérente – horodatage système ne correspond pas aux métadonnées. Document antidaté.',
      'FONT_INCONSISTENCY': 'Police incohérente – variations de police suggérant une édition manuelle. Ajouts ou modifications post-création.',
      'CERTIFICATE_CHAIN_BROKEN': 'Chaîne de certificats rompue – signature numérique non vérifiable. Autorité de certification compromise.',
      'SIGNING_TIME_ANOMALY': 'Anomalie temporelle de signature – signature antérieure à la création. Manipulation de l\'horodatage.',
      'COMPRESSION_ARTIFACTS': 'Artéfacts de compression – multiples compressions détectées. Document édité plusieurs fois.',
      'AMOUNT_TAMPERING': 'Montant trafiqué – incohérence entre reconnaissance OCR et données structurées. Modification des chiffres.',
      'DECIMAL_MANIPULATION': 'Manipulation décimale – déplacement de virgule pour augmenter le montant. Tentative d\'escroquerie.',
      'CURRENCY_MISMATCH': 'Devise incohérente – monnaie ne correspondant pas au contrat ou à la région. Confusion volontaire.',
      'DATE_LOGIC_FAIL': 'Logique temporelle impossible – chronologie des événements incohérente. Fraude temporelle évidente.',
      'WEEKEND_ANOMALY': 'Anomalie week-end – document émis un jour de fermeture. Établissement fermé à cette date.',
      'FUTURE_DATE': 'Date future – document daté dans le futur. Tentative d\'antidatage frauduleux.'
    };

    // Return enhanced message if available, otherwise return original with formatting
    return enhancedMessages[code] || `${originalMessage} (Code: ${code})`;
  }
  
  private formatInsuranceFraudType(fraudType: InsuranceFraudType): string {
    // Format insurance fraud types to human-readable French descriptions
    const fraudTypeDescriptions: Record<InsuranceFraudType, string> = {
      [InsuranceFraudType.MODIFICATION_ADRESSE]: 'Modification d\'adresse frauduleuse',
      [InsuranceFraudType.FAUX_BONUS_MALUS]: 'Faux bonus/malus',
      [InsuranceFraudType.USURPATION_IDENTITE]: 'Usurpation d\'identité',
      [InsuranceFraudType.DATE_PERMIS_INVALIDE]: 'Date de permis invalide',
      [InsuranceFraudType.FAUX_JUSTIFICATIFS]: 'Faux justificatifs',
      [InsuranceFraudType.ANTECEDENTS_CACHES]: 'Antécédents cachés',
      [InsuranceFraudType.VEHICULE_MISREPRESENTE]: 'Véhicule mal représenté',
      [InsuranceFraudType.DOCUMENT_FALSIFIE]: 'Document falsifié',
      [InsuranceFraudType.MONTANT_GONFLE]: 'Montant gonflé',
      [InsuranceFraudType.SINISTRE_FICTIF]: 'Sinistre fictif',
      [InsuranceFraudType.MISE_EN_SCENE]: 'Mise en scène',
      [InsuranceFraudType.EXPERT_COMPLICE]: 'Expert complice',
      [InsuranceFraudType.REPARATEUR_COMPLICE]: 'Réparateur complice',
      [InsuranceFraudType.PIECES_DETOURNEES]: 'Pièces détournées',
      [InsuranceFraudType.RESEAU_ORGANISE]: 'Réseau organisé',
      [InsuranceFraudType.BLANCHIMENT]: 'Blanchiment',
      [InsuranceFraudType.CYBER_FRAUDE]: 'Cyber fraude'
    };
    
    return fraudTypeDescriptions[fraudType] || fraudType;
  }
  
  private mapInsuranceFraudTypeToAlertType(fraudType: InsuranceFraudType, context: FraudContext): string {
    if (context === FraudContext.SOUSCRIPTION) {
      return 'subscription_fraud_suspect';
    } else if (context === FraudContext.SINISTRE) {
      return 'claims_fraud_suspect';
    }
    return 'document_suspect';
  }

  private calculateInsuranceSeverity(score: number, insuranceAlert: InsuranceAlert): 'critical' | 'high' | 'medium' | 'low' {
    // Base severity
    let severity = this.calculateSeverity(score);
    
    // Boost selon urgence business
    if (insuranceAlert.urgencyLevel === 'critical') {
      return 'critical';
    }
    
    // Boost selon impact business
    if (insuranceAlert.businessContext === 'high_value_customer' && severity !== 'critical') {
      const severityLevels = ['low', 'medium', 'high', 'critical'];
      const currentIndex = severityLevels.indexOf(severity);
      return severityLevels[Math.min(3, currentIndex + 1)] as any;
    }
    
    return severity;
  }

  private mapFraudContextToBusinessContext(context: FraudContext): string {
    switch (context) {
      case FraudContext.SOUSCRIPTION:
        return 'subscription';
      case FraudContext.SINISTRE:
        return 'claims';
      default:
        return 'unknown';
    }
  }

  private mapLineOfBusinessToDocumentFamily(lineOfBusiness: InsuranceLineOfBusiness): string {
    switch (lineOfBusiness) {
      case InsuranceLineOfBusiness.AUTO:
        return 'automotive';
      case InsuranceLineOfBusiness.SANTE:
        return 'medical';
      case InsuranceLineOfBusiness.HABITATION:
        return 'property';
      default:
        return 'financial';
    }
  }

  private mapBusinessContextToWorkflowStage(businessContext: string): string {
    if (businessContext.includes('onboarding')) return 'onboarding';
    if (businessContext.includes('claim')) return 'claim_processing';
    if (businessContext.includes('renewal')) return 'renewal';
    return 'unknown';
  }

  private getDocumentTypeFromContext(businessContext: string): string {
    // Extract document type from business context
    return businessContext || 'document_generique';
  }

  private calculateBusinessImpactLevel(fraudTypology: any[]): 'low' | 'medium' | 'high' | 'critical' {
    // Calculate business impact level based on fraud typologies
    if (!fraudTypology || fraudTypology.length === 0) return 'low';
    
    const hasCriticalFraud = fraudTypology.some(ft => 
      ft.severity === 'critical' || 
      ft.insuranceFraudType === InsuranceFraudType.RESEAU_ORGANISE ||
      ft.insuranceFraudType === InsuranceFraudType.BLANCHIMENT
    );
    
    if (hasCriticalFraud) return 'critical';
    
    const hasHighSeverity = fraudTypology.some(ft => ft.severity === 'high');
    if (hasHighSeverity) return 'high';
    
    const averageRiskLevel = fraudTypology.reduce((sum, ft) => sum + (ft.riskLevel || 0), 0) / fraudTypology.length;
    if (averageRiskLevel >= 70) return 'high';
    if (averageRiskLevel >= 50) return 'medium';
    
    return 'low';
  }
}

// Export singleton instance
export const alertService = new AlertService();