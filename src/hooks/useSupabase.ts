import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

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

export interface Profissional {
  id: string;
  user_id: string;
  name: string;
  phone?: string;
  email?: string;
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
  service_id?: string;
  service_value_at_appointment?: number;
  professional_id?: string;
  date: string;
  time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
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

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  business_type?: string;
  business_name?: string;
  address?: string;
  created_at?: string;
}

export const useSupabase = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // CLIENTES - usando useCallback para evitar loops infinitos
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
  }, [user]);

  // SERVIÇOS - usando useCallback
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
  }, [user]);

  // PROFISSIONAIS - novas funções
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

  // TRANSAÇÕES - usando useCallback
  const getTransacoes = useCallback(async (): Promise<Transacao[]> => {
    if (!user?.id) {
      console.warn('getTransacoes: Usuário não autenticado. Não será possível carregar transações.');
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
      
      const typedTransactions: Transacao[] = (data || []).map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        tipo: item.tipo as "receita" | "despesa",
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
      return false;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          tipo: transacaoData.tipo,
          descricao: transacaoData.descricao,
          valor: transacaoData.valor,
          data: transacaoData.data
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // AGENDAMENTOS - usando useCallback
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
      return data || [];
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

  // PRODUTOS e INVENTÁRIO - usando useCallback
  const getProdutos = useCallback(async (): Promise<Produto[]> => {
    if (!user?.id) {
      console.warn('getProdutos: Usuário não autenticado. Não será possível carregar produtos.');
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
  }, [user]);

  const addProduto = useCallback(async (produtoData: Omit<Produto, 'id' | 'user_id' | 'created_at'>): Promise<boolean> => {
    if (!user?.id) {
      console.warn('addProduto: Usuário não autenticado');
      return false;
    }
    
    setLoading(true);
    console.log('addProduto: Adicionando produto para user_id:', user.id, 'dados:', produtoData);
    
    try {
      const { error } = await supabase
        .from('products')
        .insert({
          user_id: user.id,
          ...produtoData
        });
      
      if (error) {
        console.error('addProduto: Erro ao criar produto:', error);
        return false;
      }
      
      console.log('addProduto: Produto criado com sucesso');
      return true;
    } catch (error) {
      console.error('addProduto: Erro inesperado:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateProduto = useCallback(async (id: string, produtoData: Partial<Produto>): Promise<boolean> => {
    if (!user?.id) {
      console.warn('updateProduto: Usuário não autenticado');
      return false;
    }
    
    setLoading(true);
    console.log('updateProduto: Atualizando produto', id, 'para user_id:', user.id);
    
    try {
      const { error } = await supabase
        .from('products')
        .update(produtoData)
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('updateProduto: Erro ao atualizar produto:', error);
        return false;
      }
      
      console.log('updateProduto: Produto atualizado com sucesso');
      return true;
    } catch (error) {
      console.error('updateProduto: Erro inesperado:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deleteProduto = useCallback(async (id: string): Promise<boolean> => {
    if (!user?.id) {
      console.warn('deleteProduto: Usuário não autenticado');
      return false;
    }
    
    setLoading(true);
    console.log('deleteProduto: Deletando produto', id, 'para user_id:', user.id);
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('deleteProduto: Erro ao deletar produto:', error);
        return false;
      }
      
      console.log('deleteProduto: Produto deletado com sucesso');
      return true;
    } catch (error) {
      console.error('deleteProduto: Erro inesperado:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getInventory = useCallback(async (): Promise<ProdutoInventory[]> => {
    if (!user?.id) {
      console.warn('getInventory: Usuário não autenticado. Não será possível carregar inventário.');
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
  }, [user]);

  // PROFILE FUNCTIONS
  const getProfile = useCallback(async (): Promise<Profile | null> => {
    if (!user?.id) {
      console.warn('getProfile: Usuário não autenticado. Não será possível carregar perfil.');
      return null;
    }
    
    setLoading(true);
    console.log('getProfile: Iniciando busca para user_id:', user.id);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('getProfile: Erro ao buscar perfil:', error);
        return null;
      }
      
      console.log('getProfile: Perfil encontrado:', data);
      return data;
    } catch (error) {
      console.error('getProfile: Erro inesperado:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateProfile = useCallback(async (profileData: Partial<Profile>): Promise<boolean> => {
    if (!user?.id) {
      console.warn('updateProfile: Usuário não autenticado');
      return false;
    }
    
    setLoading(true);
    console.log('updateProfile: Atualizando perfil para user_id:', user.id, 'dados:', profileData);
    
    try {
      // Primeiro, verificar se o perfil já existe
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      let result;
      
      if (existingProfile) {
        // Atualizar perfil existente
        result = await supabase
          .from('profiles')
          .update({
            full_name: profileData.full_name,
            phone: profileData.phone,
            business_name: profileData.business_name,
            business_type: profileData.business_type,
            address: profileData.address,
          })
          .eq('id', user.id);
      } else {
        // Criar novo perfil
        result = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email!,
            full_name: profileData.full_name,
            phone: profileData.phone,
            business_name: profileData.business_name,
            business_type: profileData.business_type,
            address: profileData.address,
          });
      }
      
      if (result.error) {
        console.error('updateProfile: Erro ao atualizar perfil:', result.error);
        return false;
      }
      
      console.log('updateProfile: Perfil atualizado com sucesso');
      return true;
    } catch (error) {
      console.error('updateProfile: Erro inesperado:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Função para buscar agendamentos por mês/ano
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
      return data || [];
    } catch (error) {
      console.error('getAgendamentosByMonth: Erro inesperado:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

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
    // Profissionais - novas funções
    getProfissionais,
    addProfissional,
    updateProfissional,
    deleteProfissional,
    // Transações
    getTransacoes,
    addTransacao,
    updateTransacao,
    // Agendamentos
    getAgendamentos,
    addAgendamento,
    updateAgendamento,
    deleteAgendamento,
    // Produtos e Inventário
    getProdutos,
    addProduto,
    updateProduto,
    deleteProduto,
    getInventory,
    // Profile
    getProfile,
    updateProfile,
    // Nova função para agendamentos por mês
    getAgendamentosByMonth,
  };
};
