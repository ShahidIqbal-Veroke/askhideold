/**
 * Types for Event-Driven Architecture
 * Event is the source of truth for all system activities
 */

export type EventType = 
  | 'document_upload' 
  | 'declaration_sinistre' 
  | 'modification_contrat' 
  | 'paiement'
  | 'detection_fraude'
  | 'analyse_document';

export type EventCategory = 'commercial' | 'operationnel' | 'sinistre' | 'fraude';
export type EventPriority = 'low' | 'medium' | 'high' | 'critical';
export type EventSource = 'client' | 'system' | 'external_api' | 'fraud_detection';
export type EventChannel = 'web' | 'mobile' | 'api' | 'upload';

/**
 * Core Event - Source of truth for all activities
 */
export interface Evenement {
  // Identification
  id: string;
  reference_externe?: string;
  numero_suivi: string;
  
  // Classification
  type: EventType;
  category: EventCategory;
  priority: EventPriority;
  
  // Origine
  source: EventSource;
  channel: EventChannel;
  
  // Content
  data: {
    documentId?: string;
    documentType?: string;
    sinisterNumber?: string;
    policyNumber?: string;
    amount?: number;
    description?: string;
    [key: string]: any;
  };
  
  metadata: {
    userAgent?: string;
    ipAddress?: string;
    sessionId?: string;
    [key: string]: any;
  };
  
  // Relations (Event can be linked to a person but not required)
  assure_id?: string;  // Optional - some events may not have a person yet
  cycle_vie_id?: string;
  
  // Timeline
  occurred_at: Date;
  created_at: Date;
  processed_at?: Date;
}

/**
 * Event Processing Result
 */
export interface EventProcessingResult {
  event_id: string;
  historique_id?: string;
  alerts_generated: string[];
  risk_impacts: Array<{
    assure_id: string;
    old_score: number;
    new_score: number;
    reason: string;
  }>;
  processing_time_ms: number;
  status: 'success' | 'partial' | 'failed';
  error?: string;
}

/**
 * Event Filter for searching
 */
export interface EventFilters {
  types?: EventType[];
  categories?: EventCategory[];
  sources?: EventSource[];
  assure_id?: string;
  date_range?: {
    start: Date;
    end: Date;
  };
  has_alerts?: boolean;
  search_term?: string;
}

/**
 * Event Statistics
 */
export interface EventStats {
  total_events: number;
  by_type: Record<EventType, number>;
  by_category: Record<EventCategory, number>;
  by_source: Record<EventSource, number>;
  alerts_generated: number;
  average_processing_time_ms: number;
  events_with_risk_impact: number;
}