# 🐍 MongoDB Schema Design - Python Backend

## Architecture NoSQL Risk-Centric

Ce design MongoDB est optimisé pour votre architecture **risk-centric** avec Python backend. MongoDB excelle dans la gestion des corrélations complexes, documents JSON riches, et requêtes de scoring en temps réel.

---

## 🏗️ Collections MongoDB

### **Collection Principale : `risks`** (Hub Central)

```python
# models/risk.py
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum
from bson import ObjectId

class RiskLevel(str, Enum):
    VERY_LOW = "very_low"
    LOW = "low" 
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very_high"
    CRITICAL = "critical"

class RiskType(str, Enum):
    FRAUDE_DOCUMENTAIRE = "fraude_documentaire"
    FRAUDE_IDENTITE = "fraude_identite"
    FRAUDE_SINISTRE = "fraude_sinistre"
    FRAUDE_SOUSCRIPTION = "fraude_souscription"
    BLANCHIMENT = "blanchiment"
    CYBER_FRAUDE = "cyber_fraude"

class RiskStatus(str, Enum):
    DETECTED = "detected"
    INVESTIGATING = "investigating"
    MITIGATED = "mitigated"
    ACCEPTED = "accepted"
    TRANSFERRED = "transferred"
    CLOSED = "closed"

class RiskCorrelation(BaseModel):
    risk_id: str = Field(..., description="ObjectId du risque corrélé")
    correlation_type: str = Field(..., description="causal, temporal, behavioral, contextual")
    strength: float = Field(..., ge=0, le=1, description="Force de la corrélation 0-1")
    confidence: float = Field(..., ge=0, le=1, description="Confiance dans la corrélation")
    detected_at: datetime = Field(default_factory=datetime.now)
    analysis: Dict[str, Any] = Field(default_factory=dict)
    impact: Dict[str, Any] = Field(default_factory=dict)

class RiskScoring(BaseModel):
    base_score: int = Field(..., ge=0, le=100)
    adjusted_score: int = Field(..., ge=0, le=100)
    final_score: int = Field(..., ge=0, le=100)
    confidence: float = Field(..., ge=0, le=1)
    component_scores: Dict[str, float] = Field(default_factory=dict)
    adjustment_factors: Dict[str, float] = Field(default_factory=dict)
    quality_metrics: Dict[str, Any] = Field(default_factory=dict)

class Risk(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    
    # Relations (ObjectId références)
    assure_id: str = Field(..., description="Référence vers assures collection")
    cycle_vie_id: Optional[str] = Field(None)
    historique_id: Optional[str] = Field(None)
    evenement_id: Optional[str] = Field(None)
    
    # Classification
    type: RiskType
    category: str = Field(..., description="fraud, aml, kyc, operational, financial")
    level: RiskLevel
    status: RiskStatus = RiskStatus.DETECTED
    source: str = Field(..., description="document_analysis, behavioral_analysis, etc.")
    
    # Description
    title: str = Field(..., max_length=500)
    description: str
    short_description: str = Field(..., max_length=255)
    
    # Scoring Central (Hub de calcul)
    scoring: RiskScoring
    
    # Facteurs de risque spécifiques au type
    risk_factors: Dict[str, Any] = Field(default_factory=dict)
    
    # Évaluation d'impact
    potential_impact: Dict[str, Any] = Field(default_factory=dict)
    
    # Contexte métier
    business_context: Dict[str, Any] = Field(default_factory=dict)
    
    # Entités liées (références flexibles)
    related_entities: Dict[str, List[str]] = Field(default_factory=dict)
    
    # Preuves et évidence
    evidence: Dict[str, Any] = Field(default_factory=dict)
    
    # Actions de mitigation
    mitigation: Dict[str, Any] = Field(default_factory=dict)
    
    # Monitoring et seuils
    monitoring: Dict[str, Any] = Field(default_factory=dict)
    
    # Corrélations avec autres risques (Hub de corrélation)
    correlations: List[RiskCorrelation] = Field(default_factory=list)
    
    # Prédictions ML
    predictions: Dict[str, Any] = Field(default_factory=dict)
    
    # Workflow
    requires_approval: bool = False
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    escalated_to: Optional[str] = None
    escalated_at: Optional[datetime] = None
    
    # Audit trail
    created_at: datetime = Field(default_factory=datetime.now)
    created_by: str
    updated_at: datetime = Field(default_factory=datetime.now)
    last_review_at: Optional[datetime] = None
    last_review_by: Optional[str] = None
    
    # Versioning
    version: int = 1
    score_history: List[Dict[str, Any]] = Field(default_factory=list)
    
    # Tags et métadonnées
    tags: List[str] = Field(default_factory=list)
    custom_fields: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
```

