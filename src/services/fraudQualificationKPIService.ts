/**
 * Service KPI Qualification de Fraude
 * Implémente les KPI spécifiques demandés pour la qualification des alertes
 * et la gouvernance opérationnelle de la détection de fraude
 */

import { db } from '@/lib/localStorage';
import { mockServices } from '@/lib/mockServices';

// Types pour les KPI de qualification
export interface AlertQualificationKPIs {
  // Alertes - Qualification (OK/KO)
  alertes: {
    total: number;
    qualifiees_ok: number;        // fraud_confirmed (vraies fraudes)
    qualifiees_ko: number;        // false_positive (faux positifs)
    en_investigation: number;     // requires_investigation
    non_qualifiees: number;       // pending, assigned, in_review
    
    // Taux de précision
    taux_precision: number;       // % de vraies fraudes parmi les alertes qualifiées
    
    // Taux de fraude avérée (après passage en dossier)
    taux_fraude_averee: number;   // % de dossiers confirmés frauduleux
  };
  
  // Gouvernance et pilotage opérationnel
  gouvernance: {
    delta_detection_traitement: number;  // % d'écart entre détection et traitement
    efficacite_globale: number;          // Performance tous outils confondus
    respect_seuil_75_pourcent: boolean;  // Delta ne dépasse pas 75%
    
    // Modules de gestion pour gestionnaires
    modules_gestion: {
      comprendre_nature_fraude: number;     // % de compréhension
      actions_appropriees: number;          // % d'actions correctes
      formation_requise: boolean;           // Besoin de formation
    };
  };
  
  // Typologie Documentaire → Assurance
  typologie_mapping: {
    documentaire_to_assurance: Array<{
      type_document: string;
      typologie_assurance: string;
      frequence: number;
      efficacite: number;
    }>;
    
    // Impact par secteur d'assurance
    par_secteur: Array<{
      secteur: string;              // auto, santé, habitation, etc.
      alertes_generees: number;
      fraudes_confirmees: number;
      taux_reussite: number;
    }>;
  };
  
  // Données brutes par assureur/stratégie
  donnees_brutes: {
    strategies_commerciales: Array<{
      assureur: string;
      politique_tolerance: number;    // % de tolérance aux faux positifs
      alertes_ignorees_volontairement: number;
      impact_business: number;
    }>;
    
    // Politiques internes vs bonnes alertes
    politique_vs_alertes: {
      bonnes_alertes_ignorees: number;
      raisons_principales: string[];
      impact_financier_estime: number;
    };
  };
  
  // Analyse unitaire des documents
  analyse_unitaire: {
    nombre_documents_analyses: number;
    cout_moyen_par_document: number;
    temps_moyen_analyse: number;    // en minutes
    
    par_type_document: Array<{
      type: string;
      nombre: number;
      cout_unitaire: number;
      precision: number;
    }>;
  };
  
  // Dossiers et coûts
  dossiers: {
    nombre_dossiers_total: number;
    nombre_dossiers_ouverts: number;
    nombre_dossiers_clos: number;
    cout_moyen_par_dossier: number;
    temps_moyen_resolution: number; // en jours
    
    repartition_par_resultat: {
      fraude_confirmee: number;
      fraude_rejetee: number;
      preuves_insuffisantes: number;
    };
  };
  
  // Distribution par type de fraude
  distribution_fraude: {
    par_type: Array<{
      type_fraude: string;
      nombre_cas: number;
      pourcentage: number;
      montant_moyen: number;
    }>;
    tendance_evolution: {
      periode_precedente: number;
      evolution_percentage: number;
    };
  };
  
  // Distribution document x fraude (pour Marimekko)
  distribution_document_fraude: {
    documents: Array<{
      type_document: string;
      total_cas: number;
      fraudes: Array<{
        type_fraude: string;
        nombre_cas: number;
        pourcentage: number; // % within this document type
        montant_moyen: number;
      }>;
    }>;
  };
  
