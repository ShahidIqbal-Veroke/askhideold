import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  User, Shield, Crown, Settings, Edit, Save, 
  Mail, Calendar, Users, Activity, CheckCircle,
  Clock, MapPin, Phone, Building
} from 'lucide-react';

const UserProfilePage = () => {
  const { user, role, isAdmin, isSuperviseur, isDirection } = useAuth();
  const { toast } = useToast();
  
  // États locaux
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    department: '',
    location: '',
    bio: ''
  });

  // Informations du rôle
  const getRoleInfo = () => {
    switch (role) {
      case 'admin':
        return {
          icon: <Crown className="w-5 h-5 text-purple-600" />,
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          title: 'Administrateur Système',
          description: 'Accès complet à toutes les fonctionnalités'
        };
      case 'direction':
        return {
          icon: <Activity className="w-5 h-5 text-blue-600" />,
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          title: 'Direction',
          description: 'Supervision stratégique et gestion des équipes'
        };
      case 'superviseur':
        return {
          icon: <Shield className="w-5 h-5 text-green-600" />,
          color: 'bg-green-100 text-green-800 border-green-200',
          title: 'Superviseur',
          description: 'Encadrement opérationnel et validation des dossiers'
        };
      case 'gestionnaire':
        return {
          icon: <Users className="w-5 h-5 text-slate-600" />,
          color: 'bg-slate-100 text-slate-800 border-slate-200',
          title: 'Gestionnaire',
          description: 'Traitement des demandes et analyse des alertes'
        };
      default:
        return {
          icon: <User className="w-5 h-5" />,
          color: 'bg-gray-100 text-gray-800',
          title: 'Utilisateur',
          description: 'Accès standard'
        };
    }
  };

  const roleInfo = getRoleInfo();

  const handleSaveProfile = async () => {
    try {
      // Ici, on sauvegarderait les données via un service
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès"
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le profil",
        variant: "destructive"
      });
    }
  };

  const getInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    return names.length > 1 
      ? `${names[0][0]}${names[names.length - 1][0]}` 
      : names[0][0];
  };

  const getUserStats = () => {
    // Données mockées - à remplacer par de vraies données
    return {
      alertsTraitees: 127,
      dossiersCrees: 43,
      tauxResolution: 89,
      dernierConnexion: new Date().toLocaleDateString()
    };
  };

  const stats = getUserStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Mon Profil</h1>
          <p className="text-slate-600 mt-2">
            Gérez vos informations personnelles et préférences
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveProfile}>
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche - Informations principales */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profil</TabsTrigger>
              <TabsTrigger value="security">Sécurité</TabsTrigger>
              <TabsTrigger value="preferences">Préférences</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Informations personnelles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nom complet</Label>
                      {isEditing ? (
                        <Input
                          value={profileData.name}
                          onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        />
                      ) : (
                        <p className="p-2 bg-slate-50 rounded border">{profileData.name}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-500" />
                        <p className="p-2 bg-slate-50 rounded border flex-1">{profileData.email}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Téléphone</Label>
                      {isEditing ? (
                        <Input
                          value={profileData.phone}
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          placeholder="+33 1 23 45 67 89"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-slate-500" />
                          <p className="p-2 bg-slate-50 rounded border flex-1">
                            {profileData.phone || 'Non renseigné'}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Localisation</Label>
                      {isEditing ? (
                        <Input
                          value={profileData.location}
                          onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                          placeholder="Paris, France"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-500" />
                          <p className="p-2 bg-slate-50 rounded border flex-1">
                            {profileData.location || 'Non renseigné'}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label>Département</Label>
                      {isEditing ? (
                        <Input
                          value={profileData.department}
                          onChange={(e) => setProfileData({...profileData, department: e.target.value})}
                          placeholder="Anti-fraude"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-slate-500" />
                          <p className="p-2 bg-slate-50 rounded border flex-1">
                            {profileData.department || 'Non renseigné'}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label>Biographie</Label>
                      {isEditing ? (
                        <textarea
                          className="w-full p-2 border rounded-md h-20"
                          value={profileData.bio}
                          onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                          placeholder="Décrivez-vous en quelques mots..."
                        />
                      ) : (
                        <p className="p-2 bg-slate-50 rounded border min-h-[80px]">
                          {profileData.bio || 'Aucune biographie renseignée'}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Sécurité et accès
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      La gestion des mots de passe et de l'authentification est gérée par Clerk. 
                      Utilisez les paramètres de votre compte Clerk pour modifier ces informations.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Préférences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Notifications par email</h4>
                        <p className="text-sm text-slate-500">Recevoir les alertes importantes par email</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Configurer
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Langue</h4>
                        <p className="text-sm text-slate-500">Langue de l'interface</p>
                      </div>
                      <Badge variant="outline">Français</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Colonne droite - Avatar et rôle */}
        <div className="space-y-6">
          {/* Avatar et rôle */}
          <Card>
            <CardContent className="p-6 text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4">
                {user?.avatar && <AvatarImage src={user.avatar} />}
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {user?.name || 'Utilisateur'}
              </h3>
              
              <Badge className={`text-sm ${roleInfo.color} mb-3`}>
                {roleInfo.icon}
                <span className="ml-2">{roleInfo.title}</span>
              </Badge>
              
              <p className="text-sm text-slate-600 mb-4">
                {roleInfo.description}
              </p>

              <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
                <Calendar className="w-3 h-3" />
                Membre depuis {new Date().getFullYear()}
              </div>
            </CardContent>
          </Card>

          {/* Statistiques rapides */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Alertes traitées</span>
                <Badge variant="outline">{stats.alertsTraitees}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Dossiers créés</span>
                <Badge variant="outline">{stats.dossiersCrees}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Taux de résolution</span>
                <Badge variant="outline" className="text-green-700">
                  {stats.tauxResolution}%
                </Badge>
              </div>
              
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="w-3 h-3" />
                  Dernière connexion: {stats.dernierConnexion}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Équipe */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Équipe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-slate-500" />
                <span>{user?.team || 'Équipe non assignée'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;