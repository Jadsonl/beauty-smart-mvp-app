
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAniversariantes } from '@/hooks/useAniversariantes';
import { MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

export const AniversariantesDoDia: React.FC = () => {
  const { aniversariantesDoDia, loading, createBirthdayWhatsAppLink } = useAniversariantes();

  const handleWhatsAppClick = (cliente: any) => {
    const link = createBirthdayWhatsAppLink(cliente);
    
    if (!link) {
      toast.error(`Cliente ${cliente.nome} não possui telefone cadastrado`);
      return;
    }

    console.log('WhatsApp link gerado para aniversariante:', link);
    
    // Abrir WhatsApp
    const opened = window.open(link, '_blank');
    
    // Fallback para iOS se whatsapp:// não funcionar
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS && !opened && link.startsWith('whatsapp://')) {
      setTimeout(() => {
        const fallbackUrl = link.replace('whatsapp://send?phone=', 'https://wa.me/+').replace('&text=', '?text=');
        console.log('Fallback para wa.me:', fallbackUrl);
        window.open(fallbackUrl, '_blank');
      }, 1000);
    }
    
    toast.success(`Mensagem de aniversário preparada para ${cliente.nome}!`);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <span className="text-xl">🎂</span>
            Aniversariantes de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  if (aniversariantesDoDia.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <span className="text-xl">🎂</span>
            Aniversariantes de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <span className="text-2xl sm:text-3xl mb-2 block">📅</span>
            <p className="text-gray-500 text-sm">Nenhum aniversariante hoje.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-orange-800">
          <span className="text-xl">🎉</span>
          Aniversariantes de Hoje ({aniversariantesDoDia.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {aniversariantesDoDia.map((cliente) => (
            <div key={cliente.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-white rounded-lg border border-orange-200 gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-orange-900 text-sm sm:text-base truncate">
                  🎂 {cliente.nome}
                </p>
                <p className="text-xs sm:text-sm text-orange-700">
                  Hoje é aniversário!
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => handleWhatsAppClick(cliente)}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 w-full sm:w-auto"
                disabled={!cliente.telefone}
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-xs sm:text-sm">WhatsApp</span>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
