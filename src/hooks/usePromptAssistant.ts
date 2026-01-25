import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PromptSuggestions {
  enhanced: string;
  suggestions: string[];
  tips: string[];
}

interface UsePromptAssistantReturn {
  suggestions: PromptSuggestions | null;
  isLoading: boolean;
  error: string | null;
  enhance: (prompt: string, type?: 'image' | 'video') => Promise<void>;
  clear: () => void;
}

export const usePromptAssistant = (): UsePromptAssistantReturn => {
  const [suggestions, setSuggestions] = useState<PromptSuggestions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enhance = useCallback(async (prompt: string, type: 'image' | 'video' = 'image') => {
    if (!prompt || prompt.trim().length < 3) {
      setError('Prompt muito curto');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('enhance-prompt', {
        body: { prompt: prompt.trim(), type }
      });

      if (fnError) {
        throw fnError;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setSuggestions(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao gerar sugestões';
      setError(message);
      toast({
        title: 'Erro no assistente',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setSuggestions(null);
    setError(null);
  }, []);

  return {
    suggestions,
    isLoading,
    error,
    enhance,
    clear,
  };
};
