
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ClientSelector } from './ClientSelector';
import { ServiceSelector } from './ServiceSelector';
import { ProfessionalSelector } from './ProfessionalSelector';
import { DateTimeSelector } from './DateTimeSelector';
import { type Cliente, type Servico, type Profissional } from '@/hooks/useSupabase';

interface FormFieldsProps {
  formData: {
    clienteId: string;
    servicoId: string;
    profissionalId: string;
    servicoValor: string;
    data: string;
    horario: string;
    observacoes: string;
  };
  updateFormData: (updates: Partial<FormFieldsProps['formData']>) => void;
  clientes: Cliente[];
  servicos: Servico[];
  profissionais: Profissional[];
}

// Função auxiliar para converter Date em string YYYY-MM-DD de forma segura (ainda usada só para display)
const formatDateToYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const FormFields: React.FC<FormFieldsProps> = ({
  formData,
  updateFormData,
  clientes,
  servicos,
  profissionais
}) => {
  const handleServicoChange = (servicoId: string) => {
    const servico = servicos.find(s => s.id === servicoId);
    updateFormData({ 
      servicoId,
      servicoValor: servico ? servico.preco.toString() : ''
    });
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ servicoValor: e.target.value });
  };

  // AGORA recebe string ou undefined do DateTimeSelector
  const handleDateSelect = (dateString: string | undefined) => {
    updateFormData({ data: dateString || '' });
  };

  return (
    <div className="space-y-4">
      <ClientSelector
        value={formData.clienteId}
        onChange={(value) => updateFormData({ clienteId: value })}
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
        onChange={(value) => updateFormData({ profissionalId: value })}
        profissionais={profissionais}
      />

      <DateTimeSelector
        data={formData.data}
        horario={formData.horario}
        onDateSelect={handleDateSelect}
        onHorarioChange={(value) => updateFormData({ horario: value })}
      />

      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações (Opcional)</Label>
        <Textarea
          id="observacoes"
          placeholder="Digite observações sobre o agendamento..."
          value={formData.observacoes}
          onChange={(e) => updateFormData({ observacoes: e.target.value })}
          rows={3}
        />
      </div>
    </div>
  );
};
