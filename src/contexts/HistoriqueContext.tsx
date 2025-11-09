import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { 
  Historique, 
  HistoriqueStats, 
  HistoriqueFilters, 
  CreateHistoriqueRequest, 
  UpdateHistoriqueRequest,
  HistoriqueTimeline,
  HistoriquePattern,
  HistoriqueEventType,
  HistoriqueCategory
} from '@/types/historique.types';
import { historiqueService } from '@/services/historiqueService';

// State interface
interface HistoriqueState {
  historiques: Historique[];
  currentHistorique: Historique | null;
  timeline: HistoriqueTimeline | null;
  stats: HistoriqueStats | null;
  patterns: HistoriquePattern[];
  loading: boolean;
  error: string | null;
  filters: HistoriqueFilters;
}

// Action types
type HistoriqueAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_HISTORIQUES'; payload: Historique[] }
  | { type: 'ADD_HISTORIQUE'; payload: Historique }
  | { type: 'UPDATE_HISTORIQUE'; payload: Historique }
  | { type: 'SET_CURRENT_HISTORIQUE'; payload: Historique | null }
  | { type: 'SET_TIMELINE'; payload: HistoriqueTimeline }
  | { type: 'SET_STATS'; payload: HistoriqueStats }
  | { type: 'SET_PATTERNS'; payload: HistoriquePattern[] }
  | { type: 'SET_FILTERS'; payload: HistoriqueFilters }
  | { type: 'RESET_STATE' };

// Context interface
interface HistoriqueContextType {
  state: HistoriqueState;
  
  // Core CRUD operations
  loadHistoriques: (filters?: HistoriqueFilters) => Promise<void>;
  createHistorique: (request: CreateHistoriqueRequest) => Promise<Historique>;
  updateHistorique: (request: UpdateHistoriqueRequest) => Promise<Historique | null>;
  getHistorique: (id: string) => Promise<Historique | null>;
  
  // Timeline and aggregations
  loadTimelineForAssure: (assureId: string) => Promise<HistoriqueTimeline | null>;
  loadStats: () => Promise<void>;
  detectPatterns: (assureId: string) => Promise<HistoriquePattern[]>;
  
  // EVENT-DRIVEN: Create history from event
  createFromEvent: (event: any) => Promise<Historique>;
  
  // Utility functions
  setCurrentHistorique: (historique: Historique | null) => void;
  setFilters: (filters: HistoriqueFilters) => void;
  clearError: () => void;
  refreshData: () => Promise<void>;
  
  // Search and filtering
  searchHistoriques: (searchTerm: string) => Promise<Historique[]>;
  getHistoriquesByCategory: (category: HistoriqueCategory) => Historique[];
  getHistoriquesByEventType: (eventType: HistoriqueEventType) => Historique[];
}

// Initial state
const initialState: HistoriqueState = {
  historiques: [],
  currentHistorique: null,
  timeline: null,
  stats: null,
  patterns: [],
  loading: false,
  error: null,
  filters: {},
};

// Reducer
const historiqueReducer = (state: HistoriqueState, action: HistoriqueAction): HistoriqueState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_HISTORIQUES':
      return { ...state, historiques: action.payload, loading: false, error: null };
    
    case 'ADD_HISTORIQUE':
      return { 
        ...state, 
        historiques: [action.payload, ...state.historiques],
        loading: false,
        error: null
      };
    
    case 'UPDATE_HISTORIQUE':
      return {
        ...state,
        historiques: state.historiques.map(historique =>
          historique.id === action.payload.id ? action.payload : historique
        ),
        currentHistorique: state.currentHistorique?.id === action.payload.id ? action.payload : state.currentHistorique,
        loading: false,
        error: null
      };
    
    case 'SET_CURRENT_HISTORIQUE':
      return { ...state, currentHistorique: action.payload };
    
    case 'SET_TIMELINE':
      return { ...state, timeline: action.payload };
    
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    
    case 'SET_PATTERNS':
      return { ...state, patterns: action.payload };
    
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
};

// Create context
const HistoriqueContext = createContext<HistoriqueContextType | null>(null);

