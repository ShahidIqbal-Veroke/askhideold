import { 
  Demande, 
  DemandeStats, 
  DemandeFilters, 
  CreateDemandeRequest, 
  UpdateDemandeRequest,
  DemandeType,
  DemandeCategory,
  DemandeStatus,
  DemandePriority,
  DemandeChannel,
  DemandeOrigin,
  DemandeWorkflowRule
} from '@/types/demande.types';

// Mock data generator pour développement
const generateMockDemandes = (): Demande[] => {
  const mockDemandes: Demande[] = [];
  const types: DemandeType[] = [
    'souscription_contrat', 'modification_contrat', 'declaration_sinistre', 
    'reclamation', 'changement_coordonnees', 'demande_info'
  ];
  const categories: DemandeCategory[] = ['commercial', 'operationnel', 'sinistre', 'service_client'];
  const statuses: DemandeStatus[] = ['received', 'in_progress', 'pending_validation', 'completed'];
  const priorities: DemandePriority[] = ['low', 'medium', 'high', 'urgent'];
  const channels: DemandeChannel[] = ['web_portal', 'phone', 'email', 'mobile_app'];
  const origins: DemandeOrigin[] = ['client', 'prospect', 'intermediaire'];
  const gestionnaires = ['V. Dubois', 'M. Bernard', 'S. Laurent', 'A. Martin'];
  
  for (let i = 1; i <= 30; i++) {
    const createdDate = new Date();
    createdDate.setHours(createdDate.getHours() - Math.random() * 168); // Last week
    
    const type = types[Math.floor(Math.random() * types.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    
    // Calcul SLA selon type et priorité
    let delaiCommercial = 5; // jours par défaut
    if (priority === 'urgent') delaiCommercial = 1;
    else if (priority === 'high') delaiCommercial = 2;
    else if (type === 'declaration_sinistre') delaiCommercial = 3;
    
    const echeance = new Date(createdDate.getTime() + delaiCommercial * 24 * 60 * 60 * 1000);
    const respectSLA = status === 'completed' ? Math.random() > 0.2 : new Date() <= echeance;
    
    mockDemandes.push({
      id: `DEM-2024-${String(i).padStart(4, '0')}`,
      referenceExterne: `EXT-${i}`,
      numeroSuivi: `SUIVI-${String(8000 + i).padStart(6, '0')}`,
      
      type,
      category,
      status,
      priority,
      
      origin: origins[Math.floor(Math.random() * origins.length)],
      channel: channels[Math.floor(Math.random() * channels.length)],
      source: {
        userId: `user-${Math.floor(Math.random() * 100)}`,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      },
      
      demandeur: {
        assureId: `ASSURE-${String(Math.floor(Math.random() * 20) + 1).padStart(4, '0')}`,
        identite: {
          nom: ['Dupont', 'Martin', 'Bernard', 'Thomas'][Math.floor(Math.random() * 4)],
          prenom: ['Jean', 'Marie', 'Pierre', 'Sophie'][Math.floor(Math.random() * 4)],
          email: 'client@example.com',
          telephone: `0${Math.floor(Math.random() * 9) + 1}${Math.floor(Math.random() * 90000000) + 10000000}`,
        },
        qualite: ['assure', 'souscripteur', 'beneficiaire'][Math.floor(Math.random() * 3)] as any,
        authentifie: Math.random() > 0.1,
        verificationKYC: Math.random() > 0.2,
      },
      
      objet: `${type.replace('_', ' ')} - Demande client`,
      description: `Description détaillée pour la demande de type ${type}`,
      motivation: Math.random() > 0.5 ? 'Changement de situation personnelle' : undefined,
      
      donnees: {
        custom: {
          typeSpecifique: type,
          montantConcerne: type.includes('sinistre') ? Math.floor(Math.random() * 10000) + 1000 : undefined,
        }
      },
      
      contexte: {
        contratIds: [`CONT-${i}-1`],
        policyNumbers: [`POL-${2024000 + i}`],
        cycleVieIds: [`CYCLE-${i}`],
        montantConcerne: Math.random() > 0.5 ? Math.floor(Math.random() * 5000) + 500 : undefined,
        urgenceMetier: priority === 'urgent',
        impactClient: priority === 'urgent' ? 'high' : priority === 'high' ? 'medium' : 'low',
      },
      
      documents: Math.random() > 0.3 ? [
        {
          id: `DOC-${i}-1`,
          nom: 'justificatif.pdf',
          type: 'justificatif',
          taille: Math.floor(Math.random() * 1000000) + 100000,
          statut: ['validated', 'pending', 'rejected'][Math.floor(Math.random() * 3)] as any,
          obligatoire: true,
          uploadedAt: createdDate,
          uploadedBy: 'client',
        }
      ] : [],
      
      workflow: {
        etapeActuelle: status === 'received' ? 'reception' : 
                      status === 'in_progress' ? 'traitement' :
                      status === 'pending_validation' ? 'validation' : 'cloture',
        etapesSuivantes: status === 'completed' ? [] : ['validation', 'cloture'],
        validationsRequises: status === 'pending_validation' ? [
          {
            type: 'validation_gestionnaire',
            valideur: 'gestionnaire',
            obligatoire: true,
            deadline: echeance,
          }
        ] : [],
        escalations: priority === 'urgent' ? [
          {
            declencheur: 'delai_depasse',
            vers: 'superviseur',
            delai: 24,
            automatique: true,
          }
        ] : [],
      },
      
      sla: {
        dateReception: createdDate,
        delaiCommercial,
        dateEcheance: echeance,
        dateTraitement: status === 'completed' ? new Date(createdDate.getTime() + Math.random() * delaiCommercial * 24 * 60 * 60 * 1000) : undefined,
        respectSLA,
      },
      
      communications: [
        {
          id: `COMM-${i}-1`,
          type: 'email',
          direction: 'inbound',
          contenu: 'Demande initiale du client',
          expediteur: 'client',
          destinataire: 'service',
          timestamp: createdDate,
          lue: true,
          reponseRequise: status !== 'completed',
        }
      ],
      
      relations: {
        assureId: `ASSURE-${String(Math.floor(Math.random() * 20) + 1).padStart(4, '0')}`,
        cycleVieIds: [`CYCLE-${i}`],
        demandesLiees: Math.random() > 0.7 ? [`DEM-2024-${String(i + 1).padStart(4, '0')}`] : [],
      },
      
      historiqueId: Math.random() > 0.3 ? `HIST-${i}` : undefined,
      
      traitement: {
        assigneA: Math.random() > 0.3 ? gestionnaires[Math.floor(Math.random() * gestionnaires.length)] : undefined,
        equipeTraitante: ['gestion_client', 'sinistres', 'souscription'][Math.floor(Math.random() * 3)],
        dateAssignation: status !== 'received' ? new Date(createdDate.getTime() + Math.random() * 24 * 60 * 60 * 1000) : undefined,
        historiqueTRaitement: [
          {
            date: createdDate,
            action: 'reception_demande',
            auteur: 'system',
            commentaire: 'Demande reçue et enregistrée',
          }
        ],
        
        decision: status === 'completed' ? {
          type: ['accepte', 'refuse', 'accepte_avec_reserves'][Math.floor(Math.random() * 3)] as any,
          motif: 'Traitement standard de la demande',
          dateDecision: new Date(),
          decideur: gestionnaires[Math.floor(Math.random() * gestionnaires.length)],
        } : undefined,
      },
      
      qualite: {
        noteComplexite: Math.floor(Math.random() * 5) + 1,
        tempsTraitement: Math.floor(Math.random() * 120) + 30, // minutes
        nombreAllerRetours: Math.floor(Math.random() * 3),
        erreurs: [],
        satisfaction: status === 'completed' && Math.random() > 0.3 ? {
          note: Math.floor(Math.random() * 3) + 3, // 3-5
          commentaire: 'Service satisfaisant',
          dateEnquete: new Date(),
          recommanderait: Math.random() > 0.2,
        } : undefined,
      },
      
      metrics: {
        scoreUrgence: priority === 'urgent' ? 90 : priority === 'high' ? 70 : 40,
        scoreComplexite: Math.floor(Math.random() * 100),
        impactBusiness: Math.floor(Math.random() * 100),
        coutTraitement: Math.floor(Math.random() * 200) + 50,
        valeurClient: Math.floor(Math.random() * 5000) + 1000,
        rentabilite: Math.floor(Math.random() * 1000) - 500, // Peut être négatif
      },
      
      conformite: {
        respectProcedure: Math.random() > 0.1,
        controles: [
          {
            type: 'conformite_generale',
            resultat: 'conforme',
            date: createdDate,
            controleur: 'system',
          }
        ],
        archivage: {
          dureeConservation: 7,
          categorieArchive: 'demande_client',
        },
      },
      
      metadata: {
        version: 1,
        tags: [type, category],
        flags: priority === 'urgent' ? ['urgent'] : [],
        customFields: {},
      },
      
      createdAt: createdDate,
      createdBy: 'client',
      updatedAt: createdDate,
      lastModifiedBy: 'system',
      
      versionsHistory: [
        {
          version: 1,
          modifiedAt: createdDate,
          modifiedBy: 'system',
          changesDescription: 'Création initiale',
        }
      ],
    });
  }
  
  return mockDemandes;
};

class DemandeService {
  private demandes: Demande[] = [];
  private workflowRules: DemandeWorkflowRule[] = [];
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (!this.initialized) {
      this.demandes = generateMockDemandes();
      this.initializeWorkflowRules();
      this.initialized = true;
    }
  }

  private initializeWorkflowRules() {
    this.workflowRules = [
      {
        id: 'urgent-auto-assign',
        name: 'Assignation automatique urgent',
        demandeTypes: ['declaration_sinistre', 'reclamation'],
        conditions: [
          { field: 'priority', operator: 'equals', value: 'urgent' }
        ],
        actions: [
          { type: 'assign', target: 'V. Dubois', delay: 0 },
          { type: 'notify', target: 'superviseur', delay: 5 }
        ],
        active: true,
        priority: 1,
      }
    ];
  }

  // === CRUD OPERATIONS ===

  async createDemande(request: CreateDemandeRequest, userId: string): Promise<Demande> {
    const newDemande: Demande = {
      id: `DEM-${Date.now()}`,
      referenceExterne: request.demandeur.identite.nom + '-' + Date.now(),
      numeroSuivi: `SUIVI-${String(900000 + this.demandes.length + 1).padStart(6, '0')}`,
      
      type: request.type,
      category: request.category,
      status: 'received',
      priority: request.priority,
      
      origin: request.origin,
      channel: request.channel,
      source: {
        userId,
        ipAddress: '192.168.1.1', // À récupérer du contexte réel
      },
      
      demandeur: request.demandeur,
      objet: request.objet,
      description: request.description,
      contexte: request.contexte || {
        contratIds: [],
        policyNumbers: [],
        cycleVieIds: [],
        urgenceMetier: request.priority === 'urgent',
        impactClient: request.priority === 'urgent' ? 'high' : 'medium',
      },
      
      donnees: request.donnees || {},
      documents: request.documents || [],
      
      workflow: {
        etapeActuelle: 'reception',
        etapesSuivantes: ['traitement'],
        validationsRequises: [],
        escalations: [],
      },
      
      sla: {
        dateReception: new Date(),
        delaiCommercial: this.calculateSLA(request.type, request.priority),
        dateEcheance: new Date(Date.now() + this.calculateSLA(request.type, request.priority) * 24 * 60 * 60 * 1000),
        respectSLA: true,
      },
      
      communications: [],
      relations: {
        assureId: request.demandeur.assureId,
        cycleVieIds: [],
        demandesLiees: [],
      },
      
      traitement: {
        assigneA: request.assigneA,
        equipeTraitante: this.getDefaultTeam(request.category),
        historiqueTRaitement: [
          {
            date: new Date(),
            action: 'creation_demande',
            auteur: userId,
            commentaire: 'Demande créée',
          }
        ],
      },
      
      qualite: {
        noteComplexite: 3, // Par défaut
        tempsTraitement: 0,
        nombreAllerRetours: 0,
        erreurs: [],
      },
      
      metrics: {
        scoreUrgence: this.calculateUrgencyScore(request.priority, request.type),
        scoreComplexite: 50, // Par défaut
        impactBusiness: 50,
        coutTraitement: 0,
        valeurClient: 1000, // À calculer selon l'assuré
        rentabilite: 0,
      },
      
      conformite: {
        respectProcedure: true,
        controles: [],
        archivage: {
          dureeConservation: this.getRetentionPeriod(request.type),
          categorieArchive: request.category,
        },
      },
      
      metadata: {
        version: 1,
        tags: [request.type, request.category],
        flags: request.priority === 'urgent' ? ['urgent'] : [],
        customFields: request.metadata || {},
      },
      
      createdAt: new Date(),
      createdBy: userId,
      updatedAt: new Date(),
      lastModifiedBy: userId,
      
      versionsHistory: [
        {
          version: 1,
          modifiedAt: new Date(),
          modifiedBy: userId,
          changesDescription: 'Création initiale',
        }
      ],
    };

    // Appliquer les règles de workflow
    this.applyWorkflowRules(newDemande);
    
    this.demandes.unshift(newDemande);
    return newDemande;
  }

  async getDemandes(filters?: DemandeFilters): Promise<Demande[]> {
    let filtered = [...this.demandes];

    if (filters) {
      if (filters.types) {
        filtered = filtered.filter(d => filters.types!.includes(d.type));
      }
      if (filters.statuses) {
        filtered = filtered.filter(d => filters.statuses!.includes(d.status));
      }
      if (filters.priorities) {
        filtered = filtered.filter(d => filters.priorities!.includes(d.priority));
      }
      if (filters.assureId) {
        filtered = filtered.filter(d => d.relations.assureId === filters.assureId);
      }
      if (filters.assigneA) {
        filtered = filtered.filter(d => d.traitement.assigneA === filters.assigneA);
      }
      if (filters.enRetard) {
        const now = new Date();
        filtered = filtered.filter(d => !d.sla.respectSLA || d.sla.dateEcheance < now);
      }
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(d => 
          d.objet.toLowerCase().includes(term) ||
          d.description.toLowerCase().includes(term) ||
          d.numeroSuivi.toLowerCase().includes(term)
        );
      }
    }

    return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getDemande(id: string): Promise<Demande | null> {
    return this.demandes.find(d => d.id === id) || null;
  }

  async updateDemande(request: UpdateDemandeRequest, userId: string): Promise<Demande | null> {
    const demandeIndex = this.demandes.findIndex(d => d.id === request.demandeId);
    if (demandeIndex === -1) return null;

    const existingDemande = this.demandes[demandeIndex];
    const now = new Date();

    const updatedDemande: Demande = {
      ...existingDemande,
      status: request.newStatus || existingDemande.status,
      priority: request.newPriority || existingDemande.priority,
      traitement: {
        ...existingDemande.traitement,
        assigneA: request.assigneA || existingDemande.traitement.assigneA,
        historiqueTRaitement: [
          ...existingDemande.traitement.historiqueTRaitement,
          ...(request.addTraitement ? [request.addTraitement] : [])
        ],
        decision: request.setDecision || existingDemande.traitement.decision,
      },
      documents: request.addDocument ? 
        [...existingDemande.documents, request.addDocument] : 
        existingDemande.documents,
      communications: request.addCommunication ?
        [...existingDemande.communications, request.addCommunication] :
        existingDemande.communications,
      metadata: {
        ...existingDemande.metadata,
        version: existingDemande.metadata.version + 1,
        customFields: { ...existingDemande.metadata.customFields, ...request.updateMetadata },
      },
      updatedAt: now,
      lastModifiedBy: userId,
      versionsHistory: [
        ...existingDemande.versionsHistory,
        {
          version: existingDemande.metadata.version + 1,
          modifiedAt: now,
          modifiedBy: userId,
          changesDescription: `Mise à jour: ${Object.keys(request).join(', ')}`,
        }
      ],
    };

    this.demandes[demandeIndex] = updatedDemande;
    return updatedDemande;
  }

  // === WORKFLOW LOGIC ===

  private applyWorkflowRules(demande: Demande): void {
    for (const rule of this.workflowRules.filter(r => r.active)) {
      if (this.matchesRule(demande, rule)) {
        this.executeRuleActions(demande, rule);
      }
    }
  }

  private matchesRule(demande: Demande, rule: DemandeWorkflowRule): boolean {
    if (!rule.demandeTypes.includes(demande.type)) return false;
    
    return rule.conditions.every(condition => {
      const value = this.getFieldValue(demande, condition.field);
      switch (condition.operator) {
        case 'equals': return value === condition.value;
        default: return false;
      }
    });
  }

  private executeRuleActions(demande: Demande, rule: DemandeWorkflowRule): void {
    for (const action of rule.actions) {
      switch (action.type) {
        case 'assign':
          demande.traitement.assigneA = action.target;
          break;
        case 'escalate':
          demande.workflow.escalations.push({
            declencheur: 'rule_triggered',
            vers: action.target,
            delai: action.delay || 0,
            automatique: true,
          });
          break;
      }
    }
  }

  private getFieldValue(demande: Demande, field: string): any {
    // Simple field access pour l'exemple
    return (demande as any)[field];
  }

  // === TRANSFORMATION EN HISTORIQUE ===

  async convertToHistorique(demandeId: string): Promise<string | null> {
    const demande = await this.getDemande(demandeId);
    if (!demande) return null;

    // Import dynamique pour éviter la dépendance circulaire
    const { historiqueService } = await import('./historiqueService');
    
    const historiqueId = await historiqueService.createFromDemande(demande);
    
    // Marquer la demande comme archivée
    await this.updateDemande({
      demandeId,
      updateMetadata: { archived: true, historiqueId }
    }, 'system');
    
    return historiqueId;
  }

  // === BUSINESS LOGIC ===

  private calculateSLA(type: DemandeType, priority: DemandePriority): number {
    let baseSLA = 5; // jours
    
    switch (type) {
      case 'declaration_sinistre': baseSLA = 3; break;
      case 'reclamation': baseSLA = 7; break;
      case 'demande_info': baseSLA = 2; break;
    }
    
    switch (priority) {
      case 'urgent': return 1;
      case 'high': return Math.max(1, Math.floor(baseSLA / 2));
      case 'medium': return baseSLA;
      case 'low': return baseSLA * 2;
      default: return baseSLA;
    }
  }

  private getDefaultTeam(category: DemandeCategory): string {
    switch (category) {
      case 'commercial': return 'equipe_commerciale';
      case 'sinistre': return 'equipe_sinistres';
      case 'service_client': return 'service_client';
      case 'compliance': return 'equipe_compliance';
      default: return 'gestion_generale';
    }
  }

  private calculateUrgencyScore(priority: DemandePriority, type: DemandeType): number {
    let score = 50; // Base
    
    switch (priority) {
      case 'urgent': score += 40; break;
      case 'high': score += 25; break;
      case 'medium': score += 0; break;
      case 'low': score -= 20; break;
    }
    
    if (type === 'declaration_sinistre') score += 20;
    if (type === 'reclamation') score += 15;
    
    return Math.min(100, Math.max(0, score));
  }

  private getRetentionPeriod(type: DemandeType): number {
    switch (type) {
      case 'declaration_sinistre': return 10; // années
      case 'souscription_contrat': return 7;
      case 'reclamation': return 3;
      default: return 5;
    }
  }

  // === STATISTICS ===

  async getStats(): Promise<DemandeStats> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const stats: DemandeStats = {
      total: this.demandes.length,
      byType: {} as any,
      byCategory: {} as any,
      byStatus: {} as any,
      byPriority: {} as any,
      byChannel: {} as any,
      byOrigin: {} as any,
      
      slaMetrics: {
        totalRespectSLA: (this.demandes.filter(d => d.sla.respectSLA).length / this.demandes.length) * 100,
        delaiMoyenTraitement: this.demandes
          .filter(d => d.sla.dateTraitement)
          .reduce((sum, d) => sum + ((d.sla.dateTraitement!.getTime() - d.sla.dateReception.getTime()) / (24 * 60 * 60 * 1000)), 0) / 
          this.demandes.filter(d => d.sla.dateTraitement).length || 0,
        enRetard: this.demandes.filter(d => !d.sla.respectSLA).length,
        aEcheance: this.demandes.filter(d => {
          const heures24 = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          return d.sla.dateEcheance <= heures24 && d.status !== 'completed';
        }).length,
      },
      
      qualityMetrics: {
        satisfactionMoyenne: this.demandes
          .filter(d => d.qualite.satisfaction)
          .reduce((sum, d) => sum + d.qualite.satisfaction!.note, 0) / 
          this.demandes.filter(d => d.qualite.satisfaction).length || 0,
        tauxPremierContact: (this.demandes.filter(d => d.qualite.nombreAllerRetours === 0).length / this.demandes.length) * 100,
        tauxErreur: (this.demandes.filter(d => d.qualite.erreurs.length > 0).length / this.demandes.length) * 100,
        complexiteMoyenne: this.demandes.reduce((sum, d) => sum + d.qualite.noteComplexite, 0) / this.demandes.length,
      },
      
      businessMetrics: {
        valeurTotale: this.demandes.reduce((sum, d) => sum + (d.contexte.montantConcerne || 0), 0),
        coutTotalTraitement: this.demandes.reduce((sum, d) => sum + d.metrics.coutTraitement, 0),
        rentabiliteMoyenne: this.demandes.reduce((sum, d) => sum + d.metrics.rentabilite, 0) / this.demandes.length,
        impactChiffreAffaires: this.demandes.reduce((sum, d) => sum + d.metrics.valeurClient, 0),
      },
      
      trends: {
        evolutionVolume: [], // À implémenter avec données historiques
        tendancesEmergentes: [],
        cannauxEnCroissance: [],
        typesEnDeclin: [],
      },
      
      performanceEquipes: [], // À implémenter
    };

    // Remplir les compteurs par catégorie
    this.demandes.forEach(demande => {
      stats.byType[demande.type] = (stats.byType[demande.type] || 0) + 1;
      stats.byCategory[demande.category] = (stats.byCategory[demande.category] || 0) + 1;
      stats.byStatus[demande.status] = (stats.byStatus[demande.status] || 0) + 1;
      stats.byPriority[demande.priority] = (stats.byPriority[demande.priority] || 0) + 1;
      stats.byChannel[demande.channel] = (stats.byChannel[demande.channel] || 0) + 1;
      stats.byOrigin[demande.origin] = (stats.byOrigin[demande.origin] || 0) + 1;
    });

    return stats;
  }
}

// Export singleton instance
export const demandeService = new DemandeService();