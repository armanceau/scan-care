import axios from 'axios';
import * as FileSystem from 'expo-file-system';

const MISTRAL_API_KEY = process.env.EXPO_PUBLIC_MISTRAL_API_KEY || '';
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

if (!MISTRAL_API_KEY) {
  console.error('⚠️ ERREUR: EXPO_PUBLIC_MISTRAL_API_KEY non définie dans .env');
}

// Types
export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface PrescriptionAnalysis {
  medications: Medication[];
  doctor?: string;
  date?: string;
  patient?: string;
}

/**
 * Convertir une image en base64
 */
async function imageToBase64(imageUri: string): Promise<string> {
  try {
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error) {
    console.error('Erreur lors de la conversion en base64:', error);
    throw new Error('Impossible de lire l\'image');
  }
}

/**
 * Analyser une ordonnance avec Mistral AI Vision
 */
export async function analyzePrescriptionImage(imageUri: string): Promise<PrescriptionAnalysis> {
  try {
    console.log('');
    console.log('═══════════════════════════════════════════════');
    console.log('📸 DÉBUT ANALYSE ORDONNANCE');
    console.log('═══════════════════════════════════════════════');
    console.log('📁 URI de l\'image:', imageUri);
    
    // Convertir l'image en base64
    const base64Image = await imageToBase64(imageUri);
    console.log('✅ Image convertie en base64');
    console.log('📏 Taille:', base64Image.length, 'caractères');
    console.log('');

    // Préparer le prompt pour Mistral
    const prompt = `Analyse cette ordonnance médicale et extrais les informations suivantes :

Pour chaque médicament, extrais :
- Nom complet du médicament
- Dosage (ex: 1000mg, 500mg, etc.)
- Fréquence de prise (ex: 3 fois par jour, matin et soir, etc.)
- Durée du traitement (ex: 5 jours, 7 jours, 2 semaines, etc.)
- Instructions particulières si présentes (ex: pendant les repas, à jeun, etc.)

Extrais aussi si disponible :
- Nom du médecin
- Date de l'ordonnance
- Nom du patient

Retourne UNIQUEMENT un JSON valide (sans texte avant ou après) au format :
{
  "doctor": "Nom du médecin",
  "date": "Date de l'ordonnance",
  "patient": "Nom du patient",
  "medications": [
    {
      "name": "nom du médicament",
      "dosage": "dosage",
      "frequency": "fréquence",
      "duration": "durée",
      "instructions": "instructions si présentes"
    }
  ]NVOI REQUÊTE À MISTRAL AI');
    console.log('═══════════════════════════════════════════════');
    console.log('🔑 Clé API:', MISTRAL_API_KEY ? MISTRAL_API_KEY.substring(0, 10) + '...' : 'NON DÉFINIE');
    console.log('🌐 URL:', MISTRAL_API_URL);
    console.log('🤖 Modèle: pixtral-12b-2409');
    console.log(''
Si aucun médicament n'est détecté, retourne : {"medications": []}`;

    console.log('🚀 Envoi de la requête à Mistral AI...');
    console.log('🔑 Clé API (premiers chars):', MISTRAL_API_KEY.substring(0, 10) + '...');
    console.log('🌐 URL API:', MISTRAL_API_URL);

    // Appel à l'API Mistral avec le modèle vision
    const response = await axios.post(
      MISTRAL_API_URL,
      {
        model: 'pixtral-12b-2409', // Modèle avec support vision
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'image_url',
                image_url: `data:image/jpeg;base64,${base64Image}`,
              },
            ],
          },
        ],
        temperature: 0.2, // Basse température pour plus de précision
        max_tokens: 2000,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        },
        timeout: 30000, // 30 secondes de timeout
      }ÉPONSE REÇUE');
    console.log('═══════════════════════════════════════════════');

    // Extraire le contenu de la réponse
    const content = response.data.choices[0]?.message?.content || '';
    console.log('📄 CONTENU MISTRAL:');
    console.log(content);
    console.log('═══════════════════════════════════════════════');
    console.log('ring(0, 200) + '...');
    console.log('📄 RÉPONSE COMPLÈTE MISTRAL:');
    console.log(content);
    console.log('================================');

    // Parser le JSON
    try {
      // Nettoyer la réponse (enlever les éventuels backticks ou markdown)
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();'✅ ANALYSE TERMINÉE AVEC SUCCÈS');
      console.log('═══════════════════════════════════════════════');
      console.log(`💊 ${result.medications.length} médicament(s) détecté(s)`);
      console.log('📊 RÉSULTAT:');
      console.log(JSON.stringify(result, null, 2));
      console.log('═══════════════════════════════════════════════');
      console.log('');
      
      return result;
    } catch (parseError) {
      console.error('');
      console.error('❌ ERREUR DE PARSING JSON');
      console.error('═══════════════════════════════════════════════');
      console.error('Erreur:', parseError);
      console.error('Contenu reçu:', content);
      console.error('═══════════════════════════════════════════════');
      console.error(''
      return result;
    } catch (parseError) {
    console.error('');
    console.error('❌ ERREUR LORS DE L\'ANALYSE');
    console.error('═══════════════════════════════════════════════');
    
    if (axios.isAxiosError(error)) {
      console.error('📡 Type: Erreur API Axios');
      console.error('📊 Status:', error.response?.status);
      console.error('📄 Message:', error.message);
      console.error('📦 Data:', JSON.stringify(error.response?.data, null, 2));
      console.error('');
      console.error('🔧 Config:');
      console.error('  - URL:', error.config?.url);
      console.error('  - Method:', error.config?.method);
      console.error('═══════════════════════════════════════════════');
      console.error(''(axios.isAxiosError(error)) {
      console.error('❌ ERREUR API AXIOS:');
      console.error('Status:', error.response?.status);
      console.error('Data:', JSON.stringify(error.response?.data, null, 2));
      console.error('Message:', error.message);
      console.error('Config:', {
        url: error.config?.url,
        method: error.config?.method,
        headers: er💥 Type: Erreur inattendue (non-axios)');
    console.error('🔍 Type:', typeof error);
    console.error('📄 Details:', JSON.stringify(error, null, 2));
    console.error('═══════════════════════════════════════════════');
    console.error(''
      if (error.response?.status === 401) {
        throw new Error('Clé API Mistral invalide');
      } else if (error.response?.status === 429) {
        throw new Error('Limite de requêtes atteinte. Veuillez réessayer plus tard');
      } else if (error.response?.status === 400) {
        throw new Error('Requête invalide: ' + JSON.stringify(error.response.data));
      } else {
        throw new Error('Erreur API Mistral: ' + (error.response?.data?.message || error.message));
      }
    }
    
    console.error('❌ Erreur inattendue (non-axios):', error);
    console.error('Type:', typeof error);
    console.error('Details:', JSON.stringify(error, null, 2));
    throw new Error('Impossible d\'analyser l\'ordonnance: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
  }
}

/**
 * Tester la connexion à l'API Mistral
 */
export async function testMistralConnection(): Promise<boolean> {
  try {
    const response = await axios.post(
      MISTRAL_API_URL,
      {
        model: 'mistral-tiny',
        messages: [{ role: 'user', content: 'Test' }],
        max_tokens: 10,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        },
      }
    );
    
    return response.status === 200;
  } catch (error) {
    console.error('Erreur de connexion Mistral:', error);
    return false;
  }
}
