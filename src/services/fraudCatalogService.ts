import { 
  FraudCatalog, 
  FraudCitySource, 
  BusinessDistrict, 
  SpecializedTeam,
  ClassificationResult,
  FraudRule,
  CreateCatalogRequest,
  UpdateCatalogRequest,
  FraudCatalogFilters,
  GeneratedInvestigationPlan,
  GovernanceMetrics
} from '@/types/fraud-catalog.types';
import { Alert } from '@/types/alert.types';
import { Case } from '@/types/case.types';

// Mock data generator pour développement
const generateMockCatalogs = (): FraudCatalog[] => {
  const catalogs: FraudCatalog[] = [
    
    // === CYBER FRAUDE ===
    {
      id: 'CATALOG-CYBER-001',
      name: 'Réseau Organisé - Cyber Fraude',
      description: 'Détection de réseaux de fraude organisés avec patterns cyber',
      version: '1.0',
      city_source: 'cyber',
      applicable_districts: ['auto', 'sante', 'habitation', 'professionnelle'],
      
      classification: {
        fraud_type: 'reseau_organise',
        severity_range: [70, 100],
        auto_detection_rules: [{
          id: 'CYBER-001',
          name: 'Pattern Réseau Détecté',
          condition: 'correlation_score > 0.8 AND affected_entities > 5',
          threshold: 75,
          confidence_required: 0.7,
          auto_assign_team: 'cyber_fraud_team',
          escalation_score: 85,
          business_context: ['auto', 'sante'],
          active: true
        }],
        manual_triggers: ['signalement_externe', 'correlation_manuelle'],
        correlation_patterns: ['multi_assure', 'timing_suspect', 'ip_matching']
      },
      
      playbook: {
        investigation_steps: [
          {
            step_order: 1,
            action: 'Analyse corrélations multi-assurés',
            description: 'Identifier tous les assurés potentiellement impactés',
            required_role: 'cyber_fraud_team',
            estimated_hours: 4,
            dependencies: [],
            deliverables: ['liste_assures_impliques', 'mapping_correlations'],
            is_mandatory: true,
            can_be_automated: true
          },
          {
            step_order: 2,
            action: 'Coordination équipes métier',
            description: 'Alerter les équipes Auto/Santé concernées',
            required_role: 'cyber_fraud_team',
            estimated_hours: 2,
            dependencies: ['step_1'],
            deliverables: ['notifications_equipes', 'plan_coordination'],
            is_mandatory: true,
            can_be_automated: false
          }
        ],
        evidence_requirements: [
          {
            id: 'CYBER-EVIDENCE-001',
            type: 'preuve_technique',
            description: 'Logs techniques et patterns de corrélation',
            is_mandatory: true,
            collection_method: 'extraction_automatique',
            validation_criteria: ['correlation_score', 'pattern_consistency'],
            legal_weight: 'high'
          }
        ],
        specialized_team: 'cyber_fraud_team',
        default_sla_hours: 24,
        escalation_triggers: [{
          trigger_condition: 'affected_entities > 10',
          escalate_to_team: 'compliance',
          escalate_to_role: 'compliance_manager',
          notification_required: true,
          sla_adjustment_hours: -12,
          reason_template: 'Impact systémique détecté - escalade compliance requise'
        }],
        risk_assessment_method: 'systemic_impact_analysis'
      },
      
      governance: {
        approval_required: true,
        audit_level: 'forensic',
        regulatory_framework: ['RGPD', 'Directive_PSD2'],
        legal_implications: ['signalement_tracfin', 'cooperation_autorites'],
        data_retention_days: 2555  // 7 ans
      },
      
      proof_templates: [{
        id: 'CYBER-TEMPLATE-001',
        name: 'Rapport Réseau Organisé',
        category: 'cyber_investigation',
        template_content: 'Template rapport cyber fraude...',
        required_fields: [
          { field_name: 'network_size', field_type: 'number', is_required: true, validation_rules: ['min:2'] },
          { field_name: 'correlation_evidence', field_type: 'file', is_required: true, validation_rules: ['format:pdf'] }
        ],
        legal_references: ['Article_L121-1'],
        regulatory_compliance: ['ACPR_2019-C-01']
      }],
      
      documentation: {
        procedure_url: '/procedures/cyber-fraud-investigation',
        training_materials: ['cyber_fraud_basics', 'correlation_analysis'],
        best_practices: ['early_coordination', 'evidence_preservation'],
        common_pitfalls: ['isolation_silo', 'delayed_escalation']
      },
      
      performance_metrics: {
        average_investigation_time: 48,
        success_rate: 0.92,
        false_positive_rate: 0.05,
        cost_per_investigation: 1200,
        roi_factor: 25.5
      },
      
      created_at: new Date('2024-01-15'),
      created_by: 'system',
      updated_at: new Date('2024-01-20'),
      last_review_date: new Date('2024-01-20'),
      next_review_date: new Date('2024-07-20'),
      is_active: true,
      tags: ['cyber', 'reseau', 'systemic', 'high_priority']
    },

    // === DOCUMENTAIRE AUTO ===
    {
      id: 'CATALOG-DOC-AUTO-001',
      name: 'Fraude Documentaire Automobile',
      description: 'Documents Auto falsifiés - Relevé info, Carte grise, Permis',
      version: '1.2',
      city_source: 'documentaire',
      applicable_districts: ['auto'],
      
      classification: {
        fraud_type: 'document_falsifie_auto',
        severity_range: [40, 90],
        auto_detection_rules: [{
          id: 'DOC-AUTO-001',
          name: 'Document Auto Suspect',
          condition: 'document_type IN [releve_info, carte_grise] AND anomaly_score > 0.6',
          threshold: 60,
          confidence_required: 0.6,
          auto_assign_team: 'automotive_fraud_team',
          escalation_score: 80,
          business_context: ['auto'],
          active: true
        }],
        manual_triggers: ['expert_request', 'client_signalement'],
        correlation_patterns: ['bonus_malus_inconsistent', 'vehicle_mismatch']
      },
      
      playbook: {
        investigation_steps: [
          {
            step_order: 1,
            action: 'Vérification documents officiels',
            description: 'Contrôle auprès organismes officiels (ANTS, assureurs précédents)',
            required_role: 'automotive_fraud_team',
            estimated_hours: 2,
            dependencies: [],
            deliverables: ['verification_officielle', 'historique_vehicule'],
            is_mandatory: true,
            can_be_automated: false
          },
          {
            step_order: 2,
            action: 'Analyse technique document',
            description: 'Expertise forensique du document (si score > 80)',
            required_role: 'expert',
            estimated_hours: 4,
            dependencies: ['step_1'],
            deliverables: ['rapport_expertise', 'preuve_falsification'],
            is_mandatory: false,
            can_be_automated: false
          }
        ],
        evidence_requirements: [
          {
            id: 'DOC-AUTO-EVIDENCE-001',
            type: 'verification_officielle',
            description: 'Confirmation organisme officiel',
            is_mandatory: true,
            collection_method: 'api_ants_verification',
            validation_criteria: ['source_officielle', 'coherence_donnees'],
            legal_weight: 'critical'
          }
        ],
        specialized_team: 'automotive_fraud_team',
        default_sla_hours: 72,
        escalation_triggers: [{
          trigger_condition: 'amount > 5000 OR recidive = true',
          escalate_to_team: 'expert',
          escalate_to_role: 'expert_automobile',
          notification_required: false,
          sla_adjustment_hours: 24,
          reason_template: 'Montant élevé ou récidive - expertise requise'
        }],
        risk_assessment_method: 'financial_impact_analysis'
      },
      
      governance: {
        approval_required: false,
        audit_level: 'standard',
        regulatory_framework: ['Code_Assurances'],
        legal_implications: ['nullite_contrat', 'action_civile'],
        data_retention_days: 1825  // 5 ans
      },
      
      proof_templates: [{
        id: 'DOC-AUTO-TEMPLATE-001',
        name: 'Rapport Fraude Auto',
        category: 'automotive_fraud',
        template_content: 'Template rapport fraude auto...',
        required_fields: [
          { field_name: 'vehicle_registration', field_type: 'text', is_required: true, validation_rules: ['format:registration'] },
          { field_name: 'official_verification', field_type: 'file', is_required: true, validation_rules: ['source:official'] }
        ],
        legal_references: ['Article_L113-8'],
        regulatory_compliance: ['FFA_Guidelines']
      }],
      
      documentation: {
        procedure_url: '/procedures/automotive-document-fraud',
        training_materials: ['document_verification_auto', 'ants_api_usage'],
        best_practices: ['systematic_verification', 'cross_reference_check'],
        common_pitfalls: ['insufficient_verification', 'scope_limitation']
      },
      
      performance_metrics: {
        average_investigation_time: 36,
        success_rate: 0.78,
        false_positive_rate: 0.12,
        cost_per_investigation: 180,
        roi_factor: 4.2
      },
      
      created_at: new Date('2024-01-10'),
      created_by: 'fraud_expert',
      updated_at: new Date('2024-01-25'),
      last_review_date: new Date('2024-01-25'),
      next_review_date: new Date('2024-04-25'),
      is_active: true,
      tags: ['documentaire', 'auto', 'verification', 'standard']
    }
  ];
  
  return catalogs;
};

