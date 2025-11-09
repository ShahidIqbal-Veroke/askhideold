import {
  FunctionalTeam,
  TeamMember,
  TeamAssignment,
  TeamTransfer,
  TeamStats,
  CreateTeamRequest,
  UpdateTeamRequest,
  AssignMemberRequest,
  TransferRequest,
  TeamFilters,
  MemberFilters,
  TeamSpecialty,
  Territory,
  TeamRole
} from '@/types/team.types';

// Mock data generator pour les équipes fonctionnelles
const generateMockFunctionalTeams = (): FunctionalTeam[] => {
  return [
    {
      id: 'team-fraude-1',
      name: 'Équipe Fraude Interne',
      specialty: 'fraude',
      description: 'Investigation approfondie des fraudes complexes et réseaux organisés',
      averageProcessingTime: '3-5 jours',
      costPerHour: 75,
      slaHours: 72,
      specialties: ['Fraude documentaire', 'Réseaux organisés', 'Analyses comportementales', 'Fraude à grande échelle'],
      certifications: ['CFE', 'Investigation Avancée', 'Analyse Forensique'],
      stats: {
        averageScore: 92,
        completionRate: 87,
        totalCasesHandled: 456,
        customerSatisfaction: 4.3
      },
      isActive: true,
      maxCapacity: 12,
      workingHours: {
        start: '08:00',
        end: '18:00',
        timezone: 'Europe/Paris'
      },
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date()
    },
    {
      id: 'team-auto-1',
      name: 'Expert Automobile',
      specialty: 'expert_auto',
      description: 'Expertise technique véhicules et sinistres auto',
      averageProcessingTime: '2-3 jours',
      costPerHour: 60,
      slaHours: 48,
      specialties: ['Expertise technique', 'Évaluation dommages', 'Détection staging', 'Analyse mécanique'],
      certifications: ['Expert Automobile Agréé', 'Diagnostic Technique'],
      stats: {
        averageScore: 89,
        completionRate: 94,
        totalCasesHandled: 1243,
        customerSatisfaction: 4.1
      },
      isActive: true,
      maxCapacity: 8,
      workingHours: {
        start: '07:30',
        end: '17:30',
        timezone: 'Europe/Paris'
      },
      createdAt: new Date('2023-02-01'),
      updatedAt: new Date()
    },
    {
      id: 'team-gestion-1',
      name: 'Équipe Gestion Client',
      specialty: 'gestion_client',
      description: 'Gestion des dossiers standards et qualification initiale',
      averageProcessingTime: '1-2 jours',
      costPerHour: 35,
      slaHours: 24,
      specialties: ['Qualification rapide', 'Gestion courante', 'Relation client', 'Traitement initial'],
      certifications: ['Relation Client', 'Gestion Assurance'],
      stats: {
        averageScore: 85,
        completionRate: 96,
        totalCasesHandled: 3247,
        customerSatisfaction: 4.0
      },
      isActive: true,
      maxCapacity: 15,
      workingHours: {
        start: '08:00',
        end: '19:00',
        timezone: 'Europe/Paris'
      },
      createdAt: new Date('2023-01-10'),
      updatedAt: new Date()
    },
    {
      id: 'team-it-1',
      name: 'Équipe IT & Cyber',
      specialty: 'it',
      description: 'Support technique, cyber-fraude et analyses digitales',
      averageProcessingTime: '2-4 jours',
      costPerHour: 85,
      slaHours: 48,
      specialties: ['Cyber-fraude', 'Analyse digitale', 'Forensics', 'Support technique'],
      certifications: ['CISSP', 'CEH', 'Forensics Digitale'],
      stats: {
        averageScore: 91,
        completionRate: 88,
        totalCasesHandled: 234,
        customerSatisfaction: 4.2
      },
      isActive: true,
      maxCapacity: 6,
      workingHours: {
        start: '09:00',
        end: '18:00',
        timezone: 'Europe/Paris'
      },
      createdAt: new Date('2023-03-01'),
      updatedAt: new Date()
    },
    {
      id: 'team-compliance-1',
      name: 'Équipe Compliance',
      specialty: 'compliance',
      description: 'Contrôle réglementaire et conformité',
      averageProcessingTime: '3-7 jours',
      costPerHour: 70,
      slaHours: 120,
      specialties: ['Audit réglementaire', 'Conformité RGPD', 'Contrôles internes', 'Reporting'],
      certifications: ['Compliance Officer', 'RGPD DPO', 'Audit Interne'],
      stats: {
        averageScore: 88,
        completionRate: 92,
        totalCasesHandled: 187,
        customerSatisfaction: 4.0
      },
      isActive: true,
      maxCapacity: 5,
      workingHours: {
        start: '08:30',
        end: '17:30',
        timezone: 'Europe/Paris'
      },
      createdAt: new Date('2023-02-15'),
      updatedAt: new Date()
    }
  ];
};

