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
    if (!user) {
      console.log('getClientes: Usuário não autenticado');
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
  };

  const addCliente = async (clienteData: Omit<Cliente, 'id' | 'user_id' | 'created_at'>): Promise<boolean> => {
    if (!user) {
      console.log('addCliente: Usuário não autenticado');
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
  };

  const updateCliente = async (id: string, clienteData: Partial<Cliente>): Promise<boolean> => {
    if (!user) {
      console.log('updateCliente: Usuário não autenticado');
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
  };

  const deleteCliente = async (id: string): Promise<boolean> => {
    if (!user) {
      console.log('deleteCliente: Usuário não autenticado');
      return false;
    }
    
    setLoading(true);
    console.log('deleteCliente: Deletando cliente', id, 'para user_id:', user.id);
    
    try {
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
      return false;
    } finally {
      setLoading(false);
    }
  };

  // SERVIÇOS
  const getServicos = async (): Promise<Servico[]> => {
    if (!user) {
      console.log('getServicos: Usuário não autenticado');
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
  };

  const addServico = async (servicoData: Omit<Servico, 'id' | 'user_id' | 'created_at'>): Promise<boolean> => {
    if (!user) {
      console.log('addServico: Usuário não autenticado');
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
  };

  const updateServico = async (id: string, servicoData: Partial<Servico>): Promise<boolean> => {
    if (!user) {
      console.log('updateServico: Usuário não autenticado');
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
  };

  const deleteServico = async (id: string): Promise<boolean> => {
    if (!user) {
      console.log('deleteServico: Usuário não autenticado');
      return false;
    }
    
    setLoading(true);
    console.log('deleteServico: Deletando serviço', id, 'para user_id:', user.id);
    
    try {
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
      return false;
    } finally {
      setLoading(false);
    }
  };

  // TRANSAÇÕES
  const getTransacoes = async (): Promise<Transacao[]> => {
    if (!user) {
      console.log('getTransacoes: Usuário não autenticado');
      return [];
    }
    
    setLoading(true);
    console.log('getTransacoes: Iniciando busca para user_id:', user.id);
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('data', { ascending: false });
      
      if (error) {
        console.error('getTransacoes: Erro ao buscar transações:', error);
        return [];
      }
      
      console.log('getTransacoes: Dados brutos do Supabase:', data);
      
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
      
      console.log('getTransacoes: Transações processadas:', typedTransactions);
      return typedTransactions;
    } catch (error) {
      console.error('getTransacoes: Erro inesperado:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const addTransacao = async (transacaoData: Omit<Transacao, 'id' | 'user_id' | 'created_at'>): Promise<boolean> => {
    if (!user) {
      console.log('addTransacao: Usuário não autenticado');
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
  };

  // AGENDAMENTOS - Implementação completa
  const getAgendamentos = async (): Promise<Agendamento[]> => {
    if (!user) {
      console.log('getAgendamentos: Usuário não autenticado');
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
      return data || [];
    } catch (error) {
      console.error('getAgendamentos: Erro inesperado:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const addAgendamento = async (agendamentoData: Omit<Agendamento, 'id' | 'user_id' | 'created_at'>): Promise<boolean> => {
    if (!user) {
      console.log('addAgendamento: Usuário não autenticado');
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
  };

  const updateAgendamento = async (id: string, agendamentoData: Partial<Agendamento>): Promise<boolean> => {
    if (!user) {
      console.log('updateAgendamento: Usuário não autenticado');
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
  };

  const deleteAgendamento = async (id: string): Promise<boolean> => {
    if (!user) {
      console.log('deleteAgendamento: Usuário não autenticado');
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
  };

  // PRODUTOS e INVENTÁRIO
  const getProdutos = async (): Promise<Produto[]> => {
    if (!user) {
      console.log('getProdutos: Usuário não autenticado');
      return [];
    }
    
    setLoading(true);
    console.log('getProdutos: Iniciando busca para user_id:', user.id);
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });
      
      if (error) {
        console.error('getProdutos: Erro ao buscar produtos:', error);
        return [];
      }
      
      console.log('getProdutos: Produtos encontrados:', data);
      return data || [];
    } catch (error) {
      console.error('getProdutos: Erro inesperado:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getInventory = async (): Promise<ProdutoInventory[]> => {
    if (!user) {
      console.log('getInventory: Usuário não autenticado');
      return [];
    }
    
    setLoading(true);
    console.log('getInventory: Iniciando busca para user_id:', user.id);
    
    try {
      const { data, error } = await supabase
        .from('product_inventory')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('getInventory: Erro ao buscar inventário:', error);
        return [];
      }
      
      console.log('getInventory: Inventário encontrado:', data);
      return data || [];
    } catch (error) {
      console.error('getInventory: Erro inesperado:', error);
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
    updateAgendamento,
    deleteAgendamento,
    // Produtos e Inventário
    getProdutos,
    getInventory
  };
};
