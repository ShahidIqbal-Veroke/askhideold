# Architecture Salesforce Anti-Fraude - Document de Référence

## Vision Produit : Plateforme Event-Driven de Gestion Fraude

### Concept Central
Transformation d'un outil de détection documentaire en **"Salesforce pour la Fraude"** - une plateforme complète de gestion opérationnelle de la fraude basée sur l'**event-sourcing**, équivalent à ce que Salesforce est pour la relation client.

### Architecture Modulaire Multi-Flux

```
┌────────────────────── PLATEFORME EVENT-DRIVEN ANTI-FRAUDE ──────────────────────┐
│                                                                                  │
│  SOURCES ÉVÉNEMENTS          CORE PLATFORM              UTILISATEURS             │
│  ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐      │
│  │ Upload Button   │──┐    │                 │       │ • Gestionnaire  │      │
│  │ (Documents)     │  │    │  Event Stream   │       │ • Superviseur   │      │
│  └─────────────────┘  │    │  Processing     │       │ • Direction     │      │
│                       │    │                 │       │ • Admin         │      │
│  ┌─────────────────┐  ├───▶│ ┌─────────────┐ │◀─────▶└─────────────────┘      │
│  │FraudDetection   │  │    │ │ Historique  │ │                                │
│  │Service API      │  │    │ │ (Hub)       │ │       ┌─────────────────┐      │
│  └─────────────────┘  │    │ └─────────────┘ │       │   Dashboards    │      │
│                       │    │        ↓        │──────▶│   Par Rôle      │      │
│  ┌─────────────────┐  │    │ Alert Detection │       │                 │      │
│  │ Transactions    │  │    │ ┌─────────────┐ │       └─────────────────┘      │
│  │ & Événements    │──┘    │ │ Alertes     │ │                                │
│  └─────────────────┘       │ │ Dossiers    │ │       ┌─────────────────┐      │
│                            │ │ ROI         │ │       │ Risk Profiles   │      │
│                            │ └─────────────┘ │       │ & Analytics     │      │
│                            └─────────────────┘       └─────────────────┘      │
└──────────────────────────────────────────────────────────────────────────────────┘
```

## Transformation du Flux de Travail

### Flux Actuel (Simple)
```
Upload → Analyse → Résultat → FIN
```

### Nouveau Flux (Event-Driven Anti-Fraude)
```
ÉVÉNEMENT → CYCLE DE VIE → HISTORIQUE → ALERTE → QUALIFICATION → IMPACT RISQUE
    ↑           ↓              ↓           ↓           ↓              ↓
Upload      État Assuré    Intelligence  Queue    Gestionnaire   Profil Assuré
                                         ↓
                                     DOSSIER → Investigation → ROI
```

## Architecture Event-Sourcing Complète

### Diagramme des Relations
```
Assuré/Prospect ↔ Risque
        ↑
        | (impact si alerte avérée)
Historique → Alerte → Dossier
        ↑
Cycle de vie 
        ↑
 Événement ↔ (sources externes/upload)
```

## Structures de Données Event-Driven

### 1. Événement (Event) - Source de Vérité
```typescript
interface Evenement {
  // Identification
  id: string
  reference_externe?: string
  numero_suivi: string
  
  // Classification
  type: 'document_upload' | 'declaration_sinistre' | 'modification_contrat' | 'paiement'
  category: 'commercial' | 'operationnel' | 'sinistre' | 'fraude'
  priority: 'low' | 'medium' | 'high' | 'critical'
  
  // Origine
  source: 'client' | 'system' | 'external_api' | 'fraud_detection'
  channel: 'web' | 'mobile' | 'api' | 'upload'
  
  // Contenu
  data: any  // Données spécifiques à l'événement
  metadata: any  // Contexte technique
  
  // Relations
  assure_id?: string
  cycle_vie_id?: string
  
  // Timeline
  occurred_at: Date
  created_at: Date
}
```

