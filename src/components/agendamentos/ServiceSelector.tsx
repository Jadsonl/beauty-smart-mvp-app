
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Servico } from '@/hooks/useSupabase';

interface ServiceSelectorProps {
  servicoId: string;
  servicoValor: string;
  onServicoChange: (value: string) => void;
  onValorChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  servicos: Servico[];
}

export const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  servicoId,
  servicoValor,
  onServicoChange,
  onValorChange,
  servicos
}) => {
  const validServicos = servicos?.filter(servico => 
    servico && 
    servico.id && 
    servico.id.trim() !== '' && 
    servico.nome && 
    servico.nome.trim() !== ''
  ) || [];

  console.log('ServiceSelector: Renderizado com', validServicos.length, 'serviços válidos');

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="servico">Serviço</Label>
        {validServicos.length === 0 ? (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              Nenhum serviço válido encontrado. Cadastre um serviço primeiro.
            </p>
          </div>
        ) : (
          <Select value={servicoId} onValueChange={onServicoChange}>
            <SelectTrigger>
              <SelectValue placeholder="Escolha um serviço" />
            </SelectTrigger>
            <SelectContent>
              {validServicos.map((servico) => (
                <SelectItem key={servico.id} value={servico.id}>
                  {servico.nome} - R$ {servico.preco.toFixed(2)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="valor">Valor do Serviço (R$)</Label>
        <Input
          id="valor"
          type="number"
          step="0.01"
          placeholder="0,00"
          value={servicoValor}
          onChange={onValorChange}
        />
      </div>
    </>
  );
};
