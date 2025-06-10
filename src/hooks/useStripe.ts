
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { STRIPE_PRICES, type StripePlanType } from '@/lib/stripe';
import { useAuth } from '@/hooks/useAuth';

export const useStripe = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Criar sessão de checkout
  const createCheckoutSession = async (planType: StripePlanType): Promise<string | null> => {
    if (!user) {
      console.error('Usuário não autenticado');
      return null;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceId: STRIPE_PRICES[planType].priceId,
          planType: planType
        }
      });

      if (error) {
        console.error('Erro ao criar sessão de checkout:', error);
        return null;
      }

      return data?.url || null;
    } catch (error) {
      console.error('Erro inesperado ao criar checkout:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Verificar status da assinatura
  const checkSubscription = async (): Promise<{
    subscribed: boolean;
    subscription_tier?: string;
    subscription_end?: string;
  } | null> => {
    if (!user) return null;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');

      if (error) {
        console.error('Erro ao verificar assinatura:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro inesperado ao verificar assinatura:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Acessar portal do cliente
  const openCustomerPortal = async (): Promise<string | null> => {
    if (!user) return null;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) {
        console.error('Erro ao acessar portal do cliente:', error);
        return null;
      }

      return data?.url || null;
    } catch (error) {
      console.error('Erro inesperado ao acessar portal:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createCheckoutSession,
    checkSubscription,
    openCustomerPortal,
    STRIPE_PRICES
  };
};
