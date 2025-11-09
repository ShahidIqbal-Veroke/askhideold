/**
 * Insurance KPI Service
 * Provides business-meaningful KPIs aligned with insurance fraud management needs
 */

import { FraudTypology, FraudContext } from './fraudTypologyService';
import { ROICalculation } from './roiCalculationService';
import { Alert } from '../types/alert.types';

export interface InsuranceKPIs {
  // Financial Performance
  fraudPrevention: FraudPreventionKPIs;
  
  // Operational Efficiency
  operationalEfficiency: OperationalEfficiencyKPIs;
  
  // Detection Quality
  detectionQuality: DetectionQualityKPIs;
  
  // Business Impact
  businessImpact: BusinessImpactKPIs;
  
  // Compliance & Risk
  compliance: ComplianceKPIs;
  
  // Trends & Insights
  trends: TrendInsights;
  
  // Metadata
  calculationPeriod: DateRange;
  lastUpdated: Date;
}

export interface FraudPreventionKPIs {
  // Direct Financial Impact
  totalPreventedAmount: number;
  subscriptionFraudPrevented: number;
  claimsFraudPrevented: number;
  
  // ROI Metrics
  overallROI: number;
  subscriptionROI: number;
  claimsROI: number;
  costPerCasePrevented: number;
  
  // Prevention Rates
  subscriptionFraudRate: number;  // % of subscription documents flagged
  claimsFraudRate: number;        // % of claims documents flagged
  falsePositiveRate: number;
  truePositiveRate: number;
  
  // Recovery Metrics
  totalRecoveredAmount: number;
  averageRecoveryTime: number;
  recoverySuccessRate: number;
}

export interface OperationalEfficiencyKPIs {
  // Processing Metrics
  averageProcessingTime: number;        // Hours to process alert
  averageInvestigationTime: number;     // Hours to investigate case
  caseResolutionTime: number;           // Days to close case
  
  // Queue Management
  currentBacklog: number;
  backlogTrend: 'increasing' | 'stable' | 'decreasing';
  peakQueueTime: string;               // Hour of day with most activity
  
  // Resource Utilization
  analystProductivity: number;          // Cases per analyst per day
  automationRate: number;              // % of cases handled automatically
  escalationRate: number;              // % requiring manual review
  
  // Quality Metrics
  reworkRate: number;                  // % of cases requiring rework
  accuracyRate: number;                // % of correct decisions
  customerSatisfactionScore: number;   // Impact on customer experience
}

export interface DetectionQualityKPIs {
  // Algorithm Performance
  detectionAccuracy: number;           // Overall accuracy
  precisionScore: number;              // True positives / (True positives + False positives)
  recallScore: number;                 // True positives / (True positives + False negatives)
  f1Score: number;                     // Harmonic mean of precision and recall
  
  // Confidence Metrics
  averageConfidenceScore: number;
  highConfidenceCases: number;         // Cases with >80% confidence
  lowConfidenceCases: number;          // Cases with <50% confidence
  
  // Detection Patterns
  mostCommonFraudTypes: Array<{ type: string; count: number; percentage: number }>;
  emergingThrends: Array<{ pattern: string; growth: number }>;
  seasonalPatterns: Record<string, number>;
  
  // Model Performance
  modelDrift: number;                  // Performance degradation over time
  calibrationScore: number;            // How well confidence matches reality
}

export interface BusinessImpactKPIs {
  // Customer Impact
  customerRetentionImpact: number;     // Estimated retention improvement
  customerExperienceScore: number;     // Impact on experience (1-10)
  legitimateCustomerImpact: number;    // False positive impact
  
  // Market Position
  competitiveAdvantage: number;        // Estimated advantage over competitors
  marketShareProtection: number;       // Protected market share value
  
  // Strategic Value
  riskPoolIntegrity: number;           // Value of maintaining accurate risk assessment
  pricingAccuracy: number;             // Improvement in pricing models
  regulatoryStanding: number;          // Compliance score
  
  // Innovation Metrics
  newFraudTypesDetected: number;       // Novel patterns discovered
  technologicalEdge: number;           // Advanced detection capabilities
}

export interface ComplianceKPIs {
  // Regulatory Compliance
  gdprCompliance: number;              // GDPR compliance score (0-100)
  reportingTimeliness: number;         // % of reports submitted on time
  auditTrailCompleteness: number;      // % of complete audit trails
  