### **Collection : `assures`**

```python
# models/assure.py
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum

class AssureType(str, Enum):
    PARTICULIER = "particulier"
    PROFESSIONNEL = "professionnel" 
    ENTREPRISE = "entreprise"

class AssureStatus(str, Enum):
    PROSPECT = "prospect"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    TERMINATED = "terminated"

class RiskProfile(BaseModel):
    risk_score: int = Field(default=50, ge=0, le=100)
    risk_level: str = Field(default="medium")
    risk_confidence: float = Field(default=0.5, ge=0, le=1)
    
    # Métriques de risque calculées
    nombre_sinistres: int = 0
    montant_total_sinistres: float = 0
    nombre_alertes: int = 0
    nombre_dossiers_fraude: int = 0
    frequence_modifications: int = 0
    delai_declaration_moyen: int = 0  # jours
    coherence_documents: int = Field(default=100, ge=0, le=100)
    
    # Facteurs de risque
    facteurs_durcissement: List[str] = Field(default_factory=list)
    facteurs_mitigation: List[str] = Field(default_factory=list)
    
    # Dernières mises à jour
    derniere_mise_a_jour_risque: datetime = Field(default_factory=datetime.now)
    prochaine_review: Optional[datetime] = None

class Assure(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    
    # Identifiants métier
    numero_client: str = Field(..., description="Identifiant unique métier")
    type: AssureType
    status: AssureStatus = AssureStatus.PROSPECT
    
    # Informations identité (JSON flexible)
    identity: Dict[str, Any] = Field(..., description="nom, prenom, raison_sociale, etc.")
    
    # Profil de risque (calculé depuis les risques)
    risk_profile: RiskProfile = Field(default_factory=RiskProfile)
    
    # Portfolio et métriques business
    total_premiums: float = 0
    customer_lifetime_value: float = 0
    lines_of_business: List[str] = Field(default_factory=list)
    anciennete_client: int = 0  # mois
    
    # Assignation
    gestionnaire: Optional[str] = None
    agence: Optional[str] = None
    segment: Optional[str] = None
    
    # Relations vers autres collections
    contract_ids: List[str] = Field(default_factory=list)
    cycle_vie_ids: List[str] = Field(default_factory=list)
    evenement_ids: List[str] = Field(default_factory=list)
    risk_ids: List[str] = Field(default_factory=list)  # Principaux risques
    alert_ids: List[str] = Field(default_factory=list)
    case_ids: List[str] = Field(default_factory=list)
    
    # Audit trail
    created_at: datetime = Field(default_factory=datetime.now)
    created_by: str
    updated_at: datetime = Field(default_factory=datetime.now)
    last_login_at: Optional[datetime] = None
    data_validated_at: Optional[datetime] = None
    
    class Config:
        allow_population_by_field_name = True
```

### **Collection : `evenements`** (Ex-Demandes)

