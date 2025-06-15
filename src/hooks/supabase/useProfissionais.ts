
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Profissional {
  id: string;
  user_id: string;
  name: string;
  phone?: string;
  email?: string;
  created_at?: string;
}

export const useProfissionais = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const getProfissionais = useCallback(async (): Promise<Profissional[]> => {
    if (!user?.id) {
      console.warn('getProfissionais: Usuário não autenticado. Não será possível carregar profissionais.');
      return [];
    }
    
    setLoading(true);
    console.log('getProfissionais: Iniciando busca para user_id:', user.id);
    
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });
      
      if (error) {
        console.error('getProfissionais: Erro ao buscar profissionais:', error);
        return [];
      }
      
      console.log('getProfissionais: Profissionais encontrados:', data);
      return data || [];
    } catch (error) {
      console.error('getProfissionais: Erro inesperado:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addProfissional = useCallback(async (profissionalData: Omit<Profissional, 'id' | 'user_id' | 'created_at'>): Promise<boolean> => {
    if (!user?.id) {
      console.warn('addProfissional: Usuário não autenticado');
      return false;
    }
    
    setLoading(true);
    console.log('addProfissional: Adicionando profissional para user_id:', user.id, 'dados:', profissionalData);
    
    try {
      const { error } = await supabase
        .from('professionals')
        .insert({
          user_id: user.id,
          ...profissionalData
        });
      
      if (error) {
        console.error('addProfissional: Erro ao criar profissional:', error);
        return false;
      }
      
      console.log('addProfissional: Profissional criado com sucesso');
      return true;
    } catch (error) {
      console.error('addProfissional: Erro inesperado:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateProfissional = useCallback(async (id: string, profissionalData: Partial<Profissional>): Promise<boolean> => {
    if (!user?.id) {
      console.warn('updateProfissional: Usuário não autenticado');
      return false;
    }
    
    setLoading(true);
    console.log('updateProfissional: Atualizando profissional', id, 'para user_id:', user.id);
    
    try {
      const { error } = await supabase
        .from('professionals')
        .update(profissionalData)
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('updateProfissional: Erro ao atualizar profissional:', error);
        return false;
      }
      
      console.log('updateProfissional: Profissional atualizado com sucesso');
      return true;
    } catch (error) {
      console.error('updateProfissional: Erro inesperado:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deleteProfissional = useCallback(async (id: string): Promise<boolean> => {
    if (!user?.id) {
      console.warn('deleteProfissional: Usuário não autenticado');
      return false;
    }
    
    setLoading(true);
    console.log('deleteProfissional: Deletando profissional', id, 'para user_id:', user.id);
    
    try {
      const { error } = await supabase
        .from('professionals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('deleteProfissional: Erro ao deletar profissional:', error);
        return false;
      }
      
      console.log('deleteProfissional: Profissional deletado com sucesso');
      return true;
    } catch (error) {
      console.error('deleteProfissional: Erro inesperado:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    loading,
    getProfissionais,
    addProfissional,
    updateProfissional,
    deleteProfissional
  };
};
