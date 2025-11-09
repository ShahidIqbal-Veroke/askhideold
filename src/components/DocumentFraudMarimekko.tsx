import React from 'react';
import { ResponsiveContainer } from 'recharts';

interface FraudData {
  type_fraude: string;
  nombre_cas: number;
  pourcentage: number;
  montant_moyen: number;
}

interface DocumentData {
  type_document: string;
  total_cas: number;
  fraudes: FraudData[];
}

interface DocumentFraudMarimekkoProps {
  data: DocumentData[];
  height?: number;
}

export const DocumentFraudMarimekko: React.FC<DocumentFraudMarimekkoProps> = ({ data, height = 400 }) => {
  // DEBUG: Log received data
  console.log('DocumentFraudMarimekko received data:', data);
  
  if (!data || data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
        Aucune donnée disponible
      </div>
    );
  }

  // Calculate total cases across all documents
  const totalCases = data.reduce((sum, doc) => sum + doc.total_cas, 0);

  if (totalCases === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
        Aucune fraude détectée sur la période sélectionnée
      </div>
    );
  }

  // Fraud type colors
  const fraudColors: Record<string, string> = {
    'Document falsifié': '#dc2626',      // red-600
    'Montant gonflé': '#f59e0b',        // amber-500
    'Sinistre fictif': '#3b82f6',       // blue-500
    'Usurpation identité': '#8b5cf6',   // violet-500
    'Autres': '#6b7280'                  // gray-500
  };

  // Document colors (lighter shades for contrast)
  const docColors: Record<string, string> = {
    'Carte Grise': '#fef3c7',            // amber-100
    'Permis de Conduire': '#dbeafe',     // blue-100
    'Relevé de Sinistre': '#fce7f3',     // pink-100
    'Photo Véhicule': '#e0e7ff',         // indigo-100
    'Autres Documents': '#f3f4f6'        // gray-100
  };

  // Prepare data with positions
  let cumulativeX = 0;
  const preparedData = data.map(doc => {
    const docWidth = (doc.total_cas / totalCases) * 100;
    const docX = cumulativeX;
    cumulativeX += docWidth;

    // Calculate stacked fraud types for this document
    let cumulativeY = 0;
    const fraudStacks = doc.fraudes.map(fraud => {
      const fraudHeight = fraud.pourcentage; // Already a percentage of this document
      const fraudY = cumulativeY;
      cumulativeY += fraudHeight;

      return {
        ...fraud,
        x: docX,
        y: 100 - cumulativeY, // Stack from bottom
        width: docWidth,
        height: fraudHeight,
        color: fraudColors[fraud.type_fraude] || fraudColors['Autres']
      };
    });

    return {
      ...doc,
      x: docX,
      width: docWidth,
      color: docColors[doc.type_document] || docColors['Autres Documents'],
      fraudStacks
    };
  });

  return (
    <div style={{ width: '100%', height: height + 100, position: 'relative' }}>
      <ResponsiveContainer width="100%" height={height}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ display: 'block' }}>
          {/* Background */}
          <rect width="100" height="100" fill="#f9fafb" />
          
          {/* Grid lines */}
          <g opacity="0.2">
            <line x1="0" y1="25" x2="100" y2="25" stroke="#999" strokeWidth="0.1" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="#999" strokeWidth="0.1" />
            <line x1="0" y1="75" x2="100" y2="75" stroke="#999" strokeWidth="0.1" />
          </g>

          {/* Document sections */}
          {preparedData.map((doc, docIndex) => (
            <g key={docIndex}>
              {/* Document background */}
              <rect
                x={doc.x}
                y={0}
                width={doc.width}
                height={100}
                fill={doc.color}
                stroke="white"
                strokeWidth="0.5"
              />

              {/* Document label if width permits */}
              {doc.width > 10 && (
                <text
                  x={doc.x + doc.width / 2}
                  y={5}
                  textAnchor="middle"
                  fontSize="2.5"
                  fill="#374151"
                  fontWeight="600"
                >
                  {doc.type_document}
                </text>
              )}

              {/* Fraud type stacks */}
              {doc.fraudStacks.map((fraud, fraudIndex) => (
                fraud.nombre_cas > 0 && (
                  <g key={fraudIndex}>
                    <rect
                      x={fraud.x}
                      y={fraud.y}
                      width={fraud.width}
                      height={fraud.height}
                      fill={fraud.color}
                      stroke="white"
                      strokeWidth="0.2"
                      opacity="0.9"
                    />
                    
                    {/* Fraud label if space permits */}
                    {fraud.height > 5 && doc.width > 15 && (
                      <text
                        x={fraud.x + fraud.width / 2}
                        y={fraud.y + fraud.height / 2}
                        textAnchor="middle"
                        fontSize="1.8"
                        fill="white"
                        fontWeight="500"
                      >
                        {fraud.pourcentage}%
                      </text>
                    )}
                    
                    {/* Tooltip */}
                    <title>
                      {doc.type_document} - {fraud.type_fraude}: {fraud.nombre_cas} cas ({fraud.pourcentage}%)
                    </title>
                  </g>
                )
              ))}

              {/* Document case count */}
              {doc.width > 8 && (
                <text
                  x={doc.x + doc.width / 2}
                  y={95}
                  textAnchor="middle"
                  fontSize="2"
                  fill="#374151"
                  fontWeight="500"
                >
                  {doc.total_cas} cas
                </text>
              )}
            </g>
          ))}

          {/* Y-axis labels */}
          <g>
            <text x="-2" y="100" textAnchor="end" fontSize="2" fill="#666">0%</text>
            <text x="-2" y="75" textAnchor="end" fontSize="2" fill="#666">25%</text>
            <text x="-2" y="50" textAnchor="end" fontSize="2" fill="#666">50%</text>
            <text x="-2" y="25" textAnchor="end" fontSize="2" fill="#666">75%</text>
            <text x="-2" y="0" textAnchor="end" fontSize="2" fill="#666">100%</text>
          </g>
        </svg>
      </ResponsiveContainer>

      {/* Legend */}
      <div style={{ 
        marginTop: 20,
        padding: '10px',
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '6px'
      }}>
        <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>
          Types de fraude:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {Object.entries(fraudColors).map(([type, color]) => (
            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: '12px',
                height: '12px',
                backgroundColor: color,
                borderRadius: '2px'
              }} />
              <span style={{ fontSize: '11px', color: '#4b5563' }}>{type}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Axes label */}
      <div style={{ 
        textAlign: 'center',
        fontSize: '14px',
        color: '#666',
        marginTop: '10px'
      }}>
        Volume par type de document (largeur) × Distribution des fraudes (hauteur)
      </div>
    </div>
  );
};

export default DocumentFraudMarimekko;