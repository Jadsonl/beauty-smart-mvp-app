

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useSupabase, type Agendamento, type Cliente, type Servico, type Profissional } from '@/hooks/useSupabase';
import { useAuth } from '@/hooks/useAuth';
// --- Only import CalendarIcon from lucide-react, NOT Calendar!! ---
import { CalendarIcon, Clock, User, Phone, Mail, Plus, Edit, Trash2, Save, X, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import HistoricoAgendamentos from '@/components/HistoricoAgendamentos';
// --- Import Calendar from your shadcn/ui component library ---
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { cn } from "@/lib/utils";

const Agendamentos = () => {
  const { 
    getAgendamentos, 
    addAgendamento, 
    updateAgendamento, 
    deleteAgendamento,
    getClientes,
    getServicos,
    getProfissionais,
    loading 
  } = useSupabase();
  
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAgendamento, setEditingAgendamento] = useState<Agendamento | null>(null);
  
  const [formData, setFormData] = useState({
    clienteId: '',
    servicoId: '',
    profissionalId: '',
    servicoValor: '',
    data: '',
    horario: '',
    observacoes: ''
  });

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ];

  const statusOptions = [
    { value: 'scheduled', label: 'Agendado', color: 'bg-blue-100 text-blue-800' },
    { value: 'confirmed', label: 'Confirmado', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'completed', label: 'Concluído', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelado', color: 'bg-red-100 text-red-800' }
  ];

  // Carregar dados do Supabase
  useEffect(() => {
    const loadData = async () => {
      console.log('Carregando agendamentos, clientes, serviços e profissionais do Supabase...');
      
      const [agendamentosData, clientesData, servicosData, profissionaisData] = await Promise.all([
        getAgendamentos(),
        getClientes(),
        getServicos(),
        getProfissionais()
      ]);
      
      setAgendamentos(agendamentosData);
      setClientes(clientesData);
      setServicos(servicosData);
      setProfissionais(profissionaisData);
      
      console.log('Dados carregados:', { 
        agendamentos: agendamentosData.length, 
        clientes: clientesData.length,
        servicos: servicosData.length,
        profissionais: profissionaisData.length
      });
    };

    loadData();
  }, []);

  const resetForm = () => {
    setFormData({
      clienteId: '',
      servicoId: '',
      profissionalId: '',
      servicoValor: '',
      data: '',
      horario: '',
      observacoes: ''
    });
    setEditingAgendamento(null);
  };

  const handleOpenDialog = (agendamento: Agendamento | null = null) => {
    if (agendamento) {
      setEditingAgendamento(agendamento);
      
      // Encontrar cliente pelo nome
      const cliente = clientes.find(c => c.nome === agendamento.client_name);
      
      setFormData({
        clienteId: cliente?.id || '',
        servicoId: agendamento.service_id || '',
        profissionalId: agendamento.professional_id || '',
        servicoValor: agendamento.service_value_at_appointment?.toString() || '',
        data: agendamento.date,
        horario: agendamento.time,
        observacoes: agendamento.notes || ''
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

  const handleServicoChange = (servicoId: string) => {
    setFormData(prev => ({ ...prev, servicoId }));
    
    // Pré-preencher o valor do serviço
    const servico = servicos.find(s => s.id === servicoId);
    if (servico) {
      setFormData(prev => ({ ...prev, servicoValor: servico.preco.toString() }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clienteId || !formData.servicoId || !formData.data || !formData.horario) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const cliente = clientes.find(c => c.id === formData.clienteId);
    const servico = servicos.find(s => s.id === formData.servicoId);
    
    if (!cliente || !servico) {
      toast.error('Cliente ou serviço não encontrado');
      return;
    }

    const agendamentoData = {
      client_name: cliente.nome,
      client_email: cliente.email || '',
      client_phone: cliente.telefone || '',
      service: servico.nome,
      service_id: formData.servicoId,
      service_value_at_appointment: parseFloat(formData.servicoValor) || servico.preco,
      professional_id: formData.profissionalId || undefined,
      date: formData.data,
      time: formData.horario,
      status: 'scheduled' as const,
      notes: formData.observacoes
    };

    let success = false;

    if (editingAgendamento) {
      success = await updateAgendamento(editingAgendamento.id, agendamentoData);
      if (success) {
        toast.success('Agendamento atualizado com sucesso!');
        // Atualizar lista local
        setAgendamentos(prev => prev.map(a => 
          a.id === editingAgendamento.id 
            ? { ...a, ...agendamentoData }
            : a
        ));
      } else {
        toast.error('Erro ao atualizar agendamento');
      }
    } else {
      success = await addAgendamento(agendamentoData);
      if (success) {
        toast.success('Agendamento criado com sucesso!');
        // Recarregar lista
        const novosAgendamentos = await getAgendamentos();
        setAgendamentos(novosAgendamentos);
      } else {
        toast.error('Erro ao criar agendamento');
      }
    }
    
    if (success) {
      handleCloseDialog();
    }
  };

  const handleDelete = async (agendamento: Agendamento) => {
    if (window.confirm(`Tem certeza que deseja excluir o agendamento de ${agendamento.client_name}?`)) {
      const success = await deleteAgendamento(agendamento.id);
      if (success) {
        toast.success('Agendamento excluído com sucesso!');
        setAgendamentos(prev => prev.filter(a => a.id !== agendamento.id));
      } else {
        toast.error('Erro ao excluir agendamento');
      }
    }
  };

  const handleStatusChange = async (agendamento: Agendamento, newStatus: string) => {
    const success = await updateAgendamento(agendamento.id, { status: newStatus as any });
    if (success) {
      toast.success('Status atualizado com sucesso!');
      // Atualizar lista local
      setAgendamentos(prev => prev.map(a => 
        a.id === agendamento.id 
          ? { ...a, status: newStatus as any }
          : a
      ));
    } else {
      toast.error('Erro ao atualizar status');
    }
  };

  const getClienteName = (clientName: string) => {
    return clientName;
  };

  const getServiceName = (serviceId: string, serviceName: string) => {
    const servico = servicos.find(s => s.id === serviceId);
    return servico ? servico.nome : serviceName;
  };

  const getProfessionalName = (professionalId: string) => {
    const profissional = profissionais.find(p => p.id === professionalId);
    return profissional ? profissional.name : 'Não definido';
  };

  const getStatusConfig = (status: string) => {
    return statusOptions.find(opt => opt.value === status) || statusOptions[0];
  };

  const sortedAgendamentos = [...agendamentos].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateB.getTime() - dateA.getTime();
  });

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando agendamentos...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 p-4 sm:p-6">
        <Tabs defaultValue="agendamentos" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="agendamentos">Agendamentos</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="agendamentos">
            <div className="space-y-4 sm:space-y-8">
              {/* Header - Responsivo */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Agendamentos</h1>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">Gerencie todos os agendamentos do seu estabelecimento</p>
                </div>
                
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="bg-pink-600 hover:bg-pink-700 w-full sm:w-auto"
                      onClick={() => handleOpenDialog()}
                    >
                      + Novo Agendamento
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] w-[95vw] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-lg sm:text-xl">
                        {editingAgendamento ? 'Editar Agendamento' : 'Novo Agendamento'}
                      </DialogTitle>
                      <DialogDescription className="text-sm">
                        {editingAgendamento 
                          ? 'Edite as informações do agendamento.' 
                          : 'Preencha os dados para criar um novo agendamento.'
                        }
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cliente">Selecione o Cliente</Label>
                        {clientes.length === 0 ? (
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p className="text-sm text-yellow-800">
                              Nenhum cliente cadastrado. Cadastre um cliente primeiro.
                            </p>
                          </div>
                        ) : (
                          <Select 
                            value={formData.clienteId} 
                            onValueChange={(value) => setFormData(prev => ({ ...prev, clienteId: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Escolha um cliente" />
                            </SelectTrigger>
                            <SelectContent>
                              {clientes.map((cliente) => (
                                <SelectItem key={cliente.id} value={cliente.id}>
                                  {cliente.nome} - {cliente.telefone}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="servico">Serviço</Label>
                        {servicos.length === 0 ? (
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p className="text-sm text-yellow-800">
                              Nenhum serviço cadastrado. Cadastre um serviço primeiro.
                            </p>
                          </div>
                        ) : (
                          <Select 
                            value={formData.servicoId} 
                            onValueChange={handleServicoChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Escolha um serviço" />
                            </SelectTrigger>
                            <SelectContent>
                              {servicos.map((servico) => (
                                <SelectItem key={servico.id} value={servico.id}>
                                  {servico.nome} - R$ {servico.preco.toFixed(2)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="valor">Valor do Serviço (R$)</Label>
                        <Input
                          id="valor"
                          type="number"
                          step="0.01"
                          placeholder="0,00"
                          value={formData.servicoValor}
                          onChange={(e) => setFormData(prev => ({ ...prev, servicoValor: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="profissional">Profissional (Opcional)</Label>
                        <Select 
                          value={formData.profissionalId} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, profissionalId: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Escolha um profissional" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Não definir profissional</SelectItem>
                            {profissionais.map((profissional) => (
                              <SelectItem key={profissional.id} value={profissional.id}>
                                {profissional.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Data</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !formData.data && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.data ? (
                                  format(new Date(formData.data), "dd/MM/yyyy", { locale: ptBR })
                                ) : (
                                  <span>Selecione a data</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={formData.data ? new Date(formData.data) : undefined}
                                onSelect={(date) => {
                                  if (date) {
                                    setFormData(prev => ({ 
                                      ...prev, 
                                      data: format(date, 'yyyy-MM-dd') 
                                    }));
                                  }
                                }}
                                locale={ptBR}
                                initialFocus
                                className={cn("p-3 pointer-events-auto")}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="horario">Horário</Label>
                          <Select 
                            value={formData.horario} 
                            onValueChange={(value) => setFormData(prev => ({ ...prev, horario: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Horário" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="observacoes">Observações (Opcional)</Label>
                        <Input
                          id="observacoes"
                          placeholder="Observações adicionais"
                          value={formData.observacoes}
                          onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handleCloseDialog}
                          className="w-full sm:w-auto"
                        >
                          Cancelar
                        </Button>
                        <Button 
                          type="submit" 
                          className="bg-pink-600 hover:bg-pink-700 w-full sm:w-auto"
                          disabled={clientes.length === 0 || servicos.length === 0 || !formData.clienteId || loading}
                        >
                          {editingAgendamento ? 'Salvar Alterações' : 'Salvar Agendamento'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Agendamentos List - Responsivo */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Lista de Agendamentos</CardTitle>
                  <CardDescription className="text-sm">
                    {agendamentos.length === 0 
                      ? 'Nenhum agendamento cadastrado ainda.' 
                      : `${agendamentos.length} agendamento${agendamentos.length > 1 ? 's' : ''} cadastrado${agendamentos.length > 1 ? 's' : ''}`
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {agendamentos.length === 0 ? (
                    <div className="text-center py-8 sm:py-12">
                      <span className="text-4xl sm:text-6xl mb-4 block">📅</span>
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                        Nenhum agendamento cadastrado
                      </h3>
                      <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                        Comece criando seu primeiro agendamento!
                      </p>
                      <Button 
                        className="bg-pink-600 hover:bg-pink-700 w-full sm:w-auto"
                        onClick={() => handleOpenDialog()}
                      >
                        + Criar Primeiro Agendamento
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sortedAgendamentos.map((agendamento) => {
                        const statusConfig = getStatusConfig(agendamento.status || 'scheduled');
                        return (
                          <div 
                            key={agendamento.id} 
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow gap-4"
                          >
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                                <h3 className="font-semibold text-base sm:text-lg">{getClienteName(agendamento.client_name)}</h3>
                                <Select
                                  value={agendamento.status || 'scheduled'}
                                  onValueChange={(value) => handleStatusChange(agendamento, value)}
                                >
                                  <SelectTrigger className="w-fit">
                                    <span className={cn(
                                      "px-2 py-1 text-xs font-medium rounded-full",
                                      statusConfig.color
                                    )}>
                                      {statusConfig.label}
                                    </span>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {statusOptions.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-sm text-gray-600">
                                <div>
                                  <span className="font-medium">Serviço:</span>
                                  <p className="truncate">{getServiceName(agendamento.service_id || '', agendamento.service)}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Profissional:</span>
                                  <p className="truncate">{getProfessionalName(agendamento.professional_id || '')}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Data:</span>
                                  <p>{format(new Date(agendamento.date), 'dd/MM/yyyy', { locale: ptBR })}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Horário:</span>
                                  <p>{agendamento.time}</p>
                                </div>
                                {agendamento.service_value_at_appointment && (
                                  <div>
                                    <span className="font-medium">Valor:</span>
                                    <p className="text-green-600 font-medium">R$ {agendamento.service_value_at_appointment.toFixed(2)}</p>
                                  </div>
                                )}
                                {agendamento.notes && (
                                  <div className="sm:col-span-2 lg:col-span-1">
                                    <span className="font-medium">Obs:</span>
                                    <p className="truncate">{agendamento.notes}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 self-end sm:self-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenDialog(agendamento)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(agendamento)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="historico">
            <HistoricoAgendamentos />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Agendamentos;
