import { ApiClient } from './apiClient';
import { Alert, AlertFilters, AlertStats, AlertAssignment, AlertQualificationRequest } from '@/types/alert.types';

/**
 * Real API Service for Alerts
 * This service makes actual HTTP calls to the backend API
 * Replace mockServices.AlertService with this when ready to use real API
 */
export class AlertsApiService {
  private baseEndpoint = '/api/alerts';

  /**
   * Get alerts with optional filters
   * API Endpoint: GET /api/alerts?status=...&severity=...&assignedTo=...
   */
  async getAlerts(filters?: AlertFilters): Promise<Alert[]> {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (filters?.status && Array.isArray(filters.status)) {
        filters.status.forEach(s => params.append('status', s));
      } else if (filters?.status) {
        params.append('status', filters.status);
      }
      
      if (filters?.severity && Array.isArray(filters.severity)) {
        filters.severity.forEach(s => params.append('severity', s));
      } else if (filters?.severity) {
        params.append('severity', filters.severity);
      }
      
      if (filters?.assignedTo) {
        params.append('assignedTo', filters.assignedTo);
      }
      
      if (filters?.team) {
        params.append('team', filters.team);
      }
      
      if (filters?.searchTerm) {
        params.append('search', filters.searchTerm);
      }
      
      if (filters?.unassigned) {
        params.append('unassigned', 'true');
      }

      const queryString = params.toString();
      const endpoint = queryString ? `${this.baseEndpoint}?${queryString}` : this.baseEndpoint;
      
      const response = await ApiClient.get(endpoint);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch alerts: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.alerts || data; // Handle both {alerts: []} and [] formats
    } catch (error) {
      console.error('Error fetching alerts from API:', error);
      throw error;
    }
  }

  /**
   * Get single alert by ID
   * API Endpoint: GET /api/alerts/:id
   */
  async getAlertById(id: string): Promise<Alert | null> {
    try {
      const response = await ApiClient.get(`${this.baseEndpoint}/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Failed to fetch alert: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.alert || data;
    } catch (error) {
      console.error('Error fetching alert from API:', error);
      throw error;
    }
  }

  /**
   * Get alert statistics
   * API Endpoint: GET /api/alerts/stats?userId=...&teamId=...
   */
  async getStats(userId?: string, teamId?: string): Promise<AlertStats> {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (teamId) params.append('teamId', teamId);
      
      const queryString = params.toString();
      const endpoint = queryString ? `${this.baseEndpoint}/stats?${queryString}` : `${this.baseEndpoint}/stats`;
      
      const response = await ApiClient.get(endpoint);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.stats || data;
    } catch (error) {
      console.error('Error fetching stats from API:', error);
      throw error;
    }
  }

  /**
   * Assign alerts to user/team
   * API Endpoint: POST /api/alerts/assign
   */
  async assignAlerts(assignment: AlertAssignment): Promise<void> {
    try {
      const response = await ApiClient.post(`${this.baseEndpoint}/assign`, assignment);
      
      if (!response.ok) {
        throw new Error(`Failed to assign alerts: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error assigning alerts via API:', error);
      throw error;
    }
  }

  /**
   * Qualify an alert
   * API Endpoint: POST /api/alerts/:id/qualify
   */
  async qualifyAlert(request: AlertQualificationRequest): Promise<Alert | null> {
    try {
      const response = await ApiClient.post(
        `${this.baseEndpoint}/${request.alertId}/qualify`,
        {
          qualification: request.qualification,
          notes: request.notes
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to qualify alert: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.alert || data;
    } catch (error) {
      console.error('Error qualifying alert via API:', error);
      throw error;
    }
  }

  /**
   * Create a new alert
   * API Endpoint: POST /api/alerts
   */
  async createAlert(alertData: Omit<Alert, 'id' | 'createdAt' | 'updatedAt'>): Promise<Alert> {
    try {
      const response = await ApiClient.post(this.baseEndpoint, alertData);
      
      if (!response.ok) {
        throw new Error(`Failed to create alert: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.alert || data;
    } catch (error) {
      console.error('Error creating alert via API:', error);
      throw error;
    }
  }

  /**
   * Update an alert
   * API Endpoint: PUT /api/alerts/:id
   */
  async updateAlert(id: string, updates: Partial<Alert>): Promise<Alert | null> {
    try {
      const response = await ApiClient.post(`${this.baseEndpoint}/${id}`, updates, {
        method: 'PUT'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update alert: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.alert || data;
    } catch (error) {
      console.error('Error updating alert via API:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const alertsApiService = new AlertsApiService();

