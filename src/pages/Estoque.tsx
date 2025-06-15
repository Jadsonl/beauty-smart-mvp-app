
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useSupabase, type Produto } from '@/hooks/useSupabase';
import { useAuth } from '@/hooks/useAuth';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { ProductForm } from '@/components/estoque/ProductForm';
import { LowStockAlert } from '@/components/estoque/LowStockAlert';
import { ProductList } from '@/components/estoque/ProductList';

const Estoque = () => {
  const { user } = useAuth();
  const { getProdutos, getInventory, deleteProduto } = useSupabase();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [inventario, setInventario] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Produto | null>(null);

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

  const handleEditProduct = (produto: Produto) => {
    setEditingProduct(produto);
    setIsDialogOpen(true);
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

  const handleProductSaved = async () => {
    // Recarregar dados após salvar
    const updatedProdutos = await getProdutos();
    setProdutos(updatedProdutos);
    setEditingProduct(null);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
  };

  const openAddDialog = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
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
          
          <Button onClick={openAddDialog} className="bg-pink-600 hover:bg-pink-700 w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Produto
          </Button>
        </div>

        {/* Low Stock Alerts */}
        <LowStockAlert produtos={produtos} inventario={inventario} />

        {/* Product List */}
        <ProductList
          produtos={produtos}
          inventario={inventario}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
          onAddNew={openAddDialog}
        />

        {/* Product Form Dialog */}
        <ProductForm
          isOpen={isDialogOpen}
          onClose={closeDialog}
          editingProduct={editingProduct}
          onProductSaved={handleProductSaved}
        />
      </div>
    </Layout>
  );
};

export default Estoque;
