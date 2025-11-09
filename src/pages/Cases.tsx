import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCases } from '@/contexts/CaseContext';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';

// Use localStorage Case interface (snake_case)
interface Case {
  id: string;
  reference: string;
  alert_ids: string[];
  status: 'open' | 'investigating' | 'pending_review' | 'closed';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  investigation_team: string;
  assigned_to: string;
  created_at: string;
  updated_at: string;
  estimated_loss: number;
  investigation_cost: number;
  roi_score?: number;
  handovers: Array<{
    from: string;
    fromTeam: string;
    to: string;
    toTeam: string;
    reason: string;
    timestamp: string;
  }>;
  metadata: {
    fraud_type?: string;
    evidence_collected?: string[];
    investigation_notes?: string;
  };
}

interface CaseFilters {
  status?: string[];
  priority?: string[];
  assigned_to?: string;
  searchTerm?: string;
}
import { 
  Folder, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  User, 
  Filter, 
  Search,
  TrendingUp,
  DollarSign,
  Activity,
  Calendar,
  FileText,
  Users,
  Target,
  Edit3,
  Save
} from 'lucide-react';

const Cases = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    cases, 
    selectedCase, 
    stats, 
    isLoading, 
    loadCases, 
    selectCase, 
    updateCase,
    assignCases 
  } = useCases();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAssignedTo, setFilterAssignedTo] = useState<string>('all');
  const [selectedCases, setSelectedCases] = useState<Set<string>>(new Set());
  const [editingNote, setEditingNote] = useState(false);
  const [newNote, setNewNote] = useState('');
  
  // Read URL parameters on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    
    const status = searchParams.get('status');
    if (status) {
      setFilterStatus(status);
    }
    
    const priority = searchParams.get('priority');
    if (priority) {
      setFilterPriority(priority);
    }
    
    const assignedTo = searchParams.get('assigned_to');
    if (assignedTo) {
      setFilterAssignedTo(decodeURIComponent(assignedTo));
    }
    
    const search = searchParams.get('search');
    if (search) {
      setSearchTerm(decodeURIComponent(search));
    }
  }, [location.search]);

  // Apply filters
  useEffect(() => {
    const filters: CaseFilters = {};
    
    if (filterStatus !== 'all') {
      filters.status = [filterStatus];
    }
    if (filterPriority !== 'all') {
      filters.priority = [filterPriority];
    }
    if (filterAssignedTo !== 'all') {
      if (filterAssignedTo === 'me') {
        filters.assigned_to = user?.name;
      } else {
        filters.assigned_to = filterAssignedTo;
      }
    }
    if (searchTerm) {
      filters.searchTerm = searchTerm;
    }
    
    loadCases(filters);
  }, [filterStatus, filterPriority, filterAssignedTo, searchTerm, user?.name]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'investigating': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending_review': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'closed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case 'fraud_confirmed': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'fraud_rejected': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'insufficient_proof': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleStatusChange = (status: string) => {
    if (selectedCase) {
      updateCase(selectedCase.id, {
        status: status as any
      });
    }
  };

  const handleAddNote = () => {
    if (selectedCase && newNote.trim()) {
      const currentNotes = selectedCase.metadata?.investigation_notes || '';
      const updatedNotes = currentNotes ? `${currentNotes}\n${newNote.trim()}` : newNote.trim();
      
      updateCase(selectedCase.id, {
        metadata: {
          ...selectedCase.metadata,
          investigation_notes: updatedNotes
        }
      });
      setNewNote('');
      setEditingNote(false);
    }
  };

  const handleDecisionChange = (decision: string, reason: string) => {
    if (selectedCase) {
      updateCase(selectedCase.id, {
        status: 'closed',
        metadata: {
          ...selectedCase.metadata,
          investigation_notes: (selectedCase.metadata?.investigation_notes || '') + `\n${reason}`
        }
      });
    }
  };

  const handleSelectCase = (caseId: string) => {
    const newSelected = new Set(selectedCases);
    if (newSelected.has(caseId)) {
      newSelected.delete(caseId);
    } else {
      newSelected.add(caseId);
    }
    setSelectedCases(newSelected);
  };

  return (
    <div className="space-y-6">
      {/* Header with statistics */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Cases Center</h1>
          <p className="text-slate-600 mt-1">
            Management and monitoring of fraud investigations
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className="flex space-x-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Folder className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats?.open || 0}</p>
                  <p className="text-xs text-slate-600">Open</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{stats?.investigating || 0}</p>
                  <p className="text-xs text-slate-600">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-xl font-bold">{formatCurrency(stats?.financialImpact.netRoi || 0)}</p>
                  <p className="text-xs text-slate-600">Net ROI</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Cases List (Left) */}
        <div className="col-span-5">
          <Card className="h-[calc(100vh-200px)]">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Cases</CardTitle>
                <Badge variant="secondary">{cases.length} cases</Badge>
              </div>

              {/* Filters */}
              <div className="space-y-3 mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="investigating">Investigating</SelectItem>
                      <SelectItem value="pending_review">Pending Review</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All priorities</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterAssignedTo} onValueChange={setFilterAssignedTo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Assigned to" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="me">My cases</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="overflow-y-auto max-h-[calc(100%-220px)]">
              <div className="space-y-3">
                {cases.map((caseItem) => (
                  <div
                    key={caseItem.id}
                    onClick={() => selectCase(caseItem.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedCase?.id === caseItem.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <Folder className="w-4 h-4" />
                            <span className="font-medium text-sm">{caseItem.reference}</span>
                          </div>
                          <p className="text-xs text-slate-600">
                            ID: {caseItem.id} • Team: {caseItem.investigation_team}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <Badge className={getStatusColor(caseItem.status)} variant="outline">
                            {caseItem.status}
                          </Badge>
                          <Badge className={getPriorityColor(caseItem.priority)} variant="outline">
                            {caseItem.priority}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Metrics */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-slate-500">Estimated Loss</p>
                          <p className="font-medium">{formatCurrency(caseItem.estimated_loss)}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">ROI</p>
                          <p className={`font-medium ${(caseItem.roi_score || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(caseItem.roi_score || 0)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4 text-gray-500" />
                          <span>{caseItem.assigned_to}</span>
                        </div>
                        <span>
                          {new Date(caseItem.created_at).toLocaleDateString('en-US')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Case Details (Right) */}
        <div className="col-span-7">
          {selectedCase ? (
            <Card className="h-[calc(100vh-200px)]">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Folder className="w-5 h-5" />
                      <span>{selectedCase.reference}</span>
                    </CardTitle>
                    <p className="text-sm text-slate-600 mt-1">
                      Created on {new Date(selectedCase.created_at).toLocaleDateString('en-US')}
                      {' '}by {selectedCase.assigned_to}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Badge className={getStatusColor(selectedCase.status)} variant="outline">
                      {selectedCase.status}
                    </Badge>
                    <Badge className={getPriorityColor(selectedCase.priority)} variant="outline">
                      {selectedCase.priority}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="overflow-y-auto max-h-[calc(100%-120px)]">
                <Tabs defaultValue="overview" className="h-full">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="investigation">Investigation</TabsTrigger>
                    <TabsTrigger value="financial">Financial</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-6 mt-6">
                    {/* Case Info */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-slate-700">Case Information</p>
                          <div className="mt-2 space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-500">ID:</span>
                              <span>{selectedCase.id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Reference:</span>
                              <span>{selectedCase.reference}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Team:</span>
                              <span>{selectedCase.investigation_team}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-slate-700">Assignment</p>
                          <div className="mt-2 space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Assigned to:</span>
                              <span>{selectedCase.assigned_to || 'Unassigned'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Status:</span>
                              <Badge className={getStatusColor(selectedCase.status)} variant="outline">
                                {selectedCase.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-slate-700">Related Alerts</p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {selectedCase.alert_ids && selectedCase.alert_ids.length > 0 ? selectedCase.alert_ids.map((alertId, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="text-xs cursor-pointer hover:bg-blue-200"
                                onClick={() => navigate(`/alerts?highlight=${alertId}`)}
                              >
                                {alertId}
                              </Badge>
                            )) : (
                              <span className="text-sm text-slate-500">No related alerts</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-slate-700">Metadata</p>
                          <div className="mt-2 space-y-1 text-sm">
                            {selectedCase.metadata?.fraud_type && (
                              <div className="flex justify-between">
                                <span className="text-slate-500">Fraud type:</span>
                                <span>{selectedCase.metadata.fraud_type}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-slate-500">Estimated loss:</span>
                              <span>{formatCurrency(selectedCase.estimated_loss)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Investigation cost:</span>
                              <span>{formatCurrency(selectedCase.investigation_cost)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-slate-700">Quick Actions</p>
                      <div className="flex flex-wrap gap-2">
                        <Select onValueChange={handleStatusChange}>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Change status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="investigating">Investigating</SelectItem>
                            <SelectItem value="pending_review">Pending Review</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          onClick={() => handleDecisionChange('fraud_confirmed', 'Fraud confirmed by investigation')}
                          variant="destructive"
                          size="sm"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Fraud Confirmed
                        </Button>

                        <Button
                          onClick={() => handleDecisionChange('fraud_rejected', 'No fraud detected')}
                          variant="outline"
                          size="sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          No Fraud
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="investigation" className="space-y-4 mt-6">
                    {/* Notes */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-sm font-medium text-slate-700">Investigation Notes</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingNote(!editingNote)}
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Add Note
                        </Button>
                      </div>

                      {editingNote && (
                        <div className="space-y-2 mb-4">
                          <Textarea
                            placeholder="Add an investigation note..."
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            rows={3}
                          />
                          <div className="flex space-x-2">
                            <Button size="sm" onClick={handleAddNote}>
                              <Save className="w-4 h-4 mr-2" />
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingNote(false)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        {selectedCase.metadata?.investigation_notes ? (
                          selectedCase.metadata.investigation_notes.split('\n').map((note, idx) => (
                            <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                              <p className="text-sm">{note}</p>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 bg-slate-50 rounded-lg text-center">
                            <p className="text-sm text-slate-500">No notes available</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Alerts linked to case */}
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-3">Related Alerts</p>
                      <div className="space-y-2">
                        {selectedCase.alert_ids && selectedCase.alert_ids.length > 0 ? (
                          selectedCase.alert_ids.map((alertId, idx) => (
                            <div key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{alertId}</span>
                                {idx === 0 && (
                                  <Badge variant="default" className="text-xs">Primary</Badge>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 bg-slate-50 rounded-lg text-center">
                            <p className="text-sm text-slate-500">No related alerts</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="financial" className="space-y-4 mt-6">
                    {/* Financial Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-slate-500">Estimated Loss</p>
                              <p className="text-xl font-bold text-red-600">
                                {formatCurrency(selectedCase.estimated_loss || selectedCase.metrics?.estimatedLoss || 0)}
                              </p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-red-500" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-slate-500">Recovered Amount</p>
                              <p className="text-xl font-bold text-green-600">
                                {formatCurrency(selectedCase.metrics?.recoveredAmount || 0)}
                              </p>
                            </div>
                            <DollarSign className="w-8 h-8 text-green-500" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-slate-500">Prevented Amount</p>
                              <p className="text-xl font-bold text-blue-600">
                                {formatCurrency(selectedCase.metrics?.preventedAmount || 0)}
                              </p>
                            </div>
                            <Target className="w-8 h-8 text-blue-500" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-slate-500">Investigation Cost</p>
                              <p className="text-xl font-bold text-orange-600">
                                {formatCurrency(selectedCase.investigation_cost || selectedCase.metrics?.investigationCost || 0)}
                              </p>
                            </div>
                            <Activity className="w-8 h-8 text-orange-500" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* ROI Summary */}
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-sm text-slate-500 mb-2">Total Net ROI</p>
                          <p className={`text-3xl font-bold ${
                            (selectedCase.metrics?.totalRoi || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(selectedCase.metrics?.totalRoi || 0)}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            (Recovered + Prevented) - Investigation Costs
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="timeline" className="space-y-4 mt-6">
                    <div className="space-y-4">
                      {selectedCase.handovers && selectedCase.handovers.length > 0 ? selectedCase.handovers.map((handover, idx) => (
                        <div key={idx} className="flex space-x-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Activity className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">Transfer: {handover.from} → {handover.to}</p>
                              <span className="text-xs text-slate-500">
                                {new Date(handover.timestamp).toLocaleDateString('en-US')} at{' '}
                                {new Date(handover.timestamp).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">{handover.reason}</p>
                            <p className="text-xs text-slate-400">{handover.fromTeam} → {handover.toTeam}</p>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-8">
                          <Activity className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                          <p className="text-slate-500">No transfers in the timeline</p>
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
                <Folder className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600">Select a case to view details</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cases;