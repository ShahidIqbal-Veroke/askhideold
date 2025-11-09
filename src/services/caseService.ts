import { Case, CaseStats, CaseFilters, CreateCaseRequest, UpdateCaseRequest, CaseAssignment, CaseStatus, CasePriority, CaseDecision } from '@/types/case.types';
import { Alert } from '@/types/alert.types';

// Mock data generator for development
const generateMockCases = (): Case[] => {
  const mockCases: Case[] = [];
  const statuses: CaseStatus[] = ['open', 'investigating', 'pending_review', 'closed'];
  const priorities: CasePriority[] = ['urgent', 'high', 'normal', 'low'];
  const decisions: CaseDecision[] = ['fraud_confirmed', 'fraud_rejected', 'insufficient_proof', 'pending'];
  const investigators = ['V. Dubois', 'M. Bernard', 'S. Laurent', 'A. Martin'];
  const supervisors = ['P. Moreau', 'C. Leroy', 'L. Rousseau'];
  
  for (let i = 1; i <= 15; i++) {
    const createdDate = new Date();
    createdDate.setHours(createdDate.getHours() - Math.random() * 168); // Last week
    
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const decision = status === 'closed' 
      ? decisions[Math.floor(Math.random() * 3)] // Exclude 'pending' for closed cases
      : 'pending';
    
    const estimatedLoss = Math.floor(Math.random() * 50000) + 5000;
    const recoveredAmount = decision === 'fraud_confirmed' ? estimatedLoss * (0.6 + Math.random() * 0.3) : 0;
    const preventedAmount = decision === 'fraud_rejected' ? estimatedLoss : 0;
    const investigationCost = Math.floor(Math.random() * 2000) + 500;
    
    mockCases.push({
      id: `CASE-2024-${String(i).padStart(4, '0')}`,
      reference: `CASE-2024-${String(i).padStart(4, '0')}`,
      sinisterNumber: `SIN-2024-${8800 + i}`,
      policyNumber: `POL-${2024000 + i}`,
      insuredName: ['Jean Dupont', 'Marie Martin', 'Pierre Durand', 'Sophie Bernard'][Math.floor(Math.random() * 4)],
      
      alerts: [`ALERT-2024-${String(i).padStart(4, '0')}`],
      primaryAlertId: `ALERT-2024-${String(i).padStart(4, '0')}`,
      
      status,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      investigator: investigators[Math.floor(Math.random() * investigators.length)],
      investigatorName: investigators[Math.floor(Math.random() * investigators.length)],
      supervisor: Math.random() > 0.3 ? supervisors[Math.floor(Math.random() * supervisors.length)] : undefined,
      supervisorName: Math.random() > 0.3 ? supervisors[Math.floor(Math.random() * supervisors.length)] : undefined,
      
      // === NOUVEAU: CHAMPS OBLIGATOIRES ===
      qualifiedBy: 'system',
      qualifiedByName: 'Système',
      investigationTeam: ['gestionnaire', 'gestionnaire', 'fraude', 'expert'][Math.floor(Math.random() * 4)] as any,
      handovers: Math.random() > 0.7 ? [{
        from: 'gestionnaire-initial',
        fromTeam: 'gestionnaire',
        fromRole: 'gestionnaire',
        to: investigators[Math.floor(Math.random() * investigators.length)],
        toTeam: 'fraude',
        toRole: 'fraud_investigator',
        reason: 'Escalade pour investigation complexe',
        timestamp: new Date(createdDate.getTime() + Math.random() * 2 * 24 * 60 * 60 * 1000)
      }] : [],
      
      decision,
      decisionReason: decision !== 'pending' ? 'Investigation completed based on evidence analysis' : undefined,
      decisionDate: decision !== 'pending' ? new Date(createdDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined,
      
      metrics: {
        estimatedLoss,
        recoveredAmount,
        preventedAmount,
        investigationCost,
        totalRoi: recoveredAmount + preventedAmount - investigationCost
      },
      
      timeline: [
        {
          id: `evt-${i}-1`,
          type: 'created',
          description: 'Dossier créé à partir d\'une alerte de fraude documentaire',
          userId: 'system',
          userName: 'Système',
          timestamp: createdDate
        }
      ],
      
      notes: [
        'Analyse documentaire révèle des incohérences dans les montants',
        'Contact avec l\'assuré prévu pour clarification'
      ],
      
      tags: ['document-fraud', 'high-value', 'urgent-review'],
      fraudTypes: ['Document falsifié', 'Montant modifié'],
      
      createdAt: createdDate,
      createdBy: 'system',
      createdByName: 'Système',
      updatedAt: createdDate,
      closedAt: status === 'closed' ? new Date(createdDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined
    });
  }
  
  return mockCases;
};

class CaseService {
  private cases: Case[] = [];
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (!this.initialized) {
      this.cases = generateMockCases();
      this.initialized = true;
    }
  }

  // Create case from qualified alerts
  async createFromAlerts(request: CreateCaseRequest, userId: string, userName: string): Promise<Case> {
    // === NOUVEAU: DÉTECTION ÉQUIPE ET HANDOVER ===
    const assignedTeam = request.investigationTeam || 'gestionnaire';
    const isHandover = request.assignTo && request.assignTo !== userName;
    
    const newCase: Case = {
      id: `CASE-${Date.now()}`,
      reference: `CASE-2024-${String(this.cases.length + 1).padStart(4, '0')}`,
      
      alerts: request.alertIds,
      primaryAlertId: request.primaryAlertId,
      
      status: 'open',
      priority: request.priority,
      investigator: request.assignTo,
      investigatorName: request.assignTo, // TODO: Get real name from user service
      
      // === NOUVEAU: TRAÇABILITÉ ÉQUIPES ===
      qualifiedBy: userId,
      qualifiedByName: userName,
      investigationTeam: assignedTeam,
      
      handovers: isHandover ? [{
        from: userId,
        fromTeam: 'gestionnaire', // Assumer que l'utilisateur actuel est gestionnaire
        fromRole: 'gestionnaire',
        to: request.assignTo!,
        toTeam: assignedTeam,
        toRole: assignedTeam === 'fraude' ? 'fraud_investigator' : assignedTeam,
        reason: request.handoverReason || 'Escalade pour investigation spécialisée',
        timestamp: new Date(),
        metadata: {
          alertIds: request.alertIds,
          estimatedLoss: request.estimatedLoss
        }
      }] : [],
      
      decision: 'pending',
      
      metrics: {
        estimatedLoss: request.estimatedLoss || 0,
        recoveredAmount: 0,
        preventedAmount: 0,
        investigationCost: 0,
        totalRoi: 0
      },
      
      timeline: [
        {
          id: `evt-${Date.now()}`,
          type: 'created',
          description: isHandover 
            ? `Dossier créé et transféré à l'équipe ${assignedTeam} à partir de ${request.alertIds.length} alerte(s)`
            : `Dossier créé à partir de ${request.alertIds.length} alerte(s)`,
          userId,
          userName,
          timestamp: new Date()
        }
      ],
      
      notes: request.notes ? [request.notes] : [],
      tags: isHandover ? ['handover', `from-gestionnaire-to-${assignedTeam}`] : [],
      fraudTypes: [],
      
      createdAt: new Date(),
      createdBy: userId,
      createdByName: userName,
      updatedAt: new Date()
    };

    this.cases.unshift(newCase);
    return newCase;
  }

  // Get cases with filters
  async getCases(filters?: CaseFilters): Promise<Case[]> {
    let filtered = [...this.cases];

    if (filters) {
      if (filters.status && filters.status.length > 0) {
        filtered = filtered.filter(c => filters.status!.includes(c.status));
      }
      if (filters.priority && filters.priority.length > 0) {
        filtered = filtered.filter(c => filters.priority!.includes(c.priority));
      }
      if (filters.investigator) {
        filtered = filtered.filter(c => c.investigator === filters.investigator);
      }
      if (filters.decision && filters.decision.length > 0) {
        filtered = filtered.filter(c => filters.decision!.includes(c.decision));
      }
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(c => 
          c.reference.toLowerCase().includes(term) ||
          c.sinisterNumber?.toLowerCase().includes(term) ||
          c.insuredName?.toLowerCase().includes(term)
        );
      }
    }

    return filtered;
  }

  // Get single case
  async getCase(id: string): Promise<Case | null> {
    return this.cases.find(c => c.id === id) || null;
  }

  // Update case
  async updateCase(request: UpdateCaseRequest, userId: string, userName: string): Promise<Case | null> {
    const caseIndex = this.cases.findIndex(c => c.id === request.caseId);
    if (caseIndex === -1) return null;

    const existingCase = this.cases[caseIndex];
    const now = new Date();

    // Create timeline event for status change
    if (request.status && request.status !== existingCase.status) {
      existingCase.timeline.push({
        id: `evt-${Date.now()}`,
        type: 'status_changed',
        description: `Statut changé de "${existingCase.status}" à "${request.status}"`,
        userId,
        userName,
        timestamp: now
      });
    }

    // Create timeline event for decision
    if (request.decision && request.decision !== existingCase.decision) {
      existingCase.timeline.push({
        id: `evt-${Date.now()}`,
        type: 'decision_made',
        description: `Décision: ${request.decision}${request.decisionReason ? ` - ${request.decisionReason}` : ''}`,
        userId,
        userName,
        timestamp: now
      });
    }

    // Update case fields
    const updatedCase: Case = {
      ...existingCase,
      ...request,
      metrics: request.metrics ? { ...existingCase.metrics, ...request.metrics } : existingCase.metrics,
      notes: request.addNote ? [...existingCase.notes, request.addNote] : existingCase.notes,
      tags: request.addTags ? [...existingCase.tags, ...request.addTags] : existingCase.tags,
      updatedAt: now,
      closedAt: request.status === 'closed' ? now : existingCase.closedAt,
      decisionDate: request.decision && request.decision !== 'pending' ? now : existingCase.decisionDate
    };

    this.cases[caseIndex] = updatedCase;
    return updatedCase;
  }

  // Assign cases
  async assignCases(assignment: CaseAssignment, userId: string, userName: string): Promise<void> {
    const now = new Date();
    
    assignment.caseIds.forEach(caseId => {
      const caseIndex = this.cases.findIndex(c => c.id === caseId);
      if (caseIndex !== -1) {
        const existingCase = this.cases[caseIndex];
        
        if (assignment.role === 'investigator') {
          existingCase.investigator = assignment.assignTo;
          existingCase.investigatorName = assignment.assignTo; // TODO: Get real name
        } else {
          existingCase.supervisor = assignment.assignTo;
          existingCase.supervisorName = assignment.assignTo; // TODO: Get real name
        }
        
        existingCase.timeline.push({
          id: `evt-${Date.now()}-${caseId}`,
          type: 'assigned',
          description: `Assigné à ${assignment.assignTo} (${assignment.role})`,
          userId,
          userName,
          timestamp: now
        });
        
        existingCase.updatedAt = now;
      }
    });
  }

  // Get case statistics
  async getStats(userId?: string): Promise<CaseStats> {
    let relevantCases = [...this.cases];
    
    if (userId) {
      relevantCases = relevantCases.filter(c => c.investigator === userId || c.supervisor === userId);
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const totalRecovered = relevantCases.reduce((sum, c) => sum + c.metrics.recoveredAmount, 0);
    const totalPrevented = relevantCases.reduce((sum, c) => sum + c.metrics.preventedAmount, 0);
    const totalCosts = relevantCases.reduce((sum, c) => sum + c.metrics.investigationCost, 0);

    return {
      total: relevantCases.length,
      open: relevantCases.filter(c => c.status === 'open').length,
      investigating: relevantCases.filter(c => c.status === 'investigating').length,
      pendingReview: relevantCases.filter(c => c.status === 'pending_review').length,
      closed: relevantCases.filter(c => c.status === 'closed').length,
      
      byPriority: {
        urgent: relevantCases.filter(c => c.priority === 'urgent').length,
        high: relevantCases.filter(c => c.priority === 'high').length,
        normal: relevantCases.filter(c => c.priority === 'normal').length,
        low: relevantCases.filter(c => c.priority === 'low').length,
      },
      
      byDecision: {
        fraudConfirmed: relevantCases.filter(c => c.decision === 'fraud_confirmed').length,
        fraudRejected: relevantCases.filter(c => c.decision === 'fraud_rejected').length,
        insufficientProof: relevantCases.filter(c => c.decision === 'insufficient_proof').length,
        pending: relevantCases.filter(c => c.decision === 'pending').length,
      },
      
      financialImpact: {
        totalRecovered,
        totalPrevented,
        totalInvestigationCosts: totalCosts,
        netRoi: totalRecovered + totalPrevented - totalCosts
      },
      
      avgInvestigationTime: 3.5, // Mock value in days
      todayCount: relevantCases.filter(c => c.createdAt >= todayStart).length,
      weekCount: relevantCases.filter(c => c.createdAt >= weekStart).length,
    };
  }
}

// Export singleton instance
export const caseService = new CaseService();