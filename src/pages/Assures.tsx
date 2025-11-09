import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  User, 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  Clock,
  Users,
  Activity,
  Eye,
  Filter
} from "lucide-react";
import { useAssureCentric } from '@/hooks/useAssureCentric';

// Types for Insured Persons view
interface AssureListItem {
  id: string;
  numeroClient: string;
  nom: string;
  prenom: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  activeCycles: number;
  totalEvents: number;
  lastActivity: Date;
  alertCount: number;
  hasOpenCases: boolean;
}

const Assures: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssure, setSelectedAssure] = useState<string | null>(null);
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [assuresList, setAssuresList] = useState<AssureListItem[]>([]);
  
  const { 
    loadCompleteAssureData, 
    getAssureAnalytics, 
    detectAssureAnomalies,
    globalState 
  } = useAssureCentric();

  // Mock data for demonstration
  useEffect(() => {
    const mockAssures: AssureListItem[] = Array.from({ length: 20 }, (_, i) => ({
      id: `ASSURE-${String(i + 1).padStart(4, '0')}`,
      numeroClient: `CLI-${2024000 + i + 1}`,
      nom: ['Dupont', 'Martin', 'Bernard', 'Thomas', 'Petit', 'Robert', 'Richard', 'Durand'][i % 8],
      prenom: ['Jean', 'Marie', 'Pierre', 'Sophie', 'Paul', 'Julie', 'Michel', 'Anne'][i % 8],
      riskLevel: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
      activeCycles: Math.floor(Math.random() * 3) + 1,
      totalEvents: Math.floor(Math.random() * 50) + 5,
      lastActivity: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      alertCount: Math.floor(Math.random() * 5),
      hasOpenCases: Math.random() > 0.7,
    }));
    setAssuresList(mockAssures);
  }, []);

  const handleAssureSelect = async (assureId: string) => {
    setSelectedAssure(assureId);
    try {
      const analytics = await getAssureAnalytics(assureId);
      const anomalies = await detectAssureAnomalies(assureId);
      console.log('Analytics:', analytics);
      console.log('Anomalies:', anomalies);
    } catch (error) {
      console.error('Error during loading:', error);
    }
  };

  const filteredAssures = assuresList.filter(assure => {
    const matchesSearch = assure.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assure.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assure.numeroClient.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRisk = filterRisk === 'all' || assure.riskLevel === filterRisk;
    
    return matchesSearch && matchesRisk;
  });

  const riskCounts = {
    critical: assuresList.filter(a => a.riskLevel === 'critical').length,
    high: assuresList.filter(a => a.riskLevel === 'high').length,
    medium: assuresList.filter(a => a.riskLevel === 'medium').length,
    low: assuresList.filter(a => a.riskLevel === 'low').length,
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.RelativeTimeFormat('fr').format(
      Math.floor((date.getTime() - Date.now()) / (24 * 60 * 60 * 1000)),
      'day'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Insured Persons</h1>
        <p className="text-slate-600 mt-2">
          Central view of the Insured-centric architecture - Real-time monitoring and analytics
        </p>
      </div>

      {/* KPIs Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Insured</p>
                <p className="text-2xl font-bold text-slate-900">{assuresList.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Critical Risk</p>
                <p className="text-2xl font-bold text-red-600">{riskCounts.critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Cycles</p>
                <p className="text-2xl font-bold text-green-600">
                  {assuresList.reduce((sum, a) => sum + a.activeCycles, 0)}
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Open Cases</p>
                <p className="text-2xl font-bold text-orange-600">
                  {assuresList.filter(a => a.hasOpenCases).length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search by last name, first name, or client number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterRisk} onValueChange={setFilterRisk}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All levels</SelectItem>
                  <SelectItem value="critical">Critical ({riskCounts.critical})</SelectItem>
                  <SelectItem value="high">High ({riskCounts.high})</SelectItem>
                  <SelectItem value="medium">Medium ({riskCounts.medium})</SelectItem>
                  <SelectItem value="low">Low ({riskCounts.low})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List of Insured Persons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredAssures.map((assure) => (
          <Card 
            key={assure.id} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedAssure === assure.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => handleAssureSelect(assure.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {assure.prenom} {assure.nom}
                    </CardTitle>
                    <CardDescription>{assure.numeroClient}</CardDescription>
                  </div>
                </div>
                <Badge className={getRiskBadgeColor(assure.riskLevel)}>
                  {assure.riskLevel}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* Quick metrics */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-600" />
                    <span className="text-slate-600">
                      {assure.activeCycles} cycle{assure.activeCycles > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-slate-600">
                      {assure.totalEvents} events
                    </span>
                  </div>
                </div>

                {/* Alerts and cases */}
                {(assure.alertCount > 0 || assure.hasOpenCases) && (
                  <div className="flex flex-wrap gap-2">
                    {assure.alertCount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {assure.alertCount} alert{assure.alertCount > 1 ? 's' : ''}
                      </Badge>
                    )}
                    {assure.hasOpenCases && (
                      <Badge variant="outline" className="text-xs border-orange-200 text-orange-700">
                        Open case
                      </Badge>
                    )}
                  </div>
                )}

                {/* Last activity */}
                <div className="flex items-center gap-2 text-xs text-slate-500 border-t pt-3">
                  <Clock className="h-3 w-3" />
                  <span>Last activity {formatDate(assure.lastActivity)}</span>
                </div>

                {/* Quick actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAssureSelect(assure.id);
                    }}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Analyze
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed view of selected insured person */}
      {selectedAssure && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Analysis - {selectedAssure}</CardTitle>
            <CardDescription>
              Complete view of the Insured-centric architecture
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="cycles">Life Cycles</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="risks">Risks</TabsTrigger>
                <TabsTrigger value="demandes">Requests</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-6">
                <div className="text-center py-8 text-slate-500">
                  Overview for {selectedAssure}
                  <br />
                  <small className="text-xs">Data loaded via useAssureCentric</small>
                </div>
              </TabsContent>
              
              <TabsContent value="cycles" className="mt-6">
                <div className="text-center py-8 text-slate-500">
                  Life cycles for {selectedAssure}
                  <br />
                  <small className="text-xs">Integration with CycleVieContext</small>
                </div>
              </TabsContent>
              
              <TabsContent value="timeline" className="mt-6">
                <div className="text-center py-8 text-slate-500">
                  Historical timeline for {selectedAssure}
                  <br />
                  <small className="text-xs">Integration with HistoriqueContext</small>
                </div>
              </TabsContent>
              
              <TabsContent value="risks" className="mt-6">
                <div className="text-center py-8 text-slate-500">
                  Risk analysis for {selectedAssure}
                  <br />
                  <small className="text-xs">Integration with RisqueContext</small>
                </div>
              </TabsContent>
              
              <TabsContent value="demandes" className="mt-6">
                <div className="text-center py-8 text-slate-500">
                  Active requests for {selectedAssure}
                  <br />
                  <small className="text-xs">Integration with DemandeContext</small>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {globalState.loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Loading insured person data...</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Assures;