```python
# models/evenement.py
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum

class EvenementType(str, Enum):
    # Contractuels
    SOUSCRIPTION_CONTRAT = "souscription_contrat"
    MODIFICATION_CONTRAT = "modification_contrat" 
    RENOUVELLEMENT = "renouvellement"
    RESILIATION = "resiliation"
    
    # Sinistres
    DECLARATION_SINISTRE = "declaration_sinistre"
    COMPLEMENT_SINISTRE = "complement_sinistre"
    CONTESTATION_DECISION = "contestation_decision"
    
    # Service Client
    DEMANDE_INFO = "demande_info"
    RECLAMATION = "reclamation"
    ATTESTATION = "attestation"
    
    # Détection Fraude
    PATTERN_DETECTION = "pattern_detection"
    BEHAVIOR_ANOMALY = "behavior_anomaly"
    DOCUMENT_INCONSISTENCY = "document_inconsistency"

class EvenementStatus(str, Enum):
    RECEIVED = "received"
    IN_PROGRESS = "in_progress" 
    COMPLETED = "completed"
    REJECTED = "rejected"
    ESCALATED = "escalated"

class Evenement(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    
    # Identifiants
    reference_externe: Optional[str] = None
    numero_suivi: str = Field(..., description="Numéro de suivi unique")
    
    # Classification
    type: EvenementType
    category: str
    status: EvenementStatus = EvenementStatus.RECEIVED
    priority: str = Field(default="medium")
    
    # Origine
    origin: str
    channel: str
    source_info: Dict[str, Any] = Field(default_factory=dict)
    
    # Demandeur
    demandeur_info: Dict[str, Any]
    assure_id: Optional[str] = None  # Si lié à un assuré existant
    
    # Contenu
    objet: str = Field(..., max_length=500)
    description: str
    motivation: Optional[str] = None
    
    # Données spécifiques au type (JSON flexible)
    donnees_specifiques: Dict[str, Any] = Field(default_factory=dict)
    
    # Contexte métier
    contexte_business: Dict[str, Any] = Field(default_factory=dict)
    
    # Documents attachés
    documents: List[Dict[str, Any]] = Field(default_factory=list)
    
    # Workflow
    workflow_state: Dict[str, Any] = Field(default_factory=dict)
    
    # SLA et délais
    date_reception: datetime = Field(default_factory=datetime.now)
    delai_commercial: int  # jours
    date_echeance: datetime
    date_traitement: Optional[datetime] = None
    respect_sla: bool = True
    
    # Assignation et traitement
    assigne_a: Optional[str] = None
    equipe_traitante: Optional[str] = None
    date_assignation: Optional[datetime] = None
    historique_traitement: List[Dict[str, Any]] = Field(default_factory=list)
    
    # Décision
    decision_type: Optional[str] = None
    decision_motif: Optional[str] = None
    montant_accorde: Optional[float] = None
    date_decision: Optional[datetime] = None
    decideur: Optional[str] = None
    
    # Métriques qualité
    note_complexite: Optional[int] = Field(None, ge=1, le=5)
    temps_traitement: Optional[int] = None  # minutes
    nombre_aller_retours: int = 0
    
    # Analytics
    score_urgence: int = Field(default=50, ge=0, le=100)
    score_complexite: int = Field(default=50, ge=0, le=100)
    impact_business: int = Field(default=50, ge=0, le=100)
    cout_traitement: float = 0
    
    # Relations générées
    historique_id: Optional[str] = None  # Événement historique créé
    risk_ids: List[str] = Field(default_factory=list)  # Risques détectés
    
    # Audit trail
    created_at: datetime = Field(default_factory=datetime.now)
    created_by: str
    updated_at: datetime = Field(default_factory=datetime.now)
    
    class Config:
        allow_population_by_field_name = True
```

### **Collection : `alerts`** (Générées par les Risques)

```python
# models/alert.py
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum

class AlertSeverity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high" 
    MEDIUM = "medium"
    LOW = "low"

class AlertStatus(str, Enum):
    PENDING = "pending"
    ASSIGNED = "assigned"
    IN_REVIEW = "in_review"
    QUALIFIED = "qualified" 
    REJECTED = "rejected"

class AlertQualification(str, Enum):
    FRAUD_CONFIRMED = "fraud_confirmed"
    FALSE_POSITIVE = "false_positive"
    REQUIRES_INVESTIGATION = "requires_investigation"

class Alert(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    
    # Source
    external_id: Optional[str] = None
    source: str
    source_module: str
    
    # Classification (pilotée par le risque)
    type: str
    severity: AlertSeverity
    score: int = Field(..., ge=0, le=100)
    confidence: float = Field(..., ge=0, le=1)
    
    # Relation avec le risque (Hub central)
    risk_id: str = Field(..., description="Risque qui a généré cette alerte")
    assure_id: str
    
    # Métadonnées enrichies
    metadata: Dict[str, Any] = Field(..., description="Contexte métier riche")
    
    # Workflow
    status: AlertStatus = AlertStatus.PENDING
    qualification: Optional[AlertQualification] = None
    qualification_notes: Optional[str] = None
    
    # Assignation
    assigned_to: Optional[str] = None
    assigned_by: Optional[str] = None
    assigned_at: Optional[datetime] = None
    team: Optional[str] = None
    
    # Données techniques
    raw_data: Dict[str, Any] = Field(default_factory=dict)
    enriched_data: Dict[str, Any] = Field(default_factory=dict)
    
    # Audit trail
    created_at: datetime = Field(default_factory=datetime.now)
    created_by: Optional[str] = None
    updated_at: datetime = Field(default_factory=datetime.now)
    qualified_at: Optional[datetime] = None
    qualified_by: Optional[str] = None
    
    class Config:
        allow_population_by_field_name = True
```

