import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN');

// Modelos oficiais Kling Motion Control no Replicate.
// São "official models" — usam o endpoint /models/{owner}/{name}/predictions
// (sem version hash).
const KLING_MODELS = {
  "3.0": "kwaivgi/kling-v3-motion-control",
  "2.6-pro": "kwaivgi/kling-v2.6-motion-control",
} as const;

type KlingVersion = keyof typeof KLING_MODELS;

interface MotionControlRequest {
  characterImageUrl: string; // imagem do personagem (visual)
  targetVideoUrl: string;    // vídeo de referência (movimento)
  klingVersion?: KlingVersion;
  prompt?: string;
  mode?: "std" | "pro";
  characterOrientation?: "image" | "video";
  keepOriginalSound?: boolean;
}

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[KLING-MOTION-CONTROL] ${step}${detailsStr}`);
};

async function pollForResult(predictionUrl: string, maxAttempts = 240): Promise<{ url: string } | null> {
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

    const body = await req.json() as MotionControlRequest;
    const {
      characterImageUrl,
      targetVideoUrl,
      klingVersion = "3.0",
      prompt,
      mode,
      characterOrientation = "image",
      keepOriginalSound = false,
    } = body;

    if (!characterImageUrl) throw new Error('Imagem do personagem é obrigatória');
    if (!targetVideoUrl) throw new Error('Vídeo de referência é obrigatório');

    const modelSlug = KLING_MODELS[klingVersion];
    if (!modelSlug) {
      throw new Error(`Versão Kling inválida: ${klingVersion}`);
    }

    // Default mode: pro pra v3, std pra v2.6 (de acordo com defaults oficiais)
    const finalMode = mode ?? (klingVersion === "3.0" ? "pro" : "std");

    logStep('Starting Kling Motion Control', {
      model: modelSlug,
      version: klingVersion,
      mode: finalMode,
      image: characterImageUrl.substring(0, 60),
      video: targetVideoUrl.substring(0, 60),
    });

    const input: Record<string, unknown> = {
      image: characterImageUrl,
      video: targetVideoUrl,
      mode: finalMode,
      character_orientation: characterOrientation,
      keep_original_sound: keepOriginalSound,
    };
    if (prompt && prompt.trim().length > 0) {
      input.prompt = prompt.trim();
    }

    // Endpoint de modelos oficiais (sem version hash)
    const replicateUrl = `https://api.replicate.com/v1/models/${modelSlug}/predictions`;

    const createResponse = await fetch(replicateUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait=0',
      },
      body: JSON.stringify({ input }),
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
      if (createResponse.status === 422) {
        throw new Error(`Entrada inválida para o Kling Motion Control. Verifique imagem (1:2.5 a 2.5:1, máx 10MB) e vídeo (3-30s, máx 100MB).`);
      }
      throw new Error(`Erro ao iniciar Kling Motion Control. Código: ${createResponse.status}`);
    }

    const prediction = await createResponse.json();
    logStep('Prediction created', { id: prediction.id, status: prediction.status });

    const result = await pollForResult(prediction.urls.get);

    if (!result) {
      throw new Error('Geração falhou ou expirou. Tente novamente com outra imagem ou vídeo.');
    }

    logStep('Motion control done', { videoUrl: result.url.substring(0, 60) });

    return new Response(
      JSON.stringify({
        success: true,
        videoUrl: result.url,
        predictionId: prediction.id,
        model: modelSlug,
        klingVersion,
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
