import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Clock, 
  Upload,
  Activity,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import type { Event } from '@/lib/demoData';

export type EventCardProps = {
  event: Event;
  isSelected?: boolean;
  onClick?: () => void;
  alertCount?: number;
  getStatusColor?: (status: string) => string;
};

const getEventTypeIcon = (type: string) => {
  switch (type) {
    case 'document_upload': return <Upload className="w-4 h-4" />;
    case 'pattern_detection': return <Activity className="w-4 h-4" />;
    case 'manual_review': return <FileText className="w-4 h-4" />;
    case 'system_alert': return <AlertTriangle className="w-4 h-4" />;
    default: return <Zap className="w-4 h-4" />;
  }
};

const defaultGetStatusColor = (status: string) => {
  switch (status) {
    case 'processed': return 'bg-green-100 text-green-800 border-green-200';
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'error': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const EventCard: React.FC<EventCardProps> = ({
  event,
  isSelected = false,
  onClick,
  alertCount = 0,
  getStatusColor = defaultGetStatusColor
}) => {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border cursor-pointer transition-all ${
        isSelected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-slate-200 hover:bg-slate-50'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            {getEventTypeIcon(event.type)}
            <span className="font-medium text-sm">{event.id}</span>
            <Badge className={`${getStatusColor(event.status)} flex items-center justify-center`} variant="outline">
              {event.status}
            </Badge>
          </div>
          
          <p className="text-sm text-slate-600 mb-1">
            {event.type} - {event.source}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <span>{event.data?.userId ? `User: ${event.data.userId}` : 'Automatic system'}</span>
              {alertCount > 0 && (
                <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200 flex items-center justify-center">
                  {alertCount} alert{alertCount > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {event.status === 'processed' ? (
                <CheckCircle className="w-3 h-3 text-green-500" />
              ) : event.status === 'error' ? (
                <XCircle className="w-3 h-3 text-red-500" />
              ) : (
                <Clock className="w-3 h-3 text-orange-500" />
              )}
              <span className="text-xs text-slate-500">
                {new Date(event.timestamp).toLocaleTimeString('en-US', {
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
};

export default EventCard;

