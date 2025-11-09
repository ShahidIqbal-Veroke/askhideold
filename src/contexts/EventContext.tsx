import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Evenement, EventFilters, EventStats, EventProcessingResult, EventType } from '@/types/event.types';
import { useToast } from '@/hooks/use-toast';
import { useHistorique } from './HistoriqueContext';
// import { useAlerts } from './AlertContext'; // Removed to fix circular dependency
import { FraudDetectionService } from '@/services/fraudDetectionService';

interface EventContextType {
  // Event data
  events: Evenement[];
  selectedEvent: Evenement | null;
  stats: EventStats | null;
  
  // Loading states
  isLoading: boolean;
  isProcessing: boolean;
  
  // Core actions
  createEvent: (eventData: Partial<Evenement>) => Promise<Evenement>;
  processEvent: (eventId: string) => Promise<EventProcessingResult>;
  loadEvents: (filters?: EventFilters) => Promise<void>;
  selectEvent: (eventId: string | null) => void;
  
  // Event-driven workflow
  uploadDocumentEvent: (documentData: any) => Promise<EventProcessingResult>;
  createSinisterEvent: (sinisterData: any) => Promise<EventProcessingResult>;
  
  // Statistics
  refreshStats: () => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Evenement[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Evenement | null>(null);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { toast } = useToast();
  const historique = useHistorique();
  // const alerts = useAlerts(); // Removed to fix circular dependency

  // Create a new event
  const createEvent = async (eventData: Partial<Evenement>): Promise<Evenement> => {
    const newEvent: Evenement = {
      id: `EVT-${Date.now()}`,
      numero_suivi: `TRK-${Date.now()}`,
      type: eventData.type || 'document_upload',
      category: eventData.category || 'operationnel',
      priority: eventData.priority || 'medium',
      source: eventData.source || 'web',
      channel: eventData.channel || 'upload',
      data: eventData.data || {},
      metadata: eventData.metadata || {},
      occurred_at: new Date(),
      created_at: new Date(),
      ...eventData
    };
    
    // Save to localStorage via db
    const { db } = await import('../lib/localStorage');
    
    // Convert to old Event format for compatibility with Events page
    const oldFormatEvent = {
      id: newEvent.id,
      type: newEvent.type as any,
      timestamp: newEvent.created_at.toISOString(),
      source: mapNewSourceToOld(newEvent.source, newEvent.channel),
      assure_id: newEvent.assure_id,
      contrat_id: newEvent.data.policyNumber,
      data: {
        documentId: newEvent.data.documentId,
        userId: newEvent.data.uploadedBy || 'system',
        sinistre_numero: newEvent.data.sinisterNumber,
        metadata: {
          ...newEvent.metadata,
          document_type: newEvent.data.documentType,
          amount: newEvent.data.amount,
          analysisResult: newEvent.data.analysisResult,
          imageId: newEvent.data.imageId
        }
      },
      status: 'pending' as const
    };
    
    console.log('Creating event with old format:', oldFormatEvent);
    const created = db.create('events', oldFormatEvent);
    console.log('Event created in localStorage:', created);
    
    // Verify it was saved
    const allEvents = db.getAll('events');
    console.log('All events in localStorage after create:', allEvents);
    
    setEvents(prev => [newEvent, ...prev]);
    return newEvent;
  };

  // Process an event object directly (without looking it up)
  const processEventWithObject = async (event: Evenement): Promise<EventProcessingResult> => {
    setIsProcessing(true);
    const startTime = Date.now();
    
    try {
      const result: EventProcessingResult = {
        event_id: event.id,
        alerts_generated: [],
        risk_impacts: [],
        processing_time_ms: 0,
        status: 'success'
      };
      
      // Step 1: Create history entry from event
      const historyEntry = await historique.createFromEvent(event);
      result.historique_id = historyEntry.id;
      
      // Step 2: Analyze for patterns and generate alerts if needed
      console.log('🔍 Checking if alert should be created...');
      console.log('  - Has documentId:', !!event.data.documentId);
      console.log('  - Event type:', event.type);
      console.log('  - Has analysisResult:', !!event.data.analysisResult);
      
      if (event.data.documentId && event.type === 'document_upload' && event.data.analysisResult) {
        // Use the actual analysis result passed from UploadModal
        const analysisResult = event.data.analysisResult;
        console.log('📊 Analysis result received:', analysisResult);
        
        // Create alert if decision is reject or review
        if (analysisResult.decision === 'reject' || analysisResult.decision === 'review') {
          // Import mockServices to create alert directly
          const { mockServices } = await import('../lib/mockServices');
          
          // Create alert from event (not directly linked to person)
          console.log('🚨 ALERT CREATION STARTING...');
          console.log('📊 Analysis Decision:', analysisResult.decision);
          console.log('📊 Risk Score:', analysisResult.risk_score);
          console.log('📊 Should create alert:', analysisResult.decision === 'reject' || analysisResult.decision === 'review');
          
          const alert = await mockServices.AlertService.createAlert({
            event_id: event.id,
            historique_id: historyEntry.id,
            reference: `ALT-${Date.now()}`,
            source: 'document_analysis',
            sourceModule: 'fraud-detection-service',
            detection_module: 'document-ai-analysis',
            type: 'document_suspect',
            fraud_city_source: 'documentaire',
            business_district: 'auto',
            severity: (analysisResult.risk_score * 100) >= 85 ? 'critical' : 
                     (analysisResult.risk_score * 100) >= 70 ? 'high' : 
                     (analysisResult.risk_score * 100) >= 50 ? 'medium' : 'low',
            score: Math.round((analysisResult.risk_score || 0) * 100),
            status: 'new',  // Use correct status value
            assigned_to: undefined,
            assigned_team: undefined,
            sla_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            impacts_risk: false,
            metadata: {
              detection_model: 'fraud-detection-service',
              confidence: analysisResult.confidence || 0.7,
              affected_entities: event.assure_id ? [event.assure_id] : [],
              financial_impact: event.data.amount || 0,
              // Additional metadata for compatibility
              documentType: event.data.documentType || analysisResult.document_info?.type,
              sinisterNumber: event.data.sinisterNumber || analysisResult.document_info?.registration_number,
              amount: event.data.amount,
              fraudTypes: analysisResult.key_findings?.map(f => f.code) || [],
              decision: analysisResult.decision,
              event_type: event.type,
              technicalEvidence: analysisResult.key_findings?.map(f => ({
                code: f.code,
                message: f.message,
                severity: f.level === 'fail' ? 'fail' : f.level === 'warn' ? 'warn' : 'info',
                confidence: f.confidence || 0.8
              })),
              assureId: event.assure_id  // For backwards compatibility
            }
          });
          
          result.alerts_generated.push(alert.id);
          console.log('✅ ALERT CREATED SUCCESSFULLY:', alert.id);
          console.log('📋 Alert details:', alert);
        }
      }
      
      // Step 3: Update event as processed
      const updatedEvent = { ...event, processed_at: new Date() };
      setEvents(prev => prev.map(e => e.id === event.id ? updatedEvent : e));
      
      result.processing_time_ms = Date.now() - startTime;
      
      toast({
        title: "Événement traité",
        description: `${result.alerts_generated.length} alerte(s) générée(s)`
      });
      
      return result;
      
    } catch (error) {
      console.error('Error in processEventWithObject:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors du traitement de l'événement",
        variant: "destructive"
      });
      
      return {
        event_id: event.id,
        alerts_generated: [],
        risk_impacts: [],
        processing_time_ms: Date.now() - startTime,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      setIsProcessing(false);
    }
  };

  // Process an event through the complete workflow
  const processEvent = async (eventId: string): Promise<EventProcessingResult> => {
    setIsProcessing(true);
    const startTime = Date.now();
    
    try {
      // First check state, then check localStorage if not found
      let event = events.find(e => e.id === eventId);
      
      if (!event) {
        console.log(`Event ${eventId} not found in state, checking localStorage...`);
        const { db } = await import('../lib/localStorage');
        const allEvents = db.getAll('events');
        const oldFormatEvent = allEvents.find((e: any) => e.id === eventId);
        
        if (oldFormatEvent) {
          // Convert from old format to new format
          event = {
            id: oldFormatEvent.id,
            numero_suivi: `TRK-${oldFormatEvent.id}`,
            type: oldFormatEvent.type,
            category: 'operationnel',
            priority: 'medium',
            source: 'web',
            channel: 'upload',
            data: oldFormatEvent.data || {},
            metadata: oldFormatEvent.data?.metadata || {},
            occurred_at: new Date(oldFormatEvent.timestamp),
            created_at: new Date(oldFormatEvent.timestamp),
            assure_id: oldFormatEvent.assure_id
          };
          console.log('Found event in localStorage, converted to new format');
        }
      }
      
      if (!event) throw new Error('Event not found');
      
      const result: EventProcessingResult = {
        event_id: eventId,
        alerts_generated: [],
        risk_impacts: [],
        processing_time_ms: 0,
        status: 'success'
      };
      
      // Step 1: Create history entry from event
      const historyEntry = await historique.createFromEvent(event);
      result.historique_id = historyEntry.id;
      
      // Step 2: Analyze for patterns and generate alerts if needed
      console.log('🔍 Checking if alert should be created...');
      console.log('  - Has documentId:', !!event.data.documentId);
      console.log('  - Event type:', event.type);
      console.log('  - Has analysisResult:', !!event.data.analysisResult);
      
      if (event.data.documentId && event.type === 'document_upload' && event.data.analysisResult) {
        // Use the actual analysis result passed from UploadModal
        const analysisResult = event.data.analysisResult;
        console.log('📊 Analysis result received:', analysisResult);
        
        // Create alert if decision is reject or review
        if (analysisResult.decision === 'reject' || analysisResult.decision === 'review') {
          // Import mockServices to create alert directly
          const { mockServices } = await import('../lib/mockServices');
          
          // Create alert from event (not directly linked to person)
          console.log('🚨 ALERT CREATION STARTING...');
          console.log('📊 Analysis Decision:', analysisResult.decision);
          console.log('📊 Risk Score:', analysisResult.risk_score);
          console.log('📊 Should create alert:', analysisResult.decision === 'reject' || analysisResult.decision === 'review');
          
          const alert = await mockServices.AlertService.createAlert({
            event_id: event.id,
            historique_id: historyEntry.id,
            reference: `ALT-${Date.now()}`,
            source: 'document_analysis',
            fraud_city_source: 'documentaire',
            business_district: 'auto',
            severity: (analysisResult.risk_score * 100) >= 85 ? 'critical' : 
                     (analysisResult.risk_score * 100) >= 70 ? 'high' : 
                     (analysisResult.risk_score * 100) >= 50 ? 'medium' : 'low',
            score: Math.round((analysisResult.risk_score || 0) * 100),
            status: 'new',  // Use correct status value
            assigned_to: undefined,
            assigned_team: undefined,
            sla_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            impacts_risk: false,
            metadata: {
              detection_model: 'fraud-detection-service',
              confidence: analysisResult.confidence || 0.7,
              affected_entities: event.assure_id ? [event.assure_id] : [],
              financial_impact: event.data.amount || 0,
              // Additional metadata for compatibility
              documentType: event.data.documentType || analysisResult.document_info?.type,
              sinisterNumber: event.data.sinisterNumber || analysisResult.document_info?.registration_number,
              amount: event.data.amount,
              fraudTypes: analysisResult.key_findings?.map(f => f.code) || [],
              decision: analysisResult.decision,
              event_type: event.type,
              technicalEvidence: analysisResult.key_findings?.map(f => ({
                code: f.code,
                message: f.message,
                severity: f.level === 'fail' ? 'fail' : f.level === 'warn' ? 'warn' : 'info',
                confidence: f.confidence || 0.8
              })),
              assureId: event.assure_id  // For backwards compatibility
            }
          });
          
          result.alerts_generated.push(alert.id);
          console.log('✅ ALERT CREATED SUCCESSFULLY:', alert.id);
          console.log('📋 Alert details:', alert);
        }
      }
      
      // Step 3: Update event as processed
      const updatedEvent = { ...event, processed_at: new Date() };
      setEvents(prev => prev.map(e => e.id === eventId ? updatedEvent : e));
      
      result.processing_time_ms = Date.now() - startTime;
      
      toast({
        title: "Événement traité",
        description: `${result.alerts_generated.length} alerte(s) générée(s)`
      });
      
      return result;
      
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors du traitement de l'événement",
        variant: "destructive"
      });
      
      return {
        event_id: eventId,
        alerts_generated: [],
        risk_impacts: [],
        processing_time_ms: Date.now() - startTime,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      setIsProcessing(false);
    }
  };

