import { 
  Assure, 
  AssureStats, 
  AssureFilters, 
  CreateAssureRequest, 
  UpdateAssureRequest,
  AssureSearchResult,
  AssureEnrichmentRequest,
  AssureAlertLink,
  AssureStatus,
  AssureType,
  AssureRiskLevel,
  AssureRiskProfile,
  AssurePortfolio,
  AssureContract
} from '@/types/assure.types';
import { Alert } from '@/types/alert.types';
import { Case } from '@/types/case.types';

// Mock data generator for development
const generateMockAssures = (): Assure[] => {
  const mockAssures: Assure[] = [];
  const prenoms = ['Jean', 'Marie', 'Pierre', 'Sophie', 'Antoine', 'Claire', 'Michel', 'Isabelle'];
  const noms = ['Dupont', 'Martin', 'Bernard', 'Thomas', 'Petit', 'Robert', 'Richard', 'Durand'];
  const villes = ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier'];
  const gestionnaires = ['V. Dubois', 'M. Bernard', 'S. Laurent', 'A. Martin', 'P. Moreau'];
  const agences = ['Paris Centre', 'Lyon Presqu\'île', 'Marseille Canebière', 'Toulouse Capitole'];
  
  for (let i = 1; i <= 20; i++) {
    const prenom = prenoms[Math.floor(Math.random() * prenoms.length)];
    const nom = noms[Math.floor(Math.random() * noms.length)];
    const ville = villes[Math.floor(Math.random() * villes.length)];
    const isEntreprise = Math.random() > 0.8;
    
    const createdDate = new Date();
    createdDate.setMonth(createdDate.getMonth() - Math.floor(Math.random() * 24)); // 0-24 mois
    
    const riskScore = Math.floor(Math.random() * 100);
    const nombreSinistres = Math.floor(Math.random() * 5);
    const nombreAlertes = Math.floor(Math.random() * 3);
    
    mockAssures.push({
      id: `ASSURE-${String(i).padStart(4, '0')}`,
      numeroClient: `CLI-2024-${String(8000 + i).padStart(6, '0')}`,
      type: isEntreprise ? 'entreprise' : (Math.random() > 0.7 ? 'professionnel' : 'particulier'),
      status: ['active', 'active', 'active', 'suspended', 'prospect'][Math.floor(Math.random() * 5)] as AssureStatus,
      
      identity: {
        nom: isEntreprise ? `${nom} SAS` : nom,
        prenom: isEntreprise ? undefined : prenom,
        raisonSociale: isEntreprise ? `${nom} ${prenom} SAS` : undefined,
        numeroIdentite: isEntreprise ? undefined : `CNI${Math.random().toString().substring(2, 12)}`,
        numeroSiren: isEntreprise ? `${Math.floor(Math.random() * 900000000) + 100000000}` : undefined,
        email: `${prenom.toLowerCase()}.${nom.toLowerCase()}@email.com`,
        telephone: `0${Math.floor(Math.random() * 9) + 1}${Math.floor(Math.random() * 90000000) + 10000000}`,
        adresse: {
          ligne1: `${Math.floor(Math.random() * 200) + 1} rue de ${ville}`,
          codePostal: `${Math.floor(Math.random() * 95000) + 1000}`,
          ville: ville,
          pays: 'France'
        }
      },
      
      riskProfile: {
        riskScore,
        riskLevel: riskScore >= 80 ? 'critical' : riskScore >= 60 ? 'high' : riskScore >= 40 ? 'medium' : 'low',
        confidenceLevel: 0.7 + Math.random() * 0.3,
        nombreSinistres,
        montantTotalSinistres: nombreSinistres * (500 + Math.random() * 3000),
        nombreAlertes,
        nombreDossiersFraude: Math.floor(nombreAlertes * 0.3),
        frequenceModifications: Math.floor(Math.random() * 5),
        delaiDeclarationMoyen: 2 + Math.floor(Math.random() * 10),
        coherenceDocuments: 60 + Math.floor(Math.random() * 40),
        facteursDurcissement: riskScore > 60 ? ['Sinistres répétés', 'Documents incohérents'] : [],
        facteursMitigation: riskScore < 40 ? ['Client fidèle', 'Aucun sinistre'] : [],
        derniereMiseAJour: new Date(),
        prochainReview: new Date(Date.now() + (30 + Math.random() * 90) * 24 * 60 * 60 * 1000)
      },
      
      portfolio: {
        contracts: [
          {
            id: `CONT-${i}-1`,
            policyNumber: `POL-${2024000 + i}`,
            lineOfBusiness: 'auto',
            dateDebut: createdDate,
            primeAnnuelle: 800 + Math.random() * 1500,
            status: 'active',
            vehicule: {
              vin: `VF1${Math.random().toString(16).substring(2, 15).toUpperCase()}`,
              immatriculation: `${Math.random().toString(36).substring(2, 4).toUpperCase()}-${Math.floor(Math.random() * 900) + 100}-${Math.random().toString(36).substring(2, 4).toUpperCase()}`,
              marque: ['Peugeot', 'Renault', 'Citroën', 'BMW', 'Mercedes'][Math.floor(Math.random() * 5)],
              modele: '308',
              annee: 2018 + Math.floor(Math.random() * 6)
            }
          }
        ],
        totalPremiums: 800 + Math.random() * 1500,
        customerLifetimeValue: 1200 + Math.random() * 2000,
        lineOfBusiness: ['auto'],
        ancienneteclient: Math.floor((Date.now() - createdDate.getTime()) / (30 * 24 * 60 * 60 * 1000))
      },
      
      cyclesVie: [],
      historiqueIds: [],
      alerteIds: nombreAlertes > 0 ? [`ALERT-2024-${String(i).padStart(4, '0')}`] : [],
      dossierIds: [],
      
      gestionnaire: gestionnaires[Math.floor(Math.random() * gestionnaires.length)],
      agence: agences[Math.floor(Math.random() * agences.length)],
      segment: isEntreprise ? 'Entreprises' : (Math.random() > 0.5 ? 'Premium' : 'Standard'),
      
      createdAt: createdDate,
      createdBy: 'system',
      updatedAt: createdDate,
      lastLoginAt: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined,
      dataValidatedAt: createdDate
    });
  }
  
  return mockAssures;
};

