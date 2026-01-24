import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN');
const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions';

// Model for video generation - Wan 2.2 I2V A14B (mais barato: $0.05-$0.11 por vídeo)
const VIDEO_MODEL = 'wan-video/wan-2.2-i2v-a14b';

interface GenerateVideoRequest {
  characterImageUrl: string;
  motionVideoUrl?: string;
  prompt?: string;
  duration?: number;
}

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-VIDEO] ${step}${detailsStr}`);
};

// Poll for generation status
async function pollForResult(predictionUrl: string, maxAttempts = 120): Promise<{ url: string } | null> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(predictionUrl, {
        headers: {
          'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        logStep('Status check failed', { status: response.status });
        await new Promise(r => setTimeout(r, 3000));
        continue;
      }

      const data = await response.json();
      logStep('Status check', { status: data.status, attempt: i + 1 });

      if (data.status === 'succeeded') {
        // Replicate returns output as string URL or array
        const output = data.output;
        if (typeof output === 'string') {
          return { url: output };
        } else if (Array.isArray(output) && output.length > 0) {
          return { url: output[0] };
        }
        return null;
      }

      if (data.status === 'failed' || data.status === 'canceled') {
        logStep('Generation failed', { status: data.status, error: data.error });
        return null;
      }

      // Still processing, wait and retry (video takes longer)
      await new Promise(r => setTimeout(r, 3000));
    } catch (error) {
      logStep('Poll error', { error: String(error) });
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Function invoked');

    // Validate API token
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
    const { characterImageUrl, prompt, duration = 5 } = await req.json() as GenerateVideoRequest;

    if (!characterImageUrl) {
      throw new Error('Character image URL is required');
    }

    logStep('Generating video', { 
      prompt: prompt?.substring(0, 50),
      duration 
    });

    // Build enhanced prompt
    const enhancedPrompt = prompt?.trim() || 'Animate this character with natural, fluid movements';

    // Create prediction with Replicate API - using official model (no version needed)
    const requestBody = {
      model: VIDEO_MODEL,
      input: {
        image: characterImageUrl,
        prompt: enhancedPrompt,
        sample_steps: 30,
      }
    };

    logStep('Sending to Replicate', { model: VIDEO_MODEL });

    const createResponse = await fetch(REPLICATE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      logStep('Replicate API error', { status: createResponse.status, error: errorText });
      
      if (createResponse.status === 401) {
        throw new Error('Token da API Replicate inválido ou expirado.');
      }
      
      if (createResponse.status === 402) {
        throw new Error('Créditos insuficientes no Replicate. Adicione créditos em replicate.com.');
      }
      
      throw new Error(`Erro na geração de vídeo. Código: ${createResponse.status}`);
    }

    const prediction = await createResponse.json();
    logStep('Prediction created', { id: prediction.id, status: prediction.status });

    // Poll for result
    const result = await pollForResult(prediction.urls.get);

    if (!result) {
      throw new Error('Geração de vídeo falhou ou expirou. Tente novamente.');
    }

    logStep('Video generated successfully', { videoUrl: result.url.substring(0, 50) });

    return new Response(
      JSON.stringify({
        success: true,
        videoUrl: result.url,
        predictionId: prediction.id,
        model: VIDEO_MODEL,
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
