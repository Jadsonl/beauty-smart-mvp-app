
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
import { Edit, Trash2, Scissors, Clock } from 'lucide-react';

const Servicos = () => {
  const { servicos, addServico, editServico, deleteServico } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingServico, setEditingServico] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    nome: '',
    preco: '',
    duracao: ''
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      preco: '',
      duracao: ''
    });
    setEditingServico(null);
  };

  const handleOpenDialog = (servico = null) => {
    if (servico) {
      setEditingServico(servico);
      setFormData({
        nome: servico.nome,
        preco: servico.preco.toString(),
        duracao: servico.duracao
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
    
    if (!formData.nome || !formData.preco) {
      return;
    }

    const servicoData = {
      nome: formData.nome,
      preco: parseFloat(formData.preco),
      duracao: formData.duracao
    };

    if (editingServico) {
      editServico(editingServico.id, servicoData);
    } else {
      addServico(servicoData);
    }
    
    handleCloseDialog();
  };

  const handleDelete = (servico: any) => {
    if (window.confirm(`Tem certeza que deseja excluir o serviço "${servico.nome}"?`)) {
      deleteServico(servico.id);
    }
  };

  const sortedServicos = [...servicos].sort((a, b) => a.nome.localeCompare(b.nome));

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Serviços</h1>
            <p className="text-gray-600 mt-1">Gerencie os serviços oferecidos pelo seu estabelecimento</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-pink-600 hover:bg-pink-700"
                onClick={() => handleOpenDialog()}
              >
                + Novo Serviço
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingServico ? 'Editar Serviço' : 'Novo Serviço'}
                </DialogTitle>
                <DialogDescription>
                  {editingServico 
                    ? 'Edite as informações do serviço.' 
                    : 'Preencha os dados para cadastrar um novo serviço.'
                  }
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Serviço</Label>
                  <Input
                    id="nome"
                    placeholder="Ex: Corte de cabelo masculino"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preco">Preço (R$)</Label>
                  <Input
                    id="preco"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.preco}
                    onChange={(e) => setFormData(prev => ({ ...prev, preco: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duracao">Duração</Label>
                  <Input
                    id="duracao"
                    placeholder="Ex: 45 minutos"
                    value={formData.duracao}
                    onChange={(e) => setFormData(prev => ({ ...prev, duracao: e.target.value }))}
                  />
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
                    {editingServico ? 'Salvar Alterações' : 'Salvar Serviço'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Serviços List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Serviços</CardTitle>
            <CardDescription>
              {servicos.length === 0 
                ? 'Nenhum serviço cadastrado ainda.' 
                : `${servicos.length} serviço${servicos.length > 1 ? 's' : ''} cadastrado${servicos.length > 1 ? 's' : ''}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {servicos.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">✂️</span>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum serviço cadastrado
                </h3>
                <p className="text-gray-600 mb-6">
                  Comece criando seu primeiro serviço!
                </p>
                <Button 
                  className="bg-pink-600 hover:bg-pink-700"
                  onClick={() => handleOpenDialog()}
                >
                  + Cadastrar Primeiro Serviço
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedServicos.map((servico) => (
                  <Card key={servico.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Scissors className="h-5 w-5 text-pink-600" />
                            <h3 className="font-semibold text-lg text-gray-900">
                              {servico.nome}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-500">
                            Cadastrado em {format(new Date(servico.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(servico)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(servico)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Preço:</span>
                          <span className="font-bold text-green-600 text-lg">
                            R$ {servico.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        {servico.duracao && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{servico.duracao}</span>
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

export default Servicos;
