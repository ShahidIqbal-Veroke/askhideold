import { useCallback } from 'react';
import { useEvents } from '@/contexts/EventContext';
import { useHistorique } from '@/contexts/HistoriqueContext';
import { useRisque } from '@/contexts/RisqueContext';
// import { useAlerts } from '@/contexts/AlertContext'; // Removed to fix circular dependency
import { useCases } from '@/contexts/CaseContext';
import { EventProcessingResult } from '@/types/event.types';

/**
 * Hook principal pour l'architecture Event-driven
 * Remplace useAssureCentric avec une approche centrée sur les événements
 * 
 * Core principle: 
 * - Events are the source of truth
 * - Alerts are linked to events, not persons
 * - Risks are linked to persons
 * - Only confirmed alerts impact risk profiles
 */
export const useEventDriven = () => {
  const events = useEvents();
  const historique = useHistorique();
  const risque = useRisque();
  // const alerts = useAlerts(); // Removed to fix circular dependency
  const cases = useCases();

  // === WORKFLOW EVENT-DRIVEN COMPLET ===
  /**
   * Process complete event-driven workflow:
   * Event → Historique → Alerte (if needed) → Qualification → Risk Impact (if confirmed)
   */
  const processEventWorkflow = useCallback(async (
    eventData: any,
    options?: {
      analyzeForFraud?: boolean;
      createAlert?: boolean;
      autoProcess?: boolean;
    }
  ): Promise<EventProcessingResult> => {
    try {
      // Step 1: Create and process event
      const result = await events.uploadDocumentEvent(eventData);
      
      if (!options?.autoProcess) {
        return result;
      }

      // Step 2: If alerts were generated, handle them
      if (result.alerts_generated.length > 0) {
        // Import mockServices to avoid circular dependency
        const { mockServices } = await import('../lib/mockServices');
        
        for (const alertId of result.alerts_generated) {
          const alert = await mockServices.AlertService.getAlertById(alertId);
          if (!alert) continue;

          // If high severity, might need immediate action
          if (alert.severity === 'critical' || alert.severity === 'high') {
            console.log(`Critical/High alert ${alertId} needs immediate attention`);
            // Could auto-assign to senior analyst here
          }
        }
      }

      return result;
    } catch (error) {
      console.error('Error in event workflow:', error);
      throw error;
    }
  }, [events]);

  // === FEEDBACK LOOP: Alert → Risk (only if confirmed) ===
  /**
   * Handle alert qualification and conditional risk impact
   * Only fraud_confirmed alerts update risk profiles
   */
  const handleAlertQualification = useCallback(async (
    alertId: string,
    qualification: 'fraud_confirmed' | 'false_positive' | 'requires_investigation',
    notes?: string
  ) => {
    // Import mockServices to avoid circular dependency
    const { mockServices } = await import('../lib/mockServices');
    
    // Get the alert
    const alert = await mockServices.AlertService.getAlertById(alertId);
    if (!alert) throw new Error('Alert not found');

    // Qualify the alert
    await mockServices.AlertService.qualifyAlert(alertId, qualification);

    // CONDITIONAL FEEDBACK LOOP: Only if fraud confirmed
    if (qualification === 'fraud_confirmed' && alert.metadata?.assureId) {
      // Get event to understand context
      const event = events.events.find(e => e.id === alert.event_id);
      if (!event) {
        console.warn('Event not found for alert, skipping risk update');
        return;
      }

      // Update risk profile for the person (derived from event)
      const personId = alert.metadata.assureId;
      await risque.updateRisque({
        risqueId: `RISK-${personId}`, // Assuming risk ID pattern
        newLevel: calculateNewRiskLevel(alert),
        addAlertConfirmee: alertId,
        notes: `Fraude confirmée via alerte ${alertId} de l'événement ${event.numero_suivi}`
      });

      console.log(`Risk profile updated for person ${personId} due to confirmed fraud`);
    }
  }, [events, risque]);

  // === SEARCH BY PERSON (through events) ===
  /**
   * Find all events, alerts, and risks for a specific person
   * Demonstrates event-driven data flow
   */
  const getPersonCompleteData = useCallback(async (personId: string) => {
    // Import mockServices to avoid circular dependency
    const { mockServices } = await import('../lib/mockServices');
    
    // 1. Get all events for this person
    const personEvents = events.events.filter(e => e.assure_id === personId);
    
    // 2. Get all alerts from localStorage
    const allAlerts = await mockServices.AlertService.getAlerts();
    const eventIds = personEvents.map(e => e.id);
    const personAlerts = allAlerts.filter(a => eventIds.includes(a.event_id));
    
    // 3. Get risk profile
    const riskProfile = await risque.getRisqueForAssure(personId);
    
    // 4. Get history entries
    const timeline = await historique.loadTimelineForAssure(personId);
    
    return {
      personId,
      events: personEvents,
      alerts: personAlerts,
      confirmedFrauds: personAlerts.filter(a => a.metadata?.qualification === 'fraud_confirmed'),
      riskProfile,
      timeline,
      summary: {
        totalEvents: personEvents.length,
        totalAlerts: personAlerts.length,
        confirmedFrauds: personAlerts.filter(a => a.metadata?.qualification === 'fraud_confirmed').length,
        currentRiskLevel: riskProfile?.level || 'unknown'
      }
    };
  }, [events, risque, historique]);

  // === CREATE CASE FROM ALERT (event-driven) ===
  const createCaseFromAlert = useCallback(async (alertId: string) => {
    // Import mockServices to avoid circular dependency
    const { mockServices } = await import('../lib/mockServices');
    
    const alert = await mockServices.AlertService.getAlertById(alertId);
    if (!alert) throw new Error('Alert not found');

    const event = events.events.find(e => e.id === alert.event_id);
    if (!event) throw new Error('Source event not found');

    const newCase = await cases.createCase({
      alertIds: [alertId],
      primaryAlertId: alertId,
      priority: alert.severity === 'critical' || alert.severity === 'high' ? 'urgent' : 'normal',
      estimatedLoss: event.data.amount || 0,
      notes: `Dossier créé depuis l'alerte ${alertId} (événement ${event.numero_suivi})`
    });

    return newCase;
  }, [events, cases]);

  // === UTILITIES ===
  
  /**
   * Calculate new risk level based on confirmed fraud
   */
  const calculateNewRiskLevel = (alert: any): 'low' | 'medium' | 'high' | 'very_high' | 'critical' => {
    if (alert.severity === 'critical') return 'very_high';
    if (alert.severity === 'high') return 'high';
    if (alert.score > 80) return 'high';
    if (alert.score > 60) return 'medium';
    return 'medium'; // Minimum increase for any confirmed fraud
  };

  // === STATS & ANALYTICS ===
  const getEventDrivenStats = useCallback(async () => {
    // Import mockServices to avoid circular dependency
    const { mockServices } = await import('../lib/mockServices');
    
    const totalEvents = events.events.length;
    const processedEvents = events.events.filter(e => e.processed_at).length;
    const allAlerts = await mockServices.AlertService.getAlerts();
    const totalAlerts = allAlerts.length;
    const confirmedFrauds = allAlerts.filter(a => a.metadata?.qualification === 'fraud_confirmed').length;
    
    return {
      events: {
        total: totalEvents,
        processed: processedEvents,
        pending: totalEvents - processedEvents
      },
      alerts: {
        total: totalAlerts,
        confirmed: confirmedFrauds,
        falsePositives: allAlerts.filter(a => a.metadata?.qualification === 'false_positive').length,
        investigating: allAlerts.filter(a => a.metadata?.qualification === 'requires_investigation').length
      },
      effectiveness: {
        alertRate: totalEvents > 0 ? (totalAlerts / totalEvents * 100).toFixed(1) : '0',
        confirmationRate: totalAlerts > 0 ? (confirmedFrauds / totalAlerts * 100).toFixed(1) : '0'
      }
    };
  }, [events]);

  // === MAIN RETURN ===
  return {
    // Core services (event-driven order)
    services: {
      events,
      historique,
      risque,
      cases
    },

    // Main workflows
    processEventWorkflow,
    handleAlertQualification,
    createCaseFromAlert,

    // Data retrieval
    getPersonCompleteData,
    getEventDrivenStats,

    // Quick actions
    quickActions: {
      // Upload and process document
      uploadDocument: async (file: File, metadata: any) => {
        return await processEventWorkflow({
          ...metadata,
          fileName: file.name,
          fileSize: file.size,
          uploadedAt: new Date()
        }, { autoProcess: true });
      },

      // Quick alert qualification with feedback loop
      qualifyAlert: handleAlertQualification,

      // Search events by various criteria
      searchEvents: (criteria: any) => {
        return events.loadEvents(criteria);
      }
    },

    // State indicators
    isProcessing: events.isProcessing,
    hasNewAlerts: false // Will be handled differently to avoid circular dependency
  };
};

export default useEventDriven;