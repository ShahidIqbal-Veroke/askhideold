import { useCallback } from 'react';
import { useCycleVie } from '@/contexts/CycleVieContext';
import { useHistorique } from '@/contexts/HistoriqueContext';
import { useRisque } from '@/contexts/RisqueContext';
import { useDemande } from '@/contexts/DemandeContext';
import { useAlerts } from '@/contexts/AlertContext';
import { useCases } from '@/contexts/CaseContext';

/**
 * Hook principal pour l'architecture Assuré-centric
 * Combine tous les services et fournit une interface unifiée
 * pour travailler avec les données centrées sur l'assuré
 */
export const useAssureCentric = (assureId?: string) => {
  const cycleVie = useCycleVie();
  const historique = useHistorique();
  const risque = useRisque();
  const demande = useDemande();
  const alerts = useAlerts();
  const cases = useCases();

  // === CHARGEMENT COMPLET D'UN ASSURÉ ===

  const loadCompleteAssureData = useCallback(async (targetAssureId: string) => {
    const loadPromises = [
      cycleVie.getCyclesVieForAssure(targetAssureId),
      historique.loadTimelineForAssure(targetAssureId),
      risque.detectCorrelations(targetAssureId),
      demande.loadDemandes({ assureId: targetAssureId }),
      alerts.loadAlerts({ assignedTo: targetAssureId }), // Assuming assignedTo could be assureId
      historique.detectPatterns(targetAssureId),
    ];

    try {
      const [
        cycles,
        timeline,
        correlations,
        demandes,
        alertsResult,
        patterns
      ] = await Promise.all(loadPromises);

      return {
        assureId: targetAssureId,
        cycles,
        timeline,
        correlations,
        demandes,
        alertsData: alertsResult,
        patterns,
        loadedAt: new Date(),
      };
    } catch (error) {
      console.error('Erreur lors du chargement des données assuré:', error);
      throw error;
    }
  }, [cycleVie, historique, risque, demande, alerts]);

  // === WORKFLOW COMPLET : DEMANDE → HISTORIQUE → RISQUE → ALERTE → DOSSIER ===

  const processCompleteWorkflow = useCallback(async (
    demandeId: string,
    targetAssureId?: string
  ) => {
    const workflowAssureId = targetAssureId || assureId;
    if (!workflowAssureId) {
      throw new Error('AssureId requis pour le workflow');
    }

    try {
      // Étape 1: Convertir la demande en historique
      const historiqueId = await demande.convertToHistorique(demandeId);
      if (!historiqueId) {
        throw new Error('Échec de la conversion en historique');
      }

      // Étape 2: Détecter des risques depuis l'historique
      const riskId = await risque.detectRiskFromAlert(
        `HIST-${historiqueId}`, // Simulating alert from historique
        workflowAssureId
      );

      // Étape 3: Si risque détecté, créer une alerte
      const alertId: string | null = null;
      if (riskId) {
        // Note: Ici on simule la création d'alerte depuis un risque
        // Dans une vraie implémentation, le risqueService déclencherait automatiquement les alertes
        console.log(`Risque détecté: ${riskId} pour assuré ${workflowAssureId}`);
      }

      // Étape 4: Mettre à jour le cycle de vie si nécessaire
      const cycles = await cycleVie.getCyclesVieForAssure(workflowAssureId);
      if (cycles.length > 0) {
        const activeCycle = cycles.find(c => c.status === 'active');
        if (activeCycle) {
          await cycleVie.updateCycleVie({
            cycleVieId: activeCycle.id,
            addHistorique: historiqueId,
            addRisque: riskId || undefined,
          }, 'system');
        }
      }

      return {
        success: true,
        historiqueId,
        riskId,
        alertId,
        workflowSteps: [
          'Demande archivée en historique',
          riskId ? 'Risque détecté et créé' : 'Aucun risque détecté',
          alertId ? 'Alerte générée' : 'Aucune alerte nécessaire',
          'Cycle de vie mis à jour'
        ]
      };
    } catch (error) {
      console.error('Erreur dans le workflow complet:', error);
      throw error;
    }
  }, [demande, risque, cycleVie, assureId]);

  // === DÉTECTION PROACTIVE D'ANOMALIES ===

  const detectAssureAnomalies = useCallback(async (targetAssureId?: string) => {
    const anomalyAssureId = targetAssureId || assureId;
    if (!anomalyAssureId) {
      throw new Error('AssureId requis pour la détection d\'anomalies');
    }

    try {
      const [
        cycleAnomalies,
        riskCorrelations,
        historiquePatterns
      ] = await Promise.all([
        cycleVie.detectAnomalies(),
        risque.detectCorrelations(anomalyAssureId),
        historique.detectPatterns(anomalyAssureId)
      ]);

      // Filtrer les anomalies pour cet assuré
      const assureAnomalies = cycleAnomalies.filter(a => 
        cycleVie.state.cyclesVie.some(c => 
          c.id === a.cycleVieId && c.assureId === anomalyAssureId
        )
      );

      return {
        cycleAnomalies: assureAnomalies,
        riskCorrelations,
        historiquePatterns,
        totalAnomalies: assureAnomalies.length + riskCorrelations.length + historiquePatterns.length,
        severity: calculateAnomalySeverity(assureAnomalies, riskCorrelations, historiquePatterns),
      };
    } catch (error) {
      console.error('Erreur lors de la détection d\'anomalies:', error);
      throw error;
    }
  }, [cycleVie, risque, historique, assureId]);

  // === ANALYTICS ASSURÉ ===

  const getAssureAnalytics = useCallback(async (targetAssureId?: string) => {
    const analyticsAssureId = targetAssureId || assureId;
    if (!analyticsAssureId) {
      throw new Error('AssureId requis pour les analytics');
    }

    try {
      const [
        cyclesData,
        timelineData,
        correlationsData
      ] = await Promise.all([
        cycleVie.getCyclesVieForAssure(analyticsAssureId),
        historique.loadTimelineForAssure(analyticsAssureId),
        risque.detectCorrelations(analyticsAssureId)
      ]);

      // Calculer les métriques
      const activeCycles = cyclesData.filter(c => c.status === 'active').length;
      const totalEvents = timelineData?.totalEvents || 0;
      const riskLevel = calculateOverallRiskLevel(correlationsData);
      const lifecycleStage = getMainLifecycleStage(cyclesData);

      return {
        assureId: analyticsAssureId,
        summary: {
          activeCycles,
          totalEvents,
          riskLevel,
          lifecycleStage,
          lastActivity: timelineData?.dateRange.end || new Date(),
        },
        cycles: cyclesData,
        timeline: timelineData,
        risks: correlationsData,
        recommendations: generateAssureRecommendations(cyclesData, correlationsData),
      };
    } catch (error) {
      console.error('Erreur lors du calcul des analytics:', error);
      throw error;
    }
  }, [cycleVie, historique, risque, assureId]);

  // === ACTIONS RAPIDES ===

  const quickActions = {
    // Créer une nouvelle demande pour l'assuré
    createDemande: useCallback(async (demandeData: any, targetAssureId?: string) => {
      const createAssureId = targetAssureId || assureId;
      if (!createAssureId) {
        throw new Error('AssureId requis');
      }

      return await demande.createDemande({
        ...demandeData,
        demandeur: {
          ...demandeData.demandeur,
          assureId: createAssureId,
        }
      });
    }, [demande, assureId]),

    // Escalader un risque critique
    escalateRisk: useCallback(async (riskId: string) => {
      return await risque.updateRisque({
        risqueId: riskId,
        newLevel: 'critical',
        newStatus: 'investigating',
      });
    }, [risque]),

    // Marquer un cycle comme nécessitant attention
    flagCycleForReview: useCallback(async (cycleId: string) => {
      return await cycleVie.updateCycleVie({
        cycleVieId: cycleId,
        notes: 'Marqué pour révision manuelle'
      }, 'system');
    }, [cycleVie]),
  };

  // === ÉTAT GLOBAL ===

  const globalState = {
    loading: cycleVie.state.loading || historique.state.loading || 
             risque.state.loading || demande.state.loading,
    
    error: cycleVie.state.error || historique.state.error || 
           risque.state.error || demande.state.error,
    
    dataFreshness: {
      cyclesVie: cycleVie.state.cyclesVie.length > 0,
      historique: historique.state.historiques.length > 0,
      risques: risque.state.risques.length > 0,
      demandes: demande.state.demandes.length > 0,
    },
  };

  return {
    // Services individuels (pour accès direct si nécessaire)
    services: {
      cycleVie,
      historique,
      risque,
      demande,
      alerts,
      cases,
    },

    // Fonctions de haut niveau
    loadCompleteAssureData,
    processCompleteWorkflow,
    detectAssureAnomalies,
    getAssureAnalytics,

    // Actions rapides
    quickActions,

    // État global
    globalState,

    // Utilitaires
    refreshAllData: useCallback(async () => {
      await Promise.all([
        cycleVie.refreshData(),
        historique.refreshData(),
        risque.refreshData(),
        demande.refreshData(),
      ]);
    }, [cycleVie, historique, risque, demande]),

    clearAllErrors: useCallback(() => {
      cycleVie.clearError();
      historique.clearError();
      risque.clearError();
      demande.clearError();
    }, [cycleVie, historique, risque, demande]),
  };
};