// Mock data generator pour les membres
const generateMockTeamMembers = (): TeamMember[] => {
  const members: TeamMember[] = [];
  const names = [
    'Sophie Martin', 'Pierre Dubois', 'Marie Leroux', 'Jean Durand', 'Claire Bernard',
    'Vincent Moreau', 'Isabelle Petit', 'Thomas Laurent', 'Nathalie Simon', 'Pascal Roux'
  ];
  
  const roles: TeamRole[] = ['gestionnaire', 'superviseur', 'direction', 'admin'];
  const territories: Territory[] = ['paris', 'lyon', 'marseille', 'national'];
  
  names.forEach((name, index) => {
    const email = name.toLowerCase().replace(' ', '.') + '@company.com';
    const role = roles[index % roles.length];
    const territory = territories[index % territories.length];
    
    members.push({
      id: `member-${index + 1}`,
      name,
      email,
      role,
      functionalTeams: index < 3 ? ['team-fraude-1'] : index < 6 ? ['team-auto-1'] : ['team-gestion-1'],
      territory,
      technicalPermission: role === 'admin' ? 'admin' : role === 'superviseur' ? 'editor' : 'viewer',
      status: index === 9 ? 'vacation' : 'active',
      availabilityStatus: index === 8 ? 'busy' : 'available',
      joinedAt: new Date(2023, Math.floor(index / 3), (index * 7) % 28 + 1),
      lastActiveAt: new Date(),
      individualStats: {
        casesHandled: Math.floor(Math.random() * 200) + 50,
        averageResolutionTime: Math.floor(Math.random() * 48) + 12,
        customerRating: 3.5 + Math.random() * 1.5,
        specializations: ['Qualification', 'Expertise', 'Investigation'].slice(0, Math.floor(Math.random() * 3) + 1)
      }
    });
  });
  
  return members;
};