class FraudCatalogService {
  private catalogs: FraudCatalog[] = [];
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (!this.initialized) {
      this.catalogs = generateMockCatalogs();
      this.initialized = true;
      console.log(`✅ FraudCatalogService initialisé avec ${this.catalogs.length} catalogues`);
    }
  }

  // === CLASSIFICATION : Événement/Détection → Alerte ===

  async classifyAndCreateAlert(
    detection_source: FraudCitySource,
    business_context: string,
    raw_data: any,
    confidence: number,
    score: number
  ): Promise<{ classification: ClassificationResult; applicable_catalog?: FraudCatalog }> {
    
    // 1. Identifier catalogues applicables
    const applicable_catalogs = this.findApplicableCatalogs(detection_source, business_context);
    
    if (applicable_catalogs.length === 0) {
      return {
        classification: {
          catalog_id: 'GENERIC',
          confidence: confidence,
          score: score,
          triggered_rules: [],
          risk_level: this.calculateRiskLevel(score),
          recommended_team: this.getDefaultTeam(detection_source),
          estimated_investigation_time: 24,
          business_impact: 'medium',
          auto_escalation_required: false
        }
      };
    }

    // 2. Appliquer règles de classification
    let best_match: { catalog: FraudCatalog; result: ClassificationResult } | null = null;
    let highest_confidence = 0;

    for (const catalog of applicable_catalogs) {
      const classification_result = this.applyClassificationRules(catalog, raw_data, score, confidence);
      
      if (classification_result.confidence > highest_confidence) {
        highest_confidence = classification_result.confidence;
        best_match = { catalog, result: classification_result };
      }
    }

    if (best_match) {
      console.log(`🎯 Classification: ${best_match.catalog.name} (confiance: ${Math.round(best_match.result.confidence * 100)}%)`);
      return {
        classification: best_match.result,
        applicable_catalog: best_match.catalog
      };
    }

    // 3. Fallback si aucune règle ne matche
    return {
      classification: {
        catalog_id: applicable_catalogs[0].id,
        confidence: confidence * 0.5, // Réduction confiance si pas de règle précise
        score: score,
        triggered_rules: [],
        risk_level: this.calculateRiskLevel(score),
        recommended_team: applicable_catalogs[0].playbook.specialized_team,
        estimated_investigation_time: applicable_catalogs[0].playbook.default_sla_hours,
        business_impact: 'medium',
        auto_escalation_required: false
      },
      applicable_catalog: applicable_catalogs[0]
    };
  }

  // === PLAYBOOK : Alerte → Dossier d'Investigation ===

  async generateInvestigationPlan(
    alert: Alert,
    catalog_id: string
  ): Promise<GeneratedInvestigationPlan | null> {
    
    const catalog = this.catalogs.find(c => c.id === catalog_id);
    if (!catalog) return null;

    // Adapter les étapes selon le contexte de l'alerte
    const adapted_steps = catalog.playbook.investigation_steps.map(step => ({
      ...step,
      // Ajuster estimation selon complexité alerte
      estimated_hours: this.adjustEstimationForAlert(step.estimated_hours, alert)
    }));

    // Calculer chemin critique
    const critical_path = this.calculateCriticalPath(adapted_steps);
    
    // Identifier parallélisations possibles
    const parallel_tracks = this.identifyParallelTracks(adapted_steps);

    const plan: GeneratedInvestigationPlan = {
      catalog_id: catalog.id,
      plan_id: `PLAN-${Date.now()}`,
      steps: adapted_steps,
      estimated_total_hours: adapted_steps.reduce((sum, step) => sum + step.estimated_hours, 0),
      required_evidence: catalog.playbook.evidence_requirements,
      assigned_teams: [catalog.playbook.specialized_team],
      critical_path: critical_path,
      parallel_tracks: parallel_tracks,
      checkpoints: adapted_steps
        .filter(step => step.is_mandatory)
        .map(step => ({
          step_id: `step_${step.step_order}`,
          review_required: step.estimated_hours > 4,
          decision_point: step.deliverables.includes('decision')
        }))
    };

    console.log(`📋 Plan d'investigation généré: ${plan.steps.length} étapes, ${plan.estimated_total_hours}h estimées`);
    
    return plan;
  }

  // === GOUVERNANCE : Métriques et Monitoring ===

  async getGovernanceMetrics(): Promise<GovernanceMetrics> {
    // Simuler calcul métriques réelles
    const city_metrics = {
      'cyber': { alerts_generated: 47, avg_processing_time: 48, success_rate: 0.92, resource_utilization: 0.85 },
      'aml': { alerts_generated: 23, avg_processing_time: 36, success_rate: 0.88, resource_utilization: 0.72 },
      'documentaire': { alerts_generated: 156, avg_processing_time: 24, success_rate: 0.78, resource_utilization: 0.95 },
      'comportemental': { alerts_generated: 89, avg_processing_time: 18, success_rate: 0.65, resource_utilization: 0.68 }
    };

    const district_metrics = {
      'auto': { active_cases: 45, avg_resolution_time: 72, customer_impact: 0.15, financial_recovery: 125000 },
      'sante': { active_cases: 23, avg_resolution_time: 96, customer_impact: 0.08, financial_recovery: 89000 },
      'habitation': { active_cases: 17, avg_resolution_time: 48, customer_impact: 0.12, financial_recovery: 67000 },
      'professionnelle': { active_cases: 12, avg_resolution_time: 120, customer_impact: 0.05, financial_recovery: 234000 },
      'voyage': { active_cases: 8, avg_resolution_time: 24, customer_impact: 0.03, financial_recovery: 23000 }
    };

    return {
      rules_active: this.catalogs.reduce((sum, c) => sum + c.classification.auto_detection_rules.length, 0),
      sla_compliance_rate: 0.94,
      escalation_rate: 0.08,
      audit_trails_complete: 234,
      city_metrics: city_metrics as any,
      district_metrics: district_metrics as any,
      total_roi: 2340000,
      prevention_value: 1890000,
      operational_cost: 145000,
      efficiency_gain: 0.23
    };
  }

  // === GESTION CATALOGUES ===

  async getCatalogs(filters?: FraudCatalogFilters): Promise<FraudCatalog[]> {
    let filtered = [...this.catalogs];

    if (filters) {
      if (filters.city_sources) {
        filtered = filtered.filter(c => filters.city_sources!.includes(c.city_source));
      }
      if (filters.business_districts) {
        filtered = filtered.filter(c => 
          c.applicable_districts.some(d => filters.business_districts!.includes(d))
        );
      }
      if (filters.specialized_teams) {
        filtered = filtered.filter(c => 
          filters.specialized_teams!.includes(c.playbook.specialized_team)
        );
      }
      if (filters.active_only !== undefined) {
        filtered = filtered.filter(c => c.is_active === filters.active_only);
      }
      if (filters.min_success_rate !== undefined) {
        filtered = filtered.filter(c => c.performance_metrics.success_rate >= filters.min_success_rate!);
      }
    }

    return filtered.sort((a, b) => b.performance_metrics.success_rate - a.performance_metrics.success_rate);
  }

  async getCatalog(id: string): Promise<FraudCatalog | null> {
    return this.catalogs.find(c => c.id === id) || null;
  }

  async createCatalog(request: CreateCatalogRequest): Promise<FraudCatalog> {
    const newCatalog: FraudCatalog = {
      id: `CATALOG-${Date.now()}`,
      name: request.name,
      description: request.description,
      version: '1.0',
      city_source: request.city_source,
      applicable_districts: request.applicable_districts,
      classification: request.classification,
      playbook: request.playbook,
      governance: request.governance,
      proof_templates: [],
      documentation: {
        training_materials: [],
        best_practices: [],
        common_pitfalls: []
      },
      performance_metrics: {
        average_investigation_time: 24,
        success_rate: 0.5,
        false_positive_rate: 0.2,
        cost_per_investigation: 200,
        roi_factor: 1.0
      },
      created_at: new Date(),
      created_by: request.created_by,
      updated_at: new Date(),
      last_review_date: new Date(),
      next_review_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      is_active: true,
      tags: []
    };

    this.catalogs.push(newCatalog);
    console.log(`✅ Catalogue créé: ${newCatalog.name}`);
    
    return newCatalog;
  }

  // === MÉTHODES PRIVÉES ===

  private findApplicableCatalogs(source: FraudCitySource, business_context: string): FraudCatalog[] {
    const business_district = this.mapBusinessContextToDistrict(business_context);
    
    return this.catalogs.filter(catalog => 
      catalog.is_active &&
      catalog.city_source === source &&
      catalog.applicable_districts.includes(business_district)
    );
  }

  private applyClassificationRules(
    catalog: FraudCatalog, 
    raw_data: any, 
    score: number, 
    confidence: number
  ): ClassificationResult {
    
    const triggered_rules: FraudRule[] = [];
    
    // Appliquer chaque règle du catalogue
    for (const rule of catalog.classification.auto_detection_rules) {
      if (this.evaluateRule(rule, raw_data, score, confidence)) {
        triggered_rules.push(rule);
      }
    }

    // Calculer résultat final
    const final_confidence = triggered_rules.length > 0 ? 
      Math.min(1, confidence + (triggered_rules.length * 0.1)) : 
      confidence * 0.8;

    const risk_level = this.calculateRiskLevel(score);
    const business_impact = this.calculateBusinessImpact(score, catalog.city_source);

    return {
      catalog_id: catalog.id,
      confidence: final_confidence,
      score: score,
      triggered_rules: triggered_rules,
      risk_level: risk_level,
      recommended_team: catalog.playbook.specialized_team,
      estimated_investigation_time: catalog.playbook.default_sla_hours,
      business_impact: business_impact,
      auto_escalation_required: triggered_rules.some(r => score >= r.escalation_score)
    };
  }

  private evaluateRule(rule: FraudRule, raw_data: any, score: number, confidence: number): boolean {
    // Simulation évaluation règle (à implémenter avec vraie logique)
    return score >= rule.threshold && confidence >= rule.confidence_required;
  }

  private calculateRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 85) return 'critical';
    if (score >= 70) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  }

  private calculateBusinessImpact(score: number, source: FraudCitySource): 'low' | 'medium' | 'high' | 'critical' {
    // Cyber et AML ont impact plus élevé
    const base_impact = this.calculateRiskLevel(score);
    if (source === 'cyber' || source === 'aml') {
      const impact_levels = ['low', 'medium', 'high', 'critical'];
      const current_index = impact_levels.indexOf(base_impact);
      return impact_levels[Math.min(3, current_index + 1)] as any;
    }
    return base_impact;
  }

  private getDefaultTeam(source: FraudCitySource): SpecializedTeam {
    const team_mapping = {
      'cyber': 'cyber_fraud_team',
      'aml': 'compliance',
      'documentaire': 'fraude',
      'comportemental': 'behavior_analysis_team'
    };
    return team_mapping[source] as SpecializedTeam;
  }

  private mapBusinessContextToDistrict(context: string): BusinessDistrict {
    if (context.includes('auto') || context.includes('vehicule')) return 'auto';
    if (context.includes('sante') || context.includes('medical')) return 'sante';
    if (context.includes('habitation') || context.includes('logement')) return 'habitation';
    if (context.includes('pro') || context.includes('entreprise')) return 'professionnelle';
    if (context.includes('voyage') || context.includes('travel')) return 'voyage';
    return 'auto'; // Default
  }

  private adjustEstimationForAlert(base_hours: number, alert: Alert): number {
    let multiplier = 1;
    
    // Ajuster selon sévérité
    if (alert.severity === 'critical') multiplier *= 1.5;
    if (alert.severity === 'high') multiplier *= 1.2;
    
    // Ajuster selon confiance (moins de confiance = plus d'investigation)
    if (alert.confidence < 0.6) multiplier *= 1.3;
    
    return Math.round(base_hours * multiplier);
  }

  private calculateCriticalPath(steps: any[]): string[] {
    // Simulation calcul chemin critique
    return steps
      .filter(step => step.is_mandatory)
      .map(step => `step_${step.step_order}`);
  }

  private identifyParallelTracks(steps: any[]): string[][] {
    // Simulation identification tracks parallèles
    const independent_steps = steps.filter(step => step.dependencies.length === 0);
    if (independent_steps.length > 1) {
      return [independent_steps.map(step => `step_${step.step_order}`)];
    }
    return [];
  }
}

// Export singleton instance
export const fraudCatalogService = new FraudCatalogService();
export { FraudCatalogService };