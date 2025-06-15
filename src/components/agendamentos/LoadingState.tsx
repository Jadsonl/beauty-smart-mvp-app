
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface LoadingStateProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  isOpen,
  onClose
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dados...</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
