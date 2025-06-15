
import React, { useState } from 'react';
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
import { type Transacao, type Profissional } from '@/hooks/useSupabase';

interface AdicionarTransacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  profissionais: Profissional[];
  onSave: (transacaoData: Omit<Transacao, 'id' | 'user_id' | 'created_at'>) => Promise<boolean>;
  loading: boolean;
}

export const AdicionarTransacaoModal: React.FC<AdicionarTransacaoModalProps> = ({
  isOpen,
  onClose,
  profissionais,
  onSave,
  loading
}) => {
  const [formData, setFormData] = useState({
    tipo: 'receita' as 'receita' | 'despesa',
    descricao: '',
    valor: '',
    data: new Date(),
    professional_id: 'none'
  });

  // Filtrar profissionais válidos para evitar valores vazios
  const validProfissionais = profissionais.filter(prof => 
    prof && prof.id && prof.id.trim() !== '' && prof.name && prof.name.trim() !== ''
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const transacaoData: Omit<Transacao, 'id' | 'user_id' | 'created_at'> = {
      tipo: formData.tipo,
      descricao: formData.descricao,
      valor: parseFloat(formData.valor),
      data: format(formData.data, 'yyyy-MM-dd'),
      professional_id: formData.professional_id === 'none' ? null : formData.professional_id,
      agendamento_id: null
    };

    const success = await onSave(transacaoData);
    if (success) {
      // Resetar formulário
      setFormData({
        tipo: 'receita',
        descricao: '',
        valor: '',
        data: new Date(),
        professional_id: 'none'
      });
      onClose();
    }
  };

  const handleClose = () => {
    // Resetar formulário ao fechar
    setFormData({
      tipo: 'receita',
      descricao: '',
      valor: '',
      data: new Date(),
      professional_id: 'none'
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Lançamento</DialogTitle>
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

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Digite a descrição do lançamento"
              required
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
            <Label htmlFor="professional">Profissional (Opcional)</Label>
            <Select
              value={formData.professional_id}
              onValueChange={(value) => setFormData({ ...formData, professional_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um profissional (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum profissional / Despesa</SelectItem>
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
              {loading ? 'Salvando...' : 'Salvar Lançamento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
