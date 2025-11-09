import { 
  Historique, 
  HistoriqueStats, 
  HistoriqueFilters, 
  CreateHistoriqueRequest, 
  UpdateHistoriqueRequest,
  HistoriqueEventType,
  HistoriqueCategory,
  HistoriqueSource,
  HistoriqueImpact,
  HistoriqueTimeline,
  HistoriquePattern
} from '@/types/historique.types';
import { Demande } from '@/types/demande.types';

// Mock data generator pour développement
const generateMockHistoriques = (): Historique[] => {
  const mockHistoriques: Historique[] = [];
  const eventTypes: HistoriqueEventType[] = [
    'creation_assure', 'souscription_contrat', 'declaration_sinistre', 'alerte_generee',
    'contact_client', 'paiement_prime', 'modification_contrat', 'document_recu'
  ];
  const categories: HistoriqueCategory[] = ['commercial', 'operationnel', 'fraude', 'sinistre', 'compliance'];
  const sources: HistoriqueSource[] = ['user_action', 'system_automatic', 'external_api', 'webhook'];
  const impacts: HistoriqueImpact[] = ['low', 'medium', 'high', 'critical'];
  const users = ['V. Dubois', 'M. Bernard', 'S. Laurent', 'A. Martin', 'system'];
  
  for (let i = 1; i <= 50; i++) {
    const createdDate = new Date();
    createdDate.setHours(createdDate.getHours() - Math.random() * 720); // Last month
    
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const source = sources[Math.floor(Math.random() * sources.length)];
    const impact = impacts[Math.floor(Math.random() * impacts.length)];
    const triggeredBy = users[Math.floor(Math.random() * users.length)];
    
    const status = Math.random() > 0.3 ? 'completed' : 'active';
    
    mockHistoriques.push({
      id: `HIST-2024-${String(i).padStart(4, '0')}`,
      assureId: `ASSURE-${String(Math.floor(Math.random() * 20) + 1).padStart(4, '0')}`,
      cycleVieId: Math.random() > 0.5 ? `CYCLE-${Math.floor(Math.random() * 10) + 1}` : undefined,
      demandeId: Math.random() > 0.6 ? `DEM-2024-${String(Math.floor(Math.random() * 30) + 1).padStart(4, '0')}` : undefined,
      
      eventType,
      category,
      source,
      impact,
      
      title: generateEventTitle(eventType, i),
      description: generateEventDescription(eventType, category),
      shortSummary: generateShortSummary(eventType),
      
      businessContext: {
        contractId: `CONT-${i}`,
        policyNumber: `POL-${2024000 + i}`,
        amount: eventType.includes('paiement') || eventType.includes('sinistre') ? 
          Math.floor(Math.random() * 5000) + 500 : undefined,
        currency: 'EUR',
        lineOfBusiness: ['Auto', 'Habitation', 'Santé'][Math.floor(Math.random() * 3)],
      },
      
      triggeredBy: triggeredBy === 'system' ? 'system' : `user-${i}`,
      triggeredByName: triggeredBy,
      triggeredByRole: triggeredBy === 'system' ? 'system' : 
        ['gestionnaire', 'superviseur', 'expert'][Math.floor(Math.random() * 3)],
      affectedUsers: Math.random() > 0.7 ? [`user-${i + 1}`, `user-${i + 2}`] : undefined,
      
      relatedEntities: {
        alerteIds: eventType === 'alerte_generee' ? [`ALERT-2024-${String(i).padStart(4, '0')}`] : undefined,
        dossierIds: category === 'fraude' ? [`CASE-2024-${String(i).padStart(4, '0')}`] : undefined,
        demandeIds: Math.random() > 0.7 ? [`DEM-2024-${String(i).padStart(4, '0')}`] : undefined,
        contractIds: [`CONT-${i}`],
      },
      
      metadata: generateMetadataForType(category, eventType),
      
      status,
      requiresAction: status === 'active' && Math.random() > 0.6,
      actionRequired: status === 'active' && Math.random() > 0.6 ? 
        'Validation manuelle requise' : undefined,
      dueDate: status === 'active' && Math.random() > 0.6 ? 
        new Date(createdDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined,
      completedAt: status === 'completed' ? 
        new Date(createdDate.getTime() + Math.random() * 24 * 60 * 60 * 1000) : undefined,
      
      rawData: {
        sourceSystem: source === 'external_api' ? 'external-system' : 'internal',
        correlationId: `corr-${i}`,
      },
      enrichedData: {
        riskScore: Math.floor(Math.random() * 100),
        priority: impact,
      },
      
      location: source === 'user_action' ? {
        ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
        country: 'France',
        city: ['Paris', 'Lyon', 'Marseille'][Math.floor(Math.random() * 3)],
      } : undefined,
      
      createdAt: createdDate,
      updatedAt: status === 'completed' ? 
        new Date(createdDate.getTime() + Math.random() * 24 * 60 * 60 * 1000) : createdDate,
      version: 1,
      
      insights: Math.random() > 0.5 ? {
        sentiment: ['positive', 'neutral', 'negative'][Math.floor(Math.random() * 3)] as any,
        keywords: ['fraude', 'sinistre', 'contrat', 'paiement'].slice(0, Math.floor(Math.random() * 3) + 1),
        suggestedActions: status === 'active' ? ['Vérifier documents', 'Contacter assuré'] : undefined,
      } : undefined,
    });
  }
  
  return mockHistoriques.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

// Helper methods for mock data generation
function generateEventTitle(eventType: HistoriqueEventType, index: number): string {
  const titles = {
    creation_assure: `Création du profil assuré ${index}`,
    souscription_contrat: `Souscription contrat auto n°${2024000 + index}`,
    declaration_sinistre: `Déclaration sinistre SIN-2024-${8800 + index}`,
    alerte_generee: `Alerte fraude documentaire générée`,
    contact_client: `Contact client pour clarification`,
    paiement_prime: `Paiement prime mensuelle`,
    modification_contrat: `Modification garanties contrat`,
    document_recu: `Réception document justificatif`,
  };
  return titles[eventType] || `Événement ${eventType}`;
}

function generateEventDescription(eventType: HistoriqueEventType, category: HistoriqueCategory): string {
  const descriptions = {
    creation_assure: 'Création automatique du profil assuré suite à souscription en ligne',
    souscription_contrat: 'Nouvelle souscription contrat automobile avec garanties étendues',
    declaration_sinistre: 'Déclaration sinistre automobile avec dégâts matériels estimés',
    alerte_generee: 'Système de détection automatique a identifié des anomalies documentaires',
    contact_client: 'Prise de contact client pour vérification informations complémentaires',
    paiement_prime: 'Règlement automatique prime mensuelle par prélèvement',
    modification_contrat: 'Modification des garanties suite à demande client',
    document_recu: 'Réception et traitement document justificatif client',
  };
  return descriptions[eventType] || `Événement de catégorie ${category}`;
}

function generateShortSummary(eventType: HistoriqueEventType): string {
  const summaries = {
    creation_assure: 'Profil créé',
    souscription_contrat: 'Contrat souscrit',
    declaration_sinistre: 'Sinistre déclaré',
    alerte_generee: 'Alerte fraude',
    contact_client: 'Contact client',
    paiement_prime: 'Prime payée',
    modification_contrat: 'Contrat modifié',
    document_recu: 'Document reçu',
  };
  return summaries[eventType] || 'Événement traité';
}

function generateMetadataForType(category: HistoriqueCategory, eventType: HistoriqueEventType): any {
  const baseMetadata = { custom: {} };
  
  switch (category) {
    case 'commercial':
      return {
        ...baseMetadata,
        commercial: {
          opportunityValue: Math.floor(Math.random() * 5000) + 1000,
          productType: 'assurance_auto',
          salesPerson: 'V. Dubois',
        }
      };
    case 'fraude':
      return {
        ...baseMetadata,
        fraude: {
          riskScore: Math.floor(Math.random() * 100),
          fraudType: 'document_falsifie',
          detectionMethod: 'automatic_analysis',
          evidenceLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        }
      };
    case 'sinistre':
      return {
        ...baseMetadata,
        sinistre: {
          sinistreType: 'collision',
          estimatedAmount: Math.floor(Math.random() * 8000) + 1000,
          complexity: ['simple', 'medium', 'complex'][Math.floor(Math.random() * 3)],
        }
      };
    default:
      return baseMetadata;
  }
}

class HistoriqueService {
  private historiques: Historique[] = [];
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (!this.initialized) {
      this.historiques = generateMockHistoriques();
      this.initialized = true;
    }
  }

  // === CRÉATION DEPUIS DEMANDE ===

  async createFromDemande(demande: Demande): Promise<string> {
    const historiqueId = `HIST-${Date.now()}`;
    
    const historique: Historique = {
      id: historiqueId,
      assureId: demande.relations.assureId || 'unknown',
      cycleVieId: demande.relations.cycleVieIds[0],
      demandeId: demande.id,
      
      eventType: this.mapDemandeTypeToEventType(demande.type),
      category: this.mapDemandeCategoryToHistoriqueCategory(demande.category),
      source: this.mapDemandeChannelToSource(demande.channel),
      impact: this.calculateImpactFromDemande(demande),
      
      title: `${demande.objet} - Demande traitée`,
      description: `Demande de type "${demande.type}" traitée avec succès. ${demande.description}`,
      shortSummary: `Demande ${demande.type} traitée`,
      
      businessContext: {
        contractId: demande.contexte.contratIds[0],
        policyNumber: demande.contexte.policyNumbers[0],
        sinistreNumber: demande.contexte.sinistreNumber,
        amount: demande.contexte.montantConcerne,
        currency: 'EUR',
        lineOfBusiness: this.inferLineOfBusiness(demande.type),
      },
      
      triggeredBy: demande.lastModifiedBy,
      triggeredByName: demande.lastModifiedBy, // TODO: Get real name
      triggeredByRole: demande.traitement.equipeTraitante,
      
      relatedEntities: {
        demandeIds: [demande.id],
        contractIds: demande.contexte.contratIds,
      },
      
      metadata: {
        operational: {
          processId: demande.workflow.etapeActuelle,
          duration: demande.qualite.tempsTraitement,
          automationLevel: demande.channel === 'api' ? 'full_auto' : 'manual',
        },
        custom: {
          originalDemande: {
            numeroSuivi: demande.numeroSuivi,
            priority: demande.priority,
            slaRespected: demande.sla.respectSLA,
            satisfaction: demande.qualite.satisfaction?.note,
          }
        }
      },
      
      status: 'completed',
      requiresAction: false,
      completedAt: new Date(),
      
      rawData: {
        sourceDemande: demande,
      },
      enrichedData: {
        riskScore: demande.metrics.scoreComplexite,
        businessValue: demande.metrics.valeurClient,
        roi: demande.metrics.rentabilite,
      },
      
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      
      insights: {
        sentiment: demande.qualite.satisfaction ? 
          (demande.qualite.satisfaction.note >= 4 ? 'positive' : 
           demande.qualite.satisfaction.note >= 3 ? 'neutral' : 'negative') : 'neutral',
        keywords: [demande.type, demande.category, demande.priority],
        suggestedActions: demande.qualite.erreurs.length > 0 ? 
          ['Analyser erreurs', 'Améliorer processus'] : undefined,
      },
    };
    
    this.historiques.unshift(historique);
    console.log(`✅ Historique ${historiqueId} créé depuis demande ${demande.id}`);
    
    return historiqueId;
  }

  // === CRUD OPERATIONS ===

  async createHistorique(request: CreateHistoriqueRequest, userId: string): Promise<Historique> {
    const newHistorique: Historique = {
      id: `HIST-${Date.now()}`,
      assureId: request.assureId,
      cycleVieId: request.cycleVieId,
      
      eventType: request.eventType,
      category: request.category,
      source: request.source,
      impact: request.impact,
      
      title: request.title,
      description: request.description,
      
      businessContext: request.businessContext,
      
      triggeredBy: userId,
      triggeredByName: userId, // TODO: Get real name
      triggeredByRole: 'user',
      
      relatedEntities: request.relatedEntities || {},
      metadata: request.metadata || {},
      
      status: 'active',
      requiresAction: request.requiresAction || false,
      actionRequired: request.actionRequired,
      dueDate: request.dueDate,
      
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    };

    this.historiques.unshift(newHistorique);
    return newHistorique;
  }

  async getHistoriques(filters?: HistoriqueFilters): Promise<Historique[]> {
    let filtered = [...this.historiques];

    if (filters) {
      if (filters.assureId) {
        filtered = filtered.filter(h => h.assureId === filters.assureId);
      }
      if (filters.cycleVieId) {
        filtered = filtered.filter(h => h.cycleVieId === filters.cycleVieId);
      }
      if (filters.eventTypes) {
        filtered = filtered.filter(h => filters.eventTypes!.includes(h.eventType));
      }
      if (filters.categories) {
        filtered = filtered.filter(h => filters.categories!.includes(h.category));
      }
      if (filters.sources) {
        filtered = filtered.filter(h => filters.sources!.includes(h.source));
      }
      if (filters.statuses) {
        filtered = filtered.filter(h => filters.statuses!.includes(h.status));
      }
      if (filters.requiresAction !== undefined) {
        filtered = filtered.filter(h => h.requiresAction === filters.requiresAction);
      }
      if (filters.dateFrom) {
        filtered = filtered.filter(h => h.createdAt >= filters.dateFrom!);
      }
      if (filters.dateTo) {
        filtered = filtered.filter(h => h.createdAt <= filters.dateTo!);
      }
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(h => 
          h.title.toLowerCase().includes(term) ||
          h.description.toLowerCase().includes(term)
        );
      }
    }

    return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getHistorique(id: string): Promise<Historique | null> {
    return this.historiques.find(h => h.id === id) || null;
  }

  async updateHistorique(request: UpdateHistoriqueRequest, userId: string): Promise<Historique | null> {
    const historiqueIndex = this.historiques.findIndex(h => h.id === request.historiqueId);
    if (historiqueIndex === -1) return null;

    const existingHistorique = this.historiques[historiqueIndex];
    const now = new Date();

    const updatedHistorique: Historique = {
      ...existingHistorique,
      status: request.status || existingHistorique.status,
      completedAt: request.completedAt || (request.status === 'completed' ? now : existingHistorique.completedAt),
      metadata: request.updateMetadata ? 
        { ...existingHistorique.metadata, ...request.updateMetadata } : 
        existingHistorique.metadata,
      corrections: request.addCorrection ? 
        [...(existingHistorique.corrections || []), {
          correctedAt: now,
          correctedBy: userId,
          reason: request.addCorrection.reason,
          oldValue: request.addCorrection.oldValue,
          newValue: request.addCorrection.newValue,
        }] : existingHistorique.corrections,
      updatedAt: now,
      version: existingHistorique.version + 1,
    };

    this.historiques[historiqueIndex] = updatedHistorique;
    return updatedHistorique;
  }

  // === TIMELINE ET AGGREGATIONS ===

  async getTimelineForAssure(assureId: string): Promise<HistoriqueTimeline> {
    const events = await this.getHistoriques({ assureId });
    
    if (events.length === 0) {
      return {
        assureId,
        events: [],
        groupedByDate: {},
        groupedByCategory: {} as Record<HistoriqueCategory, Historique[]>,
        groupedByCycle: {},
        totalEvents: 0,
        dateRange: {
          start: new Date(),
          end: new Date(),
          durationDays: 0,
        },
        activityLevel: 'low',
        patterns: {
          mostActiveCategory: 'technique',
          averageEventsPerMonth: 0,
          peakActivityPeriods: [],
        },
      };
    }

    const sortedEvents = events.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const startDate = sortedEvents[0].createdAt;
    const endDate = sortedEvents[sortedEvents.length - 1].createdAt;
    const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));

    // Group by date
    const groupedByDate: Record<string, Historique[]> = {};
    events.forEach(event => {
      const dateKey = event.createdAt.toISOString().split('T')[0];
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = [];
      }
      groupedByDate[dateKey].push(event);
    });

    // Group by category
    const groupedByCategory: Record<HistoriqueCategory, Historique[]> = {} as any;
    events.forEach(event => {
      if (!groupedByCategory[event.category]) {
        groupedByCategory[event.category] = [];
      }
      groupedByCategory[event.category].push(event);
    });

    // Group by cycle
    const groupedByCycle: Record<string, Historique[]> = {};
    events.forEach(event => {
      const cycleKey = event.cycleVieId || 'no_cycle';
      if (!groupedByCycle[cycleKey]) {
        groupedByCycle[cycleKey] = [];
      }
      groupedByCycle[cycleKey].push(event);
    });

    // Calculate activity level
    const eventsPerDay = events.length / Math.max(durationDays, 1);
    const activityLevel = eventsPerDay > 2 ? 'very_high' : 
                         eventsPerDay > 1 ? 'high' : 
                         eventsPerDay > 0.5 ? 'medium' : 'low';

    // Find most active category
    const categoryCount = Object.entries(groupedByCategory)
      .sort(([,a], [,b]) => b.length - a.length);
    const mostActiveCategory = categoryCount[0]?.[0] as HistoriqueCategory || 'technique';

    return {
      assureId,
      events,
      groupedByDate,
      groupedByCategory,
      groupedByCycle,
      totalEvents: events.length,
      dateRange: {
        start: startDate,
        end: endDate,
        durationDays,
      },
      activityLevel,
      patterns: {
        mostActiveCategory,
        averageEventsPerMonth: (events.length / Math.max(durationDays / 30, 1)),
        peakActivityPeriods: [], // TODO: Implement peak detection
      },
    };
  }

  // === STATISTICS ===

  async getStats(): Promise<HistoriqueStats> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats: HistoriqueStats = {
      totalEvents: this.historiques.length,
      byType: {} as any,
      byCategory: {} as any,
      bySource: {} as any,
      byImpact: {} as any,
      
      eventsThisMonth: this.historiques.filter(h => h.createdAt >= monthStart).length,
      eventsThisWeek: this.historiques.filter(h => h.createdAt >= weekStart).length,
      eventsToday: this.historiques.filter(h => h.createdAt >= todayStart).length,
      averageEventsPerDay: this.historiques.length / Math.max(1, (now.getTime() - this.historiques[this.historiques.length - 1]?.createdAt.getTime()) / (24 * 60 * 60 * 1000)),
      
      actionRequiredCount: this.historiques.filter(h => h.requiresAction).length,
      overdueTasks: this.historiques.filter(h => 
        h.requiresAction && h.dueDate && h.dueDate < now && h.status !== 'completed'
      ).length,
      completionRate: (this.historiques.filter(h => h.status === 'completed').length / this.historiques.length) * 100,
      
      topCategories: [],
      topUsers: [],
      
      trends: {
        weekOverWeek: 0, // TODO: Calculate
        monthOverMonth: 0, // TODO: Calculate
        busyHours: [9, 10, 14, 15, 16], // Mock data
        busyDaysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
      },
    };

    // Fill counters
    this.historiques.forEach(historique => {
      stats.byType[historique.eventType] = (stats.byType[historique.eventType] || 0) + 1;
      stats.byCategory[historique.category] = (stats.byCategory[historique.category] || 0) + 1;
      stats.bySource[historique.source] = (stats.bySource[historique.source] || 0) + 1;
      stats.byImpact[historique.impact] = (stats.byImpact[historique.impact] || 0) + 1;
    });

    // Calculate top categories
    stats.topCategories = Object.entries(stats.byCategory)
      .map(([category, count]) => ({
        category: category as HistoriqueCategory,
        count,
        percentage: (count / this.historiques.length) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return stats;
  }

  // === PATTERN DETECTION ===

  async detectPatterns(assureId: string): Promise<HistoriquePattern[]> {
    const events = await this.getHistoriques({ assureId });
    const patterns: HistoriquePattern[] = [];
    
    // Detect frequency patterns
    const eventTypeFrequency: Record<string, number> = {};
    events.forEach(event => {
      eventTypeFrequency[event.eventType] = (eventTypeFrequency[event.eventType] || 0) + 1;
    });

    Object.entries(eventTypeFrequency).forEach(([eventType, count]) => {
      if (count > 5) { // Threshold for frequency pattern
        patterns.push({
          id: `pattern-${Date.now()}-${eventType}`,
          assureId,
          patternType: 'frequency',
          description: `Fréquence élevée d'événements de type "${eventType}" (${count} occurrences)`,
          confidence: Math.min(count / 10, 1),
          significance: count > 10 ? 'high' : count > 7 ? 'medium' : 'low',
          detectedAt: new Date(),
          involvedEvents: events.filter(e => e.eventType === eventType).map(e => e.id),
          frequencyPattern: {
            eventType: eventType as HistoriqueEventType,
            frequency: count,
            period: 'month',
            deviation: count > 8 ? count - 5 : 0,
          },
        });
      }
    });

    return patterns;
  }

  // === BUSINESS LOGIC HELPERS ===

  private mapDemandeTypeToEventType(type: string): HistoriqueEventType {
    const mapping: Record<string, HistoriqueEventType> = {
      'souscription_contrat': 'souscription_contrat',
      'modification_contrat': 'modification_contrat',
      'declaration_sinistre': 'declaration_sinistre',
      'reclamation': 'reclamation_client',
      'demande_info': 'contact_client',
      'changement_coordonnees': 'modification_profil',
    };
    return mapping[type] || 'system_event';
  }

  private mapDemandeCategoryToHistoriqueCategory(category: string): HistoriqueCategory {
    const mapping: Record<string, HistoriqueCategory> = {
      'commercial': 'commercial',
      'operationnel': 'operationnel',
      'sinistre': 'sinistre',
      'service_client': 'relation_client',
      'compliance': 'compliance',
      'technique': 'technique',
    };
    return mapping[category] || 'operationnel';
  }

  private mapDemandeChannelToSource(channel: string): HistoriqueSource {
    const mapping: Record<string, HistoriqueSource> = {
      'web_portal': 'user_action',
      'mobile_app': 'user_action',
      'phone': 'user_action',
      'email': 'user_action',
      'api': 'external_api',
      'webhook': 'webhook',
      'system_automatic': 'system_automatic',
    };
    return mapping[channel] || 'user_action';
  }

  private calculateImpactFromDemande(demande: Demande): HistoriqueImpact {
    if (demande.priority === 'critical' || demande.priority === 'urgent') return 'critical';
    if (demande.priority === 'high') return 'high';
    if (demande.contexte.montantConcerne && demande.contexte.montantConcerne > 5000) return 'high';
    if (demande.qualite.erreurs.length > 0) return 'medium';
    return 'low';
  }

  private inferLineOfBusiness(demandeType: string): string {
    if (demandeType.includes('sinistre')) return 'Auto';
    if (demandeType.includes('contrat')) return 'Multirisque';
    return 'General';
  }
}

// Export singleton instance
export const historiqueService = new HistoriqueService();