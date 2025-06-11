
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "Agendamentos Inteligentes",
      description: "Sistema avançado de agendamento online com confirmação automática",
      icon: "📅"
    },
    {
      title: "Relatórios Financeiros",
      description: "Controle completo do faturamento e despesas do seu negócio",
      icon: "📊"
    },
    {
      title: "Gestão de Clientes",
      description: "Mantenha histórico detalhado e preferências de cada cliente",
      icon: "👥"
    },
    {
      title: "Controle de Estoque",
      description: "Gerencie produtos e receba alertas de estoque baixo",
      icon: "📦"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header - Responsivo */}
      <header className="container mx-auto px-4 py-4 sm:py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-pink-600 rounded-lg"></div>
          <span className="text-xl sm:text-2xl font-bold text-pink-600">BelezaSmart</span>
        </div>
        <Button 
          variant="outline" 
          onClick={() => navigate('/login')}
          className="border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white w-full sm:w-auto"
        >
          Já tenho uma conta
        </Button>
      </header>

      {/* Hero Section - Responsivo */}
      <section className="container mx-auto px-4 py-8 sm:py-12 lg:py-20 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
          Transforme seu Salão com a
          <span className="text-pink-600 block sm:inline"> BelezaSmart</span>
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-2">
          A plataforma completa para gestão de salões de beleza, barbearias e clínicas estéticas. 
          Agendamento online, controle financeiro e muito mais!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12 lg:mb-16 px-4">
          <Button 
            size="lg" 
            onClick={() => navigate('/register')}
            className="bg-pink-600 hover:bg-pink-700 text-white px-6 sm:px-8 py-3 text-base sm:text-lg w-full sm:w-auto"
          >
            Criar Conta de Profissional/Salão
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => navigate('/login')}
            className="border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white px-6 sm:px-8 py-3 text-base sm:text-lg w-full sm:w-auto"
          >
            Sou Cliente
          </Button>
        </div>

        {/* Features Grid - Responsivo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12 lg:mb-16 px-2">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow h-full">
              <CardHeader className="pb-2 sm:pb-4">
                <div className="text-3xl sm:text-4xl mb-2 sm:mb-4">{feature.icon}</div>
                <CardTitle className="text-base sm:text-lg leading-tight">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs sm:text-sm leading-relaxed">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section - Responsivo */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-6 sm:p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
            Comece seu teste gratuito hoje!
          </h2>
          <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
            30 dias de acesso completo ao plano Premium. Sem compromisso, sem cartão de crédito.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/register?test=true')}
            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-6 sm:px-8 py-3 text-base sm:text-lg w-full sm:w-auto"
          >
            Iniciar Teste Gratuito
          </Button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
