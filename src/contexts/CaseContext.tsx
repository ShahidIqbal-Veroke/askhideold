import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { mockServices } from '@/lib/mockServices';
import { DemoInitializer } from '@/lib/demoInitializer';
import { db } from '@/lib/localStorage';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

// Use localStorage Case interface (snake_case)
interface Case {
  id: string;
  reference: string;
  alert_ids: string[];
  status: 'open' | 'investigating' | 'pending_review' | 'closed';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  investigation_team: string;
  assigned_to: string;
  created_at: string;
  updated_at: string;
  estimated_loss: number;
  investigation_cost: number;
  roi_score?: number;
  handovers: Array<{
    from: string;
    fromTeam: string;
    to: string;
    toTeam: string;
    reason: string;
    timestamp: string;
  }>;
  metadata: {
    fraud_type?: string;
    evidence_collected?: string[];
    investigation_notes?: string;
  };
}

interface CaseStats {
  total: number;
  open: number;
  investigating: number;
  pending_review: number;
  closed: number;
  financialImpact: {
    netRoi: number;
  };
}

interface CaseFilters {
  status?: string[];
  priority?: string[];
  assigned_to?: string;
  searchTerm?: string;
}

interface CaseContextType {
  // Cases data
  cases: Case[];
  selectedCase: Case | null;
  stats: CaseStats | null;
  
  // Loading states
  isLoading: boolean;
  isLoadingStats: boolean;
  
  // Actions
  loadCases: (filters?: CaseFilters) => Promise<void>;
  selectCase: (caseId: string | null) => void;
  createCase: (alertIds: string[], assignTo?: string, priority?: string) => Promise<Case | null>;
  updateCase: (caseId: string, updates: Partial<Case>) => Promise<void>;
  assignCases: (caseIds: string[], assignTo: string) => Promise<void>;
  refreshStats: () => Promise<void>;
  
  // Helpers
  getCasesByStatus: (status: string) => Case[];
  getMyCases: () => Case[];
}

const CaseContext = createContext<CaseContextType | undefined>(undefined);

export function CaseProvider({ children }: { children: ReactNode }) {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [stats, setStats] = useState<CaseStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Load cases with optional filters
  const loadCases = async (filters?: CaseFilters) => {
    setIsLoading(true);
    try {
      // Ensure demo data is initialized
      if (!DemoInitializer.hasData()) {
        DemoInitializer.init();
      }
      
      let data = await mockServices.CaseService.getCases();
      
      // Apply filters
      if (filters) {
        if (filters.status && filters.status.length > 0) {
          data = data.filter(c => filters.status!.includes(c.status));
        }
        if (filters.priority && filters.priority.length > 0) {
          data = data.filter(c => filters.priority!.includes(c.priority));
        }
        if (filters.assigned_to) {
          data = data.filter(c => c.assigned_to === filters.assigned_to);
        }
        if (filters.searchTerm) {
          const term = filters.searchTerm.toLowerCase();
          data = data.filter(c => 
            c.reference.toLowerCase().includes(term) ||
            c.id.toLowerCase().includes(term)
          );
        }
      }
      
      setCases(data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les dossiers",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Select a case
  const selectCase = (caseId: string | null) => {
    if (!caseId) {
      setSelectedCase(null);
      return;
    }
    
    const foundCase = cases.find(c => c.id === caseId);
    setSelectedCase(foundCase || null);
  };

  // Create new case from alerts
  const createCase = async (alertIds: string[], assignTo?: string, priority?: string): Promise<Case | null> => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Utilisateur non connecté",
        variant: "destructive"
      });
      return null;
    }

    try {
      console.log('🏗️ Creating case with params:', { alertIds, assignTo: assignTo || user.name, priority });
      const newCase = await mockServices.CaseService.createFromAlerts(
        alertIds,
        assignTo || user.name,
        'gestionnaire'  // team parameter - could be made dynamic later
      );
      
      // Update the case with the priority if provided
      if (priority && newCase) {
        console.log('🔧 Setting case priority to:', priority);
        await mockServices.CaseService.updateCase(newCase.id, { priority: priority as any });
      }
      
      // Reload cases to get updated data
      await loadCases();
      
      toast({
        title: "Dossier créé",
        description: `Dossier ${newCase.reference} créé avec succès`
      });
      
      // Refresh stats
      await refreshStats();
      
      return newCase;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la création du dossier",
        variant: "destructive"
      });
      return null;
    }
  };

  // Update case
  const updateCase = async (caseId: string, updates: Partial<Case>) => {
    if (!user) return;

    try {
      const updated = await mockServices.CaseService.updateCase(caseId, {
        ...updates,
        updated_at: new Date().toISOString()
      });
      
      if (updated) {
        // Reload cases to get updated data
        await loadCases();
        
        // Update selected if it's the same
        if (selectedCase?.id === caseId) {
          setSelectedCase(updated);
        }
        
        toast({
          title: "Dossier mis à jour",
          description: "Les modifications ont été sauvegardées"
        });
        
        // Refresh stats
        await refreshStats();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour",
        variant: "destructive"
      });
    }
  };

  // Assign cases
  const assignCases = async (caseIds: string[], assignTo: string) => {
    if (!user) return;

    try {
      // Update each case
      for (const caseId of caseIds) {
        await mockServices.CaseService.updateCase(caseId, {
          assigned_to: assignTo,
          updated_at: new Date().toISOString()
        });
      }
      
      // Reload cases to reflect changes
      await loadCases();
      
      toast({
        title: "Assignation réussie",
        description: `${caseIds.length} dossier(s) assigné(s) avec succès`
      });
      
      // Refresh stats
      await refreshStats();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'assignation",
        variant: "destructive"
      });
    }
  };

  // Refresh statistics
  const refreshStats = async () => {
    setIsLoadingStats(true);
    try {
      const allCases = await mockServices.CaseService.getCases();
      const myCases = user ? allCases.filter(c => c.assigned_to === user.name) : allCases;
      
      const stats: CaseStats = {
        total: myCases.length,
        open: myCases.filter(c => c.status === 'open').length,
        investigating: myCases.filter(c => c.status === 'investigating').length,
        pending_review: myCases.filter(c => c.status === 'pending_review').length,
        closed: myCases.filter(c => c.status === 'closed').length,
        financialImpact: {
          netRoi: myCases.reduce((sum, c) => sum + (c.roi_score || 0), 0)
        }
      };
      
      setStats(stats);
    } catch (error) {
      console.error('Error loading case stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Helper functions
  const getCasesByStatus = (status: string) => {
    return cases.filter(c => c.status === status);
  };

  const getMyCases = () => {
    if (!user) return [];
    return cases.filter(c => c.assigned_to === user.name);
  };

  // Initial load
  useEffect(() => {
    loadCases();
    refreshStats();
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      refreshStats();
    }, 60000); // Every minute
    
    return () => clearInterval(interval);
  }, [user?.id]);

  const value: CaseContextType = {
    cases,
    selectedCase,
    stats,
    isLoading,
    isLoadingStats,
    loadCases,
    selectCase,
    createCase,
    updateCase,
    assignCases,
    refreshStats,
    getCasesByStatus,
    getMyCases
  };

  return (
    <CaseContext.Provider value={value}>
      {children}
    </CaseContext.Provider>
  );
}

export function useCases() {
  const context = useContext(CaseContext);
  if (context === undefined) {
    throw new Error('useCases must be used within a CaseProvider');
  }
  return context;
}