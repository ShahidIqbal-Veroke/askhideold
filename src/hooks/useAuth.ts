import { useUser } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { userRoleService } from "@/services/userRoleService";

export type UserRole = 'gestionnaire' | 'superviseur' | 'direction' | 'admin';

export interface EnhancedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  team: string;
  functionalTeams?: string[];
  avatar?: string;
}

// Mock role assignment based on email or user ID
// In a real app, this would come from your backend/database
const assignRole = (user: { emailAddresses?: Array<{ emailAddress?: string }> }): UserRole => {
  const email = user.emailAddresses?.[0]?.emailAddress?.toLowerCase() || '';
  
  // Simple role assignment logic
  if (email.includes('admin')) return 'admin';
  if (email.includes('supervisor') || email.includes('manager')) return 'superviseur';
  if (email.includes('director')) return 'direction';
  
  return 'gestionnaire'; // Default role
};

const assignTeam = (user: { emailAddresses?: Array<{ emailAddress?: string }> }): string => {
  const email = user.emailAddresses?.[0]?.emailAddress?.toLowerCase() || '';
  
  // Simple team assignment
  if (email.includes('paris')) return 'Équipe Paris';
  if (email.includes('lyon')) return 'Équipe Lyon';
  if (email.includes('marseille')) return 'Équipe Marseille';
  
  return 'Équipe Centrale'; // Default team
};

export function useAuth() {
  const { user, isLoaded, isSignedIn } = useUser();
  
  // État local pour le rôle (avec fallback localStorage pour demo)
  const [currentRole, setCurrentRole] = useState<UserRole>('gestionnaire');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(() => {
    const stored = localStorage.getItem('demo-selected-role');
    return stored as UserRole | null;
  });
  
  // Charger le rôle via le service
  useEffect(() => {
    if (user?.id) {
      const loadRole = async () => {
        try {
          // Priorité : Service de rôles > publicMetadata > email > demo override
          const serviceRole = await userRoleService.getUserRole(
            user.id, 
            user.emailAddresses?.[0]?.emailAddress
          );
          
          const metadataRole = user.publicMetadata?.role as UserRole;
          const emailRole = assignRole(user);
          
          // Ordre de priorité
          const finalRole = selectedRole || // Demo override
                           metadataRole ||  // Clerk metadata
                           serviceRole ||   // Service
                           emailRole ||     // Email inference
                           'gestionnaire';  // Fallback
          
          setCurrentRole(finalRole);
        } catch (error) {
          console.error('Error loading user role:', error);
          setCurrentRole(selectedRole || assignRole(user) || 'gestionnaire');
        }
      };
      
      loadRole();
    }
  }, [user?.id, user, selectedRole]);
  
  // Persist selected role to localStorage
  useEffect(() => {
    if (selectedRole) {
      localStorage.setItem('demo-selected-role', selectedRole);
      console.log('useAuth: role persisted to localStorage:', selectedRole);
    } else {
      localStorage.removeItem('demo-selected-role');
    }
  }, [selectedRole]);
  
  // Custom role changer that includes logging
  const changeRole = (newRole: UserRole | null) => {
    console.log('useAuth: changing role from', currentRole, 'to', newRole);
    setSelectedRole(newRole);
  };
  
  const enhancedUser: EnhancedUser | null = user ? {
    id: user.id,
    name: user.fullName || user.firstName || 'Utilisateur',
    email: user.emailAddresses?.[0]?.emailAddress || '',
    role: currentRole,
    team: assignTeam(user),
    functionalTeams: user.publicMetadata?.functionalTeams as string[] || [],
    avatar: user.imageUrl
  } : null;
  
  // Debug logging
  console.log('useAuth render:', { 
    selectedRole, 
    currentRole, 
    userLoaded: !!user,
    serviceIntegrated: true
  });
  
  return {
    user: enhancedUser,
    clerkUser: user,
    isLoaded,
    isSignedIn,
    role: currentRole,
    isGestionnaire: currentRole === 'gestionnaire',
    isSuperviseur: currentRole === 'superviseur',
    isDirection: currentRole === 'direction',
    isAdmin: currentRole === 'admin',
    // Fonction pour changer de rôle (demo)
    changeRole,
    // Nouveau : accès au service
    userRoleService,
    // Méthodes utilitaires
    canAssignRole: (targetRole: UserRole) => userRoleService.canAssignRole(currentRole, targetRole),
    hasPermission: (requiredRole: UserRole) => userRoleService.hasPermission(currentRole, requiredRole)
  };
}