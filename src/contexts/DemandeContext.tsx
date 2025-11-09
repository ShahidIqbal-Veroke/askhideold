import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { 
  Demande, 
  DemandeStats, 
  DemandeFilters, 
  CreateDemandeRequest, 
  UpdateDemandeRequest,
  DemandeType,
  DemandeCategory,
  DemandeStatus,
  DemandePriority,
  DemandeWorkflowRule
} from '@/types/demande.types';
import { demandeService } from '@/services/demandeService';

// State interface
interface DemandeState {
  demandes: Demande[];
  currentDemande: Demande | null;
  stats: DemandeStats | null;
  workflowRules: DemandeWorkflowRule[];
  loading: boolean;
  error: string | null;
  filters: DemandeFilters;
}

// Action types
type DemandeAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_DEMANDES'; payload: Demande[] }
  | { type: 'ADD_DEMANDE'; payload: Demande }
  | { type: 'UPDATE_DEMANDE'; payload: Demande }
  | { type: 'SET_CURRENT_DEMANDE'; payload: Demande | null }
  | { type: 'SET_STATS'; payload: DemandeStats }
  | { type: 'SET_WORKFLOW_RULES'; payload: DemandeWorkflowRule[] }
  | { type: 'SET_FILTERS'; payload: DemandeFilters }
  | { type: 'RESET_STATE' };

// Context interface
interface DemandeContextType {
  state: DemandeState;
  
  // Core CRUD operations
  loadDemandes: (filters?: DemandeFilters) => Promise<void>;
  createDemande: (request: CreateDemandeRequest) => Promise<Demande>;
  updateDemande: (request: UpdateDemandeRequest) => Promise<Demande | null>;
  getDemande: (id: string) => Promise<Demande | null>;
  
  // Workflow operations
  convertToHistorique: (demandeId: string) => Promise<string | null>;
  
  // Analytics
  loadStats: () => Promise<void>;
  
  // Utility functions
  setCurrentDemande: (demande: Demande | null) => void;
  setFilters: (filters: DemandeFilters) => void;
  clearError: () => void;
  refreshData: () => Promise<void>;
  
  // Search and filtering
  searchDemandes: (searchTerm: string) => Promise<Demande[]>;
  getDemandesByType: (type: DemandeType) => Demande[];
  getDemandesByStatus: (status: DemandeStatus) => Demande[];
  getDemandesByPriority: (priority: DemandePriority) => Demande[];
  getOverdueDemandes: () => Demande[];
  getPendingValidationDemandes: () => Demande[];
}

// Initial state
const initialState: DemandeState = {
  demandes: [],
  currentDemande: null,
  stats: null,
  workflowRules: [],
  loading: false,
  error: null,
  filters: {},
};

// Reducer
const demandeReducer = (state: DemandeState, action: DemandeAction): DemandeState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_DEMANDES':
      return { ...state, demandes: action.payload, loading: false, error: null };
    
    case 'ADD_DEMANDE':
      return { 
        ...state, 
        demandes: [action.payload, ...state.demandes],
        loading: false,
        error: null
      };
    
    case 'UPDATE_DEMANDE':
      return {
        ...state,
        demandes: state.demandes.map(demande =>
          demande.id === action.payload.id ? action.payload : demande
        ),
        currentDemande: state.currentDemande?.id === action.payload.id ? action.payload : state.currentDemande,
        loading: false,
        error: null
      };
    
    case 'SET_CURRENT_DEMANDE':
      return { ...state, currentDemande: action.payload };
    
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    
    case 'SET_WORKFLOW_RULES':
      return { ...state, workflowRules: action.payload };
    
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
};

// Create context
const DemandeContext = createContext<DemandeContextType | null>(null);

