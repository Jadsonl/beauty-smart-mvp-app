
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSupabase, type Profissional } from '@/hooks/useSupabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Edit, Trash2, Users, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';

const Profissionais = () => {
  const { getProfissionais, addProfissional, updateProfissional, deleteProfissional, loading } = useSupabase();
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfissional, setEditingProfissional] = useState<Profissional | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    date_of_birth: ''
  });

  // Carregar profissionais do Supabase
  useEffect(() => {
    loadProfissionais();
  }, []);

  const loadProfissionais = async () => {
    const profissionaisData = await getProfissionais();
    setProfissionais(profissionaisData);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      date_of_birth: ''
    });
    setEditingProfissional(null);
  };

  const handleOpenDialog = (profissional: Profissional | null = null) => {
    if (profissional) {
      setEditingProfissional(profissional);
      setFormData({
        name: profissional.name,
        phone: profissional.phone || '',
        email: profissional.email || '',
        date_of_birth: profissional.date_of_birth || ''
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
    
    if (!formData.name) {
      toast.error('Nome é obrigatório');
      return;
    }

    try {
      const profissionalData = {
        name: formData.name,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        date_of_birth: formData.date_of_birth || undefined
      };

      let success = false;
      
      if (editingProfissional) {
        success = await updateProfissional(editingProfissional.id, profissionalData);
        if (success) {
          toast.success('Profissional atualizado com sucesso!');
        }
      } else {
        success = await addProfissional(profissionalData);
        if (success) {
          toast.success('Profissional cadastrado com sucesso!');
        }
      }

      if (success) {
        handleCloseDialog();
        loadProfissionais(); // Recarregar a lista
      } else {
        toast.error('Erro ao salvar profissional. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao salvar profissional:', error);
      toast.error('Erro inesperado. Tente novamente.');
    }
  };

  const handleDelete = async (profissional: Profissional) => {
    if (window.confirm(`Tem certeza que deseja excluir o profissional "${profissional.name}"?`)) {
      const success = await deleteProfissional(profissional.id);
      if (success) {
        toast.success('Profissional excluído com sucesso!');
        loadProfissionais(); // Recarregar a lista
      } else {
        toast.error('Erro ao excluir profissional. Tente novamente.');
      }
    }
  };

  const sortedProfissionais = [...profissionais].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profissionais</h1>
            <p className="text-gray-600 mt-1">Gerencie os profissionais do seu estabelecimento</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-pink-600 hover:bg-pink-700"
                onClick={() => handleOpenDialog()}
              >
                + Novo Profissional
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingProfissional ? 'Editar Profissional' : 'Novo Profissional'}
                </DialogTitle>
                <DialogDescription>
                  {editingProfissional 
                    ? 'Edite as informações do profissional.' 
                    : 'Preencha os dados para cadastrar um novo profissional.'
                  }
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    placeholder="Ex: João Silva"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="joao@exemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Data de Nascimento</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
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
                    disabled={loading}
                  >
                    {loading ? 'Salvando...' : (editingProfissional ? 'Salvar Alterações' : 'Salvar Profissional')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Profissionais List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Profissionais</CardTitle>
            <CardDescription>
              {loading ? 'Carregando profissionais...' : (
                profissionais.length === 0 
                  ? 'Nenhum profissional cadastrado ainda.' 
                  : `${profissionais.length} profissional${profissionais.length > 1 ? 's' : ''} cadastrado${profissionais.length > 1 ? 's' : ''}`
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Carregando profissionais...</p>
              </div>
            ) : profissionais.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">👨‍💼</span>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum profissional cadastrado
                </h3>
                <p className="text-gray-600 mb-6">
                  Comece criando seu primeiro profissional!
                </p>
                <Button 
                  className="bg-pink-600 hover:bg-pink-700"
                  onClick={() => handleOpenDialog()}
                >
                  + Cadastrar Primeiro Profissional
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedProfissionais.map((profissional) => (
                  <Card key={profissional.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Users className="h-5 w-5 text-pink-600" />
                            <h3 className="font-semibold text-lg text-gray-900">
                              {profissional.name}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-500">
                            Cadastrado em {format(new Date(profissional.created_at!), 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(profissional)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(profissional)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {profissional.phone && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{profissional.phone}</span>
                          </div>
                        )}
                        {profissional.email && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Mail className="h-4 w-4" />
                            <span>{profissional.email}</span>
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

export default Profissionais;
