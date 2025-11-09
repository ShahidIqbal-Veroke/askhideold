import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

// PDF skeleton loader component
const PDFSkeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="bg-white/60 rounded-2xl shadow-lg" style={{ width: 400, height: 500 }}>
      <div className="p-6 space-y-4">
        <div className="h-4 bg-gray-300/50 rounded w-3/4"></div>
        <div className="h-4 bg-gray-300/50 rounded w-1/2"></div>
        <div className="h-4 bg-gray-300/50 rounded w-2/3"></div>
        <div className="space-y-2 mt-8">
          <div className="h-3 bg-gray-300/50 rounded"></div>
          <div className="h-3 bg-gray-300/50 rounded"></div>
          <div className="h-3 bg-gray-300/50 rounded w-5/6"></div>
        </div>
      </div>
    </div>
    <div className="text-center mt-3">
      <div className="inline-flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
        <span className="text-sm text-gray-600">Chargement du PDF...</span>
      </div>
    </div>
  </div>
);

interface PDFViewerProps {
  file: string;
  className?: string;
}

export const PDFViewer = ({ file, className = "" }: PDFViewerProps) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber] = useState<number>(1); // Always show first page
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  function onDocumentLoadError(error: Error) {
    console.error('PDF load error:', error);
    setError('Erreur lors du chargement du PDF');
    setLoading(false);
  }

  if (loading) {
    return <PDFSkeleton className={className} />;
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-center">
          <p className="text-sm text-red-600 mb-2">{error}</p>
          <p className="text-xs text-gray-500">Impossible d'afficher le PDF</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <Document
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={<PDFSkeleton className={className} />}
        options={{
          cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
          cMapPacked: true,
          standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/',
        }}
      >
        <Page
          pageNumber={pageNumber}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          className="shadow-lg rounded-2xl overflow-hidden"
          width={400}
          loading={<PDFSkeleton className={className} />}
          error={
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center" style={{ width: 400, height: 300 }}>
              <p className="text-red-600 text-sm">Erreur de rendu</p>
            </div>
          }
        />
      </Document>
      {numPages > 1 && (
        <p className="text-xs text-gray-500 mt-2">
          Page 1 sur {numPages}
        </p>
      )}
    </div>
  );
};