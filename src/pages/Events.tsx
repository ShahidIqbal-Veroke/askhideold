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
import { 
  Zap, 
  Clock, 
  Filter, 
  Search,
  TrendingUp,
  Activity,
  BarChart3,
  PlayCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Upload,
  FileText,
  CreditCard,
  Settings as SettingsIcon,
  ArrowRight,
  ExternalLink,
  Link as LinkIcon,
  Building2,
  MapPin,
  Target,
  GitBranch,
  Eye,
  BookOpen
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

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'document_upload': return <Upload className="w-4 h-4" />;
      case 'pattern_detection': return <Activity className="w-4 h-4" />;
      case 'manual_review': return <FileText className="w-4 h-4" />;
      case 'system_alert': return <AlertTriangle className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Event Stream</h1>
          <p className="text-slate-600 mt-1">
            Welcome {user?.name} ({role}) - Platform source of truth
          </p>
        </div>
        

        {/* Quick Stats */}
        <div className="flex space-x-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats?.total_events || 0}</p>
                  <p className="text-xs text-slate-600">Total events</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{stats?.alerts_generated || 0}</p>
                  <p className="text-xs text-slate-600">Alerts generated</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{stats?.average_processing_time_ms || 0}ms</p>
                  <p className="text-xs text-slate-600">Average time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Event Stream (Left) */}
        <div className="col-span-5">
          <Card className="h-[calc(100vh-200px)]">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Real-time feed</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{events.length} events</Badge>
                  {isProcessing && (
                    <Badge variant="outline" className="animate-pulse">
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
                    <div
                      key={event.id}
                      onClick={() => selectEvent(event.id)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedEvent?.id === event.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            {getEventTypeIcon(event.type)}
                            <span className="font-medium text-sm">{event.id}</span>
                            <Badge className={getStatusColor(event.status)} variant="outline">
                              {event.status}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-slate-600 mb-1">
                            {event.type} - {event.source}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-xs text-slate-500">
                              <span>{event.data?.userId ? `User: ${event.data.userId}` : 'Automatic system'}</span>
                              {eventAlerts[event.id] && eventAlerts[event.id].length > 0 && (
                                <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                                  {eventAlerts[event.id].length} alert{eventAlerts[event.id].length > 1 ? 's' : ''}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              {event.status === 'processed' ? (
                                <CheckCircle className="w-3 h-3 text-green-500" />
                              ) : event.status === 'error' ? (
                                <XCircle className="w-3 h-3 text-red-500" />
                              ) : (
                                <Clock className="w-3 h-3 text-orange-500" />
                              )}
                              <span className="text-xs text-slate-500">
                                {new Date(event.timestamp).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
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
            <Card className="h-[calc(100vh-200px)]">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedEvent.id}</CardTitle>
                    <p className="text-sm text-slate-600 mt-1">
                      {selectedEvent.type} • Created on {new Date(selectedEvent.timestamp).toLocaleDateString('en-US')}
                      {' '}at {new Date(selectedEvent.timestamp).toLocaleTimeString('en-US')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(selectedEvent.status)} variant="outline">
                      {selectedEvent.status}
                    </Badge>
                    {selectedEvent.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleProcessEvent(selectedEvent.id)}
                        disabled={isProcessing}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <PlayCircle className="w-4 h-4 mr-1" />
                        Process
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="details" className="h-full">
                  <TabsList>
                    <TabsTrigger value="details" className="flex items-center space-x-2">
                      <span>Details</span>
                      {eventAssures[selectedEvent.id] ? (
                        <Badge variant="secondary" className="text-xs">
                          {eventAssures[selectedEvent.id].prenom} {eventAssures[selectedEvent.id].nom}
                        </Badge>
                      ) : selectedEvent.assure_id ? (
                        <Badge variant="outline" className="text-xs text-orange-500">
                          Customer {selectedEvent.assure_id}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-red-500">
                          No linked customer
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="workflow" className="flex items-center space-x-2">
                      <span>Workflow</span>
                      {eventCycleVies[selectedEvent.id] ? (
                        <Badge variant="outline" className="text-xs">
                          {eventCycleVies[selectedEvent.id].stage}
                          {eventCycleVies[selectedEvent.id].type && ` - ${eventCycleVies[selectedEvent.id].type}`}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-red-500">
                          Cycle not found
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="data">Data</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-700">Event type</p>
                        <p className="text-sm text-slate-600">{selectedEvent.type}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">Source</p>
                        <p className="text-sm text-slate-600">{selectedEvent.source}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">Identifier</p>
                        <p className="text-sm text-slate-600 font-mono">{selectedEvent.id}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">Status</p>
                        <div className="flex items-center space-x-2">
                          {selectedEvent.status === 'processed' ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : selectedEvent.status === 'error' ? (
                            <XCircle className="w-4 h-4 text-red-500" />
                          ) : (
                            <Clock className="w-4 h-4 text-orange-500" />
                          )}
                          <span className="text-sm text-slate-600">{selectedEvent.status}</span>
                        </div>
                      </div>
                      {selectedEvent.data?.userId && (
                        <div>
                          <p className="text-sm font-medium text-slate-700">User</p>
                          <p className="text-sm text-slate-600">{selectedEvent.data.userId}</p>
                        </div>
                      )}
                      {selectedEvent.data?.documentId && (
                        <div>
                          <p className="text-sm font-medium text-slate-700">Document ID</p>
                          <p className="text-sm text-slate-600 font-mono">{selectedEvent.data.documentId}</p>
                        </div>
                      )}
                    </div>
                    {eventAssures[selectedEvent.id] ? (
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-sm font-medium text-slate-700 mb-3">Customer Information</h3>
                            <div className="bg-slate-50 p-4 rounded-lg">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-slate-700">Full name</p>
                                  <p className="text-sm text-slate-600">
                                    {eventAssures[selectedEvent.id].civilite} {eventAssures[selectedEvent.id].prenom} {eventAssures[selectedEvent.id].nom}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-slate-700">Client No.</p>
                                  <p className="text-sm text-slate-600 font-mono">{eventAssures[selectedEvent.id].numero_client}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-slate-700">Email</p>
                                  <p className="text-sm text-slate-600">{eventAssures[selectedEvent.id].email}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-slate-700">Phone</p>
                                  <p className="text-sm text-slate-600">{eventAssures[selectedEvent.id].telephone}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-slate-700">Date of birth</p>
                                  <p className="text-sm text-slate-600">
                                    {new Date(eventAssures[selectedEvent.id].date_naissance).toLocaleDateString('en-US')}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-slate-700">Risk score</p>
                                  <div className="flex items-center space-x-2">
                                    <div className={`w-3 h-3 rounded-full ${
                                        eventAssures[selectedEvent.id].score_risque >= 70 ? 'bg-red-500' :
                                            eventAssures[selectedEvent.id].score_risque >= 40 ? 'bg-orange-500' :
                                                'bg-green-500'
                                    }`}></div>
                                    <span className="text-sm text-slate-600">{eventAssures[selectedEvent.id].score_risque}/100</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-sm font-medium text-slate-700 mb-3">Address</h3>
                            <div className="bg-slate-50 p-4 rounded-lg">
                              <p className="text-sm text-slate-600">
                                {eventAssures[selectedEvent.id].adresse.rue}<br/>
                                {eventAssures[selectedEvent.id].adresse.code_postal} {eventAssures[selectedEvent.id].adresse.ville}<br/>
                                {eventAssures[selectedEvent.id].adresse.pays}
                              </p>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-sm font-medium text-slate-700 mb-3">Contracts</h3>
                            <div className="space-y-2">
                              {eventAssures[selectedEvent.id].contrats.map((contrat: any) => (
                                  <div key={contrat.id} className="border border-slate-200 rounded-lg p-3">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-sm font-medium text-slate-700">{contrat.numero}</p>
                                        <p className="text-xs text-slate-500">{contrat.type} • {contrat.prime_annuelle}€/an</p>
                                      </div>
                                      <Badge variant={contrat.statut === 'actif' ? 'default' : 'secondary'}>
                                        {contrat.statut}
                                      </Badge>
                                    </div>
                                  </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h3 className="text-sm font-medium text-slate-700 mb-3">Claims history</h3>
                            <div className="space-y-2">
                              {eventAssures[selectedEvent.id].historique_sinistres.map((sinistre: any) => (
                                  <div key={sinistre.id} className="border border-slate-200 rounded-lg p-3">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-sm font-medium text-slate-700">{sinistre.type}</p>
                                        <p className="text-xs text-slate-500">
                                          {new Date(sinistre.date).toLocaleDateString('en-US')} • {sinistre.montant}€
                                        </p>
                                      </div>
                                      <Badge variant={sinistre.statut === 'en_cours' ? 'default' : 'secondary'}>
                                        {sinistre.statut}
                                      </Badge>
                                    </div>
                                  </div>
                              ))}
                            </div>
                          </div>
                        </div>
                    ) : (
                        <div className="text-center py-6 text-slate-500">
                          <p className="text-sm">No customer information available for this event</p>
                        </div>
                    )}
                    {selectedEvent.status === 'processed' && (
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Event processed</span>
                        </div>
                        <p className="text-xs text-green-700">
                          Event processed successfully - Workflow triggered
                        </p>
                      </div>
                    )}

                    {selectedEvent.status === 'error' && (
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span className="text-sm font-medium text-red-800">Processing error</span>
                        </div>
                        <p className="text-xs text-red-700">
                          An error occurred while processing this event
                        </p>
                      </div>
                    )}
                  </TabsContent>
                  


                  <TabsContent value="cycle" className="space-y-4">
                    {eventCycleVies[selectedEvent.id] ? (
                      <div className="space-y-4">
                        {/* Main lifecycle */}
                        <div>
                          <h3 className="text-sm font-medium text-slate-700 mb-3">Associated lifecycle</h3>
                          <div className="bg-slate-50 p-4 rounded-lg">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-slate-700">Cycle ID</p>
                                <p className="text-sm text-slate-600 font-mono">{eventCycleVies[selectedEvent.id].id}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-700">Current stage</p>
                                <Badge variant="default" className="capitalize">
                                  <GitBranch className="w-3 h-3 mr-1" />
                                  {eventCycleVies[selectedEvent.id].stage}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-700">Process type</p>
                                <Badge variant="outline" className="capitalize">
                                  {eventCycleVies[selectedEvent.id].type}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-700">Estimated duration</p>
                                <p className="text-sm text-slate-600">
                                  {eventCycleVies[selectedEvent.id].duration_hours
                                    ? `${eventCycleVies[selectedEvent.id].duration_hours}h`
                                    : 'Not defined'}
                                </p>
                              </div>
                              {eventCycleVies[selectedEvent.id].contrat_id && (
                                <div>
                                  <p className="text-sm font-medium text-slate-700">Linked contract</p>
                                  <p className="text-sm text-slate-600 font-mono">{eventCycleVies[selectedEvent.id].contrat_id}</p>
                                </div>
                              )}
                              {eventCycleVies[selectedEvent.id].sinistre_numero && (
                                <div>
                                  <p className="text-sm font-medium text-slate-700">Claim No.</p>
                                  <p className="text-sm text-slate-600 font-mono">{eventCycleVies[selectedEvent.id].sinistre_numero}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Cycle metadata */}
                        <div>
                          <h3 className="text-sm font-medium text-slate-700 mb-3">Management information</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-3 rounded border">
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-blue-600" />
                                <div>
                                  <p className="text-xs text-slate-500">Created on</p>
                                  <p className="text-sm font-medium">
                                    {new Date(eventCycleVies[selectedEvent.id].timestamp).toLocaleDateString('en-US')}
                                  </p>
                                </div>
                              </div>
                            </div>
                            {eventCycleVies[selectedEvent.id].metadata?.gestionnaire && (
                              <div className="bg-white p-3 rounded border">
                                <div className="flex items-center space-x-2">
                                  <Eye className="w-4 h-4 text-green-600" />
                                  <div>
                                    <p className="text-xs text-slate-500">Manager</p>
                                    <p className="text-sm font-medium">{eventCycleVies[selectedEvent.id].metadata.gestionnaire}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                            {eventCycleVies[selectedEvent.id].metadata?.urgence_niveau && (
                              <div className="bg-white p-3 rounded border">
                                <div className="flex items-center space-x-2">
                                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                                  <div>
                                    <p className="text-xs text-slate-500">Urgency level</p>
                                    <Badge variant={
                                      eventCycleVies[selectedEvent.id].metadata.urgence_niveau === 'critique' ? 'destructive' :
                                      eventCycleVies[selectedEvent.id].metadata.urgence_niveau === 'urgent' ? 'default' : 'outline'
                                    } className="capitalize">
                                      {eventCycleVies[selectedEvent.id].metadata.urgence_niveau}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            )}
                            {eventCycleVies[selectedEvent.id].metadata?.montant_estime && (
                              <div className="bg-white p-3 rounded border">
                                <div className="flex items-center space-x-2">
                                  <TrendingUp className="w-4 h-4 text-green-600" />
                                  <div>
                                    <p className="text-xs text-slate-500">Estimated amount</p>
                                    <p className="text-sm font-medium">{eventCycleVies[selectedEvent.id].metadata.montant_estime}€</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Required actions */}
                        {eventCycleVies[selectedEvent.id].metadata?.actions_requises && (
                          <div>
                            <h3 className="text-sm font-medium text-slate-700 mb-3">Required actions</h3>
                            <div className="space-y-2">
                              {eventCycleVies[selectedEvent.id].metadata.actions_requises.map((action: string, index: number) => (
                                <div key={index} className="flex items-center space-x-2 p-2 bg-orange-50 border border-orange-200 rounded">
                                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                  <span className="text-sm text-slate-700">{action}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Associated documents */}
                        {eventCycleVies[selectedEvent.id].metadata?.documents_associes && (
                          <div>
                            <h3 className="text-sm font-medium text-slate-700 mb-3">Associated documents</h3>
                            <div className="space-y-2">
                              {eventCycleVies[selectedEvent.id].metadata.documents_associes.map((doc: string, index: number) => (
                                <div key={index} className="flex items-center space-x-2 p-2 bg-white border border-slate-200 rounded">
                                  <FileText className="w-4 h-4 text-slate-400" />
                                  <span className="text-sm text-slate-600">{doc}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Next stage */}
                        {eventCycleVies[selectedEvent.id].next_stage && (
                          <div>
                            <h3 className="text-sm font-medium text-slate-700 mb-3">Next stage</h3>
                            <div className="bg-blue-50 p-3 rounded border border-blue-200">
                              <div className="flex items-center space-x-2">
                                <ArrowRight className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-800 capitalize">
                                  {eventCycleVies[selectedEvent.id].next_stage}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-slate-500">
                        <GitBranch className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No lifecycle associated with this event</p>
                        <p className="text-xs mt-1">
                          The event may not yet be linked to a specific lifecycle
                        </p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="workflow" className="space-y-4">
                    <div className="space-y-4">
                      {/* Architecture Flow Visualization */}
                      <div>
                        <div className="bg-slate-50 p-4 rounded-lg">
                          {/* Main Flow */}
                          <div className="space-y-3">
                            <div className="text-xs text-slate-500 mb-2">Main flow:</div>
                            <div className="flex items-center space-x-2 text-sm flex-wrap">
                              <Badge variant={selectedEvent ? "default" : "secondary"}>
                                <Zap className="w-3 h-3 mr-1" />
                                Event
                              </Badge>
                              <ArrowRight className="w-4 h-4 text-slate-400" />
                              <Badge variant={eventCycleVies[selectedEvent.id] ? "default" : "secondary"}>
                                <GitBranch className="w-3 h-3 mr-1" />
                                Lifecycle
                              </Badge>
                              <ArrowRight className="w-4 h-4 text-slate-400" />
                              <Badge variant="default">
                                <Eye className="w-3 h-3 mr-1" />
                                History
                              </Badge>
                              <ArrowRight className="w-4 h-4 text-slate-400" />
                              <Badge variant={eventAlerts[selectedEvent.id]?.length > 0 ? "destructive" : "outline"}>
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Alert
                              </Badge>
                              <ArrowRight className="w-4 h-4 text-slate-400" />
                              <Badge variant="outline">
                                <FileText className="w-3 h-3 mr-1" />
                                Case
                              </Badge>
                            </div>
                            
                            {/* Secondary Flows */}
                            <div className="mt-4 space-y-2">
                              <div className="text-xs text-slate-500">Parallel flows:</div>
                              <div className="grid grid-cols-1 gap-2 text-xs">
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline" className="text-xs">
                                    <BarChart3 className="w-3 h-3 mr-1" />
                                    KPIs/ROI
                                  </Badge>
                                  <span className="text-slate-400">←</span>
                                  <span className="text-slate-600">Calculated from History & Alerts</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline" className="text-xs">
                                    <BookOpen className="w-3 h-3 mr-1" />
                                    Audit
                                  </Badge>
                                  <span className="text-slate-400">↔</span>
                                  <span className="text-slate-600">Bidirectional with History</span>
                                </div>
                              </div>
                            </div>

                            {/* Risk Impact Flow */}
                            <div className="mt-4 p-3 bg-white rounded border border-orange-200">
                              <div className="text-xs text-slate-500 mb-2">Risk impact (if alert confirmed):</div>
                              <div className="flex items-center space-x-2 text-xs">
                                <Badge variant="outline">
                                  <Target className="w-3 h-3 mr-1" />
                                  Customer/Prospect
                                </Badge>
                                <span className="text-slate-400">↔</span>
                                <Badge variant="outline">Risk Profile</Badge>
                                <span className="text-slate-400">←</span>
                                <Badge variant="destructive" className="text-xs">Alert confirmed</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Fraud Context */}
                      {selectedEvent.type === 'document_upload' && (
                        <div>
                          <h3 className="text-sm font-medium text-slate-700 mb-3">Detection context</h3>
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2 text-sm">
                                <Building2 className="w-4 h-4 text-blue-600" />
                                <span className="font-medium text-blue-800">Type:</span>
                                <Badge variant="outline" className="text-xs">
                                  {selectedEvent.data?.metadata?.detectionCity || 'Documentary'}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-2 text-sm">
                                <MapPin className="w-4 h-4 text-blue-600" />
                                <span className="font-medium text-blue-800">Family:</span>
                                <Badge variant="outline" className="text-xs">
                                  {selectedEvent.data?.metadata?.businessDistrict || eventCycleVies[selectedEvent.id]?.metadata?.business_line || 'Auto/Health/Home'}
                                </Badge>
                              </div>
                              <div className="text-xs text-blue-700 mt-2">
                                Routing and context are automatically applied according to document type and business line
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Fraud Catalog Classification */}
                      {eventAlerts[selectedEvent.id] && eventAlerts[selectedEvent.id].length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-slate-700 mb-3">Fraud catalog</h3>
                          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                            <div className="space-y-3">
                              <div className="text-xs text-slate-500 mb-2">Automatic classification:</div>
                              {eventAlerts[selectedEvent.id].map((alert) => (
                                <div key={alert.id} className="bg-white p-3 rounded border">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <p className="font-medium text-slate-700">Detected typology:</p>
                                      <Badge variant="outline" className="mt-1">
                                        {alert.fraud_type || alert.type || 'Suspicious document'}
                                      </Badge>
                                    </div>
                                    <div>
                                      <p className="font-medium text-slate-700">Fraud nature:</p>
                                      <Badge variant="outline" className="mt-1">
                                        {alert.metadata?.fraudTypes?.[0] || 'Documentary'}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="mt-3 text-xs text-slate-600">
                                    <span className="font-medium">Suggested playbook:</span>
                                    {alert.severity === 'critical' ? ' In-depth investigation + technical evidence' :
                                     alert.severity === 'high' ? ' Manual verification + counter-expertise' :
                                     ' Standard compliance analysis'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {eventAlerts[selectedEvent.id] && eventAlerts[selectedEvent.id].length > 0 ? (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-medium text-slate-700">
                              Generated alerts ({eventAlerts[selectedEvent.id].length})
                            </h3>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate('/alerts')}
                              className="text-xs"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View all alerts
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {eventAlerts[selectedEvent.id].map((alert) => (
                              <div
                                key={alert.id}
                                className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                                onClick={() => navigate(`/alerts?highlight=${alert.id}`)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <LinkIcon className="w-3 h-3 text-slate-400" />
                                    <span className="text-sm font-medium">{alert.reference}</span>
                                    <Badge 
                                      variant="outline"
                                      className={`text-xs ${
                                        alert.severity === 'critical' ? 'bg-red-50 text-red-700 border-red-200' :
                                        alert.severity === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                        alert.severity === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                        'bg-green-50 text-green-700 border-green-200'
                                      }`}
                                    >
                                      {alert.severity}
                                    </Badge>
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    Score: {alert.score}
                                  </div>
                                </div>
                                <div className="mt-1 text-xs text-slate-600">
                                  {alert.fraud_city_source} • {alert.business_district} • {alert.status}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6 text-slate-500">
                          <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No alerts generated for this event</p>
                          <p className="text-xs mt-1">
                            {selectedEvent.status === 'pending' ? 'The event has not yet been processed' :
                             'This event did not trigger any alerts'}
                          </p>
                        </div>
                      )}

                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-start space-x-2">
                          <Activity className="w-4 h-4 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-800">Event-Driven Workflow</p>
                            <p className="text-xs text-blue-700 mt-1">
                              Events are the source of truth that trigger the processing chain.
                              Each event can generate one or more alerts according to detection rules.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Governance & KPIs */}
                      <div>
                        <h3 className="text-sm font-medium text-slate-700 mb-3">Governance & Calculated KPIs</h3>
                        <div className="space-y-3">
                          {/* Event-based KPIs */}
                          <div className="bg-green-50 p-3 rounded border border-green-200">
                            <div className="text-xs text-green-700 font-medium mb-2">KPIs derived from this event:</div>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div className="flex justify-between">
                                <span>Processing time:</span>
                                <span className="font-mono">{stats?.average_processing_time_ms || 450}ms</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Alert generation rate:</span>
                                <span className="font-mono">
                                  {eventAlerts[selectedEvent.id] ?
                                    `${((eventAlerts[selectedEvent.id].length / 1) * 100).toFixed(0)}%` : '0%'}
                                </span>
                              </div>
                              {eventCycleVies[selectedEvent.id] && (
                                <>
                                  <div className="flex justify-between">
                                    <span>Cycle duration:</span>
                                    <span className="font-mono">
                                      {eventCycleVies[selectedEvent.id].duration_hours || 'N/A'}h
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Estimated amount:</span>
                                    <span className="font-mono">
                                      {eventCycleVies[selectedEvent.id].metadata?.montant_estime?.toLocaleString() || 'N/A'}€
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                          
                          {/* Rules and Thresholds */}
                          <div className="bg-purple-50 p-3 rounded border border-purple-200">
                            <div className="text-xs text-purple-700 font-medium mb-2">Applied rules:</div>
                            <div className="space-y-1 text-xs text-purple-600">
                              <div>• Fraud detection threshold: Score &gt; 50</div>
                              <div>• Event processing SLA: &lt; 2 min</div>
                              <div>• Automatic escalation if: Criticality = High + Unassigned &gt; 1h</div>
                              {eventCycleVies[selectedEvent.id]?.metadata?.urgence_niveau === 'critique' && (
                                <div>• Manual validation required for stage: {eventCycleVies[selectedEvent.id].stage}</div>
                              )}
                            </div>
                          </div>

                          {/* Audit Trail Impact */}
                          <div className="bg-gray-50 p-3 rounded border border-gray-200">
                            <div className="text-xs text-gray-700 font-medium mb-2">Audit & compliance impact:</div>
                            <div className="space-y-1 text-xs text-gray-600">
                              <div>✓ Full traceability maintained</div>
                              <div>✓ Bidirectional history with lifecycle</div>
                              <div>✓ GDPR compliance: {selectedEvent.assure_id ? 'Personal data linked' : 'Anonymous data'}</div>
                              {eventAlerts[selectedEvent.id]?.length > 0 && (
                                <div>⚠ Generated alerts require investigation within 24h</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="data">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-slate-700 mb-2">Event data</p>
                        <pre className="bg-slate-50 rounded-lg p-3 text-xs overflow-auto max-h-64">
                          {JSON.stringify(selectedEvent.data, null, 2)}
                        </pre>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-slate-700 mb-2">Complete event</p>
                        <pre className="bg-slate-50 rounded-lg p-3 text-xs overflow-auto max-h-32">
                          {JSON.stringify(selectedEvent, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="timeline">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium">Event created</p>
                          <p className="text-xs text-slate-500">
                            {new Date(selectedEvent.timestamp).toLocaleString('en-US')}
                          </p>
                          <p className="text-xs text-slate-400">Source: {selectedEvent.source}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          selectedEvent.status === 'processed' ? 'bg-green-500' :
                          selectedEvent.status === 'error' ? 'bg-red-500' : 'bg-orange-500'
                        }`}></div>
                        <div>
                          <p className="text-sm font-medium">Current status: {selectedEvent.status}</p>
                          <p className="text-xs text-slate-500">
                            {selectedEvent.status === 'processed' && 'Event processed successfully'}
                            {selectedEvent.status === 'pending' && 'Awaiting processing'}
                            {selectedEvent.status === 'error' && 'Processing error'}
                          </p>
                        </div>
                      </div>

                      {selectedEvent.type === 'document_upload' && selectedEvent.data?.documentId && (
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-medium">Document processed</p>
                            <p className="text-xs text-slate-500">Document ID: {selectedEvent.data.documentId}</p>
                            <p className="text-xs text-slate-400">AI analysis in progress...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
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