// Provider component
export const DemandeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(demandeReducer, initialState);

  // === CORE CRUD OPERATIONS ===

  const loadDemandes = useCallback(async (filters?: DemandeFilters) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const demandes = await demandeService.getDemandes(filters);
      dispatch({ type: 'SET_DEMANDES', payload: demandes });
      
      if (filters) {
        dispatch({ type: 'SET_FILTERS', payload: filters });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erreur lors du chargement des demandes' });
    }
  }, []);

  const createDemande = useCallback(async (request: CreateDemandeRequest): Promise<Demande> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newDemande = await demandeService.createDemande(request, 'current-user'); // TODO: Get real user
      dispatch({ type: 'ADD_DEMANDE', payload: newDemande });
      return newDemande;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création de la demande';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  }, []);

  const updateDemande = useCallback(async (request: UpdateDemandeRequest): Promise<Demande | null> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedDemande = await demandeService.updateDemande(request, 'current-user'); // TODO: Get real user
      
      if (updatedDemande) {
        dispatch({ type: 'UPDATE_DEMANDE', payload: updatedDemande });
      }
      
      return updatedDemande;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la mise à jour de la demande';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  }, []);

  const getDemande = useCallback(async (id: string): Promise<Demande | null> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const demande = await demandeService.getDemande(id);
      
      if (demande) {
        dispatch({ type: 'SET_CURRENT_DEMANDE', payload: demande });
      }
      
      dispatch({ type: 'SET_LOADING', payload: false });
      return demande;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erreur lors du chargement de la demande' });
      return null;
    }
  }, []);

  // === WORKFLOW OPERATIONS ===

  const convertToHistorique = useCallback(async (demandeId: string): Promise<string | null> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const historiqueId = await demandeService.convertToHistorique(demandeId);
      
      if (historiqueId) {
        // Reload the demande to reflect the archival status
        const updatedDemande = await demandeService.getDemande(demandeId);
        if (updatedDemande) {
          dispatch({ type: 'UPDATE_DEMANDE', payload: updatedDemande });
        }
      }
      
      dispatch({ type: 'SET_LOADING', payload: false });
      return historiqueId;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erreur lors de la conversion en historique' });
      return null;
    }
  }, []);

  // === ANALYTICS ===

  const loadStats = useCallback(async () => {
    try {
      const stats = await demandeService.getStats();
      dispatch({ type: 'SET_STATS', payload: stats });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erreur lors du chargement des statistiques' });
    }
  }, []);

  // === SEARCH AND FILTERING ===

  const searchDemandes = useCallback(async (searchTerm: string): Promise<Demande[]> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const filters: DemandeFilters = { searchTerm };
      const demandes = await demandeService.getDemandes(filters);
      dispatch({ type: 'SET_DEMANDES', payload: demandes });
      dispatch({ type: 'SET_FILTERS', payload: filters });
      return demandes;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erreur lors de la recherche' });
      return [];
    }
  }, []);

  const getDemandesByType = useCallback((type: DemandeType): Demande[] => {
    return state.demandes.filter(d => d.type === type);
  }, [state.demandes]);

  const getDemandesByStatus = useCallback((status: DemandeStatus): Demande[] => {
    return state.demandes.filter(d => d.status === status);
  }, [state.demandes]);

  const getDemandesByPriority = useCallback((priority: DemandePriority): Demande[] => {
    return state.demandes.filter(d => d.priority === priority);
  }, [state.demandes]);

  const getOverdueDemandes = useCallback((): Demande[] => {
    const now = new Date();
    return state.demandes.filter(d => 
      !d.sla.respectSLA || d.sla.dateEcheance < now
    );
  }, [state.demandes]);

  const getPendingValidationDemandes = useCallback((): Demande[] => {
    return state.demandes.filter(d => 
      d.status === 'pending_validation' || d.workflow.validationsRequises.length > 0
    );
  }, [state.demandes]);

  // === UTILITY FUNCTIONS ===

  const setCurrentDemande = useCallback((demande: Demande | null) => {
    dispatch({ type: 'SET_CURRENT_DEMANDE', payload: demande });
  }, []);

  const setFilters = useCallback((filters: DemandeFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const refreshData = useCallback(async () => {
    await Promise.all([
      loadDemandes(state.filters),
      loadStats()
    ]);
  }, [loadDemandes, loadStats, state.filters]);

  // === INITIAL DATA LOADING ===

  useEffect(() => {
    loadDemandes();
    loadStats();
  }, [loadDemandes, loadStats]);

  const contextValue: DemandeContextType = {
    state,
    loadDemandes,
    createDemande,
    updateDemande,
    getDemande,
    convertToHistorique,
    loadStats,
    setCurrentDemande,
    setFilters,
    clearError,
    refreshData,
    searchDemandes,
    getDemandesByType,
    getDemandesByStatus,
    getDemandesByPriority,
    getOverdueDemandes,
    getPendingValidationDemandes,
  };

  return (
    <DemandeContext.Provider value={contextValue}>
      {children}
    </DemandeContext.Provider>
  );
};

// Custom hook
export const useDemande = (): DemandeContextType => {
  const context = useContext(DemandeContext);
  if (!context) {
    throw new Error('useDemande must be used within a DemandeProvider');
  }
  return context;
};

// Custom hooks for specific use cases
export const useDemandeStats = () => {
  const { state, loadStats } = useDemande();
  return {
    stats: state.stats,
    loading: state.loading,
    error: state.error,
    refresh: loadStats,
  };
};

export const useDemandeWorkflow = () => {
  const { 
    state, 
    updateDemande, 
    convertToHistorique,
    getOverdueDemandes,
    getPendingValidationDemandes 
  } = useDemande();

  const processWorkflow = useCallback(async (
    demandeId: string,
    action: 'approve' | 'reject' | 'archive' | 'escalate',
    notes?: string
  ) => {
    try {
      switch (action) {
        case 'approve':
          return await updateDemande({
            demandeId,
            newStatus: 'completed',
            setDecision: {
              type: 'accepte',
              motif: notes || 'Demande approuvée',
              dateDecision: new Date(),
              decideur: 'current-user', // TODO: Get real user
            }
          });
        
        case 'reject':
          return await updateDemande({
            demandeId,
            newStatus: 'rejected',
            setDecision: {
              type: 'refuse',
              motif: notes || 'Demande rejetée',
              dateDecision: new Date(),
              decideur: 'current-user', // TODO: Get real user
            }
          });
        
        case 'archive':
          const historiqueId = await convertToHistorique(demandeId);
          return historiqueId ? 'archived' : null;
        
        case 'escalate':
          return await updateDemande({
            demandeId,
            newStatus: 'escalated',
            newPriority: 'urgent',
            addNote: notes || 'Demande escaladée'
          });
        
        default:
          throw new Error('Action non supportée');
      }
    } catch (error) {
      console.error('Erreur workflow:', error);
      throw error;
    }
  }, [updateDemande, convertToHistorique]);

  const overdueDemandes = React.useMemo(() => {
    return getOverdueDemandes();
  }, [getOverdueDemandes, state.demandes]);

  const pendingValidationDemandes = React.useMemo(() => {
    return getPendingValidationDemandes();
  }, [getPendingValidationDemandes, state.demandes]);

  return {
    processWorkflow,
    overdueDemandes,
    pendingValidationDemandes,
    loading: state.loading,
    error: state.error,
  };
};

export const useDemandeForAssure = (assureId: string) => {
  const { loadDemandes } = useDemande();
  const [demandes, setDemandes] = React.useState<Demande[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadAssureDemandes = useCallback(async () => {
    if (!assureId) return;
    
    try {
      setLoading(true);
      setError(null);
      await loadDemandes({ assureId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [assureId, loadDemandes]);

  useEffect(() => {
    loadAssureDemandes();
  }, [loadAssureDemandes]);

  return {
    demandes,
    loading,
    error,
    refresh: loadAssureDemandes,
  };
};

export const useDemandeSearch = () => {
  const { searchDemandes, state } = useDemande();
  const [searchResults, setSearchResults] = React.useState<Demande[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  const search = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const results = await searchDemandes(term);
      setSearchResults(results);
    } catch (error) {
      console.error('Erreur de recherche:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchDemandes]);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
  }, []);

  return {
    searchResults,
    isSearching,
    search,
    clearSearch,
    error: state.error,
  };
};

export const useDemandePriority = () => {
  const { state, getDemandesByPriority } = useDemande();

  const urgentDemandes = React.useMemo(() => {
    return getDemandesByPriority('urgent');
  }, [getDemandesByPriority, state.demandes]);

  const highPriorityDemandes = React.useMemo(() => {
    return getDemandesByPriority('high');
  }, [getDemandesByPriority, state.demandes]);

  const criticalDemandes = React.useMemo(() => {
    return getDemandesByPriority('critical');
  }, [getDemandesByPriority, state.demandes]);

  const totalHighPriority = React.useMemo(() => {
    return urgentDemandes.length + highPriorityDemandes.length + criticalDemandes.length;
  }, [urgentDemandes.length, highPriorityDemandes.length, criticalDemandes.length]);

  return {
    urgentDemandes,
    highPriorityDemandes,
    criticalDemandes,
    totalHighPriority,
    loading: state.loading,
    error: state.error,
  };
};

export const useDemandeFilters = () => {
  const { state, setFilters, loadDemandes } = useDemande();

  const applyFilters = useCallback(async (filters: DemandeFilters) => {
    setFilters(filters);
    await loadDemandes(filters);
  }, [setFilters, loadDemandes]);

  const clearFilters = useCallback(async () => {
    setFilters({});
    await loadDemandes();
  }, [setFilters, loadDemandes]);

  return {
    currentFilters: state.filters,
    applyFilters,
    clearFilters,
    loading: state.loading,
    error: state.error,
  };
};