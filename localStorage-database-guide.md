# 🗄️ LocalStorage Database System - Demo Guide

## 🚀 Quick Start

Your fraud detection platform now includes a complete **localStorage-based database system** for demo purposes. This allows you to:

- 🎯 **Demo the full workflow** without backend dependencies
- 📊 **Test all features** with realistic data
- 🔧 **Develop and iterate** quickly
- 📈 **Show live analytics** and KPIs

## 🎪 Demo Data Overview

### Workflow Chain Implementation
```
[Évènement] ⟷ [Cycle de vie] → [Historique] → [Alerte] → [Dossier]
       ↓                                     ↓        ↓
[Assuré/Prospect] ⟷ [Risque]               [KPIs]   [Audit]
```

### Pre-loaded Demo Data
- **3 Events** (document uploads, pattern detection)
- **3 Cycle de Vie** entries (stage transitions)
- **3 Historique** records (audit trail)
- **3 Alerts** (different severities and sources)
- **2 Cases** (investigation workflows)
- **3 Fraud Catalogs** (classification rules)
- **2 Playbooks** (investigation procedures)

## 🛠️ Development Tools

### Available in Console
```javascript
// Database statistics
DemoInitializer.getStats()

// Reinitialize demo data
DemoInitializer.forceInit()

// Clear all data
DemoInitializer.reset()

// Export data backup
DemoInitializer.exportData()

// Direct database access
hediDB.getAll('alerts')
hediDB.getAll('cases')

// Run integration examples
runDemoExamples()
```

### Demo Data Manager
Navigate to **Settings** page → **Demo Data Manager** section (bottom of page)

Features:
- 📊 Real-time database statistics
- 🔄 Reinitialize/reset data
- 📥📤 Import/export data
- ➕ Add test scenarios
- 🎮 Real-time simulation

## 🔧 Integration Guide

### Replace API Calls with Mock Services

**Before (with real API):**
```typescript
useEffect(() => {
  fetch('/api/alerts')
    .then(res => res.json())
    .then(setAlerts);
}, []);
```

**After (with localStorage):**
```typescript
import { mockServices } from '@/lib/mockServices';

useEffect(() => {
  mockServices.AlertService.getAlerts()
    .then(setAlerts);
}, []);
```

### Available Mock Services

#### 🚨 Alert Service
```typescript
// Get alerts with filters
const alerts = await mockServices.AlertService.getAlerts({
  status: 'new',
  severity: 'high',
  assigned_to: 'user-id',
  team: 'cyber_fraud_team'
});

// Get specific alert
const alert = await mockServices.AlertService.getAlertById('alert-001');

// Assign alert
await mockServices.AlertService.assignAlert('alert-001', 'user-id', 'team');

// Qualify alert (fraud_confirmed | false_positive | requires_investigation)
await mockServices.AlertService.qualifyAlert('alert-001', 'fraud_confirmed');
```

#### 📁 Case Service
```typescript
// Get cases
const cases = await mockServices.CaseService.getCases({
  status: 'investigating',
  priority: 'high'
});

// Create case from alerts
const newCase = await mockServices.CaseService.createFromAlerts(
  ['alert-001', 'alert-002'],
  'assigned-user',
  'investigation-team'
);

// Handover case
await mockServices.CaseService.handoverCase(
  'case-001',
  'from-user',
  'from-team',
  'to-user', 
  'to-team',
  'Escalation reason'
);
```

#### 📊 Analytics Service
```typescript
// Get alert metrics
const metrics = await mockServices.AnalyticsService.getAlertMetrics();

// City/District performance
const cityDistrict = await mockServices.AnalyticsService.getCityDistrictMetrics();

// Team performance
const teams = await mockServices.AnalyticsService.getTeamPerformance();
```

#### 💰 ROI Service
```typescript
const roi = await mockServices.ROIService.calculateROI('case-001');
// Returns: estimated_loss, investigation_cost, prevented_amount, etc.
```

## 🎯 City-District Architecture

### Fraud Cities (Detection Sources)
- **🔐 Cyber**: Network pattern analysis
- **💰 AML**: Anti-money laundering detection  
- **📄 Documentaire**: Document analysis AI
- **👤 Comportemental**: Behavioral analytics

### Business Districts (Insurance Domains)
- **🚗 Auto**: Vehicle insurance
- **🏥 Santé**: Health insurance
- **🏠 Habitation**: Property insurance
- **💼 Professionnelle**: Professional insurance
- **✈️ Voyage**: Travel insurance

### Intelligent Routing
Alerts are automatically routed to specialized teams based on:
```
City Source × Business District = Optimal Team Assignment
```

## 🧪 Test Scenarios

### High-Priority Critical Alert
```javascript
DemoInitializer.addTestScenarios()
```
Adds:
- Critical cyber alert (95 score)
- Overdue investigation case
- Multi-entity network correlation

### Real-Time Simulation
```javascript
DemoInitializer.simulateRealTimeUpdates()
```
- Updates alert statuses every 30 seconds
- Shows workflow progression
- Demonstrates SLA management

## 📈 Metrics & KPIs

### Alert Metrics
- Total alerts by severity/status
- Average processing time
- SLA compliance rates
- False positive rates

### Financial Impact
- Estimated fraud amounts
- Investigation costs
- Prevented losses
- ROI calculations

### Team Performance
- Active cases per team
- Resolution times
- Success rates
- Escalation patterns

## 🔍 Workflow Tracing

### Follow Complete Chain
```javascript
import { getWorkflowChain } from '@/lib/demoData';

const chain = getWorkflowChain('alert-001');
// Returns: event → cycleVie → historique → alert → cases
```

### Event-Driven Architecture
- Events trigger lifecycle changes
- Historique maintains audit trail
- Alerts generated from pattern analysis
- Cases created from qualified alerts

## 🎮 Demo Features

### For Tomorrow's Demo

1. **🚨 Live Alert Queue**
   - Real-time priority sorting
   - SLA countdown timers
   - Team assignment routing

2. **📊 Executive Dashboard**
   - City/District performance matrix
   - Financial impact tracking
   - Team utilization metrics

3. **🔍 Investigation Workflow**
   - Multi-alert case creation
   - Evidence collection tracking
   - Handover audit trails

4. **💰 ROI Analytics**
   - Cost vs. prevention analysis
   - Team efficiency metrics
   - Historical trend analysis

### Reset for Clean Demo
```javascript
// Clear and reinitialize with fresh data
DemoInitializer.forceInit()

// Add extra test scenarios for drama
DemoInitializer.addTestScenarios()
```

## 🚨 Important Notes

- ✅ **Data persists** across browser sessions
- ✅ **Automatic initialization** on first load
- ✅ **TypeScript safety** throughout
- ✅ **Realistic business logic** following actual fraud workflows
- ✅ **Performance optimized** with proper indexing

## 📞 Support

During development, check the browser console for:
- Database initialization messages
- Available commands
- Error debugging
- Performance metrics

Happy demoing! 🎯🚀