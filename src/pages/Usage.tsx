import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BillingModal } from "@/components/BillingModal";
import { useState } from "react";
import HeaderKPI from '@/components/HeaderKPI';
import MonthlyUsageChart from '@/components/MonthlyUsageChart';
import WeeklyActivityChart from '@/components/WeeklyActivityChart';
import DocumentTypesChart from '@/components/DocumentTypesChart';
import CostSummaryCard from '@/components/CostSummaryCard';

const monthlyData = [
  { month: "Jan", documents: 520, cost: 89 },
  { month: "Feb", documents: 700, cost: 115 },
  { month: "Mar", documents: 370, cost: 65 },
  { month: "Apr", documents: 580, cost: 151 },
  { month: "May", documents: 370, cost: 137 },
  { month: "Jun", documents: 650, cost: 106 },
  { month: "Jul", documents: 520, cost: 120 },
  { month: "Aug", documents: 550, cost: 130 },
  { month: "Sep", documents: 520, cost: 125 },
  { month: "Oct", documents: 600, cost: 140 },
  { month: "Nov", documents: 700, cost: 150 },
  { month: "Dec", documents: 480, cost: 110 },
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
  { name: "Invoices", value: 35, color: "#1E40AF" }, // Dark blue
  { name: "Photos", value: 28, color: "#E0E7FF" }, // Light lavender/very light blue
  { name: "Estimates", value: 20, color: "#93C5FD" }, // Light blue
  { name: "Others", value: 17, color: "#3B82F6" }, // Medium blue
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

  const kpiCards = [
    {
      icon: <img src="/icons/DocumentsAnalysed.svg" alt="Documents analysés" className="w-5 h-5" />,
      title: "Documents analysés",
      value: "1,840"
    },
    {
      icon: <img src="/icons/clock.svg" alt="Temps économisé" className="w-5 h-5" />,
      title: "Temps économisé",
      value: "156h"
    },
    {
      icon: <img src="/icons/usd.svg" alt="Coût ce mois" className="w-5 h-5" />,
      title: "Coût ce mois",
      value: "663 €"
    },
    {
      icon: <img src="/icons/Precision.svg" alt="Précision" className="w-5 h-5" />,
      title: "Précision",
      value: "98.2%"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with KPI */}
      <HeaderKPI
        title="Utilisation"
        subtitle="Suivez votre utilisation et les performances du service"
        cards={kpiCards}
      />

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
            </div>
            <div className="relative h-2 w-full overflow-visible rounded-full bg-secondary">
              <div
                className="h-full bg-primary transition-all"
                style={{
                  width: `${currentUsage.percentage}%`,
                  backgroundColor: '#3D5EFF'
                }}
              />
              <Badge
                variant={currentUsage.percentage > 80 ? "destructive" : "secondary"}
                className="absolute transition-all"
                style={{
                  left: `calc(${currentUsage.percentage}% - 20px)`,
                  top: '-28px',
                  transform: 'none'
                }}
              >
                {currentUsage.percentage}%
              </Badge>
            </div>
            <p className="text-xs text-gray-500">
              Il vous reste {(currentUsage.limit - currentUsage.documents).toLocaleString()} documents ce mois-ci
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Left: Document Types - 30% */}
        <div className="lg:col-span-3">
          <DocumentTypesChart data={documentTypes} minHeight={400} />
        </div>
        
        {/* Right: Weekly Activity - 70% */}
        <div className="lg:col-span-7">
          <WeeklyActivityChart data={dailyData} minHeight={400} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        <div className="lg:col-span-7">
          <MonthlyUsageChart data={monthlyData} minHeight={400} />
        </div>
        
        <div className="lg:col-span-3">
          <CostSummaryCard
            costs={costs}
            onViewDetails={() => setBillingModalOpen(true)}
            minHeight={400}
          />
        </div>
      </div>

      <BillingModal
        open={billingModalOpen}
        onOpenChange={setBillingModalOpen}
      />
    </div>
  );
}