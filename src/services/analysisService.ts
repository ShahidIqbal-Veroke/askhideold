interface AnalysisResult {
  damage_detected: boolean;
  deepfake_detected: boolean;
  damage_confidence?: number;
  deepfake_confidence?: number;
  processing_time?: number;
  error?: string;
}

interface AnalysisParams {
  damage_threshold?: number;
  deepfake_threshold?: number;
  skip_damage?: boolean;
  device_str?: string;
}

export class AnalysisService {
  private static readonly GRADIO_API_URL = "https://astrosbd-car-damage-insurance-fraud-detector.hf.space";

  static async analyzeImage(
    imageFile: File, 
    params: AnalysisParams = {}
  ): Promise<AnalysisResult> {
    try {
      // Default parameters
      const defaultParams = {
        damage_threshold: 0.1,
        deepfake_threshold: 0.1,
        skip_damage: false,
        device_str: "auto",
        ...params
      };

      // Create FormData for the API request
      const formData = new FormData();
      formData.append('data', JSON.stringify([
        imageFile,
        "Hello!!", // damage_model_path
        "Hello!!", // deepfake_model_path
        defaultParams.damage_threshold,
        defaultParams.deepfake_threshold,
        defaultParams.skip_damage,
        defaultParams.device_str
      ]));

      // Make HTTP request to Gradio API
      const response = await fetch(`${this.GRADIO_API_URL}/api/predict`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('API result:', result);

      // Parse the result based on the expected output format
      if (result.data && Array.isArray(result.data)) {
        return {
          damage_detected: Boolean(result.data[0]),
          deepfake_detected: Boolean(result.data[1]),
          damage_confidence: typeof result.data[2] === 'number' ? result.data[2] : undefined,
          deepfake_confidence: typeof result.data[3] === 'number' ? result.data[3] : undefined,
          processing_time: Date.now()
        };
      } else {
        // Fallback to mock data for demo purposes
        return this.getMockAnalysis();
      }
      
    } catch (error) {
      console.error('Analysis error:', error);
      
      // For demo purposes, return mock data instead of error
      console.log('Falling back to mock analysis for demo...');
      return this.getMockAnalysis();
    }
  }

  private static getMockAnalysis(): AnalysisResult {
    // Generate realistic mock data for demonstration
    const damageDetected = Math.random() > 0.7; // 30% chance of damage
    const deepfakeDetected = Math.random() > 0.9; // 10% chance of deepfake
    
    return {
      damage_detected: damageDetected,
      deepfake_detected: deepfakeDetected,
      damage_confidence: damageDetected ? 0.7 + Math.random() * 0.3 : 0.1 + Math.random() * 0.3,
      deepfake_confidence: deepfakeDetected ? 0.8 + Math.random() * 0.2 : 0.05 + Math.random() * 0.15,
      processing_time: Date.now()
    };
  }

  static async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.GRADIO_API_URL}/api/predict`, {
        method: 'HEAD'
      });
      return response.ok;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

export type { AnalysisResult, AnalysisParams };