  // Upload document workflow (creates event then processes it)
  const uploadDocumentEvent = async (documentData: any): Promise<EventProcessingResult> => {
    console.log('📤 uploadDocumentEvent called with data:', documentData);
    
    // Create event
    const event = await createEvent({
      type: 'document_upload',
      category: documentData.category || 'operationnel',
      source: 'web',
      channel: 'upload',
      data: {
        documentId: documentData.id,
        documentType: documentData.type,
        fileName: documentData.fileName,
        sinisterNumber: documentData.sinisterNumber,
        policyNumber: documentData.policyNumber,
        amount: documentData.amount,
        analysisResult: documentData.analysisResult // Pass the analysis result
      },
      assure_id: documentData.assureId // Can be undefined
    });
    
    console.log('📋 Event created, now processing:', event.id);
    
    // Add a small delay to ensure state is updated
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Process event through workflow - pass the event object directly
    return await processEventWithObject(event);
  };

  // Create sinister declaration event
  const createSinisterEvent = async (sinisterData: any): Promise<EventProcessingResult> => {
    const event = await createEvent({
      type: 'declaration_sinistre',
      category: 'sinistre',
      priority: 'high',
      source: 'client',
      channel: sinisterData.channel || 'web',
      data: {
        sinisterNumber: sinisterData.sinisterNumber,
        declarationDate: sinisterData.date,
        amount: sinisterData.estimatedAmount,
        description: sinisterData.description,
        documents: sinisterData.documents
      },
      assure_id: sinisterData.assureId
    });
    
    return await processEvent(event.id);
  };

