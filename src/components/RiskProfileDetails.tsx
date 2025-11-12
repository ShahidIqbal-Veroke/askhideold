import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, AlertTriangle, XCircle, Shield } from 'lucide-react';

export type RiskProfileDetailsProps = {
  personData: {
    personId: string;
    summary: {
      totalEvents: number;
      totalAlerts: number;
      confirmedFrauds: number;
      currentRiskLevel: string;
    };
    riskProfile?: {
      riskScore?: number | string;
      riskFactors?: {
        [key: string]: number;
      };
    };
  };
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

export const RiskProfileDetails: React.FC<RiskProfileDetailsProps> = ({
  personData,
  getRiskLevelColor = defaultGetRiskLevelColor
}) => {
  return (
    <Card className="h-[calc(100vh-280px)]">
      <CardHeader className="flex-shrink-0">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{personData.personId}</CardTitle>
            <p className="text-sm text-slate-600 mt-1">
            Complete Summary
            </p>
          </div>
          <Badge className={`${getRiskLevelColor(personData.summary.currentRiskLevel)} flex items-center justify-center`} variant="outline">
            {personData.summary.currentRiskLevel}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="overflow-y-auto max-h-[calc(100%-120px)]">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Zap className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{personData.summary.totalEvents}</p>
                    <p className="text-sm text-slate-600">Total events</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-8 h-8 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">{personData.summary.totalAlerts}</p>
                    <p className="text-sm text-slate-600">Generated alerts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <XCircle className="w-8 h-8 text-red-600" />
                  <div>
                    <p className="text-2xl font-bold">{personData.summary.confirmedFrauds}</p>
                    <p className="text-sm text-slate-600">Confirmed frauds</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Shield className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-lg font-bold">{personData.riskProfile?.riskScore || 'N/A'}</p>
                    <p className="text-sm text-slate-600">Risk score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Event-Driven Architecture</h4>
            <p className="text-sm text-slate-600">
              This person's risk profile is calculated in real-time based on events.
              Only alerts confirmed as frauds impact the risk score, respecting
              the conditional feedback principle.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskProfileDetails;

