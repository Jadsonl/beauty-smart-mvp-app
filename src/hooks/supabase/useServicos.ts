
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Servico {
  id: string;
  user_id: string;
  nome: string;
  preco: number;
  duracao?: string;
  created_at?: string;
}

export const useServicos = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const getServicos = useCallback(async (): Promise<Servico[]> => {
    if (!user?.id) {
      console.warn('getServicos: Usuário não autenticado. Não será possível carregar serviços.');
      return [];
    }
    
    setLoading(true);
    console.log('getServicos: Iniciando busca para user_id:', user.id);
    
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', user.id)
        .order('nome', { ascending: true });
      
      if (error) {
        console.error('getServicos: Erro ao buscar serviços:', error);
        return [];
      }
      
      console.log('getServicos: Serviços encontrados:', data);
      return data || [];
    } catch (error) {
      console.error('getServicos: Erro inesperado:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addServico = useCallback(async (servicoData: Omit<Servico, 'id' | 'user_id' | 'created_at'>): Promise<boolean> => {
    if (!user?.id) {
      console.warn('addServico: Usuário não autenticado');
      return false;
    }
    
    setLoading(true);
    console.log('addServico: Adicionando serviço para user_id:', user.id, 'dados:', servicoData);
    
    try {
      const { error } = await supabase
        .from('services')
        .insert({
          user_id: user.id,
          ...servicoData
        });
      
      if (error) {
        console.error('addServico: Erro ao criar serviço:', error);
        return false;
      }
      
      console.log('addServico: Serviço criado com sucesso');
      return true;
    } catch (error) {
      console.error('addServico: Erro inesperado:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateServico = useCallback(async (id: string, servicoData: Partial<Servico>): Promise<boolean> => {
    if (!user?.id) {
      console.warn('updateServico: Usuário não autenticado');
      return false;
    }
    
    setLoading(true);
    console.log('updateServico: Atualizando serviço', id, 'para user_id:', user.id);
    
    try {
      const { error } = await supabase
        .from('services')
        .update(servicoData)
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('updateServico: Erro ao atualizar serviço:', error);
        return false;
      }
      
      console.log('updateServico: Serviço atualizado com sucesso');
      return true;
    } catch (error) {
      console.error('updateServico: Erro inesperado:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deleteServico = useCallback(async (id: string): Promise<boolean> => {
    if (!user?.id) {
      console.warn('deleteServico: Usuário não autenticado');
      return false;
    }
    
    setLoading(true);
    console.log('deleteServico: Deletando serviço', id, 'para user_id:', user.id);
    
    try {
      // Verificar se há agendamentos vinculados a este serviço
      const { data: appointments, error: checkError } = await supabase
        .from('appointments')
        .select('id')
        .eq('service_id', id)
        .eq('user_id', user.id)
        .limit(1);

      if (checkError) {
        console.error('deleteServico: Erro ao verificar dependências:', checkError);
        return false;
      }

      if (appointments && appointments.length > 0) {
        console.error('deleteServico: Serviço possui agendamentos vinculados');
        throw new Error('Este serviço possui agendamentos vinculados. Remova os agendamentos primeiro antes de deletar o serviço.');
      }

      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('deleteServico: Erro ao deletar serviço:', error);
        return false;
      }
      
      console.log('deleteServico: Serviço deletado com sucesso');
      return true;
    } catch (error) {
      console.error('deleteServico: Erro inesperado:', error);
      // Re-throw error so it can be handled by the calling component
      if (error instanceof Error) {
        throw error;
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    loading,
    getServicos,
    addServico,
    updateServico,
    deleteServico
  };
};
