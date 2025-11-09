# 📊 ANALYSE ARCHITECTURE MULTI-ÉQUIPE HEDI DOCUMENT GUARDIAN

## 📋 Synthèse Exécutive

L'analyse approfondie révèle que l'architecture actuelle est **mono-équipe déguisée** avec des limitations majeures pour une plateforme anti-fraude professionnelle.

## 🔍 État Actuel vs Vision Multi-Équipe

### Workflow Linéaire Actuel
```
Document → Analyse IA → Alerte → Gestionnaire → Case → Même Gestionnaire → Décision
                                      ↑                         ↑
                                      └─────── MÊME PERSONNE ───┘
```

### Problèmes Critiques Identifiés

1. **Assignation Ultra-Basique**
   - `assignedTo?: string` - Une seule personne
   - Pas de notion d'équipe métier
   - Gestionnaires hardcodés dans l'interface

2. **Workflow Bloqué**
   - `requires_investigation` → Cul-de-sac
   - Pas de passage à équipe fraude
   - Expert fantôme (types existent mais inutilisés)

3. **Conflit d'Intérêt**
   - Même personne : qualification + investigation + décision
   - Pas de regard croisé
   - Risque de biais de confirmation

## ✅ Vision Cible : Architecture Multi-Équipe

### Nouveau Workflow
```
GESTIONNAIRE (Point d'entrée unique)
      ↓
Pré-qualification
      ↓
      ├─→ Faux Positif → FIN
      ├─→ Fraude Simple → Traitement Direct
      ├─→ Fraude Complexe → ÉQUIPE FRAUDE
      └─→ Besoin Expert → EXPERT EXTERNE
```

### Types d'Équipes

| Équipe | Rôle | Capacités | % Workload |
|--------|------|-----------|------------|
| **Gestionnaire** | Triage, qualification rapide | 80% des alertes | Point d'entrée |
| **Fraude** | Investigation approfondie | Cas complexes | 15% des alertes |
| **Expert Externe** | Expertise spécialisée | Sur demande | 5% des alertes |
| **Compliance** | AML/KYC | Blanchiment | Transversal |
| **Réseau Pro** | Surveillance professionnels santé | Fraude organisée | Spécialisé |

---

# 🛠️ PLAN D'ACTION PRIORITAIRE

## Phase 1 - DÉBLOCAGE IMMÉDIAT (Semaine 1-2)

### Action 1.1 : Débloquer `requires_investigation`
**Fichier** : `src/pages/Alerts.tsx`
**Ligne** : ~402-410

```tsx
// AJOUTER après le bouton "Investigation"
{alert.qualification === 'requires_investigation' && (
  <div className="pt-3 border-t">
    <Button 
      onClick={() => escalateToFraudTeam(alert.id)}
      className="w-full bg-orange-600 hover:bg-orange-700"
    >
      <Users className="w-4 h-4 mr-2" />
      Escalader Équipe Fraude
    </Button>
  </div>
)}
```

### Action 1.2 : Séparer qualification et investigation
**Fichier** : `src/pages/Alerts.tsx:125-142`
**Modification** :

```tsx
const handleCreateCase = async (alertId: string) => {
  const alert = alerts.find(a => a.id === alertId);
  if (!alert) return;

  // NOUVEAU : Proposer assignation à équipe différente
  const fraudTeamMember = "Expert.Fraude"; // Différent de l'alerté

  const newCase = await createCase({
    alertIds: [alertId],
    primaryAlertId: alertId,
    priority: alert.severity === 'critical' || alert.severity === 'high' ? 'urgent' : 'normal',
    assignTo: fraudTeamMember, // NOUVEAU !
    estimatedLoss: alert.metadata.amount || 0,
    notes: `Dossier créé par ${user?.name} à partir de l'alerte ${alertId}`
  });
};
```

### Action 1.3 : Enrichir types pour multi-équipe
**Fichier** : `src/types/case.types.ts`
**Ajouter** :

```typescript
interface Case {
  // ... existing fields
  
  // NOUVEAU : Traçabilité équipes
  qualifiedBy: string;        // Gestionnaire qui a qualifié
  qualifiedByName: string;
  investigationTeam: 'gestionnaire' | 'fraude' | 'expert' | 'compliance';
  
