
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProfile } from '@/hooks/supabase/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { Save, User, Building } from 'lucide-react';
import { toast } from 'sonner';

const Configuracoes = () => {
  const { user } = useAuth();
  const { getProfile, updateProfile, loading } = useProfile();
  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    business_name: '',
    business_type: '',
    address: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      console.log('Configuracoes: Carregando perfil para usuário:', user.id);
      const profileData = await getProfile();
      if (profileData) {
        console.log('Configuracoes: Dados do perfil carregados:', profileData);
        setProfile({
          full_name: profileData.full_name || '',
          phone: profileData.phone || '',
          business_name: profileData.business_name || '',
          business_type: profileData.business_type || '',
          address: profileData.address || ''
        });
      } else {
        console.log('Configuracoes: Nenhum perfil encontrado, usando valores vazios');
      }
    } catch (error) {
      console.error('Configuracoes: Erro ao carregar perfil:', error);
      toast.error('Erro ao carregar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return;
    }

    // Validação básica
    if (!profile.full_name.trim()) {
      toast.error('Nome completo é obrigatório');
      return;
    }

    setIsSaving(true);
    console.log('Configuracoes: Salvando perfil:', profile);
    
    try {
      const success = await updateProfile(profile);
      if (success) {
        toast.success('Perfil atualizado com sucesso!');
        // Recarregar o perfil para confirmar que foi salvo
        await loadProfile();
      } else {
        toast.error('Erro ao atualizar perfil. Verifique os dados e tente novamente.');
      }
    } catch (error) {
      console.error('Configuracoes: Erro ao salvar alterações:', error);
      toast.error('Erro inesperado ao salvar alterações');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    console.log('Configuracoes: Alterando campo:', field, 'para:', value);
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6 p-4 sm:p-6">
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-300">Carregando configurações...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 p-4 sm:p-6">
        {/* Informações Pessoais */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name" className="dark:text-gray-200">Nome Completo *</Label>
                <Input
                  id="full_name"
                  value={profile.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Seu nome completo"
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone" className="dark:text-gray-200">Telefone</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="address" className="dark:text-gray-200">Endereço</Label>
              <Input
                id="address"
                value={profile.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Endereço completo do estabelecimento"
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Informações do Negócio */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <Building className="h-5 w-5" />
              Informações do Negócio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="business_name" className="dark:text-gray-200">Nome do Negócio</Label>
                <Input
                  id="business_name"
                  value={profile.business_name}
                  onChange={(e) => handleInputChange('business_name', e.target.value)}
                  placeholder="Nome do seu salão/estabelecimento"
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <Label htmlFor="business_type" className="dark:text-gray-200">Tipo de Negócio</Label>
                <Select
                  value={profile.business_type}
                  onValueChange={(value) => handleInputChange('business_type', value)}
                >
                  <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                    <SelectItem value="salao" className="dark:text-white dark:hover:bg-gray-600">Salão de Beleza</SelectItem>
                    <SelectItem value="barbearia" className="dark:text-white dark:hover:bg-gray-600">Barbearia</SelectItem>
                    <SelectItem value="estetica" className="dark:text-white dark:hover:bg-gray-600">Clínica de Estética</SelectItem>
                    <SelectItem value="spa" className="dark:text-white dark:hover:bg-gray-600">Spa</SelectItem>
                    <SelectItem value="manicure" className="dark:text-white dark:hover:bg-gray-600">Manicure/Pedicure</SelectItem>
                    <SelectItem value="massagem" className="dark:text-white dark:hover:bg-gray-600">Massoterapia</SelectItem>
                    <SelectItem value="outro" className="dark:text-white dark:hover:bg-gray-600">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botão Salvar */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSaveProfile}
            disabled={isSaving || loading}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Configuracoes;
