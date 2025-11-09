import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/types/alert.types';
import { Users, ArrowRight, AlertTriangle, UserCheck, Shield } from 'lucide-react';

interface TeamOption {
  value: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  members: string[];
  averageProcessingTime: string;
  specialties: string[];
}

const TEAM_OPTIONS: TeamOption[] = [
  {
    value: 'fraud_internal',
    label: 'Équipe Fraude Interne',
    description: 'Investigation approfondie des fraudes complexes et réseaux organisés',
    icon: <AlertTriangle className="w-4 h-4" />,
    members: ['Expert.Fraude', 'A. Investigateur', 'M. Specialist'],
    averageProcessingTime: '3-5 jours',
    specialties: ['Fraude documentaire', 'Réseaux organisés', 'Analyses comportementales', 'Fraude à grande échelle']
  },
  {
    value: 'expert_auto',
    label: 'Expert Automobile',
    description: 'Expertise technique véhicules et sinistres auto',
    icon: <UserCheck className="w-4 h-4" />,
    members: ['Expert.Auto.1', 'Expert.Auto.2', 'Expert.Auto.3'],
    averageProcessingTime: '2-3 jours',
    specialties: ['Expertise technique', 'Évaluation dommages', 'Détection staging', 'Analyse mécanique']
  },
  {
    value: 'gestionnaire',
    label: 'Équipe Gestionnaire',
    description: 'Gestion des dossiers standards et qualification initiale',
    icon: <Users className="w-4 h-4" />,
    members: ['V. Dubois', 'M. Bernard', 'S. Laurent', 'A. Martin'],
    averageProcessingTime: '1-2 jours',
    specialties: ['Qualification rapide', 'Gestion courante', 'Relation client', 'Traitement initial']
  },
  {
    value: 'equipe_it',
    label: 'Équipe IT',
    description: 'Support technique, cyber-fraude et analyses digitales',
    icon: <Shield className="w-4 h-4" />,
    members: ['IT.Security', 'Dev.Support', 'Data.Analyst'],
    averageProcessingTime: '2-4 jours',
    specialties: ['Cyber-fraude', 'Analyse digitale', 'Forensics', 'Support technique']
  }
];

interface TeamTransferModalProps {
  alert: Alert;
  isOpen: boolean;
  onClose: () => void;
  onTransfer: (teamId: string, reason: string, urgency: 'immediate' | 'within_24h' | 'within_week' | 'routine') => Promise<void>;
}

export const TeamTransferModal: React.FC<TeamTransferModalProps> = ({
  alert,
  isOpen,
  onClose,
  onTransfer
}) => {
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [urgency, setUrgency] = useState<'immediate' | 'within_24h' | 'within_week' | 'routine'>('within_24h');
  const [isLoading, setIsLoading] = useState(false);

  const selectedTeamData = TEAM_OPTIONS.find(team => team.value === selectedTeam);

  const handleTransfer = async () => {
    if (!selectedTeam || !reason.trim()) return;

    setIsLoading(true);
    try {
      await onTransfer(selectedTeam, reason.trim(), urgency);
      onClose();
      // Reset form
      setSelectedTeam('');
      setReason('');
      setUrgency('within_24h');
    } catch (error) {
      console.error('Erreur lors du transfert:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUrgencyColor = (urgencyLevel: string) => {
    switch (urgencyLevel) {
      case 'immediate': return 'bg-red-100 text-red-800 border-red-200';
      case 'within_24h': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'within_week': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'routine': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstimatedCost = () => {
    if (!selectedTeamData) return 0;
    
    const baseCosts = {
      fraud_internal: 500,
      expert_auto: 300,
      gestionnaire: 150,
      equipe_it: 400
    };
    
    const urgencyMultiplier = {
      immediate: 2.0,
      within_24h: 1.5,
      within_week: 1.2,
      routine: 1.0
    };
    
    return Math.round(baseCosts[selectedTeam as keyof typeof baseCosts] * urgencyMultiplier[urgency]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Transférer à l'équipe spécialisée</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Alert Summary */}
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Alerte à transférer</h4>
              <Badge className={`${
                alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {alert.severity}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">ID:</span> {alert.id}
              </div>
              <div>
                <span className="text-slate-500">Score:</span> {alert.score}%
              </div>
              <div>
                <span className="text-slate-500">Document:</span> {alert.metadata.documentType}
              </div>
              <div>
                <span className="text-slate-500">Montant:</span> {alert.metadata.amount ? `${alert.metadata.amount}€` : 'N/A'}
              </div>
            </div>
          </div>

          {/* Team Selection */}
          <div className="space-y-3">
            <Label htmlFor="team-select">Équipe de destination</Label>
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner l'équipe spécialisée..." />
              </SelectTrigger>
              <SelectContent>
                {TEAM_OPTIONS.map((team) => (
                  <SelectItem key={team.value} value={team.value}>
                    <div className="flex items-center space-x-2">
                      {team.icon}
                      <span>{team.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Team Details */}
            {selectedTeamData && (
              <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  {selectedTeamData.icon}
                  <h4 className="font-medium">{selectedTeamData.label}</h4>
                </div>
                <p className="text-sm text-slate-600">{selectedTeamData.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Temps de traitement:</span>
                    <p className="text-slate-600">{selectedTeamData.averageProcessingTime}</p>
                  </div>
                  <div>
                    <span className="font-medium">Membres disponibles:</span>
                    <p className="text-slate-600">{selectedTeamData.members.length} experts</p>
                  </div>
                </div>
                
                <div>
                  <span className="font-medium text-sm">Spécialités:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedTeamData.specialties.map((specialty, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Urgency */}
          <div className="space-y-3">
            <Label htmlFor="urgency-select">Niveau d'urgence</Label>
            <Select value={urgency} onValueChange={(value: any) => setUrgency(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immédiat (dans l'heure)</SelectItem>
                <SelectItem value="within_24h">Sous 24h</SelectItem>
                <SelectItem value="within_week">Sous 1 semaine</SelectItem>
                <SelectItem value="routine">Routine</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reason */}
          <div className="space-y-3">
            <Label htmlFor="reason">Justification du transfert *</Label>
            <Textarea 
              id="reason"
              placeholder="Expliquer pourquoi cette alerte nécessite l'intervention de l'équipe spécialisée..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              required
            />
          </div>

          {/* Cost Estimation */}
          {selectedTeam && (
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-sm">Coût estimé de l'expertise:</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={getUrgencyColor(urgency)} variant="outline">
                      {urgency}
                    </Badge>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    <span className="font-bold text-lg">{getEstimatedCost()}€</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleTransfer}
            disabled={!selectedTeam || !reason.trim() || isLoading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isLoading ? 'Transfert en cours...' : 'Transférer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};