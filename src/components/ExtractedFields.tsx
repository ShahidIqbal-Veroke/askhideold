import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Hash, Calendar, DollarSign, User, MapPin, Phone, Mail, Building, Car, IdCard, Tag } from "lucide-react";

interface ExtractedFieldsProps {
  extractedFields: Record<string, unknown>;
  className?: string;
}

export const ExtractedFields = ({ extractedFields, className = "" }: ExtractedFieldsProps) => {
  // If no fields, don't render anything
  if (!extractedFields || Object.keys(extractedFields).length === 0) {
    return null;
  }

  // Helper function to get appropriate icon for field type
  const getFieldIcon = (key: string, value: unknown) => {
    const keyLower = key.toLowerCase();
    
    // Automotive specific fields
    if (keyLower === 'vin') {
      return <IdCard className="w-4 h-4 text-indigo-600" />;
    }
    if (keyLower.includes('registration') || keyLower.includes('immatriculation')) {
      return <Car className="w-4 h-4 text-blue-600" />;
    }
    if (keyLower.includes('marque') || keyLower.includes('brand') || keyLower.includes('make')) {
      return <Tag className="w-4 h-4 text-purple-600" />;
    }
    if (keyLower.includes('owner') || keyLower.includes('proprietaire')) {
      return <User className="w-4 h-4 text-orange-600" />;
    }
    
    // General fields
    if (keyLower.includes('amount') || keyLower.includes('price') || keyLower.includes('total')) {
      return <DollarSign className="w-4 h-4 text-green-600" />;
    }
    if (keyLower.includes('date') || keyLower.includes('time')) {
      return <Calendar className="w-4 h-4 text-blue-600" />;
    }
    if (keyLower.includes('number') || keyLower.includes('id') || keyLower.includes('ref')) {
      return <Hash className="w-4 h-4 text-purple-600" />;
    }
    if (keyLower.includes('name') || keyLower.includes('person') || keyLower.includes('client')) {
      return <User className="w-4 h-4 text-orange-600" />;
    }
    if (keyLower.includes('address') || keyLower.includes('location') || keyLower.includes('city')) {
      return <MapPin className="w-4 h-4 text-red-600" />;
    }
    if (keyLower.includes('phone') || keyLower.includes('tel')) {
      return <Phone className="w-4 h-4 text-indigo-600" />;
    }
    if (keyLower.includes('email') || keyLower.includes('mail')) {
      return <Mail className="w-4 h-4 text-cyan-600" />;
    }
    if (keyLower.includes('company') || keyLower.includes('organization') || keyLower.includes('vendor')) {
      return <Building className="w-4 h-4 text-gray-600" />;
    }
    
    return <FileText className="w-4 h-4 text-slate-500" />;
  };

  // Helper function to format field values
  const formatValue = (value: unknown, key?: string): string => {
    if (value === null || value === undefined) {
      return 'N/A';
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Oui' : 'Non';
    }
    
    let stringValue = String(value);
    
    // Clean up common OCR issues
    if (key?.toLowerCase().includes('name') || key?.toLowerCase().includes('owner')) {
      // Clean up name formatting issues
      stringValue = stringValue
        .replace(/\n+/g, ' ')  // Replace newlines with spaces
        .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
        .trim();
    }
    
    if (key?.toLowerCase() === 'vin') {
      // Format VIN properly
      stringValue = stringValue.replace(/\s+/g, '').toUpperCase();
    }
    
    if (key?.toLowerCase().includes('registration') || key?.toLowerCase().includes('immatriculation')) {
      // Format registration number
      stringValue = stringValue.replace(/\s+/g, '').toUpperCase();
    }
    
    return stringValue;
  };

  // Helper function to get field confidence/reliability indicator
  const getFieldConfidence = (key: string, value: unknown) => {
    // This would typically come from the API, but we can infer based on value quality
    const valueStr = String(value);
    
    if (!value || valueStr.trim() === '' || valueStr === 'N/A') {
      return 'low';
    }
    
    // Simple heuristics for confidence
    if (valueStr.length > 50 || valueStr.includes('?') || valueStr.includes('unclear')) {
      return 'medium';
    }
    
    return 'high';
  };

  // Helper function to format field names
  const formatFieldName = (key: string): string => {
    // Handle specific automotive terms
    const translations: Record<string, string> = {
      'vin': 'Numéro VIN',
      'registration': 'Immatriculation',
      'marque': 'Marque du véhicule',
      'owner_name': 'Nom du propriétaire',
      'license_plate': 'Plaque d\'immatriculation',
      'vehicle_type': 'Type de véhicule',
      'model': 'Modèle',
      'year': 'Année',
      'color': 'Couleur',
      'engine_number': 'Numéro de moteur'
    };
    
    const lowerKey = key.toLowerCase();
    if (translations[lowerKey]) {
      return translations[lowerKey];
    }
    
    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <span>Champs Extraits</span>
          <Badge variant="secondary" className="ml-2">
            {Object.keys(extractedFields).length} champs
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(extractedFields).map(([key, value]) => {
            const confidence = getFieldConfidence(key, value);
            const formattedValue = formatValue(value, key);
            
            return (
              <div
                key={key}
                className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getFieldIcon(key, value)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-medium text-slate-900">
                      {formatFieldName(key)}
                    </h4>
                    <Badge 
                      variant={
                        confidence === 'high' ? 'default' : 
                        confidence === 'medium' ? 'secondary' : 'outline'
                      }
                      className={`text-xs ${
                        confidence === 'high' ? 'bg-green-100 text-green-700' :
                        confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}
                    >
                      {confidence === 'high' ? 'Confiant' : 
                       confidence === 'medium' ? 'Moyen' : 'Faible'}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-slate-700">
                    {typeof value === 'object' ? (
                      <pre className="whitespace-pre-wrap font-mono text-xs bg-white p-2 rounded border max-h-32 overflow-y-auto">
                        {formattedValue}
                      </pre>
                    ) : key.toLowerCase() === 'vin' || key.toLowerCase().includes('registration') ? (
                      <span className="font-mono text-sm font-medium bg-slate-100 px-2 py-1 rounded">
                        {formattedValue}
                      </span>
                    ) : (
                      <span className="break-words">{formattedValue}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {Object.keys(extractedFields).length === 0 && (
          <div className="text-center py-6 text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Aucun champ extrait disponible</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};