
import { useState } from 'react';
import { useClientes, type Cliente } from '@/hooks/supabase/useClientes';
import { useServicos, type Servico } from '@/hooks/supabase/useServicos';
import { useProfissionais, type Profissional } from '@/hooks/supabase/useProfissionais';
import { useTransacoes, type Transacao } from '@/hooks/supabase/useTransacoes';
import { useAgendamentosSupabase, type Agendamento } from '@/hooks/supabase/useAgendamentos';
import { useProdutos, type Produto, type ProdutoInventory } from '@/hooks/supabase/useProdutos';
import { useProfile, type Profile } from '@/hooks/supabase/useProfile';

// Re-export types for backward compatibility
export type {
  Cliente,
  Servico,
  Profissional,
  Transacao,
  Agendamento,
  Produto,
  ProdutoInventory,
  Profile
};

export const useSupabase = () => {
  const [loading, setLoading] = useState(false);

  // Import all hooks
  const clientesHook = useClientes();
  const servicosHook = useServicos();
  const profissionaisHook = useProfissionais();
  const transacoesHook = useTransacoes();
  const agendamentosHook = useAgendamentosSupabase();
  const produtosHook = useProdutos();
  const profileHook = useProfile();

  // Combine loading states
  const combinedLoading = loading || 
    clientesHook.loading || 
    servicosHook.loading || 
    profissionaisHook.loading || 
    transacoesHook.loading || 
    agendamentosHook.loading || 
    produtosHook.loading || 
    profileHook.loading;

  return {
    loading: combinedLoading,
    // Clientes
    getClientes: clientesHook.getClientes,
    addCliente: clientesHook.addCliente,
    updateCliente: clientesHook.updateCliente,
    deleteCliente: clientesHook.deleteCliente,
    // Serviços
    getServicos: servicosHook.getServicos,
    addServico: servicosHook.addServico,
    updateServico: servicosHook.updateServico,
    deleteServico: servicosHook.deleteServico,
    // Profissionais
    getProfissionais: profissionaisHook.getProfissionais,
    addProfissional: profissionaisHook.addProfissional,
    updateProfissional: profissionaisHook.updateProfissional,
    deleteProfissional: profissionaisHook.deleteProfissional,
    // Transações - agora com suporte a filtros
    getTransacoes: transacoesHook.getTransacoes,
    addTransacao: transacoesHook.addTransacao,
    updateTransacao: transacoesHook.updateTransacao,
    // Agendamentos
    getAgendamentos: agendamentosHook.getAgendamentos,
    addAgendamento: agendamentosHook.addAgendamento,
    updateAgendamento: agendamentosHook.updateAgendamento,
    deleteAgendamento: agendamentosHook.deleteAgendamento,
    getAgendamentosByMonth: agendamentosHook.getAgendamentosByMonth,
    // Produtos e Inventário
    getProdutos: produtosHook.getProdutos,
    addProduto: produtosHook.addProduto,
    updateProduto: produtosHook.updateProduto,
    deleteProduto: produtosHook.deleteProduto,
    getInventory: produtosHook.getInventory,
    // Profile
    getProfile: profileHook.getProfile,
    updateProfile: profileHook.updateProfile
  };
};
