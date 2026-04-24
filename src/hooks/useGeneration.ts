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

interface UpscaleImageParams {
  imageUrl: string;
  scale?: number; // 2 or 4
}

interface UpscaleImageResult {
  success: boolean;
  imageUrl?: string;
  scale?: number;
  error?: string;
}

export async function upscaleImage(params: UpscaleImageParams): Promise<UpscaleImageResult> {
  try {
    const { data, error } = await supabase.functions.invoke('upscale-image', {
      body: params,
    });

    if (error) {
      console.error('Upscale image error:', error);
      return { success: false, error: error.message };
    }

    if (!data.success) {
      return { success: false, error: data.error || 'Upscale failed' };
    }

    return {
      success: true,
      imageUrl: data.imageUrl,
      scale: data.scale,
    };
  } catch (error) {
    console.error('Upscale image error:', error);
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

interface FaceSwapVideoParams {
  characterImageUrl: string;
  targetVideoUrl: string;
  klingVersion?: "3.0" | "2.6-pro";
  prompt?: string;
  mode?: "std" | "pro";
  characterOrientation?: "image" | "video";
  keepOriginalSound?: boolean;
}

interface FaceSwapVideoResult {
  success: boolean;
  videoUrl?: string;
  error?: string;
}

export async function faceSwapVideo(params: FaceSwapVideoParams): Promise<FaceSwapVideoResult> {
  try {
    const { data, error } = await supabase.functions.invoke('face-swap-video', {
      body: params,
    });

    if (error) {
      console.error('Face swap error:', error);
      return { success: false, error: error.message };
    }

    if (!data.success) {
      return { success: false, error: data.error || 'Face swap failed' };
    }

    return { success: true, videoUrl: data.videoUrl };
  } catch (error) {
    console.error('Face swap error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
