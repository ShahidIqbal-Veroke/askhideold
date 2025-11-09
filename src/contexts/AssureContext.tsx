import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Assure, 
  AssureStats, 
  AssureFilters, 
  CreateAssureRequest, 
  UpdateAssureRequest,
  AssureSearchResult,
  AssureAlertLink 
} from '@/types/assure.types';
import { assureService } from '@/services/assureService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface AssureContextType {
  // Assurés data
  assures: Assure[];
  selectedAssure: Assure | null;
  stats: AssureStats | null;
  
  // Loading states
  isLoading: boolean;
  isLoadingStats: boolean;
  isSearching: boolean;
  
  // Actions
  loadAssures: (filters?: AssureFilters) => Promise<void>;
  selectAssure: (assureId: string | null) => void;
  createAssure: (request: CreateAssureRequest) => Promise<Assure | null>;
  updateAssure: (request: UpdateAssureRequest) => Promise<void>;
  searchAssures: (searchTerm: string) => Promise<AssureSearchResult[]>;
  refreshStats: () => Promise<void>;
  
  // Helpers
  getAssuresByRiskLevel: (riskLevel: string) => Assure[];
  getAssuré: (assureId: string) => Assure | undefined;
  getAssureAlertLinks: (assureId: string) => Promise<AssureAlertLink[]>;
  
  // Filters
  currentFilters: AssureFilters | null;
  applyFilters: (filters: AssureFilters) => Promise<void>;
  clearFilters: () => Promise<void>;
}

const AssureContext = createContext<AssureContextType | undefined>(undefined);

export function AssureProvider({ children }: { children: ReactNode }) {
  const [assures, setAssures] = useState<Assure[]>([]);
  const [selectedAssure, setSelectedAssure] = useState<Assure | null>(null);
  const [stats, setStats] = useState<AssureStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<AssureFilters | null>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Load assurés with optional filters
  const loadAssures = async (filters?: AssureFilters) => {
    setIsLoading(true);
    try {
      const data = await assureService.getAssures(filters);
      setAssures(data);
      setCurrentFilters(filters || null);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les assurés",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Select an assuré
  const selectAssure = (assureId: string | null) => {
    if (!assureId) {
      setSelectedAssure(null);
      return;
    }
    
    const assure = assures.find(a => a.id === assureId);
    setSelectedAssure(assure || null);
  };

  // Create new assuré
  const createAssure = async (request: CreateAssureRequest): Promise<Assure | null> => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Utilisateur non connecté",
        variant: "destructive"
      });
      return null;
    }

    try {
      const newAssure = await assureService.createAssure(request, user.id);
      
      // Add to local state
      setAssures(prev => [newAssure, ...prev]);
      
      toast({
        title: "Assuré créé",
        description: `Client ${newAssure.numeroClient} créé avec succès`
      });
      
      // Refresh stats
      await refreshStats();
      
      return newAssure;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la création de l'assuré",
        variant: "destructive"
      });
      return null;
    }
  };

  // Update assuré
  const updateAssure = async (request: UpdateAssureRequest) => {
    if (!user) return;

    try {
      const updated = await assureService.updateAssure(request, user.id);
      
      if (updated) {
        // Update local state
        setAssures(prev => prev.map(a => a.id === request.assureId ? updated : a));
        
        // Update selected if it's the same
        if (selectedAssure?.id === request.assureId) {
          setSelectedAssure(updated);
        }
        
        toast({
          title: "Assuré mis à jour",
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

  // Search assurés
  const searchAssures = async (searchTerm: string): Promise<AssureSearchResult[]> => {
    if (!searchTerm.trim()) return [];
    
    setIsSearching(true);
    try {
      const results = await assureService.searchAssures(searchTerm);
      return results;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la recherche",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  // Apply filters
  const applyFilters = async (filters: AssureFilters) => {
    await loadAssures(filters);
  };

  // Clear filters
  const clearFilters = async () => {
    await loadAssures();
  };

  // Refresh statistics
  const refreshStats = async () => {
    setIsLoadingStats(true);
    try {
      const newStats = await assureService.getStats();
      setStats(newStats);
    } catch (error) {
      console.error('Error loading assure stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Helper functions
  const getAssuresByRiskLevel = (riskLevel: string) => {
    return assures.filter(a => a.riskProfile.riskLevel === riskLevel);
  };

  const getAssuré = (assureId: string): Assure | undefined => {
    return assures.find(a => a.id === assureId);
  };

  const getAssureAlertLinks = async (assureId: string): Promise<AssureAlertLink[]> => {
    try {
      return await assureService.getAssureAlertLinks(assureId);
    } catch (error) {
      console.error('Error loading assure alert links:', error);
      return [];
    }
  };

  // Initial load
  useEffect(() => {
    loadAssures();
    refreshStats();
    
    // Simulate real-time updates for stats
    const interval = setInterval(() => {
      refreshStats();
    }, 120000); // Every 2 minutes
    
    return () => clearInterval(interval);
  }, [user?.id]);

  const value: AssureContextType = {
    assures,
    selectedAssure,
    stats,
    isLoading,
    isLoadingStats,
    isSearching,
    loadAssures,
    selectAssure,
    createAssure,
    updateAssure,
    searchAssures,
    refreshStats,
    getAssuresByRiskLevel,
    getAssuré,
    getAssureAlertLinks,
    currentFilters,
    applyFilters,
    clearFilters
  };

  return (
    <AssureContext.Provider value={value}>
      {children}
    </AssureContext.Provider>
  );
}

export function useAssures() {
  const context = useContext(AssureContext);
  if (context === undefined) {
    throw new Error('useAssures must be used within an AssureProvider');
  }
  return context;
}

// Hook utilitaire pour recherche en temps réel
export function useAssureSearch() {
  const { searchAssures, isSearching } = useAssures();
  const [results, setResults] = useState<AssureSearchResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const search = async (term: string) => {
    setSearchTerm(term);
    if (term.trim().length < 2) {
      setResults([]);
      return;
    }
    
    const searchResults = await searchAssures(term);
    setResults(searchResults);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setResults([]);
  };

  return {
    search,
    clearSearch,
    results,
    searchTerm,
    isSearching
  };
}