class TeamService {
  private functionalTeams: FunctionalTeam[] = [];
  private teamMembers: TeamMember[] = [];
  private assignments: TeamAssignment[] = [];
  private transfers: TeamTransfer[] = [];
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (!this.initialized) {
      this.functionalTeams = generateMockFunctionalTeams();
      this.teamMembers = generateMockTeamMembers();
      this.generateMockAssignments();
      this.initialized = true;
    }
  }

  private generateMockAssignments() {
    this.teamMembers.forEach(member => {
      member.functionalTeams.forEach(teamId => {
        this.assignments.push({
          id: `assign-${member.id}-${teamId}`,
          memberId: member.id,
          teamId,
          assignedBy: 'system',
          assignedAt: member.joinedAt,
          role: member.role === 'superviseur' ? 'lead' : 'member'
        });
      });
    });
  }

  // === CRUD ÉQUIPES FONCTIONNELLES ===

  async getFunctionalTeams(filters?: TeamFilters): Promise<FunctionalTeam[]> {
    let filtered = [...this.functionalTeams];

    if (filters) {
      if (filters.specialty) {
        filtered = filtered.filter(t => t.specialty === filters.specialty);
      }
      if (filters.isActive !== undefined) {
        filtered = filtered.filter(t => t.isActive === filters.isActive);
      }
      if (filters.hasCapacity) {
        filtered = filtered.filter(t => this.getTeamCurrentWorkload(t.id) < t.maxCapacity);
      }
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(t => 
          t.name.toLowerCase().includes(term) ||
          t.description.toLowerCase().includes(term) ||
          t.specialties.some(s => s.toLowerCase().includes(term))
        );
      }
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  async getFunctionalTeam(id: string): Promise<FunctionalTeam | null> {
    return this.functionalTeams.find(t => t.id === id) || null;
  }

  async createFunctionalTeam(request: CreateTeamRequest): Promise<FunctionalTeam> {
    const newTeam: FunctionalTeam = {
      id: `team-${Date.now()}`,
      name: request.name,
      specialty: request.specialty,
      description: request.description,
      averageProcessingTime: `${Math.floor(request.slaHours / 24)}-${Math.ceil(request.slaHours / 24)} jours`,
      costPerHour: request.costPerHour,
      slaHours: request.slaHours,
      specialties: request.specialties,
      certifications: [],
      stats: {
        averageScore: 80,
        completionRate: 85,
        totalCasesHandled: 0,
        customerSatisfaction: 4.0
      },
      isActive: true,
      maxCapacity: request.maxCapacity,
      workingHours: request.workingHours,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.functionalTeams.push(newTeam);
    return newTeam;
  }

  async updateFunctionalTeam(request: UpdateTeamRequest): Promise<FunctionalTeam | null> {
    const teamIndex = this.functionalTeams.findIndex(t => t.id === request.teamId);
    if (teamIndex === -1) return null;

    const existingTeam = this.functionalTeams[teamIndex];
    const updatedTeam: FunctionalTeam = {
      ...existingTeam,
      ...(request.name && { name: request.name }),
      ...(request.description && { description: request.description }),
      ...(request.maxCapacity && { maxCapacity: request.maxCapacity }),
      ...(request.costPerHour && { costPerHour: request.costPerHour }),
      ...(request.slaHours && { slaHours: request.slaHours }),
      ...(request.specialties && { specialties: request.specialties }),
      ...(request.isActive !== undefined && { isActive: request.isActive }),
      ...(request.workingHours && { workingHours: request.workingHours }),
      updatedAt: new Date()
    };

    this.functionalTeams[teamIndex] = updatedTeam;
    return updatedTeam;
  }

  async deleteFunctionalTeam(id: string): Promise<boolean> {
    const initialLength = this.functionalTeams.length;
    this.functionalTeams = this.functionalTeams.filter(t => t.id !== id);
    
    // Nettoyer les assignments
    this.assignments = this.assignments.filter(a => a.teamId !== id);
    
    return this.functionalTeams.length < initialLength;
  }

  // === GESTION MEMBRES ===

  async getTeamMembers(filters?: MemberFilters): Promise<TeamMember[]> {
    let filtered = [...this.teamMembers];

    if (filters) {
      if (filters.role) {
        filtered = filtered.filter(m => m.role === filters.role);
      }
      if (filters.territory) {
        filtered = filtered.filter(m => m.territory === filters.territory);
      }
      if (filters.status) {
        filtered = filtered.filter(m => m.status === filters.status);
      }
      if (filters.teamId) {
        filtered = filtered.filter(m => m.functionalTeams.includes(filters.teamId!));
      }
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(m => 
          m.name.toLowerCase().includes(term) ||
          m.email.toLowerCase().includes(term)
        );
      }
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  async getTeamMember(id: string): Promise<TeamMember | null> {
    return this.teamMembers.find(m => m.id === id) || null;
  }

  async getTeamMembersByTeam(teamId: string): Promise<TeamMember[]> {
    return this.teamMembers.filter(m => m.functionalTeams.includes(teamId));
  }

  // === ASSIGNMENTS ===

  async assignMemberToTeam(request: AssignMemberRequest): Promise<TeamAssignment> {
    // Vérifier si déjà assigné
    const existingAssignment = this.assignments.find(
      a => a.memberId === request.memberId && a.teamId === request.teamId
    );
    
    if (existingAssignment) {
      throw new Error('Membre déjà assigné à cette équipe');
    }

    const assignment: TeamAssignment = {
      id: `assign-${Date.now()}`,
      memberId: request.memberId,
      teamId: request.teamId,
      assignedBy: 'current-user', // TODO: Get real user
      assignedAt: new Date(),
      role: request.role,
      notes: request.notes
    };

    this.assignments.push(assignment);

    // Mettre à jour le membre
    const member = this.teamMembers.find(m => m.id === request.memberId);
    if (member) {
      member.functionalTeams.push(request.teamId);
    }

    return assignment;
  }

  async unassignMemberFromTeam(memberId: string, teamId: string): Promise<boolean> {
    const initialLength = this.assignments.length;
    this.assignments = this.assignments.filter(
      a => !(a.memberId === memberId && a.teamId === teamId)
    );

    // Mettre à jour le membre
    const member = this.teamMembers.find(m => m.id === memberId);
    if (member) {
      member.functionalTeams = member.functionalTeams.filter(t => t !== teamId);
    }

    return this.assignments.length < initialLength;
  }

  // === TRANSFERTS ===

  async createTransfer(request: TransferRequest): Promise<TeamTransfer> {
    const fromTeam = await this.getFunctionalTeam(request.fromTeamId);
    const toTeam = await this.getFunctionalTeam(request.toTeamId);
    
    if (!fromTeam || !toTeam) {
      throw new Error('Équipe source ou destination introuvable');
    }

    const urgencyMultiplier = {
      immediate: 2.0,
      within_24h: 1.5,
      within_week: 1.2,
      routine: 1.0
    };

    const estimatedCost = Math.round(
      toTeam.costPerHour * toTeam.slaHours * urgencyMultiplier[request.urgency]
    );

    const transfer: TeamTransfer = {
      id: `transfer-${Date.now()}`,
      fromTeamId: request.fromTeamId,
      toTeamId: request.toTeamId,
      requestedBy: 'current-user', // TODO: Get real user
      reason: request.reason,
      urgency: request.urgency,
      status: 'pending',
      estimatedCost
    };

    this.transfers.push(transfer);
    return transfer;
  }

  async getTransfers(): Promise<TeamTransfer[]> {
    return [...this.transfers].sort((a, b) => 
      new Date(b.processedAt || b.processedAt || new Date()).getTime() - 
      new Date(a.processedAt || a.processedAt || new Date()).getTime()
    );
  }

  // === STATISTIQUES ===

  async getTeamStats(): Promise<TeamStats> {
    const totalTeams = this.functionalTeams.length;
    const totalMembers = this.teamMembers.length;
    const activeMembers = this.teamMembers.filter(m => m.status === 'active').length;

    // Par territoire
    const byTerritory = {} as Record<Territory, any>;
    (['paris', 'lyon', 'marseille', 'national'] as Territory[]).forEach(territory => {
      const members = this.teamMembers.filter(m => m.territory === territory);
      byTerritory[territory] = {
        teams: new Set(members.flatMap(m => m.functionalTeams)).size,
        members: members.length,
        workload: members.reduce((sum, m) => sum + m.individualStats.casesHandled, 0)
      };
    });

    // Par spécialité
    const bySpecialty = {} as Record<TeamSpecialty, any>;
    (['fraude', 'expert_auto', 'gestion_client', 'it', 'compliance'] as TeamSpecialty[]).forEach(specialty => {
      const teams = this.functionalTeams.filter(t => t.specialty === specialty);
      const members = teams.flatMap(t => this.getTeamMembersByTeam(t.id));
      
      bySpecialty[specialty] = {
        teams: teams.length,
        members: members.length,
        averageProcessingTime: teams.length > 0 ? teams[0].slaHours : 0,
        completionRate: teams.length > 0 ? 
          teams.reduce((sum, t) => sum + t.stats.completionRate, 0) / teams.length : 0
      };
    });

    return {
      totalTeams,
      totalMembers,
      activeMembers,
      byTerritory,
      bySpecialty,
      overallPerformance: {
        averageResolutionTime: 36,
        customerSatisfaction: 4.1,
        slaComplianceRate: 89,
        costEfficiency: 0.85
      },
      capacity: {
        totalCapacity: this.functionalTeams.reduce((sum, t) => sum + t.maxCapacity, 0),
        currentWorkload: this.teamMembers.filter(m => m.availabilityStatus === 'busy').length,
        utilizationRate: 0.73,
        availableCapacity: this.functionalTeams.reduce((sum, t) => sum + t.maxCapacity, 0) * 0.27
      }
    };
  }

  // === UTILITAIRES ===

  private getTeamCurrentWorkload(teamId: string): number {
    const members = this.getTeamMembersByTeam(teamId);
    return members.filter(m => m.availabilityStatus === 'busy').length;
  }

  async getAvailableTeamsForTransfer(specialty?: TeamSpecialty): Promise<FunctionalTeam[]> {
    let teams = this.functionalTeams.filter(t => t.isActive);
    
    if (specialty) {
      teams = teams.filter(t => t.specialty === specialty);
    }
    
    return teams.filter(t => this.getTeamCurrentWorkload(t.id) < t.maxCapacity);
  }
}

// Export singleton instance
export const teamService = new TeamService();