class AssureService {
  private assures: Assure[] = [];
  private alertLinks: AssureAlertLink[] = [];
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (!this.initialized) {
      this.assures = generateMockAssures();
      this.initialized = true;
    }
  }

  // === CRUD OPERATIONS ===

  async createAssure(request: CreateAssureRequest, userId: string): Promise<Assure> {
    const newAssure: Assure = {
      id: `ASSURE-${Date.now()}`,
      numeroClient: `CLI-2024-${String(900000 + this.assures.length + 1).padStart(6, '0')}`,
      type: request.type,
      status: 'prospect',
      
      identity: request.identity,
      
      riskProfile: {
        riskScore: 50, // Score initial neutre
        riskLevel: 'medium',
        confidenceLevel: 0.5,
        nombreSinistres: 0,
        montantTotalSinistres: 0,
        nombreAlertes: 0,
        nombreDossiersFraude: 0,
        frequenceModifications: 0,
        delaiDeclarationMoyen: 0,
        coherenceDocuments: 100,
        facteursDurcissement: [],
        facteursMitigation: ['Nouveau client'],
        derniereMiseAJour: new Date(),
        prochainReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 3 mois
      },
      
      portfolio: {
        contracts: request.initialContract ? [{
          id: `CONT-${Date.now()}`,
          policyNumber: `POL-${Date.now()}`,
          lineOfBusiness: request.initialContract.lineOfBusiness || 'auto',
          dateDebut: new Date(),
          primeAnnuelle: request.initialContract.primeAnnuelle || 0,
          status: 'pending',
          ...request.initialContract
        }] : [],
        totalPremiums: request.initialContract?.primeAnnuelle || 0,
        customerLifetimeValue: (request.initialContract?.primeAnnuelle || 800) * 3,
        lineOfBusiness: request.initialContract ? [request.initialContract.lineOfBusiness || 'auto'] : [],
        ancienneteclient: 0
      },
      
      cyclesVie: [],
      historiqueIds: [],
      alerteIds: [],
      dossierIds: [],
      
      gestionnaire: request.gestionnaire,
      agence: request.agence,
      segment: request.segment || 'Standard',
      
      createdAt: new Date(),
      createdBy: userId,
      updatedAt: new Date(),
      dataValidatedAt: new Date()
    };

    this.assures.unshift(newAssure);
    return newAssure;
  }

  async getAssures(filters?: AssureFilters): Promise<Assure[]> {
    let filtered = [...this.assures];

    if (filters) {
      if (filters.status && filters.status.length > 0) {
        filtered = filtered.filter(a => filters.status!.includes(a.status));
      }
      if (filters.type && filters.type.length > 0) {
        filtered = filtered.filter(a => filters.type!.includes(a.type));
      }
      if (filters.riskLevel && filters.riskLevel.length > 0) {
        filtered = filtered.filter(a => filters.riskLevel!.includes(a.riskProfile.riskLevel));
      }
      if (filters.gestionnaire) {
        filtered = filtered.filter(a => a.gestionnaire === filters.gestionnaire);
      }
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(a => 
          a.numeroClient.toLowerCase().includes(term) ||
          a.identity.nom.toLowerCase().includes(term) ||
          a.identity.prenom?.toLowerCase().includes(term) ||
          a.identity.email?.toLowerCase().includes(term)
        );
      }
      if (filters.hasActiveAlerts) {
        filtered = filtered.filter(a => a.alerteIds.length > 0);
      }
      if (filters.hasFraudHistory) {
        filtered = filtered.filter(a => a.riskProfile.nombreDossiersFraude > 0);
      }
      if (filters.reviewDue) {
        const now = new Date();
        filtered = filtered.filter(a => a.riskProfile.prochainReview <= now);
      }
    }

    return filtered;
  }

  async getAssure(id: string): Promise<Assure | null> {
    return this.assures.find(a => a.id === id) || null;
  }

  async getAssureByNumeroClient(numeroClient: string): Promise<Assure | null> {
    return this.assures.find(a => a.numeroClient === numeroClient) || null;
  }

  async updateAssure(request: UpdateAssureRequest, userId: string): Promise<Assure | null> {
    const assureIndex = this.assures.findIndex(a => a.id === request.assureId);
    if (assureIndex === -1) return null;

    const existingAssure = this.assures[assureIndex];
    const now = new Date();

    const updatedAssure: Assure = {
      ...existingAssure,
      identity: request.identity ? { ...existingAssure.identity, ...request.identity } : existingAssure.identity,
      riskProfile: request.riskProfile ? { 
        ...existingAssure.riskProfile, 
        ...request.riskProfile, 
        derniereMiseAJour: now 
      } : existingAssure.riskProfile,
      portfolio: request.portfolio ? { ...existingAssure.portfolio, ...request.portfolio } : existingAssure.portfolio,
      gestionnaire: request.gestionnaire || existingAssure.gestionnaire,
      status: request.status || existingAssure.status,
      updatedAt: now
    };

    this.assures[assureIndex] = updatedAssure;
    return updatedAssure;
  }

  // === SEARCH & ENRICHMENT ===

  async searchAssures(searchTerm: string, limit: number = 10): Promise<AssureSearchResult[]> {
    const term = searchTerm.toLowerCase();
    const results: AssureSearchResult[] = [];

    for (const assure of this.assures) {
      let matchScore = 0;
      const matchFields: string[] = [];

      // Exact match sur numéro client
      if (assure.numeroClient.toLowerCase() === term) {
        matchScore = 100;
        matchFields.push('numeroClient');
      }
      // Match partiel sur nom/prénom
      else if (assure.identity.nom.toLowerCase().includes(term)) {
        matchScore += 80;
        matchFields.push('nom');
      }
      if (assure.identity.prenom?.toLowerCase().includes(term)) {
        matchScore += 70;
        matchFields.push('prenom');
      }
      // Match sur email
      if (assure.identity.email?.toLowerCase().includes(term)) {
        matchScore += 60;
        matchFields.push('email');
      }
      // Match sur documents
      if (assure.identity.numeroIdentite?.toLowerCase().includes(term)) {
        matchScore += 90;
        matchFields.push('numeroIdentite');
      }

      if (matchScore > 0) {
        results.push({
          assure,
          matchScore,
          matchFields,
          alertCount: assure.alerteIds.length,
          recentActivity: assure.lastLoginAt ? 
            (Date.now() - assure.lastLoginAt.getTime()) < (7 * 24 * 60 * 60 * 1000) : false
        });
      }
    }

    return results
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  }

  async enrichAssureFromAlert(alert: Alert): Promise<AssureAlertLink | null> {
    const metadata = alert.metadata;
    
    // Tentative de matching par données métier
    let matchedAssure: Assure | null = null;
    let confidence = 0;

    // 1. Match par numéro de police
    if (metadata.policyNumber) {
      matchedAssure = this.assures.find(a => 
        a.portfolio.contracts.some(c => c.policyNumber === metadata.policyNumber)
      ) || null;
      confidence = matchedAssure ? 0.95 : 0;
    }

    // 2. Match par nom assuré + contexte métier
    if (!matchedAssure && metadata.insuredName) {
      const nameResults = await this.searchAssures(metadata.insuredName, 5);
      if (nameResults.length > 0 && nameResults[0].matchScore > 70) {
        matchedAssure = nameResults[0].assure;
        confidence = nameResults[0].matchScore / 100 * 0.8;
      }
    }

    // 3. Match par VIN/immatriculation
    if (!matchedAssure && (metadata.fileName || alert.rawData?.originalResult?.document_info)) {
      const docInfo = alert.rawData?.originalResult?.document_info;
      if (docInfo?.vin || docInfo?.license_plate) {
        matchedAssure = this.assures.find(a => 
          a.portfolio.contracts.some(c => 
            c.vehicule?.vin === docInfo.vin || 
            c.vehicule?.immatriculation === docInfo.license_plate
          )
        ) || null;
        confidence = matchedAssure ? 0.9 : 0;
      }
    }

    if (!matchedAssure) return null;

    // Création du lien
    const link: AssureAlertLink = {
      assureId: matchedAssure.id,
      alertId: alert.id,
      cycleVieStage: this.inferCycleVieStage(metadata),
      confidence,
      extractedData: {
        source: alert.source,
        documentType: metadata.documentType,
        businessContext: metadata.businessContext,
        amount: metadata.amount
      },
      createdAt: new Date()
    };

    // Mise à jour de l'assuré
    if (!matchedAssure.alerteIds.includes(alert.id)) {
      matchedAssure.alerteIds.push(alert.id);
      await this.updateRiskProfile(matchedAssure.id, alert);
    }

    this.alertLinks.push(link);
    return link;
  }

  // === BUSINESS LOGIC ===

  private inferCycleVieStage(metadata: any): string {
    if (metadata.businessContext === 'subscription') return 'souscription';
    if (metadata.businessContext === 'claims') return 'sinistre';
    if (metadata.workflowStage === 'onboarding') return 'souscription';
    if (metadata.workflowStage === 'claim_submission') return 'sinistre';
    return 'gestion';
  }

  private async updateRiskProfile(assureId: string, alert: Alert): Promise<void> {
    const assure = await this.getAssure(assureId);
    if (!assure) return;

    const riskProfile = assure.riskProfile;
    
    // Mise à jour des compteurs
    riskProfile.nombreAlertes += 1;
    
    // Ajustement du score de risque
    const alertImpact = this.calculateAlertRiskImpact(alert);
    riskProfile.riskScore = Math.min(100, riskProfile.riskScore + alertImpact);
    
    // Recalcul du niveau de risque
    riskProfile.riskLevel = this.calculateRiskLevel(riskProfile.riskScore);
    
    // Mise à jour de la cohérence documents
    if (alert.source === 'document_analysis' && alert.score < 70) {
      riskProfile.coherenceDocuments = Math.max(0, riskProfile.coherenceDocuments - 5);
    }
    
    // Ajout de facteurs de durcissement
    if (alert.severity === 'critical' || alert.severity === 'high') {
      if (!riskProfile.facteursDurcissement.includes('Alertes graves détectées')) {
        riskProfile.facteursDurcissement.push('Alertes graves détectées');
      }
    }
    
    riskProfile.derniereMiseAJour = new Date();
    
    // Anticipation de la prochaine review si risque élevé
    if (riskProfile.riskLevel === 'critical' || riskProfile.riskLevel === 'high') {
      riskProfile.prochainReview = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 2 semaines
    }

    await this.updateAssure({ assureId, riskProfile }, 'system');
  }

  private calculateAlertRiskImpact(alert: Alert): number {
    let impact = 0;
    
    // Impact par sévérité
    switch (alert.severity) {
      case 'critical': impact += 15; break;
      case 'high': impact += 10; break;
      case 'medium': impact += 5; break;
      case 'low': impact += 2; break;
    }
    
    // Impact par score de confiance
    impact *= alert.confidence || 0.5;
    
    // Impact par type de fraude
    if (alert.metadata.fraudTypes?.includes('Document falsifié')) impact += 5;
    if (alert.metadata.fraudTypes?.includes('Montant modifié')) impact += 3;
    
    return Math.round(impact);
  }

  private calculateRiskLevel(score: number): AssureRiskLevel {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  // === STATISTICS ===

  async getStats(): Promise<AssureStats> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      total: this.assures.length,
      byStatus: {
        prospect: this.assures.filter(a => a.status === 'prospect').length,
        active: this.assures.filter(a => a.status === 'active').length,
        suspended: this.assures.filter(a => a.status === 'suspended').length,
        terminated: this.assures.filter(a => a.status === 'terminated').length,
      },
      byType: {
        particulier: this.assures.filter(a => a.type === 'particulier').length,
        professionnel: this.assures.filter(a => a.type === 'professionnel').length,
        entreprise: this.assures.filter(a => a.type === 'entreprise').length,
      },
      byRiskLevel: {
        low: this.assures.filter(a => a.riskProfile.riskLevel === 'low').length,
        medium: this.assures.filter(a => a.riskProfile.riskLevel === 'medium').length,
        high: this.assures.filter(a => a.riskProfile.riskLevel === 'high').length,
        critical: this.assures.filter(a => a.riskProfile.riskLevel === 'critical').length,
      },
      
      averageLifetimeValue: this.assures.reduce((sum, a) => sum + a.portfolio.customerLifetimeValue, 0) / this.assures.length,
      totalPremiums: this.assures.reduce((sum, a) => sum + a.portfolio.totalPremiums, 0),
      alertRate: (this.assures.filter(a => a.alerteIds.length > 0).length / this.assures.length) * 100,
      fraudRate: (this.assures.filter(a => a.riskProfile.nombreDossiersFraude > 0).length / this.assures.length) * 100,
      
      newThisMonth: this.assures.filter(a => a.createdAt >= monthStart).length,
      newThisWeek: this.assures.filter(a => a.createdAt >= weekStart).length,
      reviewDueCount: this.assures.filter(a => a.riskProfile.prochainReview <= now).length,
    };
  }

  // === UTILITY METHODS ===

  async getAssureAlertLinks(assureId: string): Promise<AssureAlertLink[]> {
    return this.alertLinks.filter(link => link.assureId === assureId);
  }

  async getAlertAssureLink(alertId: string): Promise<AssureAlertLink | null> {
    return this.alertLinks.find(link => link.alertId === alertId) || null;
  }
}

// Export singleton instance
export const assureService = new AssureService();