  // Métadonnées
  periode_calcul: {
    debut: string;
    fin: string;
    derniere_maj: string;
  };
}

export class FraudQualificationKPIService {
  /**
   * Calcule tous les KPI de qualification de fraude selon les spécifications
   */
  static async calculateFraudQualificationKPIs(): Promise<AlertQualificationKPIs> {
    // Charger toutes les données nécessaires
    const alerts = await mockServices.AlertService.getAlerts();
    const cases = await mockServices.CaseService.getCases();
    const events = await mockServices.EventService.getEvents();
    const fraudCatalogs = db.getAll('fraud_catalogs');
    
    return {
      alertes: this.calculateAlertesKPIs(alerts),
      gouvernance: this.calculateGouvernanceKPIs(alerts, cases),
      typologie_mapping: this.calculateTypologieMapping(alerts, fraudCatalogs),
      donnees_brutes: this.calculateDonneesBrutes(alerts, cases),
      analyse_unitaire: this.calculateAnalyseUnitaire(events, alerts),
      dossiers: this.calculateDossiersKPIs(cases),
      distribution_fraude: this.calculateFraudDistribution(alerts, cases),
      distribution_document_fraude: this.calculateDocumentFraudDistribution(alerts),
      periode_calcul: {
        debut: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 jours
        fin: new Date().toISOString(),
        derniere_maj: new Date().toISOString()
      }
    };
  }
  
  /**
   * Calcule les KPI des alertes avec qualification OK/KO
   */
  private static calculateAlertesKPIs(alerts: any[]): AlertQualificationKPIs['alertes'] {
    const total = alerts.length;
    
    // Classification selon les qualifications
    const qualifiees_ok = alerts.filter(a => 
      a.metadata?.qualification === 'fraud_confirmed'
    ).length;
    
    const qualifiees_ko = alerts.filter(a => 
      a.metadata?.qualification === 'false_positive'
    ).length;
    
    const en_investigation = alerts.filter(a => 
      a.metadata?.qualification === 'requires_investigation'
    ).length;
    
    const qualifiees_total = qualifiees_ok + qualifiees_ko + en_investigation;
    const non_qualifiees = total - qualifiees_total;
    
    // Taux de précision = vraies fraudes / (vraies fraudes + faux positifs)
    const taux_precision = (qualifiees_ok + qualifiees_ko) > 0 
      ? (qualifiees_ok / (qualifiees_ok + qualifiees_ko)) * 100 
      : 0;
    
    // Taux de fraude avérée = dossiers confirmés / total dossiers créés
    // (calculé dans les dossiers, approximé ici)
    const taux_fraude_averee = qualifiees_ok > 0 
      ? (qualifiees_ok / qualifiees_total) * 100 
      : 0;
    
    return {
      total,
      qualifiees_ok,
      qualifiees_ko,
      en_investigation,
      non_qualifiees,
      taux_precision: Math.round(taux_precision * 100) / 100,
      taux_fraude_averee: Math.round(taux_fraude_averee * 100) / 100
    };
  }
  