// === FONCTIONS UTILITAIRES ===

function calculateAnomalySeverity(cycleAnomalies: any[], riskCorrelations: any[], patterns: any[]): 'low' | 'medium' | 'high' | 'critical' {
  const totalAnomalies = cycleAnomalies.length + riskCorrelations.length + patterns.length;
  
  if (totalAnomalies === 0) return 'low';
  if (totalAnomalies <= 2) return 'medium';
  if (totalAnomalies <= 5) return 'high';
  return 'critical';
}

function calculateOverallRiskLevel(correlations: any[]): 'low' | 'medium' | 'high' | 'critical' {
  if (correlations.length === 0) return 'low';
  
  const highRiskCorrelations = correlations.filter(c => c.strength > 0.7).length;
  if (highRiskCorrelations >= 3) return 'critical';
  if (highRiskCorrelations >= 2) return 'high';
  if (correlations.length >= 2) return 'medium';
  return 'low';
}

function getMainLifecycleStage(cycles: any[]): string {
  if (cycles.length === 0) return 'unknown';
  
  const activeCycle = cycles.find(c => c.status === 'active');
  return activeCycle?.currentStage || 'completed';
}

function generateAssureRecommendations(cycles: any[], correlations: any[]): string[] {
  const recommendations = [];
  
  if (cycles.some(c => c.validationRequise)) {
    recommendations.push('Validation manuelle requise sur certains cycles');
  }
  
  if (correlations.length > 3) {
    recommendations.push('Surveiller les corrélations de risques élevées');
  }
  
  if (cycles.some(c => c.metriques.ratioSinistralite > 100)) {
    recommendations.push('Revoir les conditions tarifaires');
  }
  
  return recommendations;
}

export default useAssureCentric;