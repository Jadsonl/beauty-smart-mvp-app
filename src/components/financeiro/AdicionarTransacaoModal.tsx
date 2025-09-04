
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
import { type Transacao, type Profissional, type Cliente, type Produto } from '@/hooks/useSupabase';
import { useServicos, type Servico } from '@/hooks/supabase/useServicos';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AdicionarTransacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  profissionais: Profissional[];
  clientes: Cliente[];
  produtos?: Produto[];
  onSave: (transacaoData: Omit<Transacao, 'id' | 'user_id' | 'created_at'>) => Promise<boolean>;
  loading: boolean;
}

export const AdicionarTransacaoModal: React.FC<AdicionarTransacaoModalProps> = ({
  isOpen,
  onClose,
  profissionais,
  clientes,
  produtos = [],
  onSave,
  loading
}) => {
  const { getServicos } = useServicos();
  const { user } = useAuth();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [formData, setFormData] = useState({
    tipo: 'receita' as 'receita' | 'despesa',
    nome: '',
    descricao: '',
    valor: '',
    data: new Date(),
    professional_id: 'despesa-nenhum-profissional',
    client_id: 'no-client',
    product_id: 'no-product',
    service_id: 'no-service'
  });
  const [productQuantity, setProductQuantity] = useState<number>(1);

  // Carregar serviços
  React.useEffect(() => {
    const loadServicos = async () => {
      const servicosData = await getServicos();
      setServicos(servicosData);
    };
    if (isOpen) {
      loadServicos();
    }
  }, [getServicos, isOpen]);

  // Filtrar profissionais válidos para evitar valores vazios
  const validProfissionais = profissionais.filter(prof => 
    prof && prof.id && prof.id.trim() !== '' && prof.name && prof.name.trim() !== ''
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Garantir descrição válida para receitas
    let descricaoFinal = formData.descricao?.trim() || '';
    if (formData.tipo === 'receita' && descricaoFinal === '') {
      descricaoFinal = 'Venda';
    }

    const transacaoData: Omit<Transacao, 'id' | 'user_id' | 'created_at'> = {
      tipo: formData.tipo,
      nome: formData.nome || null,
      descricao: descricaoFinal,
      valor: parseFloat(formData.valor),
      data: format(formData.data, 'yyyy-MM-dd'),
      professional_id: formData.professional_id === 'despesa-nenhum-profissional' ? null : formData.professional_id,
      client_id: formData.client_id === 'no-client' ? null : formData.client_id,
      agendamento_id: null
    };

    const success = await onSave(transacaoData);
    if (success) {
      // Se foi uma venda de produto, atualizar inventário (subtrair quantidade)
      try {
        if (
          user?.id &&
          formData.tipo === 'receita' &&
          formData.product_id !== 'no-product' &&
          productQuantity > 0
        ) {
          const { data: inv, error: invErr } = await supabase
            .from('product_inventory')
            .select('id, quantity')
            .eq('user_id', user.id)
            .eq('product_id', formData.product_id)
            .maybeSingle();

          if (!invErr && inv) {
            const newQty = Math.max(0, Number(inv.quantity || 0) - productQuantity);
            await supabase
              .from('product_inventory')
              .update({ quantity: newQty })
              .eq('id', inv.id)
              .eq('user_id', user.id);
          }
        }
      } catch (err) {
        console.error('Falha ao atualizar inventário após venda:', err);
      }

      // Resetar formulário
      setFormData({
        tipo: 'receita',
        nome: '',
        descricao: '',
        valor: '',
        data: new Date(),
        professional_id: 'despesa-nenhum-profissional',
        client_id: 'no-client',
        product_id: 'no-product',
        service_id: 'no-service'
      });
      setProductQuantity(1);
      onClose();
    }
  };

  const handleClose = () => {
    // Resetar formulário ao fechar
    setFormData({
      tipo: 'receita',
      nome: '',
      descricao: '',
      valor: '',
      data: new Date(),
      professional_id: 'despesa-nenhum-profissional',
      client_id: 'no-client',
      product_id: 'no-product',
      service_id: 'no-service'
    });
    onClose();
  };

  const handleProductChange = (productId: string) => {
    setFormData(prev => ({ ...prev, product_id: productId }));
    calculateCombinedValue(productId, formData.service_id);
  };

  const handleServiceChange = (serviceId: string) => {
    setFormData(prev => ({ ...prev, service_id: serviceId }));
    calculateCombinedValue(formData.product_id, serviceId);
  };

  const calculateCombinedValue = (productId: string, serviceId: string) => {
    let totalValue = 0;
    let description = '';
    const descriptionParts: string[] = [];

    if (productId !== 'no-product') {
      const selectedProduct = produtos.find(p => p.id === productId);
      if (selectedProduct) {
        totalValue += selectedProduct.price;
        descriptionParts.push(`Produto: ${selectedProduct.name}`);
      }
    }

    if (serviceId !== 'no-service') {
      const selectedService = servicos.find(s => s.id === serviceId);
      if (selectedService) {
        totalValue += selectedService.preco;
        descriptionParts.push(`Serviço: ${selectedService.nome}`);
      }
    }

    if (descriptionParts.length > 0) {
      description = descriptionParts.join(' + ');
      setFormData(prev => ({
        ...prev,
        descricao: description,
        valor: totalValue.toString()
      }));
    } else if (productId === 'no-product' && serviceId === 'no-service') {
      setFormData(prev => ({
        ...prev,
        descricao: '',
        valor: ''
      }));
    }
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
            <>
              <div className="space-y-2">
                <Label htmlFor="produto">Produto do Estoque (Opcional)</Label>
                <Select
                  value={formData.product_id}
                  onValueChange={handleProductChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um produto (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-product">Nenhum produto (serviço ou venda geral)</SelectItem>
                    {produtos.map((produto) => (
                      <SelectItem key={produto.id} value={produto.id}>
                        {produto.name} - R$ {produto.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.product_id !== 'no-product' && (
                <div className="space-y-2">
                  <Label htmlFor="productQuantity">Quantidade</Label>
                  <Input
                    id="productQuantity"
                    type="number"
                    min={1}
                    step={1}
                    value={productQuantity}
                    onChange={(e) => {
                      const q = Math.max(1, parseInt(e.target.value || '1'));
                      setProductQuantity(q);
                      calculateCombinedValue(formData.product_id, formData.service_id);
                    }}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="servico">Serviço (Opcional)</Label>
                <Select
                  value={formData.service_id}
                  onValueChange={handleServiceChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um serviço (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-service">Nenhum serviço</SelectItem>
                    {servicos.map((servico) => (
                      <SelectItem key={servico.id} value={servico.id}>
                        {servico.nome} - R$ {servico.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
            </>
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
                  : 'Descrição automática baseada na seleção de produto/serviço ou digite manualmente'
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
            <Label htmlFor="professional">Profissional (Opcional)</Label>
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
              {loading ? 'Salvando...' : 'Salvar Lançamento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
