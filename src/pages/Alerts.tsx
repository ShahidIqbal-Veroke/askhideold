import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAlerts } from '@/contexts/AlertContext';
import { useAuth } from '@/hooks/useAuth';
import { useCases } from '@/contexts/CaseContext';
import { mockServices } from '@/lib/mockServices';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TeamTransferModal } from '@/components/TeamTransferModal';
import { Alert, AlertFilters } from '@/types/alert.types';
import { 
  Bell, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  User, 
  Search,
  TrendingUp,
  Activity,
  Folder,
  ArrowLeft,
  Link as LinkIcon,
  ExternalLink
} from 'lucide-react';

const Alerts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    alerts, 
    selectedAlert, 
    stats, 
    isLoading, 
    loadAlerts, 
    selectAlert, 
    assignAlerts,
    qualifyAlert 
  } = useAlerts();
  const { createCase } = useCases();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterAssignment, setFilterAssignment] = useState<string>('all');
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'priority' | 'age' | 'score'>('priority');
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [alertEvents, setAlertEvents] = useState<{[alertId: string]: any}>({});
  const [alertCycleVies, setAlertCycleVies] = useState<{[alertId: string]: any}>({});
  const [alertAssures, setAlertAssures] = useState<{[alertId: string]: any}>({});
  
  // === NEW: TRANSFER MODAL STATE ===
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferAlert, setTransferAlert] = useState<Alert | null>(null);
  
  // Get state from navigation (from AnalysisResult)
  const navigationState = location.state as { newAlertId?: string; fromAnalysis?: boolean } | null;

  // Apply filters - MEMOIZED to prevent infinite loops
  const filterValues = useMemo(() => ({
    status: filterStatus,
    severity: filterSeverity,
    assignment: filterAssignment,
    search: searchTerm,
    userName: user?.name
  }), [filterStatus, filterSeverity, filterAssignment, searchTerm, user?.name]);

  // Load alerts only when filters change or initial load
  useEffect(() => {
    // Prevent multiple initial loads
    if (!hasLoadedOnce && filterValues.status === 'all' && !filterValues.search) {
      setHasLoadedOnce(true);
    }
    
    const filters: AlertFilters = {};
    
    if (filterValues.status !== 'all') {
      filters.status = [filterValues.status as any];
    }
    if (filterValues.severity !== 'all') {
      filters.severity = [filterValues.severity as any];
    }
    if (filterValues.assignment !== 'all') {
      if (filterValues.assignment === 'me') {
        filters.assignedTo = filterValues.userName;
      } else if (filterValues.assignment === 'unassigned') {
        filters.unassigned = true;
      }
    }
    if (filterValues.search) {
      filters.searchTerm = filterValues.search;
    }
    
    // Only load if we haven't loaded or filters have actually changed
    if (!hasLoadedOnce || Object.keys(filters).length > 0 || filterValues.search) {
      loadAlerts(filters);
    }
  }, [filterValues, loadAlerts, hasLoadedOnce]);

  // Auto-select new alert from AnalysisResult
  useEffect(() => {
    if (navigationState?.newAlertId && alerts.length > 0) {
      const newAlert = alerts.find(alert => alert.id === navigationState.newAlertId);
      if (newAlert) {
        selectAlert(newAlert.id);
        // Clear the navigation state to prevent re-selection on re-renders
        window.history.replaceState(null, '', '/alerts');
      }
    }
  }, [alerts, navigationState, selectAlert]);

  // Load related data for alerts
  useEffect(() => {
    const loadRelatedData = async () => {
      if (alerts.length > 0) {
        const eventsMap: {[alertId: string]: any} = {};
        const cycleViesMap: {[alertId: string]: any} = {};
        const assuresMap: {[alertId: string]: any} = {};
        
        for (const alert of alerts) {
          if (alert.event_id) {
            try {
              // Load event
              const events = await mockServices.EventService.getEvents();
              const event = events.find(e => e.id === alert.event_id);
              if (event) {
                eventsMap[alert.id] = event;
                
                // Load cycle de vie through event
                const cycleVies = await mockServices.CycleVieService.getCycleVies(event.id);
                if (cycleVies.length > 0) {
                  cycleViesMap[alert.id] = cycleVies[0];
                }
                
                // Load assuré through event
                if (event.assure_id) {
                  const assure = await mockServices.AssureService.getAssureById(event.assure_id);
                  if (assure) {
                    assuresMap[alert.id] = assure;
                  }
                }
              }
            } catch (error) {
              console.error('Error loading related data for alert:', alert.id, error);
            }
          }
        }
        
        setAlertEvents(eventsMap);
        setAlertCycleVies(cycleViesMap);
        setAlertAssures(assuresMap);
      }
    };

    loadRelatedData();
  }, [alerts]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyIndicator = useCallback((alert: Alert) => {
    const now = new Date();
    const created = new Date(alert.created_at);
    const hoursOld = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    
    // SLA Thresholds based on severity
    const slaThresholds = {
      critical: 2,  // 2 hours
      high: 4,      // 4 hours  
      medium: 8,    // 8 hours
      low: 24       // 24 hours
    };
    
    const threshold = slaThresholds[alert.severity as keyof typeof slaThresholds] || 24;
    const urgencyLevel = hoursOld / threshold;
    
    if (urgencyLevel > 1) return { level: 'overdue', color: 'text-red-600', pulse: true };
    if (urgencyLevel > 0.8) return { level: 'urgent', color: 'text-orange-600', pulse: true };
    if (urgencyLevel > 0.6) return { level: 'approaching', color: 'text-yellow-600', pulse: false };
    return { level: 'normal', color: 'text-green-600', pulse: false };
  }, []);

  const sortAlerts = useCallback((alerts: Alert[]) => {
    const sorted = [...alerts];
    
    switch (sortBy) {
      case 'priority':
        return sorted.sort((a, b) => {
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          const aPriority = priorityOrder[a.severity as keyof typeof priorityOrder] || 0;
          const bPriority = priorityOrder[b.severity as keyof typeof priorityOrder] || 0;
          
          if (aPriority !== bPriority) return bPriority - aPriority;
          
          // Secondary sort by urgency
          const aUrgency = getUrgencyIndicator(a);
          const bUrgency = getUrgencyIndicator(b);
          const urgencyOrder = { overdue: 4, urgent: 3, approaching: 2, normal: 1 };
          return urgencyOrder[bUrgency.level as keyof typeof urgencyOrder] - urgencyOrder[aUrgency.level as keyof typeof urgencyOrder];
        });
      
      case 'age':
        return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      
      case 'score':
        return sorted.sort((a, b) => b.score - a.score);
      
      default:
        return sorted;
    }
  }, [sortBy, getUrgencyIndicator]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': 
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'assigned': return <User className="w-4 h-4" />;
      case 'investigating':
      case 'in_review': return <Activity className="w-4 h-4" />;
      case 'qualified': return <CheckCircle className="w-4 h-4" />;
      case 'closed':
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const handleSelectAll = () => {
    if (selectedAlerts.size === alerts.length) {
      setSelectedAlerts(new Set());
    } else {
      setSelectedAlerts(new Set(alerts.map(a => a.id)));
    }
  };

  const handleSelectAlert = (alertId: string) => {
    const newSelected = new Set(selectedAlerts);
    if (newSelected.has(alertId)) {
      newSelected.delete(alertId);
    } else {
      newSelected.add(alertId);
    }
    setSelectedAlerts(newSelected);
  };

  const handleBulkAssign = (assignTo: string) => {
    assignAlerts(Array.from(selectedAlerts), assignTo);
    setSelectedAlerts(new Set());
  };

  const handleCreateCase = async (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return;

    // createCase expects (alertIds, assignTo?, priority?)
    const priority = alert.severity === 'critical' || alert.severity === 'high' ? 'urgent' : 'normal';
    const newCase = await createCase(
      [alertId], // alertIds
      user?.name, // assignTo (optional)
      priority // priority (optional)
    );

    if (newCase) {
      // Qualify the alert as fraud_confirmed since we created a case
      await qualifyAlert(alertId, 'fraud_confirmed', 'Case created for investigation');
      navigate(`/cases`);
    }
  };

  // === NEW: FRAUD TEAM ESCALATION ===
  const escalateToFraudTeam = async (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return;

    // Open team transfer modal
    setTransferAlert(alert);
    setShowTransferModal(true);
  };

  // === NEW: TEAM TRANSFER HANDLER ===
  const handleTeamTransfer = async (teamId: string, reason: string, urgency: string) => {
    if (!transferAlert) return;

    // Team ID to member mapping
    const teamMemberMap: Record<string, string> = {
      fraud_internal: "Expert.Fraude",
      expert_auto: "Expert.Auto.1",
      gestionnaire: "V. Dubois",
      equipe_it: "IT.Security"
    };

    const teamTypeMap: Record<string, 'gestionnaire' | 'fraude' | 'expert' | 'compliance'> = {
      fraud_internal: 'fraude',
      expert_auto: 'expert',
      gestionnaire: 'gestionnaire',
      equipe_it: 'expert' // IT considered as technical expert
    };

    const assignedMember = teamMemberMap[teamId];
    const investigationTeam = teamTypeMap[teamId];

    // createCase expects (alertIds, assignTo?, priority?)
    const priority = transferAlert.severity === 'critical' || transferAlert.severity === 'high' ? 'urgent' : 'normal';
    const newCase = await createCase(
      [transferAlert.id], // alertIds
      assignedMember, // assignTo
      priority // priority
    );

    if (newCase) {
      // Qualification with transfer traceability
      await qualifyAlert(transferAlert.id, 'fraud_confirmed', `Transferred to team ${teamId} with urgency ${urgency}`);
      navigate(`/cases`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with statistics */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Alert Center</h1>
          <p className="text-slate-600 mt-1">
            Welcome {user?.name} ({user?.role}) - {user?.team}
          </p>
        </div>

        {/* Enhanced Stats - MEMOIZED */}
        <div className="flex space-x-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{(stats?.pending || 0)}</p>
                  <p className="text-xs text-slate-600">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {useMemo(() =>
                      alerts.filter(a => getUrgencyIndicator(a).level === 'overdue').length,
                      [alerts, getUrgencyIndicator]
                    )}
                  </p>
                  <p className="text-xs text-slate-600">Past SLA</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{stats?.todayCount || 0}</p>
                  <p className="text-xs text-slate-600">Today</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {useMemo(() =>
                      alerts.filter(a => a.assigned_to === user?.name).length,
                      [alerts, user?.name]
                    )}
                  </p>
                  <p className="text-xs text-slate-600">My alerts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Alert Queue (Left) */}
        <div className="col-span-5">
          <Card className="h-[calc(100vh-200px)]">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Alert Queue</CardTitle>
                <Badge variant="secondary">{alerts.length} alerts</Badge>
              </div>

              {/* Enhanced Filters */}
              <div className="space-y-3 mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search by ID, type, or number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="new">Pending</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="investigating">In progress</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All severities</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterAssignment} onValueChange={setFilterAssignment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Assignment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All assignments</SelectItem>
                      <SelectItem value="me">My alerts</SelectItem>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="priority">Priority + SLA</SelectItem>
                      <SelectItem value="age">Age</SelectItem>
                      <SelectItem value="score">Score</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="overflow-y-auto max-h-[calc(100%-200px)]">
              <div className="space-y-2">
                {sortAlerts(alerts).map((alert) => {
                  const urgency = getUrgencyIndicator(alert);
                  return (
                  <div
                    key={alert.id}
                    onClick={() => selectAlert(alert.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedAlert?.id === alert.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : urgency.level === 'overdue' 
                          ? 'border-red-200 bg-red-50'
                          : urgency.level === 'urgent'
                            ? 'border-orange-200 bg-orange-50'
                            : 'border-slate-200 hover:bg-slate-50'
                    } ${urgency.pulse ? 'animate-pulse' : ''}`}
                  >
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
                          <Badge className={getSeverityColor(alert.severity)} variant="outline">
                            {alert.severity}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-slate-600 mb-1">
                          {alert.metadata.documentType} - {alert.metadata.sinisterNumber}
                        </p>
                        
                        {alertEvents[alert.id] && (
                          <div className="flex items-center space-x-2 mb-2 text-xs">
                            <LinkIcon className="w-3 h-3 text-slate-400" />
                            <span className="text-slate-500">Source:</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/events?highlight=${alertEvents[alert.id].id}`);
                              }}
                              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                            >
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
                            {alert.assigned_to && (
                              <>
                                <span>•</span>
                                <span>{alert.assigned_to}</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {urgency.level !== 'normal' && (
                              <span className={`text-xs font-medium ${urgency.color}`}>
                                {urgency.level === 'overdue' ? 'PAST SLA' :
                                 urgency.level === 'urgent' ? 'URGENT' : 'WARNING'}
                              </span>
                            )}
                            <span className="text-xs text-slate-500">
                              {new Date(alert.created_at).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alert Details and Actions (Right) */}
        <div className="col-span-7">
          {/* Horizontal Actions Bar */}
          {selectedAlert && (
            <div className="bg-white border rounded-lg p-3 shadow-sm mb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-slate-700 whitespace-nowrap">Actions:</span>
                <Button
                  onClick={() => qualifyAlert(selectedAlert.id, 'fraud_confirmed', 'Fraud confirmed by manager')}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-xs px-2 py-1"
                  disabled={selectedAlert.qualification === 'fraud_confirmed'}
                >
                  <XCircle className="w-3 h-3 mr-1" />
                  Fraud
                </Button>
                <Button
                  onClick={() => qualifyAlert(selectedAlert.id, 'false_positive', 'False positive confirmed')}
                  size="sm"
                  variant="outline"
                  className="text-xs px-2 py-1"
                  disabled={selectedAlert.qualification === 'false_positive'}
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  False positive
                </Button>
                <Button
                  onClick={() => qualifyAlert(selectedAlert.id, 'requires_investigation', 'Investigation required')}
                  size="sm"
                  className="bg-yellow-600 hover:bg-yellow-700 text-xs px-2 py-1"
                  disabled={selectedAlert.qualification === 'requires_investigation'}
                >
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Investigation
                </Button>
                <Button
                    onClick={() => handleCreateCase(selectedAlert.id)}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-xs px-2 py-1"
                >
                  <Folder className="w-3 h-3 mr-1" />
                  Create case
                </Button>
              </div>
              <div className="flex items-center gap-2">
                {user?.role === 'superviseur' && (
                  <Select
                    value={selectedAlert.assigned_to || ""}
                    onValueChange={(value) => assignAlerts([selectedAlert.id], value)}
                  >
                    <SelectTrigger className="w-32 h-7 text-xs">
                      <SelectValue placeholder="Assign to..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="V. Dubois">V. Dubois</SelectItem>
                      <SelectItem value="M. Bernard">M. Bernard</SelectItem>
                      <SelectItem value="S. Martin">S. Martin</SelectItem>
                      <SelectItem value="L. Petit">L. Petit</SelectItem>
                    </SelectContent>
                  </Select>
                )}

              </div>
            </div>
          </div>
          )}

          {/* Alert Details - Single Scrollable Content */}
          {selectedAlert ? (
            <div className="space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
              {/* Alert Header */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-3">
                        <CardTitle className="text-2xl">{selectedAlert.id}</CardTitle>
                        <Badge className={getSeverityColor(selectedAlert.severity)} variant="outline">
                          {selectedAlert.severity}
                        </Badge>
                        {(() => {
                          const urgency = getUrgencyIndicator(selectedAlert);
                          if (urgency.level !== 'normal') {
                            return (
                              <Badge variant="outline" className={
                                urgency.level === 'overdue' ? 'border-red-500 text-red-700' :
                                urgency.level === 'urgent' ? 'border-orange-500 text-orange-700' :
                                'border-yellow-500 text-yellow-700'
                              }>
                                {urgency.level === 'overdue' ? 'PAST SLA' :
                                 urgency.level === 'urgent' ? 'URGENT' : 'WARNING'}
                              </Badge>
                            );
                          }
                          return null;
                        })()}
                      </div>
                      <p className="text-sm text-slate-600 mt-2">
                        Created on {new Date(selectedAlert.created_at).toLocaleDateString('en-US')}
                        {' '}at {new Date(selectedAlert.created_at).toLocaleTimeString('en-US')}
                      </p>
                      <div className="flex items-center space-x-6 mt-3 text-sm text-slate-500">
                        <span>Score: <span className="font-medium">{selectedAlert.score}%</span></span>
                        <span>Confidence: <span className="font-medium">{(selectedAlert.metadata?.confidence ? (selectedAlert.metadata.confidence * 100).toFixed(1) : 'N/A')}%</span></span>
                        {selectedAlert.assigned_to && <span>Assigned to: <span className="font-medium">{selectedAlert.assigned_to}</span></span>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(selectedAlert.status)}
                      <span className="font-medium">
                        {selectedAlert.status === 'new' || selectedAlert.status === 'pending' ? 'Pending' :
                         selectedAlert.status === 'assigned' ? 'Assigned' :
                         selectedAlert.status === 'investigating' || selectedAlert.status === 'in_review' ? 'In progress' :
                         selectedAlert.status === 'qualified' ? 'Qualified' :
                         selectedAlert.status === 'closed' ? 'Closed' : 'Rejected'}
                      </span>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Details Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Alert Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-1">Source</p>
                      <p className="text-sm text-slate-600">{selectedAlert.source}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-1">Module</p>
                      <p className="text-sm text-slate-600">{selectedAlert.sourceModule}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-1">Detection Type</p>
                      <p className="text-sm text-slate-600">{selectedAlert.detection_module}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-1">Claim Number</p>
                      <p className="text-sm text-slate-600">{selectedAlert.metadata.sinisterNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-1">Amount</p>
                      <p className="text-sm text-slate-600 font-medium">
                        {selectedAlert.metadata.amount ? `${selectedAlert.metadata.amount}€` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-1">Document Type</p>
                      <p className="text-sm text-slate-600">{selectedAlert.metadata.documentType || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Event and Workflow Information */}
                  {(alertEvents[selectedAlert.id] || alertCycleVies[selectedAlert.id] || alertAssures[selectedAlert.id]) && (
                    <div className="mt-6 space-y-4">
                      {alertEvents[selectedAlert.id] && (
                        <div>
                          <p className="text-sm font-medium text-slate-700 mb-3">Source Event</p>
                          <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">
                                  {alertEvents[selectedAlert.id].type}
                                </Badge>
                                <span className="text-sm text-slate-600">
                                  {alertEvents[selectedAlert.id].id}
                                </span>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/events?highlight=${alertEvents[selectedAlert.id].id}`)}
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                View event
                              </Button>
                            </div>
                            <div className="text-xs text-slate-500">
                              Source: {alertEvents[selectedAlert.id].source} •
                              Created on: {new Date(alertEvents[selectedAlert.id].timestamp).toLocaleString('en-US')}
                            </div>
                          </div>
                        </div>
                      )}

                      {alertCycleVies[selectedAlert.id] && (
                        <div>
                          <p className="text-sm font-medium text-slate-700 mb-3">Lifecycle</p>
                          <div className="bg-green-50 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <Badge variant="default" className="capitalize">
                                  {alertCycleVies[selectedAlert.id].stage}
                                </Badge>
                                <Badge variant="outline" className="capitalize">
                                  {alertCycleVies[selectedAlert.id].type}
                                </Badge>
                              </div>
                              {alertCycleVies[selectedAlert.id].metadata?.urgence_niveau && (
                                <Badge
                                  variant={
                                    alertCycleVies[selectedAlert.id].metadata.urgence_niveau === 'critique' ? 'destructive' :
                                    alertCycleVies[selectedAlert.id].metadata.urgence_niveau === 'urgent' ? 'default' : 'outline'
                                  }
                                >
                                  {alertCycleVies[selectedAlert.id].metadata.urgence_niveau}
                                </Badge>
                              )}
                            </div>
                            {alertCycleVies[selectedAlert.id].metadata?.gestionnaire && (
                              <p className="text-sm text-slate-600">
                                Manager: {alertCycleVies[selectedAlert.id].metadata.gestionnaire}
                              </p>
                            )}
                            {alertCycleVies[selectedAlert.id].metadata?.montant_estime && (
                              <p className="text-sm text-slate-600">
                                Estimated amount: {alertCycleVies[selectedAlert.id].metadata.montant_estime}€
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {alertAssures[selectedAlert.id] && (
                        <div>
                          <p className="text-sm font-medium text-slate-700 mb-3">Related Insured</p>
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">
                                  {alertAssures[selectedAlert.id].civilite} {alertAssures[selectedAlert.id].prenom} {alertAssures[selectedAlert.id].nom}
                                </p>
                                <p className="text-sm text-slate-600">
                                  Client No: {alertAssures[selectedAlert.id].numero_client}
                                </p>
                                <p className="text-sm text-slate-600">
                                  Risk score: {alertAssures[selectedAlert.id].score_risque}/100
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/assures/${alertAssures[selectedAlert.id].id}`)}
                              >
                                <User className="w-3 h-3 mr-1" />
                                Insured profile
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedAlert.metadata.fraudTypes && (
                    <div className="mt-6">
                      <p className="text-sm font-medium text-slate-700 mb-3">Detected Fraud Types</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedAlert.metadata.fraudTypes.map((type, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">{type}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* SLA Timing Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">SLA & Timing</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const urgency = getUrgencyIndicator(selectedAlert);
                    const now = new Date();
                    const created = new Date(selectedAlert.created_at);
                    const hoursOld = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
                    const slaThresholds = { critical: 2, high: 4, medium: 8, low: 24 };
                    const threshold = slaThresholds[selectedAlert.severity as keyof typeof slaThresholds] || 24;
                    const progress = Math.min((hoursOld / threshold) * 100, 100);

                    return (
                      <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-6">
                          <div>
                            <p className="text-sm font-medium text-slate-700 mb-1">Elapsed Time</p>
                            <p className="text-2xl font-bold">{hoursOld.toFixed(1)}h</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-700 mb-1">SLA {selectedAlert.severity}</p>
                            <p className="text-2xl font-bold">{threshold}h max</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-700 mb-1">SLA Progress</p>
                            <p className={`text-2xl font-bold ${urgency.color}`}>{progress.toFixed(0)}%</p>
                          </div>
                        </div>

                        <div>
                          <div className="w-full bg-gray-200 rounded-full h-4">
                            <div
                              className={`h-4 rounded-full transition-all ${
                                urgency.level === 'overdue' ? 'bg-red-500' :
                                urgency.level === 'urgent' ? 'bg-orange-500' :
                                urgency.level === 'approaching' ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>
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
                            {selectedAlert.assigned_to && (
                              <div className="flex justify-between items-center py-2 border-b">
                                <span className="font-medium">Assignment</span>
                                <span>Assigned to {selectedAlert.assigned_to}</span>
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
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Analysis Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detailed Analysis</CardTitle>
                  {/* Debug info */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="text-xs text-gray-500">
                      Debug: Evidence count = {selectedAlert.metadata.technicalEvidence?.length || 0}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {selectedAlert.metadata.technicalEvidence && selectedAlert.metadata.technicalEvidence.length > 0 ? (
                    <div className="space-y-4">
                      {selectedAlert.metadata.technicalEvidence.map((evidence, idx) => {
                        const severityColor = evidence.severity === 'fail' ? 'bg-red-50 border-red-200 text-red-900' :
                                            evidence.severity === 'warn' ? 'bg-yellow-50 border-yellow-200 text-yellow-900' :
                                            'bg-blue-50 border-blue-200 text-blue-900';

                        const severityIcon = evidence.severity === 'fail' ?
                          <XCircle className="w-5 h-5 text-red-600" /> :
                          evidence.severity === 'warn' ?
                          <AlertTriangle className="w-5 h-5 text-yellow-600" /> :
                          <Activity className="w-5 h-5 text-blue-600" />;

                        const severityLabel = evidence.severity === 'fail' ? 'Failed' :
                                            evidence.severity === 'warn' ? 'Warning' : 'Info';

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
                                    }`}>
                                      {severityLabel}
                                    </Badge>
                                    <code className="text-xs font-mono bg-white/60 px-2 py-1 rounded">
                                      {evidence.code}
                                    </code>
                                  </div>
                                  <div className="text-xs font-medium">
                                    Confidence: {Math.round(evidence.confidence * 100)}%
                                  </div>
                                </div>
                                <p className="text-sm leading-relaxed">
                                  {evidence.message}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Summary statistics */}
                      <div className="mt-6 pt-4 border-t">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-red-600">
                              {selectedAlert.metadata.technicalEvidence.filter(e => e.severity === 'fail').length}
                            </p>
                            <p className="text-xs text-gray-600">Critical anomalies</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-yellow-600">
                              {selectedAlert.metadata.technicalEvidence.filter(e => e.severity === 'warn').length}
                            </p>
                            <p className="text-xs text-gray-600">Warnings</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">
                              {selectedAlert.metadata.technicalEvidence.filter(e => e.severity === 'info').length}
                            </p>
                            <p className="text-xs text-gray-600">Information</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-lg p-8 text-center">
                      <Activity className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600 text-lg mb-2">No detailed technical analysis available</p>
                      <p className="text-slate-500 text-sm">
                        Technical details will appear here during in-depth analysis.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
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

      {/* === NEW: TEAM TRANSFER MODAL === */}
      {transferAlert && (
        <TeamTransferModal
          alert={transferAlert}
          isOpen={showTransferModal}
          onClose={() => {
            setShowTransferModal(false);
            setTransferAlert(null);
          }}
          onTransfer={handleTeamTransfer}
        />
      )}
    </div>
  );
};

export default Alerts;