// Provider component
export const HistoriqueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(historiqueReducer, initialState);

  // === CORE CRUD OPERATIONS ===

  const loadHistoriques = useCallback(async (filters?: HistoriqueFilters) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const historiques = await historiqueService.getHistoriques(filters);
      dispatch({ type: 'SET_HISTORIQUES', payload: historiques });
      
      if (filters) {
        dispatch({ type: 'SET_FILTERS', payload: filters });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erreur lors du chargement des historiques' });
    }
  }, []);

  const createHistorique = useCallback(async (request: CreateHistoriqueRequest): Promise<Historique> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newHistorique = await historiqueService.createHistorique(request, 'current-user'); // TODO: Get real user
      dispatch({ type: 'ADD_HISTORIQUE', payload: newHistorique });
      return newHistorique;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création de l\'historique';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  }, []);

  const updateHistorique = useCallback(async (request: UpdateHistoriqueRequest): Promise<Historique | null> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedHistorique = await historiqueService.updateHistorique(request, 'current-user'); // TODO: Get real user
      
      if (updatedHistorique) {
        dispatch({ type: 'UPDATE_HISTORIQUE', payload: updatedHistorique });
      }
      
      return updatedHistorique;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la mise à jour de l\'historique';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  }, []);

  const getHistorique = useCallback(async (id: string): Promise<Historique | null> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const historique = await historiqueService.getHistorique(id);
      
      if (historique) {
        dispatch({ type: 'SET_CURRENT_HISTORIQUE', payload: historique });
      }
      
      dispatch({ type: 'SET_LOADING', payload: false });
      return historique;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erreur lors du chargement de l\'historique' });
      return null;
    }
  }, []);

  // === TIMELINE AND AGGREGATIONS ===

  const loadTimelineForAssure = useCallback(async (assureId: string): Promise<HistoriqueTimeline | null> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const timeline = await historiqueService.getTimelineForAssure(assureId);
      dispatch({ type: 'SET_TIMELINE', payload: timeline });
      dispatch({ type: 'SET_LOADING', payload: false });
      return timeline;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erreur lors du chargement de la timeline' });
      return null;
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const stats = await historiqueService.getStats();
      dispatch({ type: 'SET_STATS', payload: stats });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erreur lors du chargement des statistiques' });
    }
  }, []);

  const detectPatterns = useCallback(async (assureId: string): Promise<HistoriquePattern[]> => {
    try {
      const patterns = await historiqueService.detectPatterns(assureId);
      dispatch({ type: 'SET_PATTERNS', payload: patterns });
      return patterns;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erreur lors de la détection de patterns' });
      return [];
    }
  }, []);

  // === SEARCH AND FILTERING ===

  const searchHistoriques = useCallback(async (searchTerm: string): Promise<Historique[]> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const filters: HistoriqueFilters = { searchTerm };
      const historiques = await historiqueService.getHistoriques(filters);
      dispatch({ type: 'SET_HISTORIQUES', payload: historiques });
      dispatch({ type: 'SET_FILTERS', payload: filters });
      return historiques;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erreur lors de la recherche' });
      return [];
    }
  }, []);

  const getHistoriquesByCategory = useCallback((category: HistoriqueCategory): Historique[] => {
    return state.historiques.filter(h => h.category === category);
  }, [state.historiques]);

  const getHistoriquesByEventType = useCallback((eventType: HistoriqueEventType): Historique[] => {
    return state.historiques.filter(h => h.eventType === eventType);
  }, [state.historiques]);

  // === UTILITY FUNCTIONS ===

  const setCurrentHistorique = useCallback((historique: Historique | null) => {
    dispatch({ type: 'SET_CURRENT_HISTORIQUE', payload: historique });
  }, []);

  const setFilters = useCallback((filters: HistoriqueFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const refreshData = useCallback(async () => {
    await Promise.all([
      loadHistoriques(state.filters),
      loadStats()
    ]);
  }, [loadHistoriques, loadStats, state.filters]);

  // === EVENT-DRIVEN: Create history from event ===
  const createFromEvent = useCallback(async (event: any): Promise<Historique> => {
    const historiqueRequest: CreateHistoriqueRequest = {
      assureId: event.assure_id || '', // Event may not have assureId yet
      eventId: event.id,
      eventType: mapEventTypeToHistoriqueType(event.type),
      category: event.category === 'fraude' ? 'fraude' : 
                event.category === 'sinistre' ? 'sinistre' :
                event.category === 'commercial' ? 'commercial' : 'operationnel',
      title: `${event.type} - ${event.numero_suivi}`,
      description: event.data.description || `Événement ${event.type} traité`,
      impact: calculateEventImpact(event),
      businessContext: {
        eventData: event.data,
        eventMetadata: event.metadata,
        source: event.source,
        channel: event.channel
      },
      triggeredBy: event.source,
      affectedUsers: event.assure_id ? [event.assure_id] : []
    };
    
    return await createHistorique(historiqueRequest);
  }, [createHistorique]);

  // Helper functions for event mapping
  const mapEventTypeToHistoriqueType = (eventType: string): HistoriqueEventType => {
    switch (eventType) {
      case 'document_upload': return 'document_added';
      case 'declaration_sinistre': return 'claim_declared';
      case 'modification_contrat': return 'contract_modified';
      case 'paiement': return 'payment_received';
      default: return 'status_changed';
    }
  };

  const calculateEventImpact = (event: any): 'low' | 'medium' | 'high' | 'critical' => {
    if (event.priority === 'critical') return 'critical';
    if (event.priority === 'high') return 'high';
    if (event.category === 'fraude') return 'high';
    if (event.category === 'sinistre') return 'medium';
    return 'low';
  };

  // === INITIAL DATA LOADING ===

  useEffect(() => {
    loadHistoriques();
    loadStats();
  }, [loadHistoriques, loadStats]);

  const contextValue: HistoriqueContextType = {
    state,
    loadHistoriques,
    createHistorique,
    updateHistorique,
    getHistorique,
    loadTimelineForAssure,
    loadStats,
    detectPatterns,
    createFromEvent,
    setCurrentHistorique,
    setFilters,
    clearError,
    refreshData,
    searchHistoriques,
    getHistoriquesByCategory,
    getHistoriquesByEventType,
  };

  return (
    <HistoriqueContext.Provider value={contextValue}>
      {children}
    </HistoriqueContext.Provider>
  );
};

// Custom hook
export const useHistorique = (): HistoriqueContextType => {
  const context = useContext(HistoriqueContext);
  if (!context) {
    throw new Error('useHistorique must be used within a HistoriqueProvider');
  }
  return context;
};

// Custom hooks for specific use cases
export const useHistoriqueStats = () => {
  const { state, loadStats } = useHistorique();
  return {
    stats: state.stats,
    loading: state.loading,
    error: state.error,
    refresh: loadStats,
  };
};

export const useHistoriqueTimeline = (assureId: string) => {
  const { state, loadTimelineForAssure } = useHistorique();
  const [timeline, setTimeline] = React.useState<HistoriqueTimeline | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadTimeline = useCallback(async () => {
    if (!assureId) return;
    
    try {
      setLoading(true);
      setError(null);
      const timelineData = await loadTimelineForAssure(assureId);
      setTimeline(timelineData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [assureId, loadTimelineForAssure]);

  useEffect(() => {
    loadTimeline();
  }, [loadTimeline]);

  return {
    timeline,
    loading,
    error,
    refresh: loadTimeline,
  };
};

export const useHistoriquePatterns = (assureId: string) => {
  const { detectPatterns } = useHistorique();
  const [patterns, setPatterns] = React.useState<HistoriquePattern[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadPatterns = useCallback(async () => {
    if (!assureId) return;
    
    try {
      setLoading(true);
      setError(null);
      const patternsData = await detectPatterns(assureId);
      setPatterns(patternsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [assureId, detectPatterns]);

  useEffect(() => {
    loadPatterns();
  }, [loadPatterns]);

  return {
    patterns,
    loading,
    error,
    refresh: loadPatterns,
  };
};

export const useHistoriqueSearch = () => {
  const { searchHistoriques, state } = useHistorique();
  const [searchResults, setSearchResults] = React.useState<Historique[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  const search = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const results = await searchHistoriques(term);
      setSearchResults(results);
    } catch (error) {
      console.error('Erreur de recherche:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchHistoriques]);

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

export const useHistoriqueFilters = () => {
  const { state, setFilters, loadHistoriques } = useHistorique();

  const applyFilters = useCallback(async (filters: HistoriqueFilters) => {
    setFilters(filters);
    await loadHistoriques(filters);
  }, [setFilters, loadHistoriques]);

  const clearFilters = useCallback(async () => {
    setFilters({});
    await loadHistoriques();
  }, [setFilters, loadHistoriques]);

  return {
    currentFilters: state.filters,
    applyFilters,
    clearFilters,
    loading: state.loading,
    error: state.error,
  };
};