### 2. Cycle de Vie (Lifecycle) - Contexte Métier
```typescript
interface CycleVie {
  id: string
  assure_id: string
  current_stage: 'souscription' | 'vie_contrat' | 'sinistre_paiement' | 'resiliation'
  status: 'active' | 'completed' | 'suspended'
  progression: number  // 0-100%
  
  // Données contextuelles par étape
  stage_data: {
    souscription?: any
    vie_contrat?: any
    sinistre_paiement?: any
    resiliation?: any
  }
  
  // Métriques
  duration_current_stage: number  // jours
  total_duration: number
  events_count: number
  
  created_at: Date
  updated_at: Date
}
```

### 3. Historique (History) - Hub Central
```typescript
interface Historique {
  id: string
  assure_id: string
  evenement_id: string  // Source événement
  cycle_vie_id?: string
  
  // Classification de l'événement historique
  event_type: string
  category: 'commercial' | 'operationnel' | 'fraude' | 'sinistre'
  impact: 'low' | 'medium' | 'high' | 'critical'
  
  // Description
  title: string
  description: string
  
  // Contexte métier enrichi
  business_context: any
  
  // Acteurs
  triggered_by: string
  affected_users: string[]
  
  // Intelligence - Détection de patterns
  patterns_detected?: string[]
  anomaly_score?: number
  correlation_ids?: string[]
  
  // État
  requires_action: boolean
  action_taken?: string
  
  created_at: Date
}
```

### 4. Alerte (Alert) - Signal Dérivé de l'Historique
```typescript
interface Alert {
  // Identification
  id: string
  historique_id: string  // Événement historique source
  evenement_id: string   // Événement original
  
  // Source de détection
  source: 'document_analysis' | 'pattern_detection' | 'behavioral_analysis' | 'correlation'
  detection_module: string
  
  // Classification (générée par intelligence historique)
  type: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  score: number  // 0-100 unifié
  confidence: number  // 0-1
  
  // Contexte métier
  assure_id: string
  business_context: {
    sinister_number?: string
    policy_number?: string
    insured_name?: string
    amount?: number
    cycle_stage?: string
  }
  
  // Workflow States  
  status: 'pending' | 'assigned' | 'in_review' | 'qualified' | 'rejected'
  qualification?: 'fraud_confirmed' | 'false_positive' | 'requires_investigation'
  
  // Assignation
  assigned_to?: string
  assigned_by?: string
  assigned_at?: Date
  team?: string
  
  // Impact sur risque (feedback conditionnel)
  impacts_risk: boolean  // true si qualification = fraud_confirmed
  risk_impact_applied?: Date
  
  // Données de détection
  detection_data: any
  enriched_context: any
  
  // Traçabilité
  created_at: Date
  updated_at: Date
  qualified_at?: Date
  qualified_by?: string
}
```

### 5. Risque (Risk) - Profil Évolutif Assuré
```typescript
interface Risque {
  id: string
  assure_id: string  // Risque appartient à un assuré spécifique
  
  // État du risque
  level: 'very_low' | 'low' | 'medium' | 'high' | 'very_high' | 'critical'
  score: number  // 0-100, calculé depuis historique
  confidence: number  // 0-1
  
  // Facteurs de risque (calculés depuis événements)
  risk_factors: {
    document_inconsistencies: number
    frequency_anomalies: number
    amount_patterns: number
    behavioral_score: number
    historical_confirmed_frauds: number
  }
  
  // Impact des alertes confirmées
  confirmed_alerts_impact: {
    count: number
    total_impact: number
    last_confirmation: Date
  }
  
  // Évolution temporelle
  trend: 'increasing' | 'stable' | 'decreasing'
  last_updated: Date
  next_review: Date
  
  // Contexte métier
  business_context: any
  
  created_at: Date
  updated_at: Date
}
```

