
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StripeCheckout from '@/components/StripeCheckout';
import { useStripe } from '@/hooks/useStr4pe';
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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <div className="space-y-8 sm:space-y-12">
            {/* Status Messages */}
            {success && (
              <div className="mx-auto max-w-2xl p-4 sm:p-6 bg-green-50 border border-green-200 rounded-xl shadow-sm">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-green-800 text-base sm:text-lg">Assinatura Confirmada!</h3>
                    <p className="text-green-700 text-sm sm:text-base">Sua assinatura foi ativada com sucesso.</p>
                  </div>
                </div>
              </div>
            )}
            
            {canceled && (
              <div className="mx-auto max-w-2xl p-4 sm:p-6 bg-yellow-50 border border-yellow-200 rounded-xl shadow-sm">
                <div className="flex items-center space-x-3">
                  <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-yellow-800 text-base sm:text-lg">Assinatura Cancelada</h3>
                    <p className="text-yellow-700 text-sm sm:text-base">O processo de assinatura foi cancelado. Você pode tentar novamente quando quiser.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                Planos de Assinatura
              </h1>
              <p className="text-gray-600 max-w-3xl mx-auto text-base sm:text-lg lg:text-xl leading-relaxed px-4">
                Escolha o plano ideal para o seu negócio. Você pode alterar a qualquer momento e sem fidelidade.
              </p>
              
              {subscriptionData?.subscribed && (
                <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-green-50 border border-green-200 rounded-xl max-w-2xl mx-auto shadow-sm">
                  <h3 className="font-bold text-green-800 mb-3 text-base sm:text-lg flex items-center justify-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Assinatura Ativa!
                  </h3>
                  <p className="text-green-700 text-sm sm:text-base">
                    Plano atual: <strong className="text-green-800">{subscriptionData.subscription_tier}</strong>
                    {subscriptionData.subscription_end && (
                      <span className="block mt-1">
                        Válido até {new Date(subscriptionData.subscription_end).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </p>
                  <div className="mt-4">
                    <Link to="/manage-subscription">
                      <Button variant="outline" size="sm" className="bg-white hover:bg-gray-50 border-green-300 text-green-700 hover:text-green-800">
                        Gerenciar Assinatura
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Plans Grid */}
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Plano Autônomo */}
                <Card className="relative h-full flex flex-col border-2 hover:border-pink-300 transition-colors shadow-lg">
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">Autônomo</CardTitle>
                    <CardDescription className="text-sm sm:text-base text-gray-600">
                      Perfeito para profissionais independentes
                    </CardDescription>
                    <div className="mt-4">
                      <span className="text-3xl sm:text-4xl font-bold text-pink-600">R$ 55</span>
                      <span className="text-gray-600 text-sm sm:text-base">/mês</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <ul className="space-y-3 mb-6 flex-1">
                      <li className="flex items-center text-sm sm:text-base">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        Perfil profissional completo
                      </li>
                      <li className="flex items-center text-sm sm:text-base">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        Agendamento online ilimitado
                      </li>
                      <li className="flex items-center text-sm sm:text-base">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        Gerenciamento de agenda
                      </li>
                      <li className="flex items-center text-sm sm:text-base">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        Lembretes automáticos por e-mail
                      </li>
                      <li className="flex items-center text-sm sm:text-base">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        Histórico de clientes
                      </li>
                    </ul>
                    <div className="mt-auto">
                      <StripeCheckout 
                        planType="AUTONOMO" 
                        isCurrentPlan={subscriptionData?.subscription_tier === 'Autônomo'}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                {/* Plano Básico */}
                <Card className="relative h-full flex flex-col border-2 border-pink-500 hover:border-pink-600 transition-colors shadow-lg bg-pink-50">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-pink-500 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                      Mais Popular
                    </span>
                  </div>
                  <CardHeader className="text-center pb-4 pt-6">
                    <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">Básico</CardTitle>
                    <CardDescription className="text-sm sm:text-base text-gray-600">
                      Para salões pequenos com até 3 profissionais
                    </CardDescription>
                    <div className="mt-4">
                      <span className="text-3xl sm:text-4xl font-bold text-pink-600">R$ 120</span>
                      <span className="text-gray-600 text-sm sm:text-base">/mês</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <ul className="space-y-3 mb-6 flex-1">
                      <li className="flex items-center text-sm sm:text-base">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        Perfil do salão personalizado
                      </li>
                      <li className="flex items-center text-sm sm:text-base">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        Agendamento para até 3 profissionais
                      </li>
                      <li className="flex items-center text-sm sm:text-base">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        Agenda centralizada
                      </li>
                      <li className="flex items-center text-sm sm:text-base">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        Lembretes automáticos
                      </li>
                      <li className="flex items-center text-sm sm:text-base">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        Relatórios básicos de faturamento
                      </li>
                    </ul>
                    <div className="mt-auto">
                      <StripeCheckout 
                        planType="BASICO" 
                        isCurrentPlan={subscriptionData?.subscription_tier === 'Básico'}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                {/* Plano Premium */}
                <Card className="relative h-full flex flex-col border-2 hover:border-purple-300 transition-colors shadow-lg md:col-span-2 lg:col-span-1">
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">Premium</CardTitle>
                    <CardDescription className="text-sm sm:text-base text-gray-600">
                      Para salões maiores com até 10 profissionais
                    </CardDescription>
                    <div className="mt-4">
                      <span className="text-3xl sm:text-4xl font-bold text-purple-600">R$ 250</span>
                      <span className="text-gray-600 text-sm sm:text-base">/mês</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <ul className="space-y-3 mb-6 flex-1">
                      <li className="flex items-center text-sm sm:text-base">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        Tudo do plano Básico
                      </li>
                      <li className="flex items-center text-sm sm:text-base">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        Agendamento para até 10 profissionais
                      </li>
                      <li className="flex items-center text-sm sm:text-base">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        Gerenciamento avançado
                      </li>
                      <li className="flex items-center text-sm sm:text-base">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        Lembretes personalizáveis (e-mail + SMS)
                      </li>
                      <li className="flex items-center text-sm sm:text-base">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        Relatórios personalizados
                      </li>
                    </ul>
                    <div className="mt-auto">
                      <StripeCheckout 
                        planType="PREMIUM" 
                        isCurrentPlan={subscriptionData?.subscription_tier === 'Premium'}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Additional Information */}
            <Card className="max-w-5xl mx-auto shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-xl sm:text-2xl text-gray-900">Informações Adicionais</CardTitle>
                <CardDescription className="text-base sm:text-lg text-gray-600">
                  Formas de pagamento e política de cancelamento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 sm:space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                  <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start mb-3">
                      <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-2xl">💳</span>
                      </div>
                      <h4 className="font-bold text-gray-900 text-base sm:text-lg">
                        Formas de Pagamento
                      </h4>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      Aceitamos cartão de crédito, débito e boleto bancário via Stripe. 
                      A cobrança é feita automaticamente todo mês na data do seu cadastro.
                    </p>
                  </div>
                  
                  <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start mb-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-2xl">🔄</span>
                      </div>
                      <h4 className="font-bold text-gray-900 text-base sm:text-lg">
                        Alteração de Planos
                      </h4>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. 
                      As alterações entram em vigor imediatamente.
                    </p>
                  </div>
                  
                  <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start mb-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-2xl">❌</span>
                      </div>
                      <h4 className="font-bold text-gray-900 text-base sm:text-lg">
                        Cancelamento
                      </h4>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      Sem fidelidade! Você pode cancelar a qualquer momento através do portal do cliente. 
                      Após o cancelamento, você mantém acesso até o final do período pago.
                    </p>
                  </div>
                </div>
                
                <div className="text-center pt-6 border-t border-gray-200">
                  <p className="text-gray-600 text-sm sm:text-base mb-4">
                    Tem dúvidas sobre qual plano escolher?
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                    <Button variant="outline" className="border-pink-200 text-pink-700 hover:bg-pink-50 w-full sm:w-auto">
                      Falar com Suporte
                    </Button>
                    <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 w-full sm:w-auto">
                      Ver Demonstração
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Planos;
