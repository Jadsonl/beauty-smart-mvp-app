
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from "@/lib/utils";

interface DateTimeSelectorProps {
  data: string;
  horario: string;
  /** 
   * agora: Recebe YYYY-MM-DD ou undefined
   */
  onDateSelect: (date: string | undefined) => void;
  onHorarioChange: (horario: string) => void;
}

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
];

// Função auxiliar para converter Date em string YYYY-MM-DD SEM FUSO (base local)
const formatDateToYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Função auxiliar para converter string YYYY-MM-DD em Date LOCAL ("yyyy-mm-dd" -> local 00:00)
const parseYYYYMMDDToDate = (dateString: string): Date | null => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

export const DateTimeSelector: React.FC<DateTimeSelectorProps> = ({
  data,
  horario,
  onDateSelect,
  onHorarioChange
}) => {
  // Corrigir a seleção para sempre usar timezone local
  const selectedDate = data ? parseYYYYMMDDToDate(data) : undefined;

  // Agora, ao selecionar uma data, já retorna string YYYY-MM-DD
  const handleDateSelect = (selected: Date | undefined) => {
    if (selected) {
      const formattedDate = formatDateToYYYYMMDD(selected);
      onDateSelect(formattedDate); // --> sempre string
    } else {
      onDateSelect(undefined);
    }
  };

  return (
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
                !data && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? (
                format(selectedDate, "dd/MM/yyyy", { locale: ptBR })
              ) : (
                <span>Selecione a data</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
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
        <Select value={horario} onValueChange={onHorarioChange}>
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
  );
};
