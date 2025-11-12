import React, { useState } from 'react';
import { useNavigate as useNavigateHook } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Folder,
  CheckCircle,
  XCircle,
  TrendingUp,
  DollarSign,
  Activity,
  Target,
  Edit3,
  Save
} from 'lucide-react';

export type CaseDetailsProps = {
  caseItem: {
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
    metrics?: {
      estimatedLoss?: number;
      recoveredAmount?: number;
      preventedAmount?: number;
      investigationCost?: number;
      totalRoi?: number;
    };
  };
  onStatusChange?: (status: string) => void;
  onDecisionChange?: (decision: string, reason: string) => void;
  onUpdateCase?: (caseId: string, updates: any) => void;
  navigate?: (path: string) => void;
};

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

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0
  }).format(amount);
};

export const CaseDetails: React.FC<CaseDetailsProps> = ({
  caseItem,
  onStatusChange,
  onDecisionChange,
  onUpdateCase,
  navigate
}) => {
  const [editingNote, setEditingNote] = useState(false);
  const [newNote, setNewNote] = useState('');
  const defaultNavigate = useNavigateHook();
  const nav = navigate || defaultNavigate;

  const handleStatusChange = (status: string) => {
    if (onStatusChange) {
      onStatusChange(status);
    }
  };

  const handleAddNote = () => {
    if (caseItem && newNote.trim() && onUpdateCase) {
      const currentNotes = caseItem.metadata?.investigation_notes || '';
      const updatedNotes = currentNotes ? `${currentNotes}\n${newNote.trim()}` : newNote.trim();

      onUpdateCase(caseItem.id, {
        metadata: {
          ...caseItem.metadata,
          investigation_notes: updatedNotes
        }
      });
      setNewNote('');
      setEditingNote(false);
    }
  };

  const handleDecisionChange = (decision: string, reason: string) => {
    if (onDecisionChange) {
      onDecisionChange(decision, reason);
    }
  };

  return (
    <Card className="h-[calc(100vh-200px)]">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Folder className="w-5 h-5" />
              <span>{caseItem.reference}</span>
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              Created on {new Date(caseItem.created_at).toLocaleDateString('en-US')}
              {' '}by {caseItem.assigned_to}
            </p>
          </div>
          <div className="flex space-x-2">
            <Badge className={getStatusColor(caseItem.status)} variant="outline">
              {caseItem.status}
            </Badge>
            <Badge className={getPriorityColor(caseItem.priority)} variant="outline">
              {caseItem.priority}
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
                      <span>{caseItem.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Reference:</span>
                      <span>{caseItem.reference}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Team:</span>
                      <span>{caseItem.investigation_team}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-700">Assignment</p>
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Assigned to:</span>
                      <span>{caseItem.assigned_to || 'Unassigned'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Status:</span>
                      <Badge className={getStatusColor(caseItem.status)} variant="outline">
                        {caseItem.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-700">Related Alerts</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {caseItem.alert_ids && caseItem.alert_ids.length > 0 ? caseItem.alert_ids.map((alertId, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="text-xs cursor-pointer hover:bg-blue-200"
                        onClick={() => nav(`/alerts?highlight=${alertId}`)}
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
                    {caseItem.metadata?.fraud_type && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Fraud type:</span>
                        <span>{caseItem.metadata.fraud_type}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500">Estimated loss:</span>
                      <span>{formatCurrency(caseItem.estimated_loss)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Investigation cost:</span>
                      <span>{formatCurrency(caseItem.investigation_cost)}</span>
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
                {caseItem.metadata?.investigation_notes ? (
                  caseItem.metadata.investigation_notes.split('\n').map((note, idx) => (
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
                {caseItem.alert_ids && caseItem.alert_ids.length > 0 ? (
                  caseItem.alert_ids.map((alertId, idx) => (
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
                        {formatCurrency(caseItem.estimated_loss || caseItem.metrics?.estimatedLoss || 0)}
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
                        {formatCurrency(caseItem.metrics?.recoveredAmount || 0)}
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
                        {formatCurrency(caseItem.metrics?.preventedAmount || 0)}
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
                        {formatCurrency(caseItem.investigation_cost || caseItem.metrics?.investigationCost || 0)}
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
                  <p className={`text-3xl font-bold ${(caseItem.metrics?.totalRoi || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {formatCurrency(caseItem.metrics?.totalRoi || 0)}
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
              {caseItem.handovers && caseItem.handovers.length > 0 ? caseItem.handovers.map((handover, idx) => (
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
  );
};

export default CaseDetails;

