/**
 * Service pour extraire les informations d'une photo d'ordonnance
 * Utilise une API d'OCR/IA (Google Vision, AWS Textract, ou autre)
 */

/**
 * Interface pour une ordonnance
 */
export interface Ordonnance {
  id: string;
  userid: string;
  name: string;
  dosage: string;
  instructions: string;
  startDate?: string;
  duration: string;
  times: string;
  dayOfWeek: string;
  createdAt: string;
  updatedAt: string;
}


export async function extractOrdonnanceData(
  imageUri: string
): Promise<Ordonnance[]> {
  try {
    // Placeholder pour la démo
    // Remplacer par l'appel API réel
    const mockData: Ordonnance[] = [
      {
        id: "1",
        userid: "user123",
        name: "Amoxicilline",
        dosage: "500mg",
        instructions: "À prendre avec un verre d'eau",
        duration: "7 jours",
        times: "3 fois par jour",
        dayOfWeek: "Tous les jours",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "2",
        userid: "user123",
        name: "Paracétamol",
        dosage: "1000mg",
        instructions: "Ne pas dépasser 4g par jour",
        duration: "Au besoin",
        times: "Toutes les 6 heures",
        dayOfWeek: "Au besoin",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // Simuler un délai d'API
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockData), 1500);
    });
  } catch (error) {
    console.error("Erreur lors de l'extraction:", error);
    throw new Error("Impossible d'extraire les données de l'ordonnance");
  }
}



export function validateOrdonnanceData(data: Ordonnance[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data || data.length === 0) {
    errors.push("Au moins une ordonnance est requise");
  }

  data?.forEach((ordonnance: Ordonnance, index: number) => {
    if (!ordonnance.name?.trim()) {
      errors.push(`Ordonnance ${index + 1}: Le nom est requis`);
    }
    if (!ordonnance.dosage?.trim()) {
      errors.push(`Ordonnance ${index + 1}: La posologie est requise`);
    }
    if (!ordonnance.times?.trim()) {
      errors.push(`Ordonnance ${index + 1}: Les horaires sont requis`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
