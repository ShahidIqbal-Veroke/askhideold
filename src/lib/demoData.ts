// Demo Data for localStorage Database
// Following the Event → CycleVie → Historique → Alerte → Dossier workflow

import { db } from './localStorage';

// Types for demo data
export interface Event {
  id: string;
  type: 'document_upload' | 'pattern_detection' | 'manual_review' | 'system_alert';
  timestamp: string;
  source: string;
  assure_id?: string;
  contrat_id?: string;
  data: {
    documentId?: string;
    userId?: string;
    sinistre_numero?: string;
    metadata?: any;
  };
  status: 'processed' | 'pending' | 'error';
}

export interface CycleVie {
  id: string;
  event_id: string;
  stage: 'reception' | 'analyse' | 'validation' | 'decision' | 'cloture';
  type: 'sinistre' | 'souscription' | 'modification_contrat' | 'resiliation' | 'expertise';
  timestamp: string;
  duration_hours?: number;
  next_stage?: string;
  assure_id?: string;
  contrat_id?: string;
  sinistre_numero?: string;
  metadata: {
    gestionnaire?: string;
    statut_anterieur?: string;
    actions_requises?: string[];
    documents_associes?: string[];
    montant_estime?: number;
    urgence_niveau?: 'normal' | 'urgent' | 'critique';
  };
}

export interface Assure {
  id: string;
  civilite: 'M' | 'Mme' | 'Mlle';
  nom: string;
  prenom: string;
  date_naissance: string;
  email: string;
  telephone: string;
  adresse: {
    rue: string;
    ville: string;
    code_postal: string;
    pays: string;
  };
  numero_client: string;
  date_souscription: string;
  statut: 'actif' | 'suspendu' | 'resilié' | 'prospect';
  score_risque: number; // 0-100
  contrats: Array<{
    id: string;
    type: 'auto' | 'habitation' | 'sante' | 'vie';
    numero: string;
    date_effet: string;
    date_echeance?: string;
    prime_annuelle: number;
    statut: 'actif' | 'suspendu' | 'resilié';
  }>;
  historique_sinistres: Array<{
    id: string;
    date: string;
    type: string;
    montant: number;
    statut: 'en_cours' | 'clos' | 'refuse';
  }>;
}

export interface Historique {
  id: string;
  event_id: string;
  cycle_vie_id: string;
  action: string;
  actor: string;
  timestamp: string;
  details: any;
  impact_level: 'low' | 'medium' | 'high' | 'critical';
}

export interface Alert {
  id: string;
  event_id: string;
  historique_id: string;
  reference: string;
  source: 'document_analysis' | 'pattern_detection' | 'manual_review' | 'system_monitoring';
  fraud_city_source: 'cyber' | 'aml' | 'documentaire' | 'comportemental';
  business_district: 'auto' | 'sante' | 'habitation' | 'professionnelle' | 'voyage';
  severity: 'critical' | 'high' | 'medium' | 'low';
  score: number;
  status: 'new' | 'assigned' | 'investigating' | 'qualified' | 'closed';
  assigned_to?: string;
  assigned_team?: string;
  created_at: string;
  updated_at: string;
  sla_deadline: string;
  impacts_risk: boolean;
  metadata: {
    detection_model?: string;
    confidence?: number;
    affected_entities?: string[];
    financial_impact?: number;
  };
}

export interface Case {
  id: string;
  reference: string;
  alert_ids: string[];
  status: 'open' | 'investigating' | 'pending_review' | 'closed';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  investigation_team: string;
  assigned_to: string;
  created_at: string;
  updated_at: string;
  estimated_loss: number;
  investigation_cost: number;
  roi_score?: number;
  handovers: Array<{
    from: string;
    fromTeam: string;
    to: string;
    toTeam: string;
    reason: string;
    timestamp: string;
  }>;
  metadata: {
    fraud_type?: string;
    evidence_collected?: string[];
    investigation_notes?: string;
  };
}

