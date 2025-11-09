import { UserRole } from '@/hooks/useAuth';

export interface UserWithRole {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  team?: string;
  functionalTeams?: string[];
  assignedBy?: string;
  assignedAt?: Date;
  lastLogin?: Date;
  status: 'active' | 'inactive' | 'pending';
}

export interface RoleAssignmentRequest {
  userId: string;
  role: UserRole;
  team?: string;
  functionalTeams?: string[];
  assignedBy: string;
  reason?: string;
}

export interface RoleStats {
  totalUsers: number;
  byRole: Record<UserRole, number>;
  pendingAssignments: number;
  lastAssignments: UserWithRole[];
}

class UserRoleService {
  private users: Map<string, UserWithRole> = new Map();
  private roleAssignments: Map<string, UserRole> = new Map();
  private pendingRequests: Map<string, RoleAssignmentRequest> = new Map();
  
  constructor() {
    this.initializeMockData();
  }

  // === GESTION DES RÔLES UTILISATEURS ===

  async getUserRole(userId: string, fallbackEmail?: string): Promise<UserRole> {
    try {
      // 1. Vérifier cache local
      if (this.roleAssignments.has(userId)) {
        return this.roleAssignments.get(userId)!;
      }

      // 2. Vérifier utilisateur existant
      const user = this.users.get(userId);
      if (user) {
        this.roleAssignments.set(userId, user.role);
        return user.role;
      }

      // 3. Logique d'inférence améliorée depuis l'email
      if (fallbackEmail) {
        const inferredRole = this.inferRoleFromEmail(fallbackEmail);
        this.roleAssignments.set(userId, inferredRole);
        return inferredRole;
      }

      return 'gestionnaire'; // Défaut sécurisé
    } catch (error) {
      console.error('Error getting user role:', error);
      return 'gestionnaire';
    }
  }

  async assignRole(request: RoleAssignmentRequest): Promise<UserWithRole> {
    const user: UserWithRole = {
      id: request.userId,
      name: `User ${request.userId.slice(0, 8)}`, // Sera mis à jour par Clerk
      email: '', // Sera mis à jour par Clerk
      role: request.role,
      team: request.team,
      functionalTeams: request.functionalTeams || [],
      assignedBy: request.assignedBy,
      assignedAt: new Date(),
      status: 'active'
    };

    this.users.set(request.userId, user);
    this.roleAssignments.set(request.userId, request.role);

    // Log pour audit
    console.log(`✅ Rôle assigné: ${request.role} à ${request.userId} par ${request.assignedBy}`);
    
    return user;
  }

  async updateUserRole(userId: string, newRole: UserRole, updatedBy: string): Promise<boolean> {
    try {
      const user = this.users.get(userId);
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      const oldRole = user.role;
      
      // Mettre à jour
      user.role = newRole;
      user.assignedBy = updatedBy;
      user.assignedAt = new Date();
      
      this.users.set(userId, user);
      this.roleAssignments.set(userId, newRole);

      console.log(`🔄 Rôle modifié: ${oldRole} → ${newRole} pour ${userId} par ${updatedBy}`);
      
      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      return false;
    }
  }

  async bulkAssignRoles(requests: RoleAssignmentRequest[]): Promise<UserWithRole[]> {
    const results: UserWithRole[] = [];
    
    for (const request of requests) {
      try {
        const user = await this.assignRole(request);
        results.push(user);
      } catch (error) {
        console.error(`Failed to assign role to ${request.userId}:`, error);
      }
    }
    
    return results;
  }

  // === GESTION DES ÉQUIPES ===

  async assignToTeam(userId: string, teamId: string, assignedBy: string): Promise<boolean> {
    try {
      const user = this.users.get(userId);
      if (!user) return false;

      user.team = teamId;
      user.assignedBy = assignedBy;
      user.assignedAt = new Date();
      
      this.users.set(userId, user);
      return true;
    } catch (error) {
      console.error('Error assigning to team:', error);
      return false;
    }
  }

  async assignToFunctionalTeams(userId: string, teamIds: string[], assignedBy: string): Promise<boolean> {
    try {
      const user = this.users.get(userId);
      if (!user) return false;

      user.functionalTeams = teamIds;
      user.assignedBy = assignedBy;
      user.assignedAt = new Date();
      
      this.users.set(userId, user);
      return true;
    } catch (error) {
      console.error('Error assigning to functional teams:', error);
      return false;
    }
  }

  // === REQUÊTES ET STATISTIQUES ===