---

## 🔍 Index MongoDB Optimisés

### **Index sur Collection `risks` (Hub Central)**

```python
# database/indexes.py
from pymongo import MongoClient, ASCENDING, DESCENDING, TEXT

def create_risk_indexes(db):
    risks = db.risks
    
    # Index primaires pour le hub central
    risks.create_index([("final_score", DESCENDING)], name="risk_score_desc")
    risks.create_index([("level", ASCENDING)], name="risk_level")
    risks.create_index([("status", ASCENDING)], name="risk_status")
    risks.create_index([("assure_id", ASCENDING)], name="risk_assure")
    
    # Index pour corrélations (critique pour performance)
    risks.create_index([
        ("correlations.risk_id", ASCENDING),
        ("correlations.strength", DESCENDING)
    ], name="risk_correlations")
    
    # Index composé pour recherche complexe
    risks.create_index([
        ("level", ASCENDING),
        ("status", ASCENDING),
        ("scoring.final_score", DESCENDING)
    ], name="risk_search_composite")
    
    # Index texte pour recherche full-text
    risks.create_index([
        ("title", TEXT),
        ("description", TEXT),
        ("tags", TEXT)
    ], name="risk_text_search")
    
    # Index temporel pour trending
    risks.create_index([
        ("created_at", DESCENDING),
        ("level", ASCENDING)
    ], name="risk_temporal")
    
    # Index géo-spatial si coordonnées dans business_context
    risks.create_index([("business_context.location", "2dsphere")], 
                      name="risk_geospatial", sparse=True)

def create_assure_indexes(db):
    assures = db.assures
    
    # Index métier
    assures.create_index([("numero_client", ASCENDING)], 
                        name="assure_numero_client", unique=True)
    assures.create_index([("risk_profile.risk_score", DESCENDING)], 
                        name="assure_risk_score")
    assures.create_index([("gestionnaire", ASCENDING)], 
                        name="assure_gestionnaire")
    
    # Index pour recherche dans identity (JSON)
    assures.create_index([("identity.nom", ASCENDING)], 
                        name="assure_nom", sparse=True)
    assures.create_index([("identity.email", ASCENDING)], 
                        name="assure_email", sparse=True)

def create_evenement_indexes(db):
    evenements = db.evenements
    
    # Index workflow
    evenements.create_index([("status", ASCENDING)], name="evenement_status")
    evenements.create_index([("priority", ASCENDING)], name="evenement_priority") 
    evenements.create_index([("assigne_a", ASCENDING)], name="evenement_assigned")
    
    # Index SLA critique
    evenements.create_index([
        ("date_echeance", ASCENDING),
        ("status", ASCENDING)
    ], name="evenement_sla")
    
    # Index pour analytics
    evenements.create_index([
        ("score_urgence", DESCENDING),
        ("score_complexite", DESCENDING)
    ], name="evenement_scores")

def create_alert_indexes(db):
    alerts = db.alerts
    
    # Index par risque (relation centrale)
    alerts.create_index([("risk_id", ASCENDING)], name="alert_risk")
    alerts.create_index([("severity", DESCENDING)], name="alert_severity")
    alerts.create_index([("status", ASCENDING)], name="alert_status")
    alerts.create_index([("assigned_to", ASCENDING)], name="alert_assigned")
    
    # Index temporel pour SLA
    alerts.create_index([("created_at", DESCENDING)], name="alert_created")
```