export interface FraudCatalog {
  id: string;
  code: string;
  name: string;
  typologie: string;
  nature: string;
  city_source: 'cyber' | 'aml' | 'documentaire' | 'comportemental';
  applicable_districts: string[];
  severity_threshold: number;
  auto_assign_team?: string;
  playbook_id?: string;
}

export interface Playbook {
  id: string;
  fraud_catalog_id: string;
  name: string;
  investigation_steps: Array<{
    step_order: number;
    action: string;
    required_role: string;
    estimated_hours: number;
    dependencies?: string[];
    evidence_required?: string[];
  }>;
  escalation_rules: Array<{
    condition: string;
    escalate_to: string;
    notification_required: boolean;
  }>;
}

// Demo data initialization
export function initializeDemoData() {
  // Clear existing data
  db.clearAll();

  // 0. Assurés (clients)
  const assures: Assure[] = [
    {
      id: 'assure-001',
      civilite: 'M',
      nom: 'MARTIN',
      prenom: 'Jean-Pierre',
      date_naissance: '1975-03-15',
      email: 'jp.martin@email.com',
      telephone: '06.12.34.56.78',
      adresse: {
        rue: '15 rue de la Paix',
        ville: 'Paris',
        code_postal: '75001',
        pays: 'France'
      },
      numero_client: 'CLI-001-2020',
      date_souscription: '2020-01-15',
      statut: 'actif',
      score_risque: 25,
      contrats: [
        {
          id: 'contrat-auto-001',
          type: 'auto',
          numero: 'AUTO-2020-001',
          date_effet: '2020-01-15',
          date_echeance: '2025-01-15',
          prime_annuelle: 1200,
          statut: 'actif'
        }
      ],
      historique_sinistres: [
        {
          id: 'sin-001',
          date: '2024-01-15',
          type: 'Collision',
          montant: 3500,
          statut: 'en_cours'
        }
      ]
    },
    {
      id: 'assure-002',
      civilite: 'Mme',
      nom: 'DUBOIS',
      prenom: 'Marie',
      date_naissance: '1982-07-22',
      email: 'marie.dubois@email.com',
      telephone: '06.98.76.54.32',
      adresse: {
        rue: '42 avenue des Champs',
        ville: 'Lyon',
        code_postal: '69001',
        pays: 'France'
      },
      numero_client: 'CLI-002-2019',
      date_souscription: '2019-05-10',
      statut: 'actif',
      score_risque: 45,
      contrats: [
        {
          id: 'contrat-sante-002',
          type: 'sante',
          numero: 'SANTE-2019-002',
          date_effet: '2019-05-10',
          prime_annuelle: 2400,
          statut: 'actif'
        }
      ],
      historique_sinistres: [
        {
          id: 'sin-002',
          date: '2024-01-16',
          type: 'Hospitalisation',
          montant: 8500,
          statut: 'en_cours'
        }
      ]
    },
    {
      id: 'assure-003',
      civilite: 'M',
      nom: 'BERNARD',
      prenom: 'Paul',
      date_naissance: '1969-11-08',
      email: 'paul.bernard@email.com',
      telephone: '07.11.22.33.44',
      adresse: {
        rue: '8 place de la République',
        ville: 'Marseille',
        code_postal: '13001',
        pays: 'France'
      },
      numero_client: 'CLI-003-2018',
      date_souscription: '2018-09-20',
      statut: 'actif',
      score_risque: 78,
      contrats: [
        {
          id: 'contrat-auto-003',
          type: 'auto',
          numero: 'AUTO-2018-003',
          date_effet: '2018-09-20',
          prime_annuelle: 1800,
          statut: 'actif'
        }
      ],
      historique_sinistres: [
        {
          id: 'sin-003',
          date: '2023-06-10',
          type: 'Vol',
          montant: 15000,
          statut: 'clos'
        },
        {
          id: 'sin-004',
          date: '2024-01-14',
          type: 'Accident',
          montant: 12000,
          statut: 'en_cours'
        }
      ]
    }
  ];

  // 1. Events (starting point of workflow)
  const events: Event[] = [
    {
      id: 'evt-001',
      type: 'document_upload',
      timestamp: '2024-01-15T09:30:00Z',
      source: 'web_portal',
      assure_id: 'assure-001',
      contrat_id: 'contrat-auto-001',
      data: {
        documentId: 'doc-001',
        userId: 'user-gestionnaire-01',
        sinistre_numero: 'SIN-2024-001',
        metadata: { 
          document_type: 'constat_amiable', 
          file_size: 2048576,
          vehicule_marque: 'Peugeot 308',
          date_sinistre: '2024-01-15'
        }
      },
      status: 'processed'
    },
    {
      id: 'evt-002',
      type: 'pattern_detection',
      timestamp: '2024-01-15T14:20:00Z',
      source: 'ai_engine',
      assure_id: 'assure-003',
      contrat_id: 'contrat-auto-003',
      data: {
        sinistre_numero: 'SIN-2024-002',
        metadata: { 
          correlation_score: 0.85, 
          affected_entities: ['assure-003', 'garage-suspect-01'],
          pattern_type: 'frequence_elevee',
          historique_suspect: true
        }
      },
      status: 'processed'
    },
    {
      id: 'evt-003',
      type: 'document_upload',
      timestamp: '2024-01-16T11:15:00Z',
      source: 'mobile_app',
      assure_id: 'assure-002',
      contrat_id: 'contrat-sante-002',
      data: {
        documentId: 'doc-002',
        userId: 'user-gestionnaire-02',
        sinistre_numero: 'SIN-2024-003',
        metadata: { 
          document_type: 'facture_medicale', 
          urgency: 'high',
          montant_facture: 8500,
          etablissement: 'Clinique Saint-Paul'
        }
      },
      status: 'processed'
    }
  ];

  // 2. Cycle de Vie (lifecycle management)
  const cycleVies: CycleVie[] = [
    {
      id: 'cv-001',
      event_id: 'evt-001',
      stage: 'analyse',
      type: 'sinistre',
      timestamp: '2024-01-15T09:35:00Z',
      duration_hours: 2,
      next_stage: 'validation',
      assure_id: 'assure-001',
      contrat_id: 'contrat-auto-001',
      sinistre_numero: 'SIN-2024-001',
      metadata: {
        gestionnaire: 'Marie Durand',
        statut_anterieur: 'reception',
        actions_requises: ['verification_constat', 'contact_garage', 'estimation_degats'],
        documents_associes: ['constat_amiable.pdf', 'photos_vehicule.jpg'],
        montant_estime: 3500,
        urgence_niveau: 'normal'
      }
    },
    {
      id: 'cv-002',
      event_id: 'evt-002',
      stage: 'validation',
      type: 'expertise',
      timestamp: '2024-01-15T14:25:00Z',
      duration_hours: 1,
      next_stage: 'decision',
      assure_id: 'assure-003',
      contrat_id: 'contrat-auto-003',
      sinistre_numero: 'SIN-2024-002',
      metadata: {
        gestionnaire: 'Pierre Martin',
        statut_anterieur: 'analyse',
        actions_requises: ['expertise_approfondie', 'verification_historique', 'enquete_garage'],
        documents_associes: ['rapport_ai.pdf', 'historique_client.pdf'],
        montant_estime: 12000,
        urgence_niveau: 'critique'
      }
    },
    {
      id: 'cv-003',
      event_id: 'evt-003',
      stage: 'reception',
      type: 'sinistre',
      timestamp: '2024-01-16T11:20:00Z',
      next_stage: 'analyse',
      assure_id: 'assure-002',
      contrat_id: 'contrat-sante-002',
      sinistre_numero: 'SIN-2024-003',
      metadata: {
        gestionnaire: 'Sophie Legrand',
        statut_anterieur: null,
        actions_requises: ['verification_facture', 'controle_plafonds', 'validation_acte'],
        documents_associes: ['facture_medicale.pdf', 'ordonnance.pdf'],
        montant_estime: 8500,
        urgence_niveau: 'urgent'
      }
    }
  ];

  // 3. Historique (audit trail)
  const historiques: Historique[] = [
    {
      id: 'hist-001',
      event_id: 'evt-001',
      cycle_vie_id: 'cv-001',
      action: 'Document analysé par IA',
      actor: 'system_ai_engine',
      timestamp: '2024-01-15T09:35:00Z',
      details: { 
        fraud_indicators: ['document_modification', 'inconsistent_data'],
        risk_score: 78
      },
      impact_level: 'medium'
    },
    {
      id: 'hist-002',
      event_id: 'evt-002',
      cycle_vie_id: 'cv-002',
      action: 'Corrélation multi-dossiers détectée',
      actor: 'pattern_detection_engine',
      timestamp: '2024-01-15T14:25:00Z',
      details: {
        correlation_type: 'same_garage_multiple_claims',
        entities_involved: 5,
        confidence: 0.85
      },
      impact_level: 'high'
    },
    {
      id: 'hist-003',
      event_id: 'evt-003',
      cycle_vie_id: 'cv-003',
      action: 'Réception document urgent',
      actor: 'user-gestionnaire-02',
      timestamp: '2024-01-16T11:20:00Z',
      details: { urgency_reason: 'medical_emergency', escalation_required: true },
      impact_level: 'critical'
    }
  ];

  // 4. Alerts (generated from historique analysis) - WITH TECHNICAL EVIDENCE
  const alerts: Alert[] = [
    {
      id: 'alert-001',
      event_id: 'evt-001',
      historique_id: 'hist-001',
      reference: 'ALT-2024-001',
      source: 'document_analysis',
      fraud_city_source: 'documentaire',
      business_district: 'auto',
      severity: 'medium',
      score: 78,
      status: 'assigned',
      assigned_to: 'gestionnaire-auto-01',
      assigned_team: 'automotive_fraud_team',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:30:00Z',
      sla_deadline: '2024-01-17T10:00:00Z',
      impacts_risk: false,
      metadata: {
        detection_model: 'document_ai_v2.1',
        confidence: 0.78,
        affected_entities: ['policy-auto-001'],
        financial_impact: 15000,
        qualification: 'fraud_confirmed',
        fraud_type: 'document_falsifie',
        document_type: 'constat_amiable',
        documentType: 'constat_amiable',
        technicalEvidence: [
          { code: 'METADATA_TAMPERED', message: 'Métadonnées modifiées – le document a été altéré après sa création', severity: 'fail' as const, confidence: 0.92 },
          { code: 'CREATION_DATE_MISMATCH', message: 'Date de création incohérente avec l\'horodatage système', severity: 'warn' as const, confidence: 0.85 },
          { code: 'PDF_LAYER_ANOMALY', message: 'Couches PDF manipulées – contenu caché détecté', severity: 'fail' as const, confidence: 0.88 }
        ]
      }
    },
    {
      id: 'alert-002',
      event_id: 'evt-002',
      historique_id: 'hist-002',
      reference: 'ALT-2024-002',
      source: 'pattern_detection',
      fraud_city_source: 'cyber',
      business_district: 'auto',
      severity: 'high',
      score: 85,
      status: 'investigating',
      assigned_to: 'cyber-fraud-specialist-01',
      assigned_team: 'cyber_fraud_team',
      created_at: '2024-01-15T14:30:00Z',
      updated_at: '2024-01-15T16:00:00Z',
      sla_deadline: '2024-01-16T14:30:00Z',
      impacts_risk: false,
      metadata: {
        detection_model: 'correlation_engine_v1.5',
        confidence: 0.85,
        affected_entities: ['policy-auto-001', 'policy-auto-002', 'garage-susp-01'],
        financial_impact: 125000,
        qualification: 'fraud_confirmed',
        fraud_type: 'sinistre_fictif',
        document_type: 'carte_grise',
        documentType: 'carte_grise',
        technicalEvidence: [
          { code: 'EXACT_DUPLICATE', message: 'Document dupliqué – ce fichier a déjà été soumis 10 fois', severity: 'fail' as const, confidence: 0.99 },
          { code: 'HASH_COLLISION', message: 'Empreinte numérique identique à document antérieur', severity: 'fail' as const, confidence: 0.99 },
          { code: 'TIMESTAMP_REUSE', message: 'Horodatage réutilisé depuis dossier SIN-2023-4521', severity: 'warn' as const, confidence: 0.87 }
        ]
      }
    },
    {
      id: 'alert-003',
      event_id: 'evt-003',
      historique_id: 'hist-003',
      reference: 'ALT-2024-003',
      source: 'manual_review',
      fraud_city_source: 'comportemental',
      business_district: 'sante',
      severity: 'critical',
      score: 92,
      status: 'qualified',
      assigned_to: 'superviseur-sante-01',
      assigned_team: 'health_fraud_team',
      created_at: '2024-01-16T11:30:00Z',
      updated_at: '2024-01-16T13:00:00Z',
      sla_deadline: '2024-01-16T17:30:00Z',
      impacts_risk: true,
      metadata: {
        confidence: 0.92,
        affected_entities: ['patient-001', 'clinic-susp-01'],
        financial_impact: 45000,
        qualification: 'fraud_confirmed',
        fraud_type: 'montant_gonfle',
        document_type: 'facture_medicale',
        documentType: 'facture_medicale',
        technicalEvidence: [
          { code: 'VIN_CHECK_DIGIT_FAIL', message: 'Erreur de contrôle VIN – la clé de vérification interne du VIN est incorrecte', severity: 'fail' as const, confidence: 0.95 },
          { code: 'OCR_SUSPICIOUS_PATTERN', message: 'Texte OCR suspect – caractères anormaux détectés', severity: 'warn' as const, confidence: 0.78 },
          { code: 'OCR_HIGH_NOISE', message: 'Texte peu lisible – niveau de bruit élevé dans le scan', severity: 'info' as const, confidence: 0.65 }
        ]
      }
    }
  ];

  // 5. Cases (qualified alerts become investigation cases)
  const cases: Case[] = [
    {
      id: 'case-001',
      reference: 'CASE-2024-001',
      alert_ids: ['alert-002'],
      status: 'investigating',
      priority: 'high',
      investigation_team: 'cyber_fraud_team',
      assigned_to: 'cyber-fraud-specialist-01',
      created_at: '2024-01-15T16:00:00Z',
      updated_at: '2024-01-16T09:00:00Z',
      estimated_loss: 125000,
      investigation_cost: 5000,
      roi_score: 2400, // (125000 - 5000) / 5000 * 100
      handovers: [],
      metadata: {
        fraud_type: 'network_correlation',
        evidence_collected: ['network_analysis', 'claim_timeline', 'garage_inspection'],
        investigation_notes: 'Réseau organisé détecté - 5 entités impliquées'
      }
    },
    {
      id: 'case-002',
      reference: 'CASE-2024-002',
      alert_ids: ['alert-003'],
      status: 'pending_review',
      priority: 'urgent',
      investigation_team: 'health_fraud_team',
      assigned_to: 'superviseur-sante-01',
      created_at: '2024-01-16T13:00:00Z',
      updated_at: '2024-01-16T15:30:00Z',
      estimated_loss: 45000,
      investigation_cost: 2000,
      handovers: [{
        from: 'gestionnaire-sante-01',
        fromTeam: 'gestionnaire',
        to: 'superviseur-sante-01',
        toTeam: 'health_fraud_team',
        reason: 'Complexité élevée - escalade nécessaire',
        timestamp: '2024-01-16T13:00:00Z'
      }],
      metadata: {
        fraud_type: 'behavioral_anomaly',
        evidence_collected: ['medical_records', 'claim_pattern_analysis'],
        investigation_notes: 'Comportement suspect - consultations répétitives'
      }
    }
  ];

  // 6. Fraud Catalog (classification rules)
  const fraudCatalogs: FraudCatalog[] = [
    {
      id: 'fc-001',
      code: 'DOC-AUTO-001',
      name: 'Document Automobile Modifié',
      typologie: 'Documentaire',
      nature: 'Falsification',
      city_source: 'documentaire',
      applicable_districts: ['auto'],
      severity_threshold: 70,
      auto_assign_team: 'automotive_fraud_team',
      playbook_id: 'pb-001'
    },
    {
      id: 'fc-002',
      code: 'CYB-NET-001',
      name: 'Réseau Organisé Détecté',
      typologie: 'Cyber',
      nature: 'Corrélation',
      city_source: 'cyber',
      applicable_districts: ['auto', 'habitation'],
      severity_threshold: 80,
      auto_assign_team: 'cyber_fraud_team',
      playbook_id: 'pb-002'
    },
    {
      id: 'fc-003',
      code: 'BEH-SAN-001',
      name: 'Comportement Médical Suspect',
      typologie: 'Comportemental',
      nature: 'Anomalie Pattern',
      city_source: 'comportemental',
      applicable_districts: ['sante'],
      severity_threshold: 85,
      auto_assign_team: 'health_fraud_team',
      playbook_id: 'pb-003'
    }
  ];

  // 7. Playbooks (investigation procedures)
  const playbooks: Playbook[] = [
    {
      id: 'pb-001',
      fraud_catalog_id: 'fc-001',
      name: 'Investigation Document Automobile',
      investigation_steps: [
        {
          step_order: 1,
          action: 'Analyse technique document',
          required_role: 'automotive_fraud_team',
          estimated_hours: 2,
          evidence_required: ['original_document', 'metadata_analysis']
        },
        {
          step_order: 2,
          action: 'Vérification auprès garage',
          required_role: 'automotive_fraud_team',
          estimated_hours: 4,
          dependencies: ['step_1'],
          evidence_required: ['garage_contact', 'repair_verification']
        }
      ],
      escalation_rules: [
        {
          condition: 'investigation_time > 48_hours',
          escalate_to: 'superviseur_auto',
          notification_required: true
        }
      ]
    },
    {
      id: 'pb-002',
      fraud_catalog_id: 'fc-002',
      name: 'Investigation Réseau Cyber',
      investigation_steps: [
        {
          step_order: 1,
          action: 'Analyse corrélations multi-entités',
          required_role: 'cyber_fraud_team',
          estimated_hours: 6,
          evidence_required: ['network_analysis', 'correlation_matrix']
        },
        {
          step_order: 2,
          action: 'Coordination équipes métier',
          required_role: 'cyber_fraud_team',
          estimated_hours: 3,
          dependencies: ['step_1']
        }
      ],
      escalation_rules: [
        {
          condition: 'affected_entities > 10',
          escalate_to: 'direction',
          notification_required: true
        }
      ]
    }
  ];

  // Save all data to localStorage
  db.bulkCreate('assures', assures);
  db.bulkCreate('events', events);
  db.bulkCreate('cycle_vies', cycleVies);
  db.bulkCreate('historiques', historiques);
  db.bulkCreate('alerts', alerts);
  db.bulkCreate('cases', cases);
  db.bulkCreate('fraud_catalogs', fraudCatalogs);
  db.bulkCreate('playbooks', playbooks);

  console.log('Demo data initialized successfully!');
  console.log('Database contents:');
  console.log('- Assurés:', db.count('assures'));
  console.log('- Events:', db.count('events'));
  console.log('- Cycle de Vie:', db.count('cycle_vies'));
  console.log('- Historique:', db.count('historiques'));
  console.log('- Alerts:', db.count('alerts'));
  console.log('- Cases:', db.count('cases'));
  console.log('- Fraud Catalogs:', db.count('fraud_catalogs'));
  console.log('- Playbooks:', db.count('playbooks'));
}

// Helper function to get workflow chain for a specific alert
export function getWorkflowChain(alertId: string) {
  const alert = db.getById<Alert>('alerts', alertId);
  if (!alert) return null;

  const event = db.getById<Event>('events', alert.event_id);
  const historique = db.getById<Historique>('historiques', alert.historique_id);
  const cycleVie = db.getByField<CycleVie>('cycle_vies', 'event_id', alert.event_id)[0];
  const cases = db.getByField<Case>('cases', 'alert_ids', [alertId]);

  return {
    event,
    cycleVie,
    historique,
    alert,
    cases
  };
}