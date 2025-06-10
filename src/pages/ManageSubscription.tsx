
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStripe } from '@/hooks/useStripe';
import { Badge } from '@/components/ui/badge';
import { Calendar, CreditCard, Settings } from 'lucide-react';

const ManageSubscription = () => {
  const { checkSubscription, openCustomerPortal, loading } = useStripe();
  const [subscriptionData, setSubscriptionData] = useState<{
    subscribed: boolean;
    subscription_tier?: string;
    subscription_end?: string;
  } | null>(null);

  useEffect(() => {
    const loadSubscriptionData = async () => {
      const data = await checkSubscription();
      setSubscriptionData(data);
    };

    loadSubscriptionData();
  }, [checkSubscription]);

  const handleOpenPortal = async () => {
    const portalUrl = await openCustomerPortal();
    if (portalUrl) {
      window.open(portalUrl, '_blank');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gerenciar Assinatura</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Visualize e gerencie sua assinatura BelezaSmart
          </p>
        </div>

        {subscriptionData ? (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                  <CreditCard className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span>Status da Assinatura</span>
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Informações sobre sua assinatura atual
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Status</span>
                  <Badge variant={subscriptionData.subscribed ? "default" : "secondary"}>
                    {subscriptionData.subscribed ? "Ativa" : "Inativa"}
                  </Badge>
                </div>

                {subscriptionData.subscribed && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Plano Atual</span>
                      <Badge variant="outline">
                        {subscriptionData.subscription_tier}
                      </Badge>
                    </div>

                    {subscriptionData.subscription_end && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Próxima Cobrança</span>
                        </span>
                        <span className="text-sm text-gray-600">
                          {formatDate(subscriptionData.subscription_end)}
                        </span>
                      </div>
                    )}
                  </>
                )}

                <div className="pt-4 border-t">
                  <Button 
                    onClick={handleOpenPortal}
                    disabled={loading}
                    className="w-full flex items-center justify-center space-x-2 text-sm sm:text-base py-2 sm:py-3"
                  >
                    <Settings className="h-4 w-4" />
                    <span>
                      {loading ? 'Carregando...' : 'Gerenciar no Portal Stripe'}
                    </span>
                  </Button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Altere seu plano, atualize método de pagamento ou cancele sua assinatura
                  </p>
                </div>
              </CardContent>
            </Card>

            {!subscriptionData.subscribed && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Nenhuma Assinatura Ativa</CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Você não possui uma assinatura ativa no momento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => window.location.href = '/planos'}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-sm sm:text-base py-2 sm:py-3"
                  >
                    Ver Planos Disponíveis
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-600 text-sm sm:text-base">Carregando informações da assinatura...</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ManageSubscription;
