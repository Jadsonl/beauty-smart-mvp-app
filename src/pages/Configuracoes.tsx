
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabase } from '@/hooks/useSupabase';
import { useAuth } from '@/hooks/useAuth';
import { Save, User, Building } from 'lucide-react';
import { toast } from 'sonner';

const Configuracoes = () => {
  const { user } = useAuth();
  const { getProfile, updateProfile, loading } = useSupabase();
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
      const profileData = await getProfile();
      if (profileData) {
        setProfile({
          full_name: profileData.full_name || '',
          phone: profileData.phone || '',
          business_name: profileData.business_name || '',
          business_type: profileData.business_type || '',
          address: profileData.address || ''
        });
      }
    } catch (error) {
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
    try {
      const success = await updateProfile(profile);
      if (success) {
        toast.success('Perfil atualizado com sucesso!');
      } else {
        toast.error('Erro ao atualizar perfil. Verifique os dados e tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
      toast.error('Erro inesperado ao salvar alterações');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
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
            <p className="text-gray-600">Carregando configurações...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 p-4 sm:p-6">
        {/* Informações Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Nome Completo *</Label>
                <Input
                  id="full_name"
                  value={profile.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Seu nome completo"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={profile.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Endereço completo do estabelecimento"
              />
            </div>
          </CardContent>
        </Card>

        {/* Informações do Negócio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Informações do Negócio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="business_name">Nome do Negócio</Label>
                <Input
                  id="business_name"
                  value={profile.business_name}
                  onChange={(e) => handleInputChange('business_name', e.target.value)}
                  placeholder="Nome do seu salão/estabelecimento"
                />
              </div>
              <div>
                <Label htmlFor="business_type">Tipo de Negócio</Label>
                <Select
                  value={profile.business_type}
                  onValueChange={(value) => handleInputChange('business_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salao">Salão de Beleza</SelectItem>
                    <SelectItem value="barbearia">Barbearia</SelectItem>
                    <SelectItem value="estetica">Clínica de Estética</SelectItem>
                    <SelectItem value="spa">Spa</SelectItem>
                    <SelectItem value="manicure">Manicure/Pedicure</SelectItem>
                    <SelectItem value="massagem">Massoterapia</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
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
            className="bg-blue-600 hover:bg-blue-700"
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