  /**
   * Calcule les KPI de gouvernance et pilotage opérationnel
   */
  private static calculateGouvernanceKPIs(alerts: any[], cases: any[]): AlertQualificationKPIs['gouvernance'] {
    // Calcul du delta détection vs traitement
    const alertes_detectees = alerts.length;
    const alertes_traitees = alerts.filter(a => 
      a.status === 'qualified' || a.status === 'closed'
    ).length;
    
    const delta_detection_traitement = alertes_detectees > 0 
      ? Math.abs((alertes_traitees - alertes_detectees) / alertes_detectees) * 100 
      : 0;
    
    // Efficacité globale tous outils confondus
    const fraudes_detectees = alerts.filter(a => a.metadata?.qualification === 'fraud_confirmed').length;
    const efficacite_globale = alertes_detectees > 0 
      ? (fraudes_detectees / alertes_detectees) * 100 
      : 0;
    
    // Vérification du seuil 75%
    const respect_seuil_75_pourcent = delta_detection_traitement <= 75;
    
    // Modules de gestion pour gestionnaires
    const dossiers_bien_geres = cases.filter(c => 
      c.metadata?.investigation_notes && c.metadata?.fraud_type
    ).length;
    
    const comprendre_nature_fraude = cases.length > 0 
      ? (dossiers_bien_geres / cases.length) * 100 
      : 0;
    
    const actions_appropriees = cases.length > 0 
      ? (cases.filter(c => c.status === 'closed').length / cases.length) * 100 
      : 0;
    
    return {
      delta_detection_traitement: Math.round(delta_detection_traitement * 100) / 100,
      efficacite_globale: Math.round(efficacite_globale * 100) / 100,
      respect_seuil_75_pourcent,
      modules_gestion: {
        comprendre_nature_fraude: Math.round(comprendre_nature_fraude * 100) / 100,
        actions_appropriees: Math.round(actions_appropriees * 100) / 100,
        formation_requise: comprendre_nature_fraude < 80 || actions_appropriees < 75
      }
    };
  }
  
  /**
   * Mapping typologie documentaire → typologie assurance
   */
  private static calculateTypologieMapping(alerts: any[], fraudCatalogs: any[]): AlertQualificationKPIs['typologie_mapping'] {
    // Mapping entre types de documents et typologies d'assurance
    const documentaire_to_assurance = [
      {
        type_document: 'Constat Amiable',
        typologie_assurance: 'Fraude Automobile - Sinistre',
        frequence: alerts.filter(a => a.business_district === 'auto').length,
        efficacite: this.calculateEfficaciteByType(alerts, 'auto')
      },
      {
        type_document: 'Facture Médicale',
        typologie_assurance: 'Fraude Santé - Remboursement',
        frequence: alerts.filter(a => a.business_district === 'sante').length,
        efficacite: this.calculateEfficaciteByType(alerts, 'sante')
      },
      {
        type_document: 'Expertise Dommages',
        typologie_assurance: 'Fraude Habitation - Sinistre',
        frequence: alerts.filter(a => a.business_district === 'habitation').length,
        efficacite: this.calculateEfficaciteByType(alerts, 'habitation')
      },
      {
        type_document: 'Permis de Conduire',
        typologie_assurance: 'Fraude Automobile - Souscription',
        frequence: alerts.filter(a => 
          a.fraud_city_source === 'documentaire' && a.business_district === 'auto'
        ).length,
        efficacite: this.calculateEfficaciteByType(alerts, 'auto', 'documentaire')
      }
    ];
    
    // Impact par secteur d'assurance
    const secteurs = ['auto', 'sante', 'habitation', 'professionnelle', 'voyage'];
    const par_secteur = secteurs.map(secteur => {
      const alertes_secteur = alerts.filter(a => a.business_district === secteur);
      const fraudes_confirmees = alertes_secteur.filter(a => 
        a.metadata?.qualification === 'fraud_confirmed'
      ).length;
      
      return {
        secteur,
        alertes_generees: alertes_secteur.length,
        fraudes_confirmees,
        taux_reussite: alertes_secteur.length > 0 
          ? (fraudes_confirmees / alertes_secteur.length) * 100 
          : 0
      };
    });
    
    return {
      documentaire_to_assurance,
      par_secteur
    };
  }
  
