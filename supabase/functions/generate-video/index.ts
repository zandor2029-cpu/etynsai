import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HIGGSFIELD_API_KEY = Deno.env.get('HIGGSFIELD_API_KEY');
const HIGGSFIELD_API_SECRET = Deno.env.get('HIGGSFIELD_API_SECRET');
const HIGGSFIELD_BASE_URL = 'https://platform.higgsfield.ai';

// Model for video generation - Kling 2.1 Pro
const VIDEO_MODEL = 'kling-video/v2.1/pro/image-to-video';

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
async function pollForResult(requestId: string, maxAttempts = 120): Promise<{ url: string } | null> {
  const statusUrl = `${HIGGSFIELD_BASE_URL}/requests/${requestId}/status`;
  
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(statusUrl, {
        headers: {
          'Authorization': `Key ${HIGGSFIELD_API_KEY}:${HIGGSFIELD_API_SECRET}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        logStep('Status check failed', { status: response.status });
        await new Promise(r => setTimeout(r, 3000));
        continue;
      }

      const data = await response.json();
      logStep('Status check', { status: data.status, attempt: i + 1 });

      if (data.status === 'completed') {
        if (data.video && data.video.url) {
          return { url: data.video.url };
        }
        return null;
      }

      if (data.status === 'failed' || data.status === 'nsfw') {
        logStep('Generation failed', { status: data.status });
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

    // Validate API credentials
    if (!HIGGSFIELD_API_KEY || !HIGGSFIELD_API_SECRET) {
      throw new Error('Higgsfield API credentials not configured');
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
    const { characterImageUrl, motionVideoUrl, prompt, duration = 5 } = await req.json() as GenerateVideoRequest;

    if (!characterImageUrl) {
      throw new Error('Character image URL is required');
    }

    logStep('Generating video', { 
      hasMotionVideo: !!motionVideoUrl, 
      prompt: prompt?.substring(0, 50),
      duration 
    });

    // Build the request to Higgsfield API
    const generateUrl = `${HIGGSFIELD_BASE_URL}/${VIDEO_MODEL}`;
    
    const requestBody: Record<string, unknown> = {
      image_url: characterImageUrl,
      prompt: prompt || 'Animate this character with natural, fluid movements',
      duration: Math.min(Math.max(duration, 5), 10), // Clamp between 5-10 seconds
    };

    // If motion video is provided, use motion control
    if (motionVideoUrl) {
      requestBody.motion_video_url = motionVideoUrl;
    }

    logStep('Sending to Higgsfield', { model: VIDEO_MODEL });

    const generateResponse = await fetch(generateUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${HIGGSFIELD_API_KEY}:${HIGGSFIELD_API_SECRET}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      logStep('Higgsfield API error', { status: generateResponse.status, error: errorText });
      throw new Error(`Higgsfield API error: ${generateResponse.status}`);
    }

    const generateData = await generateResponse.json();
    logStep('Generation queued', { requestId: generateData.request_id, status: generateData.status });

    // Poll for result (video takes longer)
    const result = await pollForResult(generateData.request_id);

    if (!result) {
      throw new Error('Video generation failed or timed out');
    }

    logStep('Video generated successfully', { videoUrl: result.url.substring(0, 50) });

    return new Response(
      JSON.stringify({
        success: true,
        videoUrl: result.url,
        requestId: generateData.request_id,
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
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
