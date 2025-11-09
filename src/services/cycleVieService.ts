import { 
  CycleVie, 
  CycleVieStats, 
  CycleVieFilters, 
  CreateCycleVieRequest, 
  UpdateCycleVieRequest,
  CycleVieStage,
  CycleVieStatus,
  CycleVieTransition,
  CycleVieRule,
  CycleViePrediction,
  CycleVieAlert,
  SouscriptionData,
  VieContratData,
  SinistrePaiementData,
  ResiliationData
} from '@/types/cyclevie.types';
import { db } from '@/lib/localStorage';

// Mock data generator pour développement
const generateMockCyclesVie = (): CycleVie[] => {
  const mockCycles: CycleVie[] = [];
  const stages: CycleVieStage[] = ['souscription', 'vie_contrat', 'sinistre_paiement', 'resiliation'];
  const statuses: CycleVieStatus[] = ['active', 'completed', 'suspended'];
  const users = ['V. Dubois', 'M. Bernard', 'S. Laurent', 'A. Martin', 'system'];
  
  for (let i = 1; i <= 25; i++) {
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.random() * 365); // Last year
    
    const currentStage = stages[Math.floor(Math.random() * stages.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const assureId = `ASSURE-${String(Math.floor(Math.random() * 20) + 1).padStart(4, '0')}`;
    const contractId = `CONT-${i}`;
    
    // Calculate stage duration
    const stageEnteredDate = new Date(createdDate.getTime() + Math.random() * 90 * 24 * 60 * 60 * 1000);
    const dureeEtapeActuelle = Math.floor((Date.now() - stageEnteredDate.getTime()) / (24 * 60 * 60 * 1000));
    const dureeTotale = Math.floor((Date.now() - createdDate.getTime()) / (24 * 60 * 60 * 1000));
    
    const nombreSinistres = Math.floor(Math.random() * 3);
    const montantTotalPrimes = Math.floor(Math.random() * 5000) + 1000;
    const montantTotalIndemnisations = nombreSinistres > 0 ? Math.floor(Math.random() * 3000) : 0;
    
    mockCycles.push({
      id: `CYCLE-2024-${String(i).padStart(4, '0')}`,
      assureId,
      contractId,
      
      currentStage,
      status,
      progression: Math.floor(Math.random() * 100),
      
      souscription: generateSouscriptionData(createdDate),
      vieContrat: currentStage !== 'souscription' ? generateVieContratData() : undefined,
      sinistrePaiement: nombreSinistres > 0 ? generateSinistrePaiementData(nombreSinistres, contractId) : undefined,
      resiliation: currentStage === 'resiliation' ? generateResiliationData() : undefined,
      
      metriques: {
        dureeEtapeActuelle,
        dureeTotale,
        nombreModifications: Math.floor(Math.random() * 5),
        nombreSinistres,
        montantTotalPrimes,
        montantTotalIndemnisations,
        ratioSinistralite: montantTotalPrimes > 0 ? 
          (montantTotalIndemnisations / montantTotalPrimes) * 100 : 0,
      },
      
      historiqueIds: generateRelatedIds('HIST', Math.floor(Math.random() * 5) + 1),
      risqueIds: Math.random() > 0.7 ? generateRelatedIds('RISK', Math.floor(Math.random() * 2) + 1) : [],
      demandeIds: generateRelatedIds('DEM', Math.floor(Math.random() * 3) + 1),
      alerteIds: Math.random() > 0.6 ? generateRelatedIds('ALERT', Math.floor(Math.random() * 2) + 1) : [],
      dossierIds: Math.random() > 0.8 ? generateRelatedIds('CASE', 1) : [],
      
      validationRequise: currentStage === 'souscription' || Math.random() > 0.7,
      prochaineMileStone: Math.random() > 0.5 ? 
        new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined,
      actionsPendantes: generateActionsPendantes(currentStage),
      documentsManquants: Math.random() > 0.6 ? ['justificatif_identite', 'relevé_information'] : [],
      
      createdAt: createdDate,
      createdBy: users[Math.floor(Math.random() * users.length)],
      updatedAt: new Date(createdDate.getTime() + Math.random() * dureeTotale * 24 * 60 * 60 * 1000),
      lastActivityAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      
      stageHistory: generateStageHistory(createdDate, currentStage),
    });
  }
  
  return mockCycles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

// Helper functions for mock data generation
function generateSouscriptionData(startDate: Date): SouscriptionData {
  return {
    dateDebut: startDate,
    typeContrat: ['Auto Tous Risques', 'Auto Tiers', 'Habitation MRH'][Math.floor(Math.random() * 3)],
    primeInitiale: Math.floor(Math.random() * 1000) + 300,
    documentsRequis: ['permis_conduire', 'carte_grise', 'relevé_information'],
    validationKYC: Math.random() > 0.2,
    bonusmalus: Math.random() > 0.5 ? Math.floor(Math.random() * 300) + 50 : undefined,
    antecedents: Math.random() > 0.7 ? ['1 sinistre responsable en 2023'] : [],
  };
}

function generateVieContratData(): VieContratData {
  const modificationsCount = Math.floor(Math.random() * 3);
  const renouvellements = Math.floor(Math.random() * 2) + 1;
  
  return {
    modifications: Array.from({ length: modificationsCount }, (_, i) => ({
      date: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
      type: ['changement_vehicule', 'ajout_garantie', 'modification_prime'][Math.floor(Math.random() * 3)],
      ancienneValeur: 'Ancienne valeur',
      nouvelleValeur: 'Nouvelle valeur',
      motif: 'Demande client',
    })),
    renouvellements: Array.from({ length: renouvellements }, (_, i) => ({
      date: new Date(Date.now() - (365 - i * 365) * 24 * 60 * 60 * 1000),
      nouvellePrime: Math.floor(Math.random() * 1200) + 400,
      changements: i === 0 ? [] : ['Augmentation prime', 'Nouvelle garantie'],
    })),
    suspensions: Math.random() > 0.8 ? [{
      dateDebut: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
      dateFin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      motif: 'Non-paiement prime',
    }] : undefined,
  };
}

function generateSinistrePaiementData(nombreSinistres: number, contractId: string): SinistrePaiementData {
  return {
    sinistres: Array.from({ length: nombreSinistres }, (_, i) => ({
      numeroSinistre: `SIN-2024-${8800 + parseInt(contractId.split('-')[1]) + i}`,
      dateDeclaration: new Date(Date.now() - Math.random() * 120 * 24 * 60 * 60 * 1000),
      typeSinistre: ['Collision', 'Vol', 'Bris de glace', 'Incendie'][Math.floor(Math.random() * 4)],
      montantDeclare: Math.floor(Math.random() * 8000) + 500,
      montantIndemnise: Math.random() > 0.3 ? Math.floor(Math.random() * 6000) + 300 : undefined,
      statut: ['En cours', 'Clos', 'En attente'][Math.floor(Math.random() * 3)],
      expertiseRequise: Math.random() > 0.6,
    })),
    paiements: Array.from({ length: Math.floor(Math.random() * 6) + 2 }, (_, i) => ({
      date: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
      montant: Math.floor(Math.random() * 500) + 50,
      type: ['prime', 'franchise', 'indemnisation'][Math.floor(Math.random() * 3)] as any,
      statut: ['completed', 'completed', 'pending'][Math.floor(Math.random() * 3)] as any,
    })),
  };
}

function generateResiliationData(): ResiliationData {
  return {
    dateResiliation: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    motifResiliation: 'Changement d\'assureur',
    typeResiliation: ['client', 'assureur', 'mutual'][Math.floor(Math.random() * 3)] as any,
    penalites: Math.random() > 0.7 ? Math.floor(Math.random() * 200) : undefined,
    remboursements: Math.random() > 0.5 ? Math.floor(Math.random() * 300) : undefined,
    documentsFinalisation: ['certificat_resiliation', 'attestation_fin_contrat'],
  };
}

function generateRelatedIds(prefix: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => 
    `${prefix}-2024-${String(Math.floor(Math.random() * 1000) + 1).padStart(4, '0')}`
  );
}

function generateActionsPendantes(stage: CycleVieStage): string[] {
  const actions = {
    souscription: ['Vérification documents', 'Validation KYC', 'Signature contrat'],
    vie_contrat: ['Renouvellement annuel', 'Mise à jour profil'],
    sinistre_paiement: ['Expertise en cours', 'Validation indemnisation'],
    resiliation: ['Finalisation documents', 'Calcul remboursements'],
  };
  
  const stageActions = actions[stage] || [];
  return stageActions.slice(0, Math.floor(Math.random() * stageActions.length) + 1);
}

function generateStageHistory(startDate: Date, currentStage: CycleVieStage): any[] {
  const stages: CycleVieStage[] = ['souscription', 'vie_contrat', 'sinistre_paiement', 'resiliation'];
  const currentIndex = stages.indexOf(currentStage);
  
  const history = [];
  let currentDate = new Date(startDate);
  
  for (let i = 0; i <= currentIndex; i++) {
    const exitDate = i < currentIndex ? 
      new Date(currentDate.getTime() + Math.random() * 90 * 24 * 60 * 60 * 1000) : 
      undefined;
    
    history.push({
      stage: stages[i],
      enteredAt: new Date(currentDate),
      exitedAt: exitDate,
      duration: exitDate ? Math.floor((exitDate.getTime() - currentDate.getTime()) / (24 * 60 * 60 * 1000)) : undefined,
      triggeredBy: i === 0 ? 'creation' : 'automatic_transition',
    });
    
    if (exitDate) {
      currentDate = exitDate;
    }
  }
  
  return history;
}

class CycleVieService {
  private rules: CycleVieRule[] = [];
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (!this.initialized) {
      // Don't initialize mock data here - use the main demo data instead
      // The main demo data in demoData.ts already provides cycle_vies data
      console.log('CycleVieService initialized - using main demo data from localStorage');
      
      if (db.getAll<CycleVieTransition>('cycle_transitions').length === 0) {
        db.save('cycle_transitions', []);
      }
      if (db.getAll<CycleVieAlert>('cycle_alerts').length === 0) {
        db.save('cycle_alerts', []);
      }
      
      this.initializeRules();
      this.initialized = true;
    }
  }

  private initializeRules() {
    this.rules = [
      {
        id: 'souscription-to-vie',
        fromStage: 'souscription',
        toStage: 'vie_contrat',
        conditions: [
          { field: 'validationKYC', operator: 'equals', value: true },
          { field: 'documentsRequis', operator: 'equals', value: 'complete' }
        ],
        automaticTransition: true,
        requiredDocuments: ['contrat_signe'],
        requiredValidations: ['kyc_validation'],
        estimatedDuration: 7,
      },
      {
        id: 'vie-to-sinistre',
        fromStage: 'vie_contrat',
        toStage: 'sinistre_paiement',
        conditions: [
          { field: 'sinistre_declared', operator: 'equals', value: true }
        ],
        automaticTransition: true,
        requiredDocuments: ['declaration_sinistre'],
        requiredValidations: [],
        estimatedDuration: 1,
      },
      {
        id: 'any-to-resiliation',
        fromStage: 'vie_contrat',
        toStage: 'resiliation',
        conditions: [
          { field: 'resiliation_request', operator: 'equals', value: true }
        ],
        automaticTransition: false,
        requiredDocuments: ['lettre_resiliation'],
        requiredValidations: ['manager_approval'],
        estimatedDuration: 30,
      }
    ];
  }

  // === CREATION ET GESTION DU CYCLE ===

  async createCycleVie(request: CreateCycleVieRequest, userId: string): Promise<CycleVie> {
    const newCycle: CycleVie = {
      id: `CYCLE-${Date.now()}`,
      assureId: request.assureId,
      contractId: request.contractId,
      
      currentStage: request.initialStage,
      status: 'active',
      progression: request.initialStage === 'souscription' ? 10 : 50,
      
      souscription: request.souscriptionData ? {
        dateDebut: new Date(),
        typeContrat: 'Auto',
        primeInitiale: 500,
        documentsRequis: ['permis_conduire'],
        validationKYC: false,
        antecedents: [],
        ...request.souscriptionData,
      } : undefined,
      
      metriques: {
        dureeEtapeActuelle: 0,
        dureeTotale: 0,
        nombreModifications: 0,
        nombreSinistres: 0,
        montantTotalPrimes: 0,
        montantTotalIndemnisations: 0,
        ratioSinistralite: 0,
      },
      
      historiqueIds: [],
      risqueIds: [],
      demandeIds: [],
      alerteIds: [],
      dossierIds: [],
      
      validationRequise: request.initialStage === 'souscription',
      actionsPendantes: generateActionsPendantes(request.initialStage),
      documentsManquants: [],
      
      createdAt: new Date(),
      createdBy: userId,
      updatedAt: new Date(),
      lastActivityAt: new Date(),
      
      stageHistory: [{
        stage: request.initialStage,
        enteredAt: new Date(),
        triggeredBy: 'manual_creation',
      }],
    };

    db.create('cycle_vies', newCycle);
    console.log(`✅ Cycle de vie ${newCycle.id} créé pour assuré ${request.assureId}`);
    
    return newCycle;
  }

  async getCyclesVie(filters?: CycleVieFilters): Promise<CycleVie[]> {
    let filtered = db.getAll<CycleVie>('cycle_vies');

    if (filters) {
      if (filters.stage) {
        filtered = filtered.filter(c => filters.stage!.includes(c.currentStage));
      }
      if (filters.status) {
        filtered = filtered.filter(c => filters.status!.includes(c.status));
      }
      if (filters.assureId) {
        filtered = filtered.filter(c => c.assureId === filters.assureId);
      }
      if (filters.contractId) {
        filtered = filtered.filter(c => c.contractId === filters.contractId);
      }
      if (filters.validationRequired !== undefined) {
        filtered = filtered.filter(c => c.validationRequise === filters.validationRequired);
      }
      if (filters.hasActiveAlerts !== undefined) {
        filtered = filtered.filter(c => 
          filters.hasActiveAlerts ? c.alerteIds.length > 0 : c.alerteIds.length === 0
        );
      }
      if (filters.minDuration !== undefined) {
        filtered = filtered.filter(c => c.metriques.dureeTotale >= filters.minDuration!);
      }
      if (filters.maxDuration !== undefined) {
        filtered = filtered.filter(c => c.metriques.dureeTotale <= filters.maxDuration!);
      }
      if (filters.createdFrom) {
        filtered = filtered.filter(c => new Date(c.createdAt) >= filters.createdFrom!);
      }
      if (filters.createdTo) {
        filtered = filtered.filter(c => new Date(c.createdAt) <= filters.createdTo!);
      }
    }

    return filtered.sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime());
  }

  async getCycleVie(id: string): Promise<CycleVie | null> {
    return db.getById<CycleVie>('cycle_vies', id);
  }

  async getCycleVieForAssure(assureId: string): Promise<CycleVie[]> {
    return this.getCyclesVie({ assureId });
  }

  async updateCycleVie(request: UpdateCycleVieRequest, userId: string): Promise<CycleVie | null> {
    const existingCycle = db.getById<CycleVie>('cycle_vies', request.cycleVieId);
    if (!existingCycle) return null;
    const now = new Date();

    // Handle stage transition
    if (request.newStage && request.newStage !== existingCycle.currentStage) {
      await this.processStageTransition(existingCycle, request.newStage, userId);
    }

    const updatedCycle: CycleVie = {
      ...existingCycle,
      currentStage: request.newStage || existingCycle.currentStage,
      status: request.newStatus || existingCycle.status,
      souscription: request.souscriptionData ? 
        { ...existingCycle.souscription, ...request.souscriptionData } : 
        existingCycle.souscription,
      vieContrat: request.vieContratData ? 
        { ...existingCycle.vieContrat, ...request.vieContratData } : 
        existingCycle.vieContrat,
      sinistrePaiement: request.sinistrePaiementData ? 
        { ...existingCycle.sinistrePaiement, ...request.sinistrePaiementData } : 
        existingCycle.sinistrePaiement,
      resiliation: request.resiliationData ? 
        { ...existingCycle.resiliation, ...request.resiliationData } : 
        existingCycle.resiliation,
      historiqueIds: request.addHistorique ? 
        [...existingCycle.historiqueIds, request.addHistorique] : 
        existingCycle.historiqueIds,
      risqueIds: request.addRisque ? 
        [...existingCycle.risqueIds, request.addRisque] : 
        existingCycle.risqueIds,
      demandeIds: request.addDemande ? 
        [...existingCycle.demandeIds, request.addDemande] : 
        existingCycle.demandeIds,
      updatedAt: now,
      lastActivityAt: now,
    };

    // Recalculate metrics
    updatedCycle.metriques = this.calculateMetrics(updatedCycle);

    return db.update('cycle_vies', request.cycleVieId, updatedCycle);
  }

  // === TRANSITIONS D'ETAPES ===

  async processStageTransition(cycle: CycleVie, newStage: CycleVieStage, userId: string): Promise<CycleVieTransition> {
    const transition: CycleVieTransition = {
      id: `TRANS-${Date.now()}`,
      cycleVieId: cycle.id,
      fromStage: cycle.currentStage,
      toStage: newStage,
      triggeredBy: userId,
      triggeredByType: 'manual',
      validationRequired: false,
      timestamp: new Date(),
    };

    // Update stage history
    const currentStageHistory = cycle.stageHistory[cycle.stageHistory.length - 1];
    if (currentStageHistory && !currentStageHistory.exitedAt) {
      currentStageHistory.exitedAt = new Date();
      currentStageHistory.duration = Math.floor(
        (currentStageHistory.exitedAt.getTime() - currentStageHistory.enteredAt.getTime()) / (24 * 60 * 60 * 1000)
      );
    }

    cycle.stageHistory.push({
      stage: newStage,
      enteredAt: new Date(),
      triggeredBy: userId,
    });

    db.create('cycle_transitions', transition);
    console.log(`✅ Transition ${cycle.id}: ${cycle.currentStage} → ${newStage}`);
    
    return transition;
  }

  async validateTransition(transitionId: string, userId: string): Promise<boolean> {
    const transition = db.getById<CycleVieTransition>('cycle_transitions', transitionId);
    if (!transition) return false;

    const updated = db.update('cycle_transitions', transitionId, {
      validatedBy: userId,
      validatedAt: new Date()
    });
    
    console.log(`✅ Transition ${transitionId} validée par ${userId}`);
    return !!updated;
  }

  // === ANALYTICS ET PREDICTIONS ===

  async generatePredictions(cycleVieId: string): Promise<CycleViePrediction | null> {
    const cycle = await this.getCycleVie(cycleVieId);
    if (!cycle) return null;

    // Simple prediction logic
    const nextStages: Record<CycleVieStage, CycleVieStage> = {
      souscription: 'vie_contrat',
      vie_contrat: 'sinistre_paiement',
      sinistre_paiement: 'resiliation',
      resiliation: 'resiliation', // Terminal stage
    };

    const predictedNext = nextStages[cycle.currentStage];
    const estimatedDays = this.estimateTransitionTime(cycle.currentStage, predictedNext);

    return {
      cycleVieId,
      predictedNextStage: predictedNext,
      estimatedTransitionDate: new Date(Date.now() + estimatedDays * 24 * 60 * 60 * 1000),
      confidence: 0.7 + Math.random() * 0.2, // 0.7-0.9
      riskFactors: this.identifyRiskFactors(cycle),
      recommendations: this.generateRecommendations(cycle),
      businessImpact: {
        revenueImpact: this.calculateRevenueImpact(cycle),
        riskScore: cycle.risqueIds.length * 20,
        priority: cycle.alerteIds.length > 0 ? 'high' : 'medium',
      },
    };
  }

  // === DETECTION D'ANOMALIES ===

  async detectAnomalies(): Promise<CycleVieAlert[]> {
    const alerts: CycleVieAlert[] = [];
    const now = new Date();
    const cyclesVie = db.getAll<CycleVie>('cycle_vies');

    for (const cycle of cyclesVie) {
      if (cycle.status !== 'active') continue;

      // Detect stagnation
      if (cycle.metriques.dureeEtapeActuelle > 90) {
        alerts.push({
          id: `ALERT-STAG-${Date.now()}-${cycle.id}`,
          cycleVieId: cycle.id,
          type: 'stagnation',
          severity: 'medium',
          message: `Cycle bloqué en étape ${cycle.currentStage} depuis ${cycle.metriques.dureeEtapeActuelle} jours`,
          details: { stage: cycle.currentStage, duration: cycle.metriques.dureeEtapeActuelle },
          createdAt: now,
        });
      }

      // Detect rapid progression
      if (cycle.metriques.dureeEtapeActuelle < 1 && cycle.currentStage !== 'souscription') {
        alerts.push({
          id: `ALERT-RAPID-${Date.now()}-${cycle.id}`,
          cycleVieId: cycle.id,
          type: 'rapid_progression',
          severity: 'low',
          message: `Progression rapide détectée - étape changée en moins d'un jour`,
          details: { stage: cycle.currentStage, duration: cycle.metriques.dureeEtapeActuelle },
          createdAt: now,
        });
      }

      // Detect missing documents
      if (cycle.documentsManquants.length > 0) {
        alerts.push({
          id: `ALERT-DOC-${Date.now()}-${cycle.id}`,
          cycleVieId: cycle.id,
          type: 'document_missing',
          severity: 'medium',
          message: `${cycle.documentsManquants.length} document(s) manquant(s)`,
          details: { documents: cycle.documentsManquants },
          createdAt: now,
        });
      }

      // Detect validation required
      if (cycle.validationRequise) {
        alerts.push({
          id: `ALERT-VAL-${Date.now()}-${cycle.id}`,
          cycleVieId: cycle.id,
          type: 'validation_required',
          severity: 'high',
          message: `Validation manuelle requise pour étape ${cycle.currentStage}`,
          details: { stage: cycle.currentStage, actions: cycle.actionsPendantes },
          createdAt: now,
        });
      }
    }

    // Save alerts to localStorage
    alerts.forEach(alert => {
      db.create('cycle_alerts', alert);
    });
    return alerts;
  }

  // === STATISTICS ===

  async getStats(): Promise<CycleVieStats> {
    const cyclesVie = db.getAll<CycleVie>('cycle_vies');
    const activeCycles = cyclesVie.filter(c => c.status === 'active');
    
    // Calculate averages by stage
    const stageGroups = {
      souscription: cyclesVie.filter(c => c.currentStage === 'souscription'),
      vie_contrat: cyclesVie.filter(c => c.currentStage === 'vie_contrat'),
      sinistre_paiement: cyclesVie.filter(c => c.currentStage === 'sinistre_paiement'),
      resiliation: cyclesVie.filter(c => c.currentStage === 'resiliation'),
    };

    const completedCycles = cyclesVie.filter(c => c.status === 'completed');
    const totalCyclesStarted = cyclesVie.length;
    
    const stats: CycleVieStats = {
      total: cyclesVie.length,
      byStage: {
        souscription: stageGroups.souscription.length,
        vie_contrat: stageGroups.vie_contrat.length,
        sinistre_paiement: stageGroups.sinistre_paiement.length,
        resiliation: stageGroups.resiliation.length,
      },
      byStatus: {
        active: cyclesVie.filter(c => c.status === 'active').length,
        completed: cyclesVie.filter(c => c.status === 'completed').length,
        suspended: cyclesVie.filter(c => c.status === 'suspended').length,
        cancelled: cyclesVie.filter(c => c.status === 'cancelled').length,
      },
      
      averageDurationByStage: {
        souscription: this.calculateAverageStageTime('souscription'),
        vie_contrat: this.calculateAverageStageTime('vie_contrat'),
        sinistre_paiement: this.calculateAverageStageTime('sinistre_paiement'),
        resiliation: this.calculateAverageStageTime('resiliation'),
      },
      
      conversionRates: {
        souscription_to_active: totalCyclesStarted > 0 ? 
          (cyclesVie.filter(c => c.currentStage !== 'souscription').length / totalCyclesStarted) * 100 : 0,
        active_to_renewal: 75, // Mock value
        sinistre_to_resolution: 85, // Mock value
      },
      
      averageLifetimeValue: cyclesVie.reduce((sum, c) => sum + c.metriques.montantTotalPrimes, 0) / cyclesVie.length,
      churnRate: completedCycles.filter(c => c.currentStage === 'resiliation').length / Math.max(1, completedCycles.length) * 100,
      frequencySinistres: cyclesVie.reduce((sum, c) => sum + c.metriques.nombreSinistres, 0) / cyclesVie.length,
      
      anomalies: {
        transitionsRapides: cyclesVie.filter(c => c.metriques.dureeEtapeActuelle < 1).length,
        stagnation: cyclesVie.filter(c => c.metriques.dureeEtapeActuelle > 90).length,
        reversions: 0, // TODO: Implement reversion detection
      },
    };

    return stats;
  }

  // === HELPER METHODS ===

  private calculateMetrics(cycle: CycleVie): any {
    const now = new Date();
    const currentStageHistory = cycle.stageHistory[cycle.stageHistory.length - 1];
    const dureeEtapeActuelle = currentStageHistory ? 
      Math.floor((now.getTime() - currentStageHistory.enteredAt.getTime()) / (24 * 60 * 60 * 1000)) : 0;
    const dureeTotale = Math.floor((now.getTime() - cycle.createdAt.getTime()) / (24 * 60 * 60 * 1000));

    return {
      ...cycle.metriques,
      dureeEtapeActuelle,
      dureeTotale,
    };
  }

  private calculateAverageStageTime(stage: CycleVieStage): number {
    const cyclesVie = db.getAll<CycleVie>('cycle_vies');
    const stageHistories = cyclesVie
      .flatMap(c => c.stageHistory)
      .filter(h => h.stage === stage && h.duration !== undefined);
    
    if (stageHistories.length === 0) return 0;
    
    return stageHistories.reduce((sum, h) => sum + (h.duration || 0), 0) / stageHistories.length;
  }

  private estimateTransitionTime(currentStage: CycleVieStage, nextStage: CycleVieStage): number {
    const rule = this.rules.find(r => r.fromStage === currentStage && r.toStage === nextStage);
    return rule?.estimatedDuration || 30; // Default 30 days
  }

  private identifyRiskFactors(cycle: CycleVie): string[] {
    const factors = [];
    
    if (cycle.metriques.nombreSinistres > 2) {
      factors.push('Fréquence élevée de sinistres');
    }
    if (cycle.metriques.ratioSinistralite > 100) {
      factors.push('Ratio sinistralité défavorable');
    }
    if (cycle.risqueIds.length > 0) {
      factors.push('Risques détectés');
    }
    if (cycle.documentsManquants.length > 0) {
      factors.push('Documents manquants');
    }
    
    return factors;
  }

  private generateRecommendations(cycle: CycleVie): string[] {
    const recommendations = [];
    
    if (cycle.validationRequise) {
      recommendations.push('Valider les étapes en attente');
    }
    if (cycle.documentsManquants.length > 0) {
      recommendations.push('Compléter les documents manquants');
    }
    if (cycle.metriques.ratioSinistralite > 80) {
      recommendations.push('Revoir les conditions tarifaires');
    }
    
    return recommendations;
  }

  private calculateRevenueImpact(cycle: CycleVie): number {
    // Simplified revenue impact calculation
    return cycle.metriques.montantTotalPrimes - cycle.metriques.montantTotalIndemnisations;
  }
}

// Export singleton instance
export const cycleVieService = new CycleVieService();