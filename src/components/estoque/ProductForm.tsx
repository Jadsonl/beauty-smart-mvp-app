
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useSupabase, type Produto } from '@/hooks/useSupabase';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: Produto | null;
  onProductSaved: () => void;
  initialQuantity?: number; // NOVO: Quantidade de estoque, se fornecida em edição
  onUpdateInventory?: (productId: string, quantity: number) => Promise<void>; // NOVO: função para atualizar inventário
}

export const ProductForm = ({
  isOpen,
  onClose,
  editingProduct,
  onProductSaved,
  initialQuantity = 0,
  onUpdateInventory,
}: ProductFormProps) => {
  const { addProduto, updateProduto } = useSupabase();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    unit: '',
    min_stock_level: 0,
  });
  const [stockQuantity, setStockQuantity] = useState<number>(0);

  // Preencher os dados ao receber um produto para edição
  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || '',
        description: editingProduct.description || '',
        price: Number(editingProduct.price) || 0,
        category: editingProduct.category || '',
        unit: editingProduct.unit || '',
        min_stock_level: editingProduct.min_stock_level || 0,
      });
      setStockQuantity(initialQuantity || 0);
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: '',
        unit: '',
        min_stock_level: 0,
      });
      setStockQuantity(0);
    }
  }, [editingProduct, isOpen, initialQuantity]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Nome do produto é obrigatório');
      return;
    }

    try {
      let success = false;
      if (editingProduct) {
        success = await updateProduto(editingProduct.id, formData);
        // Atualizar inventário, se foi passada a função (caso de edição)
        if (success && typeof onUpdateInventory === 'function') {
          await onUpdateInventory(editingProduct.id, stockQuantity);
        }
      } else {
        success = await addProduto(formData);
      }
      if (success) {
        toast.success(editingProduct ? 'Produto atualizado com sucesso!' : 'Produto adicionado com sucesso!');
        onClose();
        onProductSaved();
      } else {
        toast.error(editingProduct ? 'Erro ao atualizar produto' : 'Erro ao adicionar produto');
      }
    } catch (error) {
      toast.error('Erro ao salvar produto');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4 sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}</DialogTitle>
          <DialogDescription>
            {editingProduct
              ? 'Edite as informações do produto.'
              : 'Preencha as informações do produto que deseja adicionar ao estoque.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Produto *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Shampoo Anti-Caspa"
            />
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição do produto"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                placeholder="0,00"
              />
            </div>
            <div>
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Ex: Cabelo"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="unit">Unidade</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="Ex: ml, un, kg"
              />
            </div>
            <div>
              <Label htmlFor="min_stock">Estoque Mínimo</Label>
              <Input
                id="min_stock"
                type="number"
                value={formData.min_stock_level}
                onChange={(e) => setFormData({ ...formData, min_stock_level: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
          </div>
          {editingProduct && (
            <div>
              <Label htmlFor="quantity">Quantidade em Estoque</Label>
              <Input
                id="quantity"
                type="number"
                value={stockQuantity}
                min={0}
                onChange={(e) => setStockQuantity(parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button
              onClick={handleSubmit}
              className="bg-pink-600 hover:bg-pink-700 flex-1"
            >
              {editingProduct ? 'Atualizar Produto' : 'Adicionar Produto'}
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

