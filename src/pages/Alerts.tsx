import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAlerts } from '@/contexts/AlertContext';
import { useAuth } from '@/hooks/useAuth';
import { useCases } from '@/contexts/CaseContext';
import { mockServices } from '@/lib/mockServices';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import HeaderKPI from '@/components/HeaderKPI';
import { AlertCard, getSeverityColor, getUrgencyIndicator } from '@/components/AlertCard';
import { AlertDetails } from '@/components/AlertDetails';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TeamTransferModal } from '@/components/TeamTransferModal';
import { Alert, AlertFilters } from '@/types/alert.types';
import {
  Bell, Clock, AlertTriangle, CheckCircle, XCircle, User, Search,
  Activity, Folder, ExternalLink
} from 'lucide-react';

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
              <div className="flex justify-between items-center mb-4">
                <CardTitle>Queue</CardTitle>
                <Badge variant="secondary" style={{ backgroundColor: '#3D5EFF', color: 'white' }}>{alerts.length} Alerts</Badge>
              </div>
              <div className="space-y-3 mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input placeholder="Search by ID, type, or number..." value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
                <div className="grid grid-cols-2 gap-2 font-semibold">
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
            <CardContent className="overflow-y-auto max-h-[calc(90%-200px)] custom-scrollbar"  style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#D8D8D8 transparent'
      }}>
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
          {selectedAlert ? (
            <AlertDetails 
              alert={selectedAlert} 
              alertEvents={alertEvents} 
              alertCycleVies={alertCycleVies}
              alertAssures={alertAssures} 
              navigate={navigate}
              onQualify={qualifyAlert}
            />
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