
import { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import HistoricoAgendamentos from '@/components/HistoricoAgendamentos';
import { AgendamentoForm } from '@/components/agendamentos/AgendamentoForm';
import { AgendamentosList } from '@/components/agendamentos/AgendamentosList';
import { DeleteConfirmationModal } from '@/components/common/DeleteConfirmationModal';
import { useAgendamentos } from '@/hooks/useAgendamentos';
import { type Agendamento } from '@/hooks/useSupabase';

const Agendamentos = () => {
  const {
    agendamentos,
    clientes,
    servicos,
    profissionais,
    loading,
    handleStatusChange,
    handleDelete,
    handleSubmitAgendamento
  } = useAgendamentos();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAgendamento, setEditingAgendamento] = useState<Agendamento | null>(null);
  const [deleteAgendamento, setDeleteAgendamento] = useState<Agendamento | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleOpenDialog = (agendamento: Agendamento | null = null) => {
    setEditingAgendamento(agendamento);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAgendamento(null);
  };

  const handleOpenDeleteModal = (agendamento: Agendamento) => {
    setDeleteAgendamento(agendamento);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteAgendamento(null);
  };

  const handleConfirmDelete = async () => {
    if (deleteAgendamento) {
      await handleDelete(deleteAgendamento);
      handleCloseDeleteModal();
    }
  };

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
                
                <Button 
                  className="bg-pink-600 hover:bg-pink-700 w-full sm:w-auto"
                  onClick={() => handleOpenDialog()}
                >
                  +Novo Agendamento
                </Button>
              </div>

              {/* Agendamentos List */}
              <AgendamentosList
                agendamentos={agendamentos}
                servicos={servicos}
                profissionais={profissionais}
                onCreateNew={() => handleOpenDialog()}
                onEdit={handleOpenDialog}
                onDelete={handleOpenDeleteModal}
                onStatusChange={handleStatusChange}
              />
            </div>
          </TabsContent>

          <TabsContent value="historico">
            <HistoricoAgendamentos />
          </TabsContent>
        </Tabs>

        {/* Form Dialog */}
        <AgendamentoForm
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
          onSubmit={handleSubmitAgendamento}
          editingAgendamento={editingAgendamento}
          clientes={clientes}
          servicos={servicos}
          profissionais={profissionais}
          loading={loading}
        />

        {/* Modal de Confirmação de Exclusão */}
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          title="Excluir Agendamento"
          description={`Tem certeza que deseja excluir o agendamento de ${deleteAgendamento?.client_name}? Esta ação não pode ser desfeita.`}
          loading={loading}
        />
      </div>
    </Layout>
  );
};

export default Agendamentos;
