// Debug utility to check localStorage contents
export function debugLocalStorage() {
  console.log('=== DEBUG LOCALSTORAGE ===');
  
  // Check alerts
  const alertsKey = 'hedi_guardian_alerts';
  const alertsData = localStorage.getItem(alertsKey);
  console.log('Alerts in localStorage:', alertsData ? JSON.parse(alertsData) : 'No alerts found');
  
  // Check events
  const eventsKey = 'hedi_guardian_events';
  const eventsData = localStorage.getItem(eventsKey);
  console.log('Events in localStorage:', eventsData ? JSON.parse(eventsData) : 'No events found');
  
  // List all keys
  console.log('All localStorage keys:', Object.keys(localStorage));
}

// Call this function from browser console: debugLocalStorage()
window.debugLocalStorage = debugLocalStorage;