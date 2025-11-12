import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/types/alert.types';
import { getSeverityColor, getUrgencyIndicator } from './AlertCard';
import {
  Clock, AlertTriangle, CheckCircle, XCircle, User, Activity, ExternalLink
} from 'lucide-react';

export type AlertDetailsProps = {
  alert: Alert;
  alertEvents?: Record<string, any>;
  alertCycleVies?: Record<string, any>;
  alertAssures?: Record<string, any>;
  navigate?: (path: string) => void;
  onQualify?: (alertId: string, qualification: string) => void;
};

export const AlertDetails: React.FC<AlertDetailsProps> = ({
  alert,
  alertEvents = {},
  alertCycleVies = {},
  alertAssures = {},
  navigate,
  onQualify
}) => {
  if (!alert) return null;

  const urgency = getUrgencyIndicator(alert);
  const now = new Date();
  const created = new Date((alert as any).created_at || alert.createdAt);
  const hoursOld = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
  const slaThresholds: Record<string, number> = { critical: 2, high: 4, medium: 8, low: 24 };
  const threshold = slaThresholds[alert.severity] || 24;
  const progress = Math.min((hoursOld / threshold) * 100, 100);

  const actions = [
    { 
      key: 'false_positive', 
      label: 'Declare Authentic', 
      icon: CheckCircle, 
      color: 'bg-[#37C311] hover:bg-[#2ea50e] text-white w-[160px]',
      onClick: () => onQualify && onQualify(alert.id, 'false_positive')
    },
    { 
      key: 'fraud_confirmed', 
      label: 'Declare Fraudulent', 
      icon: XCircle, 
      color: 'bg-[#DC2626] hover:bg-[#b91c1c] text-white w-[160px]',
      onClick: () => onQualify && onQualify(alert.id, 'fraud_confirmed')
    },
  ];

  return (
    <div 
      className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#D8D8D8 transparent'
      }}
    >
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-3">
                {urgency.level !== 'normal' && (
                  <div className={`w-2 h-2 rounded-full ${urgency.level === 'overdue' ? 'bg-red-500' :
                    urgency.level === 'urgent' ? 'bg-orange-500' : 'bg-yellow-500'
                    }`} />
                )}
                <CardTitle className="text-2xl">{alert.id}</CardTitle>
                <Badge className={getSeverityColor(alert.severity)} variant="outline">{alert.severity}
                  {urgency.level !== 'normal' && (
                    <Badge variant="outline" className={
                      urgency.level === 'overdue' ? 'text-red-700' :
                        urgency.level === 'urgent' ? 'text-orange-700' :
                          'text-yellow-700'
                    }>
                      {urgency.level === 'overdue' ? '( PAST SLA )' : urgency.level === 'urgent' ? '( URGENT )' : '( WARNING )'}
                    </Badge>
                  )}
                </Badge>
              </div>

              <div className="flex items-center space-x-6 mt-1 text-xs text-black-500" style={{ color: '#000000B2' }}>
                <span><span className='text-lg text-black font-bold'>• </span>Score: <span className="font-medium">{alert.score}%</span></span>
                <span><span className='text-lg text-black font-bold'>• </span>Confidence: <span className="font-medium">{((alert.metadata as any)?.confidence ? ((alert.metadata as any).confidence * 100).toFixed(1) : 'N/A')}%</span></span>
              </div>
              <div className="flex items-center space-x-6 text-xs text-black-500" style={{ color: '#000000B2' }}>
                <span><span className='text-lg text-black font-bold'>• </span>Generated: {new Date((alert as any).created_at || alert.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                <span><span className='text-lg text-black font-bold'>• </span>Created on {new Date((alert as any).created_at || alert.createdAt).toLocaleDateString('en-US')} at {new Date((alert as any).created_at || alert.createdAt).toLocaleTimeString('en-US')}</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              {actions.map(({ key, label, icon: Icon, color, onClick }) => (
                <Button
                  key={key}
                  onClick={onClick}
                  size="sm"
                  className={`text-xs px-3 py-2 flex items-center justify-center gap-1 ${color} w-[170px]`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{label}</span>
                </Button>
              ))}
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
              {alertEvents[alert.id] && navigate && (
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

              {alertAssures[alert.id] && navigate && (
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

      {/* Analysis */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Detailed Analysis</CardTitle></CardHeader>
        <div className="mb-4 px-6 mt-0">
          <div className="flex items-center gap-[20%] w-[100%] border-b border-gray-200 pb-4">
            {[
              { count: alert.metadata.technicalEvidence?.filter((e: any) => e.severity === 'fail').length || 0, label: 'Critical anomalies', color: 'text-red-600' },
              { count: alert.metadata.technicalEvidence?.filter((e: any) => e.severity === 'warn').length || 0, label: 'Warnings', color: 'text-yellow-600' },
              { count: alert.metadata.technicalEvidence?.filter((e: any) => e.severity === 'info').length || 0, label: 'Information', color: 'text-blue-600' }
            ].map(({ count, label, color }) => (
              <div key={label} className="text-center">
                <p className={`text-2xl font-bold ${color}`}>{count}</p>
                <p className="text-xs text-gray-600">{label}</p>
              </div>
            ))}
          </div>
        </div>
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
                            <Badge variant="outline" className={`text-xs ${evidence.severity === 'fail' ? 'border-red-600 text-red-700' :
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
              <div className={`h-4 rounded-full transition-all ${urgency.level === 'overdue' ? 'bg-red-500' :
                urgency.level === 'urgent' ? 'bg-orange-500' :
                  urgency.level === 'approaching' ? 'bg-yellow-500' : 'bg-green-500'
                }`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
            </div>
            <div className={`p-4 rounded-lg ${urgency.level === 'overdue' ? 'bg-red-50 border border-red-200' :
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
                {((alert as any).assigned_to || alert.assignedTo) && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Assignment</span>
                    <span>Assigned to {(alert as any).assigned_to || alert.assignedTo}</span>
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
    </div>
  );
};

export default AlertDetails;

