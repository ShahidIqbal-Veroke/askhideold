import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: UserRole | UserRole[];
  fallbackPath?: string;
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  requiredRole,
  fallbackPath = '/dashboard'
}) => {
  const { role, isAdmin } = useAuth();

  // Admin has access to everything
  if (isAdmin) {
    return <>{children}</>;
  }

  // Check if user has required role
  const hasRequiredRole = Array.isArray(requiredRole) 
    ? requiredRole.includes(role)
    : role === requiredRole;

  if (!hasRequiredRole) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Accès restreint
            </h2>
            <p className="text-slate-600 mb-4">
              Votre rôle actuel ({role}) ne permet pas d'accéder à cette page.
            </p>
            <p className="text-sm text-slate-500">
              Rôle requis: {Array.isArray(requiredRole) ? requiredRole.join(' ou ') : requiredRole}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

// Utility function to check role permissions
export const hasRolePermission = (
  userRole: UserRole, 
  requiredRole: UserRole | UserRole[]
): boolean => {
  if (userRole === 'admin') return true;
  
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole);
  }
  
  return userRole === requiredRole;
};

// Role hierarchy for hierarchical permissions
const roleHierarchy: Record<UserRole, number> = {
  'gestionnaire': 1,
  'superviseur': 2,
  'direction': 3,
  'admin': 4
};

export const hasMinimumRole = (userRole: UserRole, minimumRole: UserRole): boolean => {
  return roleHierarchy[userRole] >= roleHierarchy[minimumRole];
};