---

## 🐍 Services Python

### **Service Principal : RiskService**

```python
# services/risk_service.py
from typing import List, Optional, Dict, Any
from models.risk import Risk, RiskCorrelation, RiskLevel
from models.alert import Alert
from database.mongodb import get_database
from bson import ObjectId
import numpy as np
from datetime import datetime, timedelta

class RiskService:
    def __init__(self):
        self.db = get_database()
        self.risks = self.db.risks
        self.assures = self.db.assures
        self.alerts = self.db.alerts
        
    async def calculate_risk_score(self, risk_data: Dict[str, Any]) -> Dict[str, int]:
        """Moteur de calcul de risque centralisé"""
        
        # Score de base selon le type
        base_scores = {
            "fraude_documentaire": 70,
            "fraude_identite": 85,
            "fraude_sinistre": 60,
            "blanchiment": 90
        }
        
        base_score = base_scores.get(risk_data.get("type"), 50)
        
        # Ajustements temporels
        time_factor = self._calculate_temporal_weight(risk_data)
        
        # Ajustements corrélation
        correlation_boost = await self._calculate_correlation_boost(
            risk_data.get("assure_id")
        )
        
        # Ajustements historiques
        historical_factor = await self._get_historical_factor(
            risk_data.get("assure_id")
        )
        
        # Calcul final
        adjusted_score = base_score + time_factor + historical_factor
        final_score = min(100, max(0, adjusted_score + correlation_boost))
        
        return {
            "base_score": base_score,
            "adjusted_score": adjusted_score,
            "final_score": final_score
        }
    
    async def detect_correlations(self, risk_id: str) -> List[RiskCorrelation]:
        """Détection de corrélations avec autres risques"""
        
        risk = await self.get_risk_by_id(risk_id)
        if not risk:
            return []
            
        # Recherche de risques similaires
        similar_risks = await self.risks.find({
            "_id": {"$ne": ObjectId(risk_id)},
            "assure_id": risk.assure_id,
            "level": {"$in": ["high", "very_high", "critical"]},
            "created_at": {
                "$gte": datetime.now() - timedelta(days=90)
            }
        }).to_list(length=50)
        
        correlations = []
        
        for similar_risk in similar_risks:
            # Calcul de corrélation comportementale
            behavioral_strength = self._calculate_behavioral_correlation(
                risk, similar_risk
            )
            
            # Calcul de corrélation temporelle  
            temporal_strength = self._calculate_temporal_correlation(
                risk, similar_risk
            )
            
            # Force globale
            overall_strength = (behavioral_strength * 0.6 + 
                              temporal_strength * 0.4)
            
            if overall_strength > 0.3:  # Seuil de corrélation significative
                correlation = RiskCorrelation(
                    risk_id=str(similar_risk["_id"]),
                    correlation_type="behavioral",
                    strength=overall_strength,
                    confidence=min(behavioral_strength, temporal_strength),
                    analysis={
                        "behavioral_score": behavioral_strength,
                        "temporal_score": temporal_strength,
                        "pattern_match": True
                    }
                )
                correlations.append(correlation)
        
        return correlations
    
    async def generate_alerts_from_risk(self, risk: Risk) -> List[str]:
        """Génère des alertes basées sur les seuils de risque"""
        
        alert_ids = []
        
        # Seuils pour génération d'alertes
        if risk.scoring.final_score >= 80:
            severity = "critical"
        elif risk.scoring.final_score >= 60:
            severity = "high"
        elif risk.scoring.final_score >= 40:
            severity = "medium"
        else:
            return []  # Pas d'alerte pour risque faible
            
        # Création de l'alerte
        alert = Alert(
            source="risk_engine",
            source_module="risk_service",
            type=f"risk_{risk.type}",
            severity=severity,
            score=risk.scoring.final_score,
            confidence=risk.scoring.confidence,
            risk_id=risk.id,
            assure_id=risk.assure_id,
            metadata={
                "risk_level": risk.level,
                "correlation_count": len(risk.correlations),
                "business_context": risk.business_context,
                "evidence_summary": risk.evidence
            },
            created_by="system"
        )
        
        # Sauvegarde en base
        result = await self.alerts.insert_one(alert.dict(by_alias=True))
        alert_ids.append(str(result.inserted_id))
        
        return alert_ids
    
    async def update_assure_risk_profile(self, assure_id: str):
        """Met à jour le profil de risque agrégé de l'assuré"""
        
        # Récupération de tous les risques de l'assuré
        risks = await self.risks.find({
            "assure_id": assure_id,
            "status": {"$nin": ["closed", "transferred"]}
        }).to_list(length=None)
        
        if not risks:
            return
            
        # Calcul du score agrégé
        risk_scores = [r["scoring"]["final_score"] for r in risks]
        avg_score = int(np.mean(risk_scores))
        max_score = max(risk_scores)
        
        # Niveau de risque basé sur le score max
        if max_score >= 80:
            risk_level = "critical"
        elif max_score >= 60:
            risk_level = "high"  
        elif max_score >= 40:
            risk_level = "medium"
        else:
            risk_level = "low"
            
        # Mise à jour du profil
        await self.assures.update_one(
            {"_id": ObjectId(assure_id)},
            {
                "$set": {
                    "risk_profile.risk_score": avg_score,
                    "risk_profile.risk_level": risk_level,
                    "risk_profile.nombre_alertes": len([r for r in risks if r.get("alert_ids")]),
                    "risk_profile.derniere_mise_a_jour_risque": datetime.now()
                }
            }
        )
    
    def _calculate_temporal_weight(self, risk_data: Dict) -> float:
        """Calcul du poids temporel"""
        # Plus récent = plus de poids
        created_at = risk_data.get("created_at", datetime.now())
        hours_ago = (datetime.now() - created_at).total_seconds() / 3600
        
        if hours_ago <= 24:
            return 10  # Très récent
        elif hours_ago <= 168:  # 1 semaine
            return 5
        else:
            return 0
    
    async def _calculate_correlation_boost(self, assure_id: str) -> float:
        """Boost basé sur corrélations existantes"""
        
        correlations = await self.risks.find({
            "assure_id": assure_id,
            "correlations": {"$exists": True, "$not": {"$size": 0}}
        }).to_list(length=10)
        
        if not correlations:
            return 0
            
        # Plus de corrélations = boost plus élevé
        total_correlations = sum(len(r.get("correlations", [])) for r in correlations)
        return min(20, total_correlations * 2)  # Max 20 points de boost
```

