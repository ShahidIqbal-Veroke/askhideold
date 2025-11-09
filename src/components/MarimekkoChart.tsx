import React from 'react';
import { ResponsiveContainer } from 'recharts';

interface MarimekkoData {
  type_fraude: string;
  nombre_cas: number;
  pourcentage: number;
  montant_moyen: number;
}

interface MarimekkoChartProps {
  data: MarimekkoData[];
  height?: number;
}

export const MarimekkoChart: React.FC<MarimekkoChartProps> = ({ data, height = 300 }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
        Aucune donnée disponible
      </div>
    );
  }

  // Calculate totals and proportions
  const totalCases = data.reduce((sum, item) => sum + item.nombre_cas, 0);
  
  // If all values are 0, show a message
  if (totalCases === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
        Aucune fraude détectée sur la période sélectionnée
      </div>
    );
  }
  
  // Prepare data with cumulative positions
  let cumulativeX = 0;
  const preparedData = data.map((item) => {
    const widthPercent = (item.nombre_cas / totalCases) * 100;
    const startX = cumulativeX;
    cumulativeX += widthPercent;
    
    // Height represents the average amount relative to max
    const maxAmount = Math.max(...data.map(d => d.montant_moyen));
    const heightPercent = (item.montant_moyen / maxAmount) * 100;
    
    return {
      ...item,
      x: startX,
      width: widthPercent,
      y: 100 - heightPercent, // Invert for bottom alignment
      height: heightPercent,
      color: getColorForFraudType(item.type_fraude)
    };
  });

  return (
    <div style={{ width: '100%', height: height, position: 'relative' }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ display: 'block' }}>
        {/* Background */}
        <rect width="100" height="100" fill="#f9fafb" />
        
        {/* Grid lines for better readability */}
        <g opacity="0.2">
          <line x1="0" y1="25" x2="100" y2="25" stroke="#999" strokeWidth="0.1" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="#999" strokeWidth="0.1" />
          <line x1="0" y1="75" x2="100" y2="75" stroke="#999" strokeWidth="0.1" />
        </g>
        
        {/* Marimekko rectangles */}
        {preparedData.map((item, index) => (
          <g key={index}>
            {/* Main rectangle */}
            <rect
              x={item.x}
              y={item.y}
              width={item.width}
              height={item.height}
              fill={item.color}
              stroke="white"
              strokeWidth="0.3"
              opacity="0.85"
              className="transition-opacity hover:opacity-100"
            />
            
            
            {/* Labels */}
            {item.width > 15 && (
              <g>
                <text
                  x={item.x + item.width / 2}
                  y={item.y + item.height / 2}
                  textAnchor="middle"
                  fontSize="3"
                  fill="white"
                  fontWeight="bold"
                  style={{ pointerEvents: 'none' }}
                >
                  {item.type_fraude}
                </text>
                <text
                  x={item.x + item.width / 2}
                  y={item.y + item.height / 2 + 3}
                  textAnchor="middle"
                  fontSize="2"
                  fill="white"
                  style={{ pointerEvents: 'none' }}
                >
                  {item.pourcentage}%
                </text>
              </g>
            )}
            
            {/* Small segments */}
            {item.width <= 15 && item.width > 5 && (
              <text
                x={item.x + item.width / 2}
                y={item.y + item.height / 2}
                textAnchor="middle"
                fontSize="2"
                fill="white"
                fontWeight="bold"
                style={{ pointerEvents: 'none' }}
              >
                {item.pourcentage}%
              </text>
            )}
            
            {/* Tooltip for all */}
            <title>{`${item.type_fraude}: ${item.nombre_cas} cas (${item.pourcentage}%), ${item.montant_moyen.toLocaleString()}€ moyen`}</title>
          </g>
        ))}
        
      </svg>
      
      {/* Axes labels outside SVG */}
      <div style={{ 
        position: 'absolute', 
        bottom: -30, 
        left: 0, 
        right: 0, 
        textAlign: 'center',
        fontSize: '14px',
        color: '#666'
      }}>
        Volume des cas (largeur) × Montant moyen (hauteur)
      </div>
    </div>
  );
};

// Helper function to assign colors to fraud types
function getColorForFraudType(type: string): string {
  const colorMap: Record<string, string> = {
    'Document falsifié': '#ef4444',      // red-500
    'Montant gonflé': '#f59e0b',        // amber-500
    'Sinistre fictif': '#3b82f6',       // blue-500
    'Usurpation identité': '#8b5cf6',   // violet-500
    'Autres': '#6b7280'                  // gray-500
  };
  
  return colorMap[type] || '#6b7280';
}

export default MarimekkoChart;