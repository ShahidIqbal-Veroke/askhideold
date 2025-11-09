
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, File, X, AlertTriangle, CheckCircle, Clock } from "lucide-react";
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
      setSelectedFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5 text-blue-600" />
            <span>Upload Document</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Zone */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? "border-blue-500 bg-blue-50" 
                : selectedFile 
                  ? "border-green-500 bg-green-50" 
                  : "border-slate-300 hover:border-slate-400"
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
              accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
            />
            
            {selectedFile ? (
              <div className="space-y-2">
                <File className="w-12 h-12 text-green-600 mx-auto" />
                <p className="text-green-700 font-medium">{selectedFile.name}</p>
                <p className="text-sm text-green-600">
                  {(selectedFile.size / 1024 / 1024).toFixed(1)} Mo • Prêt pour analyse
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <File className="w-12 h-12 text-slate-400 mx-auto" />
                <p className="text-slate-700 font-medium">
                  Glissez-déposez vos documents ici
                </p>
                <p className="text-sm text-slate-500">
                  ou cliquez pour parcourir
                </p>
                <p className="text-xs text-slate-400">
                  JPG, PNG, PDF • Max 10 Mo
                </p>
              </div>
            )}
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
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button 
              onClick={handleAnalyze} 
              disabled={!selectedFile || isAnalyzing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isAnalyzing ? "Analyse en cours..." : "Analyser"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