  async getAllUsers(): Promise<UserWithRole[]> {
    return Array.from(this.users.values()).sort((a, b) => 
      b.assignedAt?.getTime() || 0 - (a.assignedAt?.getTime() || 0)
    );
  }

  async getUsersByRole(role: UserRole): Promise<UserWithRole[]> {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }

  async getUsersByTeam(teamId: string): Promise<UserWithRole[]> {
    return Array.from(this.users.values()).filter(user => 
      user.team === teamId || user.functionalTeams?.includes(teamId)
    );
  }

  async getStats(): Promise<RoleStats> {
    const users = await this.getAllUsers();
    
    const byRole = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<UserRole, number>);

    // Ensure all roles are represented
    const roles: UserRole[] = ['gestionnaire', 'superviseur', 'direction', 'admin'];
    roles.forEach(role => {
      if (!byRole[role]) byRole[role] = 0;
    });

    return {
      totalUsers: users.length,
      byRole,
      pendingAssignments: this.pendingRequests.size,
      lastAssignments: users.slice(0, 5)
    };
  }

  // === LOGIQUE D'INFÉRENCE AMÉLIORÉE ===

  private inferRoleFromEmail(email: string): UserRole {
    const normalizedEmail = email.toLowerCase();
    
    // Patterns spécifiques d'entreprise
    const patterns: [RegExp, UserRole][] = [
      // Admin patterns
      [/^admin\.|\.admin@|admin@|system@|root@/, 'admin'],
      [/administrateur|sysadmin|it\.admin/, 'admin'],
      
      // Direction patterns  
      [/^dir\.|director|directeur|ceo|cto|president/, 'direction'],
      [/direction\.|\.direction@|management@/, 'direction'],
      
      // Superviseur patterns
      [/^sup\.|supervisor|manager|chef|lead/, 'superviseur'],
      [/superviseur|responsable|coordinateur/, 'superviseur'],
      
      // Gestionnaire patterns
      [/^gest\.|gestionnaire|analyst|specialist/, 'gestionnaire'],
      [/conseiller|expert|operateur/, 'gestionnaire']
    ];

    for (const [pattern, role] of patterns) {
      if (pattern.test(normalizedEmail)) {
        return role;
      }
    }

    // Domaines spécifiques
    if (normalizedEmail.includes('@admin.') || normalizedEmail.includes('.admin')) {
      return 'admin';
    }

    return 'gestionnaire'; // Défaut sécurisé
  }

  // === DONNÉES MOCK POUR DÉVELOPPEMENT ===

  private initializeMockData(): void {
    const mockUsers: UserWithRole[] = [
      {
        id: 'user_001',
        name: 'Marie Dupont',
        email: 'marie.dupont@company.com',
        role: 'gestionnaire',
        team: 'team-gestion-1',
        functionalTeams: ['team-gestion-1'],
        assignedBy: 'system',
        assignedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        status: 'active'
      },
      {
        id: 'user_002', 
        name: 'Pierre Martin',
        email: 'p.martin@company.com',
        role: 'superviseur',
        team: 'team-fraude-1',
        functionalTeams: ['team-fraude-1'],
        assignedBy: 'system',
        assignedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: 'active'
      },
      {
        id: 'user_003',
        name: 'Sophie Directeur',
        email: 'sophie.directeur@company.com', 
        role: 'direction',
        team: 'direction',
        assignedBy: 'system',
        assignedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        status: 'active'
      },
      {
        id: 'user_004',
        name: 'Admin System',
        email: 'admin@company.com',
        role: 'admin',
        assignedBy: 'system',
        assignedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        status: 'active'
      }
    ];

    // Initialize data
    mockUsers.forEach(user => {
      this.users.set(user.id, user);
      this.roleAssignments.set(user.id, user.role);
    });
  }

  // === MÉTHODES UTILITAIRES ===

  hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
    const hierarchy: Record<UserRole, number> = {
      'gestionnaire': 1,
      'superviseur': 2, 
      'direction': 3,
      'admin': 4
    };

    return hierarchy[userRole] >= hierarchy[requiredRole];
  }

  canAssignRole(assignerRole: UserRole, targetRole: UserRole): boolean {
    // Admin peut tout assigner
    if (assignerRole === 'admin') return true;
    
    // Direction peut assigner jusqu'à superviseur
    if (assignerRole === 'direction' && ['gestionnaire', 'superviseur'].includes(targetRole)) return true;
    
    // Superviseur peut assigner gestionnaire uniquement
    if (assignerRole === 'superviseur' && targetRole === 'gestionnaire') return true;
    
    return false;
  }
}

export const userRoleService = new UserRoleService();