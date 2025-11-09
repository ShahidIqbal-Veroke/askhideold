import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { 
  CycleVie, 
  CycleVieStats, 
  CycleVieFilters, 
  CreateCycleVieRequest, 
  UpdateCycleVieRequest,
  CycleVieStage,
  CycleVieStatus,
  CycleVieAlert,
  CycleViePrediction
} from '@/types/cyclevie.types';
import { cycleVieService } from '@/services/cycleVieService';

// State interface
interface CycleVieState {
  cyclesVie: CycleVie[];
  currentCycle: CycleVie | null;
  stats: CycleVieStats | null;
  alerts: CycleVieAlert[];
  predictions: Record<string, CycleViePrediction>;
  loading: boolean;
  error: string | null;
  filters: CycleVieFilters;
}

// Action types
type CycleVieAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CYCLES_VIE'; payload: CycleVie[] }
  | { type: 'ADD_CYCLE_VIE'; payload: CycleVie }
  | { type: 'UPDATE_CYCLE_VIE'; payload: CycleVie }
  | { type: 'SET_CURRENT_CYCLE'; payload: CycleVie | null }
  | { type: 'SET_STATS'; payload: CycleVieStats }
  | { type: 'SET_ALERTS'; payload: CycleVieAlert[] }
  | { type: 'ADD_ALERT'; payload: CycleVieAlert }
  | { type: 'SET_PREDICTION'; payload: { cycleId: string; prediction: CycleViePrediction } }
  | { type: 'SET_FILTERS'; payload: CycleVieFilters }
  | { type: 'RESET_STATE' };

// Context interface
interface CycleVieContextType {
  state: CycleVieState;
  
  // Core CRUD operations
  loadCyclesVie: (filters?: CycleVieFilters) => Promise<void>;
  createCycleVie: (request: CreateCycleVieRequest) => Promise<CycleVie>;
  updateCycleVie: (request: UpdateCycleVieRequest) => Promise<CycleVie | null>;
  getCycleVie: (id: string) => Promise<CycleVie | null>;
  getCyclesVieForAssure: (assureId: string) => Promise<CycleVie[]>;
  
  // Stage management
  transitionStage: (cycleId: string, newStage: CycleVieStage, userId: string) => Promise<boolean>;
  validateTransition: (transitionId: string, userId: string) => Promise<boolean>;
  
  // Analytics and monitoring
  loadStats: () => Promise<void>;
  generatePredictions: (cycleId: string) => Promise<CycleViePrediction | null>;
  detectAnomalies: () => Promise<CycleVieAlert[]>;
  
  // Utility functions
  setCurrentCycle: (cycle: CycleVie | null) => void;
  setFilters: (filters: CycleVieFilters) => void;
  clearError: () => void;
  refreshData: () => Promise<void>;
}

// Initial state
const initialState: CycleVieState = {
  cyclesVie: [],
  currentCycle: null,
  stats: null,
  alerts: [],
  predictions: {},
  loading: false,
  error: null,
  filters: {},
};