---

## 🚀 API FastAPI

### **Endpoints Risk-Centric**

```python
# api/risk_routes.py
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from models.risk import Risk, RiskLevel
from services.risk_service import RiskService

router = APIRouter(prefix="/api/risks", tags=["risks"])

@router.get("/correlations/{risk_id}")
async def get_risk_correlations(
    risk_id: str,
    risk_service: RiskService = Depends()
):
    """Récupère les corrélations d'un risque"""
    correlations = await risk_service.detect_correlations(risk_id)
    return {"correlations": correlations}

@router.get("/assure/{assure_id}/risks")
async def get_assure_risks(
    assure_id: str,
    level: Optional[RiskLevel] = None,
    limit: int = 50,
    risk_service: RiskService = Depends()
):
    """Récupère tous les risques d'un assuré"""
    
    query = {"assure_id": assure_id}
    if level:
        query["level"] = level
        
    risks = await risk_service.risks.find(query).limit(limit).to_list(length=None)
    return {"risks": risks}

@router.post("/calculate-score")
async def calculate_risk_score(
    risk_data: dict,
    risk_service: RiskService = Depends()
):
    """Calcule le score de risque pour des données"""
    scoring = await risk_service.calculate_risk_score(risk_data)
    return {"scoring": scoring}

@router.get("/high-priority")
async def get_high_priority_risks(
    limit: int = 20,
    risk_service: RiskService = Depends()
):
    """Risques haute priorité nécessitant action immédiate"""
    
    risks = await risk_service.risks.find({
        "level": {"$in": ["high", "very_high", "critical"]},
        "status": {"$in": ["detected", "investigating"]},
        "requires_approval": True
    }).sort("scoring.final_score", -1).limit(limit).to_list(length=None)
    
    return {"high_priority_risks": risks}
```

