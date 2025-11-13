import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CostSummaryCardProps {
  costs: {
    thisMonth: number;
    lastMonth: number;
    annual: number;
  };
  title?: string;
  onViewDetails?: () => void;
  detailsButtonText?: string;
  minHeight?: number;
}

export default function CostSummaryCard({
  costs,
  title = "Résumé des coûts",
  onViewDetails,
  detailsButtonText = "Voir la facturation détaillée",
  minHeight = 400
}: CostSummaryCardProps) {
  return (
    <Card style={{ minHeight: `${minHeight}px` }}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
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
        {onViewDetails && (
          <Button 
            className="w-full" 
            variant="outline" 
            onClick={onViewDetails}
            style={{ backgroundColor: '#2C4EF1', color: 'white', borderColor: '#2C4EF1' }}
          >
            {detailsButtonText}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