  // Data Protection
  dataMinimization: number;            // Adherence to data minimization
  dataRetentionCompliance: number;     // Proper data retention
  
  // Fraud Reporting
  suspiciousActivityReports: number;   // SARs filed
  regulatoryNotifications: number;     // Required notifications sent
  complianceViolations: number;        // Number of violations
  
  // Risk Management
  riskAssessmentScore: number;         // Overall risk score
  controlEffectiveness: number;        // Internal control effectiveness
}

export interface TrendInsights {
  // Volume Trends
  alertVolumeTrend: TrendData;
  fraudDetectionTrend: TrendData;
  falsePositiveTrend: TrendData;
  
  // Financial Trends
  preventedAmountTrend: TrendData;
  roiTrend: TrendData;
  costTrend: TrendData;
  
  // Pattern Analysis
  fraudTypeEvolution: Array<{ type: string; trend: 'increasing' | 'stable' | 'decreasing' }>;
  seasonalPatterns: Record<string, { peak: string; low: string; factor: number }>;
  geographicTrends: Array<{ region: string; riskLevel: 'low' | 'medium' | 'high'; trend: string }>;
  
  // Predictive Insights
  forecastedVolume: { nextMonth: number; nextQuarter: number; confidence: number };
  riskFactors: Array<{ factor: string; impact: number; probability: number }>;
  recommendations: Array<{ category: string; action: string; priority: 'low' | 'medium' | 'high' }>;
}

interface TrendData {
  current: number;
  previous: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  confidence: number;
}

interface DateRange {
  start: Date;
  end: Date;
}

export class InsuranceKPIService {
  /**
   * Calculates comprehensive insurance KPIs from fraud data
   */
  static calculateInsuranceKPIs(
    alerts: Alert[],
    fraudTypologies: FraudTypology[],
    roiCalculations: ROICalculation[],
    period: DateRange
  ): InsuranceKPIs {
    return {
      fraudPrevention: this.calculateFraudPreventionKPIs(alerts, roiCalculations),
      operationalEfficiency: this.calculateOperationalEfficiencyKPIs(alerts),
      detectionQuality: this.calculateDetectionQualityKPIs(alerts, fraudTypologies),
      businessImpact: this.calculateBusinessImpactKPIs(roiCalculations, fraudTypologies),
      compliance: this.calculateComplianceKPIs(alerts),
      trends: this.calculateTrendInsights(alerts, roiCalculations),
      calculationPeriod: period,
      lastUpdated: new Date()
    };
  }

  /**
   * Calculates fraud prevention financial KPIs
   */
  private static calculateFraudPreventionKPIs(
    alerts: Alert[],
    roiCalculations: ROICalculation[]
  ): FraudPreventionKPIs {
    const totalAlerts = alerts.length;
    const fraudAlerts = alerts.filter(a => a.qualification === 'fraud_confirmed');
    const falsePositives = alerts.filter(a => a.qualification === 'false_positive');
    
    const subscriptionROIs = roiCalculations.filter(r => r.context === 'subscription');
    const claimsROIs = roiCalculations.filter(r => r.context === 'claims');
    
    const totalPrevented = roiCalculations.reduce((sum, r) => sum + r.preventedAmount, 0);
    const subscriptionPrevented = subscriptionROIs.reduce((sum, r) => sum + r.preventedAmount, 0);
    const claimsPrevented = claimsROIs.reduce((sum, r) => sum + r.preventedAmount, 0);
    
    const totalCosts = roiCalculations.reduce((sum, r) => 
      sum + r.detectionCost + r.investigationCost + r.processingCost, 0
    );
    
    return {
      totalPreventedAmount: totalPrevented,
      subscriptionFraudPrevented: subscriptionPrevented,
      claimsFraudPrevented: claimsPrevented,
      
      overallROI: roiCalculations.length > 0 
        ? roiCalculations.reduce((sum, r) => sum + r.riskAdjustedROI, 0) / roiCalculations.length 
        : 0,
      subscriptionROI: subscriptionROIs.length > 0 
        ? subscriptionROIs.reduce((sum, r) => sum + r.riskAdjustedROI, 0) / subscriptionROIs.length 
        : 0,
      claimsROI: claimsROIs.length > 0 
        ? claimsROIs.reduce((sum, r) => sum + r.riskAdjustedROI, 0) / claimsROIs.length 
        : 0,
      costPerCasePrevented: totalAlerts > 0 ? totalCosts / totalAlerts : 0,
      
      subscriptionFraudRate: this.calculateFraudRate(alerts, 'subscription'),
      claimsFraudRate: this.calculateFraudRate(alerts, 'claims'),
      falsePositiveRate: totalAlerts > 0 ? (falsePositives.length / totalAlerts) * 100 : 0,
      truePositiveRate: totalAlerts > 0 ? (fraudAlerts.length / totalAlerts) * 100 : 0,
      
      totalRecoveredAmount: roiCalculations.reduce((sum, r) => sum + r.recoveredAmount, 0),
      averageRecoveryTime: 15, // Mock value - would come from case management
      recoverySuccessRate: 0.65 // Mock value - would come from case management
    };
  }

