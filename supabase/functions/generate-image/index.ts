import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const LOVABLE_AI_GATEWAY = 'https://ai.gateway.lovable.dev/v1/chat/completions';

// Model for image generation - Nano Banana (Gemini Image)
const IMAGE_MODEL = 'google/gemini-2.5-flash-image-preview';

interface GenerateImageRequest {
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: string;
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

    // Validate API key
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
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
    const { prompt, negativePrompt, aspectRatio = '1:1' } = await req.json() as GenerateImageRequest;

    if (!prompt || prompt.trim() === '') {
      throw new Error('Prompt is required');
    }

    logStep('Generating image', { prompt: prompt.substring(0, 50), aspectRatio });

    // Build enhanced prompt with aspect ratio and quality instructions
    let enhancedPrompt = prompt.trim();
    
    // Add aspect ratio context
    if (aspectRatio !== '1:1') {
      enhancedPrompt += `. Image should be in ${aspectRatio} aspect ratio.`;
    }
    
    // Add negative prompt if provided
    if (negativePrompt && negativePrompt.trim()) {
      enhancedPrompt += ` Avoid: ${negativePrompt.trim()}.`;
    }
    
    // Add quality instructions
    enhancedPrompt += ' High quality, detailed, professional.';

    logStep('Sending to Lovable AI Gateway', { model: IMAGE_MODEL });

    const response = await fetch(LOVABLE_AI_GATEWAY, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        messages: [
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logStep('Lovable AI error', { status: response.status, error: errorText });
      
      if (response.status === 429) {
        throw new Error('Limite de requisições excedido. Tente novamente em alguns minutos.');
      }
      
      if (response.status === 402) {
        throw new Error('Créditos insuficientes no workspace Lovable. Adicione créditos para continuar.');
      }
      
      throw new Error(`Erro na geração de imagem. Código: ${response.status}`);
    }

    const data = await response.json();
    logStep('Response received', { hasChoices: !!data.choices });

    // Extract image from response - try multiple possible locations
    const message = data.choices?.[0]?.message;
    let imageData = message?.images?.[0]?.image_url?.url;
    
    // Try alternative response format (inline_data)
    if (!imageData) {
      imageData = message?.images?.[0]?.url;
    }
    
    // Try content array format
    if (!imageData && Array.isArray(message?.content)) {
      const imageContent = message.content.find((c: any) => c.type === 'image_url' || c.type === 'image');
      imageData = imageContent?.image_url?.url || imageContent?.url;
    }

    // Log full response structure for debugging
    logStep('Response structure', { 
      hasMessage: !!message,
      hasImages: !!message?.images,
      imagesLength: message?.images?.length,
      contentType: typeof message?.content,
      textContent: typeof message?.content === 'string' ? message.content.substring(0, 100) : null,
      finishReason: data.choices?.[0]?.finish_reason
    });
    
    if (!imageData) {
      // Check if there's a text response explaining why no image was generated
      const textContent = typeof message?.content === 'string' ? message.content : null;
      if (textContent) {
        logStep('Model text response', { text: textContent.substring(0, 300) });
        throw new Error(textContent.substring(0, 200) || 'O modelo não gerou uma imagem. Tente um prompt diferente.');
      }
      throw new Error('Nenhuma imagem foi gerada. Tente reformular seu prompt.');
    }

    logStep('Image generated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: imageData,
        model: IMAGE_MODEL,
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
