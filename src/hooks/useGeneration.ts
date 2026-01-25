import { supabase } from "@/integrations/supabase/client";

interface GenerateImageParams {
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: string;
  style?: string;
  referenceImages?: string[]; // URLs of reference images for image-to-image
}

interface GenerateImageResult {
  success: boolean;
  imageUrl?: string;
  requestId?: string;
  error?: string;
}

export async function generateImage(params: GenerateImageParams): Promise<GenerateImageResult> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-image', {
      body: params,
    });

    if (error) {
      console.error('Generate image error:', error);
      return { success: false, error: error.message };
    }

    if (!data.success) {
      return { success: false, error: data.error || 'Generation failed' };
    }

    return {
      success: true,
      imageUrl: data.imageUrl,
      requestId: data.requestId,
    };
  } catch (error) {
    console.error('Generate image error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

interface GenerateVideoParams {
  characterImageUrl: string;
  motionVideoUrl?: string;
  prompt?: string;
  duration?: number;
  resolution?: "480p" | "720p";
}

interface GenerateVideoResult {
  success: boolean;
  videoUrl?: string;
  requestId?: string;
  error?: string;
}

export async function generateVideo(params: GenerateVideoParams): Promise<GenerateVideoResult> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-video', {
      body: params,
    });

    if (error) {
      console.error('Generate video error:', error);
      return { success: false, error: error.message };
    }

    if (!data.success) {
      return { success: false, error: data.error || 'Generation failed' };
    }

    return {
      success: true,
      videoUrl: data.videoUrl,
      requestId: data.requestId,
    };
  } catch (error) {
    console.error('Generate video error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
