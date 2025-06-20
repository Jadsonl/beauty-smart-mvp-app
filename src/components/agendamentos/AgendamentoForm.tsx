
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormFields } from './FormFields';
import { FormActions } from './FormActions';
import { type Agendamento, type Cliente, type Servico, type Profissional } from '@/hooks/useSupabase';

interface AgendamentoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any, editingAgendamento: Agendamento | null) => Promise<boolean>;
  editingAgendamento: Agendamento | null;
  clientes: Cliente[];
  servicos: Servico[];
  profissionais: Profissional[];
  loading: boolean;
}

export const AgendamentoForm: React.FC<AgendamentoFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingAgendamento,
  clientes,
  servicos,
  profissionais,
  loading
}) => {
  const [formData, setFormData] = useState({
    clienteId: '',
    servicoId: '',
    profissionalId: '',
    servicoValor: '',
    data: '',
    horario: '',
    observacoes: ''
  });

  console.log('AgendamentoForm renderizado:', {
    isOpen,
    formData,
    clientes: clientes?.length || 0,
    servicos: servicos?.length || 0,
    profissionais: profissionais?.length || 0,
    loading,
    hasValidClientes: clientes && clientes.length > 0,
    hasValidServicos: servicos && servicos.length > 0
  });

  useEffect(() => {
    console.log('useEffect disparado - editingAgendamento:', editingAgendamento);
    
    if (editingAgendamento) {
      // Find client by name
      const cliente = clientes.find(c => c.nome === editingAgendamento.client_name);
      
      const newFormData = {
        clienteId: cliente?.id || '',
        servicoId: editingAgendamento.service_id || '',
        profissionalId: editingAgendamento.professional_id || '',
        servicoValor: editingAgendamento.service_value_at_appointment?.toString() || '',
        data: editingAgendamento.date,
        horario: editingAgendamento.time,
        observacoes: editingAgendamento.notes || ''
      };
      
      console.log('Preenchendo formulário com dados de edição:', newFormData);
      setFormData(newFormData);
    } else {
      resetForm();
    }
  }, [editingAgendamento, clientes]);

  const resetForm = () => {
    console.log('Resetando formulário');
    setFormData({
      clienteId: '',
      servicoId: '',
      profissionalId: '',
      servicoValor: '',
      data: '',
      horario: '',
      observacoes: ''
    });
  };

  const updateFormData = (updates: Partial<typeof formData>) => {
    console.log('Atualizando formData:', updates);
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submetendo formulário:', formData);
    
    const success = await onSubmit(formData, editingAgendamento);
    if (success) {
      resetForm();
      onClose();
    }
  };

  const handleClose = () => {
    console.log('Fechando modal');
    resetForm();
    onClose();
  };

  // Check if form is valid for submission - CORRECTED LOGIC
  const isFormValid = Boolean(
    formData.clienteId && 
    formData.servicoId && 
    formData.data && 
    formData.horario &&
    clientes.length > 0 &&
    servicos.length > 0
  );
  
  console.log('Formulário válido:', isFormValid, {
    clienteId: !!formData.clienteId,
    servicoId: !!formData.servicoId,
    data: !!formData.data,
    horario: !!formData.horario,
    hasClientes: clientes.length > 0,
    hasServicos: servicos.length > 0
  });

  // Show loading state if data is still being fetched
  if (!clientes || !servicos || !profissionais) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando dados...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingAgendamento ? 'Editar Agendamento' : 'Novo Agendamento'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormFields
            formData={formData}
            updateFormData={updateFormData}
            clientes={clientes}
            servicos={servicos}
            profissionais={profissionais}
          />

          <FormActions
            isFormValid={isFormValid}
            loading={loading}
            editingAgendamento={editingAgendamento}
            onClose={handleClose}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};
