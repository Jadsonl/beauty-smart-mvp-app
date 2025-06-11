import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Tipos para as novas tabelas
export interface Cliente {
  id: string;
  user_id: string;
  nome: string;
  telefone?: string;
  email?: string;
  created_at?: string;
}

export interface Servico {
  id: string;
  user_id: string;
  nome: string;
  preco: number;
  duracao?: string;
  created_at?: string;
}

export interface Transacao {
  id: string;
  user_id: string;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  data: string;
  agendamento_id?: string;
  created_at?: string;
}

export interface Agendamento {
  id: string;
  user_id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  service: string;
  date: string;
  time: string;
  status?: string;
  notes?: string;
  created_at?: string;
}

export interface Produto {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  unit?: string;
  min_stock_level?: number;
  created_at?: string;
}

export interface ProdutoInventory {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  min_stock: number;
  cost_per_unit?: number;
  updated_at?: string;
}

export const useSupabase = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // CLIENTES
  const getClientes = async (): Promise<Cliente[]> => {
    if (!user) return [];
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('nome', { ascending: true });
      
      if (error) {
        console.error('Erro ao buscar clientes:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Erro inesperado ao buscar clientes:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const addCliente = async (clienteData: Omit<Cliente, 'id' | 'user_id' | 'created_at'>): Promise<boolean> => {
    if (!user) return false;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('clients')
        .insert({
          user_id: user.id,
          ...clienteData
        });
      
      if (error) {
        console.error('Erro ao criar cliente:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro inesperado ao criar cliente:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateCliente = async (id: string, clienteData: Partial<Cliente>): Promise<boolean> => {
    if (!user) return false;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('clients')
        .update(clienteData)
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Erro ao atualizar cliente:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro inesperado ao atualizar cliente:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteCliente = async (id: string): Promise<boolean> => {
    if (!user) return false;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Erro ao deletar cliente:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro inesperado ao deletar cliente:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // SERVIÇOS
  const getServicos = async (): Promise<Servico[]> => {
    if (!user) return [];
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', user.id)
        .order('nome', { ascending: true });
      
      if (error) {
        console.error('Erro ao buscar serviços:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Erro inesperado ao buscar serviços:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const addServico = async (servicoData: Omit<Servico, 'id' | 'user_id' | 'created_at'>): Promise<boolean> => {
    if (!user) return false;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('services')
        .insert({
          user_id: user.id,
          ...servicoData
        });
      
      if (error) {
        console.error('Erro ao criar serviço:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro inesperado ao criar serviço:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateServico = async (id: string, servicoData: Partial<Servico>): Promise<boolean> => {
    if (!user) return false;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('services')
        .update(servicoData)
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Erro ao atualizar serviço:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro inesperado ao atualizar serviço:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteServico = async (id: string): Promise<boolean> => {
    if (!user) return false;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Erro ao deletar serviço:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro inesperado ao deletar serviço:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // TRANSAÇÕES
  const getTransacoes = async (): Promise<Transacao[]> => {
    if (!user) return [];
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('data', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar transações:', error);
        return [];
      }
      
      // Mapear os dados do Supabase para a interface Transacao com tipagem correta
      const typedTransactions: Transacao[] = (data || []).map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        tipo: item.tipo as "receita" | "despesa", // Afirmar o tipo literal
        descricao: item.descricao,
        valor: item.valor,
        data: item.data,
        agendamento_id: item.agendamento_id,
        created_at: item.created_at
      }));
      
      return typedTransactions;
    } catch (error) {
      console.error('Erro inesperado ao buscar transações:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const addTransacao = async (transacaoData: Omit<Transacao, 'id' | 'user_id' | 'created_at'>): Promise<boolean> => {
    if (!user) return false;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          ...transacaoData
        });
      
      if (error) {
        console.error('Erro ao criar transação:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro inesperado ao criar transação:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // AGENDAMENTOS
  const getAgendamentos = async (): Promise<Agendamento[]> => {
    if (!user) return [];
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });
      
      if (error) {
        console.error('Erro ao buscar agendamentos:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Erro inesperado ao buscar agendamentos:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const addAgendamento = async (agendamentoData: Omit<Agendamento, 'id' | 'user_id' | 'created_at'>): Promise<boolean> => {
    if (!user) return false;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .insert({
          user_id: user.id,
          ...agendamentoData
        });
      
      if (error) {
        console.error('Erro ao criar agendamento:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro inesperado ao criar agendamento:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // PRODUTOS
  const getProdutos = async (): Promise<Produto[]> => {
    if (!user) return [];
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Erro ao buscar produtos:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Erro inesperado ao buscar produtos:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getInventory = async (): Promise<ProdutoInventory[]> => {
    if (!user) return [];
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_inventory')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Erro ao buscar inventário:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Erro inesperado ao buscar inventário:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    // Clientes
    getClientes,
    addCliente,
    updateCliente,
    deleteCliente,
    // Serviços
    getServicos,
    addServico,
    updateServico,
    deleteServico,
    // Transações
    getTransacoes,
    addTransacao,
    // Agendamentos
    getAgendamentos,
    addAgendamento,
    // Produtos e Inventário
    getProdutos,
    getInventory
  };
};
