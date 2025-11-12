import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/types/alert.types';
import { User, Link as LinkIcon, ArrowLeft } from 'lucide-react';

// Helper Functions - Exported for reuse
export const getSeverityColor = (severity: string) => {
  const colors: Record<string, string> = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200'
  };
  return colors[severity] || 'bg-gray-100 text-gray-800';
};

export const getUrgencyIndicator = (alert: Alert) => {
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

export type AlertCardProps = {
  alert: Alert;
  isSelected?: boolean;
  onClick?: () => void;
  alertEvents?: Record<string, any>;
  alertAssures?: Record<string, any>;
  alertCycleVies?: Record<string, any>;
  navigate?: (path: string) => void;
};

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  isSelected = false,
  onClick,
  alertEvents = {},
  alertAssures = {},
  alertCycleVies = {},
  navigate
}) => {
  const urgency = getUrgencyIndicator(alert);
  const bgClass = isSelected ? 'border-blue-500 bg-blue-50' :
    urgency.level === 'overdue' ? 'border-red-200 bg-red-50' :
      urgency.level === 'urgent' ? 'border-orange-200 bg-orange-50' :
        'border-slate-200 hover:bg-slate-50';

  return (
    <div onClick={onClick} className={`p-4 rounded-lg border cursor-pointer transition-all ${bgClass} ${urgency.pulse ? '' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1 justify-between w-full">
            <div className="flex items-center space-x-1">
              {urgency.level !== 'normal' && (
                <div className={`w-2 h-2 rounded-full ${urgency.level === 'overdue' ? 'bg-red-500' :
                  urgency.level === 'urgent' ? 'bg-orange-500' : 'bg-yellow-500'
                  }`} />
              )}
              <span className="font-medium text-lg">{" "}{alert.id}</span>
            </div>
            <Badge className={getSeverityColor(alert.severity)} variant="outline">{alert.severity}</Badge>
          </div>

          <div className="flex items-center space-x-2 mb-1 justify-between w-full flex-wrap font-semibold">
            <p className="text-xs text-black-600 mb-1">Document Type: <span>
              {alert.metadata.documentType?.length > 7
                ? alert.metadata.documentType.substring(0, 7) + '...'
                : alert.metadata.documentType}
            </span>
            </p>
            {alertEvents[alert.id] && navigate && (
              <div className="flex items-center space-x-2 mb-2 text-xs">
                <LinkIcon className="w-3 h-3 text-slate-400" />
                <span className="text-xs text-black-500">Source:</span>
                <button onClick={(e) => { e.stopPropagation(); navigate(`/events?highlight=${alertEvents[alert.id].id}`); }} className="text-blue-600 hover:text-blue-800 hover:underline font-medium" >
                  {alertEvents[alert.id].type?.length > 7
                    ? alertEvents[alert.id].type.substring(0, 7) + '...'
                    : alertEvents[alert.id].type}
                  {' '}
                  {alertEvents[alert.id].id?.length > 5
                    ? '(' + alertEvents[alert.id].id.substring(0, 5) + '...)'
                    : alertEvents[alert.id].id}
                </button>
                <ArrowLeft className="w-3 h-3 text-slate-400" />
              </div>
            )}
          </div>
          {(alertAssures[alert.id] || alertCycleVies[alert.id]) && (
            <div className="flex flex-wrap justify-between mb-1 text-xs">
              {alertAssures[alert.id] && (
                <Badge variant="outline" className="text-xs bg-blue-50">
                  <User className="w-3 h-3 mr-1" />
                  <span className="text-xs text-black-500 font-normal">Related Insured:</span>
                  {alertAssures[alert.id].prenom?.length > 7
                    ? alertAssures[alert.id].prenom.substring(0, 7) + '...'
                    : alertAssures[alert.id].prenom}{' '}
                  {alertAssures[alert.id].nom?.length > 7
                    ? alertAssures[alert.id].nom.substring(0, 7) + '...'
                    : alertAssures[alert.id].nom}
                </Badge>
              )}
              {alertCycleVies[alert.id] && (
                <Badge variant="outline" className="text-xs bg-green-50"><span className="text-xs text-black-500 font-normal">Lifecycle:</span>
                  {alertCycleVies[alert.id].stage?.length > 7
                    ? alertCycleVies[alert.id].stage.substring(0, 7) + '...'
                    : alertCycleVies[alert.id].stage}
                  {' - '}
                  {alertCycleVies[alert.id].type?.length > 7
                    ? alertCycleVies[alert.id].type.substring(0, 7) + '...'
                    : alertCycleVies[alert.id].type}
                </Badge>
              )}
            </div>
          )}
          <div className="flex items-center justify-between flex-wrap mt-1">
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <span><span className='text-lg text-black font-bold'>•</span> Score: {alert.score}%</span>
              {((alert as any).assigned_to || alert.assignedTo) && (<> <span className='text-lg text-black font-bold'>•</span> <span> Assigned to:{' '} {((alert as any).assigned_to || alert.assignedTo).length > 15 ? ((alert as any).assigned_to || alert.assignedTo).substring(0, 15) + '...' : ((alert as any).assigned_to || alert.assignedTo)}  </span>  </>)}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500">
                <span className='text-lg text-black font-bold'>• </span>
                Generated: {' '}
                {new Date((alert as any).created_at || alert.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertCard;

