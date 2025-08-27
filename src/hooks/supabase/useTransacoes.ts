
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Transacao {
  id: string;
  user_id: string;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  data: string;
  agendamento_id?: string;
  professional_id?: string;
  created_at?: string;
}

interface TransacaoFilters {
  professionalId?: string;
  month?: number;
  year?: number;
}

export const useTransacoes = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const getTransacoes = useCallback(async (filters: TransacaoFilters = {}): Promise<Transacao[]> => {
    if (!user?.id) {
      console.warn('getTransacoes: Usuário não autenticado. Não será possível carregar transações.');
      return [];
    }
    
    setLoading(true);
    console.log('getTransacoes: Iniciando busca para user_id:', user.id, 'filtros:', filters);
    
    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id);
      
      // Adicionar filtro por profissional se especificado
      if (filters.professionalId && filters.professionalId !== 'all') {
        query = query.eq('professional_id', filters.professionalId);
      }
      
      // Adicionar filtros de mês e ano se especificados
      if (filters.month && filters.year) {
        const startDate = new Date(filters.year, filters.month - 1, 1).toISOString().split('T')[0];
        const endDate = new Date(filters.year, filters.month, 0).toISOString().split('T')[0];
        query = query.gte('data', startDate).lte('data', endDate);
      } else if (filters.year) {
        const startDate = new Date(filters.year, 0, 1).toISOString().split('T')[0];
        const endDate = new Date(filters.year, 11, 31).toISOString().split('T')[0];
        query = query.gte('data', startDate).lte('data', endDate);
      }
      
      const { data, error } = await query.order('data', { ascending: false });
      
      if (error) {
        console.error('getTransacoes: Erro ao buscar transações:', error);
        return [];
      }
      
      console.log('getTransacoes: Dados brutos do Supabase:', data);
      
      const typedTransactions: Transacao[] = (data || []).map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        tipo: item.tipo as "receita" | "despesa",
        descricao: item.descricao,
        valor: item.valor,
        data: item.data,
        agendamento_id: item.agendamento_id,
        professional_id: item.professional_id,
        created_at: item.created_at
      }));
      
      console.log('getTransacoes: Transações processadas:', typedTransactions);
      return typedTransactions;
    } catch (error) {
      console.error('getTransacoes: Erro inesperado:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addTransacao = useCallback(async (transacaoData: Omit<Transacao, 'id' | 'user_id' | 'created_at'>): Promise<boolean> => {
    if (!user?.id) {
      console.warn('addTransacao: Usuário não autenticado');
      return false;
    }
    
    setLoading(true);
    console.log('addTransacao: Adicionando transação para user_id:', user.id, 'dados:', transacaoData);
    
    try {
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          ...transacaoData
        });
      
      if (error) {
        console.error('addTransacao: Erro ao criar transação:', error);
        return false;
      }
      
      console.log('addTransacao: Transação criada com sucesso');
      return true;
    } catch (error) {
      console.error('addTransacao: Erro inesperado:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateTransacao = useCallback(async (id: string, transacaoData: Partial<Transacao>): Promise<boolean> => {
    if (!user?.id) {
      console.warn('updateTransacao: Usuário não autenticado');
      return false;
    }

    setLoading(true);
    console.log('updateTransacao: Atualizando transação:', id, 'dados:', transacaoData);
    
    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          tipo: transacaoData.tipo,
          descricao: transacaoData.descricao,
          valor: transacaoData.valor,
          data: transacaoData.data,
          professional_id: transacaoData.professional_id
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('updateTransacao: Erro ao atualizar transação:', error);
        return false;
      }

      console.log('updateTransacao: Transação atualizada com sucesso');
      return true;
    } catch (error) {
      console.error('updateTransacao: Erro inesperado:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deleteTransacao = useCallback(async (id: string): Promise<boolean> => {
    if (!user?.id) {
      console.warn('deleteTransacao: Usuário não autenticado');
      return false;
    }

    setLoading(true);
    console.log('deleteTransacao: Deletando transação:', id, 'para user_id:', user.id);
    
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('deleteTransacao: Erro ao deletar transação:', error);
        return false;
      }

      console.log('deleteTransacao: Transação deletada com sucesso');
      return true;
    } catch (error) {
      console.error('deleteTransacao: Erro inesperado:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    loading,
    getTransacoes,
    addTransacao,
    updateTransacao,
    deleteTransacao
  };
};
