
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Cliente } from '@/hooks/useSupabase';

interface ClientSelectorProps {
  value: string;
  onChange: (value: string) => void;
  clientes: Cliente[];
}

export const ClientSelector: React.FC<ClientSelectorProps> = ({
  value,
  onChange,
  clientes
}) => {
  const validClientes = clientes?.filter(cliente => 
    cliente && 
    cliente.id && 
    cliente.id.trim() !== '' && 
    cliente.nome && 
    cliente.nome.trim() !== ''
  ) || [];

  console.log('ClientSelector: Renderizado com', validClientes.length, 'clientes válidos');

  return (
    <div className="space-y-2">
      <Label htmlFor="cliente">Selecione o Cliente</Label>
      {validClientes.length === 0 ? (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            Nenhum cliente válido encontrado. Cadastre um cliente primeiro.
          </p>
        </div>
      ) : (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Escolha um cliente" />
          </SelectTrigger>
          <SelectContent>
            {validClientes.map((cliente) => (
              <SelectItem key={cliente.id} value={cliente.id}>
                {cliente.nome} {cliente.telefone ? `- ${cliente.telefone}` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};
