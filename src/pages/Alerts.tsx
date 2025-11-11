import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAlerts } from '@/contexts/AlertContext';
import { useAuth } from '@/hooks/useAuth';
import { useCases } from '@/contexts/CaseContext';
import { mockServices } from '@/lib/mockServices';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import HeaderKPI from '@/components/HeaderKPI';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TeamTransferModal } from '@/components/TeamTransferModal';
import { Alert, AlertFilters } from '@/types/alert.types';
import {
  Bell, Clock, AlertTriangle, CheckCircle, XCircle, User, Search,
  Activity, Folder, ArrowLeft, Link as LinkIcon, ExternalLink
} from 'lucide-react';

// Helper Functions
const getSeverityColor = (severity: string) => {
  const colors: Record<string, string> = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200'
  };
  return colors[severity] || 'bg-gray-100 text-gray-800';
};

const getUrgencyIndicator = (alert: Alert) => {
  const now = new Date();
  const created = new Date((alert as any).created_at || alert.createdAt);
  const hoursOld = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
  const slaThresholds: Record<string, number> = { critical: 2, high: 4, medium: 8, low: 24 };
  const threshold = slaThresholds[alert.severity] || 24;
  const urgencyLevel = hoursOld / threshold;

  if (urgencyLevel > 1) return { level: 'overdue', color: 'text-red-600', pulse: true };
  if (urgencyLevel > 0.8) return { level: 'urgent', color: 'text-orange-600', pulse: true };
  if (urgencyLevel > 0.6) return { level: 'approaching', color: 'text-yellow-600', pulse: false };
  return { level: 'normal', color: 'text-green-600', pulse: false };
};

const getStatusIcon = (status: string) => {
  const icons: Record<string, JSX.Element> = {
    new: <Clock className="w-4 h-4" />,
    pending: <Clock className="w-4 h-4" />,
    assigned: <User className="w-4 h-4" />,
    investigating: <Activity className="w-4 h-4" />,
    in_review: <Activity className="w-4 h-4" />,
    qualified: <CheckCircle className="w-4 h-4" />,
    closed: <XCircle className="w-4 h-4" />,
    rejected: <XCircle className="w-4 h-4" />
  };
  return icons[status] || <AlertTriangle className="w-4 h-4" />;
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    new: 'Pending', pending: 'Pending', assigned: 'Assigned',
    investigating: 'In progress', in_review: 'In progress',
    qualified: 'Qualified', closed: 'Closed', rejected: 'Rejected'
  };
  return labels[status] || status;
};

