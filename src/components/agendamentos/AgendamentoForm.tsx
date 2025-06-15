
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from "@/lib/utils";
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

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
];

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

  // Filter out any invalid data that could cause the Select.Item error
  const validClientes = clientes?.filter(cliente => 
    cliente && 
    cliente.id && 
    cliente.id.trim() !== '' && 
    cliente.nome && 
    cliente.nome.trim() !== ''
  ) || [];

  const validServicos = servicos?.filter(servico => 
    servico && 
    servico.id && 
    servico.id.trim() !== '' && 
    servico.nome && 
    servico.nome.trim() !== ''
  ) || [];

  const validProfissionais = profissionais?.filter(profissional => 
    profissional && 
    profissional.id && 
    profissional.id.trim() !== '' && 
    profissional.name && 
    profissional.name.trim() !== ''
  ) || [];

  console.log('Dados válidos:', {
    validClientes: validClientes.length,
    validServicos: validServicos.length,
    validProfissionais: validProfissionais.length
  });

  useEffect(() => {
    console.log('useEffect disparado - editingAgendamento:', editingAgendamento);
    
    if (editingAgendamento) {
      // Find client by name
      const cliente = validClientes.find(c => c.nome === editingAgendamento.client_name);
      
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
  }, [editingAgendamento, validClientes]);

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
    const servico = validServicos.find(s => s.id === servicoId);
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
          <div className="space-y-2">
            <Label htmlFor="cliente">Selecione o Cliente</Label>
            {validClientes.length === 0 ? (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  Nenhum cliente válido encontrado. Cadastre um cliente primeiro.
                </p>
              </div>
            ) : (
              <Select 
                value={formData.clienteId} 
                onValueChange={handleClienteChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {validClientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nome} {cliente.telefone ? `- ${cliente.telefone}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="servico">Serviço</Label>
            {validServicos.length === 0 ? (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  Nenhum serviço válido encontrado. Cadastre um serviço primeiro.
                </p>
              </div>
            ) : (
              <Select 
                value={formData.servicoId} 
                onValueChange={handleServicoChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {validServicos.map((servico) => (
                    <SelectItem key={servico.id} value={servico.id}>
                      {servico.nome} - R$ {servico.preco.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor">Valor do Serviço (R$)</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={formData.servicoValor}
              onChange={handleValorChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profissional">Profissional (Opcional)</Label>
            <Select 
              value={formData.profissionalId} 
              onValueChange={handleProfissionalChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Escolha um profissional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Não definir profissional</SelectItem>
                {validProfissionais.map((profissional) => (
                  <SelectItem key={profissional.id} value={profissional.id}>
                    {profissional.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.data && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.data ? (
                      format(new Date(formData.data), "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione a data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.data ? new Date(formData.data) : undefined}
                    onSelect={handleDateSelect}
                    locale={ptBR}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="horario">Horário</Label>
              <Select 
                value={formData.horario} 
                onValueChange={handleHorarioChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Horário" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

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
