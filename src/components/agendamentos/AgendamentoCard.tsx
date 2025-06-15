
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { type Agendamento, type Servico, type Profissional } from '@/hooks/useSupabase';

interface AgendamentoCardProps {
  agendamento: Agendamento;
  servicos: Servico[];
  profissionais: Profissional[];
  onEdit: (agendamento: Agendamento) => void;
  onDelete: (agendamento: Agendamento) => void;
  onStatusChange: (agendamento: Agendamento, newStatus: string) => void;
}

const statusOptions = [
  { value: 'scheduled', label: 'Agendado', color: 'bg-blue-100 text-blue-800' },
  { value: 'confirmed', label: 'Confirmado', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'completed', label: 'Concluído', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-red-100 text-red-800' }
];

export const AgendamentoCard: React.FC<AgendamentoCardProps> = ({
  agendamento,
  servicos,
  profissionais,
  onEdit,
  onDelete,
  onStatusChange
}) => {
  const getServiceName = (serviceId: string, serviceName: string) => {
    const servico = servicos.find(s => s.id === serviceId);
    return servico ? servico.nome : serviceName;
  };

  const getProfessionalName = (professionalId: string) => {
    const profissional = profissionais.find(p => p.id === professionalId);
    return profissional ? profissional.name : 'Não definido';
  };

  const getStatusConfig = (status: string) => {
    return statusOptions.find(opt => opt.value === status) || statusOptions[0];
  };

  const statusConfig = getStatusConfig(agendamento.status || 'scheduled');

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow gap-4">
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
          <h3 className="font-semibold text-base sm:text-lg">{agendamento.client_name}</h3>
          <Select
            value={agendamento.status || 'scheduled'}
            onValueChange={(value) => onStatusChange(agendamento, value)}
          >
            <SelectTrigger className="w-fit">
              <span className={cn(
                "px-2 py-1 text-xs font-medium rounded-full",
                statusConfig.color
              )}>
                {statusConfig.label}
              </span>
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Serviço:</span>
            <p className="truncate">{getServiceName(agendamento.service_id || '', agendamento.service)}</p>
          </div>
          <div>
            <span className="font-medium">Profissional:</span>
            <p className="truncate">{getProfessionalName(agendamento.professional_id || '')}</p>
          </div>
          <div>
            <span className="font-medium">Data:</span>
            <p>{format(new Date(agendamento.date), 'dd/MM/yyyy', { locale: ptBR })}</p>
          </div>
          <div>
            <span className="font-medium">Horário:</span>
            <p>{agendamento.time}</p>
          </div>
          {agendamento.service_value_at_appointment && (
            <div>
              <span className="font-medium">Valor:</span>
              <p className="text-green-600 font-medium">R$ {agendamento.service_value_at_appointment.toFixed(2)}</p>
            </div>
          )}
          {agendamento.notes && (
            <div className="sm:col-span-2 lg:col-span-1">
              <span className="font-medium">Obs:</span>
              <p className="truncate">{agendamento.notes}</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2 self-end sm:self-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(agendamento)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(agendamento)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
