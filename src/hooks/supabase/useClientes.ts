import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Cliente {
  id: string;
  user_id: string;
  nome: string;
  telefone?: string;
  email?: string;
  date_of_birth?: string;
  created_at?: string;
}

export const useClientes = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const getClientes = useCallback(async (): Promise<Cliente[]> => {
    if (!user?.id) {
      console.warn('getClientes: Usuário não autenticado. Não será possível carregar clientes.');
      return [];
    }
    
    setLoading(true);
    console.log('getClientes: Iniciando busca para user_id:', user.id);
    
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('nome', { ascending: true });
      
      if (error) {
        console.error('getClientes: Erro ao buscar clientes:', error);
        return [];
      }
      
      console.log('getClientes: Clientes encontrados:', data);
      return data || [];
    } catch (error) {
      console.error('getClientes: Erro inesperado:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getAniversariantes = useCallback(async (): Promise<Cliente[]> => {
    if (!user?.id) {
      console.warn('getAniversariantes: Usuário não autenticado.');
      return [];
    }
    
    setLoading(true);
    console.log('getAniversariantes: Buscando aniversariantes do mês para user_id:', user.id);
    
    try {
      const currentMonth = new Date().getMonth() + 1;
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .not('date_of_birth', 'is', null)
        .order('date_of_birth', { ascending: true });
      
      if (error) {
        console.error('getAniversariantes: Erro ao buscar aniversariantes:', error);
        return [];
      }
      
      // Filtrar pelo mês no frontend
      const aniversariantes = (data || []).filter(cliente => {
        if (!cliente.date_of_birth) return false;
        const birthMonth = new Date(cliente.date_of_birth).getMonth() + 1;
        return birthMonth === currentMonth;
      });
      
      console.log('getAniversariantes: Aniversariantes encontrados:', aniversariantes);
      return aniversariantes;
    } catch (error) {
      console.error('getAniversariantes: Erro inesperado:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addCliente = useCallback(async (clienteData: Omit<Cliente, 'id' | 'user_id' | 'created_at'>): Promise<boolean> => {
    if (!user?.id) {
      console.warn('addCliente: Usuário não autenticado');
      return false;
    }
    
    setLoading(true);
    console.log('addCliente: Adicionando cliente para user_id:', user.id, 'dados:', clienteData);
    
    try {
      const { error } = await supabase
        .from('clients')
        .insert({
          user_id: user.id,
          ...clienteData
        });
      
      if (error) {
        console.error('addCliente: Erro ao criar cliente:', error);
        return false;
      }
      
      console.log('addCliente: Cliente criado com sucesso');
      return true;
    } catch (error) {
      console.error('addCliente: Erro inesperado:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateCliente = useCallback(async (id: string, clienteData: Partial<Cliente>): Promise<boolean> => {
    if (!user?.id) {
      console.warn('updateCliente: Usuário não autenticado');
      return false;
    }
    
    setLoading(true);
    console.log('updateCliente: Atualizando cliente', id, 'para user_id:', user.id);
    
    try {
      const { error } = await supabase
        .from('clients')
        .update(clienteData)
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('updateCliente: Erro ao atualizar cliente:', error);
        return false;
      }
      
      console.log('updateCliente: Cliente atualizado com sucesso');
      return true;
    } catch (error) {
      console.error('updateCliente: Erro inesperado:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deleteCliente = useCallback(async (id: string): Promise<boolean> => {
    if (!user?.id) {
      console.warn('deleteCliente: Usuário não autenticado');
      return false;
    }
    
    setLoading(true);
    console.log('deleteCliente: Deletando cliente', id, 'para user_id:', user.id);
    
    try {
      // Verificar se há transações vinculadas a este cliente
      const { data: transactions, error: checkError } = await supabase
        .from('transactions')
        .select('id')
        .eq('client_id', id)
        .eq('user_id', user.id)
        .limit(1);

      if (checkError) {
        console.error('deleteCliente: Erro ao verificar dependências:', checkError);
        return false;
      }

      if (transactions && transactions.length > 0) {
        console.error('deleteCliente: Cliente possui transações vinculadas');
        throw new Error('Este cliente possui transações financeiras vinculadas. Remova as transações primeiro antes de deletar o cliente.');
      }

      // Verificar se há agendamentos vinculados
      const { data: appointments, error: appointmentError } = await supabase
        .from('appointments')
        .select('id')
        .eq('client_email', (await supabase.from('clients').select('email').eq('id', id).single()).data?.email)
        .eq('user_id', user.id)
        .limit(1);

      if (!appointmentError && appointments && appointments.length > 0) {
        console.error('deleteCliente: Cliente possui agendamentos vinculados');
        throw new Error('Este cliente possui agendamentos vinculados. Remova os agendamentos primeiro antes de deletar o cliente.');
      }

      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('deleteCliente: Erro ao deletar cliente:', error);
        return false;
      }
      
      console.log('deleteCliente: Cliente deletado com sucesso');
      return true;
    } catch (error) {
      console.error('deleteCliente: Erro inesperado:', error);
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
    getClientes,
    getAniversariantes,
    addCliente,
    updateCliente,
    deleteCliente
  };
};
