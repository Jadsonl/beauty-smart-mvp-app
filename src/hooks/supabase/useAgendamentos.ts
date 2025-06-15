
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Agendamento {
  id: string;
  user_id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  service: string;
  service_id?: string;
  service_value_at_appointment?: number;
  professional_id?: string;
  date: string;
  time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  created_at?: string;
}

export const useAgendamentosSupabase = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const getAgendamentos = useCallback(async (): Promise<Agendamento[]> => {
    if (!user?.id) {
      console.warn('getAgendamentos: Usuário não autenticado. Não será possível carregar agendamentos.');
      return [];
    }
    
    setLoading(true);
    console.log('getAgendamentos: Iniciando busca para user_id:', user.id);
    
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });
      
      if (error) {
        console.error('getAgendamentos: Erro ao buscar agendamentos:', error);
        return [];
      }
      
      console.log('getAgendamentos: Agendamentos encontrados:', data);
      
      // Type cast the status field to match our interface
      const typedAgendamentos: Agendamento[] = (data || []).map(item => ({
        ...item,
        status: (item.status as 'scheduled' | 'confirmed' | 'completed' | 'cancelled') || 'scheduled'
      }));
      
      return typedAgendamentos;
    } catch (error) {
      console.error('getAgendamentos: Erro inesperado:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addAgendamento = useCallback(async (agendamentoData: Omit<Agendamento, 'id' | 'user_id' | 'created_at'>): Promise<boolean> => {
    if (!user?.id) {
      console.warn('addAgendamento: Usuário não autenticado');
      return false;
    }
    
    setLoading(true);
    console.log('addAgendamento: Adicionando agendamento para user_id:', user.id, 'dados:', agendamentoData);
    
    try {
      const { error } = await supabase
        .from('appointments')
        .insert({
          user_id: user.id,
          client_name: agendamentoData.client_name,
          client_email: agendamentoData.client_email,
          client_phone: agendamentoData.client_phone,
          service: agendamentoData.service,
          service_id: agendamentoData.service_id,
          service_value_at_appointment: agendamentoData.service_value_at_appointment,
          professional_id: agendamentoData.professional_id,
          date: agendamentoData.date,
          time: agendamentoData.time,
          status: agendamentoData.status || 'scheduled',
          notes: agendamentoData.notes
        });
      
      if (error) {
        console.error('addAgendamento: Erro ao criar agendamento:', error);
        return false;
      }
      
      console.log('addAgendamento: Agendamento criado com sucesso');
      return true;
    } catch (error) {
      console.error('addAgendamento: Erro inesperado:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateAgendamento = useCallback(async (id: string, agendamentoData: Partial<Agendamento>): Promise<boolean> => {
    if (!user?.id) {
      console.warn('updateAgendamento: Usuário não autenticado');
      return false;
    }
    
    setLoading(true);
    console.log('updateAgendamento: Atualizando agendamento', id, 'para user_id:', user.id);
    
    try {
      const { error } = await supabase
        .from('appointments')
        .update(agendamentoData)
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('updateAgendamento: Erro ao atualizar agendamento:', error);
        return false;
      }
      
      console.log('updateAgendamento: Agendamento atualizado com sucesso');
      return true;
    } catch (error) {
      console.error('updateAgendamento: Erro inesperado:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deleteAgendamento = useCallback(async (id: string): Promise<boolean> => {
    if (!user?.id) {
      console.warn('deleteAgendamento: Usuário não autenticado');
      return false;
    }
    
    setLoading(true);
    console.log('deleteAgendamento: Deletando agendamento', id, 'para user_id:', user.id);
    
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('deleteAgendamento: Erro ao deletar agendamento:', error);
        return false;
      }
      
      console.log('deleteAgendamento: Agendamento deletado com sucesso');
      return true;
    } catch (error) {
      console.error('deleteAgendamento: Erro inesperado:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getAgendamentosByMonth = useCallback(async (month: number, year: number): Promise<Agendamento[]> => {
    if (!user?.id) {
      console.warn('getAgendamentosByMonth: Usuário não autenticado');
      return [];
    }
    
    setLoading(true);
    
    try {
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // último dia do mês
      
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });
      
      if (error) {
        console.error('getAgendamentosByMonth: Erro ao buscar agendamentos:', error);
        return [];
      }
      
      console.log('getAgendamentosByMonth: Agendamentos encontrados:', data);
      
      // Type cast the status field to match our interface
      const typedAgendamentos: Agendamento[] = (data || []).map(item => ({
        ...item,
        status: (item.status as 'scheduled' | 'confirmed' | 'completed' | 'cancelled') || 'scheduled'
      }));
      
      return typedAgendamentos;
    } catch (error) {
      console.error('getAgendamentosByMonth: Erro inesperado:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    loading,
    getAgendamentos,
    addAgendamento,
    updateAgendamento,
    deleteAgendamento,
    getAgendamentosByMonth
  };
};
