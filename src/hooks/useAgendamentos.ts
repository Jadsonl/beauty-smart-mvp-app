
import { useState, useEffect, useCallback } from 'react';
import { useSupabase, type Agendamento, type Cliente, type Servico, type Profissional } from '@/hooks/useSupabase';
import { toast } from 'sonner';

export const useAgendamentos = () => {
  const { 
    getAgendamentos, 
    addAgendamento, 
    updateAgendamento, 
    deleteAgendamento,
    getClientes,
    getServicos,
    getProfissionais,
    loading 
  } = useSupabase();
  
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);

  // Load data from Supabase
  useEffect(() => {
    const loadData = async () => {
      console.log('Carregando agendamentos, clientes, serviços e profissionais do Supabase...');
      
      const [agendamentosData, clientesData, servicosData, profissionaisData] = await Promise.all([
        getAgendamentos(),
        getClientes(),
        getServicos(),
        getProfissionais()
      ]);
      
      setAgendamentos(agendamentosData);
      setClientes(clientesData);
      setServicos(servicosData);
      setProfissionais(profissionaisData);
      
      console.log('Dados carregados:', { 
        agendamentos: agendamentosData.length, 
        clientes: clientesData.length,
        servicos: servicosData.length,
        profissionais: profissionaisData.length
      });
    };

    loadData();
  }, []);

  const handleStatusChange = useCallback(async (agendamento: Agendamento, newStatus: string) => {
    const success = await updateAgendamento(agendamento.id, { status: newStatus as any });
    if (success) {
      toast.success('Status atualizado com sucesso!');
      // Update local list
      setAgendamentos(prev => prev.map(a => 
        a.id === agendamento.id 
          ? { ...a, status: newStatus as any }
          : a
      ));
    } else {
      toast.error('Erro ao atualizar status');
    }
  }, [updateAgendamento]);

  const handleDelete = useCallback(async (agendamento: Agendamento) => {
    if (window.confirm(`Tem certeza que deseja excluir o agendamento de ${agendamento.client_name}?`)) {
      const success = await deleteAgendamento(agendamento.id);
      if (success) {
        toast.success('Agendamento excluído com sucesso!');
        setAgendamentos(prev => prev.filter(a => a.id !== agendamento.id));
      } else {
        toast.error('Erro ao excluir agendamento');
      }
    }
  }, [deleteAgendamento]);

  const handleSubmitAgendamento = useCallback(async (formData: any, editingAgendamento: Agendamento | null) => {
    if (!formData.clienteId || !formData.servicoId || !formData.data || !formData.horario) {
      toast.error('Preencha todos os campos obrigatórios');
      return false;
    }

    const cliente = clientes.find(c => c.id === formData.clienteId);
    const servico = servicos.find(s => s.id === formData.servicoId);
    
    if (!cliente || !servico) {
      toast.error('Cliente ou serviço não encontrado');
      return false;
    }

    const agendamentoData = {
      client_name: cliente.nome,
      client_email: cliente.email || '',
      client_phone: cliente.telefone || '',
      service: servico.nome,
      service_id: formData.servicoId,
      service_value_at_appointment: parseFloat(formData.servicoValor) || servico.preco,
      professional_id: formData.profissionalId || undefined,
      date: formData.data,
      time: formData.horario,
      status: 'scheduled' as const,
      notes: formData.observacoes
    };

    let success = false;

    if (editingAgendamento) {
      success = await updateAgendamento(editingAgendamento.id, agendamentoData);
      if (success) {
        toast.success('Agendamento atualizado com sucesso!');
        // Update local list
        setAgendamentos(prev => prev.map(a => 
          a.id === editingAgendamento.id 
            ? { ...a, ...agendamentoData }
            : a
        ));
      } else {
        toast.error('Erro ao atualizar agendamento');
      }
    } else {
      success = await addAgendamento(agendamentoData);
      if (success) {
        toast.success('Agendamento criado com sucesso!');
        // Reload list
        const novosAgendamentos = await getAgendamentos();
        setAgendamentos(novosAgendamentos);
      } else {
        toast.error('Erro ao criar agendamento');
      }
    }
    
    return success;
  }, [clientes, servicos, updateAgendamento, addAgendamento, getAgendamentos]);

  return {
    agendamentos,
    clientes,
    servicos,
    profissionais,
    loading,
    handleStatusChange,
    handleDelete,
    handleSubmitAgendamento
  };
};
