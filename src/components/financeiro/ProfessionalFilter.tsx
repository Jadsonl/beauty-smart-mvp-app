
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Profissional } from '@/hooks/useSupabase';

interface ProfessionalFilterProps {
  value: string;
  onChange: (value: string) => void;
  profissionais: Profissional[];
}

export const ProfessionalFilter: React.FC<ProfessionalFilterProps> = ({
  value,
  onChange,
  profissionais
}) => {
  const validProfissionais = profissionais?.filter(profissional => 
    profissional && 
    profissional.id && 
    profissional.id.trim() !== '' && 
    profissional.name && 
    profissional.name.trim() !== ''
  ) || [];

  console.log('ProfessionalFilter: Renderizado com', validProfissionais.length, 'profissionais válidos');

  return (
    <div className="space-y-2">
      <Label htmlFor="profissional-filter">Filtrar por Profissional</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Todos os profissionais" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os profissionais</SelectItem>
          {validProfissionais.map((profissional) => (
            <SelectItem key={profissional.id} value={profissional.id}>
              {profissional.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
