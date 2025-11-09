import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  Eye,
  Activity
} from "lucide-react";
import { useRisque, useRisqueStats, useHighRiskMonitoring } from '@/contexts/RisqueContext';

const Risques: React.FC = () => {
  const { state, loadRisques } = useRisque();
  const { stats } = useRisqueStats();
  const { highRiskItems, criticalCount, totalHighRisk } = useHighRiskMonitoring();

  useEffect(() => {
    loadRisques();
  }, [loadRisques]);

  const getRiskLevelColor = (level: string) => {
    const colors = {
      critical: 'bg-red-600 text-white',
      very_high: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800',
      very_low: 'bg-gray-100 text-gray-800',
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Risks</h1>
        <p className="text-slate-600 mt-2">Risk monitoring and dynamic scoring</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Risks</p>
                <p className="text-2xl font-bold text-slate-900">{stats?.total || 0}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">High Risk</p>
                <p className="text-2xl font-bold text-orange-600">{totalHighRisk}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Average Score</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats?.scoreDistribution.average.toFixed(0) || 0}
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk list */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All ({state.risques.length})</TabsTrigger>
          <TabsTrigger value="high">High Risk ({totalHighRisk})</TabsTrigger>
          <TabsTrigger value="critical">Critical ({criticalCount})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {state.risques.map((risque) => (
              <Card key={risque.id} className="cursor-pointer hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">{risque.title}</h3>
                      <p className="text-sm text-slate-600 mt-1">{risque.assureId}</p>
                    </div>
                    <Badge className={getRiskLevelColor(risque.level)}>
                      {risque.level}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {risque.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500">Risk Score</p>
                        <p className="text-lg font-bold text-slate-900">
                          {risque.scoring.finalScore}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Confidence</p>
                        <p className="text-sm font-medium">
                          {(risque.scoring.confidence * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {risque.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {risque.category}
                      </Badge>
                    </div>
                    
                    <Button size="sm" variant="outline" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      Analyze
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="high" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {highRiskItems.map((risque) => (
              <Card key={risque.id} className="cursor-pointer hover:shadow-md border-orange-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">{risque.title}</h3>
                      <p className="text-sm text-slate-600 mt-1">{risque.assureId}</p>
                    </div>
                    <Badge className={getRiskLevelColor(risque.level)}>
                      {risque.level}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-orange-600">
                        Score: {risque.scoring.finalScore}
                      </span>
                      <Badge variant="destructive" className="text-xs">
                        Action Required
                      </Badge>
                    </div>
                    <Button size="sm" className="w-full">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Handle as Priority
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="critical" className="mt-6">
          <div className="text-center py-8 text-slate-500">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-300" />
            <h3 className="text-lg font-medium mb-2">Critical Risks</h3>
            <p>Critical risks require immediate attention</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Risques;