  /**
   * Calcule les données brutes par assureur et stratégies
   */
  private static calculateDonneesBrutes(alerts: any[], cases: any[]): AlertQualificationKPIs['donnees_brutes'] {
    // Simulation de stratégies commerciales différentes d'assureurs
    const strategies_commerciales = [
      {
        assureur: 'Assureur Premium',
        politique_tolerance: 5,  // Tolérance faible aux faux positifs
        alertes_ignorees_volontairement: Math.floor(alerts.length * 0.02),
        impact_business: 98.5
      },
      {
        assureur: 'Assureur Standard',
        politique_tolerance: 15, // Tolérance moyenne
        alertes_ignorees_volontairement: Math.floor(alerts.length * 0.10),
        impact_business: 85.2
      },
      {
        assureur: 'Assureur Low-Cost',
        politique_tolerance: 25, // Tolérance élevée
        alertes_ignorees_volontairement: Math.floor(alerts.length * 0.20),
        impact_business: 72.8
      }
    ];
    
    // Analyse politique vs bonnes alertes
    const bonnes_alertes = alerts.filter(a => 
      a.score >= 80 && a.metadata?.confidence && a.metadata.confidence > 0.8
    );
    const bonnes_alertes_ignorees = Math.floor(bonnes_alertes.length * 0.15); // 15% ignorées
    
    const politique_vs_alertes = {
      bonnes_alertes_ignorees,
      raisons_principales: [
        'Stratégie commerciale - éviter friction client',
        'Coût investigation > montant potentiel',
        'Manque de ressources investigation',
        'Politique interne tolérante'
      ],
      impact_financier_estime: bonnes_alertes_ignorees * 15000 // Estimation 15k€ par alerte
    };
    
    return {
      strategies_commerciales,
      politique_vs_alertes
    };
  }
  
  /**
   * Calcule l'analyse unitaire des documents
   */
  private static calculateAnalyseUnitaire(events: any[], alerts: any[]): AlertQualificationKPIs['analyse_unitaire'] {
    const documents_analyses = events.filter(e => e.type === 'document_upload').length;
    
    // Coûts estimés par analyse
    const cout_moyen_par_document = 25; // 25€ par document analysé
    const temps_moyen_analyse = 3.5;   // 3.5 minutes par document
    
    // Par type de document
    const types_documents = [
      {
        type: 'Constat Amiable',
        nombre: Math.floor(documents_analyses * 0.35),
        cout_unitaire: 30,
        precision: 85.5
      },
      {
        type: 'Facture Médicale',
        nombre: Math.floor(documents_analyses * 0.25),
        cout_unitaire: 22,
        precision: 91.2
      },
      {
        type: 'Expertise Dommages',
        nombre: Math.floor(documents_analyses * 0.20),
        cout_unitaire: 35,
        precision: 88.7
      },
      {
        type: 'Permis de Conduire',
        nombre: Math.floor(documents_analyses * 0.20),
        cout_unitaire: 15,
        precision: 94.1
      }
    ];
    
    return {
      nombre_documents_analyses: documents_analyses,
      cout_moyen_par_document,
      temps_moyen_analyse,
      par_type_document: types_documents
    };
  }
  
