import React from 'react';
import { Badge } from '@/components/ui/badge';
import { User, Zap, AlertTriangle, XCircle, Clock, BarChart3, TrendingUp } from 'lucide-react';

export type RiskProfileCardProps = {
  profile: {
    personId: string;
    name: string;
    riskLevel: string;
    riskScore: number;
    totalEvents: number;
    confirmedFrauds: number;
    pendingAlerts: number;
    lastActivity: Date;
    trend: 'increasing' | 'stable' | 'decreasing';
  };
  isSelected?: boolean;
  onClick?: () => void;
  getRiskLevelColor?: (level: string) => string;
};

const defaultGetRiskLevelColor = (level: string) => {
  switch (level) {
    case 'critical': return 'bg-red-100 text-red-800 border-red-200';
    case 'very_high': return 'bg-red-100 text-red-700 border-red-200';
    case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'very_low': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const RiskProfileCard: React.FC<RiskProfileCardProps> = ({
  profile,
  isSelected = false,
  onClick,
  getRiskLevelColor = defaultGetRiskLevelColor
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
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h3 className="font-medium text-slate-900">{profile.name}</h3>
            <p className="text-sm text-slate-500">{profile.personId}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={`${getRiskLevelColor(profile.riskLevel)} flex items-center justify-center`} variant="outline">
            {profile.riskLevel}
          </Badge>
        </div>
      </div>
      
      <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1">
            <Zap className="w-3 h-3 text-blue-500" />
            <span className="font-medium">{profile.totalEvents}</span>
          </div>
          <p className="text-xs text-slate-500">Events</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1">
            <AlertTriangle className="w-3 h-3 text-orange-500" />
            <span className="font-medium">{profile.pendingAlerts}</span>
          </div>
          <p className="text-xs text-slate-500">Alerts</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1">
            <XCircle className="w-3 h-3 text-red-500" />
            <span className="font-medium">{profile.confirmedFrauds}</span>
          </div>
          <p className="text-xs text-slate-500">Frauds</p>
        </div>
      </div>
    </div>
  );
};

export default RiskProfileCard;

