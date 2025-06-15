
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Mail, Phone, User, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { type Agendamento, type Servico, type Profissional } from '@/hooks/useSupabase';

interface AgendamentoCardProps {
  agendamento: Agendamento;
  servicos: Servico[];
  profissionais: Profissional[];
  onEdit: (agendamento: Agendamento) => void;
  onDelete: (agendamento: Agendamento) => void;
  onStatusChange: (agendamento: Agendamento, newStatus: string) => void;
}

export const AgendamentoCard: React.FC<AgendamentoCardProps> = ({
  agendamento,
  servicos,
  profissionais,
  onEdit,
  onDelete,
  onStatusChange
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Agendado';
      case 'confirmed':
        return 'Confirmado';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Desconhecido';
    }
  };

  const servico = servicos.find(s => s.id === agendamento.service_id);
  const profissional = profissionais.find(p => p.id === agendamento.professional_id);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-base sm:text-lg text-gray-900">
              {agendamento.client_name}
            </CardTitle>
            <CardDescription className="text-sm">
              {agendamento.service || servico?.nome || 'Serviço não encontrado'}
            </CardDescription>
          </div>
          <Badge className={`${getStatusColor(agendamento.status)} shrink-0`}>
            {getStatusText(agendamento.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4 text-pink-600" />
            <span>{format(new Date(agendamento.date), 'dd/MM/yyyy', { locale: ptBR })}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="h-4 w-4 text-pink-600" />
            <span>{agendamento.time}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="h-4 w-4 text-pink-600" />
            <span className="truncate">{agendamento.client_email}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Phone className="h-4 w-4 text-pink-600" />
            <span>{agendamento.client_phone}</span>
          </div>
        </div>

        {profissional && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="h-4 w-4 text-pink-600" />
            <span>Profissional: {profissional.name}</span>
          </div>
        )}

        {agendamento.service_value_at_appointment && (
          <div className="text-sm font-medium text-green-600">
            Valor: R$ {agendamento.service_value_at_appointment.toFixed(2)}
          </div>
        )}

        {agendamento.notes && (
          <div className="text-sm text-gray-600">
            <strong>Observações:</strong> {agendamento.notes}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <div className="flex-1">
            <Select
              value={agendamento.status}
              onValueChange={(newStatus) => onStatusChange(agendamento, newStatus)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Alterar status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Agendado</SelectItem>
                <SelectItem value="confirmed">Confirmado</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(agendamento)}
              className="flex items-center gap-1"
            >
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline">Editar</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(agendamento)}
              className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Excluir</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
