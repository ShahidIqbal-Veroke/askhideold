
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Save, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/contexts/SettingsContext";
import { DemoDataManager } from "@/components/DemoDataManager";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";


// Define permissions for each profile
interface ProfilePermissions {
  canUpdateThresholds: boolean;
  canUpdateDocumentTypes: boolean;
  canUpdateAdvancedSettings: boolean;
  canChangeProfile: boolean;
}

const getProfilePermissions = (profile: string): ProfilePermissions => {
  switch (profile) {
    case "administrator":
      return {
        canUpdateThresholds: true,
        canUpdateDocumentTypes: true,
        canUpdateAdvancedSettings: true,
        canChangeProfile: true,
      };
    case "user":
      return {
        canUpdateThresholds: true,
        canUpdateDocumentTypes: false,
        canUpdateAdvancedSettings: false,
        canChangeProfile: true,
      };
    case "visitor":
      return {
        canUpdateThresholds: false,
        canUpdateDocumentTypes: false,
        canUpdateAdvancedSettings: false,
        canChangeProfile: true,
      };
    default:
      return {
        canUpdateThresholds: false,
        canUpdateDocumentTypes: false,
        canUpdateAdvancedSettings: false,
        canChangeProfile: false,
      };
  }
};

const Settings = () => {
  const {
    fraudThresholds,
    setFraudThresholds,
    documentTypes,
    setDocumentTypes,
    advancedSettings,
    setAdvancedSettings,
    userProfile,
    setUserProfile
  } = useSettings();
  
  const { toast } = useToast();
  
  // Get current profile permissions
  const permissions = getProfilePermissions(userProfile);

  const handleDocTypeChange = (id: string, enabled: boolean) => {
    setDocumentTypes(
      documentTypes.map(type => {
        if (type.id === id) {
          // When disabling a document type, uncheck all its components
          if (!enabled) {
            return {
              ...type,
              enabled,
              components: type.components.map(comp => ({ ...comp, checked: false }))
            };
          }
          // When enabling, keep current component states
          return { ...type, enabled };
        }
        return type;
      })
    );
  };

  const toggleDocType = (id: string) => {
    setDocumentTypes(
      documentTypes.map(type =>
        type.id === id ? { ...type, isOpen: !type.isOpen } : type
      )
    );
  };

  const handleComponentChange = (docTypeId: string, componentId: string, checked: boolean) => {
    setDocumentTypes(
      documentTypes.map(type => {
        if (type.id === docTypeId) {
          return {
            ...type,
            components: type.components.map(comp =>
              comp.id === componentId ? { ...comp, checked } : comp
            )
          };
        }
        return type;
      })
    );
  };

  // Validation function to ensure thresholds are logical
  const handleFraudThresholdChange = (value: number[]) => {
    const newFraudThreshold = value[0];
    let newSuspicionMin = fraudThresholds.suspicionMin;
    let newSuspicionMax = fraudThresholds.suspicionMax;
    
    // Auto-adjust suspicion min if it would be too close to fraud threshold
    if (fraudThresholds.suspicionMin >= newFraudThreshold) {
      newSuspicionMin = Math.max(0, newFraudThreshold - 5);
    }
    
    setFraudThresholds({
      fraudThreshold: newFraudThreshold,
      suspicionMin: Math.max(0, newSuspicionMin)
    });
  };

  const handleSuspicionMinChange = (value: number) => {
    setFraudThresholds({
      ...fraudThresholds,
      suspicionMin: value
    });
  };

  const handleSave = () => {
    // Check if user has permission to save any changes
    if (!permissions.canUpdateThresholds && !permissions.canUpdateDocumentTypes && !permissions.canUpdateAdvancedSettings) {
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les permissions nécessaires pour modifier les paramètres.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate threshold settings if user can update them
    if (permissions.canUpdateThresholds) {
      if (fraudThresholds.suspicionMin >= fraudThresholds.fraudThreshold) {
        toast({
          title: "Erreur de validation",
          description: "Le seuil de suspicion minimum doit être inférieur au seuil de fraude.",
          variant: "destructive"
        });
        return;
      }
    }
    
    toast({
      title: "Paramètres sauvegardés",
      description: "Les nouvelles configurations ont été appliquées.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Paramètres</h1>
          <p className="text-slate-600 mt-1">Configuration des seuils et sensibilité</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Profil :</span>
            <Select value={userProfile} onValueChange={setUserProfile} disabled={!permissions.canChangeProfile}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sélectionner un profil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="administrator">
                  Administrateur (actif)
                </SelectItem>
                <SelectItem value="user">Utilisateur</SelectItem>
                <SelectItem value="visitor">Visiteur</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={handleSave} 
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!permissions.canUpdateThresholds && !permissions.canUpdateDocumentTypes && !permissions.canUpdateAdvancedSettings}
          >
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder
          </Button>
        </div>
      </div>

      {/* Profile Permissions Info */}
      {(userProfile === "user" || userProfile === "visitor") && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <div>
                <h3 className="font-medium text-amber-800 mb-1">
                  Limitations du profil {userProfile === "user" ? "Utilisateur" : "Visiteur"}
                </h3>
                <div className="text-sm text-amber-700">
                  {userProfile === "user" ? (
                    <ul className="list-disc list-inside space-y-1">
                      <li>✅ Vous pouvez modifier les seuils de détection</li>
                      <li>❌ Modification des types de documents restreinte</li>
                      <li>❌ Paramètres avancés en lecture seule</li>
                    </ul>
                  ) : (
                    <ul className="list-disc list-inside space-y-1">
                      <li>👁️ Accès en lecture seule uniquement</li>
                      <li>❌ Aucune modification autorisée</li>
                      <li>ℹ️ Contactez un administrateur pour effectuer des changements</li>
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seuils Configuration */}
      <Card className={`border-0 shadow-sm ${!permissions.canUpdateThresholds ? 'opacity-60' : ''}`}>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            Seuils de risque
            {!permissions.canUpdateThresholds && (
              <Badge variant="secondary" className="text-xs">
                Lecture seule
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-green-50 via-yellow-50 to-red-50 p-6 rounded-xl border border-slate-200">
            {/* Visual threshold bar */}
            <div className="relative mb-6">
              {/* Background bar */}
              <div className="h-8 rounded-full overflow-hidden relative bg-gradient-to-r from-green-200 via-yellow-200 to-red-200">
                {/* Green zone (Accepted) */}
                <div 
                  className="absolute top-0 left-0 h-full bg-green-400"
                  style={{ width: `${fraudThresholds.suspicionMin}%` }}
                ></div>
                
                {/* Yellow zone (Review) */}
                <div 
                  className="absolute top-0 h-full bg-yellow-400"
                  style={{ 
                    left: `${fraudThresholds.suspicionMin}%`,
                    width: `${fraudThresholds.fraudThreshold - fraudThresholds.suspicionMin}%`
                  }}
                ></div>
                
                {/* Red zone (Rejected) */}
                <div 
                  className="absolute top-0 h-full bg-red-400"
                  style={{ 
                    left: `${fraudThresholds.fraudThreshold}%`,
                    width: `${100 - fraudThresholds.fraudThreshold}%`
                  }}
                ></div>
              </div>
              
              {/* Threshold dots and labels */}
              <div className="relative -mt-2">
                {/* First threshold dot (suspicion min) */}
                <div 
                  className="absolute transform -translate-x-1/2"
                  style={{ left: `${fraudThresholds.suspicionMin}%` }}
                >
                  <div className="w-4 h-4 bg-white border-2 border-yellow-500 rounded-full shadow-lg"></div>
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-slate-700 whitespace-nowrap">
                    {fraudThresholds.suspicionMin}%
                  </div>
                </div>
                
                {/* Second threshold dot (fraud threshold) */}
                <div 
                  className="absolute transform -translate-x-1/2"
                  style={{ left: `${fraudThresholds.fraudThreshold}%` }}
                >
                  <div className="w-4 h-4 bg-white border-2 border-red-500 rounded-full shadow-lg"></div>
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-slate-700 whitespace-nowrap">
                    {fraudThresholds.fraudThreshold}%
                  </div>
                </div>
              </div>
              
              {/* Scale markers */}
              <div className="flex justify-between text-xs text-slate-500 mt-8">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Decision rules text */}
            <div className="space-y-2 text-sm text-slate-600 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-400 rounded-full border border-green-500"></div>
                <span><strong>Accepté</strong> : Score &lt; {fraudThresholds.suspicionMin}%</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-yellow-400 rounded-full border border-yellow-500"></div>
                <span><strong>À réviser</strong> : Score entre {fraudThresholds.suspicionMin}% et {fraudThresholds.fraudThreshold}%</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-red-400 rounded-full border border-red-500"></div>
                <span><strong>Rejeté</strong> : Score ≥ {fraudThresholds.fraudThreshold}%</span>
              </div>
            </div>

            {/* Threshold controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Seuil de suspicion minimum</Label>
                <Slider
                  value={[fraudThresholds.suspicionMin]}
                  onValueChange={(value) => handleSuspicionMinChange(value[0])}
                  max={Math.max(0, fraudThresholds.fraudThreshold - 10)}
                  min={0}
                  step={5}
                  className="w-full"
                  disabled={!permissions.canUpdateThresholds}
                />
                <p className="text-xs text-slate-500">Définit le début de la zone de révision</p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Seuil de fraude</Label>
                <Slider
                  value={[fraudThresholds.fraudThreshold]}
                  onValueChange={handleFraudThresholdChange}
                  max={100}
                  min={Math.max(10, fraudThresholds.suspicionMin + 10)}
                  step={5}
                  className="w-full"
                  disabled={!permissions.canUpdateThresholds}
                />
                <p className="text-xs text-slate-500">Documents rejetés au-dessus de ce seuil</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Types Documents */}
      <Card className={`border-0 shadow-sm ${!permissions.canUpdateDocumentTypes ? 'opacity-60' : ''}`}>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            Seuils en vigueur pour les types de documents suivants
            {!permissions.canUpdateDocumentTypes && (
              <Badge variant="secondary" className="text-xs">
                Lecture seule
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-sm font-medium text-slate-700 mb-3">
              Décochez les composants à exclure de l'analyse:
            </p>
          </div>
          
          <div className="space-y-4">
            {documentTypes.map((docType) => (
              <div key={docType.id} className="border border-slate-200 rounded-lg">
                <Collapsible open={docType.isOpen} onOpenChange={() => toggleDocType(docType.id)}>
                  <div className="flex items-center p-4">
                    <Checkbox
                      id={docType.id}
                      checked={docType.enabled}
                      onCheckedChange={(checked) => 
                        handleDocTypeChange(docType.id, checked as boolean)
                      }
                      disabled={!permissions.canUpdateDocumentTypes}
                    />
                    <label 
                      htmlFor={docType.id}
                      className="text-base font-medium text-slate-900 cursor-pointer flex-1 ml-3"
                    >
                      {docType.label}
                    </label>
                    {docType.enabled && (
                      <Badge className="bg-green-100 text-green-800 border-green-200 mr-2">
                        Actif
                      </Badge>
                    )}
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-9 p-0"
                      >
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${docType.isOpen ? 'transform rotate-180' : ''}`} />
                        <span className="sr-only">Toggle</span>
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent className="px-4 pb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-7">
                      {docType.components.map((component) => (
                        <div key={component.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={component.id}
                            checked={component.checked}
                            onCheckedChange={(checked) =>
                              handleComponentChange(docType.id, component.id, checked as boolean)
                            }
                            disabled={!docType.enabled || !permissions.canUpdateDocumentTypes}
                          />
                          <label
                            htmlFor={component.id}
                            className={`text-sm cursor-pointer ${
                              !docType.enabled ? 'text-slate-400' : 'text-slate-700'
                            }`}
                          >
                            • {component.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-800">
              💡 <strong>Attention :</strong> Décocher temporairement les éléments constitutifs des documents impacte directement les résultats de l'analyse.
            </p>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              💡 <strong>Attention :</strong> La désactivation temporaire de certains types de documents impacte directement les résultats de l'analyse par dossier.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card className={`border-0 shadow-sm ${!permissions.canUpdateAdvancedSettings ? 'opacity-60' : ''}`}>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            Paramètres Avancés
            {!permissions.canUpdateAdvancedSettings && (
              <Badge variant="secondary" className="text-xs">
                Lecture seule
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
            <div>
              <h3 className="font-medium text-slate-900">Alertes automatiques</h3>
              <p className="text-sm text-slate-600">Envoyer des notifications lors de détection de fraude</p>
            </div>
            <Checkbox 
              checked={advancedSettings.automaticAlerts}
              onCheckedChange={(checked) => setAdvancedSettings({
                ...advancedSettings,
                automaticAlerts: checked as boolean
              })}
              disabled={!permissions.canUpdateAdvancedSettings} 
            />
          </div>
          
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
            <div>
              <h3 className="font-medium text-slate-900">Logs détaillés</h3>
              <p className="text-sm text-slate-600">Enregistrer les détails d'analyse pour audit</p>
            </div>
            <Checkbox 
              checked={advancedSettings.detailedLogs}
              onCheckedChange={(checked) => setAdvancedSettings({
                ...advancedSettings,
                detailedLogs: checked as boolean
              })}
              disabled={!permissions.canUpdateAdvancedSettings} 
            />
          </div>
          
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
            <div>
              <h3 className="font-medium text-slate-900">Mode développeur</h3>
              <p className="text-sm text-slate-600">Afficher les informations techniques avancées</p>
            </div>
            <Checkbox 
              checked={advancedSettings.developerMode}
              onCheckedChange={(checked) => setAdvancedSettings({
                ...advancedSettings,
                developerMode: checked as boolean
              })}
              disabled={!permissions.canUpdateAdvancedSettings} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Demo Data Manager - Only show in development */}
      {(import.meta.env.DEV || advancedSettings.developerMode) && (
        <DemoDataManager />
      )}
    </div>
  );
};

export default Settings;
