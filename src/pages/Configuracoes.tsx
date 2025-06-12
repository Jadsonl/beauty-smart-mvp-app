import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useSupabase } from '@/hooks/useSupabase';
import { User, Calendar, MapPin, Bell, Shield, CreditCard, Save, Edit } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface ProfileData {
  full_name?: string;
  phone?: string;
  business_type?: string;
  business_name?: string;
}

const Configuracoes = () => {
  const { user } = useAuth();
  const { getProfile, updateProfile } = useSupabase();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    phone: '',
    business_type: '',
    business_name: '',
  });

  // Carregar dados do perfil
  useEffect(() => {
    const loadProfile = async () => {
      if (user?.id) {
        const profile = await getProfile();
        if (profile) {
          setProfileData({
            full_name: profile.full_name || '',
            phone: profile.phone || '',
            business_type: profile.business_type || '',
            business_name: profile.business_name || '',
          });
        }
      }
    };

    loadProfile();
  }, [user, getProfile]);

  const handleSave = async () => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return;
    }

    setLoading(true);
    try {
      const success = await updateProfile(profileData);
      if (success) {
        toast.success('Perfil atualizado com sucesso!');
        setIsEditing(false);
      } else {
        toast.error('Erro ao atualizar perfil. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast.error('Erro inesperado ao atualizar perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Gerencie as configurações da sua conta e estabelecimento</p>
        </div>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <User className="h-5 w-5" />
                  Informações da Conta
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">Dados principais do seu perfil</CardDescription>
              </div>
              <Button
                variant={isEditing ? "outline" : "default"}
                size="sm"
                onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
                className="w-full sm:w-auto"
              >
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? 'Cancelar' : 'Editar'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <Label className="text-xs sm:text-sm font-medium text-gray-700">E-mail</Label>
                <p className="mt-1 text-sm sm:text-lg text-gray-900 p-2 bg-gray-50 rounded border">
                  {user?.email}
                </p>
                <p className="text-xs text-gray-500 mt-1">O e-mail não pode ser alterado aqui</p>
              </div>
              
              <div>
                <Label htmlFor="full_name" className="text-xs sm:text-sm font-medium text-gray-700">
                  Nome/Razão Social
                </Label>
                {isEditing ? (
                  <Input
                    id="full_name"
                    value={profileData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="Digite seu nome completo"
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 text-sm sm:text-lg text-gray-900">
                    {profileData.full_name || 'Não informado'}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="phone" className="text-xs sm:text-sm font-medium text-gray-700">
                  Telefone
                </Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 text-sm sm:text-lg text-gray-900">
                    {profileData.phone || 'Não informado'}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="business_type" className="text-xs sm:text-sm font-medium text-gray-700">
                  Tipo de Negócio
                </Label>
                {isEditing ? (
                  <Input
                    id="business_type"
                    value={profileData.business_type}
                    onChange={(e) => handleInputChange('business_type', e.target.value)}
                    placeholder="Ex: Salão de Beleza, Barbearia"
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 text-sm sm:text-lg text-gray-900">
                    {profileData.business_type || 'Não informado'}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="business_name" className="text-xs sm:text-sm font-medium text-gray-700">
                  Nome do Negócio
                </Label>
                {isEditing ? (
                  <Input
                    id="business_name"
                    value={profileData.business_name}
                    onChange={(e) => handleInputChange('business_name', e.target.value)}
                    placeholder="Ex: Salão Beleza & Estilo"
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 text-sm sm:text-lg text-gray-900">
                    {profileData.business_name || 'Não informado'}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-xs sm:text-sm font-medium text-gray-700">Plano Atual</Label>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="secondary">
                    Gratuito
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="text-xs sm:text-sm font-medium text-gray-700">Status da Conta</Label>
                <div className="mt-1">
                  <Badge variant="default" className="bg-green-600">
                    Ativa
                  </Badge>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
              </div>
            )}
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
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Calendar className="h-5 w-5" />
              Configurações de Agenda
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">Personalize como sua agenda funciona</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700">Intervalo entre agendamentos</label>
                <p className="mt-1 text-gray-600 text-sm sm:text-base">30 minutos (padrão)</p>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700">Antecedência mínima</label>
                <p className="mt-1 text-gray-600 text-sm sm:text-base">2 horas (padrão)</p>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700">Dias de funcionamento</label>
                <p className="mt-1 text-gray-600 text-sm sm:text-base">Segunda a Sábado (padrão)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Bell className="h-5 w-5" />
              Notificações
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">Configure como você quer receber notificações</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                <div>
                  <p className="font-medium text-sm sm:text-base">E-mail de novos agendamentos</p>
                  <p className="text-xs sm:text-sm text-gray-600">Receba um e-mail quando um cliente agendar</p>
                </div>
                <Badge variant="default" className="bg-green-600 w-fit">Ativado</Badge>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                <div>
                  <p className="font-medium text-sm sm:text-base">Lembrete de agendamentos</p>
                  <p className="text-xs sm:text-sm text-gray-600">Lembrete 1 hora antes do agendamento</p>
                </div>
                <Badge variant="default" className="bg-green-600 w-fit">Ativado</Badge>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                <div>
                  <p className="font-medium text-sm sm:text-base">Relatórios semanais</p>
                  <p className="text-xs sm:text-sm text-gray-600">Resumo semanal por e-mail</p>
                </div>
                <Badge variant="secondary" className="w-fit">Desativado</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Shield className="h-5 w-5" />
              Segurança
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">Configurações de segurança da sua conta</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="font-medium text-sm sm:text-base">Última alteração de senha</p>
                <p className="text-xs sm:text-sm text-gray-600">Não disponível</p>
              </div>
              <div>
                <p className="font-medium text-sm sm:text-base">Autenticação de dois fatores</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">Não configurado</Badge>
                  <span className="text-xs sm:text-sm text-gray-600">(Recomendado)</span>
                </div>
              </div>
              <div>
                <p className="font-medium text-sm sm:text-base">Sessões ativas</p>
                <p className="text-xs sm:text-sm text-gray-600">1 sessão ativa (esta sessão)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <CreditCard className="h-5 w-5" />
              Informações de Cobrança
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">Detalhes sobre sua assinatura e pagamentos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2 text-sm sm:text-base">Plano Gratuito</h4>
                <p className="text-xs sm:text-sm text-blue-700">
                  Você está utilizando o plano gratuito. Faça upgrade para desbloquear mais recursos.
                </p>
              </div>
              
              <div>
                <p className="font-medium text-sm sm:text-base">Método de pagamento</p>
                <p className="text-xs sm:text-sm text-gray-600">Nenhum método cadastrado</p>
              </div>
              
              <div>
                <p className="font-medium text-sm sm:text-base">Histórico de pagamentos</p>
                <p className="text-xs sm:text-sm text-gray-600">Nenhum pagamento registrado</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Informações do Sistema</CardTitle>
            <CardDescription className="text-sm sm:text-base">Detalhes técnicos e suporte</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="font-medium text-sm sm:text-base">Versão do Sistema</p>
                <p className="text-xs sm:text-sm text-gray-600">BelezaSmart v1.0.0 (MVP)</p>
              </div>
              <div>
                <p className="font-medium text-sm sm:text-base">Localização</p>
                <p className="text-xs sm:text-sm text-gray-600">Salvador, Bahia - Brasil (GMT-3)</p>
              </div>
              <div>
                <p className="font-medium text-sm sm:text-base">Suporte</p>
                <p className="text-xs sm:text-sm text-gray-600">
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
