
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStripe } from '@/hooks/useStripe';
import { type StripePlanType } from '@/lib/stripe';
import { Check, Loader2 } from 'lucide-react';

interface StripeCheckoutProps {
  planType: StripePlanType;
  isCurrentPlan?: boolean;
}

const StripeCheckout: React.FC<StripeCheckoutProps> = ({ planType, isCurrentPlan = false }) => {
  const { createCheckoutSession, loading, STRIPE_PRICES } = useStripe();

  const plan = STRIPE_PRICES[planType];

  const handleCheckout = async () => {
    try {
      const checkoutUrl = await createCheckoutSession(planType);
      if (checkoutUrl) {
        // Abrir checkout do Stripe em nova aba
        window.open(checkoutUrl, '_blank');
      } else {
        alert('Erro ao criar sessão de pagamento. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro no checkout:', error);
      alert('Erro inesperado. Tente novamente.');
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
    <Card className={`relative ${planType === 'PREMIUM' ? 'border-pink-200 bg-pink-50' : ''}`}>
      {planType === 'PREMIUM' && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-pink-600 text-white">Mais Popular</Badge>
        </div>
      )}
      
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <CardDescription className="text-sm">
          {planType === 'AUTONOMO' && 'Ideal para profissionais independentes'}
          {planType === 'BASICO' && 'Para salões pequenos com até 3 profissionais'}
          {planType === 'PREMIUM' && 'Para salões maiores com até 10 profissionais'}
        </CardDescription>
        <div className="pt-4">
          <span className="text-4xl font-bold text-gray-900">R$ {plan.price}</span>
          <span className="text-gray-600">/mês</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <ul className="space-y-3">
          {features[planType].map((feature, index) => (
            <li key={index} className="flex items-start space-x-3">
              <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
        
        <div className="pt-4">
          {isCurrentPlan ? (
            <Button className="w-full" variant="outline" disabled>
              Plano Atual
            </Button>
          ) : (
            <Button 
              className="w-full bg-pink-600 hover:bg-pink-700"
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
