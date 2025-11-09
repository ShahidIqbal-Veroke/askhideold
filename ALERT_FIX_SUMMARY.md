# Alert Creation and Display Fix Summary

## Problem Overview
Alerts were being created when documents were rejected/flagged but weren't appearing in the `/alerts` page.

## Root Causes Identified

1. **Data Format Mismatch**: The Alert type in `alert.types.ts` has different fields than the simpler Alert interface in `demoData.ts`
2. **Status Value**: Alerts were created with `status: 'new'` but filters expected other values
3. **LocalStorage Persistence**: Alerts were created correctly via `mockServices.AlertService.createAlert()` which saves to localStorage
4. **Demo Data Interference**: `DemoInitializer` doesn't reinitialize if data already exists (line 41 in demoInitializer.ts)

## Fixes Applied

### 1. Enhanced Logging
- Added console logs in EventContext when creating alerts
- Added console logs in AlertContext when loading alerts
- Created `debugLocalStorage.ts` utility
- Created `testAlertFlow.ts` comprehensive testing utility

### 2. Alert Creation Structure
- EventContext now creates alerts with the correct structure matching demoData Alert interface
- Includes all required fields: `reference`, `fraud_city_source`, `business_district`, etc.
- Metadata includes both `documentType` and `document_type` for compatibility
- Technical evidence is properly formatted

### 3. Test Utilities Available

Run these commands in the browser console:

```javascript
// Check what's in localStorage
testAlertFlow.checkLocalStorageData()

// Clear all data and start fresh
testAlertFlow.clearAllData()

// Create a test alert manually
testAlertFlow.createTestAlert()

// Monitor alert creation during upload
testAlertFlow.monitorAlertCreation()

// Fix common alert structure issues
testAlertFlow.fixAlertIssues()

// Clean duplicate alerts
cleanDuplicateAlerts()

// Debug localStorage specifically
debugLocalStorage()
```

## Testing Steps

1. **Clear and Start Fresh**:
   ```javascript
   testAlertFlow.clearAllData()
   ```
   Then refresh the page

2. **Upload a Document**:
   - Click the upload button
   - Select an image/PDF
   - Click "Analyser"
   - Wait for analysis to complete

3. **Check Console Logs**:
   - Look for "🚨 Creating alert with data:" log
   - Look for "💾 Creating alert in localStorage:" log
   - Look for "✅ Alert created successfully:" log

4. **Navigate to Alerts**:
   - Go to `/alerts` page
   - You should see the newly created alert
   - If not, check console for "📥 Loading alerts with filters:" log

5. **If Alerts Don't Show**:
   ```javascript
   // Check what's stored
   testAlertFlow.checkLocalStorageData()
   
   // Look at the raw data
   JSON.parse(localStorage.getItem('hedi_alerts'))
   ```

## Key Points

- Alerts are stored in localStorage with key `hedi_alerts`
- Events are stored with key `hedi_events`
- The alert must have `status: 'new'` to be visible initially
- Alerts are only created when `decision` is 'reject' or 'review'
- The Alert page loads all alerts by default when no filters are applied

## Common Issues and Solutions

### Issue: "No alerts showing"
**Solution**: 
1. Check localStorage: `testAlertFlow.checkLocalStorageData()`
2. Clear data: `testAlertFlow.clearAllData()` and try again
3. Check filters on alerts page - ensure they're set to "all"

### Issue: "Alert created but wrong format"
**Solution**: Run `testAlertFlow.fixAlertIssues()` to fix common structure issues

### Issue: "Too many demo alerts"
**Solution**: Run `cleanDuplicateAlerts()` in console

### Issue: "Alert doesn't have technical evidence"
**Solution**: The analysis result must include `key_findings` array for technical evidence to appear

## Next Steps

1. Test the complete flow with a fresh start
2. Monitor console logs during the process
3. Use the test utilities to debug any issues
4. The alerts should now properly appear in the `/alerts` page when documents are rejected or need review