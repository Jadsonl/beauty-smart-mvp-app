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

  const formatPhoneNumber = (phone: string): string => {
    // Remove todos os caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Se já tem código do país (55), mantém
    if (cleanPhone.startsWith('55') && cleanPhone.length >= 12) {
      return `+${cleanPhone}`;
    }
    
    // Se tem 11 dígitos (DDD + número), adiciona código do país
    if (cleanPhone.length === 11) {
      return `+55${cleanPhone}`;
    }
    
    // Se tem 10 dígitos, adiciona 9 após o DDD e código do país
    if (cleanPhone.length === 10) {
      return `+55${cleanPhone.slice(0, 2)}9${cleanPhone.slice(2)}`;
    }
    
    console.warn('Formato de telefone não reconhecido:', phone);
    return `+${cleanPhone}`;
  };

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

      // Format client phone number to international format with +
      const clientPhone = formatPhoneNumber(agendamento.client_phone);
      
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
      
      // Detect if user is on iOS for better compatibility
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      let whatsappUrl: string;
      
      if (isIOS) {
        // For iOS, try the direct WhatsApp scheme first, fallback to wa.me
        const phoneWithoutPlus = clientPhone.replace('+', '');
        whatsappUrl = `whatsapp://send?phone=${phoneWithoutPlus}&text=${encodedMessage}`;
      } else {
        // For other platforms, use wa.me with +
        whatsappUrl = `https://wa.me/${clientPhone}?text=${encodedMessage}`;
      }
      
      console.log('WhatsApp URL gerada:', whatsappUrl);
      console.log('Número do cliente formatado:', clientPhone);
      console.log('Plataforma detectada:', isIOS ? 'iOS' : 'Outras');
      
      // Open WhatsApp
      const opened = window.open(whatsappUrl, '_blank');
      
      // If whatsapp:// scheme fails on iOS, fallback to wa.me
      if (isIOS && !opened) {
        setTimeout(() => {
          const fallbackUrl = `https://wa.me/${clientPhone}?text=${encodedMessage}`;
          console.log('Fallback para wa.me:', fallbackUrl);
          window.open(fallbackUrl, '_blank');
        }, 1000);
      }
      
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
