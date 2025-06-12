
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { User, Calendar, MapPin, Bell, Shield, CreditCard } from 'lucide-react';

const Configuracoes = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600 mt-1">Gerencie as configurações da sua conta e estabelecimento</p>
        </div>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações da Conta
            </CardTitle>
            <CardDescription>Dados principais do seu perfil</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Nome/Razão Social</label>
                <p className="mt-1 text-lg text-gray-900">{user?.user_metadata?.full_name || 'Não informado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">E-mail</label>
                <p className="mt-1 text-lg text-gray-900">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Plano Atual</label>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="secondary">
                    Gratuito
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Status da Conta</label>
                <div className="mt-1">
                  <Badge variant="default" className="bg-green-600">
                    Ativa
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Configurações do Estabelecimento
            </CardTitle>
            <CardDescription>Informações sobre seu salão ou negócio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Nome do Negócio</label>
                <p className="mt-1 text-gray-600">{user?.user_metadata?.business_name || 'Não configurado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Tipo de Negócio</label>
                <p className="mt-1 text-gray-600">{user?.user_metadata?.business_type || 'Não configurado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Telefone</label>
                <p className="mt-1 text-gray-600">{user?.user_metadata?.phone || 'Não configurado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Endereço</label>
                <p className="mt-1 text-gray-600">Não configurado</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Configurações de Agenda
            </CardTitle>
            <CardDescription>Personalize como sua agenda funciona</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Intervalo entre agendamentos</label>
                <p className="mt-1 text-gray-600">30 minutos (padrão)</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Antecedência mínima</label>
                <p className="mt-1 text-gray-600">2 horas (padrão)</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Dias de funcionamento</label>
                <p className="mt-1 text-gray-600">Segunda a Sábado (padrão)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
            </CardTitle>
            <CardDescription>Configure como você quer receber notificações</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">E-mail de novos agendamentos</p>
                  <p className="text-sm text-gray-600">Receba um e-mail quando um cliente agendar</p>
                </div>
                <Badge variant="default" className="bg-green-600">Ativado</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Lembrete de agendamentos</p>
                  <p className="text-sm text-gray-600">Lembrete 1 hora antes do agendamento</p>
                </div>
                <Badge variant="default" className="bg-green-600">Ativado</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Relatórios semanais</p>
                  <p className="text-sm text-gray-600">Resumo semanal por e-mail</p>
                </div>
                <Badge variant="secondary">Desativado</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Segurança
            </CardTitle>
            <CardDescription>Configurações de segurança da sua conta</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="font-medium">Última alteração de senha</p>
                <p className="text-sm text-gray-600">Não disponível</p>
              </div>
              <div>
                <p className="font-medium">Autenticação de dois fatores</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">Não configurado</Badge>
                  <span className="text-sm text-gray-600">(Recomendado)</span>
                </div>
              </div>
              <div>
                <p className="font-medium">Sessões ativas</p>
                <p className="text-sm text-gray-600">1 sessão ativa (esta sessão)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Informações de Cobrança
            </CardTitle>
            <CardDescription>Detalhes sobre sua assinatura e pagamentos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Plano Gratuito</h4>
                <p className="text-sm text-blue-700">
                  Você está utilizando o plano gratuito. Faça upgrade para desbloquear mais recursos.
                </p>
              </div>
              
              <div>
                <p className="font-medium">Método de pagamento</p>
                <p className="text-sm text-gray-600">Nenhum método cadastrado</p>
              </div>
              
              <div>
                <p className="font-medium">Histórico de pagamentos</p>
                <p className="text-sm text-gray-600">Nenhum pagamento registrado</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Sistema</CardTitle>
            <CardDescription>Detalhes técnicos e suporte</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="font-medium">Versão do Sistema</p>
                <p className="text-sm text-gray-600">BelezaSmart v1.0.0 (MVP)</p>
              </div>
              <div>
                <p className="font-medium">Localização</p>
                <p className="text-sm text-gray-600">Salvador, Bahia - Brasil (GMT-3)</p>
              </div>
              <div>
                <p className="font-medium">Suporte</p>
                <p className="text-sm text-gray-600">
                  Para dúvidas ou suporte, entre em contato: suporte@belezasmart.com
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Configuracoes;
