
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useSupabase } from '@/hooks/useSupabase';
import { Calendar, Clock, User, Phone, Mail, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Agendamento {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  service: string;
  date: string;
  time: string;
  status: string;
  notes?: string;
}

const HistoricoAgendamentos = () => {
  const { getAgendamentosByMonth, loading } = useSupabase();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    loadAgendamentos();
  }, [selectedMonth, selectedYear]);

  const loadAgendamentos = async () => {
    try {
      const data = await getAgendamentosByMonth(selectedMonth, selectedYear);
      setAgendamentos(data);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { label: 'Agendado', variant: 'default' as const },
      completed: { label: 'Concluído', variant: 'secondary' as const },
      cancelled: { label: 'Cancelado', variant: 'destructive' as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'default' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      return `${hours}:${minutes}`;
    } catch {
      return timeString;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Histórico de Agendamentos
        </CardTitle>
        
        <div className="flex gap-4 mt-4">
          <div className="flex-1">
            <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(Number(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1">
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o ano" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Carregando agendamentos...</p>
          </div>
        ) : agendamentos.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">
              Nenhum agendamento encontrado para {months.find(m => m.value === selectedMonth)?.label} de {selectedYear}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {agendamentos.map((agendamento) => (
              <div key={agendamento.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-600" />
                      <span className="font-medium">{agendamento.client_name}</span>
                      {getStatusBadge(agendamento.status)}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(agendamento.date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatTime(agendamento.time)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">Serviço:</p>
                    <p>{agendamento.service}</p>
                  </div>
                  
                  {agendamento.client_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-600" />
                      <span>{agendamento.client_email}</span>
                    </div>
                  )}
                  
                  {agendamento.client_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-600" />
                      <span>{agendamento.client_phone}</span>
                    </div>
                  )}
                  
                  {agendamento.notes && (
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-4 w-4 text-gray-600" />
                        <span className="font-medium text-gray-700">Observações:</span>
                      </div>
                      <p className="text-gray-600">{agendamento.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HistoricoAgendamentos;
