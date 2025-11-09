import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CityDistrictDashboard from "@/components/CityDistrictDashboard";
import { 
  Zap, 
  Bell, 
  Folder, 
  Shield, 
  TrendingUp, 
  Users,
  Target,
  Activity,
  Building2,
  Home
} from "lucide-react";

const Dashboard = () => {
  const { role, user } = useAuth();
  
  // EVENT-DRIVEN: Main dashboard for all roles with role-specific quick actions
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">
          Welcome {user?.name} - Event-Driven Anti-Fraud Platform
        </p>
      </div>

      {/* Role-specific Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Alert Center</p>
                <p className="text-xs text-blue-600">Main Queue</p>
              </div>
              <Bell className="h-8 w-8 text-blue-600" />
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full mt-3 border-blue-300 text-blue-700 hover:bg-blue-100"
              onClick={() => window.location.href = '/alerts'}
            >
              Access
            </Button>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Events</p>
                <p className="text-xs text-green-600">Source of Truth</p>
              </div>
              <Zap className="h-8 w-8 text-green-600" />
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full mt-3 border-green-300 text-green-700 hover:bg-green-100"
              onClick={() => window.location.href = '/events'}
            >
              Real-time Feed
            </Button>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Risk Profiles</p>
                <p className="text-xs text-purple-600">Analysis by Person</p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full mt-3 border-purple-300 text-purple-700 hover:bg-purple-100"
              onClick={() => window.location.href = '/risk-profiles'}
            >
              Explore
            </Button>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Cases</p>
                <p className="text-xs text-orange-600">Investigations</p>
              </div>
              <Folder className="h-8 w-8 text-orange-600" />
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full mt-3 border-orange-300 text-orange-700 hover:bg-orange-100"
              onClick={() => window.location.href = '/cases'}
            >
              Manage
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Decentralized Architecture - Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">📊 Overview</TabsTrigger>
          <TabsTrigger value="decioisonne">🏙️ Decentralized Architecture</TabsTrigger>
          <TabsTrigger value="navigation">🧭 Role Navigation</TabsTrigger>
        </TabsList>

        {/* Overview - Existing Dashboard */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-xs text-muted-foreground">+180 since yesterday</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Detection Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94.2%</div>
                <p className="text-xs text-muted-foreground">+2.1% this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Global ROI</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€2.34M</div>
                <p className="text-xs text-muted-foreground">+23% vs previous period</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Teams</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">Cyber, AML, Doc, Comportemental</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Decentralized Architecture */}
        <TabsContent value="decioisonne">
          <CityDistrictDashboard />
        </TabsContent>

        {/* Navigation by role */}
        <TabsContent value="navigation">
          <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Specialized Dashboards</span>
            <Badge variant="secondary" className="ml-2">
              Role: {role}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(role === 'gestionnaire' || role === 'admin') && (
              <Button 
                variant="outline" 
                className="h-20 flex-col border-green-200 hover:bg-green-50"
                onClick={() => window.location.href = '/dashboard-gestionnaire'}
              >
                <Target className="w-6 h-6 mb-2 text-green-600" />
                <span className="font-medium">My Activity</span>
                <span className="text-xs text-slate-500">Manager performance</span>
              </Button>
            )}
            
            {(role === 'superviseur' || role === 'admin') && (
              <Button 
                variant="outline" 
                className="h-20 flex-col border-blue-200 hover:bg-blue-50"
                onClick={() => window.location.href = '/dashboard-superviseur'}
              >
                <Users className="w-6 h-6 mb-2 text-blue-600" />
                <span className="font-medium">Team</span>
                <span className="text-xs text-slate-500">Team performance</span>
              </Button>
            )}
            
            {(role === 'direction' || role === 'admin') && (
              <Button 
                variant="outline" 
                className="h-20 flex-col border-purple-200 hover:bg-purple-50"
                onClick={() => window.location.href = '/dashboard-direction'}
              >
                <TrendingUp className="w-6 h-6 mb-2 text-purple-600" />
                <span className="font-medium">Strategic</span>
                <span className="text-xs text-slate-500">KPIs and trends</span>
              </Button>
            )}
            
            {/* Show unavailable dashboards for transparency */}
            {role === 'gestionnaire' && (
              <>
                <div className="relative">
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col opacity-50 cursor-not-allowed"
                    disabled
                  >
                    <Users className="w-6 h-6 mb-2 text-gray-400" />
                    <span className="font-medium text-gray-400">Team</span>
                    <span className="text-xs text-gray-400">Supervisor required</span>
                  </Button>
                </div>
                <div className="relative">
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col opacity-50 cursor-not-allowed"
                    disabled
                  >
                    <TrendingUp className="w-6 h-6 mb-2 text-gray-400" />
                    <span className="font-medium text-gray-400">Strategic</span>
                    <span className="text-xs text-gray-400">Executive required</span>
                  </Button>
                </div>
              </>
            )}
            
            {role === 'superviseur' && (
              <div className="relative">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col opacity-50 cursor-not-allowed"
                  disabled
                >
                  <TrendingUp className="w-6 h-6 mb-2 text-gray-400" />
                  <span className="font-medium text-gray-400">Strategic</span>
                  <span className="text-xs text-gray-400">Executive required</span>
                </Button>
              </div>
            )}
          </div>
          
          {/* Role explanation */}
          <div className="mt-4 p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">
              <span className="font-medium">Your access:</span> As a {role}, you have access to the colored dashboards.
              Grayed-out dashboards require a higher role.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Event-Driven Architecture Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Event-Driven Architecture</h4>
              <p className="text-sm text-blue-700">
                This platform uses an event-driven architecture where events are the source of truth.
                Alerts are generated from events and only impact risk profiles if confirmed as fraud.
              </p>
              <div className="mt-3 flex items-center space-x-4 text-sm">
                <Badge className="bg-blue-100 text-blue-800">
                  Events → History → Alerts → Risks
                </Badge>
                <Badge className="bg-green-100 text-green-800">
                  Conditional Feedback
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;