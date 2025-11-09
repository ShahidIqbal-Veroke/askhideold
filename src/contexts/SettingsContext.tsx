import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface DocumentComponent {
  id: string;
  label: string;
  checked: boolean;
}

export interface DocumentType {
  id: string;
  label: string;
  enabled: boolean;
  isOpen: boolean;
  components: DocumentComponent[];
}

export interface FraudThresholds {
  fraudThreshold: number;
  suspicionMin: number;
}

export interface AdvancedSettings {
  automaticAlerts: boolean;
  detailedLogs: boolean;
  developerMode: boolean;
}

export interface SettingsContextType {
  // Thresholds
  fraudThresholds: FraudThresholds;
  setFraudThresholds: (thresholds: FraudThresholds) => void;
  
  // Document types
  documentTypes: DocumentType[];
  setDocumentTypes: (types: DocumentType[]) => void;
  
  // Advanced settings
  advancedSettings: AdvancedSettings;
  setAdvancedSettings: (settings: AdvancedSettings) => void;
  
  // User profile
  userProfile: string;
  setUserProfile: (profile: string) => void;
  
  // Utility functions
  getFraudCategory: (score: number) => 'safe' | 'suspicious' | 'fraudulent';
  isDocumentTypeEnabled: (typeId: string) => boolean;
  getEnabledDocumentComponents: (typeId: string) => DocumentComponent[];
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEY = 'hedi-document-guardian-settings';

const defaultDocumentTypes: DocumentType[] = [
  {
    id: "carte-grise",
    label: "Carte grise",
    enabled: true,
    isOpen: false,
    components: [
      { id: "cg-proprietaire", label: "Nom du propriétaire", checked: true },
      { id: "cg-immatriculation", label: "Numéro d'immatriculation", checked: true },
      { id: "cg-marque", label: "Marque du véhicule", checked: true },
      { id: "cg-modele", label: "Modèle du véhicule", checked: true },
      { id: "cg-date-premiere-mise", label: "Date de première mise en circulation", checked: true },
      { id: "cg-numero-serie", label: "Numéro de série", checked: true },
      { id: "cg-puissance", label: "Puissance fiscale", checked: true },
      { id: "cg-energie", label: "Énergie/Carburant", checked: true },
    ]
  },
  {
    id: "permis-conduire",
    label: "Permis de conduire",
    enabled: true,
    isOpen: false,
    components: [
      { id: "pc-nom", label: "Nom", checked: true },
      { id: "pc-prenom", label: "Prénom", checked: true },
      { id: "pc-date-naissance", label: "Date de naissance", checked: true },
      { id: "pc-numero", label: "N° de permis", checked: true },
      { id: "pc-validite", label: "Validité du document", checked: true },
      { id: "pc-categorie", label: "Catégorie du permis", checked: true },
      { id: "pc-photo", label: "Photo", checked: true },
    ]
  },
  {
    id: "releve-information",
    label: "Relevé d'information",
    enabled: true,
    isOpen: false,
    components: [
      { id: "ri-historique", label: "Historique des sinistres", checked: true },
      { id: "ri-bonus-malus", label: "Bonus/malus", checked: true },
      { id: "ri-profil-risque", label: "Profil de risque de l'assuré", checked: true },
    ]
  },
  {
    id: "devis",
    label: "Devis",
    enabled: true,
    isOpen: false,
    components: [
      { id: "devis-date", label: "Date du devis", checked: true },
      { id: "devis-estimation", label: "Estimation des coûts de réparation", checked: true },
      { id: "devis-donnees-client", label: "Données client", checked: true },
    ]
  },
];

const defaultSettings = {
  fraudThresholds: {
    fraudThreshold: 85,
    suspicionMin: 50,
  },
  documentTypes: defaultDocumentTypes,
  advancedSettings: {
    automaticAlerts: true,
    detailedLogs: true,
    developerMode: false,
  },
  userProfile: "administrator",
};

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [fraudThresholds, setFraudThresholds] = useState<FraudThresholds>(defaultSettings.fraudThresholds);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>(defaultSettings.documentTypes);
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettings>(defaultSettings.advancedSettings);
  const [userProfile, setUserProfile] = useState<string>(defaultSettings.userProfile);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedSettings = JSON.parse(saved);
        
        // Migration: Update old "carte-identite" to "carte-grise"
        let documentTypes = parsedSettings.documentTypes || defaultSettings.documentTypes;
        documentTypes = documentTypes.map((docType: DocumentType) => {
          if (docType.id === "carte-identite") {
            return {
              ...docType,
              id: "carte-grise",
              label: "Carte grise",
              components: [
                { id: "cg-proprietaire", label: "Nom du propriétaire", checked: true },
                { id: "cg-immatriculation", label: "Numéro d'immatriculation", checked: true },
                { id: "cg-marque", label: "Marque du véhicule", checked: true },
                { id: "cg-modele", label: "Modèle du véhicule", checked: true },
                { id: "cg-date-premiere-mise", label: "Date de première mise en circulation", checked: true },
                { id: "cg-numero-serie", label: "Numéro de série", checked: true },
                { id: "cg-puissance", label: "Puissance fiscale", checked: true },
                { id: "cg-energie", label: "Énergie/Carburant", checked: true },
              ]
            };
          }
          return docType;
        });
        
        setFraudThresholds(parsedSettings.fraudThresholds || defaultSettings.fraudThresholds);
        setDocumentTypes(documentTypes);
        setAdvancedSettings(parsedSettings.advancedSettings || defaultSettings.advancedSettings);
        setUserProfile(parsedSettings.userProfile || defaultSettings.userProfile);
      }
    } catch (error) {
      console.warn('Failed to load settings from localStorage:', error);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      const settingsToSave = {
        fraudThresholds,
        documentTypes,
        advancedSettings,
        userProfile,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settingsToSave));
    } catch (error) {
      console.warn('Failed to save settings to localStorage:', error);
    }
  }, [fraudThresholds, documentTypes, advancedSettings, userProfile]);

  // Utility function to categorize fraud scores
  const getFraudCategory = (score: number): 'safe' | 'suspicious' | 'fraudulent' => {
    if (score >= fraudThresholds.fraudThreshold) {
      return 'fraudulent';
    } else if (score >= fraudThresholds.suspicionMin) {
      return 'suspicious';
    }
    return 'safe';
  };

  // Check if a document type is enabled
  const isDocumentTypeEnabled = (typeId: string): boolean => {
    const docType = documentTypes.find(type => type.id === typeId);
    return docType?.enabled || false;
  };

  // Get enabled components for a document type
  const getEnabledDocumentComponents = (typeId: string): DocumentComponent[] => {
    const docType = documentTypes.find(type => type.id === typeId);
    if (!docType || !docType.enabled) return [];
    return docType.components.filter(component => component.checked);
  };

  const value: SettingsContextType = {
    fraudThresholds,
    setFraudThresholds,
    documentTypes,
    setDocumentTypes,
    advancedSettings,
    setAdvancedSettings,
    userProfile,
    setUserProfile,
    getFraudCategory,
    isDocumentTypeEnabled,
    getEnabledDocumentComponents,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};