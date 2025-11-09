import React, { useState, useEffect } from 'react';
import { useEventDriven } from '@/hooks/useEventDriven';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  User, 
  Search,
  TrendingUp,
  AlertTriangle,
  Clock,
  Activity,
  Zap,
  CheckCircle,
  XCircle,
  Eye,
  BarChart3
} from 'lucide-react';

// Mock data for risk profiles (in real app, this would come from backend)
const generateMockRiskProfiles = () => {
  const profiles = [];
  const riskLevels = ['very_low', 'low', 'medium', 'high', 'very_high', 'critical'];
  const names = ['Dupont', 'Martin', 'Bernard', 'Thomas', 'Petit', 'Robert', 'Richard', 'Durand'];
  
  for (let i = 1; i <= 50; i++) {
    profiles.push({
      personId: `PERSON-${String(i).padStart(4, '0')}`,
      name: `${['Jean', 'Marie', 'Pierre', 'Sophie'][i % 4]} ${names[i % 8]}`,
      riskLevel: riskLevels[Math.floor(Math.random() * riskLevels.length)],
      riskScore: Math.floor(Math.random() * 100),
      confidence: Math.random(),
      totalEvents: Math.floor(Math.random() * 20) + 1,
      confirmedFrauds: Math.floor(Math.random() * 3),
      pendingAlerts: Math.floor(Math.random() * 5),
      lastActivity: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      riskFactors: {
        document_inconsistencies: Math.random() * 100,
        frequency_anomalies: Math.random() * 100,
        amount_patterns: Math.random() * 100,
        behavioral_score: Math.random() * 100
      },
      trend: ['increasing', 'stable', 'decreasing'][Math.floor(Math.random() * 3)]
    });
  }
  return profiles;
};

const RiskProfiles = () => {
  const { user, role } = useAuth();
  const { getPersonCompleteData, getEventDrivenStats } = useEventDriven();
  
  const [riskProfiles] = useState(generateMockRiskProfiles());
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [personData, setPersonData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [stats, setStats] = useState<any>({ alerts: { confirmed: 0 } });

  // Load stats asynchronously
  useEffect(() => {
    const loadStats = async () => {
      try {
        const eventStats = await getEventDrivenStats();
        setStats(eventStats);
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };
    loadStats();
  }, [getEventDrivenStats]);

  // Filter profiles
  const filteredProfiles = riskProfiles.filter(profile => {
    const matchesSearch = profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.personId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRisk = filterRisk === 'all' || profile.riskLevel === filterRisk;
    
    return matchesSearch && matchesRisk;
  });

  // Load person data when selected
  useEffect(() => {
    if (selectedPerson) {
      getPersonCompleteData(selectedPerson)
        .then(data => setPersonData(data))
        .catch(error => {
          console.error('Error loading person data:', error);
          // Use mock data for demo
          setPersonData({
            personId: selectedPerson,
            events: [],
            alerts: [],
            confirmedFrauds: [],
            riskProfile: riskProfiles.find(p => p.personId === selectedPerson),
            summary: {
              totalEvents: 5,
              totalAlerts: 2,
              confirmedFrauds: 1,
              currentRiskLevel: 'medium'
            }
          });
        });
    }
  }, [selectedPerson, getPersonCompleteData, riskProfiles]);

  const getRiskLevelColor = (level: string) => {
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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'decreasing': return <TrendingUp className="w-4 h-4 text-green-500 rotate-180" />;
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  const riskCounts = {
    critical: filteredProfiles.filter(p => p.riskLevel === 'critical').length,
    very_high: filteredProfiles.filter(p => p.riskLevel === 'very_high').length,
    high: filteredProfiles.filter(p => p.riskLevel === 'high').length,
    medium: filteredProfiles.filter(p => p.riskLevel === 'medium').length,
    low: filteredProfiles.filter(p => p.riskLevel === 'low').length,
    very_low: filteredProfiles.filter(p => p.riskLevel === 'very_low').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Risk Profiles</h1>
          <p className="text-slate-600 mt-1">
            Risk analysis by person - Event-Driven Architecture
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className="flex space-x-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{filteredProfiles.length}</p>
                  <p className="text-xs text-slate-600">Profiles analyzed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{riskCounts.critical + riskCounts.very_high}</p>
                  <p className="text-xs text-slate-600">High risks</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{stats?.alerts?.confirmed || 0}</p>
                  <p className="text-xs text-slate-600">Confirmed frauds</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterRisk} onValueChange={setFilterRisk}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All risk levels</SelectItem>
                  <SelectItem value="critical">Critical ({riskCounts.critical})</SelectItem>
                  <SelectItem value="very_high">Very high ({riskCounts.very_high})</SelectItem>
                  <SelectItem value="high">High ({riskCounts.high})</SelectItem>
                  <SelectItem value="medium">Medium ({riskCounts.medium})</SelectItem>
                  <SelectItem value="low">Low ({riskCounts.low})</SelectItem>
                  <SelectItem value="very_low">Very low ({riskCounts.very_low})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Risk Profiles List */}
        <div className="col-span-5">
          <Card className="h-[calc(100vh-280px)]">
            <CardHeader>
              <CardTitle>Risk Profiles</CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto">
              <div className="space-y-3">
                {filteredProfiles.map((profile) => (
                  <div
                    key={profile.personId}
                    onClick={() => setSelectedPerson(profile.personId)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedPerson === profile.personId 
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
                        {getTrendIcon(profile.trend)}
                        <Badge className={getRiskLevelColor(profile.riskLevel)} variant="outline">
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
                    
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t pt-2">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Intl.RelativeTimeFormat('en').format(
                            Math.floor((profile.lastActivity.getTime() - Date.now()) / (24 * 60 * 60 * 1000)),
                            'day'
                          )}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <BarChart3 className="w-3 h-3" />
                        <span>Score: {profile.riskScore}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Person Details */}
        <div className="col-span-7">
          {selectedPerson && personData ? (
            <Card className="h-[calc(100vh-280px)]">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{personData.personId}</CardTitle>
                    <p className="text-sm text-slate-600 mt-1">
                      Complete event-driven analysis
                    </p>
                  </div>
                  <Badge className={getRiskLevelColor(personData.summary.currentRiskLevel)} variant="outline">
                    {personData.summary.currentRiskLevel}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="summary" className="h-full">
                  <TabsList>
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="events">Events</TabsTrigger>
                    <TabsTrigger value="alerts">Alerts</TabsTrigger>
                    <TabsTrigger value="risk-factors">Risk Factors</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="summary" className="space-y-4">
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
                  </TabsContent>
                  
                  <TabsContent value="events">
                    <div className="text-center py-8 text-slate-500">
                      <Zap className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                      <p>Events related to this person</p>
                      <p className="text-sm mt-1">
                        Events are the source of truth for this profile
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="alerts">
                    <div className="text-center py-8 text-slate-500">
                      <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                      <p>Alerts generated from events</p>
                      <p className="text-sm mt-1">
                        Risk impact ONLY if fraud confirmed
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="risk-factors">
                    {personData.riskProfile?.riskFactors && (
                      <div className="space-y-4">
                        {Object.entries(personData.riskProfile.riskFactors).map(([factor, score]) => (
                          <div key={factor} className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">{factor.replace('_', ' ')}</span>
                              <span className="text-sm text-slate-600">{Math.round(score as number)}/100</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${score}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-[calc(100vh-280px)] flex items-center justify-center">
              <div className="text-center">
                <Shield className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600">Select a profile to view details</p>
                <p className="text-sm text-slate-500 mt-1">
                  Risks are calculated from events
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiskProfiles;