
import React from 'react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { type Agendamento } from '@/hooks/useSupabase';

interface FormActionsProps {
  isFormValid: boolean;
  loading: boolean;
  editingAgendamento: Agendamento | null;
  onClose: () => void;
}

export const FormActions: React.FC<FormActionsProps> = ({
  isFormValid,
  loading,
  editingAgendamento,
  onClose
}) => {
  return (
    <DialogFooter className="gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={loading}
      >
        Cancelar
      </Button>
      <Button
        type="submit"
        disabled={!isFormValid || loading}
        className="bg-pink-600 hover:bg-pink-700"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Salvando...
          </div>
        ) : (
          editingAgendamento ? 'Atualizar Agendamento' : 'Salvar Agendamento'
        )}
      </Button>
    </DialogFooter>
  );
};
