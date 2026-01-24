import { supabase } from "@/integrations/supabase/client";

export interface Render {
  id: string;
  user_id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail_url: string | null;
  prompt: string | null;
  model: string | null;
  created_at: string;
}

export async function saveRender(params: {
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  prompt?: string;
  model?: string;
}): Promise<{ success: boolean; render?: Render; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const { data, error } = await supabase
      .from('renders')
      .insert({
        user_id: user.id,
        type: params.type,
        url: params.url,
        thumbnail_url: params.thumbnailUrl || null,
        prompt: params.prompt || null,
        model: params.model || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving render:', error);
      return { success: false, error: error.message };
    }

    return { success: true, render: data as Render };
  } catch (error) {
    console.error('Error saving render:', error);
    return { success: false, error: 'Erro ao salvar render' };
  }
}

export async function fetchUserRenders(): Promise<{ success: boolean; renders?: Render[]; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const { data, error } = await supabase
      .from('renders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching renders:', error);
      return { success: false, error: error.message };
    }

    return { success: true, renders: data as Render[] };
  } catch (error) {
    console.error('Error fetching renders:', error);
    return { success: false, error: 'Erro ao buscar renders' };
  }
}

export async function deleteRender(renderId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('renders')
      .delete()
      .eq('id', renderId);

    if (error) {
      console.error('Error deleting render:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting render:', error);
    return { success: false, error: 'Erro ao deletar render' };
  }
}
