import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
}

export default function ApiKeys() {
  const { toast } = useToast();
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [newKeyName, setNewKeyName] = useState("");
  
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: "1",
      name: "Production API",
      key: "hd_sk_1234567890abcdef1234567890abcdef",
      createdAt: "2024-01-15",
      lastUsed: "2024-01-20"
    },
    {
      id: "2", 
      name: "Development API",
      key: "hd_sk_abcdef1234567890abcdef1234567890",
      createdAt: "2024-01-10",
      lastUsed: "2024-01-19"
    }
  ]);

  const handleCreateKey = () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un nom pour la clé API",
        variant: "destructive"
      });
      return;
    }

    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `hd_sk_${Math.random().toString(36).substring(2, 34)}`,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setApiKeys([...apiKeys, newKey]);
    setNewKeyName("");
    toast({
      title: "Clé API créée",
      description: "Votre nouvelle clé API a été générée avec succès"
    });
  };

  const handleDeleteKey = (id: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== id));
    toast({
      title: "Clé API supprimée",
      description: "La clé API a été supprimée avec succès"
    });
  };

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "Copié",
      description: "Clé API copiée dans le presse-papiers"
    });
  };

  const toggleShowKey = (id: string) => {
    setShowKey(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const maskKey = (key: string) => {
    return key.substring(0, 8) + "..." + key.substring(key.length - 4);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Clés API</h1>
        <p className="text-gray-600 mt-1">
          Gérez vos clés API pour accéder aux services Hedi
        </p>
      </div>

      {/* Create new API key */}
      <Card>
        <CardHeader>
          <CardTitle>Créer une nouvelle clé API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="keyName">Nom de la clé</Label>
              <Input
                id="keyName"
                placeholder="Ex: Production, Development..."
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleCreateKey}>
                <Plus className="w-4 h-4 mr-2" />
                Créer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Keys list */}
      <div className="space-y-4">
        {apiKeys.map((apiKey) => (
          <Card key={apiKey.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-gray-900">{apiKey.name}</h3>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-sm text-gray-600">
                    <span>
                      {showKey[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleShowKey(apiKey.id)}
                    >
                      {showKey[apiKey.id] ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(apiKey.key)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-gray-500">
                    Créée le {new Date(apiKey.createdAt).toLocaleDateString('fr-FR')}
                    {apiKey.lastUsed && (
                      <span> • Dernière utilisation: {new Date(apiKey.lastUsed).toLocaleDateString('fr-FR')}</span>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteKey(apiKey.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}