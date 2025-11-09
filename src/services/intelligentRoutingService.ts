import { 
  FraudCitySource, 
  BusinessDistrict, 
  SpecializedTeam,
  FraudCatalog
} from '@/types/fraud-catalog.types';
import { Alert } from '@/types/alert.types';
import { Case } from '@/types/case.types';

// === MATRICE DE ROUTAGE INTELLIGENT ===
interface RoutingResult {
  assigned_team: SpecializedTeam;
  specialized_workflow: string;
  escalation_path: SpecializedTeam[];
  coordination_teams: SpecializedTeam[];
  estimated_complexity: 'low' | 'medium' | 'high' | 'critical';
  requires_approval: boolean;
  sla_hours: number;
  priority_boost: number; // 0-2 (boost de priorité)
}

interface TeamCapacity {
  team: SpecializedTeam;
  current_load: number;      // 0-100%
  max_capacity: number;      // Nombre max alertes simultanées
  avg_resolution_time: number; // Heures moyennes
  expertise_level: number;   // 1-5
  availability_hours: string; // "24/7" ou "business_hours"
}

interface RoutingPolicy {
  city_source: FraudCitySource;
  business_district: BusinessDistrict;
  primary_team: SpecializedTeam;
  backup_teams: SpecializedTeam[];
  escalation_triggers: Array<{
    condition: string;
    escalate_to: SpecializedTeam;
    automatic: boolean;
  }>;
  coordination_required: SpecializedTeam[];
  complexity_factors: Record<string, number>;
}

