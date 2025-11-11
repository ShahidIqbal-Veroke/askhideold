# API Integration Guide - Alerts

## Overview

Alerts page में data abhi **localStorage** (mock service) se aa raha hai. Real API integrate karne ke liye yahan steps hain.

## Current Data Flow

```
Alerts Page (Alerts.tsx)
    ↓
AlertContext (useAlerts hook)
    ↓
mockServices.AlertService (localStorage)
```

## API Integration Steps

### 1. Environment Configuration

`.env` file me ye variable add karein:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000
VITE_API_PROTOCOL=http
VITE_USE_REAL_API=true
```

### 2. API Endpoints Required

Backend me ye endpoints implement karein:

#### Get Alerts (with filters)
```
GET /api/alerts?status=pending&severity=high&assignedTo=user123&search=keyword
```

**Response Format:**
```json
{
  "alerts": [
    {
      "id": "alert-123",
      "status": "pending",
      "severity": "high",
      "score": 75,
      "metadata": { ... },
      ...
    }
  ]
}
```

#### Get Alert Statistics
```
GET /api/alerts/stats?userId=user123&teamId=team1
```

**Response Format:**
```json
{
  "stats": {
    "pending": 10,
    "assigned": 5,
    "inReview": 3,
    "qualified": 20,
    "rejected": 2,
    "bySeverity": {
      "critical": 2,
      "high": 8,
      "medium": 15,
      "low": 5
    },
    "avgProcessingTime": 45,
    "todayCount": 5,
    "weekCount": 25
  }
}
```

#### Assign Alerts
```
POST /api/alerts/assign
Body: {
  "alertIds": ["alert-1", "alert-2"],
  "assignTo": "user123",
  "team": "automotive_fraud_team"
}
```

#### Qualify Alert
```
POST /api/alerts/:id/qualify
Body: {
  "qualification": "fraud_confirmed",
  "notes": "Fraud confirmed after investigation"
}
```

#### Create Alert
```
POST /api/alerts
Body: {
  "event_id": "evt-123",
  "source": "document_analysis",
  "severity": "high",
  ...
}
```

### 3. Switch to Real API

**Option 1: Environment Variable (Recommended)**
`.env` file me `VITE_USE_REAL_API=true` set karein.

**Option 2: Direct Code Change**
`src/contexts/AlertContext.tsx` me line 12 par:
```typescript
const USE_REAL_API = true; // Change false to true
```

### 4. API Service Location

API service file: `src/services/alertsApiService.ts`

Yeh file already banai gayi hai aur sab methods implement kiye gaye hain:
- `getAlerts(filters)` - Get alerts with filters
- `getAlertById(id)` - Get single alert
- `getStats(userId?, teamId?)` - Get statistics
- `assignAlerts(assignment)` - Assign alerts
- `qualifyAlert(request)` - Qualify alert
- `createAlert(alertData)` - Create new alert
- `updateAlert(id, updates)` - Update alert

### 5. Testing

1. **Mock Mode (Default):**
   - `VITE_USE_REAL_API=false` ya unset
   - Data localStorage se aayega
   - Console me "Using: MOCK SERVICE" dikhega

2. **API Mode:**
   - `VITE_USE_REAL_API=true`
   - Data API se aayega
   - Console me "Using: REAL API" dikhega
   - Network tab me API calls dikhengi

### 6. Error Handling

Agar API call fail ho, to:
- Error toast message show hoga
- Console me error log hoga
- User ko proper error message milega

### 7. Backend API Requirements

Backend API ko ye requirements follow karni chahiye:

1. **CORS Enabled:** Frontend domain ko allow karein
2. **JSON Response:** All responses JSON format me honi chahiye
3. **Error Handling:** Proper HTTP status codes (200, 400, 404, 500, etc.)
4. **Authentication:** Agar auth required hai, to headers me token pass karein

### 8. Authentication (if needed)

Agar API me authentication chahiye, to `src/services/apiClient.ts` me headers add karein:

```typescript
headers: {
  'Authorization': `Bearer ${token}`,
  'Accept': 'application/json',
  'Content-Type': 'application/json',
}
```

## File Structure

```
src/
├── services/
│   ├── alertsApiService.ts    ← API service (NEW)
│   └── apiClient.ts           ← Base API client
├── contexts/
│   └── AlertContext.tsx        ← Updated with API support
├── lib/
│   └── mockServices.ts        ← Mock service (existing)
└── pages/
    └── Alerts.tsx             ← No changes needed
```

## Summary

1. ✅ API service file banai gayi hai (`alertsApiService.ts`)
2. ✅ AlertContext me API integration add ki gayi hai
3. ✅ Environment variable se switch kar sakte hain
4. ⏳ Backend API endpoints implement karni hain
5. ⏳ `.env` file me configuration add karni hai

**Abhi tak:** Mock service (localStorage) use ho raha hai  
**API use karne ke liye:** `VITE_USE_REAL_API=true` set karein