  /**
   * Calculates operational efficiency KPIs
   */
  private static calculateOperationalEfficiencyKPIs(alerts: Alert[]): OperationalEfficiencyKPIs {
    const now = new Date();
    const completedAlerts = alerts.filter(a => a.status === 'qualified' || a.status === 'rejected');
    
    // Calculate average processing times
    const processingTimes = completedAlerts.map(alert => {
      const created = new Date(alert.createdAt);
      const updated = new Date(alert.updatedAt);
      return (updated.getTime() - created.getTime()) / (1000 * 60 * 60); // Hours
    });
    
    const avgProcessingTime = processingTimes.length > 0 
      ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length 
      : 0;
    
    const pendingAlerts = alerts.filter(a => ['pending', 'assigned', 'in_review'].includes(a.status));
    
    return {
      averageProcessingTime: avgProcessingTime,
      averageInvestigationTime: avgProcessingTime * 0.7, // Estimate
      caseResolutionTime: avgProcessingTime / 24, // Convert to days
      
      currentBacklog: pendingAlerts.length,
      backlogTrend: this.calculateBacklogTrend(alerts),
      peakQueueTime: this.calculatePeakQueueTime(alerts),
      
      analystProductivity: 12, // Mock value - cases per analyst per day
      automationRate: 75, // Mock value - % automated
      escalationRate: alerts.filter(a => a.severity === 'critical').length / alerts.length * 100,
      
      reworkRate: 5, // Mock value
      accuracyRate: this.calculateAccuracyRate(alerts),
      customerSatisfactionScore: 8.2 // Mock value
    };
  }

  /**
   * Calculates detection quality KPIs
   */
  private static calculateDetectionQualityKPIs(
    alerts: Alert[],
    fraudTypologies: FraudTypology[]
  ): DetectionQualityKPIs {
    const qualifiedAlerts = alerts.filter(a => a.qualification);
    const truePositives = qualifiedAlerts.filter(a => a.qualification === 'fraud_confirmed').length;
    const falsePositives = qualifiedAlerts.filter(a => a.qualification === 'false_positive').length;
    const totalPositives = truePositives + falsePositives;
    
    const precision = totalPositives > 0 ? truePositives / totalPositives : 0;
    const recall = 0.85; // Mock value - would need ground truth data
    const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
    
    const avgConfidence = fraudTypologies.length > 0 
      ? fraudTypologies.reduce((sum, f) => sum + f.confidence, 0) / fraudTypologies.length 
      : 0;
    
    const fraudTypeCounts = this.countFraudTypes(fraudTypologies);
    
    return {
      detectionAccuracy: precision * 100,
      precisionScore: precision * 100,
      recallScore: recall * 100,
      f1Score: f1 * 100,
      
      averageConfidenceScore: avgConfidence * 100,
      highConfidenceCases: fraudTypologies.filter(f => f.confidence > 0.8).length,
      lowConfidenceCases: fraudTypologies.filter(f => f.confidence < 0.5).length,
      
      mostCommonFraudTypes: fraudTypeCounts,
      emergingThrends: this.identifyEmergingTrends(fraudTypologies),
      seasonalPatterns: this.calculateSeasonalPatterns(alerts),
      
      modelDrift: 0.02, // Mock value
      calibrationScore: 0.88 // Mock value
    };
  }

