import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useAlerts } from "@/contexts/AlertContext";
import { useCases } from "@/contexts/CaseContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { 
  TrendingUp, 
  DollarSign,
  Building,
  Target,
  Download,
  Calendar,
  Shield,
  AlertTriangle,
  Activity,
  BarChart3,
  Users,
  FileText
} from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ComposedChart } from 'recharts';

const DashboardDirection = () => {
  const { user } = useAuth();
  const { stats: alertStats } = useAlerts();
  const { stats: caseStats } = useCases();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<string>("month");
  
  // Global metrics
  const totalAlerts = alertStats?.total || 0;
  const fraudRate = ((alertStats?.qualified || 0) / totalAlerts * 100).toFixed(1);
  const totalROI = caseStats?.financialImpact.netRoi || 0;
  const avgInvestigationTime = caseStats?.avgInvestigationTime || 0;

  // Monthly trends data
  const monthlyTrends = [
    { month: 'Jan', alertes: 1250, fraudes: 225, roi: 820000, prevented: 450000 },
    { month: 'Feb', alertes: 1180, fraudes: 198, roi: 750000, prevented: 380000 },
    { month: 'Mar', alertes: 1420, fraudes: 289, roi: 980000, prevented: 520000 },
    { month: 'Apr', alertes: 1350, fraudes: 245, roi: 890000, prevented: 470000 },
    { month: 'May', alertes: 1580, fraudes: 312, roi: 1100000, prevented: 580000 },
    { month: 'Jun', alertes: 1490, fraudes: 278, roi: 1050000, prevented: 550000 },
    { month: 'Jul', alertes: 1620, fraudes: 298, roi: 1150000, prevented: 620000 }
  ];

  // Distribution by fraud type
  const fraudTypeDistribution = [
    { name: 'Forged Document', value: 35, amount: 2800000 },
    { name: 'Inflated Amount', value: 28, amount: 1900000 },
    { name: 'Fictitious Claim', value: 20, amount: 3200000 },
    { name: 'Identity Theft', value: 12, amount: 1500000 },
    { name: 'Other', value: 5, amount: 400000 }
  ];

  // Team performance
  const teamPerformance = [
    { team: 'Paris', alerts: 4250, cases: 380, roi: 2100000, accuracy: 92 },
    { team: 'Lyon', alerts: 3180, cases: 290, roi: 1650000, accuracy: 89 },
    { team: 'Marseille', alerts: 2890, cases: 245, roi: 1380000, accuracy: 94 },
    { team: 'Lille', alerts: 2150, cases: 198, roi: 980000, accuracy: 87 }
  ];

  // ROI vs Costs evolution
  const roiVsCosts = monthlyTrends.map(month => ({
    month: month.month,
    revenus: month.roi + month.prevented,
    couts: Math.round(month.fraudes * 1200), // Average investigation cost
    net: month.roi + month.prevented - Math.round(month.fraudes * 1200)
  }));
  
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Direction header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Executive Strategic View</h1>
          <p className="text-slate-600 mt-1">
            Global performance and strategic analysis
          </p>
        </div>
        <div className="flex space-x-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This week</SelectItem>
              <SelectItem value="month">This month</SelectItem>
              <SelectItem value="quarter">This quarter</SelectItem>
              <SelectItem value="year">This year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Custom Report
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Strategic KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-800">Total Volume</p>
                <p className="text-3xl font-bold text-blue-900">{totalAlerts}</p>
                <p className="text-xs text-blue-700 mt-1">Alerts this month</p>
              </div>
              <div className="p-3 bg-blue-200/50 rounded-full">
                <Shield className="w-6 h-6 text-blue-800" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-800">Fraud Rate</p>
                <p className="text-3xl font-bold text-red-900">{fraudRate}%</p>
                <div className="flex items-center space-x-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-red-700" />
                  <p className="text-xs text-red-700">+2.3% vs last month</p>
                </div>
              </div>
              <div className="p-3 bg-red-200/50 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-800" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-800">Global ROI</p>
                <p className="text-2xl font-bold text-green-900">€{(totalROI / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-green-700 mt-1">Net savings</p>
              </div>
              <div className="p-3 bg-green-200/50 rounded-full">
                <DollarSign className="w-6 h-6 text-green-800" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-800">Efficiency</p>
                <p className="text-3xl font-bold text-purple-900">{avgInvestigationTime}d</p>
                <p className="text-xs text-purple-700 mt-1">Avg resolution time</p>
              </div>
              <div className="p-3 bg-purple-200/50 rounded-full">
                <Activity className="w-6 h-6 text-purple-800" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Évolution temporelle */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Monthly Evolution of Key Indicators</span>
            <div className="flex space-x-2 text-xs">
              <Badge variant="outline" className="text-blue-600">Alerts</Badge>
              <Badge variant="outline" className="text-red-600">Frauds</Badge>
              <Badge variant="outline" className="text-green-600">ROI</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis yAxisId="left" stroke="#64748b" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} />
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    if (name === 'ROI (k€)') return `€${(value / 1000).toFixed(0)}k`;
                    return value;
                  }}
                />
                <Bar yAxisId="left" dataKey="alertes" fill="#3b82f6" name="Alerts" />
                <Bar yAxisId="left" dataKey="fraudes" fill="#ef4444" name="Frauds" />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="roi" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name="ROI (k€)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution by fraud type */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Distribution by Fraud Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fraudTypeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {fraudTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string, props: any) => [
                      `${value}%`,
                      `Impact: €${(props.payload.amount / 1000000).toFixed(1)}M`
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Team performance */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Performance by Regional Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamPerformance.map((team) => (
                <div key={team.team} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <Building className="w-5 h-5 text-slate-600" />
                      <div>
                        <p className="font-medium">{team.team}</p>
                        <p className="text-xs text-slate-500">
                          {team.alerts} alerts • {team.cases} cases
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">€{(team.roi / 1000000).toFixed(1)}M</p>
                      <Badge variant="outline" className="text-xs">
                        {team.accuracy}% accuracy
                      </Badge>
                    </div>
                  </div>
                  <Progress value={(team.roi / 2100000) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROI vs Costs Analysis */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Financial Analysis: Revenue vs Investigation Costs</span>
            <Badge className="bg-green-100 text-green-800">
              Net ROI: €{((totalROI + 5000000) / 1000000).toFixed(1)}M
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={roiVsCosts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip formatter={(value: number) => `€${(value / 1000).toFixed(0)}k`} />
                <Area
                  type="monotone"
                  dataKey="revenus"
                  stackId="1"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                  name="Revenue (recovered + prevented)"
                />
                <Area
                  type="monotone"
                  dataKey="couts"
                  stackId="2"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.6}
                  name="Investigation costs"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Fraud by Insurance Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Auto</span>
                <div className="flex items-center space-x-2">
                  <Progress value={45} className="w-24 h-2" />
                  <span className="text-xs font-medium">45%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Home</span>
                <div className="flex items-center space-x-2">
                  <Progress value={30} className="w-24 h-2" />
                  <span className="text-xs font-medium">30%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Health</span>
                <div className="flex items-center space-x-2">
                  <Progress value={15} className="w-24 h-2" />
                  <span className="text-xs font-medium">15%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Business</span>
                <div className="flex items-center space-x-2">
                  <Progress value={10} className="w-24 h-2" />
                  <span className="text-xs font-medium">10%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Top Identified Risks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { risk: "Organized Networks", level: "critical", trend: "up" },
                { risk: "Document Fraud", level: "high", trend: "stable" },
                { risk: "Overcharging", level: "medium", trend: "down" },
                { risk: "False Claims", level: "high", trend: "up" }
              ].map((risk, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm">{risk.risk}</span>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={risk.level === 'critical' ? 'destructive' : 
                              risk.level === 'high' ? 'secondary' : 'outline'}
                      className="text-xs"
                    >
                      {risk.level}
                    </Badge>
                    {risk.trend === 'up' && <TrendingUp className="w-3 h-3 text-red-500" />}
                    {risk.trend === 'down' && <TrendingUp className="w-3 h-3 text-green-500 rotate-180" />}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Strategic Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start text-left"
                onClick={() => navigate('/settings')}
              >
                <Target className="w-4 h-4 mr-2" />
                Adjust Detection Thresholds
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-left"
                onClick={() => navigate('/team')}
              >
                <Users className="w-4 h-4 mr-2" />
                Strengthen Lyon Team
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-left"
                onClick={() => navigate('/audit')}
              >
                <FileText className="w-4 h-4 mr-2" />
                Complete Audit Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardDirection;