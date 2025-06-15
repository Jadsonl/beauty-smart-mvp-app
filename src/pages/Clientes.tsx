import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSupabase, type Cliente } from '@/hooks/useSupabase';
import { Edit, Trash2, Phone, Mail, Calendar as CalendarBirthday } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Função para parse sem UTC do formato yyyy-MM-dd
function parseDateLocal(dateStr: string): Date | null {
  // Aceita formatos yyyy-MM-dd ou yyyy-MM-ddTHH:mm:ss...
  if (!dateStr) return null;
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

const Clientes = () => {
  const { getClientes, addCliente, updateCliente, deleteCliente, loading } = useSupabase();
  const { toast } = useToast();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    date_of_birth: null as Date | null
  });

  // Adicione a função auxiliar segura para formatar a data sempre em local time (sem UTC):
  const formatDateToYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Carregar clientes do Supabase
  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    const clientesData = await getClientes();
    setClientes(clientesData);
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      telefone: '',
      email: '',
      date_of_birth: null
    });
    setEditingCliente(null);
  };

  const handleOpenDialog = (cliente: Cliente | null = null) => {
    if (cliente) {
      setEditingCliente(cliente);
      setFormData({
        nome: cliente.nome,
        telefone: cliente.telefone || '',
        email: cliente.email || '',
        date_of_birth: cliente.date_of_birth ? parseDateLocal(cliente.date_of_birth) : null
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

  const formatPhone = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Apply mask (XX) XXXXX-XXXX
    if (digits.length <= 11) {
      return digits
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
    return digits.slice(0, 11)
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({ ...prev, telefone: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.telefone) {
      toast({
        title: "Erro",
        description: "Nome e telefone são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    try {
      let success = false;
      
      const clienteData = {
        nome: formData.nome,
        telefone: formData.telefone,
        email: formData.email,
        date_of_birth: formData.date_of_birth 
          ? formatDateToYYYYMMDD(formData.date_of_birth) 
          : null
      };
      
      if (editingCliente) {
        success = await updateCliente(editingCliente.id, clienteData);
        if (success) {
          toast({
            title: "Sucesso",
            description: "Cliente atualizado com sucesso!"
          });
        }
      } else {
        success = await addCliente(clienteData);
        if (success) {
          toast({
            title: "Sucesso",
            description: "Cliente cadastrado com sucesso!"
          });
        }
      }

      if (success) {
        handleCloseDialog();
        loadClientes(); // Recarregar a lista
      } else {
        toast({
          title: "Erro",
          description: "Erro ao salvar cliente. Tente novamente.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (cliente: Cliente) => {
    if (window.confirm(`Tem certeza que deseja excluir ${cliente.nome}?`)) {
      const success = await deleteCliente(cliente.id);
      if (success) {
        toast({
          title: "Sucesso",
          description: "Cliente excluído com sucesso!"
        });
        loadClientes(); // Recarregar a lista
      } else {
        toast({
          title: "Erro",
          description: "Erro ao excluir cliente. Tente novamente.",
          variant: "destructive"
        });
      }
    }
  };

  const sortedClientes = [...clientes].sort((a, b) => a.nome.localeCompare(b.nome));

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
            <p className="text-gray-600 mt-1">Gerencie a base de clientes do seu estabelecimento</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-pink-600 hover:bg-pink-700"
                onClick={() => handleOpenDialog()}
              >
                + Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
                </DialogTitle>
                <DialogDescription>
                  {editingCliente 
                    ? 'Edite as informações do cliente.' 
                    : 'Preencha os dados para cadastrar um novo cliente.'
                  }
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    placeholder="Nome completo do cliente"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    placeholder="(11) 99999-9999"
                    value={formData.telefone}
                    onChange={handlePhoneChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="cliente@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Data de Nascimento</Label>
                  <DatePicker
                    date={formData.date_of_birth}
                    onSelect={(date) => setFormData(prev => ({ ...prev, date_of_birth: date || null }))}
                    placeholder="Selecione a data de nascimento"
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
                    {loading ? 'Salvando...' : (editingCliente ? 'Salvar Alterações' : 'Salvar Cliente')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de Clientes com data de nascimento */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>
              {loading ? 'Carregando clientes...' : (
                clientes.length === 0 
                  ? 'Nenhum cliente cadastrado ainda.' 
                  : `${clientes.length} cliente${clientes.length > 1 ? 's' : ''} cadastrado${clientes.length > 1 ? 's' : ''}`
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Carregando clientes...</p>
              </div>
            ) : clientes.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">👥</span>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum cliente cadastrado
                </h3>
                <p className="text-gray-600 mb-6">
                  Comece criando seu primeiro cliente!
                </p>
                <Button 
                  className="bg-pink-600 hover:bg-pink-700"
                  onClick={() => handleOpenDialog()}
                >
                  + Cadastrar Primeiro Cliente
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedClientes.map((cliente) => (
                  <Card key={cliente.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 mb-1">
                            {cliente.nome}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Cadastrado em {format(new Date(cliente.created_at!), 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(cliente)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(cliente)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {cliente.telefone && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{cliente.telefone}</span>
                          </div>
                        )}
                        {cliente.email && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Mail className="h-4 w-4" />
                            <span className="truncate">{cliente.email}</span>
                          </div>
                        )}
                        {cliente.date_of_birth && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <CalendarBirthday className="h-4 w-4" />
                            <span>
                              {/* Corrige para mostrar corretamente a data */}
                              {(() => {
                                const d = parseDateLocal(cliente.date_of_birth!);
                                return d
                                  ? format(d, 'dd/MM/yyyy', { locale: ptBR })
                                  : '';
                              })()}
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

export default Clientes;