  /**
   * Calcule la distribution par type de fraude
   */
  private static calculateFraudDistribution(alerts: any[], cases: any[]): AlertQualificationKPIs['distribution_fraude'] {
    // Mapping des types de fraude avec leurs données
    const fraudTypes = [
      {
        type_fraude: 'Document falsifié',
        nombre_cas: alerts.filter(a => 
          a.metadata?.fraud_type === 'document_falsifie' || 
          a.metadata?.classification?.includes('SIGNATURE_INCONSISTENCY') ||
          a.metadata?.classification?.includes('TEMPLATE_MISMATCH')
        ).length,
        montant_moyen: 3200
      },
      {
        type_fraude: 'Montant gonflé', 
        nombre_cas: alerts.filter(a => 
          a.metadata?.fraud_type === 'montant_gonfle' ||
          a.metadata?.classification?.includes('AMOUNT_ANOMALY')
        ).length,
        montant_moyen: 1800
      },
      {
        type_fraude: 'Sinistre fictif',
        nombre_cas: alerts.filter(a => 
          a.metadata?.fraud_type === 'sinistre_fictif' ||
          a.score >= 85
        ).length,
        montant_moyen: 4500
      },
      {
        type_fraude: 'Usurpation identité',
        nombre_cas: alerts.filter(a => 
          a.metadata?.fraud_type === 'usurpation_identite' ||
          a.metadata?.classification?.includes('DIGITAL_PRINT_DETECTED')
        ).length,
        montant_moyen: 2500
      },
      {
        type_fraude: 'Autres',
        nombre_cas: Math.floor(alerts.length * 0.05), // 5% autres types
        montant_moyen: 1200
      }
    ];
    
    // Calcul des totaux
    const totalCas = fraudTypes.reduce((sum, type) => sum + type.nombre_cas, 0);
    
    // Ajustement si le total ne correspond pas au nombre d'alertes confirmées
    const confirmedFrauds = alerts.filter(a => a.metadata?.qualification === 'fraud_confirmed').length;
    const adjustmentFactor = confirmedFrauds > 0 ? confirmedFrauds / totalCas : 1;
    
    // Distribution avec pourcentages
    const par_type = fraudTypes.map(type => {
      const adjustedCas = Math.round(type.nombre_cas * adjustmentFactor);
      return {
        type_fraude: type.type_fraude,
        nombre_cas: adjustedCas,
        pourcentage: confirmedFrauds > 0 ? Math.round((adjustedCas / confirmedFrauds) * 100) : 0,
        montant_moyen: type.montant_moyen
      };
    });
    
    // Ajuster les pourcentages pour atteindre 100%
    const totalPercentage = par_type.reduce((sum, type) => sum + type.pourcentage, 0);
    if (totalPercentage !== 100 && par_type.length > 0) {
      const adjustment = 100 - totalPercentage;
      par_type[0].pourcentage += adjustment; // Ajuster le premier élément
    }
    
    // Simulation de tendance évolution
    const tendance_evolution = {
      periode_precedente: confirmedFrauds,
      evolution_percentage: Math.floor(Math.random() * 20) - 10 // Entre -10% et +10%
    };
    
    return {
      par_type,
      tendance_evolution
    };
  }
  
  /**
   * Calcule les KPI des dossiers
   */
  private static calculateDossiersKPIs(cases: any[]): AlertQualificationKPIs['dossiers'] {
    const total = cases.length;
    const ouverts = cases.filter(c => c.status === 'open' || c.status === 'investigating').length;
    const clos = cases.filter(c => c.status === 'closed').length;
    
    // Coût moyen par dossier
    const cout_total = cases.reduce((sum, c) => sum + (c.investigation_cost || 0), 0);
    const cout_moyen_par_dossier = total > 0 ? cout_total / total : 0;
    
    // Temps moyen de résolution (estimé)
    const temps_moyen_resolution = 12; // 12 jours en moyenne
    
    // Répartition par résultat
    const repartition_par_resultat = {
      fraude_confirmee: cases.filter(c => 
        c.metadata?.fraud_type && c.metadata.fraud_type !== 'rejected'
      ).length,
      fraude_rejetee: cases.filter(c => 
        c.metadata?.fraud_type === 'rejected'
      ).length,
      preuves_insuffisantes: cases.filter(c => 
        c.status === 'closed' && !c.metadata?.fraud_type
      ).length
    };
    
    return {
      nombre_dossiers_total: total,
      nombre_dossiers_ouverts: ouverts,
      nombre_dossiers_clos: clos,
      cout_moyen_par_dossier: Math.round(cout_moyen_par_dossier),
      temps_moyen_resolution,
      repartition_par_resultat
    };
  }
  