### 6. Dossier (Case) - Investigation
```typescript
interface Case {
  id: string
  reference: string  // CASE-2024-001
  
  // Origine (dérivé des alertes)
  primary_alert_id: string
  related_alert_ids: string[]
  assure_id: string
  
  // Contexte métier
  business_context: {
    sinister_number?: string
    policy_info?: any
    estimated_amount?: number
  }
  
  // Investigation
  status: 'open' | 'investigating' | 'pending_review' | 'closed'
  priority: 'urgent' | 'high' | 'normal' | 'low'
  investigator?: string
  supervisor?: string
  investigation_team: 'gestionnaire' | 'fraude' | 'expert'
  
  // Décision et impact
  decision?: 'fraud_confirmed' | 'fraud_rejected' | 'insufficient_proof'
  decision_reason?: string
  decision_date?: Date
  
  // Impact sur profil risque assuré
  risk_impact: {
    applied: boolean
    risk_score_change?: number
    risk_level_change?: string
  }
  
  // ROI
  financial_impact: {
    estimated_loss: number
    recovered_amount: number
    prevented_amount: number
    investigation_cost: number
    total_roi: number
  }
  
  // Évolution du dossier
  timeline: {
    event: string
    date: Date
    actor: string
    description: string
  }[]
  
  created_at: Date
  closed_at?: Date
}
```

## Workflow Event-Driven Détaillé

### Workflow "Analyse de Document" (Point d'Entrée Principal)

```
1. UPLOAD DOCUMENT (Utilisateur)
   ↓
2. ÉVÉNEMENT CRÉÉ (type: document_upload)
   ↓  
3. CYCLE DE VIE MIS À JOUR (contexte assuré)
   ↓
4. ANALYSE IA EXTERNE (40.119.130.55)
   ↓
5. HISTORIQUE ENRICHI (événement + résultat analyse)
   ↓
6. DÉTECTION INTELLIGENCE (patterns, anomalies)
   ↓
7. ALERTE GÉNÉRÉE (si score > seuil)
   ↓
8. QUEUE GESTIONNAIRE (workflow humain)
   ↓
9. QUALIFICATION (fraud_confirmed/false_positive)
   ↓
10. IMPACT RISQUE CONDITIONNEL (si fraud_confirmed)
    ↓
11. DOSSIER CRÉÉ (si requires_investigation)
    ↓
12. ROI TRACKING (résultats financiers)
```

### Point d'Entrée par Rôle Utilisateur

#### **Gestionnaire - Dashboard Opérationnel**
```
┌─────────────────────────────────────────┐
│ 🚨 Queue Alertes (8 en attente)        │
│ ├─ Critique (2) - Action immédiate     │
│ ├─ Haute (3) - Traiter aujourd'hui     │  
│ └─ Moyenne (3) - Planifié cette semaine│
├─────────────────────────────────────────┤
│ 📊 Contexte Intelligence               │
│ ├─ Nouveaux patterns détectés (3)      │
│ ├─ Corrélations identifiées (5)        │
│ └─ Profils risque mis à jour (12)      │
├─────────────────────────────────────────┤
│ 🎯 Ma Performance                      │
│ ├─ Précision: 94%                     │
│ ├─ Temps moyen: 35min                  │
│ └─ ROI généré: €45,230                 │
└─────────────────────────────────────────┘
```

#### **Superviseur - Dashboard Équipe**
```
┌─────────────────────────────────────────┐
│ 👥 Gestion Équipe                      │
│ ├─ Alertes non-assignées (12)          │
│ ├─ Charge de travail équilibrée        │
│ └─ SLA: 98% respectés                   │
├─────────────────────────────────────────┤
│ 📈 Performance Équipe                  │  
│ ├─ Throughput: 127 alertes/semaine     │
│ ├─ Qualité: 91% précision moyenne      │
│ └─ Escalations: 5% taux normal         │
└─────────────────────────────────────────┘
```