  /**
   * Calculates business impact KPIs
   */
  private static calculateBusinessImpactKPIs(
    roiCalculations: ROICalculation[],
    fraudTypologies: FraudTypology[]
  ): BusinessImpactKPIs {
    const avgCustomerRetention = roiCalculations.length > 0 
      ? roiCalculations.reduce((sum, r) => sum + r.customerRetentionValue, 0) / roiCalculations.length 
      : 0;
    
    return {
      customerRetentionImpact: avgCustomerRetention,
      customerExperienceScore: 7.8, // Mock value
      legitimateCustomerImpact: 2.1, // Mock value - negative impact from false positives
      
      competitiveAdvantage: 15.5, // Mock value - % advantage
      marketShareProtection: 2.3, // Mock value - % of market share protected
      
      riskPoolIntegrity: 92.4, // Mock value - % integrity score
      pricingAccuracy: 18.7, // Mock value - % improvement in pricing
      regulatoryStanding: 94.2, // Mock value - compliance score
      
      newFraudTypesDetected: this.countNewFraudTypes(fraudTypologies),
      technologicalEdge: 8.6 // Mock value - tech advancement score
    };
  }

  /**
   * Calculates compliance KPIs
   */
  private static calculateComplianceKPIs(alerts: Alert[]): ComplianceKPIs {
    return {
      gdprCompliance: 96.8, // Mock value
      reportingTimeliness: 98.5, // Mock value
      auditTrailCompleteness: 99.2, // Mock value
      
      dataMinimization: 94.1, // Mock value
      dataRetentionCompliance: 97.6, // Mock value
      
      suspiciousActivityReports: alerts.filter(a => a.severity === 'critical').length,
      regulatoryNotifications: 12, // Mock value
      complianceViolations: 0, // Mock value
      
      riskAssessmentScore: 88.3, // Mock value
      controlEffectiveness: 91.7 // Mock value
    };
  }

  /**
   * Calculates trend insights
   */
  private static calculateTrendInsights(
    alerts: Alert[],
    roiCalculations: ROICalculation[]
  ): TrendInsights {
    const currentMonth = new Date().getMonth();
    const lastMonth = currentMonth - 1;
    
    const currentMonthAlerts = alerts.filter(a => new Date(a.createdAt).getMonth() === currentMonth);
    const lastMonthAlerts = alerts.filter(a => new Date(a.createdAt).getMonth() === lastMonth);
    
    const alertVolumeChange = lastMonthAlerts.length > 0 
      ? ((currentMonthAlerts.length - lastMonthAlerts.length) / lastMonthAlerts.length) * 100 
      : 0;
    
    return {
      alertVolumeTrend: {
        current: currentMonthAlerts.length,
        previous: lastMonthAlerts.length,
        change: alertVolumeChange,
        trend: alertVolumeChange > 5 ? 'up' : alertVolumeChange < -5 ? 'down' : 'stable',
        confidence: 0.8
      },
      
      fraudDetectionTrend: this.createMockTrendData(25, 22, 'up'),
      falsePositiveTrend: this.createMockTrendData(8, 12, 'down'),
      
      preventedAmountTrend: this.createMockTrendData(125000, 118000, 'up'),
      roiTrend: this.createMockTrendData(340, 310, 'up'),
      costTrend: this.createMockTrendData(2800, 3100, 'down'),
      
      fraudTypeEvolution: this.analyzeFraudTypeEvolution(alerts),
      seasonalPatterns: this.calculateSeasonalPatterns(alerts),
      geographicTrends: this.analyzeGeographicTrends(),
      
      forecastedVolume: {
        nextMonth: currentMonthAlerts.length * 1.1,
        nextQuarter: currentMonthAlerts.length * 3.2,
        confidence: 0.75
      },
      
      riskFactors: this.identifyRiskFactors(),
      recommendations: this.generateRecommendations(alerts, roiCalculations)
    };
  }

  // Helper methods
  private static calculateFraudRate(alerts: Alert[], context: string): number {
    const contextAlerts = alerts.filter(a => 
      a.metadata.documentType?.toLowerCase().includes(context === 'subscription' ? 'permis' : 'facture')
    );
    const fraudulentAlerts = contextAlerts.filter(a => a.qualification === 'fraud_confirmed');
    return contextAlerts.length > 0 ? (fraudulentAlerts.length / contextAlerts.length) * 100 : 0;
  }

