import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Function invoked');

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
    const { prompt, negativePrompt, aspectRatio = '1:1', referenceImages } = await req.json() as GenerateImageRequest;

    if (!prompt || prompt.trim() === '') {
      throw new Error('Prompt is required');
    }

    const hasReferenceImages = referenceImages && referenceImages.length > 0;
    logStep('Generating image with Gemini Flash', { 
      prompt: prompt.substring(0, 50), 
      aspectRatio, 
      hasReferenceImages,
    });

    // Build enhanced prompt
    let enhancedPrompt = prompt.trim();
    
    if (negativePrompt && negativePrompt.trim()) {
      enhancedPrompt += `. Avoid: ${negativePrompt.trim()}.`;
    }
    
    enhancedPrompt += ' High quality, detailed, professional image.';

    // Build messages for Lovable AI
    const messages: Array<{ role: string; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> }> = [];

    if (hasReferenceImages) {
      // Multi-modal request with reference images
      const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
        { type: 'text', text: `Generate an image based on this prompt: ${enhancedPrompt}. Use the reference image(s) as inspiration for style and composition. Aspect ratio: ${aspectRatio}.` }
      ];
      
      for (const imageUrl of referenceImages!) {
        content.push({
          type: 'image_url',
          image_url: { url: imageUrl }
        });
      }
      
      messages.push({ role: 'user', content });
    } else {
      // Text-only request
      messages.push({
        role: 'user',
        content: `Generate an image with the following specifications:
- Prompt: ${enhancedPrompt}
- Aspect ratio: ${aspectRatio}
- Style: High quality, professional, detailed`
      });
    }

    logStep('Calling Lovable AI Gateway');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image',
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logStep('Lovable AI error', { status: response.status, error: errorText });
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Por favor, aguarde alguns segundos e tente novamente.');
      }
      if (response.status === 402) {
        throw new Error('Créditos insuficientes no workspace Lovable. Adicione créditos para continuar.');
      }
      
      throw new Error(`Erro na geração de imagem. Código: ${response.status}`);
    }

    const result = await response.json();
    logStep('Lovable AI response received', { hasChoices: !!result.choices });

    // Extract image URL from response
    let imageUrl: string | null = null;

    // Check for image in the response
    if (result.choices && result.choices[0]) {
      const choice = result.choices[0];
      
      // Check message content for image
      if (choice.message?.content) {
        const content = choice.message.content;
        
        // If content is an array (multi-modal response)
        if (Array.isArray(content)) {
          for (const part of content) {
            if (part.type === 'image_url' && part.image_url?.url) {
              imageUrl = part.image_url.url;
              break;
            }
            if (part.type === 'image' && part.url) {
              imageUrl = part.url;
              break;
            }
          }
        }
        
        // Check if content is a string with base64 image
        if (typeof content === 'string') {
          // Look for base64 image data
          const base64Match = content.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/);
          if (base64Match) {
            imageUrl = base64Match[0];
          }
          
          // Look for URL in markdown format
          const urlMatch = content.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/);
          if (urlMatch) {
            imageUrl = urlMatch[1];
          }
          
          // Look for direct URL
          const directUrlMatch = content.match(/(https?:\/\/[^\s]+\.(png|jpg|jpeg|gif|webp))/i);
          if (directUrlMatch) {
            imageUrl = directUrlMatch[1];
          }
        }
      }

      // Check for inline_data (Gemini format)
      if (choice.message?.inline_data) {
        const inlineData = choice.message.inline_data;
        if (inlineData.data && inlineData.mime_type) {
          imageUrl = `data:${inlineData.mime_type};base64,${inlineData.data}`;
        }
      }
    }

    // Check for images array in response
    if (!imageUrl && result.images && result.images.length > 0) {
      imageUrl = result.images[0].url || result.images[0];
    }

    // Check for data array (alternative format)
    if (!imageUrl && result.data && result.data.length > 0) {
      const firstData = result.data[0];
      if (firstData.url) {
        imageUrl = firstData.url;
      } else if (firstData.b64_json) {
        imageUrl = `data:image/png;base64,${firstData.b64_json}`;
      }
    }

    if (!imageUrl) {
      logStep('No image found in response', { result: JSON.stringify(result).substring(0, 500) });
      throw new Error('Nenhuma imagem foi gerada. Tente um prompt diferente.');
    }

    logStep('Image generated successfully', { urlPreview: imageUrl.substring(0, 100) });

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: imageUrl,
        model: 'google/gemini-2.5-flash-image',
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
