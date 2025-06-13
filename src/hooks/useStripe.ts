
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export type StripePlanType = 'AUTONOMO' | 'BASICO' | 'PREMIUM';

export const useStripe = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const STRIPE_PRICES = {
    AUTONOMO: {
      priceId: 'price_1RY6qLPXpiLbJ63CnoCv4uFr',
      name: 'Autônomo',
      price: 55,
      description: 'Perfeito para profissionais independentes'
    },
    BASICO: {
      priceId: 'price_1RY6qkPXpiLbJ63CKRaxvAkW', 
      name: 'Básico',
      price: 120,
      description: 'Para salões pequenos com até 3 profissionais'
    },
    PREMIUM: {
      priceId: 'price_1RY6n5PXpiLbJ63Ccqpicdz9',
      name: 'Premium', 
      price: 250,
      description: 'Para salões maiores com até 10 profissionais'
    }
  };

  const createCheckoutSession = useCallback(async (planType: StripePlanType): Promise<string | null> => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return null;
    }

    setLoading(true);
    try {
      console.log('useStripe: Criando sessão de checkout para:', planType);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planType }
      });

      if (error) {
        console.error('useStripe: Erro na Edge Function create-checkout:', error);
        toast.error(`Erro ao criar sessão: ${error.message}`);
        return null;
      }

      if (!data?.url) {
        console.error('useStripe: URL de checkout não retornada');
        toast.error('URL de checkout não foi gerada');
        return null;
      }

      console.log('useStripe: Sessão criada com sucesso');
      return data.url;
    } catch (error) {
      console.error('useStripe: Erro inesperado:', error);
      toast.error('Erro inesperado ao criar sessão de pagamento');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const checkSubscription = useCallback(async () => {
    if (!user) {
      console.warn('useStripe: Usuário não autenticado para verificar assinatura');
      return { subscribed: false };
    }

    try {
      console.log('useStripe: Verificando assinatura');
      
      const { data, error } = await supabase.functions.invoke('check-subscription');

      if (error) {
        console.error('useStripe: Erro ao verificar assinatura:', error);
        // Retorna estado padrão em caso de erro, sem mostrar toast para evitar spam
        return { subscribed: false };
      }

      console.log('useStripe: Status da assinatura:', data);
      return data || { subscribed: false };
    } catch (error) {
      console.error('useStripe: Erro inesperado ao verificar assinatura:', error);
      return { subscribed: false };
    }
  }, [user]);

  const createCustomerPortalSession = useCallback(async (): Promise<string | null> => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return null;
    }

    setLoading(true);
    try {
      console.log('useStripe: Criando sessão do portal do cliente');
      
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) {
        console.error('useStripe: Erro na Edge Function customer-portal:', error);
        toast.error(`Erro ao acessar portal: ${error.message}`);
        return null;
      }

      if (!data?.url) {
        console.error('useStripe: URL do portal não retornada');
        toast.error('URL do portal não foi gerada');
        return null;
      }

      console.log('useStripe: Portal criado com sucesso');
      return data.url;
    } catch (error) {
      console.error('useStripe: Erro inesperado:', error);
      toast.error('Erro inesperado ao acessar portal');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    createCheckoutSession,
    checkSubscription,
    createCustomerPortalSession,
    loading,
    STRIPE_PRICES
  };
};
