import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useAlerts } from "@/contexts/AlertContext";
import { useCases } from "@/contexts/CaseContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { 
  Users, 
  TrendingUp, 
  AlertTriangle,
  BarChart3,
  Activity,
  Target,
  Settings,
  Eye,
  UserCheck,
  Clock,
  DollarSign,
  Briefcase
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter } from 'recharts';

const DashboardSuperviseur = () => {
  const { user } = useAuth();
  const { alerts, stats: alertStats, assignAlerts } = useAlerts();
  const { cases, stats: caseStats } = useCases();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  
  // Mock team data
  const teamMembers = [
    { name: 'V. Dubois', alerts: 23, cases: 8, accuracy: 92, avgTime: 25, roi: 145000 },
    { name: 'M. Bernard', alerts: 19, cases: 7, accuracy: 88, avgTime: 32, roi: 98000 },
    { name: 'S. Laurent', alerts: 31, cases: 12, accuracy: 95, avgTime: 18, roi: 203000 },
    { name: 'A. Martin', alerts: 15, cases: 5, accuracy: 82, avgTime: 38, roi: 67000 }
  ];

  // Team calculations
  const totalTeamAlerts = alerts.filter(a => a.assignedTo && teamMembers.some(m => m.name === a.assignedTo)).length;
  const unassignedAlerts = alerts.filter(a => a.status === 'pending' && !a.assignedTo).length;
  const avgTeamAccuracy = Math.round(teamMembers.reduce((sum, m) => sum + m.accuracy, 0) / teamMembers.length);
  const totalTeamROI = teamMembers.reduce((sum, m) => sum + m.roi, 0);

  // Workload distribution
  const workloadDistribution = teamMembers.map(member => ({
    name: member.name,
    alerts: member.alerts,
    cases: member.cases,
    load: Math.round((member.alerts + member.cases * 3) / 40 * 100) // Load in %
  }));
  
  // Performance per member
  const performanceRadar = teamMembers.map(member => ({
    manager: member.name,
    accuracy: member.accuracy,
    speed: Math.round(100 - member.avgTime),
    volume: Math.round((member.alerts / 31) * 100),
    roi: Math.round((member.roi / 203000) * 100)
  }));
  
  // Weekly trends
  const weeklyTrends = [
    { day: 'Mon', alerts: 45, qualified: 38, frauds: 12, time: 28 },
    { day: 'Tue', alerts: 52, qualified: 44, frauds: 15, time: 31 },
    { day: 'Wed', alerts: 48, qualified: 42, frauds: 14, time: 27 },
    { day: 'Thu', alerts: 58, qualified: 49, frauds: 18, time: 33 },
    { day: 'Fri', alerts: 41, qualified: 36, frauds: 11, time: 25 },
    { day: 'Sat', alerts: 12, qualified: 10, frauds: 3, time: 22 },
    { day: 'Sun', alerts: 8, qualified: 7, frauds: 2, time: 20 }
  ];
  
  // Scatter plot performance/volume
  const performanceScatter = teamMembers.map(member => ({
    x: member.alerts,
    y: member.accuracy,
    z: member.roi / 1000,
    name: member.name
  }));

  // Handler for alert assignment
  const handleAssignAlert = async (alertId: string, assignTo: string) => {
    try {
      await assignAlerts([alertId], assignTo);

      toast({
        title: "Alert assigned",
        description: `Alert ${alertId} successfully assigned to ${assignTo}`,
      });

    } catch (error) {
      console.error('Error during assignment:', error);
      toast({
        title: "Error",
        description: "Unable to assign alert. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Supervisor header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Supervision Dashboard</h1>
          <p className="text-slate-600 mt-1">
            {user?.name} - Team {user?.team} Management
          </p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => navigate('/settings')} variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Threshold Settings
          </Button>
          <Button onClick={() => navigate('/team')} className="bg-blue-600 hover:bg-blue-700">
            <Users className="w-4 h-4 mr-2" />
            Manage Team
          </Button>
        </div>
      </div>

      {/* Supervision KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Unassigned Alerts</p>
                <p className="text-3xl font-bold text-red-600">{unassignedAlerts}</p>
                <p className="text-xs text-slate-500 mt-1">To distribute</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Team Accuracy</p>
                <p className="text-3xl font-bold text-slate-900">{avgTeamAccuracy}%</p>
                <Progress value={avgTeamAccuracy} className="mt-2" />
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Average Load</p>
                <p className="text-3xl font-bold text-slate-900">68%</p>
                <p className="text-xs text-slate-500 mt-1">Capacity used</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Team ROI</p>
                <p className="text-2xl font-bold text-slate-900">€{(totalTeamROI / 1000).toFixed(0)}k</p>
                <p className="text-xs text-slate-500 mt-1">This week</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workload distribution */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Workload Distribution</span>
            <Button size="sm" variant="outline" onClick={() => navigate('/alerts')}>
              Reassign
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workloadDistribution.map((member) => (
              <div key={member.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                      <UserCheck className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-xs text-slate-500">
                        {member.alerts} alerts • {member.cases} cases
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={member.load > 80 ? 'destructive' : member.load > 60 ? 'secondary' : 'default'}
                  >
                    {member.load}%
                  </Badge>
                </div>
                <Progress
                  value={member.load}
                  className={`h-2 ${member.load > 80 ? 'bg-red-100' : ''}`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Supervision charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Individual performance */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Individual Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamMembers}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="accuracy" fill="#3b82f6" name="Accuracy %" />
                  <Bar dataKey="alerts" fill="#10b981" name="Alerts" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Team trends */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Weekly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="alerts" stroke="#3b82f6" strokeWidth={2} name="Alerts" />
                  <Line type="monotone" dataKey="qualified" stroke="#10b981" strokeWidth={2} name="Qualified" />
                  <Line type="monotone" dataKey="frauds" stroke="#ef4444" strokeWidth={2} name="Frauds" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed performance table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Detailed Dashboard by Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-slate-700">Manager</th>
                  <th className="text-center p-4 font-medium text-slate-700">Alerts</th>
                  <th className="text-center p-4 font-medium text-slate-700">Cases</th>
                  <th className="text-center p-4 font-medium text-slate-700">Accuracy</th>
                  <th className="text-center p-4 font-medium text-slate-700">Avg Time</th>
                  <th className="text-center p-4 font-medium text-slate-700">ROI</th>
                  <th className="text-center p-4 font-medium text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member) => (
                  <tr key={member.name} className="border-b hover:bg-slate-50">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                          <UserCheck className="w-4 h-4 text-slate-600" />
                        </div>
                        <span className="font-medium">{member.name}</span>
                      </div>
                    </td>
                    <td className="text-center p-4">{member.alerts}</td>
                    <td className="text-center p-4">{member.cases}</td>
                    <td className="text-center p-4">
                      <Badge variant={member.accuracy >= 90 ? 'default' : 'secondary'}>
                        {member.accuracy}%
                      </Badge>
                    </td>
                    <td className="text-center p-4">{member.avgTime} min</td>
                    <td className="text-center p-4 font-medium">€{(member.roi / 1000).toFixed(0)}k</td>
                    <td className="text-center p-4">
                      <Button size="sm" variant="ghost">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Unassigned critical alerts */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>Unassigned Critical Alerts</span>
            </span>
            <Select defaultValue="all">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.filter(a => !a.assignedTo && a.status === 'pending').slice(0, 5).map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <p className="font-medium text-sm">{alert.id}</p>
                  <p className="text-xs text-slate-500">
                    {alert.metadata.sinisterNumber} • Score: {alert.score}% • {alert.metadata.documentType}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Select onValueChange={(value) => handleAssignAlert(alert.id, value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Assign to..." />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map(member => (
                        <SelectItem key={member.name} value={member.name}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSuperviseur;