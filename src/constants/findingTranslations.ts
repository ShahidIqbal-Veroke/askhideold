export interface FindingTranslation {
  title: string;
  explanation: string;
  impact: string;
}

export const FINDING_TRANSLATIONS: Record<string, FindingTranslation> = {
  // Forensics findings
  ELA_HIGH: {
    title: "Image manipulation détectée",
    explanation: "Des zones de l'image semblent avoir été modifiées ou retouchées après la création originale du document.",
    impact: "Le document pourrait contenir des informations falsifiées."
  },
  NOISE_RESIDUALS: {
    title: "Traces de modification suspectes",
    explanation: "L'analyse a détecté des anomalies dans la structure de l'image qui suggèrent une manipulation.",
    impact: "Des éléments du document pourraient avoir été altérés."
  },
  JPEG_GHOSTS: {
    title: "Document réédité plusieurs fois",
    explanation: "Le document a été sauvegardé plusieurs fois, ce qui peut indiquer des modifications successives.",
    impact: "Des modifications ont pu être apportées entre les différentes versions."
  },
  COPY_MOVE: {
    title: "Éléments copiés dans le document",
    explanation: "Certaines parties du document ont été dupliquées d'un endroit à un autre (copier-coller).",
    impact: "Des informations ont été artificiellement ajoutées ou modifiées."
  },
  AI_GENERATED: {
    title: "Document créé par intelligence artificielle",
    explanation: "Ce document semble avoir été généré automatiquement par un système d'IA plutôt que créé naturellement.",
    impact: "Le document n'est probablement pas authentique."
  },
  DIGITAL_PRINT_DETECTED: {
    title: "Document imprimé puis numérisé",
    explanation: "Le document a été imprimé puis re-scanné, ce qui peut masquer des modifications.",
    impact: "La traçabilité numérique du document est rompue."
  },
  FONT_INCONSISTENCY: {
    title: "Polices de caractères incohérentes",
    explanation: "Différentes polices sont utilisées de manière inhabituelle, suggérant des ajouts ou modifications.",
    impact: "Du texte a probablement été ajouté ou modifié après création."
  },
  HIDDEN_TEXT_DETECTED: {
    title: "Texte caché dans le document",
    explanation: "Le document contient du texte invisible qui pourrait être utilisé pour tromper les systèmes automatiques.",
    impact: "Le document pourrait ne pas être ce qu'il semble être."
  },
  METADATA_TAMPERED: {
    title: "Informations techniques modifiées",
    explanation: "Les données techniques du fichier (date de création, logiciel utilisé) ont été altérées.",
    impact: "L'origine et l'historique du document sont suspects."
  },
  
  // NLP findings
  ARITH_ERROR: {
    title: "Erreurs de calcul détectées",
    explanation: "Les montants, totaux ou calculs dans le document contiennent des erreurs mathématiques.",
    impact: "Les informations financières du document sont incorrectes."
  },
  DATE_INCONSISTENT: {
    title: "Dates incohérentes",
    explanation: "Les dates mentionnées dans le document ne sont pas logiques (ex: date future, chronologie impossible).",
    impact: "Le document contient des informations temporelles incorrectes."
  },
  TEMPLATE_MISMATCH: {
    title: "Format non conforme",
    explanation: "Le document ne respecte pas le format standard attendu pour ce type de document.",
    impact: "Le document pourrait être une contrefaçon."
  },
  FIELD_MISSING: {
    title: "Informations obligatoires manquantes",
    explanation: "Des champs requis pour ce type de document sont absents.",
    impact: "Le document est incomplet et potentiellement non valide."
  },
  TEXT_AI_GENERATED: {
    title: "Texte généré automatiquement",
    explanation: "Le contenu textuel semble avoir été créé par une IA plutôt que rédigé naturellement.",
    impact: "Le contenu du document n'est probablement pas authentique."
  },
  LANGUAGE_INCOHERENT: {
    title: "Incohérences linguistiques",
    explanation: "Le style d'écriture, la grammaire ou le vocabulaire sont incohérents dans le document.",
    impact: "Le document pourrait avoir été assemblé à partir de sources différentes."
  },
  
  // Crosscheck findings
  IBAN_INVALID: {
    title: "Numéro de compte bancaire invalide",
    explanation: "L'IBAN (numéro de compte international) ne respecte pas les règles de validation bancaire.",
    impact: "Les coordonnées bancaires sont fausses ou erronées."
  },
  SIRET_INVALID: {
    title: "Numéro d'entreprise invalide",
    explanation: "Le numéro SIRET de l'entreprise ne correspond pas au format officiel français.",
    impact: "L'entreprise mentionnée pourrait ne pas exister."
  },
  VIN_INVALID: {
    title: "Numéro de châssis invalide",
    explanation: "Le numéro d'identification du véhicule (VIN) ne respecte pas les standards internationaux.",
    impact: "Les informations du véhicule sont incorrectes ou falsifiées."
  },
  VIN_CHECK_DIGIT_FAIL: {
    title: "🔍 Anomalie détectée dans le numéro de châssis",
    explanation: "Le chiffre de contrôle du VIN est incorrect. Chaque VIN possède un chiffre de vérification calculé selon une formule précise pour détecter les erreurs.",
    impact: "Le document nécessite une vérification approfondie car le VIN semble avoir été modifié ou mal retranscrit."
  },
  VIN_CHECK_DIGIT_INVALID: {
    title: "🔍 Anomalie détectée dans le numéro de châssis",
    explanation: "Le chiffre de contrôle du VIN est incorrect. Chaque VIN possède un chiffre de vérification calculé selon une formule précise pour détecter les erreurs.",
    impact: "Le document nécessite une vérification approfondie car le VIN semble avoir été modifié ou mal retranscrit."
  },
  VIN_FORBIDDEN_CHARS: {
    title: "🔍 Caractères interdits dans le numéro de châssis",
    explanation: "Le VIN contient des lettres interdites (I, O ou Q). Ces lettres sont exclues du standard international pour éviter la confusion avec les chiffres 1 et 0.",
    impact: "Le document nécessite une vérification approfondie car le VIN ne respecte pas les normes internationales."
  },
  VIN_CONTAINS_FORBIDDEN_CHARS: {
    title: "🔍 Caractères interdits dans le numéro de châssis",
    explanation: "Le VIN contient des lettres interdites (I, O ou Q). Ces lettres sont exclues du standard international pour éviter la confusion avec les chiffres 1 et 0.",
    impact: "Le document nécessite une vérification approfondie car le VIN ne respecte pas les normes internationales."
  },
  VIN_PATTERN_INVALID: {
    title: "Format de numéro de châssis incorrect",
    explanation: "Le numéro d'identification du véhicule ne suit pas le format standard de 17 caractères.",
    impact: "Les informations du véhicule sont suspectes."
  },
  PLATE_INVALID: {
    title: "Plaque d'immatriculation invalide",
    explanation: "Le format de la plaque d'immatriculation ne correspond pas aux standards officiels.",
    impact: "Le véhicule mentionné pourrait ne pas exister."
  },
  PLATE_INCOMPLETE_DATA: {
    title: "Données de plaque incomplètes",
    explanation: "Les informations de la plaque d'immatriculation sont partiellement manquantes ou illisibles.",
    impact: "L'identification complète du véhicule n'est pas possible."
  },
  MRZ_INVALID: {
    title: "Zone de lecture automatique invalide",
    explanation: "Les codes de vérification du document d'identité sont incorrects.",
    impact: "Le document d'identité est probablement falsifié."
  },
  COMPANY_INACTIVE: {
    title: "Entreprise inactive ou inexistante",
    explanation: "L'entreprise mentionnée n'est pas active dans les registres officiels.",
    impact: "Le document provient d'une source non fiable."
  },
  REGISTRY_MISMATCH: {
    title: "Informations non conformes aux registres",
    explanation: "Les données du document ne correspondent pas aux informations officielles.",
    impact: "Le document contient des informations erronées."
  },
  
  // Deduplication findings
  EXACT_DUPLICATE: {
    title: "Document déjà soumis",
    explanation: "Ce document exact a déjà été analysé précédemment.",
    impact: "Tentative possible de fraude par réutilisation."
  },
  NEAR_DUPLICATE: {
    title: "Document très similaire détecté",
    explanation: "Un document presque identique a déjà été soumis, avec de légères modifications.",
    impact: "Possible tentative de contourner la détection."
  },
  REUSE_PATTERN: {
    title: "Schéma de réutilisation détecté",
    explanation: "Ce document suit un modèle déjà vu dans plusieurs soumissions suspectes.",
    impact: "Fait potentiellement partie d'une tentative de fraude organisée."
  },
  FRAUD_NETWORK: {
    title: "Lié à un réseau de fraude connu",
    explanation: "Ce document partage des caractéristiques avec d'autres documents frauduleux connus.",
    impact: "Forte probabilité de fraude."
  },
  ONLINE_TEMPLATE_DETECTED: {
    title: "Modèle frauduleux détecté",
    explanation: "Le document correspond à un modèle de fraude disponible en ligne.",
    impact: "Document probablement créé à partir d'un modèle frauduleux."
  },
  ONLINE_DUPLICATE_FOUND: {
    title: "Document trouvé sur internet",
    explanation: "Ce document ou un très similaire est disponible publiquement en ligne.",
    impact: "Le document n'est pas unique et pourrait être réutilisé."
  },
  
  // Screenshot findings
  SCREENSHOT_UI_DETECTED: {
    title: "Capture d'écran détectée",
    explanation: "Le document est une capture d'écran contenant des éléments d'interface (boutons, menus, etc).",
    impact: "Le document n'est pas un original."
  },
  BROWSER_FRAME: {
    title: "Capture depuis navigateur web",
    explanation: "Le document a été capturé depuis un navigateur internet.",
    impact: "Le document pourrait provenir d'une source non officielle."
  },
  STATUS_BAR: {
    title: "Éléments d'écran détectés",
    explanation: "Des éléments d'interface mobile ou desktop sont visibles (barre d'état, notifications).",
    impact: "Le document n'est pas un fichier original."
  },
  DESKTOP_ARTIFACTS: {
    title: "Traces de capture d'écran",
    explanation: "Le document contient des éléments typiques d'une capture d'écran.",
    impact: "L'authenticité du document est compromise."
  },
  RECOMPRESSION_DEPTH: {
    title: "Document fortement dégradé",
    explanation: "Le document a été compressé et recompressé plusieurs fois, dégradant sa qualité.",
    impact: "Des manipulations ont pu être masquées par la dégradation."
  },
  
  // OCR-related findings
  OCR_SUSPICIOUS_PATTERN: {
    title: "Motifs suspects détectés dans le texte",
    explanation: "Le texte extrait présente des caractéristiques inhabituelles qui suggèrent une manipulation.",
    impact: "Le contenu textuel du document pourrait avoir été modifié."
  },
  OCR_HIGH_NOISE: {
    title: "Qualité de texte dégradée",
    explanation: "Le document contient beaucoup de bruit ou d'artéfacts qui rendent la lecture difficile.",
    impact: "La fiabilité du contenu extrait est compromise."
  }
};

// Fallback function for codes not in the translation table
export function getTranslationForCode(code: string): FindingTranslation {
  // Check if we have a direct translation
  if (FINDING_TRANSLATIONS[code]) {
    return FINDING_TRANSLATIONS[code];
  }
  
  // Try to find a partial match (e.g., VIN_SOMETHING matches VIN_INVALID)
  const baseCode = code.split('_')[0];
  const relatedKey = Object.keys(FINDING_TRANSLATIONS).find(key => key.startsWith(baseCode));
  
  if (relatedKey) {
    return FINDING_TRANSLATIONS[relatedKey];
  }
  
  // Default translation for unknown codes
  return {
    title: "Anomalie détectée",
    explanation: `Une anomalie de type ${code} a été détectée dans le document.`,
    impact: "Le document nécessite une vérification approfondie."
  };
}