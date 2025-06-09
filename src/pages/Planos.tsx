
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/context/AppContext';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const Planos = () => {
  const { user, changePlano } = useApp();

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

  const handleSelectPlan = (planoId: string) => {
    if (planoId === user?.plano) {
      return; // Already selected
    }
    
    if (window.confirm(`Confirma a mudança para o plano ${planos.find(p => p.id === planoId)?.nome}?`)) {
      changePlano(planoId as 'autonomo' | 'basico' | 'premium');
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
          
          {user?.testeGratuito && (
            <div className="mt-6 p-4 bg-pink-50 border border-pink-200 rounded-lg max-w-2xl mx-auto">
              <h3 className="font-semibold text-pink-800 mb-2">🎉 Teste Premium Ativo!</h3>
              <p className="text-pink-700">
                Você tem {user.diasRestantes} dias restantes do seu teste gratuito do Plano Premium.
                Aproveite todas as funcionalidades sem compromisso!
              </p>
            </div>
          )}
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {planos.map((plano) => {
            const isCurrentPlan = user?.plano === plano.id;
            const isPremiumAndOnTrial = plano.id === 'premium' && user?.testeGratuito;
            
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
                      <Button 
                        className="w-full" 
                        variant="outline"
                        disabled
                      >
                        {isPremiumAndOnTrial ? 'Teste Ativo' : 'Plano Atual'}
                      </Button>
                    ) : (
                      <Button 
                        className={cn(
                          "w-full",
                          plano.id === 'premium' 
                            ? "bg-pink-600 hover:bg-pink-700" 
                            : "bg-gray-900 hover:bg-gray-800"
                        )}
                        onClick={() => handleSelectPlan(plano.id)}
                      >
                        Escolher Plano
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
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 text-center">
                <strong>Funcionalidade de pagamentos será implementada em breve.</strong>
                <br />
                Por enquanto, você pode explorar e testar todas as funcionalidades gratuitamente.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Planos;
