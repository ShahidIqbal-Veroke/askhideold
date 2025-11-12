import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Clock, 
  Activity, 
  TrendingUp, 
  Calendar,
  Filter,
  Eye,
  User,
  FileText,
  AlertCircle,
  CheckCircle,
  BarChart3
} from "lucide-react";
import { useHistorique, useHistoriqueStats } from '@/contexts/HistoriqueContext';
import { HistoriqueEventType, HistoriqueCategory } from '@/types/historique.types';
import HeaderKPI from '@/components/HeaderKPI';

const Historique: React.FC = () => {
  const { 
    state, 
    loadHistoriques, 
    searchHistoriques
  } = useHistorique();
  
  const { stats } = useHistoriqueStats();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterEventType, setFilterEventType] = useState<string>('all');
  const [selectedAssureId, setSelectedAssureId] = useState<string>('');

  useEffect(() => {
    loadHistoriques();
  }, [loadHistoriques]);

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      await searchHistoriques(term);
    } else {
      await loadHistoriques();
    }
  };

  const getCategoryIcon = (category: HistoriqueCategory) => {
    switch (category) {
      case 'commercial': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'operationnel': return <Activity className="h-4 w-4 text-blue-600" />;
      case 'fraude': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'sinistre': return <FileText className="h-4 w-4 text-orange-600" />;
      case 'compliance': return <CheckCircle className="h-4 w-4 text-purple-600" />;
      case 'technique': return <BarChart3 className="h-4 w-4 text-gray-600" />;
      default: return <Activity className="h-4 w-4 text-slate-600" />;
    }
  };

  const getCategoryBadge = (category: HistoriqueCategory) => {
    const colors = {
      commercial: 'bg-green-100 text-green-800',
      operationnel: 'bg-blue-100 text-blue-800',
      fraude: 'bg-red-100 text-red-800',
      sinistre: 'bg-orange-100 text-orange-800',
      compliance: 'bg-purple-100 text-purple-800',
      technique: 'bg-gray-100 text-gray-800',
      relation_client: 'bg-pink-100 text-pink-800',
    };
    
    return <Badge className={colors[category] || 'bg-slate-100 text-slate-800'}>{category}</Badge>;
  };

  const getImpactBadge = (impact: string) => {
    const colors = {
      critical: 'bg-red-600 text-white',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800',
    };
    
    return <Badge className={colors[impact] || 'bg-slate-100 text-slate-800'}>{impact}</Badge>;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const groupEventsByDate = (events: any[]) => {
    const grouped: Record<string, any[]> = {};
    events.forEach(event => {
      const dateKey = new Date(event.createdAt).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    return grouped;
  };

  const groupedEvents = groupEventsByDate(state.historiques);

  const kpiCards = [
    {
      icon: <img src="/icons/TotalEventsr.svg" alt="Total Events" className="w-5 h-5" />,
      title: "Total Events",
      value: stats?.totalEvents || 0
    },
    {
      icon: <img src="/icons/today.svg" alt="This Week" className="w-5 h-5" />,
      title: "This Week",
      value: stats?.eventsThisWeek || 0
    },
    {
      icon: <img src="/icons/CompletionRate.svg" alt="Actions Required" className="w-5 h-5" />,
      title: "Actions Required",
      value: stats?.actionRequiredCount || 0
    },
    {
      icon: <img src="/icons/Confirmedfrauds.svg" alt="Completion Rate" className="w-5 h-5" />,
      title: "Completion Rate",
      value: `${stats?.completionRate?.toFixed(0) || 0}%`
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with KPI */}
      <HeaderKPI
        title="History"
        subtitle="Complete timeline of events - Archive of interactions and patterns"
        cards={kpiCards}
      />

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search in history..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="operationnel">Operational</SelectItem>
                  <SelectItem value="fraude">Fraud</SelectItem>
                  <SelectItem value="sinistre">Claim</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                placeholder="Insured ID..."
                value={selectedAssureId}
                onChange={(e) => setSelectedAssureId(e.target.value)}
                className="w-48"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different views */}
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-6">
          <div className="space-y-6">
            {Object.entries(groupedEvents)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .map(([dateKey, events]) => (
                <Card key={dateKey}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      {new Intl.DateTimeFormat('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }).format(new Date(dateKey))}
                      <Badge variant="outline" className="ml-auto">
                        {events.length} event{events.length > 1 ? 's' : ''}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {events
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((event) => (
                          <div key={event.id} className="border-l-2 border-slate-200 pl-4 pb-4 last:pb-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                  {getCategoryIcon(event.category)}
                                  <h4 className="font-semibold text-slate-900">{event.title}</h4>
                                  <span className="text-sm text-slate-500">
                                    {formatDate(event.createdAt)}
                                  </span>
                                </div>
                                
                                <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                                  {event.description}
                                </p>
                                
                                <div className="flex items-center gap-2 mb-2">
                                  {getCategoryBadge(event.category)}
                                  {getImpactBadge(event.impact)}
                                  <Badge variant="outline" className="text-xs">
                                    {event.eventType}
                                  </Badge>
                                  {event.source && (
                                    <Badge variant="outline" className="text-xs">
                                      {event.source}
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {event.triggeredByName}
                                  </span>
                                  <span>Insured: {event.assureId}</span>
                                  {event.cycleVieId && (
                                    <span>Life Cycle: {event.cycleVieId}</span>
                                  )}
                                </div>
                              </div>
                              
                              <Button size="sm" variant="ghost">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribution by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.topCategories?.map((cat) => (
                    <div key={cat.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(cat.category)}
                        <span className="capitalize">{cat.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">{cat.count}</span>
                        <Badge variant="outline" className="text-xs">
                          {cat.percentage.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Time Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Today</span>
                    <Badge>{stats?.eventsToday || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>This week</span>
                    <Badge>{stats?.eventsThisWeek || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>This month</span>
                    <Badge>{stats?.eventsThisMonth || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Average/day</span>
                    <Badge>{stats?.averageEventsPerDay.toFixed(1) || 0}</Badge>
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

export default Historique;