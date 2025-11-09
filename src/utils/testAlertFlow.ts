// Test utility for debugging alert creation and display flow
import { db } from '@/lib/localStorage';

// Function to clear all localStorage data and start fresh
export function clearAllData() {
  console.log('🧹 Clearing all localStorage data...');
  localStorage.clear();
  console.log('✅ All data cleared');
}

// Function to check what's in localStorage
export function checkLocalStorageData() {
  console.log('=== CHECKING LOCALSTORAGE DATA ===');
  
  // Check alerts
  const alertsKey = 'hedi_alerts';
  const alertsData = localStorage.getItem(alertsKey);
  const alerts = alertsData ? JSON.parse(alertsData) : [];
  console.log(`📋 Alerts (${alertsKey}):`, alerts.length, 'items');
  if (alerts.length > 0) {
    console.log('First alert:', alerts[0]);
    console.log('All alert IDs:', alerts.map((a: any) => a.id));
  }
  
  // Check events
  const eventsKey = 'hedi_events';
  const eventsData = localStorage.getItem(eventsKey);
  const events = eventsData ? JSON.parse(eventsData) : [];
  console.log(`📋 Events (${eventsKey}):`, events.length, 'items');
  if (events.length > 0) {
    console.log('First event:', events[0]);
  }
  
  // Check all keys
  console.log('📋 All localStorage keys:', Object.keys(localStorage));
}

// Function to manually create a test alert
export function createTestAlert() {
  console.log('🧪 Creating test alert...');
  
  const testAlert = {
    id: `alert-test-${Date.now()}`,
    event_id: `evt-test-${Date.now()}`,
    historique_id: `hist-test-${Date.now()}`,
    reference: `ALT-TEST-${Date.now()}`,
    source: 'document_analysis' as const,
    fraud_city_source: 'documentaire' as const,
    business_district: 'auto' as const,
    severity: 'high' as const,
    score: 85,
    status: 'new' as const,
    assigned_to: undefined,
    assigned_team: undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sla_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    impacts_risk: false,
    metadata: {
      detection_model: 'test-model',
      confidence: 0.85,
      affected_entities: ['test-entity'],
      financial_impact: 5000,
      documentType: 'TEST_DOCUMENT',
      sinisterNumber: 'SIN-TEST-001',
      technicalEvidence: [
        {
          code: 'TEST_FINDING',
          message: 'This is a test finding',
          severity: 'fail' as const,
          confidence: 0.9
        }
      ]
    }
  };
  
  const alerts = db.getAll('alerts');
  alerts.push(testAlert);
  db.save('alerts', alerts);
  
  console.log('✅ Test alert created:', testAlert.id);
  return testAlert;
}

// Function to verify alert creation from upload
export function monitorAlertCreation() {
  console.log('👀 Monitoring alert creation...');
  
  // Save original localStorage.setItem
  const originalSetItem = localStorage.setItem;
  
  // Override to log all writes
  localStorage.setItem = function(key: string, value: string) {
    if (key.includes('alert')) {
      console.log(`💾 Writing to localStorage[${key}]:`, value.substring(0, 200) + '...');
      try {
        const parsed = JSON.parse(value);
        console.log(`📊 Parsed data: ${parsed.length} items`);
        if (parsed.length > 0 && parsed[parsed.length - 1]) {
          console.log('Latest item:', parsed[parsed.length - 1]);
        }
      } catch (e) {
        console.log('Could not parse as JSON');
      }
    }
    originalSetItem.call(this, key, value);
  };
  
  console.log('✅ Monitoring active - check console during upload');
}

// Function to fix common issues
export function fixAlertIssues() {
  console.log('🔧 Attempting to fix alert issues...');
  
  // Get all alerts
  const alerts = db.getAll<any>('alerts');
  console.log(`Found ${alerts.length} alerts`);
  
  // Fix any alerts that might have incorrect structure
  let fixed = 0;
  const fixedAlerts = alerts.map((alert: any) => {
    let wasFixed = false;
    
    // Ensure all required fields exist
    if (!alert.reference) {
      alert.reference = `ALT-FIX-${alert.id}`;
      wasFixed = true;
    }
    
    if (!alert.metadata) {
      alert.metadata = {};
      wasFixed = true;
    }
    
    if (!alert.metadata.documentType && alert.metadata.document_type) {
      alert.metadata.documentType = alert.metadata.document_type;
      wasFixed = true;
    }
    
    if (wasFixed) {
      fixed++;
      console.log(`Fixed alert: ${alert.id}`);
    }
    
    return alert;
  });
  
  if (fixed > 0) {
    db.save('alerts', fixedAlerts);
    console.log(`✅ Fixed ${fixed} alerts`);
  } else {
    console.log('✅ No fixes needed');
  }
}

// Expose functions globally for console access
(window as any).testAlertFlow = {
  clearAllData,
  checkLocalStorageData,
  createTestAlert,
  monitorAlertCreation,
  fixAlertIssues
};

console.log('🧪 Alert Flow Test Utilities Loaded');
console.log('Available functions:');
console.log('  testAlertFlow.clearAllData() - Clear all localStorage');
console.log('  testAlertFlow.checkLocalStorageData() - Check what\'s stored');
console.log('  testAlertFlow.createTestAlert() - Create a test alert');
console.log('  testAlertFlow.monitorAlertCreation() - Monitor alert writes');
console.log('  testAlertFlow.fixAlertIssues() - Fix common alert issues');

// Auto-run check on load
checkLocalStorageData();