  handovers: Array<{
    from: string;
    fromTeam: string;
    to: string;
    toTeam: string;
    reason: string;
    timestamp: Date;
  }>;
}
```

## Phase 2 - INTERFACE TRANSFERT (Semaine 3-4)

### Action 2.1 : Modal de transfert d'équipe
**Nouveau fichier** : `src/components/TeamTransferModal.tsx`

```tsx
const TeamTransferModal = ({ alert, onTransfer }) => {
  const [selectedTeam, setSelectedTeam] = useState('');
  const [reason, setReason] = useState('');
  
  return (
    <Dialog>
      <DialogContent>
        <h3>Transférer à l'équipe spécialisée</h3>
        <Select value={selectedTeam} onValueChange={setSelectedTeam}>
          <SelectItem value="fraud_internal">Équipe Fraude Interne</SelectItem>
          <SelectItem value="expert_auto">Expert Automobile</SelectItem>
          <SelectItem value="expert_medical">Expert Médical</SelectItem>
          <SelectItem value="compliance">Équipe Compliance</SelectItem>
        </Select>
        <Textarea 
          placeholder="Raison du transfert..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <Button onClick={() => onTransfer(selectedTeam, reason)}>
          Transférer
        </Button>
      </DialogContent>
    </Dialog>
  );
};
```

### Action 2.2 : Dashboard gestionnaire avec vue transferts
**Fichier** : `src/pages/DashboardGestionnaire.tsx`
**Ajouter section** :

```tsx
<Card>
  <CardTitle>Mes Transferts Inter-Équipes</CardTitle>
  <CardContent>
    {myTransferredAlerts.map(alert => (
      <div key={alert.id} className="flex justify-between p-2 border-b">
        <span>{alert.id}</span>
        <Badge variant="outline">→ {alert.transferredTo}</Badge>
        <span className="text-sm text-slate-500">
          Case: {alert.resultingCaseId}
        </span>
      </div>
    ))}
  </CardContent>
</Card>
```

## Phase 3 - WORKFLOW EXPERT (Mois 2)

### Action 3.1 : Service de demande d'expertise
**Nouveau fichier** : `src/services/expertRequestService.ts`

```typescript
interface ExpertRequest {
  id: string;
  alertId: string;
  caseId?: string;
  expertiseType: 'auto' | 'medical' | 'compliance';
  requestedBy: string;
  estimatedCost: number;
  slaHours: number;
  status: 'pending' | 'accepted' | 'completed';
}

