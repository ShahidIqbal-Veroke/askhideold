import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  MoreVertical, Plus, Mail, Users, Shield, AlertTriangle, 
  TrendingUp, Clock, Settings, Edit, Trash2, UserPlus,
  Building2, MapPin, Star, Activity, Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { teamService } from "@/services/teamService";
import { 
  FunctionalTeam, 
  TeamMember, 
  TeamStats,
  CreateTeamRequest,
  UpdateTeamRequest,
  AssignMemberRequest,
  TeamSpecialty,
  Territory,
  TeamRole,
  TechnicalPermission 
} from "@/types/team.types";

export default function Team() {
  const { toast } = useToast();

  // États pour les équipes fonctionnelles
  const [functionalTeams, setFunctionalTeams] = useState<FunctionalTeam[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(true);

  // États pour les modales
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<FunctionalTeam | null>(null);

  // États pour les formulaires
  const [createTeamForm, setCreateTeamForm] = useState<Partial<CreateTeamRequest>>({
    specialties: [],
    workingHours: { start: '08:00', end: '18:00', timezone: 'Europe/Paris' }
  });
  const [assignForm, setAssignForm] = useState<Partial<AssignMemberRequest>>({});

  // Chargement initial des données
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [teams, members, teamStats] = await Promise.all([
        teamService.getFunctionalTeams(),
        teamService.getTeamMembers(),
        teamService.getTeamStats()
      ]);
      
      setFunctionalTeams(teams);
      setTeamMembers(members);
      setStats(teamStats);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données des équipes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // === GESTION DES ÉQUIPES FONCTIONNELLES ===

  const handleCreateTeam = async () => {
    try {
      if (!createTeamForm.name || !createTeamForm.specialty) {
        toast({
          title: "Erreur",
          description: "Nom et spécialité requis",
          variant: "destructive"
        });
        return;
      }

      await teamService.createFunctionalTeam(createTeamForm as CreateTeamRequest);
      
      toast({
        title: "Équipe créée",
        description: `L'équipe ${createTeamForm.name} a été créée avec succès`
      });

      setShowCreateTeamModal(false);
      setCreateTeamForm({
        specialties: [],
        workingHours: { start: '08:00', end: '18:00', timezone: 'Europe/Paris' }
      });
      
      await loadData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la création de l'équipe",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      await teamService.deleteFunctionalTeam(teamId);
      toast({
        title: "Équipe supprimée",
        description: "L'équipe a été supprimée avec succès"
      });
      await loadData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression",
        variant: "destructive"
      });
    }
  };

  // === ASSIGNMENT MEMBRES ===

  const handleAssignMember = async () => {
    try {
      if (!assignForm.memberId || !assignForm.teamId) {
        toast({
          title: "Erreur",
          description: "Membre et équipe requis",
          variant: "destructive"
        });
        return;
      }

      await teamService.assignMemberToTeam(assignForm as AssignMemberRequest);
      
      toast({
        title: "Assignment réussi",
        description: "Le membre a été assigné à l'équipe"
      });

      setShowAssignModal(false);
      setAssignForm({});
      await loadData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'assignment",
        variant: "destructive"
      });
    }
  };

  // === UTILITAIRES UI ===

  const getSpecialtyIcon = (specialty: TeamSpecialty) => {
    switch (specialty) {
      case 'fraude': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'expert_auto': return <Settings className="h-4 w-4 text-blue-600" />;
      case 'gestion_client': return <Users className="h-4 w-4 text-green-600" />;
      case 'it': return <Shield className="h-4 w-4 text-purple-600" />;
      case 'compliance': return <Building2 className="h-4 w-4 text-gray-600" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getSpecialtyLabel = (specialty: TeamSpecialty) => {
    const labels = {
      fraude: 'Fraude',
      expert_auto: 'Expert Auto',
      gestion_client: 'Gestion Client',
      it: 'IT & Cyber',
      compliance: 'Compliance',
      sinistres: 'Sinistres',
      souscription: 'Souscription'
    };
    return labels[specialty];
  };

  const getRoleLabel = (role: TeamRole) => {
    const labels = {
      gestionnaire: 'Gestionnaire',
      superviseur: 'Superviseur',
      direction: 'Direction',
      admin: 'Administrateur'
    };
    return labels[role];
  };

  const getTerritoryLabel = (territory: Territory) => {
    const labels = {
      paris: 'Paris',
      lyon: 'Lyon',
      marseille: 'Marseille',
      national: 'National'
    };
    return labels[territory];
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "pending": return "secondary";
      case "inactive": return "outline";
      case "vacation": return "outline";
      default: return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      active: 'Actif',
      pending: 'En attente',
      inactive: 'Inactif',
      vacation: 'En congé'
    };
    return labels[status] || status;
  };

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
          <h1 className="text-3xl font-bold text-slate-900">Gestion des Équipes</h1>
          <p className="text-slate-600 mt-2">
            Architecture unifiée : équipes fonctionnelles, membres et permissions
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showCreateTeamModal} onOpenChange={setShowCreateTeamModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Créer Équipe
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle équipe fonctionnelle</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom de l'équipe</Label>
                  <Input
                    value={createTeamForm.name || ''}
                    onChange={(e) => setCreateTeamForm({...createTeamForm, name: e.target.value})}
                    placeholder="Ex: Équipe Fraude Avancée"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Spécialité</Label>
                  <Select
                    value={createTeamForm.specialty}
                    onValueChange={(value: TeamSpecialty) => setCreateTeamForm({...createTeamForm, specialty: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fraude">Fraude</SelectItem>
                      <SelectItem value="expert_auto">Expert Auto</SelectItem>
                      <SelectItem value="gestion_client">Gestion Client</SelectItem>
                      <SelectItem value="it">IT & Cyber</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Capacité maximale</Label>
                  <Input
                    type="number"
                    value={createTeamForm.maxCapacity || ''}
                    onChange={(e) => setCreateTeamForm({...createTeamForm, maxCapacity: parseInt(e.target.value)})}
                    placeholder="10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Coût horaire (€)</Label>
                  <Input
                    type="number"
                    value={createTeamForm.costPerHour || ''}
                    onChange={(e) => setCreateTeamForm({...createTeamForm, costPerHour: parseInt(e.target.value)})}
                    placeholder="50"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={createTeamForm.description || ''}
                    onChange={(e) => setCreateTeamForm({...createTeamForm, description: e.target.value})}
                    placeholder="Description des responsabilités et expertise de l'équipe..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateTeamModal(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateTeam}>
                  Créer l'équipe
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                Assigner Membre
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assigner un membre à une équipe</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Membre</Label>
                  <Select
                    value={assignForm.memberId}
                    onValueChange={(value) => setAssignForm({...assignForm, memberId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un membre..." />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map(member => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name} - {getRoleLabel(member.role)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Équipe</Label>
                  <Select
                    value={assignForm.teamId}
                    onValueChange={(value) => setAssignForm({...assignForm, teamId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une équipe..." />
                    </SelectTrigger>
                    <SelectContent>
                      {functionalTeams.map(team => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name} - {getSpecialtyLabel(team.specialty)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Rôle dans l'équipe</Label>
                  <Select
                    value={assignForm.role}
                    onValueChange={(value: 'member' | 'lead' | 'backup') => setAssignForm({...assignForm, role: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un rôle..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Membre</SelectItem>
                      <SelectItem value="lead">Chef d'équipe</SelectItem>
                      <SelectItem value="backup">Suppléant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAssignModal(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAssignMember}>
                  Assigner
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistiques globales */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Équipes Actives</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalTeams}</p>
                </div>
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Membres Actifs</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeMembers}</p>
                  <p className="text-xs text-slate-500">sur {stats.totalMembers} total</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Taux Utilisation</p>
                  <p className="text-2xl font-bold text-purple-600">{(stats.capacity.utilizationRate * 100).toFixed(0)}%</p>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Satisfaction Client</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.overallPerformance.customerSatisfaction.toFixed(1)}</p>
                  <p className="text-xs text-slate-500">sur 5.0</p>
                </div>
                <Star className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Interface principale avec onglets */}
      <Tabs defaultValue="teams" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="teams">Équipes Fonctionnelles ({functionalTeams.length})</TabsTrigger>
          <TabsTrigger value="members">Membres ({teamMembers.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics & Performance</TabsTrigger>
        </TabsList>

        {/* Onglet Équipes Fonctionnelles */}
        <TabsContent value="teams" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {functionalTeams.map((team) => (
              <Card key={team.id} className="cursor-pointer hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getSpecialtyIcon(team.specialty)}
                      <div>
                        <h3 className="font-semibold text-slate-900">{team.name}</h3>
                        <p className="text-sm text-slate-600">{getSpecialtyLabel(team.specialty)}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteTeam(team.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {team.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Capacité</p>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{teamMembers.filter(m => m.functionalTeams.includes(team.id)).length}/{team.maxCapacity}</span>
                          <Progress value={(teamMembers.filter(m => m.functionalTeams.includes(team.id)).length / team.maxCapacity) * 100} className="flex-1 h-2" />
                        </div>
                      </div>
                      <div>
                        <p className="text-slate-500">SLA</p>
                        <p className="font-medium">{team.slaHours}h</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Taux Completion</p>
                        <p className="font-medium text-green-600">{team.stats.completionRate}%</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Coût/heure</p>
                        <p className="font-medium">{team.costPerHour}€</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {team.specialties.slice(0, 2).map((specialty, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                      {team.specialties.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{team.specialties.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Onglet Membres */}
        <TabsContent value="members" className="mt-6">
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <Card key={member.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>
                          {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-slate-900">{member.name}</div>
                        <div className="text-sm text-slate-500">{member.email}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {getRoleLabel(member.role)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <MapPin className="h-3 w-3 mr-1" />
                            {getTerritoryLabel(member.territory)}
                          </Badge>
                          <Badge variant={getStatusBadgeVariant(member.status)} className="text-xs">
                            {getStatusLabel(member.status)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-slate-500">Équipes assignées</div>
                      <div className="flex flex-wrap gap-1 mt-1 justify-end">
                        {member.functionalTeams.map(teamId => {
                          const team = functionalTeams.find(t => t.id === teamId);
                          return team ? (
                            <Badge key={teamId} variant="secondary" className="text-xs">
                              {getSpecialtyLabel(team.specialty)}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {member.individualStats.casesHandled} dossiers traités
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Onglet Analytics */}
        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance par Spécialité</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats && Object.entries(stats.bySpecialty).map(([specialty, data]) => (
                    <div key={specialty} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getSpecialtyIcon(specialty as TeamSpecialty)}
                        <span className="font-medium">{getSpecialtyLabel(specialty as TeamSpecialty)}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{data.completionRate.toFixed(0)}% completion</div>
                        <div className="text-xs text-slate-500">{data.members} membres</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Répartition Territoriale</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats && Object.entries(stats.byTerritory).map(([territory, data]) => (
                    <div key={territory} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">{getTerritoryLabel(territory as Territory)}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{data.members} membres</div>
                        <div className="text-xs text-slate-500">{data.workload} dossiers</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}