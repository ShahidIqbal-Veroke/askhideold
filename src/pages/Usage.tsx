import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Calendar, Download, TrendingUp, FileText, Clock, DollarSign } from "lucide-react";
import { BillingModal } from "@/components/BillingModal";
import { useState } from "react";

const monthlyData = [
  { month: "Jan", documents: 245, cost: 89 },
  { month: "Fév", documents: 320, cost: 115 },
  { month: "Mar", documents: 180, cost: 65 },
  { month: "Avr", documents: 420, cost: 151 },
  { month: "Mai", documents: 380, cost: 137 },
  { month: "Juin", documents: 295, cost: 106 },
];

const dailyData = [
  { day: "Lun", analyses: 45 },
  { day: "Mar", analyses: 52 },
  { day: "Mer", analyses: 38 },
  { day: "Jeu", analyses: 61 },
  { day: "Ven", analyses: 55 },
  { day: "Sam", analyses: 23 },
  { day: "Dim", analyses: 18 },
];

const documentTypes = [
  { name: "Factures", value: 35, color: "#4F46E5" },
  { name: "Photos", value: 28, color: "#06B6D4" },
  { name: "Devis", value: 20, color: "#10B981" },
  { name: "Autres", value: 17, color: "#F59E0B" },
];

export default function Usage() {
  const [billingModalOpen, setBillingModalOpen] = useState(false);
  const currentUsage = {
    documents: 1840,
    limit: 2500,
    percentage: 74
  };

  const costs = {
    thisMonth: 663,
    lastMonth: 598,
    annual: 7200
  };

  const stats = [
    {
      title: "Documents analysés",
      value: "1,840",
      change: "+12%",
      icon: FileText,
      color: "text-blue-600"
    },
    {
      title: "Temps économisé",
      value: "156h",
      change: "+8%", 
      icon: Clock,
      color: "text-green-600"
    },
    {
      title: "Coût ce mois",
      value: "663 €",
      change: "+11%",
      icon: DollarSign,
      color: "text-orange-600"
    },
    {
      title: "Précision",
      value: "98.2%",
      change: "+0.3%",
      icon: TrendingUp,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Utilisation</h1>
          <p className="text-gray-600 mt-1">
            Suivez votre utilisation et les performances du service
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Ce mois
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {stat.change}
                    </Badge>
                  </div>
                </div>
                <div className={`p-3 rounded-full bg-gray-50 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Usage Limit */}
      <Card>
        <CardHeader>
          <CardTitle>Limite d'utilisation mensuelle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {currentUsage.documents.toLocaleString()} / {currentUsage.limit.toLocaleString()} documents
              </span>
              <Badge variant={currentUsage.percentage > 80 ? "destructive" : "secondary"}>
                {currentUsage.percentage}%
              </Badge>
            </div>
            <Progress value={currentUsage.percentage} className="h-2" />
            <p className="text-xs text-gray-500">
              Il vous reste {(currentUsage.limit - currentUsage.documents).toLocaleString()} documents ce mois-ci
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Utilisation mensuelle</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="documents" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Activité de la semaine</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="analyses" stroke="#06B6D4" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Types */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Types de documents analysés</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={documentTypes}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {documentTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cost Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Résumé des coûts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Ce mois</span>
              <span className="font-semibold">{costs.thisMonth} €</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Mois dernier</span>
              <span className="text-gray-500">{costs.lastMonth} €</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Projection annuelle</span>
                <span className="font-semibold text-lg">{costs.annual.toLocaleString()} €</span>
              </div>
            </div>
            <Button className="w-full" variant="outline" onClick={() => setBillingModalOpen(true)}>
              Voir la facturation détaillée
            </Button>
          </CardContent>
        </Card>
      </div>

      <BillingModal 
        open={billingModalOpen} 
        onOpenChange={setBillingModalOpen} 
      />
    </div>
  );
}