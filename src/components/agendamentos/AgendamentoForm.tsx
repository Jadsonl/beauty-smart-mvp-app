
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { type Agendamento, type Cliente, type Servico, type Profissional } from '@/hooks/useSupabase';
import { ClientSelector } from './ClientSelector';
import { ServiceSelector } from './ServiceSelector';
import { ProfessionalSelector } from './ProfessionalSelector';
import { DateTimeSelector } from './DateTimeSelector';

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
    loading
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

  const handleClienteChange = (clienteId: string) => {
    console.log('Cliente selecionado:', clienteId);
    setFormData(prev => ({ ...prev, clienteId }));
  };

  const handleServicoChange = (servicoId: string) => {
    console.log('Serviço selecionado:', servicoId);
    setFormData(prev => ({ ...prev, servicoId }));
    
    // Pre-fill service value
    const servico = servicos.find(s => s.id === servicoId);
    if (servico) {
      console.log('Preenchendo valor do serviço:', servico.preco);
      setFormData(prev => ({ ...prev, servicoValor: servico.preco.toString() }));
    }
  };

  const handleProfissionalChange = (profissionalId: string) => {
    console.log('Profissional selecionado:', profissionalId);
    setFormData(prev => ({ ...prev, profissionalId }));
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Valor alterado:', e.target.value);
    setFormData(prev => ({ ...prev, servicoValor: e.target.value }));
  };

  const handleHorarioChange = (horario: string) => {
    console.log('Horário selecionado:', horario);
    setFormData(prev => ({ ...prev, horario }));
  };

  const handleObservacoesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Observações alteradas:', e.target.value);
    setFormData(prev => ({ ...prev, observacoes: e.target.value }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      console.log('Data selecionada:', formattedDate);
      setFormData(prev => ({ 
        ...prev, 
        data: formattedDate 
      }));
    }
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

  // Check if form is valid for submission
  const isFormValid = formData.clienteId && formData.servicoId && formData.data && formData.horario;
  console.log('Formulário válido:', isFormValid, {
    clienteId: !!formData.clienteId,
    servicoId: !!formData.servicoId,
    data: !!formData.data,
    horario: !!formData.horario
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {editingAgendamento ? 'Editar Agendamento' : 'Novo Agendamento'}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {editingAgendamento 
              ? 'Edite as informações do agendamento.' 
              : 'Preencha os dados para criar um novo agendamento.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <ClientSelector
            value={formData.clienteId}
            onChange={handleClienteChange}
            clientes={clientes}
          />

          <ServiceSelector
            servicoId={formData.servicoId}
            servicoValor={formData.servicoValor}
            onServicoChange={handleServicoChange}
            onValorChange={handleValorChange}
            servicos={servicos}
          />

          <ProfessionalSelector
            value={formData.profissionalId}
            onChange={handleProfissionalChange}
            profissionais={profissionais}
          />

          <DateTimeSelector
            data={formData.data}
            horario={formData.horario}
            onDateSelect={handleDateSelect}
            onHorarioChange={handleHorarioChange}
          />

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações (Opcional)</Label>
            <Input
              id="observacoes"
              placeholder="Observações adicionais"
              value={formData.observacoes}
              onChange={handleObservacoesChange}
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-pink-600 hover:bg-pink-700 w-full sm:w-auto"
              disabled={!isFormValid || loading}
            >
              {editingAgendamento ? 'Salvar Alterações' : 'Salvar Agendamento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
