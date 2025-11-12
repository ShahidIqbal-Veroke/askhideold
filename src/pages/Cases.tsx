import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCases } from '@/contexts/CaseContext';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import HeaderKPI from '@/components/HeaderKPI';
import { CreateCaseModal } from '@/components/CreateCaseModal';
import { CaseCard } from '@/components/CaseCard';
import { CaseDetails } from '@/components/CaseDetails';

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
  Search
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
  const [isCreateCaseModalOpen, setIsCreateCaseModalOpen] = useState(false);
  
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

  const kpiCards = [
    {
      icon: <img src="/icons/caseOpen.svg" alt="Open Cases" className="w-5 h-5" />,
      title: "Open Cases",
      value: stats?.open || 0
    },
    {
      icon: <img src="/icons/caseProgress.svg" alt="In Progress" className="w-5 h-5" />,
      title: "In Progress",
      value: stats?.investigating || 0
    },
    {
      icon: <img src="/icons/caseamount.svg" alt="Net ROI" className="w-5 h-5" />,
      title: "Net ROI",
      value: formatCurrency(stats?.financialImpact?.netRoi || 0)
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with KPI */}
      <HeaderKPI
        title="Cases Center"
        subtitle="Management and monitoring of fraud investigations"
        cards={kpiCards}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Cases List (Left) */}
        <div className="col-span-5">
          <Card className="h-[calc(100vh-200px)]">
            <CardHeader>
              <div className="flex justify-between items-center mb-2">
                <CardTitle>Cases</CardTitle>
                <Button
                  onClick={() => setIsCreateCaseModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <img
                    src="/icons/uploadDoc.svg"
                    alt="Upload Document"
                    className="mr-2 h-4 w-4"
                  />
                  Create Case
                </Button>
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
                  <CaseCard
                    key={caseItem.id}
                    caseItem={{
                      id: caseItem.id,
                      reference: caseItem.reference,
                      status: caseItem.status,
                      priority: caseItem.priority,
                      investigation_team: caseItem.investigation_team,
                      assigned_to: caseItem.assigned_to,
                      created_at: caseItem.created_at,
                      estimated_loss: caseItem.estimated_loss,
                      roi_score: caseItem.roi_score,
                    }}
                    isSelected={selectedCase?.id === caseItem.id}
                    onClick={() => selectCase(caseItem.id)}
                    onOpenClick={() => selectCase(caseItem.id)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Case Details (Right) */}
        <div className="col-span-7">
          {selectedCase ? (
            <CaseDetails
              caseItem={selectedCase}
              onStatusChange={handleStatusChange}
              onDecisionChange={handleDecisionChange}
              onUpdateCase={updateCase}
              navigate={navigate}
            />
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

      {/* Create Case Modal */}
      <CreateCaseModal
        open={isCreateCaseModalOpen}
        onOpenChange={setIsCreateCaseModalOpen}
      />
    </div>
  );
};

export default Cases;