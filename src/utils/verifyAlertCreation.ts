// Verification utility to check alert creation in real-time
export function verifyAlertCreation() {
  console.log('🔍 VERIFYING ALERT CREATION PROCESS...');
  
  // Check current alerts in localStorage
  const alertsKey = 'hedi_alerts';
  const alertsData = localStorage.getItem(alertsKey);
  const alerts = alertsData ? JSON.parse(alertsData) : [];
  
  console.log(`📊 Current alerts count: ${alerts.length}`);
  
  if (alerts.length > 0) {
    // Show the most recent alert
    const latestAlert = alerts[alerts.length - 1];
    console.log('🆕 Latest alert:', latestAlert);
    
    // Check if it's a recently created alert (within last 5 minutes)
    const createdTime = new Date(latestAlert.created_at).getTime();
    const now = new Date().getTime();
    const ageMinutes = (now - createdTime) / (1000 * 60);
    
    if (ageMinutes < 5) {
      console.log(`✅ This alert was created ${ageMinutes.toFixed(1)} minutes ago`);
      console.log('📋 Alert details:');
      console.log(`  - ID: ${latestAlert.id}`);
      console.log(`  - Status: ${latestAlert.status}`);
      console.log(`  - Severity: ${latestAlert.severity}`);
      console.log(`  - Score: ${latestAlert.score}`);
      console.log(`  - Document Type: ${latestAlert.metadata?.documentType}`);
      console.log(`  - Decision: ${latestAlert.metadata?.decision}`);
    }
  }
  
  // Check events too
  const eventsKey = 'hedi_events';
  const eventsData = localStorage.getItem(eventsKey);
  const events = eventsData ? JSON.parse(eventsData) : [];
  
  console.log(`📊 Current events count: ${events.length}`);
  
  // Find recent document upload events
  const recentEvents = events.filter((e: any) => {
    const eventTime = new Date(e.timestamp).getTime();
    const now = new Date().getTime();
    const ageMinutes = (now - eventTime) / (1000 * 60);
    return ageMinutes < 5 && e.type === 'document_upload';
  });
  
  if (recentEvents.length > 0) {
    console.log(`📄 Found ${recentEvents.length} recent document upload events`);
    recentEvents.forEach((event: any) => {
      console.log(`  - Event ${event.id}: ${event.type} at ${event.timestamp}`);
    });
  }
  
  // Monitor localStorage changes
  console.log('👀 Now monitoring localStorage for changes...');
  console.log('Upload a document and I will track the alert creation!');
  
  // Poll for changes every second
  let lastAlertCount = alerts.length;
  const interval = setInterval(() => {
    const currentData = localStorage.getItem(alertsKey);
    const currentAlerts = currentData ? JSON.parse(currentData) : [];
    
    if (currentAlerts.length > lastAlertCount) {
      console.log('🚨 NEW ALERT CREATED!');
      const newAlert = currentAlerts[currentAlerts.length - 1];
      console.log('New alert details:', newAlert);
      console.log('Alert created successfully! Navigate to /alerts to see it.');
      clearInterval(interval);
    }
  }, 1000);
  
  // Stop monitoring after 30 seconds
  setTimeout(() => {
    clearInterval(interval);
    console.log('⏹️ Stopped monitoring');
  }, 30000);
}

// Auto-expose to window
(window as any).verifyAlertCreation = verifyAlertCreation;

// Run verification immediately
verifyAlertCreation();