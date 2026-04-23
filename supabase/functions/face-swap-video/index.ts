import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN');
const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions';

// Modelo de face swap em vídeo (Replicate - arabyai-replicate/roop_face_swap)
// Recebe uma imagem com o rosto/personagem e um vídeo alvo, devolve o vídeo
// com o rosto trocado preservando movimento/iluminação.
const FACE_SWAP_VERSION = '11b6bf0f4e14d808f655e87e5448233cceff10a45f659d71539cafb7163b2e84';

interface FaceSwapRequest {
  characterImageUrl: string; // imagem do personagem/rosto a inserir
  targetVideoUrl: string;    // vídeo base onde o rosto será trocado
}

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[FACE-SWAP-VIDEO] ${step}${detailsStr}`);
};

async function pollForResult(predictionUrl: string, maxAttempts = 180): Promise<{ url: string } | null> {
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
        const output = data.output;
        if (typeof output === 'string') return { url: output };
        if (Array.isArray(output) && output.length > 0) return { url: output[0] };
        return null;
      }

      if (data.status === 'failed' || data.status === 'canceled') {
        logStep('Generation failed', { status: data.status, error: data.error });
        return null;
      }

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

    if (!REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN not configured');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization header');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) throw new Error('Unauthorized');

    logStep('User authenticated', { userId: user.id });

    const { characterImageUrl, targetVideoUrl } = await req.json() as FaceSwapRequest;

    if (!characterImageUrl) throw new Error('Imagem do personagem é obrigatória');
    if (!targetVideoUrl) throw new Error('Vídeo de referência é obrigatório');

    logStep('Starting face swap', {
      image: characterImageUrl.substring(0, 60),
      video: targetVideoUrl.substring(0, 60),
    });

    const requestBody = {
      version: FACE_SWAP_VERSION,
      input: {
        swap_image: characterImageUrl,
        target_video: targetVideoUrl,
      },
    };

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
        throw new Error('Créditos insuficientes no Replicate.');
      }
      throw new Error(`Erro ao iniciar face swap. Código: ${createResponse.status}`);
    }

    const prediction = await createResponse.json();
    logStep('Prediction created', { id: prediction.id, status: prediction.status });

    const result = await pollForResult(prediction.urls.get);

    if (!result) {
      throw new Error('Geração falhou ou expirou. Tente novamente com outro vídeo ou imagem.');
    }

    logStep('Face swap done', { videoUrl: result.url.substring(0, 60) });

    return new Response(
      JSON.stringify({
        success: true,
        videoUrl: result.url,
        predictionId: prediction.id,
        model: 'roop_face_swap',
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