
import { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/context/AppContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Edit, Trash2, Package, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const Estoque = () => {
  const { produtos, addProduto, editProduto, deleteProduto } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    nome: '',
    quantidade: '',
    estoqueMinimo: ''
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      quantidade: '',
      estoqueMinimo: ''
    });
    setEditingProduto(null);
  };

  const handleOpenDialog = (produto = null) => {
    if (produto) {
      setEditingProduto(produto);
      setFormData({
        nome: produto.nome,
        quantidade: produto.quantidade.toString(),
        estoqueMinimo: produto.estoqueMinimo.toString()
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.quantidade || !formData.estoqueMinimo) {
      return;
    }

    const produtoData = {
      nome: formData.nome,
      quantidade: parseInt(formData.quantidade),
      estoqueMinimo: parseInt(formData.estoqueMinimo)
    };

    if (editingProduto) {
      editProduto(editingProduto.id, produtoData);
    } else {
      addProduto(produtoData);
    }
    
    handleCloseDialog();
  };

  const handleDelete = (produto: any) => {
    if (window.confirm(`Tem certeza que deseja excluir "${produto.nome}" do estoque?`)) {
      deleteProduto(produto.id);
    }
  };

  const sortedProdutos = [...produtos].sort((a, b) => a.nome.localeCompare(b.nome));
  const produtosBaixoEstoque = produtos.filter(p => p.quantidade <= p.estoqueMinimo);

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
                  <Label htmlFor="nome">Nome do Produto</Label>
                  <Input
                    id="nome"
                    placeholder="Ex: Shampoo Anticaspa"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantidade">Quantidade Inicial</Label>
                  <Input
                    id="quantidade"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.quantidade}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantidade: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estoqueMinimo">Estoque Mínimo</Label>
                  <Input
                    id="estoqueMinimo"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.estoqueMinimo}
                    onChange={(e) => setFormData(prev => ({ ...prev, estoqueMinimo: e.target.value }))}
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
                    <span className="font-medium">{produto.nome}</span>
                    <span className="text-sm text-orange-600">
                      {produto.quantidade} restante{produto.quantidade !== 1 ? 's' : ''} (mín: {produto.estoqueMinimo})
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
                      produto.quantidade <= produto.estoqueMinimo && "border-orange-200 bg-orange-50"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Package className="h-5 w-5 text-pink-600" />
                            <h3 className="font-semibold text-lg text-gray-900">
                              {produto.nome}
                            </h3>
                            {produto.quantidade <= produto.estoqueMinimo && (
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            Cadastrado em {format(new Date(produto.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
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
                          <span className="text-sm text-gray-600">Quantidade:</span>
                          <span className={cn(
                            "font-bold text-lg",
                            produto.quantidade <= produto.estoqueMinimo 
                              ? "text-orange-600" 
                              : "text-green-600"
                          )}>
                            {produto.quantidade}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Estoque mínimo:</span>
                          <span className="text-sm text-gray-700">{produto.estoqueMinimo}</span>
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