#### **Direction - Dashboard Stratégique**
```
┌─────────────────────────────────────────┐
│ 💰 Impact Financier                    │
│ ├─ ROI Global: €2.3M ce trimestre      │
│ ├─ Fraudes détectées: €890K            │
│ └─ Coût opérationnel: €140K            │
├─────────────────────────────────────────┤
│ 📊 Tendances & Intelligence            │
│ ├─ Nouveaux patterns fraude (3)        │
│ ├─ Risques émergents identifiés        │
│ └─ Prédictions ML: +15% alertes Q4     │
└─────────────────────────────────────────┘
```

### 7. Assuré/Prospect - Profil Central
```typescript
interface Assure {
  id: string
  numero_client: string
  type: 'particulier' | 'professionnel' | 'entreprise'
  
  // Informations identité
  identity: {
    nom?: string
    prenom?: string
    raison_sociale?: string
    email?: string
    // ... autres données flexibles
  }
  
  // Profil de risque (calculé depuis historique/alertes)
  risk_profile: {
    current_level: 'low' | 'medium' | 'high' | 'critical'
    score: number  // 0-100
    confidence: number  // 0-1
    last_updated: Date
    factors: string[]
  }
  
  // Relations avec événements et intelligence
  active_cycle_vie_id?: string
  recent_events_count: number
  total_alerts: number
  confirmed_frauds: number
  
  // Contexte métier
  business_context: {
    portfolio_value?: number
    customer_since?: Date
    policy_types?: string[]
  }
  
  created_at: Date
  updated_at: Date
}
```

## Avantages Architecture Event-Driven

### ✅ **Traçabilité Complète**
- Tous les événements sont enregistrés dans l'historique
- Timeline complète de chaque assuré
- Audit trail intégral pour compliance

### ✅ **Intelligence Évolutive**  
- Patterns détectés depuis l'historique complet
- Profils de risque adaptatifs
- Apprentissage continu du système

### ✅ **Feedback Loop Intelligent**
- Impact risque SEULEMENT si fraude confirmée
- Amélioration continue des modèles de détection
- ROI tracking précis

### ✅ **Scalabilité**
- Architecture event-driven native
- Ajout de nouveaux types d'événements facile
- Sources multiples d'événements supportées

### ✅ **Séparation des Responsabilités**
- Événements = Source de vérité
- Historique = Intelligence et patterns  
- Alertes = Signaux dérivés
- Risques = Profils évolutifs
- Dossiers = Actions d'investigation

## Prochaines Étapes Implementation

1. **Frontend UX** : Aligner l'interface sur cette architecture event-driven
2. **Backend API** : Implémenter les services MongoDB Python  
3. **Intelligence Engine** : Moteur de détection patterns historique
4. **Dashboards** : Interfaces par rôle utilisateur
5. **ROI Analytics** : Système de mesure d'efficacité complet

### Gestionnaire
- Mes alertes en attente
- Mon taux de précision
- Temps moyen de traitement
- Dossiers en cours
- Performance vs équipe

### Superviseur  
- Performance équipe
- Distribution charge travail
- Écarts entre gestionnaires
- Calibrage des seuils
- Tendances qualité

### Direction
- ROI global (évité + récupéré)
- Tendances par typologie
- Volume alertes/dossiers
- Coûts opérationnels
- Performance globale

## Typologies de Fraude

### Fraude Souscription
- **Modification adresse** : Impact zonage tarifaire
- **Faux bonus-malus** : Historique falsifié
- **Usurpation identité** : Documents volés
- **Date permis invalide** : Tarification erronée
- **ROI** : Risque évité (complexe à calculer)

### Fraude Sinistre
- **Documents falsifiés** : Factures modifiées
- **Montants gonflés** : Surfacturation
- **Sinistres fictifs** : Événement inventé
- **ROI** : Montants directs économisés

## Architecture Technique

