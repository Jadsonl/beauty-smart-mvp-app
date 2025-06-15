
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { type Agendamento } from '@/hooks/useSupabase';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const useWhatsAppConfirmation = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const generateConfirmationToken = async (appointmentId: string): Promise<string | null> => {
    if (!user?.id) {
      console.error('User not authenticated');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('confirmation_tokens')
        .insert({
          appointment_id: appointmentId,
          user_id: user.id
        })
        .select('token')
        .single();

      if (error) {
        console.error('Error creating confirmation token:', error);
        return null;
      }

      return data.token;
    } catch (error) {
      console.error('Unexpected error creating token:', error);
      return null;
    }
  };

  const sendWhatsAppConfirmation = async (agendamento: Agendamento) => {
    if (!agendamento.client_phone) {
      toast.error('Cliente não possui telefone cadastrado');
      return;
    }

    setLoading(true);

    try {
      // Generate confirmation token
      const token = await generateConfirmationToken(agendamento.id);
      
      if (!token) {
        toast.error('Erro ao gerar token de confirmação');
        return;
      }

      // Business WhatsApp number
      const businessPhone = '5571993131463'; // (55) 71 99313-1463
      
      // Format date
      const formattedDate = format(new Date(agendamento.date), 'dd/MM/yyyy', { locale: ptBR });
      
      // Confirmation URL
      const confirmationUrl = `https://dyauabkczodvhsgyqouq.supabase.co/functions/v1/confirm-appointment?token=${token}`;
      
      // Create WhatsApp message
      const message = `Olá, ${agendamento.client_name}!

Seu agendamento está quase confirmado. Seguem os detalhes:

📅 Data: ${formattedDate}
🕐 Horário: ${agendamento.time}
💼 Serviço: ${agendamento.service}

Para confirmar, clique no botão abaixo:
👉 ${confirmationUrl}

Obrigado!`;

      // Encode message for URL
      const encodedMessage = encodeURIComponent(message);
      
      // Create WhatsApp URL
      const whatsappUrl = `https://wa.me/${businessPhone}?text=${encodedMessage}`;
      
      // Open WhatsApp
      window.open(whatsappUrl, '_blank');
      
      toast.success('Link de confirmação criado! WhatsApp foi aberto.');
      
    } catch (error) {
      console.error('Error sending WhatsApp confirmation:', error);
      toast.error('Erro ao enviar confirmação por WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  return {
    sendWhatsAppConfirmation,
    loading
  };
};
