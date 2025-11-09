import { ApiClient } from './apiClient';

// Enhanced API Response Interfaces
export interface EnhancedAnalysisResponse {
  success: boolean;
  version: string;
  data: EnhancedAnalysisData;
}

export interface EnhancedAnalysisData {
  doc_id: string;
  request_id: string;
  document_classification: DocumentClassification;
  decision: DecisionResult;
  risk_analysis: RiskAnalysis;
  explanation: ExplanationData;
  agents_detail: Record<string, AgentDetail>;
  processing: ProcessingInfo;
  assets: AssetsData;
  statistics: StatisticsData;
}

export interface DocumentClassification {
  format: string;
  family: string;
  subtype: string;
  confidence: number;
  screenshot_indicators: string[];
}

export interface DecisionResult {
  result: "accept" | "reject" | "review";
  risk_score: number;
  confidence: number;
  thresholds: {
    accept_below: number;
    reject_above: number;
  };
}

export interface RiskAnalysis {
  buckets: RiskBucket[];
  top_risk_factors: string[];
  key_findings: KeyFinding[];
}

export interface RiskBucket {
  name: string;
  score: number;
  weight: number;
  description: string;
}

export interface KeyFinding {
  code: string;
  level: "info" | "warn" | "fail";
  message: string;
  confidence: number;
  details: Record<string, unknown>;
}

export interface ExplanationData {
  reasoning: string;
  llm_used: boolean;
  method: "llm" | "rule_based";
}

export interface AgentDetail {
  scores: Record<string, number>;
  findings_count: number;
  processing_time: number;
  error: string | null;
}

export interface ProcessingInfo {
  total_time: number;
  stage_times: Record<string, number>;
  pipeline_version: string;
}

export interface AssetsData {
  heatmaps: string[];
  extracted_fields: Record<string, unknown>;
}

export interface StatisticsData {
  total_findings: number;
  critical_findings: number;
  agents_run: number;
}

// Legacy interface for backward compatibility
export interface FraudAnalysisResult {
  request_id: string;
  document_id: string;
  timestamp: string;
  decision: "accept" | "reject" | "review";
  risk_score: number;
  confidence: number;
  risk_buckets: RiskBucket[];
  key_findings: KeyFinding[];
  document_info: DocumentInfo;
  agent_status: AgentStatus[];
  processing_time: number;
  ai_reasoning: string;
  heatmap_urls: string[];
  
  // Top-level extracted fields
  extracted_data?: Record<string, unknown>;
  extracted_fields?: Record<string, unknown>;
  
  // AI detection results
  ai_detection?: {
    prediction: number;
    confidence: number;
    binary_label: string;
    method: string;
    status: string;
    source: string;
    findings_count: number;
    details: {
      forensics_score: number;
      category: string;
      evidence: string[];
      finding_level: string;
      finding_message: string;
    };
  };
}

export interface DocumentInfo {
  type: string;
  country: string;
  version: string;
  format: string;
  page_side: string;
  business_family: string;
  is_digital_print: boolean;
  digital_print_confidence: number;
  digital_print_indicators: string[];
  
  // Vehicle/Document specific fields
  vin?: string;
  registration_number?: string;
  registration?: string;  // Alternative field name
  license_plate?: string;
  marque?: string;  // Vehicle brand/make
  owner_name?: string;  // Document owner name
  
  // Location data
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
  
  // Extracted content
  extracted_text?: string;  // JSON string of all extracted fields
  ocr_results?: Record<string, unknown>;
  
  // Allow any additional extracted fields
  [key: string]: unknown;
}

export interface AgentStatus {
  agent: string;
  success: boolean;
  processing_time: number;
  findings_count: number;
  scores_count: number;
  error: string | null;
}

