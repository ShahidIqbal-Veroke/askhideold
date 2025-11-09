import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { 
  Risque, 
  RisqueStats, 
  RisqueFilters, 
  CreateRisqueRequest, 
  UpdateRisqueRequest,
  RisqueCorrelation,
  RisquePrediction,
  RisqueType,
  RisqueCategory,
  RisqueLevel,
  RisqueStatus
} from '@/types/risque.types';
import { risqueService } from '@/services/risqueService';

// State interface
interface RisqueState {
  risques: Risque[];
  currentRisque: Risque | null;
  stats: RisqueStats | null;
  correlations: RisqueCorrelation[];
  predictions: Record<string, RisquePrediction>;
  loading: boolean;
  error: string | null;
  filters: RisqueFilters;
}

// Action types
type RisqueAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_RISQUES'; payload: Risque[] }
  | { type: 'ADD_RISQUE'; payload: Risque }
  | { type: 'UPDATE_RISQUE'; payload: Risque }
  | { type: 'SET_CURRENT_RISQUE'; payload: Risque | null }
  | { type: 'SET_STATS'; payload: RisqueStats }
  | { type: 'SET_CORRELATIONS'; payload: RisqueCorrelation[] }
  | { type: 'SET_PREDICTION'; payload: { risqueId: string; prediction: RisquePrediction } }
  | { type: 'SET_FILTERS'; payload: RisqueFilters }
  | { type: 'RESET_STATE' };

// Context interface
interface RisqueContextType {
  state: RisqueState;
  
  // Core CRUD operations
  loadRisques: (filters?: RisqueFilters) => Promise<void>;
  createRisque: (request: CreateRisqueRequest) => Promise<Risque>;
  updateRisque: (request: UpdateRisqueRequest) => Promise<Risque | null>;
  getRisque: (id: string) => Promise<Risque | null>;
  
  // Risk detection and automation
  detectRiskFromAlert: (alertId: string, assureId: string) => Promise<string | null>;
  
  // Analytics and correlations
  loadStats: () => Promise<void>;
  detectCorrelations: (assureId: string) => Promise<RisqueCorrelation[]>;
  
  // Utility functions
  setCurrentRisque: (risque: Risque | null) => void;
  setFilters: (filters: RisqueFilters) => void;
  clearError: () => void;
  refreshData: () => Promise<void>;
  
  // Search and filtering
  searchRisques: (searchTerm: string) => Promise<Risque[]>;
  getRisquesByType: (type: RisqueType) => Risque[];
  getRisquesByLevel: (level: RisqueLevel) => Risque[];
  getRisquesByStatus: (status: RisqueStatus) => Risque[];
  getHighRiskItems: () => Risque[];
}

// Initial state
const initialState: RisqueState = {
  risques: [],
  currentRisque: null,
  stats: null,
  correlations: [],
  predictions: {},
  loading: false,
  error: null,
  filters: {},
};

// Reducer
const risqueReducer = (state: RisqueState, action: RisqueAction): RisqueState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_RISQUES':
      return { ...state, risques: action.payload, loading: false, error: null };
    
    case 'ADD_RISQUE':
      return { 
        ...state, 
        risques: [action.payload, ...state.risques],
        loading: false,
        error: null
      };
    
    case 'UPDATE_RISQUE':
      return {
        ...state,
        risques: state.risques.map(risque =>
          risque.id === action.payload.id ? action.payload : risque
        ),
        currentRisque: state.currentRisque?.id === action.payload.id ? action.payload : state.currentRisque,
        loading: false,
        error: null
      };
    
    case 'SET_CURRENT_RISQUE':
      return { ...state, currentRisque: action.payload };
    
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    
    case 'SET_CORRELATIONS':
      return { ...state, correlations: action.payload };
    
    case 'SET_PREDICTION':
      return {
        ...state,
        predictions: {
          ...state.predictions,
          [action.payload.risqueId]: action.payload.prediction
        }
      };
    
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
};

// Create context
const RisqueContext = createContext<RisqueContextType | null>(null);

