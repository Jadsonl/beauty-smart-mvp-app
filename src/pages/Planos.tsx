
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const Planos = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('autonomo');

  const planos = [
    {
      id: 'autonomo',
      nome: 'Autônomo',
      preco: 55,
      descricao: 'Ideal para profissionais independentes',
      features: [
        'Perfil profissional completo',
        'Agendamento online ilimitado',
        'Gerenciamento de agenda',
        'Lembretes automáticos por e-mail',
        'Histórico de clientes',
        'Controle financeiro básico',
        'Avaliações de clientes',
        'Suporte básico por e-mail'
      ]
    },
    {
      id: 'basico',
      nome: 'Básico',
      preco: 120,
      descricao: 'Para salões pequenos com até 3 profissionais',
      features: [
        'Perfil do salão personalizado',
        'Agendamento para até 3 profissionais',
        'Agenda centralizada',
        'Lembretes automáticos por e-mail',
        'Histórico de clientes com anotações',
        'Relatórios básicos de faturamento',
        'Gestão de serviços e preços',
        'Suporte por e-mail e chat'
      ]
    },
    {
      id: 'premium',
      nome: 'Premium',
      preco: 250,
      descricao: 'Para salões maiores com até 10 profissionais',
      features: [
        'Tudo do plano Básico',
        'Agendamento para até 10 profissionais',
        'Gerenciamento de agenda avançado',
        'Lembretes personalizáveis (e-mail + SMS)',
        'Gestão completa de clientes',
        'Relatórios personalizados e exportação',
        'Gestão de estoque completa',
        'Suporte prioritário (e-mail, chat, telefone)',
        'Tutoriais e webinars exclusivos'
      ]
    }
  ];

  useEffect(() => {
    if (user) {
      fetchCurrentPlan();
    }
  }, [user]);

  const fetchCurrentPlan = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_plan')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      if (data?.subscription_plan) {
        setCurrentPlan(data.subscription_plan);
      }
    } catch (error) {
      console.error('Error fetching current plan:', error);
    }
  };

  const handleSelectPlan = async (planoId: string) => {
    if (planoId === currentPlan || loading) {
      return;
    }

    if (planoId === 'autonomo' || planoId === 'basico') {
      // For basic plans, just update directly
      try {
        setLoading(true);
        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_plan: planoId,
            subscription_status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('id', user?.id);

        if (error) throw error;

        setCurrentPlan(planoId);
        toast({
          title: "Plano atualizado!",
          description: `Você agora está no plano ${planos.find(p => p.id === planoId)?.nome}.`,
        });
      } catch (error) {
        console.error('Error updating plan:', error);
        toast({
          title: "Erro ao atualizar plano",
          description: "Não foi possível atualizar seu plano. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    } else if (planoId === 'premium') {
      // For premium plan, redirect to Stripe checkout
      handlePremiumCheckout();
    }
  };

  const handlePremiumCheckout = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
        
        toast({
          title: "Redirecionando para pagamento",
          description: "Você será redirecionado para finalizar o pagamento.",
        });
      } else {
        throw new Error('URL de checkout não recebida');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Erro ao processar pagamento",
        description: "Não foi possível iniciar o processo de pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        // Open customer portal in a new tab
        window.open(data.url, '_blank');
      } else {
        throw new Error('URL do portal não recebida');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Erro ao abrir portal",
        description: "Não foi possível abrir o portal de gerenciamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Planos de Assinatura</h1>
          <p className="text-gray-600 mt-2">
            Escolha o plano ideal para o seu negócio. Você pode alterar a qualquer momento.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {planos.map((plano) => {
            const isCurrentPlan = currentPlan === plano.id;
            
            return (
              <Card 
                key={plano.id} 
                className={cn(
                  "relative hover:shadow-lg transition-shadow",
                  isCurrentPlan && "ring-2 ring-pink-600",
                  plano.id === 'premium' && "border-pink-200 bg-pink-50"
                )}
              >
                {plano.id === 'premium' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-pink-600 text-white">Mais Popular</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plano.nome}</CardTitle>
                  <CardDescription className="text-sm">{plano.descricao}</CardDescription>
                  <div className="pt-4">
                    <span className="text-4xl font-bold text-gray-900">R$ {plano.preco}</span>
                    <span className="text-gray-600">/mês</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plano.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="pt-4">
                    {isCurrentPlan ? (
                      <div className="space-y-2">
                        <Button 
                          className="w-full" 
                          variant="outline"
                          disabled
                        >
                          Plano Atual
                        </Button>
                        {plano.id === 'premium' && (
                          <Button 
                            className="w-full bg-pink-600 hover:bg-pink-700" 
                            onClick={handleManageSubscription}
                            disabled={loading}
                          >
                            {loading ? 'Carregando...' : 'Gerenciar Assinatura'}
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Button 
                        className={cn(
                          "w-full",
                          plano.id === 'premium' 
                            ? "bg-pink-600 hover:bg-pink-700" 
                            : "bg-gray-900 hover:bg-gray-800"
                        )}
                        onClick={() => handleSelectPlan(plano.id)}
                        disabled={loading}
                      >
                        {loading ? 'Processando...' : 'Escolher Plano'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Information */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Informações Adicionais</CardTitle>
            <CardDescription>Formas de pagamento e política de cancelamento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">💳 Formas de Pagamento</h4>
              <p className="text-sm text-gray-600">
                Aceitamos cartão de crédito, débito e boleto bancário. 
                A cobrança é feita automaticamente todo mês na data do seu cadastro.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">🔄 Alteração de Planos</h4>
              <p className="text-sm text-gray-600">
                Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. 
                As alterações entram em vigor imediatamente.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">❌ Cancelamento</h4>
              <p className="text-sm text-gray-600">
                Sem fidelidade! Você pode cancelar a qualquer momento. 
                Após o cancelamento, você mantém acesso até o final do período pago.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Planos;
