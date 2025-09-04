
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { type Transacao, type Profissional, type Cliente } from '@/hooks/useSupabase';

interface TransacaoEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  transacao: Transacao | null;
  profissionais: Profissional[];
  clientes: Cliente[];
  onSave: (transacaoId: string, updatedData: Partial<Transacao>) => Promise<boolean>;
  loading: boolean;
}

export const TransacaoEditModal: React.FC<TransacaoEditModalProps> = ({
  isOpen,
  onClose,
  transacao,
  profissionais,
  clientes,
  onSave,
  loading
}) => {
  const [formData, setFormData] = useState({
    tipo: 'receita' as 'receita' | 'despesa',
    nome: '',
    descricao: '',
    valor: '',
    data: new Date(),
    professional_id: 'despesa-nenhum-profissional',
    client_id: 'no-client'
  });

  useEffect(() => {
    if (transacao) {
      // Parse YYYY-MM-DD to local Date to avoid timezone shift
      let parsedDate = new Date();
      if (transacao.data) {
        const m = (transacao.data as string).match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (m) {
          const [_, y, mo, d] = m;
          parsedDate = new Date(Number(y), Number(mo) - 1, Number(d));
        }
      }

      setFormData({
        tipo: transacao.tipo,
        nome: transacao.nome || '',
        descricao: transacao.descricao,
        valor: transacao.valor.toString(),
        data: parsedDate,
        professional_id: transacao.professional_id || 'despesa-nenhum-profissional',
        client_id: transacao.client_id || 'no-client'
      });
    }
  }, [transacao]);

  // Filtrar profissionais válidos para evitar valores vazios
  const validProfissionais = profissionais.filter(prof => 
    prof && prof.id && prof.id.trim() !== '' && prof.name && prof.name.trim() !== ''
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transacao) return;

    // Garantir data exata selecionada (YYYY-MM-DD, sem fuso)
    const y = formData.data.getFullYear();
    const m = String(formData.data.getMonth() + 1).padStart(2, '0');
    const d = String(formData.data.getDate()).padStart(2, '0');
    const dateString = `${y}-${m}-${d}`;

    const updatedData: Partial<Transacao> = {
      tipo: formData.tipo,
      nome: formData.nome || null,
      descricao: formData.descricao,
      valor: parseFloat(formData.valor),
      data: dateString,
      professional_id: formData.professional_id === 'despesa-nenhum-profissional' ? null : formData.professional_id,
      client_id: formData.client_id === 'no-client' ? null : formData.client_id
    };

    const success = await onSave(transacao.id, updatedData);
    if (success) {
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!transacao) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Transação</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value: 'receita' | 'despesa') => setFormData({ ...formData, tipo: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="receita">Receita</SelectItem>
                <SelectItem value="despesa">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.tipo === 'despesa' && (
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Despesa</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Digite o nome da despesa"
                required
              />
            </div>
          )}

          {formData.tipo === 'receita' && (
            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente (Opcional)</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => setFormData({ ...formData, client_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-client">Nenhum cliente (venda de produto/serviço geral)</SelectItem>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="descricao">
              {formData.tipo === 'despesa' ? 'Descrição (Opcional)' : 'Descrição/Serviço'}
            </Label>
            <Input
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder={
                formData.tipo === 'despesa' 
                  ? 'Detalhes adicionais (opcional)' 
                  : 'Ex: Corte de cabelo, Manicure, etc.'
              }
              required={formData.tipo === 'receita'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor">Valor</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              min="0"
              value={formData.valor}
              onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
              placeholder="0,00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.data && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.data ? format(formData.data, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.data}
                  onSelect={(date) => date && setFormData({ ...formData, data: date })}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="professional">Profissional</Label>
            <Select
              value={formData.professional_id}
              onValueChange={(value) => setFormData({ ...formData, professional_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um profissional (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="despesa-nenhum-profissional">Despesa / Nenhum Profissional</SelectItem>
                {validProfissionais.map((prof) => (
                  <SelectItem key={prof.id} value={prof.id}>
                    {prof.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
