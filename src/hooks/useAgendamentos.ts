
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
      console.log('useAgendamentos: Carregando dados do Supabase...');
      
      try {
        const [agendamentosData, clientesData, servicosData, profissionaisData] = await Promise.all([
          getAgendamentos(),
          getClientes(),
          getServicos(),
          getProfissionais()
        ]);
        
        console.log('useAgendamentos: Dados recebidos:', {
          agendamentos: agendamentosData?.length || 0,
          clientes: clientesData?.length || 0,
          servicos: servicosData?.length || 0,
          profissionais: profissionaisData?.length || 0
        });
        
        // Filter out any invalid data
        const validClientes = (clientesData || []).filter(cliente => 
          cliente && cliente.id && cliente.nome && cliente.id.trim() !== '' && cliente.nome.trim() !== ''
        );
        const validServicos = (servicosData || []).filter(servico => 
          servico && servico.id && servico.nome && servico.id.trim() !== '' && servico.nome.trim() !== ''
        );
        const validProfissionais = (profissionaisData || []).filter(profissional => 
          profissional && profissional.id && profissional.name && profissional.id.trim() !== '' && profissional.name.trim() !== ''
        );
        
        setAgendamentos(agendamentosData || []);
        setClientes(validClientes);
        setServicos(validServicos);
        setProfissionais(validProfissionais);
        
        console.log('useAgendamentos: Dados válidos definidos:', { 
          agendamentos: agendamentosData?.length || 0, 
          clientes: validClientes.length,
          servicos: validServicos.length,
          profissionais: validProfissionais.length
        });
      } catch (error) {
        console.error('useAgendamentos: Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados');
      }
    };

    loadData();
  }, [getAgendamentos, getClientes, getServicos, getProfissionais]);

  const handleStatusChange = useCallback(async (agendamento: Agendamento, newStatusDisplay: string) => {
    console.log('useAgendamentos: Alterando status:', agendamento.id, 'de', agendamento.status, 'para', newStatusDisplay);
    
    try {
      // Mapeamento correto de status de exibição para valores do banco (em inglês)
      const statusMap: { [key: string]: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' } = {
        'Agendado': 'scheduled',
        'agendado': 'scheduled',
        'scheduled': 'scheduled',
        'Confirmado': 'confirmed',
        'confirmado': 'confirmed',
        'confirmed': 'confirmed',
        'Concluído': 'completed',
        'Concluido': 'completed',
        'concluído': 'completed',
        'concluido': 'completed',
        'completed': 'completed',
        'Cancelado': 'cancelled',
        'cancelado': 'cancelled',
        'cancelled': 'cancelled'
      };
      
      const dbStatus = statusMap[newStatusDisplay];
      
      if (!dbStatus) {
        console.error('useAgendamentos: Status inválido:', newStatusDisplay);
        toast.error(`Status inválido: "${newStatusDisplay}"`);
        return;
      }

      // Verificar se o status é realmente diferente
      if (agendamento.status === dbStatus) {
        console.log('useAgendamentos: Status já é', dbStatus, '- sem necessidade de atualização');
        return;
      }

      console.log('useAgendamentos: Mapeando status:', newStatusDisplay, '->', dbStatus);
      
      const success = await updateAgendamento(agendamento.id, { status: dbStatus });
      
      if (success) {
        toast.success(`Status alterado para "${newStatusDisplay}" com sucesso!`);
        // Update local list immediately for better UX
        setAgendamentos(prev => prev.map(a => 
          a.id === agendamento.id 
            ? { ...a, status: dbStatus }
            : a
        ));
        console.log('useAgendamentos: Status atualizado localmente para:', dbStatus);
      } else {
        console.error('useAgendamentos: Falha na atualização do status');
        toast.error('Erro ao atualizar status');
      }
    } catch (error) {
      console.error('useAgendamentos: Erro inesperado ao alterar status:', error);
      toast.error('Erro inesperado ao atualizar status');
    }
  }, [updateAgendamento]);

  const handleDelete = useCallback(async (agendamento: Agendamento) => {
    if (window.confirm(`Tem certeza que deseja excluir o agendamento de ${agendamento.client_name}?`)) {
      console.log('useAgendamentos: Excluindo agendamento:', agendamento.id);
      
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
    console.log('useAgendamentos: Submetendo agendamento:', formData, editingAgendamento);
    
    if (!formData.clienteId || !formData.servicoId || !formData.data || !formData.horario) {
      console.error('useAgendamentos: Campos obrigatórios faltando:', formData);
      toast.error('Preencha todos os campos obrigatórios');
      return false;
    }

    const cliente = clientes.find(c => c.id === formData.clienteId);
    const servico = servicos.find(s => s.id === formData.servicoId);
    
    if (!cliente || !servico) {
      console.error('useAgendamentos: Cliente ou serviço não encontrado:', { cliente, servico });
      toast.error('Cliente ou serviço não encontrado');
      return false;
    }

    // Garantir que a data está no formato YYYY-MM-DD correto
    console.log('useAgendamentos: Data recebida do formulário:', formData.data);
    
    // Validar formato da data
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(formData.data)) {
      console.error('useAgendamentos: Formato de data inválido:', formData.data);
      toast.error('Formato de data inválido');
      return false;
    }

    const agendamentoData = {
      client_name: cliente.nome,
      client_email: cliente.email || '',
      client_phone: cliente.telefone || '',
      service: servico.nome,
      service_id: formData.servicoId,
      service_value_at_appointment: parseFloat(formData.servicoValor) || servico.preco,
      professional_id: formData.profissionalId && formData.profissionalId !== 'none' ? formData.profissionalId : undefined,
      date: formData.data, // Usar diretamente a string YYYY-MM-DD
      time: formData.horario,
      status: 'scheduled' as const,
      notes: formData.observacoes
    };

    console.log('useAgendamentos: Dados do agendamento preparados (data final):', agendamentoData.date);

    let success = false;

    try {
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
          setAgendamentos(novosAgendamentos || []);
        } else {
          toast.error('Erro ao criar agendamento');
        }
      }
    } catch (error) {
      console.error('useAgendamentos: Erro ao salvar agendamento:', error);
      toast.error('Erro ao salvar agendamento');
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
