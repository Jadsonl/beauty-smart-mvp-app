
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';

interface ServiceFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export const ServiceFilter: React.FC<ServiceFilterProps> = ({
  value,
  onChange
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="service-filter">Buscar por Serviço</Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          id="service-filter"
          type="text"
          placeholder="Digite o nome do serviço..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
};