// Components
const AlertCard = ({ alert, isSelected, onClick, alertEvents, alertAssures, alertCycleVies, navigate }: any) => {
  const urgency = getUrgencyIndicator(alert);
  const bgClass = isSelected ? 'border-blue-500 bg-blue-50' :
    urgency.level === 'overdue' ? 'border-red-200 bg-red-50' :
      urgency.level === 'urgent' ? 'border-orange-200 bg-orange-50' :
        'border-slate-200 hover:bg-slate-50';

  return (
    <div onClick={onClick} className={`p-4 rounded-lg border cursor-pointer transition-all ${bgClass} ${urgency.pulse ? 'animate-pulse' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <div className="flex items-center space-x-1">
              {getStatusIcon(alert.status)}
              {urgency.level !== 'normal' && (
                <div className={`w-2 h-2 rounded-full ${
                  urgency.level === 'overdue' ? 'bg-red-500' :
                    urgency.level === 'urgent' ? 'bg-orange-500' : 'bg-yellow-500'
                }`} />
              )}
            </div>
            <span className="font-medium text-sm">{alert.id}</span>
            <Badge className={getSeverityColor(alert.severity)} variant="outline">{alert.severity}</Badge>
          </div>
          <p className="text-sm text-slate-600 mb-1">{alert.metadata.documentType} - {alert.metadata.sinisterNumber}</p>
          {alertEvents[alert.id] && (
            <div className="flex items-center space-x-2 mb-2 text-xs">
              <LinkIcon className="w-3 h-3 text-slate-400" />
              <span className="text-slate-500">Source:</span>
              <button onClick={(e) => { e.stopPropagation(); navigate(`/events?highlight=${alertEvents[alert.id].id}`); }}
                className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                {alertEvents[alert.id].type} ({alertEvents[alert.id].id})
              </button>
              <ArrowLeft className="w-3 h-3 text-slate-400" />
            </div>
          )}
          {(alertAssures[alert.id] || alertCycleVies[alert.id]) && (
            <div className="flex flex-wrap gap-1 mb-1">
              {alertAssures[alert.id] && (
                <Badge variant="outline" className="text-xs bg-blue-50">
                  <User className="w-3 h-3 mr-1" />
                  {alertAssures[alert.id].prenom} {alertAssures[alert.id].nom}
                </Badge>
              )}
              {alertCycleVies[alert.id] && (
                <Badge variant="outline" className="text-xs bg-green-50">
                  {alertCycleVies[alert.id].stage} - {alertCycleVies[alert.id].type}
                </Badge>
              )}
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <span>Score: {alert.score}%</span>
              {alert.assigned_to && <><span>•</span><span>{alert.assigned_to}</span></>}
            </div>
            <div className="flex items-center space-x-2">
              {urgency.level !== 'normal' && (
                <span className={`text-xs font-medium ${urgency.color}`}>
                  {urgency.level === 'overdue' ? 'PAST SLA' : urgency.level === 'urgent' ? 'URGENT' : 'WARNING'}
                </span>
              )}
              <span className="text-xs text-slate-500">
                {new Date(alert.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActionBar = ({ selectedAlert, onQualify, onCreateCase, onAssign, user }: any) => {
  if (!selectedAlert) return null;

  const actions = [
    { key: 'fraud_confirmed', label: 'Fraud', icon: XCircle, color: 'bg-red-600 hover:bg-red-700', disabled: selectedAlert.qualification === 'fraud_confirmed' },
    { key: 'false_positive', label: 'False positive', icon: CheckCircle, color: '', variant: 'outline', disabled: selectedAlert.qualification === 'false_positive' },
    { key: 'requires_investigation', label: 'Investigation', icon: AlertTriangle, color: 'bg-yellow-600 hover:bg-yellow-700', disabled: selectedAlert.qualification === 'requires_investigation' },
    { key: 'createCase', label: 'Create case', icon: Folder, color: 'bg-purple-600 hover:bg-purple-700' }
  ];

  return (
    <div className="bg-white border rounded-lg p-3 shadow-sm mb-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-700 whitespace-nowrap">Actions:</span>
          {actions.map(({ key, label, icon: Icon, color, variant, disabled }) => (
            <Button key={key} onClick={() => key === 'createCase' ? onCreateCase(selectedAlert.id) : onQualify(selectedAlert.id, key)}
              size="sm" variant={variant} className={`text-xs px-2 py-1 ${color}`} disabled={disabled}>
              <Icon className="w-3 h-3 mr-1" />
              {label}
            </Button>
          ))}
        </div>
        {user?.role === 'superviseur' && (
          <Select value={selectedAlert.assigned_to || ""} onValueChange={(value) => onAssign([selectedAlert.id], value)}>
            <SelectTrigger className="w-32 h-7 text-xs">
              <SelectValue placeholder="Assign to..." />
            </SelectTrigger>
            <SelectContent>
              {['V. Dubois', 'M. Bernard', 'S. Martin', 'L. Petit'].map(name => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
};

const AlertDetails = ({ alert, alertEvents, alertCycleVies, alertAssures, navigate }: any) => {
  if (!alert) return null;

  const urgency = getUrgencyIndicator(alert);
  const now = new Date();
  const created = new Date(alert.created_at);
  const hoursOld = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
  const slaThresholds: Record<string, number> = { critical: 2, high: 4, medium: 8, low: 24 };
  const threshold = slaThresholds[alert.severity] || 24;
  const progress = Math.min((hoursOld / threshold) * 100, 100);

  return (
    <div className="space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-3">
                <CardTitle className="text-2xl">{alert.id}</CardTitle>
                <Badge className={getSeverityColor(alert.severity)} variant="outline">{alert.severity}</Badge>
                {urgency.level !== 'normal' && (
                  <Badge variant="outline" className={
                    urgency.level === 'overdue' ? 'border-red-500 text-red-700' :
                      urgency.level === 'urgent' ? 'border-orange-500 text-orange-700' :
                        'border-yellow-500 text-yellow-700'
                  }>
                    {urgency.level === 'overdue' ? 'PAST SLA' : urgency.level === 'urgent' ? 'URGENT' : 'WARNING'}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-600 mt-2">
                Created on {new Date(alert.created_at).toLocaleDateString('en-US')} at {new Date(alert.created_at).toLocaleTimeString('en-US')}
              </p>
              <div className="flex items-center space-x-6 mt-3 text-sm text-slate-500">
                <span>Score: <span className="font-medium">{alert.score}%</span></span>
                <span>Confidence: <span className="font-medium">{(alert.metadata?.confidence ? (alert.metadata.confidence * 100).toFixed(1) : 'N/A')}%</span></span>
                {alert.assigned_to && <span>Assigned to: <span className="font-medium">{alert.assigned_to}</span></span>}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(alert.status)}
              <span className="font-medium">{getStatusLabel(alert.status)}</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Details */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Alert Details</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: 'Source', value: alert.source },
              { label: 'Module', value: alert.sourceModule },
              { label: 'Detection Type', value: alert.detection_module },
              { label: 'Claim Number', value: alert.metadata.sinisterNumber || 'N/A' },
              { label: 'Amount', value: alert.metadata.amount ? `${alert.metadata.amount}€` : 'N/A' },
              { label: 'Document Type', value: alert.metadata.documentType || 'N/A' }
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-sm font-medium text-slate-700 mb-1">{label}</p>
                <p className="text-sm text-slate-600">{value}</p>
              </div>
            ))}
          </div>

          {/* Related Data */}
          {(alertEvents[alert.id] || alertCycleVies[alert.id] || alertAssures[alert.id]) && (
            <div className="mt-6 space-y-4">
              {alertEvents[alert.id] && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-3">Source Event</p>
                  <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{alertEvents[alert.id].type}</Badge>
                        <span className="text-sm text-slate-600">{alertEvents[alert.id].id}</span>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => navigate(`/events?highlight=${alertEvents[alert.id].id}`)}>
                        <ExternalLink className="w-3 h-3 mr-1" />View event
                      </Button>
                    </div>
                    <div className="text-xs text-slate-500">
                      Source: {alertEvents[alert.id].source} • Created on: {new Date(alertEvents[alert.id].timestamp).toLocaleString('en-US')}
                    </div>
                  </div>
                </div>
              )}

              {alertCycleVies[alert.id] && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-3">Lifecycle</p>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="default" className="capitalize">{alertCycleVies[alert.id].stage}</Badge>
                        <Badge variant="outline" className="capitalize">{alertCycleVies[alert.id].type}</Badge>
                      </div>
                      {alertCycleVies[alert.id].metadata?.urgence_niveau && (
                        <Badge variant={alertCycleVies[alert.id].metadata.urgence_niveau === 'critique' ? 'destructive' :
                          alertCycleVies[alert.id].metadata.urgence_niveau === 'urgent' ? 'default' : 'outline'}>
                          {alertCycleVies[alert.id].metadata.urgence_niveau}
                        </Badge>
                      )}
                    </div>
                    {alertCycleVies[alert.id].metadata?.gestionnaire && (
                      <p className="text-sm text-slate-600">Manager: {alertCycleVies[alert.id].metadata.gestionnaire}</p>
                    )}
                    {alertCycleVies[alert.id].metadata?.montant_estime && (
                      <p className="text-sm text-slate-600">Estimated amount: {alertCycleVies[alert.id].metadata.montant_estime}€</p>
                    )}
                  </div>
                </div>
              )}

              {alertAssures[alert.id] && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-3">Related Insured</p>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{alertAssures[alert.id].civilite} {alertAssures[alert.id].prenom} {alertAssures[alert.id].nom}</p>
                        <p className="text-sm text-slate-600">Client No: {alertAssures[alert.id].numero_client}</p>
                        <p className="text-sm text-slate-600">Risk score: {alertAssures[alert.id].score_risque}/100</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => navigate(`/assures/${alertAssures[alert.id].id}`)}>
                        <User className="w-3 h-3 mr-1" />Insured profile
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {alert.metadata.fraudTypes && (
            <div className="mt-6">
              <p className="text-sm font-medium text-slate-700 mb-3">Detected Fraud Types</p>
              <div className="flex flex-wrap gap-2">
                {alert.metadata.fraudTypes.map((type: string, idx: number) => (
                  <Badge key={idx} variant="secondary" className="text-xs">{type}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SLA Timing */}
      <Card>
        <CardHeader><CardTitle className="text-lg">SLA & Timing</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              <div><p className="text-sm font-medium text-slate-700 mb-1">Elapsed Time</p><p className="text-2xl font-bold">{hoursOld.toFixed(1)}h</p></div>
              <div><p className="text-sm font-medium text-slate-700 mb-1">SLA {alert.severity}</p><p className="text-2xl font-bold">{threshold}h max</p></div>
              <div><p className="text-sm font-medium text-slate-700 mb-1">SLA Progress</p><p className={`text-2xl font-bold ${urgency.color}`}>{progress.toFixed(0)}%</p></div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div className={`h-4 rounded-full transition-all ${
                urgency.level === 'overdue' ? 'bg-red-500' :
                  urgency.level === 'urgent' ? 'bg-orange-500' :
                    urgency.level === 'approaching' ? 'bg-yellow-500' : 'bg-green-500'
              }`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
            </div>
            <div className={`p-4 rounded-lg ${
              urgency.level === 'overdue' ? 'bg-red-50 border border-red-200' :
                urgency.level === 'urgent' ? 'bg-orange-50 border border-orange-200' :
                  urgency.level === 'approaching' ? 'bg-yellow-50 border border-yellow-200' :
                    'bg-green-50 border border-green-200'
            }`}>
              <div className="flex items-center space-x-2">
                <Clock className={`w-5 h-5 ${urgency.color}`} />
                <span className={`font-medium ${urgency.color}`}>
                  {urgency.level === 'overdue' ? 'Alert past SLA - Immediate action required' :
                    urgency.level === 'urgent' ? 'SLA soon to be exceeded - Urgent processing' :
                      urgency.level === 'approaching' ? 'Warning - SLA approaching' :
                        'On time - SLA respected'}
                </span>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-medium mb-3">Timeline</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Creation</span>
                  <span>{created.toLocaleString('en-US')}</span>
                </div>
                {alert.assigned_to && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Assignment</span>
                    <span>Assigned to {alert.assigned_to}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium">SLA Deadline</span>
                  <span className={urgency.level === 'overdue' ? 'text-red-600 font-bold' : 'font-medium'}>
                    {new Date(created.getTime() + threshold * 60 * 60 * 1000).toLocaleString('en-US')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Detailed Analysis</CardTitle></CardHeader>
        <CardContent>
          {alert.metadata.technicalEvidence && alert.metadata.technicalEvidence.length > 0 ? (
            <div className="space-y-4">
              {alert.metadata.technicalEvidence.map((evidence: any, idx: number) => {
                const severityColor = evidence.severity === 'fail' ? 'bg-red-50 border-red-200 text-red-900' :
                  evidence.severity === 'warn' ? 'bg-yellow-50 border-yellow-200 text-yellow-900' :
                    'bg-blue-50 border-blue-200 text-blue-900';
                const severityIcon = evidence.severity === 'fail' ? <XCircle className="w-5 h-5 text-red-600" /> :
                  evidence.severity === 'warn' ? <AlertTriangle className="w-5 h-5 text-yellow-600" /> :
                    <Activity className="w-5 h-5 text-blue-600" />;
                const severityLabel = evidence.severity === 'fail' ? 'Failed' : evidence.severity === 'warn' ? 'Warning' : 'Info';

                return (
                  <div key={idx} className={`p-4 border rounded-lg ${severityColor}`}>
                    <div className="flex items-start space-x-3">
                      {severityIcon}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className={`text-xs ${
                              evidence.severity === 'fail' ? 'border-red-600 text-red-700' :
                                evidence.severity === 'warn' ? 'border-yellow-600 text-yellow-700' :
                                  'border-blue-600 text-blue-700'
                            }`}>{severityLabel}</Badge>
                            <code className="text-xs font-mono bg-white/60 px-2 py-1 rounded">{evidence.code}</code>
                          </div>
                          <div className="text-xs font-medium">Confidence: {Math.round(evidence.confidence * 100)}%</div>
                        </div>
                        <p className="text-sm leading-relaxed">{evidence.message}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="mt-6 pt-4 border-t">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { count: alert.metadata.technicalEvidence.filter((e: any) => e.severity === 'fail').length, label: 'Critical anomalies', color: 'text-red-600' },
                    { count: alert.metadata.technicalEvidence.filter((e: any) => e.severity === 'warn').length, label: 'Warnings', color: 'text-yellow-600' },
                    { count: alert.metadata.technicalEvidence.filter((e: any) => e.severity === 'info').length, label: 'Information', color: 'text-blue-600' }
                  ].map(({ count, label, color }) => (
                    <div key={label} className="text-center">
                      <p className={`text-2xl font-bold ${color}`}>{count}</p>
                      <p className="text-xs text-gray-600">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-lg p-8 text-center">
              <Activity className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 text-lg mb-2">No detailed technical analysis available</p>
              <p className="text-slate-500 text-sm">Technical details will appear here during in-depth analysis.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Main Component
const Alerts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { alerts, selectedAlert, stats, loadAlerts, selectAlert, assignAlerts, qualifyAlert } = useAlerts();
  const { createCase } = useCases();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterAssignment, setFilterAssignment] = useState('all');
  const [sortBy, setSortBy] = useState<'priority' | 'age' | 'score'>('priority');
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [alertEvents, setAlertEvents] = useState<Record<string, any>>({});
  const [alertCycleVies, setAlertCycleVies] = useState<Record<string, any>>({});
  const [alertAssures, setAlertAssures] = useState<Record<string, any>>({});
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferAlert, setTransferAlert] = useState<Alert | null>(null);

  const navigationState = location.state as { newAlertId?: string } | null;

  // Build filters
  const filters = useMemo(() => {
    const filterValues: AlertFilters = {};
    if (filterStatus !== 'all') filterValues.status = [filterStatus as any];
    if (filterSeverity !== 'all') filterValues.severity = [filterSeverity as any];
    if (filterAssignment === 'me') filterValues.assignedTo = user?.name;
    if (filterAssignment === 'unassigned') filterValues.unassigned = true;
    if (searchTerm) filterValues.searchTerm = searchTerm;
    return filterValues;
  }, [filterStatus, filterSeverity, filterAssignment, searchTerm, user?.name]);

  // Load alerts
  useEffect(() => {
    if (!hasLoadedOnce || Object.keys(filters).length > 0 || searchTerm) {
      loadAlerts(filters);
      if (!hasLoadedOnce && filterStatus === 'all' && !searchTerm) setHasLoadedOnce(true);
    }
  }, [filters, loadAlerts, hasLoadedOnce, searchTerm, filterStatus]);

  // Auto-select from navigation
  useEffect(() => {
    if (navigationState?.newAlertId && alerts.length > 0) {
      const newAlert = alerts.find(a => a.id === navigationState.newAlertId);
      if (newAlert) {
        selectAlert(newAlert.id);
        window.history.replaceState(null, '', '/alerts');
      }
    }
  }, [alerts, navigationState, selectAlert]);

  // Load related data
  useEffect(() => {
    const loadRelatedData = async () => {
      if (alerts.length === 0) return;
      const eventsMap: Record<string, any> = {};
      const cycleViesMap: Record<string, any> = {};
      const assuresMap: Record<string, any> = {};

      for (const alert of alerts) {
        if (!alert.event_id) continue;
        try {
          const events = await mockServices.EventService.getEvents();
          const event = events.find(e => e.id === alert.event_id);
          if (!event) continue;

          eventsMap[alert.id] = event;
          const cycleVies = await mockServices.CycleVieService.getCycleVies(event.id);
          if (cycleVies.length > 0) cycleViesMap[alert.id] = cycleVies[0];
          if (event.assure_id) {
            const assure = await mockServices.AssureService.getAssureById(event.assure_id);
            if (assure) assuresMap[alert.id] = assure;
          }
        } catch (error) {
          console.error('Error loading related data:', alert.id, error);
        }
      }
      setAlertEvents(eventsMap);
      setAlertCycleVies(cycleViesMap);
      setAlertAssures(assuresMap);
    };
    loadRelatedData();
  }, [alerts]);

  // Sort alerts
  const sortedAlerts = useMemo(() => {
    const sorted = [...alerts];
    switch (sortBy) {
      case 'priority':
        return sorted.sort((a, b) => {
          const priorityOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
          const aPriority = priorityOrder[a.severity] || 0;
          const bPriority = priorityOrder[b.severity] || 0;
          if (aPriority !== bPriority) return bPriority - aPriority;
          const aUrgency = getUrgencyIndicator(a);
          const bUrgency = getUrgencyIndicator(b);
          const urgencyOrder: Record<string, number> = { overdue: 4, urgent: 3, approaching: 2, normal: 1 };
          return urgencyOrder[bUrgency.level] - urgencyOrder[aUrgency.level];
        });
      case 'age':
        return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case 'score':
        return sorted.sort((a, b) => b.score - a.score);
      default:
        return sorted;
    }
  }, [alerts, sortBy]);

  // Handlers
  const handleQualify = (alertId: string, qualification: string) => {
    qualifyAlert(alertId, qualification, `${qualification} confirmed`);
  };

  const handleCreateCase = async (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return;
    const priority = ['critical', 'high'].includes(alert.severity) ? 'urgent' : 'normal';
    const newCase = await createCase([alertId], user?.name, priority);
    if (newCase) {
      await qualifyAlert(alertId, 'fraud_confirmed', 'Case created for investigation');
      navigate('/cases');
    }
  };

  const handleTeamTransfer = async (teamId: string, reason: string, urgency: string) => {
    if (!transferAlert) return;
    const teamMemberMap: Record<string, string> = {
      fraud_internal: "Expert.Fraude", expert_auto: "Expert.Auto.1",
      gestionnaire: "V. Dubois", equipe_it: "IT.Security"
    };
    const priority = ['critical', 'high'].includes(transferAlert.severity) ? 'urgent' : 'normal';
    const newCase = await createCase([transferAlert.id], teamMemberMap[teamId], priority);
    if (newCase) {
      await qualifyAlert(transferAlert.id, 'fraud_confirmed', `Transferred to team ${teamId} with urgency ${urgency}`);
      navigate('/cases');
    }
  };

  // KPI Cards
  const kpiCards = useMemo(() => [
    { icon: <img src="/icons/bell.svg" alt="Pending" className="w-6 h-6" />, title: 'Pending', value: stats?.pending || 0 },
    { icon: <img src="/icons/clock.svg" alt="Past SLA" className="w-6 h-6" />, title: 'Past SLA', value: alerts.filter(a => getUrgencyIndicator(a).level === 'overdue').length },
    { icon: <img src="/icons/today.svg" alt="Today" className="w-6 h-6" />, title: 'Today', value: stats?.todayCount || 0 },
    { icon: <img src="/icons/profile.svg" alt="My Alerts" className="w-6 h-6" />, title: 'My Alerts', value: alerts.filter(a => a.assigned_to === user?.name).length }
  ], [stats, alerts, user?.name]);

  return (
    <div className="space-y-6">
      <HeaderKPI title="Alert Center" subtitle={<>{user?.name} ({user?.role}) - {user?.team}</>}
        cards={kpiCards} backgroundImage="/icons/headerKPI.svg" minHeight={120} />

      <div className="grid grid-cols-12 gap-6">
        {/* Alert Queue */}
        <div className="col-span-5">
          <Card className="h-[calc(100vh-200px)]">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Alert Queue</CardTitle>
                <Badge variant="secondary">{alerts.length} alerts</Badge>
              </div>
              <div className="space-y-3 mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input placeholder="Search by ID, type, or number..." value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      {['all', 'new', 'assigned', 'investigating', 'qualified', 'closed'].map(status => (
                        <SelectItem key={status} value={status === 'all' ? 'all' : status}>
                          {status === 'all' ? 'All statuses' : status === 'new' ? 'Pending' : status === 'investigating' ? 'In progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                    <SelectTrigger><SelectValue placeholder="Severity" /></SelectTrigger>
                    <SelectContent>
                      {['all', 'critical', 'high', 'medium', 'low'].map(severity => (
                        <SelectItem key={severity} value={severity}>
                          {severity === 'all' ? 'All severities' : severity.charAt(0).toUpperCase() + severity.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterAssignment} onValueChange={setFilterAssignment}>
                    <SelectTrigger><SelectValue placeholder="Assignment" /></SelectTrigger>
                    <SelectContent>
                      {['all', 'me', 'unassigned'].map(assignment => (
                        <SelectItem key={assignment} value={assignment}>
                          {assignment === 'all' ? 'All assignments' : assignment === 'me' ? 'My alerts' : 'Unassigned'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger><SelectValue placeholder="Sort by" /></SelectTrigger>
                    <SelectContent>
                      {['priority', 'age', 'score'].map(sort => (
                        <SelectItem key={sort} value={sort}>
                          {sort === 'priority' ? 'Priority + SLA' : sort.charAt(0).toUpperCase() + sort.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="overflow-y-auto max-h-[calc(100%-200px)]">
              <div className="space-y-2">
                {sortedAlerts.map(alert => (
                  <AlertCard key={alert.id} alert={alert} isSelected={selectedAlert?.id === alert.id}
                    onClick={() => selectAlert(alert.id)} alertEvents={alertEvents}
                    alertAssures={alertAssures} alertCycleVies={alertCycleVies} navigate={navigate} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alert Details */}
        <div className="col-span-7">
          <ActionBar selectedAlert={selectedAlert} onQualify={handleQualify} onCreateCase={handleCreateCase}
            onAssign={assignAlerts} user={user} />
          {selectedAlert ? (
            <AlertDetails alert={selectedAlert} alertEvents={alertEvents} alertCycleVies={alertCycleVies}
              alertAssures={alertAssures} navigate={navigate} />
          ) : (
            <Card className="h-[300px] flex items-center justify-center">
              <CardContent className="text-center">
                <Bell className="w-20 h-20 text-slate-300 mx-auto mb-6" />
                <p className="text-slate-500 text-xl mb-2">Select an alert to view details</p>
                <p className="text-slate-400">Click on an alert in the queue above</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {transferAlert && (
        <TeamTransferModal alert={transferAlert} isOpen={showTransferModal}
          onClose={() => { setShowTransferModal(false); setTransferAlert(null); }}
          onTransfer={handleTeamTransfer} />
      )}
    </div>
  );
};

export default Alerts;