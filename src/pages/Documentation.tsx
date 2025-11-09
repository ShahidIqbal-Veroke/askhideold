import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Code, FileText, HelpCircle } from "lucide-react";

export default function Documentation() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
        <p className="text-muted-foreground">
          Guide d'utilisation et ressources pour la détection de fraude documentaire
        </p>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Guide de démarrage
            </CardTitle>
            <CardDescription>
              Apprenez à utiliser la plateforme Hedi pour détecter les fraudes documentaires
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">1. Téléchargement de documents</h4>
              <p className="text-sm text-muted-foreground">
                Utilisez le bouton "Upload Document" pour télécharger vos fichiers à analyser.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">2. Analyse automatique</h4>
              <p className="text-sm text-muted-foreground">
                Notre IA analyse automatiquement les documents pour détecter les signes de fraude.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">3. Résultats et rapports</h4>
              <p className="text-sm text-muted-foreground">
                Consultez les résultats détaillés dans la section Documents et Audit Trail.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              API Documentation
            </CardTitle>
            <CardDescription>
              Intégrez Hedi dans vos applications via notre API REST
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Endpoints disponibles</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• POST /api/documents/analyze</li>
                <li>• GET /api/documents</li>
                <li>• GET /api/audit-trail</li>
                <li>• POST /api/reports/generate</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Authentification</h4>
              <p className="text-sm text-muted-foreground">
                Utilisez vos clés API disponibles dans la section "API Keys".
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Types de documents supportés
            </CardTitle>
            <CardDescription>
              Formats et types de documents que Hedi peut analyser
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Formats supportés</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Images: JPG, PNG, PDF</li>
                <li>• Documents: PDF, DOC, DOCX</li>
                <li>• Taille max: 10MB par fichier</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Types de fraudes détectées</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Modification d'images</li>
                <li>• Falsification de texte</li>
                <li>• Deepfakes et manipulations</li>
                <li>• Incohérences structurelles</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              FAQ
            </CardTitle>
            <CardDescription>
              Questions fréquemment posées
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Comment améliorer la précision ?</h4>
              <p className="text-sm text-muted-foreground">
                Assurez-vous que vos documents sont de haute qualité et bien éclairés.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Temps de traitement ?</h4>
              <p className="text-sm text-muted-foreground">
                L'analyse prend généralement entre 30 secondes et 2 minutes selon la complexité.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Confidentialité des données ?</h4>
              <p className="text-sm text-muted-foreground">
                Tous les documents sont chiffrés et automatiquement supprimés après 30 jours.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}