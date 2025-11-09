
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Send, RefreshCw, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const fausPositifs = [
  {
    id: "1",
    document: "scan_facture_qualite.pdf",
    initialScore: 73,
    validatedBy: "M. Bernard",
    date: "12/07/2025",
    status: "integrated",
    reason: "Qualité de scan dégradée"
  },
  {
    id: "2", 
    document: "photo_smartphone.jpg",
    initialScore: 68,
    validatedBy: "V. Dubois",
    date: "11/07/2025",
    status: "pending",
    reason: "Compression JPEG importante"
  },
  {
    id: "3",
    document: "devis_manuscrit.pdf",
    initialScore: 81,
    validatedBy: "S. Laurent", 
    date: "10/07/2025",
    status: "integrated",
    reason: "Écriture manuscrite légitime"
  },
  {
    id: "4",
    document: "attestation_photocopie.pdf",
    initialScore: 76,
    validatedBy: "A. Martin",
    date: "09/07/2025", 
    status: "pending",
    reason: "Document photocopié"
  }
];

const performanceData = {
  lastCycle: "01/07/2025",
  samplesIntegrated: 247,
  precision: "+2.3%",
  falsPositives: "-8%", 
  recall: "+1.1%"
};

const Feedback = () => {
  const [problemType, setProblemType] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const handleSubmitFeedback = () => {
    if (!problemType || !description) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Signalement envoyé",
      description: "Votre signalement a été transmis à l'équipe technique.",
    });

    setProblemType("");
    setDocumentId("");
    setDescription("");
  };

  const triggerRetraining = () => {
    toast({
      title: "Cycle de ré-entraînement démarré",
      description: "Le modèle sera mis à jour avec les nouveaux échantillons.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Feedback & Amélioration</h1>
          <p className="text-slate-600 mt-1">Amélioration continue du modèle</p>
        </div>
      </div>

      {/* Signalement Problème */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Signaler un Problème</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Type de problème *
              </label>
              <Select value={problemType} onValueChange={setProblemType}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="faux-positif-recurrent">Faux-positif récurrent</SelectItem>
                  <SelectItem value="fraude-non-detectee">Fraude non détectée</SelectItem>
                  <SelectItem value="performance-lente">Performance lente</SelectItem>
                  <SelectItem value="erreur-interface">Erreur interface</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                ID ou nom du document (optionnel)
              </label>
              <Input
                placeholder="ex: SIN-2024-8847 ou facture_martin.pdf"
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Description du problème *
            </label>
            <Textarea
              placeholder="Décrivez le problème rencontré..."
              className="min-h-24"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <Button onClick={handleSubmitFeedback} className="bg-blue-600 hover:bg-blue-700">
            <Send className="w-4 h-4 mr-2" />
            Envoyer le signalement
          </Button>
        </CardContent>
      </Card>

      {/* Faux-Positifs Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Faux-Positifs pour Ré-entraînement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-3 font-medium text-slate-700">Document</th>
                  <th className="text-left p-3 font-medium text-slate-700">Score initial</th>
                  <th className="text-left p-3 font-medium text-slate-700">Validé par</th>
                  <th className="text-left p-3 font-medium text-slate-700">Date</th>
                  <th className="text-left p-3 font-medium text-slate-700">Statut</th>
                </tr>
              </thead>
              <tbody>
                {fausPositifs.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-3">
                      <div>
                        <p className="font-medium text-slate-900">{item.document}</p>
                        <p className="text-sm text-slate-500">{item.reason}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        {item.initialScore}%
                      </Badge>
                    </td>
                    <td className="p-3 text-slate-700">{item.validatedBy}</td>
                    <td className="p-3 text-slate-700">{item.date}</td>
                    <td className="p-3">
                      {item.status === "integrated" ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Intégré
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          En attente
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Cycles IA */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">Ré-entraînement du Modèle</CardTitle>
            <Button onClick={triggerRetraining} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Déclencher cycle
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-700">Dernier cycle</span>
              <span className="text-sm text-slate-900">{performanceData.lastCycle}</span>
            </div>
            <p className="text-sm text-slate-600">
              {performanceData.samplesIntegrated} nouveaux échantillons intégrés
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-center space-x-1 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-2xl font-bold text-green-600">
                  {performanceData.precision}
                </span>
              </div>
              <p className="text-sm text-green-700 font-medium">PRÉCISION</p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-center space-x-1 mb-2">
                <TrendingDown className="w-5 h-5 text-green-600" />
                <span className="text-2xl font-bold text-green-600">
                  {performanceData.falsPositives}
                </span>
              </div>
              <p className="text-sm text-green-700 font-medium">FAUX-POSITIFS</p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-center space-x-1 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-2xl font-bold text-green-600">
                  {performanceData.recall}
                </span>
              </div>
              <p className="text-sm text-green-700 font-medium">RAPPEL</p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-800">
              💡 <strong>Information :</strong> Le ré-entraînement automatique se déclenche 
              lorsque plus de 50 faux-positifs validés sont disponibles, ou manuellement via le bouton ci-dessus.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Feedback;
