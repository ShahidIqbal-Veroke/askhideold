// Mock Services using localStorage for demo
// These services replace the actual API calls with localStorage operations

import { db } from './localStorage';
import type { Alert, Case, Event, Historique, CycleVie, FraudCatalog, Playbook } from './demoData';

// Alert Service Mock
export class AlertServiceMock {
  static async getAlerts(filters?: {
    status?: string[] | string;
    severity?: string[] | string;
    assigned_to?: string;
    assignedTo?: string;
    team?: string;
    searchTerm?: string;
    unassigned?: boolean;
  }): Promise<Alert[]> {
    console.log('🔍 Loading alerts from localStorage with filters:', filters);
    let alerts = db.getAll<Alert>('alerts');
    console.log('📊 Found alerts in localStorage:', alerts.length);
    
    if (filters) {
      alerts = alerts.filter(alert => {
        // Status filter (can be array or string)
        if (filters.status) {
          const statusToCheck = Array.isArray(filters.status) ? filters.status : [filters.status];
          if (!statusToCheck.includes(alert.status)) return false;
        }
        
        // Severity filter (can be array or string)
        if (filters.severity) {
          const severityToCheck = Array.isArray(filters.severity) ? filters.severity : [filters.severity];
          if (!severityToCheck.includes(alert.severity)) return false;
        }
        
        // Assignment filters
        if (filters.assigned_to && alert.assigned_to !== filters.assigned_to) return false;
        if (filters.assignedTo && alert.assigned_to !== filters.assignedTo) return false;
        if (filters.team && alert.assigned_team !== filters.team) return false;
        if (filters.unassigned && alert.assigned_to) return false;
        
        // Search filter
        if (filters.searchTerm) {
          const searchLower = filters.searchTerm.toLowerCase();
          const searchableText = [
            alert.id,
            alert.reference,
            alert.metadata?.sinisterNumber,
            alert.metadata?.documentType
          ].filter(Boolean).join(' ').toLowerCase();
          
          if (!searchableText.includes(searchLower)) return false;
        }
        
        return true;
      });
    }
    
    const sorted = alerts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    console.log('✅ Returning filtered alerts:', sorted.length);
    return sorted;
  }

  static async getAlertById(id: string): Promise<Alert | null> {
    return db.getById<Alert>('alerts', id);
  }

  static async updateAlert(id: string, updates: Partial<Alert>): Promise<Alert | null> {
    return db.update<Alert>('alerts', id, {
      ...updates,
      updated_at: new Date().toISOString()
    });
  }

  static async assignAlert(id: string, assignedTo: string, team: string): Promise<Alert | null> {
    console.log(`🔧 Assigning alert ${id} to ${assignedTo} (team: ${team})`);
    return this.updateAlert(id, {
      assigned_to: assignedTo,
      assigned_team: team,
      status: 'assigned'
    });
  }

  static async qualifyAlert(id: string, qualification: 'fraud_confirmed' | 'false_positive' | 'requires_investigation'): Promise<Alert | null> {
    const impactsRisk = qualification === 'fraud_confirmed';
    
    return this.updateAlert(id, {
      status: 'qualified',
      impacts_risk: impactsRisk,
      metadata: {
        ...db.getById<Alert>('alerts', id)?.metadata,
        qualification,
        qualified_at: new Date().toISOString()
      }
    });
  }

