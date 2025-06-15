
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Profissional } from '@/hooks/useSupabase';

interface ProfessionalSelectorProps {
  value: string;
  onChange: (value: string) => void;
  profissionais: Profissional[];
}

export const ProfessionalSelector: React.FC<ProfessionalSelectorProps> = ({
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

  console.log('ProfessionalSelector: Renderizado com', validProfissionais.length, 'profissionais válidos');

  return (
    <div className="space-y-2">
      <Label htmlFor="profissional">Profissional (Opcional)</Label>
      <Select value={value} onValueChange={onChange}>
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
  );
};
