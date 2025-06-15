
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useProfile } from '@/hooks/supabase/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import PersonalInfoSection from '@/components/configuracoes/PersonalInfoSection';
import BusinessInfoSection from '@/components/configuracoes/BusinessInfoSection';
import SaveButton from '@/components/configuracoes/SaveButton';

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
        <PersonalInfoSection 
          profile={profile}
          onInputChange={handleInputChange}
        />

        <BusinessInfoSection 
          profile={profile}
          onInputChange={handleInputChange}
        />

        <SaveButton 
          onSave={handleSaveProfile}
          isSaving={isSaving}
          loading={loading}
        />
      </div>
    </Layout>
  );
};

export default Configuracoes;
