import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateImageRequest {
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: string;
  style?: string;
  referenceImages?: string[];
}

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-IMAGE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Function invoked');

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    logStep('User authenticated', { userId: user.id });

    // Parse request body
    const { prompt, negativePrompt, aspectRatio = '1:1', style = 'default', referenceImages } = await req.json() as GenerateImageRequest;

    if (!prompt || prompt.trim() === '') {
      throw new Error('Prompt is required');
    }

    const GOOGLE_GEMINI_API_KEY = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    if (!GOOGLE_GEMINI_API_KEY) {
      throw new Error('GOOGLE_GEMINI_API_KEY not configured');
    }

    // Build enhanced prompt based on style
    let enhancedPrompt = prompt.trim();
    
    switch (style) {
      case 'flux-realism':
        enhancedPrompt += '. Ultra realistic, photorealistic, 8K resolution, high detail, professional photography, cinematic lighting.';
        break;
      case 'flux-anime':
        enhancedPrompt += '. Anime art style, Japanese animation, vibrant colors, detailed illustration, Studio Ghibli inspired.';
        break;
      case 'flux-3d':
        enhancedPrompt += '. 3D render, CGI, Pixar style, octane render, high quality 3D art, volumetric lighting.';
        break;
      default:
        enhancedPrompt += '. High quality, detailed, professional artwork.';
    }

    // Add aspect ratio hint
    const aspectHints: Record<string, string> = {
      '1:1': 'Square composition.',
      '16:9': 'Wide cinematic composition, 16:9 aspect ratio.',
      '9:16': 'Vertical portrait composition, 9:16 aspect ratio.',
      '4:3': 'Classic 4:3 composition.',
      '3:4': 'Portrait 3:4 composition.',
    };
    if (aspectHints[aspectRatio]) {
      enhancedPrompt += ' ' + aspectHints[aspectRatio];
    }

    if (negativePrompt && negativePrompt.trim()) {
      enhancedPrompt += ` Avoid: ${negativePrompt.trim()}.`;
    }

    logStep('Generating image with Google Gemini', { prompt: enhancedPrompt.substring(0, 100), style, aspectRatio });

    // Build content parts for Gemini
    const contentParts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

    // If we have reference images, include them
    if (referenceImages && referenceImages.length > 0) {
      contentParts.push({ text: `Use these reference images as inspiration. ${enhancedPrompt}` });
      
      for (const imgUrl of referenceImages.slice(0, 2)) {
        try {
          // Fetch the image and convert to base64
          const imgResponse = await fetch(imgUrl);
          if (imgResponse.ok) {
            const imgBuffer = await imgResponse.arrayBuffer();
            const base64 = btoa(String.fromCharCode(...new Uint8Array(imgBuffer)));
            const contentType = imgResponse.headers.get('content-type') || 'image/png';
            
            contentParts.push({
              inlineData: {
                mimeType: contentType,
                data: base64
              }
            });
          }
        } catch (e) {
          logStep('Failed to fetch reference image', { url: imgUrl, error: String(e) });
        }
      }
    } else {
      contentParts.push({ text: enhancedPrompt });
    }

    // Call Google Gemini API directly
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GOOGLE_GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: contentParts
          }],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"]
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      logStep('Gemini API error', { status: response.status, error: errorText });
      
      if (response.status === 429) {
        throw new Error('Limite de requisições excedido. Tente novamente em alguns segundos.');
      }
      if (response.status === 403) {
        throw new Error('API key inválida ou sem permissão para gerar imagens.');
      }
      if (response.status === 400) {
        throw new Error('Prompt inválido ou bloqueado. Tente reformular.');
      }
      throw new Error(`Erro na geração: ${response.status}`);
    }

    const data = await response.json();
    logStep('Gemini response received', { 
      hasCandidates: !!data.candidates,
      candidateCount: data.candidates?.length 
    });

    // Extract the generated image from response
    let imageUrl: string | null = null;
    
    const candidates = data.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0]?.content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.inlineData) {
            // Convert base64 to data URL
            const mimeType = part.inlineData.mimeType || 'image/png';
            imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
            break;
          }
        }
      }
    }

    if (!imageUrl) {
      logStep('No image in response', { data: JSON.stringify(data).substring(0, 500) });
      throw new Error('A IA não conseguiu gerar uma imagem. Tente reformular o prompt.');
    }

    logStep('Image generated successfully');

    // Upload base64 image to Supabase Storage for persistence
    let finalImageUrl = imageUrl;
    
    if (imageUrl.startsWith('data:image')) {
      try {
        // Extract base64 data
        const base64Match = imageUrl.match(/^data:image\/(\w+);base64,(.+)$/);
        if (base64Match) {
          const imageType = base64Match[1];
          const base64Data = base64Match[2];
          const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
          
          const fileName = `gemini-${user.id}-${Date.now()}.${imageType}`;
          
          const { data: uploadData, error: uploadError } = await supabaseClient.storage
            .from('generation-uploads')
            .upload(fileName, binaryData, {
              contentType: `image/${imageType}`,
              upsert: false,
            });
          
          if (!uploadError && uploadData) {
            const { data: publicUrl } = supabaseClient.storage
              .from('generation-uploads')
              .getPublicUrl(fileName);
            
            if (publicUrl?.publicUrl) {
              finalImageUrl = publicUrl.publicUrl;
              logStep('Image uploaded to storage', { url: finalImageUrl });
            }
          } else {
            logStep('Upload failed, using base64', { error: uploadError?.message });
          }
        }
      } catch (uploadErr) {
        logStep('Upload error, using base64', { error: String(uploadErr) });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: finalImageUrl,
        model: 'gemini-2.0-flash-exp-image-generation',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    logStep('Error', { message: error instanceof Error ? error.message : 'Unknown error' });
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
