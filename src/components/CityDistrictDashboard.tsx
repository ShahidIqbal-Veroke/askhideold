import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';
import { 
  Building2, Shield, FileText, Brain, 
  Car, Heart, Home, Building, Plane,
  TrendingUp, AlertTriangle, CheckCircle, Clock,
  Users, Target, DollarSign, Activity
} from 'lucide-react';
import { fraudCatalogService } from '@/services/fraudCatalogService';
import { intelligentRoutingService } from '@/services/intelligentRoutingService';
import { FraudCitySource, BusinessDistrict, GovernanceMetrics } from '@/types/fraud-catalog.types';

// Types pour les métriques dashboard
interface CityMetrics {
  source: FraudCitySource;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  alerts_generated: number;
  avg_processing_time: number;
  success_rate: number;
  resource_utilization: number;
  trend: number; // % change vs previous period
}

interface DistrictMetrics {
  district: BusinessDistrict;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  active_cases: number;
  avg_resolution_time: number;
  customer_impact: number;
  financial_recovery: number;
  trend: number;
}

const CityDistrictDashboard: React.FC = () => {
  const [governanceMetrics, setGovernanceMetrics] = useState<GovernanceMetrics | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, [selectedPeriod]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const metrics = await fraudCatalogService.getGovernanceMetrics();
      setGovernanceMetrics(metrics);
    } catch (error) {
      console.error('Erreur chargement métriques:', error);
    } finally {
      setLoading(false);
    }
  };

  // Configuration des métriques Ville (Sources)
  const cityMetrics: CityMetrics[] = [
    {
      source: 'cyber',
      name: 'Cyber',
      icon: Shield,
      color: 'text-blue-600',
      alerts_generated: governanceMetrics?.city_metrics.cyber?.alerts_generated || 47,
      avg_processing_time: governanceMetrics?.city_metrics.cyber?.avg_processing_time || 48,
      success_rate: governanceMetrics?.city_metrics.cyber?.success_rate || 0.92,
      resource_utilization: governanceMetrics?.city_metrics.cyber?.resource_utilization || 0.85,
      trend: 12
    },
    {
      source: 'aml',
      name: 'AML',
      icon: Building2,
      color: 'text-green-600',
      alerts_generated: governanceMetrics?.city_metrics.aml?.alerts_generated || 23,
      avg_processing_time: governanceMetrics?.city_metrics.aml?.avg_processing_time || 36,
      success_rate: governanceMetrics?.city_metrics.aml?.success_rate || 0.88,
      resource_utilization: governanceMetrics?.city_metrics.aml?.resource_utilization || 0.72,
      trend: -3
    },
    {
      source: 'documentaire',
      name: 'Documentaire',
      icon: FileText,
      color: 'text-orange-600',
      alerts_generated: governanceMetrics?.city_metrics.documentaire?.alerts_generated || 156,
      avg_processing_time: governanceMetrics?.city_metrics.documentaire?.avg_processing_time || 24,
      success_rate: governanceMetrics?.city_metrics.documentaire?.success_rate || 0.78,
      resource_utilization: governanceMetrics?.city_metrics.documentaire?.resource_utilization || 0.95,
      trend: 8
    },
    {
      source: 'comportemental',
      name: 'Comportemental',
      icon: Brain,
      color: 'text-purple-600',
      alerts_generated: governanceMetrics?.city_metrics.comportemental?.alerts_generated || 89,
      avg_processing_time: governanceMetrics?.city_metrics.comportemental?.avg_processing_time || 18,
      success_rate: governanceMetrics?.city_metrics.comportemental?.success_rate || 0.65,
      resource_utilization: governanceMetrics?.city_metrics.comportemental?.resource_utilization || 0.68,
      trend: 25
    }
  ];

  // Configuration des métriques Quartier (Métier)
  const districtMetrics: DistrictMetrics[] = [
    {
      district: 'auto',
      name: 'Auto',
      icon: Car,
      color: 'text-blue-600',
      active_cases: governanceMetrics?.district_metrics.auto?.active_cases || 45,
      avg_resolution_time: governanceMetrics?.district_metrics.auto?.avg_resolution_time || 72,
      customer_impact: governanceMetrics?.district_metrics.auto?.customer_impact || 0.15,
      financial_recovery: governanceMetrics?.district_metrics.auto?.financial_recovery || 125000,
      trend: 5
    },
    {
      district: 'sante',
      name: 'Santé',
      icon: Heart,
      color: 'text-green-600',
      active_cases: governanceMetrics?.district_metrics.sante?.active_cases || 23,
      avg_resolution_time: governanceMetrics?.district_metrics.sante?.avg_resolution_time || 96,
      customer_impact: governanceMetrics?.district_metrics.sante?.customer_impact || 0.08,
      financial_recovery: governanceMetrics?.district_metrics.sante?.financial_recovery || 89000,
      trend: -2
    },
    {
      district: 'habitation',
      name: 'Habitation',
      icon: Home,
      color: 'text-yellow-600',
      active_cases: governanceMetrics?.district_metrics.habitation?.active_cases || 17,
      avg_resolution_time: governanceMetrics?.district_metrics.habitation?.avg_resolution_time || 48,
      customer_impact: governanceMetrics?.district_metrics.habitation?.customer_impact || 0.12,
      financial_recovery: governanceMetrics?.district_metrics.habitation?.financial_recovery || 67000,
      trend: 15
    },
    {
      district: 'professionnelle',
      name: 'Pro',
      icon: Building,
      color: 'text-purple-600',
      active_cases: governanceMetrics?.district_metrics.professionnelle?.active_cases || 12,
      avg_resolution_time: governanceMetrics?.district_metrics.professionnelle?.avg_resolution_time || 120,
      customer_impact: governanceMetrics?.district_metrics.professionnelle?.customer_impact || 0.05,
      financial_recovery: governanceMetrics?.district_metrics.professionnelle?.financial_recovery || 234000,
      trend: 8
    },
    {
      district: 'voyage',
      name: 'Voyage',
      icon: Plane,
      color: 'text-gray-600',
      active_cases: governanceMetrics?.district_metrics.voyage?.active_cases || 8,
      avg_resolution_time: governanceMetrics?.district_metrics.voyage?.avg_resolution_time || 24,
      customer_impact: governanceMetrics?.district_metrics.voyage?.customer_impact || 0.03,
      financial_recovery: governanceMetrics?.district_metrics.voyage?.financial_recovery || 23000,
      trend: -5
    }
  ];

  // Données pour graphiques
  const cityVolumeData = cityMetrics.map(city => ({
    name: city.name,
    alerts: city.alerts_generated,
    success_rate: city.success_rate * 100,
    efficiency: (city.success_rate * city.resource_utilization) * 100
  }));

  const districtFinancialData = districtMetrics.map(district => ({
    name: district.name,
    recovery: district.financial_recovery / 1000, // En K€
    cases: district.active_cases,
    impact: district.customer_impact * 100
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Chargement des métriques décloisonnées...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header avec sélecteur période */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">🏙️ Architecture Décloisonnée</h1>
          <p className="text-gray-600">Vue Ville & Quartiers - Lutte Anti-Fraude Unifiée</p>
        </div>
        
        <div className="flex gap-2">
          {(['today', 'week', 'month'] as const).map(period => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
            >
              {period === 'today' ? 'Aujourd\'hui' : 
               period === 'week' ? 'Cette semaine' : 'Ce mois'}
            </Button>
          ))}
        </div>
      </div>

      {/* Métriques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ROI Global</p>
                <p className="text-2xl font-bold text-green-600">
                  €{(governanceMetrics?.total_roi || 2340000).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">+23% vs période précédente</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">SLA Compliance</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round((governanceMetrics?.sla_compliance_rate || 0.94) * 100)}%
                </p>
                <p className="text-xs text-gray-500">
                  {governanceMetrics?.rules_active || 47} règles actives
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Efficacité</p>
                <p className="text-2xl font-bold text-purple-600">
                  +{Math.round((governanceMetrics?.efficiency_gain || 0.23) * 100)}%
                </p>
                <p className="text-xs text-gray-500">Gain opérationnel</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Escalades</p>
                <p className="text-2xl font-bold text-orange-600">
                  {Math.round((governanceMetrics?.escalation_rate || 0.08) * 100)}%
                </p>
                <p className="text-xs text-gray-500">Taux normal</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ville" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ville">🏙️ Vue Ville</TabsTrigger>
          <TabsTrigger value="quartiers">🏘️ Vue Quartiers</TabsTrigger>
          <TabsTrigger value="coordination">🤝 Coordination</TabsTrigger>
        </TabsList>

        {/* Vue Ville - Sources Décloisonnées */}
        <TabsContent value="ville" className="space-y-6">
          
          {/* Cartes sources Ville */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cityMetrics.map((city) => {
              const IconComponent = city.icon;
              return (
                <Card key={city.source} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <IconComponent className={`h-5 w-5 ${city.color}`} />
                          <p className="font-medium">{city.name}</p>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-2xl font-bold">{city.alerts_generated}</div>
                          <div className="text-xs text-gray-500">alertes générées</div>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <span>Succès: {Math.round(city.success_rate * 100)}%</span>
                            <Badge variant={city.trend > 0 ? 'default' : 'secondary'} className="text-xs">
                              {city.trend > 0 ? '+' : ''}{city.trend}%
                            </Badge>
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            Traitement: {city.avg_processing_time}h
                          </div>
                          
                          <Progress 
                            value={city.resource_utilization * 100} 
                            className="h-2"
                          />
                          <div className="text-xs text-gray-500">
                            Utilisation: {Math.round(city.resource_utilization * 100)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Graphiques Ville */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Volume & Performance par Source</CardTitle>
                <CardDescription>Alertes générées vs taux de succès</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={cityVolumeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="alerts" fill="#3b82f6" name="Alertes" />
                    <Bar yAxisId="right" dataKey="success_rate" fill="#10b981" name="Succès %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Efficacité Opérationnelle</CardTitle>
                <CardDescription>Performance globale par source</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={cityVolumeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="efficiency"
                      nameKey="name"
                    >
                      {cityVolumeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={
                          index === 0 ? '#3b82f6' :
                          index === 1 ? '#10b981' :
                          index === 2 ? '#f59e0b' : '#8b5cf6'
                        } />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Vue Quartiers - Contexte Métier */}
        <TabsContent value="quartiers" className="space-y-6">
          
          {/* Cartes Quartiers */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {districtMetrics.map((district) => {
              const IconComponent = district.icon;
              return (
                <Card key={district.district} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <IconComponent className={`h-5 w-5 ${district.color}`} />
                        <p className="font-medium">{district.name}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-2xl font-bold">{district.active_cases}</div>
                        <div className="text-xs text-gray-500">dossiers actifs</div>
                        
                        <div className="text-sm font-medium text-green-600">
                          €{(district.financial_recovery / 1000).toFixed(0)}K
                        </div>
                        <div className="text-xs text-gray-500">récupérés</div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant={district.trend > 0 ? 'default' : 'secondary'} className="text-xs">
                            {district.trend > 0 ? '+' : ''}{district.trend}%
                          </Badge>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          Résolution: {district.avg_resolution_time}h
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          Impact client: {Math.round(district.customer_impact * 100)}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Graphiques Quartiers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Financière par Quartier</CardTitle>
                <CardDescription>Montants récupérés vs nombre de dossiers</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={districtFinancialData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="recovery" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Récupéré (K€)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Impact Client par Quartier</CardTitle>
                <CardDescription>Niveau d'impact sur l'expérience client</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={districtFinancialData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="impact" stroke="#ef4444" strokeWidth={2} name="Impact %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Vue Coordination */}
        <TabsContent value="coordination" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <Card>
              <CardHeader>
                <CardTitle>🤝 Coordination Multi-Équipes</CardTitle>
                <CardDescription>Dossiers nécessitant une coordination</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                    <div>
                      <p className="font-medium">Cyber → Auto</p>
                      <p className="text-sm text-gray-600">3 dossiers actifs</p>
                    </div>
                    <Badge variant="default">En cours</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <div>
                      <p className="font-medium">AML → Santé</p>
                      <p className="text-sm text-gray-600">1 dossier prioritaire</p>
                    </div>
                    <Badge variant="default">Urgent</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
                    <div>
                      <p className="font-medium">Documentaire → Multi</p>
                      <p className="text-sm text-gray-600">5 dossiers transversaux</p>
                    </div>
                    <Badge variant="secondary">Standard</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>⚡ Escalades Automatiques</CardTitle>
                <CardDescription>Triggers et escalades en cours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                    <div>
                      <p className="font-medium">SLA Critique</p>
                      <p className="text-sm text-gray-600">2 dossiers &lt; 6h</p>
                    </div>
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                    <div>
                      <p className="font-medium">Capacité Saturée</p>
                      <p className="text-sm text-gray-600">Équipe Auto 95%</p>
                    </div>
                    <Users className="h-5 w-5 text-yellow-500" />
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <div>
                      <p className="font-medium">Auto-Routage</p>
                      <p className="text-sm text-gray-600">12 alertes routées</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CityDistrictDashboard;