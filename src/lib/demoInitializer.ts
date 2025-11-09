// Demo Database Initializer
// Provides methods to initialize and manage demo data for the application

import { initializeDemoData } from './demoData';
import { db } from './localStorage';

export class DemoInitializer {
  private static initialized = false;

  // Initialize demo data if not already done
  static init() {
    if (this.initialized || this.hasData()) {
      console.log('Demo data already exists, skipping initialization');
      return;
    }

    console.log('Initializing demo data...');
    initializeDemoData();
    
    this.initialized = true;
    this.setInitializationFlag();
  }

  // Force re-initialization (useful for development)
  static forceInit(preserveImages = true) {
    console.log('Force re-initializing demo data...');
    if (preserveImages) {
      console.log('Preserving document images...');
      db.clearAll(['document_images']);
    } else {
      db.clearAll();
    }
    initializeDemoData();
    
    this.initialized = true;
    this.setInitializationFlag();
  }

  // Check if we have existing data
  static hasData(): boolean {
    return db.count('alerts') > 0 || db.count('cases') > 0 || db.count('events') > 0;
  }

  // Set flag to remember initialization
  private static setInitializationFlag() {
    localStorage.setItem('hedi_demo_initialized', 'true');
  }

  // Check if demo was previously initialized
  static wasInitialized(): boolean {
    return localStorage.getItem('hedi_demo_initialized') === 'true';
  }

  // Get database statistics
  static getStats() {
    return {
      events: db.count('events'),
      cycle_vies: db.count('cycle_vies'),
      historiques: db.count('historiques'),
      alerts: db.count('alerts'),
      cases: db.count('cases'),
      fraud_catalogs: db.count('fraud_catalogs'),
      playbooks: db.count('playbooks'),
      document_images: db.count('document_images'),
      total_size: this.calculateStorageSize()
    };
  }

  // Calculate localStorage usage
  private static calculateStorageSize(): string {
    let total = 0;
    for (const key in localStorage) {
      if (key.startsWith('hedi_')) {
        total += localStorage[key].length;
      }
    }
    return `${(total / 1024).toFixed(2)} KB`;
  }

  // Validate and fix data integrity
  static validateWorkflowIntegrity() {
    const events = db.getAll('events');
    const alerts = db.getAll('alerts');
    
    // Find orphaned alerts (alerts without corresponding events)
    const orphanedAlerts = alerts.filter(alert => 
      !events.find(event => event.id === alert.event_id)
    );

    if (orphanedAlerts.length > 0) {
      console.warn(`Found ${orphanedAlerts.length} orphaned alerts (without corresponding events):`);
      orphanedAlerts.forEach(alert => {
        console.warn(`- Alert ${alert.reference} (${alert.id}) references non-existent event ${alert.event_id}`);
      });

      // Option to clean up orphaned alerts
      const cleanup = confirm(`Found ${orphanedAlerts.length} orphaned alerts. Clean them up?`);
      if (cleanup) {
        orphanedAlerts.forEach(alert => {
          db.delete('alerts', alert.id);
        });
        console.log('Orphaned alerts cleaned up');
      }
    }

    // Report workflow integrity
    const stats = {
      events: events.length,
      alerts: alerts.length,
      orphaned_alerts: orphanedAlerts.length,
      valid_event_alert_pairs: alerts.filter(alert => 
        events.find(event => event.id === alert.event_id)
      ).length
    };

    console.log('Workflow Integrity Report:', stats);
    return stats;
  }

  // Reset demo data
  static reset(includeImages = false) {
    console.log('Resetting demo data...');
    if (includeImages) {
      db.clearAll();
    } else {
      db.clearAll(['document_images']);
    }
    localStorage.removeItem('hedi_demo_initialized');
    this.initialized = false;
  }

