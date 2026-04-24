import { supabase } from '@/integrations/supabase/client';
import { CREDIT_COSTS } from '@/config/plans';

export type GenerationType = 'image' | 'video';

interface UseCreditsResult {
  success: boolean;
  newBalance: number;
  message: string;
  skipped?: boolean; // Indicates if credits were skipped (e.g., Ultimate plan)
}

// Check if user has Ultimate subscription (images are free)
export async function checkUnlimitedImages(): Promise<boolean> {
  // Imagens ilimitadas foi removido do plano Ultimate. Mantido por
  // compatibilidade — sempre retorna false agora.
  return false;
}

// Use credits with custom amount (for video resolution options)
export async function useCreditsWithAmount(
  amount: number,
  type: GenerationType,
  description?: string,
  referenceId?: string,
  skipForUltimate: boolean = false
): Promise<UseCreditsResult> {
  // For images, check if user has Ultimate plan (unlimited images)
  if (type === 'image' && skipForUltimate) {
    const isUnlimited = await checkUnlimitedImages();
    if (isUnlimited) {
      // Get current balance without deducting
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', user.id)
          .single();
        
        return {
          success: true,
          newBalance: profile?.credits ?? 0,
          message: 'Imagens ilimitadas no plano Ultimate! 🚀',
          skipped: true,
        };
      }
    }
  }

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
    p_amount: amount,
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

export async function useCreditsForGeneration(
  type: GenerationType,
  description?: string,
  referenceId?: string,
  checkUnlimited: boolean = true
): Promise<UseCreditsResult> {
  const cost = CREDIT_COSTS[type];
  return useCreditsWithAmount(cost, type, description, referenceId, type === 'image' && checkUnlimited);
}

// Refund credits with custom amount
export async function refundCreditsWithAmount(
  amount: number,
  reason?: string
): Promise<UseCreditsResult> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return {
      success: false,
      newBalance: 0,
      message: 'Usuário não autenticado',
    };
  }

  const { data, error } = await supabase.rpc('add_credits', {
    p_user_id: user.id,
    p_amount: amount,
    p_type: 'admin_adjustment',
    p_description: reason || 'Reembolso: falha na geração',
  });

  if (error) {
    console.error('Error refunding credits:', error);
    return {
      success: false,
      newBalance: 0,
      message: 'Erro ao reembolsar créditos',
    };
  }

  const result = data?.[0];
  return {
    success: result?.success ?? false,
    newBalance: result?.new_balance ?? 0,
    message: result?.message ?? 'Erro desconhecido',
  };
}

// Refund credits when generation fails
export async function refundCredits(
  type: GenerationType,
  reason?: string
): Promise<UseCreditsResult> {
  const cost = CREDIT_COSTS[type];
  return refundCreditsWithAmount(cost, reason);
}

export function getCreditCost(type: GenerationType): number {
  return CREDIT_COSTS[type];
}

export function canAfford(credits: number, type: GenerationType): boolean {
  return credits >= CREDIT_COSTS[type];
}

export function canAffordAmount(credits: number, amount: number): boolean {
  return credits >= amount;
}
