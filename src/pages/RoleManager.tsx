import { useState, useEffect, useCallback } from 'react';
import { useAuth, UserRole } from '@/hooks/useAuth';
import { userRoleService, UserWithRole, RoleStats, RoleAssignmentRequest } from '@/services/userRoleService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, Shield, Crown, Settings, Plus, Edit, Trash2,
  UserPlus, AlertTriangle, CheckCircle, Activity, 
  BarChart3, TrendingUp, Clock, Mail
} from 'lucide-react';

const RoleManager = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  // États
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [stats, setStats] = useState<RoleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  
  // Modales
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);

  // Formulaires
  const [assignForm, setAssignForm] = useState<Partial<RoleAssignmentRequest>>({});
  const [bulkEmails, setBulkEmails] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [usersData, statsData] = await Promise.all([
        userRoleService.getAllUsers(),
        userRoleService.getStats()
      ]);
      
      setUsers(usersData);
      setStats(statsData);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Chargement des données
  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin, loadData]);

  // === HANDLERS ===

  const handleAssignRole = async () => {
    try {
      if (!assignForm.userId || !assignForm.role || !user?.id) {
        toast({
          title: "Erreur",
          description: "Utilisateur et rôle requis",
          variant: "destructive"
        });
        return;
      }

      const request: RoleAssignmentRequest = {
        userId: assignForm.userId,
        role: assignForm.role,
        team: assignForm.team,
        functionalTeams: assignForm.functionalTeams,
        assignedBy: user.id,
        reason: assignForm.reason
      };

      await userRoleService.assignRole(request);
      
      toast({
        title: "Rôle assigné",
        description: `Rôle ${assignForm.role} assigné avec succès`
      });

      setShowAssignModal(false);
      setAssignForm({});
      await loadData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'assignation",
        variant: "destructive"
      });
    }
  };

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    try {
      const success = await userRoleService.updateUserRole(userId, newRole, user?.id || '');
      
      if (success) {
        toast({
          title: "Rôle modifié",
          description: "Le rôle a été mis à jour avec succès"
        });
        await loadData();
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le rôle",
        variant: "destructive"
      });
    }
  };

  const handleBulkAssign = async () => {
    try {
      const emails = bulkEmails.split('\n').filter(email => email.trim());
      const requests: RoleAssignmentRequest[] = emails.map(email => ({
        userId: `bulk_${Date.now()}_${email}`, // Temporary ID
        role: 'gestionnaire', // Default role
        assignedBy: user?.id || '',
        reason: 'Assignation en lot'
      }));

      await userRoleService.bulkAssignRoles(requests);
      
      toast({
        title: "Assignation en lot réussie",
        description: `${emails.length} utilisateur(s) assigné(s)`
      });

      setShowBulkModal(false);
      setBulkEmails('');
      await loadData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'assignation en lot",
        variant: "destructive"
      });
    }
  };

  // === FILTRAGE ===

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // === UTILITAIRES UI ===

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4 text-purple-600" />;
      case 'direction': return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'superviseur': return <Shield className="w-4 h-4 text-green-600" />;
      case 'gestionnaire': return <Users className="w-4 h-4 text-slate-600" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'direction': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'superviseur': return 'bg-green-100 text-green-800 border-green-200';
      case 'gestionnaire': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Vérification des permissions
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Accès réservé aux administrateurs uniquement.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestion des Rôles</h1>
          <p className="text-slate-600 mt-2">
            Administration des utilisateurs et attribution des rôles
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showBulkModal} onOpenChange={setShowBulkModal}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserPlus className="w-4 h-4 mr-2" />
                Assignation en lot
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assignation en lot</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Emails (un par ligne)</Label>
                  <textarea
                    className="w-full mt-1 p-2 border rounded-md h-32"
                    value={bulkEmails}
                    onChange={(e) => setBulkEmails(e.target.value)}
                    placeholder="user1@company.com&#10;user2@company.com&#10;..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowBulkModal(false)}>
                  Annuler
                </Button>
                <Button onClick={handleBulkAssign}>
                  Assigner
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Assigner Rôle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assigner un rôle utilisateur</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ID Utilisateur</Label>
                  <Input
                    value={assignForm.userId || ''}
                    onChange={(e) => setAssignForm({...assignForm, userId: e.target.value})}
                    placeholder="user_12345"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rôle</Label>
                  <Select
                    value={assignForm.role}
                    onValueChange={(value: UserRole) => setAssignForm({...assignForm, role: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gestionnaire">Gestionnaire</SelectItem>
                      <SelectItem value="superviseur">Superviseur</SelectItem>
                      <SelectItem value="direction">Direction</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Raison (optionnel)</Label>
                  <Input
                    value={assignForm.reason || ''}
                    onChange={(e) => setAssignForm({...assignForm, reason: e.target.value})}
                    placeholder="Motif de l'assignation..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAssignModal(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAssignRole}>
                  Assigner
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Utilisateurs</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Gestionnaires</p>
                  <p className="text-2xl font-bold text-slate-600">{stats.byRole.gestionnaire}</p>
                </div>
                <Users className="w-8 h-8 text-slate-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Superviseurs</p>
                  <p className="text-2xl font-bold text-green-600">{stats.byRole.superviseur}</p>
                </div>
                <Shield className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Admins</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.byRole.admin}</p>
                </div>
                <Crown className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Interface principale */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">Utilisateurs ({filteredUsers.length})</TabsTrigger>
          <TabsTrigger value="recent">Assignations récentes</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          {/* Filtres */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="gestionnaire">Gestionnaires</SelectItem>
                <SelectItem value="superviseur">Superviseurs</SelectItem>
                <SelectItem value="direction">Direction</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Liste des utilisateurs */}
          <div className="space-y-4">
            {filteredUsers.map((userData) => (
              <Card key={userData.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>
                          {userData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-slate-900">{userData.name}</div>
                        <div className="text-sm text-slate-500 flex items-center gap-2">
                          <Mail className="w-3 h-3" />
                          {userData.email}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`text-xs ${getRoleColor(userData.role)}`}>
                            {getRoleIcon(userData.role)}
                            <span className="ml-1">{userData.role}</span>
                          </Badge>
                          <Badge variant="outline" className={`text-xs ${getStatusColor(userData.status)}`}>
                            {userData.status}
                          </Badge>
                          {userData.team && (
                            <Badge variant="outline" className="text-xs">
                              {userData.team}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-right text-sm text-slate-500">
                        {userData.assignedAt && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {userData.assignedAt.toLocaleDateString()}
                          </div>
                        )}
                        {userData.assignedBy && (
                          <div className="text-xs">par {userData.assignedBy}</div>
                        )}
                      </div>
                      
                      <Select onValueChange={(value: UserRole) => handleUpdateRole(userData.id, value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Modifier..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gestionnaire">Gestionnaire</SelectItem>
                          <SelectItem value="superviseur">Superviseur</SelectItem>
                          <SelectItem value="direction">Direction</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Aucun utilisateur trouvé</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Assignations récentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.lastAssignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">
                          {assignment.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{assignment.name}</p>
                        <p className="text-xs text-slate-500">{assignment.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`text-xs ${getRoleColor(assignment.role)}`}>
                        {assignment.role}
                      </Badge>
                      <p className="text-xs text-slate-500 mt-1">
                        {assignment.assignedAt?.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RoleManager;