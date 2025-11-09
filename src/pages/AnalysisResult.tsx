import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useEventDriven } from "@/hooks/useEventDriven";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@clerk/clerk-react";
import { useSettings } from "@/contexts/SettingsContext";
import { ApiClient } from "@/services/apiClient";
import { getTranslationForCode } from "@/constants/findingTranslations";
import { detectTampering, type TamperingDetectionResult } from "@/services/gradioTamperingService";

import {
  ArrowLeft,
  AlertTriangle,
  Info,
  Download,
  Bell,
  ExternalLink
} from "lucide-react";
import { FraudAnalysisResult } from "@/services/fraudDetectionService";

// Circle Progress Component for Risk Score
function CircleProgress({ value = 95, size = 140, fraudThreshold, suspicionMin }: { 
  value?: number; 
  size?: number;
  fraudThreshold: number;
  suspicionMin: number;
}) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (value / 100) * circumference;
  
  // Dynamic color based on configurable thresholds  
  const color = value >= fraudThreshold ? "#dc2626" : value >= suspicionMin ? "#ea580c" : "#059669";
  
  return (
    <svg 
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`} 
      role="img" 
      aria-label={`Score ${value}%`}
    >
      <circle 
        cx={cx} 
        cy={cy} 
        r={radius} 
        stroke="#e5e7eb" 
        strokeWidth={stroke} 
        fill="none" 
      />
      <circle 
        cx={cx} 
        cy={cy} 
        r={radius} 
        stroke={color} 
        strokeWidth={stroke} 
        fill="none" 
        strokeLinecap="round" 
        strokeDasharray={`${dash} ${circumference}`} 
        transform={`rotate(-90 ${cx} ${cy})`} 
      />
      <text 
        x="50%" 
        y="50%" 
        dominantBaseline="middle" 
        textAnchor="middle" 
        className="font-bold" 
        fontSize={size > 100 ? 28 : 22} 
        fill={color}
      >
        {value}%
      </text>
    </svg>
  );
}


const AnalysisResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUser();
  const { fraudThresholds } = useSettings();
  const result = location.state?.result as FraudAnalysisResult;
  const file = location.state?.file as File;
  const fileName = location.state?.fileName as string;
  const fileType = location.state?.fileType as string;
  const eventId = location.state?.eventId as string;
  const preCalculatedTampering = location.state?.tamperingResult as TamperingDetectionResult | undefined;

  const [documentUrl, setDocumentUrl] = useState<string>("");
  const [eventProcessed, setEventProcessed] = useState(false);
  const [isDocumentInfoExpanded, setIsDocumentInfoExpanded] = useState(false);
  const [createdAlertId, setCreatedAlertId] = useState<string | null>(null);
  const [showAlertBanner, setShowAlertBanner] = useState(false);
  const [tamperingResult, setTamperingResult] = useState<TamperingDetectionResult | null>(preCalculatedTampering || null);
  const [isLoadingTampering, setIsLoadingTampering] = useState(false);
  const [tamperingError, setTamperingError] = useState<string | null>(null);

  // EVENT-DRIVEN: Use the event-driven hook
  const { processEventWorkflow } = useEventDriven();

  // Calculate decision based on risk score and configurable settings
  const calculateDecision = (riskScore: number | undefined): "accept" | "reject" | "review" => {
    if (typeof riskScore !== 'number' || isNaN(riskScore)) {
      return 'review';
    }

    const scorePercent = riskScore * 100;

    if (scorePercent < fraudThresholds.suspicionMin) return 'accept';
    if (scorePercent >= fraudThresholds.fraudThreshold) return 'reject';
    return 'review';
  };

  // Override the API decision with our calculated decision
  const calculatedDecision = result ? calculateDecision(result.risk_score) : 'review';

  // Log received data
  useEffect(() => {
    console.log('📄 AnalysisResult page loaded with:', {
      hasResult: !!result,
      hasEventId: !!eventId,
      eventId,
      fileName,
      decision: result?.decision,
      riskScore: result?.risk_score
    });
  }, [result, eventId, fileName]);

  // EVENT-DRIVEN: Process document upload event
  useEffect(() => {
    const processDocumentEvent = async () => {
      // Skip if already processed (eventId passed from UploadModal)
      if (result && !eventProcessed && fileName && !eventId) {
        console.log('⚠️ No eventId provided, creating new event (this should not happen normally)');
        try {
          const eventData = {
            id: result.document_id,
            type: fileType || 'document',
            fileName: fileName,
            documentType: result.document_info?.type || 'unknown',
            sinisterNumber: result.document_info?.registration_number,
            analysisResult: result,
            uploadedBy: user?.id || 'anonymous-user',
            assureId: result.document_info?.insured_id
          };

          const processingResult = await processEventWorkflow(eventData, {
            analyzeForFraud: true,
            autoProcess: true
          });

          setEventProcessed(true);

          if (processingResult.alerts_generated.length > 0) {
            const alertId = processingResult.alerts_generated[0];
            setCreatedAlertId(alertId);
            setShowAlertBanner(true);
            
            // Show toast notification with alert icon
            toast({
              title: "🚨 Alert Created",
              description: calculatedDecision === 'reject'
                ? `Document rejected - Alert ${alertId} created for investigation`
                : `Document to review - Alert ${alertId} created for verification`,
              className: calculatedDecision === 'reject' ? "border-red-500" : "border-orange-500"
            });
          } else {
            toast({
              title: "Analysis Completed",
              description: "Document accepted - No alert needed",
            });
          }
        } catch (error) {
          console.error('Failed to process document event:', error);
          toast({
            title: "Error",
            description: "Unable to process event",
            variant: "destructive"
          });
        }
      }
    };

    processDocumentEvent();
  }, [result, eventProcessed, fileName, fileType, eventId, toast, user?.id, processEventWorkflow]);
  
  // If eventId is provided from UploadModal, check for alerts
  useEffect(() => {
    const checkForAlerts = async () => {
      if (eventId && !eventProcessed) {
        console.log('🔍 Checking for alerts for event:', eventId);
        try {
          const { db } = await import('@/lib/localStorage');
          const alerts = db.getAll('alerts');
          console.log('📋 Total alerts in localStorage:', alerts.length);
          const eventAlerts = alerts.filter((a: any) => a.event_id === eventId);
          console.log(`🔍 Found ${eventAlerts.length} alerts for event ${eventId}`);
          
          if (eventAlerts.length > 0) {
            const latestAlert = eventAlerts[eventAlerts.length - 1];
            setCreatedAlertId(latestAlert.id);
            setShowAlertBanner(true);
            setEventProcessed(true);
            
            toast({
              title: "🚨 Alert Created",
              description: calculatedDecision === 'reject'
                ? `Document rejected - Alert ${latestAlert.id} created for investigation`
                : `Document to review - Alert ${latestAlert.id} created for verification`,
              className: calculatedDecision === 'reject' ? "border-red-500" : "border-orange-500"
            });
          } else {
            setEventProcessed(true);
          }
        } catch (error) {
          console.error('Error checking for alerts:', error);
        }
      }
    };
    
    checkForAlerts();
  }, [eventId, eventProcessed, calculatedDecision, toast]);

  // Handle document URL
  useEffect(() => {
    if (file && file instanceof File) {
      try {
        const url = URL.createObjectURL(file);
        setDocumentUrl(url);
        return () => URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error creating blob URL:", error);
        setDocumentUrl("https://via.placeholder.com/900x600/f8fafc/64748b?text=Document+Error");
      }
    } else if (result && result.document_id) {
      const apiUrl = `${import.meta.env.VITE_API_PROTOCOL || 'http'}://localhost:8000/documents/${result.document_id}/original`;
      setDocumentUrl(apiUrl);
    } else {
      setDocumentUrl("https://via.placeholder.com/900x600/f8fafc/64748b?text=Document+Not+Available");
    }
  }, [file, result]);

  // Call Gradio API for tampering detection (only if not pre-calculated)
  useEffect(() => {
    const detectDocumentTampering = async () => {
      // Skip if we already have pre-calculated results from UploadModal
      if (preCalculatedTampering) {
        console.log('✅ Using pre-calculated tampering result from upload');
        return;
      }

      if (!file || !(file instanceof File)) {
        console.log('⚠️ No file available for tampering detection');
        return;
      }

      console.log('🔍 Starting fallback tampering detection with Gradio API...');
      setIsLoadingTampering(true);
      setTamperingError(null);

      try {
        const result = await detectTampering(file, 90);
        console.log('✅ Tampering detection completed:', result);
        setTamperingResult(result);
      } catch (error) {
        console.error('❌ Tampering detection failed:', error);
        const errorMsg = error instanceof Error ? error.message : 'Failed to detect tampering';
        setTamperingError(errorMsg);

        // Show toast with error details for debugging
        toast({
          title: "Tampering detection failed",
          description: errorMsg,
          variant: "destructive"
        });
      } finally {
        setIsLoadingTampering(false);
      }
    };

    detectDocumentTampering();
  }, [file, toast, preCalculatedTampering]);

  // Demo mode handling
  if (!result) {
    const exampleResult: FraudAnalysisResult = {
      "request_id": "5c8263dd-8ad5-4f24-ad01-2f2b2363b53f",
      "document_id": "doc_1759220223674",
      "timestamp": "2025-09-30T08:17:58.011945",
      "decision": "reject",
      "risk_score": 0.925,
      "confidence": 0.7,
      "risk_buckets": [],
      "key_findings": [
        {
          "code": "VIN_FORBIDDEN_CHARS",
          "level": "fail",
          "message": "VIN contains forbidden ISO characters: {'I'}",
          "confidence": 1,
          "details": {}
        },
        {
          "code": "METADATA_TAMPERED",
          "level": "fail",
          "message": "metadata_anomaly",
          "confidence": 1,
          "details": {}
        },
        {
          "code": "TEXT_AI_GENERATED",
          "level": "fail",
          "message": "High probability AI-generated text: 85.0%",
          "confidence": 0.92,
          "details": {}
        },
        {
          "code": "DIGITAL_PRINT_DETECTED",
          "level": "warn",
          "message": "Document appears to be a printed and scanned copy",
          "confidence": 0.85,
          "details": {}
        },
        {
          "code": "DATE_INCONSISTENT",
          "level": "warn",
          "message": "Document dates are inconsistent with timeline",
          "confidence": 0.78,
          "details": {}
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
        "digital_print_confidence": 0.95,
        "digital_print_indicators": ["photo_of_paper", "shadows", "lighting"]
      },
      "agent_status": [],
      "processing_time": 54.336936235427856,
      "ai_reasoning": "The document presents several critical findings, including VIN anomalies, altered metadata, and potentially AI-generated content.",
      "extracted_fields": {
        "vin": "VFSIV2009ASIV2009",
        "registration": "AB-123-CD",
        "marque": "MARQUES",
        "owner_name": "EXEMPLE DEMO"
      },
      "ai_detection": {
        "prediction": 1,
        "confidence": 0.95,
        "binary_label": "AI-Generated",
        "method": "orchestrator_analysis",
        "status": "ai_detected",
        "source": "enhanced_orchestrator",
        "findings_count": 3,
        "details": {
          "forensics_score": 0.95,
          "category": "ai_generated",
          "evidence": ["VIN check digit validation failed"],
          "finding_level": "fail",
          "finding_message": "VIN check digit validation failed"
        }
      },
      "heatmap_urls": [
        "/689ba253b3c5f95c0f741c25_forensic_summary.png",
        "/68078663803a9cbdee451447_edge_analysis.png",
        "/68078663803a9cbdee451447_ela_compression.png",
        "/68078663803a9cbdee451447_jpeg_blocks.png"
      ]
    };

    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <div>
                <h2 className="text-lg font-semibold">Demonstration Mode</h2>
                <p className="text-gray-600">No real analysis results. Here is a sample API response.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </button>
              <button
                onClick={() => {
                  navigate(location.pathname, {
                    state: {
                      result: exampleResult,
                      fileName: "document_exemple.pdf",
                      fileType: "application/pdf"
                    },
                    replace: true
                  });
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
              >
                View Full Example
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getDecisionInfo = (decision: string) => {
    switch (decision) {
      case "accept":
        return { 
          label: "Accepted", 
          color: "text-green-600", 
          bgColor: "bg-green-50",
          icon: "✓"
        };
      case "reject":
        return { 
          label: "Rejected", 
          color: "text-red-600", 
          bgColor: "bg-red-50",
          icon: "✕"
        };
      case "review":
        return { 
          label: "To Review", 
          color: "text-orange-600", 
          bgColor: "bg-orange-50",
          icon: "⚠"
        };
      default:
        return { 
          label: decision, 
          color: "text-gray-600", 
          bgColor: "bg-gray-50",
          icon: "?"
        };
    }
  };

  const decisionInfo = getDecisionInfo(calculatedDecision);
  const riskScore = Math.round((result.risk_score || 0) * 100);


  return (
    <div className="min-h-screen bg-white">
      {/* Decision Band */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 text-[13.5px]/6 text-white bg-red-600 hover:bg-red-700 inline-flex items-center gap-2 rounded-lg shadow-sm transition-all">
                Confirm Fraud
              </button>
              <button className="px-3 py-2 text-[13.5px]/6 text-slate-700 bg-slate-200 hover:bg-slate-300 inline-flex items-center gap-2 rounded-lg shadow-sm transition-all">
                False Positive
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 text-[13.5px]/6 text-slate-700 hover:bg-slate-50 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg shadow-sm hover:bg-white/30 transition-all">
              <Download className="h-4 w-4"/>
              Export Report
            </button>
            <button 
              onClick={() => navigate(-1)}
              className="px-3 py-2 text-[13.5px]/6 text-slate-600 hover:text-slate-900 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg shadow-sm hover:bg-white/30 transition-all"
            >
              <ArrowLeft className="h-4 w-4"/>
              Back
            </button>
            <button className="px-3 py-2 text-[13.5px]/6 text-slate-600 hover:text-slate-900 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg shadow-sm hover:bg-white/30 transition-all">
              <Info className="h-4 w-4"/>
              Help
            </button>
          </div>
        </div>
      </div>

      {/* Alert Banner for Rejected/Review Documents */}
      {showAlertBanner && createdAlertId && (calculatedDecision === 'reject' || calculatedDecision === 'review') && (
        <div className={`${calculatedDecision === 'reject' ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'} border-b`}>
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${calculatedDecision === 'reject' ? 'bg-red-100' : 'bg-orange-100'}`}>
                  <Bell className={`h-5 w-5 ${calculatedDecision === 'reject' ? 'text-red-600' : 'text-orange-600'}`} />
                </div>
                <div>
                  <h3 className={`text-[14px]/5 font-medium ${calculatedDecision === 'reject' ? 'text-red-900' : 'text-orange-900'}`}>
                    {calculatedDecision === 'reject' ? '🚨 Alert Created - Document Rejected' : '⚠️ Alert Created - Document To Review'}
                  </h3>
                  <p className={`text-[12px]/4 ${calculatedDecision === 'reject' ? 'text-red-700' : 'text-orange-700'}`}>
                    An alert was automatically created for this suspicious document. ID: {createdAlertId}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/alerts?highlight=${createdAlertId}`)}
                  className={`px-3 py-1.5 text-[12px]/5 font-medium rounded-lg inline-flex items-center gap-2 ${
                    calculatedDecision === 'reject' 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-orange-600 text-white hover:bg-orange-700'
                  } transition-colors`}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View Alert
                </button>
                <button
                  onClick={() => setShowAlertBanner(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Info Bar */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h3 className="text-[13px]/5 font-medium text-slate-700">Document Information</h3>
              <button 
                onClick={() => setIsDocumentInfoExpanded(!isDocumentInfoExpanded)}
                className="text-slate-500 hover:text-slate-700"
              >
                {isDocumentInfoExpanded ? '▼' : '▶'}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-6 gap-6 text-sm">
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Type</p>
              <p className="font-medium text-gray-700 text-xs">{result.document_info.type}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Country</p>
              <p className="font-medium text-gray-700 text-xs">{result.document_info.country}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Format</p>
              <p className="font-medium text-gray-700 text-xs">{result.document_info.format}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Family</p>
              <p className="font-medium text-gray-700 text-xs">{result.document_info.business_family}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Digital Print</p>
              <p className={`font-medium text-xs ${result.document_info.is_digital_print ? 'text-orange-600' : 'text-green-600'}`}>
                {result.document_info.is_digital_print ? 'Detected' : 'Not detected'}
              </p>
            </div>
            {/* AI Detection */}
            {result.ai_detection && (
              <div className="space-y-1">
                <p className="text-xs text-gray-500">AI Detection</p>
                <p className={`font-medium text-xs ${result.ai_detection.prediction === 1 ? 'text-red-600' : 'text-green-900'}`}>
                  {result.ai_detection.binary_label || 'Not detected'}
                </p>
                <p className="text-xs text-gray-400">
                  {(result.ai_detection.confidence * 100).toFixed(0)}%
                </p>
              </div>
            )}
          </div>

          {/* Expanded content - extracted fields */}
          {isDocumentInfoExpanded && (result.extracted_fields && Object.keys(result.extracted_fields).length > 0) && (
            <div className="mt-4 pt-4 border-t border-gray-200/30 animate-in slide-in-from-top-2 duration-300">
              <div className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">
                Extracted Fields
              </div>
              <div className="grid grid-cols-3 gap-6">
                {Object.entries(result.extracted_fields).filter(([key]) => key !== '_metadata').map(([key, value]) => {
                  const formatFieldName = (fieldKey: string): string => {
                    const translations: Record<string, string> = {
                      'vin': 'VIN',
                      'registration': 'Registration',
                      'marque': 'Brand',
                      'owner_name': 'Owner',
                      'owner_address': 'Address',
                      'power': 'Power',
                      'fuel_type': 'Fuel Type'
                    };
                    return translations[fieldKey] || fieldKey.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
                  };

                  const formatValue = (val: unknown): string => {
                    if (Array.isArray(val)) {
                      return val.join(', ');
                    }
                    return String(val);
                  };

                  return (
                    <div key={key} className="space-y-1">
                      <p className="text-xs text-gray-500">{formatFieldName(key)}</p>
                      <p className="text-xs text-gray-700 font-mono bg-gray-100/50 px-3 py-2 rounded border">
                        {formatValue(value)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 12-Column Grid Layout */}
      <div className="max-w-7xl mx-auto px-6 py-5 grid grid-cols-12 gap-6">
        {/* LEFT: Score + Anomalies (5 cols) */}
        <div className="col-span-12 lg:col-span-5 space-y-4">
          {/* Risk Score Section */}
          <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-4">
              <CircleProgress 
                value={riskScore} 
                size={120} 
                fraudThreshold={fraudThresholds.fraudThreshold}
                suspicionMin={fraudThresholds.suspicionMin}
              />
              <div className="flex-1">
                <h2 className="text-[15px]/6 font-semibold text-gray-900 mb-1">
                  {riskScore >= fraudThresholds.fraudThreshold ? "High risk" : riskScore >= fraudThresholds.suspicionMin ? "Moderate risk" : "Low risk"}
                </h2>
                <p className="text-[13.5px]/6 text-slate-700">
                  Decision based on threshold: <span className={`font-medium ${decisionInfo.color}`}>{decisionInfo.label}</span>
                </p>

                {/* Alert indicator for rejected/review decisions */}
                {(calculatedDecision === 'reject' || calculatedDecision === 'review') && (
                  <div className={`mt-2 flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                    calculatedDecision === 'reject' ? 'bg-red-100' : 'bg-orange-100'
                  }`}>
                    <Bell className={`h-4 w-4 ${
                      calculatedDecision === 'reject' ? 'text-red-600' : 'text-orange-600'
                    }`} />
                    <span className={`text-[12px]/5 font-medium ${
                      calculatedDecision === 'reject' ? 'text-red-700' : 'text-orange-700'
                    }`}>
                      Automatic alert created
                    </span>
                  </div>
                )}

                <p className="text-[13.5px]/6 text-slate-700 mt-2">
                  {result.ai_reasoning || "Analysis based on HEDI detection criteria."}
                </p>
              </div>
            </div>
          </section>

          {/* Anomalies Section */}
          <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
            <h3 className="text-[14px]/6 font-medium text-gray-900 mb-3">
              Identified Anomalies
            </h3>
            {result.key_findings && result.key_findings.length > 0 ? (
              <div className="space-y-3">
                {result.key_findings.map((finding, index) => {
                  const translation = getTranslationForCode(finding.code);
                  const levelIcon = finding.level === 'fail' ? '🔴' : finding.level === 'warn' ? '🟠' : '🟡';
                  const levelColor = finding.level === 'fail' ? 'border-red-200 bg-red-50' : finding.level === 'warn' ? 'border-orange-200 bg-orange-50' : 'border-yellow-200 bg-yellow-50';
                  
                  return (
                    <div key={index} className={`rounded-lg border p-4 ${levelColor}`}>
                      <div className="flex items-start gap-2">
                        <span className="text-sm mt-0.5">{levelIcon}</span>
                        <div className="flex-1">
                          <h4 className="text-[14px]/6 font-semibold text-gray-900 mb-1">
                            {translation.title}
                          </h4>
                          <p className="text-[13px]/5 text-gray-700 mb-2">
                            {translation.explanation}
                          </p>
                          <p className="text-[12px]/5 text-gray-600">
                            <span className="font-medium">Impact:</span> {translation.impact}
                          </p>
                          {finding.confidence && (
                            <p className="text-[11px]/4 text-gray-500 mt-1">
                              Confidence: {Math.round(finding.confidence * 100)}%
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500">
                <span className="text-[13.5px]/6">No critical anomalies detected</span>
              </div>
            )}
          </section>
        </div>

        {/* RIGHT: Tampering Detection (7 cols) */}
        <div className="col-span-12 lg:col-span-7 bg-white rounded-lg shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px]/6 font-semibold text-gray-900">
              Tampering Detection (AI)
            </h2>
            {isLoadingTampering && (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-[12px]/5">Analysis in progress...</span>
              </div>
            )}
          </div>

          {/* Tampering Detection Image */}
          <div className="rounded-lg overflow-hidden bg-slate-100 mb-3">
            {isLoadingTampering ? (
              <div className="w-full aspect-[3/2] flex items-center justify-center bg-slate-50">
                <div className="text-center space-y-3">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-slate-600 text-sm">Tampering detection in progress...</p>
                </div>
              </div>
            ) : tamperingResult ? (
              <img
                src={tamperingResult.tamperingImageUrl}
                alt="Tampering Detection Result"
                className="w-full h-auto"
              />
            ) : tamperingError ? (
              <div className="w-full aspect-[3/2] flex items-center justify-center bg-orange-50">
                <div className="text-center space-y-3 p-6 max-w-md">
                  <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto" />
                  <p className="text-orange-900 font-medium">Tampering detection error</p>
                  <p className="text-orange-700 text-sm">{tamperingError}</p>
                  <p className="text-orange-600 text-xs">
                    HEDI fraud analysis remains available and complete.
                  </p>
                </div>
              </div>
            ) : (
              <img
                src={documentUrl || "https://via.placeholder.com/900x600/f8fafc/64748b?text=Document+Original"}
                alt="Document Original"
                className="w-full h-auto"
              />
            )}
          </div>
          


          {/* Tampering Detection Explanation */}
          {tamperingResult && !isLoadingTampering && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-[13px]/5 font-semibold text-blue-900 mb-2">AI Tampering Analysis</h4>
              <p className="text-[12px]/5 text-blue-800 mb-2">
                This analysis uses an advanced AI model to detect altered areas of the document.
              </p>
              <p className="text-[11px]/4 text-blue-700">
                <span className="font-medium">To observe:</span> Colored zones indicate potentially modified or altered regions of the document.
              </p>
            </div>
          )}

          {/* Empty State - no file */}
          {!file && !isLoadingTampering && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
              <p className="text-[13.5px]/6 text-blue-800">
                No document available for tampering analysis.
              </p>
            </div>
          )}



        </div>
      </div>

    </div>
  );
};

export default AnalysisResult;