export class ExpertRequestService {
  async requestExpertise(
    alertId: string,
    expertiseType: string,
    justification: string
  ): Promise<ExpertRequest> {
    // Logique de demande expert
  }
}
```

### Action 3.2 : Intégration recommandations existantes
**Fichier** : `src/services/fraudTypologyService.ts:291-299`
**Utiliser** :

```tsx
// Dans Alerts.tsx
{alert.rawData?.insuranceAlert?.recommendedActions?.includes('expert_required') && (
  <Button onClick={() => setShowExpertModal(true)}>
    <UserCheck className="w-4 h-4 mr-2" />
    Demander Expertise
  </Button>
)}
```

---

# 📈 Résultats Attendus

## Métriques de Succès

1. **Spécialisation** : 80% alertes traitées par gestionnaires, 15% escaladées
2. **Objectivité** : Réduction 40% des biais de confirmation
3. **Efficacité** : +25% volume traité par gestionnaire
4. **ROI** : Tracking séparé par équipe/expertise

## Timeline Globale

- **Semaine 1-2** : Déblocage workflow bloqué
- **Semaine 3-4** : Interface transfert équipes  
- **Mois 2** : Intégration experts externes
- **Mois 3** : Métriques cross-team complètes

---

# Comprehensive Fraud Detection Mapping Analysis

## System Architecture Overview

### Core Components

1. **FraudTypologyService** - Maps technical findings to business fraud types
2. **ROICalculationService** - Calculates ROI with subscription vs claims differentiation
3. **InsuranceKPIService** - Provides business-aligned metrics
4. **DocumentClassificationService** - Enhanced document analysis and context detection
5. **Enhanced AlertService** - Integrates all components for comprehensive fraud analysis

## Technical to Business Fraud Mapping

### Current Technical Detection Capabilities

Based on analysis of the fraud detection system, we identify technical findings from:

#### Key Findings Structure
```typescript
{
  code: string,           // Technical finding code
  level: 'info'|'warn'|'fail',
  message: string,
  confidence: number,
  details: Record<string, unknown>
}
```

#### Risk Buckets Structure
```typescript
{
  name: string,           // Risk category
  score: number,          // 0-1 risk score
  weight: number,         // Contribution weight
  description: string
}
```

### Technical Finding Codes to Fraud Patterns

| Technical Code | Subscription Fraud Types | Claims Fraud Types | Business Impact |
|----------------|-------------------------|-------------------|-----------------|
| `DIGITAL_PRINT_DETECTED` | Identity Usurpation, False Driving History | Document Falsification, Provider Fraud | High |
| `DOCUMENT_MODIFIED` | False Bonus-Malus, Age Manipulation | Document Falsification, Amount Inflation | Critical |
| `FONT_INCONSISTENCY` | Identity Usurpation, False Driving History | Document Falsification, Amount Inflation | High |
| `TEXT_OVERLAY_DETECTED` | False Bonus-Malus, Age Manipulation | Amount Inflation, Document Falsification | Critical |
| `AI_GENERATED_CONTENT` | Identity Usurpation, False Driving History | Document Falsification, Fictitious Claim | Critical |
| `DATE_INCONSISTENCY` | False Driving History, Age Manipulation | Pre-existing Damage, Staged Accident | High |
| `AMOUNT_ANOMALY` | Vehicle Misrepresentation | Amount Inflation, Fictitious Claim | Critical |
| `IDENTITY_MISMATCH` | Identity Usurpation | Fictitious Claim | Critical |

## Document Type Classification and Context Detection

### Document Context Mapping

#### Subscription Documents
- **carte_identite**, **permis_conduire** → Identity verification fraud
- **carte_grise**, **certificat_immatriculation** → Vehicle misrepresentation
- **releve_information** → Bonus-malus fraud (Critical risk)
- **justificatif_domicile** → Address manipulation for pricing zones

#### Claims Documents
- **facture**, **devis** → Amount inflation, provider fraud
- **photo_degats** → Staged damage, pre-existing damage
- **constat_amiable** → Staged accidents, collusion (Critical risk)
- **certificat_medical** → Medical fraud, exaggerated injuries
- **rapport_expertise** → Expert collusion, report manipulation

### Context Determination Logic

```typescript
// Algorithm for determining business context
1. Direct document type mapping (primary)
2. Business family keywords analysis
3. Content pattern recognition
4. Extracted entity analysis
```

## ROI Calculation Framework

### Differentiated ROI Logic

#### Subscription Fraud ROI
- **Impact Type**: Annual premium savings and risk pool protection
- **Calculation**: Based on prevented annual impact over customer lifetime
- **Time Value**: Longer-term value realization (15-45 days)

**Example ROI Calculations:**
- False Bonus-Malus: €350 annual impact, 30-day value realization
- Identity Usurpation: €850 annual impact, 45-day value realization
- Address Manipulation: €180 annual impact, 15-day value realization

#### Claims Fraud ROI
- **Impact Type**: Direct claim amount prevention
- **Calculation**: Immediate financial impact prevention
- **Time Value**: Immediate value realization (3-10 days)

**Example ROI Calculations:**
- Amount Inflation: 35% of claim amount prevented
- Fictitious Claim: Full claim amount prevented (€2,500 average)
- Document Falsification: 30% of claim amount prevented

### ROI Components

```typescript
interface ROICalculation {
  // Direct Financial Impact
  estimatedLoss: number;
  preventedAmount: number;
  recoveredAmount: number;
  
  // Operational Costs
  detectionCost: number;      // €2.50 per analysis
  investigationCost: number;  // €65/hour for complex cases
  processingCost: number;     // €45/hour for human review
  
