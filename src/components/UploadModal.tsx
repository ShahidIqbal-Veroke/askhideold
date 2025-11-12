
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { File, X, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FraudDetectionService, type FraudAnalysisResult } from "@/services/fraudDetectionService";
import { detectTampering, type TamperingDetectionResult } from "@/services/gradioTamperingService";
import { useUser } from "@clerk/clerk-react";
import { useEvents } from "@/contexts/EventContext";

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  date: string;
}


const recentUploads: UploadedFile[] = [];

export function UploadModal({ open, onOpenChange }: UploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState<string>("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useUser();
  const { uploadDocumentEvent } = useEvents();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "File size must be 5MB or less",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  }, [toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "File size must be 5MB or less",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setAnalysisStage("Initialisation...");

    try {
      setAnalysisStage("Analyse en cours (HEDI + Tampering)...");

      // Call both APIs in parallel for faster results
      const [analysisData, tamperingResult] = await Promise.allSettled([
        FraudDetectionService.analyzeDocument(selectedFile),
        detectTampering(selectedFile, 90)
      ]);

      // Handle HEDI analysis result
      if (analysisData.status === 'rejected') {
        throw new Error('HEDI analysis failed: ' + analysisData.reason);
      }
      const fraudAnalysis = analysisData.value;

      // Handle Gradio tampering result (non-blocking if it fails)
      let tamperingData: TamperingDetectionResult | null = null;
      if (tamperingResult.status === 'fulfilled') {
        tamperingData = tamperingResult.value;
        console.log('✅ Tampering detection completed in parallel');
      } else {
        // Gradio failed - log the error but continue
        console.warn('⚠️ Tampering detection failed:', tamperingResult.reason);
        console.log('📊 Continuing with fraud analysis only');
        // Don't block the upload - tampering is optional
      }

      setAnalysisStage("Création de l'événement et traitement...");

      // Create document data for the event
      const documentData = {
        id: fraudAnalysis.document_id || `DOC-${Date.now()}`,
        type: getDocumentTypeFromFile(selectedFile),
        fileName: selectedFile.name,
        documentType: fraudAnalysis.document_info?.type || getDocumentTypeFromFile(selectedFile),
        sinisterNumber: fraudAnalysis.document_info?.registration_number,
        policyNumber: fraudAnalysis.document_info?.policy_number,
        amount: fraudAnalysis.document_info?.amount,
        uploadedBy: user?.id || 'anonymous',
        analysisResult: fraudAnalysis,
        assureId: fraudAnalysis.document_info?.insured_id // May be undefined
      };

      // Use EventContext to handle the complete workflow
      // This will automatically:
      // 1. Create an event
      // 2. Create history entry
      // 3. Create alert if needed (reject/review)
      // 4. Save everything to localStorage via contexts
      console.log('🚀 Uploading document with data:', documentData);
      const processingResult = await uploadDocumentEvent(documentData);
      console.log('📊 Processing result:', processingResult);
      console.log('✅ Alerts created:', processingResult.alerts_generated);
      
      // Show appropriate toast based on results
      if (processingResult.alerts_generated.length > 0) {
        toast({
          title: "Analyse terminée",
          description: `Décision: ${fraudAnalysis.decision} | Score de risque: ${(fraudAnalysis.risk_score * 100).toFixed(1)}% | ${processingResult.alerts_generated.length} alerte(s) créée(s)`,
          variant: fraudAnalysis.decision === 'reject' ? 'destructive' : 'default'
        });
      } else {
        toast({
          title: "Analyse terminée",
          description: `Décision: ${fraudAnalysis.decision} | Score de risque: ${(fraudAnalysis.risk_score * 100).toFixed(1)}%`,
        });
      }

      setAnalysisStage("Analyse terminée, redirection...");

      // Close modal and navigate to results page
      onOpenChange(false);
      navigate("/analysis-result", {
        state: {
          result: fraudAnalysis,
          file: selectedFile,
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          eventId: processingResult.event_id,
          tamperingResult: tamperingData // Pass pre-calculated tampering result
        }
      });
      
    } catch (error) {
      console.error("Erreur lors de l'analyse:", error);
      const errorMessage = error instanceof Error ? error.message : "Une erreur s'est produite lors de l'analyse du document.";
      
      toast({
        title: "Erreur d'analyse",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setAnalysisStage("");
    }
  };
  
  // Helper function to determine document type from file
  const getDocumentTypeFromFile = (file: File): string => {
    const fileName = file.name.toLowerCase();
    
    if (fileName.includes('carte_grise') || fileName.includes('registration')) {
      return 'CARTE_GRISE';
    } else if (fileName.includes('permis') || fileName.includes('license')) {
      return 'PERMIS_CONDUIRE';
    } else if (fileName.includes('facture') || fileName.includes('invoice')) {
      return 'FACTURE';
    } else if (fileName.includes('contrat') || fileName.includes('contract')) {
      return 'CONTRAT';
    } else if (fileName.includes('rib') || fileName.includes('bank')) {
      return 'RIB';
    } else if (fileName.includes('identite') || fileName.includes('id')) {
      return 'CARTE_IDENTITE';
    }
    
    // Determine by file extension
    if (file.type.includes('pdf')) {
      return 'DOCUMENT_PDF';
    } else if (file.type.includes('image')) {
      return 'PHOTO_DOCUMENT';
    }
    
    return 'DOCUMENT_AUTRE';
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedFile(null);
    setDragActive(false);
    setAnalysisStage("");
  };

  const handleNewAnalysis = () => {
    setSelectedFile(null);
    setAnalysisStage("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl rounded-3xl shadow-2xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold text-black text-center">
            Upload Your Document
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Zone */}
          <div
            className={`relative border-2 border-dashed rounded-3xl p-8 transition-all ${
              dragActive 
                ? "border-blue-500 bg-blue-50" 
                : selectedFile 
                  ? "border-green-500 bg-green-50" 
                  : "border-slate-300 hover:border-slate-400 hover:bg-slate-100"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileSelect}
              accept=".jpg,.jpeg,.png,.pdf,.docx,image/jpeg,image/png,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            />
            
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2 justify-center flex-1 min-w-0">
                {selectedFile ? (
                  <>
                    <div className="flex-shrink-0">
                      <File className="w-12 h-12 text-green-600" />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-green-700 font-semibold text-base truncate">{selectedFile.name}</p>
                      <p className="text-sm text-green-600 mt-1">
                        {(selectedFile.size / 1024 / 1024).toFixed(1)} MB • Ready for analysis
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-shrink-0">
                      <img src="/icons/gallery.svg" alt="Gallery" className="w-12 h-12" />
                    </div>
                    <div className="text-xs">
                      <p className="text-slate-800 font-semibold text-base mb-2">
                        Drag and drop your Files
                      </p>
                      <p className="text-sm text-slate-600 mb-1">
                        File formats are DOCX, PNG, JPG, PDF
                      </p>
                      <p className="text-sm text-slate-600">
                        File size: 5MB max
                      </p>
                    </div>
                  </>
                )}
              </div>
              
              {!selectedFile && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    document.getElementById('file-upload')?.click();
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-5 py-2.5 rounded-3xl font-medium flex-shrink-0 shadow-md hover:shadow-lg transition-all"
                >
                  <img src="/icons/document-upload.svg" alt="Upload" className="w-5 h-5" />
                  <span>Upload Documents</span>
                </Button>
              )}
            </div>
          </div>

          {/* Analysis Progress */}
          {isAnalyzing && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-8 h-8 border-2 border-transparent border-t-blue-400 rounded-full animate-spin animation-delay-150"></div>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-700">{analysisStage}</div>
                  <div className="text-xs text-slate-500 mt-1">Analyse des propriétés forensiques...</div>
                </div>
              </div>
              
              {/* Animated progress bar */}
              <div className="relative">
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-pulse relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                      style={{ width: '75%' }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50 animate-pulse"></div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Classification</span>
                  <span>Forensique</span>
                  <span>Validation</span>
                </div>
              </div>

              {/* Processing steps animation */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center space-x-1 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Classification</span>
                </div>
                <div className="flex items-center space-x-1 text-blue-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <span>Analyse forensique</span>
                </div>
                <div className="flex items-center space-x-1 text-slate-400">
                  <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                  <span>Validation</span>
                </div>
              </div>
            </div>
          )}

          {/* Recent Uploads */}

          {/* Actions */}
          <div className="flex justify-center gap-3 pt-2">
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="border-2 border-blue-600 text-blue-600 bg-white hover:bg-blue-50 px-8 py-2.5 font-medium rounded-xl transition-all min-w-[160px]"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAnalyze} 
              disabled={!selectedFile || isAnalyzing}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 font-medium rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px]"
            >
              {isAnalyzing ? "Analyse en cours..." : "Analyse"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
