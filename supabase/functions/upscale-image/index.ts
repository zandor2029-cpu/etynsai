import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UpscaleImageRequest {
  imageUrl: string;
  scale?: number; // 2x or 4x
}

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[UPSCALE-IMAGE] ${step}${detailsStr}`);
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
    const { imageUrl, scale = 2 } = await req.json() as UpscaleImageRequest;

    if (!imageUrl) {
      throw new Error('Image URL is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    logStep('Upscaling image', { imageUrl: imageUrl.substring(0, 100), scale });

    // Build prompt for upscaling
    const upscalePrompt = `Upscale and enhance this image to ${scale}x resolution. 
Improve details, sharpness, and clarity while maintaining the original composition and style. 
Apply high-quality super-resolution enhancement. 
Make textures clearer, edges sharper, and colors more vibrant.
Keep the exact same content, just improve the quality and resolution.`;

    // Call Lovable AI Gateway with image editing capability
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: upscalePrompt },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        modalities: ['image', 'text'],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logStep('Lovable AI error', { status: response.status, error: errorText });
      
      if (response.status === 429) {
        throw new Error('Limite de requisições excedido. Aguarde alguns segundos e tente novamente.');
      }
      if (response.status === 402) {
        throw new Error('Saldo insuficiente no workspace. Adicione créditos em Settings → Workspace → Usage.');
      }
      throw new Error(`Erro no upscale: ${response.status}`);
    }

    const data = await response.json();
    logStep('Lovable AI response received', { hasChoices: !!data.choices });

    // Extract the upscaled image from response
    const choice = data.choices?.[0];
    const message = choice?.message;
    
    let upscaledImageUrl: string | null = null;
    
    if (message?.images && message.images.length > 0) {
      upscaledImageUrl = message.images[0]?.image_url?.url;
    }

    if (!upscaledImageUrl) {
      logStep('No image in response', { message });
      throw new Error('Não foi possível melhorar a imagem. Tente novamente.');
    }

    logStep('Image upscaled successfully');

    // Upload to Supabase Storage for persistence
    let finalImageUrl = upscaledImageUrl;
    
    if (upscaledImageUrl.startsWith('data:image')) {
      try {
        const base64Match = upscaledImageUrl.match(/^data:image\/(\w+);base64,(.+)$/);
        if (base64Match) {
          const imageType = base64Match[1];
          const base64Data = base64Match[2];
          const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
          
          const fileName = `upscale-${user.id}-${Date.now()}.${imageType}`;
          
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
        scale,
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
