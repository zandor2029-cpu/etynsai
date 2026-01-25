import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, type = "image" } = await req.json();
    
    if (!prompt || prompt.trim().length < 3) {
      return new Response(
        JSON.stringify({ error: "Prompt muito curto" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = type === "video" 
      ? `Você é um especialista em prompts para geração de vídeos com IA. Analise o prompt do usuário e sugira melhorias.

Responda APENAS com um JSON válido no formato:
{
  "enhanced": "versão melhorada do prompt com mais detalhes visuais, movimento, câmera e iluminação",
  "suggestions": ["sugestão 1", "sugestão 2", "sugestão 3"],
  "tips": ["dica curta 1", "dica curta 2"]
}

Foque em: movimento da câmera, transições, iluminação dinâmica, atmosfera.
Máximo 3 sugestões e 2 dicas. Seja conciso.`
      : `Você é um especialista em prompts para geração de imagens com IA. Analise o prompt do usuário e sugira melhorias.

Responda APENAS com um JSON válido no formato:
{
  "enhanced": "versão melhorada do prompt com mais detalhes visuais, estilo artístico e iluminação",
  "suggestions": ["sugestão 1", "sugestão 2", "sugestão 3"],
  "tips": ["dica curta 1", "dica curta 2"]
}

Foque em: estilo artístico, composição, iluminação, cores, detalhes.
Máximo 3 sugestões e 2 dicas. Seja conciso.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Melhore este prompt: "${prompt}"` }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Muitas requisições. Aguarde um momento." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos Lovable AI esgotados." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Erro ao processar sugestões");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("Resposta vazia da IA");
    }

    // Parse JSON from response
    let result;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("JSON não encontrado");
      }
    } catch {
      // Fallback response
      result = {
        enhanced: prompt,
        suggestions: ["Adicione mais detalhes visuais", "Especifique o estilo artístico", "Descreva a iluminação"],
        tips: ["Seja específico", "Use adjetivos descritivos"]
      };
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("enhance-prompt error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
