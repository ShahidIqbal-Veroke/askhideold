import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEvents } from '@/contexts/EventContext';
import { useAuth } from '@/hooks/useAuth';
import { mockServices } from '@/lib/mockServices';
import { db } from '@/lib/localStorage';
import { DemoInitializer } from '@/lib/demoInitializer';
import type { Event } from '@/lib/demoData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HeaderKPI from '@/components/HeaderKPI';
import { EventCard } from '@/components/EventCard';
import { EventDetails } from '@/components/EventDetails';
import { 
  Zap, 
  Filter, 
  Search,
  Activity
} from 'lucide-react';
import { EventType, EventCategory } from '@/types/event.types';

const Events = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Local state for localStorage data
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventAlerts, setEventAlerts] = useState<{[eventId: string]: any[]}>({});
  const [eventAssures, setEventAssures] = useState<{[eventId: string]: any}>({});
  const [eventCycleVies, setEventCycleVies] = useState<{[eventId: string]: any}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState({
    total_events: 0,
    alerts_generated: 0,
    average_processing_time_ms: 0
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Load events from localStorage
  const loadEvents = async (filters?: any) => {
    setIsLoading(true);
    try {
      // Force re-initialization if data is inconsistent
      const eventsInStorage = db.getAll<Event>('events');
      // Don't consider missing assure_id as inconsistent for document_upload events (they may not have an associated customer)
      const hasInconsistentData = eventsInStorage.length === 0 || eventsInStorage.some(event => 
        !event.assure_id && event.type !== 'document_upload'
      );
      
      if (hasInconsistentData) {
        console.log('🔄 Detected inconsistent data, reinitializing...');
        DemoInitializer.forceInit();
      } else if (!DemoInitializer.hasData()) {
        console.log('No data found, initializing demo data...');
        DemoInitializer.init();
      }
      
      const loadedEvents = await mockServices.EventService.getEvents(filters);
      console.log('Loaded events from service:', loadedEvents);
      
      setEvents(loadedEvents);
      
      // Load related data for each event
      const alertsMap: {[eventId: string]: any[]} = {};
      const assuresMap: {[eventId: string]: any} = {};
      const cycleViesMap: {[eventId: string]: any} = {};
      let totalAlertsGenerated = 0;
      
      for (const event of loadedEvents) {
        // Load alerts
        const alerts = await mockServices.AlertService.getAlerts({});
        const eventAlerts = alerts.filter(alert => alert.event_id === event.id);
        alertsMap[event.id] = eventAlerts;
        totalAlertsGenerated += eventAlerts.length;
        
        // Load assuré
        if (event.assure_id) {
          const assure = await mockServices.AssureService.getAssureById(event.assure_id);
          if (assure) {
            assuresMap[event.id] = assure;
          }
        }
        
        // Load cycle de vie - CORRECT relationship: CycleVie linked to Event via event_id
        const cycleVies = await mockServices.CycleVieService.getCycleVies(event.id);
        if (cycleVies.length > 0) {
          const cycleVie = cycleVies[0];
          cycleViesMap[event.id] = cycleVie;
        }
      }
      
      setEventAlerts(alertsMap);
      setEventAssures(assuresMap);
      setEventCycleVies(cycleViesMap);
      
      // Calculate stats
      setStats({
        total_events: loadedEvents.length,
        alerts_generated: totalAlertsGenerated,
        average_processing_time_ms: 450 // Mock processing time
      });
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load events on component mount and when filters change
  useEffect(() => {
    const filters: any = {};
    
    if (filterType !== 'all') {
      filters.type = filterType;
    }
    if (filterStatus !== 'all') {
      filters.status = filterStatus;
    }
    if (searchTerm) {
      // Add date range filter for demo
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filters.dateFrom = oneWeekAgo.toISOString();
      filters.dateTo = now.toISOString();
    }
    
    loadEvents(filters);
  }, [filterType, filterStatus, searchTerm]);

  // Initial load
  useEffect(() => {
    loadEvents();
  }, []);

  // Handle highlight from URL params
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const highlightId = searchParams.get('highlight');
    
    if (highlightId && events.length > 0) {
      const eventToHighlight = events.find(e => e.id === highlightId);
      if (eventToHighlight) {
        setSelectedEvent(eventToHighlight);
        // Clear the highlight param
        navigate('/events', { replace: true });
      }
    }
  }, [events, location.search, navigate]);


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const selectEvent = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    setSelectedEvent(event || null);
  };

  const handleProcessEvent = async (eventId: string) => {
    setIsProcessing(true);
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update event status in localStorage would go here
      console.log('Event processed:', eventId);
      
      // Refresh events
      await loadEvents();
    } catch (error) {
      console.error('Failed to process event:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const kpiCards = [
    {
      icon: <img src="/icons/Totalevents.svg" alt="Total Events" className="w-5 h-5" />,
      title: "Total Events",
      value: stats?.total_events || 0
    },
    {
      icon: <img src="/icons/Alertsgenerated.svg" alt="Alerts Generated" className="w-5 h-5" />,
      title: "Alerts Generated",
      value: stats?.alerts_generated || 0
    },
    {
      icon: <img src="/icons/Averagetime.svg" alt="Average Time" className="w-5 h-5" />,
      title: "Average Time",
      value: `${stats?.average_processing_time_ms || 0}ms`
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with KPI */}
      <HeaderKPI
        title="Event Stream"
        subtitle={`Welcome ${user?.name} (${role}) - Platform source of truth`}
        cards={kpiCards}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Event Stream (Left) */}
        <div className="col-span-5">
          <Card className="h-[calc(100vh-200px)]">
            <CardHeader>
              <div className="flex justify-between items-center mb-4">
                <CardTitle>Real-time feed</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="flex items-center justify-center">{events.length} events</Badge>
                  {isProcessing && (
                    <Badge variant="outline" className="animate-pulse flex items-center justify-center">
                      <Activity className="w-3 h-3 mr-1" />
                      Processing...
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Filters */}
              <div className="space-y-3 mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="document_upload">Document upload</SelectItem>
                      <SelectItem value="pattern_detection">Pattern detection</SelectItem>
                      <SelectItem value="manual_review">Manual review</SelectItem>
                      <SelectItem value="system_alert">System alert</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="processed">Processed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="overflow-y-auto max-h-[calc(100%-200px)]">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                </div>
              ) : (
                <div className="space-y-2">
                  {events.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      isSelected={selectedEvent?.id === event.id}
                      onClick={() => selectEvent(event.id)}
                      alertCount={eventAlerts[event.id]?.length || 0}
                      getStatusColor={getStatusColor}
                    />
                  ))}
                  {events.length === 0 && !isLoading && (
                    <div className="text-center py-8 text-slate-500">
                      <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No events found</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Event Details (Right) */}
        <div className="col-span-7">
          {selectedEvent ? (
            <EventDetails
              event={selectedEvent}
              eventAssures={eventAssures}
              eventCycleVies={eventCycleVies}
              eventAlerts={eventAlerts}
              stats={stats}
              isProcessing={isProcessing}
              onProcessEvent={handleProcessEvent}
              getStatusColor={getStatusColor}
            />
          ) : (
            <Card className="h-[calc(100vh-200px)] flex items-center justify-center">
              <div className="text-center">
                <Zap className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600">Select an event to view details</p>
                <p className="text-sm text-slate-500 mt-1">Events are the platform's source of truth</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Events;
