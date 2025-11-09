// Integration Example: How to use localStorage services in your components
// This file demonstrates how to replace API calls with localStorage mock services

import { mockServices } from './mockServices';
import { getWorkflowChain } from './demoData';

// Example 1: Loading alerts in a component
export async function loadAlertsExample() {
  try {
    // Replace your API call with mock service
    const alerts = await mockServices.AlertService.getAlerts({
      status: 'new',
      severity: 'high'
    });
    
    console.log('Loaded alerts:', alerts);
    return alerts;
  } catch (error) {
    console.error('Error loading alerts:', error);
    return [];
  }
}

// Example 2: Creating a case from qualified alerts
export async function createCaseExample() {
  try {
    // First, get some alerts to work with
    const alerts = await mockServices.AlertService.getAlerts({
      status: 'qualified'
    });
    
    if (alerts.length === 0) {
      console.log('No qualified alerts found');
      return null;
    }

    // Create a case from the first qualified alert
    const alertIds = [alerts[0].id];
    const newCase = await mockServices.CaseService.createFromAlerts(
      alertIds,
      'cyber-specialist-01',
      'cyber_fraud_team'
    );
    
    console.log('Created case:', newCase);
    return newCase;
  } catch (error) {
    console.error('Error creating case:', error);
    return null;
  }
}

// Example 3: Following the complete workflow chain
export async function workflowChainExample() {
  try {
    // Get all alerts
    const alerts = await mockServices.AlertService.getAlerts();
    
    if (alerts.length === 0) {
      console.log('No alerts found');
      return;
    }

    // Follow the workflow chain for the first alert
    const alertId = alerts[0].id;
    const workflowChain = getWorkflowChain(alertId);
    
    console.log('Complete workflow chain for alert:', alertId);
    console.log('Event:', workflowChain?.event);
    console.log('Cycle de Vie:', workflowChain?.cycleVie);
    console.log('Historique:', workflowChain?.historique);
    console.log('Alert:', workflowChain?.alert);
    console.log('Cases:', workflowChain?.cases);
    
    return workflowChain;
  } catch (error) {
    console.error('Error following workflow chain:', error);
    return null;
  }
}

// Example 4: Real-time updates simulation
export function setupRealTimeUpdatesExample() {
  // Simulate receiving new alerts
  setInterval(async () => {
    const newAlert = await mockServices.AlertService.createAlert({
      event_id: `evt-realtime-${Date.now()}`,
      historique_id: `hist-realtime-${Date.now()}`,
      reference: `ALT-RT-${Date.now()}`,
      source: 'pattern_detection',
      fraud_city_source: 'cyber',
      business_district: 'auto',
      severity: 'medium',
      score: Math.floor(Math.random() * 40) + 60, // 60-100
      status: 'new',
      sla_deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      impacts_risk: false,
      metadata: {
        detection_model: 'realtime_v1.0',
        confidence: 0.75,
        affected_entities: [`entity-${Date.now()}`],
        financial_impact: Math.floor(Math.random() * 50000) + 10000
      }
    });
    
    console.log('New real-time alert created:', newAlert.reference);
  }, 60000); // Every minute
}

// Example 5: Getting analytics data
export async function getAnalyticsExample() {
  try {
    const metrics = await mockServices.AnalyticsService.getAlertMetrics();
    const cityDistrictMetrics = await mockServices.AnalyticsService.getCityDistrictMetrics();
    const teamPerformance = await mockServices.AnalyticsService.getTeamPerformance();
    
    console.log('Alert Metrics:', metrics);
    console.log('City/District Metrics:', cityDistrictMetrics);
    console.log('Team Performance:', teamPerformance);
    
    return {
      alertMetrics: metrics,
      cityDistrictMetrics,
      teamPerformance
    };
  } catch (error) {
    console.error('Error getting analytics:', error);
    return null;
  }
}

// Example 6: ROI calculation for a case
export async function calculateROIExample() {
  try {
    // Get cases first
    const cases = await mockServices.CaseService.getCases();
    
    if (cases.length === 0) {
      console.log('No cases found for ROI calculation');
      return null;
    }

    // Calculate ROI for the first case
    const caseId = cases[0].id;
    const roiCalculation = await mockServices.ROIService.calculateROI(caseId);
    
    console.log(`ROI for case ${cases[0].reference}:`, roiCalculation);
    return roiCalculation;
  } catch (error) {
    console.error('Error calculating ROI:', error);
    return null;
  }
}

// Example 7: How to replace useEffect API calls in components
export function useAlertsWithMockData() {
  // This is how you would modify your existing useEffect calls
  
  // OLD WAY (with real API):
  // useEffect(() => {
  //   fetch('/api/alerts')
  //     .then(res => res.json())
  //     .then(setAlerts);
  // }, []);
  
  // NEW WAY (with localStorage mock):
  // useEffect(() => {
  //   mockServices.AlertService.getAlerts()
  //     .then(setAlerts);
  // }, []);
  
  console.log('Use this pattern in your components to replace API calls');
}

// Development helper: Run all examples
export async function runAllExamples() {
  console.log('=== Running localStorage Integration Examples ===');
  
  console.log('\n1. Loading Alerts:');
  await loadAlertsExample();
  
  console.log('\n2. Creating Case:');
  await createCaseExample();
  
  console.log('\n3. Workflow Chain:');
  await workflowChainExample();
  
  console.log('\n4. Analytics:');
  await getAnalyticsExample();
  
  console.log('\n5. ROI Calculation:');
  await calculateROIExample();
  
  console.log('\n6. Setting up real-time updates (check console for updates):');
  setupRealTimeUpdatesExample();
  
  console.log('\n=== All examples completed ===');
}

// Make available globally for development
if (typeof window !== 'undefined') {
  (window as any).runDemoExamples = runAllExamples;
  (window as any).mockServices = mockServices;
}