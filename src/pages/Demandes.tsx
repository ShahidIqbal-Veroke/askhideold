import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, 
  Plus, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Archive,
  Filter,
  FileText,
  User,
  Calendar,
  ArrowUpDown,
  Eye,
  Edit,
  MoreHorizontal
} from "lucide-react";
import { useDemande, useDemandeStats, useDemandeWorkflow, useDemandePriority } from '@/contexts/DemandeContext';
import { Demande, DemandeStatus, DemandePriority, DemandeType } from '@/types/demande.types';

const Demandes: React.FC = () => {
  const { 
    state, 
    loadDemandes, 
    searchDemandes, 
    setCurrentDemande,
    setFilters 
  } = useDemande();
  
  const { stats } = useDemandeStats();
  const { processWorkflow, overdueDemandes, pendingValidationDemandes } = useDemandeWorkflow();
  const { urgentDemandes, totalHighPriority } = useDemandePriority();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [selectedDemande, setSelectedDemande] = useState<Demande | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    loadDemandes();
  }, [loadDemandes]);

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      await searchDemandes(term);
    } else {
      await loadDemandes();
    }
  };

  const handleFilter = async () => {
    const filters: any = {};
    
    if (filterStatus !== 'all') {
      filters.statuses = [filterStatus as DemandeStatus];
    }
    
    if (filterPriority !== 'all') {
      filters.priorities = [filterPriority as DemandePriority];
    }

    setFilters(filters);
    await loadDemandes(filters);
  };

  const handleWorkflowAction = async (
    demande: Demande, 
    action: 'approve' | 'reject' | 'archive' | 'escalate'
  ) => {
    try {
      await processWorkflow(demande.id, action);
      await loadDemandes(state.filters);
    } catch (error) {
      console.error('Workflow error:', error);
    }
  };

  const getStatusIcon = (status: DemandeStatus) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending_validation': return <Clock className="h-4 w-4 text-orange-600" />;
      case 'escalated': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <FileText className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusBadge = (status: DemandeStatus) => {
    const colors = {
      received: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      pending_validation: 'bg-orange-100 text-orange-800',
      pending_documents: 'bg-purple-100 text-purple-800',
      pending_payment: 'bg-indigo-100 text-indigo-800',
      completed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      escalated: 'bg-red-100 text-red-800',
      suspended: 'bg-gray-100 text-gray-800',
    };
    
    return <Badge className={colors[status]}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: DemandePriority) => {
    const colors = {
      critical: 'bg-red-600 text-white',
      urgent: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800',
    };
    
    return <Badge className={colors[priority]}>{priority}</Badge>;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const isOverdue = (demande: Demande) => {
    return !demande.sla.respectSLA || demande.sla.dateEcheance < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Requests</h1>
          <p className="text-slate-600 mt-2">
            Entry point for all interactions - Active workflow to History
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new request</DialogTitle>
              <DialogDescription>
                Creation form to be implemented
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 text-center text-slate-500">
              Request creation form to be implemented
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total</p>
                <p className="text-2xl font-bold text-slate-900">{stats?.total || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">High Priority</p>
                <p className="text-2xl font-bold text-red-600">{totalHighPriority}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Overdue</p>
                <p className="text-2xl font-bold text-orange-600">{overdueDemandes.length}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Validation</p>
                <p className="text-2xl font-bold text-purple-600">{pendingValidationDemandes.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">SLA Compliant</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats?.slaMetrics.totalRespectSLA.toFixed(0) || 0}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search by subject, tracking number, or insured..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="pending_validation">Pending Validation</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={handleFilter}>
                <Filter className="h-4 w-4 mr-2" />
                Apply
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different views */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({state.demandes.length})</TabsTrigger>
          <TabsTrigger value="urgent">Urgent ({urgentDemandes.length})</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({overdueDemandes.length})</TabsTrigger>
          <TabsTrigger value="validation">Validation ({pendingValidationDemandes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <DemandesList 
            demandes={state.demandes}
            onSelect={setSelectedDemande}
            onWorkflowAction={handleWorkflowAction}
            loading={state.loading}
          />
        </TabsContent>

        <TabsContent value="urgent" className="mt-6">
          <DemandesList 
            demandes={urgentDemandes}
            onSelect={setSelectedDemande}
            onWorkflowAction={handleWorkflowAction}
            loading={state.loading}
          />
        </TabsContent>

        <TabsContent value="overdue" className="mt-6">
          <DemandesList 
            demandes={overdueDemandes}
            onSelect={setSelectedDemande}
            onWorkflowAction={handleWorkflowAction}
            loading={state.loading}
          />
        </TabsContent>

        <TabsContent value="validation" className="mt-6">
          <DemandesList 
            demandes={pendingValidationDemandes}
            onSelect={setSelectedDemande}
            onWorkflowAction={handleWorkflowAction}
            loading={state.loading}
          />
        </TabsContent>
      </Tabs>

      {/* Selected request detail */}
      {selectedDemande && (
        <DemandeDetail 
          demande={selectedDemande}
          onClose={() => setSelectedDemande(null)}
          onWorkflowAction={(action) => handleWorkflowAction(selectedDemande, action)}
        />
      )}
    </div>
  );
};

// Component for the requests list
interface DemandesListProps {
  demandes: Demande[];
  onSelect: (demande: Demande) => void;
  onWorkflowAction: (demande: Demande, action: 'approve' | 'reject' | 'archive' | 'escalate') => void;
  loading: boolean;
}

const DemandesList: React.FC<DemandesListProps> = ({ demandes, onSelect, onWorkflowAction, loading }) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3">Loading requests...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (demandes.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-slate-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium mb-2">No requests found</h3>
            <p>No requests match the selected criteria.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: DemandeStatus) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending_validation': return <Clock className="h-4 w-4 text-orange-600" />;
      case 'escalated': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <FileText className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusBadge = (status: DemandeStatus) => {
    const colors = {
      received: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      pending_validation: 'bg-orange-100 text-orange-800',
      pending_documents: 'bg-purple-100 text-purple-800',
      pending_payment: 'bg-indigo-100 text-indigo-800',
      completed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      escalated: 'bg-red-100 text-red-800',
      suspended: 'bg-gray-100 text-gray-800',
    };
    
    return <Badge className={colors[status]}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: DemandePriority) => {
    const colors = {
      critical: 'bg-red-600 text-white',
      urgent: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800',
    };
    
    return <Badge className={colors[priority]}>{priority}</Badge>;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const isOverdue = (demande: Demande) => {
    return !demande.sla.respectSLA || demande.sla.dateEcheance < new Date();
  };

  return (
    <div className="space-y-4">
      {demandes.map((demande) => (
        <Card 
          key={demande.id} 
          className={`cursor-pointer transition-all hover:shadow-md ${
            isOverdue(demande) ? 'border-l-4 border-l-red-500' : ''
          }`}
          onClick={() => onSelect(demande)}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  {getStatusIcon(demande.status)}
                  <h3 className="text-lg font-semibold text-slate-900 truncate">
                    {demande.objet}
                  </h3>
                  {isOverdue(demande) && (
                    <Badge variant="destructive" className="text-xs">
                      Overdue
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                  <span className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    {demande.numeroSuivi}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {demande.demandeur.identite.nom} {demande.demandeur.identite.prenom}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(demande.createdAt)}
                  </span>
                </div>
                
                <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                  {demande.description}
                </p>
                
                <div className="flex items-center gap-2">
                  {getStatusBadge(demande.status)}
                  {getPriorityBadge(demande.priority)}
                  <Badge variant="outline" className="text-xs">
                    {demande.type}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(demande);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                
                {demande.status === 'pending_validation' && (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-green-600 border-green-200 hover:bg-green-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        onWorkflowAction(demande, 'approve');
                      }}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        onWorkflowAction(demande, 'reject');
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </>
                )}
                
                {demande.status === 'completed' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onWorkflowAction(demande, 'archive');
                    }}
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Component for request detail
interface DemandeDetailProps {
  demande: Demande;
  onClose: () => void;
  onWorkflowAction: (action: 'approve' | 'reject' | 'archive' | 'escalate') => void;
}

const DemandeDetail: React.FC<DemandeDetailProps> = ({ demande, onClose, onWorkflowAction }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{demande.objet}</CardTitle>
            <CardDescription>
              {demande.numeroSuivi} • Created on {new Intl.DateTimeFormat('en-US').format(new Date(demande.createdAt))}
            </CardDescription>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="details" className="w-full">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
            <TabsTrigger value="communications">Communications</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">General Information</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Type:</strong> {demande.type}</div>
                  <div><strong>Category:</strong> {demande.category}</div>
                  <div><strong>Priority:</strong> {demande.priority}</div>
                  <div><strong>Channel:</strong> {demande.channel}</div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Requester</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Name:</strong> {demande.demandeur.identite.nom} {demande.demandeur.identite.prenom}</div>
                  <div><strong>Email:</strong> {demande.demandeur.identite.email}</div>
                  <div><strong>Phone:</strong> {demande.demandeur.identite.telephone}</div>
                  <div><strong>Quality:</strong> {demande.demandeur.qualite}</div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-sm text-slate-600">{demande.description}</p>
            </div>
          </TabsContent>
          
          <TabsContent value="workflow" className="mt-6">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="text-green-600"
                  onClick={() => onWorkflowAction('approve')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button 
                  variant="outline" 
                  className="text-red-600"
                  onClick={() => onWorkflowAction('reject')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button 
                  variant="outline" 
                  className="text-blue-600"
                  onClick={() => onWorkflowAction('archive')}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </Button>
                <Button 
                  variant="outline" 
                  className="text-orange-600"
                  onClick={() => onWorkflowAction('escalate')}
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Escalate
                </Button>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Processing History</h4>
                <div className="space-y-2">
                  {demande.traitement.historiqueTRaitement.map((action, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded">
                      <div className="text-sm">
                        <div className="font-medium">{action.action}</div>
                        <div className="text-slate-500">
                          {action.auteur} • {new Intl.DateTimeFormat('fr-FR').format(new Date(action.date))}
                        </div>
                        {action.commentaire && (
                          <div className="text-slate-600 mt-1">{action.commentaire}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="communications" className="mt-6">
            <div className="text-center py-8 text-slate-500">
              Communications for this request
              <br />
              <small className="text-xs">List of exchanges with the requester</small>
            </div>
          </TabsContent>
          
          <TabsContent value="documents" className="mt-6">
            <div className="text-center py-8 text-slate-500">
              Documents associated with this request
              <br />
              <small className="text-xs">Attachments and supporting documents</small>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Demandes;