import { supabase } from "@/integrations/supabase/client";

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function uploadFileForGeneration(
  file: File,
  userId: string
): Promise<UploadResult> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('generation-uploads')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('generation-uploads')
      .getPublicUrl(data.path);

    return { success: true, url: urlData.publicUrl };
  } catch (error) {
    console.error('Upload error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Upload failed' 
    };
  }
}

export async function deleteUploadedFile(filePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from('generation-uploads')
      .remove([filePath]);

    return !error;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}
