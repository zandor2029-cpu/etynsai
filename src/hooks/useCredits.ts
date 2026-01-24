import { supabase } from '@/integrations/supabase/client';
import { CREDIT_COSTS } from '@/config/plans';

export type GenerationType = 'image' | 'video';

interface UseCreditsResult {
  success: boolean;
  newBalance: number;
  message: string;
}

export async function useCreditsForGeneration(
  type: GenerationType,
  description?: string,
  referenceId?: string
): Promise<UseCreditsResult> {
  const cost = CREDIT_COSTS[type];
  const transactionType = type === 'image' ? 'image_generation' : 'video_generation';

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return {
      success: false,
      newBalance: 0,
      message: 'Usuário não autenticado',
    };
  }

  const { data, error } = await supabase.rpc('use_credits', {
    p_user_id: user.id,
    p_amount: cost,
    p_type: transactionType,
    p_description: description || `Geração de ${type === 'image' ? 'imagem' : 'vídeo'}`,
    p_reference_id: referenceId,
  });

  if (error) {
    console.error('Error using credits:', error);
    return {
      success: false,
      newBalance: 0,
      message: 'Erro ao processar créditos',
    };
  }

  const result = data?.[0];
  return {
    success: result?.success ?? false,
    newBalance: result?.new_balance ?? 0,
    message: result?.message ?? 'Erro desconhecido',
  };
}

export function getCreditCost(type: GenerationType): number {
  return CREDIT_COSTS[type];
}

export function canAfford(credits: number, type: GenerationType): boolean {
  return credits >= CREDIT_COSTS[type];
}