  // Business Value
  customerRetentionValue: number;  // €1,200 lifetime value
  brandProtection: number;         // 10% of prevented amount
  regulatoryCompliance: number;    // €500 per compliant case
}
```

## Business KPIs for Insurance Fraud Management

### Financial Performance KPIs

1. **Total Prevented Amount** - Direct financial impact
2. **Subscription vs Claims ROI** - Context-specific performance
3. **Cost Per Case Prevented** - Operational efficiency
4. **False Positive Rate** - Quality metric
5. **Recovery Success Rate** - Investigation effectiveness

### Operational Efficiency KPIs

1. **Average Processing Time** - Queue management
2. **Analyst Productivity** - Resource utilization
3. **Automation Rate** - Process optimization
4. **Escalation Rate** - Complexity management
5. **Customer Satisfaction Impact** - Experience preservation

### Detection Quality KPIs

1. **Precision/Recall/F1 Score** - Algorithm performance
2. **Confidence Distribution** - Model reliability
3. **Fraud Type Evolution** - Pattern analysis
4. **Model Drift Detection** - Performance degradation
5. **Calibration Score** - Confidence accuracy

### Business Impact KPIs

1. **Customer Retention Impact** - Trust preservation
2. **Risk Pool Integrity** - Accurate risk assessment
3. **Pricing Accuracy Improvement** - Underwriting enhancement
4. **Regulatory Compliance Score** - Compliance adherence
5. **Competitive Advantage** - Market positioning

## Implementation Architecture

### Enhanced Alert Creation Flow

```typescript
// New enhanced alert creation process
1. Document Classification → Business context identification
2. Fraud Typology Analysis → Technical to business mapping
3. ROI Calculation → Context-specific financial impact
4. KPI Integration → Business metrics calculation
5. Alert Creation → Comprehensive metadata enrichment
```

### Alert Metadata Enhancement

The alert metadata now includes:

```typescript
{
  // Business Context
  businessContext: 'subscription' | 'claims' | 'unknown',
  documentFamily: 'identity' | 'automotive' | 'financial' | 'medical',
  workflowStage: 'onboarding' | 'claim_processing' | etc,
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical',
  
  // Fraud Analysis
  primaryFraudType: string,
  businessImpact: 'low' | 'medium' | 'high' | 'critical',
  
  // Financial Impact
  estimatedLoss: number,
  preventedAmount: number,
  directROI: number,
  riskAdjustedROI: number,
  
  // Technical Evidence
  technicalEvidence: Array<{
    code: string,
    businessRelevance: string,
    severity: 'info' | 'warn' | 'fail',
    confidence: number
  }>
}
```

## Fraud Pattern Recognition by Document Type

### High-Risk Document Patterns

#### Critical Risk Documents
1. **Relevé d'Information** (Bonus-Malus statements)
   - Historical fraud rate: 18%
   - Common patterns: Coefficient manipulation, history falsification
   - ROI Impact: €350 annual prevention per case

2. **Constat Amiable** (Accident reports)
   - Historical fraud rate: 22%
   - Common patterns: Staged accidents, collusion, false statements
   - ROI Impact: €4,500 average claim prevention

3. **Factures** (Invoices)
   - Historical fraud rate: 15%
   - Common patterns: Amount inflation, false invoices
   - ROI Impact: 35% of claim amount prevention

#### Medium Risk Documents
1. **Permis de Conduire** (Driver's License)
   - Historical fraud rate: 12%
   - Common patterns: License fraud, point manipulation
   - ROI Impact: €280 annual prevention

2. **Photos de Dégâts** (Damage Photos)
   - Historical fraud rate: 14%
   - Common patterns: Staged damage, photo manipulation
   - ROI Impact: 20% of claim amount prevention

## Business Value Calculations

### Subscription Fraud Prevention Value

```
Annual Value = Prevented Premium Fraud + Risk Pool Protection + Pricing Accuracy
Example: €350 (direct) + €105 (risk pool) + €70 (pricing) = €525 per case
```

### Claims Fraud Prevention Value

```
Immediate Value = Prevented Claim + Operational Savings + Brand Protection
Example: €2,500 (direct) + €200 (operational) + €250 (brand) = €2,950 per case
```

### Long-term Business Impact

1. **Customer Trust Preservation**: €1,200 per customer lifetime value
2. **Regulatory Compliance**: €500 per compliant case
3. **Market Competitive Advantage**: 15.5% estimated advantage
4. **Brand Protection**: 10% of prevented fraud amount

## Implementation Recommendations

### Immediate Actions (Week 1-2)

1. **Deploy Enhanced Services** - Integrate new fraud mapping services
2. **Update Alert Processing** - Implement enhanced alert creation
3. **Configure KPI Dashboards** - Deploy business-meaningful metrics
4. **Train Staff** - Educate on new fraud typologies and ROI metrics

### Short-term Improvements (Month 1-3)

1. **Historical Data Analysis** - Validate ROI calculations with historical cases
2. **Threshold Optimization** - Adjust detection thresholds based on business impact
3. **Process Integration** - Integrate with existing case management workflows
4. **Performance Monitoring** - Track KPI improvements and ROI realization

### Long-term Enhancements (Month 3-12)

1. **Machine Learning Integration** - Improve detection accuracy with historical feedback
2. **Predictive Analytics** - Forecast fraud trends and seasonal patterns
3. **Advanced Correlation** - Cross-reference with external fraud databases
4. **Automated Investigation** - Implement intelligent case routing and prioritization

## Conclusion

This comprehensive fraud mapping system transforms technical detection capabilities into business-meaningful insights, providing:

- **Clear ROI Differentiation** between subscription and claims fraud
- **Business-Aligned KPIs** for insurance fraud management
- **Enhanced Document Classification** with business context awareness
- **Comprehensive Risk Assessment** with financial impact quantification
- **Actionable Intelligence** for fraud investigators and managers

The system enables insurance companies to:
- Make data-driven decisions about fraud prevention investments
- Optimize operational processes based on business impact
- Improve customer experience while maintaining security
- Demonstrate regulatory compliance and risk management effectiveness
- Achieve measurable ROI from fraud detection technology investments