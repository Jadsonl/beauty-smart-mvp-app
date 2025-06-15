
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useSupabase, type Produto } from '@/hooks/useSupabase';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Package, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const Estoque = () => {
  const { user } = useAuth();
  const { getProdutos, getInventory, addProduto, updateProduto, deleteProduto } = useSupabase();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [inventario, setInventario] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Produto | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    unit: '',
    min_stock_level: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        try {
          console.log('Estoque: Carregando dados para usuário:', user.id);
          setLoading(true);
          const [produtosData, inventarioData] = await Promise.all([
            getProdutos(),
            getInventory()
          ]);
          console.log('Estoque: Dados carregados - produtos:', produtosData.length, 'inventário:', inventarioData.length);
          setProdutos(produtosData);
          setInventario(inventarioData);
        } catch (error) {
          console.error('Estoque: Erro ao carregar dados:', error);
          toast.error('Erro ao carregar dados do estoque');
        } finally {
          setLoading(false);
        }
      } else {
        console.log('Estoque: Usuário não logado, não carregando dados');
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, getProdutos, getInventory]);

  const handleAddProduct = async () => {
    if (!newProduct.name.trim()) {
      toast.error('Nome do produto é obrigatório');
      return;
    }

    try {
      console.log('Estoque: Adicionando produto:', newProduct);
      const success = await addProduto(newProduct);
      if (success) {
        toast.success('Produto adicionado com sucesso!');
        setIsDialogOpen(false);
        setNewProduct({ name: '', description: '', price: 0, category: '', unit: '', min_stock_level: 0 });
        // Recarregar dados
        const updatedProdutos = await getProdutos();
        setProdutos(updatedProdutos);
      } else {
        toast.error('Erro ao adicionar produto');
      }
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      toast.error('Erro ao adicionar produto');
    }
  };

  const handleEditProduct = (produto: Produto) => {
    setEditingProduct(produto);
    setNewProduct({
      name: produto.name,
      description: produto.description || '',
      price: produto.price,
      category: produto.category || '',
      unit: produto.unit || '',
      min_stock_level: produto.min_stock_level || 0
    });
    setIsDialogOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct || !newProduct.name.trim()) {
      toast.error('Nome do produto é obrigatório');
      return;
    }

    try {
      console.log('Estoque: Atualizando produto:', editingProduct.id);
      const success = await updateProduto(editingProduct.id, newProduct);
      if (success) {
        toast.success('Produto atualizado com sucesso!');
        setIsDialogOpen(false);
        setEditingProduct(null);
        setNewProduct({ name: '', description: '', price: 0, category: '', unit: '', min_stock_level: 0 });
        // Recarregar dados
        const updatedProdutos = await getProdutos();
        setProdutos(updatedProdutos);
      } else {
        toast.error('Erro ao atualizar produto');
      }
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      toast.error('Erro ao atualizar produto');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }

    try {
      console.log('Estoque: Deletando produto:', id);
      const success = await deleteProduto(id);
      if (success) {
        toast.success('Produto excluído com sucesso!');
        // Recarregar dados
        const updatedProdutos = await getProdutos();
        setProdutos(updatedProdutos);
      } else {
        toast.error('Erro ao excluir produto');
      }
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast.error('Erro ao excluir produto');
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    setNewProduct({ name: '', description: '', price: 0, category: '', unit: '', min_stock_level: 0 });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Carregando estoque...</p>
        </div>
      </Layout>
    );
  }

  const produtosComBaixoEstoque = produtos.filter(produto => {
    const inventarioProduto = inventario.find(inv => inv.product_id === produto.id);
    return inventarioProduto && inventarioProduto.quantity <= (produto.min_stock_level || 0);
  });

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8 p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Controle de Estoque</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Gerencie seus produtos e controle o inventário
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-pink-600 hover:bg-pink-700 w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md mx-4 sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}</DialogTitle>
                <DialogDescription>
                  {editingProduct ? 'Edite as informações do produto.' : 'Preencha as informações do produto que deseja adicionar ao estoque.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Produto *</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    placeholder="Ex: Shampoo Anti-Caspa"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
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
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Input
                      id="category"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                      placeholder="Ex: Cabelo"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="unit">Unidade</Label>
                    <Input
                      id="unit"
                      value={newProduct.unit}
                      onChange={(e) => setNewProduct({...newProduct, unit: e.target.value})}
                      placeholder="Ex: ml, un, kg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="min_stock">Estoque Mínimo</Label>
                    <Input
                      id="min_stock"
                      type="number"
                      value={newProduct.min_stock_level}
                      onChange={(e) => setNewProduct({...newProduct, min_stock_level: parseInt(e.target.value) || 0})}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button 
                    onClick={editingProduct ? handleUpdateProduct : handleAddProduct} 
                    className="bg-pink-600 hover:bg-pink-700 flex-1"
                  >
                    {editingProduct ? 'Atualizar Produto' : 'Adicionar Produto'}
                  </Button>
                  <Button variant="outline" onClick={closeDialog} className="flex-1">
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Alertas de Baixo Estoque */}
        {produtosComBaixoEstoque.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800 text-lg sm:text-xl">
                <AlertTriangle className="h-5 w-5" />
                Alertas de Estoque
              </CardTitle>
              <CardDescription className="text-orange-700 text-sm">
                {produtosComBaixoEstoque.length} produto(s) com estoque baixo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {produtosComBaixoEstoque.map((produto) => {
                  const inventarioProduto = inventario.find(inv => inv.product_id === produto.id);
                  return (
                    <div key={produto.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-white rounded-lg border border-orange-200 gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-orange-800 text-sm sm:text-base truncate">{produto.name}</p>
                        <p className="text-xs sm:text-sm text-orange-600">
                          Estoque atual: {inventarioProduto?.quantity || 0} {produto.unit || ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs sm:text-sm text-orange-600">
                          Mínimo: {produto.min_stock_level || 0} {produto.unit || ''}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Produtos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Package className="h-5 w-5" />
              Produtos Cadastrados
            </CardTitle>
            <CardDescription className="text-sm">
              {produtos.length} produto(s) no seu estoque
            </CardDescription>
          </CardHeader>
          <CardContent>
            {produtos.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Package className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">Nenhum produto cadastrado</h3>
                <p className="text-gray-500 mb-4 text-sm sm:text-base">
                  Comece adicionando produtos ao seu estoque para controlar o inventário.
                </p>
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Produto
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {produtos.map((produto) => {
                  const inventarioProduto = inventario.find(inv => inv.product_id === produto.id);
                  const isLowStock = inventarioProduto && inventarioProduto.quantity <= (produto.min_stock_level || 0);
                  
                  return (
                    <Card key={produto.id} className={`${isLowStock ? 'border-orange-300' : 'border-gray-200'} relative`}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base sm:text-lg truncate flex-1">{produto.name}</CardTitle>
                          <div className="flex gap-1 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditProduct(produto)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteProduct(produto.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        {produto.description && (
                          <CardDescription className="text-xs sm:text-sm line-clamp-2">
                            {produto.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Preço:</span>
                          <span className="font-medium">
                            R$ {produto.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Estoque:</span>
                          <span className={`font-medium ${isLowStock ? 'text-orange-600' : 'text-green-600'}`}>
                            {inventarioProduto?.quantity || 0}{produto.unit ? ` ${produto.unit}` : ''}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Mínimo:</span>
                          <span className="font-medium text-gray-900">
                            {produto.min_stock_level || 0}{produto.unit ? ` ${produto.unit}` : ''}
                          </span>
                        </div>
                        
                        {produto.category && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Categoria:</span>
                            <span className="font-medium text-gray-900 truncate ml-2">{produto.category}</span>
                          </div>
                        )}
                        
                        {isLowStock && (
                          <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Estoque baixo</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Estoque;