  static async createAlert(alertData: Omit<Alert, 'id' | 'created_at' | 'updated_at'>): Promise<Alert> {
    const alert: Alert = {
      id: `alert-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...alertData
    };
    
    console.log('💾 Creating alert in localStorage:', alert);
    const created = db.create('alerts', alert);
    console.log('✅ Alert created successfully:', created);
    
    // Verify it was saved
    const allAlerts = db.getAll('alerts');
    console.log('📊 Total alerts in localStorage:', allAlerts.length);
    
    return created;
  }
}

// Case Service Mock
export class CaseServiceMock {
  static async getCases(filters?: {
    status?: string;
    priority?: string;
    team?: string;
    assigned_to?: string;
  }): Promise<Case[]> {
    let cases = db.getAll<Case>('cases');
    
    if (filters) {
      cases = cases.filter(caseItem => {
        return (!filters.status || caseItem.status === filters.status) &&
               (!filters.priority || caseItem.priority === filters.priority) &&
               (!filters.team || caseItem.investigation_team === filters.team) &&
               (!filters.assigned_to || caseItem.assigned_to === filters.assigned_to);
      });
    }
    
    return cases.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static async getCaseById(id: string): Promise<Case | null> {
    return db.getById<Case>('cases', id);
  }

  static async createFromAlerts(alertIds: string[], assignedTo: string, team: string): Promise<Case> {
    console.log('📁 Creating case from alerts:', { alertIds, assignedTo, team });
    
    const caseData: Case = {
      id: `case-${Date.now()}`,
      reference: `CASE-${new Date().getFullYear()}-${String(db.count('cases') + 1).padStart(3, '0')}`,
      alert_ids: alertIds,
      status: 'open',
      priority: 'normal',
      investigation_team: team,
      assigned_to: assignedTo,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      estimated_loss: 0,
      investigation_cost: 0,
      handovers: [],
      metadata: {
        evidence_collected: [],
        investigation_notes: ''
      }
    };

    console.log('📋 Case data prepared:', caseData);

    // Calculate estimated loss from alerts
    const alerts = alertIds.map(id => db.getById<Alert>('alerts', id)).filter(Boolean) as Alert[];
    console.log(`💰 Found ${alerts.length} alerts for case`);
    caseData.estimated_loss = alerts.reduce((sum, alert) => sum + (alert.metadata.financial_impact || 0), 0);

    const createdCase = db.create('cases', caseData);
    console.log('✅ Case created successfully:', createdCase);
    return createdCase;
  }

  static async updateCase(id: string, updates: Partial<Case>): Promise<Case | null> {
    return db.update<Case>('cases', id, {
      ...updates,
      updated_at: new Date().toISOString()
    });
  }

  static async handoverCase(
    id: string, 
    fromUser: string, 
    fromTeam: string, 
    toUser: string, 
    toTeam: string, 
    reason: string
  ): Promise<Case | null> {
    const caseItem = db.getById<Case>('cases', id);
    if (!caseItem) return null;

    const handover = {
      from: fromUser,
      fromTeam,
      to: toUser,
      toTeam,
      reason,
      timestamp: new Date().toISOString()
    };

    return this.updateCase(id, {
      assigned_to: toUser,
      investigation_team: toTeam,
      handovers: [...caseItem.handovers, handover]
    });
  }
}

// Event Service Mock  
export class EventServiceMock {
  static async getEvents(filters?: {
    type?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Event[]> {
    let events = db.getAll<Event>('events');
    
    if (filters) {
      events = events.filter(event => {
        const eventDate = new Date(event.timestamp);
        return (!filters.type || event.type === filters.type) &&
               (!filters.status || event.status === filters.status) &&
               (!filters.dateFrom || eventDate >= new Date(filters.dateFrom)) &&
               (!filters.dateTo || eventDate <= new Date(filters.dateTo));
      });
    }
    
    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  static async createEvent(eventData: Omit<Event, 'id'>): Promise<Event> {
    const event: Event = {
      id: `evt-${Date.now()}`,
      ...eventData
    };
    
    return db.create('events', event);
  }
}

// Historique Service Mock
export class HistoriqueServiceMock {
  static async getHistorique(filters?: {
    event_id?: string;
    actor?: string;
    impact_level?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Historique[]> {
    let historiques = db.getAll<Historique>('historiques');
    
    if (filters) {
      historiques = historiques.filter(hist => {
        const histDate = new Date(hist.timestamp);
        return (!filters.event_id || hist.event_id === filters.event_id) &&
               (!filters.actor || hist.actor === filters.actor) &&
               (!filters.impact_level || hist.impact_level === filters.impact_level) &&
               (!filters.dateFrom || histDate >= new Date(filters.dateFrom)) &&
               (!filters.dateTo || histDate <= new Date(filters.dateTo));
      });
    }
    
    return historiques.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  static async createHistoriqueEntry(data: Omit<Historique, 'id'>): Promise<Historique> {
    const entry: Historique = {
      id: `hist-${Date.now()}`,
      ...data
    };
    
    return db.create('historiques', entry);
  }
}

// Cycle de Vie Service Mock
export class CycleVieServiceMock {
  static async getCycleVies(eventId?: string): Promise<CycleVie[]> {
    let cycleVies = db.getAll<CycleVie>('cycle_vies');
    
    if (eventId) {
      cycleVies = cycleVies.filter(cv => cv.event_id === eventId);
    }
    
    // Return the cycles as they are from demo data
    return cycleVies.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  static async updateStage(id: string, newStage: string, metadata?: any): Promise<CycleVie | null> {
    return db.update<CycleVie>('cycle_vies', id, {
      stage: newStage as any,
      timestamp: new Date().toISOString(),
      metadata: metadata || {}
    });
  }

  static async createCycleVie(data: Omit<CycleVie, 'id'>): Promise<CycleVie> {
    const cycleVie: CycleVie = {
      id: `cv-${Date.now()}`,
      ...data
    };
    
    return db.create('cycle_vies', cycleVie);
  }
}

// Fraud Catalog Service Mock
export class FraudCatalogServiceMock {
  static async getFraudCatalogs(filters?: {
    city_source?: string;
    applicable_district?: string;
  }): Promise<FraudCatalog[]> {
    let catalogs = db.getAll<FraudCatalog>('fraud_catalogs');
    
    if (filters) {
      catalogs = catalogs.filter(catalog => {
        return (!filters.city_source || catalog.city_source === filters.city_source) &&
               (!filters.applicable_district || catalog.applicable_districts.includes(filters.applicable_district));
      });
    }
    
    return catalogs;
  }

  static async getPlaybook(catalogId: string): Promise<Playbook | null> {
    const catalog = db.getById<FraudCatalog>('fraud_catalogs', catalogId);
    if (!catalog?.playbook_id) return null;
    
    return db.getById<Playbook>('playbooks', catalog.playbook_id);
  }
}

// KPI and Analytics Mock
export class AnalyticsServiceMock {
  static async getAlertMetrics(dateRange?: { from: string; to: string }) {
    const alerts = db.getAll<Alert>('alerts');
    const cases = db.getAll<Case>('cases');
    
    return {
      total_alerts: alerts.length,
      alerts_by_severity: {
        critical: alerts.filter(a => a.severity === 'critical').length,
        high: alerts.filter(a => a.severity === 'high').length,
        medium: alerts.filter(a => a.severity === 'medium').length,
        low: alerts.filter(a => a.severity === 'low').length
      },
      alerts_by_status: {
        new: alerts.filter(a => a.status === 'new').length,
        assigned: alerts.filter(a => a.status === 'assigned').length,
        investigating: alerts.filter(a => a.status === 'investigating').length,
        qualified: alerts.filter(a => a.status === 'qualified').length,
        closed: alerts.filter(a => a.status === 'closed').length
      },
      total_cases: cases.length,
      estimated_total_loss: cases.reduce((sum, c) => sum + c.estimated_loss, 0),
      total_investigation_cost: cases.reduce((sum, c) => sum + c.investigation_cost, 0),
      avg_roi: cases.length > 0 ? cases.reduce((sum, c) => sum + (c.roi_score || 0), 0) / cases.length : 0
    };
  }

  static async getCityDistrictMetrics() {
    const alerts = db.getAll<Alert>('alerts');
    
    const cityMetrics = ['cyber', 'aml', 'documentaire', 'comportemental'].map(city => ({
      source: city,
      alerts_generated: alerts.filter(a => a.fraud_city_source === city).length,
      avg_score: alerts.filter(a => a.fraud_city_source === city).reduce((sum, a, _, arr) => 
        sum + a.score / arr.length, 0) || 0,
      success_rate: Math.random() * 0.3 + 0.7 // Mock success rate
    }));

    const districtMetrics = ['auto', 'sante', 'habitation', 'professionnelle', 'voyage'].map(district => ({
      district,
      active_cases: alerts.filter(a => a.business_district === district && a.status !== 'closed').length,
      total_financial_impact: alerts.filter(a => a.business_district === district)
        .reduce((sum, a) => sum + (a.metadata.financial_impact || 0), 0)
    }));

    return { cityMetrics, districtMetrics };
  }

  static async getTeamPerformance() {
    const cases = db.getAll<Case>('cases');
    const alerts = db.getAll<Alert>('alerts');
    
    const teams = ['automotive_fraud_team', 'cyber_fraud_team', 'health_fraud_team', 'property_fraud_team'];
    
    return teams.map(team => ({
      team_name: team,
      active_cases: cases.filter(c => c.investigation_team === team && c.status !== 'closed').length,
      avg_resolution_time: Math.floor(Math.random() * 48 + 24), // Mock resolution time
      total_alerts_assigned: alerts.filter(a => a.assigned_team === team).length,
      success_rate: Math.random() * 0.2 + 0.8 // Mock success rate
    }));
  }
}

// ROI Calculation Service Mock
export class ROIServiceMock {
  static async calculateROI(caseId: string): Promise<{
    estimated_loss: number;
    investigation_cost: number;
    prevented_amount: number;
    recovered_amount: number;
    net_roi: number;
    roi_percentage: number;
  }> {
    const caseItem = db.getById<Case>('cases', caseId);
    if (!caseItem) throw new Error('Case not found');

    // Mock calculations based on case data
    const prevented_amount = caseItem.estimated_loss * 0.8; // Assume 80% prevention
    const recovered_amount = caseItem.estimated_loss * 0.1; // Assume 10% recovery
    const net_roi = (prevented_amount + recovered_amount) - caseItem.investigation_cost;
    const roi_percentage = caseItem.investigation_cost > 0 ? 
      (net_roi / caseItem.investigation_cost) * 100 : 0;

    return {
      estimated_loss: caseItem.estimated_loss,
      investigation_cost: caseItem.investigation_cost,
      prevented_amount,
      recovered_amount,
      net_roi,
      roi_percentage
    };
  }
}

// Assure Service Mock
export class AssureServiceMock {
  static async getAssures(): Promise<any[]> {
    return db.getAll('assures');
  }

  static async getAssureById(id: string): Promise<any | null> {
    return db.getById('assures', id);
  }
}

// Export all services for easy import
export const mockServices = {
  AlertService: AlertServiceMock,
  CaseService: CaseServiceMock,
  EventService: EventServiceMock,
  HistoriqueService: HistoriqueServiceMock,
  CycleVieService: CycleVieServiceMock,
  FraudCatalogService: FraudCatalogServiceMock,
  AssureService: AssureServiceMock,
  AnalyticsService: AnalyticsServiceMock,
  ROIService: ROIServiceMock
};