
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { type Agendamento } from '@/hooks/useSupabase';

interface FormHeaderProps {
  isOpen: boolean;
  onClose: () => void;
  editingAgendamento: Agendamento | null;
}

export const FormHeader: React.FC<FormHeaderProps> = ({
  isOpen,
  onClose,
  editingAgendamento
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingAgendamento ? 'Editar Agendamento' : 'Novo Agendamento'}
          </DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