// Provider component
export const RisqueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(risqueReducer, initialState);

  // === CORE CRUD OPERATIONS ===

  const loadRisques = useCallback(async (filters?: RisqueFilters) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const risques = await risqueService.getRisques(filters);
      dispatch({ type: 'SET_RISQUES', payload: risques });
      
      if (filters) {
        dispatch({ type: 'SET_FILTERS', payload: filters });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erreur lors du chargement des risques' });
    }
  }, []);

  const createRisque = useCallback(async (request: CreateRisqueRequest): Promise<Risque> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newRisque = await risqueService.createRisque(request, 'current-user'); // TODO: Get real user
      dispatch({ type: 'ADD_RISQUE', payload: newRisque });
      return newRisque;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création du risque';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  }, []);

  const updateRisque = useCallback(async (request: UpdateRisqueRequest): Promise<Risque | null> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedRisque = await risqueService.updateRisque(request, 'current-user'); // TODO: Get real user
      
      if (updatedRisque) {
        dispatch({ type: 'UPDATE_RISQUE', payload: updatedRisque });
      }
      
      return updatedRisque;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la mise à jour du risque';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  }, []);

  const getRisque = useCallback(async (id: string): Promise<Risque | null> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const risque = await risqueService.getRisque(id);
      
      if (risque) {
        dispatch({ type: 'SET_CURRENT_RISQUE', payload: risque });
      }
      
      dispatch({ type: 'SET_LOADING', payload: false });
      return risque;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erreur lors du chargement du risque' });
      return null;
    }
  }, []);

  // === RISK DETECTION AND AUTOMATION ===

  const detectRiskFromAlert = useCallback(async (alertId: string, assureId: string): Promise<string | null> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const riskId = await risqueService.detectRiskFromAlert(alertId, assureId);
      
      if (riskId) {
        // Reload risks to include the new one
        await loadRisques(state.filters);
      }
      
      return riskId;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erreur lors de la détection de risque' });
      return null;
    }
  }, [loadRisques, state.filters]);

  // === ANALYTICS AND CORRELATIONS ===

  const loadStats = useCallback(async () => {
    try {
      const stats = await risqueService.getStats();
      dispatch({ type: 'SET_STATS', payload: stats });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erreur lors du chargement des statistiques' });
    }
  }, []);

  const detectCorrelations = useCallback(async (assureId: string): Promise<RisqueCorrelation[]> => {
    try {
      const correlations = await risqueService.detectCorrelations(assureId);
      dispatch({ type: 'SET_CORRELATIONS', payload: correlations });
      return correlations;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erreur lors de la détection de corrélations' });
      return [];
    }
  }, []);

  // === SEARCH AND FILTERING ===

  const searchRisques = useCallback(async (searchTerm: string): Promise<Risque[]> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const filters: RisqueFilters = { searchTerm };
      const risques = await risqueService.getRisques(filters);
      dispatch({ type: 'SET_RISQUES', payload: risques });
      dispatch({ type: 'SET_FILTERS', payload: filters });
      return risques;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erreur lors de la recherche' });
      return [];
    }
  }, []);

  const getRisquesByType = useCallback((type: RisqueType): Risque[] => {
    return state.risques.filter(r => r.type === type);
  }, [state.risques]);

  const getRisquesByLevel = useCallback((level: RisqueLevel): Risque[] => {
    return state.risques.filter(r => r.level === level);
  }, [state.risques]);

  const getRisquesByStatus = useCallback((status: RisqueStatus): Risque[] => {
    return state.risques.filter(r => r.status === status);
  }, [state.risques]);

  const getHighRiskItems = useCallback((): Risque[] => {
    return state.risques.filter(r => 
      r.level === 'critical' || r.level === 'very_high' || r.scoring.finalScore >= 80
    );
  }, [state.risques]);

  // === UTILITY FUNCTIONS ===

  const setCurrentRisque = useCallback((risque: Risque | null) => {
    dispatch({ type: 'SET_CURRENT_RISQUE', payload: risque });
  }, []);

  const setFilters = useCallback((filters: RisqueFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const refreshData = useCallback(async () => {
    await Promise.all([
      loadRisques(state.filters),
      loadStats()
    ]);
  }, [loadRisques, loadStats, state.filters]);

  // === INITIAL DATA LOADING ===

  useEffect(() => {
    loadRisques();
    loadStats();
  }, [loadRisques, loadStats]);

  const contextValue: RisqueContextType = {
    state,
    loadRisques,
    createRisque,
    updateRisque,
    getRisque,
    detectRiskFromAlert,
    loadStats,
    detectCorrelations,
    setCurrentRisque,
    setFilters,
    clearError,
    refreshData,
    searchRisques,
    getRisquesByType,
    getRisquesByLevel,
    getRisquesByStatus,
    getHighRiskItems,
  };

  return (
    <RisqueContext.Provider value={contextValue}>
      {children}
    </RisqueContext.Provider>
  );
};

// Custom hook
export const useRisque = (): RisqueContextType => {
  const context = useContext(RisqueContext);
  if (!context) {
    throw new Error('useRisque must be used within a RisqueProvider');
  }
  return context;
};

// Custom hooks for specific use cases
export const useRisqueStats = () => {
  const { state, loadStats } = useRisque();
  return {
    stats: state.stats,
    loading: state.loading,
    error: state.error,
    refresh: loadStats,
  };
};

export const useRisqueCorrelations = (assureId: string) => {
  const { detectCorrelations, state } = useRisque();
  const [correlations, setCorrelations] = React.useState<RisqueCorrelation[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadCorrelations = useCallback(async () => {
    if (!assureId) return;
    
    try {
      setLoading(true);
      setError(null);
      const correlationsData = await detectCorrelations(assureId);
      setCorrelations(correlationsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [assureId, detectCorrelations]);

  useEffect(() => {
    loadCorrelations();
  }, [loadCorrelations]);

  return {
    correlations,
    loading,
    error,
    refresh: loadCorrelations,
  };
};

export const useRisqueForAssure = (assureId: string) => {
  const { loadRisques } = useRisque();
  const [risques, setRisques] = React.useState<Risque[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadAssureRisques = useCallback(async () => {
    if (!assureId) return;
    
    try {
      setLoading(true);
      setError(null);
      await loadRisques({ assureId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [assureId, loadRisques]);

  useEffect(() => {
    loadAssureRisques();
  }, [loadAssureRisques]);

  return {
    risques,
    loading,
    error,
    refresh: loadAssureRisques,
  };
};

export const useRisqueSearch = () => {
  const { searchRisques, state } = useRisque();
  const [searchResults, setSearchResults] = React.useState<Risque[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  const search = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const results = await searchRisques(term);
      setSearchResults(results);
    } catch (error) {
      console.error('Erreur de recherche:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchRisques]);

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

export const useHighRiskMonitoring = () => {
  const { state, getHighRiskItems, refreshData } = useRisque();
  
  const highRiskItems = React.useMemo(() => {
    return getHighRiskItems();
  }, [getHighRiskItems, state.risques]);

  const criticalCount = React.useMemo(() => {
    return state.risques.filter(r => r.level === 'critical').length;
  }, [state.risques]);

  const veryHighCount = React.useMemo(() => {
    return state.risques.filter(r => r.level === 'very_high').length;
  }, [state.risques]);

  const pendingActionCount = React.useMemo(() => {
    return state.risques.filter(r => 
      r.status === 'detected' && (r.level === 'critical' || r.level === 'very_high')
    ).length;
  }, [state.risques]);

  return {
    highRiskItems,
    criticalCount,
    veryHighCount,
    pendingActionCount,
    totalHighRisk: highRiskItems.length,
    loading: state.loading,
    error: state.error,
    refresh: refreshData,
  };
};

export const useRisqueFilters = () => {
  const { state, setFilters, loadRisques } = useRisque();

  const applyFilters = useCallback(async (filters: RisqueFilters) => {
    setFilters(filters);
    await loadRisques(filters);
  }, [setFilters, loadRisques]);

  const clearFilters = useCallback(async () => {
    setFilters({});
    await loadRisques();
  }, [setFilters, loadRisques]);

  return {
    currentFilters: state.filters,
    applyFilters,
    clearFilters,
    loading: state.loading,
    error: state.error,
  };
};