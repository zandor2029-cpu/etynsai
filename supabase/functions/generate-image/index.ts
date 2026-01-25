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

// Convert aspect ratio to width/height for Pollinations
function getImageDimensions(aspectRatio: string): { width: number; height: number } {
  const dimensions: Record<string, { width: number; height: number }> = {
    '1:1': { width: 1024, height: 1024 },
    '16:9': { width: 1344, height: 768 },
    '9:16': { width: 768, height: 1344 },
    '4:3': { width: 1152, height: 896 },
    '3:4': { width: 896, height: 1152 },
    '21:9': { width: 1536, height: 640 },
  };
  return dimensions[aspectRatio] || dimensions['1:1'];
}

// Valid Pollinations models
const VALID_MODELS = ['flux', 'turbo', 'flux-realism', 'flux-anime', 'flux-3d'];

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
    const { prompt, negativePrompt, aspectRatio = '1:1', style = 'flux' } = await req.json() as GenerateImageRequest;

    if (!prompt || prompt.trim() === '') {
      throw new Error('Prompt is required');
    }

    // Validate model
    const model = VALID_MODELS.includes(style) ? style : 'flux';

    logStep('Generating image with Pollinations.ai', { 
      prompt: prompt.substring(0, 50), 
      aspectRatio,
      model,
    });

    // Build enhanced prompt based on style
    let enhancedPrompt = prompt.trim();
    
    // Add style-specific enhancements
    switch (model) {
      case 'flux-realism':
        enhancedPrompt += '. Ultra realistic, photorealistic, 8K, high detail, professional photography.';
        break;
      case 'flux-anime':
        enhancedPrompt += '. Anime style, Japanese animation, vibrant colors, detailed illustration.';
        break;
      case 'flux-3d':
        enhancedPrompt += '. 3D render, CGI, Blender style, octane render, high quality 3D art.';
        break;
      case 'turbo':
        enhancedPrompt += '. High quality, detailed.';
        break;
      default:
        enhancedPrompt += '. High quality, detailed, professional.';
    }
    
    if (negativePrompt && negativePrompt.trim()) {
      enhancedPrompt += `. Avoid: ${negativePrompt.trim()}.`;
    }

    const { width, height } = getImageDimensions(aspectRatio);

    // Use Pollinations.ai - 100% FREE, no API key needed
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    const seed = Math.floor(Math.random() * 1000000);
    
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=${model}&nologo=true&enhance=true`;

    logStep('Calling Pollinations.ai', { url: pollinationsUrl.substring(0, 100), model });

    // Verify the image is accessible by making a HEAD request
    const checkResponse = await fetch(pollinationsUrl, {
      method: 'HEAD',
    });

    if (!checkResponse.ok) {
      logStep('Pollinations error', { status: checkResponse.status });
      throw new Error(`Erro na geração de imagem. Código: ${checkResponse.status}`);
    }

    logStep('Image generated successfully', { url: pollinationsUrl.substring(0, 100) });

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: pollinationsUrl,
        model: 'pollinations/flux',
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