  // Load events with filters
  const loadEvents = async (filters?: EventFilters) => {
    setIsLoading(true);
    try {
      // Load from localStorage
      const { db } = await import('../lib/localStorage');
      const { Event } = await import('../lib/demoData');
      const oldEvents = db.getAll<any>('events');
      
      // Convert from old format to new format
      const allEvents: Evenement[] = oldEvents.map((oldEvent: any) => {
        // If it already has created_at, it's already in new format
        if (oldEvent.created_at) {
          return oldEvent;
        }
        
        // Convert old Event to new Evenement
        return {
          id: oldEvent.id,
          numero_suivi: `TRK-${oldEvent.id}`,
          type: oldEvent.type,
          category: determineCategory(oldEvent.type),
          priority: 'medium' as const,
          source: mapOldSource(oldEvent.source),
          channel: mapOldSourceToChannel(oldEvent.source),
          data: {
            documentId: oldEvent.data?.documentId,
            documentType: oldEvent.data?.metadata?.document_type,
            sinisterNumber: oldEvent.data?.sinistre_numero,
            policyNumber: oldEvent.contrat_id,
            amount: oldEvent.data?.metadata?.amount || oldEvent.data?.metadata?.montant_facture,
            uploadedBy: oldEvent.data?.userId,
            analysisResult: oldEvent.data?.metadata?.analysisResult,
            ...oldEvent.data
          },
          metadata: {
            ...oldEvent.data?.metadata,
            originalTimestamp: oldEvent.timestamp
          },
          assure_id: oldEvent.assure_id,
          occurred_at: new Date(oldEvent.timestamp),
          created_at: new Date(oldEvent.timestamp),
          processed_at: oldEvent.status === 'processed' ? new Date(oldEvent.timestamp) : undefined
        };
      });
      
      // Apply filters if provided
      const filteredEvents = filters ? mockFilterEvents(allEvents, filters) : allEvents;
      
      // Sort by date (newest first)
      filteredEvents.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setEvents(filteredEvents);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les événements",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Select an event
  const selectEvent = (eventId: string | null) => {
    if (!eventId) {
      setSelectedEvent(null);
      return;
    }
    
    const event = events.find(e => e.id === eventId);
    setSelectedEvent(event || null);
  };

  // Refresh statistics
  const refreshStats = async () => {
    try {
      // Load fresh data from localStorage for accurate stats
      const { db } = await import('../lib/localStorage');
      const allEvents = db.getAll<Evenement>('events');
      
      // Calculate stats from all events
      const stats: EventStats = {
        total_events: allEvents.length,
        by_type: allEvents.reduce((acc, e) => {
          acc[e.type] = (acc[e.type] || 0) + 1;
          return acc;
        }, {} as Record<EventType, number>),
        by_category: allEvents.reduce((acc, e) => {
          acc[e.category] = (acc[e.category] || 0) + 1;
          return acc;
        }, {} as any),
        by_source: allEvents.reduce((acc, e) => {
          acc[e.source] = (acc[e.source] || 0) + 1;
          return acc;
        }, {} as any),
        alerts_generated: allEvents.filter(e => e.processed_at).length,
        average_processing_time_ms: 250,
        events_with_risk_impact: allEvents.filter(e => e.assure_id).length
      };
      
      setStats(stats);
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  // Initial load
  useEffect(() => {
    loadEvents();
    refreshStats();
  }, []);

  const value: EventContextType = {
    events,
    selectedEvent,
    stats,
    isLoading,
    isProcessing,
    createEvent,
    processEvent,
    loadEvents,
    selectEvent,
    uploadDocumentEvent,
    createSinisterEvent,
    refreshStats
  };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
}

// Helper functions for format conversion
function determineCategory(type: string): 'commercial' | 'operationnel' | 'sinistre' | 'fraude' {
  if (type === 'pattern_detection' || type === 'detection_fraude') return 'fraude';
  if (type === 'declaration_sinistre') return 'sinistre';
  if (type === 'modification_contrat' || type === 'paiement') return 'commercial';
  return 'operationnel';
}

function mapOldSource(source: string): 'client' | 'system' | 'external_api' | 'fraud_detection' {
  switch (source) {
    case 'web_portal':
    case 'mobile_app':
      return 'client';
    case 'ai_engine':
      return 'fraud_detection';
    case 'api':
      return 'external_api';
    default:
      return 'system';
  }
}

function mapOldSourceToChannel(source: string): 'web' | 'mobile' | 'api' | 'upload' {
  switch (source) {
    case 'web_portal':
      return 'web';
    case 'mobile_app':
      return 'mobile';
    case 'api':
      return 'api';
    default:
      return 'web';
  }
}

function mapNewSourceToOld(source: string, channel: string): string {
  if (source === 'client' && channel === 'web') return 'web_portal';
  if (source === 'client' && channel === 'mobile') return 'mobile_app';
  if (source === 'fraud_detection') return 'ai_engine';
  if (source === 'external_api') return 'api';
  return source;
}

// Mock filter implementation
function mockFilterEvents(events: Evenement[], filters?: EventFilters): Evenement[] {
  if (!filters) return events;
  
  return events.filter(event => {
    if (filters.types?.length && !filters.types.includes(event.type)) return false;
    if (filters.categories?.length && !filters.categories.includes(event.category)) return false;
    if (filters.sources?.length && !filters.sources.includes(event.source)) return false;
    if (filters.assure_id && event.assure_id !== filters.assure_id) return false;
    
    if (filters.date_range) {
      const eventDate = new Date(event.created_at);
      if (eventDate < filters.date_range.start || eventDate > filters.date_range.end) return false;
    }
    
    if (filters.search_term) {
      const searchLower = filters.search_term.toLowerCase();
      const searchableText = `${event.numero_suivi} ${JSON.stringify(event.data)}`.toLowerCase();
      if (!searchableText.includes(searchLower)) return false;
    }
    
    return true;
  });
}