  /**
   * Calcule la distribution document x fraude pour le Marimekko
   */
  private static calculateDocumentFraudDistribution(alerts: any[]): AlertQualificationKPIs['distribution_document_fraude'] {
    // Filtrer uniquement les alertes confirmées comme fraude
    const fraudAlerts = alerts.filter(a => a.metadata?.qualification === 'fraud_confirmed');
    
    // DEBUG: Log alert data
    console.log('=== Document Fraud Distribution Debug ===');
    console.log('Total alerts:', alerts.length);
    console.log('Fraud confirmed alerts:', fraudAlerts.length);
    if (fraudAlerts.length > 0) {
      console.log('Sample fraud alert:', JSON.stringify(fraudAlerts[0].metadata, null, 2));
    }
    
    // If no fraud alerts, return empty structure
    if (fraudAlerts.length === 0) {
      return {
        documents: [
          { type_document: 'Carte Grise', total_cas: 0, fraudes: [] },
          { type_document: 'Permis de Conduire', total_cas: 0, fraudes: [] },
          { type_document: 'Relevé de Sinistre', total_cas: 0, fraudes: [] },
          { type_document: 'Photo Véhicule', total_cas: 0, fraudes: [] },
          { type_document: 'Autres Documents', total_cas: 0, fraudes: [] }
        ]
      };
    }
    
    // Définir les types de documents
    const documentTypes = [
      { code: 'carte_grise', name: 'Carte Grise' },
      { code: 'permis', name: 'Permis de Conduire' },
      { code: 'releve_sinistre', name: 'Relevé de Sinistre' },
      { code: 'photo_voiture', name: 'Photo Véhicule' },
      { code: 'autres', name: 'Autres Documents' }
    ];
    
    // Définir les types de fraude
    const fraudTypes = ['Document falsifié', 'Montant gonflé', 'Sinistre fictif', 'Usurpation identité', 'Autres'];
    
    // Helper function to get document type from alert
    const getDocumentType = (alert: any): string => {
      const docTypeInAlert = (alert.metadata?.document_type || alert.metadata?.documentType || '').toLowerCase();
      
      // Direct mapping for common types
      if (docTypeInAlert.includes('carte_grise') || docTypeInAlert.includes('carte grise')) {
        return 'carte_grise';
      }
      if (docTypeInAlert.includes('permis') || docTypeInAlert.includes('license')) {
        return 'permis';
      }
      if (docTypeInAlert.includes('constat') || docTypeInAlert.includes('sinistre') || docTypeInAlert.includes('releve')) {
        return 'releve_sinistre';
      }
      if (docTypeInAlert.includes('photo') || docTypeInAlert.includes('image') || docTypeInAlert.includes('vehicule')) {
        return 'photo_voiture';
      }
      if (docTypeInAlert.includes('facture') || docTypeInAlert.includes('medical')) {
        return 'autres'; // Medical documents go to "autres"
      }
      
      // If no match, it's "autres"
      return 'autres';
    };
    
    const documents = documentTypes.map(docType => {
      // Filtrer les alertes pour ce type de document
      const docAlerts = fraudAlerts.filter(a => {
        const detectedType = getDocumentType(a);
        return detectedType === docType.code;
      });
      
      const totalCasDoc = docAlerts.length;
      
      // Calculer la distribution des fraudes pour ce document
      const fraudes = fraudTypes.map(fraudType => {
        const fraudCases = docAlerts.filter(a => {
          const alertFraudType = (a.metadata?.fraud_type || '').toLowerCase();
          
          if (fraudType === 'Document falsifié') {
            return alertFraudType === 'document_falsifie' || 
                   alertFraudType.includes('falsif') ||
                   (a.metadata?.classification && 
                    (a.metadata.classification.includes('SIGNATURE_INCONSISTENCY') ||
                     a.metadata.classification.includes('TEMPLATE_MISMATCH') ||
                     a.metadata.classification.includes('METADATA_TAMPERED')));
          } else if (fraudType === 'Montant gonflé') {
            return alertFraudType === 'montant_gonfle' ||
                   alertFraudType.includes('gonfle') ||
                   alertFraudType.includes('montant') ||
                   (a.metadata?.classification && 
                    a.metadata.classification.includes('AMOUNT_ANOMALY'));
          } else if (fraudType === 'Sinistre fictif') {
            return alertFraudType === 'sinistre_fictif' ||
                   alertFraudType.includes('fictif') ||
                   alertFraudType.includes('sinistre');
          } else if (fraudType === 'Usurpation identité') {
            return alertFraudType === 'usurpation_identite' ||
                   alertFraudType.includes('usurpation') ||
                   alertFraudType.includes('identite') ||
                   (a.metadata?.classification && 
                    a.metadata.classification.includes('DIGITAL_PRINT_DETECTED'));
          } else {
            return alertFraudType === 'autre' || 
                   alertFraudType === 'autres' ||
                   (!alertFraudType || alertFraudType === '');
          }
        });
        
        const nombreCas = fraudCases.length;
        const montantTotal = fraudCases.reduce((sum, a) => sum + (a.metadata?.financial_impact || 0), 0);
        
        return {
          type_fraude: fraudType,
          nombre_cas: nombreCas,
          pourcentage: totalCasDoc > 0 ? Math.round((nombreCas / totalCasDoc) * 100) : 0,
          montant_moyen: nombreCas > 0 ? Math.round(montantTotal / nombreCas) : 0
        };
      });
      
      return {
        type_document: docType.name,
        total_cas: totalCasDoc,
        fraudes
      };
    });
    
    // DEBUG: Log results
    console.log('Document distribution result:', JSON.stringify(documents, null, 2));
    
    return { documents };
  }
  