class IntelligentRoutingService {
  private routing_policies: RoutingPolicy[] = [];
  private team_capacities: TeamCapacity[] = [];
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (!this.initialized) {
      this.initializeRoutingPolicies();
      this.initializeTeamCapacities();
      this.initialized = true;
      console.log(`🧭 Service de routage intelligent initialisé avec ${this.routing_policies.length} politiques`);
    }
  }

  // === ROUTAGE PRINCIPAL : Alert → Équipe ===

  async routeAlert(alert: Alert): Promise<RoutingResult> {
    console.log(`🧭 Routage alerte ${alert.id}: ${alert.fraud_city_source} → ${alert.business_district}`);

    // 1. Trouver politique de routage applicable
    const policy = this.findApplicablePolicy(alert.fraud_city_source, alert.business_district);
    
    // 2. Évaluer complexité
    const complexity = this.assessComplexity(alert, policy);
    
    // 3. Vérifier capacités équipes
    const team_assignment = await this.selectOptimalTeam(policy, complexity, alert);
    
    // 4. Déterminer coordination
    const coordination_teams = this.determineCoordinationNeeds(alert, policy);
    
    // 5. Calculer SLA adapté
    const sla_hours = this.calculateAdaptiveSLA(alert, team_assignment, complexity);

    const result: RoutingResult = {
      assigned_team: team_assignment.team,
      specialized_workflow: this.getWorkflowForTeam(team_assignment.team, alert.fraud_city_source),
      escalation_path: this.buildEscalationPath(policy, complexity),
      coordination_teams: coordination_teams,
      estimated_complexity: complexity,
      requires_approval: this.requiresApproval(alert, complexity),
      sla_hours: sla_hours,
      priority_boost: this.calculatePriorityBoost(alert, complexity)
    };

    console.log(`✅ Routage: ${result.assigned_team} (SLA: ${result.sla_hours}h, complexité: ${result.estimated_complexity})`);
    
    return result;
  }

  // === ESCALADE AUTOMATIQUE ===

  async evaluateEscalation(alert: Alert, current_team: SpecializedTeam): Promise<{
    should_escalate: boolean;
    escalate_to?: SpecializedTeam;
    reason: string;
    urgency: 'standard' | 'urgent' | 'critical';
  }> {
    
    const policy = this.findApplicablePolicy(alert.fraud_city_source, alert.business_district);
    
    // Vérifier triggers d'escalade
    for (const trigger of policy.escalation_triggers) {
      if (this.evaluateEscalationCondition(trigger.condition, alert)) {
        return {
          should_escalate: true,
          escalate_to: trigger.escalate_to,
          reason: `Trigger automatique: ${trigger.condition}`,
          urgency: trigger.automatic ? 'urgent' : 'standard'
        };
      }
    }

    // Vérifier overload équipe
    const team_capacity = this.team_capacities.find(tc => tc.team === current_team);
    if (team_capacity && team_capacity.current_load > 90) {
      const backup_team = policy.backup_teams[0];
      return {
        should_escalate: true,
        escalate_to: backup_team,
        reason: `Capacité équipe ${current_team} saturée (${team_capacity.current_load}%)`,
        urgency: 'standard'
      };
    }

    // Vérifier SLA breach
    const sla_remaining = this.calculateSLARemaining(alert);
    if (sla_remaining < 6) { // Moins de 6h restantes
      const escalation_path = this.buildEscalationPath(policy, 'high');
      return {
        should_escalate: true,
        escalate_to: escalation_path[0],
        reason: `SLA critique: ${sla_remaining}h restantes`,
        urgency: 'critical'
      };
    }

    return {
      should_escalate: false,
      reason: 'Aucun trigger d\'escalade activé'
    };
  }

  // === COORDINATION MULTI-ÉQUIPES ===

  async coordinateTeams(
    primary_alert: Alert, 
    related_alerts: Alert[]
  ): Promise<{
    coordination_plan: Array<{
      team: SpecializedTeam;
      role: 'lead' | 'support' | 'expert' | 'observer';
      tasks: string[];
      deadline: Date;
    }>;
    communication_channel: string;
    sync_schedule: string;
  }> {
    
    // Identifier toutes les équipes impliquées
    const involved_teams = new Set<SpecializedTeam>();
    involved_teams.add(primary_alert.governance.specialized_team_required || 'fraude');
    
    related_alerts.forEach(alert => {
      if (alert.governance.specialized_team_required) {
        involved_teams.add(alert.governance.specialized_team_required);
      }
    });

    // Déterminer rôles selon expertise
    const coordination_plan = Array.from(involved_teams).map(team => {
      const team_capacity = this.team_capacities.find(tc => tc.team === team);
      const expertise_level = team_capacity?.expertise_level || 3;
      
      return {
        team: team,
        role: this.determineTeamRole(team, primary_alert.fraud_city_source, expertise_level),
        tasks: this.assignTeamTasks(team, primary_alert.fraud_city_source),
        deadline: new Date(Date.now() + (primary_alert.governance.sla_deadline.getTime() - Date.now()) * 0.8)
      };
    });

    return {
      coordination_plan: coordination_plan,
      communication_channel: `coord-${primary_alert.id}`,
      sync_schedule: this.determineSyncSchedule(coordination_plan.length)
    };
  }

  // === OPTIMISATION CHARGE TRAVAIL ===

  async optimizeWorkload(): Promise<{
    rebalancing_suggestions: Array<{
      from_team: SpecializedTeam;
      to_team: SpecializedTeam;
      alert_ids: string[];
      estimated_impact: string;
    }>;
    capacity_warnings: Array<{
      team: SpecializedTeam;
      current_load: number;
      predicted_load_24h: number;
      recommendation: string;
    }>;
  }> {
    
    const rebalancing_suggestions = [];
    const capacity_warnings = [];

    // Analyser charge par équipe
    for (const team_capacity of this.team_capacities) {
      
      // Warnings de capacité
      if (team_capacity.current_load > 85) {
        capacity_warnings.push({
          team: team_capacity.team,
          current_load: team_capacity.current_load,
          predicted_load_24h: team_capacity.current_load * 1.1, // Estimation simple
          recommendation: team_capacity.current_load > 95 ? 
            'Escalade immédiate requise' : 
            'Surveillance accrue recommandée'
        });
      }

      // Suggestions de rééquilibrage
      if (team_capacity.current_load > 90) {
        const backup_teams = this.findBackupTeams(team_capacity.team);
        const least_loaded = backup_teams.reduce((min, team) => {
          const capacity = this.team_capacities.find(tc => tc.team === team);
          return (!capacity || !min || (capacity.current_load < min.current_load)) ? capacity : min;
        }, null as TeamCapacity | null);

        if (least_loaded && least_loaded.current_load < 70) {
          rebalancing_suggestions.push({
            from_team: team_capacity.team,
            to_team: least_loaded.team,
            alert_ids: [`ALERT-${Date.now()}`], // Simulation
            estimated_impact: `Réduction charge ${team_capacity.team}: -15%, Augmentation ${least_loaded.team}: +10%`
          });
        }
      }
    }

    return { rebalancing_suggestions, capacity_warnings };
  }

  // === MÉTHODES PRIVÉES ===

  private initializeRoutingPolicies() {
    this.routing_policies = [
      
      // === CYBER FRAUDE : Expertise Spécialisée ===
      {
        city_source: 'cyber',
        business_district: 'auto',
        primary_team: 'cyber_fraud_team',
        backup_teams: ['compliance', 'automotive_fraud_team'],
        escalation_triggers: [
          { condition: 'affected_entities > 5', escalate_to: 'compliance', automatic: true },
          { condition: 'network_size > 10', escalate_to: 'expert', automatic: false }
        ],
        coordination_required: ['automotive_fraud_team'], // Coordination métier obligatoire
        complexity_factors: { 'network_size': 2.0, 'cross_portfolio': 1.5, 'external_actors': 1.8 }
      },

      // === DOCUMENTAIRE AUTO : Spécialisation Métier ===
      {
        city_source: 'documentaire',
        business_district: 'auto',
        primary_team: 'automotive_fraud_team',
        backup_teams: ['fraude', 'expert'],
        escalation_triggers: [
          { condition: 'amount > 10000', escalate_to: 'expert', automatic: false },
          { condition: 'recurrence = true', escalate_to: 'fraude', automatic: true }
        ],
        coordination_required: [], // Pas de coordination systématique
        complexity_factors: { 'amount': 1.2, 'document_complexity': 1.5, 'verification_required': 1.3 }
      },

      // === AML : Compliance Obligatoire ===
      {
        city_source: 'aml',
        business_district: 'auto',
        primary_team: 'compliance',
        backup_teams: ['fraude'],
        escalation_triggers: [
          { condition: 'pep_match = true', escalate_to: 'expert', automatic: true },
          { condition: 'sanctions_list = true', escalate_to: 'expert', automatic: true }
        ],
        coordination_required: ['automotive_fraud_team'], // Contexte métier requis
        complexity_factors: { 'regulatory_impact': 3.0, 'international': 2.0, 'politically_exposed': 2.5 }
      },

      // === COMPORTEMENTAL : Analyse Spécialisée ===
      {
        city_source: 'comportemental',
        business_district: 'auto',
        primary_team: 'behavior_analysis_team',
        backup_teams: ['automotive_fraud_team', 'fraude'],
        escalation_triggers: [
          { condition: 'pattern_confidence < 0.6', escalate_to: 'automotive_fraud_team', automatic: false },
          { condition: 'ml_drift_detected = true', escalate_to: 'expert', automatic: true }
        ],
        coordination_required: ['automotive_fraud_team'], // Validation métier
        complexity_factors: { 'pattern_novelty': 1.8, 'data_quality': 1.4, 'ml_confidence': 1.6 }
      }
      
      // TODO: Ajouter politiques pour autres districts (santé, habitation, etc.)
    ];
  }

  private initializeTeamCapacities() {
    this.team_capacities = [
      {
        team: 'cyber_fraud_team',
        current_load: 78,
        max_capacity: 15,
        avg_resolution_time: 48,
        expertise_level: 5,
        availability_hours: '24/7'
      },
      {
        team: 'automotive_fraud_team',
        current_load: 92,
        max_capacity: 25,
        avg_resolution_time: 36,
        expertise_level: 4,
        availability_hours: 'business_hours'
      },
      {
        team: 'compliance',
        current_load: 65,
        max_capacity: 12,
        avg_resolution_time: 72,
        expertise_level: 5,
        availability_hours: 'business_hours'
      },
      {
        team: 'behavior_analysis_team',
        current_load: 45,
        max_capacity: 8,
        avg_resolution_time: 24,
        expertise_level: 4,
        availability_hours: 'business_hours'
      },
      {
        team: 'fraude',
        current_load: 88,
        max_capacity: 30,
        avg_resolution_time: 48,
        expertise_level: 3,
        availability_hours: 'business_hours'
      },
      {
        team: 'expert',
        current_load: 35,
        max_capacity: 5,
        avg_resolution_time: 96,
        expertise_level: 5,
        availability_hours: 'on_demand'
      }
    ];
  }

  private findApplicablePolicy(city_source: FraudCitySource, business_district: BusinessDistrict): RoutingPolicy {
    const policy = this.routing_policies.find(p => 
      p.city_source === city_source && p.business_district === business_district
    );
    
    if (!policy) {
      // Fallback policy générique
      return {
        city_source: city_source,
        business_district: business_district,
        primary_team: 'fraude',
        backup_teams: ['gestionnaire'],
        escalation_triggers: [],
        coordination_required: [],
        complexity_factors: {}
      };
    }
    
    return policy;
  }

  private assessComplexity(alert: Alert, policy: RoutingPolicy): 'low' | 'medium' | 'high' | 'critical' {
    let complexity_score = 0;
    
    // Base score selon sévérité
    const severity_scores = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
    complexity_score += severity_scores[alert.severity];
    
    // Facteurs spécifiques à la politique
    for (const [factor, multiplier] of Object.entries(policy.complexity_factors)) {
      if (alert.metadata[factor as keyof typeof alert.metadata]) {
        complexity_score += multiplier;
      }
    }
    
    // Facteurs génériques
    if (alert.confidence < 0.6) complexity_score += 1;
    if (alert.metadata.amount && alert.metadata.amount > 5000) complexity_score += 1;
    if (alert.relatedAlertIds && alert.relatedAlertIds.length > 0) complexity_score += 1;
    
    // Conversion en niveau
    if (complexity_score >= 7) return 'critical';
    if (complexity_score >= 5) return 'high';
    if (complexity_score >= 3) return 'medium';
    return 'low';
  }

  private async selectOptimalTeam(
    policy: RoutingPolicy, 
    complexity: string, 
    alert: Alert
  ): Promise<{ team: SpecializedTeam; reason: string }> {
    
    // Équipe primaire par défaut
    let selected_team = policy.primary_team;
    let selection_reason = 'Équipe primaire selon politique';
    
    // Vérifier capacité équipe primaire
    const primary_capacity = this.team_capacities.find(tc => tc.team === policy.primary_team);
    
    if (primary_capacity && primary_capacity.current_load > 95) {
      // Chercher équipe backup disponible
      for (const backup_team of policy.backup_teams) {
        const backup_capacity = this.team_capacities.find(tc => tc.team === backup_team);
        if (backup_capacity && backup_capacity.current_load < 85) {
          selected_team = backup_team;
          selection_reason = `Équipe primaire saturée (${primary_capacity.current_load}%), basculement vers backup`;
          break;
        }
      }
    }
    
    // Pour les cas critiques, forcer vers expert si disponible
    if (complexity === 'critical' && alert.score > 90) {
      const expert_capacity = this.team_capacities.find(tc => tc.team === 'expert');
      if (expert_capacity && expert_capacity.current_load < 80) {
        selected_team = 'expert';
        selection_reason = 'Cas critique - escalade automatique vers expert';
      }
    }
    
    return { team: selected_team, reason: selection_reason };
  }

  private determineCoordinationNeeds(alert: Alert, policy: RoutingPolicy): SpecializedTeam[] {
    const coordination_teams = [...policy.coordination_required];
    
    // Ajouter coordination selon contexte
    if (alert.fraud_city_source === 'cyber' && alert.metadata.amount && alert.metadata.amount > 10000) {
      coordination_teams.push('compliance');
    }
    
    if (alert.relatedAlertIds && alert.relatedAlertIds.length > 2) {
      coordination_teams.push('fraude'); // Coordination centrale pour cas multiples
    }
    
    return [...new Set(coordination_teams)]; // Dédupliquer
  }

  private calculateAdaptiveSLA(alert: Alert, team_assignment: any, complexity: string): number {
    // SLA de base selon équipe
    const team_capacity = this.team_capacities.find(tc => tc.team === team_assignment.team);
    let base_sla = team_capacity?.avg_resolution_time || 48;
    
    // Ajustements selon complexité
    const complexity_multipliers = { 'low': 0.8, 'medium': 1.0, 'high': 1.3, 'critical': 1.6 };
    base_sla *= complexity_multipliers[complexity as keyof typeof complexity_multipliers];
    
    // Ajustements selon sévérité
    const severity_multipliers = { 'low': 1.2, 'medium': 1.0, 'high': 0.8, 'critical': 0.6 };
    base_sla *= severity_multipliers[alert.severity];
    
    return Math.round(base_sla);
  }

  private buildEscalationPath(policy: RoutingPolicy, complexity: string): SpecializedTeam[] {
    const path = [policy.primary_team];
    
    // Ajouter étapes selon complexité
    if (complexity === 'high' || complexity === 'critical') {
      path.push(...policy.backup_teams.slice(0, 1));
    }
    
    if (complexity === 'critical') {
      path.push('expert');
    }
    
    return [...new Set(path)];
  }

  private requiresApproval(alert: Alert, complexity: string): boolean {
    return complexity === 'critical' || 
           alert.score > 90 || 
           (alert.metadata.amount && alert.metadata.amount > 15000);
  }

  private calculatePriorityBoost(alert: Alert, complexity: string): number {
    let boost = 0;
    
    if (complexity === 'critical') boost += 2;
    else if (complexity === 'high') boost += 1;
    
    if (alert.fraud_city_source === 'cyber' || alert.fraud_city_source === 'aml') boost += 1;
    
    return Math.min(2, boost); // Max boost de 2
  }

  private getWorkflowForTeam(team: SpecializedTeam, city_source: FraudCitySource): string {
    return `${team}_${city_source}_workflow`;
  }

  private evaluateEscalationCondition(condition: string, alert: Alert): boolean {
    // Simulation évaluation condition (à implémenter avec vraie logique)
    if (condition.includes('amount >')) {
      const threshold = parseInt(condition.split('>')[1]);
      return (alert.metadata.amount || 0) > threshold;
    }
    return false;
  }

  private calculateSLARemaining(alert: Alert): number {
    const now = new Date();
    const deadline = alert.governance.sla_deadline;
    return Math.max(0, (deadline.getTime() - now.getTime()) / (1000 * 60 * 60)); // Heures
  }

  private determineTeamRole(team: SpecializedTeam, city_source: FraudCitySource, expertise: number): 'lead' | 'support' | 'expert' | 'observer' {
    if (expertise >= 5) return 'expert';
    if (city_source === 'cyber' && team === 'cyber_fraud_team') return 'lead';
    if (expertise >= 4) return 'support';
    return 'observer';
  }

  private assignTeamTasks(team: SpecializedTeam, city_source: FraudCitySource): string[] {
    const task_mapping = {
      'cyber_fraud_team': ['correlation_analysis', 'network_mapping', 'threat_assessment'],
      'compliance': ['regulatory_check', 'reporting_requirements', 'legal_review'],
      'automotive_fraud_team': ['document_verification', 'business_context_analysis'],
      'expert': ['forensic_analysis', 'final_recommendation', 'legal_opinion']
    };
    
    return task_mapping[team] || ['general_investigation'];
  }

  private determineSyncSchedule(team_count: number): string {
    if (team_count >= 4) return 'daily_sync';
    if (team_count >= 2) return 'every_48h';
    return 'weekly_sync';
  }

  private findBackupTeams(team: SpecializedTeam): SpecializedTeam[] {
    const policy = this.routing_policies.find(p => p.primary_team === team);
    return policy?.backup_teams || ['fraude'];
  }
}

// Export singleton instance
export const intelligentRoutingService = new IntelligentRoutingService();
export { IntelligentRoutingService };