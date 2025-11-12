import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Clock,
  CheckCircle,
  XCircle,
  PlayCircle,
  GitBranch,
  Zap,
  AlertTriangle,
  FileText,
  Eye,
  ArrowRight,
  BarChart3,
  BookOpen,
  Target,
  Building2,
  MapPin,
  Activity,
  ExternalLink,
  Link as LinkIcon
} from 'lucide-react';
import type { Event } from '@/lib/demoData';

export type EventDetailsProps = {
  event: Event;
  eventAssures?: { [eventId: string]: any };
  eventCycleVies?: { [eventId: string]: any };
  eventAlerts?: { [eventId: string]: any[] };
  stats?: {
    total_events: number;
    alerts_generated: number;
    average_processing_time_ms: number;
  };
  isProcessing?: boolean;
  onProcessEvent?: (eventId: string) => void;
  getStatusColor?: (status: string) => string;
};

const defaultGetStatusColor = (status: string) => {
  switch (status) {
    case 'processed': return 'bg-green-100 text-green-800 border-green-200';
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'error': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const EventDetails: React.FC<EventDetailsProps> = ({
  event,
  eventAssures = {},
  eventCycleVies = {},
  eventAlerts = {},
  stats,
  isProcessing = false,
  onProcessEvent,
  getStatusColor = defaultGetStatusColor
}) => {
  const navigate = useNavigate();

  return (
    <Card className="h-[calc(100vh-200px)]">
      <CardHeader className="flex-shrink-0">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{event.id}</CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              {event.type} • Created on {new Date(event.timestamp).toLocaleDateString('en-US')}
              {' '}at {new Date(event.timestamp).toLocaleTimeString('en-US')}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={`${getStatusColor(event.status)} flex items-center justify-center`} variant="outline">
              {event.status}
            </Badge>
            {/* {event.status === 'pending' && onProcessEvent && (
              <Button
                size="sm"
                onClick={() => onProcessEvent(event.id)}
                disabled={isProcessing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <PlayCircle className="w-4 h-4 mr-1" />
                Process
              </Button>
            )} */}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="overflow-y-auto max-h-[calc(100%-120px)]">
        <Tabs defaultValue="details" className="h-full">
          <div className="sticky top-0 bg-white z-10 pb-2">
            <TabsList>
              <TabsTrigger value="details" className="flex items-center space-x-2">
                <span>Details</span>
                {eventAssures[event.id] ? (
                  <Badge variant="secondary" className="text-xs flex items-center justify-center">
                    {eventAssures[event.id].prenom} {eventAssures[event.id].nom}
                  </Badge>
                ) : event.assure_id ? (
                  <Badge variant="outline" className="text-xs text-orange-500 flex items-center justify-center">
                    Customer {event.assure_id}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs text-red-500 flex items-center justify-center">
                    No linked customer
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="workflow" className="flex items-center space-x-2">
                <span>Workflow</span>
                {eventCycleVies[event.id] ? (
                  <Badge variant="outline" className="text-xs flex items-center justify-center">
                    {eventCycleVies[event.id].stage}
                    {eventCycleVies[event.id].type && ` - ${eventCycleVies[event.id].type}`}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs text-red-500 flex items-center justify-center">
                    Cycle not found
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-slate-700">Event type</p>
                <p className="text-sm text-slate-600">{event.type}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Source</p>
                <p className="text-sm text-slate-600">{event.source}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Identifier</p>
                <p className="text-sm text-slate-600 font-mono">{event.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Status</p>
                <div className="flex items-center space-x-2">
                  {event.status === 'processed' ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : event.status === 'error' ? (
                    <XCircle className="w-4 h-4 text-red-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-orange-500" />
                  )}
                  <span className="text-sm text-slate-600">{event.status}</span>
                </div>
              </div>
              {event.data?.userId && (
                <div>
                  <p className="text-sm font-medium text-slate-700">User</p>
                  <p className="text-sm text-slate-600">{event.data.userId}</p>
                </div>
              )}
              {event.data?.documentId && (
                <div>
                  <p className="text-sm font-medium text-slate-700">Document ID</p>
                  <p className="text-sm text-slate-600 font-mono">{event.data.documentId}</p>
                </div>
              )}
            </div>
            {eventAssures[event.id] ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-3">Customer Information</h3>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-700">Full name</p>
                        <p className="text-sm text-slate-600">
                          {eventAssures[event.id].civilite} {eventAssures[event.id].prenom} {eventAssures[event.id].nom}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">Client No.</p>
                        <p className="text-sm text-slate-600 font-mono">{eventAssures[event.id].numero_client}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">Email</p>
                        <p className="text-sm text-slate-600">{eventAssures[event.id].email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">Phone</p>
                        <p className="text-sm text-slate-600">{eventAssures[event.id].telephone}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">Date of birth</p>
                        <p className="text-sm text-slate-600">
                          {new Date(eventAssures[event.id].date_naissance).toLocaleDateString('en-US')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">Risk score</p>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${
                            eventAssures[event.id].score_risque >= 70 ? 'bg-red-500' :
                            eventAssures[event.id].score_risque >= 40 ? 'bg-orange-500' :
                            'bg-green-500'
                          }`}></div>
                          <span className="text-sm text-slate-600">{eventAssures[event.id].score_risque}/100</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-3">Address</h3>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-600">
                      {eventAssures[event.id].adresse.rue}<br/>
                      {eventAssures[event.id].adresse.code_postal} {eventAssures[event.id].adresse.ville}<br/>
                      {eventAssures[event.id].adresse.pays}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-3">Contracts</h3>
                  <div className="space-y-2">
                    {eventAssures[event.id].contrats.map((contrat: any) => (
                      <div key={contrat.id} className="border border-slate-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-700">{contrat.numero}</p>
                            <p className="text-xs text-slate-500">{contrat.type} • {contrat.prime_annuelle}€/an</p>
                          </div>
                          <Badge variant={contrat.statut === 'actif' ? 'default' : 'secondary'} className="flex items-center justify-center">
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
                    {eventAssures[event.id].historique_sinistres.map((sinistre: any) => (
                      <div key={sinistre.id} className="border border-slate-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-700">{sinistre.type}</p>
                            <p className="text-xs text-slate-500">
                              {new Date(sinistre.date).toLocaleDateString('en-US')} • {sinistre.montant}€
                            </p>
                          </div>
                          <Badge variant={sinistre.statut === 'en_cours' ? 'default' : 'secondary'} className="flex items-center justify-center">
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
            {event.status === 'processed' && (
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

            {event.status === 'error' && (
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
            {eventCycleVies[event.id] ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-3">Associated lifecycle</h3>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-700">Cycle ID</p>
                        <p className="text-sm text-slate-600 font-mono">{eventCycleVies[event.id].id}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">Current stage</p>
                        <Badge variant="default" className="capitalize flex items-center justify-center">
                          <GitBranch className="w-3 h-3 mr-1" />
                          {eventCycleVies[event.id].stage}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">Process type</p>
                        <Badge variant="outline" className="capitalize flex items-center justify-center">
                          {eventCycleVies[event.id].type}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">Estimated duration</p>
                        <p className="text-sm text-slate-600">
                          {eventCycleVies[event.id].duration_hours
                            ? `${eventCycleVies[event.id].duration_hours}h`
                            : 'Not defined'}
                        </p>
                      </div>
                      {eventCycleVies[event.id].contrat_id && (
                        <div>
                          <p className="text-sm font-medium text-slate-700">Linked contract</p>
                          <p className="text-sm text-slate-600 font-mono">{eventCycleVies[event.id].contrat_id}</p>
                        </div>
                      )}
                      {eventCycleVies[event.id].sinistre_numero && (
                        <div>
                          <p className="text-sm font-medium text-slate-700">Claim No.</p>
                          <p className="text-sm text-slate-600 font-mono">{eventCycleVies[event.id].sinistre_numero}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-3">Management information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded border">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-xs text-slate-500">Created on</p>
                          <p className="text-sm font-medium">
                            {new Date(eventCycleVies[event.id].timestamp).toLocaleDateString('en-US')}
                          </p>
                        </div>
                      </div>
                    </div>
                    {eventCycleVies[event.id].metadata?.gestionnaire && (
                      <div className="bg-white p-3 rounded border">
                        <div className="flex items-center space-x-2">
                          <Eye className="w-4 h-4 text-green-600" />
                          <div>
                            <p className="text-xs text-slate-500">Manager</p>
                            <p className="text-sm font-medium">{eventCycleVies[event.id].metadata.gestionnaire}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {eventCycleVies[event.id].metadata?.urgence_niveau && (
                      <div className="bg-white p-3 rounded border">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-orange-600" />
                          <div>
                            <p className="text-xs text-slate-500">Urgency level</p>
                            <Badge variant={
                              eventCycleVies[event.id].metadata.urgence_niveau === 'critique' ? 'destructive' :
                              eventCycleVies[event.id].metadata.urgence_niveau === 'urgent' ? 'default' : 'outline'
                            } className="capitalize flex items-center justify-center">
                              {eventCycleVies[event.id].metadata.urgence_niveau}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}
                    {eventCycleVies[event.id].metadata?.montant_estime && (
                      <div className="bg-white p-3 rounded border">
                        <div className="flex items-center space-x-2">
                          <Activity className="w-4 h-4 text-green-600" />
                          <div>
                            <p className="text-xs text-slate-500">Estimated amount</p>
                            <p className="text-sm font-medium">{eventCycleVies[event.id].metadata.montant_estime}€</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {eventCycleVies[event.id].metadata?.actions_requises && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-700 mb-3">Required actions</h3>
                    <div className="space-y-2">
                      {eventCycleVies[event.id].metadata.actions_requises.map((action: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2 p-2 bg-orange-50 border border-orange-200 rounded">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span className="text-sm text-slate-700">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {eventCycleVies[event.id].metadata?.documents_associes && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-700 mb-3">Associated documents</h3>
                    <div className="space-y-2">
                      {eventCycleVies[event.id].metadata.documents_associes.map((doc: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2 p-2 bg-white border border-slate-200 rounded">
                          <FileText className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-600">{doc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {eventCycleVies[event.id].next_stage && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-700 mb-3">Next stage</h3>
                    <div className="bg-blue-50 p-3 rounded border border-blue-200">
                      <div className="flex items-center space-x-2">
                        <ArrowRight className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800 capitalize">
                          {eventCycleVies[event.id].next_stage}
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
              <div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="space-y-3">
                    <div className="text-xs text-slate-500 mb-2">Main flow:</div>
                    <div className="flex items-center space-x-2 text-sm flex-wrap">
                      <Badge variant={event ? "default" : "secondary"} className="flex items-center justify-center">
                        <Zap className="w-3 h-3 mr-1" />
                        Event
                      </Badge>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                      <Badge variant={eventCycleVies[event.id] ? "default" : "secondary"} className="flex items-center justify-center">
                        <GitBranch className="w-3 h-3 mr-1" />
                        Lifecycle
                      </Badge>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                      <Badge variant="default" className="flex items-center justify-center">
                        <Eye className="w-3 h-3 mr-1" />
                        History
                      </Badge>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                      <Badge variant={eventAlerts[event.id]?.length > 0 ? "destructive" : "outline"} className="flex items-center justify-center">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Alert
                      </Badge>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                      <Badge variant="outline" className="flex items-center justify-center">
                        <FileText className="w-3 h-3 mr-1" />
                        Case
                      </Badge>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <div className="text-xs text-slate-500">Parallel flows:</div>
                      <div className="grid grid-cols-1 gap-2 text-xs">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs flex items-center justify-center">
                            <BarChart3 className="w-3 h-3 mr-1" />
                            KPIs/ROI
                          </Badge>
                          <span className="text-slate-400">←</span>
                          <span className="text-slate-600">Calculated from History & Alerts</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs flex items-center justify-center">
                            <BookOpen className="w-3 h-3 mr-1" />
                            Audit
                          </Badge>
                          <span className="text-slate-400">↔</span>
                          <span className="text-slate-600">Bidirectional with History</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-white rounded border border-orange-200">
                      <div className="text-xs text-slate-500 mb-2">Risk impact (if alert confirmed):</div>
                      <div className="flex items-center space-x-2 text-xs">
                        <Badge variant="outline" className="flex items-center justify-center">
                          <Target className="w-3 h-3 mr-1" />
                          Customer/Prospect
                        </Badge>
                        <span className="text-slate-400">↔</span>
                        <Badge variant="outline" className="flex items-center justify-center">Risk Profile</Badge>
                        <span className="text-slate-400">←</span>
                        <Badge variant="destructive" className="text-xs flex items-center justify-center">Alert confirmed</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {event.type === 'document_upload' && (
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-3">Detection context</h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-800">Type:</span>
                        <Badge variant="outline" className="text-xs flex items-center justify-center">
                          {event.data?.metadata?.detectionCity || 'Documentary'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-800">Family:</span>
                        <Badge variant="outline" className="text-xs flex items-center justify-center">
                          {event.data?.metadata?.businessDistrict || eventCycleVies[event.id]?.metadata?.business_line || 'Auto/Health/Home'}
                        </Badge>
                      </div>
                      <div className="text-xs text-blue-700 mt-2">
                        Routing and context are automatically applied according to document type and business line
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {eventAlerts[event.id] && eventAlerts[event.id].length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-3">Fraud catalog</h3>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="space-y-3">
                      <div className="text-xs text-slate-500 mb-2">Automatic classification:</div>
                      {eventAlerts[event.id].map((alert: any) => (
                        <div key={alert.id} className="bg-white p-3 rounded border">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-medium text-slate-700">Detected typology:</p>
                              <Badge variant="outline" className="mt-1 flex items-center justify-center">
                                {alert.fraud_type || alert.type || 'Suspicious document'}
                              </Badge>
                            </div>
                            <div>
                              <p className="font-medium text-slate-700">Fraud nature:</p>
                              <Badge variant="outline" className="mt-1 flex items-center justify-center">
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

              {eventAlerts[event.id] && eventAlerts[event.id].length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-slate-700">
                      Generated alerts ({eventAlerts[event.id].length})
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
                    {eventAlerts[event.id].map((alert: any) => (
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
                              className={`text-xs flex items-center justify-center ${
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
                    {event.status === 'pending' ? 'The event has not yet been processed' :
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
              
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">Governance & Calculated KPIs</h3>
                <div className="space-y-3">
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
                          {eventAlerts[event.id] ?
                            `${((eventAlerts[event.id].length / 1) * 100).toFixed(0)}%` : '0%'}
                        </span>
                      </div>
                      {eventCycleVies[event.id] && (
                        <>
                          <div className="flex justify-between">
                            <span>Cycle duration:</span>
                            <span className="font-mono">
                              {eventCycleVies[event.id].duration_hours || 'N/A'}h
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Estimated amount:</span>
                            <span className="font-mono">
                              {eventCycleVies[event.id].metadata?.montant_estime?.toLocaleString() || 'N/A'}€
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-3 rounded border border-purple-200">
                    <div className="text-xs text-purple-700 font-medium mb-2">Applied rules:</div>
                    <div className="space-y-1 text-xs text-purple-600">
                      <div>• Fraud detection threshold: Score &gt; 50</div>
                      <div>• Event processing SLA: &lt; 2 min</div>
                      <div>• Automatic escalation if: Criticality = High + Unassigned &gt; 1h</div>
                      {eventCycleVies[event.id]?.metadata?.urgence_niveau === 'critique' && (
                        <div>• Manual validation required for stage: {eventCycleVies[event.id].stage}</div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    <div className="text-xs text-gray-700 font-medium mb-2">Audit & compliance impact:</div>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div>✓ Full traceability maintained</div>
                      <div>✓ Bidirectional history with lifecycle</div>
                      <div>✓ GDPR compliance: {event.assure_id ? 'Personal data linked' : 'Anonymous data'}</div>
                      {eventAlerts[event.id]?.length > 0 && (
                        <div>⚠ Generated alerts require investigation within 24h</div>
                      )}
                    </div>
                  </div>
                </div>
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
                    {new Date(event.timestamp).toLocaleString('en-US')}
                  </p>
                  <p className="text-xs text-slate-400">Source: {event.source}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  event.status === 'processed' ? 'bg-green-500' :
                  event.status === 'error' ? 'bg-red-500' : 'bg-orange-500'
                }`}></div>
                <div>
                  <p className="text-sm font-medium">Current status: {event.status}</p>
                  <p className="text-xs text-slate-500">
                    {event.status === 'processed' && 'Event processed successfully'}
                    {event.status === 'pending' && 'Awaiting processing'}
                    {event.status === 'error' && 'Processing error'}
                  </p>
                </div>
              </div>

              {event.type === 'document_upload' && event.data?.documentId && (
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Document processed</p>
                    <p className="text-xs text-slate-500">Document ID: {event.data.documentId}</p>
                    <p className="text-xs text-slate-400">AI analysis in progress...</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EventDetails;

