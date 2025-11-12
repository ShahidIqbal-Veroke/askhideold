import React, { useState, useEffect } from 'react';
import { useEventDriven } from '@/hooks/useEventDriven';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HeaderKPI from '@/components/HeaderKPI';
import { RiskProfileCard } from '@/components/RiskProfileCard';
import { RiskProfileDetails } from '@/components/RiskProfileDetails';
import { 
  Shield, 
  Search
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


  const riskCounts = {
    critical: filteredProfiles.filter(p => p.riskLevel === 'critical').length,
    very_high: filteredProfiles.filter(p => p.riskLevel === 'very_high').length,
    high: filteredProfiles.filter(p => p.riskLevel === 'high').length,
    medium: filteredProfiles.filter(p => p.riskLevel === 'medium').length,
    low: filteredProfiles.filter(p => p.riskLevel === 'low').length,
    very_low: filteredProfiles.filter(p => p.riskLevel === 'very_low').length
  };

  const kpiCards = [
    {
      icon: <img src="/icons/Profilesanalyzed.svg" alt="Profiles Analyzed" className="w-5 h-5" />,
      title: "Profiles Analyzed",
      value: filteredProfiles.length
    },
    {
      icon: <img src="/icons/Highrisks.svg" alt="High Risks" className="w-5 h-5" />,
      title: "High Risks",
      value: riskCounts.critical + riskCounts.very_high
    },
    {
      icon: <img src="/icons/Confirmedfrauds.svg" alt="Confirmed Frauds" className="w-5 h-5" />,
      title: "Confirmed Frauds",
      value: stats?.alerts?.confirmed || 0
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with KPI */}
      <HeaderKPI
        title="Risk Profiles"
        subtitle="Risk analysis by person - Event-Driven Architecture"
        cards={kpiCards}
      />

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
            <CardHeader className="flex-shrink-0">
              <CardTitle>Risk Profiles</CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto max-h-[calc(100%-80px)]">
              <div className="space-y-3">
                {filteredProfiles.map((profile) => (
                  <RiskProfileCard
                    key={profile.personId}
                    profile={profile}
                    isSelected={selectedPerson === profile.personId}
                    onClick={() => setSelectedPerson(profile.personId)}
                    getRiskLevelColor={getRiskLevelColor}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Person Details */}
        <div className="col-span-7">
          {selectedPerson && personData ? (
            <RiskProfileDetails
              personData={personData}
              getRiskLevelColor={getRiskLevelColor}
            />
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