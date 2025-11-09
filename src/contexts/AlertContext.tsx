import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Alert, AlertFilters, AlertStats } from '@/types/alert.types';
import { mockServices } from '@/lib/mockServices';
import { useToast } from '@/hooks/use-toast';

interface AlertContextType {
  // Alerts data
  alerts: Alert[];
  selectedAlert: Alert | null;
  stats: AlertStats | null;
  
  // Loading states
  isLoading: boolean;
  isLoadingStats: boolean;
  
  // Actions
  loadAlerts: (filters?: AlertFilters) => Promise<void>;
  selectAlert: (alertId: string | null) => void;
  assignAlerts: (alertIds: string[], assignTo: string) => Promise<void>;
  qualifyAlert: (alertId: string, qualification: any, notes?: string) => Promise<void>;
  refreshStats: () => Promise<void>;
  
  // EVENT-DRIVEN: Create alert from event
  createAlertFromEvent: (alertData: Partial<Alert>) => Promise<Alert>;
  
  // Real-time updates
  unreadCount: number;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const { toast } = useToast();

  // Load alerts with optional filters - MEMOIZED to prevent infinite loops
  const loadAlerts = useCallback(async (filters?: AlertFilters) => {
    setIsLoading(true);
    try {
      console.log('📥 Loading alerts with filters:', filters);
      const data = await mockServices.AlertService.getAlerts(filters);
      console.log('📊 Loaded alerts:', data.length, 'alerts');
      console.log('📋 First alert:', data[0]);
      setAlerts(data);
      
      // Update unread count (new/pending alerts)
      const pending = data.filter(a => a.status === 'new' || a.status === 'pending').length;
      setUnreadCount(pending);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les alertes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Select an alert - MEMOIZED
  const selectAlert = useCallback((alertId: string | null) => {
    if (!alertId) {
      setSelectedAlert(null);
      return;
    }
    
    const alert = alerts.find(a => a.id === alertId);
    setSelectedAlert(alert || null);
  }, [alerts]);

  // Refresh statistics - MEMOIZED to prevent infinite loops
  const refreshStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const analytics = await mockServices.AnalyticsService.getAlertMetrics();
      const newStats = {
        pending: analytics.alerts_by_status.new,
        assigned: analytics.alerts_by_status.assigned,
        inReview: analytics.alerts_by_status.investigating,
        qualified: analytics.alerts_by_status.qualified,
        rejected: analytics.alerts_by_status.closed,
        
        bySeverity: analytics.alerts_by_severity,
        
        avgProcessingTime: 45, // Mock value
        todayCount: analytics.total_alerts, // Simplified for now
        weekCount: analytics.total_alerts,
      };
      setStats(newStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  // Assign alerts to a user - MEMOIZED to prevent infinite loops
  const assignAlerts = useCallback(async (alertIds: string[], assignTo: string) => {
    try {
      // Assign each alert using mockService
      for (const alertId of alertIds) {
        await mockServices.AlertService.assignAlert(alertId, assignTo, 'automotive_fraud_team'); // Default team for now
      }
      
      // Reload alerts to get updated data
      await loadAlerts();
      
      toast({
        title: "Succès",
        description: `${alertIds.length} alerte(s) assignée(s) avec succès`
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
  }, [toast, refreshStats, loadAlerts]);

  // Qualify an alert - MEMOIZED to prevent infinite loops
  const qualifyAlert = useCallback(async (alertId: string, qualification: any, notes?: string) => {
    try {
      const updated = await mockServices.AlertService.qualifyAlert(alertId, qualification);
      
      if (updated) {
        // Reload alerts to get updated data
        await loadAlerts();
        
        toast({
          title: "Alerte qualifiée",
          description: qualification === 'fraud_confirmed' 
            ? "Un dossier a été créé pour cette fraude" 
            : "L'alerte a été qualifiée avec succès"
        });
        
        // Refresh stats
        await refreshStats();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la qualification",
        variant: "destructive"
      });
    }
  }, [toast, refreshStats, loadAlerts]);

  // EVENT-DRIVEN: Create alert from event processing - MEMOIZED
  const createAlertFromEvent = useCallback(async (alertData: Partial<Alert>): Promise<Alert> => {
    const newAlert = await mockServices.AlertService.createAlert({
      event_id: alertData.event_id!,
      historique_id: alertData.historique_id!,
      reference: `ALT-${Date.now()}`,
      source: alertData.source || 'document_analysis',
      fraud_city_source: alertData.fraud_city_source || 'documentaire',
      business_district: alertData.business_district || 'auto',
      severity: alertData.severity || 'medium',
      score: alertData.score || 50,
      confidence: alertData.confidence || 0.7,
      metadata: alertData.metadata || {},
      status: 'new',
      impacts_risk: false, // Only true when qualified as fraud_confirmed
      sla_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...alertData
    });
    
    // Reload alerts to include the new one
    await loadAlerts();
    setUnreadCount(prev => prev + 1);
    
    toast({
      title: "Nouvelle alerte",
      description: `Alerte ${newAlert.id} créée depuis l'événement ${newAlert.event_id}`
    });
    
    return newAlert;
  }, [toast, loadAlerts]);

  // Initial load - Run only once on mount
  useEffect(() => {
    loadAlerts();
    refreshStats();
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      refreshStats();
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, []); // Empty dependency array - run only once on mount

  const value: AlertContextType = {
    alerts,
    selectedAlert,
    stats,
    isLoading,
    isLoadingStats,
    loadAlerts,
    selectAlert,
    assignAlerts,
    qualifyAlert,
    refreshStats,
    createAlertFromEvent,
    unreadCount
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlerts() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
}