  // Add sample data for testing specific scenarios
  static addTestScenarios() {
    const timestamp = Date.now();
    
    // First create the event that will generate the alert
    const criticalEvent = {
      id: `evt-critical-${timestamp}`,
      type: 'pattern_detection',
      timestamp: new Date().toISOString(),
      source: 'ai_engine_advanced',
      data: {
        metadata: { 
          correlation_score: 0.95, 
          affected_entities: ['network-node-001', 'network-node-002', 'network-node-003'],
          detection_confidence: 0.95
        }
      },
      status: 'processed'
    };

    db.create('events', criticalEvent);

    // Create corresponding cycle de vie
    const criticalCycleVie = {
      id: `cv-critical-${timestamp}`,
      event_id: criticalEvent.id,
      stage: 'decision',
      timestamp: new Date().toISOString(),
      duration_hours: 0.5,
      metadata: { urgency_flag: true, auto_escalated: true }
    };

    db.create('cycle_vies', criticalCycleVie);

    // Create corresponding historique
    const criticalHistorique = {
      id: `hist-critical-${timestamp}`,
      event_id: criticalEvent.id,
      cycle_vie_id: criticalCycleVie.id,
      action: 'Pattern critique détecté - escalade automatique',
      actor: 'advanced_ai_engine',
      timestamp: new Date().toISOString(),
      details: {
        network_correlation: 'sophisticated_attack_pattern',
        risk_level: 'critical',
        auto_escalated: true
      },
      impact_level: 'critical'
    };

    db.create('historiques', criticalHistorique);

    // Now create the alert (following proper workflow)
    const criticalAlert = {
      id: `alert-critical-${timestamp}`,
      event_id: criticalEvent.id,
      historique_id: criticalHistorique.id,
      reference: `ALT-CRIT-${Date.now()}`,
      source: 'pattern_detection' as const,
      fraud_city_source: 'cyber' as const,
      business_district: 'auto' as const,
      severity: 'critical' as const,
      score: 95,
      status: 'new' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sla_deadline: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours
      impacts_risk: false,
      metadata: {
        detection_model: 'critical_pattern_v3.0',
        confidence: 0.95,
        affected_entities: ['network-node-001', 'network-node-002', 'network-node-003'],
        financial_impact: 500000,
        qualification: 'fraud_confirmed',
        fraud_type: 'usurpation_identite',
        document_type: 'permis_conduire',
        documentType: 'permis_conduire'
      }
    };

    db.create('alerts', criticalAlert);

    // Add overdue case
    const overdueCase = {
      id: `case-overdue-${Date.now()}`,
      reference: `CASE-OVERDUE-${Date.now()}`,
      alert_ids: [criticalAlert.id],
      status: 'investigating' as const,
      priority: 'urgent' as const,
      investigation_team: 'cyber_fraud_team',
      assigned_to: 'cyber-specialist-urgent',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      estimated_loss: 500000,
      investigation_cost: 15000,
      handovers: [],
      metadata: {
        fraud_type: 'sophisticated_network_attack',
        evidence_collected: ['network_logs', 'correlation_analysis', 'financial_impact_assessment'],
        investigation_notes: 'Réseau sophistiqué détecté - investigation urgente requise'
      }
    };

    db.create('cases', overdueCase);

    // Add more diverse fraud alerts for better distribution
    this.generateDiverseFraudAlerts();

    console.log('Test scenarios added successfully');
  }

