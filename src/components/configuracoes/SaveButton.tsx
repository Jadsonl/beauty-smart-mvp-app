
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface SaveButtonProps {
  onSave: () => void;
  isSaving: boolean;
  loading: boolean;
}

const SaveButton: React.FC<SaveButtonProps> = ({
  onSave,
  isSaving,
  loading
}) => {
  return (
    <div className="flex justify-end">
      <Button 
        onClick={onSave}
        disabled={isSaving || loading}
        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
      >
        <Save className="h-4 w-4 mr-2" />
        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
      </Button>
    </div>
  );
};

export default SaveButton;