// Reducer
const cycleVieReducer = (state: CycleVieState, action: CycleVieAction): CycleVieState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_CYCLES_VIE':
      return { ...state, cyclesVie: action.payload, loading: false, error: null };
    
    case 'ADD_CYCLE_VIE':
      return { 
        ...state, 
        cyclesVie: [action.payload, ...state.cyclesVie],
        loading: false,
        error: null
      };
    
    case 'UPDATE_CYCLE_VIE':
      return {
        ...state,
        cyclesVie: state.cyclesVie.map(cycle =>
          cycle.id === action.payload.id ? action.payload : cycle
        ),
        currentCycle: state.currentCycle?.id === action.payload.id ? action.payload : state.currentCycle,
        loading: false,
        error: null
      };
    
    case 'SET_CURRENT_CYCLE':
      return { ...state, currentCycle: action.payload };
    
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    
    case 'SET_ALERTS':
      return { ...state, alerts: action.payload };
    
    case 'ADD_ALERT':
      return { 
        ...state, 
        alerts: [action.payload, ...state.alerts]
      };
    
    case 'SET_PREDICTION':
      return {
        ...state,
        predictions: {
          ...state.predictions,
          [action.payload.cycleId]: action.payload.prediction
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
const CycleVieContext = createContext<CycleVieContextType | null>(null);

// Provider component
export const CycleVieProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cycleVieReducer, initialState);

  // === CORE CRUD OPERATIONS ===

  const loadCyclesVie = useCallback(async (filters?: CycleVieFilters) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const cyclesVie = await cycleVieService.getCyclesVie(filters);
      dispatch({ type: 'SET_CYCLES_VIE', payload: cyclesVie });
      
      if (filters) {
        dispatch({ type: 'SET_FILTERS', payload: filters });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erreur lors du chargement des cycles de vie' });
    }
  }, []);

  const createCycleVie = useCallback(async (request: CreateCycleVieRequest): Promise<CycleVie> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newCycle = await cycleVieService.createCycleVie(request, 'current-user'); // TODO: Get real user
      dispatch({ type: 'ADD_CYCLE_VIE', payload: newCycle });
      return newCycle;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création du cycle de vie';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  }, []);

  const updateCycleVie = useCallback(async (request: UpdateCycleVieRequest): Promise<CycleVie | null> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedCycle = await cycleVieService.updateCycleVie(request, 'current-user'); // TODO: Get real user
      
      if (updatedCycle) {
        dispatch({ type: 'UPDATE_CYCLE_VIE', payload: updatedCycle });
      }
      
      return updatedCycle;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la mise à jour du cycle de vie';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  }, []);

  const getCycleVie = useCallback(async (id: string): Promise<CycleVie | null> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const cycle = await cycleVieService.getCycleVie(id);
      
      if (cycle) {
        dispatch({ type: 'SET_CURRENT_CYCLE', payload: cycle });
      }
      
      dispatch({ type: 'SET_LOADING', payload: false });
      return cycle;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erreur lors du chargement du cycle de vie' });
      return null;
    }
  }, []);

  const getCyclesVieForAssure = useCallback(async (assureId: string): Promise<CycleVie[]> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const cycles = await cycleVieService.getCycleVieForAssure(assureId);
      dispatch({ type: 'SET_LOADING', payload: false });
      return cycles;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erreur lors du chargement des cycles de vie' });
      return [];
    }
  }, []);

  // === STAGE MANAGEMENT ===

  const transitionStage = useCallback(async (cycleId: string, newStage: CycleVieStage, userId: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const updateRequest: UpdateCycleVieRequest = {
        cycleVieId: cycleId,
        newStage: newStage,
      };
      
      const updatedCycle = await cycleVieService.updateCycleVie(updateRequest, userId);
      
      if (updatedCycle) {
        dispatch({ type: 'UPDATE_CYCLE_VIE', payload: updatedCycle });
        return true;
      }
      
      return false;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erreur lors de la transition d\'étape' });
      return false;
    }
  }, []);

  const validateTransition = useCallback(async (transitionId: string, userId: string): Promise<boolean> => {
    try {
      const success = await cycleVieService.validateTransition(transitionId, userId);
      return success;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erreur lors de la validation de transition' });
      return false;
    }
  }, []);

  // === ANALYTICS AND MONITORING ===

  const loadStats = useCallback(async () => {
    try {
      const stats = await cycleVieService.getStats();
      dispatch({ type: 'SET_STATS', payload: stats });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erreur lors du chargement des statistiques' });
    }
  }, []);

  const generatePredictions = useCallback(async (cycleId: string): Promise<CycleViePrediction | null> => {
    try {
      const prediction = await cycleVieService.generatePredictions(cycleId);
      
      if (prediction) {
        dispatch({ 
          type: 'SET_PREDICTION', 
          payload: { cycleId, prediction }
        });
      }
      
      return prediction;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erreur lors de la génération des prédictions' });
      return null;
    }
  }, []);

  const detectAnomalies = useCallback(async (): Promise<CycleVieAlert[]> => {
    try {
      const alerts = await cycleVieService.detectAnomalies();
      dispatch({ type: 'SET_ALERTS', payload: alerts });
      return alerts;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erreur lors de la détection d\'anomalies' });
      return [];
    }
  }, []);

  // === UTILITY FUNCTIONS ===

  const setCurrentCycle = useCallback((cycle: CycleVie | null) => {
    dispatch({ type: 'SET_CURRENT_CYCLE', payload: cycle });
  }, []);

  const setFilters = useCallback((filters: CycleVieFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const refreshData = useCallback(async () => {
    await Promise.all([
      loadCyclesVie(state.filters),
      loadStats(),
      detectAnomalies()
    ]);
  }, [loadCyclesVie, loadStats, detectAnomalies, state.filters]);

  // === INITIAL DATA LOADING ===

  useEffect(() => {
    loadCyclesVie();
    loadStats();
  }, [loadCyclesVie, loadStats]);

  // Auto-refresh anomaly detection every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      detectAnomalies();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [detectAnomalies]);

  const contextValue: CycleVieContextType = {
    state,
    loadCyclesVie,
    createCycleVie,
    updateCycleVie,
    getCycleVie,
    getCyclesVieForAssure,
    transitionStage,
    validateTransition,
    loadStats,
    generatePredictions,
    detectAnomalies,
    setCurrentCycle,
    setFilters,
    clearError,
    refreshData,
  };

  return (
    <CycleVieContext.Provider value={contextValue}>
      {children}
    </CycleVieContext.Provider>
  );
};

// Custom hook
export const useCycleVie = (): CycleVieContextType => {
  const context = useContext(CycleVieContext);
  if (!context) {
    throw new Error('useCycleVie must be used within a CycleVieProvider');
  }
  return context;
};

// Custom hooks for specific use cases
export const useCycleVieStats = () => {
  const { state, loadStats } = useCycleVie();
  return {
    stats: state.stats,
    loading: state.loading,
    error: state.error,
    refresh: loadStats,
  };
};

export const useCycleVieAlerts = () => {
  const { state, detectAnomalies } = useCycleVie();
  return {
    alerts: state.alerts,
    loading: state.loading,
    error: state.error,
    refresh: detectAnomalies,
  };
};

export const useCycleViePredictions = (cycleId: string) => {
  const { state, generatePredictions } = useCycleVie();
  
  const prediction = state.predictions[cycleId];
  
  const loadPrediction = useCallback(async () => {
    return await generatePredictions(cycleId);
  }, [generatePredictions, cycleId]);

  return {
    prediction,
    loading: state.loading,
    error: state.error,
    loadPrediction,
  };
};

export const useCycleVieForAssure = (assureId: string) => {
  const { getCyclesVieForAssure } = useCycleVie();
  const [cycles, setCycles] = React.useState<CycleVie[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadCycles = useCallback(async () => {
    if (!assureId) return;
    
    try {
      setLoading(true);
      setError(null);
      const cyclesData = await getCyclesVieForAssure(assureId);
      setCycles(cyclesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [assureId, getCyclesVieForAssure]);

  useEffect(() => {
    loadCycles();
  }, [loadCycles]);

  return {
    cycles,
    loading,
    error,
    refresh: loadCycles,
  };
};