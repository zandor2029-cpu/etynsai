import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN');

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

// Convert aspect ratio to width/height for FLUX
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

    if (!REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN not configured');
    }

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
    const { prompt, negativePrompt, aspectRatio = '1:1', referenceImages } = await req.json() as GenerateImageRequest;

    if (!prompt || prompt.trim() === '') {
      throw new Error('Prompt is required');
    }

    const hasReferenceImages = referenceImages && referenceImages.length > 0;
    logStep('Generating image with FLUX Schnell', { 
      prompt: prompt.substring(0, 50), 
      aspectRatio, 
      hasReferenceImages,
    });

    // Build enhanced prompt
    let enhancedPrompt = prompt.trim();
    
    if (negativePrompt && negativePrompt.trim()) {
      enhancedPrompt += `. Avoid: ${negativePrompt.trim()}.`;
    }
    
    enhancedPrompt += ' High quality, detailed, professional.';

    const { width, height } = getImageDimensions(aspectRatio);

    // Use FLUX Schnell model via Replicate
    const model = 'black-forest-labs/flux-schnell';
    
    const replicateInput: Record<string, unknown> = {
      prompt: enhancedPrompt,
      num_outputs: 1,
      aspect_ratio: aspectRatio,
      output_format: 'png',
      output_quality: 90,
      go_fast: true,
    };

    // If reference images provided, use img2img approach
    if (hasReferenceImages) {
      replicateInput.image = referenceImages[0];
      replicateInput.prompt_strength = 0.8;
    }

    logStep('Calling Replicate API', { model });

    // Create prediction
    const createResponse = await fetch('https://api.replicate.com/v1/models/' + model + '/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait',
      },
      body: JSON.stringify({ input: replicateInput }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      logStep('Replicate API error', { status: createResponse.status, error: errorText });
      throw new Error(`Erro na geração de imagem. Código: ${createResponse.status}`);
    }

    const prediction = await createResponse.json();
    logStep('Prediction received', { status: prediction.status, id: prediction.id });

    // If prediction is still processing, poll for result
    let result = prediction;
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds max wait

    while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: {
          'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
        },
      });
      
      result = await statusResponse.json();
      attempts++;
      
      if (attempts % 5 === 0) {
        logStep('Polling prediction', { status: result.status, attempts });
      }
    }

    if (result.status === 'failed') {
      logStep('Prediction failed', { error: result.error });
      throw new Error(result.error || 'Falha na geração da imagem');
    }

    if (result.status !== 'succeeded') {
      throw new Error('Timeout na geração da imagem. Tente novamente.');
    }

    const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;
    
    if (!imageUrl) {
      throw new Error('Nenhuma imagem foi gerada');
    }

    logStep('Image generated successfully', { url: imageUrl.substring(0, 50) });

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: imageUrl,
        model: model,
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