  /**
   * Generate diverse fraud alerts with proper qualifications
   */
  static generateDiverseFraudAlerts() {
    const fraudTypes = [
      { type: 'document_falsifie', count: 35, qualification: 'fraud_confirmed' },
      { type: 'montant_gonfle', count: 28, qualification: 'fraud_confirmed' },
      { type: 'sinistre_fictif', count: 20, qualification: 'fraud_confirmed' },
      { type: 'usurpation_identite', count: 12, qualification: 'fraud_confirmed' },
      { type: 'autre', count: 5, qualification: 'fraud_confirmed' },
      { type: 'false_positive', count: 30, qualification: 'false_positive' },
      { type: 'investigation', count: 15, qualification: 'requires_investigation' }
    ];

    let alertCounter = 1000;

    fraudTypes.forEach(fraudType => {
      for (let i = 0; i < fraudType.count; i++) {
        const timestamp = Date.now() + alertCounter;
        
        // Create event first
        const event = {
          id: `evt-gen-${timestamp}`,
          type: 'document_upload',
          timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date in last 30 days
          source: 'web_portal',
          data: {
            document_type: 'mixed',
            file_size: Math.floor(Math.random() * 5000000),
            metadata: { auto_generated: true }
          },
          status: 'processed' as const
        };
        db.create('events', event);

        // Create alert
        // Randomly assign document type based on realistic distribution
        const documentTypes = [
          { type: 'constat_amiable', weight: 0.25 },
          { type: 'permis_conduire', weight: 0.15 },
          { type: 'carte_grise', weight: 0.20 },
          { type: 'photo_vehicule', weight: 0.15 },
          { type: 'facture_reparation', weight: 0.10 },
          { type: 'expertise', weight: 0.10 },
          { type: 'autres', weight: 0.05 }
        ];
        
        // Select document type based on weights
        const rand = Math.random();
        let cumWeight = 0;
        let selectedDocType = 'autres';
        for (const dt of documentTypes) {
          cumWeight += dt.weight;
          if (rand < cumWeight) {
            selectedDocType = dt.type;
            break;
          }
        }

        const alert = {
          id: `alert-gen-${timestamp}`,
          event_id: event.id,
          historique_id: `hist-gen-${timestamp}`,
          reference: `ALT-GEN-${alertCounter++}`,
          source: 'document_analysis' as const,
          fraud_city_source: ['documentaire', 'cyber', 'comportemental'][Math.floor(Math.random() * 3)] as any,
          business_district: ['auto', 'sante', 'habitation', 'professionnelle'][Math.floor(Math.random() * 4)] as any,
          severity: ['critical', 'high', 'medium'][Math.floor(Math.random() * 3)] as any,
          score: 60 + Math.floor(Math.random() * 40), // 60-99
          status: 'qualified' as const,
          assigned_to: `analyst-${Math.floor(Math.random() * 10)}`,
          assigned_team: 'fraud_detection_team',
          created_at: event.timestamp,
          updated_at: new Date().toISOString(),
          sla_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          impacts_risk: fraudType.qualification === 'fraud_confirmed',
          metadata: {
            detection_model: 'ai_v2.5',
            confidence: 0.6 + Math.random() * 0.4, // 0.6-1.0
            financial_impact: Math.floor(Math.random() * 50000) + 1000,
            qualification: fraudType.qualification,
            fraud_type: fraudType.type === 'false_positive' || fraudType.type === 'investigation' ? undefined : fraudType.type,
            qualified_at: new Date().toISOString(),
            classification: this.getClassificationForType(fraudType.type),
            document_type: selectedDocType,
            documentType: selectedDocType // Also add with camelCase for compatibility
          }
        };
        
        db.create('alerts', alert);
      }
    });
  }

  static getClassificationForType(fraudType: string): string[] {
    const classificationMap: Record<string, string[]> = {
      'document_falsifie': ['SIGNATURE_INCONSISTENCY', 'TEMPLATE_MISMATCH', 'METADATA_TAMPERED'],
      'montant_gonfle': ['AMOUNT_ANOMALY', 'STATISTICAL_OUTLIER', 'EXCESSIVE_CLAIM'],
      'sinistre_fictif': ['DUPLICATE_CLAIM', 'TIMELINE_IMPOSSIBLE', 'EVIDENCE_MISMATCH'],
      'usurpation_identite': ['DIGITAL_PRINT_DETECTED', 'IDENTITY_MISMATCH', 'BIOMETRIC_FAIL'],
      'autre': ['GENERAL_ANOMALY', 'PATTERN_UNUSUAL'],
      'false_positive': ['LOW_CONFIDENCE', 'BORDERLINE_SCORE'],
      'investigation': ['REQUIRES_MANUAL_REVIEW', 'AMBIGUOUS_EVIDENCE']
    };
    
    return classificationMap[fraudType] || ['UNKNOWN'];
  }

  // Simulate real-time data updates
  static simulateRealTimeUpdates() {
    setInterval(() => {
      const alerts = db.getAll('alerts');
      if (alerts.length > 0) {
        // Randomly update an alert status
        const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
        const statuses = ['new', 'assigned', 'investigating', 'qualified'];
        const currentStatusIndex = statuses.indexOf(randomAlert.status);
        const nextStatus = statuses[Math.min(currentStatusIndex + 1, statuses.length - 1)];
        
        db.update('alerts', randomAlert.id, {
          status: nextStatus,
          updated_at: new Date().toISOString()
        });

        console.log(`Alert ${randomAlert.reference} updated to status: ${nextStatus}`);
      }
    }, 30000); // Update every 30 seconds
  }

