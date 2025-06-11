
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StripeCheckout from '@/components/StripeCheckout';
import { useStripe } from '@/hooks/useStripe';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';

const Planos = () => {
  const { checkSubscription } = useStripe();
  const [searchParams] = useSearchParams();
  const [subscriptionData, setSubscriptionData] = useState<{
    subscribed: boolean;
    subscription_tier?: string;
    subscription_end?: string;
  } | null>(null);

  // Verificar se veio de uma transação
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

  useEffect(() => {
    const loadSubscriptionData = async () => {
      const data = await checkSubscription();
      setSubscriptionData(data);
    };

    loadSubscriptionData();
  }, [checkSubscription]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Status Messages */}
          {success && (
            <div className="mx-auto max-w-2xl p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-800">Assinatura Confirmada!</h3>
                  <p className="text-green-700 text-sm">Sua assinatura foi ativada com sucesso.</p>
                </div>
              </div>
            </div>
          )}
          
          {canceled && (
            <div className="mx-auto max-w-2xl p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <XCircle className="h-6 w-6 text-yellow-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-yellow-800">Assinatura Cancelada</h3>
                  <p className="text-yellow-700 text-sm">O processo de assinatura foi cancelado. Você pode tentar novamente quando quiser.</p>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Planos de Assinatura</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Escolha o plano ideal para o seu negócio. Você pode alterar a qualquer momento.
            </p>
            
            {subscriptionData?.subscribed && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg max-w-2xl mx-auto">
                <h3 className="font-semibold text-green-800 mb-2">✅ Assinatura Ativa!</h3>
                <p className="text-green-700 text-sm">
                  Plano atual: <strong>{subscriptionData.subscription_tier}</strong>
                  {subscriptionData.subscription_end && (
                    <span> - Válido até {new Date(subscriptionData.subscription_end).toLocaleDateString('pt-BR')}</span>
                  )}
                </p>
                <div className="mt-3">
                  <Link to="/manage-subscription">
                    <Button variant="outline" size="sm">
                      Gerenciar Assinatura
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <StripeCheckout 
              planType="AUTONOMO" 
              isCurrentPlan={subscriptionData?.subscription_tier === 'Autônomo'}
            />
            <StripeCheckout 
              planType="BASICO" 
              isCurrentPlan={subscriptionData?.subscription_tier === 'Básico'}
            />
            <StripeCheckout 
              planType="PREMIUM" 
              isCurrentPlan={subscriptionData?.subscription_tier === 'Premium'}
            />
          </div>

          {/* Additional Information */}
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Informações Adicionais</CardTitle>
              <CardDescription>Formas de pagamento e política de cancelamento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  💳 Formas de Pagamento
                </h4>
                <p className="text-sm text-gray-600">
                  Aceitamos cartão de crédito, débito e boleto bancário via Stripe. 
                  A cobrança é feita automaticamente todo mês na data do seu cadastro.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  🔄 Alteração de Planos
                </h4>
                <p className="text-sm text-gray-600">
                  Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. 
                  As alterações entram em vigor imediatamente.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  ❌ Cancelamento
                </h4>
                <p className="text-sm text-gray-600">
                  Sem fidelidade! Você pode cancelar a qualquer momento através do portal do cliente. 
                  Após o cancelamento, você mantém acesso até o final do período pago.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Planos;