### Structure des Dossiers
```
src/
├── contexts/
│   ├── AuthContext.tsx (enrichi avec rôles)
│   ├── AlertContext.tsx (nouveau)
│   └── CaseContext.tsx (nouveau)
├── pages/
│   ├── Alerts.tsx (nouveau - queue principale)
│   ├── Cases.tsx (nouveau - gestion dossiers)
│   ├── Dashboard.tsx (refactoré - multi-rôles)
│   ├── DashboardGestionnaire.tsx (nouveau)
│   ├── DashboardSuperviseur.tsx (nouveau)
│   └── DashboardDirection.tsx (nouveau)
├── services/
│   ├── fraudDetectionService.ts (conservé)
│   ├── alertService.ts (nouveau)
│   ├── caseService.ts (nouveau)
│   └── moduleRegistry.ts (nouveau)
├── components/
│   ├── UploadButton.tsx (conservé - génère alertes)
│   ├── AlertQueue.tsx (nouveau)
│   ├── CaseWorkflow.tsx (nouveau)
│   └── RoleBasedDashboard.tsx (nouveau)
└── api/
    └── alerts/
        └── ingest.ts (nouveau - point d'entrée modules)
```

## Plan d'Implémentation

### Phase 1 : MVP Core (3-4 mois)
1. **Système d'alertes** : Queue management centralisée
2. **Case management** : Workflow alertes → dossiers
3. **Dashboards rôles** : Vues spécifiques par profil
4. **Gestion utilisateurs** : Équipes et permissions

### Phase 2 : Intelligence (2-3 mois)
1. **Règles métier** : Moteur configurable
2. **API Gateway** : Ingestion multi-sources
3. **Enrichissement** : Corrélation données
4. **Reporting avancé** : Analytics et export

### Phase 3 : Scalabilité (3-4 mois)
1. **Machine Learning** : Apprentissage décisions
2. **Marketplace** : SDK modules tiers
3. **Multi-tenancy** : Isolation clients
4. **Mobile** : Application terrain

## Modules Connectables

### Module Existant
- **Fraude Documentaire** : Analyse PDF/Images

### Modules Futurs Potentiels
- **Fraude Comportementale** : Patterns suspects
- **Analyse Transactionnelle** : Flux financiers
- **Scoring Data** : Bases externes
- **IA Conversationnelle** : Analyse communications
- **IoT/Télématique** : Données véhicules

## API d'Ingestion Standard
```json
POST /api/alerts/ingest
{
  "source": "module_name",
  "data": {
    "type": "document_analysis",
    "score": 0.85,
    "metadata": {...}
  },
  "confidence": 0.9
}
```

## Migration des Données

### Impact sur l'Existant
| Composant | Avant | Après | Action |
|-----------|-------|-------|---------|
| Documents.tsx | Page principale | Archive/Recherche | Adapter comme vue secondaire |
| Dashboard.tsx | KPIs globaux | Multi-rôles | Refactorer complètement |
| UploadButton | Upload → Résultat | Upload → Alerte | Ajouter création alerte |
| AnalysisResult | Affichage final | Création alerte | Transformer le workflow |
| AuditTrail | Track documents | Track alertes+cases | Enrichir le modèle |
| Settings | Seuils simples | Seuils + équipes | Ajouter gestion équipes |

### Stratégie de Migration
1. **Coexistence** (2 semaines) : Nouvelles pages en parallèle
2. **Basculement** (1 semaine) : Redirection flux
3. **Optimisation** (ongoing) : Nettoyage et performance

## Différenciateurs Commerciaux

1. **Plateforme unifiée** : Seule solution tout-en-un du marché
2. **Architecture modulaire** : Évolutivité infinie
3. **ROI mesurable** : Tracking précis des gains
4. **Multi-profils** : Adaptation par rôle
5. **No-code workflows** : Configuration sans développement
6. **Audit complet** : Conformité réglementaire

## Conclusion

Cette architecture transforme une application de détection documentaire en véritable **Salesforce Anti-Fraude**, positionnant la solution comme LE Salesforce spécialisé dans la lutte contre la fraude pour le secteur de l'assurance.