  // Méthodes utilitaires
  private static calculateEfficaciteByType(alerts: any[], type: string, source?: string): number {
    const filteredAlerts = alerts.filter(a => {
      const matchType = a.business_district === type;
      const matchSource = !source || a.fraud_city_source === source;
      return matchType && matchSource;
    });
    
    const fraudConfirmed = filteredAlerts.filter(a => 
      a.metadata?.qualification === 'fraud_confirmed'
    ).length;
    
    return filteredAlerts.length > 0 
      ? Math.round((fraudConfirmed / filteredAlerts.length) * 10000) / 100 
      : 0;
  }
  
  /**
   * Génère un rapport de recommandations basé sur les KPI
   */
  static generateRecommendations(kpis: AlertQualificationKPIs): Array<{
    category: string;
    recommendation: string;
    priority: 'high' | 'medium' | 'low';
    impact: string;
  }> {
    const recommendations = [];
    
    // Analyse du taux de précision
    if (kpis.alertes.taux_precision < 75) {
      recommendations.push({
        category: 'Qualité Détection',
        recommendation: 'Améliorer les seuils de détection pour réduire les faux positifs',
        priority: 'high' as const,
        impact: `Gain estimé: +${(75 - kpis.alertes.taux_precision).toFixed(1)}% de précision`
      });
    }
    
    // Analyse du delta détection/traitement
    if (!kpis.gouvernance.respect_seuil_75_pourcent) {
      recommendations.push({
        category: 'Gouvernance',
        recommendation: 'Réduire l\'écart entre détection et traitement des alertes',
        priority: 'high' as const,
        impact: 'Respecter le seuil de 75% d\'écart maximum'
      });
    }
    
    // Analyse des coûts par dossier
    if (kpis.dossiers.cout_moyen_par_dossier > 3000) {
      recommendations.push({
        category: 'Optimisation Coûts',
        recommendation: 'Optimiser les processus d\'investigation pour réduire les coûts',
        priority: 'medium' as const,
        impact: `Économie potentielle: ${kpis.dossiers.cout_moyen_par_dossier - 3000}€ par dossier`
      });
    }
    
    // Analyse de la formation
    if (kpis.gouvernance.modules_gestion.formation_requise) {
      recommendations.push({
        category: 'Formation',
        recommendation: 'Formation des gestionnaires sur la nature des fraudes',
        priority: 'medium' as const,
        impact: 'Amélioration de la qualité de traitement des dossiers'
      });
    }
    
    return recommendations;
  }
}