  // Export data for backup
  static exportData() {
    const data = {
      events: db.getAll('events'),
      cycle_vies: db.getAll('cycle_vies'),
      historiques: db.getAll('historiques'),
      alerts: db.getAll('alerts'),
      cases: db.getAll('cases'),
      fraud_catalogs: db.getAll('fraud_catalogs'),
      playbooks: db.getAll('playbooks'),
      document_images: db.getAll('document_images'),
      exported_at: new Date().toISOString()
    };

    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `hedi-demo-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Import data from backup
  static importData(jsonData: string, preserveExistingImages = true) {
    try {
      const data = JSON.parse(jsonData);
      
      // Clear existing data
      if (preserveExistingImages && !data.document_images) {
        db.clearAll(['document_images']);
      } else {
        db.clearAll();
      }
      
      // Import each table
      if (data.events) db.bulkCreate('events', data.events);
      if (data.cycle_vies) db.bulkCreate('cycle_vies', data.cycle_vies);
      if (data.historiques) db.bulkCreate('historiques', data.historiques);
      if (data.alerts) db.bulkCreate('alerts', data.alerts);
      if (data.cases) db.bulkCreate('cases', data.cases);
      if (data.fraud_catalogs) db.bulkCreate('fraud_catalogs', data.fraud_catalogs);
      if (data.playbooks) db.bulkCreate('playbooks', data.playbooks);
      if (data.document_images) db.bulkCreate('document_images', data.document_images);

      this.setInitializationFlag();
      console.log('Data imported successfully');
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Invalid JSON data format');
    }
  }
}

// Auto-initialize on module load if running in browser
if (typeof window !== 'undefined') {
  // Initialize demo data on first load
  if (!DemoInitializer.wasInitialized() && !DemoInitializer.hasData()) {
    DemoInitializer.init();
  }

  // Make available globally for development
  (window as any).DemoInitializer = DemoInitializer;
  (window as any).hediDB = db;
  
  // Add method to clean duplicate alerts
  (window as any).cleanDuplicateAlerts = () => {
    const alerts = db.getAll('alerts');
    const uniqueAlerts = alerts.filter((alert, index, self) => 
      index === self.findIndex(a => a.id === alert.id)
    );
    
    if (alerts.length !== uniqueAlerts.length) {
      console.log(`🧹 Cleaning ${alerts.length - uniqueAlerts.length} duplicate alerts...`);
      db.save('alerts', uniqueAlerts);
      console.log(`✅ Cleaned! Now have ${uniqueAlerts.length} unique alerts.`);
    } else {
      console.log(`✅ No duplicates found. You have ${alerts.length} unique alerts.`);
    }
  };

  // Add method to force refresh alerts with technical evidence
  (window as any).refreshAlertsWithTechnicalEvidence = () => {
    console.log('🔄 Refreshing alerts with technical evidence...');
    DemoInitializer.forceInit();
    console.log('✅ Alerts refreshed! Reload the alerts page to see the technical evidence.');
  };

  // Add helpful development commands
  console.log(`
🚀 Hedi Document Guardian - Demo Database Ready!

Available development commands:
- DemoInitializer.getStats() - Get database statistics
- DemoInitializer.validateWorkflowIntegrity() - Check Event→Alert relationships
- DemoInitializer.forceInit() - Reinitialize demo data
- DemoInitializer.reset() - Clear all data
- DemoInitializer.exportData() - Download data backup
- hediDB.getAll('alerts') - Get all alerts
- cleanDuplicateAlerts() - Remove duplicate alerts if any
- refreshAlertsWithTechnicalEvidence() - Force refresh alerts with technical evidence
- runDemoExamples() - Run integration examples

Database contains:
- ${DemoInitializer.getStats().alerts} alerts
- ${DemoInitializer.getStats().cases} cases  
- ${DemoInitializer.getStats().events} events
- ${DemoInitializer.getStats().document_images} document images

🔧 If you have too many alerts: run cleanDuplicateAlerts()
🔧 If technical evidence is not showing: run refreshAlertsWithTechnicalEvidence()

Happy coding! 🎯
  `);
}