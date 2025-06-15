
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AgendamentoCard } from './AgendamentoCard';
import { type Agendamento, type Servico, type Profissional } from '@/hooks/useSupabase';

interface AgendamentosListProps {
  agendamentos: Agendamento[];
  servicos: Servico[];
  profissionais: Profissional[];
  onCreateNew: () => void;
  onEdit: (agendamento: Agendamento) => void;
  onDelete: (agendamento: Agendamento) => void;
  onStatusChange: (agendamento: Agendamento, newStatus: string) => void;
}

export const AgendamentosList: React.FC<AgendamentosListProps> = ({
  agendamentos,
  servicos,
  profissionais,
  onCreateNew,
  onEdit,
  onDelete,
  onStatusChange
}) => {
  const sortedAgendamentos = [...agendamentos].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Lista de Agendamentos</CardTitle>
        <CardDescription className="text-sm">
          {agendamentos.length === 0 
            ? 'Nenhum agendamento cadastrado ainda.' 
            : `${agendamentos.length} agendamento${agendamentos.length > 1 ? 's' : ''} cadastrado${agendamentos.length > 1 ? 's' : ''}`
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {agendamentos.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <span className="text-4xl sm:text-6xl mb-4 block">📅</span>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              Nenhum agendamento cadastrado
            </h3>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
              Comece criando seu primeiro agendamento!
            </p>
            <Button 
              className="bg-pink-600 hover:bg-pink-700 w-full sm:w-auto"
              onClick={onCreateNew}
            >
              + Criar Primeiro Agendamento
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedAgendamentos.map((agendamento) => (
              <AgendamentoCard
                key={agendamento.id}
                agendamento={agendamento}
                servicos={servicos}
                profissionais={profissionais}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
