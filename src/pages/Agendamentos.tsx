
import { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/context/AppContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const Agendamentos = () => {
  const { agendamentos, clientes, addAgendamento, editAgendamento, deleteAgendamento } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAgendamento, setEditingAgendamento] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    clienteId: '',
    servico: '',
    profissional: '',
    data: '',
    horario: '',
    valor: ''
  });

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ];

  const resetForm = () => {
    setFormData({
      clienteId: '',
      servico: '',
      profissional: '',
      data: '',
      horario: '',
      valor: ''
    });
    setEditingAgendamento(null);
  };

  const handleOpenDialog = (agendamento = null) => {
    if (agendamento) {
      setEditingAgendamento(agendamento);
      setFormData({
        clienteId: agendamento.clienteId,
        servico: agendamento.servico,
        profissional: agendamento.profissional,
        data: agendamento.data,
        horario: agendamento.horario,
        valor: agendamento.valor?.toString() || ''
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
    
    if (!formData.clienteId || !formData.servico || !formData.profissional || !formData.data || !formData.horario) {
      return;
    }

    const cliente = clientes.find(c => c.id === formData.clienteId);
    if (!cliente) return;

    const agendamentoData = {
      clienteId: formData.clienteId,
      clienteNome: cliente.nome,
      servico: formData.servico,
      profissional: formData.profissional,
      data: formData.data,
      horario: formData.horario,
      status: 'agendado' as const,
      valor: formData.valor ? parseFloat(formData.valor) : undefined
    };

    if (editingAgendamento) {
      editAgendamento(editingAgendamento.id, agendamentoData);
    } else {
      addAgendamento(agendamentoData);
    }
    
    handleCloseDialog();
  };

  const handleDelete = (agendamento: any) => {
    if (window.confirm(`Tem certeza que deseja excluir o agendamento de ${agendamento.clienteNome}?`)) {
      deleteAgendamento(agendamento.id);
    }
  };

  const sortedAgendamentos = [...agendamentos].sort((a, b) => {
    const dateA = new Date(`${a.data}T${a.horario}`);
    const dateB = new Date(`${b.data}T${b.horario}`);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agendamentos</h1>
            <p className="text-gray-600 mt-1">Gerencie todos os agendamentos do seu estabelecimento</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-pink-600 hover:bg-pink-700"
                onClick={() => handleOpenDialog()}
              >
                + Novo Agendamento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingAgendamento ? 'Editar Agendamento' : 'Novo Agendamento'}
                </DialogTitle>
                <DialogDescription>
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
                  <Input
                    id="servico"
                    placeholder="Ex: Corte + Barba"
                    value={formData.servico}
                    onChange={(e) => setFormData(prev => ({ ...prev, servico: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profissional">Profissional</Label>
                  <Input
                    id="profissional"
                    placeholder="Nome do profissional"
                    value={formData.profissional}
                    onChange={(e) => setFormData(prev => ({ ...prev, profissional: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
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
                  <Label htmlFor="valor">Valor (Opcional)</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.valor}
                    onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
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
                    disabled={clientes.length === 0 || !formData.clienteId}
                  >
                    {editingAgendamento ? 'Salvar Alterações' : 'Salvar Agendamento'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Agendamentos List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Agendamentos</CardTitle>
            <CardDescription>
              {agendamentos.length === 0 
                ? 'Nenhum agendamento cadastrado ainda.' 
                : `${agendamentos.length} agendamento${agendamentos.length > 1 ? 's' : ''} cadastrado${agendamentos.length > 1 ? 's' : ''}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {agendamentos.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">📅</span>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum agendamento cadastrado
                </h3>
                <p className="text-gray-600 mb-6">
                  Comece criando seu primeiro agendamento!
                </p>
                <Button 
                  className="bg-pink-600 hover:bg-pink-700"
                  onClick={() => handleOpenDialog()}
                >
                  + Criar Primeiro Agendamento
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedAgendamentos.map((agendamento) => (
                  <div 
                    key={agendamento.id} 
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="font-semibold text-lg">{agendamento.clienteNome}</h3>
                        <span className={cn(
                          "px-2 py-1 text-xs font-medium rounded-full",
                          agendamento.status === 'agendado' && "bg-blue-100 text-blue-800",
                          agendamento.status === 'concluido' && "bg-green-100 text-green-800",
                          agendamento.status === 'cancelado' && "bg-red-100 text-red-800"
                        )}>
                          {agendamento.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Serviço:</span>
                          <p>{agendamento.servico}</p>
                        </div>
                        <div>
                          <span className="font-medium">Profissional:</span>
                          <p>{agendamento.profissional}</p>
                        </div>
                        <div>
                          <span className="font-medium">Data:</span>
                          <p>{format(new Date(agendamento.data), 'dd/MM/yyyy', { locale: ptBR })}</p>
                        </div>
                        <div>
                          <span className="font-medium">Horário:</span>
                          <p>{agendamento.horario}</p>
                        </div>
                      </div>
                      {agendamento.valor && (
                        <div className="mt-2">
                          <span className="text-green-600 font-medium">
                            R$ {agendamento.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
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
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Agendamentos;
