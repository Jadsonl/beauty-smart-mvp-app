
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Edit, Trash2, Package, AlertTriangle, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  category: string | null;
  unit_price: number | null;
  created_at: string;
  updated_at: string;
}

interface ProductInventory {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  minimum_stock: number;
  created_at: string;
  updated_at: string;
  products?: Product;
}

const Estoque = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [inventory, setInventory] = useState<ProductInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProductInventory | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    unit_price: '',
    quantity: '',
    minimum_stock: ''
  });

  useEffect(() => {
    if (user) {
      fetchInventory();
    }
  }, [user]);

  const fetchInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('product_inventory')
        .select(`
          *,
          products (*)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInventory(data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast({
        title: "Erro ao carregar estoque",
        description: "Não foi possível carregar os produtos do estoque.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      unit_price: '',
      quantity: '',
      minimum_stock: ''
    });
    setEditingItem(null);
  };

  const handleOpenDialog = (item: ProductInventory | null = null) => {
    if (item && item.products) {
      setEditingItem(item);
      setFormData({
        name: item.products.name,
        description: item.products.description || '',
        category: item.products.category || '',
        unit_price: item.products.unit_price?.toString() || '',
        quantity: item.quantity.toString(),
        minimum_stock: item.minimum_stock.toString()
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.quantity || !formData.minimum_stock) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingItem) {
        // Update existing product and inventory
        const { error: productError } = await supabase
          .from('products')
          .update({
            name: formData.name,
            description: formData.description || null,
            category: formData.category || null,
            unit_price: formData.unit_price ? parseFloat(formData.unit_price) : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingItem.product_id);

        if (productError) throw productError;

        const { error: inventoryError } = await supabase
          .from('product_inventory')
          .update({
            quantity: parseInt(formData.quantity),
            minimum_stock: parseInt(formData.minimum_stock),
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingItem.id);

        if (inventoryError) throw inventoryError;

        toast({
          title: "Produto atualizado!",
          description: "As informações foram salvas com sucesso.",
        });
      } else {
        // Create new product and inventory
        const { data: productData, error: productError } = await supabase
          .from('products')
          .insert({
            user_id: user?.id!,
            name: formData.name,
            description: formData.description || null,
            category: formData.category || null,
            unit_price: formData.unit_price ? parseFloat(formData.unit_price) : null,
          })
          .select()
          .single();

        if (productError) throw productError;

        const { error: inventoryError } = await supabase
          .from('product_inventory')
          .insert({
            user_id: user?.id!,
            product_id: productData.id,
            quantity: parseInt(formData.quantity),
            minimum_stock: parseInt(formData.minimum_stock),
          });

        if (inventoryError) throw inventoryError;

        toast({
          title: "Produto adicionado!",
          description: `${formData.name} foi cadastrado com sucesso.`,
        });
      }
      
      fetchInventory();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Erro ao salvar produto",
        description: "Não foi possível salvar o produto. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (item: ProductInventory) => {
    if (!window.confirm(`Tem certeza que deseja excluir "${item.products?.name}" do estoque?`)) {
      return;
    }

    try {
      // Delete inventory first, then product
      const { error: inventoryError } = await supabase
        .from('product_inventory')
        .delete()
        .eq('id', item.id);

      if (inventoryError) throw inventoryError;

      const { error: productError } = await supabase
        .from('products')
        .delete()
        .eq('id', item.product_id);

      if (productError) throw productError;

      toast({
        title: "Produto excluído!",
        description: `${item.products?.name} foi removido com sucesso.`,
      });

      fetchInventory();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Erro ao excluir produto",
        description: "Não foi possível excluir o produto. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleQuantityChange = async (item: ProductInventory, delta: number) => {
    const newQuantity = Math.max(0, item.quantity + delta);
    
    try {
      const { error } = await supabase
        .from('product_inventory')
        .update({
          quantity: newQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: "Quantidade atualizada!",
        description: `${item.products?.name}: ${newQuantity} unidades`,
      });

      fetchInventory();
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: "Erro ao atualizar quantidade",
        description: "Não foi possível atualizar a quantidade.",
        variant: "destructive",
      });
    }
  };

  const lowStockItems = inventory.filter(item => item.quantity <= item.minimum_stock);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Estoque</h1>
            <p className="text-gray-600 mt-1">Controle o estoque de produtos do seu estabelecimento</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-pink-600 hover:bg-pink-700"
                onClick={() => handleOpenDialog()}
              >
                + Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Editar Produto' : 'Novo Produto'}
                </DialogTitle>
                <DialogDescription>
                  {editingItem 
                    ? 'Edite as informações do produto.' 
                    : 'Preencha os dados para cadastrar um novo produto.'
                  }
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Produto *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Shampoo Anticaspa"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    placeholder="Descrição do produto"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Input
                    id="category"
                    placeholder="Ex: Cabelo, Unha, Pele"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit_price">Preço Unitário (R$)</Label>
                  <Input
                    id="unit_price"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.unit_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit_price: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantidade *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minimum_stock">Estoque Mínimo *</Label>
                    <Input
                      id="minimum_stock"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.minimum_stock}
                      onChange={(e) => setFormData(prev => ({ ...prev, minimum_stock: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCloseDialog}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-pink-600 hover:bg-pink-700"
                  >
                    {editingItem ? 'Salvar Alterações' : 'Salvar Produto'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Alerts for low stock */}
        {lowStockItems.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="h-5 w-5" />
                Alertas de Estoque
              </CardTitle>
              <CardDescription className="text-orange-700">
                {lowStockItems.length} produto{lowStockItems.length > 1 ? 's' : ''} com estoque baixo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded border border-orange-200">
                    <span className="font-medium">{item.products?.name}</span>
                    <span className="text-sm text-orange-600">
                      {item.quantity} restante{item.quantity !== 1 ? 's' : ''} (mín: {item.minimum_stock})
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Produtos</CardTitle>
            <CardDescription>
              {inventory.length === 0 
                ? 'Nenhum produto cadastrado ainda.' 
                : `${inventory.length} produto${inventory.length > 1 ? 's' : ''} cadastrado${inventory.length > 1 ? 's' : ''}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {inventory.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">📦</span>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum produto cadastrado
                </h3>
                <p className="text-gray-600 mb-6">
                  Comece criando seu primeiro produto no estoque!
                </p>
                <Button 
                  className="bg-pink-600 hover:bg-pink-700"
                  onClick={() => handleOpenDialog()}
                >
                  + Cadastrar Primeiro Produto
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inventory.map((item) => (
                  <Card 
                    key={item.id} 
                    className={cn(
                      "hover:shadow-md transition-shadow",
                      item.quantity <= item.minimum_stock && "border-orange-200 bg-orange-50"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Package className="h-5 w-5 text-pink-600" />
                            <h3 className="font-semibold text-lg text-gray-900">
                              {item.products?.name}
                            </h3>
                            {item.quantity <= item.minimum_stock && (
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                            )}
                          </div>
                          {item.products?.description && (
                            <p className="text-sm text-gray-600 mb-2">{item.products.description}</p>
                          )}
                          {item.products?.category && (
                            <p className="text-xs text-gray-500 mb-2">Categoria: {item.products.category}</p>
                          )}
                          <p className="text-sm text-gray-500">
                            Cadastrado em {format(new Date(item.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(item)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Quantidade:</span>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item, -1)}
                              disabled={item.quantity <= 0}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className={cn(
                              "font-bold text-lg min-w-[3rem] text-center",
                              item.quantity <= item.minimum_stock 
                                ? "text-orange-600" 
                                : "text-green-600"
                            )}>
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Estoque mínimo:</span>
                          <span className="text-sm text-gray-700">{item.minimum_stock}</span>
                        </div>
                        {item.products?.unit_price && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Preço unitário:</span>
                            <span className="text-sm font-medium text-gray-900">
                              R$ {item.products.unit_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Estoque;
