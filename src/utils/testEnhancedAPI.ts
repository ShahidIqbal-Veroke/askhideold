import { EnhancedAnalysisResponse } from '../services/fraudDetectionService';

// Mock enhanced API response for testing
export const mockEnhancedResponse: EnhancedAnalysisResponse = {
  success: true,
  version: "enhanced_v2",
  data: {
    doc_id: "test_doc_123",
    request_id: "req_456",
    
    document_classification: {
      format: "pdf",
      family: "invoice",
      subtype: "commercial_invoice",
      confidence: 0.95,
      screenshot_indicators: ["digital_print", "uniform_background"]
    },
    
    decision: {
      result: "review",
      risk_score: 0.75,
      confidence: 0.88,
      thresholds: {
        accept_below: 0.3,
        reject_above: 0.8
      }
    },
    
    risk_analysis: {
      buckets: [
        {
          name: "Document Quality",
          score: 0.6,
          weight: 0.3,
          description: "Assessment of document image quality and clarity"
        },
        {
          name: "Content Authenticity",
          score: 0.8,
          weight: 0.4,
          description: "Verification of document content authenticity"
        },
        {
          name: "Digital Print Detection", 
          score: 0.9,
          weight: 0.3,
          description: "Detection of digital printing vs original document"
        }
      ],
      top_risk_factors: ["digital_print_detected", "inconsistent_fonts", "suspicious_modifications"],
      key_findings: [
        {
          code: "DIGITAL_PRINT_DETECTED",
          level: "warn",
          message: "Document appears to be digitally printed rather than original",
          confidence: 0.87,
          details: {
            indicators: ["uniform_background", "consistent_fonts", "pixel_patterns"],
            analysis_method: "computer_vision"
          }
        },
        {
          code: "SUSPICIOUS_MODIFICATIONS",
          level: "fail", 
          message: "Potential alterations detected in document content",
          confidence: 0.94,
          details: {
            regions: ["text_field_1", "signature_area"],
            modification_type: "content_overlay"
          }
        },
        {
          code: "OCR_CONFIDENCE_LOW",
          level: "info",
          message: "Text extraction confidence below optimal threshold",
          confidence: 0.68,
          details: {
            extracted_confidence: 0.68,
            threshold: 0.75,
            problematic_regions: ["header", "footer"]
          }
        }
      ]
    },
    
    explanation: {
      reasoning: "The document shows signs of digital printing based on uniform background patterns and consistent font rendering. Additionally, suspicious modifications were detected in critical areas including text fields and signature regions. While the document structure appears valid, these indicators suggest potential fraud.",
      llm_used: true,
      method: "llm"
    },
    
    agents_detail: {
      ocr_agent: {
        scores: { "text_quality": 0.68, "extraction_confidence": 0.72 },
        findings_count: 2,
        processing_time: 1250,
        error: null
      },
      vision_agent: {
        scores: { "image_quality": 0.85, "authenticity": 0.6 },
        findings_count: 3,
        processing_time: 2100,
        error: null
      },
      content_agent: {
        scores: { "content_integrity": 0.4, "modification_detection": 0.9 },
        findings_count: 1,
        processing_time: 890,
        error: null
      }
    },
    
    processing: {
      total_time: 4500,
      stage_times: {
        "preprocessing": 200,
        "ocr": 1250,
        "vision_analysis": 2100,
        "content_analysis": 890,
        "fusion": 60
      },
      pipeline_version: "enhanced_v2"
    },
    
    assets: {
      heatmaps: [
        "/heatmaps/test_doc_123_overview.png",
        "/heatmaps/test_doc_123_modifications.png",
        "/heatmaps/test_doc_123_text_analysis.png"
      ],
      extracted_fields: {
        "invoice_number": "INV-2024-001",
        "total_amount": "1250.00",
        "currency": "EUR",
        "date": "2024-09-15",
        "vendor_name": "Test Company Ltd"
      }
    },
    
    statistics: {
      total_findings: 3,
      critical_findings: 1,
      agents_run: 3
    }
  }
};

// Test function to validate the enhanced API structure
export function testEnhancedAPIStructure(): boolean {
  try {
    const response = mockEnhancedResponse;
    
    // Validate required fields
    const requiredFields = [
      'success', 'version', 'data.doc_id', 'data.request_id',
      'data.document_classification', 'data.decision', 'data.risk_analysis',
      'data.explanation', 'data.agents_detail', 'data.processing', 
      'data.assets', 'data.statistics'
    ];
    
    for (const field of requiredFields) {
      const fieldPath = field.split('.');
      let current: any = response;
      
      for (const key of fieldPath) {
        if (!(key in current)) {
          console.error(`Missing required field: ${field}`);
          return false;
        }
        current = current[key];
      }
    }
    
    console.log('✅ Enhanced API structure validation passed');
    console.log('📊 Mock data summary:', {
      decision: response.data.decision.result,
      risk_score: (response.data.decision.risk_score * 100).toFixed(1) + '%',
      findings: response.data.statistics.total_findings,
      agents: response.data.statistics.agents_run,
      processing_time: response.data.processing.total_time + 'ms'
    });
    
    return true;
  } catch (error) {
    console.error('❌ Enhanced API structure validation failed:', error);
    return false;
  }
}