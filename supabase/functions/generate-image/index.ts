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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
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

    logStep('Generating image with Lovable AI', { prompt: enhancedPrompt.substring(0, 100), style, aspectRatio });

    // Build messages for the API
    const messages: Array<{ role: string; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> }> = [];

    // If we have reference images, include them
    if (referenceImages && referenceImages.length > 0) {
      const contentParts: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
        { type: 'text', text: `Use these reference images as inspiration. ${enhancedPrompt}` }
      ];
      
      for (const imgUrl of referenceImages.slice(0, 2)) {
        contentParts.push({
          type: 'image_url',
          image_url: { url: imgUrl }
        });
      }
      
      messages.push({ role: 'user', content: contentParts });
    } else {
      messages.push({ role: 'user', content: enhancedPrompt });
    }

    // Call Lovable AI Gateway with Gemini 2.5 Flash Image (cheapest image model)
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3.1-flash-image-preview',
        messages,
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
      throw new Error(`Erro na geração: ${response.status}`);
    }

    const data = await response.json();
    logStep('Lovable AI response received', { hasChoices: !!data.choices });

    // Extract the generated image from response
    const choice = data.choices?.[0];
    const message = choice?.message;
    
    let imageUrl: string | null = null;
    
    // Check for images in the response
    if (message?.images && message.images.length > 0) {
      imageUrl = message.images[0]?.image_url?.url;
    }

    if (!imageUrl) {
      logStep('No image in response', { message });
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
        model: 'gemini-3.1-flash-image (Nano Banana 2)',
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
