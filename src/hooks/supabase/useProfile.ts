
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  business_type?: string;
  business_name?: string;
  address?: string;
  created_at?: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const getProfile = useCallback(async (): Promise<Profile | null> => {
    if (!user?.id) {
      console.warn('getProfile: Usuário não autenticado. Não será possível carregar perfil.');
      return null;
    }
    
    setLoading(true);
    console.log('getProfile: Iniciando busca para user_id:', user.id);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('getProfile: Erro ao buscar perfil:', error);
        return null;
      }
      
      console.log('getProfile: Perfil encontrado:', data);
      return data;
    } catch (error) {
      console.error('getProfile: Erro inesperado:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateProfile = useCallback(async (profileData: Partial<Profile>): Promise<boolean> => {
    if (!user?.id) {
      console.warn('updateProfile: Usuário não autenticado');
      return false;
    }
    
    setLoading(true);
    console.log('updateProfile: Atualizando perfil para user_id:', user.id, 'dados:', profileData);
    
    try {
      // Primeiro, verificar se o perfil já existe
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      let result;
      
      if (existingProfile) {
        // Atualizar perfil existente
        result = await supabase
          .from('profiles')
          .update({
            full_name: profileData.full_name,
            phone: profileData.phone,
            business_name: profileData.business_name,
            business_type: profileData.business_type,
            address: profileData.address,
          })
          .eq('id', user.id);
      } else {
        // Criar novo perfil
        result = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email!,
            full_name: profileData.full_name,
            phone: profileData.phone,
            business_name: profileData.business_name,
            business_type: profileData.business_type,
            address: profileData.address,
          });
      }
      
      if (result.error) {
        console.error('updateProfile: Erro ao atualizar perfil:', result.error);
        return false;
      }
      
      console.log('updateProfile: Perfil atualizado com sucesso');
      return true;
    } catch (error) {
      console.error('updateProfile: Erro inesperado:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    loading,
    getProfile,
    updateProfile
  };
};
