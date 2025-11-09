export type TeamRole = 'gestionnaire' | 'superviseur' | 'direction' | 'admin';
export type TeamSpecialty = 'fraude' | 'expert_auto' | 'gestion_client' | 'it' | 'compliance' | 'sinistres' | 'souscription';
export type Territory = 'paris' | 'lyon' | 'marseille' | 'national';
export type TechnicalPermission = 'admin' | 'editor' | 'viewer';

// Équipe Fonctionnelle (spécialisation métier)
export interface FunctionalTeam {
  id: string;
  name: string;
  specialty: TeamSpecialty;
  description: string;
  
  // Caractéristiques opérationnelles
  averageProcessingTime: string;
  costPerHour: number;
  slaHours: number;
  
  // Compétences et spécialités
  specialties: string[];
  certifications: string[];
  
  // Performance
  stats: {
    averageScore: number;
    completionRate: number;
    totalCasesHandled: number;
    customerSatisfaction: number;
  };
  
  // Configuration
  isActive: boolean;
  maxCapacity: number;
  workingHours: {
    start: string;
    end: string;
    timezone: string;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// Membre d'équipe
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  
  // Rôle métier
  role: TeamRole;
  
  // Assignment aux équipes
  functionalTeams: string[]; // IDs des équipes fonctionnelles
  territory: Territory;
  
  // Permissions techniques
  technicalPermission: TechnicalPermission;
  
  // Statut
  status: 'active' | 'pending' | 'inactive' | 'vacation';
  availabilityStatus: 'available' | 'busy' | 'unavailable';
  
  // Historique
  joinedAt: Date;
  lastActiveAt: Date;
  
  // Performance individuelle
  individualStats: {
    casesHandled: number;
    averageResolutionTime: number;
    customerRating: number;
    specializations: string[];
  };
}

// Assignment d'un membre à une équipe
export interface TeamAssignment {
  id: string;
  memberId: string;
  teamId: string;
  assignedBy: string;
  assignedAt: Date;
  role: 'member' | 'lead' | 'backup';
  notes?: string;
}

// Transfert entre équipes
export interface TeamTransfer {
  id: string;
  fromTeamId: string;
  toTeamId: string;
  requestedBy: string;
  reason: string;
  urgency: 'immediate' | 'within_24h' | 'within_week' | 'routine';
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  estimatedCost: number;
  processedBy?: string;
  processedAt?: Date;
  completedAt?: Date;
}

// Statistiques d'équipes
export interface TeamStats {
  totalTeams: number;
  totalMembers: number;
  activeMembers: number;
  
  // Par territoire
  byTerritory: Record<Territory, {
    teams: number;
    members: number;
    workload: number;
  }>;
  
  // Par spécialité
  bySpecialty: Record<TeamSpecialty, {
    teams: number;
    members: number;
    averageProcessingTime: number;
    completionRate: number;
  }>;
  
  // Performance globale
  overallPerformance: {
    averageResolutionTime: number;
    customerSatisfaction: number;
    slaComplianceRate: number;
    costEfficiency: number;
  };
  
  // Capacité
  capacity: {
    totalCapacity: number;
    currentWorkload: number;
    utilizationRate: number;
    availableCapacity: number;
  };
}

// Requêtes pour le service
export interface CreateTeamRequest {
  name: string;
  specialty: TeamSpecialty;
  description: string;
  territory?: Territory;
  maxCapacity: number;
  costPerHour: number;
  slaHours: number;
  specialties: string[];
  workingHours: {
    start: string;
    end: string;
    timezone: string;
  };
}

export interface UpdateTeamRequest {
  teamId: string;
  name?: string;
  description?: string;
  maxCapacity?: number;
  costPerHour?: number;
  slaHours?: number;
  specialties?: string[];
  isActive?: boolean;
  workingHours?: {
    start: string;
    end: string;
    timezone: string;
  };
}

export interface AssignMemberRequest {
  memberId: string;
  teamId: string;
  role: 'member' | 'lead' | 'backup';
  notes?: string;
}

export interface TransferRequest {
  fromTeamId: string;
  toTeamId: string;
  reason: string;
  urgency: 'immediate' | 'within_24h' | 'within_week' | 'routine';
  entityId?: string; // ID de l'alerte/case à transférer
  entityType?: 'alert' | 'case' | 'demande';
}

// Filtres
export interface TeamFilters {
  specialty?: TeamSpecialty;
  territory?: Territory;
  isActive?: boolean;
  hasCapacity?: boolean;
  searchTerm?: string;
}

export interface MemberFilters {
  role?: TeamRole;
  territory?: Territory;
  status?: 'active' | 'pending' | 'inactive' | 'vacation';
  teamId?: string;
  searchTerm?: string;
}