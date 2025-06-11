
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
      
      const checkoutUrl = await createCheckoutSession(planType);
      
      if (checkoutUrl) {
        console.log('URL de checkout recebida, abrindo em nova aba:', checkoutUrl);
        // Abrir checkout do Stripe em nova aba
        window.open(checkoutUrl, '_blank');
      } else {
        console.error('URL de checkout não retornada');
        toast.error('Erro ao criar sessão de pagamento. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro no checkout:', error);
      toast.error('Erro inesperado. Tente novamente.');
    }
  };

  const features = {
    AUTONOMO: [
      'Perfil profissional completo',
      'Agendamento online ilimitado',
      'Gerenciamento de agenda',
      'Lembretes automáticos por e-mail',
      'Histórico de clientes'
    ],
    BASICO: [
      'Perfil do salão personalizado',
      'Agendamento para até 3 profissionais',
      'Agenda centralizada',
      'Lembretes automáticos',
      'Relatórios básicos de faturamento'
    ],
    PREMIUM: [
      'Tudo do plano Básico',
      'Agendamento para até 10 profissionais',
      'Gerenciamento avançado',
      'Lembretes personalizáveis (e-mail + SMS)',
      'Relatórios personalizados'
    ]
  };

  return (
    <Card className={`relative h-full ${planType === 'PREMIUM' ? 'border-pink-200 bg-pink-50' : ''}`}>
      {planType === 'PREMIUM' && (
        <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-pink-600 text-white text-xs">Mais Popular</Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-3 sm:pb-4 px-4 sm:px-6">
        <CardTitle className="text-lg sm:text-xl lg:text-2xl">{plan.name}</CardTitle>
        <CardDescription className="text-xs sm:text-sm px-1 sm:px-2 leading-tight">
          {planType === 'AUTONOMO' && 'Ideal para profissionais independentes'}
          {planType === 'BASICO' && 'Para salões pequenos com até 3 profissionais'}
          {planType === 'PREMIUM' && 'Para salões maiores com até 10 profissionais'}
        </CardDescription>
        <div className="pt-2 sm:pt-4">
          <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">R$ {plan.price}</span>
          <span className="text-sm sm:text-base text-gray-600">/mês</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 sm:space-y-6 flex flex-col h-full px-4 sm:px-6">
        <ul className="space-y-2 sm:space-y-3 flex-grow">
          {features[planType].map((feature, index) => (
            <li key={index} className="flex items-start space-x-2 sm:space-x-3">
              <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-xs sm:text-sm text-gray-700 leading-tight">{feature}</span>
            </li>
          ))}
        </ul>
        
        <div className="pt-2 sm:pt-4 mt-auto">
          {isCurrentPlan ? (
            <Button className="w-full text-sm sm:text-base py-2 sm:py-3" variant="outline" disabled>
              Plano Atual
            </Button>
          ) : (
            <Button 
              className="w-full bg-pink-600 hover:bg-pink-700 text-sm sm:text-base py-2 sm:py-3"
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
      </CardContent>
    </Card>
  );
};

export default StripeCheckout;
