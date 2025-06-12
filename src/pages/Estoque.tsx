
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useSupabase } from '@/hooks/useSupabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Edit, Trash2, Package, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProdutoEstoque {
  id: string;
  name: string;
  quantity: number;
  min_stock: number;
  price: number;
  created_at?: string;
}

const Estoque = () => {
  const { user } = useAuth();
  const { getProdutos, getInventory } = useSupabase();
  const [produtos, setProdutos] = useState<ProdutoEstoque[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<ProdutoEstoque | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    min_stock: '',
    price: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        try {
          const [produtosData, inventoryData] = await Promise.all([
            getProdutos(),
            getInventory()
          ]);
          
          // Combine products with inventory data
          const produtosComEstoque: ProdutoEstoque[] = produtosData.map(produto => {
            const inventory = inventoryData.find(inv => inv.product_id === produto.id);
            return {
              id: produto.id,
              name: produto.name,
              price: produto.price,
              quantity: inventory?.quantity || 0,
              min_stock: inventory?.min_stock || 0,
              created_at: produto.created_at
            };
          });
          
          setProdutos(produtosComEstoque);
        } catch (error) {
          console.error('Erro ao carregar produtos:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [user?.id, getProdutos, getInventory]);

  const resetForm = () => {
    setFormData({
      name: '',
      quantity: '',
      min_stock: '',
      price: ''
    });
    setEditingProduto(null);
  };

  const handleOpenDialog = (produto: ProdutoEstoque | null = null) => {
    if (produto) {
      setEditingProduto(produto);
      setFormData({
        name: produto.name,
        quantity: produto.quantity.toString(),
        min_stock: produto.min_stock.toString(),
        price: produto.price.toString()
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
    
    if (!formData.name || !formData.quantity || !formData.min_stock || !formData.price) {
      return;
    }

    const produtoData = {
      name: formData.name,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity),
      min_stock: parseInt(formData.min_stock)
    };

    try {
      if (editingProduto) {
        // Update existing product logic would go here
        console.log('Updating product:', editingProduto.id, produtoData);
      } else {
        // Add new product logic would go here
        console.log('Adding new product:', produtoData);
      }
      
      handleCloseDialog();
      // Refresh data after operation
      // fetchData();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
    }
  };

  const handleDelete = async (produto: ProdutoEstoque) => {
    if (window.confirm(`Tem certeza que deseja excluir "${produto.name}" do estoque?`)) {
      try {
        // Delete product logic would go here
        console.log('Deleting product:', produto.id);
        // Refresh data after deletion
        // fetchData();
      } catch (error) {
        console.error('Erro ao deletar produto:', error);
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Carregando produtos...</p>
        </div>
      </Layout>
    );
  }

  const sortedProdutos = [...produtos].sort((a, b) => a.name.localeCompare(b.name));
  const produtosBaixoEstoque = produtos.filter(p => p.quantity <= p.min_stock);

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
                  {editingProduto ? 'Editar Produto' : 'Novo Produto'}
                </DialogTitle>
                <DialogDescription>
                  {editingProduto 
                    ? 'Edite as informações do produto.' 
                    : 'Preencha os dados para cadastrar um novo produto.'
                  }
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Produto</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Shampoo Anticaspa"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantidade Inicial</Label>
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
                  <Label htmlFor="min_stock">Estoque Mínimo</Label>
                  <Input
                    id="min_stock"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.min_stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, min_stock: e.target.value }))}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Você será alertado quando a quantidade atingir este valor
                  </p>
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
                    {editingProduto ? 'Salvar Alterações' : 'Salvar Produto'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Alerts for low stock */}
        {produtosBaixoEstoque.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="h-5 w-5" />
                Alertas de Estoque
              </CardTitle>
              <CardDescription className="text-orange-700">
                {produtosBaixoEstoque.length} produto{produtosBaixoEstoque.length > 1 ? 's' : ''} com estoque baixo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {produtosBaixoEstoque.map((produto) => (
                  <div key={produto.id} className="flex items-center justify-between p-2 bg-white rounded border border-orange-200">
                    <span className="font-medium">{produto.name}</span>
                    <span className="text-sm text-orange-600">
                      {produto.quantity} restante{produto.quantity !== 1 ? 's' : ''} (mín: {produto.min_stock})
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Produtos List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Produtos</CardTitle>
            <CardDescription>
              {produtos.length === 0 
                ? 'Nenhum produto cadastrado ainda.' 
                : `${produtos.length} produto${produtos.length > 1 ? 's' : ''} cadastrado${produtos.length > 1 ? 's' : ''}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {produtos.length === 0 ? (
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
                {sortedProdutos.map((produto) => (
                  <Card 
                    key={produto.id} 
                    className={cn(
                      "hover:shadow-md transition-shadow",
                      produto.quantity <= produto.min_stock && "border-orange-200 bg-orange-50"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Package className="h-5 w-5 text-pink-600" />
                            <h3 className="font-semibold text-lg text-gray-900">
                              {produto.name}
                            </h3>
                            {produto.quantity <= produto.min_stock && (
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {produto.created_at ? format(new Date(produto.created_at), 'dd/MM/yyyy', { locale: ptBR }) : 'Data não disponível'}
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(produto)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(produto)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Preço:</span>
                          <span className="font-medium text-green-600">
                            R$ {produto.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Quantidade:</span>
                          <span className={cn(
                            "font-bold text-lg",
                            produto.quantity <= produto.min_stock 
                              ? "text-orange-600" 
                              : "text-green-600"
                          )}>
                            {produto.quantity}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Estoque mínimo:</span>
                          <span className="text-sm text-gray-700">{produto.min_stock}</span>
                        </div>
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
