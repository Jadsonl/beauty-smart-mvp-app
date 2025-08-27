
import { useState, useEffect, useCallback } from 'react';
import { useSupabase, type Transacao, type Profissional, type Cliente } from '@/hooks/useSupabase';
import { toast } from 'sonner';

export const useFinanceiro = () => {
  const { 
    getTransacoes, 
    addTransacao, 
    updateTransacao,
    deleteTransacao,
    getProfissionais,
    getClientes,
    loading 
  } = useSupabase();
  
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [serviceFilter, setServiceFilter] = useState<string>('');

  // Carregar profissionais e clientes
  useEffect(() => {
    const loadData = async () => {
      console.log('useFinanceiro: Carregando profissionais...');
      try {
        const [profissionaisData, clientesData] = await Promise.all([
          getProfissionais(),
          getClientes()
        ]);
        
        // Filtrar rigorosamente para evitar valores vazios que quebram o Select
        const validProfissionais = (profissionaisData || []).filter(profissional => 
          profissional && 
          profissional.id && 
          profissional.id.trim() !== '' && 
          profissional.name && 
          profissional.name.trim() !== '' &&
          typeof profissional.id === 'string' &&
          typeof profissional.name === 'string'
        );
        
        setProfissionais(validProfissionais);
        setClientes(clientesData || []);
        
        console.log('useFinanceiro: Profissionais válidos carregados:', validProfissionais.length);
        console.log('useFinanceiro: Clientes carregados:', clientesData?.length || 0);
      } catch (error) {
        console.error('useFinanceiro: Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados');
      }
    };

    loadData();
  }, [getProfissionais, getClientes]);

  // Carregar transações (recarrega quando os filtros mudam)
  useEffect(() => {
    const loadTransacoes = async () => {
      console.log('useFinanceiro: Carregando transações com filtros:', {
        professionalId: selectedProfessionalId,
        month: selectedMonth,
        year: selectedYear
      });
      try {
        const filters = {
          professionalId: selectedProfessionalId,
          month: selectedMonth,
          year: selectedYear
        };
        const transacoesData = await getTransacoes(filters);
        setTransacoes(transacoesData || []);
        console.log('useFinanceiro: Transações carregadas:', transacoesData?.length || 0);
      } catch (error) {
        console.error('useFinanceiro: Erro ao carregar transações:', error);
        toast.error('Erro ao carregar transações');
      }
    };

    loadTransacoes();
  }, [getTransacoes, selectedProfessionalId, selectedMonth, selectedYear]);

  const handleAddTransacao = useCallback(async (transacaoData: Omit<Transacao, 'id' | 'user_id' | 'created_at'>) => {
    console.log('useFinanceiro: Adicionando transação:', transacaoData);
    
    const success = await addTransacao(transacaoData);
    if (success) {
      toast.success('Transação adicionada com sucesso!');
      // Recarregar transações
      const filters = {
        professionalId: selectedProfessionalId,
        month: selectedMonth,
        year: selectedYear
      };
      const transacoesData = await getTransacoes(filters);
      setTransacoes(transacoesData || []);
    } else {
      toast.error('Erro ao adicionar transação');
    }
    
    return success;
  }, [addTransacao, getTransacoes, selectedProfessionalId, selectedMonth, selectedYear]);

  const handleUpdateTransacao = useCallback(async (id: string, transacaoData: Partial<Transacao>) => {
    console.log('useFinanceiro: Atualizando transação:', id, transacaoData);
    
    const success = await updateTransacao(id, transacaoData);
    if (success) {
      toast.success('Transação atualizada com sucesso!');
      // Recarregar transações para manter consistência
      const filters = {
        professionalId: selectedProfessionalId,
        month: selectedMonth,
        year: selectedYear
      };
      const transacoesData = await getTransacoes(filters);
      setTransacoes(transacoesData || []);
    } else {
      toast.error('Erro ao atualizar transação');
    }
    
    return success;
  }, [updateTransacao, getTransacoes, selectedProfessionalId, selectedMonth, selectedYear]);

  const handleDeleteTransacao = useCallback(async (id: string) => {
    console.log('useFinanceiro: Excluindo transação:', id);
    
    const success = await deleteTransacao(id);
    if (success) {
      toast.success('Transação excluída com sucesso!');
      // Recarregar transações para manter consistência
      const filters = {
        professionalId: selectedProfessionalId,
        month: selectedMonth,
        year: selectedYear
      };
      const transacoesData = await getTransacoes(filters);
      setTransacoes(transacoesData || []);
    } else {
      toast.error('Erro ao excluir transação');
    }
    
    return success;
  }, [deleteTransacao, getTransacoes, selectedProfessionalId, selectedMonth, selectedYear]);

  return {
    transacoes,
    profissionais,
    clientes,
    selectedProfessionalId,
    setSelectedProfessionalId,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    serviceFilter,
    setServiceFilter,
    loading,
    handleAddTransacao,
    handleUpdateTransacao,
    handleDeleteTransacao
  };
};
