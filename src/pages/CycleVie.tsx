import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Eye,
  ArrowRight,
  Users,
  TrendingUp
} from "lucide-react";
import { useCycleVie, useCycleVieStats, useCycleVieAlerts } from '@/contexts/CycleVieContext';

const CycleVie: React.FC = () => {
  const { state, loadCyclesVie, transitionStage } = useCycleVie();
  const { stats } = useCycleVieStats();
  const { alerts } = useCycleVieAlerts();

  useEffect(() => {
    loadCyclesVie();
  }, [loadCyclesVie]);

  const getStageColor = (stage: string) => {
    const colors = {
      souscription: 'bg-blue-100 text-blue-800',
      vie_contrat: 'bg-green-100 text-green-800',
      sinistre_paiement: 'bg-orange-100 text-orange-800',
      resiliation: 'bg-gray-100 text-gray-800',
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      suspended: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Life Cycles</h1>
        <p className="text-slate-600 mt-2">Insured life cycle orchestration</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Cycles</p>
                <p className="text-2xl font-bold text-slate-900">{stats?.total || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats?.byStatus.active || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Anomalies</p>
                <p className="text-2xl font-bold text-red-600">{alerts.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats?.conversionRates.souscription_to_active.toFixed(0) || 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs by stage */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({state.cyclesVie.length})</TabsTrigger>
          <TabsTrigger value="souscription">Subscription ({stats?.byStage.souscription || 0})</TabsTrigger>
          <TabsTrigger value="vie_contrat">Contract Life ({stats?.byStage.vie_contrat || 0})</TabsTrigger>
          <TabsTrigger value="sinistre_paiement">Claim ({stats?.byStage.sinistre_paiement || 0})</TabsTrigger>
          <TabsTrigger value="resiliation">Termination ({stats?.byStage.resiliation || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {state.cyclesVie.map((cycle) => (
              <Card key={cycle.id} className="cursor-pointer hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">{cycle.id}</h3>
                      <p className="text-sm text-slate-600 mt-1">Insured: {cycle.assureId}</p>
                    </div>
                    <Badge className={getStatusColor(cycle.status)}>
                      {cycle.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className={getStageColor(cycle.currentStage)}>
                        {cycle.currentStage}
                      </Badge>
                      <span className="text-sm text-slate-600">
                        {cycle.progression}% completed
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${cycle.progression}%` }}
                      ></div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Stage Duration</p>
                        <p className="font-medium">{cycle.metriques.dureeEtapeActuelle}d</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Claims</p>
                        <p className="font-medium">{cycle.metriques.nombreSinistres}</p>
                      </div>
                    </div>
                    
                    {cycle.validationRequise && (
                      <Badge variant="destructive" className="w-full text-center">
                        Validation required
                      </Badge>
                    )}
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      {cycle.status === 'active' && (
                        <Button size="sm" variant="outline">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tabs for each stage */}
        {['souscription', 'vie_contrat', 'sinistre_paiement', 'resiliation'].map((stage) => (
          <TabsContent key={stage} value={stage} className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {state.cyclesVie
                .filter(cycle => cycle.currentStage === stage)
                .map((cycle) => (
                  <Card key={cycle.id} className="cursor-pointer hover:shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-900">{cycle.assureId}</h3>
                          <p className="text-sm text-slate-600 mt-1">
                            {cycle.metriques.dureeEtapeActuelle} days in this stage
                          </p>
                        </div>
                        <Badge className={getStatusColor(cycle.status)}>
                          {cycle.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="text-sm">
                          <p className="text-slate-500">Pending actions:</p>
                          {cycle.actionsPendantes.length > 0 ? (
                            <ul className="list-disc list-inside text-slate-700">
                              {cycle.actionsPendantes.slice(0, 2).map((action, index) => (
                                <li key={index}>{action}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-green-600">No action required</p>
                          )}
                        </div>
                        
                        <Button size="sm" variant="outline" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          Cycle details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Life cycle alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Life Cycle Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="p-3 bg-red-50 border border-red-200 rounded">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-red-900">{alert.message}</h4>
                      <p className="text-sm text-red-700 mt-1">
                        Cycle: {alert.cycleVieId} • Type: {alert.type}
                      </p>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      {alert.severity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CycleVie;