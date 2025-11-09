/**
 * Fraud Qualification Dashboard - Manager
 * Dashboard for governance and operational management
 * of fraud alert detection and qualification (manager view)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, XCircle, Target, Bell } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { FraudQualificationKPIService, AlertQualificationKPIs } from '@/services/fraudQualificationKPIService';
import { Loader2 } from 'lucide-react';
import MarimekkoChart from '@/components/MarimekkoChart';
import DocumentFraudMarimekko from '@/components/DocumentFraudMarimekko';

const COLORS = {
  ok: '#22c55e',      // green-500
  ko: '#ef4444',      // red-500
  investigation: '#f59e0b', // amber-500
  pending: '#6b7280',  // gray-500
  primary: '#3b82f6', // blue-500
  secondary: '#8b5cf6' // violet-500
};

export default function DashboardGestionnaire() {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState<AlertQualificationKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  useEffect(() => {
    loadKPIs();
  }, [selectedPeriod]);

  const loadKPIs = async () => {
    try {
      setLoading(true);
      const data = await FraudQualificationKPIService.calculateFraudQualificationKPIs();
      setKpis(data);
    } catch (error) {
      console.error('Error loading KPIs:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshKPIs = async () => {
    setRefreshing(true);
    await loadKPIs();
    setRefreshing(false);
  };

  const generateRecommendations = () => {
    if (!kpis) return [];
    return FraudQualificationKPIService.generateRecommendations(kpis);
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading qualification KPIs...</span>
          </div>
        </div>
    );
  }

  if (!kpis) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Data not available</h3>
            <p className="text-gray-600">Unable to load qualification KPIs</p>
          </div>
        </div>
    );
  }

  // Data for charts
  const alertQualificationData = [
    { name: 'Qualified OK', value: kpis.alertes.qualifiees_ok, color: COLORS.ok },
    { name: 'Qualified KO', value: kpis.alertes.qualifiees_ko, color: COLORS.ko },
    { name: 'Under Investigation', value: kpis.alertes.en_investigation, color: COLORS.investigation },
    { name: 'Not Qualified', value: kpis.alertes.non_qualifiees, color: COLORS.pending }
  ];

  const secteurData = kpis.typologie_mapping.par_secteur.map(secteur => ({
    name: secteur.secteur,
    alertes: secteur.alertes_generees,
    fraudes: secteur.fraudes_confirmees,
    taux: secteur.taux_reussite
  }));

  const strategieData = kpis.donnees_brutes.strategies_commerciales.map(strategy => ({
    name: strategy.assureur,
    tolerance: strategy.politique_tolerance,
    impact: strategy.impact_business,
    ignorees: strategy.alertes_ignorees_volontairement
  }));


  return (
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Fraud Qualification - Manager
            </h1>
            <p className="text-gray-600">
              Operational management and fraud alert qualification
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border rounded-md"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 3 months</option>
            </select>
            <Button
                onClick={refreshKPIs}
                disabled={refreshing}
                variant="outline"
                size="sm"
            >
              {refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                  'Refresh'
              )}
            </Button>
          </div>
        </div>

        {/* Main KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">91%</div>
              <p className="text-xs text-muted-foreground">
                True frauds / Total qualified
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed Fraud</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5%</div>
              <p className="text-xs text-muted-foreground">
                Confirmed fraudulent cases
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">75% Threshold Compliance</CardTitle>
              {kpis.gouvernance.respect_seuil_75_pourcent ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {kpis.gouvernance.respect_seuil_75_pourcent ? 'YES' : 'NO'}
              </div>
              <p className="text-xs text-muted-foreground">
                Delta: {kpis.gouvernance.delta_detection_traitement}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Alert</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{kpis.alertes.non_qualifiees}</div>
              <p className="text-xs text-muted-foreground">
                Pending alerts
              </p>
              <Button 
                size="sm" 
                className="mt-2 w-full" 
                variant="outline"
                onClick={() => navigate('/alerts')}
              >
                View alerts
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main tabs */}
        <Tabs defaultValue="qualification" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="qualification">Qualification</TabsTrigger>
            <TabsTrigger value="gouvernance">Governance</TabsTrigger>
            <TabsTrigger value="typologie">Typology</TabsTrigger>
            <TabsTrigger value="recommandations">Actions</TabsTrigger>
          </TabsList>

          {/* Qualification Tab */}
          <TabsContent value="qualification" className="space-y-4">
            {/* Document x fraud distribution - Marimekko Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Document × Fraud Type Cross-Analysis</CardTitle>
                <CardDescription>
                  Distribution of frauds by document type and fraud nature
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentFraudMarimekko 
                  data={kpis.distribution_document_fraude?.documents || []} 
                  height={400} 
                />
                
                {/* Evolution compared to previous period */}
                <div className="mt-4 pt-3 border-t">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Evolution vs previous period</span>
                    <span className={`font-semibold ${
                      kpis.distribution_fraude.tendance_evolution.evolution_percentage >= 0 
                        ? 'text-red-600' 
                        : 'text-green-600'
                    }`}>
                      {kpis.distribution_fraude.tendance_evolution.evolution_percentage >= 0 ? '+' : ''}
                      {kpis.distribution_fraude.tendance_evolution.evolution_percentage}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Simple distribution by fraud type */}
            <Card>
              <CardHeader>
                <CardTitle>Distribution by Fraud Type</CardTitle>
                <CardDescription>
                  Overall view of {kpis.distribution_fraude.par_type.reduce((sum, type) => sum + type.nombre_cas, 0)} confirmed frauds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={kpis.distribution_fraude.par_type}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type_fraude" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="nombre_cas" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Qualification breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Alert Qualification (OK/KO)</CardTitle>
                  <CardDescription>
                    Distribution of {kpis.alertes.total} alerts by qualification
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                          data={alertQualificationData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                      >
                        {alertQualificationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Detailed metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>
                    Key qualification indicators
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Qualified Alerts OK</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      {kpis.alertes.qualifiees_ok}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Qualified Alerts KO</span>
                    <Badge variant="default" className="bg-red-100 text-red-800">
                      {kpis.alertes.qualifiees_ko}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Under Investigation</span>
                    <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                      {kpis.alertes.en_investigation}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Not Qualified</span>
                    <Badge variant="secondary">
                      {kpis.alertes.non_qualifiees}
                    </Badge>
                  </div>
                  <hr />
                  <div className="flex items-center justify-between font-semibold">
                    <span>Accuracy Rate</span>
                    <span className="text-lg">91%</span>
                  </div>
                  <div className="flex items-center justify-between font-semibold">
                    <span>Confirmed Fraud Rate</span>
                    <span className="text-lg">5%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Governance Tab */}
          <TabsContent value="gouvernance" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Operational Management</CardTitle>
                  <CardDescription>
                    Governance and performance indicators
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Detection/Processing Delta</span>
                    <span className="font-semibold">{kpis.gouvernance.delta_detection_traitement}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>75% Threshold Compliance</span>
                    <Badge variant={kpis.gouvernance.respect_seuil_75_pourcent ? "default" : "destructive"}>
                      {kpis.gouvernance.respect_seuil_75_pourcent ? 'COMPLIANT' : 'NON-COMPLIANT'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Management Modules</CardTitle>
                  <CardDescription>
                    Manager performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Understanding Fraud Nature</span>
                    <span className="font-semibold">{kpis.gouvernance.modules_gestion.comprendre_nature_fraude}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Appropriate Actions</span>
                    <span className="font-semibold">{kpis.gouvernance.modules_gestion.actions_appropriees}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Training Required</span>
                    <Badge variant={kpis.gouvernance.modules_gestion.formation_requise ? "destructive" : "default"}>
                      {kpis.gouvernance.modules_gestion.formation_requise ? 'YES' : 'NO'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Commercial strategies */}
            <Card>
              <CardHeader>
                <CardTitle>Commercial Strategies Impact</CardTitle>
                <CardDescription>
                  Analysis by insurer and tolerance policy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={strategieData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="impact" fill={COLORS.primary} name="Business Impact %" />
                    <Bar dataKey="tolerance" fill={COLORS.secondary} name="Tolerance %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Typology Tab */}
          <TabsContent value="typologie" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Document → insurance mapping */}
              <Card>
                <CardHeader>
                  <CardTitle>Typology Mapping</CardTitle>
                  <CardDescription>
                    Document → Insurance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {kpis.typologie_mapping.documentaire_to_assurance.map((mapping, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="font-medium text-sm">{mapping.type_document}</div>
                          <div className="text-xs text-gray-600">{mapping.typologie_assurance}</div>
                          <div className="flex justify-between mt-2">
                            <span className="text-xs">Frequency: {mapping.frequence}</span>
                            <span className="text-xs">Effectiveness: {mapping.efficacite}%</span>
                          </div>
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Impact by sector */}
              <Card>
                <CardHeader>
                  <CardTitle>Impact by Sector</CardTitle>
                  <CardDescription>
                    Performance by insurance sector
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={secteurData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="alertes" fill={COLORS.primary} name="Generated Alerts" />
                      <Bar dataKey="fraudes" fill={COLORS.ok} name="Confirmed Frauds" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>


          {/* Recommendations Tab */}
          <TabsContent value="recommandations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Improvement Recommendations</CardTitle>
                <CardDescription>
                  Priority actions based on KPI analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {generateRecommendations().map((rec, index) => (
                      <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                            rec.priority === 'high' ? 'bg-red-500' :
                                rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{rec.category}</span>
                            <Badge variant={
                              rec.priority === 'high' ? 'destructive' :
                                  rec.priority === 'medium' ? 'default' : 'secondary'
                            }>
                              {rec.priority.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{rec.recommendation}</p>
                          <p className="text-xs text-blue-600 mt-1">{rec.impact}</p>
                        </div>
                      </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Policy vs good alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Internal Policy Impact</CardTitle>
                <CardDescription>
                  Analysis of good alerts ignored by commercial strategy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {kpis.donnees_brutes.politique_vs_alertes.bonnes_alertes_ignorees}
                    </div>
                    <p className="text-sm text-gray-600">Good alerts ignored</p>
                    <div className="mt-2">
                      <div className="text-lg font-semibold">
                        ${kpis.donnees_brutes.politique_vs_alertes.impact_financier_estime.toLocaleString('en-US')}
                      </div>
                      <p className="text-xs text-gray-600">Estimated financial impact</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Main reasons:</h4>
                    <ul className="space-y-1">
                      {kpis.donnees_brutes.politique_vs_alertes.raisons_principales.map((raison, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start">
                            <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                            {raison}
                          </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer with metadata */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div>
                Analysis period: {new Date(kpis.periode_calcul.debut).toLocaleDateString('en-US')} - {new Date(kpis.periode_calcul.fin).toLocaleDateString('en-US')}
              </div>
              <div>
                Last updated: {new Date(kpis.periode_calcul.derniere_maj).toLocaleString('en-US')}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}