
import React from 'react';
import { Button } from '@/components/ui/button';
import { useStripe } from '@/hooks/useStripe';
import { type StripePlanType } from '@/lib/stripe';
import { Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface StripeCheckoutProps {
  planType: StripePlanType;
  isCurrentPlan?: boolean;
}

const StripeCheckout: React.FC<StripeCheckoutProps> = ({ planType, isCurrentPlan = false }) => {
  const { createCheckoutSession, loading, STRIPE_PRICES } = useStripe();

  const plan = STRIPE_PRICES[planType];

  const handleCheckout = async () => {
    try {
      console.log('Iniciando checkout para plano:', planType);
      console.log('Dados do plano:', plan);
      
      const checkoutUrl = await createCheckoutSession(planType);
      
      if (checkoutUrl) {
        console.log('URL de checkout recebida:', checkoutUrl);
        // Abrir checkout do Stripe em nova aba
        window.open(checkoutUrl, '_blank');
      } else {
        console.error('URL de checkout não retornada ou inválida');
        toast.error('Erro ao criar sessão de pagamento. Verifique os logs para mais detalhes.');
      }
    } catch (error) {
      console.error('Erro no checkout:', error);
      toast.error('Erro inesperado ao processar pagamento. Tente novamente.');
    }
  };

  return (
    <div className="w-full">
      {isCurrentPlan ? (
        <Button 
          className="w-full text-sm sm:text-base py-2 sm:py-3" 
          variant="outline" 
          disabled
        >
          <Check className="mr-2 h-4 w-4" />
          Plano Atual
        </Button>
      ) : (
        <Button 
          className="w-full bg-pink-600 hover:bg-pink-700 text-white text-sm sm:text-base py-2 sm:py-3"
          onClick={handleCheckout}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            'Escolher Plano'
          )}
        </Button>
      )}
    </div>
  );
};

export default StripeCheckout;
