import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, CreditCard, Calendar } from "lucide-react";

interface BillingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const billingDetails = [
  { date: "2024-07-01", description: "Analyse de documents - Pack Pro", amount: 89, type: "monthly" },
  { date: "2024-07-15", description: "Dépassement limite - 150 documents", amount: 45, type: "overage" },
  { date: "2024-07-20", description: "API Premium - 5000 requêtes", amount: 25, type: "api" },
  { date: "2024-07-25", description: "Stockage supplémentaire - 10GB", amount: 15, type: "storage" },
];

export function BillingModal({ open, onOpenChange }: BillingModalProps) {
  const total = billingDetails.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Facturation détaillée - Juillet 2024
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Résumé du mois</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{total} €</p>
                  <p className="text-sm text-gray-600">Total ce mois</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">1,840</p>
                  <p className="text-sm text-gray-600">Documents analysés</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">156h</p>
                  <p className="text-sm text-gray-600">Temps économisé</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed billing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Détail des charges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {billingDetails.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="font-medium">{item.description}</p>
                        <p className="text-sm text-gray-600">{item.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={item.type === 'monthly' ? 'default' : 'secondary'}>
                        {item.type === 'monthly' ? 'Abonnement' : 
                         item.type === 'overage' ? 'Dépassement' :
                         item.type === 'api' ? 'API' : 'Stockage'}
                      </Badge>
                      <span className="font-semibold">{item.amount} €</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Télécharger la facture
            </Button>
            <Button onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}