export class FraudDetectionService {
  static async analyzeDocument(file: File): Promise<FraudAnalysisResult> {
    // Check if this is our specific test file
    if (file.name === "C1802837 2-1.pdf") {
      console.log("🧪 Generating fake analysis result for test file:", file.name);
      // Add 20 second delay to simulate real analysis processing
      await new Promise(resolve => setTimeout(resolve, 20000));
      return this.getFakeAnalysisForC1802837();
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await ApiClient.post('/analyze', formData);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("API response:", result);
      return result as FraudAnalysisResult;
    } catch (error) {
      console.error('Fraud detection analysis error:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Une erreur s\'est produite lors de l\'analyse du document'
      );
    }
  }

  // Generate fake analysis result for C1802837 2-1.pdf with 20% risk score
  private static getFakeAnalysisForC1802837(): FraudAnalysisResult {
    return {
      "request_id": "fake-c1802837-request",
      "document_id": "doc_c1802837_test",
      "timestamp": new Date().toISOString(),
      "decision": "review",
      "risk_score": 0.20, // 20% risk score as requested
      "confidence": 0.82,
      "risk_buckets": [
        {
          name: "Document Integrity",
          score: 15,
          weight: 0.3,
          description: "Vérification de l'intégrité physique du document"
        },
        {
          name: "Data Consistency", 
          score: 25,
          weight: 0.4,
          description: "Cohérence des données extraites"
        },
        {
          name: "Visual Analysis",
          score: 18,
          weight: 0.3,
          description: "Analyse des aspects visuels et forensiques"
        }
      ],
      "key_findings": [
        {
          "code": "OCR_HIGH_NOISE",
          "level": "warn",
          "message": "Le document contient beaucoup de bruit ou d'artéfacts qui rendent la lecture difficile",
          "confidence": 0.78,
          "details": {
            "noise_level": "moderate",
            "affected_regions": ["header", "signature_area"]
          }
        }
      ],
      "document_info": {
        "type": "CARTE_GRISE",
        "country": "FR", 
        "version": "V3_SIV",
        "format": "PDF_SCAN",
        "page_side": "RECTO",
        "business_family": "VEHICLE",
        "is_digital_print": true,
        "digital_print_confidence": 0.68,
        "digital_print_indicators": ["scan_quality", "compression_artifacts"],
        "registration_number": "C1802837",
        "vin": "VF1234567890ABCDE",
        "marque": "PEUGEOT",
        "owner_name": "MARTIN BERNARD"
      },
      "agent_status": [
        {
          agent: "document_classifier",
          success: true,
          processing_time: 1.2,
          findings_count: 1,
          scores_count: 3,
          error: null
        },
        {
          agent: "forensic_analyzer", 
          success: true,
          processing_time: 8.7,
          findings_count: 2,
          scores_count: 5,
          error: null
        }
      ],
      "processing_time": 12.4,
      "ai_reasoning": "Document présente quelques anomalies mineures. Score de risque modéré de 20% principalement dû à des incohérences temporelles et des indices de copie numérique. Recommandation de révision manuelle pour validation finale.",
      "heatmap_urls": [
        "/fake_c1802837_edge_analysis.png",
        "/fake_c1802837_noise_analysis.png", 
        "/fake_c1802837_jpeg_blocks.png",
        "/fake_c1802837_ela_compression.png"
      ],
      "extracted_fields": {
        "vin": "VF1234567890ABCDE",
        "registration": "C1802837", 
        "marque": "PEUGEOT",
        "owner_name": "MARTIN BERNARD",
        "owner_address": "15 RUE DE LA PAIX, 75001 PARIS",
        "power": "5 CV",
        "fuel_type": "ESSENCE"
      },
      "ai_detection": {
        "prediction": 0,
        "confidence": 0.82,
        "binary_label": "Human-Generated",
        "method": "ensemble_analysis",
        "status": "human_generated",
        "source": "enhanced_orchestrator",
        "findings_count": 3,
        "details": {
          "forensics_score": 0.20,
          "category": "low_risk",
          "evidence": ["minor_temporal_inconsistency", "digital_print_detected"],
          "finding_level": "warn",
          "finding_message": "Document authentique avec quelques anomalies mineures"
        }
      }
    };
  }

  static async testConnection(): Promise<boolean> {
    try {
      const response = await ApiClient.get('/health');
      return response.ok;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}