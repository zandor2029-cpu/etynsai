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

// Modelo Gemini para geração de imagens (Nano Banana 2)
// Chamado direto via API do Google — mais barato que via Lovable AI Gateway.
const GEMINI_MODEL = 'gemini-2.5-flash-image-preview';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Converte uma URL de imagem em base64 inline pra mandar pro Gemini
async function fetchImageAsInline(url: string): Promise<{ mimeType: string; data: string } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const mimeType = res.headers.get('content-type') ?? 'image/jpeg';
    const buf = new Uint8Array(await res.arrayBuffer());
    let bin = '';
    for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
    return { mimeType, data: btoa(bin) };
  } catch (err) {
    logStep('fetchImageAsInline failed', { error: String(err) });
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Function invoked');

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

    const { prompt, negativePrompt, aspectRatio = '1:1', style = 'default', referenceImages } =
      await req.json() as GenerateImageRequest;

    if (!prompt || prompt.trim() === '') throw new Error('Prompt is required');

    const GOOGLE_GEMINI_API_KEY = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    if (!GOOGLE_GEMINI_API_KEY) throw new Error('GOOGLE_GEMINI_API_KEY not configured');

    // Constrói prompt enriquecido por estilo
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

    const aspectHints: Record<string, string> = {
      '1:1': 'Square composition.',
      '16:9': 'Wide cinematic composition, 16:9 aspect ratio.',
      '9:16': 'Vertical portrait composition, 9:16 aspect ratio.',
      '4:3': 'Classic 4:3 composition.',
      '3:4': 'Portrait 3:4 composition.',
    };
    if (aspectHints[aspectRatio]) enhancedPrompt += ' ' + aspectHints[aspectRatio];

    if (negativePrompt && negativePrompt.trim()) {
      enhancedPrompt += ` Avoid: ${negativePrompt.trim()}.`;
    }

    logStep('Generating image with Gemini direct', {
      prompt: enhancedPrompt.substring(0, 100),
      style,
      aspectRatio,
      hasRefs: !!referenceImages?.length,
    });

    // Monta as parts do request Gemini
    const parts: Array<Record<string, unknown>> = [{ text: enhancedPrompt }];

    if (referenceImages && referenceImages.length > 0) {
      for (const imgUrl of referenceImages.slice(0, 2)) {
        const inline = await fetchImageAsInline(imgUrl);
        if (inline) {
          parts.push({ inline_data: { mime_type: inline.mimeType, data: inline.data } });
        }
      }
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GOOGLE_GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: {
          responseModalities: ['IMAGE', 'TEXT'],
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logStep('Gemini error', { status: response.status, error: errorText.substring(0, 200) });

      if (response.status === 429) {
        throw new Error('Limite de requisições excedido. Aguarde alguns segundos e tente novamente.');
      }
      if (response.status === 402 || response.status === 403) {
        throw new Error('Saldo Google Gemini insuficiente ou chave inválida.');
      }
      throw new Error(`Erro na geração: ${response.status}`);
    }

    const data = await response.json();
    logStep('Gemini response received');

    // Extrai imagem do response Gemini
    let imageUrl: string | null = null;
    const candidateParts = data?.candidates?.[0]?.content?.parts ?? [];
    for (const part of candidateParts) {
      const inline = part?.inline_data ?? part?.inlineData;
      if (inline?.data) {
        const mime = inline.mime_type ?? inline.mimeType ?? 'image/png';
        imageUrl = `data:${mime};base64,${inline.data}`;
        break;
      }
    }

    if (!imageUrl) {
      logStep('No image in response', { data });
      throw new Error('A IA não conseguiu gerar uma imagem. Tente reformular o prompt.');
    }

    logStep('Image generated successfully');

    // Faz upload pro storage pra persistência
    let finalImageUrl = imageUrl;
    if (imageUrl.startsWith('data:image')) {
      try {
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
        model: 'gemini-2.5-flash-image (Nano Banana 2 - direct)',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    logStep('Error', { message: error instanceof Error ? error.message : 'Unknown error' });
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
