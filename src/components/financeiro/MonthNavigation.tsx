import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MonthNavigationProps {
  currentMonth: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onCurrentMonth: () => void;
}

export const MonthNavigation: React.FC<MonthNavigationProps> = ({
  currentMonth,
  onPreviousMonth,
  onNextMonth,
  onCurrentMonth
}) => {
  const isCurrentMonth = () => {
    const now = new Date();
    return currentMonth.getMonth() === now.getMonth() && 
           currentMonth.getFullYear() === now.getFullYear();
  };

  return (
    <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
      <Button
        variant="outline"
        size="sm"
        onClick={onPreviousMonth}
        className="flex items-center gap-2"
      >
        <ChevronLeft className="h-4 w-4" />
        Anterior
      </Button>
      
      <div className="flex flex-col items-center gap-2">
        <h3 className="font-semibold text-lg">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h3>
        {!isCurrentMonth() && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCurrentMonth}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Voltar para o mês atual
          </Button>
        )}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onNextMonth}
        className="flex items-center gap-2"
      >
        Próximo
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};