
import { useState, useEffect, useCallback } from 'react';
import { useSupabase, type Transacao, type Profissional } from '@/hooks/useSupabase';
import { toast } from 'sonner';

export const useFinanceiro = () => {
  const { 
    getTransacoes, 
    addTransacao, 
    updateTransacao,
    getProfissionais,
    loading 
  } = useSupabase();
  
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('');

  // Carregar profissionais
  useEffect(() => {
    const loadProfissionais = async () => {
      console.log('useFinanceiro: Carregando profissionais...');
      try {
        const profissionaisData = await getProfissionais();
        const validProfissionais = (profissionaisData || []).filter(profissional => 
          profissional && profissional.id && profissional.name && 
          profissional.id.trim() !== '' && profissional.name.trim() !== ''
        );
        setProfissionais(validProfissionais);
        console.log('useFinanceiro: Profissionais carregados:', validProfissionais.length);
      } catch (error) {
        console.error('useFinanceiro: Erro ao carregar profissionais:', error);
        toast.error('Erro ao carregar profissionais');
      }
    };

    loadProfissionais();
  }, [getProfissionais]);

  // Carregar transações (recarrega quando os filtros mudam)
  useEffect(() => {
    const loadTransacoes = async () => {
      console.log('useFinanceiro: Carregando transações com filtros:', {
        professionalId: selectedProfessionalId,
        serviceFilter
      });
      try {
        const filters = {
          professionalId: selectedProfessionalId,
          serviceFilter: serviceFilter
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
  }, [getTransacoes, selectedProfessionalId, serviceFilter]);

  const handleAddTransacao = useCallback(async (transacaoData: Omit<Transacao, 'id' | 'user_id' | 'created_at'>) => {
    console.log('useFinanceiro: Adicionando transação:', transacaoData);
    
    const success = await addTransacao(transacaoData);
    if (success) {
      toast.success('Transação adicionada com sucesso!');
      // Recarregar transações
      const filters = {
        professionalId: selectedProfessionalId,
        serviceFilter: serviceFilter
      };
      const transacoesData = await getTransacoes(filters);
      setTransacoes(transacoesData || []);
    } else {
      toast.error('Erro ao adicionar transação');
    }
    
    return success;
  }, [addTransacao, getTransacoes, selectedProfessionalId, serviceFilter]);

  const handleUpdateTransacao = useCallback(async (id: string, transacaoData: Partial<Transacao>) => {
    console.log('useFinanceiro: Atualizando transação:', id, transacaoData);
    
    const success = await updateTransacao(id, transacaoData);
    if (success) {
      toast.success('Transação atualizada com sucesso!');
      // Update local list
      setTransacoes(prev => prev.map(t => 
        t.id === id ? { ...t, ...transacaoData } : t
      ));
    } else {
      toast.error('Erro ao atualizar transação');
    }
    
    return success;
  }, [updateTransacao]);

  return {
    transacoes,
    profissionais,
    selectedProfessionalId,
    setSelectedProfessionalId,
    serviceFilter,
    setServiceFilter,
    loading,
    handleAddTransacao,
    handleUpdateTransacao
  };
};
