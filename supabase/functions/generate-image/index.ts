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
    const { prompt, negativePrompt, aspectRatio = '1:1' } = await req.json() as GenerateImageRequest;

    if (!prompt || prompt.trim() === '') {
      throw new Error('Prompt is required');
    }

    logStep('Generating image with Pollinations.ai', { 
      prompt: prompt.substring(0, 50), 
      aspectRatio,
    });

    // Build enhanced prompt
    let enhancedPrompt = prompt.trim();
    
    if (negativePrompt && negativePrompt.trim()) {
      enhancedPrompt += `. Avoid: ${negativePrompt.trim()}.`;
    }
    
    enhancedPrompt += ' High quality, detailed, professional.';

    const { width, height } = getImageDimensions(aspectRatio);

    // Use Pollinations.ai - 100% FREE, no API key needed
    // URL format: https://image.pollinations.ai/prompt/{prompt}?width={w}&height={h}&seed={seed}&model={model}
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    const seed = Math.floor(Math.random() * 1000000);
    
    // Available models: flux, turbo (faster), flux-realism, flux-anime, flux-3d, flux-pro
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=flux&nologo=true&enhance=true`;

    logStep('Calling Pollinations.ai', { url: pollinationsUrl.substring(0, 100) });

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