---

## 🔄 Aggregation Pipelines

### **Pipeline de Corrélation Complexe**

```python
# aggregations/risk_correlations.py
def build_correlation_pipeline(assure_id: str):
    """Pipeline pour détecter corrélations complexes"""
    
    return [
        # Étape 1: Filtrer les risques de l'assuré
        {
            "$match": {
                "assure_id": assure_id,
                "status": {"$nin": ["closed", "transferred"]}
            }
        },
        
        # Étape 2: Lookup pour enrichir avec données assuré
        {
            "$lookup": {
                "from": "assures",
                "localField": "assure_id", 
                "foreignField": "_id",
                "as": "assure_data"
            }
        },
        
        # Étape 3: Groupement par patterns
        {
            "$group": {
                "_id": {
                    "type": "$type",
                    "level": "$level",
                    "source": "$source"
                },
                "risks": {"$push": "$$ROOT"},
                "count": {"$sum": 1},
                "avg_score": {"$avg": "$scoring.final_score"},
                "max_score": {"$max": "$scoring.final_score"},
                "total_confidence": {"$avg": "$scoring.confidence"}
            }
        },
        
        # Étape 4: Filtrer patterns significatifs
        {
            "$match": {
                "count": {"$gte": 2},  # Au moins 2 risques similaires
                "avg_score": {"$gte": 40}  # Score moyen significatif
            }
        },
        
        # Étape 5: Calcul corrélation strength
        {
            "$addFields": {
                "correlation_strength": {
                    "$multiply": [
                        {"$divide": ["$avg_score", 100]},
                        {"$divide": ["$count", 10]},  # Normalise par nombre
                        "$total_confidence"
                    ]
                }
            }
        },
        
        # Étape 6: Tri par force de corrélation
        {
            "$sort": {"correlation_strength": -1}
        }
    ]

def build_risk_dashboard_pipeline(user_role: str):
    """Pipeline pour dashboard utilisateur selon rôle"""
    
    base_pipeline = [
        # Groupement par niveau de risque
        {
            "$group": {
                "_id": "$level",
                "count": {"$sum": 1},
                "avg_score": {"$avg": "$scoring.final_score"},
                "recent_count": {
                    "$sum": {
                        "$cond": [
                            {"$gte": ["$created_at", datetime.now() - timedelta(days=7)]},
                            1, 0
                        ]
                    }
                }
            }
        }
    ]
    
    # Filtres selon le rôle
    if user_role == "gestionnaire":
        # Filtrer sur les risques assignés
        match_stage = {
            "$match": {
                "$or": [
                    {"assigned_to": user_role},
                    {"status": "detected"}  # Nouveaux risques
                ]
            }
        }
        base_pipeline.insert(0, match_stage)
        
    elif user_role == "direction":
        # Vue globale avec seuils élevés
        match_stage = {
            "$match": {
                "level": {"$in": ["high", "very_high", "critical"]}
            }
        }
        base_pipeline.insert(0, match_stage)
    
    return base_pipeline
```

---

## 💾 Comparaison : PostgreSQL vs MongoDB

| Aspect | PostgreSQL (Relationnel) | MongoDB (NoSQL) ✅ |
|--------|--------------------------|-------------------|
| **Corrélations Complexes** | JOINs multiples lents | Embedded documents rapides |
| **Scoring Temps Réel** | Calculs lourds | Aggregation pipelines optimisés |
| **Schema Flexibility** | Rigide | Adaptatif aux nouveaux patterns |
| **JSON Metadata** | Support limité | Natif et performant |
| **Scaling Horizontal** | Difficile | Natif avec sharding |
| **Risk Analytics** | SQL complexe | MapReduce + Aggregation |

---

Ce design MongoDB Python est optimisé pour votre architecture **risk-centric** avec des performances excellentes pour les corrélations complexes et le scoring en temps réel.