  private static calculateBacklogTrend(alerts: Alert[]): 'increasing' | 'stable' | 'decreasing' {
    // Mock implementation
    return 'stable';
  }

  private static calculatePeakQueueTime(alerts: Alert[]): string {
    // Analyze creation times and return peak hour
    return '14:00'; // Mock value
  }

  private static calculateAccuracyRate(alerts: Alert[]): number {
    const qualifiedAlerts = alerts.filter(a => a.qualification);
    const accurateDecisions = qualifiedAlerts.filter(a => 
      a.qualification === 'fraud_confirmed' || a.qualification === 'false_positive'
    );
    return qualifiedAlerts.length > 0 ? (accurateDecisions.length / qualifiedAlerts.length) * 100 : 0;
  }

  private static countFraudTypes(fraudTypologies: FraudTypology[]): Array<{ type: string; count: number; percentage: number }> {
    const counts: Record<string, number> = {};
    fraudTypologies.forEach(f => {
      if (f.primaryType) {
        counts[f.primaryType] = (counts[f.primaryType] || 0) + 1;
      }
    });
    
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    return Object.entries(counts)
      .map(([type, count]) => ({
        type,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);
  }

  private static identifyEmergingTrends(fraudTypologies: FraudTypology[]): Array<{ pattern: string; growth: number }> {
    // Mock implementation - would analyze historical data
    return [
      { pattern: 'AI-generated content fraud', growth: 45.2 },
      { pattern: 'Digital print sophistication', growth: 23.1 }
    ];
  }

  private static calculateSeasonalPatterns(alerts: Alert[]): Record<string, number> {
    // Mock implementation
    return {
      'Q1': 1.2,
      'Q2': 0.9,
      'Q3': 1.1,
      'Q4': 1.3
    };
  }

  private static countNewFraudTypes(fraudTypologies: FraudTypology[]): number {
    // Mock implementation - would track novel patterns
    return 3;
  }

  private static createMockTrendData(current: number, previous: number, trend: 'up' | 'down' | 'stable'): TrendData {
    const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;
    return {
      current,
      previous,
      change,
      trend,
      confidence: 0.85
    };
  }

  private static analyzeFraudTypeEvolution(alerts: Alert[]): Array<{ type: string; trend: 'increasing' | 'stable' | 'decreasing' }> {
    // Mock implementation
    return [
      { type: 'document_falsification', trend: 'increasing' },
      { type: 'identity_usurpation', trend: 'stable' },
      { type: 'amount_inflation', trend: 'decreasing' }
    ];
  }

  private static analyzeGeographicTrends(): Array<{ region: string; riskLevel: 'low' | 'medium' | 'high'; trend: string }> {
    // Mock implementation
    return [
      { region: 'Île-de-France', riskLevel: 'high', trend: 'increasing' },
      { region: 'PACA', riskLevel: 'medium', trend: 'stable' },
      { region: 'Auvergne-Rhône-Alpes', riskLevel: 'low', trend: 'decreasing' }
    ];
  }

  private static identifyRiskFactors(): Array<{ factor: string; impact: number; probability: number }> {
    return [
      { factor: 'Increase in AI-generated documents', impact: 0.8, probability: 0.7 },
      { factor: 'Economic pressure driving subscription fraud', impact: 0.6, probability: 0.5 },
      { factor: 'New deepfake technologies', impact: 0.9, probability: 0.3 }
    ];
  }

  private static generateRecommendations(
    alerts: Alert[],
    roiCalculations: ROICalculation[]
  ): Array<{ category: string; action: string; priority: 'low' | 'medium' | 'high' }> {
    const recommendations = [];
    
    // Analyze current performance and suggest improvements
    const falsePositiveRate = alerts.filter(a => a.qualification === 'false_positive').length / alerts.length;
    if (falsePositiveRate > 0.15) {
      recommendations.push({
        category: 'Detection Quality',
        action: 'Ajuster les seuils de détection pour réduire les faux positifs',
        priority: 'high' as const
      });
    }
    
    const avgROI = roiCalculations.reduce((sum, r) => sum + r.riskAdjustedROI, 0) / roiCalculations.length;
    if (avgROI < 200) {
      recommendations.push({
        category: 'ROI Optimization',
        action: 'Optimiser les coûts opérationnels pour améliorer le ROI',
        priority: 'medium' as const
      });
    }
    
    return recommendations;
  }
}