/**
 * Service for calling the Gradio Document Tampering Detection API
 * Space: Askhedi/dtd-document-tampering
 * Using official @gradio/client SDK
 */

import { Client } from "@gradio/client";

const GRADIO_SPACE = "Askhedi/dtd-document-tampering";
const GRADIO_API_BASE = "https://askhedi-dtd-document-tampering.hf.space";

export interface TamperingDetectionResult {
  tamperingImageUrl: string;
  originalImageUrl?: string;
}

/**
 * Detect document tampering using Gradio API with official SDK
 * @param imageFile - The image file to analyze
 * @param quality - JPEG quality for analysis (default: 90)
 * @returns Promise with tampering detection result
 */
export async function detectTampering(
  imageFile: File | Blob,
  quality: number = 90
): Promise<TamperingDetectionResult> {
  try {
    console.log('🔍 Starting Gradio tampering detection with official SDK...');
    console.log('📤 Connecting to Gradio space:', GRADIO_SPACE);

    // Connect to the Gradio space
    const client = await Client.connect(GRADIO_SPACE);
    console.log('✅ Connected to Gradio space');

    // Call the prediction endpoint
    console.log('🔮 Calling /predict_tampering with quality:', quality);
    const result = await client.predict("/predict_tampering", {
      image: imageFile,
      quality: quality,
    });

    console.log('📡 Prediction result:', result);

    // Extract the result data
    // The API returns 3 images: [original, intermediate, final_tampering_detection]
    // We need the 3rd one (index 2)
    if (!result.data || !Array.isArray(result.data) || result.data.length < 3) {
      console.error('❌ Invalid result structure (expected 3 images):', result);
      throw new Error("No data in API response or missing images");
    }

    // Get the 3rd image (final tampering detection result)
    const tamperingImageData = result.data[2];

    if (!tamperingImageData) {
      console.error('❌ No tampering image at index 2:', result.data);
      throw new Error("No tampering detection image in result");
    }

    // Handle the result - it's an object with url property
    let imageUrl: string;
    if (typeof tamperingImageData === 'object' && tamperingImageData !== null && 'url' in tamperingImageData) {
      imageUrl = (tamperingImageData as { url: string }).url;
    } else if (typeof tamperingImageData === 'string') {
      imageUrl = tamperingImageData;
    } else {
      console.error('❌ Unexpected image data format:', tamperingImageData);
      throw new Error("Unexpected image data format in result");
    }

    // URL is already absolute from Gradio
    console.log('✅ Tampering detection complete:', imageUrl);

    return {
      tamperingImageUrl: imageUrl,
    };
  } catch (error) {
    console.error("❌ Gradio tampering detection error:", error);
    throw error;
  }
}

/**
 * Detect tampering from image URL
 * @param imageUrl - URL of the image to analyze
 * @param quality - JPEG quality for analysis (default: 90)
 */
export async function detectTamperingFromUrl(
  imageUrl: string,
  quality: number = 90
): Promise<TamperingDetectionResult> {
  try {
    console.log('📥 Fetching image from URL:', imageUrl);
    // Fetch the image
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    // Use the main detection function
    return await detectTampering(blob, quality);
  } catch (error) {
    console.error("❌ Error fetching image for tampering detection:", error);
    throw error;
  }
}
